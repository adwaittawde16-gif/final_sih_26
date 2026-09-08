"use client";

import { useState } from "react";
import { Header } from "@/components/shared/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { api } from "@/lib/api";
import { Zap, Gauge, Server, Activity, Database, CheckCircle2, Clock } from "lucide-react";

export default function ScalabilityBenchmarkPage() {
  const [recordCount, setRecordCount] = useState<number>(50000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRunTest = async (count = recordCount) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.runStressTest(count);
      setResult(res);
    } catch (err) {
      console.error("Benchmark failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header
        title="Big Data Scalability & High-Throughput Stress Benchmark"
        description="Prove production-grade capabilities by processing 10,000 to 100,000+ real-time telecom/financial transactions with vectorized sub-second execution."
      />

      {/* Preset Selector */}
      <Card className="border-slate-800 bg-slate-900/90 text-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Stress Dataset Volume:
            </span>
            {[10000, 25000, 50000, 100000].map((num) => (
              <Button
                key={num}
                variant={recordCount === num ? "default" : "outline"}
                size="sm"
                onClick={() => { setRecordCount(num); handleRunTest(num); }}
                className={recordCount === num ? "bg-blue-600 font-bold text-white" : "border-slate-700 bg-slate-950 text-slate-300 hover:text-white"}
              >
                <Database className="mr-1.5 size-3.5 text-blue-400" />
                {num.toLocaleString()} Records
              </Button>
            ))}
          </div>

          <Button
            onClick={() => handleRunTest(recordCount)}
            disabled={loading}
            className="bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500"
          >
            <Zap className="mr-2 size-3.5" /> Execute Live Pipeline Benchmark
          </Button>
        </CardContent>
      </Card>

      {loading && <Loading message={`Generating and Vector-Processing ${recordCount.toLocaleString()} Transactions in RAM...`} />}

      {!loading && !result && (
        <Card className="flex h-80 flex-col items-center justify-center border-dashed border-slate-800 bg-slate-900/40 text-center text-slate-500">
          <Gauge className="mb-3 size-12 text-slate-700" />
          <p className="text-sm font-semibold">Benchmark Engine Ready</p>
          <p className="mt-1 text-xs">Select record volume above and execute the live stress test.</p>
        </Card>
      )}

      {!loading && result && (
        <div className="space-y-6">
          {/* Result KPIs */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5">
              <div className="flex items-center gap-2 text-slate-400">
                <Gauge className="size-4 text-emerald-400" />
                <p className="text-[10px] font-bold uppercase tracking-wider">Throughput Speed</p>
              </div>
              <p className="mt-2 text-3xl font-black text-emerald-400">
                {result.throughput_events_per_second?.toLocaleString()}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">events / sec</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="size-4 text-blue-400" />
                <p className="text-[10px] font-bold uppercase tracking-wider">Total Latency</p>
              </div>
              <p className="mt-2 text-3xl font-black text-blue-400">
                {(result.total_execution_time_seconds * 1000).toFixed(1)} ms
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">Full pipeline end-to-end</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5">
              <div className="flex items-center gap-2 text-slate-400">
                <Server className="size-4 text-amber-400" />
                <p className="text-[10px] font-bold uppercase tracking-wider">Memory Footprint</p>
              </div>
              <p className="mt-2 text-3xl font-black text-amber-400">
                {result.memory_footprint_mb} MB
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">In-RAM DataFrame size</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5">
              <div className="flex items-center gap-2 text-slate-400">
                <Activity className="size-4 text-rose-400" />
                <p className="text-[10px] font-bold uppercase tracking-wider">Anomalies Detected</p>
              </div>
              <p className="mt-2 text-3xl font-black text-rose-400">
                {result.output_metrics?.total_nocturnal_anomalies_flagged?.toLocaleString()}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">Nocturnal burst transactions</p>
            </div>
          </div>

          {/* Verdict Box */}
          <Card className="border-emerald-900/40 bg-emerald-950/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <CheckCircle2 className="size-4" /> Production Scalability Verdict
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-semibold text-white">{result.verdict}</p>
              <div className="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2 font-mono text-xs text-slate-300">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[10px] uppercase text-slate-500">Vector Generation Latency:</p>
                  <p className="mt-1 font-bold text-blue-300">{(result.timings?.vectorized_generation_seconds * 1000).toFixed(1)} ms</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[10px] uppercase text-slate-500">Graph Aggregation &amp; Anomaly Scan:</p>
                  <p className="mt-1 font-bold text-emerald-300">{(result.timings?.graph_aggregation_and_anomaly_scan_seconds * 1000).toFixed(1)} ms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
