"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/shared/KPICard";
import { api } from "@/lib/api";
import { FinancialIntelligenceResponse } from "@/types";
import { formatINR } from "@/lib/utils";
import { Banknote, AlertTriangle, Receipt } from "lucide-react";

export default function FinancialIntelligencePage() {
  const [data, setData] = useState<FinancialIntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.getFinancialIntelligence();
        setData(res);
      } catch (err: any) {
        setError(err.message || "Failed to load financial intelligence");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner label="Auditing UPI Transfers & Merchant Transactions..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <Header
        title="Module 5 — Financial Intelligence & Money Trails"
        subtitle="Tracking high-volume UPI transactions, wine shop merchant transfers, and money laundering risk signals."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Transactions Audited" value={data?.total_transactions || 0} accent="emerald" icon={Receipt} />
        <KPICard label="Financial Volume" value={formatINR(data?.total_volume_inr || 0)} accent="green" icon={Banknote} />
        <KPICard label="Suspicious Volume Flagged" value={data?.high_risk_suspects_count || 0} accent="red" icon={AlertTriangle} />
      </div>

      <Card className="overflow-hidden p-0 border-slate-300">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-bold font-mono text-slate-900">Suspect Financial Risk Roster</h3>
          <span className="text-xs font-mono text-emerald-700 font-semibold">UPI Money Trails</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Suspect Name</th>
                <th className="p-3 text-right">Transactions</th>
                <th className="p-3 text-right">Total Transfer Volume</th>
                <th className="p-3 text-right">Wine Shop Merchant Transfers</th>
                <th className="p-3 text-center">Threat Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data?.summaries.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{s.suspect_name}</td>
                  <td className="p-3 text-right text-slate-700">{s.total_transactions}</td>
                  <td className="p-3 text-right font-bold text-emerald-700">{formatINR(s.total_volume_inr)}</td>
                  <td className="p-3 text-right text-amber-700 font-bold">{formatINR(s.wine_shop_spent_inr || 0)}</td>
                  <td className="p-3 text-center">
                    <Badge variant={(s.threat_score || 0) > 60 ? "critical" : "moderate"}>
                      {(s.threat_score || 0).toFixed(1)}
                    </Badge>
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
