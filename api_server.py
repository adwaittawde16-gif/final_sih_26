"""
api_server.py
------------
Production REST API Server entrypoint exposing app_backend FastAPI application.

Part of: CDR & CCTV Intelligence & Threat Analysis System
For: Brihanmumbai Police Department — SIH 26
"""

import sys
import uvicorn
from app_backend.main import app

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def run_server(port=8080):
    print(f"[*] Initializing Brihanmumbai Police Intelligence API (FastAPI v2.0)...")
    print(f"[OK] Server starting on http://localhost:{port}")
    print(f"     OpenAPI Interactive Docs available at: http://localhost:{port}/docs")
    uvicorn.run(app, host="0.0.0.0", port=port)

if __name__ == '__main__':
    run_server(8080)
