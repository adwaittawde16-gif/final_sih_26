# Brihanmumbai Police — AI-Powered Criminal Network & Tactical Intelligence System (SIH 26)
## Master Context & Architecture Reference for Claude AI

> **Purpose:** This document provides comprehensive context on the entire SIH 26 Tactical Intelligence System repository for use in Claude sessions, prompt engineering, code generation, and architectural analysis.

---

## 1. 📌 Project Overview & Objective

- **Project Name:** Brihanmumbai Police — AI-Powered Criminal Network & Tactical Intelligence System
- **Event/Hackathon:** Smart India Hackathon (SIH 26)
- **Domain:** Law Enforcement, Crime Syndicate Detection, OSINT, CDR Network Graphing, Physical Surveillance Correlation, Threat Scoring & Cryptographic Audit Trails.
- **Core Objective:** Provide a unified tactical intelligence command center for police investigators to process disparate data streams (FIRs, Call Detail Records, CCTV camera sightings, financial transactions, social media feeds, and field surveillance reports) to automatically detect hidden crime syndicates, rank high-risk suspects, link digital communications to physical meetings, and generate legally admissible dossiers with SHA-256 hash-chain audit logging.

---

## 2. 🏗️ High-Level System Architecture & Tech Stack

```
                     ┌──────────────────────────────────────────────┐
                     │          Next.js 14 React Frontend           │
                     │ (Tailwind CSS, Lucide, D3.js Graphs, Leaflet)│
                     └──────────────────────┬───────────────────────┘
                                            │ REST API / JSON
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │           FastAPI Python Backend             │
                     │  (api_server.py / app_backend/main.py)       │
                     └──────────────────────┬───────────────────────┘
                                            │
         ┌──────────────────────────────────┼──────────────────────────────────┐
         ▼                                  ▼                                  ▼
┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
│  Data Engine &   │               │   AI / Graph     │               │  Cryptographic   │
│ CSV Datasets     │               │   Algorithms     │               │   Audit Log      │
│ (Pandas, NumPy)  │               │(NetworkX, NLP)   │               │(SHA-256 SQLite)  │
└──────────────────┘               └──────────────────┘               └──────────────────┘
```

### Stack Breakdown:
- **Frontend (`/frontend`)**:
  - **Framework**: Next.js 14 (App Router), React 18, TypeScript
  - **Styling**: Tailwind CSS, CSS Glassmorphism, Modern Dark Mode Interface
  - **Visualization**: D3.js (Interactive Force-Directed Network Graphs), Leaflet.js (GPS Spatiotemporal Heatmaps & CCTV Marker Mapping), Recharts / Lucide Icons
- **Backend (`/app_backend` & `api_server.py`)**:
  - **Framework**: Python 3.10+, FastAPI, Uvicorn ASGI Server
  - **Analytics Engine**: Pandas, NumPy, NetworkX (Graph centrality, community detection), Spacy/Regex NLP (FIR parsing)
  - **Audit Storage**: SQLite (`audit_log.db`) using SHA-256 cryptographic chain hashing for tamper-proof audit trails.
- **Deployment & Infra**:
  - **Docker**: Containerized deployment via `docker-compose.yml` with non-root security (`appuser`, UID 1000).
  - **Deployment Configuration**: `vercel.json` for frontend deployment.

---

## 3. 🧠 Core Modules & Algorithms

### 1. 6-Parameter Suspect Threat Scoring Engine (`intelligence_engine.py` & `threat_classifier.py`)
Calculates a composite risk score (0 - 100) for every suspect in the database across 6 weighted parameters:
1. **CCTV Co-Location Physical Meetings (Max 30 Pts)**: Frequency and confidence of confirmed physical meetings captured on CCTV cameras near CDR communication windows.
2. **CDR Network Centrality (Max 20 Pts)**: Degree centrality, eigenvector centrality, and volume of calls exchanged within criminal rings.
3. **FIR Crime Severity (Max 15 Pts)**: Severity score based on Indian Penal Code (IPC) sections tagged in filed FIRs.
4. **Criminal History Records (Max 15 Pts)**: Prior convictions, absconder status, and past criminal record history.
5. **Nocturnal Call Anomaly Index (Max 10 Pts)**: Ratio of calls made between midnight and 6 AM.
6. **Financial Anomaly Score (Max 10 Pts)**: High-volume unverified transfers, peer-to-peer UPI surges, and shell company links.

### 2. CDR Network Graph & Syndicate Ring Detection (`co_accused_network.py`, `crime_ring_detector.py`)
- Constructs undirected weighted graphs linking suspects by call volume and duration using NetworkX.
- Runs Louvain / Greedy Modularity community detection algorithms to isolate distinct crime syndicates (`RING-01`, `RING-02`, etc.).
- Identifies ring leaders based on degree centrality and cross-group bridge nodes (connectors).

