"use client";

import React from "react";
import Image from "next/image";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Workflow,
  Cpu,
  Database,
  Layers,
  ShieldCheck,
  ArrowRight,
  FileText,
  Network,
  Activity,
  Sparkles,
  Lock
} from "lucide-react";

export default function ArchitecturePage() {
  const pipelineSteps = [
    {
      num: "01",
      title: "Multi-Source Data Ingestion",
      tech: "Regex Parser, OpenCV, SpaCy NLP",
      desc: "Raw telecom Call Detail Records (CDRs), CCTV camera feeds, PDF FIR complaints, bank transaction files, and social media footprints are ingested concurrently.",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30"
    },
    {
      num: "02",
      title: "Feature Extraction & NLP Parsing",
      tech: "SpaCy Entity Extraction & Face Recognition",
      desc: "Extracts criminal names, addresses, and IPC sections from FIR complaints. Facial recognition scans CCTV frames. Cell tower pings and call durations are extracted.",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/30"
    },
    {
      num: "03",
      title: "Graph Mining & Spatial Correlation",
      tech: "NetworkX Physics Engine & Louvain Community Clustering",
      desc: "Constructs 2D/3D interaction mesh. Calculates Degree and Betweenness centrality to uncover hidden gang leaders and nocturnal call anomalies.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30"
    },
    {
      num: "04",
      title: "100-Point Dynamic Threat Indexing",
      tech: "6-Weighted Risk Matrix Classifier",
      desc: "Calculates unified 0-100 Threat Score evaluating CCTV encounters (+28.6%), nocturnal calls (+20%), FIR severity (+15%), criminal history, and financial flow.",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30"
    },
    {
      num: "05",
      title: "Explainable AI (XAI) & Counterfactual Proofs",
      tech: "SHAP/LIME Evidence Lineage Engine",
      desc: "Generates mathematical attribution breakdowns paired with interactive counterfactual simulation for court-proof prosecution dossiers (MCOCA/IPC 120B).",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30"
    },
    {
      num: "06",
      title: "Cryptographic SHA-256 Audit Trail",
      tech: "Tamper-Evident Forensic Hash Ledger",
      desc: "Every query, user edit, and threat prediction is hashed sequentially into a cryptographically chained audit log, ensuring unalterable chain-of-custody.",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30"
    }
  ];

  return (
    <div className="space-y-6 pb-24 font-sans">
      <Header
        title="System architecture & presentation flowchart"
        subtitle="Official Smart India Hackathon 2026 pipeline methodology, layered architecture, and end-to-end data processing workflow."
      />

      {/* Slide Image Presentation Card */}
      <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/30 uppercase tracking-wider">
                SIH 2026 Official Presentation Flowchart
              </Badge>
              <span className="text-xs text-[var(--text-muted)] font-mono">Slide 3 / 6</span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text)] mt-1">
              Technical Approach & System Architecture Diagram
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">Source: SIH2026Presentation-2.pptx</span>
          </div>
        </div>

        {/* Embedded Extracted Flowchart Diagram Image */}
        <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-[#0B0F17] p-2 flex justify-center items-center">
          <img
            src="/pptx_slide_3_img_4.png"
            alt="SIH 2026 Technical Approach and System Architecture Flowchart"
            className="w-full max-w-4xl h-auto object-contain rounded-md"
          />
        </div>
      </div>

      {/* Interactive Step-by-Step Flowchart Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-blue-500" />
          <h3 className="text-xs font-sans font-bold text-[var(--text)] uppercase tracking-wider">
            End-to-End Core Workflow Pipeline
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineSteps.map((step) => (
            <div
              key={step.num}
              className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${step.bg} ${step.color} border ${step.border}`}>
                    STEP {step.num}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{step.tech}</span>
                </div>
                <h4 className="text-sm font-bold text-[var(--text)]">{step.title}</h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Technology Stack Matrix */}
      <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
          <Cpu className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            System Architecture Technology Stack
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5">
            <span className="font-bold text-blue-500 block text-[11px] uppercase tracking-wider">Frontend UI</span>
            <p className="font-medium text-[var(--text)]">Next.js 14, React, TypeScript</p>
            <p className="text-[var(--text-muted)] text-[11px]">Tailwind CSS, Lucide React, Recharts</p>
          </div>

          <div className="p-3.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5">
            <span className="font-bold text-emerald-500 block text-[11px] uppercase tracking-wider">Backend API</span>
            <p className="font-medium text-[var(--text)]">Python FastAPI / Node.js</p>
            <p className="text-[var(--text-muted)] text-[11px]">Uvicorn, REST endpoints, Pydantic</p>
          </div>

          <div className="p-3.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5">
            <span className="font-bold text-indigo-500 block text-[11px] uppercase tracking-wider">Graph & NLP</span>
            <p className="font-medium text-[var(--text)]">NetworkX, OpenCV, SpaCy</p>
            <p className="text-[var(--text-muted)] text-[11px]">Louvain Community Detection, SHAP XAI</p>
          </div>

          <div className="p-3.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5">
            <span className="font-bold text-purple-500 block text-[11px] uppercase tracking-wider">Security & Audit</span>
            <p className="font-medium text-[var(--text)]">SHA-256 Cryptographic Chain</p>
            <p className="text-[var(--text-muted)] text-[11px]">Immutable Forensic Audit Ledger</p>
          </div>
        </div>
      </div>
    </div>
  );
}
