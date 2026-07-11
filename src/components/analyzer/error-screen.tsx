"use client";

import * as React from "react";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalyzerStore } from "@/lib/store";

export function ErrorScreen() {
  const { errorMessage, resetToLanding, reset } = useAnalyzerStore();

  return (
    <div className="brand-gradient min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-concern/20 text-concern">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Analysis failed
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            We hit a snag while analyzing your chat. Here&apos;s what happened:
          </p>

          <div className="mb-6 rounded-lg border border-concern/30 bg-concern-soft p-4 text-left">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm font-medium text-foreground/90">
              {errorMessage ?? "An unknown error occurred."}
            </pre>
          </div>

          <div className="mb-6 rounded-lg border border-border/40 bg-muted/30 p-4 text-left text-xs text-muted-foreground">
            <p className="mb-2 font-medium text-foreground/80">
              Common fixes:
            </p>
            <ul className="space-y-1">
              <li>
                • <strong>API key invalid?</strong> Double-check the key is
                copied correctly with no trailing spaces.
              </li>
              <li>
                • <strong>Rate limited?</strong> Wait a few minutes for the
                cooldown, or switch to a different provider.
              </li>
              <li>
                • <strong>Context too long?</strong> Try a smaller chat export
                or a provider with a larger context window.
              </li>
              <li>
                • <strong>Network issue?</strong> Check your internet
                connection and try again.
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="outline" onClick={resetToLanding}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to landing
            </Button>
            <Button onClick={reset} className="bg-brand text-brand-foreground hover:bg-brand/90">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Start over
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
