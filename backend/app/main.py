"""FastAPI application factory and entry-point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.database import Base, engine, SessionLocal
from app.routers import (
    auth,
    novels,
    chapters,
    ratings,
    subscriptions,
    ads,
    reminders,
    tts,
    security as security_router,
    admin,
)
from app.services.seed import run_seed
# Ensure all models are imported and registered before create_all
from app.models import (  # noqa: F401
    User,
    Novel,
    Chapter,
    Rating,
    Subscription,
    AdUnlock,
    Reminder,
    OTP,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Create tables if not present (Alembic would handle migrations in prod)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Sinhala Novel Reading App API",
    description="Backend for the Expo Sinhala Novel Reading App + Admin Dashboard",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
allow_origins = ["*"] if settings.CORS_ORIGINS == "*" else [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# All routes live under /api (Kubernetes ingress rule)
api = APIRouter(prefix="/api")
api.include_router(auth.router)
api.include_router(novels.router)
api.include_router(chapters.router)
api.include_router(ratings.router)
api.include_router(subscriptions.router)
api.include_router(ads.router)
api.include_router(reminders.router)
api.include_router(tts.router)
api.include_router(security_router.router)
api.include_router(admin.router)


@api.get("/health")
def health():
    return {"ok": True, "service": "sinhala-novels-api"}


app.include_router(api)
