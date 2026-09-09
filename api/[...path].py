from app_backend.main import app

# Catch-all Vercel Python function so /api/health, /api/threat/*, etc. hit FastAPI.
app = app
