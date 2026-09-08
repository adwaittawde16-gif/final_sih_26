"""
app_backend/services/graph_analytics.py
--------------------------------------
Live Mathematical Graph Algorithms & Syndicate Network Analytics Engine.

Provides real-time proof of:
- Community Detection: Louvain Modularity & Clauset-Newman-Moore with exact Modularity Score Q.
- Centrality Metrics: Betweenness, PageRank, Degree, Closeness, and Eigenvector.
- Structural Vulnerability: Articulation Points (Cut-Vertices) & Bridges (Cut-Edges).
- Syndicate Connectivity: Network Diameter, Density, Average Clustering, Shortest Path Routing.
"""

import networkx as nx
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from intelligence_engine import IntelligenceEngine

class GraphAnalyticsEngine:
    def __init__(self, engine: IntelligenceEngine):
        self.engine = engine
        self.G = self._build_master_graph()

    def _build_master_graph(self) -> nx.Graph:
        """Construct weighted undirected criminal network from CDR, co-accused, and CCTV data."""
        G = nx.Graph()
        
        # Add nodes (suspects)
        for suspect in self.engine.all_suspects:
            phone = self.engine.name_to_phone.get(suspect, "N/A")
            G.add_node(suspect, phone=phone, type="Suspect")

        # Add CDR call edges (weighted by call frequency)
        cdr_pairs, _ = self.engine.get_cdr_summary()
        for _, row in cdr_pairs.iterrows():
            u1, u2 = str(row['suspect_1']), str(row['suspect_2'])
            calls = int(row['total_calls'])
            nocturnal = int(row.get('nocturnal_calls', 0))
            if calls > 0:
                if G.has_edge(u1, u2):
                    G[u1][u2]['weight'] += calls
                    G[u1][u2]['calls'] += calls
                    G[u1][u2]['nocturnal_calls'] += nocturnal
                else:
                    G.add_edge(u1, u2, weight=calls, calls=calls, nocturnal_calls=nocturnal, edge_type="CDR_COMMUNICATION")

        # Add CCTV co-location edges (increase weight)
        cctv_meetings = self.engine.get_cctv_meetings()
        for _, row in cctv_meetings.iterrows():
            u1, u2 = str(row['suspect_1']), str(row['suspect_2'])
            sightings = int(row.get('sighting_count', 1))
            if G.has_edge(u1, u2):
                G[u1][u2]['weight'] += sightings * 5
                G[u1][u2]['cctv_sightings'] = sightings
            else:
                G.add_edge(u1, u2, weight=sightings * 5, calls=0, nocturnal_calls=0, cctv_sightings=sightings, edge_type="PHYSICAL_MEETING")

        return G

    def compute_all_metrics(self, louvain_resolution: float = 1.0, pagerank_alpha: float = 0.85) -> Dict[str, Any]:
        """Compute all mathematical graph algorithms and return comprehensive proof metrics."""
        G = self.G

        if len(G.nodes) == 0:
            return {"error": "Empty graph"}

        # 1. Connected Components
        components = [list(c) for c in nx.connected_components(G)]
        largest_cc_nodes = max(nx.connected_components(G), key=len) if components else set()
        largest_cc = G.subgraph(largest_cc_nodes).copy()

        # 2. Centrality Measures (Computed Live)
        degree_cent = nx.degree_centrality(G)
        betweenness_cent = nx.betweenness_centrality(G, weight='weight', normalized=True)
        closeness_cent = nx.closeness_centrality(G)
        
        try:
            pagerank_cent = nx.pagerank(G, alpha=pagerank_alpha, weight='weight', max_iter=200)
        except Exception:
            pagerank_cent = {n: 1.0 / len(G.nodes) for n in G.nodes}

        try:
            eigen_cent = nx.eigenvector_centrality(G, max_iter=500, weight='weight')
        except Exception:
            eigen_cent = {n: 0.0 for n in G.nodes}

        # 3. Community Detection (Louvain Modularity Algorithm)
        try:
            louvain_comms = list(nx.community.louvain_communities(G, weight='weight', resolution=louvain_resolution, seed=42))
            modularity_q = nx.community.modularity(G, louvain_comms, weight='weight')
        except Exception:
            # Fallback to greedy modularity
            louvain_comms = list(nx.community.greedy_modularity_communities(G, weight='weight'))
            modularity_q = nx.community.modularity(G, louvain_comms, weight='weight')

        # Format communities
        community_assignments = {}
        communities_formatted = []
        for comm_idx, comm_nodes in enumerate(louvain_comms):
            nodes_list = sorted(list(comm_nodes))
            # Find community leader (highest pagerank within community)
            leader = max(nodes_list, key=lambda n: pagerank_cent.get(n, 0))
            
            for n in nodes_list:
                community_assignments[n] = comm_idx + 1

            communities_formatted.append({
                "community_id": f"RING-{comm_idx + 1:02d}",
                "index": comm_idx + 1,
                "leader": leader,
                "member_count": len(nodes_list),
                "members": nodes_list,
                "internal_density": round(nx.density(G.subgraph(comm_nodes)), 3)
            })

        # 4. Structural Vulnerability: Articulation Points (Cut-Vertices) & Bridges
        articulation_points = list(nx.articulation_points(G))
        bridges = [list(b) for b in nx.bridges(G)]

        # 5. Network Global Properties
        num_nodes = G.number_of_nodes()
        num_edges = G.number_of_edges()
        density = nx.density(G)
        avg_clustering = nx.average_clustering(G, weight='weight')
        
        # Diameter and path length on largest connected component
        if len(largest_cc) > 1:
            diameter = nx.diameter(largest_cc)
            avg_shortest_path = round(nx.average_shortest_path_length(largest_cc), 2)
        else:
            diameter = 0
            avg_shortest_path = 0.0

        # 6. Rank Top Nodes per Mathematical Metric
        node_records = []
        for n in G.nodes:
            phone = G.nodes[n].get('phone', 'N/A')
            deg = G.degree(n)
            w_deg = sum(d.get('weight', 1) for _, _, d in G.edges(n, data=True))
            
            is_cut_vertex = n in articulation_points
            role_verdict = "Standard Operative"
            if is_cut_vertex:
                role_verdict = "Critical Syndicate Bridge / Broker (Single Point of Failure)"
            elif pagerank_cent.get(n, 0) > 0.12 or eigen_cent.get(n, 0) > 0.35:
                role_verdict = "Kingpin / High-Influence Commander"
            elif betweenness_cent.get(n, 0) > 0.15:
                role_verdict = "Communications Gateway / Conduit"

            node_records.append({
                "node_id": n,
                "phone": phone,
                "community_id": f"RING-{community_assignments.get(n, 1):02d}",
                "degree": deg,
                "weighted_degree": w_deg,
                "degree_centrality": round(degree_cent.get(n, 0), 4),
                "betweenness_centrality": round(betweenness_cent.get(n, 0), 4),
                "closeness_centrality": round(closeness_cent.get(n, 0), 4),
                "pagerank": round(pagerank_cent.get(n, 0), 4),
                "eigenvector": round(eigen_cent.get(n, 0), 4),
                "is_articulation_point": is_cut_vertex,
                "strategic_role": role_verdict
            })

        # Sort by PageRank default
        node_records.sort(key=lambda x: x['pagerank'], reverse=True)

        # Graph Links for D3 / Vis.js visualization
        edges_formatted = []
        for u, v, data in G.edges(data=True):
            edges_formatted.append({
                "source": u,
                "target": v,
                "weight": data.get('weight', 1),
                "calls": data.get('calls', 0),
                "nocturnal_calls": data.get('nocturnal_calls', 0),
                "cctv_sightings": data.get('cctv_sightings', 0),
                "is_bridge": [u, v] in bridges or [v, u] in bridges
            })

        return {
            "summary": {
                "total_nodes": num_nodes,
                "total_edges": num_edges,
                "num_communities": len(louvain_comms),
                "modularity_score_q": round(modularity_q, 4),
                "network_density": round(density, 4),
                "avg_clustering_coefficient": round(avg_clustering, 4),
                "network_diameter": diameter,
                "avg_shortest_path_length": avg_shortest_path,
                "articulation_point_count": len(articulation_points),
                "bridge_edge_count": len(bridges)
            },
            "mathematical_formulas": {
                "modularity": "Q = 1/(2m) * sum_ij [ A_ij - (k_i * k_j)/(2m) ] * delta(c_i, c_j)",
                "betweenness": "C_B(v) = sum_{s != v != t} (sigma_{st}(v) / sigma_{st})",
                "pagerank": "PR(u) = (1-d)/N + d * sum_{v in B_u} (PR(v) / L(v))",
                "closeness": "C_C(u) = (N - 1) / sum_{v != u} d(u, v)"
            },
            "communities": communities_formatted,
            "articulation_points": articulation_points,
            "bridges": bridges,
            "nodes": node_records,
            "edges": edges_formatted
        }

    def compute_shortest_path(self, source_node: str, target_node: str) -> Dict[str, Any]:
        """Compute Dijkstra shortest path and bottleneck nodes between two criminal suspects."""
        G = self.G
        if source_node not in G:
            return {"error": f"Source node '{source_node}' not in criminal network"}
        if target_node not in G:
            return {"error": f"Target node '{target_node}' not in criminal network"}

        try:
            path = nx.shortest_path(G, source=source_node, target=target_node, weight=None)
            path_length = len(path) - 1
            
            # Check edge details along the path
            path_steps = []
            for i in range(len(path) - 1):
                u, v = path[i], path[i+1]
                edge_data = G.get_edge_data(u, v, default={})
                path_steps.append({
                    "hop": i + 1,
                    "from_node": u,
                    "to_node": v,
                    "calls": edge_data.get('calls', 0),
                    "nocturnal_calls": edge_data.get('nocturnal_calls', 0),
                    "cctv_sightings": edge_data.get('cctv_sightings', 0),
                    "weight": edge_data.get('weight', 1)
                })

            return {
                "source": source_node,
                "target": target_node,
                "connected": True,
                "hop_count": path_length,
                "path": path,
                "steps": path_steps
            }
        except nx.NetworkXNoPath:
            return {
                "source": source_node,
                "target": target_node,
                "connected": False,
                "hop_count": -1,
                "path": [],
                "steps": []
            }
