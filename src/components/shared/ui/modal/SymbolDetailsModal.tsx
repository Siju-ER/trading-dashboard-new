'use client';

import React, { useEffect, useState } from 'react';
import Modal from '@/components/shared/ui/modal/Modal';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Badge from '@/components/shared/ui/badge/Badge';
import { API_BASE_URL } from '@/config';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon } from '@/components/shared/icons';

interface SymbolDetailsModalProps {
  isOpen: boolean;
  symbol?: string;
  onClose: () => void;
}

type EquityDetailsResponse = {
  status: string;
  data?: any;
  message?: string;
};

const SymbolDetailsModal: React.FC<SymbolDetailsModalProps> = ({ isOpen, symbol, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('company');
  const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(new Set());

  // Debug: Log details state changes
  useEffect(() => {
    console.log('Details state changed:', details);
    if (details) {
      console.log('Details keys:', Object.keys(details));
    }
  }, [details]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!isOpen || !symbol) return;
      setIsLoading(true);
      setError(null);
      setDetails(null);
      try {
        console.log('Fetching equity details for symbol:', symbol);
        const res = await fetch(`${API_BASE_URL}/equity-details?symbol=${encodeURIComponent(symbol)}`);
        const json: EquityDetailsResponse = await res.json();
               console.log('API Response:', json);
               if (json.status === 'success' && json.data) {
                 console.log('Setting details:', json.data);
                 console.log('Available keys in response:', Object.keys(json.data));
                 console.log('Checking for date keys in response data...');
                 const responseDateKeys = Object.keys(json.data).filter(k => k.includes('T') && k.includes('Z'));
                 console.log('Date keys found in response:', responseDateKeys);
                 setDetails(json.data);
        } else {
          console.log('API Error:', json.message);
          console.log('Full API response:', json);
          setError(json.message || 'Failed to load details');
        }
      } catch (e) {
        console.error('Fetch error:', e);
        setError('Unable to fetch details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [isOpen, symbol]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to get change indicator
  const getChangeIndicator = (value: number | undefined) => {
    if (value === undefined) return null;
    if (value > 0) return <ArrowUpIcon className="w-4 h-4 text-green-600" />;
    if (value < 0) return <ArrowDownIcon className="w-4 h-4 text-red-600" />;
    return null;
  };

  // Helper function to get change color
  const getChangeColor = (value: number | undefined) => {
    if (value === undefined) return 'text-slate-600';
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  // Get the latest date data
  const getLatestDateData = () => {
    if (!details) {
      console.log('No details available');
      return null;
    }
    
    console.log('Details keys:', Object.keys(details));
    
    // Try multiple approaches to find the data
    
    // Approach 1: Look for date keys (like "2025-10-10T00:00:00+00:00")
    const dateKeys = Object.keys(details).filter(key => 
      key.includes('T') && key.includes('Z') && key !== 'symbol'
    );
    
    console.log('Date keys found:', dateKeys);
    
    if (dateKeys.length > 0) {
      // Sort dates and get the latest
      const sortedDates = dateKeys.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      const latestData = details[sortedDates[0]];
      console.log('Latest data from date key:', latestData);
      return latestData;
    }
    
    // Approach 2: Check if data is directly in details
    if (details.price || details.financial || details.key_statistics || details.faqs) {
      console.log('Found direct data structure');
      return details;
    }
    
    // Approach 3: Look for nested data structures
    for (const key of Object.keys(details)) {
      if (typeof details[key] === 'object' && details[key] !== null) {
        const nestedData = details[key];
        if (nestedData.price || nestedData.financial || nestedData.key_statistics) {
          console.log('Found nested data structure in key:', key);
          return nestedData;
        }
      }
    }
    
    // Approach 4: Check if there's a 'data' property
    if (details.data && typeof details.data === 'object') {
      console.log('Found data property');
      return details.data;
    }
    
    console.log('No recognizable data structure found');
    return null;
  };

  const latestData = getLatestDateData();

  // Helper function to safely access nested data from latest data
  const getData = (path: string, fallback: any = 'N/A') => {
    if (!latestData) return fallback;
    
    const keys = path.split('.');
    let current = latestData;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return fallback;
      }
    }
    
    return current || fallback;
  };

  // Helper function to safely access nested data from any date entry
  const getDataFromEntry = (entry: any, path: string, fallback: any = 'N/A') => {
    if (!entry) return fallback;
    
    const keys = path.split('.');
    let current = entry;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return fallback;
      }
    }
    
    return current || fallback;
  };

  // Collect all date-based entries sorted desc
  const getAllDateEntries = (): Array<{ key: string; data: any }> => {
    if (!details) {
      return [];
    }

    const dateKeys = Object.keys(details).filter((k) => {
      if (typeof k !== 'string') return false;
      // Match ISO-like keys: 2025-10-15T... with either 'Z' or timezone offset like +00:00
      const isoPrefix = /^\d{4}-\d{2}-\d{2}T/.test(k);
      const hasTimezone = k.includes('Z') || k.includes('+');
      const parsable = !Number.isNaN(Date.parse(k));
      return isoPrefix && hasTimezone && parsable;
    });

    const sorted = dateKeys.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const entries = sorted
      .map((key) => ({ key, data: (details as any)[key] }))
      .filter((e) => e.data && typeof e.data === 'object' && (e.data.price || e.data.financial));

    return entries;
  };

  // Tab configuration
  const tabs = [
    { id: 'company', label: 'Company Profile', icon: <TrendingUpIcon className="w-4 h-4" /> },
    { id: 'price', label: 'Price Data', icon: <TrendingUpIcon className="w-4 h-4" /> },
    { id: 'financial', label: 'Financials', icon: <TrendingUpIcon className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <TrendingUpIcon className="w-4 h-4" /> },
    { id: 'overview', label: 'Overview', icon: <TrendingUpIcon className="w-4 h-4" /> },
    { id: 'faq', label: 'FAQs', icon: <TrendingUpIcon className="w-4 h-4" /> },
  ];

  // FAQ expand/collapse functionality
  const toggleFAQ = (index: number) => {
    setExpandedFAQs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Render tab content
  const renderTabContent = () => {
    if (!latestData) {
      return (
        <div className="p-8 text-center text-slate-600">
          <div className="mb-4">No data available for the selected tab</div>
          {details && (
            <div className="text-left bg-gray-100 p-4 rounded-lg">
              <div className="text-sm font-semibold mb-2">Debug Info:</div>
              <div className="text-xs">
                <div>Available keys: {Object.keys(details).join(', ')}</div>
                <div className="mt-2">Raw data structure:</div>
                <pre className="text-xs bg-white p-2 rounded border max-h-60 overflow-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      );
    }

    switch (activeTab) {
      case 'company':
        return (
          <div className="space-y-6">
            {/* Company Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUpIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{details?.symbol_info?.company_name || symbol}</h2>
                  <p className="text-slate-600">{details?.company_profile?.sector || 'N/A'} • {details?.company_profile?.industry || 'N/A'}</p>
                  <p className="text-sm text-slate-500">Founded: {details?.company_profile?.founded || 'N/A'} • HQ: {details?.company_profile?.headquarters || 'N/A'}</p>
                </div>
              </div>
              
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-slate-600">Market Cap</div>
                  <div className="text-xl font-bold text-slate-900">{getData('financial.market_cap.fmt') || 'N/A'}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-slate-600">P/E Ratio</div>
                  <div className="text-xl font-bold text-slate-900">{getData('financial.pe.fmt') || 'N/A'}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-slate-600">Current Price</div>
                  <div className="text-xl font-bold text-slate-900">{getData('price.price.fmt') || 'N/A'}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-slate-600">52W Change</div>
                  <div className={`text-xl font-bold ${getChangeColor(getData('financial.52_week_change.raw'))}`}>
                    {getData('financial.52_week_change.fmt') || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Profile */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Company Profile</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">CEO:</span>
                    <span className="text-slate-900 font-medium">{details?.company_profile?.ceo || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Website:</span>
                    <span className="text-slate-900 font-medium">{details?.company_profile?.website || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">ISIN:</span>
                    <span className="text-slate-900 font-medium">{details?.company_profile?.isin || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">FIGI:</span>
                    <span className="text-slate-900 font-medium">{details?.company_profile?.figi || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Employees:</span>
                    <span className="text-slate-900 font-medium">{details?.summary?.full_time_employees?.toLocaleString() || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Company Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Company Summary</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Country:</span>
                    <span className="text-slate-900 font-medium">{details?.summary?.country || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">City:</span>
                    <span className="text-slate-900 font-medium">{details?.summary?.city || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Industry:</span>
                    <span className="text-slate-900 font-medium">{details?.summary?.industry || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Sector:</span>
                    <span className="text-slate-900 font-medium">{details?.summary?.sector || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Description */}
            {(details?.company_profile?.description || details?.summary?.summary) && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">About the Company</h3>
                </div>
                <div className="text-sm text-slate-700 leading-relaxed">
                  {details?.company_profile?.description || details?.summary?.summary}
                </div>
              </div>
            )}

            {/* Price Chart Section */}
            {getData('price') && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">Price Performance</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Current Price:</span>
                      <span className="text-xl font-bold text-slate-900">{getData('price.price.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Day Change:</span>
                      <div className="flex items-center gap-1">
                        {getChangeIndicator(getData('price.price_change.raw'))}
                        <span className={`font-medium ${getChangeColor(getData('price.price_change.raw'))}`}>
                          {getData('price.price_change.fmt') || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Change %:</span>
                      <div className="flex items-center gap-1">
                        {getChangeIndicator(getData('price.price_change_per.raw'))}
                        <span className={`font-medium ${getChangeColor(getData('price.price_change_per.raw'))}`}>
                          {getData('price.price_change_per.fmt') || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Day High:</span>
                      <span className="font-medium text-green-600">{getData('price.price_day_high.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Day Low:</span>
                      <span className="font-medium text-red-600">{getData('price.price_day_low.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Volume:</span>
                      <span className="font-medium text-slate-900">{getData('price.volume.fmt') || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'overview':
        return (
          <div className="space-y-6">
            {/* Date Information */}
            <div className="bg-blue-200 border border-blue-400 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUpIcon className="w-5 h-5 text-blue-800" />
                <h3 className="text-lg font-bold text-blue-950">Latest Data - {getData('date') ? formatDate(getData('date')) : 'N/A'}</h3>
              </div>
              <div className="text-sm text-blue-900">
                <p>Data extracted at: {getData('metadata.extracted_at') ? formatDate(getData('metadata.extracted_at')) : 'N/A'}</p>
                {getData('metadata.url') && (
                  <p className="mt-1">
                    Source: <a href={getData('metadata.url')} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-950">TradingView</a>
                  </p>
                )}
              </div>
            </div>

            {/* Breadcrumbs */}
            {getData('breadcrumbs') && Array.isArray(getData('breadcrumbs')) && getData('breadcrumbs').length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-slate-800 mb-2">Market Path</div>
                <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                  {getData('breadcrumbs').map((b: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="truncate max-w-[180px]">{b.text}</span>
                      {idx < getData('breadcrumbs').length - 1 && <span className="text-slate-400">/</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Statistics - date-wise table */}
            {getAllDateEntries().length > 0 && (
              <div className="bg-purple-200 border border-purple-400 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-purple-800" />
                  <h3 className="text-lg font-bold text-purple-950">Key Statistics (Date-wise)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-800 bg-purple-300">
                        <th className="py-2 pr-4 font-semibold">Date</th>
                        <th className="py-2 pr-4 font-semibold">Market Cap</th>
                        <th className="py-2 pr-4 font-semibold">Div Yield</th>
                        <th className="py-2 pr-4 font-semibold">P/E (TTM)</th>
                        <th className="py-2 pr-4 font-semibold">EPS (TTM)</th>
                        <th className="py-2 pr-4 font-semibold">Net Income FY</th>
                        <th className="py-2 pr-4 font-semibold">Revenue FY</th>
                        <th className="py-2 pr-4 font-semibold">Shares Float</th>
                        <th className="py-2 pr-4 font-semibold">Beta (1Y)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100">
                      {getAllDateEntries().map(({ key, data }, index) => {
                        const ks = (data as any)?.key_statistics || {};
                        const val = (o: any) => (o && (o.value ?? o)) || '—';
                        return (
                          <tr key={key} className={`text-slate-900 ${index % 2 === 0 ? 'bg-white' : 'bg-purple-25'}`}>
                            <td className="py-2 pr-4 whitespace-nowrap font-medium">{formatDate((data as any)?.date || key)}</td>
                            <td className="py-2 pr-4">{val(ks.market_capitalization)}</td>
                            <td className="py-2 pr-4">{val(ks.dividend_yield_indicated)}</td>
                            <td className="py-2 pr-4">{val(ks.price_to_earnings_ratio_ttm)}</td>
                            <td className="py-2 pr-4">{val(ks.basic_eps_ttm)}</td>
                            <td className="py-2 pr-4">{val(ks.net_income_fy)}</td>
                            <td className="py-2 pr-4">{val(ks.revenue_fy)}</td>
                            <td className="py-2 pr-4">{val(ks.shares_float)}</td>
                            <td className="py-2 pr-4">{val(ks.beta_1y)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 'price':
        return (
          <div className="space-y-6">
            {getAllDateEntries().length > 0 ? (
              <div className="bg-green-200 border border-green-400 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-green-800" />
                  <h3 className="text-lg font-bold text-green-950">Price Data (Date-wise)</h3>
                  <Badge variant="info" className="text-xs">{getAllDateEntries().length} entries</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-800 bg-green-300">
                        <th className="py-2 pr-4 font-semibold">Date</th>
                        <th className="py-2 pr-4 font-semibold">Price</th>
                        <th className="py-2 pr-4 font-semibold">Change</th>
                        <th className="py-2 pr-4 font-semibold">Change %</th>
                        <th className="py-2 pr-4 font-semibold">Open</th>
                        <th className="py-2 pr-4 font-semibold">High</th>
                        <th className="py-2 pr-4 font-semibold">Low</th>
                        <th className="py-2 pr-4 font-semibold">Volume</th>
                        <th className="py-2 pr-4 font-semibold">Avg Vol (10d)</th>
                        <th className="py-2 pr-4 font-semibold">Avg Vol (30d)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-100">
                      {getAllDateEntries().map(({ key, data }, index) => (
                        <tr key={key} className={`text-slate-900 ${index % 2 === 0 ? 'bg-white' : 'bg-green-25'}`}>
                          <td className="py-2 pr-4 whitespace-nowrap font-medium">{formatDate(getDataFromEntry(data, 'date') || key)}</td>
                          <td className="py-2 pr-4 font-semibold">{getDataFromEntry(data, 'price.price.fmt') || '—'}</td>
                          <td className={`py-2 pr-4 font-medium ${getChangeColor(getDataFromEntry(data, 'price.price_change.raw'))}`}>{getDataFromEntry(data, 'price.price_change.fmt') || '—'}</td>
                          <td className={`py-2 pr-4 font-medium ${getChangeColor(getDataFromEntry(data, 'price.price_change_per.raw'))}`}>{getDataFromEntry(data, 'price.price_change_per.fmt') || '—'}</td>
                          <td className="py-2 pr-4">{getDataFromEntry(data, 'price.open.fmt') || '—'}</td>
                          <td className="py-2 pr-4 text-green-600 font-medium">{getDataFromEntry(data, 'price.price_day_high.fmt') || '—'}</td>
                          <td className="py-2 pr-4 text-red-600 font-medium">{getDataFromEntry(data, 'price.price_day_low.fmt') || '—'}</td>
                          <td className="py-2 pr-4">{getDataFromEntry(data, 'price.volume.fmt') || '—'}</td>
                          <td className="py-2 pr-4">{getDataFromEntry(data, 'price.average_volume_10_days.fmt') || '—'}</td>
                          <td className="py-2 pr-4">{getDataFromEntry(data, 'price.average_volume_30_days.fmt') || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-900">Price Data (Single Entry)</h3>
                </div>
                <div className="text-sm text-yellow-800 mb-2">
                  No multiple date entries found. Showing latest data:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Current Price:</span>
                      <span className="font-semibold text-slate-900">{getData('price.price.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Price Change:</span>
                      <div className="flex items-center gap-1">
                        {getChangeIndicator(getData('price.price_change.raw'))}
                        <span className={`font-medium ${getChangeColor(getData('price.price_change.raw'))}`}>
                          {getData('price.price_change.fmt') || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Change %:</span>
                      <div className="flex items-center gap-1">
                        {getChangeIndicator(getData('price.price_change_per.raw'))}
                        <span className={`font-medium ${getChangeColor(getData('price.price_change_per.raw'))}`}>
                          {getData('price.price_change_per.fmt') || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Open:</span>
                      <span className="font-medium text-slate-900">{getData('price.open.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Previous Close:</span>
                      <span className="font-medium text-slate-900">{getData('price.previous_close.fmt') || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Day High:</span>
                      <span className="font-medium text-green-600">{getData('price.price_day_high.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Day Low:</span>
                      <span className="font-medium text-red-600">{getData('price.price_day_low.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Volume:</span>
                      <span className="font-medium text-slate-900">{getData('price.volume.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Avg Vol (10d):</span>
                      <span className="font-medium text-slate-900">{getData('price.average_volume_10_days.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Avg Vol (30d):</span>
                      <span className="font-medium text-slate-900">{getData('price.average_volume_30_days.fmt') || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Price Ranges */}
            {latestData.financial && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-900">Price Ranges</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">52-Week High:</span>
                      <span className="font-medium text-green-600">{latestData.financial.fifty_two_week_high?.fmt || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">52-Week Low:</span>
                      <span className="font-medium text-red-600">{latestData.financial.fifty_two_week_low?.fmt || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">52-Week Change:</span>
                      <div className="flex items-center gap-1">
                        {getChangeIndicator(latestData.financial['52_week_change']?.raw)}
                        <span className={`font-medium ${getChangeColor(latestData.financial['52_week_change']?.raw)}`}>
                          {latestData.financial['52_week_change']?.fmt || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">All-Time High:</span>
                      <span className="font-medium text-green-600">{latestData.financial.all_time_high?.fmt || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">All-Time Low:</span>
                      <span className="font-medium text-red-600">{latestData.financial.all_time_low?.fmt || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-6">
            {getAllDateEntries().length > 0 ? (
              <div className="bg-blue-200 border border-blue-400 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-blue-800" />
                  <h3 className="text-lg font-bold text-blue-950">Financials (Date-wise)</h3>
                  <Badge variant="info" className="text-xs">{getAllDateEntries().length} entries</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-800 bg-blue-300">
                        <th className="py-2 pr-4 font-semibold">Date</th>
                        <th className="py-2 pr-4 font-semibold">P/E</th>
                        <th className="py-2 pr-4 font-semibold">EPS</th>
                        <th className="py-2 pr-4 font-semibold">Market Cap</th>
                        <th className="py-2 pr-4 font-semibold">Beta</th>
                        <th className="py-2 pr-4 font-semibold">EV/Rev</th>
                        <th className="py-2 pr-4 font-semibold">EV/EBITDA</th>
                        <th className="py-2 pr-4 font-semibold">Debt</th>
                        <th className="py-2 pr-4 font-semibold">Debt/Equity</th>
                        <th className="py-2 pr-4 font-semibold">Revenue</th>
                        <th className="py-2 pr-4 font-semibold">Gross Margin</th>
                        <th className="py-2 pr-4 font-semibold">EBITDA Margin</th>
                        <th className="py-2 pr-4 font-semibold">Op Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                      {getAllDateEntries().map(({ key, data }, index) => (
                        <tr key={key} className={`text-slate-900 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-25'}`}>
                          <td className="py-2 pr-4 whitespace-nowrap font-medium">{formatDate(getDataFromEntry(data, 'date') || key)}</td>
                          <td className="py-2 pr-4">{getDataFromEntry(data, 'financial.pe.fmt') || '—'}</td>
                          <td className="py-2 pr-4">{getDataFromEntry(data, 'financial.eps.fmt') || '—'}</td>
                          <td className="py-2 pr-4 font-semibold">{getDataFromEntry(data, 'financial.market_cap.fmt') || '—'}</td>
                          <td className="py-2 pr-4">{getDataFromEntry(data, 'financial.beta.fmt') || '—'}</td>
                          <td className="py-2 pr-4">{getDataFromEntry(data, 'financial.enterprise_to_revenue.fmt') || getDataFromEntry(data, 'financial.enterprise_to_revenue') || '—'}</td>
                          <td className="py-2 pr-4">{getDataFromEntry(data, 'financial.enterprise_to_ebitda.fmt') || getDataFromEntry(data, 'financial.enterprise_to_ebitda') || '—'}</td>
                          <td className="py-2 pr-4">{getDataFromEntry(data, 'financial.total_debt.fmt') || '—'}</td>
                          <td className="py-2 pr-4">{getDataFromEntry(data, 'financial.debt_to_equity.fmt') || '—'}</td>
                          <td className="py-2 pr-4 font-semibold">{getDataFromEntry(data, 'financial.total_revenue.fmt') || '—'}</td>
                          <td className="py-2 pr-4">{getDataFromEntry(data, 'financial.gross_margins.fmt') || '—'}</td>
                          <td className="py-2 pr-4">{getDataFromEntry(data, 'financial.ebitda_margins.fmt') || '—'}</td>
                          <td className="py-2 pr-4">{getDataFromEntry(data, 'financial.operating_margins.fmt') || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-900">Financials (Single Entry)</h3>
                </div>
                <div className="text-sm text-yellow-800 mb-2">
                  No multiple date entries found. Showing latest data:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Market Cap:</span>
                      <span className="font-medium text-slate-900">{getData('financial.market_cap.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">P/E Ratio:</span>
                      <span className="font-medium text-slate-900">{getData('financial.pe.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">EPS:</span>
                      <span className="font-medium text-slate-900">{getData('financial.eps.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Beta:</span>
                      <span className="font-medium text-slate-900">{getData('financial.beta.fmt') || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Revenue:</span>
                      <span className="font-medium text-slate-900">{getData('financial.total_revenue.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">EBITDA:</span>
                      <span className="font-medium text-slate-900">{getData('financial.ebitda.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total Debt:</span>
                      <span className="font-medium text-slate-900">{getData('financial.total_debt.fmt') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Debt to Equity:</span>
                      <span className="font-medium text-slate-900">{getData('financial.debt_to_equity.fmt') || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Growth Metrics */}
            {latestData.financial && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">Growth & Margins</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Earnings Growth:</span>
                      <div className="flex items-center gap-1">
                        {getChangeIndicator(latestData.financial.earnings_growth?.raw)}
                        <span className={`font-medium ${getChangeColor(latestData.financial.earnings_growth?.raw)}`}>
                          {latestData.financial.earnings_growth?.fmt || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Revenue Growth:</span>
                      <div className="flex items-center gap-1">
                        {getChangeIndicator(latestData.financial.revenue_growth?.raw)}
                        <span className={`font-medium ${getChangeColor(latestData.financial.revenue_growth?.raw)}`}>
                          {latestData.financial.revenue_growth?.fmt || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Gross Margins:</span>
                      <span className="font-medium text-slate-900">{latestData.financial.gross_margins?.fmt || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">EBITDA Margins:</span>
                      <span className="font-medium text-slate-900">{latestData.financial.ebitda_margins?.fmt || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Operating Margins:</span>
                      <span className="font-medium text-slate-900">{latestData.financial.operating_margins?.fmt || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Revenue per Share:</span>
                      <span className="font-medium text-slate-900">{latestData.financial.revenue_per_share?.fmt || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Gross Profits:</span>
                      <span className="font-medium text-slate-900">{latestData.financial.gross_profits?.fmt || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Net Income:</span>
                      <span className="font-medium text-slate-900">{latestData.financial.net_income_to_common?.fmt || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            {/* Performance Metrics - date-wise table */}
            {getAllDateEntries().length > 0 && (
              <div className="bg-orange-200 border border-orange-500 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-6 h-6 text-orange-900" />
                  <h3 className="text-xl font-extrabold text-orange-950">Performance Metrics (Date-wise)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-900 bg-orange-300">
                        <th className="py-2 pr-4 font-semibold">Date</th>
                        <th className="py-2 pr-4 font-semibold">1D</th>
                        <th className="py-2 pr-4 font-semibold">5D</th>
                        <th className="py-2 pr-4 font-semibold">1M</th>
                        <th className="py-2 pr-4 font-semibold">6M</th>
                        <th className="py-2 pr-4 font-semibold">YTD</th>
                        <th className="py-2 pr-4 font-semibold">1Y</th>
                        <th className="py-2 pr-4 font-semibold">5Y</th>
                        <th className="py-2 pr-4 font-semibold">All Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-200">
                      {getAllDateEntries().map(({ key, data }, index) => {
                        const pm = (data as any)?.performance_metrics || {};
                        const cell = (p: string) => (pm[p]?.change ?? '—');
                        const val = (p: string) => pm[p]?.parsed_change;
                        return (
                          <tr key={key} className={`text-slate-900 ${index % 2 === 0 ? 'bg-white' : 'bg-orange-50'}`}>
                            <td className="py-2 pr-4 whitespace-nowrap font-medium">{formatDate((data as any)?.date || key)}</td>
                            <td className={`py-2 pr-4 ${getChangeColor(val('1_day'))}`}>{cell('1_day')}</td>
                            <td className={`py-2 pr-4 ${getChangeColor(val('5_days'))}`}>{cell('5_days')}</td>
                            <td className={`py-2 pr-4 ${getChangeColor(val('1_month'))}`}>{cell('1_month')}</td>
                            <td className={`py-2 pr-4 ${getChangeColor(val('6_months'))}`}>{cell('6_months')}</td>
                            <td className={`py-2 pr-4 ${getChangeColor(val('year_to_date'))}`}>{cell('year_to_date')}</td>
                            <td className={`py-2 pr-4 ${getChangeColor(val('1_year'))}`}>{cell('1_year')}</td>
                            <td className={`py-2 pr-4 ${getChangeColor(val('5_years'))}`}>{cell('5_years')}</td>
                            <td className={`py-2 pr-4 ${getChangeColor(val('all_time'))}`}>{cell('all_time')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Employee Information - date-wise table */}
            {getAllDateEntries().length > 0 && (
              <div className="bg-indigo-200 border border-indigo-500 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-6 h-6 text-indigo-900" />
                  <h3 className="text-xl font-extrabold text-indigo-950">Employee Information (Date-wise)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-900 bg-indigo-300">
                        <th className="py-2 pr-4 font-semibold">Date</th>
                        <th className="py-2 pr-4 font-semibold">Employees (FY)</th>
                        <th className="py-2 pr-4 font-semibold">Change (1Y)</th>
                        <th className="py-2 pr-4 font-semibold">Revenue/Employee (1Y)</th>
                        <th className="py-2 pr-4 font-semibold">Net Income/Employee (1Y)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-200">
                      {getAllDateEntries().map(({ key, data }, index) => {
                        const ed = (data as any)?.employee_data || {};
                        const valueOf = (field: string) => (ed[field]?.value ?? '—');
                        return (
                          <tr key={key} className={`text-slate-900 ${index % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}`}>
                            <td className="py-2 pr-4 whitespace-nowrap font-medium">{formatDate((data as any)?.date || key)}</td>
                            <td className="py-2 pr-4">{valueOf('employees_fy')}</td>
                            <td className="py-2 pr-4">{valueOf('change_1y')}</td>
                            <td className="py-2 pr-4">{valueOf('revenue_employee_1y')}</td>
                            <td className="py-2 pr-4">{valueOf('net_income_employee_1y')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );


      case 'faq':
        return (
          <div className="space-y-6">
            {/* FAQs */}
            {getData('faqs') && Array.isArray(getData('faqs')) && getData('faqs').length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
                </div>
                <div className="space-y-3">
                  {getData('faqs').map((f: any, idx: number) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleFAQ(idx)}
                        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-slate-900 pr-4">{f.question}</div>
                        <div className="flex-shrink-0">
                          {expandedFAQs.has(idx) ? (
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </button>
                      {expandedFAQs.has(idx) && (
                        <div className="px-4 pb-3 text-sm text-slate-700 border-t border-gray-100">
                          {f.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div className="p-8 text-center text-slate-600">Select a tab to view data</div>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="7xl">
      <div className="bg-white rounded-xl shadow-lg w-full h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-xl font-bold text-slate-900 truncate">{symbol || 'Symbol'}</h3>
            {details?.symbol_info?.company_name && (
              <Badge variant="neutral">{details.symbol_info.company_name}</Badge>
            )}
            {latestData?.date && (
              <Badge variant="info" className="text-xs">
                {formatDate(latestData.date)}
              </Badge>
            )}
          </div>
          <ActionButton variant="outline" size="sm" onClick={onClose}>Close</ActionButton>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <nav className="flex space-x-8 px-5" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-10 text-center text-slate-600">Loading details…</div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
              <span>{error}</span>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SymbolDetailsModal;