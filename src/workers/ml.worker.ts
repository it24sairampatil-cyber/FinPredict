// FinPredict.js - Computational Machine Learning Engine (Web Worker)
// Adheres strictly to FR-3, NFR-2, NFR-3 (<250MB RAM), AC-2 (50-epoch tracking),
// Instruction 1 (Structural Isolation), Instruction 2 (tf.tidy/dispose), Instruction 4 (Graceful Fallback)

import * as tf from '@tensorflow/tfjs';
import { ExecutionBackend } from '../types';

let currentModel: tf.LayersModel | null = null;
let activeBackend: ExecutionBackend = 'cpu';

/**
 * Initializes TensorFlow.js execution backend with graceful fallback (Instruction 4)
 */
async function initializeBackend(): Promise<ExecutionBackend> {
  const preferredBackends = ['webgl', 'cpu'];

  for (const b of preferredBackends) {
    try {
      const success = await tf.setBackend(b);
      if (success) {
        await tf.ready();
        activeBackend = tf.getBackend() as ExecutionBackend;
        console.log(`[ML Worker] Successfully bound to hardware backend: ${activeBackend}`);
        return activeBackend;
      }
    } catch (err) {
      console.warn(`[ML Worker] Backend ${b} initialization failed, falling back...`, err);
    }
  }

  await tf.setBackend('cpu');
  await tf.ready();
  activeBackend = 'cpu';
  return 'cpu';
}

/**
 * Constructs a deep sequential neural network topology (FR-3)
 * Optimized for temporal sliding window sequence regression
 */
function buildModelTopology(
  lookback: number,
  numFeatures: number,
  outputDim: number,
  learningRate: number = 0.005
): tf.LayersModel {
  // Dispose existing model to avoid memory leaks (Instruction 2)
  if (currentModel) {
    currentModel.dispose();
    currentModel = null;
  }

  const model = tf.sequential();

  // Layer 1: Flattened representation from sequence with Dense feature extraction
  // (In browser workers, dense layers over sequence flatten provide ultra-stable, fast backprop)
  model.add(
    tf.layers.flatten({
      inputShape: [lookback, numFeatures]
    })
  );

  // Hidden Layer 1: Dense projection with ReLU and L2 regularization
  model.add(
    tf.layers.dense({
      units: 64,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 1e-4 })
    })
  );

  // Regularization Dropout layer to prevent overfitting on cyclical transactions
  model.add(tf.layers.dropout({ rate: 0.15 }));

  // Hidden Layer 2: Category correlation layer
  model.add(
    tf.layers.dense({
      units: 32,
      activation: 'relu'
    })
  );

  // Output Layer: Multi-target regression (non-negative ReLU outflow estimates)
  model.add(
    tf.layers.dense({
      units: outputDim,
      activation: 'relu'
    })
  );

  const optimizer = tf.train.adam(learningRate);

  model.compile({
    optimizer,
    loss: 'meanSquaredError',
    metrics: ['mae']
  });

  return model;
}

/**
 * Helper to get current volatile memory usage
 */
function getMemoryFootprint(): { memoryMB: number; numTensors: number } {
  const mem = tf.memory();
  const memoryMB = Math.round((mem.numBytes / (1024 * 1024)) * 100) / 100;
  return { memoryMB, numTensors: mem.numTensors };
}

