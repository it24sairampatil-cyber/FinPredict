// FinPredict.js - MongoDB Simplex Optimization & Budget Scenario Schema
import mongoose, { Document, Schema } from 'mongoose';

export interface IBudgetScenario extends Document {
  userId: mongoose.Types.ObjectId;
  scenarioName: 'Balanced (25%)' | 'Conservative (15%)' | 'Max F.I.R.E. (50%)' | 'Custom';
  targetSavingsRate: number; // e.g. 0.25
  recommendedAllocation: Record<string, number>;
  deltas: Record<string, number>;
  projectedSavings: number;
  savingsRateAchieved: number;
  iterations: number;
  rebalanceActions: Array<{
    category: string;
    delta: number;
    action: 'reduce' | 'increase' | 'maintain';
    narrative: string;
  }>;
  updatedAt: Date;
}

const BudgetScenarioSchema = new Schema<IBudgetScenario>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scenarioName: {
      type: String,
      required: true,
      enum: ['Balanced (25%)', 'Conservative (15%)', 'Max F.I.R.E. (50%)', 'Custom'],
      default: 'Balanced (25%)'
    },
    targetSavingsRate: { type: Number, required: true },
    recommendedAllocation: { type: Schema.Types.Mixed, required: true },
    deltas: { type: Schema.Types.Mixed, required: true },
    projectedSavings: { type: Number, required: true },
    savingsRateAchieved: { type: Number, required: true },
    iterations: { type: Number, default: 2 },
    rebalanceActions: [
      {
        category: String,
        delta: Number,
        action: { type: String, enum: ['reduce', 'increase', 'maintain'] },
        narrative: String
      }
    ]
  },
  { timestamps: true }
);

BudgetScenarioSchema.index({ userId: 1, scenarioName: 1 }, { unique: true });

export const BudgetScenario = mongoose.model<IBudgetScenario>('BudgetScenario', BudgetScenarioSchema);
