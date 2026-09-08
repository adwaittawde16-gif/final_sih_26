"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { KPICard } from "@/components/shared/KPICard";
import { api } from "@/lib/api";
import { NocturnalAnomaliesResponse, GeoPoint } from "@/types";
import { Moon, Radio } from "lucide-react";
import { LeafletMapView } from "@/components/shared/LeafletMapView";

export default function NocturnalAnomaliesPage() {
  const [data, setData] = useState<NocturnalAnomaliesResponse | null>(null);
  const [geoPoints, setGeoPoints] = useState<GeoPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [res, geoRes] = await Promise.all([
          api.getNocturnalAnomalies().catch(() => null),
          api.getGeoPoints("NOCTURNAL").catch(() => null)
        ]);
        if (res) setData(res);
        if (geoRes) setGeoPoints(geoRes.points);
      } catch (err: any) {
        setError(err.message || "Failed to load nocturnal anomalies");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner label="Filtering Midnight Communications (00:00–06:00 IST)..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <Header
        title="Module 6 — Nocturnal Call Anomalies"
        subtitle="Detection of suspicious midnight calls (00:00–06:00 IST) and cell tower handover hotspots across Mumbai."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KPICard label="Midnight Calls Flagged" value={data?.total_anomalies || 0} accent="cyan" icon={Moon} subtext="00:00 - 06:00 IST" />
        <KPICard label="Cell Tower Hotspots" value={data?.hotspots_count || 0} accent="amber" icon={Radio} subtext="Monitored handover towers" />
      </div>

      {/* Leaflet Cell Tower Map */}
      <LeafletMapView
        points={geoPoints}
        title="Nocturnal Cell Tower GPS Map"
        subtitle="Geospatial distribution of midnight cell tower handovers and high-risk handover locations"
      />


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cell Tower Hotspots */}
        <Card className="lg:col-span-1 space-y-4 border-slate-300">
          <h3 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-700" /> Cell Tower Hotspots
          </h3>
          <div className="space-y-2">
            {data?.towers.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs">
                <span className="text-slate-800 font-medium truncate">{t.cell_tower_location}</span>
                <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {t.nocturnal_call_count} calls
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Nocturnal Calls Log */}
        <Card className="lg:col-span-2 overflow-hidden p-0 border-slate-300">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-bold font-mono text-slate-900">Midnight Communication Log</h3>
          </div>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px] sticky top-0">
                <tr>
                  <th className="p-3">Caller</th>
                  <th className="p-3">Receiver</th>
                  <th className="p-3">Tower Location</th>
                  <th className="p-3 text-right">Duration</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data?.calls.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{c.caller_name}</td>
                    <td className="p-3 font-bold text-slate-900">{c.receiver_name}</td>
                    <td className="p-3 text-slate-600">{c.cell_tower_location}</td>
                    <td className="p-3 text-right font-bold text-cyan-700">{c.duration_seconds}s</td>
                    <td className="p-3 text-right text-amber-700">{c.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
