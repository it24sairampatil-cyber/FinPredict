// FinPredict.js - Luxury Standardized CSV Ingestion Matrix (FR-1 & AC-1)

import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Clock, AlertCircle, Download, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { parseBankCsv } from '../services/csvParser';
import type { ParseResult } from '../services/csvParser';
import { SYNTHETIC_DATASETS } from '../services/syntheticData';
import type { SyntheticDatasetInfo } from '../services/syntheticData';

interface CsvUploaderProps {
  onDataLoaded: (result: ParseResult, rawCsv: string) => void;
  isLoading?: boolean;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({ onDataLoaded, isLoading: _isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [lastBenchmark, setLastBenchmark] = useState<{ rows: number; ms: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processCsvContent = async (csvText: string) => {
    try {
      setParseError(null);
      const res = await parseBankCsv(csvText);
      setLastBenchmark({ rows: res.rowCount, ms: res.processingTimeMs });
      onDataLoaded(res, csvText);
    } catch (err: any) {
      setParseError(err.message || 'Error parsing CSV file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) processCsvContent(text);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.type.includes('csv') || file.type.includes('text'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) processCsvContent(text);
      };
      reader.readAsText(file);
    } else {
      setParseError('Please upload a valid .csv bank statement file.');
    }
  };

  const handleLoadSynthetic = (dataset: SyntheticDatasetInfo) => {
    const csv = dataset.generateCsv();
    processCsvContent(csv);
  };

  const handleDownloadCsv = (dataset: SyntheticDatasetInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    const csv = dataset.generateCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataset.id}_statement.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Refined Drag & Drop Matrix Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl p-10 sm:p-12 text-center cursor-pointer transition-all duration-300 border ${
          isDragging
            ? 'border-emerald-400 bg-emerald-950/20 shadow-2xl shadow-emerald-500/10 scale-[1.008]'
            : 'border-white/[0.08] hover:border-emerald-500/30 bg-gradient-to-b from-[#0F172A]/50 to-[#0A0F1D]/80 hover:bg-[#111A2E]/60 luxury-card'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="max-w-lg mx-auto space-y-4">
          <div className="relative mx-auto w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-md opacity-50" />
            <Upload className={`relative w-6 h-6 ${isDragging ? 'text-emerald-400 animate-bounce' : 'text-slate-300'}`} />
          </div>

          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Ingest Bank Statement CSV
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-sm mx-auto">
              Drag &amp; drop your monthly statement or click to browse. Automatically resolves multi-column schemas, timestamps, and merchant signatures.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/[0.07] px-3.5 py-1.5 rounded-full border border-emerald-500/20 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Trust: Data never leaves browser sandbox</span>
          </div>
        </div>

        {/* AC-1 Benchmark Verification Badge */}
        {lastBenchmark && (
          <div className="mt-5 inline-flex items-center gap-2 text-xs text-cyan-300 bg-cyan-950/40 px-3.5 py-1.5 rounded-lg border border-cyan-800/40 font-mono-numbers">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>AC-1 Benchmark: {lastBenchmark.rows.toLocaleString()} rows vectorized in {lastBenchmark.ms}ms (&lt; 1,500ms criteria)</span>
          </div>
        )}

        {/* Error message */}
        {parseError && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-800/50 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{parseError}</span>
          </div>
        )}
      </div>

      {/* Synthetic Validation Suite (D-3) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-widest font-mono">
              Synthetic Validation Suite (Deliverable D-3)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Institutional Benchmark Profiles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {SYNTHETIC_DATASETS.map((dataset) => (
            <div
              key={dataset.id}
              onClick={() => handleLoadSynthetic(dataset)}
              className="group luxury-card-interactive rounded-xl p-4.5 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {dataset.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-cyan-300 border border-white/[0.06]">
                    {dataset.highlightTag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {dataset.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.05] text-xs">
                <div className="text-[11px] text-slate-400 font-mono-numbers">
                  Baseline Inflow: <span className="font-semibold text-emerald-400">${dataset.monthlyIncome.toLocaleString()}/mo</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDownloadCsv(dataset, e)}
                    className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors border border-white/[0.08]"
                    title="Download raw .csv file to test drag-and-drop ingestion"
                  >
                    <Download className="w-3 h-3" />
                  </button>

                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Load Dataset</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
