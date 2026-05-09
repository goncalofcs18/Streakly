const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ── Types ─────────────────────────────────────────────────────
export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  frequency: string;
  created_at: string;
}

export interface HabitCreate {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  frequency?: string;
}

export interface Log {
  id: string;
  habit_id: string;
  date: string;
  note?: string;
  logged_at: string;
}

export interface HabitSummary {
  id: string;
  name: string;
  icon: string;
  color: string;
  current_streak: number;
  longest_streak: number;
  total_logs: number;
  completion_rate_30d: number;
}

export interface StreakData {
  habit_id: string;
  current: number;
  longest: number;
  total: number;
}

export interface HeatmapData {
  habit_id: string;
  heatmap: Record<string, number>;
}

// ── Helpers ───────────────────────────────────────────────────
async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Habits ────────────────────────────────────────────────────
export const api = {
  habits: {
    list: () => req<Habit[]>("/habits/"),
    create: (body: HabitCreate) =>
      req<Habit>("/habits/", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<HabitCreate>) =>
      req<Habit>(`/habits/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) =>
      req<void>(`/habits/${id}`, { method: "DELETE" }),
  },

  logs: {
    forHabit: (habitId: string) => req<Log[]>(`/logs/${habitId}`),
    create: (habitId: string, date: string, note?: string) =>
      req<Log>("/logs/", {
        method: "POST",
        body: JSON.stringify({ habit_id: habitId, date, note }),
      }),
    delete: (habitId: string, date: string) =>
      req<void>(`/logs/${habitId}/${date}`, { method: "DELETE" }),
  },

  analytics: {
    summary: () => req<{ habits: HabitSummary[] }>("/analytics/summary"),
    heatmap: (habitId: string, days = 365) =>
      req<HeatmapData>(`/analytics/heatmap/${habitId}?days=${days}`),
    streaks: (habitId: string) =>
      req<StreakData>(`/analytics/streaks/${habitId}`),
  },
};
