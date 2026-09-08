"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { SocialMediaResponse, SuspectSocialFootprint } from "@/types";
import { Globe, MapPin, Smartphone, AlertTriangle, ShieldCheck, User } from "lucide-react";
import Link from "next/link";

export default function SocialMediaPage() {
  const [data, setData] = useState<SocialMediaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuspect, setSelectedSuspect] = useState<SuspectSocialFootprint | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getSocialAnalytics();
      setData(res);
      if (res.suspects && res.suspects.length > 0) {
        setSelectedSuspect(res.suspects[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load social media analytics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner label="Compiling digital footprint & social media analytics..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <Header
        title="Module 9 — Digital Footprint & Social Media Analytics"
        subtitle="Cross-platform login tracking, location co-occurrences, handle monitoring, and suspicious content surveillance."
      />

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-blue-300 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Monitored Suspects</p>
              <h3 className="text-2xl font-bold text-slate-900 font-mono mt-1">{data?.total_monitored_suspects ?? 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <User className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-amber-300 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Flagged Social Posts</p>
              <h3 className="text-2xl font-bold text-amber-700 font-mono mt-1">{data?.total_flagged_posts ?? 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-emerald-300 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Location Clusters</p>
              <h3 className="text-2xl font-bold text-emerald-700 font-mono mt-1">{data?.total_location_clusters ?? 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Digital Location Overlaps Section */}
      <Card className="space-y-4 border-slate-300 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              Digital Login Location Co-Occurrences
            </h3>
            <p className="text-[11px] font-mono text-slate-500">Approximate geographical locations where multiple suspects logged into social accounts simultaneously</p>
          </div>
          <Badge variant="high">{data?.location_clusters.length} Hotspots Identified</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                <th className="py-2.5 px-3">Approximate Location</th>
                <th className="py-2.5 px-3">Suspect Count</th>
                <th className="py-2.5 px-3">Platforms Used</th>
                <th className="py-2.5 px-3">Devices Used</th>
                <th className="py-2.5 px-3">Co-located Suspects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data?.location_clusters.map((cluster, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{cluster.approximate_location}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                      {cluster.suspect_count} Suspects
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{cluster.platforms_used}</td>
                  <td className="py-2.5 px-3 text-slate-600">{cluster.devices_used}</td>
                  <td className="py-2.5 px-3 text-slate-800">
                    {cluster.suspects.map((s, idx) => (
                      <span key={idx} className="mr-1.5 inline-block bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                        {s}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Suspect Digital Footprint Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suspect Selection List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wider">Monitored Profiles</h3>
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {data?.suspects.map((s) => (
              <div
                key={s.suspect_name}
                onClick={() => setSelectedSuspect(s)}
                className={`p-3 rounded-xl border cursor-pointer transition-all font-mono text-xs ${
                  selectedSuspect?.suspect_name === s.suspect_name
                    ? "bg-blue-50 border-blue-400 shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{s.suspect_name}</span>
                  <Badge variant={s.risk_score > 70 ? "critical" : "moderate"}>
                    Score: {s.risk_score.toFixed(0)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                  <span>{s.phone_number}</span>
                  <span>{s.total_platforms} Platforms · {s.total_posts} Posts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Suspect Digital Footprint Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedSuspect ? (
            <Card className="space-y-4 border-slate-300 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedSuspect.suspect_name}</h3>
                  <p className="text-xs font-mono text-slate-500">Phone: {selectedSuspect.phone_number} · Overall Sentiment: <span className="text-red-600 font-bold">{selectedSuspect.overall_sentiment}</span></p>
                </div>
                <Link href={`/dossiers?suspect=${encodeURIComponent(selectedSuspect.suspect_name)}`}>
                  <Button size="sm" variant="outline">View Full Dossier</Button>
                </Link>
              </div>

              {/* Profiles */}
              <div>
                <h4 className="text-xs font-bold font-mono text-slate-700 uppercase mb-2">Social Media Accounts</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                  {selectedSuspect.profiles.map((p, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-700">{p.platform}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">{p.status_flag}</span>
                      </div>
                      <p className="text-slate-800 font-semibold">{p.handle}</p>
                      <p className="text-[10px] text-slate-500">{p.followers_count} Followers · {p.following_count} Following</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Flagged Posts */}
              <div>
                <h4 className="text-xs font-bold font-mono text-slate-700 uppercase mb-2">Recent Monitored Posts & Check-ins</h4>
                <div className="space-y-3">
                  {selectedSuspect.recent_posts.map((post) => (
                    <div key={post.post_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{post.platform} · Check-in: {post.location_checkin}</span>
                        <span className="text-[10px] text-slate-500">{post.timestamp}</span>
                      </div>
                      <p className="text-slate-700 font-sans text-xs bg-white p-2 rounded border border-slate-200 italic">
                        "{post.content}"
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <div className="flex gap-2">
                          <span>{post.likes} Likes</span>
                          <span>{post.shares} Shares</span>
                        </div>
                        <div className="flex gap-1">
                          {post.hashtags.map((h, hi) => (
                            <span key={hi} className="text-blue-600 font-semibold">{h}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center text-xs font-mono text-slate-500">
              Select a suspect to view their digital footprint and social media analytics.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
