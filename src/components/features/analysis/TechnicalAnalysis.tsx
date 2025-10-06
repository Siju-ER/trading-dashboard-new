'use client';

import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '@/config';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import SummaryCard from './SummaryCard';
import DetailedAnalysis from './DetailedAnalysis';
import { 
  SearchIcon, 
  XIcon, 
  CalendarIcon, 
  RefreshCwIcon,
  AlertCircleIcon,
  ActivityIcon,
  ArrowRightIcon
} from '@/components/shared/icons';

interface Stock {
  _id: string;
  symbol: string;
  company_name: string;
}

interface TechnicalAnalysis {
  symbol: string;
  date: string;
  overall_signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  bullish_reasons: string[];
  bearish_reasons: string[];
  bullish_trade: {
    entry_trigger_price: number;
    stop_loss_price: number;
    risk_per_share: number;
    target_price: number;
    position_size_shares: number;
  };
  bearish_trade: {
    entry_trigger_price: number;
    stop_loss_price: number;
    risk_per_share: number;
    target_price: number;
    position_size_shares: number;
  };
  technical_indicators_snapshot: {
    price: number;
    volume: number;
    [key: string]: any;
  };
  [key: string]: any;
}

const TechnicalAnalysis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<TechnicalAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [sections, setSections] = useState<any[]>([]);
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
      const response = await fetch(`${API_BASE_URL}/technical-analysis/${selectedStock.symbol}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        const sortedData = Array.isArray(result.data) 
          ? result.data.sort((a: TechnicalAnalysis, b: TechnicalAnalysis) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            )
          : [];
        setAnalysisData(sortedData);
      } else {
        throw new Error(result.message || 'Failed to fetch analysis data');
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching analysis data');
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


  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <ActivityIcon className="h-5 w-5 mr-2 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900">Technical Analysis</h2>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Comprehensive technical analysis with indicators, signals, and trade setups
      </p>

      <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative" ref={dropdownRef}>
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

          <div className="flex items-end">
            <ActionButton
              type="submit"
              disabled={!selectedStock || loading}
              leftIcon={<ActivityIcon className="h-5 w-5" />}
              rightIcon={<ArrowRightIcon className="h-4 w-4" />}
              variant="primary"
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze Technicals'}
            </ActionButton>
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
                <span>Technical Analysis</span>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Analysis Results - Rendered directly on page */}
      {analysisData.length > 0 && (
        <div className="mt-8 space-y-6">
          {/* Summary Card - Shows the most recent analysis */}
          <div className="mb-6">
            <SummaryCard data={analysisData[0]} />
          </div>

          {/* Detailed Technical Analysis - With horizontal scroll */}
          <div className="border rounded-lg shadow-md overflow-hidden">
            <DetailedAnalysis analysisData={analysisData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalAnalysis;
