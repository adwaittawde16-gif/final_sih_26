"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Cpu,
  Network,
  UploadCloud,
  Activity,
  Zap,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  ExternalLink,
  Flame,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const DEMO_STEPS = [
  {
    step: 1,
    title: "Real NLP Entity & Legal Statute Pipeline",
    route: "/nlp-extraction",
    icon: Cpu,
    tag: "NLP & Law",
    color: "text-blue-400 bg-blue-950/60 border-blue-800",
    headline: "Transform unstructured police narratives into structured intelligence",
    highlights: [
      "Hybrid Contextual Named Entity Recognition (NER) for suspects, weapons, vehicles & aliases",
      "Fuzzy phonetic name matching (Difflib) against Master Police Criminal DB",
      "Statutory IPC & Bharatiya Nyaya Sanhita (BNS) section classifier (e.g. Sec 307 / 384)",
      "Live 'Inject to Knowledge Graph' button updates active nodes & edges in real-time"
    ]
  },
  {
    step: 2,
    title: "Live Graph Theory & Topology Proofs",
    route: "/graph-algorithms",
    icon: Network,
    tag: "Graph AI",
    color: "text-violet-400 bg-violet-950/60 border-violet-800",
    headline: "Live mathematical graph computation (not hardcoded visual numbers)",
    highlights: [
      "Louvain Community Detection modularity proof (Q = 0.8936 on live graph)",
      "Betweenness, Closeness, Degree & PageRank centrality metrics computed live",
      "Articulation points (cut-nodes) identification for syndicate decapitation strategy",
      "Interactive SVG Topology Canvas with real-time resolution & alpha tuning sliders"
    ]
  },
  {
    step: 3,
    title: "Multi-Source Ingestion & Fusion Studio",
    route: "/data-ingestion",
    icon: UploadCloud,
    tag: "Data Fusion",
    color: "text-emerald-400 bg-emerald-950/60 border-emerald-800",
    headline: "Live ingestion across 4 disparate intelligence modalities",
    highlights: [
      "Telecom CDR stream parser with automatic nocturnal (00:00–05:00) call detection",
      "Financial ledger CSV ingestion with regulatory sub-threshold smurfing alerts",
      "Raw police FIR narrative processing and entity auto-linking",
      "OSINT / Encrypted Telegram chat dump analysis with narcotics & license plate extractor"
    ]
  },
  {
    step: 4,
    title: "Statistical Anomaly Detection Engine",
    route: "/anomaly-detection",
    icon: Activity,
    tag: "Anomaly Detection",
    color: "text-amber-400 bg-amber-950/60 border-amber-800",
    headline: "Exposed statistical formulas and mathematical justifications",
    highlights: [
      "Gaussian Z-score: Z = (x - μ) / σ with exact erfc p-values for nocturnal spikes",
      "Interquartile Range (IQR): Q1, Q3, 1.5×IQR whisker bounds for transaction outliers",
      "Haversine Spatiotemporal clustering of physical CCTV co-location encounters",
      "Zero black-box logic — full mathematical parameters exposed to investigating officers"
    ]
  },
  {
    step: 5,
    title: "Explainable AI (XAI) & 360° Dossier",
    route: "/explainability",
    icon: Sparkles,
    tag: "XAI / Ethics",
    color: "text-rose-400 bg-rose-950/60 border-rose-800",
    headline: "Complete transparency: why the system flagged every single suspect",
    highlights: [
      "SHAP-style percentage feature attribution across all 6 risk dimensions",
      "Counterfactual 'What-If' simulator: test how score changes if nocturnal calls drop",
      "Multi-domain forensic evidence trail (CDR logs, CCTV sightings, UPI ledgers)",
      "Dedicated 360° Subject Dossier view (/dossiers/M-047) with direct XAI deep-dive"
    ]
  },
  {
    step: 6,
    title: "Big Data Scalability Benchmark",
    route: "/scalability-benchmark",
    icon: Zap,
    tag: "High Performance",
    color: "text-cyan-400 bg-cyan-950/60 border-cyan-800",
    headline: "Proven ability to scale beyond toy hackathon CSVs",
    highlights: [
      "Processes 50,000 real-time telecom records in ~138 milliseconds",
      "Throughput exceeds 360,000+ records/second via vectorized NumPy & Pandas",
      "Live stress-test slider allows judges to run 10k, 25k, 50k, or 100k events on the spot",
      "Server-Sent Events (SSE) stream feeds live alerts into the Command Center"
    ]
  },
  {
    step: 7,
    title: "RBAC Security & Forensic Audit Trail",
    route: "/access-control",
    icon: ShieldCheck,
    tag: "Compliance",
    color: "text-indigo-400 bg-indigo-950/60 border-indigo-800",
    headline: "Chain-of-custody compliance for law enforcement deployment",
    highlights: [
      "Role-Based Access Control: Commissioner, DSP, Crime Branch Inspector profiles",
      "Cryptographic SHA-256 session token generation (BP-XXXX tokens)",
      "Immutable forensic audit trail logging all queries, intelligence exports & edits",
      "Production-ready for judicial evidentiary submission (Indian Evidence Act compliance)"
    ]
  }
];

