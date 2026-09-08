"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/shared/KPICard";
import { api } from "@/lib/api";
import { CrimeRingsResponse } from "@/types";
import { Layers, ShieldAlert, Radio } from "lucide-react";

export default function CrimeRingsPage() {
  const [data, setData] = useState<CrimeRingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.getCrimeRings();
        setData(res);
      } catch (err: any) {
        setError(err.message || "Failed to load crime rings");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner label="Running Connected Component Crime Syndicate Detection..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <Header
        title="Module 4 — Crime Rings & Syndicate Cells"
        subtitle="Connected graph component analysis identifying criminal networks and leaders."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Total Crime Rings Detected" value={data?.total_rings || 88} accent="purple" icon={Layers} />
        <KPICard label="Priority Target Cell" value={data?.priority_ring || "RING-01"} accent="red" icon={ShieldAlert} />
        <KPICard label="Primary Hub Zone" value="Mumbai Central" accent="blue" icon={Radio} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.rings.slice(0, 15).map((ring) => (
          <Card key={ring.syndicate_id} className="space-y-3 hover:border-slate-400 transition-all">
            <div className="flex items-center justify-between">
              <Badge variant={ring.syndicate_id === "RING-01" ? "critical" : "default"}>
                {ring.syndicate_id}
              </Badge>
              <span className="text-xs font-mono text-slate-500 font-semibold">{ring.member_count} Members</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Ring Leader</span>
              <h4 className="text-base font-bold text-slate-900">{ring.ring_leader}</h4>
              <p className="text-xs font-mono text-slate-600">{ring.leader_phone}</p>
            </div>
            <div className="border-t border-slate-200 pt-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Syndicate Roster</span>
              <p className="text-xs font-sans text-slate-700 mt-1 line-clamp-2">{ring.members.join(", ")}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
