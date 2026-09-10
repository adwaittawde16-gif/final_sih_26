import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/shared/Sidebar";
import { JudgePitchBanner } from "@/components/shared/JudgeDemoModal";

export const metadata: Metadata = {
  title: "Tactical Intelligence Command Center | Brihanmumbai Police",
  description: "Restricted command-center interface for reviewing synthetic tactical intelligence signals across Mumbai jurisdiction.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-slate-50">
      <body suppressHydrationWarning className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            <JudgePitchBanner />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
