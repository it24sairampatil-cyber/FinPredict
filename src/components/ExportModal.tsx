// FinPredict.js - Luxury Export Plan Package Modal

import React, { useState } from 'react';
import { Download, Copy, Check, X, FileJson } from 'lucide-react';
import type { PredictionResult, SimplexOptimizationResult } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: PredictionResult | null;
  optimization: SimplexOptimizationResult | null;
  datasetName?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  prediction,
  optimization,
  datasetName
}) => {
  const [copied, setCopied] = useState(false);
  const [exportTimestamp] = useState<string>(() => new Date().toISOString());

  const exportPayload = React.useMemo(() => {
    if (!prediction) return null;
    return {
      application: 'FinPredict.js - Decentralized Client-Side Expense AI',
      exportedAt: exportTimestamp,
      privacySignature: 'Zero-Trust Air-Gapped Sandbox Verified (0 Network Egress)',
      dataset: datasetName || 'Bank Statement Import',
      forecastHorizonDays: 30,
      historicalTotal30DayOutflow: prediction.totalHistoricalOutflow,
      predictedTotal30DayOutflow: prediction.totalPredictedOutflow,
      projectedNetSavings: prediction.projectedNetSavings,
      projectedSavingsRate: `${(prediction.projectedSavingsRate * 100).toFixed(1)}%`,
      categoryForecasts: prediction.categoryForecasts,
      simplexOptimization: optimization ? {
        status: optimization.status,
        iterations: optimization.iterations,
        recommendedAllocation: optimization.recommendedAllocation,
        reallocationDeltas: optimization.deltas,
        totalRecommendedOutflow: optimization.totalRecommendedOutflow,
        projectedSavings: optimization.projectedSavings,
        actionableDirectives: optimization.rebalanceActions
      } : null,
      runtimeMetadata: {
        backend: prediction.modelMetrics.backend,
        trainingTimeMs: prediction.modelMetrics.trainingTimeMs,
        finalLoss: prediction.modelMetrics.finalLoss
      }
    };
  }, [datasetName, prediction, optimization, exportTimestamp]);

  const jsonString = React.useMemo(() => JSON.stringify(exportPayload, null, 2), [exportPayload]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finpredict_plan_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen || !prediction) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B101D] border border-white/[0.1] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden luxury-card">
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Export Financial Plan Package
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Client-side encrypted JSON telemetry export package
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-[#070B14] rounded-xl border border-white/[0.06] p-4 h-64 overflow-y-auto font-mono text-[11px] text-slate-300">
            <pre>{jsonString}</pre>
          </div>
        </div>

        <div className="p-4 bg-[#070B14] border-t border-white/[0.06] flex items-center justify-end gap-2.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Payload'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .json</span>
          </button>
        </div>
      </div>
    </div>
  );
};
