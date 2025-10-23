'use client';

import { useState } from 'react';
import { ScreeningRunResponse, ScreeningResultsResponse } from '@/types/consolidation-screening';
import Button from '@/components/shared/form/Button';
import Badge from '@/components/shared/ui/badge/Badge';
import Input from '@/components/shared/form/Input';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'symbol' | 'category'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const categories = ['ALL', 'EXCELLENT', 'GOOD', 'FAIR', 'WEAK', 'FAILED'];
  
  // Filter and sort results
  const filteredResults = screeningResults.results
    .filter(result => {
      const matchesCategory = selectedCategory === 'ALL' || result.category === selectedCategory;
      const matchesSearch = result.ticker.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'symbol':
          comparison = a.ticker.localeCompare(b.ticker);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const exportResults = () => {
    const csvContent = [
      ['Symbol', 'Score', 'Category', 'Consolidating', 'Screening Date'].join(','),
      ...filteredResults.map(result => [
        result.ticker,
        result.score.toFixed(2),
        result.category,
        result.consolidating_flag ? 'Yes' : 'No',
        formatDate(result.screening_date)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consolidation-results-${screeningRun.criteria_name.replace(/\s+/g, '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Consolidation Screening Results
            </h2>
            <p className="text-slate-600">
              Criteria: {screeningRun.criteria_name} • Last Run: {formatDate(screeningRun.screening_date)}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => onRunAgain(screeningRun.criteria_id)}
            >
              Run Again
            </Button>
            <Button
              variant="secondary"
              onClick={exportResults}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              onClick={onBack}
            >
              Back to Criteria
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-slate-900">{screeningRun.total_screened}</div>
          <div className="text-sm text-slate-600">Total Screened</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{screeningRun.passed_count}</div>
          <div className="text-sm text-slate-600">Passed ({screeningRun.pass_rate.toFixed(1)}%)</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {screeningRun.total_screened - screeningRun.passed_count}
          </div>
          <div className="text-sm text-slate-600">Failed</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {screeningResults.results.length > 0 
              ? (screeningResults.results.reduce((sum, r) => sum + r.score, 0) / screeningResults.results.length).toFixed(1)
              : '0.0'
            }
          </div>
          <div className="text-sm text-slate-600">Avg Score</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Category Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(screeningRun.category_breakdown).map(([category, count]) => {
            const percentage = ((count / screeningRun.total_screened) * 100).toFixed(1);
            return (
              <div key={category} className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(category)}`}>
                  {category}
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">{count}</div>
                <div className="text-sm text-slate-600">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'ALL' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'score' | 'symbol' | 'category');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="score-desc">Score (High to Low)</option>
              <option value="score-asc">Score (Low to High)</option>
              <option value="symbol-asc">Symbol (A-Z)</option>
              <option value="symbol-desc">Symbol (Z-A)</option>
              <option value="category-asc">Category (A-Z)</option>
              <option value="category-desc">Category (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Price Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Volume Ratio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredResults.map((result) => (
                <tr key={result.ticker} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{result.ticker}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${getScoreColor(result.score)}`}>
                      {result.score.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`${getCategoryColor(result.category)} border`}>
                      {result.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={result.consolidating_flag ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {result.consolidating_flag ? 'Consolidating' : 'Not Consolidating'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {result.N_range_pct.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {(result.vol_ratio_to_M * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        // TODO: Implement detailed view modal
                        console.log('View details for', result.ticker);
                      }}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Results Found</h3>
            <p className="text-slate-600">
              {searchTerm || selectedCategory !== 'ALL' 
                ? 'Try adjusting your filters or search terms.'
                : 'No stocks passed the consolidation screening criteria.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mt-4 text-sm text-slate-600">
        Showing {filteredResults.length} of {screeningResults.results.length} results
      </div>
    </div>
  );
}
