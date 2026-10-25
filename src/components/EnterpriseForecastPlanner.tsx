// FinPredict.js - Enterprise Multi-Vector Forecast & Scenario Planner (Image 2)
// Exact match to Image 2: Stacked multi-category bar charts, scenario drawer, and P&L breakdown

import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import '../services/chartSetup';
import { Calculator, FileText, IndianRupee, CheckCircle2 } from 'lucide-react';
import type { PredictionResult, SimplexOptimizationResult } from '../types';
import { formatINR, formatINRCompact } from '../utils/currency';

interface EnterpriseForecastPlannerProps {
  prediction: PredictionResult | null;
  optimization: SimplexOptimizationResult | null;
  onUpdateSavingsRate: (rate: number) => void;
  savingsRate: number;
}

export const EnterpriseForecastPlanner: React.FC<EnterpriseForecastPlannerProps> = ({
  prediction,
  optimization,
  onUpdateSavingsRate,
  savingsRate
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'revenue' | 'expenses' | 'pl_statement'>('expenses');
  const [scenarioMode, setScenarioMode] = useState<'recurring' | 'fixed' | 'growth'>('recurring');

  // Multi-month stacked forecast labels
  const monthLabels = [
    "Oct '26", "Nov '26", "Dec '26", "Jan '27", "Feb '27", "Mar '27", "Apr '27", "May '27", "Jun '27"
  ];

  // Base values per category
  const housing = prediction?.categoryForecasts.Housing?.predicted30DayTotal || 2450;
  const food = prediction?.categoryForecasts.Food?.predicted30DayTotal || 820;
  const transport = prediction?.categoryForecasts.Transport?.predicted30DayTotal || 380;
  const utilities = prediction?.categoryForecasts.Utilities?.predicted30DayTotal || 290;
  const discretionary = (prediction?.categoryForecasts.Entertainment?.predicted30DayTotal || 190) +
                        (prediction?.categoryForecasts.Shopping?.predicted30DayTotal || 340);

  // Deterministic month variance factors (100% pure, avoiding impure Math.random() in render)
  const transportFactors = [0.98, 1.02, 1.04, 0.96, 0.99, 1.05, 1.01, 0.97, 1.03];
  const foodFactors = [1.01, 0.99, 1.03, 1.00, 0.97, 1.02, 1.04, 0.98, 1.01];
  const discFactors = [0.94, 1.06, 1.12, 0.91, 0.95, 1.08, 1.02, 0.96, 1.05];

  // Stacked multi-color bar chart (Image 2 exact match)
  const stackedBarData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Housing & Facility Lease',
        data: monthLabels.map(() => housing),
        backgroundColor: '#F97316', // Orange
        stack: 'Stack 0',
        borderRadius: 2
      },
      {
        label: 'Operational Transport & Gas',
        data: monthLabels.map((_, i) => transport * transportFactors[i]),
        backgroundColor: '#3B82F6', // Blue
        stack: 'Stack 0',
        borderRadius: 2
      },
      {
        label: 'Food & Living Essentials',
        data: monthLabels.map((_, i) => food * foodFactors[i]),
        backgroundColor: '#F43F5E', // Pink
        stack: 'Stack 0',
        borderRadius: 2
      },
      {
        label: 'Utilities & Subscriptions',
        data: monthLabels.map(() => utilities),
        backgroundColor: '#10B981', // Green
        stack: 'Stack 0',
        borderRadius: 2
      },
      {
        label: 'Discretionary / Retained Variance',
        data: monthLabels.map((_, i) => discretionary * discFactors[i]),
        backgroundColor: '#06B6D4', // Cyan
        stack: 'Stack 0',
        borderRadius: 2
      }
    ]
  };

  const stackedBarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { boxWidth: 12, color: '#4B5563', font: { size: 11, family: 'sans-serif' } }
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${formatINR(ctx.raw)}`
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: '#F3F4F6' },
        ticks: { color: '#4B5563', font: { size: 11 } }
      },
      y: {
        stacked: true,
        grid: { color: '#F3F4F6' },
        ticks: {
          color: '#4B5563',
          font: { size: 11 },
          callback: (val: any) => formatINRCompact(Number(val))
        }
      }
    }
  };

  const handleScenarioSelect = (mode: 'recurring' | 'fixed' | 'growth') => {
    setScenarioMode(mode);
    if (mode === 'recurring') {
      onUpdateSavingsRate(0.25);
    } else if (mode === 'fixed') {
      onUpdateSavingsRate(0.15);
    } else if (mode === 'growth') {
      onUpdateSavingsRate(0.50);
    }
  };

  const monthlyIncome = prediction?.categoryForecasts.Income?.predicted30DayTotal || 10800;

  return (
    <div className="space-y-4 select-none">
      {/* Subtabs Bar matching Image 2 top (Revenue, Cost Of Sales, Personnel, Expenses, Working Capital) */}
      <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-md px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-1 text-xs font-semibold text-[#4B5563]">
          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`px-3 py-1 rounded transition-colors ${
              activeSubTab === 'expenses'
                ? 'bg-[#007A3D] text-white'
                : 'hover:bg-gray-100 text-[#374151]'
            }`}
          >
            Expenses &amp; Operating Envelopes
          </button>
          <button
            onClick={() => setActiveSubTab('revenue')}
            className={`px-3 py-1 rounded transition-colors ${
              activeSubTab === 'revenue'
                ? 'bg-[#007A3D] text-white'
                : 'hover:bg-gray-100 text-[#374151]'
            }`}
          >
            Inflow Revenue Streams
          </button>
          <button
            onClick={() => setActiveSubTab('pl_statement')}
            className={`px-3 py-1 rounded transition-colors ${
              activeSubTab === 'pl_statement'
                ? 'bg-[#007A3D] text-white'
                : 'hover:bg-gray-100 text-[#374151]'
            }`}
          >
            Profit &amp; Loss Statement Sheet
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6B7280] font-mono">
          <span>Monthly View</span>
          <span>•</span>
          <span className="text-[#111827] font-bold">2026-27 Forecast</span>
        </div>
      </div>

      {/* Main Grid: Stacked Chart (Left) + Interactive Scenario Planner Card (Right - matching Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Stacked Multi-Category Bar Chart (Image 2) */}
        <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div>
              <h4 className="font-bold text-[#111827] text-sm">
                Multi-Period Expense &amp; Outflow Projection
              </h4>
              <p className="text-xs text-[#6B7280]">
                Stacked category allocations across 9-month rolling tensor forecast
              </p>
            </div>
            <div className="text-right text-xs font-mono-numbers">
              <span className="text-[#6B7280] text-[10px] uppercase font-bold block">Monthly Mean Outflow</span>
              <span className="font-bold text-[#111827] text-sm">
                {formatINR(housing + food + transport + utilities + discretionary)}/mo
              </span>
            </div>
          </div>

          <div className="h-[310px] w-full pt-4">
            <Bar data={stackedBarData} options={stackedBarOptions} />
          </div>
        </div>

        {/* Right: Floating Scenario Builder Card (Image 2 exact replica) */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-[#E3FCEF] text-[#007A3D]">
                <Calculator className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-[#111827] text-sm">
                Simplex Scenario Planner
              </h4>
            </div>
            <span className="text-[10px] font-mono bg-blue-50 text-[#0065FF] px-2 py-0.5 rounded border border-blue-200 font-semibold">
              LP Solved
            </span>
          </div>

          {/* Scenario Options Pills (Image 2 replica) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#374151] block">
              Allocation Scenario Model:
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              {[
                { id: 'recurring', label: 'Balanced (25%)' },
                { id: 'fixed', label: 'Conservative (15%)' },
                { id: 'growth', label: 'Max F.I.R.E. (50%)' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleScenarioSelect(opt.id as any)}
                  className={`py-1.5 px-2 rounded border text-[11px] font-semibold transition-all ${
                    scenarioMode === opt.id
                      ? 'bg-[#007A3D] text-white border-[#007A3D] shadow-sm'
                      : 'bg-[#F9FAFB] text-[#4B5563] border-[#D1D5DB] hover:bg-gray-100'
                  }`}
                  title={`Switch to ${opt.label} target`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Savings Rate Slider */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#374151]">Target Capital Retention:</span>
              <span className="font-mono text-[#007A3D] font-extrabold text-sm">
                {(savingsRate * 100).toFixed(0)}% ({formatINR(monthlyIncome * savingsRate, { decimals: 0 })}/mo)
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.01"
              value={savingsRate}
              onChange={(e) => onUpdateSavingsRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#007A3D]"
            />
            <div className="flex justify-between text-[10px] text-[#6B7280] font-mono">
              <span>5% (Minimal)</span>
              <span>25% (Standard)</span>
              <span>60% (Max)</span>
            </div>
          </div>

          {/* Optimization Directives Summary (Image 2 callout) */}
          {optimization && (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#111827]">
                <span>Projected Retained Reserves</span>
                <span className="text-[#007A3D] font-mono font-bold">{formatINR(optimization.projectedSavings)}</span>
              </div>
              <div className="text-[11px] text-[#4B5563] leading-relaxed">
                Primal Simplex pivoted in <strong className="font-mono">{optimization.iterations} iterations</strong> to guarantee essential living floors while enforcing the {(savingsRate * 100).toFixed(0)}% reserve target.
              </div>
            </div>
          )}

          <button
            onClick={() => onUpdateSavingsRate(savingsRate)}
            className="w-full bg-[#007A3D] hover:bg-[#005A2B] text-white py-2 rounded text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Apply Scenario Rebalance</span>
          </button>
        </div>
      </div>

      {/* View 2: Inflow Revenue Streams Sheet */}
      {activeSubTab === 'revenue' && (
        <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-[#007A3D]" />
              <h4 className="font-bold text-[#111827] text-sm">
                Inflow Revenue Streams &amp; Capital Velocity
              </h4>
            </div>
            <span className="text-xs text-[#007A3D] font-mono font-bold">
              Mean Velocity: {formatINR(monthlyIncome)}/mo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono-numbers">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-gray-500 text-[11px] uppercase font-sans font-bold">Primary Payroll Deposit</div>
              <div className="text-lg font-bold text-[#111827] mt-1">{formatINR(monthlyIncome * 0.88)}/mo</div>
              <div className="text-[10px] text-gray-500 font-sans mt-0.5">Bi-weekly ACH direct deposit schedule</div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-gray-500 text-[11px] uppercase font-sans font-bold">Secondary Consulting / Staking</div>
              <div className="text-lg font-bold text-[#0065FF] mt-1">{formatINR(monthlyIncome * 0.12)}/mo</div>
              <div className="text-[10px] text-gray-500 font-sans mt-0.5">Discretionary capital inflows</div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-gray-500 text-[11px] uppercase font-sans font-bold">Annualized Run-Rate</div>
              <div className="text-lg font-bold text-[#007A3D] mt-1">{formatINR(monthlyIncome * 12)}</div>
              <div className="text-[10px] text-gray-500 font-sans mt-0.5">Extrapolated 12-month gross inflow</div>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Pro Forma Profit & Loss Statement Sheet Table (Image 2 exact match) */}
      {activeSubTab === 'pl_statement' && (
        <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#007A3D]" />
              <h4 className="font-bold text-[#111827] text-sm">
                Pro Forma Profit &amp; Loss Statement Sheet
              </h4>
            </div>
            <span className="text-xs text-[#6B7280] font-mono">Currency: INR (₹)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-numbers text-xs">
              <thead>
                <tr className="border-b border-[#D1D5DB] text-[#4B5563] font-sans font-bold bg-[#F9FAFB] text-[11px]">
                  <th className="py-2.5 px-3">Statement Line Item</th>
                  <th className="py-2.5 px-3 text-right">2024-25 Actual</th>
                  <th className="py-2.5 px-3 text-right">2025-26 Run Rate</th>
                  <th className="py-2.5 px-3 text-right">2026-27 Forecast</th>
                  <th className="py-2.5 px-3 text-right text-[#007A3D]">Simplex Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
                <tr className="font-semibold text-[#111827]">
                  <td className="py-2 px-3 font-sans">Gross Revenue / Payroll Inflow</td>
                  <td className="py-2 px-3 text-right">{formatINR(monthlyIncome * 10.4)}</td>
                  <td className="py-2 px-3 text-right">{formatINR(monthlyIncome * 11.5)}</td>
                  <td className="py-2 px-3 text-right">{formatINR(monthlyIncome * 12)}</td>
                  <td className="py-2 px-3 text-right text-[#007A3D]">{formatINR(monthlyIncome * 12)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Essential Living Necessities (Housing, Health)</td>
                  <td className="py-2 px-3 text-right">({formatINR(monthlyIncome * 4.45)})</td>
                  <td className="py-2 px-3 text-right">({formatINR(monthlyIncome * 4.82)})</td>
                  <td className="py-2 px-3 text-right">({formatINR(monthlyIncome * 4.95)})</td>
                  <td className="py-2 px-3 text-right text-[#007A3D]">({formatINR(monthlyIncome * 4.80)})</td>
                </tr>
                <tr className="font-semibold bg-gray-50/50">
                  <td className="py-2 px-3 font-sans">Gross Operating Margin</td>
                  <td className="py-2 px-3 text-right">{formatINR(monthlyIncome * 5.95)}</td>
                  <td className="py-2 px-3 text-right">{formatINR(monthlyIncome * 6.68)}</td>
                  <td className="py-2 px-3 text-right">{formatINR(monthlyIncome * 7.05)}</td>
                  <td className="py-2 px-3 text-right text-[#007A3D]">{formatINR(monthlyIncome * 7.20)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Discretionary Spend (Leisure, Dining, Shopping)</td>
                  <td className="py-2 px-3 text-right">({formatINR(monthlyIncome * 2.63)})</td>
                  <td className="py-2 px-3 text-right">({formatINR(monthlyIncome * 2.88)})</td>
                  <td className="py-2 px-3 text-right">({formatINR(monthlyIncome * 3.22)})</td>
                  <td className="py-2 px-3 text-right text-[#007A3D]">({formatINR(monthlyIncome * 2.24)})</td>
                </tr>
                <tr className="font-extrabold text-[#007A3D] bg-emerald-50/50">
                  <td className="py-2.5 px-3 font-sans">Net Capital Retained (Savings Surplus)</td>
                  <td className="py-2.5 px-3 text-right">{formatINR(monthlyIncome * 3.32)}</td>
                  <td className="py-2.5 px-3 text-right">{formatINR(monthlyIncome * 3.80)}</td>
                  <td className="py-2.5 px-3 text-right">{formatINR(monthlyIncome * 3.83)}</td>
                  <td className="py-2.5 px-3 text-right text-[#007A3D] font-bold">
                    {formatINR((optimization?.projectedSavings || (monthlyIncome * savingsRate)) * 12)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
