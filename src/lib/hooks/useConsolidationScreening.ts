'use client';

import { useState, useCallback } from 'react';
import {
  ScreeningRunResponse,
  ScreeningResultsResponse,
  CriteriaResponse,
  ActiveCriteriaResponse,
  BestCriteriaResponse,
  CreateCriteriaRequest,
  CreateCriteriaResponse,
  CriteriaRatingRequest,
  CompareCriteriaResponse,
  DefaultConfigResponse,
  HealthCheckResponse,
  ConsolidationConfig,
  ParameterValidation,
  PARAMETER_RANGES
} from '@/types/consolidation-screening';
import { API_BASE_URL } from '@/config';

// const API_BASE_URL = '/screening';

// API Error handling
interface ApiError {
  status: number;
  detail: string;
}

const handleApiError = (error: unknown): ApiError => {
  if (error.status) {
    return error as ApiError;
  }
  return {
    status: 500,
    detail: 'An unexpected error occurred'
  };
};

// Criteria Management Hooks
export const useConsolidationCriteria = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCriteria = useCallback(async (request: CreateCriteriaRequest): Promise<CreateCriteriaResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/screening/criteria/CONSOLIDATION`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.detail);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCriteria = useCallback(async (): Promise<CriteriaResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/screening/criteria/CONSOLIDATION`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.detail);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActiveCriteria = useCallback(async (): Promise<ActiveCriteriaResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/screening/criteria/CONSOLIDATION/active`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.detail);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBestCriteria = useCallback(async (limit: number = 5): Promise<BestCriteriaResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/criteria/CONSOLIDATION/best?limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.detail);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const rateCriteria = useCallback(async (criteriaId: string, rating: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/screening/criteria/${criteriaId}/rating`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating } as CriteriaRatingRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      return true;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.detail);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const activateCriteria = useCallback(async (criteriaId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/screening/criteria/${criteriaId}/activate`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      return true;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.detail);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateCriteria = useCallback(async (criteriaId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/screening/criteria/${criteriaId}/deactivate`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      return true;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.detail);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createCriteria,
    getCriteria,
    getActiveCriteria,
    getBestCriteria,
    rateCriteria,
    activateCriteria,
    deactivateCriteria,
  };
};

// Screening Execution Hooks
export const useConsolidationScreening = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runScreening = useCallback(async (criteriaId: string): Promise<ScreeningRunResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/screening/run/CONSOLIDATION/${criteriaId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.detail);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getScreeningResults = useCallback(async (criteriaId: string): Promise<ScreeningResultsResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/screening/results/${criteriaId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.detail);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPassedResults = useCallback(async (criteriaId: string): Promise<PassedResultsResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/results/${criteriaId}/passed`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.detail);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const compareCriteria = useCallback(async (criteriaIds: string[]): Promise<CompareCriteriaResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteriaIds),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.detail);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    runScreening,
    getScreeningResults,
    getPassedResults,
    compareCriteria,
  };
};

// Utility Hooks
export const useConsolidationUtils = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDefaultConfig = useCallback(async (): Promise<DefaultConfigResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/default-consolidation-config`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.detail);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const healthCheck = useCallback(async (): Promise<HealthCheckResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw handleApiError(errorData);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.detail);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getDefaultConfig,
    healthCheck,
  };
};

// Parameter Validation Hook
export const useParameterValidation = () => {
  const validateConfig = useCallback((config: ConsolidationConfig): ParameterValidation => {
    const errors: Record<string, string> = {};

    // Validate each parameter against its range
    Object.entries(config).forEach(([key, value]) => {
      const range = PARAMETER_RANGES[key as keyof ConsolidationConfig];
      if (range) {
        if (value < range.min || value > range.max) {
          errors[key] = `Must be between ${range.min} and ${range.max}`;
        }
      }
    });

    // Additional validation rules
    if (config.N < config.M) {
      errors.N = 'Consolidation window (N) must be less than volume baseline period (M)';
    }

    if (config.V_frac > 1.0) {
      errors.V_frac = 'Volume contraction ratio cannot exceed 1.0';
    }

    if (config.P > 100) {
      errors.P = 'Low volume days requirement cannot exceed 100%';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, []);

  return { validateConfig };
};
