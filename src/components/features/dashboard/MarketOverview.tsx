// src/components/features/dashboard/MarketOverview.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUpIcon,
    TrendingDownIcon,
    GlobeIcon,
    ActivityIcon,
    RefreshIcon,
    ClockIcon
} from '@/components/shared/icons';

// Replace with your RapidAPI Key
const RAPID_API_KEY = '79cacf8638msh90aeff221e0e6c9p1c3220jsnb597696f91d0';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  region: string;
  isOpen: boolean;
  currency: string;
  impact?: string;
  countryCode?: string; // Add country code for flags
  country?: string; // Add country name
}

interface QuoteData {
  shortName: string;
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: number;
  regularMarketDayRange: string;
  regularMarketVolume: number;
  marketState: string;
  currency: string;
  region: string;
  exchangeTimezoneName: string;
}

interface ApiResponse {
  meta: {
    version: string;
    status: number;
    processedTime: string;
  };
  body: QuoteData[];
}

interface MarketOverviewProps {
  isDarkMode?: boolean;
}

const MARKET_INDICES = [
  // === US MARKETS (Major Impact on Indian Markets) ===
  { 
    symbol: '^GSPC', 
    apiSymbol: '%5EGSPC',
    name: 'S&P 500', 
    region: 'US', 
    country: 'United States',
    countryCode: 'US',
    impact: 'High'
  },
  { 
    symbol: '^DJI', 
    apiSymbol: '%5EDJI',
    name: 'Dow Jones Industrial Average', 
    region: 'US', 
    country: 'United States',
    countryCode: 'US',
    impact: 'High'
  },
  { 
    symbol: '^IXIC', 
    apiSymbol: '%5EIXIC',
    name: 'NASDAQ Composite', 
    region: 'US', 
    country: 'United States',
    countryCode: 'US',
    impact: 'High'
  },
  { 
    symbol: '^RUT', 
    apiSymbol: '%5ERUT',
    name: 'Russell 2000', 
    region: 'US', 
    country: 'United States',
    countryCode: 'US',
    impact: 'Medium'
  },

  // === EUROPEAN MARKETS (High Impact) ===
  { 
    symbol: '^FTSE', 
    apiSymbol: '%5EFTSE',
    name: 'FTSE 100', 
    region: 'Europe', 
    country: 'United Kingdom',
    countryCode: 'GB',
    impact: 'High'
  },
  { 
    symbol: '^GDAXI', 
    apiSymbol: '%5EGDAXI',
    name: 'DAX Performance Index', 
    region: 'Europe', 
    country: 'Germany',
    countryCode: 'DE',
    impact: 'High'
  },
  { 
    symbol: '^FCHI', 
    apiSymbol: '%5EFCHI',
    name: 'CAC 40', 
    region: 'Europe', 
    country: 'France',
    countryCode: 'FR',
    impact: 'Medium'
  },

  // === ASIAN MARKETS (Very High Impact on India) ===
  { 
    symbol: '^N225', 
    apiSymbol: '%5EN225',
    name: 'Nikkei 225', 
    region: 'Asia', 
    country: 'Japan',
    countryCode: 'JP',
    impact: 'High'
  },
  { 
    symbol: '^HSI', 
    apiSymbol: '%5EHSI',
    name: 'Hang Seng Index', 
    region: 'Asia', 
    country: 'Hong Kong',
    countryCode: 'HK',
    impact: 'Very High'
  },
  { 
    symbol: '000001.SS', 
    apiSymbol: '000001.SS',
    name: 'Shanghai Composite', 
    region: 'Asia', 
    country: 'China',
    countryCode: 'CN',
    impact: 'Very High'
  },
  { 
    symbol: '^STI', 
    apiSymbol: '%5ESTI',
    name: 'Straits Times Index', 
    region: 'Asia', 
    country: 'Singapore',
    countryCode: 'SG',
    impact: 'Medium'
  },
  { 
    symbol: '^TWII', 
    apiSymbol: '%5ETWII',
    name: 'Taiwan Weighted Index', 
    region: 'Asia', 
    country: 'Taiwan',
    countryCode: 'TW',
    impact: 'Medium'
  },
  { 
    symbol: '^KS11', 
    apiSymbol: '%5EKS11',
    name: 'KOSPI Composite Index', 
    region: 'Asia', 
    country: 'South Korea',
    countryCode: 'KR',
    impact: 'Medium'
  },

  // === INDIAN MARKETS (Reference Points) ===
  { 
    symbol: '^NSEI', 
    apiSymbol: '%5ENSEI',
    name: 'Nifty 50', 
    region: 'India', 
    country: 'India',
    countryCode: 'IN',
    impact: 'Reference'
  },
  { 
    symbol: '^BSESN', 
    apiSymbol: '%5EBSESN',
    name: 'BSE Sensex', 
    region: 'India', 
    country: 'India',
    countryCode: 'IN',
    impact: 'Reference'
  },

  // === COMMODITY & GLOBAL MARKETS ===
  { 
    symbol: 'CL=F', 
    apiSymbol: 'CL=F',
    name: 'Crude Oil WTI Futures', 
    region: 'Global', 
    country: 'Global',
    countryCode: '🌍', // Special emoji for global commodities
    impact: 'Very High'
  },
  { 
    symbol: 'GC=F', 
    apiSymbol: 'GC=F',
    name: 'Gold Futures', 
    region: 'Global', 
    country: 'Global',
    countryCode: '🌍',
    impact: 'High'
  },

  // === OTHER EMERGING MARKETS ===
  { 
    symbol: '^BVSP', 
    apiSymbol: '%5EBVSP',
    name: 'BOVESPA Index', 
    region: 'Americas', 
    country: 'Brazil',
    countryCode: 'BR',
    impact: 'Medium'
  },

  // === AUSTRALIA & OCEANIA ===
  { 
    symbol: '^AORD', 
    apiSymbol: '%5EAORD',
    name: 'All Ordinaries', 
    region: 'Oceania', 
    country: 'Australia',
    countryCode: 'AU',
    impact: 'Medium'
  },

  // === ADDITIONAL MAJOR MARKETS ===
  { 
    symbol: '^MXX', 
    apiSymbol: '%5EMXX',
    name: 'IPC Mexico', 
    region: 'Americas', 
    country: 'Mexico',
    countryCode: 'MX',
    impact: 'Medium'
  },
  { 
    symbol: '^GSPTSE', 
    apiSymbol: '%5EGSPTSE',
    name: 'S&P/TSX Composite', 
    region: 'Americas', 
    country: 'Canada',
    countryCode: 'CA',
    impact: 'Medium'
  },
  { 
    symbol: '^N100', 
    apiSymbol: '%5EN100',
    name: 'Euronext 100', 
    region: 'Europe', 
    country: 'Netherlands',
    countryCode: 'NL',
    impact: 'Medium'
  },
  { 
    symbol: '^SSMI', 
    apiSymbol: '%5ESSMI',
    name: 'Swiss Market Index', 
    region: 'Europe', 
    country: 'Switzerland',
    countryCode: 'CH',
    impact: 'Medium'
  },
  { 
    symbol: '^MERV', 
    apiSymbol: '%5EMERV',
    name: 'MERVAL Index', 
    region: 'Americas', 
    country: 'Argentina',
    countryCode: 'AR',
    impact: 'Low'
  }
];

