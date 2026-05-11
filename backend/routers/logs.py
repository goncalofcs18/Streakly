from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from datetime import datetime, timezone
from db import get_db
from models.schemas import LogCreate, LogOut, UserOut
from auth_utils import get_current_user

router = APIRouter()


def log_to_out(doc: dict) -> LogOut:
    return LogOut(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        habit_id=doc["habit_id"],
        date=doc["date"],
        note=doc.get("note"),
        logged_at=doc["logged_at"],
    )


@router.get("/{habit_id}", response_model=list[LogOut])
async def get_logs_for_habit(habit_id: str, limit: int = 365, current_user: UserOut = Depends(get_current_user)):
    db = get_db()
    logs = (
        await db.logs.find({"habit_id": habit_id, "user_id": current_user.id})
        .sort("date", -1)
        .to_list(limit)
    )
    return [log_to_out(l) for l in logs]


@router.post("/", response_model=LogOut, status_code=status.HTTP_201_CREATED)
async def log_habit(body: LogCreate, current_user: UserOut = Depends(get_current_user)):
    db = get_db()

    # Verify habit exists and belongs to user
    if not ObjectId.is_valid(body.habit_id):
        raise HTTPException(status_code=400, detail="Invalid habit ID")
    habit = await db.habits.find_one({"_id": ObjectId(body.habit_id), "user_id": current_user.id})
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    # Prevent duplicate log for same day
    existing = await db.logs.find_one({"habit_id": body.habit_id, "date": body.date, "user_id": current_user.id})
    if existing:
        raise HTTPException(status_code=409, detail="Already logged for this date")

    doc = {
        "user_id": current_user.id,
        "habit_id": body.habit_id,
        "date": body.date,
        "note": body.note,
        "logged_at": datetime.now(timezone.utc),
    }
    result = await db.logs.insert_one(doc)
    created = await db.logs.find_one({"_id": result.inserted_id})
    return log_to_out(created)


@router.delete("/{habit_id}/{date}", status_code=status.HTTP_204_NO_CONTENT)
async def unlog_habit(habit_id: str, date: str, current_user: UserOut = Depends(get_current_user)):
    """Toggle off — remove a log entry for a specific date."""
    db = get_db()
    result = await db.logs.delete_one({"habit_id": habit_id, "date": date, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Log not found")
