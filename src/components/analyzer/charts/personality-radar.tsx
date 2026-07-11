"use client";

import * as React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface RadarDatum {
  trait: string;
  A: number;
  B: number;
  fullMark: number;
}

interface PersonalityRadarProps {
  personAName: string;
  personBName: string;
  data: RadarDatum[];
}

export function PersonalityRadar({
  personAName,
  personBName,
  data,
}: PersonalityRadarProps) {
  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="trait"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
            tickCount={6}
          />
          <Radar
            name={personAName}
            dataKey="A"
            stroke="var(--brand)"
            fill="var(--brand)"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name={personBName}
            dataKey="B"
            stroke="var(--brand-accent)"
            fill="var(--brand-accent)"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => (
              <span style={{ color: "var(--foreground)" }}>{value}</span>
            )}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
