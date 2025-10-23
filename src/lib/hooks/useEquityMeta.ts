'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config';

interface EquityMetaData {
  sector: string[];
  industry: string[];
}

interface UseEquityMetaReturn {
  sectors: string[];
  industries: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEquityMeta = (): UseEquityMetaReturn => {
  const [data, setData] = useState<EquityMetaData>({ sector: [], industry: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetaData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/equity/meta`);
      const result = await response.json();
      
      if (result.status === 'success') {
        setData(result.data);
      } else {
        setError('Failed to fetch equity meta data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetaData();
  }, []);

  return {
    sectors: data.sector,
    industries: data.industry,
    isLoading,
    error,
    refetch: fetchMetaData,
  };
};

