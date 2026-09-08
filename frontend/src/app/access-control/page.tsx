"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/shared/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { api } from "@/lib/api";
import { ShieldCheck, Lock, UserCheck, KeyRound, History, Eye, CheckCircle, AlertCircle } from "lucide-react";

export default function AccessControlPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentOfficer, setCurrentOfficer] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAuthUsers(),
      api.getAuditTrail(20)
    ]).then(([uData, aData]) => {
      setUsers(uData || []);
      setAuditLogs(aData || []);
      if (uData && uData.length > 0) {
        handleLogin(uData[0].username);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleLogin = async (username: string) => {
    try {
      const auth = await api.loginOfficer(username);
      setCurrentOfficer(auth);
      // Refresh audit logs
      const updatedAudit = await api.getAuditTrail(20);
      setAuditLogs(updatedAudit || []);
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header
        title="Role-Based Access Control (RBAC) & Forensic Audit Trail"
        description="Statutory law enforcement access control layers, cryptographic token verification, and immutable audit logs."
      />

      {loading && <Loading message="Loading Police Officer Access Directories & Forensic Audit Trail..." />}

      {!loading && (
        <div className="space-y-6">
          {/* Active Officer Status Card */}
          {currentOfficer && (
            <Card className="border-blue-900/40 bg-blue-950/20 text-white">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-blue-600 font-mono text-lg font-bold shadow-lg shadow-blue-950/40">
                    <ShieldCheck className="size-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-white">{currentOfficer.name}</p>
                      <Badge className="bg-blue-600 text-[10px] font-bold text-white">
                        {currentOfficer.role}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-300">{currentOfficer.designation} · Badge: <span className="font-mono text-blue-300">{currentOfficer.badge_id}</span></p>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-slate-400">
                  <p>Session Token: <span className="text-emerald-400 font-bold">{currentOfficer.session_token}</span></p>
                  <p className="mt-0.5 text-slate-500">Authenticated: {currentOfficer.authenticated_at}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Officer Role Switcher (For Judges) */}
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Switch Authorized Officer Identity (Live RBAC Demo)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {users.map((u) => {
                  const isActive = currentOfficer?.username === u.username;
                  return (
                    <div
                      key={u.username}
                      onClick={() => handleLogin(u.username)}
                      className={`cursor-pointer rounded-xl border p-4 transition ${isActive ? "border-blue-500 bg-blue-950/40 shadow-md" : "border-slate-800 bg-slate-950 hover:border-slate-700"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{u.name}</span>
                        {isActive && <CheckCircle className="size-4 text-blue-400" />}
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-blue-300">{u.role}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{u.designation}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {u.permissions?.slice(0, 2).map((p: string, idx: number) => (
                          <span key={idx} className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Forensic Audit Log */}
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <History className="size-4 text-amber-400" /> Tamper-Evident Forensic Audit Trail
                </CardTitle>
                <Badge className="bg-slate-800 text-[10px] text-slate-400">
                  Immutable SecOps Log
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-950/60 font-mono text-[10px] uppercase text-slate-400">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Officer Name</th>
                      <th className="p-3">Security Action</th>
                      <th className="p-3">Resource Target</th>
                      <th className="p-3">Security Level</th>
                      <th className="p-3">Terminal IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {auditLogs.map((log: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-3 text-slate-400">{log.timestamp}</td>
                        <td className="p-3 font-sans font-bold text-white">{log.officer_name}</td>
                        <td className="p-3 text-blue-400">{log.action}</td>
                        <td className="p-3 text-amber-400">{log.resource}</td>
                        <td className="p-3">
                          <Badge className="bg-slate-800 text-[9px] text-slate-300">
                            {log.security_level}
                          </Badge>
                        </td>
                        <td className="p-3 text-slate-500">{log.ip_address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
