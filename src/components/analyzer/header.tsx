"use client";

import * as React from "react";
import { MessageCircle, Brain } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <MessageCircle className="h-4 w-4" />
            <Brain className="absolute -right-1 -top-1 h-3.5 w-3.5 text-brand-accent" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">
              Chat Dynamics Analyzer
            </span>
            <span className="hidden text-[10px] text-muted-foreground sm:block">
              WhatsApp Friendship Reports
            </span>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
