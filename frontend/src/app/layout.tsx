import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/shared/Sidebar";

export const metadata: Metadata = {
  title: "Nexus Intelligence Platform",
  description: "Cross-source intelligence workspace for entity, network, financial, and location analysis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning className="bg-[#f3f5f4]"><body suppressHydrationWarning className="min-h-screen bg-[#f3f5f4] text-[#1f2729]"><div className="flex min-h-screen"><Sidebar /><main className="min-w-0 flex-1 overflow-y-auto">{children}</main></div></body></html>;
}
