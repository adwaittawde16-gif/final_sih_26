import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/shared/Sidebar";

export const metadata: Metadata = {
  title: "Mumbai Police Intelligence Platform — SIH 26",
  description: "Tactical Police Intelligence & Crime Network Analytics Platform for Brihanmumbai Police Department.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-slate-900 flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
