'use client';

import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '@/config';
import SearchInput from '@/components/shared/filters/SearchInput';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Modal from '@/components/shared/ui/modal/Modal';
import { 
  SearchIcon, 
  XIcon, 
  CalendarIcon, 
  TrendingUpIcon, 
  BarChart2Icon, 
  ArrowRightIcon,
  RefreshCwIcon,
  ChevronDownIcon,
  AlertCircleIcon,
  InfoIcon,
  DownloadIcon
} from '@/components/shared/icons';

interface Stock {
  _id: string;
  symbol: string;
  company_name: string;
}

interface HistoricData {
  date: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  priceChange?: number;
  volumeChange?: number;
  [key: string]: any;
}

const HistoricAnalysis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('3M');
  const [historicData, setHistoricData] = useState<HistoricData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'DAY' | 'WEEK' | 'MONTH'>('DAY');
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Predefined time ranges
  const timeRanges = [
    { label: '1M', full: 'Last Month', days: 30 },
    { label: '3M', full: 'Last 3 Months', days: 90 },
    { label: '6M', full: 'Last 6 Months', days: 180 },
    { label: '1Y', full: 'Last Year', days: 365 },
    { label: '2Y', full: 'Last 2 Years', days: 730 },
    { label: '5Y', full: 'Last 5 Years', days: 1825 }
  ];

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

  const searchStocks = async (value: string) => {
    if (value.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/equity?search_field=symbol&search_value=${value}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSearchResults(data.data);
        setShowDropdown(true);
      } else {
        setError(data.message || 'Failed to search stocks');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
      setError('An error occurred while searching. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    searchStocks(value);
  };

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    setSearchTerm(stock.symbol);
    setShowDropdown(false);
  };

  const handleAnalyze = async () => {
    if (!selectedStock) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/historic-analysis?symbol=${selectedStock.symbol}&period=${activeTab}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setHistoricData(Array.isArray(result.data) ? result.data : []);
        setShowResults(true);
      } else {
        throw new Error(result.message || 'Failed to fetch historic data');
      }
    } catch (error) {
      console.error('Error fetching historic data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch historic data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedStock(null);
    setSearchTerm('');
    setShowDropdown(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleTimeRangeSelect = (range: string) => {
    setSelectedTimeRange(range);
  };

  const formatDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatNumber = (value: any, decimals = 2): string => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'N/A';
    }
    return value.toFixed(decimals);
  };

  const formatVolume = (value: any): string => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'N/A';
    }
    return value.toLocaleString();
  };

  const getValueColor = (value: any): string => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'text-gray-600';
    }
    return value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600';
  };

  const exportToCsv = () => {
    if (!historicData.length) return;
    
    try {
      const headers = Object.keys(historicData[0]).join(',');
      const rows = historicData.map(row => 
        Object.values(row)
          .map(value => 
            typeof value === 'string' ? `"${value}"` : value
          )
          .join(',')
      );
      
      const csvContent = [headers, ...rows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedStock?.symbol}_historic_${activeTab.toLowerCase()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <BarChart2Icon className="h-5 w-5 mr-2 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900">Historic Data Analysis</h2>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Analyze historical price movements, patterns, and support/resistance levels
      </p>

      <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 relative" ref={dropdownRef}>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Stock Symbol
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isLoading ? (
                  <RefreshCwIcon className="h-5 w-5 text-gray-500 animate-spin" />
                ) : (
                  <SearchIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:outline-none bg-white border border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600"
                placeholder="Enter stock symbol (e.g., RELIANCE, HDFCBANK)"
              />
              {selectedStock && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto bg-white border border-gray-200">
                {searchResults.length > 0 ? (
                  searchResults.map((stock) => (
                    <div
                      key={stock._id}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-50 text-gray-700"
                      onClick={() => handleStockSelect(stock)}
                    >
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-gray-500">{stock.company_name}</div>
                    </div>
                  ))
                ) : searchTerm.length >= 2 && !isLoading ? (
                  <div className="px-4 py-3 text-center text-gray-500">
                    No stocks found matching "{searchTerm}"
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Time Range
            </label>
            <div className="flex flex-wrap gap-2">
              {timeRanges.map(range => (
                <button
                  key={range.label}
                  type="button"
                  onClick={() => handleTimeRangeSelect(range.label)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    selectedTimeRange === range.label
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={`From ${formatDate(range.days)} to today`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-start">
            <AlertCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {selectedStock && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="text-sm font-medium text-blue-600">
                  Selected Stock
                </div>
                <div className="font-medium text-gray-800">
                  {selectedStock.symbol} - {selectedStock.company_name}
                </div>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>{selectedTimeRange} Analysis</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <ActionButton
            type="submit"
            disabled={!selectedStock || loading}
            leftIcon={<TrendingUpIcon className="h-5 w-5" />}
            rightIcon={<ArrowRightIcon className="h-4 w-4" />}
            variant="primary"
          >
            {loading ? 'Analyzing...' : 'Analyze History'}
          </ActionButton>
        </div>
      </form>

      {/* Help text - expandable */}
      <div className="mt-6 text-gray-700">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsHelpExpanded(!isHelpExpanded)}
        >
          <div className="flex items-center">
            <InfoIcon className="h-5 w-5 mr-2 text-blue-500" />
            <h3 className="font-medium">About Historical Analysis</h3>
          </div>
          <ChevronDownIcon className={`h-5 w-5 transition-transform ${isHelpExpanded ? 'transform rotate-180' : ''}`} />
        </div>
        
        {isHelpExpanded && (
          <div className="mt-3 p-4 rounded-lg text-sm bg-gray-50">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="h-1.5 w-1.5 rounded-full mt-1.5 mr-2 bg-blue-500"></div>
                <p>Analyze historical price movements and identify key support/resistance levels over time</p>
              </div>
              <div className="flex items-start">
                <div className="h-1.5 w-1.5 rounded-full mt-1.5 mr-2 bg-blue-500"></div>
                <p>Identify trends, patterns, and key reversal points in the stock's price history</p>
              </div>
              <div className="flex items-start">
                <div className="h-1.5 w-1.5 rounded-full mt-1.5 mr-2 bg-blue-500"></div>
                <p>Visualize volume patterns and their correlation with price movements</p>
              </div>
              <div className="flex items-start">
                <div className="h-1.5 w-1.5 rounded-full mt-1.5 mr-2 bg-blue-500"></div>
                <p>Understand how the stock has responded to major market events and news catalysts</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Modal */}
      <Modal isOpen={showResults} onClose={() => setShowResults(false)} maxWidth="7xl">
        <div className="h-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">
            Historic Data Analysis
          </h2>
          
          <div className="text-sm text-gray-600 mb-4">
            Analyzing {selectedStock?.company_name || 'Stock'} ({selectedStock?.symbol || ''})
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('DAY')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'DAY' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setActiveTab('WEEK')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'WEEK' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setActiveTab('MONTH')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'MONTH' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="flex justify-end mb-4">
            <ActionButton
              onClick={exportToCsv}
              disabled={!historicData.length}
              leftIcon={<DownloadIcon className="h-5 w-5" />}
              variant="secondary"
              size="sm"
            >
              Export CSV
            </ActionButton>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-[600px]">
              <div className="flex flex-col items-center text-gray-500">
                <RefreshCwIcon className="h-12 w-12 mb-4 animate-spin" />
                <p>Loading historic data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[650px] border rounded-lg bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Open</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">High</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Low</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Close</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Volume</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Price Change %</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Volume Change %</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historicData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-4 text-center text-gray-500">
                        No historic data available for the selected period.
                      </td>
                    </tr>
                  ) : (
                    historicData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm whitespace-nowrap">{row.date || 'N/A'}</td>
                        <td className="px-4 py-2 text-sm whitespace-nowrap">{formatNumber(row.open)}</td>
                        <td className="px-4 py-2 text-sm whitespace-nowrap">{formatNumber(row.high)}</td>
                        <td className="px-4 py-2 text-sm whitespace-nowrap">{formatNumber(row.low)}</td>
                        <td className="px-4 py-2 text-sm whitespace-nowrap">{formatNumber(row.close)}</td>
                        <td className="px-4 py-2 text-sm whitespace-nowrap">{formatVolume(row.volume)}</td>
                        <td className={`px-4 py-2 text-sm whitespace-nowrap ${getValueColor(row.priceChange)}`}>
                          {typeof row.priceChange === 'number' ? `${formatNumber(row.priceChange)}%` : 'N/A'}
                        </td>
                        <td className={`px-4 py-2 text-sm whitespace-nowrap ${getValueColor(row.volumeChange)}`}>
                          {typeof row.volumeChange === 'number' ? `${formatNumber(row.volumeChange)}%` : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default HistoricAnalysis;

