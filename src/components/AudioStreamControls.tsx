import React, { useRef } from 'react';
import {
  Mic,
  MicOff,
  Play,
  Square,
  Upload,
  Volume2,
  Sparkles,
  UserCheck,
  Bot,
  Shuffle,
  FileAudio,
} from 'lucide-react';
import { StreamSourceType, PresetSample } from '../types';

interface AudioStreamControlsProps {
  isStreaming: boolean;
  currentSource: StreamSourceType | null;
  activePresetId: string | null;
  onToggleMic: () => void;
  onSelectPreset: (preset: PresetSample) => void;
  onStopStream: () => void;
  onUploadFile: (file: File) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'preset_human_casual',
    title: 'Authentic Human Voice',
    category: 'human',
    description: 'Natural human speech stream with organic vocal cord micro-jitter (1.2% - 1.8%) and glottal flow dynamics.',
    duration: 12,
    expectedVerdict: 'Human Voice',
    voiceType: 'Natural Human Speaker',
  },
  {
    id: 'preset_ai_tts',
    title: 'AI Synthetic Voice (HiFi-GAN)',
    category: 'ai',
    description: 'Neural vocoder speech stream with robotic F0 pitch stability (<0.15% jitter) and >7.5kHz bandwidth truncation.',
    duration: 12,
    expectedVerdict: 'AI Synthetic / TTS',
    voiceType: 'Neural Vocoder Clone',
  },
  {
    id: 'preset_ai_deepfake',
    title: 'AI Voice Clone (Impersonation)',
    category: 'ai',
    description: 'Cloned voice deepfake displaying vocoder phase comb artifacts and unnatural formant transitions.',
    duration: 12,
    expectedVerdict: 'AI Synthetic / TTS',
    voiceType: 'Cloned Deepfake Voice',
  },
  {
    id: 'preset_mixed_call',
    title: 'Mixed Conversation (Human & AI)',
    category: 'mixed',
    description: 'Real-time multi-speaker phone dialogue alternating between authentic human and synthetic voice injection.',
    duration: 16,
    expectedVerdict: 'Mixed / Cloned Voice',
    voiceType: 'Multi-Speaker Mixed Stream',
  },
];

export const AudioStreamControls: React.FC<AudioStreamControlsProps> = ({
  isStreaming,
  currentSource,
  activePresetId,
  onToggleMic,
  onSelectPreset,
  onStopStream,
  onUploadFile,
  volume,
  onVolumeChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Live Microphone Toggle */}
          <button
            onClick={onToggleMic}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              currentSource === 'mic' && isStreaming
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {currentSource === 'mic' && isStreaming ? (
              <>
                <MicOff className="w-4 h-4" /> Stop Live Mic
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" /> Start Live Mic Stream
              </>
            )}
          </button>

          {/* Upload Audio File */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-sky-400" />
            <span>Upload Audio File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.wav,.mp3,.ogg,.m4a"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Stop Stream if running */}
          {isStreaming && (
            <button
              onClick={onStopStream}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" /> Stop Stream
            </button>
          )}
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 w-full sm:w-auto justify-end">
          <Volume2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-[11px] hidden md:inline">Playback Monitor:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-24 accent-sky-500 cursor-pointer"
          />
          <span className="w-8 text-right font-semibold text-slate-300">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Preset Speech Streams Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Curated Speech Ingestion Streams (Instant Low-Latency Testing)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_SAMPLES.map((preset) => {
            const isSelected = activePresetId === preset.id && isStreaming;

            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? preset.category === 'ai'
                      ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/50'
                      : 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {/* Active pulsating pulse indicator */}
                {isSelected && (
                  <span
                    className={`absolute top-2 right-2 h-2 w-2 rounded-full ${
                      preset.category === 'ai' ? 'bg-rose-400 animate-ping' : 'bg-emerald-400 animate-ping'
                    }`}
                  />
                )}

                <div className="flex items-center gap-2 mb-1.5">
                  {preset.category === 'human' && (
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                  )}
                  {preset.category === 'ai' && <Bot className="w-4 h-4 text-rose-400" />}
                  {preset.category === 'mixed' && <Shuffle className="w-4 h-4 text-amber-400" />}

                  <span className="text-xs font-bold text-white truncate">{preset.title}</span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span
                    className={
                      preset.category === 'ai'
                        ? 'text-rose-400 font-semibold'
                        : preset.category === 'human'
                        ? 'text-emerald-400 font-semibold'
                        : 'text-amber-400 font-semibold'
                    }
                  >
                    Expected: {preset.expectedVerdict}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Play className="w-2.5 h-2.5" /> Stream
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
