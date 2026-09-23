import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/shared/Sidebar";
import { TacticalCommandBar } from "@/components/shared/TacticalCommandBar";
import { AICopilotDrawer } from "@/components/shared/AICopilotDrawer";
import { NavProvider } from "@/components/shared/NavContext";
import { ThemeProvider } from "@/components/shared/ThemeContext";

export const metadata: Metadata = {
  title: "NetSentinel — Intelligence Operations Platform",
  description: "Tactical Police Intelligence & Multi-Modal Crime Network Forensics Platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[var(--bg)] text-[var(--text)] flex min-h-screen antialiased">
        <ThemeProvider>
          <NavProvider>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
              <TacticalCommandBar />
              <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 max-w-[1700px] w-full mx-auto space-y-6">
                {children}
              </main>
            </div>
            <AICopilotDrawer />
          </NavProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

