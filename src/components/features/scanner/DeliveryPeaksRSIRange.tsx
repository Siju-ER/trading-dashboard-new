'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config';
import SearchInput from '@/components/shared/filters/SearchInput';
import FilterSection from '@/components/shared/filters/FilterSection';
import CompactFilterBar from '@/components/shared/filters/CompactFilterBar';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Badge from '@/components/shared/ui/badge/Badge';
import FilterPanel from '@/components/shared/filters/FilterPanel';
import { 
  CalendarIcon, TrendingUpIcon, SearchIcon, RefreshCwIcon, FilterIcon,
  BarChart3Icon, ActivityIcon, SettingsIcon, AlertCircleIcon
} from '@/components/shared/icons';

// Interface for delivery peaks data
interface DeliveryPeakRecord {
  symbol: string;
  close: number;
  volume: number;
  delivery_volume: number;
  delivery_percentage: number;
  rsi: {
    rsi: number;
    rsi_sma: number;
    rsi_ta: number;
    rsi_sma_ta: number;
  };
  comparison_period: number;
}

const DeliveryPeaksRSIRange: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DeliveryPeakRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'rsi.rsi',
    direction: 'desc' as 'asc' | 'desc'
  });

  // Filter states - all parameters from API
  const [filters, setFilters] = useState({
    target_date: '',
    period: 6,
    rsi_threshold: 2,
    rsi_period: 14,
    sma_period: 14,
    delivery_type: 'delivery_volume'
  });

  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // Generate available dates (last 30 days)
  useEffect(() => {
  const generateDates = () => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    setAvailableDates(dates);
    if (dates.length > 0) {
      setFilters(prev => ({ ...prev, target_date: dates[0] }));
    }
  };
  generateDates();
}, []);

  // Fetch data when filters change
  useEffect(() => {
    if (filters.target_date) {
      fetchDeliveryPeaksRSI();
    }
  }, [filters]);

  const fetchDeliveryPeaksRSI = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        target_date: filters.target_date,
        period: filters.period.toString(),
        rsi_threshold: filters.rsi_threshold.toString(),
        rsi_period: filters.rsi_period.toString(),
        sma_period: filters.sma_period.toString(),
        delivery_type: filters.delivery_type
      });

      const response = await fetch(`${API_BASE_URL}/strategy/delivery-peaks-rsi-range?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        setData(result.data.stocks || []);
      } else {
        throw new Error(result.message || 'Failed to fetch delivery peaks RSI data');
      }
    } catch (err) {
      console.error('Error fetching delivery peaks RSI:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error fetching data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const updateFilter = (key: string, value: string | number | boolean) => {
  setFilters(prev => ({
    ...prev,
    [key]: value
  }));
};

  const handleClearFilters = () => {
    // Clear all filters
    updateFilter('target_date', '');
    updateFilter('delivery_type', '');
    updateFilter('period', '');
    
    // Clear search term
    setSearchTerm('');
  };

  // Filter field definitions
  const filterFields = [
    {
      name: 'target_date',
      label: 'Date',
      type: 'select' as const,
      placeholder: 'Select Date',
      options: availableDates.map(date => ({
        value: date,
        label: formatDate(date)
      })),
    },
    {
      name: 'delivery_type',
      label: 'Type',
      type: 'select' as const,
      placeholder: 'Select Type',
      options: [
        { value: 'delivery_volume', label: 'Delivery Volume' },
        { value: 'delivery_percentage', label: 'Delivery Percentage' },
      ],
    },
    {
      name: 'period',
      label: 'Period',
      type: 'select' as const,
      placeholder: 'Select Period',
      options: [
        { value: '3', label: '3 Days' },
        { value: '6', label: '6 Days' },
        { value: '10', label: '10 Days' },
        { value: '15', label: '15 Days' },
        { value: '20', label: '20 Days' },
        { value: '30', label: '30 Days' },
      ],
    },
  ];

  // Get filtered and sorted records
  const getFilteredRecords = () => {
    const filteredRecords = data.filter(record => 
      record.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredRecords.sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortConfig.key.includes('.')) {
        const keys = sortConfig.key.split('.');
        aValue = keys.reduce((obj: any, key: string) => obj?.[key], a);
        bValue = keys.reduce((obj: any, key: string) => obj?.[key], b);
      } else {
        aValue = (a as any)[sortConfig.key];
        bValue = (b as any)[sortConfig.key];
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return sortConfig.direction === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  };

  const getRSIVariant = (rsi: number): 'success' | 'danger' | 'warning' => {
    if (rsi > 70) return 'danger';
    if (rsi < 30) return 'success';
    return 'warning';
  };

  const getDeliveryVariant = (percentage: number): 'success' | 'warning' => {
    return percentage > 50 ? 'success' : 'warning';
  };

  // Table column definitions
  const columns: Column<DeliveryPeakRecord>[] = [
    {
      field: 'symbol',
      label: 'Symbol',
      sortable: true,
      render: (value, record) => (
        <button
          onClick={() => router.push(`/dashboard/scanner?tab=support-resistance&symbol=${record.symbol}`)}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {value}
        </button>
      ),
    },
    {
      field: 'close',
      label: 'Price',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-slate-900">
          ₹{value.toFixed(2)}
        </span>
      ),
    },
    {
      field: 'volume',
      label: 'Volume',
      sortable: true,
      render: (value) => formatNumber(value),
      className: 'text-sm text-slate-600',
    },
    {
      field: 'delivery_volume',
      label: 'Delivery Volume',
      sortable: true,
      render: (value) => formatNumber(value),
      className: 'text-sm text-slate-600',
    },
    {
      field: 'delivery_percentage',
      label: 'Delivery %',
      sortable: true,
      render: (value) => (
        <Badge variant={getDeliveryVariant(value)} size="sm">
          {value.toFixed(2)}%
        </Badge>
      ),
    },
    {
      field: 'rsi.rsi',
      label: 'RSI',
      sortable: true,
      render: (_, record) => (
        <Badge variant={getRSIVariant(record.rsi.rsi)} size="sm">
          {record.rsi.rsi.toFixed(2)}
        </Badge>
      ),
    },
    {
      field: 'rsi.rsi_sma',
      label: 'RSI SMA',
      sortable: true,
      render: (_, record) => (
        <span className="font-medium text-slate-900">
          {record.rsi.rsi_sma.toFixed(2)}
        </span>
      ),
    },
    {
      field: 'rsi.rsi_ta',
      label: 'RSI TA',
      sortable: true,
      render: (_, record) => (
        <Badge variant={getRSIVariant(record.rsi.rsi_ta)} size="sm">
          {record.rsi.rsi_ta.toFixed(2)}
        </Badge>
      ),
    },
    {
      field: 'rsi.rsi_sma_ta',
      label: 'RSI SMA TA',
      sortable: true,
      render: (_, record) => (
        <span className="font-medium text-slate-900">
          {record.rsi.rsi_sma_ta.toFixed(2)}
        </span>
      ),
    },
    {
      field: 'comparison_period',
      label: 'Period',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {value}
        </span>
      ),
    },
  ];

  // Mobile card render
  const renderMobileCard = (record: DeliveryPeakRecord) => (
    <>
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => router.push(`/dashboard/scanner?tab=support-resistance&symbol=${record.symbol}`)}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {record.symbol}
        </button>
        <span className="text-sm font-medium text-slate-900">
          ₹{record.close.toFixed(2)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600 mb-3">
        <div>
          <span className="font-medium">Volume:</span> {formatNumber(record.volume)}
        </div>
        <div>
          <span className="font-medium">Delivery Vol:</span> {formatNumber(record.delivery_volume)}
        </div>
        <div>
          <span className="font-medium">Delivery %:</span> {record.delivery_percentage.toFixed(2)}%
        </div>
        <div>
          <span className="font-medium">Period:</span> {record.comparison_period}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-3">
        <Badge variant={getRSIVariant(record.rsi.rsi)} size="xs">
          RSI: {record.rsi.rsi.toFixed(2)}
        </Badge>
        <Badge variant={getRSIVariant(record.rsi.rsi_ta)} size="xs">
          RSI TA: {record.rsi.rsi_ta.toFixed(2)}
        </Badge>
        <Badge variant={getDeliveryVariant(record.delivery_percentage)} size="xs">
          Delivery: {record.delivery_percentage.toFixed(2)}%
        </Badge>
      </div>
    </>
  );

  const filteredRecords = getFilteredRecords();

  return (
    <div className="space-y-6">
      {/* Header */}


      {/* Compact Search and Filters */}
      <CompactFilterBar
        fields={filterFields}
        values={filters}
        onChange={updateFilter}
        onClear={handleClearFilters}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search symbols..."
        showSearch={true}
        showQuickFilters={true}
        quickFilterPresets={[
          {
            label: 'Today',
            values: { target_date: availableDates[0] || '' },
            icon: <CalendarIcon className="w-3 h-3" />
          },
          {
            label: 'High Volume',
            values: { delivery_type: 'delivery_volume' },
            icon: <BarChart3Icon className="w-3 h-3" />
          },
          {
            label: 'High %',
            values: { delivery_type: 'delivery_percentage' },
            icon: <ActivityIcon className="w-3 h-3" />
          },
          {
            label: 'Week',
            values: { period: '6' },
            icon: <TrendingUpIcon className="w-3 h-3" />
          }
        ]}
        className="mb-6"
      />

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircleIcon className="h-5 w-5" />
          <div>
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && !error && filteredRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUpIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-500">Total Records</p>
                <p className="text-lg font-semibold text-slate-900">{filteredRecords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3Icon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-500">Avg RSI</p>
                <p className="text-lg font-semibold text-slate-900">
                  {(filteredRecords.reduce((sum, r) => sum + r.rsi.rsi, 0) / filteredRecords.length).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ActivityIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-500">Avg Delivery %</p>
                <p className="text-lg font-semibold text-slate-900">
                  {(filteredRecords.reduce((sum, r) => sum + r.delivery_percentage, 0) / filteredRecords.length).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <SettingsIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-500">Overbought (RSI greater 70)</p>
                <p className="text-lg font-semibold text-slate-900">
                  {filteredRecords.filter(r => r.rsi.rsi > 70).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={filteredRecords}
        columns={columns}
        isLoading={loading}
        sortConfig={sortConfig}
        onSort={(field) => setSortConfig({
          key: field,
          direction: sortConfig.key === field && sortConfig.direction === 'asc' ? 'desc' : 'asc',
        })}
        onRowSelectionChange={(item, isSelected) => {
          setSelectedRows(prev => {
            const newSet = new Set(prev);
            const key = item.symbol;
            if (isSelected) {
              newSet.add(key);
            } else {
              newSet.delete(key);
            }
            return newSet;
          });
        }}
        selectedRows={selectedRows}
        rowKey={(item) => item.symbol}
        mobileCardRender={renderMobileCard}
        emptyMessage={`No delivery peaks found for ${formatDate(filters.target_date)}`}
      />
    </div>
  );
};

// Helper functions
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

const formatNumber = (num: number): string => {
  if (num === null || num === undefined) return 'N/A';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default DeliveryPeaksRSIRange;