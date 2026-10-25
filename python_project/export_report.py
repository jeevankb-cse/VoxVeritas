"""
Forensic Analysis Report Generator (Python)
Outputs detailed reports in CSV, JSON, and text/HTML format with confidence scores per segment.
"""

import json
import csv
from typing import List, Dict, Any

def export_forensic_report(segments: List[Dict[str, Any]], output_path: str = "report.csv"):
    """
    Exports detailed analysis report based on file extension (.csv, .json, .txt).
    """
    if output_path.endswith(".json"):
        _export_json(segments, output_path)
    elif output_path.endswith(".csv"):
        _export_csv(segments, output_path)
    else:
        _export_text_summary(segments, output_path)

def _export_csv(segments: List[Dict[str, Any]], output_path: str):
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["# VoxVeritas Forensic Voice Analysis Report"])
        writer.writerow([
            "Segment_Index",
            "Start_Time_Sec",
            "End_Time_Sec",
            "Classification",
            "Confidence_Pct",
            "AI_Probability",
            "Human_Probability",
            "Pitch_Jitter_Pct",
            "Amplitude_Shimmer_Pct",
            "HNR_dB",
            "Artifacts"
        ])
        for s in segments:
            writer.writerow([
                s.get("index", 0),
                f"{s.get('start_time', 0.0):.2f}",
                f"{s.get('end_time', 0.0):.2f}",
                s.get("label", "unknown").upper(),
                f"{s.get('confidence', 0.0):.1f}",
                f"{s.get('ai_probability', 0.0):.3f}",
                f"{s.get('human_probability', 0.0):.3f}",
                f"{s.get('jitter', 0.0):.2f}",
                f"{s.get('shimmer', 0.0):.2f}",
                f"{s.get('hnr', 0.0):.1f}",
                "; ".join(s.get("artifacts", []))
            ])

def _export_json(segments: List[Dict[str, Any]], output_path: str):
    ai_count = sum(1 for s in segments if s.get("label") == "ai")
    human_count = sum(1 for s in segments if s.get("label") == "human")
    total = len(segments)

    verdict = "LIKELY_AI_SYNTHETIC" if ai_count > human_count else "LIKELY_HUMAN"
    summary = {
        "engine": "VoxVeritas Real-Time Deep Learning Voice Detector",
        "total_segments": total,
        "ai_synthetic_segments": ai_count,
        "human_segments": human_count,
        "overall_verdict": verdict,
        "overall_confidence": round((max(ai_count, human_count) / max(1, total)) * 100, 1),
        "segments": segments
    }
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

def _export_text_summary(segments: List[Dict[str, Any]], output_path: str):
    ai_count = sum(1 for s in segments if s.get("label") == "ai")
    human_count = sum(1 for s in segments if s.get("label") == "human")
    total = len(segments)
    verdict = "LIKELY AI SYNTHETIC (DEEPFAKE)" if ai_count > human_count else "LIKELY AUTHENTIC HUMAN VOICE"

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("=" * 60 + "\n")
        f.write("      VOXVERITAS FORENSIC VOICE ANALYSIS AUDIT REPORT\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Overall Verdict: {verdict}\n")
        f.write(f"Analyzed Segments: {total} (Human: {human_count}, AI Synthetic: {ai_count})\n")
        f.write("-" * 60 + "\n")
        f.write(f"{'Time Range':16} | {'Label':12} | {'Confidence':10} | {'Jitter':8}\n")
        f.write("-" * 60 + "\n")
        for s in segments:
            time_str = f"{s.get('start_time', 0.0):.2f}s - {s.get('end_time', 0.0):.2f}s"
            f.write(f"{time_str:16} | {s.get('label', 'unknown').upper():12} | {s.get('confidence', 0.0):5.1f}%     | {s.get('jitter', 0.0):4.2f}%\n")
        f.write("=" * 60 + "\n")
