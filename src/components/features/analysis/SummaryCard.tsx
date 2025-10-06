'use client';

import React from 'react';
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  AlertCircleIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  DollarSignIcon, 
  BarChart2Icon, 
  TargetIcon, 
  ShieldIcon, 
  EyeIcon,
  CalendarIcon,
  PieChartIcon,
  CheckIcon,
  XIcon
} from '@/components/shared/icons';

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

interface SummaryCardProps {
  data: TechnicalAnalysis;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="flex flex-col items-center justify-center py-6">
          <AlertCircleIcon className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium mb-2 text-gray-500">No Data Available</p>
          <p className="text-gray-400">Analysis data for this symbol could not be found.</p>
        </div>
      </div>
    );
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BULLISH':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'BEARISH':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BULLISH':
        return <TrendingUpIcon className="inline-block mr-2 h-5 w-5" />;
      case 'BEARISH':
        return <TrendingDownIcon className="inline-block mr-2 h-5 w-5" />;
      default:
        return (
          <>
            <ArrowUpIcon className="inline-block mr-1 h-4 w-4" />
            <ArrowDownIcon className="inline-block mr-2 h-4 w-4" />
          </>
        );
    }
  };

  const formatPrice = (price: number | undefined): string => {
    if (typeof price !== 'number' || isNaN(price)) {
      return 'N/A';
    }
    return price.toFixed(2);
  };

  const TradeSetup = ({ 
    type, 
    data 
  }: { 
    type: 'bullish' | 'bearish';
    data: TechnicalAnalysis['bullish_trade'] | TechnicalAnalysis['bearish_trade'] | undefined;
  }) => {
    if (!data) return (
      <div className="p-4 rounded-lg text-center bg-gray-50">
        <p className="text-gray-500">No trade setup available</p>
      </div>
    );

    // Calculate risk-reward ratio
    const riskRewardRatio = data.target_price && data.entry_trigger_price && data.stop_loss_price
      ? Math.abs((data.target_price - data.entry_trigger_price) / (data.entry_trigger_price - data.stop_loss_price))
      : null;

    const valueColor = type === 'bullish' 
      ? 'text-green-700'
      : 'text-red-700';

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-gray-800">
          <div className="p-3 rounded-lg bg-white border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Entry Price</div>
            <div className="flex items-center">
              <EyeIcon className={`h-4 w-4 mr-1.5 ${valueColor}`} />
              <span className={`text-lg font-medium ${valueColor}`}>₹{formatPrice(data.entry_trigger_price)}</span>
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-white border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Stop Loss</div>
            <div className="flex items-center">
              <ShieldIcon className="h-4 w-4 mr-1.5 text-red-600" />
              <span className="text-lg font-medium text-red-600">₹{formatPrice(data.stop_loss_price)}</span>
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-white border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Target Price</div>
            <div className="flex items-center">
              <TargetIcon className="h-4 w-4 mr-1.5 text-green-600" />
              <span className="text-lg font-medium text-green-600">₹{formatPrice(data.target_price)}</span>
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-white border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Position Size</div>
            <div className="flex items-center">
              <DollarSignIcon className="h-4 w-4 mr-1.5 text-blue-600" />
              <span className="text-lg font-medium text-gray-800">
                {typeof data.position_size_shares === 'number' 
                  ? `${data.position_size_shares.toLocaleString()} shares` 
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {riskRewardRatio && (
          <div className={`flex justify-center p-2 rounded-md ${
            riskRewardRatio >= 2 
              ? 'bg-green-50 text-green-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}>
            <div className="flex items-center">
              <PieChartIcon className="h-4 w-4 mr-1.5" />
              <span className="font-medium">Risk/Reward Ratio: 1:{riskRewardRatio.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{data.symbol}</h1>
          <p className="text-gray-500 flex items-center mt-1">
            <CalendarIcon className="h-4 w-4 mr-1.5" />
            Analysis as of {new Date(data.date).toLocaleDateString()}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-full text-lg font-semibold flex items-center ${getSignalColor(data.overall_signal)}`}>
          {getSignalIcon(data.overall_signal)}
          {data.overall_signal}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Bullish Analysis */}
        <div className={`p-5 rounded-xl ${
          data.overall_signal === 'BULLISH' 
            ? 'bg-green-50 border-2 border-green-200' 
            : 'bg-green-50 border border-green-100'
        }`}>
          <div className="flex items-center mb-4">
            <TrendingUpIcon className="h-5 w-5 mr-2 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">Bullish Analysis</h3>
          </div>
          
          <div className="mb-5">
            <h4 className="font-medium text-green-700 mb-2 flex items-center">
              <CheckIcon className="h-4 w-4 mr-1.5" />
              Bullish Factors:
            </h4>
            <ul className="space-y-1 text-green-700">
              {Array.isArray(data.bullish_reasons) && data.bullish_reasons.length > 0 ? (
                data.bullish_reasons.map((reason, index) => (
                  <li key={index} className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full mt-1.5 mr-2 bg-green-500"></div>
                    <span>{reason.replace(/_/g, ' ')}</span>
                  </li>
                ))
              ) : (
                <li className="italic text-green-600/70">No bullish factors identified</li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-green-700 mb-3 flex items-center">
              <TargetIcon className="h-4 w-4 mr-1.5" />
              Bullish Trade Setup:
            </h4>
            <TradeSetup type="bullish" data={data.bullish_trade} />
          </div>
        </div>

        {/* Bearish Analysis */}
        <div className={`p-5 rounded-xl ${
          data.overall_signal === 'BEARISH' 
            ? 'bg-red-50 border-2 border-red-200' 
            : 'bg-red-50 border border-red-100'
        }`}>
          <div className="flex items-center mb-4">
            <TrendingDownIcon className="h-5 w-5 mr-2 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Bearish Analysis</h3>
          </div>
          
          <div className="mb-5">
            <h4 className="font-medium text-red-700 mb-2 flex items-center">
              <XIcon className="h-4 w-4 mr-1.5" />
              Bearish Factors:
            </h4>
            <ul className="space-y-1 text-red-700">
              {Array.isArray(data.bearish_reasons) && data.bearish_reasons.length > 0 ? (
                data.bearish_reasons.map((reason, index) => (
                  <li key={index} className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full mt-1.5 mr-2 bg-red-500"></div>
                    <span>{reason.replace(/_/g, ' ')}</span>
                  </li>
                ))
              ) : (
                <li className="italic text-red-600/70">No bearish factors identified</li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-red-700 mb-3 flex items-center">
              <TargetIcon className="h-4 w-4 mr-1.5" />
              Bearish Trade Setup:
            </h4>
            <TradeSetup type="bearish" data={data.bearish_trade} />
          </div>
        </div>
      </div>

      {/* Current Price & Volume */}
      {data.technical_indicators_snapshot && (
        <div className="mt-6 p-5 rounded-xl bg-blue-50 border border-blue-100">
          <div className="flex items-center mb-3">
            <BarChart2Icon className="h-5 w-5 mr-2 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-800">Current Market Data</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-white border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Current Price</div>
              <div className="flex items-center">
                <DollarSignIcon className="h-4 w-4 mr-1.5 text-blue-600" />
                <span className="text-xl font-medium text-gray-900">
                  {typeof data.technical_indicators_snapshot.price === 'number' 
                    ? `₹${data.technical_indicators_snapshot.price.toFixed(2)}` 
                    : 'N/A'}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Volume</div>
              <div className="flex items-center">
                <BarChart2Icon className="h-4 w-4 mr-1.5 text-purple-600" />
                <span className="text-xl font-medium text-gray-900">
                  {typeof data.technical_indicators_snapshot.volume === 'number' 
                    ? data.technical_indicators_snapshot.volume.toLocaleString() 
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Disclaimer */}
      <div className="mt-6 text-xs text-gray-400 text-center">
        <p>This analysis is for informational purposes only and does not constitute financial advice. Always conduct your own research before making investment decisions.</p>
      </div>
    </div>
  );
};

export default SummaryCard;

