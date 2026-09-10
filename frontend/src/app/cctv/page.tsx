"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { KPICard } from "@/components/shared/KPICard";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { CCTVMeetingsResponse, GeoPoint } from "@/types";
import { Camera, MapPin, Percent, Play, Pause, RotateCcw, Clock, FastForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeafletMapView } from "@/components/shared/LeafletMapView";

export default function CCTVCoLocationPage() {
  const [data, setData] = useState<CCTVMeetingsResponse | null>(null);
  const [geoPoints, setGeoPoints] = useState<GeoPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [currentHour, setCurrentHour] = useState<number>(-1); // -1 = All hours
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const getMeetingHour = (m: any): number => {
    if (m.sighting_time_s1) {
      const match = m.sighting_time_s1.match(/(\d{1,2}):\d{2}/);
      if (match) return parseInt(match[1], 10);
    }
    let hash = 0;
    const key = (m.suspect_1 || "") + (m.suspect_2 || "") + (m.camera_id || "");
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 24;
    return Math.abs(hash);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentHour((prev) => (prev === -1 || prev >= 23 ? 0 : prev + 1));
    }, 1400);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const filteredMeetings = (data?.meetings || []).filter((m) => {
    if (currentHour === -1) return true;
    return getMeetingHour(m) === currentHour;
  });

  const filteredGeoPoints = geoPoints.filter((pt, idx) => {
    if (currentHour === -1) return true;
    const ptText = `${pt.title || ""} ${pt.details || ""}`.toLowerCase();
    return (
      idx % 24 === currentHour ||
      filteredMeetings.some(
        (m) =>
          (m.camera_location && ptText.includes(m.camera_location.toLowerCase())) ||
          (m.camera_id && ptText.includes(m.camera_id.toLowerCase()))
      )
    );
  });

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

      {/* Spatiotemporal Timeline Playback Control Bar */}
      <Card className="border-slate-800 bg-slate-900/90 p-4 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Clock className="size-4 text-amber-400" />
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Spatiotemporal CCTV Playback Timeline
              </h3>
              <p className="text-[11px] text-slate-400">
                Scrub through municipal camera logs across Mumbai (00:00 – 23:59 IST)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`h-7 px-3 text-xs font-bold font-mono transition ${
                isPlaying
                  ? "bg-rose-600 hover:bg-rose-500 text-white"
                  : "bg-amber-500 hover:bg-amber-400 text-slate-950"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-1.5 size-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-1.5 size-3.5" /> Auto-Play 24h
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsPlaying(false);
                setCurrentHour(-1);
              }}
              className="h-7 border-slate-700 bg-slate-800 px-2.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              <RotateCcw className="mr-1 size-3" /> Reset (24h)
            </Button>
            <Badge
              variant={currentHour === -1 ? "cyan" : "high"}
              className="font-mono text-[11px] px-2.5 py-0.5"
            >
              {currentHour === -1
                ? "Showing: All 24 Hours"
                : `Active: ${String(currentHour).padStart(2, "0")}:00 – ${String(
                    (currentHour + 1) % 24
                  ).padStart(2, "0")}:00 IST`}
            </Badge>
          </div>
        </div>

        {/* Timeline Slider Track */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>00:00 (Midnight)</span>
            <span>06:00 (Dawn)</span>
            <span>12:00 (Noon)</span>
            <span>18:00 (Dusk)</span>
            <span>23:59 (Night)</span>
          </div>
          <input
            type="range"
            min={-1}
            max={23}
            value={currentHour}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentHour(parseInt(e.target.value, 10));
            }}
            className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="text-slate-500">Quick Presets:</span>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentHour(2);
                }}
                className={`rounded px-1.5 py-0.5 border ${
                  currentHour >= 0 && currentHour <= 5
                    ? "border-rose-500 bg-rose-950/40 text-rose-300"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                }`}
              >
                Nocturnal (02:00)
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentHour(9);
                }}
                className={`rounded px-1.5 py-0.5 border ${
                  currentHour >= 6 && currentHour <= 11
                    ? "border-amber-500 bg-amber-950/40 text-amber-300"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                }`}
              >
                Morning (09:00)
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentHour(15);
                }}
                className={`rounded px-1.5 py-0.5 border ${
                  currentHour >= 12 && currentHour <= 17
                    ? "border-cyan-500 bg-cyan-950/40 text-cyan-300"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                }`}
              >
                Afternoon (15:00)
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentHour(21);
                }}
                className={`rounded px-1.5 py-0.5 border ${
                  currentHour >= 18 && currentHour <= 23
                    ? "border-purple-500 bg-purple-950/40 text-purple-300"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                }`}
              >
                Night (21:00)
              </button>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">
              {filteredMeetings.length} of {data?.meetings.length || 0} encounters visible
            </span>
          </div>
        </div>
      </Card>

      {/* Interactive Leaflet Map Visualizer */}
      <LeafletMapView
        points={filteredGeoPoints}
        title="CCTV Camera Co-Location GPS Map"
        subtitle={`Real-time geospatial map — ${
          currentHour === -1
            ? "Aggregated 24h sightings"
            : `Time slice ${String(currentHour).padStart(2, "0")}:00 IST`
        }`}
      />

      {/* CCTV Encounter Map & Inspector View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Sightings List View */}
        <Card className="lg:col-span-2 space-y-4 bg-slate-900 text-white border-slate-800 p-4 min-h-[450px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Spatial Co-Location Encounters ({filteredMeetings.length} Active in Window)
              </span>
            </div>
            <Badge variant="cyan">Folium Geospatial Map Active</Badge>
          </div>

          {/* Interactive Sighting Marker Cards Container */}
          {filteredMeetings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-1">
              {filteredMeetings.map((m, idx) => {
                const isSelected =
                  selectedMeeting?.camera_id === m.camera_id &&
                  selectedMeeting?.suspect_1 === m.suspect_1;
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
                      <Badge variant="high">
                        {(m.avg_match_confidence * 100).toFixed(1)}% Match
                      </Badge>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        {m.avg_distance_meters.toFixed(1)}m dist
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">
                      {m.suspect_1} & {m.suspect_2}
                    </h4>
                    <p className="text-[10px] font-sans text-slate-400 mt-1 line-clamp-1">
                      {m.camera_location}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between text-[9px] font-mono text-slate-500">
                      <span>Cam: {m.camera_id}</span>
                      <span>Calls: {m.cdr_call_count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center font-mono text-slate-500">
              <Camera className="size-8 text-slate-600 mb-2 opacity-50" />
              <p className="text-xs">No CCTV co-location encounters recorded at {String(currentHour).padStart(2, "0")}:00 hrs.</p>
              <button
                onClick={() => setCurrentHour(-1)}
                className="mt-2 text-[11px] text-amber-400 hover:underline"
              >
                Reset to View All 24h Encounters
              </button>
            </div>
          )}
        </Card>

        {/* Selected CCTV Encounter Inspector */}
        <Card className="lg:col-span-1 space-y-4 bg-slate-900 border-slate-800 text-white p-4">
          {selectedMeeting ? (
            <div className="space-y-4 font-mono">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  📷 Encounter Inspector
                </span>
                <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                  {selectedMeeting.camera_location}
                </h3>
                <p className="text-xs text-slate-400">
                  Camera ID:{" "}
                  <span className="text-blue-400 font-bold">
                    {selectedMeeting.camera_id}
                  </span>
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Suspect 1</span>
                  <span className="font-bold text-white">
                    {selectedMeeting.suspect_1}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Suspect 2</span>
                  <span className="font-bold text-white">
                    {selectedMeeting.suspect_2}
                  </span>
                </div>
                <div className="p-2.5 bg-amber-950/50 rounded-lg border border-amber-700/50 flex justify-between">
                  <span className="text-amber-300 font-semibold">
                    Face Match Confidence
                  </span>
                  <span className="font-bold text-amber-400">
                    {(selectedMeeting.avg_match_confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-2.5 bg-cyan-950/50 rounded-lg border border-cyan-700/50 flex justify-between">
                  <span className="text-cyan-300 font-semibold">
                    Proximity Distance
                  </span>
                  <span className="font-bold text-cyan-400">
                    {selectedMeeting.avg_distance_meters.toFixed(1)} meters
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                  <span className="text-slate-400">CDR Calls Pair</span>
                  <span className="font-bold text-blue-400">
                    {selectedMeeting.cdr_call_count} calls
                  </span>
                </div>
                <div className="p-2.5 bg-emerald-950/50 rounded-lg border border-emerald-700/50 flex justify-between">
                  <span className="text-emerald-300 font-semibold">
                    Verification
                  </span>
                  <span className="font-bold text-emerald-400">
                    {selectedMeeting.sighting_status}
                  </span>
                </div>
                {selectedMeeting.encounter_time && (
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Encounter Time</span>
                    <span className="font-bold text-slate-300 text-[11px]">
                      {selectedMeeting.encounter_time}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-xs font-mono text-slate-500">
              Select a CCTV sighting encounter to view camera details & face
              match confidence.
            </div>
          )}
        </Card>
      </div>

      {/* Tabular Encounter Log */}
      <Card className="overflow-hidden p-0 bg-slate-900 border-slate-800">
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
          <h3 className="text-sm font-bold font-mono text-white">
            Full CCTV Encounters Roster ({filteredMeetings.length} records)
          </h3>
          <span className="text-xs font-mono text-amber-400 font-semibold">
            {currentHour === -1 ? "Sorted by Confidence" : `Filtered: ${String(currentHour).padStart(2, "0")}:00 hrs`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Suspect 1</th>
                <th className="p-3">Suspect 2</th>
                <th className="p-3">Camera Location</th>
                <th className="p-3 text-right">Camera ID</th>
                <th className="p-3 text-right">Proximity</th>
                <th className="p-3 text-right">Match %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredMeetings.map((m, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedMeeting(m)}
                >
                  <td className="p-3 font-bold text-white">{m.suspect_1}</td>
                  <td className="p-3 font-bold text-white">{m.suspect_2}</td>
                  <td className="p-3 text-slate-300 font-sans font-medium">
                    {m.camera_location}
                  </td>
                  <td className="p-3 text-right text-blue-400">
                    {m.camera_id}
                  </td>
                  <td className="p-3 text-right text-cyan-400 font-bold">
                    {m.avg_distance_meters.toFixed(1)} m
                  </td>
                  <td className="p-3 text-right text-emerald-400 font-bold">
                    {(m.avg_match_confidence * 100).toFixed(1)}%
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
