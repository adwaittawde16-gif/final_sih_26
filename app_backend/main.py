"""
app_backend/main.py
-------------------
FastAPI Application Entrypoint & Server Config.
Exposes modular REST API routers for all 8 Police Intelligence modules.
For: Brihanmumbai Police Department — SIH 26
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app_backend.dependencies import get_engine
from app_backend.schemas.common import HealthResponse, ErrorResponse

# Import 8 Modular Routers
from app_backend.routers import (
    threat,
    cdr,
    cctv,
    crime_rings,
    financial,
    nocturnal,
    surveillance,
    dossiers,
    gangs,
    social_media,
    nlp,
    geo,
    graph_analytics,
    core_ai,
    stream,
    audit
)
from app_backend.middleware.audit_middleware import AuditLogMiddleware

app = FastAPI(
    title="Brihanmumbai Police Tactical Intelligence REST API",
    description="Unified API server for CDR, CCTV, Crime Rings, Financial Money Trails & Suspect Risk Analytics.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware for Local Dev & Vercel Production Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event — Pre-warm Engine Memory & Compute Caches
@app.on_event("startup")
def startup_event():
    print("[*] Pre-warming Intelligence Engine in RAM...")
    from threat_classifier import ThreatClassifier
    engine = get_engine()
    engine.get_cdr_summary()
    engine.get_cctv_meetings()
    engine.calculate_threat_scores()
    ThreatClassifier(engine).classify_suspect_risks()
    print("[OK] Intelligence Engine warm-up complete! Responses will be served instantly.")

# Custom Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "status": 500}
    )

# Health Check Route
@app.get("/api/health", response_model=HealthResponse, tags=["System Health"])
def health_check():
    engine = get_engine()
    scores = engine.calculate_threat_scores()
    return HealthResponse(
        status="HEALTHY",
        system="Brihanmumbai Police Tactical Intelligence REST API",
        version="2.0.0",
        total_suspects=len(scores)
    )

# Add SHA-256 Tamper-Evident Audit Logging Middleware
app.add_middleware(AuditLogMiddleware)

# Register Intelligence Module APIRouters
app.include_router(threat.router)
app.include_router(cdr.router)
app.include_router(cctv.router)
app.include_router(crime_rings.router)
app.include_router(financial.router)
app.include_router(nocturnal.router)
app.include_router(surveillance.router)
app.include_router(dossiers.router)
app.include_router(gangs.router)
app.include_router(social_media.router)
app.include_router(nlp.router)
app.include_router(geo.router)
app.include_router(graph_analytics.router)
app.include_router(core_ai.router)
app.include_router(stream.router)
app.include_router(audit.router)




if __name__ == '__main__':
    import uvicorn
    uvicorn.run("app_backend.main:app", host="0.0.0.0", port=8080, reload=True)
