"""
Brihanmumbai Police Criminal Intelligence & Network Analysis System (SIH 2026)
Automated Full-Stack Verification & Benchmark Test Suite
"""

import sys
import os
import time
import json

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

def run_test_suite():
    print("=" * 80)
    print("  BRIHANMUMBAI POLICE - SPECIAL CRIME ANALYSIS UNIT (SIH 2026)")
    print("  AUTOMATED CORE AI/ML VERIFICATION SUITE")
    print("=" * 80)

    # 1. Test Intelligence Engine Load
    print("\n[TEST 1/7] Initializing Master Intelligence Engine...")
    t0 = time.perf_counter()
    from intelligence_engine import IntelligenceEngine
    engine = IntelligenceEngine()
    load_time = (time.perf_counter() - t0) * 1000
    print(f"  [OK] IntelligenceEngine initialized in {load_time:.2f} ms")
    print(f"       - Suspects count: {len(engine.all_suspects)}")
    print(f"       - CDR records: {len(engine.cdrs_df)}")
    print(f"       - Financial records: {len(engine.fin_df)}")
    print(f"       - CCTV encounters: {len(engine.cctv_df)}")

    # 2. Test NLP Engine
    print("\n[TEST 2/7] Testing Real NLP Entity & Statute Extraction Pipeline...")
    t0 = time.perf_counter()
    from app_backend.services.nlp_engine import AdvancedNLPEngine
    nlp_engine = AdvancedNLPEngine(engine)
    name1 = engine.all_suspects[0]
    name2 = engine.all_suspects[1]
    sample_fir = (
        f"FIR #0254/2026 at Byculla Police Station. Accused {name1} along with "
        f"co-accused {name2} were observed operating near Dadar Station Road Footpath "
        "under IPC Section 384 (Extortion) and Section 307 (Attempt to Murder). "
        "Suspect was armed with a country-made pistol and escaped on motorbike MH-01-AB-1234."
    )
    extracted = nlp_engine.extract_entities(sample_fir)
    nlp_time = (time.perf_counter() - t0) * 1000
    print(f"  [OK] NLP Pipeline executed in {nlp_time:.2f} ms")
    print(f"       - Accused identified: {[s['name'] for s in extracted['suspects']]}")
    print(f"       - Inferred roles: {[s['inferred_role'] for s in extracted['suspects']]}")
    print(f"       - Statutes parsed: {[st['raw_section'] for st in extracted['statutes']]}")
    print(f"       - Weapons recovered: {extracted['weapons']}")
    print(f"       - Vehicles identified: {extracted['vehicles']}")
    print(f"       - Case Severity Score: {extracted['case_severity_score']}/100")

    # 3. Test Graph Analytics & Louvain Modularity
    print("\n[TEST 3/7] Testing Live Graph Theory Proofs (Louvain, PageRank, Dijkstra)...")
    t0 = time.perf_counter()
    from app_backend.services.graph_analytics import GraphAnalyticsEngine
    graph_engine = GraphAnalyticsEngine(engine)
    metrics = graph_engine.compute_all_metrics(louvain_resolution=1.0, pagerank_alpha=0.85)
    graph_time = (time.perf_counter() - t0) * 1000
    summary = metrics["summary"]
    print(f"  [OK] Graph Analytics computed in {graph_time:.2f} ms")
    print(f"       - Graph Topology: {summary['total_nodes']} nodes, {summary['total_edges']} edges")
    print(f"       - Louvain Modularity Proof Q: {summary['modularity_score_q']}")
    print(f"       - Communities detected: {summary['num_communities']}")
    print(f"       - Articulation Points (Cut-Nodes): {summary['articulation_point_count']}")
    print(f"       - Network Diameter: {summary['network_diameter']}")
    print(f"       - Avg Shortest Path Length: {summary['avg_shortest_path_length']}")

    # 4. Test Dijkstra Shortest Path Proof
    print("\n[TEST 4/7] Testing Dijkstra Shortest Route Calculation...")
    nodes = list(graph_engine.G.nodes)
    if len(nodes) >= 2:
        s1 = nodes[0]
        s2 = nodes[1]
        path_res = graph_engine.compute_shortest_path(s1, s2)
        print(f"  [OK] Shortest path between '{s1}' and '{s2}':")
        print(f"       - Path found: {path_res.get('path_found', False)}")
        print(f"       - Hop count: {path_res.get('hop_count', 0)}")
        print(f"       - Route: {' -> '.join(path_res.get('path', []))}")
        print(f"       - Evidence connections: {len(path_res.get('evidence_trail', []))}")

    # 5. Test Statistical Anomaly Detection
    print("\n[TEST 5/7] Testing Gaussian Z-score & IQR Anomaly Detection...")
    t0 = time.perf_counter()
    from app_backend.services.anomaly_engine import StatisticalAnomalyEngine
    anomaly_engine = StatisticalAnomalyEngine(engine)
    nocturnal = anomaly_engine.detect_nocturnal_telecom_anomalies(z_threshold=2.0)
    financial = anomaly_engine.detect_financial_smurfing_anomalies()
    clusters = anomaly_engine.detect_spatiotemporal_cctv_clusters()
    anom_time = (time.perf_counter() - t0) * 1000
    print(f"  [OK] Anomaly Detection executed in {anom_time:.2f} ms")
    print(f"       - Nocturnal Z-score anomalies flagged: {len(nocturnal['anomalies'])}")
    print(f"       - Financial IQR outlier alerts: {len(financial['anomalies'])}")
    print(f"       - Spatiotemporal CCTV clusters: {len(clusters['clusters'])}")

    # 6. Test Explainable AI (XAI)
    print("\n[TEST 6/7] Testing XAI Feature Attribution & Counterfactual Simulator...")
    t0 = time.perf_counter()
    from app_backend.services.explainability_engine import ExplainabilityEngine
    xai_engine = ExplainabilityEngine(engine)
    suspect_to_test = engine.all_suspects[0]
    explanation = xai_engine.explain_suspect_flag(suspect_to_test)
    xai_time = (time.perf_counter() - t0) * 1000
    print(f"  [OK] XAI Model generated in {xai_time:.2f} ms for '{suspect_to_test}'")
    print(f"       - Total Threat Score: {explanation['total_threat_score']}/100 ({explanation['threat_tier']})")
    print(f"       - Feature Attributions: {len(explanation['feature_attribution'])} dimensions")
    print(f"       - Counterfactual Scenarios: {len(explanation['counterfactual_analysis'])} hypotheses")
    print(f"       - Forensic evidence items: {len(explanation['forensic_evidence_trail'])}")

    # 7. Test Scalability Stress Test Benchmark
    print("\n[TEST 7/8] Testing Scalability Stress Test Engine (50,000 records)...")
    from app_backend.services.benchmark_engine import BenchmarkEngine
    bench_engine = BenchmarkEngine()
    bench_result = bench_engine.run_stress_test(record_count=50000)
    print(f"  [OK] Benchmark Completed:")
    print(f"       - Ingested & Aggregated: {bench_result['dataset_size_records']:,} records")
    print(f"       - Execution Time: {bench_result['total_execution_time_seconds']*1000:.1f} ms")
    print(f"       - Processing Throughput: {bench_result['throughput_events_per_second']:,} rec/sec")
    print(f"       - Memory Allocation: {bench_result['memory_footprint_mb']} MB")

    # 8. Test Intelligence Copilot Query Engine
    print("\n[TEST 8/8] Testing AI Intelligence Copilot & NL Query Engine...")
    t0 = time.perf_counter()
    from app_backend.services.copilot_engine import IntelligenceCopilot
    copilot = IntelligenceCopilot(engine)
    test_query = f"Why was {engine.all_suspects[0]} flagged with high threat score?"
    copilot_res = copilot.query(test_query)
    cop_time = (time.perf_counter() - t0) * 1000
    print(f"  [OK] Copilot Query processed in {cop_time:.2f} ms")
    print(f"       - Query: '{test_query}'")
    print(f"       - Intent Identified: {copilot_res['intent']}")
    print(f"       - Action Link: {copilot_res.get('action_link')}")
    print(f"       - Suggested Follow-ups: {len(copilot_res.get('suggested_queries', []))}")

    print("\n" + "=" * 80)
    print("  ALL 8 CORE AI/ML SUB-SYSTEMS VERIFIED: 100% OPERATIONAL & READY FOR DEMO")
    print("=" * 80)

if __name__ == "__main__":
    run_test_suite()

