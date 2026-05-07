from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.settings import settings
from app.db import init_db
from app.routers import health, auth, budget, audit, procurement, revenue, admin, ai, exports, kpi
# Premium routers
from app.routers import dcmp, alerts, simulation, collaboration, geo, license as license_router

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="BudgetNew API — Standard & Premium",
    version="2.0.0",
    description="Logiciel de suivi budgétaire intelligent — Sénégal & UEMOA. "
                "Deux plans : Standard (fonctions de base) et Premium (IA avancée, DCMP, géo, alertes).",
    openapi_url="/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    init_db()


app.include_router(health.router)
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(budget.router, prefix="/budget")
app.include_router(audit.router, prefix="/audit")
app.include_router(procurement.router, prefix="/procurement")
app.include_router(revenue.router, prefix="/revenue")
app.include_router(admin.router, prefix="/admin")
app.include_router(ai.router, prefix="/ai")
app.include_router(exports.router, prefix="/exports")
app.include_router(kpi.router, prefix="/kpi")

# ── Premium routers ──────────────────────────────────────────────────────────
app.include_router(dcmp.router, prefix="/premium", tags=["premium:dcmp"])
app.include_router(alerts.router, prefix="/premium", tags=["premium:alerts"])
app.include_router(simulation.router, prefix="/premium", tags=["premium:simulation"])
app.include_router(collaboration.router, prefix="/premium", tags=["premium:collaboration"])
app.include_router(geo.router, prefix="/premium", tags=["premium:geo"])
app.include_router(license_router.router, prefix="/premium", tags=["license"])

