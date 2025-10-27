'use client';

import { useState } from 'react';
import { ScreeningRunResponse, ScreeningResultsResponse } from '@/types/consolidation-screening';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import SymbolLink from '@/components/shared/symbol/SymbolLink';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import { ShoppingBasketIcon } from '@/components/shared/icons';
import AddToBasketModal from '@/components/features/my-bucket/AddToBucketModal';
import CompactFilterBar from '@/components/shared/filters/CompactFilterBar';
import Badge from '@/components/shared/ui/badge/Badge';

interface ConsolidationResultsDashboardProps {
  screeningRun: ScreeningRunResponse;
  screeningResults: ScreeningResultsResponse;
  onBack: () => void;
  onRunAgain: (criteriaId: string) => void;
}

export default function ConsolidationResultsDashboard({
  screeningRun,
  screeningResults,
  onBack,
  onRunAgain,
}: ConsolidationResultsDashboardProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'score', direction: 'desc' });
  const [isAddToBasketModalOpen, setIsAddToBasketModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; company_name: string } | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
  });

  // Filter field definitions
  const filterFields = [
    {
      name: 'category',
      label: 'Category',
      type: 'select' as const,
      placeholder: 'All Categories',
      options: [
        { value: '', label: 'All Categories' },
        { value: 'EXCELLENT', label: 'EXCELLENT' },
        { value: 'GOOD', label: 'GOOD' },
        { value: 'FAIR', label: 'FAIR' },
        { value: 'WEAK', label: 'WEAK' },
        { value: 'FAILED', label: 'FAILED' },
      ],
    },
  ];

  // Quick filter presets
  const quickFilterPresets = [
    {
      label: 'Reset',
      values: { category: '' },
    }
  ];

  // Filter and sort results
  const filteredResults = (screeningResults?.results || [])
    .filter(result => {
      const matchesCategory = !filters.category || result.category === filters.category;
      const matchesSearch = result.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.key) {
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'priceRange':
          comparison = a.result_data.N_range_pct - b.result_data.N_range_pct;
          break;
        case 'volumeRatio':
          comparison = a.result_data.vol_ratio_to_M - b.result_data.vol_ratio_to_M;
          break;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      key: field,
      direction: prev.key === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleAddToBasket = (symbol: string) => {
    setSelectedStock({ symbol, company_name: symbol });
    setIsAddToBasketModalOpen(true);
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ category: '' });
    setSearchTerm('');
  };

  // Define table columns
  const columns: Column[] = [
    {
      field: 'symbol',
      label: 'Symbol',
      sortable: true,
      render: (value: string) => (
        <SymbolLink symbol={value} className="text-blue-600 hover:text-blue-800 font-medium">
          {value}
        </SymbolLink>
      ),
    },
    {
      field: 'score',
      label: 'Score',
      sortable: true,
      render: (value: number) => (
        <span className={`font-bold ${getScoreColor(value)}`}>
          {value.toFixed(2)}
        </span>
      ),
    },
    {
      field: 'category',
      label: 'Category',
      sortable: true,
      render: (value: string) => (
        <Badge className={`${getCategoryColor(value)} border`}>
          {value}
        </Badge>
      ),
    },
    {
      field: 'consolidating_flag',
      label: 'Status',
      render: (value: boolean, item: any) => (
        <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {value ? 'Consolidating' : 'Not Consolidating'}
        </Badge>
      ),
    },
    {
      field: 'priceRange',
      label: 'Price Range',
      sortable: true,
      render: (value: any, item: any) => (
        <span className="text-slate-900">
          {item.result_data.N_range_pct.toFixed(2)}%
        </span>
      ),
    },
    {
      field: 'volumeRatio',
      label: 'Volume Ratio',
      sortable: true,
      render: (value: any, item: any) => (
        <span className="text-slate-900">
          {(item.result_data.vol_ratio_to_M * 100).toFixed(1)}%
        </span>
      ),
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (value: any, item: any) => (
        <ActionButton
          onClick={(e) => {
            e.stopPropagation();
            handleAddToBasket(item.symbol);
          }}
          leftIcon={<ShoppingBasketIcon className="h-4 w-4" />}
          variant="ghost"
          size="sm"
          className="!text-purple-600 hover:!text-purple-700 !border !border-purple-200 hover:!border-purple-300 !bg-purple-50 hover:!bg-purple-100"
        >
          Add to Basket
        </ActionButton>
      ),
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'EXCELLENT': return 'bg-green-100 text-green-800 border-green-200';
      case 'GOOD': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FAIR': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'WEAK': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    if (score >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCategoryBarColor = (category: string) => {
    switch (category) {
      case 'EXCELLENT': return 'bg-green-500';
      case 'GOOD': return 'bg-blue-500';
      case 'FAIR': return 'bg-yellow-500';
      case 'WEAK': return 'bg-orange-500';
      case 'FAILED': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  // Early return if data is missing
  if (!screeningRun || !screeningResults) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Data Available</h3>
          <p className="text-slate-600">Screening data is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-2xl font-bold text-slate-900">{screeningRun.summary.total}</div>
              <div className="text-sm text-slate-600">Total Screened</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{screeningRun.summary.passed}</div>
              <div className="text-sm text-slate-600">Passed ({(screeningRun.summary.pass_rate * 100).toFixed(1)}%)</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {Object.entries(screeningRun.summary.categories).map(([category, count]) => (
              <div key={category} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${getCategoryBarColor(category)}`} />
                <span>{category}: {count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <CompactFilterBar
        fields={filterFields}
        values={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by symbol..."
        showSearch={true}
        showQuickFilters={true}
        quickFilterPresets={quickFilterPresets}
        className="mb-6"
      />
      
      {/* Data Table */}
      <DataTable
        data={filteredResults}
        columns={columns}
        sortConfig={sortConfig}
        onSort={handleSort}
        rowKey={(item) => item.symbol}
        emptyMessage={
          searchTerm || filters.category
            ? 'Try adjusting your filters or search terms.'
            : 'No stocks passed the consolidation screening criteria.'
        }
        striped
        stickyHeader
        density="compact"
      />

      {/* Add to Basket Modal */}
      <AddToBasketModal
        isOpen={isAddToBasketModalOpen}
        onClose={() => {
          setIsAddToBasketModalOpen(false);
          setSelectedStock(null);
        }}
        onSuccess={() => {
          setIsAddToBasketModalOpen(false);
          setSelectedStock(null);
        }}
        categories={[
          'WEEK_52_HIGH',
          'TRENDING',
          'NEWLY_LISTED',
          'TRENDING_NEWLY_LISTED',
          'STRONG_FUNDAMENTAL',
          'MY_FAVORITES',
          'MY_PORTFOLIO',
          'WATCHLIST',
          'STRATEGY_CONSOLIDATION',
          'STRATEGY_RESISTANCE_RETEST',
          'STRATEGY_SUPPORT_RETEST',
          'CONSOLIDATION_BREAKOUT_CONFIRMED',
          'RESISTANCE_BREAKOUT_CONFIRMED',
          'SUPPORT_BREAKOUT_CONFIRMED'
        ]}
        prefilledData={selectedStock ? {
          symbol: selectedStock.symbol,
          company_name: selectedStock.company_name,
          date: new Date().toISOString().split('T')[0]
        } : undefined}
      />
    </div>
  );
}
