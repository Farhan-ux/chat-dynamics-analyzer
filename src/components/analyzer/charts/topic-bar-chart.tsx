"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

interface TopicBarChartProps {
  data: { topic: string; percentage: number }[];
}

const COLORS = [
  "var(--brand)",
  "var(--brand-accent)",
  "var(--brand-warm)",
  "var(--positive)",
  "var(--warning)",
  "var(--concern)",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#fb7185",
];

export function TopicBarChart({ data }: TopicBarChartProps) {
  // Sort descending
  const sorted = [...data].sort((a, b) => b.percentage - a.percentage);
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            unit="%"
          />
          <YAxis
            type="category"
            dataKey="topic"
            width={120}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            cursor={{ fill: "var(--muted)", fillOpacity: 0.3 }}
            formatter={(v: number) => [`${v}%`, "Share"]}
          />
          <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
            {sorted.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
