// FinPredict.js - Core Type Definitions & Data Contracts (SRS Instruction 3)

export type ExpenseCategory =
  | 'Housing'
  | 'Food'
  | 'Transport'
  | 'Utilities'
  | 'Entertainment'
  | 'Healthcare'
  | 'Shopping'
  | 'Income'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Housing',
  'Food',
  'Transport',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Income',
  'Other'
];

export const OUTFLOW_CATEGORIES: ExpenseCategory[] = [
  'Housing',
  'Food',
  'Transport',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Other'
];

export interface Transaction {
  id: string;
  date: string; // ISO format: YYYY-MM-DD
  description: string;
  amount: number; // Positive = Outflow (Expense), Negative = Inflow (Income)
  category: ExpenseCategory;
  rawAmount: number;
  balance?: number;
  isAnomaly?: boolean;
}

export interface DayAggregation {
  date: string;
  timestamp: number;
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  dayOfMonth: number; // 1 - 31
  categoryTotals: Record<ExpenseCategory, number>;
  totalOutflow: number;
  totalInflow: number;
}

export interface SlidingWindowDataset {
  sequences: number[][][]; // Shape: [numSamples, lookback=30, numFeatures]
  targets: number[][];    // Shape: [numSamples, numOutflowCategories]
  featureNames: string[];
  normalizationParams: {
    min: number[];
    max: number[];
  };
  sampleDates: string[];
}

export type ExecutionBackend = 'webgpu' | 'webgl' | 'wasm' | 'cpu';

export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  loss: number;
  valLoss?: number;
  mae?: number;
  numTensors: number;
  memoryMB: number;
  backend: ExecutionBackend;
  elapsedMs: number;
}

export interface CategoryForecast {
  category: ExpenseCategory;
  historical30DayTotal: number;
  predicted30DayTotal: number;
  variancePercentage: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  isAnomaly: boolean;
  anomalyReason?: string;
}

export interface PredictionResult {
  categoryForecasts: Record<ExpenseCategory, CategoryForecast>;
  totalHistoricalOutflow: number;
  totalPredictedOutflow: number;
  projectedNetSavings: number;
  projectedSavingsRate: number;
  dailyTrajectory: {
    date: string;
    totalOutflow: number;
    categoryOutflows: Record<ExpenseCategory, number>;
  }[];
  modelMetrics: {
    finalLoss: number;
    backend: ExecutionBackend;
    trainingTimeMs: number;
    epochsCompleted: number;
    memoryAllocatedMB: number;
  };
}

export interface SimplexConstraints {
  targetSavingsRate: number; // e.g. 0.25 (25%)
  estimatedMonthlyIncome: number;
  categoryPriorities: Record<
    ExpenseCategory,
    {
      priority: 'essential' | 'discretionary' | 'luxury';
      minFloorRatio: number; // e.g. 0.85 of predicted
      maxCapRatio: number;   // e.g. 1.25 of predicted
    }
  >;
}

export interface SimplexOptimizationResult {
  status: 'optimal' | 'feasible' | 'infeasible';
  originalForecast: Record<ExpenseCategory, number>;
  recommendedAllocation: Record<ExpenseCategory, number>;
  deltas: Record<ExpenseCategory, number>; // recommended - original
  totalRecommendedOutflow: number;
  projectedSavings: number;
  savingsRateAchieved: number;
  iterations: number;
  rebalanceActions: {
    category: ExpenseCategory;
    delta: number;
    action: 'reduce' | 'increase' | 'maintain';
    narrative: string;
  }[];
}

export interface NetworkAuditPacket {
  id: string;
  timestamp: string;
  type: 'fetch' | 'xhr' | 'websocket';
  url: string;
  method?: string;
  blocked: boolean;
  containsUserData: boolean;
  payloadSize: number;
}

export interface SystemPerformanceMetrics {
  fps: number;
  threadLatencyMs: number;
  activeTensors: number;
  heapUsedMB: number;
  heapCeilingMB: number;
  isTraining: boolean;
  backend: ExecutionBackend;
}
