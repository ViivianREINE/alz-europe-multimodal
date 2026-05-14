"""
RIMN FastAPI Application — Main Entry Point
"""
import logging
import os
import re
from contextlib import asynccontextmanager
from pathlib import Path

import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.db.database import init_db
from backend.auth.router import router as auth_router
try:
    from backend.inference.router import router as inference_router
except ImportError:
    inference_router = None
    print("WARNING: Inference router could not be loaded due to missing dependencies.")

from backend.api.routes import submissions_router, analytics_router
from backend.api.assignments import assignments_router
from backend.api.notifications import notifications_router
from backend.api.chat import router as chat_router

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("RIMN Backend starting up...")
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    Path(settings.CHECKPOINT_DIR).mkdir(parents=True, exist_ok=True)
    Path(settings.RESULTS_DIR).mkdir(parents=True, exist_ok=True)
    await init_db()
    logger.info("Database initialized.")

    # Pre-load model in background task so it doesn't block server startup
    async def load_bg():
        try:
            from backend.inference.pipeline import load_model
            load_model()
            logger.info("Model pre-loading completed.")
        except Exception as e:
            logger.error(f"Error loading model: {e}")

    asyncio.create_task(load_bg())
    logger.info("Model pre-loading started in background task.")

    yield

    # Shutdown
    logger.info("RIMN Backend shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="RIMN — Recursive Iterative Modality Negotiation Network. Multimodal Educational AI.",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Build origins list, expanding wildcards for Render/Vercel
cors_origins = []
for origin in settings.ALLOWED_ORIGINS:
    if "*" not in origin:
        cors_origins.append(origin)

# Add the FRONTEND_URL if set
if settings.FRONTEND_URL and settings.FRONTEND_URL not in cors_origins:
    cors_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
if inference_router:
    app.include_router(inference_router)
app.include_router(submissions_router)
app.include_router(analytics_router)
app.include_router(assignments_router)
app.include_router(notifications_router)
app.include_router(chat_router)


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", tags=["system"])
async def root():
    return {
        "message": "RIMN Multimodal Educational AI — Backend API",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=settings.WORKERS,
    )
