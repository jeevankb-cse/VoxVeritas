import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRMS,
  calculateZCR,
  calculateSpectralCentroid,
  calculateSpectralRolloff,
  calculateSpectralFlatness,
  estimatePitchF0,
  classifyAudioSegment,
  summarizeDetection,
  generateCSVReport,
  generateJSONReport,
  SegmentAnalysis,
} from './audioDetector';

test('calculateRMS computes correct root mean square', () => {
  const empty = new Float32Array(0);
  assert.equal(calculateRMS(empty), 0);

  const flat = new Float32Array([0.5, 0.5, 0.5, 0.5]);
  assert.equal(Math.round(calculateRMS(flat) * 100) / 100, 0.5);

  const silence = new Float32Array([0, 0, 0, 0]);
  assert.equal(calculateRMS(silence), 0);
});

test('calculateZCR computes zero crossings accurately', () => {
  const wave = new Float32Array([1, -1, 1, -1, 1]);
  // 4 crossings across 5 samples -> 4 / 4 = 1.0
  assert.equal(calculateZCR(wave), 1.0);

  const constant = new Float32Array([1, 1, 1, 1]);
  assert.equal(calculateZCR(constant), 0);
});

test('calculateSpectralCentroid calculates weighted mean frequency', () => {
  // 4 bins: 0, 2000, 4000, 6000 Hz (sampleRate 16000, nyquist 8000, binWidth 2000)
  const mags = new Float32Array([0, 10, 0, 0]);
  const centroid = calculateSpectralCentroid(mags, 16000);
  assert.equal(centroid, 2000);
});

test('calculateSpectralRolloff finds energy threshold boundary', () => {
  const mags = new Float32Array([10, 10, 10, 10]);
  const rolloff = calculateSpectralRolloff(mags, 16000, 0.5);
  // Total 40, threshold 20 is met at bin 1 -> 1 * 2000 = 2000 Hz
  assert.equal(rolloff, 2000);
});

test('calculateSpectralFlatness differentiates tone from white noise', () => {
  // Pure single-bin impulse (pure tone) -> very low flatness
  const tone = new Float32Array([100, 0.0001, 0.0001, 0.0001]);
  const flatTone = calculateSpectralFlatness(tone);
  assert.ok(flatTone < 0.1, `Tone flatness ${flatTone} should be close to 0`);

  // Perfectly flat spectrum -> flatness should approach 1.0
  const noise = new Float32Array([5, 5, 5, 5]);
  const flatNoise = calculateSpectralFlatness(noise);
  assert.ok(flatNoise > 0.9, `Noise flatness ${flatNoise} should be close to 1`);
});

test('estimatePitchF0 identifies periodic frequency', () => {
  const sampleRate = 16000;
  const targetFreq = 200; // 200 Hz
  const period = sampleRate / targetFreq; // 80 samples
  const samples = new Float32Array(800);

  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.sin((2 * Math.PI * i) / period);
  }

  const f0 = estimatePitchF0(samples, sampleRate);
  assert.ok(Math.abs(f0 - 200) < 5, `Expected ~200Hz, got ${f0}`);
});

test('classifyAudioSegment detects ambient silence for quiet input', () => {
  const silentSamples = new Float32Array(512).fill(0.001);
  const silentMags = new Float32Array(256).fill(0.001);

  const segment = classifyAudioSegment(silentSamples, silentMags, 16000, 0.0, 0.5, 0);
  assert.equal(segment.label, 'ambient');
  assert.equal(segment.index, 0);
  assert.ok(segment.confidence >= 90);
});

test('summarizeDetection provides coherent overall verdict', () => {
  const segments: SegmentAnalysis[] = [
    {
      id: 'seg_1',
      index: 1,
      startTime: 0,
      endTime: 0.5,
      label: 'ai',
      confidence: 94,
      humanProbability: 0.06,
      aiProbability: 0.94,
      ambientProbability: 0,
      features: {
        jitter: 0.1,
        shimmer: 0.8,
        hnr: 12,
        spectralCentroid: 2200,
        spectralRolloff: 6000,
        spectralFlatness: 0.15,
        zeroCrossingRate: 0.05,
        vocoderArtifactScore: 85,
        energy: 0.2,
      },
      artifacts: ['Unnatural pitch invariance (<0.35% F0 jitter)'],
      explanation: 'Synthetic vocoder detected',
    },
    {
      id: 'seg_2',
      index: 2,
      startTime: 0.5,
      endTime: 1.0,
      label: 'ai',
      confidence: 88,
      humanProbability: 0.12,
      aiProbability: 0.88,
      ambientProbability: 0,
      features: {
        jitter: 0.2,
        shimmer: 0.9,
        hnr: 14,
        spectralCentroid: 2100,
        spectralRolloff: 5800,
        spectralFlatness: 0.18,
        zeroCrossingRate: 0.06,
        vocoderArtifactScore: 78,
        energy: 0.18,
      },
      artifacts: ['Bandwidth truncation above 7.5 kHz (HiFi-GAN/WaveNet vocoder signature)'],
      explanation: 'High frequency cutoff detected',
    },
  ];

  const summary = summarizeDetection(segments);
  assert.equal(summary.overallVerdict, 'LIKELY_AI_SYNTHETIC');
  assert.ok(summary.aiScore > 80);
  assert.equal(summary.totalSegments, 2);
  assert.equal(summary.aiSegments, 2);
  assert.equal(summary.humanSegments, 0);
});

test('generateCSVReport and generateJSONReport produce valid export content', () => {
  const dummySegment: SegmentAnalysis = {
    id: 'seg_0',
    index: 0,
    startTime: 0,
    endTime: 0.5,
    label: 'human',
    confidence: 95.5,
    humanProbability: 0.955,
    aiProbability: 0.045,
    ambientProbability: 0,
    features: {
      jitter: 1.4,
      shimmer: 3.8,
      hnr: 22.4,
      spectralCentroid: 1800,
      spectralRolloff: 4500,
      spectralFlatness: 0.2,
      zeroCrossingRate: 0.08,
      vocoderArtifactScore: 12,
      energy: 0.15,
    },
    artifacts: ['Organic laryngeal micro-perturbation'],
    explanation: 'Natural human vocal characteristics',
  };

  const summary = summarizeDetection([dummySegment]);

  const csv = generateCSVReport(summary, [dummySegment]);
  assert.ok(csv.includes('# VoxVeritas Forensic Voice Analysis Report'));
  assert.ok(csv.includes('Segment_Index,Start_Time_Sec'));
  assert.ok(csv.includes('HUMAN'));

  const jsonStr = generateJSONReport(summary, [dummySegment]);
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.executiveSummary.overallVerdict, 'LIKELY_HUMAN');
  assert.equal(parsed.segmentTimeline.length, 1);
});
