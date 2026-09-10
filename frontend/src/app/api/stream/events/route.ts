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
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      let index = 0;
      const send = () => {
        const event = events[index % events.length];
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        index += 1;
      };

      send();
      controller.enqueue(encoder.encode(": connected\n\n"));
    },
    cancel() {},
  });

  return new NextResponse(body, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
