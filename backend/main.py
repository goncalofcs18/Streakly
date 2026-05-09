from dotenv import load_dotenv
load_dotenv(override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import habits, logs, analytics
from db import connect_db, close_db

app = FastAPI(title="Streakly API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_event_handler("startup", connect_db)
app.add_event_handler("shutdown", close_db)

app.include_router(habits.router, prefix="/api/habits", tags=["habits"])
app.include_router(logs.router, prefix="/api/logs", tags=["logs"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])


@app.get("/")
async def root():
    return {"message": "Streakly API is running 🔥"}
