"use client";

import { useEffect, useState } from "react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { api, Habit, HeatmapData } from "@/lib/api";
import Heatmap from "@/components/Heatmap";
import StatCard from "@/components/StatCard";

export default function AnalyticsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [streaks, setStreaks] = useState({ current: 0, longest: 0, total: 0 });
  const [trend, setTrend] = useState<{ date: string; completed: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.habits.list().then((data) => {
      setHabits(data);
      if (data.length) setSelected(data[0].id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    async function load() {
      const [hm, sk] = await Promise.all([
        api.analytics.heatmap(selected),
        api.analytics.streaks(selected),
      ]);
      setHeatmapData(hm.heatmap);
      setStreaks({ current: sk.current, longest: sk.longest, total: sk.total });

      // Build 30-day trend
      const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
      const t = days.map((d) => {
        const key = format(d, "yyyy-MM-dd");
        return { date: format(d, "MMM d"), completed: hm.heatmap[key] ?? 0 };
      });
      setTrend(t);
    }
    load();
  }, [selected]);

  const habit = habits.find((h) => h.id === selected);

  const tooltipStyle = {
    backgroundColor: "#141416",
    border: "1px solid #242428",
    borderRadius: 10,
    color: "#d4d4d8",
    fontSize: 12,
    fontFamily: "DM Mono, monospace",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-coal-300 font-mono text-sm animate-pulse">
        Loading analytics...
      </div>
    );
  }

  if (!habits.length) {
    return (
      <div className="card text-center py-16">
        <p className="text-coal-300 mb-4">No habits to analyze yet.</p>
        <a href="/habits" className="btn-primary inline-block">Create a habit</a>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Analytics</h1>
          <p className="text-coal-300 mt-1 text-sm">Dive deep into a single habit.</p>
        </div>

        {/* Habit selector */}
        <div className="flex gap-2 flex-wrap">
          {habits.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelected(h.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: selected === h.id ? h.color + "22" : "#1c1c1f",
                border: `1px solid ${selected === h.id ? h.color + "66" : "#2e2e33"}`,
                color: selected === h.id ? h.color : "#a1a1aa",
              }}
            >
              {h.icon} {h.name}
            </button>
          ))}
        </div>
      </div>

      {habit && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Current streak" value={streaks.current} sub="days in a row" accent />
            <StatCard label="Longest streak" value={streaks.longest} sub="personal best" />
            <StatCard label="Total completions" value={streaks.total} sub="all time" />
          </div>

          {/* 30-day bar chart */}
          <div className="card space-y-4">
            <h2 className="font-display font-semibold text-white">Last 30 days</h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={trend} barSize={10} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#71717a", fontSize: 10, fontFamily: "DM Mono" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis hide domain={[0, 1]} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar
                  dataKey="completed"
                  fill={habit.color}
                  opacity={0.85}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Heatmap */}
          <div className="card space-y-4">
            <h2 className="font-display font-semibold text-white">Year heatmap</h2>
            <Heatmap data={heatmapData} color={habit.color} weeks={26} />
          </div>
        </>
      )}
    </div>
  );
}
