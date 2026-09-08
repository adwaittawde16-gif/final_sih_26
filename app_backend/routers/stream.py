"""
app_backend/routers/stream.py
-----------------------------
Server-Sent Events (SSE) Real-Time Intelligence Event Stream.

Simulates live incoming wiretap intercepts, CCTV facial recognitions,
Hawala money transfers, and surveillance alerts in real-time.
"""

import asyncio
import json
import random
from datetime import datetime
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/stream", tags=["Real-Time Intelligence Event Stream"])

EVENT_TEMPLATES = [
    {
        "type": "NOCTURNAL_CALL_INTERCEPT",
        "severity": "CRITICAL",
        "title": "Nocturnal Wiretap Intercept (02:45 IST)",
        "suspect": "Md. Ranbir Bhalla",
        "peer": "Md Hardik Kant",
        "location": "Venus Wine Shop, Dadar",
        "summary": "High-priority call intercepted (340s) discussing cash delivery and country-made firearm."
    },
    {
        "type": "CCTV_FACIAL_RECOGNITION",
        "severity": "HIGH",
        "title": "CCTV Optical Match (94.2% Confidence)",
        "suspect": "Md Hardik Kant",
        "peer": "Md Aarnav Chaudhry",
        "location": "Byculla Central Camera #MH-9890",
        "summary": "Co-accused meeting detected on camera; physical rendezvous confirmed."
    },
    {
        "type": "FINANCIAL_SMURFING_ALERT",
        "severity": "CRITICAL",
        "title": "Hawala / Mule Structuring Transfer",
        "suspect": "Md. Ranbir Bhalla",
        "peer": "Angadia Courier Agent",
        "location": "Lower Parel / Zaveri Bazaar",
        "summary": "Structuring transfer of ₹49,500 routed via IMPS just below KYC mandatory reporting cap."
    },
    {
        "type": "OSINT_SOCIAL_MEDIA_PING",
        "severity": "MODERATE",
        "title": "Dark Web / Encrypted Chat Alias Detected",
        "suspect": "Md. Azad Mannan",
        "peer": "Unknown Handler",
        "location": "Kurla West",
        "summary": "Burner device SIM-swap ping registered with encrypted Telegram group alias 'Tiger99'."
    },
    {
        "type": "FIELD_SURVEILLANCE_PANCHNAMA",
        "severity": "HIGH",
        "title": "Quick Response Team Surveillance Report",
        "suspect": "Md. Vedant Padmanabhan",
        "peer": "Md. Teerth Bhargava",
        "location": "Station Road Footpath, Dadar",
        "summary": "Physical reconnaissance of commercial jewellery shop noted by undercover field unit."
    }
]

async def event_generator():
    event_id = 1000
    while True:
        await asyncio.sleep(4.0)
        event_id += 1
        template = random.choice(EVENT_TEMPLATES)
        event_payload = {
            "id": f"LIVE-EVT-{event_id}",
            "timestamp": datetime.now().strftime("%H:%M:%S IST"),
            "event_type": template["type"],
            "severity": template["severity"],
            "title": template["title"],
            "suspect": template["suspect"],
            "peer": template["peer"],
            "location": template["location"],
            "summary": template["summary"]
        }
        yield f"data: {json.dumps(event_payload)}\n\n"

@router.get("/events", summary="Subscribe to live Server-Sent Events (SSE) stream of criminal alerts")
async def stream_live_events():
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
        }
    )
