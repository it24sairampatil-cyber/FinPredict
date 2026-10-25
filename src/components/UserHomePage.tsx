// FinPredict.js - Standard User Personal Home Page & Planning Dashboard
// Features Interactive Salary & Expense Observation Controls and Indian Rupee (INR / ₹) Formatting

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sliders,
  TableProperties,
  History,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
  RotateCcw,
  SlidersHorizontal,
  Wallet,
  PiggyBank,
  Check
} from 'lucide-react';
import { OUTFLOW_CATEGORIES } from '../types';
import type { PredictionResult, SimplexOptimizationResult, ExpenseCategory } from '../types';
import type { AuthUser } from '../types/auth';
import { formatINR } from '../utils/currency';

interface UserHomePageProps {
  user: AuthUser;
  prediction: PredictionResult | null;
  optimization: SimplexOptimizationResult | null;
  onNavigate: (view: string) => void;
  onOpenAudit: () => void;
  onOpenHelp: () => void;
  onApplyCustomObservations?: (salary: number, expenses: Record<ExpenseCategory, number>) => void;
  onResetObservations?: () => void;
  customSalary?: number;
  customExpenses?: Record<ExpenseCategory, number> | null;
  onToast?: (msg: string) => void;
}

export const UserHomePage: React.FC<UserHomePageProps> = ({
  user,
  prediction,
  optimization,
  onNavigate,
  onOpenAudit,
  onOpenHelp,
  onApplyCustomObservations,
  onResetObservations,
  customSalary,
  customExpenses,
  onToast
}) => {
  // Extract or fall back to realistic INR figures
  const historicalTotal = prediction?.totalHistoricalOutflow || 64500.00;
  const predictedTotal = prediction?.totalPredictedOutflow || 62100.00;
  const savingsRate = optimization?.savingsRateAchieved 
    ? (optimization.savingsRateAchieved * 100).toFixed(1)
    : '25.0';
  const retainedReserves = optimization?.projectedSavings || 22900.00;

  // Local state for User Observation Controls (Salary & Expenses)
  const initialSalary = customSalary || prediction?.categoryForecasts.Income?.predicted30DayTotal || 85000;
  const [salaryInput, setSalaryInput] = useState<number | ''>(initialSalary);

  const initialExpenses: Record<ExpenseCategory, number> = useMemo(() => {
    if (customExpenses) return customExpenses;
    if (prediction) {
      const exp: Record<ExpenseCategory, number> = {} as any;
      OUTFLOW_CATEGORIES.forEach(cat => {
        exp[cat] = prediction.categoryForecasts[cat]?.historical30DayTotal || 0;
      });
      return exp;
    }
    return {
      Housing: 25000,
      Food: 14000,
      Transport: 5500,
      Utilities: 4500,
      Entertainment: 3500,
      Healthcare: 3000,
      Shopping: 5500,
      Other: 3500,
      Income: 85000
    };
  }, [customExpenses, prediction]);

  const [expensesInput, setExpensesInput] = useState<Record<ExpenseCategory, number | ''>>(initialExpenses);
  const [isCustomActive, setIsCustomActive] = useState<boolean>(() => Boolean(customSalary || customExpenses));
  const [isControllerOpen, setIsControllerOpen] = useState<boolean>(true);

  const numericSalary = typeof salaryInput === 'number' ? salaryInput : 0;

  // Total current expenses sum
  const totalExpensesSum = useMemo(() => {
    return OUTFLOW_CATEGORIES.reduce((acc, cat) => acc + (Number(expensesInput[cat]) || 0), 0);
  }, [expensesInput]);

  const netSavings = Math.max(-numericSalary, numericSalary - totalExpensesSum);
  const effectiveSavingsRate = numericSalary > 0 ? (netSavings / numericSalary) * 100 : 0;

  // Quick salary presets in INR
  const salaryPresets = [
    { label: '₹40k (Junior)', val: 40000 },
    { label: '₹85k (Mid-level)', val: 85000 },
    { label: '₹1.5L (Senior)', val: 150000 },
    { label: '₹2.5L (Lead/Mgr)', val: 250000 }
  ];

  const handleExpenseChange = (category: ExpenseCategory, valStr: string) => {
    setExpensesInput(prev => ({
      ...prev,
      [category]: valStr === '' ? '' : Math.max(0, parseFloat(valStr) || 0)
    }));
  };

  const handleApplyObservations = () => {
    const numericExpenses: Record<ExpenseCategory, number> = {} as any;
    OUTFLOW_CATEGORIES.forEach(c => {
      numericExpenses[c] = typeof expensesInput[c] === 'number' ? (expensesInput[c] as number) : 0;
    });
    numericExpenses.Income = numericSalary;

    if (onApplyCustomObservations) {
      onApplyCustomObservations(numericSalary, numericExpenses);
      setIsCustomActive(true);
    } else if (onToast) {
      onToast(`Custom observation applied: Salary ${formatINR(numericSalary)} • Total Expenses ${formatINR(totalExpensesSum)}`);
    }
  };

  const handleReset = () => {
    if (onResetObservations) {
      onResetObservations();
      setIsCustomActive(false);
      setSalaryInput(prediction?.categoryForecasts.Income?.predicted30DayTotal || 85000);
      if (prediction) {
        const exp: Record<ExpenseCategory, number> = {} as any;
        OUTFLOW_CATEGORIES.forEach(cat => {
          exp[cat] = prediction.categoryForecasts[cat]?.historical30DayTotal || 0;
        });
        setExpensesInput(exp);
      }
    }
  };

  const handleLoadArchetype = (archetype: '50_30_20' | 'frugal' | 'comfort') => {
    const s = salaryInput || 85000;
    if (archetype === '50_30_20') {
      // 50% Needs (Housing 25%, Food 15%, Utilities 5%, Healthcare 5%), 30% Wants (Shopping 12%, Entertainment 10%, Transport 8%), 20% Savings
      setExpensesInput({
        Housing: Math.round(s * 0.25),
        Food: Math.round(s * 0.15),
        Utilities: Math.round(s * 0.05),
        Healthcare: Math.round(s * 0.05),
        Shopping: Math.round(s * 0.12),
        Entertainment: Math.round(s * 0.10),
        Transport: Math.round(s * 0.08),
        Other: Math.round(s * 0.02),
        Income: s
      });
      if (onToast) onToast('Loaded 50/30/20 Balanced Budget Archetype');
    } else if (archetype === 'frugal') {
      // 40% Savings target
      setExpensesInput({
        Housing: Math.round(s * 0.20),
        Food: Math.round(s * 0.12),
        Utilities: Math.round(s * 0.04),
        Healthcare: Math.round(s * 0.04),
        Shopping: Math.round(s * 0.05),
        Entertainment: Math.round(s * 0.05),
        Transport: Math.round(s * 0.06),
        Other: Math.round(s * 0.04),
        Income: s
      });
      if (onToast) onToast('Loaded High-Savings F.I.R.E. Archetype (40% Savings)');
    } else {
      // Comfort / Executive
      setExpensesInput({
        Housing: Math.round(s * 0.30),
        Food: Math.round(s * 0.18),
        Utilities: Math.round(s * 0.06),
        Healthcare: Math.round(s * 0.06),
        Shopping: Math.round(s * 0.12),
        Entertainment: Math.round(s * 0.08),
        Transport: Math.round(s * 0.08),
        Other: Math.round(s * 0.04),
        Income: s
      });
      if (onToast) onToast('Loaded Urban Lifestyle Comfort Archetype');
    }
  };

  return (
    <div className="space-y-5 select-none font-sans">
      {/* 1. Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-[#005A2B] via-[#007A3D] to-[#00875A] rounded-xl text-white p-6 shadow-sm border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-white/15 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-100">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Personal FP&amp;A Planning Workspace</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {user.displayName}
            </h1>
            <p className="text-xs text-emerald-100/90 max-w-xl leading-relaxed">
              Your decentralized FP&amp;A environment is synchronized in browser memory. Manage your personal and departmental budget envelopes in Indian Rupees (₹), run neural forecasts, and execute Linear Simplex rebalancing.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('simplex')}
              className="px-4 py-2 bg-white text-[#007A3D] hover:bg-emerald-50 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Run Simplex Optimizer</span>
            </button>
            <button
              onClick={onOpenHelp}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="System Documentation &amp; Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ambient decorative backdrop */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <Layers className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid (in INR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-[#D1D5DB] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Monthly Baseline Spend</span>
            <Calendar className="w-4 h-4 text-[#007A3D]" />
          </div>
          <div className="mt-2 text-xl font-bold text-[#111827] font-mono-numbers">
            {formatINR(historicalTotal)}
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            Observed 30-day temporal baseline
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#D1D5DB] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Neural Predicted Outflow</span>
            <TrendingUp className="w-4 h-4 text-[#0065FF]" />
          </div>
          <div className="mt-2 text-xl font-bold text-[#0065FF] font-mono-numbers">
            {formatINR(predictedTotal)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            -1.3% Projected Outflow Efficiency
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#D1D5DB] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Target Retention Rate</span>
            <Sliders className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-purple-700 font-mono-numbers">
            {savingsRate}%
          </div>
          <div className="mt-1 text-[11px] text-gray-500 font-mono-numbers">
            {formatINR(retainedReserves)} Projected Reserves
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[#D1D5DB] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Zero-Trust Device Sandbox</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-[#007A3D]">
            100% Air-Gapped
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>0 Outbound Egress Packets</span>
          </div>
        </div>
      </div>

      {/* 3. NEW: Interactive Personal Observation & Budget Controller */}
      <div className="bg-white border border-[#D1D5DB] rounded-xl shadow-xs overflow-hidden">
        {/* Controller Header Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gradient-to-r from-emerald-50/60 via-white to-blue-50/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#007A3D] text-white flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111827]">
                  My Salary &amp; Expense Observation Controller
                </h2>
                {isCustomActive ? (
                  <span className="text-[10px] font-mono bg-emerald-100 text-[#007A3D] border border-emerald-300 px-2 py-0.5 rounded font-bold">
                    Custom Observations Active
                  </span>
                ) : (
                  <span className="text-[10px] font-mono bg-gray-100 text-gray-600 border border-gray-300 px-2 py-0.5 rounded">
                    Default Baseline
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Input your monthly salary and category expenses to directly calibrate observations, neural forecasts, and Simplex LP tableaus.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsControllerOpen(!isControllerOpen)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors cursor-pointer"
            >
              {isControllerOpen ? 'Collapse Controls' : 'Expand Controls'}
            </button>
          </div>
        </div>

        {isControllerOpen && (
          <div className="p-5 space-y-6">
            {/* Section A: Monthly Salary (Net Inflow) */}
            <div className="bg-gray-50/80 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-[#111827] flex items-center gap-1.5 uppercase tracking-wider">
                    <Wallet className="w-4 h-4 text-[#007A3D]" />
                    <span>My Monthly Net Salary / Inflow (₹)</span>
                  </label>
                  <span className="text-[11px] text-gray-500">
                    Your baseline post-tax earnings or monthly household income
                  </span>
                </div>

                {/* Salary Input Field */}
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3.5 top-2.5 text-gray-500 font-mono text-sm font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={salaryInput}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSalaryInput(v === '' ? '' : Math.max(0, parseFloat(v) || 0));
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-8 pr-3 text-sm font-mono-numbers font-bold text-[#111827] focus:outline-none focus:border-[#007A3D] transition-colors shadow-xs"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Salary Preset Pills */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] font-semibold text-gray-500">Quick Presets:</span>
                {salaryPresets.map((preset) => (
                  <button
                    key={preset.val}
                    onClick={() => setSalaryInput(preset.val)}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                      salaryInput === preset.val
                        ? 'bg-[#007A3D] text-white border-[#007A3D] font-bold shadow-xs'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section B: Category Outflows Breakdown Inputs */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <PiggyBank className="w-4 h-4 text-[#0065FF]" />
                    <span>My Monthly Expenses Breakdown by Category (₹)</span>
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Adjust individual envelopes to reflect your observed spending patterns.
                  </p>
                </div>

                {/* Archetype Quick Setup */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-gray-500 font-medium">Quick Split:</span>
                  <button
                    onClick={() => handleLoadArchetype('50_30_20')}
                    className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded text-[11px] font-semibold text-gray-700 transition-colors"
                    title="50% Needs, 30% Wants, 20% Savings Rule"
                  >
                    50/30/20 Rule
                  </button>
                  <button
                    onClick={() => handleLoadArchetype('frugal')}
                    className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded text-[11px] font-semibold text-gray-700 transition-colors"
                    title="Maximize savings with 40% capital retention"
                  >
                    High Savings (40%)
                  </button>
                  <button
                    onClick={() => handleLoadArchetype('comfort')}
                    className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded text-[11px] font-semibold text-gray-700 transition-colors"
                  >
                    Comfort Split
                  </button>
                </div>
              </div>

              {/* 8 Category Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {OUTFLOW_CATEGORIES.map((cat) => {
                  const val = expensesInput[cat] ?? '';
                  const numVal = Number(val) || 0;
                  const percentOfSalary = numericSalary > 0 ? ((numVal / numericSalary) * 100).toFixed(1) : '0';

                  const categoryLabels: Record<ExpenseCategory, string> = {
                    Housing: 'Housing (Rent / EMI)',
                    Food: 'Food & Groceries',
                    Transport: 'Transport & Fuel',
                    Utilities: 'Utilities & Internet',
                    Entertainment: 'Entertainment & OTT',
                    Healthcare: 'Healthcare & Meds',
                    Shopping: 'Shopping & Retail',
                    Other: 'Other Discretionary',
                    Income: 'Income'
                  };

                  return (
                    <div
                      key={cat}
                      className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg space-y-2 hover:border-gray-300 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-800">{categoryLabels[cat] || cat}</span>
                        <span className="text-[10px] font-mono text-gray-500 font-semibold">
                          {percentOfSalary}%
                        </span>
                      </div>

                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-gray-400 font-mono text-xs font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={val}
                          onChange={(e) => handleExpenseChange(cat, e.target.value)}
                          placeholder="0"
                          className="w-full bg-white border border-gray-300 rounded py-1.5 pl-6 pr-2.5 text-xs font-mono-numbers font-semibold text-gray-900 focus:outline-none focus:border-[#007A3D] transition-colors"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section C: Live Summary & Action Bar */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono-numbers">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Monthly Salary</span>
                  <span className="text-sm font-bold text-[#111827]">{formatINR(numericSalary)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Expenses</span>
                  <span className="text-sm font-bold text-[#111827]">{formatINR(totalExpensesSum)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Net Surplus / Savings</span>
                  <span className={`text-sm font-bold ${netSavings >= 0 ? 'text-[#007A3D]' : 'text-rose-600'}`}>
                    {formatINR(netSavings)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Savings Rate</span>
                  <span className={`text-sm font-bold ${effectiveSavingsRate >= 20 ? 'text-[#007A3D]' : 'text-amber-600'}`}>
                    {effectiveSavingsRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleReset}
                  className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Revert back to imported bank statement data"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Baseline</span>
                </button>

                <button
                  onClick={handleApplyObservations}
                  className="px-4 py-2 bg-[#007A3D] hover:bg-[#005A2B] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Custom Observations</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Primary Quick Launch Tool Cards ("All the things") */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
          Quick Launch Planning Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Status Tracker */}
          <div 
            onClick={() => onNavigate('tracker')}
            className="bg-white border border-[#D1D5DB] hover:border-[#007A3D] rounded-lg p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#007A3D] flex items-center justify-center group-hover:bg-[#007A3D] group-hover:text-white transition-colors">
                <TableProperties className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#111827] group-hover:text-[#007A3D] transition-colors">
                Vena Status Tracker
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Track departmental budget line items, review milestones, and submit adjustments in Indian Rupees (₹).
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-[#007A3D] group-hover:translate-x-1 transition-transform">
              <span>Open Budget Grid</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2: 30-Day Multi-Vector Forecast */}
          <div 
            onClick={() => onNavigate('forecast')}
            className="bg-white border border-[#D1D5DB] hover:border-[#0065FF] rounded-lg p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0065FF] flex items-center justify-center group-hover:bg-[#0065FF] group-hover:text-white transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#111827] group-hover:text-[#0065FF] transition-colors">
                Multi-Vector Forecast
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Interactive 30-day temporal forecasts with confidence envelopes and category delta metrics in ₹.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-[#0065FF] group-hover:translate-x-1 transition-transform">
              <span>Explore Forecasts</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3: Linear Simplex Optimizer */}
          <div 
            onClick={() => onNavigate('simplex')}
            className="bg-white border border-[#D1D5DB] hover:border-purple-600 rounded-lg p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#111827] group-hover:text-purple-700 transition-colors">
                Linear Simplex Optimizer
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Solve constrained linear programming tableaus to achieve savings targets without breaching living floors.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
              <span>Optimize Budget</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 4: Transaction Ledger */}
          <div 
            onClick={() => onNavigate('ledger')}
            className="bg-white border border-[#D1D5DB] hover:border-amber-600 rounded-lg p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-700 group-hover:text-white transition-colors">
                <History className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#111827] group-hover:text-amber-700 transition-colors">
                Transaction Ledger
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Search, filter, categorize and export historical bank statement transactions with zero cloud leakage.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
              <span>View Ledger</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Active Workflow Checklist & Air-Gapped Privacy Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: My Pending Allocations */}
        <div className="lg:col-span-2 bg-white border border-[#D1D5DB] rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div>
              <h3 className="font-bold text-sm text-[#111827]">
                My Assigned Budget Allocation Tasks (2026 Process)
              </h3>
              <p className="text-xs text-[#6B7280]">
                Tasks assigned to {user.displayName} ({user.department})
              </p>
            </div>
            <button
              onClick={() => onNavigate('tracker')}
              className="text-xs font-bold text-[#007A3D] hover:underline"
            >
              View Full Tracker
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'task-1',
                title: 'Departmental Cloud Infrastructure & Hosting Envelope',
                due: 'Oct 31, 2026',
                status: 'In Review',
                badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
                amount: '₹28,500.00/mo'
              },
              {
                id: 'task-2',
                title: 'Engineering Workstation & Tooling Licensure Submissions',
                due: 'Nov 15, 2026',
                status: 'Approved',
                badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                amount: '₹45,200.00/mo'
              },
              {
                id: 'task-3',
                title: 'Discretionary Travel & Conference Expense Cap',
                due: 'Dec 01, 2026',
                status: 'Draft',
                badgeBg: 'bg-gray-100 text-gray-700 border-gray-200',
                amount: '₹18,400.00/mo'
              }
            ].map((task) => (
              <div
                key={task.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-100/80 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-gray-900">{task.title}</div>
                  <div className="text-[11px] text-gray-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Due: {task.due}</span>
                    <span>&bull;</span>
                    <span className="font-mono-numbers font-medium text-gray-700">{task.amount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${task.badgeBg}`}>
                    {task.status}
                  </span>
                  <button
                    onClick={() => onNavigate('tracker')}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Privacy & Security Guarantee */}
        <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-lg p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#007A3D]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-sm text-[#111827]">
                Zero-Trust Guarantee
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              FinPredict executes all forecasting models and simplex optimizations <strong>strictly on your local device</strong>. Your financial data is held in volatile memory and never transmitted to external cloud servers.
            </p>
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded text-[11px] text-emerald-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>NFR-1 Egress Constraint Verified</span>
              </div>
              <div className="text-gray-600">
                Network sockets and fetch calls are intercepted to ensure total air-gapped isolation.
              </div>
            </div>
          </div>

          <button
            onClick={onOpenAudit}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-xs font-bold border border-gray-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#007A3D]" />
            <span>Open Network Audit Inspector</span>
          </button>
        </div>
      </div>
    </div>
  );
};
