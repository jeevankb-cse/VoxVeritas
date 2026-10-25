import React from 'react';
import { X, ShieldCheck, ShieldAlert, Cpu, Sparkles, CheckCircle, Info } from 'lucide-react';
import { SegmentAnalysis } from '../types';

interface SegmentInspectorModalProps {
  segment: SegmentAnalysis | null;
  onClose: () => void;
}

export const SegmentInspectorModal: React.FC<SegmentInspectorModalProps> = ({
  segment,
  onClose,
}) => {
  if (!segment) return null;

  const isAI = segment.label === 'ai';
  const isHuman = segment.label === 'human';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                isAI
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : isHuman
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isAI ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Segment #{segment.index + 1} Forensic Inspection
                </h3>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {segment.startTime.toFixed(2)}s – {segment.endTime.toFixed(2)}s
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Duration: {(segment.endTime - segment.startTime).toFixed(2)}s | Model Confidence:{' '}
                <span className="text-white font-semibold font-mono">{segment.confidence.toFixed(1)}%</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Classification & Probabilities */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Model Classification
              </span>
              <span
                className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-md ${
                  isAI
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : isHuman
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {segment.label.toUpperCase()} ({segment.confidence.toFixed(1)}%)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono mt-3">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">P(Human Authentic):</span>
                <p className="text-emerald-400 font-bold text-sm">
                  {(segment.humanProbability * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">P(AI Synthetic / TTS):</span>
                <p className="text-rose-400 font-bold text-sm">
                  {(segment.aiProbability * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Model Reasoning & Detected Forensic Markers */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              Acoustic Reasoning & Detected Artifacts
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="leading-relaxed">{segment.explanation}</p>
              {segment.artifacts && segment.artifacts.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Acoustic Markers:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {segment.artifacts.map((art, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        {art}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Acoustic Feature Breakdown Grid */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Extracted Acoustic Vectors
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Pitch Jitter</span>
                <span className="text-white font-bold text-sm">
                  {segment.features.jitter.toFixed(2)}%
                </span>
                <span className="text-[10px] text-slate-500 block">Norm: 0.5-2.5%</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Amplitude Shimmer</span>
                <span className="text-white font-bold text-sm">
                  {segment.features.shimmer.toFixed(2)}%
                </span>
                <span className="text-[10px] text-slate-500 block">Norm: 2.0-6.0%</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Harmonic / Noise</span>
                <span className="text-white font-bold text-sm">
                  {segment.features.hnr.toFixed(1)} dB
                </span>
                <span className="text-[10px] text-slate-500 block">&gt;18 dB periodic</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Spectral Centroid</span>
                <span className="text-white font-bold text-sm">
                  {segment.features.spectralCentroid} Hz
                </span>
                <span className="text-[10px] text-slate-500 block">Center of mass</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Spectral Rolloff</span>
                <span className="text-white font-bold text-sm">
                  {segment.features.spectralRolloff} Hz
                </span>
                <span className="text-[10px] text-slate-500 block">85% energy point</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Spectral Flatness</span>
                <span className="text-white font-bold text-sm">
                  {segment.features.spectralFlatness.toFixed(3)}
                </span>
                <span className="text-[10px] text-slate-500 block">Wiener entropy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
