# VoxVeritas: Real-Time Deep Learning AI Voice Detector

An end-to-end Python deep learning audio processing suite and forensic detector designed to distinguish authentic human voice patterns from AI-generated or cloned synthetic speech (ElevenLabs, VALL-E, HiFi-GAN, Tacotron, XTTS, Bark) in real time with minimal latency.

## Key Features

- **Sub-50ms Processing Latency**: Employs ring-buffer sliding window processing (hop size 250ms, analysis chunk 500ms).
- **Hybrid Acoustic Deep Architecture**:
  - `SincConv 1D`: Learns dynamic bandpass sinc filters directly on raw PCM audio waveforms.
  - `Residual SE Convolutions`: Channel-attention modeling across frequency spectrum.
  - `Conformer Block`: Multi-head self-attention combined with depthwise convolutions for temporal speech rhythm and glottal flow capture.
  - `Attentive Statistics Pooling`: Preserves both mean and variance representations of speech dynamics.
- **Micro-Perturbation Forensics**: Detects subtle human vocal cord biomechanics (Pitch Jitter, Shimmer, Harmonic-to-Noise Ratio HNR) vs synthetic vocoder high-frequency spectral truncation.
- **Per-Segment Confidence Dashboard**: Tracks every temporal slice with probability scores and anomaly flags.
- **Export Formats**: Outputs detailed forensic reports in CSV, JSON, and text/PDF formats.

## Quick Start (Python CLI)

### 1. Installation
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Real-Time Streaming Demonstration
Run the real-time detector in streaming simulation mode:
```bash
python3 realtime_stream.py --demo --export detailed_report.csv
```

### 3. Live Microphone Stream
Run on live microphone input with automatic per-segment classification:
```bash
python3 realtime_stream.py --export live_forensic_audit.json
```

### 4. Train on Custom Dataset
```bash
python3 train.py --epochs 10 --output voice_detector_v1.pt
```

## Architecture Diagram
```
Raw Audio Stream (16kHz PCM)
          │
          ▼
┌───────────────────┐
│ SincConv 1D Layer │ (Raw waveform bandpass filterbank)
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Residual SE Block │ (Squeeze-and-Excitation channel attention)
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Conformer Encoder │ (Self-Attention + Depthwise Temporal Conv)
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Attentive Pooling │ (Mean & Variance statistics)
└─────────┬─────────┘
          │
    ┌─────┴───────────────┐
    ▼                     ▼
[Human vs AI Prob]   [Vocoder Anomaly Score]
```

## Report Export Structure
The exported report includes:
- `Segment_Index` & Time Range (`Start_Time_Sec` - `End_Time_Sec`)
- Classification (`HUMAN` vs `AI_SYNTHETIC` vs `AMBIENT`)
- Confidence percentage & calibrated probabilities
- Acoustic metrics (`Pitch_Jitter_Pct`, `Amplitude_Shimmer_Pct`, `HNR_dB`)
- Forensic anomaly flags (e.g. vocoder cutoff, phase smearing, pitch invariance)
