// FinPredict.js - Vena Status Tracker Budget Grid (Image 1 Bottom Table)
// Features per-column filter inputs, status pills (Approved, WIP, Not Reached, Anomaly), and action triggers

import React, { useState, useMemo } from 'react';
import { FileText, MoreVertical, ArrowUpDown, Check, Eye } from 'lucide-react';
import { OUTFLOW_CATEGORIES } from '../types';
import type { PredictionResult, SimplexOptimizationResult, ExpenseCategory } from '../types';
import type { AuthUser } from '../types/auth';
import { formatINR } from '../utils/currency';

interface VenaStatusGridProps {
  prediction: PredictionResult | null;
  optimization: SimplexOptimizationResult | null;
  onSelectCategory?: (category: ExpenseCategory) => void;
  onToast?: (msg: string) => void;
  currentUser?: AuthUser | null;
}

export const VenaStatusGrid: React.FC<VenaStatusGridProps> = ({
  prediction,
  optimization,
  onSelectCategory,
  onToast,
  currentUser
}) => {
  const [taskFilter, setTaskFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const [currentReviewFilter, setCurrentReviewFilter] = useState('');
  const [reviewOwnerFilter, setReviewOwnerFilter] = useState('');
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [activeMenuRow, setActiveMenuRow] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<'taskName' | 'status' | 'predictedSpend' | 'recommendedSpend' | 'dueDate'>('taskName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Custom user override of task status
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});

  const categories = OUTFLOW_CATEGORIES;

  // Build rows mapping categories to FP&A task format
  const rows = useMemo(() => {
    return categories.map((cat, idx) => {
      const pred = prediction?.categoryForecasts[cat]?.predicted30DayTotal || 0;
      const hist = prediction?.categoryForecasts[cat]?.historical30DayTotal || 0;
      const opt = optimization?.recommendedAllocation[cat] || pred;
      const isAnomaly = prediction?.categoryForecasts[cat]?.isAnomaly || false;

      // Status pill determination with user override support
      let status: 'Approved' | 'Work In Progress' | 'Not Reached' | 'Anomaly Surge';
      if (statusOverrides[cat]) {
        status = statusOverrides[cat] as any;
      } else if (isAnomaly) {
        status = 'Anomaly Surge';
      } else if (optimization && Math.abs(opt - pred) > 5) {
        status = 'Work In Progress';
      } else if (pred > 0) {
        status = 'Approved';
      } else {
        status = 'Not Reached';
      }

      // Review status
      let reviewStatus: 'Approved' | 'Not Reached' | 'Pending Review';
      if (status === 'Approved') reviewStatus = 'Approved';
      else if (status === 'Anomaly Surge') reviewStatus = 'Pending Review';
      else reviewStatus = 'Not Reached';

      const username = currentUser?.displayName || currentUser?.username || 'analyst';
      const owners = [
        `${username}`,
        `${username} (Lead)`,
        `${username} + FP&A`,
        `Treasury (${username})`,
        `${username} (Reviewer)`,
        `FP&A Operations (${username})`
      ];

      return {
        id: `task_${cat}`,
        category: cat,
        taskName: `${cat} Operating Envelope Budget`,
        owner: owners[idx % owners.length],
        status,
        reviewStatus,
        currentReview: `${cat} Expenditure Optimization Review`,
        reviewOwner: owners[(idx + 2) % owners.length],
        dueDate: `10/${String(20 + (idx * 2)).padStart(2, '0')}/2026 5:00 PM`,
        predictedSpend: pred,
        recommendedSpend: opt,
        historicalSpend: hist,
        isAnomaly
      };
    });
  }, [categories, prediction, optimization, statusOverrides, currentUser]);

  const handleToggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleStatus = (cat: ExpenseCategory, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = currentStatus === 'Approved' ? 'Work In Progress' : 'Approved';
    setStatusOverrides(prev => ({ ...prev, [cat]: nextStatus }));
    if (onToast) onToast(`${cat} status updated to: ${nextStatus}`);
  };

  const filteredRows = useMemo(() => {
    const list = rows.filter(r => {
      const matchTask = r.taskName.toLowerCase().includes(taskFilter.toLowerCase()) || r.category.toLowerCase().includes(taskFilter.toLowerCase());
      const matchOwner = r.owner.toLowerCase().includes(ownerFilter.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchReview = reviewFilter === 'ALL' || r.reviewStatus === reviewFilter;
      const matchCurrentReview = !currentReviewFilter || r.currentReview.toLowerCase().includes(currentReviewFilter.toLowerCase());
      const matchReviewOwner = !reviewOwnerFilter || r.reviewOwner.toLowerCase().includes(reviewOwnerFilter.toLowerCase());
      const matchDueDate = !dueDateFilter || r.dueDate.toLowerCase().includes(dueDateFilter.toLowerCase());

      return matchTask && matchOwner && matchStatus && matchReview && matchCurrentReview && matchReviewOwner && matchDueDate;
    });

    list.sort((a, b) => {
      let comp = 0;
      if (sortField === 'taskName') comp = a.taskName.localeCompare(b.taskName);
      else if (sortField === 'status') comp = a.status.localeCompare(b.status);
      else if (sortField === 'dueDate') comp = a.dueDate.localeCompare(b.dueDate);
      else if (sortField === 'predictedSpend') comp = a.predictedSpend - b.predictedSpend;
      else if (sortField === 'recommendedSpend') comp = a.recommendedSpend - b.recommendedSpend;
      return sortDirection === 'asc' ? comp : -comp;
    });

    return list;
  }, [rows, taskFilter, ownerFilter, statusFilter, reviewFilter, currentReviewFilter, reviewOwnerFilter, dueDateFilter, sortField, sortDirection]);

  return (
    <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-md shadow-sm overflow-hidden text-xs select-none">
      {/* Table Title Bar */}
      <div className="p-3 px-4 border-b border-[#E5E7EB] flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#111827] text-sm font-sans">
            Budget Envelopes &amp; Category Workflow Status
          </span>
          <span className="text-[11px] font-mono text-[#6B7280] bg-white px-2 py-0.5 rounded border border-[#D1D5DB]">
            {filteredRows.length} active process envelopes
          </span>
        </div>
        <div className="text-[11px] text-[#6B7280] font-sans">
          Click any row to open forecast details • Click status pill to toggle approval
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans">
          <thead>
            {/* Header Titles */}
            <tr className="border-b border-[#D1D5DB] text-[#4B5563] text-[11px] font-bold bg-[#F9FAFB]">
              <th className="py-2.5 px-3 w-8 text-center">
                <FileText className="w-3.5 h-3.5 text-gray-400 inline" />
              </th>
              <th
                onClick={() => handleToggleSort('taskName')}
                className="py-2.5 px-3 min-w-[200px] cursor-pointer hover:text-[#111827]"
              >
                <div className="flex items-center gap-1">
                  <span>Task Name</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 min-w-[140px]">Owner(s)</th>
              <th
                onClick={() => handleToggleSort('status')}
                className="py-2.5 px-3 min-w-[130px] text-center cursor-pointer hover:text-[#111827]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 min-w-[120px] text-center">Review Status</th>
              <th className="py-2.5 px-3 min-w-[190px]">Current Review</th>
              <th className="py-2.5 px-3 min-w-[130px]">Review Owner(s)</th>
              <th
                onClick={() => handleToggleSort('dueDate')}
                className="py-2.5 px-3 min-w-[150px] cursor-pointer hover:text-[#111827]"
              >
                <div className="flex items-center gap-1">
                  <span>Due Date</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </th>
              <th
                onClick={() => handleToggleSort('predictedSpend')}
                className="py-2.5 px-3 text-right min-w-[110px] cursor-pointer hover:text-[#111827]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Predicted (30D)</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </th>
              <th
                onClick={() => handleToggleSort('recommendedSpend')}
                className="py-2.5 px-3 text-right min-w-[110px] cursor-pointer hover:text-[#111827]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Simplex Target</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 w-8 text-center"></th>
            </tr>

            {/* Sub-header with column filter inputs (Image 1 replica) */}
            <tr className="border-b border-[#E5E7EB] bg-[#FFFFFF]">
              <th className="py-1 px-3 text-center text-gray-400 text-[10px]">⚙</th>
              {/* Task Filter */}
              <th className="py-1 px-3">
                <input
                  type="text"
                  placeholder="Filter"
                  value={taskFilter}
                  onChange={(e) => setTaskFilter(e.target.value)}
                  className="table-filter-input"
                />
              </th>
              {/* Owner Filter */}
              <th className="py-1 px-3">
                <input
                  type="text"
                  placeholder="Filter"
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  className="table-filter-input"
                />
              </th>
              {/* Status Select */}
              <th className="py-1 px-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="table-filter-input cursor-pointer"
                >
                  <option value="ALL">Show All</option>
                  <option value="Approved">Approved</option>
                  <option value="Work In Progress">Work In Progress</option>
                  <option value="Anomaly Surge">Anomaly Surge</option>
                  <option value="Not Reached">Not Reached</option>
                </select>
              </th>
              {/* Review Status Select */}
              <th className="py-1 px-3">
                <select
                  value={reviewFilter}
                  onChange={(e) => setReviewFilter(e.target.value)}
                  className="table-filter-input cursor-pointer"
                >
                  <option value="ALL">Show All</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Not Reached">Not Reached</option>
                </select>
              </th>
              {/* Current Review Filter */}
              <th className="py-1 px-3">
                <input
                  type="text"
                  placeholder="Filter"
                  value={currentReviewFilter}
                  onChange={(e) => setCurrentReviewFilter(e.target.value)}
                  className="table-filter-input"
                />
              </th>
              {/* Review Owner Filter */}
              <th className="py-1 px-3">
                <input
                  type="text"
                  placeholder="Filter"
                  value={reviewOwnerFilter}
                  onChange={(e) => setReviewOwnerFilter(e.target.value)}
                  className="table-filter-input"
                />
              </th>
              {/* Due Date Range */}
              <th className="py-1 px-3">
                <input
                  type="text"
                  placeholder="Start -> End"
                  value={dueDateFilter}
                  onChange={(e) => setDueDateFilter(e.target.value)}
                  className="table-filter-input"
                />
              </th>
              <th className="py-1 px-3" colSpan={3}></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5E7EB] text-[#1F2937] text-xs">
            {filteredRows.map((r) => (
              <tr
                key={r.id}
                onClick={() => onSelectCategory && onSelectCategory(r.category)}
                className="hover:bg-blue-50/40 cursor-pointer transition-colors relative"
              >
                <td className="py-2 px-3 text-center text-[#6B7280]">
                  <FileText className="w-4 h-4 text-[#4B5563] inline" />
                </td>
                <td className="py-2.5 px-3 font-semibold text-[#111827]">
                  {r.taskName}
                </td>
                <td className="py-2.5 px-3 text-[#4B5563]">
                  {r.owner}
                </td>

                {/* Interactive Status Pill matching Image 1 */}
                <td className="py-2.5 px-3 text-center">
                  <button
                    onClick={(e) => handleToggleStatus(r.category, r.status, e)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    title="Click to toggle Approval Status"
                  >
                    {r.status === 'Approved' && (
                      <span className="status-pill-approved">Approved</span>
                    )}
                    {r.status === 'Work In Progress' && (
                      <span className="status-pill-wip">Work In Progress</span>
                    )}
                    {r.status === 'Not Reached' && (
                      <span className="status-pill-not-reached">Not Reached</span>
                    )}
                    {r.status === 'Anomaly Surge' && (
                      <span className="status-pill-anomaly">Anomaly Surge</span>
                    )}
                  </button>
                </td>

                {/* Review Status Pill matching Image 1 */}
                <td className="py-2.5 px-3 text-center">
                  {r.reviewStatus === 'Approved' && (
                    <span className="status-pill-approved">Approved</span>
                  )}
                  {r.reviewStatus === 'Not Reached' && (
                    <span className="status-pill-not-reached">Not Reached</span>
                  )}
                  {r.reviewStatus === 'Pending Review' && (
                    <span className="status-pill-anomaly">Pending Review</span>
                  )}
                </td>

                <td className="py-2.5 px-3 text-[#4B5563] truncate max-w-[200px]" title={r.currentReview}>
                  {r.currentReview}
                </td>
                <td className="py-2.5 px-3 text-[#4B5563]">
                  {r.reviewOwner}
                </td>
                <td className="py-2.5 px-3 text-[#6B7280] font-mono-numbers text-[11px]">
                  {r.dueDate}
                </td>

                {/* Predicted & Simplex Outflow Values */}
                <td className="py-2.5 px-3 text-right font-mono-numbers font-semibold text-[#111827]">
                  {formatINR(r.predictedSpend)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono-numbers font-semibold text-[#007A3D]">
                  {formatINR(r.recommendedSpend)}
                </td>

                {/* More Action menu trigger */}
                <td
                  className="py-2 px-3 text-center text-[#9CA3AF] hover:text-[#111827] relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuRow(activeMenuRow === r.id ? null : r.id);
                  }}
                >
                  <MoreVertical className="w-3.5 h-3.5 inline cursor-pointer" />

                  {/* Context Dropdown Menu */}
                  {activeMenuRow === r.id && (
                    <div className="absolute right-2 top-8 z-50 bg-white border border-gray-200 shadow-xl rounded-lg py-1.5 w-48 text-left text-xs font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuRow(null);
                          if (onSelectCategory) onSelectCategory(r.category);
                        }}
                        className="w-full px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#0065FF]" />
                        <span>View Forecast Details</span>
                      </button>
                      <button
                        onClick={(e) => {
                          handleToggleStatus(r.category, r.status, e);
                          setActiveMenuRow(null);
                        }}
                        className="w-full px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                      >
                        <Check className="w-3.5 h-3.5 text-[#007A3D]" />
                        <span>Toggle Approval Status</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
