// FinPredict.js - Client-Side Linear Simplex Optimization Routine (FR-4)
// Solves constrained Linear Programming (LP) budget optimization inside the browser

import { ExpenseCategory, OUTFLOW_CATEGORIES, SimplexConstraints, SimplexOptimizationResult } from '../types';

/**
 * Standard Simplex Tableau Solver for bounded linear programs:
 * Minimize: c^T * x
 * Subject to: A * x <= b, x >= 0
 */
class SimplexTableauSolver {
  private tableau: number[][];
  private m: number; // number of constraints
  private n: number; // number of decision variables
  private totalVars: number; // decision vars + slack vars
  public iterations: number = 0;

  constructor(
    c: number[], // Objective coefficients (minimize)
    A: number[][], // Constraint matrix
    b: number[] // Right hand side bounds
  ) {
    this.m = A.length;
    this.n = c.length;
    this.totalVars = this.n + this.m;

    // Build initial tableau:
    // Row 0..m-1: [A_i | Slack_i | b_i]
    // Row m:      [ -c  |    0    |  0  ] (or c for minimization)
    this.tableau = [];
    for (let i = 0; i < this.m; i++) {
      const row = new Array(this.totalVars + 1).fill(0);
      for (let j = 0; j < this.n; j++) {
        row[j] = A[i][j];
      }
      row[this.n + i] = 1; // Slack variable
      row[this.totalVars] = b[i]; // RHS
      this.tableau.push(row);
    }

    // Objective row
    const objRow = new Array(this.totalVars + 1).fill(0);
    for (let j = 0; j < this.n; j++) {
      objRow[j] = -c[j]; // standard tableau form for minimization
    }
    this.tableau.push(objRow);
  }

  /**
   * Executes pivoting iterations until optimal solution is discovered or bound is reached
   */
  public solve(maxIterations: number = 100): {
    status: 'optimal' | 'infeasible' | 'unbounded';
    solution: number[];
    iterations: number;
  } {
    const objRowIdx = this.m;

    while (this.iterations < maxIterations) {
      this.iterations++;

      // Find entering column (most negative value in objective row)
      let pivotCol = -1;
      let minVal = -1e-7;

      for (let j = 0; j < this.totalVars; j++) {
        if (this.tableau[objRowIdx][j] < minVal) {
          minVal = this.tableau[objRowIdx][j];
          pivotCol = j;
        }
      }

      // If no negative coefficient remains, optimal vertex is reached
      if (pivotCol === -1) {
        break;
      }

      // Find leaving row via Minimum Ratio Test
      let pivotRow = -1;
      let minRatio = Infinity;

      for (let i = 0; i < this.m; i++) {
        const coeff = this.tableau[i][pivotCol];
        if (coeff > 1e-7) {
          const ratio = this.tableau[i][this.totalVars] / coeff;
          if (ratio < minRatio) {
            minRatio = ratio;
            pivotRow = i;
          }
        }
      }

      if (pivotRow === -1) {
        return { status: 'unbounded', solution: [], iterations: this.iterations };
      }

      // Pivot operation: normalize pivot row
      const pivotVal = this.tableau[pivotRow][pivotCol];
      for (let j = 0; j <= this.totalVars; j++) {
        this.tableau[pivotRow][j] /= pivotVal;
      }

      // Eliminate pivot column from all other rows
      for (let i = 0; i <= this.m; i++) {
        if (i !== pivotRow) {
          const factor = this.tableau[i][pivotCol];
          for (let j = 0; j <= this.totalVars; j++) {
            this.tableau[i][j] -= factor * this.tableau[pivotRow][j];
          }
        }
      }
    }

    // Extract solution values for original decision variables
    const solution = new Array(this.n).fill(0);
    for (let j = 0; j < this.n; j++) {
      let isBasic = false;
      let basicRow = -1;
      for (let i = 0; i < this.m; i++) {
        if (Math.abs(this.tableau[i][j] - 1) < 1e-6) {
          if (!isBasic) {
            isBasic = true;
            basicRow = i;
          } else {
            isBasic = false;
            break;
          }
        } else if (Math.abs(this.tableau[i][j]) > 1e-6) {
          isBasic = false;
          break;
        }
      }
      if (isBasic && basicRow !== -1) {
        solution[j] = Math.max(0, this.tableau[basicRow][this.totalVars]);
      }
    }

    return {
      status: 'optimal',
      solution,
      iterations: this.iterations
    };
  }
}

/**
 * Executes Linear Simplex Optimization Routine (FR-4)
 * Solves constrained budget reallocation against user savings target and category bounds
 */
