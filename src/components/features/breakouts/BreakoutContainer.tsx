'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCwIcon, BarChart3Icon, TrendingUpIcon, TrendingDownIcon, TargetIcon } from '@/components/shared/icons';
import BreakoutTable, { BreakoutStock } from './BreakoutTable';
import CompactFilterBar from '@/components/shared/filters/CompactFilterBar';
import { API_BASE_URL } from '@/config';

// FilterField interface
interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'number' | 'range';
  placeholder?: string;
  options?: { value: string; label: string }[];
  minDate?: Date;
  maxDate?: Date;
}

type TradeDirection = 'Long' | 'Short';
type ScannerValue = 'O1' | 'R1';

const BreakoutContainer: React.FC = () => {
  const [breakouts, setBreakouts] = useState<BreakoutStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('Long');
  const [scannerValue, setScannerValue] = useState<ScannerValue>('O1');
  const [sortConfig, setSortConfig] = useState({
    key: 'score',
    direction: 'desc' as 'asc' | 'desc'
  });
  const [filters, setFilters] = useState<Record<string, any>>({
    trade_direction: 'Long',
    scanner_value: 'O1',
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Filter fields for CompactFilterBar
  const filterFields: FilterField[] = [
    {
      name: 'trade_direction',
      label: 'Trade Direction',
      type: 'select' as const,
      placeholder: 'Select Direction',
      options: [
        { value: 'Long', label: 'Long' },
        { value: 'Short', label: 'Short' },
      ],
    },
    {
      name: 'scanner_value',
      label: 'Scanner',
      type: 'select' as const,
      placeholder: 'Select Scanner',
      options: [
        { value: 'O1', label: 'O1' },
        { value: 'R1', label: 'R1' },
      ],
    },
  ];

  // Quick filter presets for breakouts
  const quickFilterPresets = [
    {
      label: 'Long',
      values: { trade_direction: 'Long' } as Record<string, string | number | boolean>,
      icon: <TrendingUpIcon className="w-3 h-3" />
    },
    {
      label: 'Short',
      values: { trade_direction: 'Short' } as Record<string, string | number | boolean>,
      icon: <TrendingDownIcon className="w-3 h-3" />
    },
    {
      label: 'O1',
      values: { scanner_value: 'O1' } as Record<string, string | number | boolean>,
      icon: <TargetIcon className="w-3 h-3" />
    },
    {
      label: 'R1',
      values: { scanner_value: 'R1' } as Record<string, string | number | boolean>,
      icon: <BarChart3Icon className="w-3 h-3" />
    },
  ];

  useEffect(() => {
    fetchBreakouts();
  }, [tradeDirection, scannerValue]); // Refetch when these values change

  const fetchBreakouts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/breakouts?direction=${tradeDirection}&scanner=${scannerValue}`
      );
      const data = await response.json();

      if (data.status === 'success') {
        setBreakouts(data.data.items);
      }
    } catch (error) {
      console.error('Error fetching breakouts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    if (key === 'trade_direction') {
      setTradeDirection(value as TradeDirection);
    } else if (key === 'scanner_value') {
      setScannerValue(value as ScannerValue);
    }
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      trade_direction: 'Long',
      scanner_value: 'O1',
    });
    setTradeDirection('Long');
    setScannerValue('O1');
    setSearchTerm('');
  }, []);

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredBreakouts = breakouts
    .filter(breakout => 
      breakout.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortConfig.key as keyof BreakoutStock];
      const bValue = b[sortConfig.key as keyof BreakoutStock];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return sortConfig.direction === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={fetchBreakouts}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-1"
        >
          <RefreshCwIcon className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <CompactFilterBar
        fields={filterFields}
        values={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search breakouts..."
        showSearch={true}
        showQuickFilters={true}
        quickFilterPresets={quickFilterPresets}
        className="mb-6"
      />
      
      {/* Results */}
      <BreakoutTable
        breakouts={filteredBreakouts}
        sortConfig={sortConfig}
        onSort={handleSort}
        tradeDirection={tradeDirection}
        isLoading={loading}
        onRowSelectionChange={(item, isSelected) => {
          setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
              newSet.add(item.id);
            } else {
              newSet.delete(item.id);
            }
            return newSet;
          });
        }}
        selectedRows={selectedRows}
      />
    </div>
  );
};

export default BreakoutContainer;