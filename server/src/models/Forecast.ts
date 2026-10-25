// FinPredict.js - MongoDB Neural Forecast & Model Metrics Schema
import mongoose, { Document, Schema } from 'mongoose';

export interface IForecast extends Document {
  userId: mongoose.Types.ObjectId;
  datasetName: string;
  totalHistoricalOutflow: number;
  totalPredictedOutflow: number;
  projectedNetSavings: number;
  projectedSavingsRate: number;
  categoryForecasts: Record<string, any>;
  modelMetrics: {
    finalLoss: number;
    backend: string;
    trainingTimeMs: number;
    epochsCompleted: number;
    memoryAllocatedMB: number;
  };
  createdAt: Date;
}

const ForecastSchema = new Schema<IForecast>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    datasetName: { type: String, default: 'Tech Professional Profile' },
    totalHistoricalOutflow: { type: Number, required: true },
    totalPredictedOutflow: { type: Number, required: true },
    projectedNetSavings: { type: Number, required: true },
    projectedSavingsRate: { type: Number, required: true },
    categoryForecasts: { type: Schema.Types.Mixed, required: true },
    modelMetrics: {
      finalLoss: { type: Number, required: true },
      backend: { type: String, default: 'cpu' },
      trainingTimeMs: { type: Number, default: 0 },
      epochsCompleted: { type: Number, default: 50 },
      memoryAllocatedMB: { type: Number, default: 0 }
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ForecastSchema.index({ userId: 1, createdAt: -1 });

export const Forecast = mongoose.model<IForecast>('Forecast', ForecastSchema);
