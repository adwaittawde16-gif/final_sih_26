"""
export_json.py
--------------
Exports the entire Intelligence Platform dataset and analytics into structured JSON files:
  - intelligence_export.json (Leaderboard, Crime Rings, CCTV Meetings, Financial Trails, Nocturnal Anomalies, Alerts)
  - graph_data.json (Nodes and Edges for D3/React Flow network graph rendering)

For: Brihanmumbai Police Department — SIH 26
"""

import os
import json
import pandas as pd
from intelligence_engine import IntelligenceEngine
from crime_ring_detector import CrimeRingDetector
from financial_analyzer import FinancialAnalyzer
from nocturnal_call_analyzer import NocturnalCallAnalyzer
from threat_classifier import ThreatClassifier
from alert_notifier import generate_police_alerts

def export_all_to_json(output_folder="."):
    print("[*] Initializing Intelligence Engine for JSON Export...")
    engine = IntelligenceEngine()
    
    # 1. Threat Leaderboard & Scores
    print("[+] Exporting Threat Leaderboard...")
    scores_df = engine.calculate_threat_scores()
    scores = scores_df.to_dict(orient="records")
    
    # 2. Risk Tier Classification
    classifier = ThreatClassifier(engine)
    suspect_tiers = classifier.classify_suspect_risks().to_dict(orient="records")
    
    # 3. Crime Rings / Syndicates
    print("[+] Exporting Crime Rings...")
    ring_detector = CrimeRingDetector(engine)
    syndicates_df = ring_detector.detect_syndicates()
    crime_rings = syndicates_df.to_dict(orient="records")
    
    # 4. CCTV Encounters & Physical Meetings
    print("[+] Exporting CCTV Co-Location Encounters...")
    meetings_df = engine.get_cctv_meetings()
    cctv_meetings = meetings_df.to_dict(orient="records") if not meetings_df.empty else []
    
    # 5. Financial Money Trails
    print("[+] Exporting Financial Transactions...")
    fin_analyzer = FinancialAnalyzer(engine)
    fin_summary, fin_raw = fin_analyzer.analyze_financial_trails()
    financial_data = {
        "summary": fin_summary.to_dict(orient="records"),
        "total_volume_inr": float(fin_raw['amount_inr'].sum()) if 'amount_inr' in fin_raw else 0,
        "transaction_count": len(fin_raw)
    }
    
    # 6. Nocturnal Call Anomalies
    print("[+] Exporting Nocturnal Call Anomalies...")
    noc_analyzer = NocturnalCallAnalyzer(engine)
    noc_calls, noc_towers = noc_analyzer.analyze_nocturnal_patterns()
    nocturnal_data = {
        "total_anomalies": len(noc_calls),
        "calls": noc_calls.to_dict(orient="records"),
        "towers": noc_towers.to_dict(orient="records")
    }
    
    # 7. Real-Time Police Alerts
    print("[+] Exporting Alert Feed...")
    alerts, _ = generate_police_alerts()
    
    # Package into main JSON export
    intelligence_export = {
        "system": "Brihanmumbai Police Intelligence Platform (SIH 26)",
        "version": "1.0.0",
        "kpis": {
            "total_suspects": len(scores),
            "total_crime_rings": len(crime_rings),
            "critical_risk_suspects": len([s for s in suspect_tiers if s.get("risk_tier") == "CRITICAL"]),
            "cctv_encounters": len(cctv_meetings),
            "nocturnal_anomalies": len(noc_calls)
        },
        "suspect_leaderboard": scores,
        "suspect_tiers": suspect_tiers,
        "crime_rings": crime_rings,
        "cctv_meetings": cctv_meetings,
        "financial_intelligence": financial_data,
        "nocturnal_anomalies": nocturnal_data,
        "alerts": alerts
    }
    
    export_filepath = os.path.join(output_folder, "intelligence_export.json")
    with open(export_filepath, "w", encoding="utf-8") as f:
        json.dump(intelligence_export, f, indent=2, default=str)
    print(f"[OK] Intelligence Export JSON saved to: {os.path.abspath(export_filepath)}")
    
    # 8. Graph Data (Nodes & Edges for React Flow / D3 / Vis.js)
    print("[+] Exporting Graph Network Data...")
    pair_df, _ = engine.get_cdr_summary()
    
    nodes = []
    node_set = set()
    
    # Map suspect names & scores for graph node lookup
    score_map = {s["suspect_name"]: s for s in scores}
    
    for _, row in pair_df.iterrows():
        for name in [row['suspect_1'], row['suspect_2']]:
            if name not in node_set:
                node_set.add(name)
                s_info = score_map.get(name, {})
                nodes.append({
                    "id": name,
                    "label": name,
                    "phone": s_info.get("phone_number", ""),
                    "threat_score": s_info.get("total_threat_score", 0),
                    "cctv_score": s_info.get("cctv_meeting_score", 0),
                    "cdr_score": s_info.get("cdr_network_score", 0)
                })
                
    edges = []
    for _, row in pair_df.iterrows():
        edges.append({
            "source": row['suspect_1'],
            "target": row['suspect_2'],
            "total_calls": int(row['total_calls']),
            "weight": int(row['total_calls'])
        })
        
    graph_export = {
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "nodes": nodes,
        "edges": edges
    }
    
    graph_filepath = os.path.join(output_folder, "graph_data.json")
    with open(graph_filepath, "w", encoding="utf-8") as f:
        json.dump(graph_export, f, indent=2, default=str)
    print(f"[OK] Graph Network Data JSON saved to: {os.path.abspath(graph_filepath)}")

if __name__ == '__main__':
    export_all_to_json(".")
