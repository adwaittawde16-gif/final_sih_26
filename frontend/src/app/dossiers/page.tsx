"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { AlertsResponse, SuspectDossierDetails, SearchResultResponse, TimelineResponse, FIRNLPResponse } from "@/types";
import {
  Bell,
  Search,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  ShieldAlert,
  Sparkles,
  UserCheck,
  MapPin,
  Scale,
  Phone,
  AlertTriangle,
  ExternalLink
} from "lucide-react";

// Preset Sample FIR Narratives for Quick Testing
const SAMPLE_FIRS = [
  {
    title: "FIR #0254/2026 — Byculla Extortion",
    number: "FIR-0254/2026",
    text: "FIR #0254/2026 registered at Byculla Police Station. Accused Md. Ranbir Bhalla along with co-accused Md. Teerth Bhargava and Md. Vedant Padmanabhan were observed operating near Station Road Footpath and Venus Wine Shop under IPC Section 384 (Extortion) and Section 307 (Attempt to Murder). Active phone +91-2236381844 detected during incident."
  },
  {
    title: "FIR #0118/2026 — Hawala & Smurfing Ring",
    number: "FIR-0118/2026",
    text: "Investigation under IPC Section 420 (Cheating & Financial Fraud) at Lower Parel. Suspect Md. Advik Golla assisted by Md. Darsh Sampath transferred illegal Hawala cash via mule accounts to Venus Wine Shop. Primary phone +91-0751400478 used for coordination."
  },
  {
    title: "FIR #0089/2026 — Arms Possession & Assault",
    number: "FIR-0089/2026",
    text: "Special Branch report filed at Kurla Station. Suspect Md. Azad Mannan and co-accused Md. Indrajit Kunda caught with unlicensed firearms under Arms Act Section 25 and IPC Section 326 near LBS Marg, Kurla West. Associated mobile: +91-8472516266."
  }
];

