#!/bin/bash
# VoxVeritas - Run Real-Time Streaming Demonstration
echo "=========================================================="
echo " Starting VoxVeritas Real-Time Deep Learning Voice Detector"
echo "=========================================================="

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "[!] Python 3 could not be found. Please install Python 3.9+."
    exit 1
fi

# Activate virtual environment if present
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run real-time streaming demonstration
python3 realtime_stream.py --demo --export detailed_forensic_report.csv
