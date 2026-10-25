// FinPredict.js - Luxury Telemetry & Diagnostics Ribbon (NFR-2 & NFR-3)

import React, { useState, useEffect, useRef } from 'react';
import { Activity, HardDrive, Cpu, Zap, WifiOff } from 'lucide-react';
import type { ExecutionBackend } from '../types';

interface PerformanceBarProps {
  backend: ExecutionBackend;
  activeTensors: number;
  memoryMB: number;
  isTraining: boolean;
  onBackendToggle?: (backend: ExecutionBackend) => void;
}

export const PerformanceBar: React.FC<PerformanceBarProps> = ({
  backend,
  activeTensors,
  memoryMB,
  isTraining,
  onBackendToggle
}) => {
  const [fps, setFps] = useState<number>(60);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const animIdRef = useRef<number | null>(null);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    const loop = (currentTime: number) => {
      frameCountRef.current++;
      const delta = currentTime - lastTimeRef.current;

      if (delta >= 500) {
        const calculatedFps = Math.round((frameCountRef.current * 1000) / delta);
        setFps(Math.min(calculatedFps, 60));
        setLatencyMs(Math.round((delta / frameCountRef.current) * 10) / 10);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, []);

  const isFluid = fps >= 55;
  const isMemorySafe = memoryMB < 250;

  return (
    <div className="border-b border-white/[0.04] bg-[#060A13]/90 px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono-numbers">
      {/* Primary Telemetry: Thread & Memory */}
      <div className="flex items-center gap-3.5 flex-wrap">
        {/* 60 FPS Fluidity Monitor */}
        <div className="flex items-center gap-2 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.06]">
          <Activity className={`w-3.5 h-3.5 ${isFluid ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-slate-400 text-[11px]">Display Pipeline:</span>
          <span className={`font-semibold text-xs ${isFluid ? 'text-emerald-400' : 'text-amber-400'}`}>
            {fps} FPS
          </span>
          <span className="text-slate-500 text-[10px]">({latencyMs}ms render)</span>
          {isTraining && (
            <span className="inline-flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Worker Computing
            </span>
          )}
        </div>

        {/* Volatile Heap Allocator */}
        <div className="flex items-center gap-2 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.06]">
          <HardDrive className={`w-3.5 h-3.5 ${isMemorySafe ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span className="text-slate-400 text-[11px]">Volatile Heap:</span>
          <span className="font-semibold text-xs text-white">
            {memoryMB.toFixed(1)} MB
          </span>
          <span className="text-slate-500 text-[10px]">/ 250 MB cap</span>
          <span className="text-slate-500 text-[10px]">({activeTensors} active tensors)</span>
        </div>
      </div>

      {/* Backend & Zero-Trust State */}
      <div className="flex items-center gap-3">
        {/* Hardware Acceleration Target Toggle */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.06]">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 text-[11px]">Backend:</span>
          <button
            onClick={() => onBackendToggle && onBackendToggle(backend === 'webgl' ? 'cpu' : 'webgl')}
            className="flex items-center gap-1 uppercase font-mono font-bold text-[10px] text-cyan-300 hover:text-cyan-200 transition-colors bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30"
            title="Click to toggle hardware acceleration between WebGL and CPU fallback (Instruction 4)"
          >
            <Zap className="w-2.5 h-2.5 text-cyan-400 fill-current" />
            {backend}
          </button>
        </div>

        {/* Air-Gapped Signature */}
        <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 bg-emerald-500/[0.06] border border-emerald-500/20 px-2.5 py-1 rounded-md text-[11px]">
          <WifiOff className="w-3 h-3 text-emerald-400" />
          <span className="font-medium">Sandbox Air-Gapped</span>
        </div>
      </div>
    </div>
  );
};
