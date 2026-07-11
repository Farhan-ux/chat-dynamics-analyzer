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
  LabelList,
} from "recharts";

interface ScoreBarChartProps {
  data: { label: string; value: number; max?: number }[];
  /** Optional color override for each bar */
  colors?: string[];
  /** Show value labels at end of bars */
  showValues?: boolean;
}

export function ScoreBarChart({
  data,
  colors,
  showValues = false,
}: ScoreBarChartProps) {
  // Compute the max value safely (avoid the broken closure-in-domain-function bug)
  const maxVal = Math.max(
    10,
    ...data.map((x) => x.max ?? x.value ?? 0)
  );

  const palette =
    colors ??
    Array.from({ length: data.length }, (_, i) => {
      const list = [
        "var(--brand)",
        "var(--brand-accent)",
        "var(--brand-warm)",
        "var(--positive)",
        "var(--warning)",
      ];
      return list[i % list.length];
    });

  if (!data || data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 36, bottom: 4, left: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, maxVal]}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={140}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            interval={0}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            cursor={{ fill: "var(--muted)", fillOpacity: 0.3 }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={palette[idx % palette.length]} />
            ))}
            {showValues && (
              <LabelList
                dataKey="value"
                position="right"
                fill="var(--foreground)"
                fontSize={11}
                formatter={(v: number) => `${v}`}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