export function optimizeBudgetWithSimplex(
  predictedForecasts: Record<ExpenseCategory, number>,
  constraints: SimplexConstraints
): SimplexOptimizationResult {
  const { targetSavingsRate, estimatedMonthlyIncome, categoryPriorities } = constraints;

  // Maximum allowed total outflow based on target savings
  const maxTotalBudget = Math.max(0, estimatedMonthlyIncome * (1 - targetSavingsRate));

  // Category priority weights (Penalize discretionary/luxury spend heavier)
  // Higher weight in minimization means the optimizer cuts it first
  const PRIORITY_CUT_WEIGHTS: Record<'essential' | 'discretionary' | 'luxury', number> = {
    luxury: 10.0,
    discretionary: 4.0,
    essential: 1.0
  };

  const categories = OUTFLOW_CATEGORIES;
  const numCats = categories.length;

  // Compute lower and upper bounds per category
  // Let x_c = L_c + delta_c, where 0 <= delta_c <= (U_c - L_c)
  const lowerBounds: number[] = [];
  const upperBounds: number[] = [];
  const spanBounds: number[] = [];
  const costCoefficients: number[] = [];

  let sumLowerBounds = 0;
  let originalTotalOutflow = 0;

  for (let i = 0; i < numCats; i++) {
    const cat = categories[i];
    const predicted = Math.max(0, predictedForecasts[cat] || 0);
    originalTotalOutflow += predicted;

    const config = categoryPriorities[cat] || {
      priority: cat === 'Housing' || cat === 'Utilities' || cat === 'Healthcare' ? 'essential' : 'discretionary',
      minFloorRatio: 0.8,
      maxCapRatio: 1.1
    };

    const minFloorRatio = config.priority === 'essential' ? 0.95 : config.priority === 'discretionary' ? 0.65 : 0.40;
    const maxCapRatio = 1.0; // Don't recommend spending more than forecast unless user has room

    const floor = Math.round(predicted * minFloorRatio * 100) / 100;
    const cap = Math.round(predicted * maxCapRatio * 100) / 100;

    lowerBounds.push(floor);
    upperBounds.push(cap);
    spanBounds.push(Math.max(0, cap - floor));
    sumLowerBounds += floor;

    // Cost coefficient: We want to maximize savings, which equals minimizing spend.
    // We weight luxury spend cuts higher so luxury items drop towards their floor first.
    costCoefficients.push(PRIORITY_CUT_WEIGHTS[config.priority] || 2.0);
  }

  // Linear Program Formulation:
  // Decision variables: delta_0 .. delta_7 (amount above floor)
  // Minimize: sum( costCoefficients[i] * delta_i )
  // Subject to:
  // 1. Total spend constraint: sum(delta_i) <= maxTotalBudget - sumLowerBounds (if feasible)
  // 2. Individual upper bounds: delta_i <= spanBounds[i] for each i

  const availableDeltaBudget = Math.max(0, maxTotalBudget - sumLowerBounds);

  // Formulate A and b
  const A: number[][] = [];
  const b: number[] = [];

  // Constraint 1: sum(delta_i) <= availableDeltaBudget
  const totalSpendRow = new Array(numCats).fill(1);
  A.push(totalSpendRow);
  b.push(availableDeltaBudget);

  // Constraints 2..(numCats+1): delta_i <= spanBounds[i]
  for (let i = 0; i < numCats; i++) {
    const boundRow = new Array(numCats).fill(0);
    boundRow[i] = 1;
    A.push(boundRow);
    b.push(spanBounds[i]);
  }

  const solver = new SimplexTableauSolver(costCoefficients, A, b);
  const { status, solution, iterations } = solver.solve();

  // If sumLowerBounds exceeds maxTotalBudget, the problem is infeasible under hard floors
  const isStrictlyInfeasible = sumLowerBounds > maxTotalBudget && maxTotalBudget > 0;

  const recommendedAllocation: Record<ExpenseCategory, number> = {} as any;
  const deltas: Record<ExpenseCategory, number> = {} as any;
  let totalRecommendedOutflow = 0;

  for (let i = 0; i < numCats; i++) {
    const cat = categories[i];
    const predicted = predictedForecasts[cat] || 0;
    let rec: number;

    if (isStrictlyInfeasible) {
      // Pro-rata compression if hard floor exceeds target income budget
      const compressionFactor = maxTotalBudget / (originalTotalOutflow || 1);
      rec = Math.round(predicted * compressionFactor * 100) / 100;
    } else {
      const deltaVal = solution[i] || 0;
      rec = Math.round((lowerBounds[i] + deltaVal) * 100) / 100;
    }

    recommendedAllocation[cat] = rec;
    deltas[cat] = Math.round((rec - predicted) * 100) / 100;
    totalRecommendedOutflow += rec;
  }

  // Preserve Income entry
  recommendedAllocation['Income'] = estimatedMonthlyIncome;
  deltas['Income'] = 0;

  const projectedSavings = Math.round((estimatedMonthlyIncome - totalRecommendedOutflow) * 100) / 100;
  const savingsRateAchieved = estimatedMonthlyIncome > 0 ? projectedSavings / estimatedMonthlyIncome : 0;

  // Generate actionable narrative recommendations
  const rebalanceActions: SimplexOptimizationResult['rebalanceActions'] = [];

  for (const cat of categories) {
    const delta = deltas[cat];
    const predicted = predictedForecasts[cat] || 0;
    const rec = recommendedAllocation[cat];

    if (delta < -5) {
      const cutPercent = Math.round((Math.abs(delta) / (predicted || 1)) * 100);
      rebalanceActions.push({
        category: cat,
        delta,
        action: 'reduce',
        narrative: `Trim ${cat} spend by ₹${Math.abs(delta).toFixed(2)} (-${cutPercent}%) from ₹${predicted.toFixed(2)} to ₹${rec.toFixed(2)} to lock in target savings.`
      });
    } else if (delta > 5) {
      rebalanceActions.push({
        category: cat,
        delta,
        action: 'increase',
        narrative: `Capacity available: ${cat} can absorb up to +₹${delta.toFixed(2)} without breaching monthly savings parameters.`
      });
    } else {
      rebalanceActions.push({
        category: cat,
        delta: 0,
        action: 'maintain',
        narrative: `Keep ${cat} spend at current baseline (₹${rec.toFixed(2)}).`
      });
    }
  }

  // Sort by largest reduction first
  rebalanceActions.sort((a, b) => a.delta - b.delta);

  return {
    status: isStrictlyInfeasible ? 'feasible' : status === 'optimal' ? 'optimal' : 'feasible',
    originalForecast: predictedForecasts,
    recommendedAllocation,
    deltas,
    totalRecommendedOutflow: Math.round(totalRecommendedOutflow * 100) / 100,
    projectedSavings,
    savingsRateAchieved: Math.round(savingsRateAchieved * 1000) / 1000,
    iterations,
    rebalanceActions
  };
}
