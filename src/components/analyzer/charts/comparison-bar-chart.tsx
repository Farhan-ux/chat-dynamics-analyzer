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
  Legend,
} from "recharts";

interface ComparisonBarChartProps {
  personAName: string;
  personBName: string;
  data: { label: string; A: number; B: number }[];
  unit?: string;
}

export function ComparisonBarChart({
  personAName,
  personBName,
  data,
  unit = "",
}: ComparisonBarChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            interval={0}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            unit={unit}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            cursor={{ fill: "var(--muted)", fillOpacity: 0.3 }}
            formatter={(v: number, name: string) => [
              `${v}${unit}`,
              name === "A" ? personAName : personBName,
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) =>
              value === "A" ? personAName : personBName
            }
          />
          <Bar
            dataKey="A"
            fill="var(--brand)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="B"
            fill="var(--brand-accent)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
