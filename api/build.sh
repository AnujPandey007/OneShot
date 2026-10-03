#!/usr/bin/env bash
set -euo pipefail
python -m pip install -r requirements.txt
if [ "${USE_DEMO_DATA:-false}" = "true" ]; then
  python train.py --data data/demo.json --demo
else
  python train.py --data data/blogs.json
fi
