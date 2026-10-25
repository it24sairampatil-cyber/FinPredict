// FinPredict.js - Sliding Window Sequence Assembler (FR-2)
// Transforms daily time-series financial aggregates into multi-dimensional feature tensors

import { DayAggregation, OUTFLOW_CATEGORIES, SlidingWindowDataset } from '../types';

export const LOOKBACK_DAYS = 30; // 30-day temporal sliding window (FR-2)

/**
 * Feature vector per day:
 * [0..7] : Outflow categories (Housing, Food, Transport, Utilities, Entertainment, Healthcare, Shopping, Other)
 * [8]    : Total Daily Outflow
 * [9]    : Total Daily Inflow
 * [10]   : Day of week normalized (0.0 to 1.0)
 * [11]   : Day of month normalized (0.0 to 1.0)
 */
export const FEATURE_NAMES = [
  ...OUTFLOW_CATEGORIES.map(c => `spend_${c.toLowerCase()}`),
  'total_outflow',
  'total_inflow',
  'cyclical_day_of_week',
  'cyclical_day_of_month'
];

export const NUM_FEATURES = FEATURE_NAMES.length; // 12 features
export const NUM_OUTFLOW_CATEGORIES = OUTFLOW_CATEGORIES.length; // 8 categories

/**
 * Encodes a day aggregation into a raw numeric feature vector
 */
export function extractDayFeatureVector(day: DayAggregation): number[] {
  const catFeatures = OUTFLOW_CATEGORIES.map(cat => day.categoryTotals[cat] || 0);
  const dayOfWeekNorm = day.dayOfWeek / 6.0; // 0 to 1
  const dayOfMonthNorm = (day.dayOfMonth - 1) / 30.0; // 0 to 1

  return [
    ...catFeatures,
    day.totalOutflow,
    day.totalInflow,
    dayOfWeekNorm,
    dayOfMonthNorm
  ];
}

/**
 * Builds sliding window sequences:
 * For each window of `lookback` consecutive days, the input is [lookback, NUM_FEATURES]
 * and the target is the aggregated outflow across the next targetDays (e.g. 30 days) per category.
 */
export function buildSlidingWindowDataset(
  dailyAggregations: DayAggregation[],
  lookback: number = LOOKBACK_DAYS,
  forecastHorizon: number = 30
): SlidingWindowDataset {
  if (dailyAggregations.length < lookback + 5) {
    throw new Error(
      `Insufficient temporal span: requires at least ${lookback + 5} days of data, found ${dailyAggregations.length} days.`
    );
  }

  // Extract raw matrix [numDays, NUM_FEATURES]
  const rawMatrix: number[][] = dailyAggregations.map(extractDayFeatureVector);
  const numDays = rawMatrix.length;

  // Compute Min-Max normalization parameters per feature column
  const minVals = new Array(NUM_FEATURES).fill(Infinity);
  const maxVals = new Array(NUM_FEATURES).fill(-Infinity);

  for (let d = 0; d < numDays; d++) {
    for (let f = 0; f < NUM_FEATURES; f++) {
      const v = rawMatrix[d][f];
      if (v < minVals[f]) minVals[f] = v;
      if (v > maxVals[f]) maxVals[f] = v;
    }
  }

  // Avoid division by zero
  for (let f = 0; f < NUM_FEATURES; f++) {
    if (maxVals[f] === minVals[f]) {
      maxVals[f] = minVals[f] + 1;
    }
  }

  // Normalize matrix
  const normalizedMatrix: number[][] = rawMatrix.map(row =>
    row.map((val, f) => (val - minVals[f]) / (maxVals[f] - minVals[f]))
  );

  const sequences: number[][][] = [];
  const targets: number[][] = [];
  const sampleDates: string[] = [];

  // Generate sequences
  // Window: [i .. i + lookback - 1]
  // Target: Outflow over the next min(forecastHorizon, remainingDays) days
  for (let i = 0; i <= numDays - lookback - 1; i++) {
    const sequenceWindow = normalizedMatrix.slice(i, i + lookback);

    // Target horizon window: sum up the unnormalized category spend over the forward window
    const targetWindowEnd = Math.min(i + lookback + forecastHorizon, numDays);
    const horizonDays = targetWindowEnd - (i + lookback);
    const scaleFactor = horizonDays > 0 ? forecastHorizon / horizonDays : 1.0;

    const targetVector = new Array(NUM_OUTFLOW_CATEGORIES).fill(0);
    for (let d = i + lookback; d < targetWindowEnd; d++) {
      for (let c = 0; c < NUM_OUTFLOW_CATEGORIES; c++) {
        targetVector[c] += rawMatrix[d][c];
      }
    }

    // Scale target to standard 30-day equivalent
    for (let c = 0; c < NUM_OUTFLOW_CATEGORIES; c++) {
      targetVector[c] = Math.round(targetVector[c] * scaleFactor * 100) / 100;
    }

    sequences.push(sequenceWindow);
    targets.push(targetVector);
    sampleDates.push(dailyAggregations[i + lookback - 1].date);
  }

  return {
    sequences,
    targets,
    featureNames: FEATURE_NAMES,
    normalizationParams: {
      min: minVals,
      max: maxVals
    },
    sampleDates
  };
}

/**
 * Extracts the latest sliding window from daily aggregations for forward inference
 */
export function getLatestInferenceWindow(
  dailyAggregations: DayAggregation[],
  lookback: number = LOOKBACK_DAYS,
  normalizationParams: { min: number[]; max: number[] }
): number[][] {
  const slice = dailyAggregations.slice(-lookback);
  const raw = slice.map(extractDayFeatureVector);

  return raw.map(row =>
    row.map((val, f) => {
      const min = normalizationParams.min[f] || 0;
      const max = normalizationParams.max[f] || 1;
      return (val - min) / (max - min || 1);
    })
  );
}
