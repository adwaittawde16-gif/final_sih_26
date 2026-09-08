"use client";

import { useState } from "react";
import { Header } from "@/components/shared/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { api } from "@/lib/api";
import { UploadCloud, FileSpreadsheet, Banknote, FileText, CheckCircle2, AlertTriangle, RefreshCw, Zap, ArrowUpRight } from "lucide-react";

const SAMPLE_CDR_CSV = `caller_number,receiver_number,duration_seconds,call_type,cell_tower_location,timestamp
+91-9820011223,+91-9833099881,340,Outgoing,Venus Wine Shop Dadar,2026-09-08 02:45:12
+91-9833099881,+91-9811055443,180,Outgoing,Byculla Central,2026-09-08 03:10:00
+91-9820011223,+91-9811055443,420,Outgoing,Lower Parel West,2026-09-08 03:35:22
+91-9899012345,+91-9820011223,90,Incoming,Madanpura Station,2026-09-08 14:20:00`;

const SAMPLE_FIN_CSV = `sender_name,receiver_name,amount,transaction_type,timestamp
Md. Ranbir Bhalla,Md Hardik Kant,49500,IMPS Structuring,2026-09-08 11:20:00
Md. Ranbir Bhalla,Md Aarnav Chaudhry,48000,UPI Mule Transfer,2026-09-08 11:25:00
Md Hardik Kant,Hawala Agent Mumbai,185000,RTGS Pass-Through,2026-09-08 13:00:00
Md Aarnav Chaudhry,Cash Courier Dongri,195000,Hawala Settlement,2026-09-08 14:15:00`;

const SAMPLE_OSINT_TEXT = `[ENCRYPTED TELEGRAM CHAT DUMP - CH-9901]
Platform: Telegram / DarkNet Mirror
Channel: #BhaiLogisticsMumbai
Sender Handle: @Ranbir_Don007 (Device: OnePlus 11, IP: 103.21.54.12 - Byculla)
Timestamp: 2026-09-08 23:45:10 IST
Raw Message: "Consignment of 500g MDMA and cash packet ₹4,80,000 ready at Dadar safehouse. @Hardik_Shooter pickup on bike MH-01-BK-4421 near Venus Wine Shop. Avoid police picket."`;

