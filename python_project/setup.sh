#!/bin/bash
# VoxVeritas - 1-Click Environment Setup Script
echo "=========================================================="
echo " Setting up VoxVeritas Python Deep Learning Environment"
echo "=========================================================="

python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "=========================================================="
echo " Setup Complete! You can now run:"
echo "   ./run_demo.sh"
echo "   ./run_live_mic.sh"
echo "=========================================================="
