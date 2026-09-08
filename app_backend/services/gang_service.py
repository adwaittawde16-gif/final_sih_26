"""
app_backend/services/gang_service.py
------------------------------------
Community detection, gang metadata aggregation, and investigator gang management service.
Performs graph modularity clustering and names candidate gangs Gang 1, Gang 2, Gang 3, etc.
"""

import os
import json
from typing import List, Optional, Dict, Any
import networkx as nx
from networkx.algorithms import community as nx_comm
from intelligence_engine import IntelligenceEngine
from threat_classifier import ThreatClassifier
from app_backend.schemas.gangs import (
    GangRecord,
    GangListResponse,
    GangSubGraphResponse
)
from app_backend.schemas.cdr import NetworkNode, NetworkEdge

# In-memory store & file path
STORE_FILE = os.path.join(os.path.dirname(__file__), "gang_store.json")

class GangManager:
    def __init__(self):
        self.overrides = self.load_store()

    def load_store(self) -> dict:
        if os.path.exists(STORE_FILE):
            try:
                with open(STORE_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "status_overrides": {},    # gang_id -> status
            "name_overrides": {},      # gang_id -> custom_name
            "merged_gangs": {},       # secondary_gang_id -> primary_gang_id
            "entity_gang_overrides": {} # entity_name -> gang_id
        }

    def save_store(self):
        try:
            with open(STORE_FILE, "w", encoding="utf-8") as f:
                json.dump(self.overrides, f, indent=2)
        except Exception as e:
            print("[ERROR] Failed to save gang_store.json:", e)

    def detect_gangs(self, engine: IntelligenceEngine) -> List[GangRecord]:
        pair_df, _ = engine.get_cdr_summary()
        scores_df = engine.calculate_threat_scores()
        score_map = {s["suspect_name"]: s for s in scores_df.to_dict(orient='records')}

        # Build Graph
        G = nx.Graph()
        for _, r in pair_df.iterrows():
            u, v, w = r['suspect_1'], r['suspect_2'], int(r['total_calls'])
            G.add_edge(u, v, weight=w)

        # Modularity Community Detection
        raw_communities = list(nx_comm.greedy_modularity_communities(G)) if len(G) > 0 else []

        gang_records = []
        for idx, comm in enumerate(raw_communities):
            raw_id = f"GANG-{idx + 1:02d}"
            auto_name = f"Gang {idx + 1}"
            
            # Apply name & status overrides
            name = self.overrides["name_overrides"].get(raw_id, auto_name)
            status = self.overrides["status_overrides"].get(raw_id, "CANDIDATE")

            # Check if merged
            if raw_id in self.overrides["merged_gangs"]:
                continue

            members = list(comm)
            
            # Include manually tagged entities
            for ent, target_gid in self.overrides["entity_gang_overrides"].items():
                if target_gid == raw_id and ent not in members:
                    members.append(ent)

            # Find Leader (highest threat score in cluster)
            cluster_scores = [
                (m, score_map.get(m, {}).get("total_threat_score", 0.0), score_map.get(m, {}).get("phone_number", ""))
                for m in members
            ]
            cluster_scores.sort(key=lambda x: x[1], reverse=True)
            
            leader_name = cluster_scores[0][0] if cluster_scores else "N/A"
            leader_phone = cluster_scores[0][2] if cluster_scores else ""

            # Calculate Aggregate Threat Score (Weighted Average + Max)
            threat_values = [x[1] for x in cluster_scores if x[1] > 0]
            avg_threat = sum(threat_values) / len(threat_values) if threat_values else 0.0
            max_threat = max(threat_values) if threat_values else 0.0
            agg_score = round((0.6 * max_threat) + (0.4 * avg_threat), 1)

            gang_records.append(GangRecord(
                gang_id=raw_id,
                name=name,
                status=status,
                member_count=len(members),
                members=members,
                ring_leader=leader_name,
                leader_phone=leader_phone,
                aggregate_threat_score=agg_score,
                primary_locations=["Mumbai Central", "Byculla", "Nagpada"],
                date_first_detected="07 SEP 2026"
            ))

        gang_records.sort(key=lambda g: g.aggregate_threat_score, reverse=True)
        return gang_records

_GANG_MANAGER = GangManager()

def get_gang_manager() -> GangManager:
    return _GANG_MANAGER

