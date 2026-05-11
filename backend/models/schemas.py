from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── User models ───────────────────────────────────────────────
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserOut(UserBase):
    id: str


class Token(BaseModel):
    access_token: str
    token_type: str


# ── Habit models ──────────────────────────────────────────────
class HabitCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=300)
    color: str = Field(default="#6366f1")   # tailwind indigo-500 as default
    icon: str = Field(default="⚡")
    frequency: str = Field(default="daily") # daily | weekly


class HabitUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    frequency: Optional[str] = None


class HabitOut(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str]
    color: str
    icon: str
    frequency: str
    created_at: datetime


# ── Log models ────────────────────────────────────────────────
class LogCreate(BaseModel):
    habit_id: str
    date: str = Field(..., description="ISO date string YYYY-MM-DD")
    note: Optional[str] = Field(None, max_length=500)


class LogOut(BaseModel):
    id: str
    user_id: str
    habit_id: str
    date: str
    note: Optional[str]
    logged_at: datetime
