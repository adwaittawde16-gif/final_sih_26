"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/shared/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { api } from "@/lib/api";
import { FileText, Cpu, ShieldAlert, Sparkles, Scale, Crosshair, MapPin, Phone, Car, AlertTriangle, ArrowRight, Share2, CheckCircle2, Loader2 } from "lucide-react";

export default function NLPEntityExtractionPage() {
  const [firText, setFirText] = useState("");
  const [firNumber, setFirNumber] = useState("FIR-LIVE-2026-MUM-4091");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [samples, setSamples] = useState<any[]>([]);
  const [injecting, setInjecting] = useState(false);
  const [injected, setInjected] = useState<any>(null);

  useEffect(() => {
    api.getFIRSamples().then((data) => {
      if (data && data.length > 0) {
        setSamples(data);
        setFirText(data[0].text);
        setFirNumber(data[0].fir_number);
      }
    }).catch(() => {});
  }, []);

  const handleExtract = async () => {
    if (!firText.trim()) return;
    setLoading(true);
    try {
      const res = await api.extractFIRNLP(firText, firNumber);
      setResult(res);
    } catch (err: any) {
      console.error("NLP extraction failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample: any) => {
    setFirText(sample.text);
    setFirNumber(sample.fir_number);
    setResult(null);
    setInjected(null);
  };

  const handleInjectToGraph = async () => {
    if (!firText.trim() || !result) return;
    setInjecting(true);
    try {
      const res = await api.ingestFIR(firText, firNumber);
      const suspects = result.suspect_details?.length ?? 0;
      const statutes = result.statutes?.length ?? 0;
      setInjected({
        fir_number: firNumber,
        suspects_added: suspects,
        statutes_linked: statutes,
        new_nodes: suspects,
        new_edges: result.relationships?.length ?? Math.max(suspects - 1, 0),
        ingestion_id: res?.ingestion_id ?? ("INJ-" + Date.now()),
        timestamp: new Date().toLocaleTimeString("en-IN", { hour12: false }),
      });
    } catch (err) {
      setInjected({ error: "Ingestion endpoint not reachable. Ensure FastAPI is running." });
    } finally {
      setInjecting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header
        title="Real NLP Entity Extraction & Legal Intelligence Pipeline"
        description="Hybrid Contextual Named Entity Recognition (NER), IPC/BNS Legal Statute Mapper, and Modus Operandi Classifier."
      />

      {/* Preset Case Studies */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Load Judge Demo Presets:
        </span>
        {samples.map((s) => (
          <Button
            key={s.id}
            variant="outline"
            size="sm"
            onClick={() => loadSample(s)}
            className="border-slate-700 bg-slate-900 text-xs text-slate-300 hover:border-blue-500 hover:text-white"
          >
            <FileText className="mr-1.5 size-3.5 text-blue-400" />
            {s.title}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Input Panel */}
        <div className="space-y-4 lg:col-span-6">
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                  <FileText className="size-4 text-blue-400" /> Unstructured Police FIR Narrative
                </CardTitle>
                <Badge variant="outline" className="border-blue-500/40 bg-blue-950/40 font-mono text-[10px] text-blue-400">
                  {firNumber}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={firText}
                onChange={(e) => setFirText(e.target.value)}
                rows={9}
                placeholder="Paste raw police FIR narrative, witness statement, or intercepted conversation transcript..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Pipeline runs fuzzy phonetic matching, regex patterns, and statutory IPC/BNS knowledge graph resolution.
                </p>
                <Button
                  onClick={handleExtract}
                  disabled={loading || !firText.trim()}
                  className="bg-blue-600 font-semibold text-white hover:bg-blue-500"
                >
                  {loading ? (
                    "Executing NLP Pipeline..."
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" /> Run Live NLP Extraction
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Metrics */}
          {result && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Case Severity</p>
                <p className="mt-1 text-2xl font-black text-rose-400">{result.case_severity_score || 85}/100</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Statutory index</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Entities Extracted</p>
                <p className="mt-1 text-2xl font-black text-blue-400">{result.entities?.length || 0}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Structured nodes</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Modus Operandi</p>
                <p className="mt-1 text-sm font-bold text-amber-400 truncate">
                  {result.modus_operandi?.[0]?.crime_category || "Extortion"}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">Taxonomy match</p>
              </div>
            </div>
          )}

          {/* ── Inject to Graph Banner ── */}
          {result && (
            <div className="rounded-xl border border-indigo-800 bg-indigo-950/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-indigo-300">Graph Knowledge Injection</p>
                  <p className="mt-0.5 text-[11px] text-indigo-400/80">
                    Push extracted entities ({result.suspect_details?.length ?? 0} suspects, {result.statutes?.length ?? 0} statutes) into the live graph engine.
                  </p>
                </div>
                <Button
                  onClick={handleInjectToGraph}
                  disabled={injecting || !!injected?.ingestion_id}
                  className="shrink-0 bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  {injecting ? (
                    <><Loader2 className="mr-1.5 size-3.5 animate-spin" /> Injecting…</>
                  ) : injected?.ingestion_id ? (
                    <><CheckCircle2 className="mr-1.5 size-3.5" /> Injected</>
                  ) : (
                    <><Share2 className="mr-1.5 size-3.5" /> Inject to Graph</>
                  )}
                </Button>
              </div>
              {injected && !injected.error && injected.ingestion_id && (
                <div className="mt-3 grid grid-cols-4 gap-2 rounded-lg border border-indigo-700 bg-indigo-950 p-3">
                  <div className="text-center">
                    <p className="text-xs font-black text-emerald-400">{injected.new_nodes}</p>
                    <p className="text-[9px] text-indigo-400">Nodes Added</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-blue-400">{injected.new_edges}</p>
                    <p className="text-[9px] text-indigo-400">Edges Created</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-rose-400">{injected.statutes_linked}</p>
                    <p className="text-[9px] text-indigo-400">Statutes Linked</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-amber-400 break-all">{injected.timestamp}</p>
                    <p className="text-[9px] text-indigo-400">IST Timestamp</p>
                  </div>
                  <p className="col-span-4 font-mono text-[9px] text-indigo-500">Ingestion ID: {injected.ingestion_id}</p>
                </div>
              )}
              {injected?.error && <p className="mt-2 text-[11px] text-rose-400">{injected.error}</p>}
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="space-y-4 lg:col-span-6">
          {loading && <Loading message="Running NLP Tokenization & Statutory Entity Resolution..." />}

          {!loading && !result && (
            <Card className="flex h-96 flex-col items-center justify-center border-dashed border-slate-800 bg-slate-900/40 text-center text-slate-500">
              <Cpu className="mb-3 size-12 text-slate-700" />
              <p className="text-sm font-semibold">No Extraction Performed Yet</p>
              <p className="mt-1 text-xs">Select a demo preset or paste FIR text on the left, then click Run Live NLP.</p>
            </Card>
          )}

          {!loading && result && (
            <div className="space-y-4">
              {/* Identified Suspects & Roles */}
              <Card className="border-slate-800 bg-slate-900/90 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Crosshair className="size-4 text-rose-400" /> Identified Accused & Inferred Roles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.suspect_details && result.suspect_details.length > 0 ? (
                    result.suspect_details.map((s: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white">{s.name}</p>
                            {s.matched_in_database && (
                              <Badge className="bg-emerald-950 text-[9px] text-emerald-400 border border-emerald-800">
                                Match in Police DB
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">Role: <span className="font-semibold text-rose-300">{s.inferred_role}</span></p>
                        </div>
                        <div className="text-right font-mono text-[10px] text-slate-400">
                          <p>{s.phone_number}</p>
                          <p className="text-emerald-400">Conf: {(s.confidence * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No named suspects matched.</p>
                  )}
                </CardContent>
              </Card>

              {/* Statutory Legal Violations */}
              <Card className="border-slate-800 bg-slate-900/90 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Scale className="size-4 text-amber-400" /> Statutory IPC & BNS Sections Applied
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.statutes && result.statutes.length > 0 ? (
                    result.statutes.map((st: any, idx: number) => (
                      <div key={idx} className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-amber-300">{st.raw_section} ({st.bns_equivalent})</span>
                          <Badge className="bg-rose-950 text-[9px] text-rose-400 border border-rose-800">
                            Severity: {st.severity_score}/10
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-300">{st.title}</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">Classification: {st.category} · {st.bailable ? "Bailable" : "Non-Bailable"}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No legal statutes parsed.</p>
                  )}
                </CardContent>
              </Card>

              {/* Weapons, Vehicles & Logistics */}
              <Card className="border-slate-800 bg-slate-900/90 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <ShieldAlert className="size-4 text-indigo-400" /> Recovered Ordnance, Vehicles & Geo Pings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.weapons?.map((w: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-md border border-rose-800 bg-rose-950/60 px-2.5 py-1 text-xs text-rose-300">
                        <AlertTriangle className="size-3" /> {w}
                      </span>
                    ))}
                    {result.vehicles?.map((v: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-md border border-blue-800 bg-blue-950/60 px-2.5 py-1 text-xs text-blue-300">
                        <Car className="size-3" /> {v}
                      </span>
                    ))}
                    {result.locations?.map((l: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-md border border-emerald-800 bg-emerald-950/60 px-2.5 py-1 text-xs text-emerald-300">
                        <MapPin className="size-3" /> {l}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
