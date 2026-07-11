"use client";

import * as React from "react";
import { X, Loader2, CheckCircle2, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAnalyzerStore } from "@/lib/store";

const PHASES = [
  {
    id: 1,
    name: "Chunk Processing",
    description: "Analyzing weekly chunks with the fast model",
  },
  {
    id: 2,
    name: "Summary Aggregation",
    description: "Compressing summaries by month if needed",
  },
  {
    id: 3,
    name: "Report Generation",
    description: "Synthesizing the final comprehensive report",
  },
];

function formatEta(seconds: number): string {
  if (seconds <= 0) return "calculating...";
  if (seconds < 60) return `~${seconds}s remaining`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `~${mins}m ${secs}s remaining`;
}

export function ProgressScreen() {
  const {
    progress,
    cooldown,
    requestCancel,
    resetCancel,
    setScreen,
    setProgress,
  } = useAnalyzerStore();

  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [etaSeconds, setEtaSeconds] = React.useState<number | undefined>();

  // Track elapsed time for ETA estimation when LLM doesn't provide one
  React.useEffect(() => {
    if (!progress) return;
    if (progress.etaSeconds !== undefined) {
      setEtaSeconds(progress.etaSeconds);
    }
  }, [progress]);

  // Cooldown countdown
  React.useEffect(() => {
    if (!cooldown) return;
    const interval = setInterval(() => {
      const c = useAnalyzerStore.getState().cooldown;
      if (!c || c.seconds <= 1) {
        useAnalyzerStore.setState({ cooldown: null });
        clearInterval(interval);
      } else {
        useAnalyzerStore.setState({
          cooldown: { ...c, seconds: c.seconds - 1 },
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleCancel = () => {
    if (confirmCancel) {
      requestCancel();
    } else {
      setConfirmCancel(true);
      setTimeout(() => setConfirmCancel(false), 3000);
    }
  };

  const currentPhase = progress?.phase ?? 1;
  const overallProgress = calculateOverallProgress(progress);

  return (
    <div className="brand-gradient min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="text-center">
          {/* Animated icon */}
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Analyzing your chat
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            This may take a few minutes depending on the chat length and
            provider rate limits.
          </p>

          {/* Phase list */}
          <div className="mb-8 space-y-2 text-left">
            {PHASES.map((phase) => {
              const isActive = phase.id === currentPhase;
              const isComplete = phase.id < currentPhase;
              return (
                <div
                  key={phase.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    isActive
                      ? "border-brand bg-brand/5"
                      : isComplete
                        ? "border-positive/40 bg-positive-soft"
                        : "border-border bg-card/40 opacity-60"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                      isActive
                        ? "bg-brand text-brand-foreground"
                        : isComplete
                          ? "bg-positive text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isActive ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      phase.id
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium">
                        Phase {phase.id}/3: {phase.name}
                      </p>
                      {isActive && progress && (
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {progress.current}/{progress.total}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {isActive && progress
                        ? progress.message
                        : isComplete
                          ? "Complete"
                          : phase.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall progress bar */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-baseline justify-between text-xs">
              <span className="font-medium">Overall progress</span>
              <span className="text-muted-foreground">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* ETA */}
          {etaSeconds !== undefined && etaSeconds > 0 && (
            <p className="mb-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Hourglass className="h-3 w-3" />
              {formatEta(etaSeconds)}
            </p>
          )}

          {/* Cooldown overlay */}
          {cooldown && (
            <div className="mb-4 rounded-lg border border-warning/40 bg-warning-soft p-3 text-xs">
              <p className="flex items-center justify-center gap-1.5 font-medium text-warning">
                <Hourglass className="h-3.5 w-3.5" />
                {cooldown.message}
              </p>
              <p className="mt-1 text-center text-muted-foreground">
                Resuming in {cooldown.seconds}s...
              </p>
            </div>
          )}

          {/* Cancel button */}
          <Button
            variant="outline"
            onClick={handleCancel}
            className="mt-4"
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            {confirmCancel ? "Click again to confirm cancel" : "Cancel analysis"}
          </Button>

          {confirmCancel && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Partial progress will be lost.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function calculateOverallProgress(
  progress: ReturnType<typeof useAnalyzerStore.getState>["progress"]
): number {
  if (!progress) return 0;
  // Phase 1: 0-70%, Phase 2: 70-85%, Phase 3: 85-100%
  if (progress.phase === 1) {
    const pct = progress.total > 0 ? progress.current / progress.total : 0;
    return pct * 70;
  }
  if (progress.phase === 2) {
    const pct = progress.total > 0 ? progress.current / progress.total : 0;
    return 70 + pct * 15;
  }
  // Phase 3
  return 85 + (progress.current / Math.max(progress.total, 1)) * 15;
}
