'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowUpRightIcon
} from '@/components/shared/icons';
import { API_BASE_URL } from '@/config';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Badge from '@/components/shared/ui/badge/Badge';
import Modal from '@/components/shared/ui/modal/Modal';

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

  // Handle symbol submit
  const handleSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbolInput.trim()) {
      const formattedSymbol = symbolInput.trim().toUpperCase();
      setSymbol(formattedSymbol);
    }
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
        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg bg-white dark:bg-gray-800">
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
              <p className="text-sm mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
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
        <div className="p-2 border border-gray-200 dark:border-gray-700 rounded shadow-lg bg-white dark:bg-gray-800">
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
            ? 'bg-green-50 text-green-600 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30' 
            : notification.type === 'warning'
              ? 'bg-yellow-50 text-yellow-600 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/30'
              : 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30'
        }`}>
          {notification.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
          {notification.type === 'warning' && <AlertTriangleIcon className="h-5 w-5" />}
          {notification.type === 'error' && <XCircleIcon className="h-5 w-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Support & Resistance Scanner</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Analyze technical patterns and key price levels
            </p>
          </div>
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => setIsInfoModalOpen(true)}
            leftIcon={<AlertTriangleIcon />}
          >
            Info
          </ActionButton>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSymbolSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter stock symbol (e.g., TCS, RELIANCE)"
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <ActionButton
            type="submit"
            variant="primary"
            size="sm"
          >
            Analyze
          </ActionButton>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-xl flex items-start">
          <AlertTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* No Symbol State */}
      {!symbol && !loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="mb-8">
            <div className="mx-auto h-32 w-32 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <BarChart3Icon className="h-16 w-16 text-blue-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Support & Resistance Scanner
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {/* Stock Info and Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{symbol}</h1>
              </div>

              <div className="flex items-center mt-1">
                <span className="text-2xl font-semibold text-gray-900 dark:text-white">
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

              <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                  <div className="absolute z-10 mt-1 right-0 w-40 rounded-md shadow-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {timeframes.map((tf) => (
                        <button
                          key={tf.value}
                          className={`block w-full text-left px-4 py-2 text-sm ${timeframe === tf.value
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-600'
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Technical Indicators</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RSI Indicator */}
              {analysisData.indicators.rsi !== undefined && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                    {/* RSI scale background colors */}
                    <div className="absolute top-0 left-0 right-0 flex h-full">
                      <div className="bg-green-500 flex-grow-0 flex-shrink-0" style={{ width: '30%' }}></div>
                      <div className="bg-gray-300 dark:bg-gray-600 flex-grow-0 flex-shrink-0" style={{ width: '40%' }}></div>
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

                  <div className="grid grid-cols-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <div className="text-left">Oversold</div>
                    <div className="text-center">30</div>
                    <div className="text-center">70</div>
                    <div className="text-right">Overbought</div>
                  </div>
                </div>
              )}

              {/* MACD Indicator */}
              {analysisData.indicators.macd && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Moving Average Convergence Divergence (MACD)
                  </h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">MACD Line</div>
                      <div className={`text-lg font-bold ${
                        analysisData.indicators.macd.macd_line > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {analysisData.indicators.macd.macd_line.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Signal Line</div>
                      <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {analysisData.indicators.macd.signal_line.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Histogram</div>
                      <div className={`text-lg font-bold ${
                        analysisData.indicators.macd.histogram > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {analysisData.indicators.macd.histogram.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* MACD Histogram Visualization */}
                  <div className="flex justify-center items-end h-16 space-x-1 pt-2 border-t border-gray-200 dark:border-gray-700">
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
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border-b border-green-200 dark:border-green-800/30">
              <div className="flex items-center">
                <div className="p-1.5 bg-green-500 rounded-md mr-3">
                  <ChevronDownIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Support Levels</h3>
              </div>
            </div>
            <div className="p-4">
              {currentAnalysis?.support_levels && Array.isArray(currentAnalysis.support_levels) && currentAnalysis.support_levels.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        {analysisType === 'strength' && (
                          <>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Strength</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tests</th>
                          </>
                        )}
                        {analysisType === 'zones' && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Touches</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {currentAnalysis.support_levels.map((level: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {level && typeof level.price === 'number' ? `₹${level.price.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {level.date ? formatDate(level.date) :
                              (level.start_date && level.end_date ?
                                `${formatDate(level.start_date)} to ${formatDate(level.end_date)}` : 'N/A')}
                          </td>
                          {analysisType === 'strength' && (
                            <>
                              <td className="px-4 py-3">
                                {level && typeof level.strength === 'number' ? (
                                  <>
                                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                      <div
                                        className="bg-green-500 h-2.5 rounded-full"
                                        style={{ width: `${Math.min(100, level.strength * 10)}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600 dark:text-gray-300 ml-2">
                                      {level.strength.toFixed(1)}
                                    </span>
                                  </>
                                ) : 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                {level && typeof level.tests === 'number' ? level.tests : 'N/A'}
                              </td>
                            </>
                          )}
                          {analysisType === 'zones' && (
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                              {level && typeof level.touches === 'number' ? level.touches : 'N/A'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <BarChart3Icon className="h-12 w-12 mb-3 opacity-50" />
                  <p>No support levels found for this analysis type</p>
                </div>
              )}
            </div>
          </div>

          {/* Resistance Levels */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-b border-red-200 dark:border-red-800/30">
              <div className="flex items-center">
                <div className="p-1.5 bg-red-500 rounded-md mr-3">
                  <ArrowUpRightIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Resistance Levels</h3>
              </div>
            </div>
            <div className="p-4">
              {currentAnalysis?.resistance_levels && Array.isArray(currentAnalysis.resistance_levels) && currentAnalysis.resistance_levels.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        {analysisType === 'strength' && (
                          <>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Strength</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tests</th>
                          </>
                        )}
                        {analysisType === 'zones' && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Touches</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {currentAnalysis.resistance_levels.map((level: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {level && typeof level.price === 'number' ? `₹${level.price.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {level.date ? formatDate(level.date) :
                              (level.start_date && level.end_date ?
                                `${formatDate(level.start_date)} to ${formatDate(level.end_date)}` : 'N/A')}
                          </td>
                          {analysisType === 'strength' && (
                            <>
                              <td className="px-4 py-3">
                                {level && typeof level.strength === 'number' ? (
                                  <>
                                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                      <div
                                        className="bg-red-500 h-2.5 rounded-full"
                                        style={{ width: `${Math.min(100, level.strength * 10)}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600 dark:text-gray-300 ml-2">
                                      {level.strength.toFixed(1)}
                                    </span>
                                  </>
                                ) : 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                {level && typeof level.tests === 'number' ? level.tests : 'N/A'}
                              </td>
                            </>
                          )}
                          {analysisType === 'zones' && (
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                              {level && typeof level.touches === 'number' ? level.touches : 'N/A'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
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
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center">
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangleIcon className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                About Support & Resistance Scanner
              </h3>
            </div>
            
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <p>
                This tool analyzes stock price data to identify key support and resistance levels using different technical analysis methodologies.
              </p>
              <div>
                <h4 className="font-medium mb-1 text-gray-900 dark:text-white">Analysis Types:</h4>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><span className="font-medium">Extrema:</span> Based on significant price peaks and valleys</li>
                  <li><span className="font-medium">Zones:</span> Identifies areas where price consolidates frequently</li>
                  <li><span className="font-medium">Strength:</span> Measures how well a level has held in the past</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-gray-900 dark:text-white">Chart Types:</h4>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><span className="font-medium">Line:</span> Simple line connecting closing prices</li>
                  <li><span className="font-medium">Area:</span> Line chart with colored area below</li>
                  <li><span className="font-medium">Candle:</span> Candlestick chart showing open, high, low, close</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-gray-900 dark:text-white">Indicators:</h4>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><span className="font-medium">Support Levels:</span> Price areas where buying pressure exceeds selling pressure</li>
                  <li><span className="font-medium">Resistance Levels:</span> Price areas where selling pressure exceeds buying pressure</li>
                </ul>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
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