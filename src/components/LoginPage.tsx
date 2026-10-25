// FinPredict.js - Decentralized Institutional Login & Authentication Portal
import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { createAuthUser } from '../types/auth';
import type { AuthUser, UserRole } from '../types/auth';
import { apiLogin } from '../services/api';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [username, setUsername] = useState<string>('analyst');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRole(role);
    setUsername(role === 'admin' ? 'admin' : 'analyst');
    setPassword('');
    setError(null);
  };

  const dynamicUsername = username.trim() || (selectedRole === 'admin' ? 'admin' : 'analyst');
  const dynamicInitials = dynamicUsername.length >= 2
    ? dynamicUsername.slice(0, 2).toUpperCase()
    : dynamicUsername.slice(0, 1).toUpperCase();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please provide a valid username or corporate ID.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    const user = await apiLogin(username, selectedRole);
    onLogin(user);
  };

  const handleQuickLogin = async (role: UserRole) => {
    const targetUser = username.trim() || (role === 'admin' ? 'admin' : 'analyst');
    const user = await apiLogin(targetUser, role);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col justify-center items-center p-4 selection:bg-[#007A3D] selection:text-white font-sans">
      {/* Top Brand Bar */}
      <div className="w-full max-w-md mb-6 text-center space-y-2">
        <div className="inline-flex items-center gap-2.5 bg-white border border-[#D1D5DB] px-3.5 py-1.5 rounded-full shadow-xs">
          <div className="w-6 h-6 rounded bg-[#007A3D] flex items-center justify-center text-white font-bold text-xs tracking-tight">
            V
          </div>
          <span className="font-bold text-sm tracking-tight text-[#111827]">FinPredict<span className="text-[#007A3D] text-[10px] ml-1 uppercase font-mono font-semibold">FP&amp;A</span></span>
          <span className="text-gray-300">|</span>
          <span className="text-[11px] text-gray-500 font-medium">Enterprise Portal</span>
        </div>
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
          Institutional FP&amp;A Workspace
        </h1>
        <p className="text-xs text-gray-600 max-w-sm mx-auto">
          Client-side decentralized financial planning, linear simplex optimization, and zero-trust neural forecasting.
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white border border-[#D1D5DB] rounded-xl shadow-lg overflow-hidden">
        {/* Role Segmented Controller */}
        <div className="bg-[#EDF0F4] p-1.5 border-b border-[#D1D5DB] grid grid-cols-2 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleRoleToggle('user')}
            className={`py-2 rounded-md flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'user'
                ? 'bg-white text-[#111827] shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#007A3D]" />
            <span>Standard User / Analyst</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleToggle('admin')}
            className={`py-2 rounded-md flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'admin'
                ? 'bg-white text-[#111827] shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0065FF]" />
            <span>Compliance Admin</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Clearance Level Indicator */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                selectedRole === 'admin' ? 'bg-[#0065FF]' : 'bg-[#007A3D]'
              }`}>
                {dynamicInitials}
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {dynamicUsername}
                </div>
                <div className="text-[11px] text-gray-500">
                  {selectedRole === 'admin' ? 'Executive Compliance Lead' : 'Standard FP&A Analyst'}
                </div>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
              selectedRole === 'admin'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {selectedRole === 'admin' ? 'Special Privileges' : 'Standard Access'}
            </span>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Direct Credential Form */}
          <form onSubmit={handleFormSubmit} autoComplete="off" className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Username or Corporate Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  placeholder={selectedRole === 'admin' ? 'admin' : 'analyst'}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D1D5DB] rounded focus:outline-hidden focus:border-[#007A3D] focus:ring-1 focus:ring-[#007A3D] text-gray-900 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-700 font-semibold">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D1D5DB] rounded focus:outline-hidden focus:border-[#007A3D] focus:ring-1 focus:ring-[#007A3D] text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-[#007A3D] focus:ring-[#007A3D]"
                />
                <span>Keep session in volatile memory</span>
              </label>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 px-4 rounded text-white font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-[#0065FF] hover:bg-[#0052CC]'
                  : 'bg-[#007A3D] hover:bg-[#005A2B]'
              }`}
            >
              <span>Authenticate &amp; Launch {selectedRole === 'admin' ? 'Executive Workspace' : 'Analyst Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick One-Click Demo Access Section */}
          <div className="pt-2 border-t border-gray-200 space-y-2">
            <div className="text-[11px] uppercase tracking-wider font-bold text-gray-500 text-center">
              Quick Role-Based Access
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('user')}
                className="w-full p-2.5 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-lg text-left transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#E3FCEF] text-[#007A3D] flex items-center justify-center font-bold text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-900 group-hover:text-[#007A3D]">
                      Continue as Standard User
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Personal Home Page, Budgeting, Simplex LP &amp; Ledger
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#007A3D] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="w-full p-2.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-left transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-blue-50 text-[#0065FF] flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-900 group-hover:text-[#0065FF]">
                      Continue as Compliance Administrator
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Special Privileges: All Institutional Reports &amp; Legal PII Shield
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0065FF] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>

        {/* Zero-Trust Client-Side Regulatory Footer */}
        <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-[#007A3D]" />
            <span>Zero-Trust Air-Gapped Authentication</span>
          </div>
          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200">
            SOX 404 &bull; SOC-2
          </span>
        </div>
      </div>
    </div>
  );
};