def get_all_gangs(engine: IntelligenceEngine) -> GangListResponse:
    manager = get_gang_manager()
    gangs = manager.detect_gangs(engine)
    
    confirmed = len([g for g in gangs if g.status == "CONFIRMED"])
    candidate = len([g for g in gangs if g.status == "CANDIDATE"])
    dismissed = len([g for g in gangs if g.status == "DISMISSED"])

    return GangListResponse(
        total_gangs=len(gangs),
        confirmed_count=confirmed,
        candidate_count=candidate,
        dismissed_count=dismissed,
        gangs=gangs
    )

def get_gang_subgraph(engine: IntelligenceEngine, gang_id: str) -> GangSubGraphResponse:
    manager = get_gang_manager()
    gangs = manager.detect_gangs(engine)
    matched = [g for g in gangs if g.gang_id == gang_id]
    
    if not matched:
        # Fallback to first gang
        matched_gang = gangs[0] if gangs else None
    else:
        matched_gang = matched[0]

    if not matched_gang:
        return GangSubGraphResponse(
            gang_id=gang_id,
            gang_name=f"Gang {gang_id}",
            total_nodes=0,
            total_edges=0,
            nodes=[],
            edges=[]
        )

    member_set = set(matched_gang.members)
    pair_df, _ = engine.get_cdr_summary()
    scores_df = engine.calculate_threat_scores()
    score_map = {s["suspect_name"]: s for s in scores_df.to_dict(orient='records')}

    classifier = ThreatClassifier(engine)
    tier_df = classifier.classify_suspect_risks()
    tier_map = dict(zip(tier_df['suspect_name'], tier_df['risk_tier']))

    # Filter edges where both nodes are in member_set
    sub_edges_df = pair_df[
        pair_df['suspect_1'].isin(member_set) & pair_df['suspect_2'].isin(member_set)
    ]

    G = nx.Graph()
    for _, r in sub_edges_df.iterrows():
        G.add_edge(r['suspect_1'], r['suspect_2'], weight=int(r['total_calls']))

    for m in member_set:
        if m not in G:
            G.add_node(m)

    deg_cent = nx.degree_centrality(G) if len(G) > 0 else {}
    btw_cent = nx.betweenness_centrality(G) if len(G) > 0 else {}

    nodes = []
    for node_name in G.nodes():
        s_info = score_map.get(node_name, {})
        d_cent = round(float(deg_cent.get(node_name, 0.0)), 4)
        b_cent = round(float(btw_cent.get(node_name, 0.0)), 4)
        t_score = float(s_info.get("total_threat_score", 0.0))

        deg = G.degree(node_name)
        total_calls = sum(data.get('weight', 1) for _, _, data in G.edges(node_name, data=True))

        nodes.append(NetworkNode(
            id=str(node_name),
            label=str(node_name),
            phone=str(s_info.get("phone_number", "")),
            threat_score=round(t_score, 1),
            degree_centrality=d_cent,
            betweenness_centrality=b_cent,
            total_calls_count=int(total_calls),
            connected_entities_count=int(deg),
            nocturnal_calls_count=int(s_info.get("cdr_network_score", 0)),
            risk_tier=tier_map.get(node_name, "MODERATE")
        ))

    edges = [
        NetworkEdge(
            source=str(r['suspect_1']),
            target=str(r['suspect_2']),
            total_calls=int(r['total_calls']),
            weight=int(r['total_calls'])
        )
        for _, r in sub_edges_df.iterrows()
    ]

    return GangSubGraphResponse(
        gang_id=matched_gang.gang_id,
        gang_name=matched_gang.name,
        total_nodes=len(nodes),
        total_edges=len(edges),
        nodes=nodes,
        edges=edges
    )

def confirm_gang(gang_id: str):
    manager = get_gang_manager()
    manager.overrides["status_overrides"][gang_id] = "CONFIRMED"
    manager.save_store()

def rename_gang(gang_id: str, new_name: str):
    manager = get_gang_manager()
    manager.overrides["name_overrides"][gang_id] = new_name
    manager.save_store()

def merge_gangs(primary_id: str, secondary_id: str):
    manager = get_gang_manager()
    manager.overrides["merged_gangs"][secondary_id] = primary_id
    manager.save_store()

def dismiss_gang(gang_id: str):
    manager = get_gang_manager()
    manager.overrides["status_overrides"][gang_id] = "DISMISSED"
    manager.save_store()

def tag_entity_gang(entity_name: str, target_gang_id: str):
    manager = get_gang_manager()
    manager.overrides["entity_gang_overrides"][entity_name] = target_gang_id
    manager.save_store()
