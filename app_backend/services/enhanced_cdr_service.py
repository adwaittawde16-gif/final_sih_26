"""
app_backend/services/enhanced_cdr_service.py
----------------------------
Enhanced CDR service with advanced entity extraction, relationship analysis,
suspicious pattern detection, and cross-domain correlation capabilities.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import re
from intelligence_engine import IntelligenceEngine
from app_backend.schemas.cdr import (
    CDRSummaryResponse,
    CDRPairRecord,
    NetworkGraphResponse,
    NetworkNode,
    NetworkEdge
)
import networkx as nx
from typing import List, Dict, Any, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class EnhancedCDRService:
    def __init__(self, engine: IntelligenceEngine = None):
        self.engine = engine if engine else IntelligenceEngine()

    def get_enhanced_cdr_summary(self) -> CDRSummaryResponse:
        """Get enhanced CDR summary with additional metrics."""
        pair_df, raw_df = self.engine.get_cdr_summary()

        # Enhance pair data with advanced metrics
        enhanced_pairs = []
        for _, row in pair_df.iterrows():
            # Calculate advanced metrics
            avg_duration = row['total_duration_min'] / row['total_calls'] if row['total_calls'] > 0 else 0
            nocturnal_ratio = row['nocturnal_calls'] / row['total_calls'] if row['total_calls'] > 0 else 0
            sms_ratio = row['sms_count'] / row['total_calls'] if row['total_calls'] > 0 else 0

            enhanced_record = {
                'suspect_1': row['suspect_1'],
                'suspect_2': row['suspect_2'],
                'total_calls': int(row['total_calls']),
                'total_duration_min': float(row['total_duration_min']),
                'nocturnal_calls': int(row['nocturnal_calls']),
                'sms_count': int(row['sms_count']),
                'incoming_count': int(row['incoming_count']),
                'outgoing_count': int(row['outgoing_count']),
                # Enhanced fields (will be used internally for now)
                '_avg_duration_min': float(avg_duration),
                '_nocturnal_ratio': float(nocturnal_ratio),
                '_sms_ratio': float(sms_ratio)
            }

            enhanced_pairs.append(enhanced_record)

        # Convert back to DataFrame for compatibility
        enhanced_df = pd.DataFrame(enhanced_pairs)

        records = enhanced_df.to_dict(orient='records')
        # Only include original fields for CDRPairRecord compatibility
        original_records = [{
            'suspect_1': r['suspect_1'],
            'suspect_2': r['suspect_2'],
            'total_calls': r['total_calls'],
            'total_duration_min': r['total_duration_min'],
            'nocturnal_calls': r['nocturnal_calls'],
            'sms_count': r['sms_count'],
            'incoming_count': r['incoming_count'],
            'outgoing_count': r['outgoing_count']
        } for r in records]

        pairs = [CDRPairRecord(**r) for r in original_records]
        freq_count = len(pair_df[pair_df['total_calls'] >= 3])

        return CDRSummaryResponse(
            total_cdr_logs=len(raw_df),
            total_interaction_pairs=len(pairs),
            frequent_pairs_count=freq_count,
            pairs=pairs
        )

    def detect_suspicious_patterns(self) -> Dict[str, Any]:
        """Detect suspicious communication patterns in CDR data."""
        _, raw_df = self.engine.get_cdr_summary()

        if raw_df.empty:
            return {"patterns": [], "warnings": []}

        patterns = []
        warnings = []

        # Convert timestamp to datetime for analysis
        raw_df['timestamp_dt'] = pd.to_datetime(raw_df['timestamp'], errors='coerce')
        raw_df = raw_df.dropna(subset=['timestamp_dt'])

        if raw_df.empty:
            return {"patterns": [], "warnings": ["No valid timestamps found"]}

        # 1. Burner phone detection (numbers with very short lifespan)
        burner_patterns = self._detect_burner_numbers(raw_df)
        patterns.extend(burner_patterns)

        # 2. Rapid SIM change detection
        sim_change_patterns = self._detect_rapid_sim_changes(raw_df)
        patterns.extend(sim_change_patterns)

        # 3. Unusual communication timing patterns
        timing_patterns = self._detect_unusual_timing_patterns(raw_df)
        patterns.extend(timing_patterns)

        # 4. One-way communication detection
        one_way_patterns = self._detect_one_way_communication(raw_df)
        patterns.extend(one_way_patterns)

        # 5. Burst communication detection
        burst_patterns = self._detect_burst_communication(raw_df)
        patterns.extend(burst_patterns)

        return {
            "patterns": patterns,
            "warnings": warnings,
            "analysis_timestamp": datetime.now().isoformat()
        }

    def _detect_burner_numbers(self, df: pd.DataFrame) -> List[Dict]:
        """Detect potential burner phones (short-lived numbers)."""
        patterns = []

        # Analyze each number's activity lifespan
        for number_col in ['caller_number', 'receiver_number']:
            if number_col not in df.columns:
                continue

            number_activity = df.groupby(number_col).agg({
                'timestamp_dt': ['min', 'max', 'count']
            }).reset_index()

            number_activity.columns = [number_col, 'first_seen', 'last_seen', 'activity_count']
            number_activity['lifespan_hours'] = (
                number_activity['last_seen'] - number_activity['first_seen']
            ).dt.total_seconds() / 3600

            # Burner criteria: short lifespan (< 24 hours) but multiple communications
            burner_candidates = number_activity[
                (number_activity['lifespan_hours'] < 24) &
                (number_activity['activity_count'] >= 3)
            ]

            for _, row in burner_candidates.iterrows():
                patterns.append({
                    "type": "BURNER_NUMBER_SUSPECT",
                    "number": row[number_col],
                    "first_seen": row['first_seen'].isoformat(),
                    "last_seen": row['last_seen'].isoformat(),
                    "lifespan_hours": round(row['lifespan_hours'], 2),
                    "communication_count": int(row['activity_count']),
                    "risk_level": "HIGH" if row['lifespan_hours'] < 6 else "MEDIUM",
                    "description": f"Number {row[number_col]} active for only {row['lifespan_hours']:.1f} hours with {row['activity_count']} communications"
                })

        return patterns

    def _detect_rapid_sim_changes(self, df: pd.DataFrame) -> List[Dict]:
        """Detect rapid SIM/SIM swapping patterns."""
        patterns = []

        # This would require additional data like IMEI or device_id which we don't have
        # For now, we'll look for rapid number changes associated with same names
        # via the FIR mapping (indicating potential SIM swaps)

        try:
            # Get name-to-number mapping from engine
            name_to_phone = getattr(self.engine, 'name_to_phone', {})
            phone_to_name = getattr(self.engine, 'phone_to_name', {})

            # For each name, check if they have multiple numbers in recent timeframe
            name_number_usage = defaultdict(list)

            for _, row in df.iterrows():
                caller_name = phone_to_name.get(row['caller_number'], row['caller_number'])
                receiver_name = phone_to_name.get(row['receiver_number'], row['receiver_number'])

                name_number_usage[caller_name].append((row['caller_number'], row['timestamp_dt']))
                name_number_usage[receiver_name].append((row['receiver_number'], row['timestamp_dt']))

            for name, number_usage in name_number_usage.items():
                if len(number_usage) < 2:
                    continue

                # Sort by timestamp
                number_usage.sort(key=lambda x: x[1])

                # Check for rapid changes (same name using different numbers quickly)
                for i in range(len(number_usage) - 1):
                    num1, time1 = number_usage[i]
                    num2, time2 = number_usage[i + 1]

                    if num1 != num2:
                        time_diff = abs((time2 - time1).total_seconds()) / 3600  # hours

                        if time_diff < 1:  # Less than 1 hour between number changes
                            patterns.append({
                                "type": "RAPID_SIM_CHANGE",
                                "suspect_name": name,
                                "number_1": num1,
                                "number_2": num2,
                                "time_difference_hours": round(time_diff, 2),
                                "first_seen": time1.isoformat(),
                                "second_seen": time2.isoformat(),
                                "risk_level": "HIGH",
                                "description": f"Suspect {name} changed numbers from {num1} to {num2} within {time_diff:.1f} hours"
                            })

        except Exception as e:
            logger.warning(f"Could not detect rapid SIM changes: {e}")

        return patterns

    def _detect_unusual_timing_patterns(self, df: pd.DataFrame) -> List[Dict]:
        """Detect unusual communication timing patterns."""
        patterns = []

        # Analyze communication by hour of day
        df['hour'] = df['timestamp_dt'].dt.hour
        df['day_of_week'] = df['timestamp_dt'].dt.dayofweek  # 0=Monday, 6=Sunday

        # Check for excessive off-hours communication (10PM-6AM)
        off_hours = df[(df['hour'] >= 22) | (df['hour'] <= 6)]
        off_hours_ratio = len(off_hours) / len(df) if len(df) > 0 else 0

        if off_hours_ratio > 0.4:  # More than 40% off-hours communication
            patterns.append({
                "type": "EXCESSIVE_OFF_HOURS_COMMUNICATION",
                "off_hours_ratio": round(off_hours_ratio, 3),
                "off_hours_count": int(len(off_hours)),
                "total_count": int(len(df)),
                "risk_level": "HIGH" if off_hours_ratio > 0.6 else "MEDIUM",
                "description": f"{off_hours_ratio:.1%} of communications occur during off-hours (10PM-6AM)"
            })

        # Check for weekend communication patterns
        weekend_comm = df[df['day_of_week'] >= 5]  # Saturday=5, Sunday=6
        weekend_ratio = len(weekend_comm) / len(df) if len(df) > 0 else 0

        if weekend_ratio > 0.5:  # More than 50% weekend communication
            patterns.append({
                "type": "EXCESSIVE_WEEKEND_COMMUNICATION",
                "weekend_ratio": round(weekend_ratio, 3),
                "weekend_count": int(len(weekend_comm)),
                "total_count": int(len(df)),
                "risk_level": "MEDIUM",
                "description": f"{weekend_ratio:.1%} of communications occur on weekends"
            })

        return patterns

    def _detect_one_way_communication(self, df: pd.DataFrame) -> List[Dict]:
        """Detect predominantly one-way communication patterns."""
        patterns = []

        # Analyze communication directionality between pairs
        pair_directions = defaultdict(lambda: {'caller_to_receiver': 0, 'receiver_to_caller': 0})

        for _, row in df.iterrows():
            caller = row['caller_number']
            receiver = row['receiver_number']
            pair_key = tuple(sorted([caller, receiver]))

            # Determine direction
            if (caller, receiver) == tuple(sorted([caller, receiver]))[0]:
                # Caller is first in sorted pair
                pair_directions[pair_key]['caller_to_receiver'] += 1
            else:
                pair_directions[pair_key]['receiver_to_caller'] += 1

        for pair_key, directions in pair_directions.items():
            total = directions['caller_to_receiver'] + directions['receiver_to_caller']
            if total < 3:  # Need minimum communications to detect pattern
                continue

            ratio_caller_to_receiver = directions['caller_to_receiver'] / total if total > 0 else 0

            # Check for highly skewed communication (80%+ one way)
            if ratio_caller_to_receiver > 0.8 or ratio_caller_to_receiver < 0.2:
                dominant_direction = "caller_to_receiver" if ratio_caller_to_receiver > 0.8 else "receiver_to_caller"
                percentage = max(ratio_caller_to_receiver, 1 - ratio_caller_to_receiver)

                patterns.append({
                    "type": "ONE_WAY_COMMUNICATION",
                    "number_pair": [pair_key[0], pair_key[1]],
                    "caller_to_receiver_count": directions['caller_to_receiver'],
                    "receiver_to_caller_count": directions['receiver_to_caller'],
                    "dominant_direction": dominant_direction,
                    "dominance_percentage": round(percentage, 3),
                    "total_communications": int(total),
                    "risk_level": "MEDIUM",
                    "description": f"Communication between {pair_key[0]} and {pair_key[1]} is {percentage:.1%} one-way ({dominant_direction})"
                })

        return patterns

    def _detect_burst_communication(self, df: pd.DataFrame) -> List[Dict]:
        """Detect burst communication patterns (sudden spikes in activity)."""
        patterns = []

        # Analyze communication frequency over time for each number
        for number_col in ['caller_number', 'receiver_number']:
            if number_col not in df.columns:
                continue

            # Get time series for each number
            number_time_series = df[[number_col, 'timestamp_dt']].copy()
            number_time_series = number_time_series.sort_values('timestamp_dt')

            for number, group in number_time_series.groupby(number_col):
                if len(group) < 3:  # Need minimum points for burst detection
                    continue

                # Calculate time differences between consecutive communications
                group_sorted = group.sort_values('timestamp_dt')
                time_diffs = group_sorted['timestamp_dt'].diff().dt.total_seconds() / 60  # minutes

                # Look for bursts: multiple communications within short time windows
                # Define burst as 3+ communications within 10 minutes
                burst_threshold_messages = 3
                burst_threshold_minutes = 10

                burst_count = 0
                current_burst_start = None
                messages_in_window = 0

                for idx, (timestamp, diff) in enumerate(zip(group_sorted['timestamp_dt'], time_diffs)):
                    if pd.isna(diff):  # First message in sequence
                        messages_in_window = 1
                        current_burst_start = timestamp
                    elif diff <= burst_threshold_minutes:
                        messages_in_window += 1
                    else:
                        # Window ended, check if it was a burst
                        if messages_in_window >= burst_threshold_messages:
                            burst_count += 1
                        # Reset window
                        messages_in_window = 1
                        current_burst_start = timestamp

                # Check final window
                if messages_in_window >= burst_threshold_messages:
                    burst_count += 1

                if burst_count > 0:
                    patterns.append({
                        "type": "BURST_COMMUNICATION",
                        "number": number,
                        "burst_episodes": int(burst_count),
                        "total_communications": int(len(group)),
                        "risk_level": "MEDIUM" if burst_count > 2 else "LOW",
                        "description": f"Number {number} showed {burst_count} burst episodes (3+ messages within 10 minutes)"
                    })

        return patterns

    def analyze_cell_tower_co_location(self, time_window_minutes: int = 30) -> List[Dict]:
        """Analyze co-location based on cell tower proximity."""
        _, raw_df = self.engine.get_cdr_summary()

        if raw_df.empty or 'cell_tower_location' not in raw_df.columns:
            return []

        # Convert timestamp
        raw_df['timestamp_dt'] = pd.to_datetime(raw_df['timestamp'], errors='coerce')
        raw_df = raw_df.dropna(subset=['timestamp_dt', 'cell_tower_location'])

        if raw_df.empty:
            return []

        co_location_events = []

        # For each unique cell tower, find simultaneous presence
        tower_groups = raw_df.groupby('cell_tower_location')

        for tower_location, group in tower_groups:
            if len(group) < 2:
                continue

            # Sort by timestamp
            group_sorted = group.sort_values('timestamp_dt')

            # Look for numbers present at same tower within time window
            for i in range(len(group_sorted)):
                for j in range(i + 1, len(group_sorted)):
                    row1 = group_sorted.iloc[i]
                    row2 = group_sorted.iloc[j]

                    time_diff = abs((row2['timestamp_dt'] - row1['timestamp_dt']).total_seconds()) / 60  # minutes

                    if time_diff <= time_window_minutes:
                        # Get suspect names
                        name1 = self.engine.phone_to_name.get(row1['caller_number'], row1['caller_number']) \
                               if row1['caller_number'] == row1['caller_number'] else self.engine.phone_to_name.get(row1['receiver_number'], row1['receiver_number'])

                        name2 = self.engine.phone_to_name.get(row2['caller_number'], row2['caller_number']) \
                               if row2['caller_number'] == row2['caller_number'] else self.engine.phone_to_name.get(row2['receiver_number'], row2['receiver_number'])

                        # Actually, let's get the names properly
                        name1 = self.engine.phone_to_name.get(row1['caller_number'], row1['caller_number'])
                        name2 = self.engine.phone_to_name.get(row2['caller_number'], row2['caller_number'])

                        co_location_events.append({
                            "type": "CELL_TOWER_CO_LOCATION",
                            "cell_tower_location": str(tower_location),
                            "suspect_1": name1,
                            "suspect_2": name2,
                            "number_1": row1['caller_number'],
                            "number_2": row2['caller_number'],
                            "timestamp_1": row1['timestamp_dt'].isoformat(),
                            "timestamp_2": row2['timestamp_dt'].isoformat(),
                            "time_difference_minutes": round(time_diff, 2),
                            "risk_level": "HIGH" if time_diff <= 5 else "MEDIUM" if time_diff <= 15 else "LOW",
                            "description": f"Suspects {name1} and {name2} detected at same cell tower ({tower_location}) within {time_diff:.1f} minutes"
                        })

        # Sort by risk level and time proximity
        risk_order = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
        co_location_events.sort(
            key=lambda x: (risk_order.get(x["risk_level"], 0), -x["time_difference_minutes"]),
            reverse=True
        )

        return co_location_events[:50]  # Return top 50 events

    def get_cross_domain_correlation(self) -> Dict[str, Any]:
        """Analyze correlation between CDR and financial transaction data."""
        try:
            # Get CDR data
            _, cdr_raw = self.engine.get_cdr_summary()

            # Get financial data
            fin_df = self.engine.fin_df.copy() if hasattr(self.engine, 'fin_df') else pd.DataFrame()

            if cdr_raw.empty or fin_df.empty:
                return {"correlations": [], "warnings": ["Insufficient data for cross-domain analysis"]}

            correlations = []

            # Convert timestamps
            cdr_raw['timestamp_dt'] = pd.to_datetime(cdr_raw['timestamp'], errors='coerce')
            fin_df['timestamp_dt'] = pd.to_datetime(fin_df['timestamp'], errors='coerce')

            cdr_raw = cdr_raw.dropna(subset=['timestamp_dt'])
            fin_df = fin_df.dropna(subset=['timestamp_dt'])

            if cdr_raw.empty or fin_df.empty:
                return {"correlations": [], "warnings": ["No valid timestamps found in one or both datasets"]}

            # For each financial transaction, look for related communications
            for _, fin_row in fin_df.iterrows():
                fin_time = fin_row['timestamp_dt']
                fin_amount = fin_row['amount_inr']
                fin_account_holder = fin_row['account_holder']

                # Look for communications +/- 2 hours around financial transaction
                time_window = timedelta(hours=2)
                window_start = fin_time - time_window
                window_end = fin_time + time_window

                related_comms = cdr_raw[
                    (cdr_raw['timestamp_dt'] >= window_start) &
                    (cdr_raw['timestamp_dt'] <= window_end)
                ]

                if len(related_comms) > 0:
                    # Try to link via account holder name to phone number
                    account_phone = self.engine.name_to_phone.get(fin_account_holder)

                    if account_phone:
                        # Check if the account holder's number appears in related communications
                        comm_involving_account = related_comms[
                            (related_comms['caller_number'] == account_phone) |
                            (related_comms['receiver_number'] == account_phone)
                        ]

                        if len(comm_involving_account) > 0:
                            correlations.append({
                                "type": "FINANCIAL_COMMUNICATION_LINK",
                                "financial_transaction_id": fin_row['transaction_id'],
                                "account_holder": fin_account_holder,
                                "account_phone": account_phone,
                                "transaction_amount": float(fin_amount),
                                "transaction_time": fin_time.isoformat(),
                                "related_communications_count": int(len(related_comms)),
                                "account_related_communications": int(len(comm_involving_account)),
                                "time_window_hours": 4.0,  # +/- 2 hours
                                "risk_level": "HIGH" if len(comm_involving_account) > 5 else "MEDIUM" if len(comm_involving_account) > 2 else "LOW",
                                "description": f"Financial transaction of ₹{fin_amount:,.2f} by {fin_account_holder} ({account_phone}) had {len(comm_involving_account)} related communications within 2 hours"
                            })

            return {
                "correlations": correlations,
                "analysis_timestamp": datetime.now().isoformat(),
                "total_financial_transactions_analyzed": len(fin_df),
                "total_cdr_records_analyzed": len(cdr_raw)
            }

        except Exception as e:
            logger.error(f"Error in cross-domain correlation: {e}")
            return {"correlations": [], "warnings": [f"Analysis error: {str(e)}"]}

    def get_advanced_network_analysis(self) -> Dict[str, Any]:
        """Get advanced network analysis metrics beyond basic centrality."""
        try:
            pair_df, _ = self.engine.get_cdr_summary()

            if pair_df.empty:
                return {"error": "No CDR pair data available"}

            # Construct NetworkX graph
            G = nx.Graph()
            for _, r in pair_df.iterrows():
                u, v, weight = r['suspect_1'], r['suspect_2'], int(r['total_calls'])
                G.add_edge(u, v, weight=weight)

            if len(G.nodes()) == 0:
                return {"error": "No nodes in graph"}

            # Calculate various centrality measures
            degree_cent = nx.degree_centrality(G)
            between_cent = nx.betweenness_centrality(G)
            closeness_cent = nx.closeness_centrality(G)
            eigenvector_cent = nx.eigenvector_centrality(G, max_iter=1000) if len(G.nodes()) > 1 else {}

            # Calculate clustering coefficient
            clustering = nx.clustering(G)

            # Get threat scores for enrichment
            scores_df = self.engine.calculate_threat_scores()
            score_map = {s["suspect_name"]: s for s in scores_df.to_dict(orient='records')}

            # Build comprehensive node analysis
            nodes_analysis = []
            for node in G.nodes():
                s_info = score_map.get(node, {})

                node_analysis = {
                    "suspect_name": node,
                    "phone_number": s_info.get("phone_number", "N/A"),
                    "threat_score": float(s_info.get("total_threat_score", 0.0)),
                    "degree_centrality": round(float(degree_cent.get(node, 0.0)), 4),
                    "betweenness_centrality": round(float(between_cent.get(node, 0.0)), 4),
                    "closeness_centrality": round(float(closeness_cent.get(node, 0.0)), 4),
                    "eigenvector_centrality": round(float(eigenvector_cent.get(node, 0.0)), 4) if eigenvector_cent else 0.0,
                    "clustering_coefficient": round(float(clustering.get(node, 0.0)), 4),
                    "total_calls": int(sum(data['weight'] for _, _, data in G.edges(node, data=True))),
                    "connected_entities": int(G.degree(node)),
                    "risk_tier": s_info.get("risk_tier", "UNKNOWN")
                }

                nodes_analysis.append(node_analysis)

            # Sort by betweenness centrality (key connectors)
            nodes_analysis.sort(key=lambda x: x["betweenness_centrality"], reverse=True)

            # Network-level metrics
            network_metrics = {
                "total_nodes": len(G.nodes()),
                "total_edges": len(G.edges()),
                "network_density": round(nx.density(G), 4),
                "average_clustering": round(nx.average_clustering(G), 4) if len(G.nodes()) > 2 else 0.0,
                "number_of_connected_components": nx.number_connected_components(G),
                "has_bridges": len(list(nx.bridges(G))) > 0 if len(G.edges()) > 0 else False
            }

            return {
                "nodes_analysis": nodes_analysis[:20],  # Top 20 by betweenness
                "network_metrics": network_metrics,
                "analysis_timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Error in advanced network analysis: {e}")
            return {"error": f"Analysis failed: {str(e)}"}

# Convenience functions for backward compatibility
def get_enhanced_cdr_summary(engine: IntelligenceEngine = None) -> CDRSummaryResponse:
    service = EnhancedCDRService(engine)
    return service.get_enhanced_cdr_summary()

def detect_suspicious_patterns(engine: IntelligenceEngine = None) -> Dict[str, Any]:
    service = EnhancedCDRService(engine)
    return service.detect_suspicious_patterns()

def analyze_cell_tower_co_location(engine: IntelligenceEngine = None, time_window_minutes: int = 30) -> List[Dict]:
    service = EnhancedCDRService(engine)
    return service.analyze_cell_tower_co_location(time_window_minutes)

def get_cross_domain_correlation(engine: IntelligenceEngine = None) -> Dict[str, Any]:
    service = EnhancedCDRService(engine)
    return service.get_cross_domain_correlation()

def get_advanced_network_analysis(engine: IntelligenceEngine = None) -> Dict[str, Any]:
    service = EnhancedCDRService(engine)
    return service.get_advanced_network_analysis()