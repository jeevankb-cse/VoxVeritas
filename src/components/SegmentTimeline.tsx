import React, { useState } from 'react';
import {
  Clock,
  Filter,
  CheckCircle,
  AlertOctagon,
  VolumeX,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { SegmentAnalysis } from '../types';

interface SegmentTimelineProps {
  segments: SegmentAnalysis[];
  onSelectSegment: (segment: SegmentAnalysis) => void;
  onClearSegments: () => void;
}

export const SegmentTimeline: React.FC<SegmentTimelineProps> = ({
  segments,
  onSelectSegment,
  onClearSegments,
}) => {
  const [filter, setFilter] = useState<'all' | 'ai' | 'human' | 'ambient'>('all');

  const filteredSegments = segments.filter((s) => {
    if (filter === 'all') return true;
    return s.label === filter;
  });

  const aiCount = segments.filter((s) => s.label === 'ai').length;
  const humanCount = segments.filter((s) => s.label === 'human').length;
  const ambientCount = segments.filter((s) => s.label === 'ambient').length;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col h-[520px]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            Segment-by-Segment Confidence Timeline
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
            {segments.length} slices
          </span>
        </div>

        {/* Filter Chips & Clear */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 text-xs rounded-md font-mono transition-colors ${
              filter === 'all'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({segments.length})
          </button>
          <button
            onClick={() => setFilter('ai')}
            className={`px-2 py-1 text-xs rounded-md font-mono transition-colors ${
              filter === 'ai'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Deepfakes ({aiCount})
          </button>
          <button
            onClick={() => setFilter('human')}
            className={`px-2 py-1 text-xs rounded-md font-mono transition-colors ${
              filter === 'human'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Human ({humanCount})
          </button>
          <button
            onClick={() => setFilter('ambient')}
            className={`px-2 py-1 text-xs rounded-md font-mono transition-colors ${
              filter === 'ambient'
                ? 'bg-slate-700 text-slate-200'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Ambient ({ambientCount})
          </button>

          {segments.length > 0 && (
            <button
              onClick={onClearSegments}
              className="text-xs text-slate-400 hover:text-rose-400 font-mono ml-2 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Segment Scroll List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 mt-2 pr-1">
        {filteredSegments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Filter className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No segments matching filter.</p>
            <p className="text-xs text-slate-600 mt-1">
              Start an audio stream or select a speech preset to begin real-time segmentation.
            </p>
          </div>
        ) : (
          filteredSegments.map((segment) => {
            const isAI = segment.label === 'ai';
            const isHuman = segment.label === 'human';
            const isAmbient = segment.label === 'ambient';

            return (
              <div
                key={segment.id}
                onClick={() => onSelectSegment(segment)}
                className="py-3 px-2 rounded-xl hover:bg-slate-850/80 transition-all cursor-pointer group flex items-center justify-between gap-3"
              >
                {/* Left: Time & Classification Badge */}
                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono text-slate-400 w-24">
                    {segment.startTime.toFixed(2)}s – {segment.endTime.toFixed(2)}s
                  </div>

                  {isAI && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                      AI SYNTHETIC ({segment.confidence.toFixed(1)}%)
                    </span>
                  )}
                  {isHuman && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      HUMAN ({segment.confidence.toFixed(1)}%)
                    </span>
                  )}
                  {isAmbient && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-400 border border-slate-700">
                      <VolumeX className="w-3 h-3 text-slate-500" />
                      Ambient Level
                    </span>
                  )}

                  {/* Primary Artifact Tag */}
                  {segment.artifacts && segment.artifacts.length > 0 && (
                    <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400 max-w-xs truncate">
                      <Sparkles className="w-3 h-3 text-sky-400 flex-shrink-0" />
                      {segment.artifacts[0]}
                    </span>
                  )}
                </div>

                {/* Right: Forensic Feature Snapshot & Drilldown Arrow */}
                <div className="flex items-center gap-3">
                  <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500">Jitter: </span>
                      <span className={segment.features.jitter < 0.35 ? 'text-rose-400' : 'text-emerald-400'}>
                        {segment.features.jitter.toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">HNR: </span>
                      <span className="text-slate-300">{segment.features.hnr.toFixed(1)} dB</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Centroid: </span>
                      <span className="text-slate-300">{segment.features.spectralCentroid} Hz</span>
                    </div>
                  </div>

                  <span className="text-xs text-sky-400 group-hover:text-sky-300 flex items-center gap-0.5 font-medium">
                    <span className="hidden sm:inline">Inspect</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
