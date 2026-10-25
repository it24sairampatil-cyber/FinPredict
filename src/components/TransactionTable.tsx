// FinPredict.js - Transaction Ingestion Ledger (FR-1)

import React, { useState, useMemo } from 'react';
import { Search, Filter, AlertTriangle, ChevronLeft, ChevronRight, Download, ArrowUpDown } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../types';
import type { Transaction, ExpenseCategory } from '../types';
import { formatINR } from '../utils/currency';

interface TransactionTableProps {
  transactions: Transaction[];
}

const CATEGORY_TAG_STYLES: Record<ExpenseCategory, string> = {
  Housing: 'bg-blue-50 text-blue-700 border-blue-200',
  Food: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Transport: 'bg-amber-50 text-amber-700 border-amber-200',
  Utilities: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Entertainment: 'bg-purple-50 text-purple-700 border-purple-200',
  Healthcare: 'bg-pink-50 text-pink-700 border-pink-200',
  Shopping: 'bg-orange-50 text-orange-700 border-orange-200',
  Income: 'bg-green-50 text-green-700 border-green-200',
  Other: 'bg-gray-100 text-gray-700 border-gray-200'
};

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyAnomalies, setOnlyAnomalies] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<'date' | 'description' | 'amount'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false); // default most recent first
  const pageSize = 15;

  const filteredTransactions = useMemo(() => {
    const list = transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || tx.category === selectedCategory;
      const matchesAnomaly = onlyAnomalies ? tx.isAnomaly : true;
      return matchesSearch && matchesCategory && matchesAnomaly;
    });

    list.sort((a, b) => {
      let comp = 0;
      if (sortField === 'date') comp = a.date.localeCompare(b.date);
      else if (sortField === 'description') comp = a.description.localeCompare(b.description);
      else if (sortField === 'amount') comp = Math.abs(a.amount) - Math.abs(b.amount);
      return sortAsc ? comp : -comp;
    });

    return list;
  }, [transactions, searchTerm, selectedCategory, onlyAnomalies, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const handleExportCsv = () => {
    const header = ['Date', 'Description', 'Category', 'Amount', 'Balance', 'IsAnomaly'];
    const rows = filteredTransactions.map(tx => [
      tx.date,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.category,
      tx.amount,
      tx.balance ?? '',
      tx.isAnomaly ? 'TRUE' : 'FALSE'
    ]);
    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ledger_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-6 sm:p-7 space-y-4 shadow-sm select-none">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#111827] tracking-tight font-sans">
              Transaction Ingestion Ledger
            </h3>
            <span className="text-[11px] font-mono text-[#4B5563] bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
              {filteredTransactions.length.toLocaleString()} verified entries
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Auto-tokenized bank records with category classifier &amp; anomaly scoring
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter merchant..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-gray-50 border border-gray-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#007A3D] w-48 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-[#374151] text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => { setOnlyAnomalies(!onlyAnomalies); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              onlyAnomalies
                ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm'
                : 'bg-gray-50 border-gray-300 text-gray-600 hover:text-gray-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Only Anomalies</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
            title="Export filtered records as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-xs font-mono-numbers">
          <thead>
            <tr className="border-b border-gray-200 text-[#4B5563] font-sans text-[11px] font-bold uppercase bg-gray-50">
              <th
                onClick={() => toggleSort('date')}
                className="py-3 px-4 cursor-pointer hover:text-gray-900"
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('description')}
                className="py-3 px-4 cursor-pointer hover:text-gray-900"
              >
                <div className="flex items-center gap-1">
                  <span>Merchant / Narration</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </th>
              <th className="py-3 px-4">Category</th>
              <th
                onClick={() => toggleSort('amount')}
                className="py-3 px-4 text-right cursor-pointer hover:text-gray-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Amount</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Running Balance</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedRows.length > 0 ? (
              paginatedRows.map((tx) => {
                const isExpense = tx.amount > 0 && tx.category !== 'Income';
                return (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-4 text-gray-600 font-mono text-[11px] whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-2.5 px-4 text-[#111827] font-medium max-w-[260px] truncate" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border ${CATEGORY_TAG_STYLES[tx.category] || CATEGORY_TAG_STYLES.Other}`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className={`py-2.5 px-4 text-right font-bold whitespace-nowrap ${
                      isExpense ? 'text-[#111827]' : 'text-[#007A3D]'
                    }`}>
                      {isExpense ? `-${formatINR(Math.abs(tx.amount))}` : `+${formatINR(Math.abs(tx.amount))}`}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-600 whitespace-nowrap">
                      {tx.balance !== undefined ? formatINR(tx.balance) : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      {tx.isAnomaly ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                          <span>Surge Spike</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px] font-sans">Nominal</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500 text-xs font-sans">
                  No transactions match the selected filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-mono-numbers pt-1">
        <span>
          Showing {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length} entries
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-gray-300 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2.5 text-xs font-sans font-semibold text-gray-800">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-gray-300 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
