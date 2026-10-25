import React from 'react';
import { ShieldAlert, ShieldCheck, Activity, Terminal, Download, Cpu, Radio } from 'lucide-react';

interface HeaderProps {
  isStreaming: boolean;
  latencyMs: number;
  sampleRate: number;
  onOpenExport: () => void;
  activeTab: 'dashboard' | 'python_project';
  setActiveTab: (tab: 'dashboard' | 'python_project') => void;
  overallVerdict?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isStreaming,
  latencyMs,
  sampleRate,
  onOpenExport,
  activeTab,
  setActiveTab,
  overallVerdict,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                VoxVeritas
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  DEEP LEARNING v2.4
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Real-Time AI Synthetic vs Human Voice Acoustic Pattern Detector
            </p>
          </div>
        </div>

        {/* Real-Time Processing Metrics */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <span
              className={`h-2 w-2 rounded-full ${
                isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span className={isStreaming ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
              {isStreaming ? 'STREAMING ACTIVE' : 'STREAM STANDBY'}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>LATENCY:</span>
            <span className="text-sky-400 font-semibold">{latencyMs.toFixed(1)} ms</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            <span>{(sampleRate / 1000).toFixed(1)} kHz PCM</span>
          </div>

          {overallVerdict && overallVerdict !== 'INSUFFICIENT_AUDIO' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold">
              {overallVerdict.includes('HUMAN') ? (
                <span className="text-emerald-400 border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> HUMAN VERIFIED
                </span>
              ) : (
                <span className="text-rose-400 border-rose-500/30 bg-rose-950/40 px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> AI DETECTED
                </span>
              )}
            </div>
          )}
        </div>

        {/* Mode & Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex items-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('python_project')}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'python_project'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              Python Project
            </button>
          </div>

          <button
            onClick={onOpenExport}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};
