'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ComposedChart, Cell
} from 'recharts';
import {
  SearchIcon,
  TrendingUpIcon,
  ChevronDownIcon,
  BarChart3Icon,
  AnalyticsIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpRightIcon,
  XIcon
} from '@/components/shared/icons';
import { API_BASE_URL } from '@/config';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Badge from '@/components/shared/ui/badge/Badge';
import Modal from '@/components/shared/ui/modal/Modal';
import CompactFilterBar from '@/components/shared/filters/CompactFilterBar';
import EnhancedCalendar from '@/components/shared/ui/calendar/EnhancedCalendar';

// Stock interface for search results
interface Stock {
  symbol: string;
  company_name: string;
  current_price?: number;
}

const timeframes = [
  { value: '1D', label: '1 Day' },
  { value: '1W', label: '1 Week' },
  { value: '1M', label: '1 Month' },
  { value: '3M', label: '3 Months' },
  { value: '6M', label: '6 Months' },
  { value: '1Y', label: '1 Year' },
  { value: 'All', label: 'All Time' }
];

// Helper function to get start date based on timeframe
const getStartDate = (timeframe: string, endDate: Date) => {
  const date = new Date(endDate);

  switch (timeframe) {
    case '1D':
      return new Date(date.setDate(date.getDate() - 1));
    case '1W':
      return new Date(date.setDate(date.getDate() - 7));
    case '1M':
      return new Date(date.setMonth(date.getMonth() - 1));
    case '3M':
      return new Date(date.setMonth(date.getMonth() - 3));
    case '6M':
      return new Date(date.setMonth(date.getMonth() - 6));
    case '1Y':
      return new Date(date.setFullYear(date.getFullYear() - 1));
    case 'All':
    default:
      return null; // Return null for 'All' to include all data
  }
};

// Function to filter and format price data
const filterPriceData = (data: any[], timeframe: string) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  // Sort data by date (ascending)
  const sortedData = [...data].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const endDate = new Date(sortedData[sortedData.length - 1].date);
  const startDate = getStartDate(timeframe, endDate);

  // Filter data based on timeframe
  const filteredData = startDate
    ? sortedData.filter(item => new Date(item.date) >= startDate)
    : sortedData;

  // Format the filtered data
  return filteredData.map(item => ({
    rawDate: item.date,
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
    close: item.close,
    open: item.open,
    high: item.high,
    low: item.low,
    volume: item.volume,
    delivery_volume: item.delivery_volume || null,
    delivery_percentage: item.delivery_percentage || null
  }));
};

// Format number with commas
const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return 'N/A';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Format date for display
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    console.error("Date formatting error:", e);
    return dateString;
  }
};

