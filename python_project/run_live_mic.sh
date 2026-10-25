#!/bin/bash
# VoxVeritas - Run Live Microphone Deep Learning Detection
echo "=========================================================="
echo " VoxVeritas - Live Microphone Real-Time Voice Detector"
echo "=========================================================="

if [ -d "venv" ]; then
    source venv/bin/activate
fi

python3 realtime_stream.py --export live_mic_audit_report.json
