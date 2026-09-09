# Brihanmumbai Police — AI-Powered Criminal Network & Tactical Intelligence System (SIH 26)

Unified Police Tactical Intelligence Command Center combining FastAPI (Python REST API Backend) and Next.js 14 (React Frontend).

---

## 🚀 How to Run the Project (For Collaborators & Evaluators)

### Option A: Local Development Run (Standard)

#### 1. Start the Python FastAPI Backend (Terminal 1)

```bash
# Copy environment configuration template
cp .env.example .env

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
python api_server.py
```
- **Backend API**: `http://localhost:8080`
- **Interactive Swagger Docs**: `http://localhost:8080/docs`
- **Cryptographic Audit Verification**: `http://localhost:8080/api/audit/verify`

#### 2. Start the Next.js React Frontend (Terminal 2)

```bash
# Navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Next.js dev server
npm run dev
```
- **Web Command Center App**: `http://localhost:3000`

---

### Option B: Docker Containerized Run (Production / Edge Command Van)

Spin up the entire stack (FastAPI Backend + PostgreSQL Database) in isolated Docker containers:

```bash
# Build and launch the container stack in detached mode
docker-compose up --build -d

# Check backend container logs
docker-compose logs -f api-backend

# Stop the stack
docker-compose down
```

---

## 🔒 Security & Cryptographic Audit Features

1. **SHA-256 Tamper-Evident Audit Logging**:
   - Every search and access query across CDR, CCTV, Dossiers, and Threat modules is recorded with a SHA-256 hash computed over entry parameters + the previous entry's hash.
   - Hash chain integrity can be verified anytime via `GET /api/audit/verify`.
2. **Non-Root Container Security**:
   - Docker container executes as an unprivileged non-root user (`appuser`, UID 1000).
3. **Secrets Hygiene**:
   - Environment settings are loaded dynamically via `python-dotenv` from `.env`. `.env` and SQLite database files (`*.db`) are ignored in version control.

---

## 📌 Project Architecture

- **Frontend (`/frontend`)**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Leaflet.js (GPS Maps), D3.js (Force Networks).
- **Backend (`/app_backend`)**: FastAPI REST APIs serving modular intelligence services for CDR, CCTV, Crime Rings, Gangs, Financial, Nocturnal, Field Surveillance, Dossiers, Social Media, and SHA-256 Audit Verification.
- **Data Engine**: Pandas, NetworkX, IntelligenceEngine in-memory data structures, SQLite audit chain database.
