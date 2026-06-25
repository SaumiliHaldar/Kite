from contextlib import asynccontextmanager
import os
from beanie import init_beanie
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from models import Community, Conversation, Message, Notification, Room, User
from routes import limiter, router as rest_router
from ws import router as ws_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/kite")
    client = AsyncIOMotorClient(mongo_uri)
    db_name = mongo_uri.split("/")[-1].split("?")[0]
    if not db_name:
        db_name = "kite"

    if not hasattr(AsyncIOMotorClient, "append_metadata"):
        AsyncIOMotorClient.append_metadata = lambda self, *args, **kwargs: None

    await init_beanie(
        database=client[db_name],
        document_models=[User, Room, Conversation, Message, Community, Notification],
    )
    print("Connected to MongoDB & Beanie ODM initialized successfully.")
    yield
    # Shutdown
    client.close()


app = FastAPI(
    title="Kite API",
    lifespan=lifespan,
)

# SlowAPI Rate Limiter State Binding
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(rest_router)
app.include_router(ws_router)


@app.get("/", tags=["Health"])
async def health_check():
    return {
        "status": "online",
        "app": "Kite is Live!",
    }