// Country flag component using flag emoji
const CountryFlag: React.FC<{ countryCode: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  countryCode, 
  size = 'md' 
}) => {
  // Special handling for global/emoji flags
  if (countryCode === '🌍') {
    return <span className={`${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'}`}>{countryCode}</span>;
  }

  // Convert country code to flag emoji
  const getFlagEmoji = (code: string) => {
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <span 
      className={`${sizeClasses[size]} select-none`}
      title={countryCode}
    >
      {getFlagEmoji(countryCode)}
    </span>
  );
};

// Alternative flag component using Flagpack CDN (if you prefer SVG flags)
const FlagIcon: React.FC<{ countryCode: string; size?: number }> = ({ 
  countryCode, 
  size = 24 
}) => {
  // Special handling for global commodities
  if (countryCode === '🌍') {
    return (
      <div 
        className="flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-green-500"
        style={{ width: size, height: size }}
      >
        <span className="text-white text-xs">🌍</span>
      </div>
    );
  }

  return (
    <img
      src={`https://flagpack.xyz/flags/svg/${countryCode.toLowerCase()}.svg`}
      alt={`${countryCode} flag`}
      width={size}
      height={size}
      className="rounded-sm object-cover"
      onError={(e) => {
        // Fallback to emoji flag if SVG fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `<span class="text-sm">${getFlagEmoji(countryCode)}</span>`;
        }
      }}
    />
  );
};

