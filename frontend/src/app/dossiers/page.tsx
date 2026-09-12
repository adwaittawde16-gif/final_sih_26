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
import { Bell, Search, Clock, ChevronDown, ChevronUp, FileText } from "lucide-react";

function FIRParserTool() {
  const [firText, setFirText] = useState(
    "FIR #0254/2026 registered at Byculla Police Station. Accused Md. Ranbir Bhalla along with co-accused Md. Teerth Bhargava and Md. Vedant Padmanabhan were observed operating near Station Road Footpath and Venus Wine Shop under IPC Section 384 (Extortion) and Section 307 (Attempt to Murder). Phone +91-2236381844 was active."
  );
  const [firNumber, setFirNumber] = useState("FIR-0254/2026");
  const [result, setResult] = useState<FIRNLPResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleExtract(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <Card className="space-y-4 border-slate-300 bg-white">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-600" />
          NLP FIR Entity & Co-Accused Extractor
        </h3>
        <p className="text-[11px] font-mono text-slate-500">Paste FIR narrative text to automatically extract suspects, co-accused, locations, M.O. crime categories & IPC sections</p>
      </div>

      <form onSubmit={handleExtract} className="space-y-3 font-mono text-xs">
        <div className="flex gap-2">
          <input
            type="text"
            value={firNumber}
            onChange={(e) => setFirNumber(e.target.value)}
            placeholder="FIR Number e.g. FIR-0254/2026"
            className="w-1/3 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono shadow-sm"
          />
          <Button type="submit" disabled={loading} size="sm">
            {loading ? "Parsing NLP..." : "Extract Entities & Co-Accused"}
          </Button>
        </div>
        <textarea
          rows={3}
          value={firText}
          onChange={(e) => setFirText(e.target.value)}
          placeholder="Paste raw FIR narrative or witness statement text here..."
          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono shadow-sm"
        />
      </form>

      {result && (
        <div className="space-y-3 pt-3 border-t border-slate-200 font-mono text-xs">
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded font-bold">
              Primary Suspects ({result.suspects.length}): {result.suspects.join(", ") || "None"}
            </span>
            <span className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold">
              Co-Accused ({result.co_accused.length}): {result.co_accused.join(", ") || "None"}
            </span>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold">
              Locations ({result.locations.length}): {result.locations.join(", ") || "None"}
            </span>
            <span className="px-2 py-1 bg-red-50 text-red-800 border border-red-200 rounded font-bold">
              M.O. Crimes ({result.crime_types.length}): {result.crime_types.join(", ") || "None"}
            </span>
          </div>

          {/* Extracted Entities Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {result.entities.map((e, idx) => (
              <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 space-y-0.5 text-[11px]">
                <span className="text-[9px] font-bold text-slate-500 uppercase">{e.category}</span>
                <p className="font-bold text-slate-900 truncate">{e.text}</p>
                <span className="text-[9px] text-emerald-600">{(e.confidence * 100).toFixed(0)}% Match</span>
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
      <Card className="p-4 border-slate-300 bg-white text-xs font-mono text-slate-500">
        Loading multi-source forensic timeline for {suspectName}...
      </Card>
    );
  }

  if (!timeline || timeline.events.length === 0) {
    return (
      <Card className="p-4 border-slate-300 bg-white text-xs font-mono text-slate-500">
        No forensic timeline events recorded for {suspectName}.
      </Card>
    );
  }

  const filteredEvents = activeFilter === "ALL"
    ? timeline.events
    : timeline.events.filter(e => e.source_module === activeFilter);

  return (
    <Card className="space-y-4 border-slate-300 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Interactive Forensic Timeline ({filteredEvents.length} events)
          </h3>
          <p className="text-[11px] font-mono text-slate-500">Chronological multi-source activity sequence across FIR, CDR, CCTV, & Financial records</p>
        </div>
        {/* Source Filter Buttons */}
        <div className="flex flex-wrap gap-1">
          {["ALL", "FIR", "CDR", "CCTV", "FINANCIAL"].map((mod) => (
            <button
              key={mod}
              onClick={() => setActiveFilter(mod)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-colors ${
                activeFilter === mod
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 max-h-[450px] overflow-y-auto pr-2">
        {filteredEvents.map((evt) => {
          const isExpanded = expandedEventId === evt.event_id;
          return (
            <div key={evt.event_id} className="relative group">
              {/* Dot */}
              <span
                className="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: evt.color || "#64748b" }}
              />
              <div
                onClick={() => setExpandedEventId(isExpanded ? null : evt.event_id)}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-200 cursor-pointer transition-colors space-y-1 font-mono text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                      style={{ backgroundColor: evt.color || "#64748b" }}
                    >
                      {evt.source_module}
                    </span>
                    <strong className="text-slate-900 font-semibold">{evt.title}</strong>
                  </div>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                    {evt.timestamp}
                    {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                  </span>
                </div>
                <p className="text-[11px] font-sans text-slate-600">{evt.description}</p>

                {/* Expanded metadata */}
                {isExpanded && evt.metadata && Object.keys(evt.metadata).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200 bg-white p-2 rounded text-[10px] space-y-1">
                    <span className="font-bold text-slate-700">Event Details & Metadata:</span>
                    <pre className="text-[10px] text-slate-800 bg-slate-50 p-1.5 rounded overflow-x-auto">
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

  return (
    <div className="space-y-6">
      <Header
        title="Module 8 — 360° Suspect Dossiers & Alert Feed"
        subtitle="Automated intelligence dossier compilation, cross-database search, and real-time police alert feed."
      />

      {/* Multi-Source Search Bar */}
      <Card className="border-slate-300 bg-white">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across FIRs, CDR call logs, and CCTV sightings (e.g. Byculla, Bhalla)..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 font-mono shadow-sm"
            />
          </div>
          <Button type="submit">Execute Query</Button>
        </form>

        {/* Search Results Display */}
        {searchResults && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-600">
              <span>Query: <strong className="text-slate-900">"{searchResults.query}"</strong></span>
              <span>Total Matches: <strong className="text-emerald-700 font-bold">{searchResults.total_matches}</strong></span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">FIR Matches: {searchResults.fir_matches.length}</div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">CDR Matches: {searchResults.cdr_matches.length}</div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">CCTV Matches: {searchResults.cctv_matches.length}</div>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Suspect Dossier Viewer & Interactive Forensic Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4 border-slate-300 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <Badge variant="critical" className="mb-1">CONFIDENTIAL DOSSIER</Badge>
                <h3 className="text-xl font-bold text-slate-900">{dossier?.suspect_name || selectedSuspect}</h3>
                <p className="text-xs font-mono text-slate-600">
                  {dossier?.phone_number || "N/A"} · Threat Score: <strong className="text-red-700 font-bold">{dossier?.threat_score != null ? dossier.threat_score.toFixed(1) : "N/A"}</strong>/100
                </p>
              </div>
              <div className="text-right font-mono text-xs text-slate-600 space-y-1">
                <div>FIR Records: <span className="text-slate-900 font-bold">{dossier?.fir_matches_count ?? 0}</span></div>
                <div>CCTV Matches: <span className="text-slate-900 font-bold">{dossier?.cctv_meetings_count ?? 0}</span></div>
                <div>CDR Calls: <span className="text-slate-900 font-bold">{dossier?.cdr_calls_count ?? 0}</span></div>
              </div>
            </div>

            {/* Dossier Markdown View */}
            <div className="prose max-w-none text-xs font-mono bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-y-auto max-h-[350px] whitespace-pre-wrap text-slate-800">
              {dossier?.dossier_markdown || "Loading dossier content..."}
            </div>
          </Card>

          {/* Interactive Forensic Timeline Component */}
          <ForensicTimeline suspectName={dossier?.suspect_name || selectedSuspect} />

          {/* NLP FIR Entity & Co-Accused Extractor Tool */}
          <FIRParserTool />
        </div>

        {/* Right Column: Real-Time Police Alert Feed */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="space-y-4 border-amber-300 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Bell className="w-4 h-4 text-amber-700 animate-bounce" />
              <h3 className="text-sm font-bold font-mono text-slate-900">Police Alert Feed</h3>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {alerts?.alerts.map((a) => (
                <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant={a.severity === "CRITICAL" ? "critical" : "high"}>{a.severity}</Badge>
                    <span className="text-[10px] text-slate-500">{a.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mt-1">{a.title}</h4>
                  <p className="text-[11px] text-slate-600 font-sans leading-relaxed">{a.message}</p>
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
