// FinPredict.js - Enterprise System Help & Architectural Documentation Modal

import { HelpCircle, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#1F2937]">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#E3FCEF] text-[#007A3D]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827] tracking-tight font-sans">
                FinPredict Enterprise FP&amp;A Help &amp; Documentation
              </h3>
              <p className="text-xs text-[#6B7280]">
                Client-Side Decentralized Expense AI • Vena Solutions Layout Standard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs leading-relaxed">
          {/* Quick Guide */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#111827] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#007A3D]" />
              <span>Core Application Workflow</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="font-bold text-[#007A3D] mb-1">1. Ingest Data (FR-1)</div>
                <p className="text-gray-600">
                  Upload any bank statement CSV or choose from 4 pre-compiled institutional profiles. Data is parsed and tokenized in volatile memory in under 50ms.
                </p>
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="font-bold text-[#0065FF] mb-1">2. Train Modeler (FR-3, AC-2)</div>
                <p className="text-gray-600">
                  Execute a 50-epoch gradient descent sequence inside an isolated Web Worker using TensorFlow.js with live telemetry and Huber loss convergence.
                </p>
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="font-bold text-amber-600 mb-1">3. Simplex Optimize (FR-4)</div>
                <p className="text-gray-600">
                  Solve constrained Primal Simplex linear programming tableaus to dynamically reallocate discretionary budgets toward your savings target.
                </p>
              </div>
            </div>
          </div>

          {/* Key Architectural Guarantees */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#111827] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#007A3D]" />
              <span>Architectural Guarantees &amp; Compliance</span>
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded">
                <CheckCircle2 className="w-4 h-4 text-[#007A3D] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#007A3D]">100% Air-Gapped Network Isolation (NFR-1 &amp; AC-3):</strong>
                  <span className="text-gray-700 ml-1">
                    Zero financial telemetry or transaction descriptions ever leave the browser. Outbound requests are actively monitored and blocked.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-blue-50 border border-blue-200 rounded">
                <CheckCircle2 className="w-4 h-4 text-[#0065FF] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0065FF]">60 FPS Fluidity Pipeline (NFR-2):</strong>
                  <span className="text-gray-700 ml-1">
                    All heavy computations (sliding window tensor assembly, neural backpropagation) run in a detached Web Worker, preventing UI frame drops.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-purple-50 border border-purple-200 rounded">
                <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-purple-700">Memory Ceiling &lt; 250 MB (NFR-3):</strong>
                  <span className="text-gray-700 ml-1">
                    Explicit tensor disposal and memory garbage collection ensure client-side memory safety during repeated inferences.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Legend */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-[#111827]">View &amp; Dock Directory</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 font-mono">
              <div className="p-2 border border-gray-200 rounded bg-white">
                <strong className="text-gray-900 font-sans">Status Tracker:</strong> Vena Donut, KPI formula bar, rolling calendar.
              </div>
              <div className="p-2 border border-gray-200 rounded bg-white">
                <strong className="text-gray-900 font-sans">Forecast Planner:</strong> Multi-period stacked category bars &amp; scenario builder.
              </div>
              <div className="p-2 border border-gray-200 rounded bg-white">
                <strong className="text-gray-900 font-sans">Simplex Optimizer:</strong> Interactive primal tableau envelope allocation.
              </div>
              <div className="p-2 border border-gray-200 rounded bg-white">
                <strong className="text-gray-900 font-sans">Financial Reports:</strong> Pro forma profit &amp; loss statements.
              </div>
              <div className="p-2 border border-gray-200 rounded bg-white">
                <strong className="text-gray-900 font-sans">Neural Modeler:</strong> Live 50-epoch loss curves and worker telemetry.
              </div>
              <div className="p-2 border border-gray-200 rounded bg-white">
                <strong className="text-gray-900 font-sans">Transaction Ledger:</strong> Searchable records with anomaly surge detection.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-[#E5E7EB] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#007A3D] hover:bg-[#005A2B] text-white rounded text-xs font-semibold shadow-sm transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
