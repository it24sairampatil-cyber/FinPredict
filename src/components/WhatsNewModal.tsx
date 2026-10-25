// FinPredict.js - What's New in FinPredict FP&A 2.0 Modal

import { Sparkles, X, TrendingUp, Cpu, Sliders, ShieldCheck } from 'lucide-react';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#1F2937]">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#007A3D] text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111827] tracking-tight font-sans">
                  What's New in FinPredict FP&amp;A 2.0
                </h3>
                <span className="text-[10px] font-mono bg-[#007A3D] text-white px-2 py-0.5 rounded font-bold">
                  v2.0.4 RELEASE
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Institutional Financial Planning &amp; Analysis Architecture
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

        {/* Feature List */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-3">
              <div className="p-2 rounded bg-emerald-100 text-[#007A3D] shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-[#111827] text-sm">Vena Solutions Enterprise FP&amp;A Synthesis</h5>
                <p className="text-gray-600 mt-1 leading-relaxed">
                  Faithful replication of enterprise FP&amp;A software layouts: multi-column status tracker grid, 3-tier donut capital reserve visualizer, formula equation KPI banner, and monthly operating cycles.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-3">
              <div className="p-2 rounded bg-blue-100 text-[#0065FF] shrink-0 mt-0.5">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-[#111827] text-sm">50-Epoch Neural Worker Engine (AC-2)</h5>
                <p className="text-gray-600 mt-1 leading-relaxed">
                  Real-time gradient descent in isolated Web Worker. Streams backpropagation loss curves, volatile heap allocations, and tensor counts without blocking the 60 FPS UI rendering pipeline.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-3">
              <div className="p-2 rounded bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-[#111827] text-sm">Client-Side Linear Simplex Tableau Optimizer (FR-4)</h5>
                <p className="text-gray-600 mt-1 leading-relaxed">
                  Primal Simplex solver optimizing envelope budgets against capital accumulation targets. Automatically prioritizes luxury spending reductions while guarding essential living floors.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-3">
              <div className="p-2 rounded bg-purple-100 text-purple-700 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-[#111827] text-sm">Active Zero-Trust Network Isolation Probe (AC-3)</h5>
                <p className="text-gray-600 mt-1 leading-relaxed">
                  Real-time packet monitor intercepting window.fetch, XMLHttpRequest, and WebSockets. Verifies 100% offline air-gapped operation with 0 bytes egress.
                </p>
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
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
