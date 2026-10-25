// FinPredict.js - Vena Solutions Left Icon Navigation Dock (Image 1)

import React from 'react';
import {
  Home,
  Scale,
  FolderTree,
  TableProperties,
  GitBranch,
  Sliders,
  Database,
  Bell,
  Gauge,
  History,
  FileText,
  Bookmark
} from 'lucide-react';
import type { AuthUser } from '../types/auth';

interface SidebarDockProps {
  activeView: string;
  onSelectView: (view: string) => void;
  fps: number;
  memoryMB: number;
  currentUser?: AuthUser | null;
}

export const SidebarDock: React.FC<SidebarDockProps> = ({
  activeView,
  onSelectView,
  fps,
  memoryMB,
  currentUser
}) => {
  const isUser = currentUser?.role === 'user';
  const items = [
    ...(isUser ? [{ id: 'home', icon: Home, label: 'Personal Home Dashboard' }] : []),
    ...(!isUser ? [{ id: 'admin_reports', icon: Scale, label: 'All Reports (Special Privileges)' }] : []),
    { id: 'tracker', icon: TableProperties, label: 'Status Tracker & Budget Grid' },
    { id: 'forecast', icon: GitBranch, label: '30-Day Multi-Vector Forecast' },
    { id: 'simplex', icon: Sliders, label: 'Linear Simplex Optimizer' },
    { id: 'reports', icon: FileText, label: 'P&L Financial Reports' },
    { id: 'modeler', icon: FolderTree, label: 'Modeler (ML Engine)', srLabel: 'Neural Engine Console' },
    { id: 'ledger', icon: History, label: 'Transaction Ledger' },
    { id: 'database', icon: Database, label: 'Ephemeral IndexedDB Cache' },
    { id: 'telemetry', icon: Gauge, label: `Telemetry (${fps} FPS • ${memoryMB.toFixed(1)}MB)` },
    { id: 'alerts', icon: Bell, label: 'Budget Anomaly Alerts' },
  ];

  return (
    <aside className="w-12 bg-[#FFFFFF] border-r border-[#D1D5DB] flex flex-col items-center py-2 space-y-1 select-none shrink-0 z-20">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectView(item.id)}
            className={`w-9 h-9 flex items-center justify-center rounded transition-colors relative group ${
              isActive
                ? 'bg-[#E3FCEF] text-[#007A3D] border border-[#007A3D]/30'
                : 'text-[#5E6C84] hover:bg-[#EBECF0] hover:text-[#172B4D]'
            }`}
            title={item.label}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="sr-only">{item.label} {item.srLabel || ''}</span>
            {/* Tooltip */}
            <div className="absolute left-11 bg-[#172B4D] text-white text-[11px] px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {item.label}
            </div>
          </button>
        );
      })}

      <div className="flex-1" />

      {/* Blue active pill at bottom (Image 1) */}
      <button
        onClick={() => onSelectView('tracker')}
        className="w-7 h-7 bg-[#0065FF] text-white rounded flex items-center justify-center shadow-sm hover:bg-[#0052CC] transition-colors mb-2"
        title="Active Process Bookmark (Return to Main Tracker)"
      >
        <Bookmark className="w-3.5 h-3.5 fill-current" />
        <span className="sr-only">Active Process Bookmark</span>
      </button>
    </aside>
  );
};
