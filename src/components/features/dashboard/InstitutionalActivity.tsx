// src/components/features/dashboard/InstitutionalActivity.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config';

// Built-in SVG Icons
const BriefcaseIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0h8m-8 0a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2" />
  </svg>
);

const UsersIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const TrendingUpIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const CalendarIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const RefreshIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const EyeIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

interface InstitutionalData {
  date: Date;
  location?: string;
  fii: {
    buy: number;
    sell: number;
    net: number;
  };
  dii: {
    buy: number;
    sell: number;
    net: number;
  };
}

interface InstitutionalActivityProps {
  isDarkMode?: boolean;
}

const InstitutionalActivity: React.FC<InstitutionalActivityProps> = ({ 
  isDarkMode = false 
}) => {
  // All hooks declared at the top level
  const [data, setData] = useState<InstitutionalData | null>(null);
  const [historicalData, setHistoricalData] = useState<InstitutionalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHistorical, setShowHistorical] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [error, setError] = useState<string | null>(null);

  // API fetch function
  const fetchInstitutionalData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/institutional-activity/history`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success' && result.data && result.data.length > 0) {
        // Convert API response to our data format
       const formattedData = result.data.map((item: any) => ({
  date: new Date(item.activity_date),
  location: item.location,
  fii: {
    buy: item.foreign_institution.buy_value,
    sell: item.foreign_institution.sell_value,
    net: item.foreign_institution.net_value
  },
  dii: {
    buy: item.domestic_institution.buy_value,
    sell: item.domestic_institution.sell_value,
    net: item.domestic_institution.net_value
  }
})).reverse(); // ← ADD THIS .reverse() to show latest dates first
        
        // Set the latest data as current data
        setData(formattedData[0]);
        
        // Set all data as historical data
        setHistoricalData(formattedData);
        setError(null);
      } else {
        throw new Error('No institutional data available');
      }
    } catch (err) {
      console.error('Error fetching institutional data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch institutional data');
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchInstitutionalData();
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchInstitutionalData();
    setIsRefreshing(false);
  };

  // Utility functions
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(Math.abs(value));
  };

  const getValueColor = (value: number) => {
    return value >= 0 
      ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600' 
      : isDarkMode ? 'text-rose-400' : 'text-rose-600';
  };

  const getValueBg = (value: number) => {
    return value >= 0 
      ? isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50' 
      : isDarkMode ? 'bg-rose-900/20' : 'bg-rose-50';
  };

  // Activity Card Component
  const ActivityCard = ({ 
    title, 
    icon, 
    buyValue, 
    sellValue, 
    netValue, 
    delay = 0 
  }: {
    title: string;
    icon: React.ReactNode;
    buyValue: number;
    sellValue: number;
    netValue: number;
    delay?: number;
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isPositive = netValue >= 0;

    return (
      <div 
        className={`relative overflow-hidden rounded-xl p-6 transition-all duration-500 hover:scale-105 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-slate-600' 
            : 'bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:border-slate-300'
        } shadow-lg hover:shadow-xl group`}
        style={{ animationDelay: `${delay}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated background */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${
          isPositive ? 'bg-gradient-to-r from-emerald-500 to-blue-500' : 'bg-gradient-to-r from-rose-500 to-orange-500'
        }`}></div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
            isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}>
            {icon}
          </div>
          <div>
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {title}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Today's Activity
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-4">
          {/* Buy/Sell Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'} group-hover:bg-opacity-80 transition-all duration-300`}>
              <div className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-1 uppercase tracking-wide`}>
                Buy Value
              </div>
              <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} transition-transform duration-300 ${
                isHovered ? 'scale-105' : ''
              }`}>
                ₹{formatValue(buyValue)} Cr
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'} group-hover:bg-opacity-80 transition-all duration-300`}>
              <div className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-1 uppercase tracking-wide`}>
                Sell Value
              </div>
              <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} transition-transform duration-300 ${
                isHovered ? 'scale-105' : ''
              }`}>
                ₹{formatValue(sellValue)} Cr
              </div>
            </div>
          </div>

          {/* Net Value - Featured */}
          <div className={`p-4 rounded-lg ${getValueBg(netValue)} border-2 ${
            isPositive 
              ? isDarkMode ? 'border-emerald-800' : 'border-emerald-200' 
              : isDarkMode ? 'border-rose-800' : 'border-rose-200'
          } transition-all duration-300`}>
            <div className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-2 uppercase tracking-wide`}>
              Net Flow
            </div>
            <div className={`flex items-center gap-2 ${getValueColor(netValue)}`}>
              <div className={`transition-transform duration-300 ${isHovered ? 'scale-125' : ''}`}>
                {isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
              </div>
              <div className="text-2xl font-bold">
                ₹{formatValue(netValue)} Cr
              </div>
            </div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isPositive ? 'Net Inflow' : 'Net Outflow'}
            </div>
          </div>
        </div>

        {/* Hover glow effect */}
        <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
          isPositive 
            ? 'shadow-[0_0_30px_rgba(16,185,129,0.4)]' 
            : 'shadow-[0_0_30px_rgba(248,113,113,0.4)]'
        }`}></div>
      </div>
    );
  };

  // Historical Chart Component
  const HistoricalChart = () => (
    <div className={`mt-6 p-6 rounded-xl ${
      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    } border`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Historical Trends
        </h3>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedPeriod === period
                  ? isDarkMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-500 text-white'
                  : isDarkMode 
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
          <thead className={isDarkMode ? 'bg-slate-900/30' : 'bg-slate-50'}>
            <tr>
              <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider`}>
                Date
              </th>
              <th className={`px-4 py-3 text-center text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider`}>
                FII Net
              </th>
              <th className={`px-4 py-3 text-center text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider`}>
                DII Net
              </th>
              <th className={`px-4 py-3 text-center text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider`}>
                Combined Flow
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
            {historicalData.map((item, index) => {
              const combinedFlow = item.fii.net + item.dii.net;
              return (
                <tr key={index} className={`${isDarkMode ? 'hover:bg-slate-750' : 'hover:bg-slate-50'} transition-colors`}>
                  <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {item.date.toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </td>
                  <td className={`px-4 py-3 text-sm text-center font-medium ${getValueColor(item.fii.net)}`}>
                    <div className="flex items-center justify-center gap-1">
                      {item.fii.net >= 0 ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDownIcon className="h-3 w-3" />}
                      ₹{formatValue(item.fii.net)}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm text-center font-medium ${getValueColor(item.dii.net)}`}>
                    <div className="flex items-center justify-center gap-1">
                      {item.dii.net >= 0 ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDownIcon className="h-3 w-3" />}
                      ₹{formatValue(item.dii.net)}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm text-center font-bold ${getValueColor(combinedFlow)}`}>
                    <div className="flex items-center justify-center gap-1">
                      {combinedFlow >= 0 ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDownIcon className="h-3 w-3" />}
                      ₹{formatValue(combinedFlow)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={`${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      } rounded-xl shadow-lg border p-6`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className={`h-6 w-64 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
            <div className={`h-8 w-8 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className={`h-64 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-xl`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      } rounded-xl shadow-lg border p-6`}>
        <div className="flex items-center gap-3 text-red-500 dark:text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium">Error Loading Institutional Data</p>
            <p className="text-sm opacity-75">{error}</p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-slate-700 text-white hover:bg-slate-600'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Try Again
        </button>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className={`${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      } rounded-xl shadow-lg border p-6`}>
        <div className="text-center py-8">
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            No institutional data available
          </p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className={`${
      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    } rounded-xl shadow-lg border overflow-hidden`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'
            }`}>
              <BriefcaseIcon />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Institutional Activity
              </h2>
              <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <CalendarIcon />
                <span>{data.date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
                {data.location && <span>• {data.location}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistorical(!showHistorical)}
              className={`p-2 rounded-xl transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              } hover:scale-110`}
            >
              <EyeIcon />
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-xl transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              } ${isRefreshing ? 'opacity-50' : 'hover:scale-110'}`}
            >
              <RefreshIcon className={`${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityCard
            title="Foreign Institutional Investors"
            icon={<BriefcaseIcon className="h-5 w-5" />}
            buyValue={data.fii.buy}
            sellValue={data.fii.sell}
            netValue={data.fii.net}
            delay={0}
          />
          
          <ActivityCard
            title="Domestic Institutional Investors"
            icon={<UsersIcon className="h-5 w-5" />}
            buyValue={data.dii.buy}
            sellValue={data.dii.sell}
            netValue={data.dii.net}
            delay={200}
          />
        </div>

        {/* Combined Summary */}
        <div className={`mt-6 p-6 rounded-xl ${
          isDarkMode 
            ? 'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-slate-200'
        } border`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Combined Net Flow
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Total institutional activity
              </p>
            </div>
            <div className={`text-right`}>
              <div className={`text-3xl font-bold ${getValueColor(data.fii.net + data.dii.net)}`}>
                ₹{formatValue(data.fii.net + data.dii.net)} Cr
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {data.fii.net + data.dii.net >= 0 ? 'Net Inflow' : 'Net Outflow'}
              </div>
            </div>
          </div>
        </div>

        {/* Historical Data */}
        {showHistorical && <HistoricalChart />}
      </div>
    </div>
  );
};

export default InstitutionalActivity;