### 3. CCTV Co-Location Meeting Tracker (`geo_map_generator.py`)
- Cross-references CDR timestamps and cell tower locations with CCTV camera sightings (`nearest_cctv_sightings.csv`).
- Spatiotemporal matching flags high-confidence physical encounters when two frequently calling suspects appear near the same camera within a strict time delta.

### 4. NLP FIR & Police Report Analyzer (`nlp_fir_analyzer.py`)
- Extracts Modus Operandi (MO), accused names, phone numbers, location keywords, weapon usage, and IPC sections from unstructured text reports.

### 5. Nocturnal Call Anomaly Engine (`nocturnal_call_analyzer.py`)
- Analyzes midnight communication spikes (00:00 - 06:00 AM) often associated with illicit operations and planned criminal execution.

### 6. Financial & Social Media Intelligence (`financial_analyzer.py`, `social_media_timeline.py`)
- Maps financial transaction flows, UPI payments, wine shop merchant hits, and shell entity transfers.
- Constructs OSINT digital footprints and timeline trackers across platforms (Instagram, Telegram, X, dark web handles).

### 7. Automated Dossier & Chargesheet Generator (`generate_dossier.py`, `generate_report_doc.py`)
- Compiles complete investigative summaries, criminal timeline charts, co-accused connection matrices, and exportable `.docx` / `.md` dossiers for court submissions.

### 8. Tamper-Evident SHA-256 Cryptographic Audit Chain (`app_backend/routers/audit.py`)
- Every search query, dossier lookup, or threat assessment is appended to an immutable SQLite hash-chain ledger.
- Each log entry stores `SHA-256(current_payload + previous_hash)`.
- Includes a verification endpoint `GET /api/audit/verify` that mathematically validates hash chain integrity to guarantee chain-of-custody compliance for court admissibility.

---

## 4. 📁 Codebase Directory Structure

```
final_sih_26/
├── README.md                             # Quickstart & setup documentation
├── Executive_Intelligence_Summary.md     # Executive summary report of threat metrics
├── Dockerfile & docker-compose.yml       # Production container setup
├── requirements.txt                      # Python dependencies
├── package.json                          # Node dependencies
├── api_server.py                         # FastAPI root server entry point
├── intelligence_engine.py                # Core Python data engine & intelligence algorithms
├── co_accused_network.py                 # NetworkX CDR graph & ring generator
├── crime_ring_detector.py                # Syndicate detection algorithm
├── nlp_fir_analyzer.py                   # FIR text NLP extraction
├── nocturnal_call_analyzer.py            # Midnight call pattern detector
├── financial_analyzer.py                 # Financial transaction analysis
├── generate_dossier.py                   # Suspect profile generator
├── generate_report_doc.py                # Word document report compiler
├── geo_map_generator.py                  # Map HTML & Leaflet generator
├── app_backend/                          # Modular FastAPI Backend Architecture
│   ├── config.py                         # App configuration & env loader
│   ├── main.py                           # Main FastAPI app factory & CORS
│   ├── dependencies.py                   # Dependency injection
│   ├── middleware/                       # Audit logging middleware
│   └── routers/                          # API Route handlers
│       ├── audit.py                      # SHA-256 verification endpoints
│       ├── cctv.py                       # CCTV meeting endpoints
│       ├── cdr.py                        # CDR network endpoints
│       ├── core_ai.py                    # AI query & copilot endpoints
│       ├── crime_rings.py                # Syndicate endpoints
│       ├── dossiers.py                   # Suspect profile endpoints
│       ├── financial.py                  # Financial intelligence endpoints
│       ├── gangs.py                      # Gang network endpoints
│       ├── geo.py                        # Geographic map endpoints
│       ├── graph_analytics.py            # Centrality & graph stats
│       ├── nlp.py                        # Text extraction endpoints
│       ├── nocturnal.py                  # Midnight anomaly endpoints
│       ├── social_media.py               # Social media timeline endpoints
│       ├── stream.py                     # Live alert feeds / SSE stream
│       ├── surveillance.py               # Field report endpoints
│       └── threat.py                     # Suspect threat scoring endpoints
├── frontend/                             # Next.js 14 React Web Application
│   ├── package.json                      # Next.js dependencies
│   ├── tailwind.config.js                # Custom styling system
│   └── src/
│       ├── app/                          # Next.js App Router Pages
│       │   ├── page.tsx                  # Root landing / executive dashboard
│       │   ├── command-center/           # Real-time command center
│       │   ├── threat-index/             # Suspect ranking & threat scores
│       │   ├── cdr-network/              # Dynamic force-directed CDR network graph
│       │   ├── cctv-colocation/          # GPS map & physical meeting timeline
│       │   ├── crime-rings/              # Active crime syndicate breakdown
│       │   ├── dossiers/                 # Interactive suspect dossier viewer
│       │   ├── ai-copilot/               # Natural language intelligence Q&A
│       │   ├── financial-intelligence/   # Money trail & transaction graph
│       │   ├── nocturnal-anomalies/      # Midnight surge analytics
│       │   ├── nlp-extraction/           # FIR text entity extractor
│       │   ├── social-intelligence/      # OSINT digital footprint timeline
│       │   ├── chargesheet/              # Automated legal report generator
│       │   └── access-control/           # SHA-256 Audit verification page
│       ├── components/                   # Reusable UI components & charts
│       └── lib/                          # Mock data, API fetch helpers & utilities
└── [Data CSVs]                           # 8 Intelligence datasets
    ├── call_detail_records.csv
    ├── fir_and_police_reports.csv
    ├── nearest_cctv_sightings.csv
    ├── criminal_history_databases.csv
    ├── financial_transaction_records.csv
    ├── social_media_intelligence.csv
    ├── social_media_login_tracking.csv
    └── surveillance_reports.csv
```

