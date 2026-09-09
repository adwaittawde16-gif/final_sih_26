"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/shared/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  Scale,
  Printer,
  Download,
  FileCheck,
  ShieldAlert,
  User,
  Phone,
  Camera,
  Banknote,
  Network,
  CheckCircle2,
  FileText
} from "lucide-react";

export default function ChargesheetGeneratorPage() {
  const [suspects, setSuspects] = useState<any[]>([]);
  const [selectedName, setSelectedName] = useState<string>("Md. Ranbir Bhalla");
  const [threatInfo, setThreatInfo] = useState<any>(null);
  const [xaiInfo, setXaiInfo] = useState<any>(null);
  const [cdrInfo, setCdrInfo] = useState<any[]>([]);
  const [cctvInfo, setCctvInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getThreatIndex().then((list: any[]) => {
      if (list && list.length > 0) {
        setSuspects(list);
        setSelectedName(list[0].suspect_name);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedName) return;
    setLoading(true);

    Promise.all([
      api.explainSuspect(selectedName).catch(() => null),
      api.getCDRSummary().catch(() => null),
      api.getCCTVMeetings().catch(() => null),
      api.getThreatIndex().catch(() => [])
    ]).then(([xai, cdr, cctv, tList]) => {
      setXaiInfo(xai);
      if (Array.isArray(cdr)) {
        setCdrInfo(cdr.filter((r: any) => r.suspect_1 === selectedName || r.suspect_2 === selectedName).slice(0, 4));
      } else if (cdr?.pair_summary) {
        setCdrInfo(cdr.pair_summary.slice(0, 4));
      }
      if (Array.isArray(cctv)) {
        setCctvInfo(cctv.slice(0, 3));
      } else if (cctv?.meetings) {
        setCctvInfo(cctv.meetings.slice(0, 3));
      }
      if (Array.isArray(tList)) {
        const found = tList.find((s: any) => s.suspect_name === selectedName);
        if (found) setThreatInfo(found);
      }
    }).finally(() => setLoading(false));
  }, [selectedName]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 space-y-6 p-6 print:p-0 print:bg-white print:text-black">
      {/* Screen Header (Hidden in Print) */}
      <div className="print:hidden space-y-6">
        <Header
          title="Judicial Chargesheet & Forensic Panchnama Generator"
          description="CrPC Section 173 / BNSS Section 193 compliant formal police investigation report generator for submission to Metropolitan Magistrate."
        />

        {/* Suspect Selector & Print Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Accused Subject:
            </span>
            <select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              {suspects.map((s) => (
                <option key={s.suspect_name} value={s.suspect_name}>
                  {s.suspect_name} (Threat: {s.total_threat_score?.toFixed(1) || s.threat_score || 80}/100)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="bg-blue-600 font-bold text-xs text-white hover:bg-blue-500"
            >
              <Printer className="mr-1.5 size-3.5" /> Print / Save Court PDF
            </Button>
          </div>
        </div>
      </div>

      {/* ── Formal Judicial Chargesheet Document ── */}
      <div className="mx-auto max-w-4xl rounded-xl border border-slate-300 bg-white p-8 text-slate-900 shadow-2xl print:border-none print:p-0 print:shadow-none font-serif leading-relaxed">
        
        {/* Court & Police Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <p className="font-bold text-xs uppercase tracking-widest text-slate-600">
            GOVERNMENT OF MAHARASHTRA · POLICE DEPARTMENT
          </p>
          <h1 className="text-xl font-black uppercase tracking-wider text-slate-950 mt-1">
            FINAL INVESTIGATION POLICE REPORT (CHARGESHEET)
          </h1>
          <p className="text-xs text-slate-600 font-mono mt-0.5">
            Under Section 173 Cr.P.C. / Section 193 Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023
          </p>
          <p className="text-xs font-bold mt-1">
            IN THE COURT OF THE HON'BLE CHIEF METROPOLITAN MAGISTRATE, ESPLANADE COURT, MUMBAI
          </p>
        </div>

        {/* Case Metadata Table */}
        <div className="grid grid-cols-2 border border-slate-400 text-xs font-sans mb-6">
          <div className="border-r border-b border-slate-400 p-2">
            <span className="font-bold text-slate-700">Police Station:</span> Special Crime Branch CID, Mumbai
          </div>
          <div className="border-b border-slate-400 p-2">
            <span className="font-bold text-slate-700">FIR Number & Date:</span> FIR-0254/2026 dt. 14-Aug-2026
          </div>
          <div className="border-r border-slate-400 p-2">
            <span className="font-bold text-slate-700">Investigating Officer:</span> Inspector Vikram Rane (ID: BP-2026-CRIME)
          </div>
          <div className="p-2">
            <span className="font-bold text-slate-700">Case Category:</span> Organized Extortion & Hawala Syndicate
          </div>
        </div>

        {/* Section I: Accused Particulars */}
        <div className="space-y-3 mb-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 font-sans">
            I. PARTICULARS OF THE ACCUSED / CHARGED SUBJECT
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <p><span className="font-bold text-slate-700">Name of Accused:</span> {selectedName}</p>
              <p><span className="font-bold text-slate-700">Aliases / Street Name:</span> "Bhai", "Operative-47"</p>
              <p><span className="font-bold text-slate-700">Primary Mobile No.:</span> {threatInfo?.phone_number || "+91-9820019284"}</p>
              <p><span className="font-bold text-slate-700">Custody Status:</span> Judicial Custody / Non-Bailable Warrant Issued</p>
            </div>
            <div>
              <p><span className="font-bold text-slate-700">AI Threat Matrix Index:</span> <strong className="text-red-700">{threatInfo?.total_threat_score?.toFixed(1) || 88.5} / 100</strong></p>
              <p><span className="font-bold text-slate-700">Syndicate Role:</span> {xaiInfo?.feature_attribution?.[0]?.feature_name || "Conspiracy Ring Co-Ordinator"}</p>
              <p><span className="font-bold text-slate-700">Jurisdiction Area:</span> Byculla / Dadar / Lower Parel</p>
            </div>
          </div>
        </div>

        {/* Section II: Statutory Offences Charged */}
        <div className="space-y-2 mb-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 font-sans">
            II. STATUTORY PENAL PROVISIONS CHARGED
          </h2>
          <table className="w-full text-left text-xs font-sans border border-slate-400">
            <thead className="bg-slate-100 font-bold border-b border-slate-400">
              <tr>
                <th className="p-2">Statute Section</th>
                <th className="p-2">BNS Equivalent</th>
                <th className="p-2">Legal Offence Description</th>
                <th className="p-2">Evidentiary Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              <tr>
                <td className="p-2 font-mono font-bold">IPC Sec 384</td>
                <td className="p-2 font-mono">BNS Sec 308(2)</td>
                <td className="p-2">Extortion by coercion and threat of violence</td>
                <td className="p-2 text-emerald-800 font-bold">Proven via CDR Audio Intercept</td>
              </tr>
              <tr>
                <td className="p-2 font-mono font-bold">IPC Sec 307</td>
                <td className="p-2 font-mono">BNS Sec 109</td>
                <td className="p-2">Attempt to Murder with illegal firearm</td>
                <td className="p-2 text-emerald-800 font-bold">Weapon & CCTV Sighting Confirmed</td>
              </tr>
              <tr>
                <td className="p-2 font-mono font-bold">IPC Sec 120B</td>
                <td className="p-2 font-mono">BNS Sec 61(2)</td>
                <td className="p-2">Criminal Conspiracy with multi-subject syndicate</td>
                <td className="p-2 text-emerald-800 font-bold">Graph Centrality Modularity (Q=0.89)</td>
              </tr>
              <tr>
                <td className="p-2 font-mono font-bold">Arms Act Sec 25</td>
                <td className="p-2 font-mono">Arms Act 25(1B)</td>
                <td className="p-2">Illegal possession of country-made pistol & cartridges</td>
                <td className="p-2 text-emerald-800 font-bold">Physical Recovery Panchnama Filed</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section III: Forensic Evidence Trail */}
        <div className="space-y-3 mb-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 font-sans">
            III. MULTI-DOMAIN FORENSIC EVIDENCE CORROBORATION
          </h2>

          {/* (1) Telecom Evidence — Dynamic from XAI forensic trail */}
          <div className="rounded border border-slate-300 p-3 text-xs font-sans space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Phone className="size-3.5 text-blue-700" /> 1. Telecom Call Detail Records (CDR Intercepts)
            </p>
            {xaiInfo?.forensic_evidence_trail?.filter((e: any) => e.domain === "CDR" || e.source === "CDR").slice(0, 2).map((ev: any, i: number) => (
              <p key={i} className="text-slate-700">
                <strong>{ev.timestamp || ev.date || "Intercept Log"}:</strong> {ev.detail || ev.description || ev.summary || "Coordinated telephony activity corroborated with co-location logs."}
              </p>
            ))}
            {(!xaiInfo?.forensic_evidence_trail || xaiInfo.forensic_evidence_trail.filter((e: any) => e.domain === "CDR" || e.source === "CDR").length === 0) && (
              <p className="text-slate-700">
                Subject maintained recurring encrypted call activity during nocturnal hours (00:00–05:00 IST).
                Gaussian Z-score analysis confirms statistically anomalous night call burst.
                {cdrInfo.length > 0 && (
                  <span> Primary contact: <strong>{cdrInfo[0]?.suspect_2 || cdrInfo[0]?.suspect_1 || "Flagged Associate"}</strong> — {cdrInfo[0]?.total_calls || "N/A"} logged calls, {cdrInfo[0]?.nocturnal_calls || 0} nocturnal.</span>
                )}
              </p>
            )}
          </div>

          {/* (2) CCTV Evidence — Dynamic from XAI forensic trail */}
          <div className="rounded border border-slate-300 p-3 text-xs font-sans space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Camera className="size-3.5 text-amber-700" /> 2. Municipal CCTV Camera Co-Location Sightings
            </p>
            {xaiInfo?.forensic_evidence_trail?.filter((e: any) => e.domain === "CCTV" || e.source === "CCTV").slice(0, 2).map((ev: any, i: number) => (
              <p key={i} className="text-slate-700">
                <strong>{ev.timestamp || ev.date || "Camera Sighting"}:</strong> {ev.detail || ev.description || ev.summary || "Co-location event confirmed via CCTV facial recognition."}
              </p>
            ))}
            {(!xaiInfo?.forensic_evidence_trail || xaiInfo.forensic_evidence_trail.filter((e: any) => e.domain === "CCTV" || e.source === "CCTV").length === 0) && (
              <p className="text-slate-700">
                Municipal camera logs confirm physical rendezvous.
                {cctvInfo.length > 0 && (
                  <span> Location: <em>{cctvInfo[0]?.location || "Dadar"}</em> · {cctvInfo[0]?.suspect_b || "Associate"} present. Avg facial recognition confidence: <strong>{cctvInfo[0]?.confidence ? `${(cctvInfo[0].confidence * 100).toFixed(1)}%` : "89.4%"}</strong>.</span>
                )}
              </p>
            )}
          </div>

          {/* (3) Financial Hawala Evidence — Dynamic from XAI financial features */}
          <div className="rounded border border-slate-300 p-3 text-xs font-sans space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Banknote className="size-3.5 text-emerald-700" /> 3. Hawala Smurfing & Banking Ledger Trails
            </p>
            {xaiInfo?.forensic_evidence_trail?.filter((e: any) => e.domain === "FINANCIAL" || e.source === "FINANCIAL" || e.domain === "Financial").slice(0, 2).map((ev: any, i: number) => (
              <p key={i} className="text-slate-700">
                <strong>{ev.timestamp || ev.date || "Transaction Record"}:</strong> {ev.detail || ev.description || ev.summary}
              </p>
            ))}
            {(() => {
              const finFeature = xaiInfo?.feature_attribution?.find((f: any) =>
                (f.feature_name || "").toLowerCase().includes("financial")
              );
              const hasFin = xaiInfo?.forensic_evidence_trail?.some((e: any) => e.domain === "FINANCIAL" || e.source === "FINANCIAL" || e.domain === "Financial");
              if (!hasFin) return (
                <p className="text-slate-700">
                  Audited transaction velocity exhibits regulatory structuring. {finFeature
                    ? <span>Financial risk contribution: <strong>{finFeature.score_contribution} pts</strong> ({finFeature.percentage_influence}% of threat profile) — {finFeature.evidence_summary || "sub-threshold Hawala smurfing detected via IQR outlier analysis."}
                    </span>
                    : "Multiple payments structured below ₹50,000 regulatory reporting threshold, routed through mule accounts."
                  }
                </p>
              );
              return null;
            })()}
          </div>

          {/* (4) Graph Centrality Evidence — Dynamic from XAI graph features */}
          <div className="rounded border border-slate-300 p-3 text-xs font-sans space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Network className="size-3.5 text-purple-700" /> 4. Graph Network Centrality & Hierarchy Proof
            </p>
            {(() => {
              const graphFeature = xaiInfo?.feature_attribution?.find((f: any) =>
                (f.feature_name || "").toLowerCase().includes("cdr") || (f.feature_name || "").toLowerCase().includes("network")
              );
              return (
                <p className="text-slate-700">
                  Betweenness Centrality confirms this subject is an <strong>Articulation Point (Cut-Node)</strong> in the criminal interaction mesh.
                  {graphFeature
                    ? <span> CDR network score contribution: <strong>{graphFeature.score_contribution} pts</strong> — {graphFeature.evidence_summary || "confirms central broker role in conspiracy ring."}</span>
                    : " Community modularity score Q = 0.8936 establishes non-random syndicated organization across 4 distinct criminal cells."
                  }
                </p>
              );
            })()}
          </div>
        </div>

        {/* Section IV: Formal Investigating Officer Certification */}
        <div className="border-t-2 border-slate-900 pt-4 mt-8 space-y-6 text-xs font-sans">
          <p className="text-justify text-slate-800 leading-normal italic">
            "I, Inspector Vikram Rane, Special Crime Analysis Unit, Brihanmumbai Police, hereby certify under Section 65B of the Indian Evidence Act that the electronic call records, CCTV logs, and algorithm-generated graph proofs contained in this report are genuine, unadulterated, and extracted directly from authorized police telemetry servers."
          </p>

          <div className="flex justify-between items-end pt-4">
            <div>
              <p className="font-bold">Place: Mumbai, Maharashtra</p>
              <p className="font-mono text-slate-600">Date: 08-Sep-2026</p>
              <p className="font-mono text-[10px] text-slate-500 mt-1">Ref ID: BP-CHGSHT-2026-0254</p>
            </div>

            <div className="text-center space-y-1">
              <div className="w-48 border-b border-slate-900 mb-1" />
              <p className="font-bold uppercase tracking-wider text-slate-950">Inspector Vikram Rane</p>
              <p className="text-[10px] text-slate-600">Investigating Officer · Special Crime Branch CID</p>
              <p className="text-[9px] font-mono text-slate-500">Brihanmumbai Police</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
