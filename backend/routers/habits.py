from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from datetime import datetime, timezone
from db import get_db
from models.schemas import HabitCreate, HabitUpdate, HabitOut, UserOut
from auth_utils import get_current_user

router = APIRouter()


def habit_to_out(doc: dict) -> HabitOut:
    return HabitOut(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        name=doc["name"],
        description=doc.get("description"),
        color=doc.get("color", "#6366f1"),
        icon=doc.get("icon", "⚡"),
        frequency=doc.get("frequency", "daily"),
        created_at=doc["created_at"],
    )


@router.get("/", response_model=list[HabitOut])
async def get_habits(current_user: UserOut = Depends(get_current_user)):
    db = get_db()
    habits = await db.habits.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    return [habit_to_out(h) for h in habits]


@router.post("/", response_model=HabitOut, status_code=status.HTTP_201_CREATED)
async def create_habit(body: HabitCreate, current_user: UserOut = Depends(get_current_user)):
    db = get_db()
    doc = {
        **body.model_dump(),
        "user_id": current_user.id,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.habits.insert_one(doc)
    created = await db.habits.find_one({"_id": result.inserted_id})
    return habit_to_out(created)


@router.put("/{habit_id}", response_model=HabitOut)
async def update_habit(habit_id: str, body: HabitUpdate, current_user: UserOut = Depends(get_current_user)):
    db = get_db()
    if not ObjectId.is_valid(habit_id):
        raise HTTPException(status_code=400, detail="Invalid habit ID")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await db.habits.find_one_and_update(
        {"_id": ObjectId(habit_id), "user_id": current_user.id},
        {"$set": updates},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit_to_out(result)


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(habit_id: str, current_user: UserOut = Depends(get_current_user)):
    db = get_db()
    if not ObjectId.is_valid(habit_id):
        raise HTTPException(status_code=400, detail="Invalid habit ID")

    result = await db.habits.delete_one({"_id": ObjectId(habit_id), "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Habit not found")

    # cascade delete logs
    await db.logs.delete_many({"habit_id": habit_id, "user_id": current_user.id})
