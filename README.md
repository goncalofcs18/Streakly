# Streakly 🔥

> Track habits. Build streaks. Stay on fire.

A full-stack habit tracker with a GitHub-style heatmap, streak analytics.

**Stack**: Next.js 14 + TypeScript · FastAPI · MongoDB Atlas · Recharts

## Features

| Feature | Description |
|---|---|
| **Dashboard** | All habits at a glance with heatmaps, streak counts, and completion rates |
| **Daily log** | One-tap check-in for each habit with progress bar |
| **Manage habits** | Create/edit/delete habits with color and icon picker |
| **Analytics** | Per-habit streak history, 30-day bar chart, and full year heatmap |

---

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/habits/` | List all habits |
| POST | `/api/habits/` | Create a habit |
| PUT | `/api/habits/{id}` | Update a habit |
| DELETE | `/api/habits/{id}` | Delete habit + all logs |
| GET | `/api/logs/{habit_id}` | Get logs for a habit |
| POST | `/api/logs/` | Log a habit completion |
| DELETE | `/api/logs/{habit_id}/{date}` | Remove a log (toggle off) |
| GET | `/api/analytics/summary` | Dashboard summary (all habits) |
| GET | `/api/analytics/heatmap/{habit_id}` | Heatmap data for past N days |
| GET | `/api/analytics/streaks/{habit_id}` | Current + longest streak |
