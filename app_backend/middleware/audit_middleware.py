"""
app_backend/middleware/audit_middleware.py
-------------------------------------------
FastAPI Middleware for Automatic SHA-256 Tamper-Evident Audit Logging.
Captures timestamp, HTTP method, endpoint, query/body parameters, and source IP
for all data queries across CDR, CCTV, Dossiers, Financial, NLP, Threat, and Surveillance routes.
For: Brihanmumbai Police Department — SIH 26
"""

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response
import json
import urllib.parse
from app_backend.services.audit_logger import audit_logger

EXCLUDED_PATHS = {
    "/docs",
    "/openapi.json",
    "/redoc",
    "/favicon.ico"
}

class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Process the request
        response: Response = await call_next(request)

        # Skip non-API paths or static doc endpoints
        if path in EXCLUDED_PATHS or not path.startswith("/api/"):
            return response

        # Do not log health check route to keep audit logs clean
        if path == "/api/health":
            return response

        try:
            # Extract Client IP (support proxy headers like X-Forwarded-For)
            forwarded_for = request.headers.get("x-forwarded-for")
            if forwarded_for:
                source_ip = forwarded_for.split(",")[0].strip()
            elif request.client:
                source_ip = request.client.host
            else:
                source_ip = "127.0.0.1"

            # Extract Query Parameters
            query_params = dict(request.query_params)
            params_str = json.dumps(query_params, sort_keys=True) if query_params else "{}"

            # Log to SHA-256 tamper-evident chain
            audit_logger.log_event(
                endpoint=path,
                method=request.method,
                request_params=params_str,
                source_ip=source_ip
            )
        except Exception as e:
            # Audit logging error should not block normal API execution, but print warning
            print(f"[AUDIT_LOG_WARNING] Failed to record audit log for {path}: {str(e)}")

        return response
