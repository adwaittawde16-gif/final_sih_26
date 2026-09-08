"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/shared/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { api } from "@/lib/api";
import { AlertTriangle, Moon, Banknote, MapPin, Calculator, Cpu, Sparkles, Filter } from "lucide-react";

export default function AnomalyDetectionPage() {
  const [loading, setLoading] = useState(true);
  const [zThreshold, setZThreshold] = useState(2.0);
  const [nocturnalData, setNocturnalData] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [spatioData, setSpatioData] = useState<any>(null);

  const fetchAnomalies = async (z = zThreshold) => {
    setLoading(true);
    try {
      const [noc, fin, spa] = await Promise.all([
        api.getNocturnalZScore(z),
        api.getFinancialIQR(),
        api.getSpatioTemporalClusters()
      ]);
      setNocturnalData(noc);
      setFinancialData(fin);
      setSpatioData(spa);
    } catch (err) {
      console.error("Failed to load anomalies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header
        title="Exposed Statistical Anomaly & Pattern Detection Engine"
        description="Mathematical anomaly detection across Telecom distributions (Gaussian Z-score), Banking (IQR Structuring), and Physical Meetings (Haversine Spatiotemporal Windows)."
      />

      {/* Threshold Controller */}
      <Card className="border-slate-800 bg-slate-900/90 text-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Gaussian Z-Score Sensitivity Threshold (Z = {zThreshold}σ)
              </label>
              <input
                type="range"
                min="1.0"
                max="3.5"
                step="0.1"
                value={zThreshold}
                onChange={(e) => setZThreshold(parseFloat(e.target.value))}
                className="mt-1 w-60 accent-rose-500"
              />
            </div>
          </div>
          <Button
            onClick={() => fetchAnomalies(zThreshold)}
            className="bg-rose-600 text-xs font-semibold text-white hover:bg-rose-500"
          >
            <Calculator className="mr-2 size-3.5" /> Re-Evaluate Statistical Baselines
          </Button>
        </CardContent>
      </Card>

      {loading && <Loading message="Computing Gaussian Distributions, IQR Whiskers & Spatiotemporal Clusters..." />}

      {!loading && (
        <div className="space-y-6">
          {/* Nocturnal Telecom Anomaly Engine */}
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                  <Moon className="size-4" /> 1. Telecom Nocturnal Distribution (Z-Score vs Mean μ)
                </CardTitle>
                {nocturnalData?.population_baseline && (
                  <Badge className="bg-slate-800 text-[10px] text-slate-300">
                    Population Baseline: μ = {(nocturnalData.population_baseline.mean_nocturnal_ratio * 100).toFixed(1)}% · σ = {(nocturnalData.population_baseline.std_deviation * 100).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-mono text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-blue-400">Mathematical Formula:</span> {nocturnalData?.mathematical_formula}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-950/60 font-mono text-[10px] uppercase text-slate-400">
                    <tr>
                      <th className="p-2.5">Suspect Name</th>
                      <th className="p-2.5">Nocturnal Calls</th>
                      <th className="p-2.5">Total Calls</th>
                      <th className="p-2.5">Nocturnal Ratio</th>
                      <th className="p-2.5">Z-Score Deviation</th>
                      <th className="p-2.5">p-Value Significance</th>
                      <th className="p-2.5">Statistical Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {nocturnalData?.anomalies?.map((a: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-2.5 font-sans font-bold text-white">{a.suspect}</td>
                        <td className="p-2.5 text-rose-400 font-bold">{a.nocturnal_calls}</td>
                        <td className="p-2.5">{a.total_calls}</td>
                        <td className="p-2.5 text-amber-400">{(a.nocturnal_ratio * 100).toFixed(1)}%</td>
                        <td className="p-2.5 text-rose-400 font-bold">+{a.z_score}σ</td>
                        <td className="p-2.5 text-emerald-400">p &lt; {a.p_value_estimate}</td>
                        <td className="p-2.5 font-sans text-xs text-slate-300">{a.verdict}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Financial Structuring & Smurfing Anomaly Engine */}
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Banknote className="size-4" /> 2. Financial Structuring & IQR Outliers
                </CardTitle>
                {financialData?.baseline_statistics && (
                  <Badge className="bg-slate-800 text-[10px] text-slate-300">
                    IQR Whisker Cap: ₹{financialData.baseline_statistics.upper_whisker_inr?.toLocaleString()}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-mono text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-blue-400">Mathematical Formula:</span> {financialData?.mathematical_formula}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-950/60 font-mono text-[10px] uppercase text-slate-400">
                    <tr>
                      <th className="p-2.5">TX ID</th>
                      <th className="p-2.5">Sender</th>
                      <th className="p-2.5">Receiver</th>
                      <th className="p-2.5">Amount (INR)</th>
                      <th className="p-2.5">Anomaly Type</th>
                      <th className="p-2.5">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {financialData?.anomalies?.map((f: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-2.5 text-slate-400">{f.tx_id}</td>
                        <td className="p-2.5 font-sans font-bold text-white">{f.sender}</td>
                        <td className="p-2.5 font-sans font-bold text-white">{f.receiver}</td>
                        <td className="p-2.5 text-amber-400 font-bold">₹{f.amount_inr?.toLocaleString()}</td>
                        <td className="p-2.5 font-sans text-xs text-rose-300">{f.anomaly_type}</td>
                        <td className="p-2.5 text-rose-400 font-bold">{f.severity_score}/10</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Spatiotemporal Physical Co-Location Clusters */}
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <MapPin className="size-4" /> 3. Haversine Spatiotemporal Coincidence Clustering (Δd ≤ 300m, Δt ≤ 20min)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-mono text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-blue-400">Mathematical Formula:</span> {spatioData?.mathematical_formula}
              </p>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {spatioData?.clusters?.map((c: any, idx: number) => (
                  <div key={idx} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{c.suspect_1} & {c.suspect_2}</span>
                      <Badge className="bg-emerald-950 text-[9px] text-emerald-400 border border-emerald-800">
                        {c.sighting_count} Optical Captures
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">Locations: <span className="text-slate-200">{c.locations}</span></p>
                    <p className="mt-1 text-[11px] text-rose-300">{c.investigation_flag}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
