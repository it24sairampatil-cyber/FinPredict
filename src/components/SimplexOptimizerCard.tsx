// FinPredict.js - Luxury Linear Simplex Optimization Routine Card (FR-4)

import React, { useState, useMemo } from 'react';
import { Sliders, CheckCircle2, ArrowDownRight, ArrowUpRight, Minus, Award } from 'lucide-react';
import { OUTFLOW_CATEGORIES } from '../types';
import type { ExpenseCategory, SimplexConstraints } from '../types';
import { optimizeBudgetWithSimplex } from '../services/simplexOptimizer';
import { formatINR } from '../utils/currency';

interface SimplexOptimizerCardProps {
  predictedForecasts: Record<ExpenseCategory, number>;
  defaultIncome: number;
  initialSavingsRate?: number;
  onUpdateSavingsRate?: (rate: number) => void;
}

export const SimplexOptimizerCard: React.FC<SimplexOptimizerCardProps> = ({
  predictedForecasts,
  defaultIncome,
  initialSavingsRate = 0.25,
  onUpdateSavingsRate
}) => {
  const [savingsRate, setSavingsRate] = useState<number>(initialSavingsRate);
  const [income, setIncome] = useState<number | ''>(defaultIncome > 0 ? defaultIncome : 5000);
  const [categoryPriorities, setCategoryPriorities] = useState<SimplexConstraints['categoryPriorities']>({
    Housing: { priority: 'essential', minFloorRatio: 0.95, maxCapRatio: 1.0 },
    Food: { priority: 'essential', minFloorRatio: 0.85, maxCapRatio: 1.0 },
    Transport: { priority: 'discretionary', minFloorRatio: 0.70, maxCapRatio: 1.0 },
    Utilities: { priority: 'essential', minFloorRatio: 0.95, maxCapRatio: 1.0 },
    Entertainment: { priority: 'luxury', minFloorRatio: 0.45, maxCapRatio: 1.0 },
    Healthcare: { priority: 'essential', minFloorRatio: 0.95, maxCapRatio: 1.0 },
    Shopping: { priority: 'luxury', minFloorRatio: 0.50, maxCapRatio: 1.0 },
    Income: { priority: 'essential', minFloorRatio: 1.0, maxCapRatio: 1.0 },
    Other: { priority: 'discretionary', minFloorRatio: 0.70, maxCapRatio: 1.0 }
  });

  const numericIncome = typeof income === 'number' ? income : 0;

  const optimizationResult = useMemo(() => {
    if (!predictedForecasts || Object.keys(predictedForecasts).length === 0) return null;

    return optimizeBudgetWithSimplex(predictedForecasts, {
      targetSavingsRate: savingsRate,
      estimatedMonthlyIncome: numericIncome,
      categoryPriorities
    });
  }, [savingsRate, numericIncome, categoryPriorities, predictedForecasts]);

  const handleSavingsRateChange = (newRate: number) => {
    setSavingsRate(newRate);
    if (onUpdateSavingsRate) {
      onUpdateSavingsRate(newRate);
    }
  };

  const handlePriorityToggle = (cat: ExpenseCategory) => {
    setCategoryPriorities(prev => {
      const current = prev[cat]?.priority || 'discretionary';
      const nextPriority: 'essential' | 'discretionary' | 'luxury' =
        current === 'essential' ? 'discretionary' : current === 'discretionary' ? 'luxury' : 'essential';

      const minFloorRatio = nextPriority === 'essential' ? 0.95 : nextPriority === 'discretionary' ? 0.70 : 0.45;

      return {
        ...prev,
        [cat]: {
          priority: nextPriority,
          minFloorRatio,
          maxCapRatio: 1.0
        }
      };
    });
  };

  const totalPredictedSpend = OUTFLOW_CATEGORIES.reduce(
    (acc, cat) => acc + (predictedForecasts[cat] || 0),
    0
  );

  return (
    <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-6 sm:p-7 space-y-6 shadow-sm select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#111827] tracking-tight font-sans">
              Linear Simplex Budget Optimization
            </h3>
            {optimizationResult && (
              <span className="text-[10px] font-mono tracking-wider bg-emerald-50 text-[#007A3D] border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-bold">
                <Award className="w-3 h-3 text-[#007A3D]" />
                <span>PRIMAL TABLEAU OPTIMAL (FR-4)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Algorithmic envelope optimization balancing necessity floors against capital accumulation goals
          </p>
        </div>

        {optimizationResult && (
          <div className="text-[11px] font-mono text-[#374151] bg-gray-50 px-3.5 py-1.5 rounded-lg border border-gray-200">
            Pivots: <span className="text-[#0065FF] font-bold">{optimizationResult.iterations} iterations</span>
          </div>
        )}
      </div>

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-lg border border-gray-200">
        {/* Savings Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#374151] font-semibold flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#007A3D]" />
              Target Monthly Savings Allocation:
            </span>
            <span className="font-mono text-[#007A3D] font-extrabold text-sm">
              {(savingsRate * 100).toFixed(0)}% ({formatINR(numericIncome * savingsRate, { decimals: 0 })}/mo)
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.60"
            step="0.01"
            value={savingsRate}
            onChange={(e) => handleSavingsRateChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#007A3D]"
          />
          <div className="flex justify-between text-[10px] text-[#6B7280] font-mono">
            <span>5% (Conservative)</span>
            <span>25% (Standard)</span>
            <span>60% (Max Accumulation)</span>
          </div>
        </div>

        {/* Income Input */}
        <div className="space-y-2">
          <label className="text-xs text-[#374151] font-semibold block">
            Estimated Monthly Net Inflow (₹):
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-gray-400 font-mono text-xs">₹</span>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-8 pr-3 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#007A3D] transition-colors"
            />
          </div>
          <div className="text-[10px] text-[#6B7280]">
            Unconstrained Spend Forecast: <span className="font-mono text-[#111827] font-semibold">{formatINR(totalPredictedSpend)}</span>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      {optimizationResult && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono-numbers">
          <div className="bg-white border border-[#D1D5DB] p-4 rounded-lg shadow-sm">
            <div className="text-[#6B7280] text-[11px] font-sans font-bold uppercase tracking-wider">Optimized Total Spend</div>
            <div className="text-[#0065FF] font-bold text-xl mt-1">
              {formatINR(optimizationResult.totalRecommendedOutflow)}
            </div>
            <div className="text-[10px] text-[#6B7280] mt-1">
              Ceiling: {formatINR(numericIncome * (1 - savingsRate), { decimals: 0 })}
            </div>
          </div>

          <div className="bg-white border border-[#D1D5DB] p-4 rounded-lg shadow-sm">
            <div className="text-[#6B7280] text-[11px] font-sans font-bold uppercase tracking-wider">Spend Reduction Delta</div>
            <div className={`font-bold text-xl mt-1 flex items-center gap-1 ${
              optimizationResult.totalRecommendedOutflow < totalPredictedSpend ? 'text-[#007A3D]' : 'text-gray-700'
            }`}>
              {optimizationResult.totalRecommendedOutflow < totalPredictedSpend ? (
                <ArrowDownRight className="w-5 h-5 text-[#007A3D]" />
              ) : (
                <Minus className="w-5 h-5 text-gray-400" />
              )}
              -{formatINR(Math.max(0, totalPredictedSpend - optimizationResult.totalRecommendedOutflow))}
            </div>
            <div className="text-[10px] text-[#6B7280] mt-1">
              Optimal compression delta
            </div>
          </div>

          <div className="bg-white border border-[#D1D5DB] p-4 rounded-lg shadow-sm">
            <div className="text-[#6B7280] text-[11px] font-sans font-bold uppercase tracking-wider">Projected Capital Saved</div>
            <div className="text-[#007A3D] font-bold text-xl mt-1">
              {formatINR(optimizationResult.projectedSavings)}
            </div>
            <div className="text-[10px] text-[#6B7280] mt-1">
              Goal: {formatINR(numericIncome * savingsRate, { decimals: 0 })}
            </div>
          </div>

          <div className="bg-white border border-[#D1D5DB] p-4 rounded-lg shadow-sm">
            <div className="text-[#6B7280] text-[11px] font-sans font-bold uppercase tracking-wider">Savings Rate Achieved</div>
            <div className="text-[#111827] font-bold text-xl mt-1">
              {(optimizationResult.savingsRateAchieved * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-[#6B7280] mt-1">
              Target: {(savingsRate * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      {/* Category Allocation Envelopes */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#111827] uppercase tracking-wider font-sans text-xs">
            Algorithmic Category Allocation Matrix
          </span>
          <span className="text-[10px] text-[#6B7280] font-sans">
            Cycle constraint priority: <span className="text-blue-600 font-bold">Essential</span> → <span className="text-amber-600 font-bold">Discretionary</span> → <span className="text-purple-600 font-bold">Luxury</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {OUTFLOW_CATEGORIES.map((cat) => {
            const predicted = predictedForecasts[cat] || 0;
            const rec = optimizationResult?.recommendedAllocation[cat] || predicted;
            const delta = optimizationResult?.deltas[cat] || 0;
            const priorityConfig = categoryPriorities[cat]?.priority || 'discretionary';

            const priorityBadgeColors = {
              essential: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
              discretionary: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
              luxury: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
            };

            return (
              <div
                key={cat}
                className="bg-white border border-gray-200 hover:border-gray-400 p-4 rounded-lg space-y-2.5 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#111827]">{cat}</span>
                  <button
                    onClick={() => handlePriorityToggle(cat)}
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border transition-colors ${priorityBadgeColors[priorityConfig]}`}
                    title="Click to cycle constraint priority"
                  >
                    {priorityConfig}
                  </button>
                </div>

                <div className="flex items-baseline justify-between font-mono-numbers">
                  <div>
                    <div className="text-[10px] text-gray-500 font-sans uppercase font-bold">Optimized</div>
                    <div className="text-sm font-bold text-[#007A3D]">{formatINR(rec)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 font-sans uppercase font-bold">Predicted</div>
                    <div className="text-xs text-gray-500">{formatINR(predicted)}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono-numbers">
                  <span className="text-gray-500 text-[10px]">Variance:</span>
                  {delta < -1 ? (
                    <span className="text-[#007A3D] font-bold flex items-center gap-0.5">
                      <ArrowDownRight className="w-3 h-3" />
                      -{formatINR(Math.abs(delta))}
                    </span>
                  ) : delta > 1 ? (
                    <span className="text-amber-600 font-bold flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      +{formatINR(delta)}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-[10px] font-medium">Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stewardship Directives */}
      {optimizationResult && optimizationResult.rebalanceActions.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#111827] tracking-wider uppercase">
            <CheckCircle2 className="w-4 h-4 text-[#007A3D]" />
            <span>Simplex Algorithmic Rebalancing Directives</span>
          </div>

          <div className="space-y-2">
            {optimizationResult.rebalanceActions.slice(0, 4).map((action, idx) => (
              <div
                key={idx}
                className="text-xs text-gray-700 bg-white px-3.5 py-2.5 rounded border border-gray-200 flex items-start gap-2.5"
              >
                <span className="font-mono text-[#007A3D] font-bold shrink-0">#{idx + 1}</span>
                <span className="leading-relaxed">{action.narrative}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
