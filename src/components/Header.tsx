// FinPredict.js - Vena & Corporate FP&A Enterprise Header
// Modeled directly on Vena Solutions (Image 1) & Enterprise Financial Systems (Image 2)

import React from 'react';
import {
  Play,
  Pause,
  RotateCw,
  Settings,
  HelpCircle,
  Download,
  ShieldCheck,
  Trash2,
  Sparkles,
  GitFork,
  Eye,
  LogOut
} from 'lucide-react';
import type { AuthUser } from '../types/auth';

interface HeaderProps {
  activeTopTab: string;
  onSelectTopTab: (tab: string) => void;
  onStartTraining: () => void;
  isTraining: boolean;
  onOpenAudit: () => void;
  onOpenExport?: () => void;
  onEphemeralWipe: () => void;
  datasetName: string;
  isModelReady: boolean;
  onOpenHelp?: () => void;
  onOpenWhatsNew?: () => void;
  onOpenSettings?: () => void;
  onTogglePause?: () => void;
  isPaused?: boolean;
  onToggleView?: () => void;
  onBack?: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTopTab,
  onSelectTopTab,
  onStartTraining,
  isTraining,
  onOpenAudit,
  onOpenExport,
  onEphemeralWipe,
  datasetName,
  isModelReady,
  onOpenHelp,
  onOpenWhatsNew,
  onOpenSettings,
  onTogglePause,
  isPaused = false,
  onToggleView,
  onBack,
  currentUser,
  onLogout
}) => {
  return (
    <div className="w-full flex flex-col shadow-sm select-none">
      {/* 1. Primary Top Vena Green Bar (Image 1) */}
      <div className="bg-[#007A3D] text-white px-4 h-12 flex items-center justify-between">
        {/* Brand Logo & Main Enterprise Tabs */}
        <div className="flex items-center gap-6">
          {/* Vena / FinPredict Brand Mark */}
          <button
            onClick={() => onSelectTopTab('manager')}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
            title="FinPredict FP&A Home"
          >
            <div className="w-7 h-7 rounded bg-white text-[#007A3D] font-bold text-base flex items-center justify-center font-sans tracking-tighter shadow-sm">
              V
            </div>
            <span className="font-bold text-lg tracking-tight font-sans text-white">
              FinPredict<span className="text-emerald-200 text-xs font-normal ml-0.5 font-mono">FP&amp;A</span>
            </span>
          </button>

          {/* Enterprise Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
            {(currentUser?.role === 'user'
              ? [
                  { id: 'home', label: 'Home' },
                  { id: 'tracker', label: 'Status Tracker' },
                  { id: 'dashboards', label: 'Dashboards' },
                  { id: 'simplex', label: 'Simplex Planner' },
                  { id: 'ledger', label: 'Transactions' },
                  { id: 'modeler', label: 'Modeler (ML Engine)', srLabel: 'Neural Engine Console' }
                ]
              : [
                  { id: 'admin_reports', label: 'All Reports (Privileged)' },
                  { id: 'manager', label: 'Manager' },
                  { id: 'contributor', label: 'Contributor' },
                  { id: 'modeler', label: 'Modeler (ML Engine)', srLabel: 'Neural Engine Console' },
                  { id: 'dashboards', label: 'Dashboards' },
                  { id: 'reports', label: 'Financial Reports' },
                  { id: 'admin', label: 'Admin' }
                ]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSelectTopTab(tab.id)}
                className={`px-3.5 py-1 rounded transition-colors text-xs font-semibold ${
                  activeTopTab === tab.id
                    ? 'bg-[#005A2B] text-white'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.label}</span>
                {tab.srLabel && <span className="sr-only"> {tab.srLabel}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Top Right User Profile & Quick Actions (Image 1) */}
        <div className="flex items-center gap-2.5 text-xs">
          {/* Air-Gapped Privacy Status */}
          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 bg-[#005A2B] hover:bg-[#004722] text-white/95 px-2.5 py-1 rounded transition-colors text-[11px] font-medium"
            title="Zero-Trust Air-Gapped Sandbox Inspection (AC-3)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span className="inline">100% Air-Gapped Audit</span>
          </button>

          {/* User Profile Badge & Role Switcher */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectTopTab(currentUser?.role === 'admin' ? 'admin' : 'home')}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded transition-colors cursor-pointer"
              title={`Active Profile: ${currentUser?.displayName || 'User'} (${currentUser?.clearanceLevel || 'Standard'})`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                currentUser?.role === 'admin' ? 'bg-[#0065FF] text-white' : 'bg-white text-[#007A3D]'
              }`}>
                {currentUser?.avatarInitials || (currentUser?.role === 'admin' ? 'AD' : 'AN')}
              </div>
              <div className="hidden lg:flex flex-col text-left leading-none">
                <span className="text-white/95 font-medium text-[11px]">{currentUser?.displayName || currentUser?.username || 'User'}</span>
                <span className="text-white/70 text-[9px] font-mono mt-0.5">
                  {currentUser?.role === 'admin' ? 'Special Privileges' : 'Standard Analyst'}
                </span>
              </div>
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-white/80 hover:text-rose-200 p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
                title="Log Out of Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Help & System Documentation Modal */}
          <button
            onClick={onOpenHelp}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition-colors"
            title="System Help & Documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings Modal */}
          <button
            onClick={onOpenSettings}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition-colors"
            title="Modeler & Environment Configuration"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Ephemeral Wipe */}
          <button
            onClick={onEphemeralWipe}
            className="text-emerald-200 hover:text-white p-1 hover:bg-white/10 rounded transition-colors"
            title="Ephemeral Memory Wipe (Zero-Trust)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Sub-Header Process Ribbon & Workflow Toolbar (Image 1) */}
      <div className="bg-[#FFFFFF] border-b border-[#D1D5DB] px-4 h-11 flex items-center justify-between">
        {/* Breadcrumb path: 2026 Annual Budget / Status Tracker */}
        <div className="flex items-center gap-2.5 text-xs text-[#374151]">
          <button
            onClick={onBack || (() => onSelectTopTab('manager'))}
            className="text-[#6B7280] hover:text-[#111827] p-1 rounded hover:bg-gray-100 transition-colors"
            title="Navigate to Previous Dashboard"
          >
            &lt;
          </button>
          <div className="flex items-center gap-1.5 font-semibold text-[#111827] text-sm">
            <GitFork className="w-4 h-4 text-[#007A3D]" />
            <span>2026 Annual Operating Budget / Status Tracker</span>
          </div>
          <span className="text-[#9CA3AF] text-xs">/</span>
          <span className="text-[#007A3D] font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {datasetName || 'Active Banking Ledger'}
          </span>
        </div>

        {/* Process Actions: What's New, Play/Run Engine, Pause, Export */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenWhatsNew}
            className="hidden sm:flex items-center gap-1 text-xs text-[#007A3D] font-semibold hover:underline mr-1 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>What's New</span>
          </button>

          {/* Primary Simulation / ML Engine Run Play Button (Image 1) */}
          <button
            onClick={onStartTraining}
            disabled={isTraining}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold shadow-sm transition-all ${
              isTraining
                ? 'bg-amber-600 text-white cursor-wait'
                : 'bg-[#007A3D] hover:bg-[#005A2B] text-white'
            }`}
            title="Execute in-browser ML 50-epoch gradient descent (AC-2)"
          >
            {isTraining ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Training...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isModelReady ? 'Re-Run Model' : 'Run Model (AC-2)'}</span>
              </>
            )}
          </button>

          {/* Quick Toolbar icons (Image 1: Pause, Hide/Toggle, Settings) */}
          <div className="flex items-center border-l border-r border-[#E5E7EB] px-2 space-x-1 text-[#6B7280]">
            <button
              onClick={onTogglePause}
              className={`p-1 rounded transition-colors ${
                isPaused ? 'bg-amber-100 text-amber-700' : 'hover:text-[#111827] hover:bg-gray-100'
              }`}
              title={isPaused ? 'Resume Real-Time Execution' : 'Pause / Freeze Forecast'}
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleView}
              className="p-1 hover:text-[#111827] hover:bg-gray-100 rounded transition-colors"
              title="Toggle View Mode"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenSettings}
              className="p-1 hover:text-[#111827] hover:bg-gray-100 rounded transition-colors"
              title="Model &amp; System Configuration"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Prominent Blue Export Button (Image 1) */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 bg-[#0065FF] hover:bg-[#0052CC] text-white text-xs font-semibold px-3 py-1 rounded shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};
