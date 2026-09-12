"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { KPICard } from "@/components/shared/KPICard";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { CCTVMeetingsResponse, GeoPoint } from "@/types";
import { Camera, MapPin, Percent } from "lucide-react";
import { LeafletMapView } from "@/components/shared/LeafletMapView";

export default function CCTVCoLocationPage() {
  const [data, setData] = useState<CCTVMeetingsResponse | null>(null);
  const [geoPoints, setGeoPoints] = useState<GeoPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [res, geoRes] = await Promise.all([
          api.getCCTVMeetings().catch(() => null),
          api.getGeoPoints("CCTV").catch(() => null)
        ]);
        if (res) setData(res);
        if (geoRes) setGeoPoints(geoRes.points);
        if (res?.meetings.length) {
          setSelectedMeeting(res.meetings[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load CCTV encounters");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner label="Correlating CCTV Camera Log Encounters..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <Header
        title="Module 3 — CCTV Physical Co-Location"
        subtitle="Confirmed physical encounters detected by municipal camera logs and facial match confidence."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Confirmed Encounters" value={data?.total_encounters || 0} accent="amber" icon={Camera} />
        <KPICard label="Avg Match Confidence" value={`${data?.avg_confidence_pct || 0}%`} accent="green" icon={Percent} />
        <KPICard label="Mean Distance Proximity" value={`${data?.mean_distance_meters || 0} meters`} accent="cyan" icon={MapPin} />
      </div>

      {/* Interactive Leaflet Map Visualizer */}
      <LeafletMapView
        points={geoPoints}
        title="CCTV Camera Co-Location GPS Map"
        subtitle="Real-time Leaflet map of CCTV camera locations and co-location encounters"
      />


      {/* CCTV Encounter Map & Inspector View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Sightings List View */}
        <Card className="lg:col-span-2 space-y-4 bg-slate-900 text-white border-slate-800 p-4 min-h-[450px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Spatial Co-Location Encounter Map ({data?.meetings.length} Encounters Detected)
              </span>
            </div>
            <Badge variant="cyan">Folium Geospatial Map Active</Badge>
          </div>

          {/* Interactive Sighting Marker Cards Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-1">
            {data?.meetings.map((m, idx) => {
              const isSelected = selectedMeeting?.camera_id === m.camera_id && selectedMeeting?.suspect_1 === m.suspect_1;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedMeeting(m)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-800 border-amber-400 ring-2 ring-amber-400/40 shadow-lg"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="high">{(m.avg_match_confidence * 100).toFixed(1)}% Match</Badge>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{m.avg_distance_meters.toFixed(1)}m dist</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{m.suspect_1} & {m.suspect_2}</h4>
                  <p className="text-[10px] font-sans text-slate-400 mt-1 line-clamp-1">{m.camera_location}</p>
                  <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between text-[9px] font-mono text-slate-500">
                    <span>Cam: {m.camera_id}</span>
                    <span>Calls: {m.cdr_call_count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Selected CCTV Encounter Inspector */}
        <Card className="lg:col-span-1 space-y-4 border-slate-300 bg-white">
          {selectedMeeting ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold">Encounter Inspector</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedMeeting.camera_location}</h3>
                <p className="text-xs font-mono text-slate-500">Camera ID: {selectedMeeting.camera_id}</p>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                  <span className="text-slate-600">Suspect 1</span>
                  <span className="font-bold text-slate-900">{selectedMeeting.suspect_1}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                  <span className="text-slate-600">Suspect 2</span>
                  <span className="font-bold text-slate-900">{selectedMeeting.suspect_2}</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex justify-between">
                  <span className="text-amber-800 font-semibold">Face Match Confidence</span>
                  <span className="font-bold text-amber-900">{(selectedMeeting.avg_match_confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="p-2.5 bg-cyan-50 rounded-lg border border-cyan-200 flex justify-between">
                  <span className="text-cyan-800 font-semibold">Proximity Distance</span>
                  <span className="font-bold text-cyan-900">{selectedMeeting.avg_distance_meters.toFixed(1)} meters</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                  <span className="text-slate-600">CDR Calls Between Pair</span>
                  <span className="font-bold text-blue-700">{selectedMeeting.cdr_call_count} calls</span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between">
                  <span className="text-emerald-800 font-semibold">Verification Status</span>
                  <span className="font-bold text-emerald-900">{selectedMeeting.sighting_status}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-xs font-mono text-slate-500">
              Select a CCTV sighting encounter to view camera details & face match confidence.
            </div>
          )}
        </Card>
      </div>

      {/* Tabular Encounter Log */}
      <Card className="overflow-hidden p-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-bold font-mono text-slate-900">Full CCTV Encounters Roster</h3>
          <span className="text-xs font-mono text-slate-500 font-semibold">Sorted by Confidence</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Suspect 1</th>
                <th className="p-3">Suspect 2</th>
                <th className="p-3">Camera Location</th>
                <th className="p-3 text-right">Camera ID</th>
                <th className="p-3 text-right">Proximity Distance</th>
                <th className="p-3 text-right">Match Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data?.meetings.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{m.suspect_1}</td>
                  <td className="p-3 font-bold text-slate-900">{m.suspect_2}</td>
                  <td className="p-3 text-slate-700 font-sans font-medium">{m.camera_location}</td>
                  <td className="p-3 text-right text-slate-500">{m.camera_id}</td>
                  <td className="p-3 text-right text-cyan-700 font-bold">{m.avg_distance_meters.toFixed(1)} m</td>
                  <td className="p-3 text-right text-emerald-700 font-bold">{(m.avg_match_confidence * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
