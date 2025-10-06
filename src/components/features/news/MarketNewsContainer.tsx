'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NewsIcon, ShoppingBasketIcon, SearchIcon } from '@/components/shared/icons';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import AddToBucketModal from '@/components/features/my-bucket/AddToBucketModal';
import EnhancedCalendar from '@/components/shared/ui/calendar/EnhancedCalendar';
import { NewsItem, NewsFilters } from '@/types/news';
import { API_BASE_URL } from '@/config';

const MarketNewsContainer: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<NewsFilters>({});
  const [isAddToBasketModalOpen, setIsAddToBasketModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Load news data from News Bank API
  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', '1');
      queryParams.append('per_page', '200'); // Get maximum records
      if (filters.news_type) {
        queryParams.append('news_type', filters.news_type);
      }
      if (filters.published_date) {
        queryParams.append('published_date', filters.published_date);
      }

      const response = await fetch(`${API_BASE_URL}/news_bank?${queryParams}`);
      const data = await response.json();
      if (data.status === 'success') {
        setNewsItems(data.data);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load news on component mount and when filters change
  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // Update filter
  const updateFilter = useCallback((key: keyof NewsFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Client-side filtered news with search
  const filteredNews = useMemo(() => {
    let filtered = newsItems;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [newsItems, searchTerm]);

  // Handle add to bucket
  const handleAddToBucket = useCallback(() => {
    setIsAddToBasketModalOpen(true);
  }, []);

  // Handle row selection
  const handleRowSelection = useCallback((itemId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (iso: string): string => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-300">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
            {/* Search bar - First */}
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search news titles..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {/* Date picker - Second */}
            <div className="relative w-full lg:w-48">
              <EnhancedCalendar
                value={filters.published_date ? (() => {
                  const dateStr = filters.published_date;
                  const [year, month, day] = dateStr.split('-').map(Number);
                  return new Date(year, month - 1, day);
                })() : null}
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    updateFilter('published_date', `${year}-${month}-${day}`);
                  } else {
                    updateFilter('published_date', undefined);
                  }
                }}
                placeholder="Select Date"
                size="sm"
                variant="minimal"
                className="w-full"
                showQuickSelect={false}
                showTodayButton={false}
                showClearButton={true}
              />
            </div>

            {/* Global/Indian Toggle - Third */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => updateFilter('news_type', filters.news_type === 'Global' ? undefined : 'Global')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filters.news_type === 'Global'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Global
              </button>
              <button
                onClick={() => updateFilter('news_type', filters.news_type === 'Indian' ? undefined : 'Indian')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filters.news_type === 'Indian'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Indian
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton
              onClick={handleAddToBucket}
              leftIcon={<ShoppingBasketIcon className="h-4 w-4" />}
              variant="ghost"
              size="sm"
              className="!text-purple-600 hover:!text-purple-700 !border !border-purple-200 hover:!border-purple-300 !bg-purple-50 hover:!bg-purple-100"
            >
              Add to Basket
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-300">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading news...</div>
        ) : filteredNews.length === 0 ? (
          <div className="p-10 text-center">
            <div className="inline-block bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-sm">
              <div className="text-sm font-medium text-slate-900">No news</div>
              <div className="text-xs text-slate-600 mt-1">Try adjusting your search criteria or filters</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-gray-50 border border-gray-300 rounded-lg">
              <ul className="divide-y divide-purple-200">
                {filteredNews.map((item) => {
                  const isSelected = selectedRows.has(item.id);
                  return (
                    <li 
                      key={item.id} 
                      className={`p-3 cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-violet-50 border-l-4 border-violet-500' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={(e) => handleRowSelection(item.id, e)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-900 font-medium hover:text-violet-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.title}
                          </a>
                          <div className="mt-1 text-xs text-slate-800 flex flex-wrap items-center gap-2">
                            <span className="text-orange-600 font-medium">{item.source}</span>
                            <span className="text-slate-500">•</span>
                            <span>{formatDate(item.published_date)} {formatTime(item.published_date)}</span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 text-violet-600 text-[11px] font-medium">
                                <svg className="w-3 h-3 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Selected
                              </span>
                            )}
                          </div>
                        </div>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Open link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Add to Basket Modal */}
      <AddToBucketModal
        isOpen={isAddToBasketModalOpen}
        onClose={() => {
          setIsAddToBasketModalOpen(false);
        }}
        onSuccess={() => {
          setIsAddToBasketModalOpen(false);
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
        prefilledData={{
          symbol: 'N/A',
          company_name: 'N/A',
          date: new Date().toISOString().split('T')[0],
          logged_price: 0
        }}
      />
    </div>
  );
};

export default MarketNewsContainer;