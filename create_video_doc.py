import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_heading(doc, text, level):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(6)
    for run in h.runs:
        run.font.name = "Arial"
        if level == 1:
            run.font.size = Pt(16)
            run.font.bold = True
            run.font.color.rgb = RGBColor(15, 23, 42) # Navy
        elif level == 2:
            run.font.size = Pt(13)
            run.font.bold = True
            run.font.color.rgb = RGBColor(37, 99, 235) # Blue
        elif level == 3:
            run.font.size = Pt(11)
            run.font.bold = True
            run.font.color.rgb = RGBColor(51, 65, 85) # Slate Dark Gray
    return h

def add_callout(doc, text, title="VIDEO PRESENTATION TIP"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    cell = tbl.cell(0, 0)
    cell.width = Inches(7.0)
    set_cell_background(cell, "EFF6FF") # Light blue bg
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Left border styling in XML
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="36" w:space="0" w:color="2563EB"/><w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    
    r_t = p.add_run(f"💡 {title}: ")
    r_t.font.name = "Arial"
    r_t.font.bold = True
    r_t.font.size = Pt(10)
    r_t.font.color.rgb = RGBColor(37, 99, 235)
    
    r_body = p.add_run(text)
    r_body.font.name = "Arial"
    r_body.font.size = Pt(9.5)
    r_body.font.color.rgb = RGBColor(30, 41, 59)

def build_docx(filename):
    doc = docx.Document()
    
    # Margins
    for s in doc.sections:
        s.top_margin = Inches(0.75)
        s.bottom_margin = Inches(0.75)
        s.left_margin = Inches(0.75)
        s.right_margin = Inches(0.75)

    # Colors
    NAVY = RGBColor(15, 23, 42)
    BLUE = RGBColor(37, 99, 235)
    DARK_GRAY = RGBColor(51, 65, 85)
    GRAY = RGBColor(100, 116, 139)
    GOLD = RGBColor(217, 119, 6)

    # Title Block
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    r_dept = p_title.add_run("SMART INDIA HACKATHON (SIH 2026) — DEMO VIDEO BLUEPRINT\n")
    r_dept.font.name = "Arial"
    r_dept.font.size = Pt(10)
    r_dept.font.bold = True
    r_dept.font.color.rgb = BLUE

    r_main = p_title.add_run("Brihanmumbai Police — AI-Powered Criminal Network & Tactical Intelligence System\n")
    r_main.font.name = "Arial"
    r_main.font.size = Pt(18)
    r_main.font.bold = True
    r_main.font.color.rgb = NAVY

    r_sub = p_title.add_run("Exhaustive 5-Minute Demonstration Checklist, Minute-by-Minute Time Budget & Feature Script")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(11)
    r_sub.font.italic = True
    r_sub.font.color.rgb = GRAY

    doc.add_paragraph()

    # Section 1: Executive Overview & Video Strategy
    add_heading(doc, "1. 5-Minute Video Strategy & Executive Overview", level=1)
    
    p_strat = doc.add_paragraph(
        "To achieve a winning score in Smart India Hackathon (SIH 2026), your 5-minute video must clearly demonstrate "
        "solving a real-world law enforcement problem, showcase the seamless UI/UX, explain complex AI/Graph algorithms, "
        "and prove production readiness. Every second must be utilized effectively without missing any key module or innovation."
    )
    p_strat.runs[0].font.name = "Arial"
    p_strat.runs[0].font.size = Pt(10)

    add_callout(doc, "Keep screen recordings smooth at 60fps with clear cursor highlighting. Use live audio commentary matching this exact script. Do not leave silent video gaps!", "KEY VIDEO DIRECTIVE")

    doc.add_paragraph()

    # Section 2: 5-Minute Time Budget Table
    add_heading(doc, "2. 5-Minute Minute-by-Minute Time Budget & Workflow Breakdown", level=1)

    table_time = doc.add_table(rows=1, cols=4)
    table_time.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_time.autofit = False

    hdr = table_time.rows[0].cells
    hdr_titles = ["Timestamp", "Phase / Module", "Key Visuals to Show on Screen", "Voiceover Talking Points"]
    widths_t = [Inches(1.0), Inches(1.8), Inches(2.2), Inches(2.0)]

    for idx, t in enumerate(hdr_titles):
        hdr[idx].text = t
        hdr[idx].width = widths_t[idx]
        set_cell_background(hdr[idx], "0F172A")
        p = hdr[idx].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
            run.font.name = "Arial"
            run.font.size = Pt(9)

    time_data = [
        ("0:00 - 0:30\n(30s)", "Executive Hook & Problem Statement", "Brihanmumbai Police Command Center landing page (/), live alert feed stream, high-level metrics cards.", "Introduce the challenge: police deal with siloed data across FIRs, CDRs, CCTV & financial records. Present our unified AI Command Center solving syndicate detection."),
        ("0:30 - 1:15\n(45s)", "Module 1: 6-Factor Suspect Threat Index", "Threat index table (/threat), top suspect #1 Md. Ranbir Bhalla (Score: 86.6), live interactive weight simulation sliders.", "Explain the 6-parameter risk scoring engine (CCTV 30%, CDR 20%, FIR 15%, History 15%, Nocturnal 10%, Financial 10%). Show real-time re-calculation on slider tweak."),
        ("1:15 - 2:00\n(45s)", "Module 2 & 4: CDR Graph & Louvain Gangs", "D3.js force-directed network graph (/cdr), Louvain community clusters (/gangs), ring leader node highlight, gang merge/confirm controls.", "Show dynamic CDR graph with node sizing by centrality. Explain automated Louvain algorithm discovering Gang 1 & Gang 2, isolating leaders and bridge connectors."),
        ("2:00 - 2:45\n(45s)", "Module 3 & 7: CCTV Co-Location & Surveillance", "CCTV physical meeting table (/cctv), facial match confidence %, distance delta, interactive Leaflet OpenStreetMap visualizer with camera markers.", "Demonstrate spatiotemporal fusion: matching phone call timestamps with physical CCTV camera sightings (e.g. MH-CCTV-1652). Show field surveillance density maps."),
        ("2:45 - 3:30\n(45s)", "Module 5, 6, 8, 9: PMLA, Nocturnal, OSINT & NLP", "Financial flow graph (/financial), midnight surge map (/nocturnal), social media handle tracking (/social-media), live NLP FIR parser tool (/dossiers).", "Cover multi-domain intelligence: suspicious UPI/ATM transfers, midnight call spikes (00:00-06:00 AM), OSINT handles, and pasting raw FIR narratives into NLP extractor for instant IPC section extraction."),
        ("3:30 - 4:15\n(45s)", "Automated 360° Dossiers & Chargesheet", "360-degree suspect dossier (/dossiers), unified forensic timeline, automated court-admissible Chargesheet generator (/chargesheet), Word export.", "Show full suspect dossier compiler with interactive timeline filtering (FIR, CDR, CCTV, Financial). Click 'Export Word Report' to generate complete legal submission."),
        ("4:15 - 5:00\n(45s)", "SHA-256 Audit Chain, AI Copilot & Conclusion", "Cryptographic audit ledger (/architecture), live SHA-256 chain verification (GET /api/audit/verify), AI Copilot chat query (/ai-copilot), Docker command van deployment.", "Show tamper-proof SHA-256 audit logging guaranteeing court evidence admissibility. Demo AI Copilot answering complex natural language queries. Conclude with air-gapped Docker readiness.")
    ]

    for r_idx, (ts, phase, visuals, vo) in enumerate(time_data):
        row = table_time.add_row().cells
        bg = "F8FAFC" if r_idx % 2 == 0 else "FFFFFF"
        
        row[0].text = ts
        row[1].text = phase
        row[2].text = visuals
        row[3].text = vo

        for c_idx, cell in enumerate(row):
            cell.width = widths_t[c_idx]
            set_cell_background(cell, bg)
            p = cell.paragraphs[0]
            for run in p.runs:
                run.font.name = "Arial"
                run.font.size = Pt(8.5)
                if c_idx == 0:
                    run.font.bold = True
                    run.font.color.rgb = GOLD
                elif c_idx == 1:
                    run.font.bold = True
                    run.font.color.rgb = NAVY
                elif c_idx == 2:
                    run.font.color.rgb = DARK_GRAY
                else:
                    run.font.color.rgb = BLUE

    doc.add_paragraph()

    # Section 3: Exhaustive Feature-by-Feature Checklist for 5-Min Video
    add_heading(doc, "3. Complete Feature-by-Feature Checklist (Every Module Included)", level=1)

    modules_full = [
        {
            "num": "1",
            "name": "Command Center Executive Dashboard (Route: /)",
            "features": [
                "4 High-Impact Metric Cards: 121 FIR Records, 182 Call Logs, 112 Interaction Pairs, 12 Confirmed CCTV Encounters, 88 Crime Ring Cells.",
                "Real-Time SSE Police Alert Feed: Live stream of incoming high-threat triggers, midnight call spikes, and unverified large transaction flags.",
                "Tactical Quick Navigation Hub: Instant links to all 14 intelligence sub-modules with real-time status badges.",
                "High-Priority Threat Spotlight: Live ticker featuring top offender Md. Ranbir Bhalla (Composite Risk Score: 86.6/100).",
                "Dark & Light Mode Tactical Styling: Glassmorphism UI engineered specifically for police command centers."
            ],
            "script": "Welcome to the Brihanmumbai Police Tactical Intelligence Command Center. Our dashboard aggregates disparate multi-source data streams in real time—processing 121 FIRs, 182 Call Detail Records, and 12 confirmed CCTV physical meetings into a single operational view."
        },
        {
            "num": "2",
            "name": "Module 1 — Algorithmic Suspect Threat Index (Route: /threat)",
            "features": [
                "6-Factor Multi-Criteria Risk Scoring (0–100 Scale): Combines CCTV co-locations (30%), CDR network centrality (20%), FIR severity (15%), Criminal history (15%), Nocturnal ratio (10%), and Financial anomaly (10%).",
                "Suspect Leaderboard & Risk Badges: Ranks suspects with color-coded risk levels (CRITICAL >80, HIGH 60-80, MODERATE 40-60, LOW <40).",
                "Top Suspect Breakdown: #1 Md. Ranbir Bhalla (86.6), #2 Md. Azad Mannan (81.8), #3 Md. Advik Golla (79.1).",
                "Interactive Dynamic Weight Simulator: Sliders allowing senior officers to dynamically adjust parameter weights and re-calculate scores in real time.",
                "Detailed Suspect Breakdown Cards: Clickable drawer displaying parameter score contributions."
            ],
            "script": "Our 6-factor algorithmic scoring engine calculates a 0 to 100 risk score for every entity. Md. Ranbir Bhalla tops the threat index at 86.6 out of 100. Using our dynamic simulator sliders, investigators can adjust parameter weights to prioritize financial fraud or nocturnal calls."
        },
        {
            "num": "3",
            "name": "Module 2 — Dynamic CDR Call Network Graph (Route: /cdr)",
            "features": [
                "Interactive D3.js Force-Directed Graph: Drag, zoom, pan, and inspect nodes representing suspects and edges representing call volume/duration.",
                "Centrality Metric Sizing: Node sizes dynamically adjust based on Eigenvector Degree Centrality and Betweenness Centrality.",
                "Color-Coded Gang Clustering: Nodes are visually colored according to detected crime syndicates.",
                "Hover & Click Inspector: Tooltips display phone numbers, call frequency, total talk duration, and nocturnal percentage.",
                "Filter Controls & Search: Isolate high-volume calls, filter nocturnal communication, or search specific suspect phone numbers."
            ],
            "script": "Moving to CDR Network Analysis, our interactive D3.js force graph visualizes inter-suspect communication. Larger nodes highlight network bridge hubs and ring leaders, while link thickness represents call frequency and duration."
        },
        {
            "num": "4",
            "name": "Module 3 — CCTV Physical Co-Location Tracker (Route: /cctv)",
            "features": [
                "Spatiotemporal Meeting Correlation Engine: Cross-references CDR timestamps and cell tower coordinates against municipal CCTV facial recognition logs.",
                "Confirmed Meeting Table: Displays camera ID, location name, suspect pairs, time delta, and facial match confidence %.",
                "Top Encounters: E.g., Md. Samar Nagar & Md. Teerth Bhargava captured at MH-CCTV-2466 with 97.0% match confidence.",
                "Interactive Leaflet GIS Map: OpenStreetMap rendering camera pins, suspect encounter coordinates, and proximity radiuses.",
                "Time Delta Threshold Filter: Adjust time window tolerance (e.g. ±15 mins) for co-location matching."
            ],
            "script": "Cell tower data alone doesn't prove physical conspiracy. Our CCTV Co-Location tracker correlates phone calls with physical camera sightings, capturing suspect pairs like Md. Samar Nagar and Md. Teerth Bhargava meeting physically near camera MH-CCTV-2466 with 97% confidence."
        },
        {
            "num": "5",
            "name": "Module 4 — Louvain Syndicate & Gang Detector (Route: /gangs & /crime-rings)",
            "features": [
                "Automated Louvain Modularity Clustering: Automatically detects crime syndicates (RING-01, RING-02) without prior manual tagging.",
                "Ring Leader Identification: Automatically assigns syndicate leader based on maximum network degree centrality.",
                "Investigator Workflow Actions: Interactive tools to Confirm Gang, Rename Gang, Merge Syndicates, or Extract Subgraphs.",
                "Syndicate Metrics Breakdown: Total internal calls, external bridge contacts, confirmed physical meetings, and member hierarchy."
            ],
            "script": "Using graph theory community detection—specifically the Louvain Modularity algorithm—our system automatically detects active crime rings like RING-01, isolating ring leaders and identifying cross-gang communication bridges."
        },
        {
            "num": "6",
            "name": "Module 5 — PMLA Financial Intelligence Engine (Route: /financial)",
            "features": [
                "PMLA Financial Laundering Graph: Visualizes money trails, peer-to-peer transfers, and high-value suspicious transfers.",
                "UPI & Merchant Anomaly Detection: Tracks sudden transaction volume spikes, wine shop merchant hits, and shell company transfers.",
                "Failed ATM Withdrawal Alerting: Identifies geo-fenced carding attempts and cash smurfing operations.",
                "Suspect Transaction Ledger: Detailed searchable audit table of sender, receiver, amount (INR), and risk flag."
            ],
            "script": "Our Financial Intelligence engine tracks illicit money flows, identifying rapid peer-to-peer UPI transfers, shell company transactions, and suspicious cash smurfing attempts across high-risk accounts."
        },
        {
            "num": "7",
            "name": "Module 6 — Midnight Nocturnal Call Anomalies (Route: /nocturnal)",
            "features": [
                "Midnight Window Analysis (00:00 – 06:00 IST): Flags communication spikes typical of illicit operations.",
                "Nocturnal Ratio Score: Calculates percentage of total communications occurring during nocturnal hours.",
                "Spatiotemporal Tower Handover Map: Leaflet map showing cell tower locations handling late-night surge traffic.",
                "Suspect Nocturnal Ranking: Ranks suspects by nocturnal activity frequency."
            ],
            "script": "Criminal syndicates operate under the cover of night. Our Nocturnal Anomaly engine isolates call spikes between midnight and 6 AM, mapping late-night cell tower handover hotspots."
        },
        {
            "num": "8",
            "name": "Module 7 — Field Surveillance Density & Panchnama (Route: /surveillance)",
            "features": [
                "Special Branch Observation Logs: Field officer manual observation reports, panchnama documentation, and spot sightings.",
                "GIS Patrol Heatmap: Visual density map of field surveillance activities across Mumbai police zones.",
                "Officer Activity Log: Searchable timeline of officer sightings, location coordinates, and suspect notes."
            ],
            "script": "We bridge digital intelligence with physical policing by integrating Special Branch field surveillance logs, officer observation notes, and GIS patrol density maps."
        },
        {
            "num": "9",
            "name": "Module 8 — 360° Suspect Dossiers & NLP FIR Parser (Route: /dossiers)",
            "features": [
                "Unified 360° Suspect Profile Viewer: Comprehensive view of background, alias, prior convictions, and threat breakdown.",
                "Interactive Forensic Timeline (<ForensicTimeline />): Multi-source event timeline with color-coded filters for FIR, CDR, CCTV, and Financial events.",
                "Live Interactive NLP FIR Parser Tool (<FIRParserTool />): Paste raw unstructured FIR narrative text to instantly extract accused names, co-accused entities, IPC/BNS sections, location keywords, and Modus Operandi (MO) taxonomy.",
                "Export Suspect Dossier: One-click export to Markdown and Word `.docx` dossiers."
            ],
            "script": "Investigating a suspect requires a 360-degree view. Our dossier viewer features an interactive forensic timeline unifying FIRs, calls, CCTV sightings, and payments. Additionally, our live NLP parser accepts raw FIR text and instantly extracts IPC sections, modus operandi, and accused names."
        },
        {
            "num": "10",
            "name": "Module 9 — OSINT Digital Footprint & Social Media (Route: /social-media)",
            "features": [
                "Cross-Platform Login Co-Occurrence: Analyzes IP and geolocation logins across Instagram, Telegram, X, and dark web handles.",
                "Monitored Account Ledger: Track flagged keywords, post sentiment, and handle alias mappings.",
                "Social Media Timeline Tracker: Displays chronological social posting alongside physical movement."
            ],
            "script": "Our OSINT module monitors digital footprints across social platforms, correlating login locations and flagged keywords with physical suspect locations."
        },
        {
            "num": "11",
            "name": "Automated Chargesheet & Court Report Generator (Route: /chargesheet)",
            "features": [
                "One-Click Legal Document Compilation: Compiles complete investigative summary, suspect rankings, CCTV meeting proof, and gang hierarchy.",
                "Export Formats: Direct download of court-admissible `.docx` and `.pdf` reports.",
                "Automated IPC Section Cross-Referencing: Links suspect criminal acts directly to applicable penal code sections."
            ],
            "script": "Preparing legal paperwork takes weeks. Our automated Chargesheet generator compiles all verified intelligence, co-accused connection matrices, and evidence chains into a court-admissible Word document in seconds."
        },
        {
            "num": "12",
            "name": "SHA-256 Tamper-Evident Cryptographic Audit Ledger (Route: /architecture)",
            "features": [
                "Immutable SQLite Hash Chain: Every API search query, dossier lookup, or threat evaluation is appended to a cryptographic ledger.",
                "SHA-256 Hash Formula: `SHA-256(current_payload + previous_hash)` ensures zero tamper potential.",
                "Live Verification Endpoint (`GET /api/audit/verify`): Mathematically validates entire audit trail integrity for court chain-of-custody compliance.",
                "Audit Log Inspection Table: Displays log sequence ID, timestamp, endpoint accessed, user ID, and calculated hash."
            ],
            "script": "To guarantee chain-of-custody for court admissibility, every query in our system is cryptographically logged using a SHA-256 hash chain. Evaluators can verify audit integrity live via our cryptographic verification API."
        },
        {
            "num": "13",
            "name": "AI Copilot & Natural Language Query Engine (Route: /ai-copilot)",
            "features": [
                "Context-Aware LLM Intelligence Assistant: Natural language chat interface for police investigators.",
                "Multi-Database Query Resolution: Ask complex questions like 'Which suspects met near Byculla Market after midnight?'",
                "Structured Citation & Graph Linking: Returns exact suspect IDs, meeting timestamps, and CCTV camera codes."
            ],
            "script": "Investigators can converse directly with our AI Copilot, asking natural language queries like 'Show all high-threat suspects who met near Lower Parel flyover' and receiving structured responses with evidence citations."
        },
        {
            "num": "14",
            "name": "Production Architecture & Tactical Deployment (Docker / FastAPI / Next.js)",
            "features": [
                "Full-Stack Production Stack: Next.js 14 React Frontend + FastAPI Python 3.10 Backend (18 APIRouters).",
                "Docker Containerization: Single command `docker-compose up --build` with non-root unprivileged security (`appuser`, UID 1000).",
                "Tactical Edge Command Van Support: Runs offline/air-gapped in tactical police command vans.",
                "Zero Compilation Errors: Production build verified across all 14 routes."
            ],
            "script": "Engineered for real-world deployment, our system runs on Next.js 14 and FastAPI. Fully containerized with Docker, it can deploy in cloud environments or offline inside tactical edge command vans."
        }
    ]

    for mod in modules_full:
        add_heading(doc, f"Module {mod['num']} — {mod['name']}", level=2)
        
        p_feat_head = doc.add_paragraph()
        r_fh = p_feat_head.add_run("Key Features & Capabilities to Highlight:")
        r_fh.font.name = "Arial"
        r_fh.font.bold = True
        r_fh.font.size = Pt(10)
        r_fh.font.color.rgb = DARK_GRAY

        for f in mod["features"]:
            p_f = doc.add_paragraph()
            p_f.paragraph_format.left_indent = Inches(0.25)
            p_f.paragraph_format.space_before = Pt(2)
            p_f.paragraph_format.space_after = Pt(2)
            
            r_bullet = p_f.add_run("✔ ")
            r_bullet.font.name = "Arial"
            r_bullet.font.bold = True
            r_bullet.font.color.rgb = BLUE
            
            r_text = p_f.add_run(f)
            r_text.font.name = "Arial"
            r_text.font.size = Pt(9.5)

        p_sc = doc.add_paragraph()
        p_sc.paragraph_format.space_before = Pt(4)
        p_sc.paragraph_format.space_after = Pt(8)
        
        r_sct = p_sc.add_run("🎙️ Recommended 5-Min Video Script Line: ")
        r_sct.font.name = "Arial"
        r_sct.font.bold = True
        r_sct.font.italic = True
        r_sct.font.size = Pt(9.5)
        r_sct.font.color.rgb = GOLD
        
        r_scb = p_sc.add_run(f'"{mod["script"]}"')
        r_scb.font.name = "Arial"
        r_scb.font.size = Pt(9.5)
        r_scb.font.italic = True
        r_scb.font.color.rgb = NAVY

    doc.add_paragraph()

    # Section 4: Demo Dataset Benchmarks & Verified Numbers
    add_heading(doc, "4. Verified Demo Dataset Metrics (Numbers to Speak in Video)", level=1)
    
    p_num_intro = doc.add_paragraph(
        "During video voiceover, state these exact verified numbers to demonstrate scale and technical rigor:"
    )
    p_num_intro.runs[0].font.name = "Arial"
    p_num_intro.runs[0].font.size = Pt(10)

    metrics = [
        ("Total Active FIR Records Processed", "121 active FIRs across Mumbai police stations"),
        ("Total Call Detail Records (CDR) Analyzed", "182 call & SMS transaction logs"),
        ("Inter-Suspect Call Pairs Exchanged", "112 unique suspect communication pairs"),
        ("Confirmed Physical Meetings (CCTV + CDR)", "12 spatiotemporal physical co-location encounters"),
        ("Detected Crime Syndicates / Cells", "88 active criminal cells (Louvain community detection)"),
        ("Top Offender Suspect #1", "Md. Ranbir Bhalla — Composite Threat Score: 86.6 / 100"),
        ("Top Offender Suspect #2", "Md. Azad Mannan — Composite Threat Score: 81.8 / 100"),
        ("Top Offender Suspect #3", "Md. Advik Golla — Composite Threat Score: 79.1 / 100"),
        ("Highest Confidence Physical Encounter", "Md. Samar Nagar & Md. Teerth Bhargava at Camera MH-CCTV-2466 (97.0% Match Confidence)"),
        ("Primary Active Syndicate ID", "RING-01 (12 Members, 38 internal calls, 6 confirmed CCTV meetings, Ring Leader: Md. Ranbir Bhalla)")
    ]

    tbl_m = doc.add_table(rows=1, cols=2)
    tbl_m.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_m.autofit = False

    hdr_m = tbl_m.rows[0].cells
    hdr_m[0].text = "Intelligence Benchmark Metric"
    hdr_m[1].text = "Verified System Output Value"
    hdr_m[0].width = Inches(3.2)
    hdr_m[1].width = Inches(3.8)

    for c in hdr_m:
        set_cell_background(c, "0F172A")
        p = c.paragraphs[0]
        for run in p.runs:
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
            run.font.name = "Arial"
            run.font.size = Pt(9.5)

    for idx, (lbl, val) in enumerate(metrics):
        row = tbl_m.add_row().cells
        bg = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        row[0].text = lbl
        row[1].text = val
        for c_idx, c in enumerate(row):
            set_cell_background(c, bg)
            p = c.paragraphs[0]
            for run in p.runs:
                run.font.name = "Arial"
                run.font.size = Pt(9)
                if c_idx == 0:
                    run.font.bold = True
                    run.font.color.rgb = NAVY
                else:
                    run.font.color.rgb = BLUE

    doc.add_paragraph()

    # Section 5: Video Screen Recording Checklist & Best Practices
    add_heading(doc, "5. Screen Recording Setup & Recording Checklist", level=1)

    rec_tips = [
        "Screen Resolution: Set recording software (OBS Studio / Loom) to 1920x1080 (1080p) or 4K. Hide browser bookmarks bar and extensions.",
        "Cursor Setup: Turn on yellow highlight glow around mouse cursor for clear visual tracking during D3 graph drags and leaf map clicks.",
        "Local Demo Pre-flight: Ensure FastAPI backend (port 8002/8080) and Next.js frontend (port 3000) are started and responsive before hitting record.",
        "Audio Clarity: Use a crisp noise-canceling microphone. Speak with high energy, authority, and clear tactical police terminology.",
        "Smooth Transitions: Do not cut abruptly between screens. Use smooth page navigation by clicking the sidebar links.",
        "Final Submission Check: Confirm total video duration is strictly between 4 minutes 45 seconds and 5 minutes 00 seconds!"
    ]

    for tip in rec_tips:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.left_indent = Inches(0.25)
        p_t.paragraph_format.space_before = Pt(3)
        p_t.paragraph_format.space_after = Pt(3)
        
        r_b = p_t.add_run("📌 ")
        r_b.font.name = "Arial"
        
        r_t = p_t.add_run(tip)
        r_t.font.name = "Arial"
        r_t.font.size = Pt(9.5)
        r_t.font.color.rgb = DARK_GRAY

    doc.add_paragraph()
    add_callout(doc, "You are now fully prepared to record a flawless 5-minute SIH video! Every single feature, metric, and algorithm from the codebase is documented above.", "VICTORY CHECKLIST")

    # Save file
    doc.save(filename)
    print(f"[SUCCESS] Generated complete 5-minute video feature blueprint document: {filename}")

if __name__ == "__main__":
    build_docx("SIH_26_5Min_Video_Complete_Feature_Guide.docx")