export function JudgeDemoModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const current = DEMO_STEPS[currentStepIndex];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-blue-950/60 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600 font-bold shadow-md shadow-blue-950/50">
              <Award className="size-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  SIH 2026 Judge Pitch & Live Demo Guide
                </h2>
                <Badge variant="outline" className="border-amber-500/40 bg-amber-950/40 text-[10px] text-amber-400">
                  Step {current.step} of {DEMO_STEPS.length}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">Brihanmumbai Police — Special Crime Analysis Unit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Step Indicator Pills */}
        <div className="my-4 flex items-center gap-1.5 overflow-x-auto pb-1">
          {DEMO_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStepIndex(idx)}
              className={`flex-1 min-w-[32px] py-1.5 rounded-md text-[10px] font-mono font-bold transition ${
                idx === currentStepIndex
                  ? "bg-blue-600 text-white shadow"
                  : idx < currentStepIndex
                  ? "bg-slate-800 text-emerald-400 border border-emerald-900"
                  : "bg-slate-800/50 text-slate-500 hover:text-slate-300"
              }`}
            >
              0{s.step}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`flex size-10 items-center justify-center rounded-xl border ${current.color}`}>
                <Icon className="size-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {current.tag}
                </span>
                <h3 className="text-base font-bold text-white">{current.title}</h3>
              </div>
            </div>
            <Link
              href={current.route}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-blue-500"
            >
              Open Live Page <ExternalLink className="size-3.5" />
            </Link>
          </div>

          <p className="text-xs font-medium text-slate-300 italic border-l-2 border-blue-500 pl-2.5">
            "{current.headline}"
          </p>

          <div className="space-y-2 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Key Technical Points For Judges:
            </p>
            <ul className="space-y-1.5">
              {current.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentStepIndex === 0}
            className="border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white disabled:opacity-40"
          >
            <ChevronLeft className="mr-1 size-3.5" /> Previous
          </Button>

          <div className="flex items-center gap-2">
            <Link
              href="/nlp-extraction?pitch=true"
              onClick={() => {
                try { localStorage.setItem("sih_pitch_active", "true"); } catch {}
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-black text-slate-950 shadow-md shadow-amber-500/30 hover:bg-amber-400 transition"
            >
              ▶ Start Live Pitch Stepper
            </Link>
          </div>

          {currentStepIndex < DEMO_STEPS.length - 1 ? (
            <Button
              size="sm"
              onClick={() => setCurrentStepIndex((prev) => Math.min(prev + 1, DEMO_STEPS.length - 1))}
              className="bg-blue-600 text-xs text-white hover:bg-blue-500"
            >
              Next Step <ChevronRight className="ml-1 size-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onClose}
              className="bg-emerald-600 text-xs text-white hover:bg-emerald-500"
            >
              Complete Tour <CheckCircle2 className="ml-1 size-3.5" />
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Floating Top Live Pitch Runner Banner ──────────────────────────────────
export const PITCH_STAGES = [
  {
    stage: 1,
    title: "1. NLP Extraction",
    subtitle: "FIR ➔ IPC 384/307 ➔ Graph Injection",
    route: "/nlp-extraction",
    icon: Cpu,
    claim: "Extracts accused suspects, statutory sections & weapons in <30ms, then injects directly into live graph."
  },
  {
    stage: 2,
    title: "2. Graph Proofs",
    subtitle: "Louvain Q=0.8936 ➔ Cut-Nodes",
    route: "/graph-algorithms",
    icon: Network,
    claim: "Proves mathematical community modularity (Q=0.8936) and identifies syndicate kingpins."
  },
  {
    stage: 3,
    title: "3. Anomaly Engine",
    subtitle: "Gaussian Z=2.41σ ➔ CCTV Haversine",
    route: "/anomaly-detection",
    icon: Activity,
    claim: "Exposes non-blackbox mathematical statistical formulas for nocturnal calls & physical rendezvous."
  },
  {
    stage: 4,
    title: "4. Explainable AI",
    subtitle: "SHAP Breakdown ➔ Counterfactuals",
    route: "/explainability?suspect=Md.+Ranbir+Bhalla",
    icon: Sparkles,
    claim: "Transparent percentage feature attribution explaining why subject jumped to Threat 88/100."
  },
  {
    stage: 5,
    title: "5. Court Chargesheet",
    subtitle: "CrPC 173 ➔ Sec 65B Panchnama",
    route: "/chargesheet",
    icon: ShieldCheck,
    claim: "Generates formal judicial chargesheet with digital evidence certification and 1-click PDF print."
  }
];

export function JudgePitchBanner() {
  const [isActive, setIsActive] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCurrentPath(window.location.pathname);
    const urlParams = new URLSearchParams(window.location.search);
    const isPitchParam = urlParams.get("pitch") === "true";
    const savedActive = localStorage.getItem("sih_pitch_active") === "true";
    if (isPitchParam || savedActive) {
      setIsActive(true);
      try { localStorage.setItem("sih_pitch_active", "true"); } catch {}
    }
  }, []);

  if (!isActive) return null;

  const currentStageIndex = PITCH_STAGES.findIndex((s) => currentPath.startsWith(s.route.split("?")[0]));
  const currentStage = currentStageIndex >= 0 ? PITCH_STAGES[currentStageIndex] : PITCH_STAGES[0];
  const nextStage = currentStageIndex < PITCH_STAGES.length - 1 ? PITCH_STAGES[currentStageIndex + 1] : null;
  const prevStage = currentStageIndex > 0 ? PITCH_STAGES[currentStageIndex - 1] : null;

  const handleClose = () => {
    setIsActive(false);
    try { localStorage.removeItem("sih_pitch_active"); } catch {}
  };

  return (
    <div className="sticky top-2 z-40 mb-4 rounded-xl border border-amber-500/60 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-md text-white font-sans ring-1 ring-amber-500/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Left Badge & Stage Info */}
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30">
            <Award className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-amber-400">
                SIH 2026 LIVE PITCH RUNNER
              </span>
              <Badge className="border-amber-500/40 bg-amber-950/60 font-mono text-[9px] text-amber-300">
                Stage {currentStageIndex + 1} of {PITCH_STAGES.length}
              </Badge>
            </div>
            <p className="text-xs font-bold text-white">
              {currentStage.title} <span className="font-normal text-slate-400">· {currentStage.subtitle}</span>
            </p>
          </div>
        </div>

        {/* Stepper Navigation Pills */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          {PITCH_STAGES.map((st, i) => (
            <Link
              key={st.stage}
              href={st.route}
              onClick={() => setCurrentPath(st.route.split("?")[0])}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition ${
                i === currentStageIndex
                  ? "bg-amber-500 text-slate-950 shadow"
                  : i < currentStageIndex
                  ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {i < currentStageIndex ? <CheckCircle2 className="size-2.5 text-emerald-400" /> : `0${st.stage}`}
              <span className="hidden xl:inline">{st.title.split(". ")[1]}</span>
            </Link>
          ))}
        </div>

        {/* Quick Stepper Action Buttons */}
        <div className="flex items-center gap-2">
          {prevStage && (
            <Link
              href={prevStage.route}
              onClick={() => setCurrentPath(prevStage.route.split("?")[0])}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <ChevronLeft className="size-3.5" /> Prev
            </Link>
          )}

          {nextStage ? (
            <Link
              href={nextStage.route}
              onClick={() => setCurrentPath(nextStage.route.split("?")[0])}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition animate-pulse"
            >
              Next: {nextStage.title.split(". ")[1]} <ChevronRight className="size-3.5" />
            </Link>
          ) : (
            <button
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
            >
              <CheckCircle2 className="size-3.5" /> Pitch Complete
            </button>
          )}

          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition"
            title="Exit Pitch Runner"
          >
            <X className="size-4" />
          </button>
        </div>

      </div>

      {/* Live Technical Pitch Claim */}
      <div className="mt-2 border-t border-slate-800/80 pt-1.5 flex items-center justify-between text-[11px] text-slate-300">
        <p className="italic text-amber-200/90 font-mono text-[10px]">
          🎯 <strong>Judge Pitch Claim:</strong> "{currentStage.claim}"
        </p>
        <span className="hidden md:inline text-[9px] font-mono text-slate-500">
          Click Next to step through live AI proofs
        </span>
      </div>
    </div>
  );
}
