"use client";

import { useEffect, useState } from "react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import { api, Habit, HabitSummary } from "@/lib/api";
import Heatmap from "@/components/Heatmap";
import StatCard from "@/components/StatCard";

type View = "overview" | string;

export default function AnalyticsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [summary, setSummary] = useState<HabitSummary[]>([]);
  const [view, setView] = useState<View>("overview");
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [streaks, setStreaks] = useState({ current: 0, longest: 0, total: 0 });
  const [perHabitTrend, setPerHabitTrend] = useState<{ date: string; completed: number }[]>([]);
  const [overviewTrend, setOverviewTrend] = useState<{ date: string; [key: string]: number | string }[]>([]);
  const [allHeatmaps, setAllHeatmaps] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);

  const tooltipStyle = {
    backgroundColor: "#141416",
    border: "1px solid #242428",
    borderRadius: 10,
    color: "#d4d4d8",
    fontSize: 12,
    fontFamily: "DM Mono, monospace",
  };

  useEffect(() => {
    async function load() {
      const [habitList, { habits: sum }] = await Promise.all([
        api.habits.list(),
        api.analytics.summary(),
      ]);
      setHabits(habitList);
      setSummary(sum);

      const maps: Record<string, Record<string, number>> = {};
      await Promise.all(
        habitList.map(async (h) => {
          const hm = await api.analytics.heatmap(h.id);
          maps[h.id] = hm.heatmap;
        })
      );
      setAllHeatmaps(maps);

      const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
      const trend = days.map((d) => {
        const key = format(d, "yyyy-MM-dd");
        const row: { date: string; [k: string]: number | string } = { date: format(d, "MMM d") };
        let total = 0;
        habitList.forEach((h) => {
          const val = maps[h.id]?.[key] ?? 0;
          row[h.name] = val;
          total += val;
        });
        row["total"] = total;
        return row;
      });
      setOverviewTrend(trend);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (view === "overview" || !view) return;
    async function load() {
      const [hm, sk] = await Promise.all([
        api.analytics.heatmap(view),
        api.analytics.streaks(view),
      ]);
      setHeatmapData(hm.heatmap);
      setStreaks({ current: sk.current, longest: sk.longest, total: sk.total });
      const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
      setPerHabitTrend(days.map((d) => {
        const key = format(d, "yyyy-MM-dd");
        return { date: format(d, "MMM d"), completed: hm.heatmap[key] ?? 0 };
      }));
    }
    load();
  }, [view]);

  const habit = habits.find((h) => h.id === view);

  const combinedHeatmap = (() => {
    const out: Record<string, number> = {};
    Object.values(allHeatmaps).forEach((hm) => {
      Object.keys(hm).forEach((date) => { out[date] = (out[date] ?? 0) + 1; });
    });
    return out;
  })();

  const totalDone30d = overviewTrend.reduce((s, d) => s + (d["total"] as number), 0);
  const perfectDays = overviewTrend.filter((d) => (d["total"] as number) === habits.length && habits.length > 0).length;
  const bestStreak = Math.max(0, ...summary.map((h) => h.longest_streak));

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
          <p className="text-coal-300 mt-1 text-sm">
            {view === "overview" ? "All habits combined." : `Drilling into: ${habit?.name}`}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setView("overview")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: view === "overview" ? "#f9451622" : "#1c1c1f",
              border: `1px solid ${view === "overview" ? "#f9451666" : "#2e2e33"}`,
              color: view === "overview" ? "#f94516" : "#a1a1aa",
            }}
          >
            📊 Overview
          </button>
          {habits.map((h) => (
            <button
              key={h.id}
              onClick={() => setView(h.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: view === h.id ? h.color + "22" : "#1c1c1f",
                border: `1px solid ${view === h.id ? h.color + "66" : "#2e2e33"}`,
                color: view === h.id ? h.color : "#a1a1aa",
              }}
            >
              {h.icon} {h.name}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW */}
      {view === "overview" && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Completions (30d)" value={totalDone30d} sub="across all habits" accent />
            <StatCard label="Perfect days" value={perfectDays} sub="all habits done" />
            <StatCard label="Best streak ever" value={bestStreak} sub="any single habit" />
          </div>

          <div className="card space-y-4">
            <div>
              <h2 className="font-display font-semibold text-white">Habits completed per day</h2>
              <p className="text-xs text-coal-300 mt-0.5">Last 30 days — each colour is one habit</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={overviewTrend} barSize={10} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#71717a", fontSize: 10, fontFamily: "DM Mono" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#71717a", fontSize: 10, fontFamily: "DM Mono" }}
                  tickLine={false}
                  axisLine={false}
                  width={20}
                  domain={[0, habits.length]}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                {habits.map((h) => (
                  <Bar key={h.id} dataKey={h.name} stackId="a" fill={h.color} opacity={0.85} />
                ))}
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3">
              {habits.map((h) => (
                <div key={h.id} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: h.color }} />
                  <span className="text-xs text-coal-300 font-mono">{h.icon} {h.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-display font-semibold text-white">30-day completion rates</h2>
            <div className="space-y-3">
              {summary.map((h) => (
                <div key={h.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm text-coal-100">{h.icon} {h.name}</span>
                    <span className="text-xs font-mono" style={{ color: h.color }}>{h.completion_rate_30d}%</span>
                  </div>
                  <div className="h-1.5 bg-coal-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${h.completion_rate_30d}%`, backgroundColor: h.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card space-y-4">
            <div>
              <h2 className="font-display font-semibold text-white">Activity heatmap</h2>
              <p className="text-xs text-coal-300 mt-0.5">Darker = more habits completed that day</p>
            </div>
            <Heatmap data={combinedHeatmap} color="#f94516" weeks={26} />
          </div>
        </>
      )}

      {/* PER HABIT */}
      {view !== "overview" && habit && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Current streak" value={streaks.current} sub="days in a row" accent />
            <StatCard label="Longest streak" value={streaks.longest} sub="personal best" />
            <StatCard label="Total completions" value={streaks.total} sub="all time" />
          </div>

          <div className="card space-y-4">
            <h2 className="font-display font-semibold text-white">Last 30 days</h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={perHabitTrend} barSize={10} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#71717a", fontSize: 10, fontFamily: "DM Mono" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis hide domain={[0, 1]} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="completed" fill={habit.color} opacity={0.85} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card space-y-4">
            <h2 className="font-display font-semibold text-white">Year heatmap</h2>
            <Heatmap data={heatmapData} color={habit.color} weeks={26} />
          </div>
        </>
      )}
    </div>
  );
}
