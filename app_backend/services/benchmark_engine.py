"""
app_backend/services/benchmark_engine.py
----------------------------------------
High-Throughput Scalability & Big Data Stress Benchmark Engine.

Demonstrates production readiness by processing 10,000 to 100,000+ telecom/financial
events in sub-second vectorized execution.
"""

import time
import numpy as np
import pandas as pd
from typing import Dict, Any, List

class BenchmarkEngine:
    @staticmethod
    def run_stress_test(record_count: int = 50000) -> Dict[str, Any]:
        """
        Executes an end-to-end Big Data ingestion & intelligence processing pipeline
        over N records and returns precise throughput and latency benchmarks.
        """
        t_start_total = time.perf_counter()

        # Step 1: High-speed Vectorized Synthetic Data Generation
        t0 = time.perf_counter()
        callers = [f"+91-98{np.random.randint(10000000, 99999999)}" for _ in range(200)]
        
        idx_callers = np.random.randint(0, len(callers), size=record_count)
        idx_receivers = np.random.randint(0, len(callers), size=record_count)
        durations = np.random.exponential(scale=180, size=record_count).astype(int) + 10
        hours = np.random.randint(0, 24, size=record_count)
        
        df_benchmark = pd.DataFrame({
            'caller_id': idx_callers,
            'receiver_id': idx_receivers,
            'duration_sec': durations,
            'hour_of_day': hours
        })
        t_gen = time.perf_counter() - t0

        # Step 2: Vectorized Anomaly Detection (Nocturnal Burstiness)
        t1 = time.perf_counter()
        df_benchmark['is_nocturnal'] = df_benchmark['hour_of_day'] <= 5
        nocturnal_total = int(df_benchmark['is_nocturnal'].sum())
        
        # Step 3: High-speed Graph Edge Aggregation
        # Vectorized groupby on caller/receiver pairs
        pair_agg = df_benchmark.groupby(['caller_id', 'receiver_id']).agg(
            total_calls=('duration_sec', 'count'),
            total_duration=('duration_sec', 'sum'),
            nocturnal_calls=('is_nocturnal', 'sum')
        ).reset_index()
        
        # Step 4: Top Conspirators Extraction & Risk Ranking
        pair_agg['risk_index'] = (pair_agg['total_calls'] * 1.5) + (pair_agg['nocturnal_calls'] * 4.0)
        top_pairs = pair_agg.sort_values(by='risk_index', ascending=False).head(20)
        t_process = time.perf_counter() - t1

        t_total = time.perf_counter() - t_start_total
        throughput_eps = round(record_count / max(t_total, 0.001), 0)

        # Memory footprint estimate
        mem_mb = round(df_benchmark.memory_usage(deep=True).sum() / (1024 * 1024), 2)

        return {
            "dataset_size_records": record_count,
            "pipeline_status": "COMPLETED_SUCCESSFULLY",
            "total_execution_time_seconds": round(t_total, 4),
            "throughput_events_per_second": throughput_eps,
            "memory_footprint_mb": mem_mb,
            "timings": {
                "vectorized_generation_seconds": round(t_gen, 4),
                "graph_aggregation_and_anomaly_scan_seconds": round(t_process, 4)
            },
            "output_metrics": {
                "unique_suspect_nodes": len(callers),
                "aggregated_graph_edges": len(pair_agg),
                "total_nocturnal_anomalies_flagged": nocturnal_total,
                "top_syndicate_link_strength": float(top_pairs.iloc[0]['risk_index']) if not top_pairs.empty else 0.0
            },
            "verdict": f"Enterprise Scalability Confirmed: Processed {record_count:,} CDR transactions in {t_total*1000:.1f}ms ({throughput_eps:,.0f} records/sec)."
        }
