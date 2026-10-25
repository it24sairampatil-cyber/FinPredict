// FinPredict.js - Status Tracker Overview Dashboard (Image 1 & Image 2)
// Exact layout replica of Vena Solutions Status Tracker (Donut, Days Remaining, Tasks Overdue, Calendar)

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import '../services/chartSetup';
import type { PredictionResult, SimplexOptimizationResult } from '../types';
import type { ParseResult } from '../services/csvParser';

import { formatINR } from '../utils/currency';

interface StatusTrackerOverviewProps {
  prediction: PredictionResult | null;
  parsedData: ParseResult | null;
  optimization: SimplexOptimizationResult | null;
  onOpenReport?: () => void;
}

export const StatusTrackerOverview: React.FC<StatusTrackerOverviewProps> = ({
  prediction,
  parsedData,
  optimization
}) => {
  const savingsRate = optimization
    ? Math.round(optimization.savingsRateAchieved * 100)
    : prediction
    ? Math.round(prediction.projectedSavingsRate * 100)
    : 25;

  const grossInflow = parsedData ? parsedData.totalInflow : 10800;
  const grossOutflow = optimization
    ? optimization.totalRecommendedOutflow
    : prediction
    ? prediction.totalPredictedOutflow
    : 7420;
  const netSavings = Math.round((grossInflow - grossOutflow) * 100) / 100;

  // Donut chart data matching Image 1
  const donutData = {
    labels: ['Capital Reserves (Savings)', 'Committed Outflows', 'Unallocated'],
    datasets: [
      {
        data: [savingsRate, Math.max(0, 100 - savingsRate - 5), 5],
        backgroundColor: ['#007A3D', '#0065FF', '#9CA3AF'],
        borderWidth: 2,
        borderColor: '#FFFFFF',
        cutout: '72%'
      }
    ]
  };

  const donutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${ctx.raw}%`
        }
      }
    }
  };

  // Calendar dates for October 2026 matching Image 1
  const calendarDays = [
    { day: 28, isPrev: true }, { day: 29, isPrev: true }, { day: 30, isPrev: true },
    { day: 1, isCycle: true, note: 'Payroll/Rent' }, { day: 2 }, { day: 3 }, { day: 4 },
    { day: 5 }, { day: 6 }, { day: 7 }, { day: 8 }, { day: 9 }, { day: 10, isCycle: true, note: 'Utilities' }, { day: 11 },
    { day: 12 }, { day: 13 }, { day: 14 }, { day: 15, isCycle: true, note: 'Payroll' }, { day: 16 }, { day: 17 }, { day: 18 },
    { day: 19 }, { day: 20 }, { day: 21, isToday: true }, { day: 22 }, { day: 23, total: '3 Total' }, { day: 24, total: '1 Total' }, { day: 25 },
    { day: 26 }, { day: 27 }, { day: 28, total: '1 Total' }, { day: 29 }, { day: 30 }, { day: 31 }, { day: 1, isNext: true }
  ];

  return (
    <div className="space-y-3">
      {/* Formula Equation KPI Bar (Image 2) */}
      <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-3 px-5 flex flex-wrap items-center justify-between gap-4 text-xs font-sans shadow-sm">
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#6B7280]">Total Revenue / Inflow</div>
            <div className="text-base font-bold text-[#111827] font-mono-numbers">
              {formatINR(grossInflow)}
            </div>
          </div>
          <span className="text-[#9CA3AF] text-lg font-light">−</span>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#6B7280]">Total Expenses / Outflow</div>
            <div className="text-base font-bold text-[#111827] font-mono-numbers">
              {formatINR(grossOutflow)}
            </div>
          </div>
          <span className="text-[#9CA3AF] text-lg font-light">=</span>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#6B7280]">Net Retained / Profit</div>
            <div className="text-base font-bold text-[#007A3D] font-mono-numbers">
              {formatINR(netSavings)}
            </div>
          </div>
        </div>

        {/* Green Box Highlight (Image 2) */}
        <div className="bg-[#E3FCEF] border border-[#007A3D]/30 rounded px-4 py-2 text-right">
          <div className="text-[10px] font-bold text-[#007A3D] uppercase tracking-wider">Target Capital Retention</div>
          <div className="text-lg font-extrabold text-[#007A3D] font-mono-numbers">{savingsRate}.0% Rate</div>
        </div>
      </div>

      {/* 3-Column Executive Status Tracker Row (Image 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Card 1: Circular Progress Donut (Image 1 Left) */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-5 flex items-center justify-center relative shadow-sm">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <Doughnut data={donutData} options={donutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-3xl font-extrabold text-[#111827] font-mono-numbers leading-none">
                {savingsRate}%
              </span>
              <span className="text-[11px] font-semibold text-[#4B5563] mt-1 uppercase tracking-tight">
                {savingsRate >= 20 ? 'Target Reached' : 'Allocation Gap'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Metrics & Progress (Image 1 Middle) */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-5 flex flex-col justify-between shadow-sm">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#E5E7EB]">
            {/* Days Remaining Box */}
            <div className="text-center">
              <div className="text-4xl font-extrabold text-[#111827] font-mono-numbers">
                30
              </div>
              <div className="text-xs font-semibold text-[#4B5563] mt-0.5">
                Days Remaining
              </div>
              <div className="text-[10px] text-[#9CA3AF] mt-1 font-mono">
                Forward Tensor Horizon
              </div>
            </div>

            {/* Tasks Overdue Box */}
            <div className="text-center">
              <div className="text-4xl font-extrabold text-[#DC2626] font-mono-numbers">
                0
              </div>
              <div className="text-xs font-semibold text-[#4B5563] mt-0.5">
                Anomalies Overdue
              </div>
              <div className="text-[10px] text-[#9CA3AF] mt-1 font-mono">
                8 Envelopes Guarded
              </div>
            </div>
          </div>

          {/* Progress bar (Image 1 Middle Bottom) */}
          <div className="pt-4 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-[#374151]">
              <span>6% Completed</span>
              <span className="text-[#007A3D] font-mono">{savingsRate}% Allocation Target</span>
            </div>
            <div className="w-full bg-[#E5E7EB] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#007A3D] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, savingsRate * 3)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Schedule / Calendar Widget (Image 1 Right) */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] text-xs">
            <span className="font-bold text-[#111827] font-sans">October 2026 Schedule</span>
            <span className="text-[10px] text-[#6B7280] font-mono">Cycle: 30D Rolling</span>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#6B7280] py-1">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-mono-numbers">
            {calendarDays.slice(0, 28).map((d, i) => (
              <div
                key={i}
                className={`p-1 rounded text-[10px] relative ${
                  d.isToday
                    ? 'bg-[#FEF08A] text-[#854D0E] font-bold border border-[#FDE047]'
                    : d.isCycle
                    ? 'bg-[#E3FCEF] text-[#007A3D] font-semibold border border-[#007A3D]/20'
                    : d.isPrev || d.isNext
                    ? 'text-[#9CA3AF]'
                    : 'text-[#374151] hover:bg-gray-50'
                }`}
                title={d.note || (d.isToday ? 'Today' : undefined)}
              >
                <span>{d.day}</span>
                {d.total && (
                  <span className="block text-[8px] text-[#6B7280] leading-none scale-90">{d.total}</span>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[10px] text-[#6B7280]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-[#007A3D]" />
              <span>Payroll/Cycle</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-[#FEF08A] border border-[#FDE047]" />
              <span>Current</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
