import { NextResponse } from "next/server";

const events = [
  {
    id: "evt-2409",
    event_type: "CROSS_DOMAIN_ASSOCIATION",
    severity: "CRITICAL",
    subject_id: "Subject M-047",
    detail: "CDR, CCTV, and financial signals intersect within 1.8 km.",
    source_system: "correlation-engine",
    timestamp: "2026-09-08T18:42:00+05:30",
  },
  {
    id: "evt-2408",
    event_type: "NIGHT_MOVEMENT_ANOMALY",
    severity: "HIGH",
    subject_id: "Subject R-112",
    detail: "Four late-hour tower transitions detected across two jurisdictions.",
    source_system: "cdr-stream",
    timestamp: "2026-09-08T18:39:00+05:30",
  },
];

export const dynamic = "force-dynamic";

export function GET() {
  const event = events[Math.floor(Date.now() / 15000) % events.length];

  return NextResponse.json(event, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
