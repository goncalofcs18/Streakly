from fastapi import APIRouter, HTTPException
from datetime import date, timedelta
from db import get_db

router = APIRouter()


def compute_streak(sorted_dates: list[str]) -> dict:
    """Given a sorted (desc) list of ISO date strings, compute current and longest streak."""
    if not sorted_dates:
        return {"current": 0, "longest": 0}

    dates = sorted(set(sorted_dates))  # asc, unique
    today = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    # Current streak: must include today or yesterday
    current = 0
    if dates[-1] in (today, yesterday):
        current = 1
        for i in range(len(dates) - 2, -1, -1):
            expected = (
                date.fromisoformat(dates[i + 1]) - timedelta(days=1)
            ).isoformat()
            if dates[i] == expected:
                current += 1
            else:
                break

    # Longest streak
    longest = 1
    run = 1
    for i in range(1, len(dates)):
        expected = (date.fromisoformat(dates[i - 1]) + timedelta(days=1)).isoformat()
        if dates[i] == expected:
            run += 1
            longest = max(longest, run)
        else:
            run = 1

    return {"current": current, "longest": longest}


@router.get("/heatmap/{habit_id}")
async def get_heatmap(habit_id: str, days: int = 365):
    """Return a dict of {date: count} for the last N days."""
    db = get_db()
    cutoff = (date.today() - timedelta(days=days)).isoformat()
    logs = await db.logs.find(
        {"habit_id": habit_id, "date": {"$gte": cutoff}}
    ).to_list(None)

    heatmap = {log["date"]: 1 for log in logs}
    return {"habit_id": habit_id, "heatmap": heatmap}


@router.get("/streaks/{habit_id}")
async def get_streaks(habit_id: str):
    db = get_db()
    logs = await db.logs.find({"habit_id": habit_id}).to_list(None)
    dates = [l["date"] for l in logs]
    streaks = compute_streak(dates)
    return {"habit_id": habit_id, **streaks, "total": len(dates)}


@router.get("/summary")
async def get_summary():
    """Dashboard summary: all habits with their streaks and completion rate for last 30 days."""
    db = get_db()
    habits = await db.habits.find().to_list(100)

    thirty_days_ago = (date.today() - timedelta(days=30)).isoformat()
    results = []

    for habit in habits:
        habit_id = str(habit["_id"])
        logs = await db.logs.find({"habit_id": habit_id}).to_list(None)
        dates = [l["date"] for l in logs]
        streaks = compute_streak(dates)

        recent_logs = [d for d in dates if d >= thirty_days_ago]
        completion_rate = round(len(recent_logs) / 30 * 100)

        results.append({
            "id": habit_id,
            "name": habit["name"],
            "icon": habit.get("icon", "⚡"),
            "color": habit.get("color", "#6366f1"),
            "current_streak": streaks["current"],
            "longest_streak": streaks["longest"],
            "total_logs": len(dates),
            "completion_rate_30d": min(completion_rate, 100),
        })

    return {"habits": results}
