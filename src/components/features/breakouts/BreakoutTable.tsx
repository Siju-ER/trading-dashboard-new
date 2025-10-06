'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUpIcon, TrendingDownIcon, TargetIcon, BarChart3Icon,
  ArrowUpIcon, ArrowDownIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon,
  AlertCircleIcon
} from '@/components/shared/icons';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import Badge from '@/components/shared/ui/badge/Badge';

// BreakoutStock interface
export interface BreakoutStock {
  id: string;
  symbol: string;
  name: string;
  score: number;
  date: string;
  trade_setup: {
    entry: number;
    stop_loss: number;
    target: number;
  };
  risk_reward: number;
  reasons: string[];
  tradeDirection: 'Long' | 'Short';
  scannerType: 'O1' | 'R1';
}

interface BreakoutTableProps {
  breakouts: BreakoutStock[];
  sortConfig: {
    key: string;
    direction: 'asc' | 'desc';
  };
  onSort: (key: string) => void;
  tradeDirection: 'Long' | 'Short';
  isLoading?: boolean;
  onRowSelectionChange?: (item: BreakoutStock, isSelected: boolean) => void;
  selectedRows?: Set<string>;
}

const BreakoutTable: React.FC<BreakoutTableProps> = ({
  breakouts,
  sortConfig,
  onSort,
  tradeDirection,
  isLoading = false,
  onRowSelectionChange,
  selectedRows
}) => {
  const router = useRouter();
  const [expandedReasons, setExpandedReasons] = useState<Record<string, boolean>>({});

  const toggleReasons = (symbol: string) => {
    setExpandedReasons(prev => ({
      ...prev,
      [symbol]: !prev[symbol]
    }));
  };

  const getScoreColors = (score: number) => {
    if (score >= 70) return {
      fill: 'bg-green-500',
      bg: 'bg-green-50',
      text: 'text-green-700',
      icon: 'TrendingUpIcon'
    };
    if (score >= 40) return {
      fill: 'bg-yellow-500',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      icon: 'BarChart3Icon'
    };
    return {
      fill: 'bg-red-500',
      bg: 'bg-red-50',
      text: 'text-red-700',
      icon: 'TrendingDownIcon'
    };
  };

  // Define table columns
  const columns: Column<BreakoutStock>[] = [
    {
      field: 'symbol',
      label: 'Symbol',
      sortable: true,
      render: (value, item) => (
        <button
          onClick={() => router.push(`/dashboard/analysis?symbol=${item.symbol}`)}
          className="text-violet-600 hover:text-violet-800 hover:underline font-medium"
        >
          {item.symbol}
        </button>
      ),
    },
    {
      field: 'name',
      label: 'Company',
      sortable: true,
      render: (value, item) => (
        <div className="text-sm text-slate-700 font-medium">{item.name}</div>
      ),
    },
    {
      field: 'score',
      label: 'Score',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center">
          <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getScoreColors(item.score).fill}`}
              style={{ width: `${(item.score / 100) * 100}%` }}
            />
          </div>
          <span className="ml-2 text-sm text-slate-700">{item.score}</span>
        </div>
      ),
    },
    {
      field: 'date',
      label: 'Date',
      sortable: false,
      render: (value, item) => (
        <span className="text-sm text-slate-600">
          {item.date
            ? new Date(item.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                timeZone: 'UTC', 
            })
            : 'N/A'}
        </span>
      ),
    },
    {
      field: 'trade_setup',
      label: 'Trade Setup',
      sortable: false,
      render: (value, item) => (
        <div className="space-y-1">
          <div className="text-sm text-slate-700">
            <span className="inline-block w-12 text-slate-500">Entry:</span> ₹{item.trade_setup.entry.toFixed(2)}
          </div>
          <div className="text-sm text-red-600">
            <span className="inline-block w-12 text-slate-500">Stop:</span> ₹{item.trade_setup.stop_loss.toFixed(2)}
          </div>
          <div className="text-sm text-green-600">
            <span className="inline-block w-12 text-slate-500">Target:</span> ₹{item.trade_setup.target.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      field: 'risk_reward',
      label: 'Risk/Reward',
      sortable: false,
      render: (value, item) => {
        const riskReward = ((item.trade_setup.target - item.trade_setup.entry) / 
                           Math.abs(item.trade_setup.entry - item.trade_setup.stop_loss)).toFixed(2);
        return (
          <Badge variant="info" className="inline-flex items-center">
            <TargetIcon className="w-3 h-3 mr-1" />
            1:{riskReward}
          </Badge>
        );
      },
    },
    {
      field: 'reasons',
      label: 'Reasons',
      sortable: false,
      render: (value, item) => (
        <div className="text-sm text-slate-700">
          <ul className="space-y-1 mb-1">
            {item.reasons.slice(0, 3).map((reason, index) => (
              <li key={index} className="text-slate-600">
                <CheckIcon className="h-3.5 w-3.5 inline mr-1 text-green-500" /> {reason}
              </li>
            ))}
          </ul>
          {item.reasons.length > 3 && (
            <button
              onClick={() => toggleReasons(item.symbol)}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              {expandedReasons[item.symbol] 
                ? `Show less (${item.reasons.length - 3} hidden)`
                : `Show more +${item.reasons.length - 3}`
              }
            </button>
          )}
          {expandedReasons[item.symbol] && (
            <ul className="space-y-1 mt-2 border-t pt-2">
              {item.reasons.slice(3).map((reason, index) => (
                <li key={index + 3} className="text-slate-600 text-xs">
                  <CheckIcon className="h-3 w-3 inline mr-1 text-green-500" /> {reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
  ];

  const renderMobileCard = (item: BreakoutStock) => (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <button
          onClick={() => router.push(`/dashboard/analysis?symbol=${item.symbol}`)}
          className="text-violet-600 hover:text-violet-800 font-medium"
        >
          {item.symbol}
        </button>
        <Badge variant="secondary" className="text-xs">
          {tradeDirection}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm">
        <div><strong>Company:</strong> {item.name}</div>
        <div className="flex items-center">
          <strong>Score:</strong>
          <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden ml-2">
            <div 
              className={`h-full ${getScoreColors(item.score).fill}`}
              style={{ width: `${(item.score / 100) * 100}%` }}
            />
          </div>
          <span className="ml-2">{item.score}</span>
        </div>
        <div><strong>Date:</strong> {item.date ? new Date(item.date).toLocaleDateString('en-GB') : 'N/A'}</div>
        
        <div className="border-t pt-2">
          <strong>Trade Setup:</strong>
          <div className="mt-1 space-y-1">
            <div>Entry: ₹{item.trade_setup.entry.toFixed(2)}</div>
            <div className="text-red-600">Stop: ₹{item.trade_setup.stop_loss.toFixed(2)}</div>
            <div className="text-green-600">Target: ₹{item.trade_setup.target.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="border-t pt-2">
          <strong>Reasons:</strong>
          <ul className="mt-1 space-y-1">
            {item.reasons.slice(0, 3).map((reason, index) => (
              <li key={index} className="text-slate-600">
                <CheckIcon className="h-3 w-3 inline mr-1 text-green-500" /> {reason}
              </li>
            ))}
            {item.reasons.length > 3 && (
              <li className="text-xs text-violet-600">
                +{item.reasons.length - 3} more reasons...
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Breakout Stocks</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {tradeDirection} Position
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {breakouts.length} Results
          </Badge>
        </div>
      </div>
      
      <DataTable
        data={breakouts}
        columns={columns}
        isLoading={isLoading}
        sortConfig={sortConfig}
        onSort={onSort}
        onRowSelectionChange={onRowSelectionChange}
        selectedRows={selectedRows}
        rowKey={(item) => item.id}
        mobileCardRender={renderMobileCard}
        emptyMessage="No breakout stocks found"
        className="min-h-[400px]"
        striped
        stickyHeader
        density="compact"
      />
    </div>
  );
};

export default BreakoutTable;