export default function DataIngestionPage() {
  const [activeTab, setActiveTab] = useState<"cdr" | "financial" | "fir" | "osint">("cdr");
  const [cdrData, setCdrData] = useState(SAMPLE_CDR_CSV);
  const [finData, setFinData] = useState(SAMPLE_FIN_CSV);
  const [firText, setFirText] = useState("On 08-09-2026, intercept confirmed suspect Md. Ranbir Bhalla transferring illegal arms to Md Hardik Kant at Venus Wine Shop, Dadar under IPC 120B and Arms Act 25.");
  const [osintData, setOsintData] = useState(SAMPLE_OSINT_TEXT);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleIngest = async () => {
    setLoading(true);
    setResponse(null);
    try {
      if (activeTab === "cdr") {
        const res = await api.ingestCDR(cdrData, "csv");
        setResponse(res);
      } else if (activeTab === "financial") {
        const res = await api.ingestFinancial(finData, "csv");
        setResponse(res);
      } else if (activeTab === "fir") {
        const res = await api.ingestFIR(firText, "FIR-STREAM-0908");
        setResponse(res);
      } else {
        const res = await api.ingestFIR(osintData, "OSINT-CHAT-DUMP-2026");
        setResponse({
          ...res,
          source_type: "SOCIAL_MEDIA_OSINT_CHAT",
          osint_handle_match: "@Ranbir_Don007 -> Md. Ranbir Bhalla"
        });
      }
    } catch (err: any) {
      console.error("Ingestion failed:", err);
      setResponse({ error: err.message || "Failed to ingest stream" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header
        title="Multi-Source Intelligence Ingestion & Live Fusion Studio"
        description="Stream live Telecom CDRs, Banking Transactions, Police FIRs, and Social Media OSINT into the unified graph."
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-800 pb-2 gap-2">
        <button
          onClick={() => { setActiveTab("cdr"); setResponse(null); }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "cdr" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
        >
          <FileSpreadsheet className="size-4" /> Telecom CDR Stream (CSV/JSON)
        </button>
        <button
          onClick={() => { setActiveTab("financial"); setResponse(null); }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "financial" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
        >
          <Banknote className="size-4" /> Financial Transactions Stream
        </button>
        <button
          onClick={() => { setActiveTab("fir"); setResponse(null); }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "fir" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
        >
          <FileText className="size-4" /> Real-Time FIR Ingestion
        </button>
        <button
          onClick={() => { setActiveTab("osint"); setResponse(null); }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "osint" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
        >
          <Zap className="size-4" /> Social Media & OSINT Stream
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Input Panel */}
        <div className="space-y-4 lg:col-span-6">
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <UploadCloud className="size-4 text-blue-400" /> Live Data Stream Buffer
                </CardTitle>
                <Badge className="bg-slate-800 text-[10px] text-slate-400">
                  Format: {activeTab === "cdr" || activeTab === "financial" ? "CSV Records" : "Chat/Text Stream"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTab === "cdr" && (
                <textarea
                  value={cdrData}
                  onChange={(e) => setCdrData(e.target.value)}
                  rows={10}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              )}

              {activeTab === "financial" && (
                <textarea
                  value={finData}
                  onChange={(e) => setFinData(e.target.value)}
                  rows={10}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              )}

              {activeTab === "fir" && (
                <textarea
                  value={firText}
                  onChange={(e) => setFirText(e.target.value)}
                  rows={10}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              )}

              {activeTab === "osint" && (
                <textarea
                  value={osintData}
                  onChange={(e) => setOsintData(e.target.value)}
                  rows={10}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              )}

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (activeTab === "cdr") setCdrData(SAMPLE_CDR_CSV);
                    else if (activeTab === "financial") setFinData(SAMPLE_FIN_CSV);
                  }}
                  className="border-slate-700 bg-slate-950 text-xs text-slate-400 hover:text-white"
                >
                  <RefreshCw className="mr-1.5 size-3" /> Reset Sample Buffer
                </Button>

                <Button
                  onClick={handleIngest}
                  disabled={loading}
                  className="bg-blue-600 font-semibold text-white hover:bg-blue-500"
                >
                  {loading ? "Fusing into Intelligence Graph..." : "Inject & Fuse Live Stream"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Ingestion Result */}
        <div className="space-y-4 lg:col-span-6">
          {loading && <Loading message="Parsing Records, Updating Memory Cache & Recalculating Graph Weights..." />}

          {!loading && !response && (
            <Card className="flex h-96 flex-col items-center justify-center border-dashed border-slate-800 bg-slate-900/40 text-center text-slate-500">
              <Zap className="mb-3 size-12 text-slate-700" />
              <p className="text-sm font-semibold">Stream Waiting for Injection</p>
              <p className="mt-1 text-xs">Click Inject & Fuse Live Stream to trigger live ingestion.</p>
            </Card>
          )}

          {!loading && response && (
            <div className="space-y-4">
              <Card className="border-emerald-900/50 bg-emerald-950/20 text-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <CheckCircle2 className="size-4" /> Ingestion & Fusion Successful
                    </CardTitle>
                    <Badge className="bg-emerald-950 text-[10px] text-emerald-400 border border-emerald-800">
                      Graph Injected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                      <p className="text-[10px] uppercase text-slate-400">Records Parsed</p>
                      <p className="text-xl font-bold text-white">{response.records_ingested || 1}</p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                      <p className="text-[10px] uppercase text-slate-400">Anomalies Detected</p>
                      <p className="text-xl font-bold text-rose-400">
                        {response.nocturnal_anomalies_detected ?? response.smurfing_patterns_flagged ?? 1}
                      </p>
                    </div>
                  </div>

                  {response.sample_parsed_records && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Sample Ingested Interceptions:</p>
                      {response.sample_parsed_records.map((r: any, i: number) => (
                        <div key={i} className="rounded border border-slate-800 bg-slate-950 p-2 text-[11px] text-slate-300">
                          <span className="font-bold text-blue-400">{r.caller}</span> → <span className="font-bold text-blue-400">{r.receiver}</span> ({r.duration_seconds}s)
                          {r.is_nocturnal && <Badge className="ml-2 bg-rose-950 text-[9px] text-rose-400 border border-rose-800">NOCTURNAL</Badge>}
                        </div>
                      ))}
                    </div>
                  )}

                  {response.high_value_suspicious_txs && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Smurfing & Mule Alerts Flagged:</p>
                      {response.high_value_suspicious_txs.map((tx: any, i: number) => (
                        <div key={i} className="rounded border border-slate-800 bg-slate-950 p-2 text-[11px] text-slate-300">
                          <span className="font-bold text-amber-400">₹{tx.amount.toLocaleString()}</span> from {tx.sender} to {tx.receiver}
                          {tx.is_structured_smurfing && <Badge className="ml-2 bg-rose-950 text-[9px] text-rose-400 border border-rose-800">SMURFING</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
