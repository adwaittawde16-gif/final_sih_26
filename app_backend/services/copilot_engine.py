"""
app_backend/services/copilot_engine.py
--------------------------------------
Contextual Police Intelligence Copilot & Natural Language Query Engine.

Translates natural language questions from investigating officers into structured
queries across CDRs, CCTV logs, Financial transactions, FIRs, and Graph Analytics.
"""

import re
import difflib
from typing import Dict, Any, List, Optional
from intelligence_engine import IntelligenceEngine
from app_backend.services.graph_analytics import GraphAnalyticsEngine
from app_backend.services.anomaly_engine import StatisticalAnomalyEngine
from app_backend.services.explainability_engine import ExplainabilityEngine

class IntelligenceCopilot:
    def __init__(self, engine: IntelligenceEngine):
        self.engine = engine
        self.graph_engine = GraphAnalyticsEngine(engine)
        self.anomaly_engine = StatisticalAnomalyEngine(engine)
        self.xai_engine = ExplainabilityEngine(engine)

    def _resolve_suspect_name(self, text: str) -> Optional[str]:
        """Fuzzy match suspect name mentioned in query text."""
        text_lower = text.lower()
        # Direct substring match
        for s in self.engine.all_suspects:
            if s.lower() in text_lower or text_lower in s.lower():
                return s
            parts = s.replace("Md.", "").replace("Mr.", "").strip().split()
            if len(parts) >= 2 and (" ".join(parts).lower() in text_lower):
                return s

        # Fuzzy sequence matcher
        best_name = None
        best_score = 0.0
        words = text.split()
        for i in range(len(words)):
            for j in range(i + 1, min(i + 4, len(words) + 1)):
                phrase = " ".join(words[i:j]).lower()
                for s in self.engine.all_suspects:
                    score = difflib.SequenceMatcher(None, phrase, s.lower()).ratio()
                    if score > 0.75 and score > best_score:
                        best_score = score
                        best_name = s
        return best_name

    def query(self, prompt: str) -> Dict[str, Any]:
        """Process natural language intelligence question and return grounded police briefing."""
        q = prompt.strip().lower()
        resolved_suspect = self._resolve_suspect_name(prompt)

        # Intent 1: Explain threat score / Why flagged
        if any(w in q for w in ["why", "explain", "reason", "flagged", "threat score", "score breakdown"]) and resolved_suspect:
            xai_res = self.xai_engine.explain_suspect_flag(resolved_suspect)
            total = xai_res.get("total_threat_score", 0)
            tier = xai_res.get("threat_tier", "MODERATE")
            features = xai_res.get("feature_attribution", [])
            top_feature = max(features, key=lambda f: f.get("score_contribution", 0)) if features else None

            response_text = (
                f"**Intelligence Briefing for {resolved_suspect}:**\n"
                f"- **Composite Threat Score:** {total}/100 ({tier})\n"
                f"- **Primary Driver:** {top_feature['feature_name'] if top_feature else 'Multi-source signals'} "
                f"(contributed {top_feature['score_contribution'] if top_feature else 0} pts, "
                f"{top_feature['percentage_influence'] if top_feature else 0}% of threat profile).\n"
                f"- **Operational Summary:** {xai_res.get('primary_verdict', '')}\n\n"
                f"**Statutory Chargeability:** {xai_res.get('statutory_chargeability', '')}"
            )
            return {
                "intent": "EXPLAIN_THREAT_SCORE",
                "suspect": resolved_suspect,
                "answer_markdown": response_text,
                "evidence_items": xai_res.get("forensic_evidence_trail", []),
                "action_link": f"/explainability?suspect={resolved_suspect}",
                "action_label": f"Open XAI Simulator for {resolved_suspect}",
                "suggested_queries": [
                    f"What is the criminal history of {resolved_suspect}?",
                    f"Show nocturnal call records for {resolved_suspect}",
                    f"Who are the associates of {resolved_suspect}?"
                ]
            }

        # Intent 2: Shortest path / Connection between two suspects
        if any(w in q for w in ["connection", "link", "path", "connect", "between", "know each other"]):
            # Look for 2 suspects
            found_suspects = []
            for s in self.engine.all_suspects:
                if s.lower() in q:
                    found_suspects.append(s)
            if len(found_suspects) >= 2:
                s1, s2 = found_suspects[0], found_suspects[1]
                path_res = self.graph_engine.compute_shortest_path(s1, s2)
                if path_res.get("path_found"):
                    hops = path_res.get("hop_count")
                    path_str = " ➔ ".join(path_res.get("path", []))
                    answer = (
                        f"**Confirmed Intelligence Nexus Identified:**\n"
                        f"- **Shortest Graph Distance:** {hops} hop(s)\n"
                        f"- **Conspiracy Route:** {path_str}\n"
                        f"- **Evidence Trail:** {len(path_res.get('evidence_trail', []))} cross-domain interactions logged between nodes."
                    )
                else:
                    answer = f"No direct or multi-hop path found between **{s1}** and **{s2}** in the active CDR/CCTV graph component."
                return {
                    "intent": "GRAPH_SHORTEST_PATH",
                    "suspect": f"{s1} & {s2}",
                    "answer_markdown": answer,
                    "evidence_items": path_res.get("evidence_trail", []),
                    "action_link": "/graph-algorithms",
                    "action_label": "View Live Graph Topology Canvas",
                    "suggested_queries": [
                        f"Explain threat score of {s1}",
                        f"Explain threat score of {s2}",
                        "Show all detected crime syndicates"
                    ]
                }

        # Intent 3: Nocturnal / Late night anomalies
        if any(w in q for w in ["nocturnal", "night", "late hour", "midnight", "00:00", "02:00", "03:00"]):
            anom = self.anomaly_engine.detect_nocturnal_telecom_anomalies(z_threshold=2.0)
            anom_list = anom.get("anomalies", [])
            top_anoms = "\n".join([
                f"- **{a['suspect_name']}**: {a['nocturnal_calls']} nocturnal calls ({a['nocturnal_ratio']*100:.1f}% ratio) · **Z-Score = {a['z_score']}** (p < {a['p_value']:.4f})"
                for a in anom_list[:5]
            ])
            answer = (
                f"**Gaussian Z-Score Nocturnal Telecom Intercepts (Z > 2.0σ):**\n"
                f"Found **{len(anom_list)} suspects** with statistically significant late-night burstiness (00:00–05:00 IST):\n\n"
                f"{top_anoms}\n\n"
                f"*Population Baseline: Mean = {anom.get('population_stats', {}).get('mean_ratio', 0)*100:.1f}%, Std = {anom.get('population_stats', {}).get('std_ratio', 0)*100:.1f}%*"
            )
            return {
                "intent": "NOCTURNAL_ANOMALY",
                "answer_markdown": answer,
                "evidence_items": anom_list[:5],
                "action_link": "/anomaly-detection",
                "action_label": "Open Statistical Anomaly Engine",
                "suggested_queries": [
                    "Detect financial Hawala smurfing anomalies",
                    "Find spatiotemporal CCTV physical clusters",
                    "Show top threat targets"
                ]
            }

        # Intent 4: Financial smurfing / Hawala / Money
        if any(w in q for w in ["financial", "smurfing", "hawala", "money", "upi", "structuring", "transaction", "mule"]):
            fin_anom = self.anomaly_engine.detect_financial_smurfing_anomalies()
            anoms = fin_anom.get("anomalies", [])
            top_fin = "\n".join([
                f"- **{a['suspect_name']}**: ₹{a.get('amount', 0):,} transferred to *{a.get('receiver', 'Mule Account')}* · Flag: `{a.get('anomaly_type', 'SMURFING_OUTLIER')}`"
                for a in anoms[:5]
            ])
            answer = (
                f"**Financial Intelligence & Hawala Structuring Audit:**\n"
                f"Identified **{len(anoms)} suspicious transactions** matching smurfing velocity or IQR outlier whiskers (Q3 + 1.5×IQR):\n\n"
                f"{top_fin if top_fin else 'No outlier anomalies detected above threshold.'}\n\n"
                f"*Regulatory Threshold Rule: Automated flags trigger on sub-threshold transfers (₹45k–₹50k and ₹1.9L–₹2.0L)*"
            )
            return {
                "intent": "FINANCIAL_ANOMALY",
                "answer_markdown": answer,
                "evidence_items": anoms[:5],
                "action_link": "/financial-intelligence",
                "action_label": "View Financial Intelligence & Money Flow",
                "suggested_queries": [
                    "Show nocturnal call anomalies",
                    "Show all crime syndicates",
                    "Run 50k scalability benchmark"
                ]
            }

        # Intent 5: CCTV / Physical Spatiotemporal Cluster Analysis
        if any(w in q for w in ["cctv", "camera", "physical", "meeting", "location", "cluster", "co-location", "spatiotemporal", "haversine", "rendezvous", "dadar", "byculla", "kurla", "andheri", "sighting"]):
            cctv_res = self.anomaly_engine.detect_spatiotemporal_cctv_clusters()
            clusters = cctv_res.get("clusters", [])
            total_clusters = cctv_res.get("total_clusters", len(clusters))
            top_clusters_text = "\n".join([
                f"- **Cluster #{i+1}** @ *{c.get('location', 'Unknown Location')}*: "
                f"{c.get('member_count', 0)} suspects · "
                f"Avg proximity **{c.get('avg_distance_meters', 0):.0f}m** · "
                f"Haversine max radius = {c.get('max_radius_meters', 0):.0f}m"
                for i, c in enumerate(clusters[:5])
            ])
            member_rollup = ""
            if clusters:
                all_members = []
                for c in clusters[:3]:
                    all_members.extend(c.get("members", [])[:3])
                member_rollup = f"\n\n**Top Suspects in Physical Clusters:** {', '.join(set(all_members[:8]))}"

            answer = (
                f"**Spatiotemporal CCTV Co-Location Cluster Analysis (Haversine Distance):**\n"
                f"Identified **{total_clusters} physical rendezvous clusters** from municipal CCTV logs:\n\n"
                f"{top_clusters_text if top_clusters_text else 'No significant clusters detected above threshold.'}"
                f"{member_rollup}\n\n"
                f"*Algorithm: Haversine formula — clusters flagged where suspects are within 50m of each other at overlapping timestamps.*"
            )
            return {
                "intent": "SPATIOTEMPORAL_CCTV",
                "answer_markdown": answer,
                "evidence_items": clusters[:5],
                "action_link": "/cctv-colocation",
                "action_label": "View CCTV Co-Location Intelligence Map",
                "suggested_queries": [
                    "Detect financial Hawala smurfing anomalies",
                    "Show nocturnal call anomalies with Z > 2.0",
                    "Show all active crime syndicates",
                ]
            }

        # Intent 6: Specific suspect dossier lookup
        if resolved_suspect:
            threats = self.engine.calculate_threat_scores()
            s_row = threats[threats['suspect_name'] == resolved_suspect]
            if not s_row.empty:
                r = s_row.iloc[0]
                tot = float(r.get('total_threat_score', 0))
                phone = str(r.get('phone_number', 'N/A'))
                cctv = float(r.get('cctv_meeting_score', 0))
                cdr = float(r.get('cdr_network_score', 0))
                fir = float(r.get('fir_severity_score', 0))
                answer = (
                    f"**Subject Dossier Summary for {resolved_suspect}:**\n"
                    f"- **Phone Number:** `{phone}`\n"
                    f"- **Composite Threat Index:** **{tot:.1f} / 100**\n"
                    f"- **CCTV Physical Meeting Score:** {cctv:.1f} / 30.0\n"
                    f"- **CDR Interaction Score:** {cdr:.1f} / 20.0\n"
                    f"- **FIR Statutory Section Score:** {fir:.1f} / 15.0\n\n"
                    f"Subject is actively indexed in the Crime Analysis Master Database."
                )
                return {
                    "intent": "SUSPECT_DOSSIER_SUMMARY",
                    "suspect": resolved_suspect,
                    "answer_markdown": answer,
                    "evidence_items": [],
                    "action_link": f"/dossiers/{resolved_suspect}",
                    "action_label": f"Open 360° Dossier for {resolved_suspect}",
                    "suggested_queries": [
                        f"Why was {resolved_suspect} flagged by AI?",
                        f"Show nocturnal calls of {resolved_suspect}",
                        "Show top 10 critical priority suspects"
                    ]
                }

        # Default: General Intelligence Briefing / Top Targets
        threats = self.engine.calculate_threat_scores().sort_values(by='total_threat_score', ascending=False)
        top5 = threats.head(5)
        top_list = "\n".join([
            f"1. **{row['suspect_name']}** — Threat Score: **{row['total_threat_score']:.1f}/100** (`{row['phone_number']}`)"
            for _, row in top5.iterrows()
        ])
        answer = (
            f"**Brihanmumbai Police Intelligence Overview:**\n"
            f"Currently tracking **{len(threats)} suspects** across 8 intelligence modalities.\n\n"
            f"**Top 5 Priority Review Queue:**\n"
            f"{top_list}\n\n"
            f"You can ask me to explain any suspect's score, calculate network paths, detect nocturnal call bursts, or inspect crime syndicates."
        )
        return {
            "intent": "GENERAL_OVERVIEW",
            "answer_markdown": answer,
            "evidence_items": [],
            "action_link": "/threat-index",
            "action_label": "View Full Threat Index",
            "suggested_queries": [
                "Why was Md. Ranbir Bhalla flagged?",
                "Show nocturnal call anomalies with Z > 2.0",
                "Find connection between Md. Advik Golla and Md. Ranbir Bhalla",
                "Detect financial Hawala smurfing patterns"
            ]
        }