---

## 5. 📊 Data Schemas (Intelligence CSVs)

1. **`fir_and_police_reports.csv`**: `fir_id`, `date`, `police_station`, `accused_name`, `accused_phone`, `crime_category`, `ipc_sections`, `severity_score`, `summary`
2. **`call_detail_records.csv`**: `caller_number`, `receiver_number`, `timestamp`, `duration_seconds`, `call_type`, `caller_tower_lat`, `caller_tower_lon`
3. **`nearest_cctv_sightings.csv`**: `camera_id`, `location_name`, `timestamp`, `suspect_name`, `confidence_score`, `latitude`, `longitude`
4. **`criminal_history_databases.csv`**: `suspect_name`, `prior_convictions`, `absconder_status`, `history_score`, `known_aliases`
5. **`financial_transaction_records.csv`**: `sender_name`, `receiver_name`, `amount_inr`, `timestamp`, `payment_mode`, `is_suspicious`
6. **`social_media_intelligence.csv`**: `suspect_name`, `platform`, `handle`, `post_content`, `flagged_keywords`, `timestamp`
7. **`surveillance_reports.csv`**: `officer_id`, `suspect_name`, `observation_notes`, `location`, `timestamp`

---

## 6. 🌐 Main Backend API Endpoints (`http://localhost:8080`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/threat/rankings` | Get top-ranked high-threat suspects with composite score breakdown |
| `GET` | `/api/cdr/graph` | Fetch nodes and edges for network graph visualization |
| `GET` | `/api/cctv/meetings` | Fetch confirmed physical meeting encounters from CCTV + CDR |
| `GET` | `/api/crime-rings` | List isolated crime syndicates and member hierarchies |
| `GET` | `/api/dossiers/{suspect_name}` | Get complete compiled dossier for a specific suspect |
| `POST` | `/api/nlp/analyze` | Parse unstructured FIR text for entities, IPC sections, and MO |
| `GET` | `/api/nocturnal/anomalies` | Get midnight call surge analytics |
| `GET` | `/api/financial/flow` | Get peer-to-peer and suspect financial transaction graph |
| `GET` | `/api/audit/verify` | Perform SHA-256 cryptographic hash-chain integrity verification |
| `POST` | `/api/ai/query` | AI Copilot natural language query handler |

---

## 7. 📈 Key Intelligence Metrics (Current Benchmark State)

- **Total FIR Records Processed:** 121 active FIRs
- **Total Call Records Analyzed:** 182 logs
- **Discovered Inter-Suspect Call Pairs:** 112 pairs
- **Confirmed Physical CCTV Encounters:** 12 encounters
- **Detected Crime Syndicates:** 88 active cells
- **Top Suspect Threat Ranking:**
  1. **Md. Ranbir Bhalla** — Score: **86.6 / 100** (Ring Leader `RING-01`)
  2. **Md. Azad Mannan** — Score: **81.8 / 100**
  3. **Md. Advik Golla** — Score: **79.1 / 100**
  4. **Md. Balendra Nayak** — Score: **72.3 / 100**
  5. **Md. Darsh Sampath** — Score: **70.6 / 100**

---

## 8. 🚀 How to Run the Repository

### 1. Python FastAPI Backend
```bash
cp .env.example .env
pip install -r requirements.txt
python api_server.py
# Server: http://localhost:8080 | Docs: http://localhost:8080/docs
```

### 2. Next.js React Frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

### 3. Docker Compose Stack
```bash
docker-compose up --build -d
```

---

## 💡 How to Use This Context with Claude

When starting a conversation with Claude regarding this repository, copy and paste this document into your prompt or attach `PROJECT_CONTEXT_FOR_CLAUDE.md`. You can then prompt Claude with instructions such as:

- *"Based on our project architecture, implement a new router in `app_backend/routers/` for..."*
- *"Help me write a Next.js 14 component in `frontend/src/app/` to display..."*
- *"Optimize the Louvain community detection algorithm in `crime_ring_detector.py` to handle..."*
- *"Write unit tests for the SHA-256 cryptographic audit chain in `app_backend/routers/audit.py`..."*
