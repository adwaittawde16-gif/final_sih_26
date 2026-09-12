export interface SuspiciousPattern {
  type: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  [key: string]: any; // Allow for additional fields specific to each pattern type
}

export interface SuspiciousPatternResponse {
  patterns: SuspiciousPattern[];
  warnings: string[];
  analysis_timestamp: string;
}