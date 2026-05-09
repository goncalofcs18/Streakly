"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { api, Habit, Log } from "@/lib/api";
import clsx from "clsx";

export default function LogPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const today = format(new Date(), "yyyy-MM-dd");
  const todayLabel = format(new Date(), "EEEE, MMMM d");

  useEffect(() => {
    async function load() {
      const data = await api.habits.list();
      setHabits(data);

      const logSets = await Promise.all(data.map((h) => api.logs.forHabit(h.id)));
      const logged = new Set<string>();
      logSets.forEach((logs, i) => {
        if (logs.some((l: Log) => l.date === today)) logged.add(data[i].id);
      });
      setTodayLogs(logged);
      setLoading(false);
    }
    load();
  }, [today]);

  async function toggle(habit: Habit) {
    setToggling((prev) => new Set(prev).add(habit.id));
    try {
      if (todayLogs.has(habit.id)) {
        await api.logs.delete(habit.id, today);
        setTodayLogs((prev) => { const s = new Set(prev); s.delete(habit.id); return s; });
      } else {
        await api.logs.create(habit.id, today);
        setTodayLogs((prev) => new Set(prev).add(habit.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setToggling((prev) => { const s = new Set(prev); s.delete(habit.id); return s; });
    }
  }

  const done = habits.filter((h) => todayLogs.has(h.id)).length;
  const progress = habits.length ? Math.round((done / habits.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-coal-300 font-mono text-sm animate-pulse">
        Loading habits...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-xl mx-auto">
      <div>
        <p className="text-flame-400 font-mono text-sm mb-1">{todayLabel}</p>
        <h1 className="font-display font-bold text-3xl text-white">Daily check-in</h1>
      </div>

      {/* Progress */}
      <div className="card space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="font-mono text-sm text-coal-300">
            {done} / {habits.length} done
          </span>
          <span className="font-display font-bold text-2xl text-flame-400">{progress}%</span>
        </div>
        <div className="h-2 bg-coal-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-flame-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {done === habits.length && habits.length > 0 && (
          <p className="text-sm text-flame-300 font-medium animate-fade-in">
            🎉 All done for today! You're on fire.
          </p>
        )}
      </div>

      {/* Habit list */}
      {habits.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-coal-300 mb-4">No habits to log yet.</p>
          <a href="/habits" className="btn-primary inline-block">Add your first habit</a>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((h, i) => {
            const checked = todayLogs.has(h.id);
            const busy = toggling.has(h.id);
            return (
              <button
                key={h.id}
                onClick={() => toggle(h)}
                disabled={busy}
                className={clsx(
                  "w-full text-left card flex items-center gap-4 cursor-pointer transition-all duration-200 animate-slide-up",
                  checked
                    ? "border-opacity-60 bg-opacity-10"
                    : "hover:border-coal-500"
                )}
                style={{
                  animationDelay: `${i * 50}ms`,
                  borderColor: checked ? h.color + "66" : undefined,
                  backgroundColor: checked ? h.color + "11" : undefined,
                }}
              >
                {/* Checkbox */}
                <div
                  className={clsx(
                    "w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                    busy && "opacity-50"
                  )}
                  style={{
                    borderColor: h.color,
                    backgroundColor: checked ? h.color : "transparent",
                  }}
                >
                  {checked && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Icon + name */}
                <span className="text-xl">{h.icon}</span>
                <span className={clsx("font-medium text-base flex-1", checked ? "text-white line-through decoration-coal-500" : "text-coal-100")}>
                  {h.name}
                </span>

                {checked && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ color: h.color, backgroundColor: h.color + "22" }}>
                    Done
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
