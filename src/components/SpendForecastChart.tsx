// FinPredict.js - Ephemeral Visualization Dashboard (FR-5)

import React, { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import '../services/chartSetup';
import { OUTFLOW_CATEGORIES } from '../types';
import type { PredictionResult, ExpenseCategory } from '../types';
import { AlertTriangle, BarChart3, LineChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatINR, formatINRCompact } from '../utils/currency';

interface SpendForecastChartProps {
  prediction: PredictionResult;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Housing: '#3B82F6',       // Blue
  Food: '#10B981',          // Emerald
  Transport: '#F59E0B',     // Amber
  Utilities: '#06B6D4',     // Cyan
  Entertainment: '#8B5CF6', // Purple
  Healthcare: '#EC4899',    // Pink
  Shopping: '#F97316',      // Orange
  Income: '#22C55E',        // Green
  Other: '#64748B'          // Slate
};

export const SpendForecastChart: React.FC<SpendForecastChartProps> = ({ prediction }) => {
  const [viewMode, setViewMode] = useState<'categoryBar' | 'temporalLine'>('categoryBar');

  const categories = OUTFLOW_CATEGORIES;

  // 1. Category Comparative Bar Data
  const categoryBarData = {
    labels: categories,
    datasets: [
      {
        label: 'Historical 30-Day Outflow',
        data: categories.map(cat => prediction.categoryForecasts[cat]?.historical30DayTotal || 0),
        backgroundColor: 'rgba(100, 116, 139, 0.3)',
        borderColor: '#64748B',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Predicted 30-Day Outflow',
        data: categories.map(cat => prediction.categoryForecasts[cat]?.predicted30DayTotal || 0),
        backgroundColor: categories.map(cat => {
          const forecast = prediction.categoryForecasts[cat];
          return forecast?.isAnomaly ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.7)';
        }),
        borderColor: categories.map(cat => {
          const forecast = prediction.categoryForecasts[cat];
          return forecast?.isAnomaly ? '#EF4444' : '#10B981';
        }),
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const categoryBarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { boxWidth: 10, color: '#4B5563', font: { size: 11, family: 'Inter, sans-serif' } }
      },
      tooltip: {
        backgroundColor: '#1F2937',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        padding: 10,
        callbacks: {
          label: (context: any) => ` ${context.dataset.label}: ${formatINR(context.raw)}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#F3F4F6' },
        ticks: { color: '#4B5563', font: { size: 11 } }
      },
      y: {
        grid: { color: '#F3F4F6' },
        ticks: {
          color: '#64748B',
          font: { size: 10 },
          callback: (value: any) => formatINRCompact(Number(value))
        }
      }
    }
  };

  // 2. Daily Temporal Line Data
  const trajectoryLabels = prediction.dailyTrajectory.map(d => d.date.slice(5));
  const trajectorySpend = prediction.dailyTrajectory.map(d => d.totalOutflow);

  const temporalLineData = {
    labels: trajectoryLabels,
    datasets: [
      {
        label: 'Predicted Daily Velocity (₹)',
        data: trajectorySpend,
        borderColor: '#007A3D',
        backgroundColor: 'rgba(0, 122, 61, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5
      }
    ]
  };

  const temporalLineOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { boxWidth: 10, color: '#4B5563', font: { size: 11 } }
      },
      tooltip: {
        backgroundColor: '#1F2937',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => ` Velocity: ${formatINR(context.raw)}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#F3F4F6' },
        ticks: { color: '#64748B', font: { size: 10 }, maxTicksLimit: 12 }
      },
      y: {
        grid: { color: '#F3F4F6' },
        ticks: {
          color: '#64748B',
          font: { size: 10 },
          callback: (value: any) => formatINRCompact(Number(value))
        }
      }
    }
  };

  const anomalies = categories
    .map(c => prediction.categoryForecasts[c])
    .filter(f => f && f.isAnomaly);

  return (
    <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-6 sm:p-7 space-y-6 shadow-sm select-none">
      {/* Top Header & Segmented Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#111827] tracking-tight font-sans">
              30-Day Multi-Vector Spend Forecast
            </h3>
            <span className="text-[10px] font-mono tracking-wider bg-emerald-50 text-[#007A3D] border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
              TF.JS TENSOR INFERENCE (FR-5)
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Forward sequential outflow vectors calculated over temporal cyclical baseline
          </p>
        </div>

        {/* View Mode Segmented Control */}
        <div className="bg-gray-100 p-1 rounded-lg border border-gray-200 flex text-xs">
          <button
            onClick={() => setViewMode('categoryBar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded transition-all font-semibold ${
              viewMode === 'categoryBar'
                ? 'bg-white text-[#111827] shadow-sm'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#007A3D]" />
            <span>Category Delta</span>
          </button>
          <button
            onClick={() => setViewMode('temporalLine')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded transition-all font-semibold ${
              viewMode === 'temporalLine'
                ? 'bg-white text-[#111827] shadow-sm'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            <LineChart className="w-3.5 h-3.5 text-[#0065FF]" />
            <span>30-Day Curve</span>
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono-numbers">
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <div className="text-[#6B7280] text-[11px] font-sans font-bold uppercase tracking-wider">Historical 30D Outflow</div>
          <div className="text-[#111827] font-bold text-xl mt-1.5">
            {formatINR(prediction.totalHistoricalOutflow)}
          </div>
          <div className="text-[10px] text-[#6B7280] mt-1 font-sans">Observed bank baseline</div>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <div className="text-[#6B7280] text-[11px] font-sans font-bold uppercase tracking-wider">Predicted 30D Outflow</div>
          <div className="text-[#007A3D] font-bold text-xl mt-1.5">
            {formatINR(prediction.totalPredictedOutflow)}
          </div>
          <div className="text-[10px] text-[#6B7280] mt-1 font-sans">Multi-step tensor forward pass</div>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <div className="text-[#6B7280] text-[11px] font-sans font-bold uppercase tracking-wider">Projected Net Savings</div>
          <div className={`font-bold text-xl mt-1.5 ${prediction.projectedNetSavings >= 0 ? 'text-[#007A3D]' : 'text-rose-600'}`}>
            {formatINR(prediction.projectedNetSavings)}
          </div>
          <div className="text-[10px] text-[#6B7280] mt-1 font-sans">Inflow minus predicted spend</div>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <div className="text-[#6B7280] text-[11px] font-sans font-bold uppercase tracking-wider">Savings Rate</div>
          <div className="text-[#0065FF] font-bold text-xl mt-1.5">
            {(prediction.projectedSavingsRate * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-[#6B7280] mt-1 font-sans">Forecasted capital retention</div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 h-[300px]">
        {viewMode === 'categoryBar' ? (
          <Bar data={categoryBarData} options={categoryBarOptions} />
        ) : (
          <Line data={temporalLineData} options={temporalLineOptions} />
        )}
      </div>

      {/* Anomaly Alerts (if any) */}
      {anomalies.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700 tracking-wider uppercase font-sans">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Outflow Anomaly Risk Alerts</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {anomalies.map((a) => (
              <div
                key={a.category}
                className="bg-rose-50 border border-rose-200 p-3.5 rounded-lg text-xs flex items-start gap-3"
              >
                <div className="p-1 rounded bg-rose-100 text-rose-600 shrink-0 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-rose-900">
                    {a.category}: {a.variancePercentage > 0 ? `+${a.variancePercentage.toFixed(0)}%` : `${a.variancePercentage.toFixed(0)}%`} Surge Detected
                  </div>
                  <p className="text-rose-700 text-[11px] mt-0.5 leading-relaxed font-sans">
                    {a.anomalyReason || `Predicted spend (${formatINR(a.predicted30DayTotal)}) significantly exceeds 30-day baseline.`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refined Category Breakdown Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-xs font-mono-numbers">
          <thead>
            <tr className="border-b border-gray-200 text-[#4B5563] font-sans text-[11px] font-bold uppercase bg-gray-50">
              <th className="py-2.5 px-4">Category</th>
              <th className="py-2.5 px-4">Historical 30D</th>
              <th className="py-2.5 px-4">Predicted 30D</th>
              <th className="py-2.5 px-4">Variance</th>
              <th className="py-2.5 px-4">95% Confidence Envelope</th>
              <th className="py-2.5 px-4 text-right">Health Check</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => {
              const item = prediction.categoryForecasts[cat];
              if (!item) return null;
              const isIncrease = item.variancePercentage > 0;

              return (
                <tr key={cat} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-[#111827] flex items-center gap-2.5 font-sans">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                    />
                    <span>{cat}</span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-600">
                    {formatINR(item.historical30DayTotal)}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-[#111827]">
                    {formatINR(item.predicted30DayTotal)}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${
                      item.isAnomaly ? 'text-rose-600' : isIncrease ? 'text-amber-600' : 'text-[#007A3D]'
                    }`}>
                      {isIncrease ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {isIncrease ? `+${item.variancePercentage.toFixed(1)}%` : `${item.variancePercentage.toFixed(1)}%`}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-500 text-[11px]">
                    {formatINR(item.confidenceInterval.lower, { decimals: 0 })} — {formatINR(item.confidenceInterval.upper, { decimals: 0 })}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {item.isAnomaly ? (
                      <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-sans font-bold">
                        Surge Anomaly
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-50 text-[#007A3D] border border-emerald-200 px-2 py-0.5 rounded-full font-sans font-semibold">
                        Nominal Envelope
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
