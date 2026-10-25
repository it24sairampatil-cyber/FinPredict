// FinPredict.js - ML Worker Main Thread Bridge & System Telemetry Controller
// Upholds NFR-2 (Thread Fluidity >= 60 FPS) and NFR-3 (< 250MB Heap Allocation)

import { ExecutionBackend, TrainingProgress, SlidingWindowDataset } from '../types';

export class MLWorkerClient {
  private worker: Worker | null = null;
  private currentBackend: ExecutionBackend = 'cpu';
  private isBusy: boolean = false;

  constructor() {
    this.spawnWorker();
  }

  private spawnWorker() {
    if (typeof window === 'undefined') return;

    try {
      this.worker = new Worker(new URL('../workers/ml.worker.ts', import.meta.url), {
        type: 'module'
      });
      console.log('[ML Client] Detached Web Worker initialized successfully.');
    } catch (err) {
      console.error('[ML Client] Failed to spawn ML worker:', err);
    }
  }

  /**
   * Initialize hardware acceleration backend with fallback
   */
  public async init(): Promise<{ backend: ExecutionBackend; memoryMB: number }> {
    if (!this.worker) this.spawnWorker();

    return new Promise((resolve, reject) => {
      const handler = (e: MessageEvent) => {
        if (e.data.type === 'BACKEND_INITIALIZED') {
          this.worker?.removeEventListener('message', handler);
          this.currentBackend = e.data.payload.backend;
          resolve(e.data.payload);
        } else if (e.data.type === 'WORKER_ERROR') {
          this.worker?.removeEventListener('message', handler);
          reject(new Error(e.data.payload.message));
        }
      };

      this.worker!.addEventListener('message', handler);
      this.worker!.postMessage({ type: 'INIT_BACKEND' });
    });
  }

  /**
   * Switch backend (WebGL / CPU)
   */
  public async setBackend(backend: ExecutionBackend): Promise<{ backend: ExecutionBackend; memoryMB: number }> {
    if (!this.worker) this.spawnWorker();

    return new Promise((resolve, reject) => {
      const handler = (e: MessageEvent) => {
        if (e.data.type === 'BACKEND_SWITCHED') {
          this.worker?.removeEventListener('message', handler);
          this.currentBackend = e.data.payload.backend;
          resolve(e.data.payload);
        } else if (e.data.type === 'WORKER_ERROR') {
          this.worker?.removeEventListener('message', handler);
          reject(new Error(e.data.payload.message));
        }
      };

      this.worker!.addEventListener('message', handler);
      this.worker!.postMessage({ type: 'SET_BACKEND', payload: { backend } });
    });
  }

  /**
   * Train regression model over 50 epochs (AC-2)
   */
  public async train(
    dataset: SlidingWindowDataset,
    epochs: number = 50,
    onEpoch?: (progress: TrainingProgress) => void
  ): Promise<{ finalMemoryMB: number; trainingTimeMs: number }> {
    if (!this.worker) this.spawnWorker();
    this.isBusy = true;

    return new Promise((resolve, reject) => {
      const handler = (e: MessageEvent) => {
        const { type, payload } = e.data;

        if (type === 'TRAIN_EPOCH_END') {
          if (onEpoch) {
            onEpoch(payload);
          }
        } else if (type === 'TRAIN_COMPLETE') {
          this.worker?.removeEventListener('message', handler);
          this.isBusy = false;
          resolve(payload);
        } else if (type === 'WORKER_ERROR') {
          this.worker?.removeEventListener('message', handler);
          this.isBusy = false;
          reject(new Error(payload.message));
        }
      };

      this.worker!.addEventListener('message', handler);
      this.worker!.postMessage({
        type: 'TRAIN_MODEL',
        payload: {
          sequences: dataset.sequences,
          targets: dataset.targets,
          epochs,
          batchSize: 32,
          learningRate: 0.005
        }
      });
    });
  }

  /**
   * Run forward-pass inference to predict 30-day outflow vector
   */
  public async infer(latestSequence: number[][]): Promise<number[]> {
    if (!this.worker) this.spawnWorker();

    return new Promise((resolve, reject) => {
      const handler = (e: MessageEvent) => {
        const { type, payload } = e.data;

        if (type === 'PREDICTION_COMPLETE') {
          this.worker?.removeEventListener('message', handler);
          resolve(payload.predictions);
        } else if (type === 'WORKER_ERROR') {
          this.worker?.removeEventListener('message', handler);
          reject(new Error(payload.message));
        }
      };

      this.worker!.addEventListener('message', handler);
      this.worker!.postMessage({
        type: 'INFER_PREDICTION',
        payload: { latestSequence }
      });
    });
  }

  /**
   * Cleanly dispose of model and tensors (Instruction 2 & Ephemeral Purge)
   */
  public async dispose(): Promise<void> {
    if (!this.worker) return;

    return new Promise((resolve) => {
      const handler = (e: MessageEvent) => {
        if (e.data.type === 'MODEL_DISPOSED') {
          this.worker?.removeEventListener('message', handler);
          resolve();
        }
      };
      this.worker!.addEventListener('message', handler);
      this.worker!.postMessage({ type: 'DISPOSE_MODEL' });
    });
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  public getBackend(): ExecutionBackend {
    return this.currentBackend;
  }

  public isRunning(): boolean {
    return this.isBusy;
  }
}

export const mlClient = new MLWorkerClient();
