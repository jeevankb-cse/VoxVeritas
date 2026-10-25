import React from 'react';
import { Activity, Disc, BarChart3, Radio, Sparkles } from 'lucide-react';
import { DetectionSummary, SegmentAnalysis } from '../types';

interface ForensicMetricsGridProps {
  latestSegment: SegmentAnalysis | null;
  summary: DetectionSummary;
}

export const ForensicMetricsGrid: React.FC<ForensicMetricsGridProps> = ({
  latestSegment,
  summary,
}) => {
  const currentJitter = latestSegment?.features.jitter ?? summary.averageJitter;
  const currentShimmer = latestSegment?.features.shimmer ?? summary.averageShimmer;
  const currentHnr = latestSegment?.features.hnr ?? summary.averageHnr;
  const vocoderScore = latestSegment?.features.vocoderArtifactScore ?? summary.averageVocoderScore;
  const centroid = Math.round(latestSegment?.features.spectralCentroid ?? 2200);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Pitch Jitter (F0 Micro-Perturbation) */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-slate-300">
              Pitch Jitter (F0)
            </span>
            <Activity className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {currentJitter.toFixed(2)}%
            </span>
            <span
              className={`text-xs font-mono ${
                currentJitter >= 0.5 && currentJitter <= 2.8
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {currentJitter >= 0.5 && currentJitter <= 2.8 ? 'Organic Jitter' : 'Synthetic Flatness'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Micro-perturbation of vocal cord oscillations.
          </p>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
          <div className="flex justify-between">
            <span>AI: &lt;0.35%</span>
            <span>Human: 0.5 – 2.5%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-950 mt-1 overflow-hidden relative">
            {/* Target human zone */}
            <div className="absolute left-[20%] right-[30%] h-full bg-emerald-500/30" />
            {/* Current marker */}
            <div
              className="absolute top-0 bottom-0 w-1.5 bg-sky-400 rounded-full"
              style={{ left: `${Math.min(95, Math.max(5, (currentJitter / 3.0) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Amplitude Shimmer */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-slate-300">
              Amplitude Shimmer
            </span>
            <Disc className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {currentShimmer.toFixed(2)}%
            </span>
            <span
              className={`text-xs font-mono ${
                currentShimmer >= 1.5 && currentShimmer <= 7.0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {currentShimmer >= 1.5 && currentShimmer <= 7.0 ? 'Natural Glottal' : 'Unnatural Balance'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Cycle-to-cycle amplitude variations of phonation.
          </p>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
          <div className="flex justify-between">
            <span>AI: &lt;1.0%</span>
            <span>Human: 2.0 – 6.0%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-950 mt-1 overflow-hidden relative">
            <div className="absolute left-[25%] right-[25%] h-full bg-emerald-500/30" />
            <div
              className="absolute top-0 bottom-0 w-1.5 bg-indigo-400 rounded-full"
              style={{ left: `${Math.min(95, Math.max(5, (currentShimmer / 8.0) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Harmonic-to-Noise Ratio (HNR) */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-slate-300">
              Harmonic / Noise (HNR)
            </span>
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {currentHnr.toFixed(1)} dB
            </span>
            <span className="text-xs font-mono text-slate-400">
              {currentHnr > 18 ? 'High Periodic' : 'Aperiodic / Smear'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Relative acoustic power of harmonic speech components.
          </p>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
          <div className="flex justify-between">
            <span>Turbulent: &lt;12 dB</span>
            <span>Clean: &gt;20 dB</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-950 mt-1 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500"
              style={{ width: `${Math.min(100, Math.max(5, (currentHnr / 30.0) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Neural Vocoder Artifact Score */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-slate-300">
              Vocoder Anomaly Score
            </span>
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {vocoderScore}%
            </span>
            <span
              className={`text-xs font-mono font-semibold ${
                vocoderScore > 50 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {vocoderScore > 50 ? 'HiFi-GAN Artifact' : 'Clean / Organic'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Bandwidth truncation &gt;7.5kHz, phase comb dispersion.
          </p>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
          <div className="flex justify-between">
            <span>Centroid: {centroid} Hz</span>
            <span>Risk: {vocoderScore > 50 ? 'Elevated' : 'Low'}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-950 mt-1 overflow-hidden">
            <div
              className={`h-full ${
                vocoderScore > 50
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, vocoderScore))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
