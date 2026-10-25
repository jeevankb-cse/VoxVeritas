import { SegmentAnalysis, DetectionSummary } from '../utils/audioDetector';

export type { SegmentAnalysis, DetectionSummary };

export type StreamSourceType = 'mic' | 'preset' | 'file';

export interface PresetSample {
  id: string;
  title: string;
  category: 'human' | 'ai' | 'mixed';
  description: string;
  duration: number; // seconds
  expectedVerdict: 'Human Voice' | 'AI Synthetic / TTS' | 'Mixed / Cloned Voice';
  voiceType: string;
}

export interface AcousticBaseline {
  metric: string;
  unit: string;
  humanRange: [number, number];
  aiRange: [number, number];
  currentValue: number;
  description: string;
}
