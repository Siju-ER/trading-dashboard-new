// src/hooks/useApiData.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export interface PaginationData {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
}

export interface ApiFilters {
  [key: string]: string | number | boolean;
}

export interface ApiSortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface UseApiDataParams {
  endpoint: string;
  method?: 'GET' | 'POST';
  initialFilters?: ApiFilters;
  initialSort?: ApiSortConfig;
  initialPagination?: Partial<PaginationData>;
  searchField?: string;
  debounceDelay?: number;
}

interface UseApiDataReturn<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationData;
  filters: ApiFilters;
  sortConfig: ApiSortConfig;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: ApiFilters) => void;
  updateFilter: (key: string, value: any) => void;
  setSortConfig: (config: ApiSortConfig) => void;
  setPagination: (pagination: Partial<PaginationData>) => void;
  refetch: () => void;
}

export function useApiData<T = any>({
  endpoint,
  method = 'POST',
  initialFilters = {},
  initialSort = { key: 'id', direction: 'asc' },
  initialPagination = { currentPage: 1, perPage: 50 },
  searchField = 'name',
  debounceDelay = 300,
}: UseApiDataParams): UseApiDataReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ApiFilters>(initialFilters);
  const [sortConfig, setSortConfig] = useState<ApiSortConfig>(initialSort);
  const [pagination, setPaginationState] = useState<PaginationData>({
    currentPage: 1,
    perPage: 50,
    totalPages: 0,
    totalRecords: 0,
    ...initialPagination,
  });

  // Debounce implementation directly in the hook
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        per_page: pagination.perPage.toString(),
      });

      if (searchTerm) {
        queryParams.append('search_field', searchField);
        queryParams.append('search_value', searchTerm);
      }

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, String(value));
        }
      });

      // Add sorting
      if (sortConfig.key) {
        queryParams.append('sort_by', sortConfig.key);
        queryParams.append('sort_order', sortConfig.direction);
      }

      const url = `${endpoint}?${queryParams}`;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        setData(result.data || []);
        if (result.pagination) {
          setPaginationState(prev => ({
            ...prev,
            totalPages: result.pagination.total_pages,
            totalRecords: result.pagination.total_records,
          }));
        }
      } else {
        throw new Error(result.message || 'API request failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    endpoint,
    method,
    pagination.currentPage,
    pagination.perPage,
    searchTerm,
    searchField,
    JSON.stringify(filters),
    JSON.stringify(sortConfig),
  ]);

  const debouncedFetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchData();
    }, debounceDelay);
  }, [fetchData, debounceDelay]);

  // Effect to trigger debounced fetch
  useEffect(() => {
    debouncedFetch();
    
    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedFetch]);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    // Reset to first page when filters change
    setPaginationState(prev => ({
      ...prev,
      currentPage: 1,
    }));
  }, []);

  const setPagination = useCallback((newPagination: Partial<PaginationData>) => {
    setPaginationState(prev => ({
      ...prev,
      ...newPagination,
    }));
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    pagination,
    filters,
    sortConfig,
    searchTerm,
    setSearchTerm,
    setFilters,
    updateFilter,
    setSortConfig,
    setPagination,
    refetch,
  };
}