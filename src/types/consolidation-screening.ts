// Consolidation Screening Types

export interface ConsolidationConfig {
  N: number; // Consolidation Window Length (5-30)
  X: number; // Price Range Threshold % (1.0-10.0)
  Y: number; // Upward Drift Tolerance % (0.5-5.0)
  Z: number; // Volatility Percentile Threshold (10-50)
  M: number; // Volume Baseline Period (20-100)
  V_frac: number; // Volume Contraction Ratio (0.3-1.0)
  P: number; // Low Volume Days Requirement % (50.0-90.0)
  Q: number; // Low Volume Percentile (10-40)
  S: number; // Volume Spike Limit (1.5-5.0)
  R: number; // Range Centering Width % (20.0-60.0)
  min_median_volume: number; // Minimum Median Volume (1000-100000)
  min_price: number; // Minimum Price Threshold (0.1-50.0)
}

export interface ScreenerCriteria {
  id: string;
  name: string;
  type: 'CONSOLIDATION' | 'RESISTANCE_LEVEL' | 'SUPPORT_LEVEL';
  criteria_config: ConsolidationConfig;
  rating: number; // 0-10
  is_active: boolean;
  created_at: string;
  last_run_at: string | null;
  run_count: number;
  success_rate: number; // 0-100
  created_by: string;
}

export interface ScreenerResult {
  id: string;
  criteria_id: string;
  symbol: string;
  screening_type: string;
  result_data: ResultData;
  passed: boolean;
  score: number; // 0-10
  category: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WEAK' | 'FAILED';
  screening_date: string;
  metadata?: Record<string, unknown>;
}

export interface ResultData {
  ticker: string;
  consolidating_flag: boolean;
  score: number;
  category: string;
  N_range_abs: number;
  N_range_pct: number;
  close_std_N: number;
  vol_ratio_to_M: number;
  pct_low_vol_days: number;
  max_volume_spike_multiple: number;
  recent_close_position_pct: number;
  last_N_closes: number[];
  last_N_volumes: number[];
  screening_date: string;
}

export interface ScreeningSummary {
  total: number;
  passed: number;
  failed: number;
  pass_rate: number;
  categories: {
    EXCELLENT: number;
    GOOD: number;
    FAIR: number;
    WEAK: number;
    FAILED: number;
  };
  latest_run: string;
}

export interface ScreeningResponse {
  criteria_id: string;
  criteria_name: string;
  screening_type: string;
  total_screened: number;
  passed_count: number;
  pass_rate: number;
  category_breakdown: Record<string, number>;
  screening_date: string;
}

export interface CriteriaResponse {
  screening_type: string;
  criteria: ScreenerCriteria[];
}

export interface CreateCriteriaRequest {
  name: string;
  config: ConsolidationConfig;
  created_by?: string;
}

export interface CreateCriteriaResponse {
  id: string;
  name: string;
  type: string;
  message: string;
}

export interface CriteriaRatingRequest {
  rating: number;
}

export interface ActiveCriteriaResponse {
  screening_type: string;
  active_criteria: ScreenerCriteria[];
}

export interface BestCriteriaResponse {
  screening_type: string;
  best_criteria: ScreenerCriteria[];
}

export interface ScreeningRunResponse {
  criteria_id: string;
  criteria_name: string;
  screening_type: string;
  total_screened: number;
  passed_count: number;
  pass_rate: number;
  category_breakdown: Record<string, number>;
  screening_date: string;
}

export interface ScreeningResultsResponse {
  criteria_id: string;
  results: ResultData[];
}

export interface PassedResultsResponse {
  criteria_id: string;
  passed_results: ResultData[];
}

export interface CompareCriteriaRequest {
  criteria_ids: string[];
}

export interface CompareCriteriaResponse {
  comparison_results: Record<string, unknown>;
}

export interface DefaultConfigResponse {
  default_config: ConsolidationConfig;
  description: string;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
}

export interface ParameterPreset {
  name: string;
  description: string;
  config: ConsolidationConfig;
}

export interface ParameterValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export const DEFAULT_CONSOLIDATION_CONFIG: ConsolidationConfig = {
  N: 10,
  X: 4.0,
  Y: 1.0,
  Z: 25,
  M: 50,
  V_frac: 0.6,
  P: 70.0,
  Q: 25,
  S: 2.0,
  R: 40.0,
  min_median_volume: 10000,
  min_price: 1.0,
};

export const PARAMETER_PRESETS: Record<string, ParameterPreset> = {
  tight_consolidation: {
    name: 'Tight Consolidation',
    description: 'Finds stocks in very tight consolidation ranges',
    config: {
      N: 8, X: 2.5, Y: 0.8, Z: 20,
      M: 40, V_frac: 0.45, P: 85.0,
      Q: 20, S: 1.8, R: 35.0,
      min_median_volume: 25000, min_price: 5.0
    }
  },
  broad_consolidation: {
    name: 'Broad Consolidation',
    description: 'Finds stocks in broader consolidation patterns',
    config: {
      N: 15, X: 6.0, Y: 1.5, Z: 30,
      M: 60, V_frac: 0.65, P: 65.0,
      Q: 30, S: 2.5, R: 45.0,
      min_median_volume: 15000, min_price: 2.0
    }
  },
  conservative: {
    name: 'Conservative Setup',
    description: 'Very strict criteria for high-quality consolidations',
    config: {
      N: 12, X: 3.0, Y: 1.0, Z: 15,
      M: 50, V_frac: 0.5, P: 80.0,
      Q: 15, S: 1.5, R: 30.0,
      min_median_volume: 50000, min_price: 10.0
    }
  }
};

export const PARAMETER_RANGES = {
  N: { min: 5, max: 30, step: 1 },
  X: { min: 1.0, max: 10.0, step: 0.1 },
  Y: { min: 0.5, max: 5.0, step: 0.1 },
  Z: { min: 10, max: 50, step: 1 },
  M: { min: 20, max: 100, step: 1 },
  V_frac: { min: 0.3, max: 1.0, step: 0.05 },
  P: { min: 50.0, max: 90.0, step: 1.0 },
  Q: { min: 10, max: 40, step: 1 },
  S: { min: 1.5, max: 5.0, step: 0.1 },
  R: { min: 20.0, max: 60.0, step: 1.0 },
  min_median_volume: { min: 1000, max: 100000, step: 1000 },
  min_price: { min: 0.1, max: 50.0, step: 0.1 },
};
