'use client';

import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '@/config';
import SearchInput from '@/components/shared/filters/SearchInput';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Modal from '@/components/shared/ui/modal/Modal';
import { 
  SearchIcon, 
  XIcon, 
  BarChart2Icon, 
  TrendingUpIcon, 
  CalendarIcon, 
  RefreshCwIcon,
  ChevronDownIcon,
  AlertCircleIcon,
  DownloadIcon
} from '@/components/shared/icons';

interface Stock {
  _id: string;
  symbol: string;
  company_name: string;
}

interface BenchmarkData {
  date: string;
  currentPrice?: number;
  benchmarkPrice?: number;
  priceChange?: number;
  currentVolume?: number;
  benchmarkVolume?: number;
  volumeChange?: number;
  [key: string]: any;
}

const BenchmarkAnalysis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [days, setDays] = useState(20);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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

    setIsSearching(true);
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
    setSearchTerm(stock.symbol);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedStock(null);
    setSearchTerm('');
    setShowDropdown(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setDays(Math.max(1, value));
    } else {
      setDays(1);
    }
  };

  const fetchBenchmarkData = async () => {
    if (!selectedStock) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/analysis/benchmark?symbol=${selectedStock.symbol}&days=${days}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setBenchmarkData(Array.isArray(result.data) ? result.data : []);
        setShowResults(true);
      } else {
        throw new Error(result.message || 'Failed to fetch benchmark data');
      }
    } catch (error) {
      console.error('Error fetching benchmark data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch benchmark data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStock) {
      fetchBenchmarkData();
    }
  };

  const exportToCsv = () => {
    if (!benchmarkData.length) return;
    
    try {
      const headers = Object.keys(benchmarkData[0]).join(',');
      const rows = benchmarkData.map(row => 
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
      link.setAttribute('download', `${selectedStock?.symbol}_benchmark_${days}days.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
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

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <BarChart2Icon className="h-5 w-5 mr-2 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-800">Benchmark Analysis</h2>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Compare stock performance against industry benchmarks and identify relative strength
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative" ref={dropdownRef}>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Stock Symbol
            </label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg focus:ring-2 focus:outline-none bg-white border border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600"
                placeholder="Enter stock symbol..."
              />
              {isSearching ? (
                <RefreshCwIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 animate-spin" />
              ) : (
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              )}
              {selectedStock && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto bg-white border border-gray-200">
                {searchResults.length > 0 ? (
                  searchResults.map((stock) => (
                    <div
                      key={stock._id}
                      className="px-4 py-2.5 cursor-pointer hover:bg-gray-100 text-gray-700"
                      onClick={() => handleStockSelect(stock)}
                    >
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-gray-500">{stock.company_name}</div>
                    </div>
                  ))
                ) : searchTerm.length >= 2 && !isSearching ? (
                  <div className="px-4 py-3 text-center text-gray-500">
                    No stocks found matching "{searchTerm}"
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Lookback Period
            </label>
            <div className="relative">
              <input
                type="number"
                value={days}
                onChange={handleDaysChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:outline-none bg-white border border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600"
                min="1"
                placeholder="Days"
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
          </div>

          <div className="flex items-end">
            <ActionButton
              type="submit"
              disabled={!selectedStock || days < 1 || loading}
              leftIcon={<TrendingUpIcon className="h-5 w-5" />}
              variant="primary"
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </ActionButton>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center">
            <AlertCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {selectedStock && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">
                  Selected Stock
                </div>
                <div className="font-medium text-gray-800">
                  {selectedStock.symbol} - {selectedStock.company_name}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">{days}</span> day{days !== 1 ? 's' : ''} of analysis
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Help text */}
      <div className="mt-5 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          <div className="flex items-start">
            <div className="h-1.5 w-1.5 rounded-full mt-1.5 mr-2 bg-blue-500"></div>
            <p>Compare a stock's performance to its sector and broader market indices</p>
          </div>
          <div className="flex items-start mt-1">
            <div className="h-1.5 w-1.5 rounded-full mt-1.5 mr-2 bg-blue-500"></div>
            <p>Identify relative strength against competitors and market benchmarks</p>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      <Modal isOpen={showResults} onClose={() => setShowResults(false)} maxWidth="7xl">
        <div className="p-0 bg-white rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-blue-700">
                  Benchmark Analysis Results
                </h2>
                
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <BarChart2Icon className="h-4 w-4" />
                    <span>Analyzing {selectedStock?.company_name || 'Stock'} ({selectedStock?.symbol || ''}) for the last {days} days</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <ActionButton
                  onClick={exportToCsv}
                  disabled={!benchmarkData.length}
                  leftIcon={<DownloadIcon className="h-5 w-5" />}
                  variant="secondary"
                  size="sm"
                >
                  Export CSV
                </ActionButton>
                
                <ActionButton
                  onClick={() => setShowResults(false)}
                  leftIcon={<XIcon className="h-5 w-5" />}
                  variant="secondary"
                  size="sm"
                >
                  Close
                </ActionButton>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-hidden bg-white">
            {loading ? (
              <div className="flex justify-center items-center h-[400px]">
                <div className="flex flex-col items-center text-gray-500">
                  <RefreshCwIcon className="h-12 w-12 mb-4 animate-spin" />
                  <p>Loading benchmark data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="m-6 p-4 rounded-lg flex items-start bg-red-50 text-red-600 border border-red-200">
                <AlertCircleIcon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Error Loading Data</p>
                  <p>{error}</p>
                </div>
              </div>
            ) : (
              <div className="overflow-auto max-h-[600px]">
                <table className="min-w-full border-collapse text-gray-800">
                  <thead className="sticky top-0 bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Price</th>
                      <th className="px-4 py-3 text-left font-medium">Benchmark Price</th>
                      <th className="px-4 py-3 text-left font-medium">Price Diff %</th>
                      <th className="px-4 py-3 text-left font-medium">Volume</th>
                      <th className="px-4 py-3 text-left font-medium">Benchmark Vol</th>
                      <th className="px-4 py-3 text-left font-medium">Volume Diff %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {benchmarkData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <CalendarIcon className="h-8 w-8 mb-2 opacity-50" />
                            <p>No benchmark data available for the selected period.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      benchmarkData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            {row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-800">
                            {typeof row.currentPrice === 'number' ? `₹${formatNumber(row.currentPrice)}` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-800">
                            {typeof row.benchmarkPrice === 'number' ? `₹${formatNumber(row.benchmarkPrice)}` : 'N/A'}
                          </td>
                          <td className={`px-4 py-3 text-sm whitespace-nowrap ${getValueColor(row.priceChange)}`}>
                            {typeof row.priceChange === 'number' ? `${formatNumber(row.priceChange)}%` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-800">
                            {formatVolume(row.currentVolume)}
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-800">
                            {formatVolume(row.benchmarkVolume)}
                          </td>
                          <td className={`px-4 py-3 text-sm whitespace-nowrap ${getValueColor(row.volumeChange)}`}>
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
          
          {/* Footer */}
          <div className="p-4 text-xs bg-gray-50 text-gray-500 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                Data as of {new Date().toLocaleDateString()} • {benchmarkData.length} days of benchmark data
              </div>
              <div>
                All percentages are relative to sector benchmarks
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BenchmarkAnalysis;
