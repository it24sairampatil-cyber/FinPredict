// FinPredict.js - Enterprise Modeler & System Settings Modal

import React, { useState } from 'react';
import { Settings, X, Cpu, Sliders, RotateCcw, Zap } from 'lucide-react';
import type { ExecutionBackend } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  backend: ExecutionBackend;
  onBackendToggle: (b: ExecutionBackend) => void;
  savingsRate: number;
  onUpdateSavingsRate: (r: number) => void;
  onEphemeralWipe: () => void;
  onToast: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  backend,
  onBackendToggle,
  savingsRate,
  onUpdateSavingsRate,
  onEphemeralWipe,
  onToast
}) => {
  const [epochs, setEpochs] = useState<number | ''>(50);
  const [batchSize, setBatchSize] = useState<number | ''>(32);
  const [learningRate, setLearningRate] = useState<number | ''>(0.005);

  if (!isOpen) return null;

  const handleSave = () => {
    const finalEpochs = typeof epochs === 'number' ? epochs : 50;
    const finalLr = typeof learningRate === 'number' ? learningRate : 0.005;
    onToast(`Settings Saved: ${finalEpochs} Epochs • LR ${finalLr} • Backend ${backend.toUpperCase()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#1F2937]">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-200 text-[#1F2937]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827] tracking-tight font-sans">
                Modeler &amp; Environment Configuration
              </h3>
              <p className="text-xs text-[#6B7280]">
                Tune machine learning backpropagation hyperparameters &amp; hardware runtime
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

        {/* Settings Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          {/* Hardware Backend */}
          <div className="space-y-2">
            <label className="font-bold text-[#111827] block flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#0065FF]" />
              <span>Execution Hardware Acceleration Target</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onBackendToggle('cpu')}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  backend === 'cpu'
                    ? 'border-[#007A3D] bg-emerald-50/50 text-[#007A3D]'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="font-bold text-xs uppercase font-mono">CPU (Deterministic WASM)</div>
                <div className="text-[11px] text-gray-500 mt-1">High compatibility, zero shader compilation delay.</div>
              </button>
              <button
                onClick={() => onBackendToggle('webgl')}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  backend === 'webgl'
                    ? 'border-[#0065FF] bg-blue-50/50 text-[#0065FF]'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="font-bold text-xs uppercase font-mono flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500 fill-current" />
                  <span>WebGL (GPU Acceleration)</span>
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Hardware pipeline for parallel tensor matrix operations.</div>
              </button>
            </div>
          </div>

          {/* Hyperparameters */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
            <h5 className="font-bold text-xs text-[#111827] uppercase tracking-wider font-mono">
              Neural Hyperparameter Envelope
            </h5>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-gray-600 block">Training Epochs:</label>
                <input
                  type="number"
                  min="10"
                  max="150"
                  value={epochs}
                  onChange={(e) => setEpochs(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder="50"
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-gray-600 block">Batch Size:</label>
                <input
                  type="number"
                  min="8"
                  max="128"
                  value={batchSize}
                  onChange={(e) => setBatchSize(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder="32"
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-gray-600 block">Learning Rate:</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  max="0.05"
                  value={learningRate}
                  onChange={(e) => setLearningRate(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                  placeholder="0.005"
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Target Savings Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#111827] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#007A3D]" />
                <span>Default Target Savings Ratio</span>
              </label>
              <span className="font-mono text-[#007A3D] font-bold">{(savingsRate * 100).toFixed(0)}%</span>
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
          </div>

          {/* Storage & Privacy Controls */}
          <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-gray-800">Atomic Ephemeral Wipe</div>
              <div className="text-[11px] text-gray-500">Purges memory, IndexedDB tables, and local state.</div>
            </div>
            <button
              onClick={() => {
                onEphemeralWipe();
                onClose();
              }}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Purge Memory</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#007A3D] hover:bg-[#005A2B] text-white rounded font-semibold text-xs shadow-sm transition-colors"
          >
            Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
