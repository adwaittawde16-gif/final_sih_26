"""
app_backend/services/enhanced_financial_ingestion.py
---------------------------------------------------
Enhanced Financial Data Ingestion Engine for Multi-Source Financial Intelligence.

Supports parsing, validation, and injection of financial transactions from:
1. Bank Statements (Multiple Bank Formats: SBI, HDFC, ICICI, Axis, etc.)
2. UPI/IMPS/NEFT/RTGS Transaction Logs
3. Payment Gateway Reports (Razorpay, PayU, PhonePe, Google Pay, etc.)
4. Cash Withdrawal/Deposit Records linked to FIRs and Cases
5. Custom Financial Transaction Formats

Performs advanced entity extraction, relationship mapping, and integrates with
PMLA Financial Graph Engine for money laundering detection.
"""

import io
import re
import csv
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple, Union
from intelligence_engine import IntelligenceEngine
from app_backend.services.nlp_engine import AdvancedNLPEngine


class EnhancedFinancialIngestionEngine:
    """Enhanced engine for ingesting financial data from multiple sources."""

    def __init__(self, engine: IntelligenceEngine):
        self.engine = engine
        self.nlp_engine = AdvancedNLPEngine(
            master_suspects=self.engine.all_suspects,
            master_phones=self.engine.name_to_phone
        )

        # Indian Bank Statement Patterns
        self.bank_patterns = {
            'sbi': {
                'date_pattern': r'(\d{2}-\d{2}-\d{4})',
                'amount_pattern': r'[\d,]+\.\d{2}',
                'ref_pattern': r'REF\s*[:\s]*([A-Z0-9]+)',
                'upi_pattern': r'UPI/[A-Z0-9]+'
            },
            'hdfc': {
                'date_pattern': r'(\d{2}/\d{2}/\d{4})',
                'amount_pattern': r'[\d,]+\.\d{2}',
                'ref_pattern': r'Ref\s*No\s*[:\s]*([A-Z0-9]+)',
                'upi_pattern': r'UPI/[A-Z0-9]+'
            },
            'icici': {
                'date_pattern': r'(\d{2}-\d{2}-\d{4})',
                'amount_pattern': r'[\d,]+\.\d{2}',
                'ref_pattern': r'Ref\s*[:\s]*([A-Z0-9]+)',
                'upi_pattern': r'UPI[A-Z0-9]+'
            }
        }

        # UPI/IMPS/NEFT/RTGS Specific Patterns
        self.payment_patterns = {
            'upi': {
                'id_pattern': r'[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}',
                'txn_id': r'[0-9]{12,16}',
                'amount': r'INR\s?[\d,]+\.\d{2}|Rs\.?\s?[\d,]+\.\d{2}'
            },
            'imps': {
                'txn_id': r'[0-9]{12}',
                'amount': r'[\d,]+\.\d{2}',
                'ifsc': r'[A-Z]{4}0[A-Z0-9]{6}'
            },
            'neft': {
                'txn_id': r'[0-9]{16}',
                'amount': r'[\d,]+\.\d{2}',
                'ifsc': r'[A-Z]{4}0[A-Z0-9]{6}'
            },
            'rtgs': {
                'txn_id': r'[0-9]{14}',
                'amount': r'[\d,]+\.\d{2}',
                'ifsc': r'[A-Z]{4}0[A-Z0-9]{6}'
            }
        }

        # Known Payment Gateways in India
        self.payment_gateways = {
            'razorpay': r'rzp_[a-zA-Z0-9]+',
            'payu': r'payu_[a-zA-Z0-9]+',
            'phonepe': r'phonepe_[a-zA-Z0-9]+',
            'googlepay': r'gpay_[a-zA-Z0-9]+',
            'paytm': r'paytm_[a-zA-Z0-9]+',
            'cashfree': r'cf_[a-zA-Z0-9]+',
            'instamojo': r'imo_[a-zA-Z0-9]+'
        }

    def ingest_bank_statement(self, raw_data: str, bank_type: str = 'generic',
                            is_csv: bool = True, fir_link: Optional[str] = None) -> Dict[str, Any]:
        """
        Parse bank statement from various Indian banks and extract financial transactions.

        Args:
            raw_data: Bank statement content (CSV or text)
            bank_type: Type of bank (sbi, hdfc, icici, axis, etc.)
            is_csv: Whether the data is CSV format
            fir_link: Optional FIR number to link transactions to

        Returns:
            Dict with ingestion results and extracted entities/relationships
        """
        try:
            if is_csv:
                df = pd.read_csv(io.StringIO(raw_data.strip()))
            else:
                # Try to parse as structured text first
                df = self._parse_bank_statement_text(raw_data, bank_type)
                if df is None or df.empty:
                    # Fallback to JSON
                    df = pd.read_json(io.StringIO(raw_data.strip()))

        except Exception as e:
            return {"success": False, "error": f"Bank statement parsing failed: {str(e)}"}

        # Standardize column names
        df = self._standardize_bank_columns(df, bank_type)

        # Validate required columns
        required_cols = {'transaction_date', 'amount', 'description'}
        if not required_cols.issubset(set(df.columns)):
            missing = required_cols - set(df.columns)
            return {"success": False,
                   "error": f"Missing required columns. Expected {required_cols}, missing {list(missing)}"}

        # Extract entities and relationships
        entities, relationships = self._extract_bank_entities_relationships(df, bank_type, fir_link)

        # Detect suspicious patterns in bank transactions
        suspicious_patterns = self._detect_bank_suspicious_patterns(df)

        # Update engine data
        try:
            # Convert to standard financial transaction format
            financial_txns = self._convert_to_financial_format(df, bank_type, fir_link)

            # Append to engine's financial dataframe
            if not financial_txns.empty:
                self.engine.fin_df = pd.concat([self.engine.fin_df, financial_txns], ignore_index=True)
                self.engine._threat_scores_cache = None

        except Exception as e:
            return {"success": False, "error": f"Failed to integrate bank data: {str(e)}"}

        return {
            "success": True,
            "source_type": "BANK_STATEMENT",
            "bank_type": bank_type,
            "records_ingested": len(df),
            "entities_extracted": entities,
            "relationships_mapped": relationships,
            "suspicious_patterns_detected": suspicious_patterns,
            "fir_link": fir_link,
            "graph_impact": {
                "active_total_financial_records": len(self.engine.fin_df)
            }
        }

    def ingest_upi_imp_neft_rtgs_logs(self, raw_data: str, payment_type: str,
                                    is_csv: bool = True, fir_link: Optional[str] = None) -> Dict[str, Any]:
        """
        Parse UPI/IMPS/NEFT/RTGS transaction logs.

        Args:
            raw_data: Payment log content
            payment_type: Type of payment (upi, imps, neft, rtgs)
            is_csv: Whether the data is CSV format
            fir_link: Optional FIR number to link transactions to

        Returns:
            Dict with ingestion results
        """
        try:
            if is_csv:
                df = pd.read_csv(io.StringIO(raw_data.strip()))
            else:
                df = self._parse_payment_log_text(raw_data, payment_type)
                if df is None or df.empty:
                    df = pd.read_json(io.StringIO(raw_data.strip()))

        except Exception as e:
            return {"success": False, "error": f"{payment_type.upper()} log parsing failed: {str(e)}"}

        # Validate required columns based on payment type
        required_cols = self._get_payment_required_cols(payment_type)
        if not required_cols.issubset(set(df.columns)):
            missing = required_cols - set(df.columns)
            return {"success": False,
                   "error": f"Missing required columns for {payment_type}. Expected {required_cols}, missing {list(missing)}"}

        # Extract entities and relationships specific to payment type
        entities, relationships = self._extract_payment_entities_relationships(df, payment_type, fir_link)

        # Detect payment-specific suspicious patterns
        suspicious_patterns = self._detect_payment_suspicious_patterns(df, payment_type)

        # Update engine data
        try:
            financial_txns = self._convert_payment_to_financial_format(df, payment_type, fir_link)

            if not financial_txns.empty:
                self.engine.fin_df = pd.concat([self.engine.fin_df, financial_txns], ignore_index=True)
                self.engine._threat_scores_cache = None

        except Exception as e:
            return {"success": False, "error": f"Failed to integrate {payment_type} data: {str(e)}"}

        return {
            "success": True,
            "source_type": f"{payment_type.upper()}_LOGS",
            "payment_type": payment_type,
            "records_ingested": len(df),
            "entities_extracted": entities,
            "relationships_mapped": relationships,
            "suspicious_patterns_detected": suspicious_patterns,
            "fir_link": fir_link,
            "graph_impact": {
                "active_total_financial_records": len(self.engine.fin_df)
            }
        }

    def ingest_payment_gateway_report(self, raw_data: str, gateway: str,
                                    is_csv: bool = True, fir_link: Optional[str] = None) -> Dict[str, Any]:
        """
        Parse payment gateway reports (Razorpay, PayU, PhonePe, etc.).

        Args:
            raw_data: Payment gateway report content
            gateway: Payment gateway name (razorpay, payu, phonepe, etc.)
            is_csv: Whether the data is CSV format
            fir_link: Optional FIR number to link transactions to

        Returns:
            Dict with ingestion results
        """
        try:
            if is_csv:
                df = pd.read_csv(io.StringIO(raw_data.strip()))
            else:
                df = self._parse_payment_gateway_text(raw_data, gateway)
                if df is None or df.empty:
                    df = pd.read_json(io.StringIO(raw_data.strip()))

        except Exception as e:
            return {"success": False, "error": f"{gateway} report parsing failed: {str(e)}"}

        # Extract entities and relationships
        entities, relationships = self._extract_payment_gateway_entities_relationships(df, gateway, fir_link)

        # Detect gateway-specific suspicious patterns
        suspicious_patterns = self._detect_payment_gateway_suspicious_patterns(df, gateway)

        # Update engine data
        try:
            financial_txns = self._convert_payment_gateway_to_financial_format(df, gateway, fir_link)

            if not financial_txns.empty:
                self.engine.fin_df = pd.concat([self.engine.fin_df, financial_txns], ignore_index=True)
                self.engine._threat_scores_cache = None

        except Exception as e:
            return {"success": False, "error": f"Failed to integrate {gateway} data: {str(e)}"}

        return {
            "success": True,
            "source_type": f"{gateway.upper()}_GATEWAY",
            "gateway": gateway,
            "records_ingested": len(df),
            "entities_extracted": entities,
            "relationships_mapped": relationships,
            "suspicious_patterns_detected": suspicious_patterns,
            "fir_link": fir_link,
            "graph_impact": {
                "active_total_financial_records": len(self.engine.fin_df)
            }
        }

    def ingest_cash_withdrawal_deposit_records(self, raw_data: str,
                                             record_type: str,  # 'withdrawal' or 'deposit'
                                             is_csv: bool = True,
                                             fir_link: Optional[str] = None) -> Dict[str, Any]:
        """
        Parse cash withdrawal/deposit records linked to FIRs and cases.

        Args:
            raw_data: Cash transaction records
            record_type: Type of record ('withdrawal' or 'deposit')
            is_csv: Whether the data is CSV format
            fir_link: FIR number to link transactions to (required for cash records)

        Returns:
            Dict with ingestion results
        """
        if not fir_link:
            return {"success": False, "error": "FIR link is required for cash withdrawal/deposit records"}

        try:
            if is_csv:
                df = pd.read_csv(io.StringIO(raw_data.strip()))
            else:
                df = self._parse_cash_record_text(raw_data, record_type)
                if df is None or df.empty:
                    df = pd.read_json(io.StringIO(raw_data.strip()))

        except Exception as e:
            return {"success": False, "error": f"Cash {record_type} record parsing failed: {str(e)}"}

        # Validate required columns
        required_cols = {'transaction_date', 'amount', 'location', 'transaction_id'}
        if not required_cols.issubset(set(df.columns)):
            missing = required_cols - set(df.columns)
            return {"success": False,
                   "error": f"Missing required columns for cash {record_type}. Expected {required_cols}, missing {list(missing)}"}

        # Extract entities and relationships (focus on locations, devices, etc.)
        entities, relationships = self._extract_cash_entities_relationships(df, record_type, fir_link)

        # Detect cash-specific suspicious patterns (structuring, layering, etc.)
        suspicious_patterns = self._detect_cash_suspicious_patterns(df, record_type)

        # Update engine data
        try:
            financial_txns = self._convert_cash_to_financial_format(df, record_type, fir_link)

            if not financial_txns.empty:
                self.engine.fin_df = pd.concat([self.engine.fin_df, financial_txns], ignore_index=True)
                self.engine._threat_scores_cache = None

        except Exception as e:
            return {"success": False, "error": f"Failed to integrate cash {record_type} data: {str(e)}"}

        return {
            "success": True,
            "source_type": f"CASH_{record_type.upper()}",
            "record_type": record_type,
            "records_ingested": len(df),
            "entities_extracted": entities,
            "relationships_mapped": relationships,
            "suspicious_patterns_detected": suspicious_patterns,
            "fir_link": fir_link,
            "graph_impact": {
                "active_total_financial_records": len(self.engine.fin_df)
            }
        }

    def _standardize_bank_columns(self, df: pd.DataFrame, bank_type: str) -> pd.DataFrame:
        """Standardize column names across different bank formats."""
        # Create a copy to avoid modifying original
        df_std = df.copy()

        # Common column name mappings
        column_mappings = {
            # Date columns
            'Date': 'transaction_date',
            'Txn Date': 'transaction_date',
            'Transaction Date': 'transaction_date',
            'Posted Date': 'transaction_date',
            'Value Date': 'transaction_date',

            # Amount columns
            'Amount': 'amount',
            'Txn Amount': 'amount',
            'Transaction Amount': 'amount',
            'Credit': 'amount',
            'Debit': 'amount',
            'Withdrawal': 'amount',
            'Deposit': 'amount',

            # Description columns
            'Description': 'description',
            'Narration': 'description',
            'Particulars': 'description',
            'Details': 'description',
            'Remarks': 'description',

            # Reference columns
            'Ref No.': 'reference_number',
            'Reference Number': 'reference_number',
            'UTR': 'utr_reference',
            'Transaction ID': 'transaction_id',
            'Ref.No./Cheque No.': 'reference_number',

            # Balance columns
            'Balance': 'balance',
            'Closing Balance': 'closing_balance'
        }

        # Rename columns
        df_std = df_std.rename(columns={k: v for k, v in column_mappings.items() if k in df_std.columns})

        # Ensure amount is numeric and positive (absolute value for analysis)
        if 'amount' in df_std.columns:
            df_std['amount'] = pd.to_numeric(df_std['amount'], errors='coerce').abs()

        # Ensure transaction_date is datetime
        if 'transaction_date' in df_std.columns:
            df_std['transaction_date'] = pd.to_datetime(df_std['transaction_date'], errors='coerce')

        return df_std

    def _parse_bank_statement_text(self, raw_data: str, bank_type: str) -> Optional[pd.DataFrame]:
        """Parse bank statement from text format using bank-specific patterns."""
        lines = raw_data.strip().split('\n')
        if len(lines) < 2:
            return None

        # Try to detect if it's CSV-like
        if ',' in lines[0] or '\t' in lines[0]:
            # Try to parse as delimited text
            delimiter = ',' if ',' in lines[0] else '\t'
            try:
                return pd.read_csv(io.StringIO(raw_data), delimiter=delimiter)
            except:
                pass

        # Bank-specific text parsing would go here
        # For now, return None to fall back to other methods
        return None

    def _parse_payment_log_text(self, raw_data: str, payment_type: str) -> Optional[pd.DataFrame]:
        """Parse payment log from text format."""
        # Similar implementation for payment logs
        return None

    def _parse_payment_gateway_text(self, raw_data: str, gateway: str) -> Optional[pd.DataFrame]:
        """Parse payment gateway report from text format."""
        # Similar implementation for payment gateways
        return None

    def _parse_cash_record_text(self, raw_data: str, record_type: str) -> Optional[pd.DataFrame]:
        """Parse cash withdrawal/deposit record from text format."""
        # Similar implementation for cash records
        return None

    def _get_payment_required_cols(self, payment_type: str) -> set:
        """Get required columns for specific payment type."""
        base_cols = {'transaction_date', 'amount', 'transaction_id'}

        if payment_type in ['imps', 'neft', 'rtgs']:
            base_cols.update({'sender_ifsc', 'receiver_ifsc', 'sender_account', 'receiver_account'})
        elif payment_type == 'upi':
            base_cols.update({'sender_upi_id', 'receiver_upi_id'})

        return base_cols

    def _extract_bank_entities_relationships(self, df: pd.DataFrame, bank_type: str,
                                           fir_link: Optional[str]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Extract entities and relationships from bank statement data."""
        entities = {
            'persons': set(),
            'accounts': set(),
            'banks': set(),
            'ifsc_codes': set(),
            'locations': set()
        }

        relationships = {
            'account_held_by': [],  # (account_id, person_id)
            'account_at_bank': [],  # (account_id, bank_id)
            'transaction_via_account': []  # (transaction_id, account_id)
        }

        # Extract entities from description/narration using NLP
        if 'description' in df.columns:
            descriptions = df['description'].dropna().astype(str).tolist()
            combined_desc = ' '.join(descriptions)

            # Use NLP to extract person names, organizations, etc.
            nlp_result = self.nlp_engine.extract_entities(combined_desc)

            # Add suspects from NLP extraction
            for suspect in nlp_result.get('suspects', []):
                entities['persons'].add(suspect['name'])

            # Add organizations
            for org in nlp_result.get('organizations', []):
                entities['persons'].add(org['name'])  # Treat organizations as persons for now

        # Extract account numbers from reference fields
        if 'reference_number' in df.columns:
            ref_numbers = df['reference_number'].dropna().astype(str)
            for ref in ref_numbers:
                # Extract potential account numbers (simplified)
                if len(ref) >= 9 and ref.isdigit():
                    entities['accounts'].add(ref)

        # Extract bank information
        if bank_type != 'generic':
            entities['banks'].add(bank_type.upper())

        # Extract IFSC codes if present
        if 'sender_ifsc' in df.columns:
            ifsc_codes = df['sender_ifsc'].dropna().astype(str)
            entities['ifsc_codes'].update(ifsc_codes[ifsc_codes.str.match(r'[A-Z]{4}0[A-Z0-9]{6}')])
        if 'receiver_ifsc' in df.columns:
            ifsc_codes = df['receiver_ifsc'].dropna().astype(str)
            entities['ifsc_codes'].update(ifsc_codes[ifsc_codes.str.match(r'[A-Z]{4}0[A-Z0-9]{6}')])

        # Link to FIR if provided
        if fir_link:
            entities['cases'] = {fir_link}
            # Relationship: transaction linked to case
            relationships['transaction_in_case'] = [(tx_id, fir_link) for tx_id in
                                                  df.get('transaction_id', pd.Series(range(len(df)))).astype(str)]

        # Convert sets to lists for JSON serialization
        entities_serializable = {k: list(v) for k, v in entities.items()}

        return entities_serializable, relationships

    def _extract_payment_entities_relationships(self, df: pd.DataFrame, payment_type: str,
                                              fir_link: Optional[str]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Extract entities and relationships from payment log data."""
        entities = {
            'persons': set(),
            'upi_ids': set(),
            'bank_accounts': set(),
            'ifsc_codes': set(),
            'devices': set(),
            'ips': set()
        }

        relationships = {
            'upi_id_linked_to_person': [],  # (upi_id, person_id)
            'account_linked_to_upi_id': [],  # (account_id, upi_id)
            'transaction_via_payment_method': []  # (transaction_id, payment_method)
        }

        # Extract UPI IDs
        if payment_type == 'upi':
            if 'sender_upi_id' in df.columns:
                sender_upis = df['sender_upi_id'].dropna().astype(str)
                entities['upi_ids'].update(sender_upis[sender_upis.str.contains('@')])
            if 'receiver_upi_id' in df.columns:
                receiver_upis = df['receiver_upi_id'].dropna().astype(str)
                entities['upi_ids'].update(receiver_upis[receiver_upis.str.contains('@')])

        # Extract bank account info
        if 'sender_account' in df.columns:
            sender_accs = df['sender_account'].dropna().astype(str)
            entities['bank_accounts'].update(sender_accs[sender_accs.str.len() >= 9])
        if 'receiver_account' in df.columns:
            receiver_accs = df['receiver_account'].dropna().astype(str)
            entities['bank_accounts'].update(receiver_accs[receiver_accs.str.len() >= 9])

        # Extract IFSC codes
        if 'sender_ifsc' in df.columns:
            sender_ifscs = df['sender_ifsc'].dropna().astype(str)
            entities['ifsc_codes'].update(sender_ifscs[sender_ifscs.str.match(r'[A-Z]{4}0[A-Z0-9]{6}')])
        if 'receiver_ifsc' in df.columns:
            receiver_ifscs = df['receiver_ifsc'].dropna().astype(str)
            entities['ifsc_codes'].update(receiver_ifscs[receiver_ifscs.str.match(r'[A-Z]{4}0[A-Z0-9]{6}')])

        # Extract device/IP info if available
        if 'device_id' in df.columns:
            devices = df['device_id'].dropna().astype(str)
            entities['devices'].update(devices[devices.str.len() >= 8])
        if 'ip_address' in df.columns:
            ips = df['ip_address'].dropna().astype(str)
            entities['ips'].update(ips[ips.str.match(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}')])

        # Link to FIR if provided
        if fir_link:
            entities['cases'] = {fir_link}
            relationships['transaction_in_case'] = [(tx_id, fir_link) for tx_id in
                                                  df.get('transaction_id', pd.Series(range(len(df)))).astype(str)]

        # Convert sets to lists
        entities_serializable = {k: list(v) for k, v in entities.items()}

        return entities_serializable, relationships

    def _extract_payment_gateway_entities_relationships(self, df: pd.DataFrame, gateway: str,
                                                      fir_link: Optional[str]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Extract entities and relationships from payment gateway data."""
        entities = {
            'persons': set(),
            'merchant_accounts': set(),
            'customer_identifiers': set(),
            'devices': set(),
            'ips': set()
        }

        relationships = {
            'customer_linked_to_merchant': [],  # (customer_id, merchant_id)
            'transaction_via_gateway': []  # (transaction_id, gateway_id)
        }

        # Extract customer and merchant info
        if 'customer_email' in df.columns or 'customer_phone' in df.columns:
            # Extract personas from contact info
            pass  # Simplified for now

        if 'merchant_name' in df.columns:
            merchants = df['merchant_name'].dropna().astype(str)
            entities['persons'].update(merchants.tolist())

        # Link to FIR if provided
        if fir_link:
            entities['cases'] = {fir_link}
            relationships['transaction_in_case'] = [(tx_id, fir_link) for tx_id in
                                                  df.get('transaction_id', pd.Series(range(len(df)))).astype(str)]

        # Convert sets to lists
        entities_serializable = {k: list(v) for k, v in entities.items()}

        return entities_serializable, relationships

    def _extract_cash_entities_relationships(self, df: pd.DataFrame, record_type: str,
                                           fir_link: Optional[str]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Extract entities and relationships from cash withdrawal/deposit data."""
        entities = {
            'persons': set(),
            'locations': set(),
            'devices': set(),
            'dates': set()
        }

        relationships = {
            'cash_transaction_at_location': [],  # (transaction_id, location_id)
            'cash_transaction_on_date': []  # (transaction_id, date_id)
        }

        # Extract locations
        if 'location' in df.columns:
            locations = df['location'].dropna().astype(str)
            entities['locations'].update(locations.tolist())

        # Extract device info if available
        if 'device_id' in df.columns:
            devices = df['device_id'].dropna().astype(str)
            entities['devices'].update(devices[devices.str.len() >= 8])

        # Extract dates
        if 'transaction_date' in df.columns:
            dates = pd.to_datetime(df['transaction_date'], errors='coerce').dropna()
            entities['dates'].update(dates.dt.strftime('%Y-%m-%d').tolist())

        # Link to FIR (required for cash records)
        entities['cases'] = {fir_link}
        relationships['cash_transaction_in_case'] = [(tx_id, fir_link) for tx_id in
                                                   df.get('transaction_id', pd.Series(range(len(df)))).astype(str)]
        relationships['cash_transaction_at_location'] = [(tx_id, loc) for tx_id, loc in
                                                       zip(df.get('transaction_id', pd.Series(range(len(df)))).astype(str),
                                                           df.get('location', pd.Series(['Unknown']*len(df))).astype(str))]
        relationships['cash_transaction_on_date'] = [(tx_id, date) for tx_id, date in
                                                   zip(df.get('transaction_id', pd.Series(range(len(df)))).astype(str),
                                                       pd.to_datetime(df.get('transaction_date', pd.Series(['2026-01-01']*len(df))),
                                                             errors='coerce').dt.strftime('%Y-%m-%d').fillna('Unknown'))]

        # Convert sets to lists
        entities_serializable = {k: list(v) for k, v in entities.items()}

        return entities_serializable, relationships

    def _detect_bank_suspicious_patterns(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Detect suspicious patterns in bank statement data."""
        patterns = []

        if 'amount' in df.columns and len(df) > 0:
            amounts = df['amount'].values

            # Detect round amount transactions (potential structuring)
            round_amounts = df[df['amount'] % 1000 == 0]  # Multiples of 1000
            if len(round_amounts) > len(df) * 0.3:  # More than 30% are round amounts
                patterns.append({
                    "pattern_type": "ROUND_AMOUNT_STRUCTURING",
                    "description": f"High frequency of round amount transactions ({len(round_amounts)}/{len(df)})",
                    "risk_score": 75.0,
                    "count": len(round_amounts)
                })

            # Detect rapid successive transactions
            if 'transaction_date' in df.columns:
                df_sorted = df.sort_values('transaction_date')
                time_diffs = df_sorted['transaction_date'].diff().dt.total_seconds() / 60  # Minutes
                rapid_transactions = df_sorted[time_diffs < 5]  # Less than 5 minutes apart
                if len(rapid_transactions) > 0:
                    patterns.append({
                        "pattern_type": "RAPID_SUCCESSIVE_TRANSACTIONS",
                        "description": f"Found {len(rapid_transactions)} transactions within 5 minutes of each other",
                        "risk_score": 80.0,
                        "count": len(rapid_transactions)
                    })

        return patterns

    def _detect_payment_suspicious_patterns(self, df: pd.DataFrame, payment_type: str) -> List[Dict[str, Any]]:
        """Detect suspicious patterns in payment log data."""
        patterns = []

        if 'amount' in df.columns and len(df) > 0:
            amounts = df['amount'].values

            # UPI/IMPS specific: amounts just below reporting thresholds
            if payment_type in ['upi', 'imps']:
                sub_50k = df[(df['amount'] >= 45000) & (df['amount'] <= 49999)]
                sub_2l = df[(df['amount'] >= 190000) & (df['amount'] <= 199999)]

                if len(sub_50k) > 0:
                    patterns.append({
                        "pattern_type": "UPI_IMPS_STRUCTURING_50K",
                        "description": f"Found {len(sub_50k)} transactions just below ₹50K reporting threshold",
                        "risk_score": 85.0,
                        "count": len(sub_50k)
                    })

                if len(sub_2l) > 0:
                    patterns.append({
                        "pattern_type": "UPI_IMPS_STRUCTURING_2L",
                        "description": f"Found {len(sub_2l)} transactions just below ₹2L reporting threshold",
                        "risk_score": 90.0,
                        "count": len(sub_2l)
                    })

        return patterns

    def _detect_payment_gateway_suspicious_patterns(self, df: pd.DataFrame, gateway: str) -> List[Dict[str, Any]]:
        """Detect suspicious patterns in payment gateway data."""
        patterns = []

        if 'amount' in df.columns and len(df) > 0:
            # High frequency of small transactions (potential testing of stolen cards)
            small_txns = df[df['amount'] < 100]  # Less than ₹100
            if len(small_txns) > len(df) * 0.5:  # More than 50% are small
                patterns.append({
                    "pattern_type": "MICRO_TRANSACTION_TESTING",
                    "description": f"High frequency of micro-transactions (< ₹100): {len(small_txns)}/{len(df)}",
                    "risk_score": 70.0,
                    "count": len(small_txns)
                })

        return patterns

    def _detect_cash_suspicious_patterns(self, df: pd.DataFrame, record_type: str) -> List[Dict[str, Any]]:
        """Detect suspicious patterns in cash withdrawal/deposit data."""
        patterns = []

        if record_type == 'withdrawal' and 'amount' in df.columns and len(df) > 0:
            # Detect cash structuring (multiple withdrawals just below reporting limits)
            # In India, cash transactions > ₹2 lakhs require reporting
            large_withdrawals = df[df['amount'] >= 200000]
            if len(large_withdrawals) > 0:
                patterns.append({
                    "pattern_type": "LARGE_CASH_WITHDRAWAL_REPORTING_THRESHOLD",
                    "description": f"Found {len(large_withdrawals)} cash withdrawals ≥ ₹2L (reporting threshold)",
                    "risk_score": 85.0,
                    "count": len(large_withdrawals)
                })

            # Detect round amount cash withdrawals
            round_withdrawals = df[df['amount'] % 1000 == 0]  # Multiples of 1000
            if len(round_withdrawals) > len(df) * 0.4:  # More than 40% are round amounts
                patterns.append({
                    "pattern_type": "ROUND_AMOUNT_CASH_WITHDRAWAL",
                    "description": f"High frequency of round amount cash withdrawals: {len(round_withdrawals)}/{len(df)}",
                    "risk_score": 75.0,
                    "count": len(round_withdrawals)
                })

        elif record_type == 'deposit' and 'amount' in df.columns and len(df) > 0:
            # Detect cash structuring deposits (multiple deposits just below reporting limits)
            large_deposits = df[df['amount'] >= 200000]
            if len(large_deposits) > 0:
                patterns.append({
                    "pattern_type": "LARGE_CASH_DEPOSIT_REPORTING_THRESHOLD",
                    "description": f"Found {len(large_deposits)} cash deposits ≥ ₹2L (reporting threshold)",
                    "risk_score": 85.0,
                    "count": len(large_deposits)
                })

        return patterns

    def _convert_to_financial_format(self, df: pd.DataFrame, bank_type: str,
                                   fir_link: Optional[str]) -> pd.DataFrame:
        """Convert bank statement data to standard financial transaction format."""
        # Map bank statement columns to financial transaction format
        fin_df = pd.DataFrame()

        # Transaction ID
        if 'transaction_id' in df.columns:
            fin_df['transaction_id'] = df['transaction_id'].astype(str)
        elif 'reference_number' in df.columns:
            fin_df['transaction_id'] = df['reference_number'].astype(str)
        else:
            fin_df['transaction_id'] = [f"BANK-{bank_type}-{i}" for i in range(len(df))]

        # FIR Number
        fin_df['fir_number'] = fir_link if fir_link else ""

        # Account Holder/Sender
        fin_df['account_holder'] = ""  # Would need to be extracted from description
        fin_df['sender_name'] = ""
        fin_df['sender_account'] = ""
        fin_df['sender_id'] = ""

        # Merchant/Payee/Receiver
        fin_df['merchant_or_payee'] = ""
        fin_df['receiver_name'] = ""
        fin_df['receiver_account'] = ""
        fin_df['receiver_id'] = ""

        # Amount
        if 'amount' in df.columns:
            fin_df['amount_inr'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)
        else:
            fin_df['amount_inr'] = 0.0

        # Timestamp
        if 'transaction_date' in df.columns:
            fin_df['timestamp'] = pd.to_datetime(df['transaction_date'], errors='coerce').dt.strftime('%Y-%m-%d %H:%M:%S')
            fin_df['timestamp'] = fin_df['timestamp'].fillna(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        else:
            fin_df['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Payment Mode (infer from bank type/description)
        fin_df['payment_mode'] = bank_type.upper() if bank_type != 'generic' else 'BANK_TRANSFER'

        # Transaction Type (infer from description)
        fin_df['transaction_type'] = 'BANK_TRANSACTION'

        # Status
        fin_df['status'] = 'SUCCESS'  # Assume successful for bank statements

        # UTR Reference
        fin_df['utr_reference'] = ""

        # Narration
        if 'description' in df.columns:
            fin_df['narration'] = df['description'].astype(str)
        else:
            fin_df['narration'] = ""

        # FIU STR Flag (would need to be calculated based on rules)
        fin_df['fiu_str_flag'] = False

        # IP Address and Device ID (not typically in bank statements)
        fin_df['ip_address'] = ""
        fin_df['device_id'] = ""

        return fin_df

    def _convert_payment_to_financial_format(self, df: pd.DataFrame, payment_type: str,
                                           fir_link: Optional[str]) -> pd.DataFrame:
        """Convert payment log data to standard financial transaction format."""
        fin_df = pd.DataFrame()

        # Transaction ID
        if 'transaction_id' in df.columns:
            fin_df['transaction_id'] = df['transaction_id'].astype(str)
        else:
            fin_df['transaction_id'] = [f"{payment_type.upper()}-{i}" for i in range(len(df))]

        # FIR Number
        fin_df['fir_number'] = fir_link if fir_link else ""

        # Sender info
        if payment_type == 'upi':
            fin_df['sender_name'] = df.get('sender_name', df.get('sender_upi_id', ''))
            fin_df['sender_account'] = df.get('sender_upi_id', '')
        elif payment_type in ['imps', 'neft', 'rtgs']:
            fin_df['sender_name'] = df.get('sender_name', '')
            fin_df['sender_account'] = df.get('sender_account', '')
            fin_df['sender_id'] = df.get('sender_account', '')  # Use account as ID for now

        fin_df['sender_id'] = fin_df['sender_account']  # Simplified

        # Receiver info
        if payment_type == 'upi':
            fin_df['receiver_name'] = df.get('receiver_name', df.get('receiver_upi_id', ''))
            fin_df['receiver_account'] = df.get('receiver_upi_id', '')
        elif payment_type in ['imps', 'neft', 'rtgs']:
            fin_df['receiver_name'] = df.get('receiver_name', '')
            fin_df['receiver_account'] = df.get('receiver_account', '')
            fin_df['receiver_id'] = df.get('receiver_account', '')

        fin_df['receiver_id'] = fin_df['receiver_account']  # Simplified

        # Amount
        if 'amount' in df.columns:
            fin_df['amount_inr'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)
        else:
            fin_df['amount_inr'] = 0.0

        # Timestamp
        if 'timestamp' in df.columns:
            fin_df['timestamp'] = df['timestamp'].astype(str)
        elif 'transaction_date' in df.columns:
            fin_df['timestamp'] = pd.to_datetime(df['transaction_date'], errors='coerce').dt.strftime('%Y-%m-%d %H:%M:%S')
            fin_df['timestamp'] = fin_df['timestamp'].fillna(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        else:
            fin_df['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Payment Mode
        fin_df['payment_mode'] = payment_type.upper()

        # Transaction Type
        fin_df['transaction_type'] = f'{payment_type.upper()}_TRANSFER'

        # Status
        fin_df['status'] = df.get('status', 'SUCCESS')

        # UTR Reference
        fin_df['utr_reference'] = df.get('utr_reference', df.get('reference_number', ''))

        # Narration
        fin_df['narration'] = df.get('description', df.get('narration', ''))

        # FIU STR Flag
        fin_df['fiu_str_flag'] = False

        # IP Address and Device ID
        fin_df['ip_address'] = df.get('ip_address', '')
        fin_df['device_id'] = df.get('device_id', '')

        return fin_df

    def _convert_payment_gateway_to_financial_format(self, df: pd.DataFrame, gateway: str,
                                                   fir_link: Optional[str]) -> pd.DataFrame:
        """Convert payment gateway data to standard financial transaction format."""
        fin_df = pd.DataFrame()

        # Transaction ID
        if 'transaction_id' in df.columns:
            fin_df['transaction_id'] = df['transaction_id'].astype(str)
        elif 'order_id' in df.columns:
            fin_df['transaction_id'] = df['order_id'].astype(str)
        else:
            fin_df['transaction_id'] = [f"{gateway.upper()}-{i}" for i in range(len(df))]

        # FIR Number
        fin_df['fir_number'] = fir_link if fir_link else ""

        # Sender (Customer)
        fin_df['sender_name'] = df.get('customer_name', df.get('customer_email', ''))
        fin_df['sender_account'] = df.get('customer_email', df.get('customer_phone', ''))
        fin_df['sender_id'] = fin_df['sender_account']

        # Receiver (Merchant)
        fin_df['receiver_name'] = df.get('merchant_name', '')
        fin_df['receiver_account'] = df.get('merchant_id', '')
        fin_df['receiver_id'] = fin_df['receiver_account']

        # Amount
        if 'amount' in df.columns:
            fin_df['amount_inr'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)
        else:
            fin_df['amount_inr'] = 0.0

        # Timestamp
        if 'timestamp' in df.columns:
            fin_df['timestamp'] = df['timestamp'].astype(str)
        elif 'created_at' in df.columns:
            fin_df['timestamp'] = pd.to_datetime(df['created_at'], errors='coerce').dt.strftime('%Y-%m-%d %H:%M:%S')
            fin_df['timestamp'] = fin_df['timestamp'].fillna(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        else:
            fin_df['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Payment Mode
        fin_df['payment_mode'] = gateway.upper()

        # Transaction Type
        fin_df['transaction_type'] = 'PAYMENT_GATEWAY'

        # Status
        fin_df['status'] = df.get('status', 'SUCCESS')

        # UTR Reference
        fin_df['utr_reference'] = df.get('transaction_id', '')

        # Narration
        fin_df['narration'] = df.get('description', df.get('notes', ''))

        # FIU STR Flag
        fin_df['fiu_str_flag'] = False

        # IP Address and Device ID
        fin_df['ip_address'] = df.get('ip_address', '')
        fin_df['device_id'] = df.get('device_id', '')

        return fin_df

    def _convert_cash_to_financial_format(self, df: pd.DataFrame, record_type: str,
                                        fir_link: Optional[str]) -> pd.DataFrame:
        """Convert cash withdrawal/deposit data to standard financial transaction format."""
        fin_df = pd.DataFrame()

        # Transaction ID
        if 'transaction_id' in df.columns:
            fin_df['transaction_id'] = df['transaction_id'].astype(str)
        else:
            fin_df['transaction_id'] = [f"CASH_{record_type.upper()}-{i}" for i in range(len(df))]

        # FIR Number (required)
        fin_df['fir_number'] = fir_link

        # For cash transactions, we need to infer sender/receiver based on type
        if record_type == 'withdrawal':
            # Cash withdrawal: money leaving account -> treat as sender=account holder, receiver=cash
            fin_df['sender_name'] = df.get('account_holder', df.get('customer_name', ''))
            fin_df['sender_account'] = df.get('account_number', '')
            fin_df['sender_id'] = fin_df['sender_account']

            fin_df['receiver_name'] = 'CASH_WITHDRAWAL'
            fin_df['receiver_account'] = 'CASH'
            fin_df['receiver_id'] = 'CASH'

        elif record_type == 'deposit':
            # Cash deposit: money entering account -> treat as sender=cash, receiver=account holder
            fin_df['sender_name'] = 'CASH_DEPOSIT'
            fin_df['sender_account'] = 'CASH'
            fin_df['sender_id'] = 'CASH'

            fin_df['receiver_name'] = df.get('account_holder', df.get('customer_name', ''))
            fin_df['receiver_account'] = df.get('account_number', '')
            fin_df['receiver_id'] = fin_df['receiver_account']

        # Amount
        if 'amount' in df.columns:
            fin_df['amount_inr'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)
        else:
            fin_df['amount_inr'] = 0.0

        # Timestamp
        if 'timestamp' in df.columns:
            fin_df['timestamp'] = df['timestamp'].astype(str)
        elif 'transaction_date' in df.columns:
            fin_df['timestamp'] = pd.to_datetime(df['transaction_date'], errors='coerce').dt.strftime('%Y-%m-%d %H:%M:%S')
            fin_df['timestamp'] = fin_df['timestamp'].fillna(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        else:
            fin_df['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Payment Mode
        fin_df['payment_mode'] = f'CASH_{record_type.upper()}'

        # Transaction Type
        fin_df['transaction_type'] = 'CASH_WITHDRAWAL' if record_type == 'withdrawal' else 'CASH_DEPOSIT'

        # Status
        fin_df['status'] = 'SUCCESS'

        # UTR Reference
        fin_df['utr_reference'] = df.get('reference_number', '')

        # Narration
        if record_type == 'withdrawal':
            fin_df['narration'] = df.get('purpose', df.get('description', 'Cash withdrawal'))
        else:
            fin_df['narration'] = df.get('source', df.get('description', 'Cash deposit'))

        # FIU STR Flag (set to True for large cash transactions)
        if 'amount' in df.columns:
            fin_df['fiu_str_flag'] = pd.to_numeric(df['amount'], errors='coerce') >= 200000  # ₹2L threshold
        else:
            fin_df['fiu_str_flag'] = False

        # IP Address and Device ID
        fin_df['ip_address'] = df.get('ip_address', '')
        fin_df['device_id'] = df.get('device_id', '')

        return fin_df


# Singleton instance for easy access
_enhanced_financial_ingestion_engine = None

def get_enhanced_financial_ingestion_engine(engine: IntelligenceEngine) -> EnhancedFinancialIngestionEngine:
    """Get or create the enhanced financial ingestion engine instance."""
    global _enhanced_financial_ingestion_engine
    if _enhanced_financial_ingestion_engine is None:
        _enhanced_financial_ingestion_engine = EnhancedFinancialIngestionEngine(engine)
    return _enhanced_financial_ingestion_engine