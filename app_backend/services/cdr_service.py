"""
app_backend/services/cdr_service.py
--------------------------
Calculates CDR call interaction summary, NetworkX Degree & Betweenness Centrality metrics,
and entity threat score breakdowns for key influencer analysis.
"""

import networkx as nx
from intelligence_engine import IntelligenceEngine
from threat_classifier import ThreatClassifier
from app_backend.schemas.cdr import (
    CDRSummaryResponse,
    CDRPairRecord,
    NetworkGraphResponse,
    NetworkNode,
    NetworkEdge
)

def get_cdr_summary(engine: IntelligenceEngine) -> CDRSummaryResponse:
    pair_df, raw = engine.get_cdr_summary()
    records = pair_df.to_dict(orient='records')
    pairs = [CDRPairRecord(**r) for r in records]
    freq_count = len(pair_df[pair_df['total_calls'] >= 3])
    
    return CDRSummaryResponse(
        total_cdr_logs=len(raw),
        total_interaction_pairs=len(pairs),
        frequent_pairs_count=freq_count,
        pairs=pairs
    )

def get_network_graph(engine: IntelligenceEngine) -> NetworkGraphResponse:
    pair_df, _ = engine.get_cdr_summary()
    scores_df = engine.calculate_threat_scores()
    score_map = {s["suspect_name"]: s for s in scores_df.to_dict(orient='records')}
    
    classifier = ThreatClassifier(engine)
    tier_df = classifier.classify_suspect_risks()
    tier_map = dict(zip(tier_df['suspect_name'], tier_df['risk_tier']))

    # Construct NetworkX Graph for Centrality Calculations
    G = nx.Graph()
    for _, r in pair_df.iterrows():
        u, v, weight = r['suspect_1'], r['suspect_2'], int(r['total_calls'])
        G.add_edge(u, v, weight=weight)
        
    degree_cent = nx.degree_centrality(G) if len(G) > 0 else {}
    between_cent = nx.betweenness_centrality(G) if len(G) > 0 else {}

    # Fetch Gang Map
    from app_backend.services.gang_service import get_all_gangs
    gangs_resp = get_all_gangs(engine)
    entity_gang_map = {}
    for gang in gangs_resp.gangs:
        for m in gang.members:
            entity_gang_map[m] = (gang.gang_id, gang.name)

    nodes = []
    for node_name in G.nodes():
        s_info = score_map.get(node_name, {})
        d_cent = round(float(degree_cent.get(node_name, 0.0)), 4)
        b_cent = round(float(between_cent.get(node_name, 0.0)), 4)
        t_score = float(s_info.get("total_threat_score", 0.0))
        
        # Calculate connected call count
        deg = G.degree(node_name)
        total_calls = sum(data['weight'] for _, _, data in G.edges(node_name, data=True))
        
        g_id, g_name = entity_gang_map.get(node_name, ("GANG-01", "Gang 1"))

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
            risk_tier=tier_map.get(node_name, "MODERATE"),
            gang_id=g_id,
            gang_name=g_name
        ))

    nodes.sort(key=lambda n: (n.betweenness_centrality, n.threat_score), reverse=True)
    top_influencers = nodes[:5]

    edges = [
        NetworkEdge(
            source=str(r['suspect_1']),
            target=str(r['suspect_2']),
            total_calls=int(r['total_calls']),
            weight=int(r['total_calls'])
        )
        for _, r in pair_df.iterrows()
    ]

    return NetworkGraphResponse(
        total_nodes=len(nodes),
        total_edges=len(edges),
        top_key_influencers=top_influencers,
        nodes=nodes,
        edges=edges
    )
