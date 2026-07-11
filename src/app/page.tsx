"use client";

import { useAnalyzerStore } from "@/lib/store";
import { Header } from "@/components/analyzer/header";
import { LandingScreen } from "@/components/analyzer/landing-screen";
import { ProgressScreen } from "@/components/analyzer/progress-screen";
import { ReportScreen } from "@/components/analyzer/report-screen";
import { ErrorScreen } from "@/components/analyzer/error-screen";

export default function Home() {
  const screen = useAnalyzerStore((s) => s.screen);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {screen === "landing" && <LandingScreen />}
        {screen === "analyzing" && <ProgressScreen />}
        {screen === "report" && <ReportScreen />}
        {screen === "error" && <ErrorScreen />}
      </main>
    </div>
  );
}
