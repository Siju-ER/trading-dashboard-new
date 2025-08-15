'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config';
import SearchInput from '@/components/shared/filters/SearchInput';
import FilterSection from '@/components/shared/filters/FilterSection';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Badge from '@/components/shared/ui/badge/Badge';
import FilterPanel from '@/components/shared/filters/FilterPanel';
import { 
  CalendarIcon, TrendingUpIcon, SearchIcon, RefreshCwIcon, FilterIcon,
  BarChart3Icon, ActivityIcon, SettingsIcon, AlertCircleIcon
} from '@/components/shared/icons';

// Interface for delivery volume peaks data
interface DeliveryVolumePeakRecord {
  symbol: string;
  close: number;
  volume: number;
  delivery_volume: number;
  delivery_percentage: number;
  volume_multiplier: number;
  next_day_volume: number;
  next_day_date: string;
}

interface DeliveryVolumePeaksData {
  date: string;
  stocks: DeliveryVolumePeakRecord[];
}

const DeliveryVolumePeaks: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DeliveryVolumePeaksData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'volume_multiplier',
    direction: 'desc' as 'asc' | 'desc'
  });

  // Filter states
  const [filters, setFilters] = useState({
    selectedDate: '',
    deliveryType: 'delivery_volume',
    targetPeriod: 6,
    volumeMultiplier: 6
  });

  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // Generate available dates (last 30 days)
  useEffect(() => {
    const generateDates = (): string[] => {
      const dates: string[] = [];
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates;
    };
    
    const dates = generateDates();
    setAvailableDates(dates);
    if (dates.length > 0) {
      setFilters(prev => ({ ...prev, selectedDate: dates[0] }));
    }
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (filters.selectedDate) {
      fetchDeliveryPeaks();
    }
  }, [filters]);

  const fetchDeliveryPeaks = async () => {
    if (!filters.selectedDate) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        date: filters.selectedDate,
        target_period: filters.targetPeriod.toString(),
        volume_multiplier: filters.volumeMultiplier.toString(),
        delivery_type: filters.deliveryType
      });

      const response = await fetch(`${API_BASE_URL}/strategy/delivery-peaks-raising-volume?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch delivery peaks data');
      }
    } catch (err) {
      console.error('Error fetching delivery peaks:', err);
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
    setFilters({
      selectedDate: availableDates[0] || '',
      deliveryType: 'delivery_volume',
      targetPeriod: 6,
      volumeMultiplier: 6
    });
  };

  // Filter field definitions
  const filterFields = [
    {
      name: 'selectedDate',
      label: 'Target Date',
      type: 'select' as const,
      placeholder: 'Select Date',
      options: availableDates.map(date => ({
        value: date,
        label: formatDate(date)
      })),
    },
    {
      name: 'deliveryType',
      label: 'Delivery Type',
      type: 'select' as const,
      placeholder: 'Select Type',
      options: [
        { value: 'delivery_volume', label: 'Delivery Volume' },
        { value: 'delivery_percentage', label: 'Delivery Percentage' },
      ],
    },
    {
      name: 'targetPeriod',
      label: 'Target Period (Days)',
      type: 'select' as const,
      placeholder: 'Select Period',
      options: [3, 5, 6, 7, 8, 9, 10, 14, 21, 30].map(period => ({
        value: period.toString(),
        label: `${period} days`
      })),
    },
    {
      name: 'volumeMultiplier',
      label: 'Volume Multiplier',
      type: 'select' as const,
      placeholder: 'Select Multiplier',
      options: [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 8, 10, 15, 20].map(multiplier => ({
        value: multiplier.toString(),
        label: `${multiplier}x`
      })),
    },
  ];

  // Get filtered and sorted records
  const getCurrentRecords = (): DeliveryVolumePeakRecord[] => {
    if (!data || !data.stocks) return [];

    const filteredRecords = data.stocks.filter(record => 
      record.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredRecords.sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return sortConfig.direction === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  };

  const getDeliveryVariant = (percentage: number): 'success' | 'warning' => {
    return percentage > 50 ? 'success' : 'warning';
  };

  const getVolumeMultiplierVariant = (multiplier: number): 'info' | 'neutral' => {
    return multiplier > 3 ? 'info' : 'neutral';
  };

  // Table column definitions
  const columns: Column<DeliveryVolumePeakRecord>[] = [
    {
      field: 'symbol',
      label: 'Symbol',
      sortable: true,
      render: (value, record) => (
        <button
          onClick={() => router.push(`/dashboard/analysis?symbol=${record.symbol}`)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium"
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
        <span className="font-medium text-slate-900 dark:text-white">
          ₹{value.toFixed(2)}
        </span>
      ),
    },
    {
      field: 'volume',
      label: 'Volume',
      sortable: true,
      render: (value) => formatNumber(value),
      className: 'text-sm text-slate-600 dark:text-slate-300',
    },
    {
      field: 'delivery_volume',
      label: 'Delivery Volume',
      sortable: true,
      render: (value) => formatNumber(value),
      className: 'text-sm text-slate-600 dark:text-slate-300',
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
      field: 'volume_multiplier',
      label: 'Volume Multiplier',
      sortable: true,
      render: (value) => (
        <Badge variant={getVolumeMultiplierVariant(value)} size="sm">
          {value.toFixed(2)}x
        </Badge>
      ),
    },
    {
      field: 'next_day_volume',
      label: 'Next Day Volume',
      sortable: true,
      render: (value) => formatNumber(value),
      className: 'text-sm text-slate-600 dark:text-slate-300',
    },
    {
      field: 'next_day_date',
      label: 'Next Day Date',
      sortable: true,
      render: (value) => formatDate(value),
      className: 'text-sm text-slate-600 dark:text-slate-300',
    },
  ];

  // Mobile card render
  const renderMobileCard = (record: DeliveryVolumePeakRecord) => (
    <>
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => router.push(`/dashboard/analysis?symbol=${record.symbol}`)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium"
        >
          {record.symbol}
        </button>
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          ₹{record.close.toFixed(2)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-400 mb-3">
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
          <span className="font-medium">Next Day Vol:</span> {formatNumber(record.next_day_volume)}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-3">
        <Badge variant={getVolumeMultiplierVariant(record.volume_multiplier)} size="xs">
          {record.volume_multiplier.toFixed(2)}x Multiplier
        </Badge>
        <Badge variant={getDeliveryVariant(record.delivery_percentage)} size="xs">
          {record.delivery_percentage.toFixed(2)}% Delivery
        </Badge>
      </div>
      
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Next Day: {formatDate(record.next_day_date)}
      </div>
    </>
  );

  const currentRecords = getCurrentRecords();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Delivery Volume Peaks
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Analyze stocks with rising delivery volume patterns
          </p>
        </div>
        
        <ActionButton
          variant="outline"
          onClick={fetchDeliveryPeaks}
          leftIcon={<RefreshCwIcon className={loading ? 'animate-spin' : ''} />}
          disabled={loading}
        >
          Refresh
        </ActionButton>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search symbols..."
            className="flex-1"
          />
        </div>
        
        <FilterPanel
          title="Analysis Parameters"
          isOpen={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
          onClear={handleClearFilters}
          variant="bordered"
          collapsible
        >
          <FilterSection
            isVisible={true}
            onToggle={() => {}}
            fields={filterFields}
            values={filters}
            onChange={updateFilter}
            onClear={handleClearFilters}
          />
        </FilterPanel>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
          <AlertCircleIcon className="h-5 w-5" />
          <div>
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Analysis Info */}
      {!loading && !error && data && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <BarChart3Icon className="h-5 w-5" />
            <span className="font-medium">
              {filters.deliveryType === 'delivery_volume' ? 'Delivery Volume' : 'Delivery Percentage'} Rising Peaks Analysis
            </span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Analysis Date: {formatDate(data.date)} | Period: {filters.targetPeriod} days | Multiplier: {filters.volumeMultiplier}x
          </p>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && !error && currentRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUpIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Stocks</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{currentRecords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <BarChart3Icon className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Volume Multiplier</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {currentRecords.length > 0 
                    ? (currentRecords.reduce((sum, r) => sum + r.volume_multiplier, 0) / currentRecords.length).toFixed(2)
                    : '0.00'
                  }x
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <ActivityIcon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Delivery %</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {currentRecords.length > 0 
                    ? (currentRecords.reduce((sum, r) => sum + r.delivery_percentage, 0) / currentRecords.length).toFixed(2)
                    : '0.00'
                  }%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <SettingsIcon className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">High Multiplier ( greater 3x)</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {currentRecords.filter(r => r.volume_multiplier > 3).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={currentRecords}
        columns={columns}
        isLoading={loading}
        sortConfig={sortConfig}
        onSort={(field) => setSortConfig({
          key: field,
          direction: sortConfig.key === field && sortConfig.direction === 'asc' ? 'desc' : 'asc',
        })}
        mobileCardRender={renderMobileCard}
        emptyMessage="No delivery peaks found with current filter criteria"
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
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default DeliveryVolumePeaks;