function FIRParserTool() {
  const [firText, setFirText] = useState(SAMPLE_FIRS[0].text);
  const [firNumber, setFirNumber] = useState(SAMPLE_FIRS[0].number);
  const [result, setResult] = useState<FIRNLPResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleExtract(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!firText.trim()) return;
    try {
      setLoading(true);
      const res = await api.extractFIRNLP(firText.trim(), firNumber.trim());
      setResult(res);
    } catch (err: any) {
      alert("NLP Extraction Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function loadSample(sample: typeof SAMPLE_FIRS[0]) {
    setFirNumber(sample.number);
    setFirText(sample.text);
    setResult(null);
  }

  return (
    <Card className="space-y-4 bg-slate-900 border-slate-800 text-white p-4 shadow-xl">
      <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2 font-mono">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            NLP FIR ENTITY & CO-ACCUSED EXTRACTOR
          </h3>
          <p className="text-[10px] text-slate-400">Automated Natural Language Parsing for Suspects, Co-Accused, Locations & IPC Sections</p>
        </div>
        <span className="text-[10px] text-purple-400 font-bold bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded">
          NLP ENGINE ACTIVE
        </span>
      </div>

      {/* Preset FIR Loaders */}
      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
        <span className="text-slate-500 font-bold mr-1">Load Preset FIR:</span>
        {SAMPLE_FIRS.map((s, i) => (
          <button
            key={i}
            onClick={() => loadSample(s)}
            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:border-purple-500 hover:text-white transition-all truncate max-w-[200px]"
          >
            {s.title}
          </button>
        ))}
      </div>

      <form onSubmit={handleExtract} className="space-y-3 font-mono text-xs">
        <div className="flex gap-2">
          <input
            type="text"
            value={firNumber}
            onChange={(e) => setFirNumber(e.target.value)}
            placeholder="FIR Number e.g. FIR-0254/2026"
            className="w-1/3 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
          />
          <Button type="submit" disabled={loading} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono">
            {loading ? "Parsing FIR Text..." : "⚡ Extract Entities & IPC Sections"}
          </Button>
        </div>
        <textarea
          rows={3}
          value={firText}
          onChange={(e) => setFirText(e.target.value)}
          placeholder="Paste raw FIR narrative text..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white font-mono focus:border-purple-500 focus:outline-none leading-relaxed"
        />
      </form>

      {/* Extracted NLP Results */}
      {result && (
        <div className="space-y-3 pt-3 border-t border-slate-800 font-mono text-xs">
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-purple-950/80 text-purple-300 border border-purple-700/60 rounded font-bold flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-purple-400" /> Primary Suspects: {result.suspects.join(", ") || "None"}
            </span>
            <span className="px-2.5 py-1 bg-amber-950/80 text-amber-300 border border-amber-700/60 rounded font-bold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-400" /> Co-Accused: {result.co_accused.join(", ") || "None"}
            </span>
            <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" /> Locations: {result.locations.join(", ") || "None"}
            </span>
            <span className="px-2.5 py-1 bg-red-950/80 text-red-300 border border-red-700/60 rounded font-bold flex items-center gap-1">
              <Scale className="w-3 h-3 text-red-400" /> M.O. / IPC: {result.crime_types.join(", ") || "None"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {result.entities.map((e, idx) => (
              <div key={idx} className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-0.5 text-[11px]">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">{e.category}</span>
                <p className="font-bold text-white truncate">{e.text}</p>
                <span className="text-[9px] text-emerald-400">{(e.confidence * 100).toFixed(0)}% Confidence</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function ForensicTimeline({ suspectName }: { suspectName: string }) {
  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTimeline() {
      try {
        setLoading(true);
        const data = await api.getSuspectTimeline(suspectName);
        setTimeline(data);
      } catch (err) {
        console.error("Error loading timeline:", err);
      } finally {
        setLoading(false);
      }
    }
    if (suspectName) {
      loadTimeline();
    }
  }, [suspectName]);

  if (loading) {
    return (
      <Card className="p-4 bg-slate-900 border-slate-800 text-xs font-mono text-slate-400">
        Loading multi-source forensic timeline for {suspectName}...
      </Card>
    );
  }

  if (!timeline || timeline.events.length === 0) {
    return (
      <Card className="p-4 bg-slate-900 border-slate-800 text-xs font-mono text-slate-400">
        No forensic timeline events recorded for {suspectName}.
      </Card>
    );
  }

  const filteredEvents = activeFilter === "ALL"
    ? timeline.events
    : timeline.events.filter(e => e.source_module === activeFilter);

  return (
    <Card className="space-y-4 bg-slate-900 border-slate-800 text-white p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 font-mono">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            INTERACTIVE FORENSIC TIMELINE ({filteredEvents.length} events)
          </h3>
          <p className="text-[10px] text-slate-400">Multi-source activity sequence across FIR, CDR, CCTV & Financial logs</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {["ALL", "FIR", "CDR", "CCTV", "FINANCIAL"].map((mod) => (
            <button
              key={mod}
              onClick={() => setActiveFilter(mod)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                activeFilter === mod
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 max-h-[420px] overflow-y-auto pr-2">
        {filteredEvents.map((evt) => {
          const isExpanded = expandedEventId === evt.event_id;
          return (
            <div key={evt.event_id} className="relative group">
              <span
                className="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-900 shadow-md"
                style={{ backgroundColor: evt.color || "#38bdf8" }}
              />
              <div
                onClick={() => setExpandedEventId(isExpanded ? null : evt.event_id)}
                className="p-3 bg-slate-950 hover:bg-slate-800/80 rounded-lg border border-slate-800 cursor-pointer transition-colors space-y-1 font-mono text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                      style={{ backgroundColor: evt.color || "#38bdf8" }}
                    >
                      {evt.source_module}
                    </span>
                    <strong className="text-white font-bold">{evt.title}</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                    {evt.timestamp}
                    {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{evt.description}</p>

                {isExpanded && evt.metadata && Object.keys(evt.metadata).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800 bg-slate-900 p-2 rounded text-[10px] space-y-1">
                    <span className="font-bold text-blue-400">Event Metadata:</span>
                    <pre className="text-[10px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto">
                      {JSON.stringify(evt.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DossiersContent() {
  const searchParams = useSearchParams();
  const initialSuspect = searchParams.get("suspect") || "Md. Ranbir Bhalla";
  const initialQuery = searchParams.get("search") || "";

  const [selectedSuspect, setSelectedSuspect] = useState(initialSuspect);
  const [dossier, setDossier] = useState<SuspectDossierDetails | null>(null);
  const [alerts, setAlerts] = useState<AlertsResponse | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    loadDossierAndAlerts(selectedSuspect);
  }, [selectedSuspect]);

  async function loadDossierAndAlerts(name: string) {
    try {
      setLoading(true);
      const [dossierRes, alertRes] = await Promise.all([
        api.getSuspectDossier(name).catch(() => null),
        api.getAlerts().catch(() => null)
      ]);
      setDossier(dossierRes);
      setAlerts(alertRes);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const res = await api.searchIntelligence(searchQuery.trim());
      setSearchResults(res);
    } catch (err: any) {
      alert("Search error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadDossier() {
    if (!dossier) return;
    const content = dossier.dossier_markdown || `# Police Dossier: ${dossier.suspect_name}\n\nThreat Score: ${dossier.threat_score}`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${dossier.suspect_name.replace(/[^a-z0-9]/gi, "_")}_Dossier.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      <Header
        title="Module 8 — 360° Suspect Dossiers & Alert Feed"
        subtitle="Automated intelligence dossier compilation, cross-database search, and real-time police alert feed."
      />

      {/* Multi-Source Search Bar */}
      <Card className="bg-slate-900 border-slate-800 text-white p-4 shadow-xl">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across FIRs, CDR call logs, and CCTV sightings (e.g. Byculla, Bhalla)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold">
            Execute Query
          </Button>
        </form>

        {searchResults && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>Query: <strong className="text-white">"{searchResults.query}"</strong></span>
              <span>Total Matches: <strong className="text-emerald-400 font-bold">{searchResults.total_matches}</strong></span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">FIR Matches: <strong className="text-white">{searchResults.fir_matches.length}</strong></div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">CDR Matches: <strong className="text-white">{searchResults.cdr_matches.length}</strong></div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">CCTV Matches: <strong className="text-white">{searchResults.cctv_matches.length}</strong></div>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dossier Viewer */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="space-y-4 bg-slate-900 border-slate-800 text-white p-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div>
                <Badge variant="critical" className="mb-1 bg-red-600 border border-red-400">CONFIDENTIAL POLICE DOSSIER</Badge>
                <h3 className="text-xl font-bold text-white font-mono">{dossier?.suspect_name || selectedSuspect}</h3>
                <p className="text-xs font-mono text-slate-400">
                  {dossier?.phone_number || "N/A"} · Threat Score: <strong className="text-red-400 font-bold">{dossier?.threat_score != null ? dossier.threat_score.toFixed(1) : "N/A"}</strong>/100
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono text-xs text-slate-400 space-y-0.5">
                  <div>FIR Records: <span className="text-white font-bold">{dossier?.fir_matches_count ?? 0}</span></div>
                  <div>CCTV Matches: <span className="text-white font-bold">{dossier?.cctv_meetings_count ?? 0}</span></div>
                  <div>CDR Calls: <span className="text-white font-bold">{dossier?.cdr_calls_count ?? 0}</span></div>
                </div>

                <Button
                  onClick={handleDownloadDossier}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export .MD
                </Button>
              </div>
            </div>

            {/* Dossier Markdown View */}
            <div className="prose max-w-none text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-y-auto max-h-[350px] whitespace-pre-wrap text-slate-200 leading-relaxed">
              {dossier?.dossier_markdown || "Loading confidential dossier content..."}
            </div>
          </Card>

          {/* Interactive Forensic Timeline */}
          <ForensicTimeline suspectName={dossier?.suspect_name || selectedSuspect} />

          {/* NLP FIR Entity & Co-Accused Extractor */}
          <FIRParserTool />
        </div>

        {/* Right Column: Real-Time Alert Feed */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="space-y-4 bg-slate-900 border-slate-800 text-white p-4 shadow-xl sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">POLICE ALERT FEED</h3>
              </div>
              <span className="text-[10px] text-amber-400 font-bold">REAL-TIME</span>
            </div>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1 font-mono">
              {alerts?.alerts.map((a) => (
                <div key={a.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant={a.severity === "CRITICAL" ? "critical" : "high"}>{a.severity}</Badge>
                    <span className="text-[10px] text-slate-500">{a.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-white mt-1 text-[11px]">{a.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{a.message}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DossiersPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading Suspect Dossier..." />}>
      <DossiersContent />
    </Suspense>
  );
}
