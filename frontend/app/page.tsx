"use client";

import { useEffect, useState } from "react";
import { api, HabitSummary } from "@/lib/api";
import StatCard from "@/components/StatCard";
import Heatmap from "@/components/Heatmap";

export default function DashboardPage() {
  const [habits, setHabits] = useState<HabitSummary[]>([]);
  const [heatmaps, setHeatmaps] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { habits: data } = await api.analytics.summary();
        setHabits(data);

        const maps: Record<string, Record<string, number>> = {};
        await Promise.all(
          data.map(async (h) => {
            const hm = await api.analytics.heatmap(h.id);
            maps[h.id] = hm.heatmap;
          })
        );
        setHeatmaps(maps);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalStreak = habits.reduce((sum, h) => sum + h.current_streak, 0);
  const avgCompletion = habits.length
    ? Math.round(habits.reduce((s, h) => s + h.completion_rate_30d, 0) / habits.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-coal-300 font-mono text-sm animate-pulse">
        Loading your streaks...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">
          Dashboard <span className="text-flame-400">🔥</span>
        </h1>
        <p className="text-coal-300 mt-1 text-sm">Your habit overview at a glance.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Active habits" value={habits.length} />
        <StatCard label="Combined streak" value={totalStreak} sub="days total" accent />
        <StatCard label="30-day avg" value={`${avgCompletion}%`} sub="completion rate" />
      </div>

      {/* Habit cards */}
      {habits.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-coal-300 mb-4">No habits yet. Time to start one.</p>
          <a href="/habits" className="btn-primary inline-block">Create a habit</a>
        </div>
      ) : (
        <div className="space-y-6">
          {habits.map((h, i) => (
            <div
              key={h.id}
              className="card space-y-4 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: h.color + "22", border: `1px solid ${h.color}44` }}
                  >
                    {h.icon}
                  </span>
                  <div>
                    <h2 className="font-display font-semibold text-lg text-white">{h.name}</h2>
                    <p className="text-xs text-coal-300 font-mono">
                      {h.total_logs} total completions
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <p className="text-2xl font-display font-bold" style={{ color: h.color }}>
                      {h.current_streak}
                    </p>
                    <p className="text-[10px] text-coal-300 font-mono uppercase tracking-widest">Current</p>
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-white">{h.longest_streak}</p>
                    <p className="text-[10px] text-coal-300 font-mono uppercase tracking-widest">Longest</p>
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-white">{h.completion_rate_30d}%</p>
                    <p className="text-[10px] text-coal-300 font-mono uppercase tracking-widest">30 Days</p>
                  </div>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="h-1 bg-coal-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${h.completion_rate_30d}%`, backgroundColor: h.color }}
                />
              </div>

              {/* Heatmap */}
              <Heatmap data={heatmaps[h.id] ?? {}} color={h.color} weeks={20} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
