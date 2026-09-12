"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { KPICard } from "@/components/shared/KPICard";
import { api } from "@/lib/api";
import { SurveillanceHeatmapResponse, GeoPoint } from "@/types";
import { Eye, MapPin, ShieldCheck } from "lucide-react";
import { LeafletMapView } from "@/components/shared/LeafletMapView";

export default function FieldSurveillancePage() {
  const [data, setData] = useState<SurveillanceHeatmapResponse | null>(null);
  const [geoPoints, setGeoPoints] = useState<GeoPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [res, geoRes] = await Promise.all([
          api.getSurveillanceHeatmap().catch(() => null),
          api.getGeoPoints("SURVEILLANCE").catch(() => null)
        ]);
        if (res) setData(res);
        if (geoRes) setGeoPoints(geoRes.points);
      } catch (err: any) {
        setError(err.message || "Failed to load surveillance reports");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner label="Loading Field Surveillance Observation Logs..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <Header
        title="Module 7 — Field Surveillance Density & Observations"
        subtitle="Field officer sighting logs, spatial coordinates, and Mumbai operational area observation notes."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Field Observations Logged" value={data?.total_observations || 0} accent="indigo" icon={Eye} />
        <KPICard label="Monitored Zones" value="Mumbai Metropolitan" accent="blue" icon={MapPin} />
        <KPICard label="Reporting Officers" value="Special Branch" accent="green" icon={ShieldCheck} />
      </div>

      {/* Leaflet Field Surveillance Map */}
      <LeafletMapView
        points={geoPoints}
        title="Field Surveillance Spot GPS Map"
        subtitle="Interactive spatial map of field officer observation spots and panchnama locations"
      />


      <Card className="overflow-hidden p-0 border-slate-300">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-bold font-mono text-slate-900">Field Surveillance Observation Logs</h3>
          <span className="text-xs font-mono text-indigo-700 font-semibold">Special Branch Intelligence</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Report ID</th>
                <th className="p-3">FIR Number</th>
                <th className="p-3">Spot Location</th>
                <th className="p-3">Observation Details</th>
                <th className="p-3 text-right">Patrol Officer</th>
                <th className="p-3 text-center">Panchnama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data?.reports.map((r) => (
                <tr key={r.report_id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-indigo-700">{r.report_id}</td>
                  <td className="p-3 font-bold text-slate-900">{r.fir_number}</td>
                  <td className="p-3 text-slate-800 font-sans font-medium">{r.spot_location}</td>
                  <td className="p-3 text-slate-600 font-sans max-w-md truncate">{r.observation_details}</td>
                  <td className="p-3 text-right text-slate-700">{r.patrol_officer_1}</td>
                  <td className="p-3 text-center font-bold text-emerald-700">
                    {r.panchnama_conducted ? "YES" : "NO"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
