# Brihanmumbai Police — AI-Powered Criminal Network & Tactical Intelligence System (SIH 26)

Unified Police Tactical Intelligence Command Center combining FastAPI (Python REST API Backend) and Next.js 14 (React Frontend).

---

## 🚀 How to Run the Project (For Collaborators & Evaluators)

To run the updated Next.js 14 + FastAPI application on your localhost, follow these steps:

### 1. Start the Python FastAPI Backend (Terminal 1)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
python api_server.py
```
- **Backend API**: `http://localhost:8080`
- **Interactive Swagger Docs**: `http://localhost:8080/docs`

---

### 2. Start the Next.js React Frontend (Terminal 2)

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

## 📌 Project Architecture

- **Frontend (`/frontend`)**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Leaflet.js (GPS Maps), D3.js (Force Networks).
- **Backend (`/app_backend`)**: FastAPI REST APIs serving modular intelligence services for CDR, CCTV, Crime Rings, Gangs, Financial, Nocturnal, Field Surveillance, Dossiers, and Social Media.
- **Data Engine**: Pandas, NetworkX, IntelligenceEngine in-memory data structures.