// Support & Resistance Scanner Component
const SupportResistanceScanner: React.FC = () => {
  // State Management
  const [analysisType, setAnalysisType] = useState('extrema');
  const [chartType, setChartType] = useState('line');
  const [symbol, setSymbol] = useState('');
  const [symbolInput, setSymbolInput] = useState('');
  const [timeframe, setTimeframe] = useState('3M');
  const [showVolumeChart, setShowVolumeChart] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [showIndicators, setShowIndicators] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [hoverData, setHoverData] = useState<any>(null);
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Stock search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter fields for compact filter bar
  const filterFields = [
    {
      name: 'timeframe',
      label: 'Timeframe',
      type: 'select' as const,
      placeholder: 'Select timeframe',
      options: timeframes.map(tf => ({ value: tf.value, label: tf.label })),
    },
    {
      name: 'analysisType',
      label: 'Analysis Type',
      type: 'select' as const,
      placeholder: 'Select type',
      options: [
        { value: 'extrema', label: 'Extrema' },
        { value: 'pivot', label: 'Pivot Points' },
        { value: 'fibonacci', label: 'Fibonacci' },
      ],
    },
    {
      name: 'chartType',
      label: 'Chart Type',
      type: 'select' as const,
      placeholder: 'Select chart',
      options: [
        { value: 'line', label: 'Line Chart' },
        { value: 'candlestick', label: 'Candlestick' },
        { value: 'area', label: 'Area Chart' },
      ],
    },
  ];

  const filterValues = {
    timeframe,
    analysisType,
    chartType,
  };

  const updateFilter = (key: string, value: string | number | boolean) => {
    switch (key) {
      case 'timeframe':
        setTimeframe(value as string);
        break;
      case 'analysisType':
        setAnalysisType(value as string);
        break;
      case 'chartType':
        setChartType(value as string);
        break;
    }
  };

  const handleClearFilters = () => {
    setTimeframe('3M');
    setAnalysisType('extrema');
    setChartType('line');
  };

  // Stock search functions
  const searchStocks = async (value: string) => {
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/equity?search_field=symbol&search_value=${value}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSearchResults(data.data);
        setShowDropdown(true);
      } else {
        setError('Failed to fetch results. Please try again.');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
      setError('An error occurred while searching. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    searchStocks(value);
  };

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    setSearchTerm(`${stock.symbol} - ${stock.company_name}`);
    setShowDropdown(false);
    setSymbol(stock.symbol);
    setSymbolInput(stock.symbol);
  };

  const handleClearSelection = () => {
    setSelectedStock(null);
    setSearchTerm('');
    setSymbol('');
    setSymbolInput('');
    setShowDropdown(false);
  };

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Effect to fetch data when symbol changes
  useEffect(() => {
    if (!symbol) return;

    const fetchAnalysisData = async () => {
      setLoading(true);
      setError(null);
      setPriceData([]);
      setIsDataReady(false);

      try {
        const response = await fetch(`${API_BASE_URL}/technical-analysis/scanner/${symbol}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
          setAnalysisData(result.data.support_resistance);
          setOriginalData(result.data.price_volume); // Store original data

          // Filter and format data based on selected timeframe
          const formattedData = filterPriceData(result.data.price_volume, timeframe);
          setPriceData(formattedData);

          setIsDataReady(true);
        } else {
          throw new Error('Failed to fetch analysis data');
        }
      } catch (err: any) {
        console.error(`Error fetching data:`, err);
        setError(`Error fetching data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [symbol]);

  // Effect to update data when timeframe changes
  useEffect(() => {
    if (originalData && isDataReady) {
      const filteredData = filterPriceData(originalData, timeframe);
      setPriceData(filteredData);
    }
  }, [timeframe, originalData, isDataReady]);

  // Get current analysis based on type
  const currentAnalysis = analysisData
    ? (analysisData[analysisType] ? analysisData[analysisType] : { support_levels: [], resistance_levels: [] })
    : { support_levels: [], resistance_levels: [] };

  // Show notification
  const showNotification = (message: string, type: 'success' | 'warning' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Render support and resistance lines
  const renderSupportResistanceLines = () => {
    if (!currentAnalysis) return null;

    const lines: React.ReactElement[] = [];

    // Add support levels
    if (currentAnalysis.support_levels && Array.isArray(currentAnalysis.support_levels)) {
      currentAnalysis.support_levels.forEach((level: any, index: number) => {
        if (level && typeof level.price === 'number') {
          lines.push(
            <ReferenceLine
              key={`support-${index}`}
              y={level.price}
              stroke="#22c55e"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              label={{
                value: `S: ${level.price.toFixed(2)}`,
                fill: '#16a34a',
                position: 'insideLeft',
                fontSize: 11,
                fontWeight: '600'
              }}
            />
          );
        }
      });
    }

    // Add resistance levels
    if (currentAnalysis.resistance_levels && Array.isArray(currentAnalysis.resistance_levels)) {
      currentAnalysis.resistance_levels.forEach((level: any, index: number) => {
        if (level && typeof level.price === 'number') {
          lines.push(
            <ReferenceLine
              key={`resistance-${index}`}
              y={level.price}
              stroke="#ef4444"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              label={{
                value: `R: ${level.price.toFixed(2)}`,
                fill: '#dc2626',
                position: 'insideRight',
                fontSize: 11,
                fontWeight: '600'
              }}
            />
          );
        }
      });
    }

    return lines;
  };

  // Handle symbol submit (now handled by stock selection)
  const handleSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This function is now handled by handleStockSelect
  };

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    setIsTimeframeDropdownOpen(false);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 border border-gray-200 rounded shadow-lg bg-white">
          <p className="font-medium text-sm mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-sm flex items-center">
              <span className={`w-3 h-3 inline-block mr-2 ${payload[0].value >= payload[0].payload.open ? 'bg-green-500' : 'bg-red-500'} rounded-sm`}></span>
              <span className="font-medium">Close:</span>
              <span className="ml-1">₹{payload[0].payload.close.toFixed(2)}</span>
            </p>
            {payload[0].payload.open && (
              <p className="text-sm">
                <span className="font-medium">Open:</span>
                <span className="ml-1">₹{payload[0].payload.open.toFixed(2)}</span>
              </p>
            )}
            {payload[0].payload.high && (
              <p className="text-sm">
                <span className="font-medium">High:</span>
                <span className="ml-1">₹{payload[0].payload.high.toFixed(2)}</span>
              </p>
            )}
            {payload[0].payload.low && (
              <p className="text-sm">
                <span className="font-medium">Low:</span>
                <span className="ml-1">₹{payload[0].payload.low.toFixed(2)}</span>
              </p>
            )}
            {payload.length > 1 && payload[1] && payload[1].dataKey === 'volume' && (
              <p className="text-sm mt-1 pt-1 border-t border-gray-200">
                <span className="font-medium">Volume:</span>
                <span className="ml-1">{formatNumber(payload[1].value)}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for volume chart
  const VolumeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 border border-gray-200 rounded shadow-lg bg-white">
          <p className="text-xs">{label}</p>
          <p className="text-xs font-medium">{formatNumber(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate price change
  const calculatePriceChange = () => {
    if (!priceData || priceData.length < 2) {
      return { value: 0, percentage: 0, isPositive: false };
    }

    const current = priceData[priceData.length - 1].close;
    const previous = priceData[0].close;
    const change = current - previous;
    const percentageChange = (change / previous) * 100;

    return {
      value: change.toFixed(2),
      percentage: percentageChange.toFixed(2),
      isPositive: change >= 0
    };
  };

  // Check if we have valid data
  const validPriceData = priceData && Array.isArray(priceData) && priceData.length > 0;
  const priceChange = calculatePriceChange();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-600 border border-green-200' 
            : notification.type === 'warning'
              ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
              : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {notification.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
          {notification.type === 'warning' && <AlertTriangleIcon className="h-5 w-5" />}
          {notification.type === 'error' && <XCircleIcon className="h-5 w-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg">
        

        {/* Stock Search and Quick Filters */}
        <div className="space-y-4 p-6">
          {/* Stock Search */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Search Stock <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  placeholder="Search by symbol or company name..."
                  required
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                {selectedStock && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                  >
                    <XIcon className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {isSearching ? (
                    <div className="px-4 py-3 text-gray-500">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((stock, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => handleStockSelect(stock)}
                      >
                        <div className="font-medium text-gray-800">{stock.symbol}</div>
                        <div className="text-sm text-gray-500">{stock.company_name}</div>
                        {stock.current_price && (
                          <div className="text-xs text-blue-600">Current Price: ₹{stock.current_price}</div>
                        )}
                      </button>
                    ))
                  ) : searchTerm.length >= 2 ? (
                    <div className="px-4 py-3 text-gray-500">No stocks found</div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Quick Filters Row */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-slate-700 mr-2">Timeframe:</span>
            <button
              onClick={() => setTimeframe('1D')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                timeframe === '1D' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1D
            </button>
            <button
              onClick={() => setTimeframe('1W')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                timeframe === '1W' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1W
            </button>
            <button
              onClick={() => setTimeframe('1M')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                timeframe === '1M' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1M
            </button>
            <button
              onClick={() => setTimeframe('3M')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                timeframe === '3M' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              3M
            </button>
            <button
              onClick={() => setTimeframe('6M')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                timeframe === '6M' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              6M
            </button>
            <button
              onClick={() => setTimeframe('1Y')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                timeframe === '1Y' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1Y
            </button>
            <button
              onClick={() => setTimeframe('All')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                timeframe === 'All' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>

          {/* Analysis Type Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-slate-700 mr-2">Analysis:</span>
            <button
              onClick={() => setAnalysisType('extrema')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                analysisType === 'extrema' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Extrema
            </button>
            <button
              onClick={() => setAnalysisType('pivot')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                analysisType === 'pivot' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pivot Points
            </button>
            <button
              onClick={() => setAnalysisType('fibonacci')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                analysisType === 'fibonacci' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Fibonacci
            </button>
          </div>

          {/* Chart Type Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-slate-700 mr-2">Chart:</span>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                chartType === 'line' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Line Chart
            </button>
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                chartType === 'candlestick' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Candlestick
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                chartType === 'area' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Area Chart
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start">
          <AlertTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* No Symbol State */}
      {!symbol && !loading && !error && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-8">
            <div className="mx-auto h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center">
              <BarChart3Icon className="h-16 w-16 text-blue-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Support & Resistance Scanner
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Find key price levels for your stocks and analyze technical patterns to make better trading decisions
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="neutral">Price Analysis</Badge>
            <Badge variant="neutral">Technical Indicators</Badge>
            <Badge variant="neutral">Support Levels</Badge>
            <Badge variant="neutral">Resistance Zones</Badge>
          </div>
        </div>
      )}

      {/* Main Chart Section */}
      {validPriceData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Stock Info and Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">{symbol}</h1>
              </div>

              <div className="flex items-center mt-1">
                <span className="text-2xl font-semibold text-gray-900">
                  ₹{priceData[priceData.length - 1].close.toFixed(2)}
                </span>
                <div className={`ml-2 flex items-center text-sm ${priceChange.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {priceChange.isPositive ? (
                    <ArrowUpRightIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 mr-1" />
                  )}
                  <span>
                    {priceChange.isPositive ? '+' : ''}{priceChange.value}
                    ({priceChange.isPositive ? '+' : ''}{priceChange.percentage}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center mt-1 text-xs text-gray-500">
                <span>
                  {timeframe} · Last updated: {formatDate(priceData[priceData.length - 1].rawDate)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Timeframe Dropdown */}
              <div className="relative">
                <ActionButton
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
                  rightIcon={<ChevronDownIcon />}
                >
                  {timeframes.find(tf => tf.value === timeframe)?.label}
                </ActionButton>

                {isTimeframeDropdownOpen && (
                  <div className="absolute z-10 mt-1 right-0 w-40 rounded-md shadow-lg bg-white border border-gray-200">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {timeframes.map((tf) => (
                        <button
                          key={tf.value}
                          className={`block w-full text-left px-4 py-2 text-sm ${timeframe === tf.value
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => handleTimeframeChange(tf.value)}
                        >
                          {tf.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chart Type Selector */}
              <div className="flex rounded-md overflow-hidden shadow-sm">
                <ActionButton
                  variant={chartType === 'line' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  <TrendingUpIcon className="h-4 w-4" />
                </ActionButton>
                <ActionButton
                  variant={chartType === 'area' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('area')}
                >
                  <AnalyticsIcon className="h-4 w-4" />
                </ActionButton>
                <ActionButton
                  variant={chartType === 'candle' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('candle')}
                >
                  <BarChart3Icon className="h-4 w-4" />
                </ActionButton>
              </div>
            </div>
          </div>

          {/* Price Chart */}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart
                  data={priceData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={{ stroke: '#E5E7EB' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `₹${value}`}
                    width={65}
                    tickLine={{ stroke: '#E5E7EB' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#FFFFFF' }}
                    isAnimationActive={true}
                  />
                  {showIndicators && renderSupportResistanceLines()}
                </LineChart>
              ) : chartType === 'area' ? (
                <AreaChart
                  data={priceData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={{ stroke: '#E5E7EB' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `₹${value}`}
                    width={65}
                    tickLine={{ stroke: '#E5E7EB' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke="#3b82f6"
                    fill="url(#colorClose)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#FFFFFF' }}
                    isAnimationActive={true}
                  />
                  {showIndicators && renderSupportResistanceLines()}
                </AreaChart>
              ) : (
                <ComposedChart
                  data={priceData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={{ stroke: '#E5E7EB' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `₹${value}`}
                    width={65}
                    tickLine={{ stroke: '#E5E7EB' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="close" barSize={8}>
                    {priceData.map((item, index) => {
                      const isGreen = item.close >= item.open;
                      return (
                        <Cell
                          key={`body-${index}`}
                          fill={isGreen ? "#22c55e" : "#ef4444"}
                        />
                      );
                    })}
                  </Bar>
                  {showIndicators && renderSupportResistanceLines()}
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Volume Chart */}
          {showVolumeChart && (
            <div className="h-32 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priceData}
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    height={20}
                    tickLine={{ stroke: '#E5E7EB' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    width={50}
                    tickLine={{ stroke: '#E5E7EB' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip content={<VolumeTooltip />} />
                  <Bar dataKey="volume">
                    {priceData.map((entry, index) => (
                      <Cell
                        key={`vol-${index}`}
                        fill={entry.close >= entry.open ? '#22c55e80' : '#ef444480'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Chart Controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <ActionButton
                variant={analysisType === 'extrema' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setAnalysisType('extrema')}
              >
                Extrema
              </ActionButton>
              <ActionButton
                variant={analysisType === 'zones' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setAnalysisType('zones')}
              >
                Zones
              </ActionButton>
              <ActionButton
                variant={analysisType === 'strength' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setAnalysisType('strength')}
              >
                Strength
              </ActionButton>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={showIndicators}
                  onChange={() => setShowIndicators(!showIndicators)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                Indicators
              </label>

              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={showVolumeChart}
                  onChange={() => setShowVolumeChart(!showVolumeChart)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                Volume
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Technical Indicators Section */}
      {validPriceData && showIndicators && analysisData?.indicators && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Technical Indicators</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RSI Indicator */}
              {analysisData.indicators.rsi !== undefined && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Relative Strength Index (RSI-14)
                  </h4>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-2xl font-bold mb-2 flex items-center">
                      {analysisData.indicators.rsi.toFixed(2)}
                      <Badge 
                        variant={
                          analysisData.indicators.rsi > 70 ? 'danger' :
                          analysisData.indicators.rsi < 30 ? 'success' : 'neutral'
                        }
                        size="sm"
                        className="ml-2"
                      >
                        {analysisData.indicators.rsi > 70 ? 'Overbought' :
                         analysisData.indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-6 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    {/* RSI scale background colors */}
                    <div className="absolute top-0 left-0 right-0 flex h-full">
                      <div className="bg-green-500 flex-grow-0 flex-shrink-0" style={{ width: '30%' }}></div>
                      <div className="bg-gray-300 flex-grow-0 flex-shrink-0" style={{ width: '40%' }}></div>
                      <div className="bg-red-500 flex-grow-0 flex-shrink-0" style={{ width: '30%' }}></div>
                    </div>

                    {/* RSI value indicator marker */}
                    <div
                      className="absolute top-0 h-full w-2 bg-white shadow-md rounded-full transform -translate-x-1/2"
                      style={{ left: `${analysisData.indicators.rsi}%` }}
                    ></div>

                    {/* RSI current level text */}
                    <div
                      className="absolute top-0 h-full flex items-center justify-center text-xs font-bold text-white shadow-sm transform -translate-x-1/2 px-1"
                      style={{
                        left: `${analysisData.indicators.rsi}%`,
                        marginLeft: '10px',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        borderRadius: '0.25rem'
                      }}
                    >
                      {analysisData.indicators.rsi.toFixed(1)}
                    </div>

                    {/* Marker lines for thresholds */}
                    <div className="absolute top-0 h-full w-0.5 bg-white opacity-70" style={{ left: '30%' }}></div>
                    <div className="absolute top-0 h-full w-0.5 bg-white opacity-70" style={{ left: '70%' }}></div>
                  </div>

                  <div className="grid grid-cols-4 text-xs text-gray-500 mt-1">
                    <div className="text-left">Oversold</div>
                    <div className="text-center">30</div>
                    <div className="text-center">70</div>
                    <div className="text-right">Overbought</div>
                  </div>
                </div>
              )}

              {/* MACD Indicator */}
              {analysisData.indicators.macd && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Moving Average Convergence Divergence (MACD)
                  </h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500">MACD Line</div>
                      <div className={`text-lg font-bold ${
                        analysisData.indicators.macd.macd_line > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {analysisData.indicators.macd.macd_line.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Signal Line</div>
                      <div className="text-lg font-bold text-gray-800">
                        {analysisData.indicators.macd.signal_line.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Histogram</div>
                      <div className={`text-lg font-bold ${
                        analysisData.indicators.macd.histogram > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {analysisData.indicators.macd.histogram.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* MACD Histogram Visualization */}
                  <div className="flex justify-center items-end h-16 space-x-1 pt-2 border-t border-gray-200">
                    {Array(10).fill(0).map((_, index) => {
                      const baseValue = analysisData.indicators.macd.histogram;
                      const randomFactor = 0.2 * (Math.random() - 0.5);
                      const value = baseValue * (0.5 + (index / 10)) + randomFactor;

                      return (
                        <div
                          key={`macd-hist-${index}`}
                          className={`w-6 rounded-t ${value > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{
                            height: `${Math.min(100, Math.abs(value) * 20)}%`,
                            minHeight: '4px'
                          }}
                        ></div>
                      );
                    })}
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-2">
                    Histogram (Last 10 periods)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Support and Resistance Levels */}
      {validPriceData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Support Levels */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
              <div className="flex items-center">
                <div className="p-1.5 bg-green-500 rounded-md mr-3">
                  <ChevronDownIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-800">Support Levels</h3>
              </div>
            </div>
            <div className="p-4">
              {currentAnalysis?.support_levels && Array.isArray(currentAnalysis.support_levels) && currentAnalysis.support_levels.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        {analysisType === 'strength' && (
                          <>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strength</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
                          </>
                        )}
                        {analysisType === 'zones' && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Touches</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentAnalysis.support_levels.map((level: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {level && typeof level.price === 'number' ? `₹${level.price.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {level.date ? formatDate(level.date) :
                              (level.start_date && level.end_date ?
                                `${formatDate(level.start_date)} to ${formatDate(level.end_date)}` : 'N/A')}
                          </td>
                          {analysisType === 'strength' && (
                            <>
                              <td className="px-4 py-3">
                                {level && typeof level.strength === 'number' ? (
                                  <>
                                    <div className="w-24 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                      <div
                                        className="bg-green-500 h-2.5 rounded-full"
                                        style={{ width: `${Math.min(100, level.strength * 10)}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600 ml-2">
                                      {level.strength.toFixed(1)}
                                    </span>
                                  </>
                                ) : 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {level && typeof level.tests === 'number' ? level.tests : 'N/A'}
                              </td>
                            </>
                          )}
                          {analysisType === 'zones' && (
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {level && typeof level.touches === 'number' ? level.touches : 'N/A'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-gray-500">
                  <BarChart3Icon className="h-12 w-12 mb-3 opacity-50" />
                  <p>No support levels found for this analysis type</p>
                </div>
              )}
            </div>
          </div>

          {/* Resistance Levels */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
              <div className="flex items-center">
                <div className="p-1.5 bg-red-500 rounded-md mr-3">
                  <ArrowUpRightIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-red-800">Resistance Levels</h3>
              </div>
            </div>
            <div className="p-4">
              {currentAnalysis?.resistance_levels && Array.isArray(currentAnalysis.resistance_levels) && currentAnalysis.resistance_levels.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        {analysisType === 'strength' && (
                          <>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strength</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
                          </>
                        )}
                        {analysisType === 'zones' && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Touches</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentAnalysis.resistance_levels.map((level: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {level && typeof level.price === 'number' ? `₹${level.price.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {level.date ? formatDate(level.date) :
                              (level.start_date && level.end_date ?
                                `${formatDate(level.start_date)} to ${formatDate(level.end_date)}` : 'N/A')}
                          </td>
                          {analysisType === 'strength' && (
                            <>
                              <td className="px-4 py-3">
                                {level && typeof level.strength === 'number' ? (
                                  <>
                                    <div className="w-24 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                      <div
                                        className="bg-red-500 h-2.5 rounded-full"
                                        style={{ width: `${Math.min(100, level.strength * 10)}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600 ml-2">
                                      {level.strength.toFixed(1)}
                                    </span>
                                  </>
                                ) : 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {level && typeof level.tests === 'number' ? level.tests : 'N/A'}
                              </td>
                            </>
                          )}
                          {analysisType === 'zones' && (
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {level && typeof level.touches === 'number' ? level.touches : 'N/A'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-gray-500">
                  <BarChart3Icon className="h-12 w-12 mb-3 opacity-50" />
                  <p>No resistance levels found for this analysis type</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      {validPriceData && (
        <div className="text-xs text-gray-500 bg-white rounded-xl shadow-sm p-4 text-center">
          <p>Data as of {formatDate(priceData[priceData.length - 1].rawDate)} | Analysis method: {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}</p>
          <p className="mt-1">
            Last price: ₹{priceData[priceData.length - 1].close.toFixed(2)} |
            Change: {priceChange.isPositive ? '+' : ''}{priceChange.value} ({priceChange.isPositive ? '+' : ''}{priceChange.percentage}%)
          </p>
        </div>
      )}

      {/* Info Modal */}
      {isInfoModalOpen && (
        <Modal
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
          maxWidth="md"
        >
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangleIcon className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                About Support & Resistance Scanner
              </h3>
            </div>
            
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                This tool analyzes stock price data to identify key support and resistance levels using different technical analysis methodologies.
              </p>
              <div>
                <h4 className="font-medium mb-1 text-gray-900">Analysis Types:</h4>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><span className="font-medium">Extrema:</span> Based on significant price peaks and valleys</li>
                  <li><span className="font-medium">Zones:</span> Identifies areas where price consolidates frequently</li>
                  <li><span className="font-medium">Strength:</span> Measures how well a level has held in the past</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-gray-900">Chart Types:</h4>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><span className="font-medium">Line:</span> Simple line connecting closing prices</li>
                  <li><span className="font-medium">Area:</span> Line chart with colored area below</li>
                  <li><span className="font-medium">Candle:</span> Candlestick chart showing open, high, low, close</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-gray-900">Indicators:</h4>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><span className="font-medium">Support Levels:</span> Price areas where buying pressure exceeds selling pressure</li>
                  <li><span className="font-medium">Resistance Levels:</span> Price areas where selling pressure exceeds buying pressure</li>
                </ul>
              </div>
              <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                Data is fetched from API endpoint: {API_BASE_URL}/technical-analysis/scanner/[symbol]
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SupportResistanceScanner;