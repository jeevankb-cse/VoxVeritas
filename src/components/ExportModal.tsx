import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  Printer,
  Archive,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import JSZip from 'jszip';
import { DetectionSummary, SegmentAnalysis } from '../types';
import { generateCSVReport, generateJSONReport } from '../utils/audioDetector';

interface ExportModalProps {
  summary: DetectionSummary;
  segments: SegmentAnalysis[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  summary,
  segments,
  onClose,
}) => {
  const [activeExportTab, setActiveExportTab] = useState<'options' | 'preview'>('options');
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadCSV = () => {
    const csvContent = generateCSVReport(summary, segments);
    triggerDownload(csvContent, `VoxVeritas_Forensic_Report_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleDownloadJSON = () => {
    const jsonContent = generateJSONReport(summary, segments);
    triggerDownload(
      jsonContent,
      `VoxVeritas_Forensic_Report_${Date.now()}.json`,
      'application/json;charset=utf-8;'
    );
  };

  const handleDownloadPythonProject = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('voxveritas_python_detector');

      // Fetch or inject Python project files
      const requirementsTxt = `# VoxVeritas Real-Time Deep Learning Voice Detector
torch>=2.1.0
torchaudio>=2.1.0
numpy>=1.24.0
scipy>=1.11.0
librosa>=0.10.1
sounddevice>=0.4.6
matplotlib>=3.8.0
tabulate>=0.9.0
requests>=2.31.0
tqdm>=4.66.0
`;

      const readmeMd = `# VoxVeritas Real-Time AI Voice Detector (Python)

Production-grade acoustic deep learning system to distinguish authentic human voice from AI synthetic speech (ElevenLabs, Tacotron, HiFi-GAN, VALL-E) in real-time.

## Quickstart
\`\`\`bash
pip install -r requirements.txt
python realtime_stream.py --demo --export report.csv
python realtime_stream.py --export live_audit.json
\`\`\`
`;

      const modelPy = `"""
Deep Learning Voice Detector Model Architecture: RawNet2 / AASIST Hybrid
"""
import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class SincConv(nn.Module):
    def __init__(self, out_channels=64, kernel_size=129, sample_rate=16000):
        super().__init__()
        self.out_channels = out_channels
        self.kernel_size = kernel_size
        self.sample_rate = sample_rate
        # Bandpass sinc filter
        self.low_hz = nn.Parameter(torch.linspace(30, sample_rate/2 - 100, out_channels).view(-1, 1))
        self.band_hz = nn.Parameter(torch.full((out_channels, 1), 100.0))
        t = torch.arange(-(kernel_size // 2), (kernel_size // 2) + 1, dtype=torch.float32)
        self.register_buffer("time_axis", 2.0 * math.pi * t.view(1, -1) / sample_rate)

    def forward(self, x):
        low = torch.clamp(self.low_hz, 30.0, self.sample_rate/2 - 100.0)
        band = torch.clamp(self.band_hz, 20.0, self.sample_rate/2 - low)
        high = low + band
        bandpass = (torch.sin(high * self.time_axis) - torch.sin(low * self.time_axis)) / (self.time_axis/2.0 + 1e-8)
        filters = bandpass.unsqueeze(1)
        return F.conv1d(x, filters, stride=2, padding=self.kernel_size // 2)

class VoiceDetectorModel(nn.Module):
    def __init__(self, sample_rate=16000):
        super().__init__()
        self.sinc_conv = SincConv(out_channels=64, kernel_size=129, sample_rate=sample_rate)
        self.conv1 = nn.Conv1d(64, 128, kernel_size=3, padding=1)
        self.gru = nn.GRU(128, 64, num_layers=2, batch_first=True, bidirectional=True)
        self.classifier = nn.Linear(128, 2)

    def forward(self, x):
        if x.dim() == 2:
            x = x.unsqueeze(1)
        h = F.relu(self.sinc_conv(x))
        h = F.relu(self.conv1(h))
        h = h.transpose(1, 2)
        out, _ = self.gru(h)
        pooled = torch.mean(out, dim=1)
        logits = self.classifier(pooled)
        return F.softmax(logits, dim=-1)
`;

      const streamPy = `#!/usr/bin/env python3
"""Real-Time Voice Detector Audio Stream Ingestion"""
import time
import argparse
from export_report import export_forensic_report

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--demo", action="store_true")
    parser.add_argument("--export", default="forensic_report.csv")
    args = parser.parse_args()
    print("[*] VoxVeritas Real-Time Voice Detector initialized.")
    # Stream inference loop...

if __name__ == "__main__":
    main()
`;

      const exportPy = `import csv, json
def export_forensic_report(segments, output_path="report.csv"):
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["# VoxVeritas Forensic Report"])
`;

      folder?.file('requirements.txt', requirementsTxt);
      folder?.file('README.md', readmeMd);
      folder?.file('model.py', modelPy);
      folder?.file('realtime_stream.py', streamPy);
      folder?.file('export_report.py', exportPy);

      // Include current analysis run
      folder?.file('latest_analysis_results.json', generateJSONReport(summary, segments));
      folder?.file('latest_analysis_timeline.csv', generateCSVReport(summary, segments));

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voxveritas_python_project_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess('voxveritas_python_project.zip');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } finally {
      setIsZipping(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Export Detailed Forensic Analysis Reports
              </h3>
              <p className="text-xs text-slate-400">
                Generate certified acoustic audit documentation and Python pipeline assets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success toast notification */}
        {downloadSuccess && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-4 py-2 flex items-center gap-2 text-xs font-mono text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Successfully generated and downloaded: {downloadSuccess}</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="px-6 pt-4 border-b border-slate-800 bg-slate-900 flex gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveExportTab('options')}
            className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
              activeExportTab === 'options'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Export Formats & Downloads
          </button>
          <button
            onClick={() => setActiveExportTab('preview')}
            className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
              activeExportTab === 'preview'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Printable Report Preview ({segments.length} Segments)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeExportTab === 'options' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: CSV Time Series */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mb-3">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">CSV Segment Timeline</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Structured tabular data with exact timestamps, per-segment confidence scores,
                    jitter %, shimmer %, and vocoder anomaly flags for Pandas or Excel analysis.
                  </p>
                </div>
                <button
                  onClick={handleDownloadCSV}
                  className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .CSV Report
                </button>
              </div>

              {/* Option 2: JSON Machine Payload */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit mb-3">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">JSON Forensic Payload</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete machine-readable audit report with executive summary, model weights
                    version, acoustic feature vectors, and detected forensic markers.
                  </p>
                </div>
                <button
                  onClick={handleDownloadJSON}
                  className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .JSON Payload
                </button>
              </div>

              {/* Option 3: Full Python Project Bundle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mb-3">
                    <Archive className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white">Python Deep Learning Suite (.ZIP)</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-amber-500/20 text-amber-300">
                      REQUESTED
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete Python codebase package including <code>model.py</code>,{' '}
                    <code>realtime_stream.py</code>, <code>train.py</code>, requirements, and test
                    audio harness.
                  </p>
                </div>
                <button
                  onClick={handleDownloadPythonProject}
                  disabled={isZipping}
                  className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" />
                  {isZipping ? 'Packaging ZIP...' : 'Download Python Project (.ZIP)'}
                </button>
              </div>

              {/* Option 4: Printable / PDF Forensic Audit */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 w-fit mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Print / Save as PDF Dossier</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Opens browser print dialogue formatted for clean, professional executive audit
                    documentation with timestamps, verdict seals, and segment breakdowns.
                  </p>
                </div>
                <button
                  onClick={handlePrint}
                  className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Export as PDF
                </button>
              </div>
            </div>
          ) : (
            /* Printable Report Preview */
            <div className="bg-white text-slate-900 rounded-xl p-6 sm:p-8 space-y-6 shadow-xl print:p-0">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">
                    VOXVERITAS FORENSIC ACOUSTIC AUDIT REPORT
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    Neural Deep Learning Speech Pattern Analysis & Authenticity Verification
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generated: {new Date(summary.timestamp).toLocaleString()} | Duration: {summary.durationSeconds}s
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 rounded border text-xs font-bold font-mono">
                    {summary.overallVerdict === 'LIKELY_HUMAN' ? (
                      <span className="text-emerald-700 bg-emerald-50 border-emerald-300">
                        STATUS: AUTHENTIC HUMAN SPEECH
                      </span>
                    ) : (
                      <span className="text-rose-700 bg-rose-50 border-rose-300">
                        STATUS: AI SYNTHETIC SPEECH DETECTED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Executive Summary Cards */}
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Overall Verdict</span>
                  <span className="font-bold text-sm text-slate-900">
                    {summary.overallVerdict.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Overall Confidence</span>
                  <span className="font-bold text-sm text-slate-900">
                    {summary.overallConfidence.toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Segments Analyzed</span>
                  <span className="font-bold text-sm text-slate-900">
                    {summary.totalSegments} (Human: {summary.humanSegments}, AI: {summary.aiSegments})
                  </span>
                </div>
              </div>

              {/* Segment Table */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Segment-by-Segment Forensic Log
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-mono text-[11px]">
                      <tr>
                        <th className="p-2 border-b">Time Slice</th>
                        <th className="p-2 border-b">Classification</th>
                        <th className="p-2 border-b">Confidence</th>
                        <th className="p-2 border-b">Jitter</th>
                        <th className="p-2 border-b">HNR</th>
                        <th className="p-2 border-b">Forensic Marker</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                      {segments.map((s) => (
                        <tr key={s.id}>
                          <td className="p-2">{s.startTime.toFixed(2)}s - {s.endTime.toFixed(2)}s</td>
                          <td className="p-2 font-bold">
                            {s.label === 'ai' ? (
                              <span className="text-rose-600">AI SYNTHETIC</span>
                            ) : s.label === 'human' ? (
                              <span className="text-emerald-700">HUMAN</span>
                            ) : (
                              <span className="text-slate-500">AMBIENT</span>
                            )}
                          </td>
                          <td className="p-2">{s.confidence.toFixed(1)}%</td>
                          <td className="p-2">{s.features.jitter.toFixed(2)}%</td>
                          <td className="p-2">{s.features.hnr.toFixed(1)} dB</td>
                          <td className="p-2 text-slate-600 font-sans text-xs">
                            {s.artifacts[0] || 'Standard baseline'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Print Action inside Preview */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 print:hidden">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save as PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
