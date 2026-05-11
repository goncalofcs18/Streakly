const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ── Types ─────────────────────────────────────────────────────
export interface Habit {
  id: string;
  user_id: string;
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
  user_id: string;
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

export interface User {
  id: string;
  username: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// ── Helpers ───────────────────────────────────────────────────
async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("streakly_token") : null;
  
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
  });

  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("streakly_token");
    // Only redirect if we're not already on the login page
    if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login";
    }
  }

  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = `API error ${res.status}`;
    try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorMessage;
    } catch (e) {
        errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── API ───────────────────────────────────────────────────────
export const api = {
  auth: {
    login: async (username: string, password: string) => {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      
      const data = await req<TokenResponse>("/auth/login", {
        method: "POST",
        body: formData,
      });
      localStorage.setItem("streakly_token", data.access_token);
      return data;
    },
    register: (username: string, password: string) =>
      req<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    logout: () => {
      localStorage.removeItem("streakly_token");
      window.location.href = "/login";
    },
    getToken: () => typeof window !== "undefined" ? localStorage.getItem("streakly_token") : null,
  },

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
