"use client";

import * as React from "react";

const SECTIONS = [
  { id: "executive-summary", label: "1. Executive Summary" },
  { id: "personality-profiles", label: "2. Personality Profiles" },
  { id: "relationship-dynamics", label: "3. Relationship Dynamics" },
  { id: "communication-patterns", label: "4. Communication Patterns" },
  { id: "topic-ecosystem", label: "5. Topic Ecosystem" },
  { id: "emotional-landscape", label: "6. Emotional Landscape" },
  { id: "humor-analysis", label: "7. Humor Analysis" },
  { id: "health-assessment", label: "8. Health Assessment" },
  { id: "temporal-patterns", label: "9. Temporal Patterns" },
  { id: "comparative-analysis", label: "10. Comparative Analysis" },
  { id: "predictive-insights", label: "11. Predictive Insights" },
  { id: "recommendations", label: "12. Recommendations" },
  { id: "love-romance", label: "13. Love & Romance" },
  { id: "closing-thought", label: "Closing" },
];

export function ReportSidebar() {
  const [activeId, setActiveId] = React.useState<string>("executive-summary");

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="space-y-0.5" aria-label="Report sections">
      {SECTIONS.map((s) => {
        const isActive = activeId === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`block rounded-md px-3 py-1.5 text-xs transition-colors ${
              isActive
                ? "bg-brand/10 font-medium text-brand"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
            aria-current={isActive ? "location" : undefined}
          >
            {s.label}
          </a>
        );
      })}
    </nav>
  );
}
