# 🔥 Streakly

> Track habits. Build streaks. Stay on fire.

A full-stack habit tracker with a GitHub-style heatmap, streak analytics, and a slick dark UI.

**Stack**: Next.js 14 + TypeScript · FastAPI · MongoDB Atlas · Recharts

---

## Project structure

```
streakly/
├── backend/          FastAPI + Motor (async MongoDB)
│   ├── main.py
│   ├── db.py
│   ├── routers/
│   │   ├── habits.py
│   │   ├── logs.py
│   │   └── analytics.py
│   ├── models/
│   │   └── schemas.py
│   └── requirements.txt
│
└── frontend/         Next.js 14 App Router + TypeScript
    ├── app/
    │   ├── page.tsx          Dashboard
    │   ├── log/page.tsx      Daily check-in
    │   ├── habits/page.tsx   Manage habits
    │   └── analytics/page.tsx  Charts + heatmaps
    ├── components/
    │   ├── Heatmap.tsx
    │   └── StatCard.tsx
    └── lib/api.ts            Typed API client
```

---

## Setup

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user and whitelist your IP
3. Copy the connection string

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and paste your MongoDB connection string

# Run the server
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000/api (already set)

# Run the dev server
npm run dev
```

App available at: http://localhost:3000

---

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
