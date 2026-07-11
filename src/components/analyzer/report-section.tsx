"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportSectionProps {
  id: string;
  title: string;
  /** Optional subtitle shown under title */
  subtitle?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Default expanded state */
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function ReportSection({
  id,
  title,
  subtitle,
  icon,
  defaultOpen = true,
  children,
}: ReportSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <section
      id={id}
      className="report-section scroll-mt-20"
      aria-labelledby={`${id}-title`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`${id}-content`}
        className="flex w-full items-center justify-between gap-3 rounded-t-lg border border-b-0 border-border/60 bg-card/40 px-4 py-3 text-left transition-colors hover:bg-card/60 sm:px-5"
      >
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
              {icon}
            </span>
          )}
          <div>
            <h2
              id={`${id}-title`}
              className="text-sm font-semibold sm:text-base"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div
          id={`${id}-content`}
          className="rounded-b-lg border border-border/60 bg-card/30 p-4 sm:p-5"
        >
          {children}
        </div>
      )}
      {!open && (
        <div className="rounded-b-lg border border-border/60 bg-card/30 px-4 py-2 text-xs text-muted-foreground sm:px-5">
          Click to expand
        </div>
      )}
    </section>
  );
}

/** A small sub-heading inside a section */
export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 mt-4 text-sm font-semibold text-foreground/90 first:mt-0">
      {children}
    </h3>
  );
}

/** A small label */
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

/** A pill/badge for status */
export function StatusPill({
  value,
  tone = "neutral",
}: {
  value: string;
  tone?: "positive" | "warning" | "concern" | "neutral" | "brand";
}) {
  const toneClass =
    tone === "positive"
      ? "bg-positive-soft text-positive border-positive/30"
      : tone === "warning"
        ? "bg-warning-soft text-warning border-warning/30"
        : tone === "concern"
          ? "bg-concern-soft text-concern border-concern/30"
          : tone === "brand"
            ? "bg-brand/10 text-brand border-brand/30"
            : "bg-neutral-soft text-foreground/80 border-border/50";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneClass}`}
    >
      {value}
    </span>
  );
}

/** A simple score meter (1-10) shown as a horizontal bar */
export function ScoreMeter({
  value,
  max = 10,
  label,
  tone,
}: {
  value: number;
  max?: number;
  label?: string;
  tone?: "positive" | "warning" | "concern" | "brand";
}) {
  const pct = Math.min(100, (value / max) * 100);
  const colorClass =
    tone === "positive"
      ? "bg-positive"
      : tone === "warning"
        ? "bg-warning"
        : tone === "concern"
          ? "bg-concern"
          : "bg-brand";
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-baseline justify-between text-[11px]">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{value}/{max}</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** A simple definition list */
export function DefList({
  items,
}: {
  items: { label: string; value: React.ReactNode }[];
}) {
  return (
    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-md border border-border/40 bg-background/40 p-2.5"
        >
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-0.5 text-sm">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