// Helper function for emoji flags (for fallback)
const getFlagEmoji = (code: string) => {
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const MarketOverview: React.FC<MarketOverviewProps> = ({ isDarkMode = false }) => {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [error, setError] = useState<string | null>(null);

  // Get market metadata for a symbol
  const getMarketMeta = (apiSymbol: string) => {
    // First try to find by API symbol
    let market = MARKET_INDICES.find(m => m.apiSymbol === apiSymbol);
    
    // If not found, try by regular symbol
    if (!market) {
      market = MARKET_INDICES.find(m => m.symbol === apiSymbol);
    }
    
    // If still not found, try partial matching
    if (!market) {
      market = MARKET_INDICES.find(m => 
        apiSymbol.includes(m.symbol.replace('^', '').replace('%5E', ''))
      );
    }
    
    return market || {
      symbol: apiSymbol,
      apiSymbol: apiSymbol,
      name: apiSymbol,
      region: 'Unknown',
      country: 'Unknown',
      countryCode: '❓',
      impact: 'Low'
    };
  };

  // Determine market status based on timezone and current time
  const getMarketStatus = (exchangeTimezoneName: string, marketState: string) => {
    // Use API's marketState if available
    if (marketState) {
      return ['REGULAR', 'OPEN'].includes(marketState.toUpperCase());
    }
    
    // Fallback logic based on timezone
    const now = new Date();
    const currentHour = now.getUTCHours();
    
    if (exchangeTimezoneName?.includes('America')) {
      // US markets: 9:30 AM - 4:00 PM EST (14:30 - 21:00 UTC)
      return currentHour >= 14 && currentHour < 21;
    } else if (exchangeTimezoneName?.includes('Asia')) {
      // Asian markets: Various times, assume some are open during Asian hours
      return currentHour >= 1 && currentHour < 8;
    } else if (exchangeTimezoneName?.includes('Europe')) {
      // European markets: 8:00 AM - 4:30 PM CET (7:00 - 15:30 UTC)
      return currentHour >= 7 && currentHour < 16;
    }
    
    return false;
  };

  const fetchMarketData = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      // Use apiSymbol for the API call
      const symbols = MARKET_INDICES.map(index => index.apiSymbol).join(',');
      
      const response = await fetch(
        `https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/${symbols}`, {
        headers: {
          'X-RapidAPI-Key': RAPID_API_KEY,
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.meta.status === 200 && result.body) {
        const formattedData: MarketData[] = result.body
          .filter(quote => quote && quote.regularMarketPrice) // Filter out invalid data
          .map((quote: QuoteData) => {
            const marketMeta = getMarketMeta(quote.symbol);
            
            return {
              symbol: marketMeta.name,
              name: quote.shortName || marketMeta.name,
              price: quote.regularMarketPrice || 0,
              change: quote.regularMarketChange || 0,
              changePercent: quote.regularMarketChangePercent || 0,
              volume: quote.regularMarketVolume || 0,
              region: marketMeta.region,
              isOpen: getMarketStatus(quote.exchangeTimezoneName, quote.marketState),
              currency: quote.currency || 'USD',
              impact: marketMeta.impact,
              countryCode: marketMeta.countryCode,
              country: marketMeta.country
            };
          })
          .filter(market => market.region !== 'Unknown'); // Filter out unknown markets
        
        setMarkets(formattedData);
        setLastUpdated(new Date(result.meta.processedTime || Date.now()));
      } else {
        throw new Error('Failed to fetch market data');
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchMarketData, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchMarketData();
  };

  // Get unique regions from the data
  const regions = ['All', ...new Set(markets.map(market => market.region))].filter(Boolean);
  
  const filteredMarkets = selectedRegion === 'All' 
    ? markets 
    : markets.filter(market => market.region === selectedRegion);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatVolume = (volume: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(volume);
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'Very High': return isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
      case 'High': return isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700';
      case 'Medium': return isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      case 'Reference': return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700';
      default: return isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600';
    }
  };

  // Country color mapping for flag-inspired accents
  const getCountryColors = (countryCode: string) => {
    const colorMap: { [key: string]: { primary: string; secondary: string; accent: string } } = {
      'US': { primary: 'from-red-500/10', secondary: 'to-blue-500/10', accent: 'border-red-500/20' },
      'GB': { primary: 'from-red-500/10', secondary: 'to-blue-500/10', accent: 'border-red-500/20' },
      'DE': { primary: 'from-yellow-500/10', secondary: 'to-red-500/10', accent: 'border-yellow-500/20' },
      'FR': { primary: 'from-blue-500/10', secondary: 'to-red-500/10', accent: 'border-blue-500/20' },
      'JP': { primary: 'from-red-500/10', secondary: 'to-white/10', accent: 'border-red-500/20' },
      'HK': { primary: 'from-red-500/10', secondary: 'to-blue-500/10', accent: 'border-red-500/20' },
      'CN': { primary: 'from-red-500/10', secondary: 'to-yellow-500/10', accent: 'border-red-500/20' },
      'SG': { primary: 'from-red-500/10', secondary: 'to-white/10', accent: 'border-red-500/20' },
      'TW': { primary: 'from-red-500/10', secondary: 'to-blue-500/10', accent: 'border-red-500/20' },
      'KR': { primary: 'from-blue-500/10', secondary: 'to-red-500/10', accent: 'border-blue-500/20' },
      'IN': { primary: 'from-orange-500/10', secondary: 'to-green-500/10', accent: 'border-orange-500/20' },
      'BR': { primary: 'from-green-500/10', secondary: 'to-yellow-500/10', accent: 'border-green-500/20' },
      'AU': { primary: 'from-blue-500/10', secondary: 'to-red-500/10', accent: 'border-blue-500/20' },
      'MX': { primary: 'from-green-500/10', secondary: 'to-red-500/10', accent: 'border-green-500/20' },
      'CA': { primary: 'from-red-500/10', secondary: 'to-white/10', accent: 'border-red-500/20' },
      'NL': { primary: 'from-red-500/10', secondary: 'to-blue-500/10', accent: 'border-red-500/20' },
      'CH': { primary: 'from-red-500/10', secondary: 'to-white/10', accent: 'border-red-500/20' },
      'AR': { primary: 'from-blue-500/10', secondary: 'to-white/10', accent: 'border-blue-500/20' },
      '🌍': { primary: 'from-blue-500/10', secondary: 'to-green-500/10', accent: 'border-blue-500/20' }
    };
    return colorMap[countryCode] || { primary: 'from-slate-500/10', secondary: 'to-slate-600/10', accent: 'border-slate-500/20' };
  };

  const MarketCard = ({ market, index }: { market: MarketData; index: number }) => {
    const isPositive = market.change >= 0;
    const [isHovered, setIsHovered] = useState(false);
    const countryColors = getCountryColors(market.countryCode || '');

    return (
      <div 
        className={`relative overflow-hidden rounded-lg p-3 transition-all duration-300 hover:scale-[1.02] ${
          isDarkMode 
            ? `bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-slate-600` 
            : `bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:border-slate-300`
        } shadow-sm hover:shadow-md group`}
        style={{ animationDelay: `${index * 0.05}s` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Flag-inspired background accent */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${countryColors.primary} ${countryColors.secondary}`}></div>
        {/* Header with status and region */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${
              market.isOpen 
                ? 'bg-emerald-500 animate-pulse' 
                : isDarkMode ? 'bg-slate-500' : 'bg-slate-400'
            }`}></div>
            <span className={`text-xs font-medium ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {market.isOpen ? 'LIVE' : 'CLOSED'}
            </span>
          </div>
          
          <div className="flex gap-1">
            <div className={`px-1.5 py-0.5 rounded text-xs font-medium border ${
              isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
            } ${countryColors.accent}`}>
              {market.region}
            </div>
            {market.impact && (
              <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${getImpactColor(market.impact)}`}>
                {market.impact}
              </div>
            )}
          </div>
        </div>

        {/* Market info with flag and symbol */}
        <div className="flex items-center gap-2 mb-2">
          {market.countryCode && (
            <div className="flex-shrink-0">
              <CountryFlag countryCode={market.countryCode} size="sm" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} group-hover:text-blue-500 transition-colors truncate`}>
              {market.symbol}
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} truncate`}>
              {market.name}
            </p>
          </div>
        </div>

        {/* Price and change in one row */}
        <div className="flex items-center justify-between mb-2">
          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} transition-transform duration-300 ${
            isHovered ? 'scale-105' : ''
          }`}>
            {market.currency} {formatNumber(market.price)}
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${
            isPositive 
              ? isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-50' 
              : isDarkMode ? 'bg-rose-900/30' : 'bg-rose-50'
          }`}>
            <div className={`${
              isPositive 
                ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600' 
                : isDarkMode ? 'text-rose-400' : 'text-rose-600'
            } transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
              {isPositive ? <TrendingUpIcon className="w-3 h-3" /> : <TrendingDownIcon className="w-3 h-3" />}
            </div>
            <div className={`font-semibold text-xs ${
              isPositive 
                ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600' 
                : isDarkMode ? 'text-rose-400' : 'text-rose-600'
            }`}>
              {isPositive ? '+' : ''}{market.changePercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Volume and change amount */}
        <div className="flex items-center justify-between text-xs">
          <div className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1`}>
            <GlobeIcon className="w-3 h-3" />
            <span>{formatVolume(market.volume)}</span>
          </div>
          <div className={`font-medium ${
            isPositive 
              ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600' 
              : isDarkMode ? 'text-rose-400' : 'text-rose-600'
          }`}>
            {isPositive ? '+' : ''}{formatNumber(market.change)}
          </div>
        </div>

        {/* Hover overlay effect with flag colors */}
        <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${countryColors.primary} ${countryColors.secondary}`}></div>
        <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
          isPositive 
            ? 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
            : 'shadow-[0_0_20px_rgba(248,113,113,0.3)]'
        }`}></div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      } rounded-xl shadow-lg border p-6`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className={`h-6 w-48 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
            <div className={`h-8 w-8 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((i) => (
              <div key={i} className={`h-32 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-lg`}></div>
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
            <p className="font-medium">Error Loading Market Data</p>
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

  return (
    <div className={`${
      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    } rounded-xl shadow-lg border overflow-hidden`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <ActivityIcon />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Global Markets
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Live market data with Indian market impact analysis
              </p>
            </div>
          </div>
          
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

        {/* Region Filter */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedRegion === region
                  ? isDarkMode 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : isDarkMode 
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {region} {region !== 'All' && `(${markets.filter(m => m.region === region).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Markets Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {filteredMarkets.map((market, index) => (
            <MarketCard key={market.symbol} market={market} index={index} />
          ))}
        </div>
        
        {filteredMarkets.length === 0 && (
          <div className="text-center py-8">
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              No markets found for the selected region.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {/* Footer - Continuation from previous artifact */}
      <div className={`px-6 py-3 border-t ${isDarkMode ? 'border-slate-700 bg-slate-900/30' : 'border-slate-200 bg-slate-50/30'}`}>
        <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <ClockIcon />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Total Markets: {markets.length}</span>
            <span>•</span>
            <span>Updates every 5 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;