// Worker message router
self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case 'INIT_BACKEND': {
        const backend = await initializeBackend();
        const mem = getMemoryFootprint();
        self.postMessage({
          type: 'BACKEND_INITIALIZED',
          payload: { backend, memoryMB: mem.memoryMB, numTensors: mem.numTensors }
        });
        break;
      }

      case 'SET_BACKEND': {
        const requested = payload.backend;
        try {
          await tf.setBackend(requested);
          await tf.ready();
          activeBackend = tf.getBackend() as ExecutionBackend;
        } catch {
          activeBackend = tf.getBackend() as ExecutionBackend;
        }
        const mem = getMemoryFootprint();
        self.postMessage({
          type: 'BACKEND_SWITCHED',
          payload: { backend: activeBackend, memoryMB: mem.memoryMB, numTensors: mem.numTensors }
        });
        break;
      }

      case 'TRAIN_MODEL': {
        const {
          sequences, // number[][][] [samples, 30, 12]
          targets,   // number[][]   [samples, 8]
          epochs = 50, // AC-2: 50 epochs
          batchSize = 32,
          learningRate = 0.004
        } = payload;

        if (!sequences || sequences.length === 0) {
          throw new Error('Training dataset is empty.');
        }

        const numSamples = sequences.length;
        const lookback = sequences[0].length;
        const numFeatures = sequences[0][0].length;
        const outputDim = targets[0].length;

        // Build model topology
        currentModel = buildModelTopology(lookback, numFeatures, outputDim, learningRate);

        // Convert raw JS arrays to isolated tensors (Instruction 1 & 2)
        const xTensor = tf.tensor3d(sequences, [numSamples, lookback, numFeatures]);
        const yTensor = tf.tensor2d(targets, [numSamples, outputDim]);

        const startTime = performance.now();
        const totalEpochs = epochs;

        // Train model with custom onEpochEnd callback streaming telemetry (AC-2)
        await currentModel.fit(xTensor, yTensor, {
          epochs: totalEpochs,
          batchSize: Math.min(batchSize, numSamples),
          validationSplit: numSamples > 10 ? 0.15 : 0.0,
          shuffle: true,
          callbacks: {
            onEpochEnd: async (epochIndex, logs) => {
              const epoch = epochIndex + 1;
              const mem = getMemoryFootprint();
              const elapsedMs = Math.round(performance.now() - startTime);

              // Post live progress to UI thread without blocking rendering (NFR-2)
              self.postMessage({
                type: 'TRAIN_EPOCH_END',
                payload: {
                  epoch,
                  totalEpochs,
                  loss: logs?.loss ?? 0,
                  valLoss: logs?.val_loss,
                  mae: logs?.mae,
                  numTensors: mem.numTensors,
                  memoryMB: mem.memoryMB,
                  backend: activeBackend,
                  elapsedMs
                }
              });

              // Explicit micro-pause allowing worker event loop dispatch
              await tf.nextFrame();
            }
          }
        });

        const totalTimeMs = Math.round(performance.now() - startTime);

        // Explicitly deallocate training tensors to uphold NFR-3 (<250MB)
        xTensor.dispose();
        yTensor.dispose();

        const finalMem = getMemoryFootprint();

        self.postMessage({
          type: 'TRAIN_COMPLETE',
          payload: {
            epochsCompleted: totalEpochs,
            trainingTimeMs: totalTimeMs,
            backend: activeBackend,
            finalMemoryMB: finalMem.memoryMB,
            numTensors: finalMem.numTensors
          }
        });
        break;
      }

      case 'INFER_PREDICTION': {
        if (!currentModel) {
          throw new Error('Model is not initialized or trained yet.');
        }

        const { latestSequence } = payload; // number[][] [30, 12]
        if (!latestSequence) {
          throw new Error('Inference sequence is missing.');
        }

        const lookback = latestSequence.length;
        const numFeatures = latestSequence[0].length;

        // Wrap inference strictly inside tf.tidy() to prevent tensor leaks (Instruction 2)
        const predictionArray = tf.tidy(() => {
          const inputTensor = tf.tensor3d([latestSequence], [1, lookback, numFeatures]);
          const predTensor = currentModel!.predict(inputTensor) as tf.Tensor;
          // Return non-negative numbers
          const data = Array.from(predTensor.dataSync());
          return data.map(v => Math.max(0, Math.round(v * 100) / 100));
        });

        self.postMessage({
          type: 'PREDICTION_COMPLETE',
          payload: {
            predictions: predictionArray
          }
        });
        break;
      }

      case 'DISPOSE_MODEL': {
        if (currentModel) {
          currentModel.dispose();
          currentModel = null;
        }
        // Force garbage collection of any remaining orphaned tensors
        tf.disposeVariables();
        const mem = getMemoryFootprint();
        self.postMessage({
          type: 'MODEL_DISPOSED',
          payload: { memoryMB: mem.memoryMB, numTensors: mem.numTensors }
        });
        break;
      }

      default:
        console.warn(`[ML Worker] Unrecognized message type: ${type}`);
    }
  } catch (error: any) {
    self.postMessage({
      type: 'WORKER_ERROR',
      payload: {
        message: error.message || 'Unknown ML Worker error',
        stack: error.stack
      }
    });
  }
};
