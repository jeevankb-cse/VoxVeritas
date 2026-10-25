import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle, Zap, CheckCircle2 } from 'lucide-react';
import { DetectionSummary } from '../types';

interface AuthenticityGaugeProps {
  summary: DetectionSummary;
  isStreaming: boolean;
  latencyMs: number;
}

export const AuthenticityGauge: React.FC<AuthenticityGaugeProps> = ({
  summary,
  isStreaming,
  latencyMs,
}) => {
  const { overallVerdict, overallConfidence, humanScore, aiScore, dominantAnomalies } = summary;

  // Determine styling based on verdict
  const isHuman = overallVerdict === 'LIKELY_HUMAN';
  const isAI = overallVerdict === 'LIKELY_AI_SYNTHETIC';
  const isHybrid = overallVerdict === 'SUSPICIOUS_HYBRID';

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
      {/* Top Title & Status */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Acoustic Authenticity Verdict
          </h2>
          <p className="text-xs text-slate-400">
            Real-time deep learning classification score
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Inference:</span>
          <span className="text-amber-300 font-semibold">{latencyMs.toFixed(1)}ms</span>
        </div>
      </div>

      {/* Primary Score Dial / Bars */}
      <div className="my-4">
        {/* Main Verdict Header */}
        <div className="flex items-center gap-3 mb-3">
          {isHuman && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
          )}
          {isAI && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-7 h-7" />
            </div>
          )}
          {isHybrid && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>
          )}
          {!isHuman && !isAI && !isHybrid && (
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
              <HelpCircle className="w-7 h-7" />
            </div>
          )}

          <div>
            <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {isHuman && <span className="text-emerald-400">Likely Human Voice</span>}
              {isAI && <span className="text-rose-400">Likely AI Synthetic Voice</span>}
              {isHybrid && <span className="text-amber-400">Suspicious Cloned / Hybrid</span>}
              {overallVerdict === 'INSUFFICIENT_AUDIO' && (
                <span className="text-slate-300">Listening For Speech...</span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Confidence Score: <span className="font-semibold text-white">{overallConfidence.toFixed(1)}%</span>
            </p>
          </div>
        </div>

        {/* Dual Probability Bar */}
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Human Organic ({humanScore}%)
            </span>
            <span className="text-rose-400 flex items-center gap-1 font-semibold">
              AI Synthetic / TTS ({aiScore}%) <ShieldAlert className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.max(2, Math.min(98, humanScore))}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-rose-700 transition-all duration-300"
              style={{ width: `${Math.max(2, Math.min(98, aiScore))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dominant Forensic Markers */}
      <div className="pt-3 border-t border-slate-800">
        <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
          Dominant Neural Forensics Findings
        </h4>
        {dominantAnomalies && dominantAnomalies.length > 0 ? (
          <ul className="space-y-1.5">
            {dominantAnomalies.map((anomaly, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-300 flex items-start gap-1.5 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60"
              >
                <span className="text-sky-400 font-mono">▸</span>
                <span>{anomaly}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic">
            {isStreaming ? 'Analyzing speech frames...' : 'Start microphone or select an audio preset to analyze'}
          </p>
        )}
      </div>
    </div>
  );
};
