'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@/config';
import Pagination from '@/components/shared/pagination/Pagination';
import Badge from '@/components/shared/ui/badge/Badge';
import { SearchIcon, CalendarIcon, ChevronDownIcon, ChevronRightIcon, ExternalLinkIcon, AlertIcon, CheckCircleIcon, RefreshCwIcon, PlusIcon, XIcon, ShoppingBasketIcon } from '@/components/shared/icons';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import AddToBasketModal from '@/components/features/my-bucket/AddToBucketModal';
import SymbolLink from '@/components/shared/symbol/SymbolLink';
import type { PrefilledData } from '@/types/my-bucket';
import Modal from '@/components/shared/ui/modal/Modal';

type NewsItem = {
  news_id: string;
  title: string;
  link: string;
  published_date: string;
  source: string;
  urgency?: 'low' | 'medium' | 'high';
  symbol: string;
  is_read?: boolean;
  is_important?: boolean;
};

type SymbolGroup = {
  symbol: string;
  date: string;
  no_of_news: number;
  news: NewsItem[];
};

const getTodayLocal = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatTime = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
};

const urgencyVariant = (u?: string) => {
  switch (u) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'warning';
    default:
      return 'default';
  }
};

const StockNewsContainer: React.FC = () => {
  const [groups, setGroups] = useState<SymbolGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [symbol, setSymbol] = useState('');
  const [publishedDate, setPublishedDate] = useState(getTodayLocal());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [scrapeAllLoading, setScrapeAllLoading] = useState(false);
  const [scrapeOneLoading, setScrapeOneLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefilled, setPrefilled] = useState<PrefilledData | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Modals for scrape actions
  const [isConfirmAllOpen, setIsConfirmAllOpen] = useState(false);
  const [isSelectSymbolOpen, setIsSelectSymbolOpen] = useState(false);
  const [symbolSearch, setSymbolSearch] = useState('');
  const [symbolResults, setSymbolResults] = useState<Array<{ symbol: string; company_name: string; current_price?: number }>>([]);
  const [isSymbolSearching, setIsSymbolSearching] = useState(false);

  const availableCategories = [
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
    'SUPPORT_BREAKOUT_CONFIRMED',
    'IN_MY_RADAR',
    'BACKLOG'
  ];

  const totalRecords = useMemo(() => totalItems || groups.length, [totalItems, groups.length]);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (symbol.trim()) params.set('symbol', symbol.trim().toUpperCase());
      if (publishedDate) params.set('published_date', publishedDate);
      params.set('page', String(page));
      params.set('per_page', String(perPage));
      const res = await fetch(`${API_BASE_URL}/stock-news?${params.toString()}`);
      const json = await res.json();
      if (json.status === 'success') {
        setGroups(Array.isArray(json.data) ? json.data : []);
        const pg = json.pagination || json.metadata || {};
        if (typeof pg.total_records === 'number') setTotalItems(pg.total_records);
        if (typeof pg.per_page === 'number') setPerPage(pg.per_page);
      } else {
        setError(json.message || 'Failed to load news');
        setGroups([]);
      }
    } catch (err) {
      setError('Unable to fetch news. Please try again.');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, publishedDate, page, perPage]);

  const toggleExpand = (sym: string) => {
    setExpanded((prev) => ({ ...prev, [sym]: !prev[sym] }));
  };

  // Handle row selection
  const handleRowSelection = (symbol: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        newSet.delete(symbol);
      } else {
        newSet.add(symbol);
      }
      return newSet;
    });
  };

  const handleScrapeAll = async () => {
    setScrapeAllLoading(true);
    setToast(null);
    try {
      const res = await fetch(`${API_BASE_URL}/stock-news/scrap-all?news_limit=10`, { method: 'POST' });
      const json = await res.json();
      if (json.status === 'success') {
        setToast({ type: 'success', message: 'Scraping all stocks completed' });
        fetchNews();
      } else {
        setToast({ type: 'error', message: json.message || 'Failed to scrape all stocks' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error while scraping all stocks' });
    } finally {
      setScrapeAllLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleScrapeOne = async () => {
    if (!symbol.trim()) return;
    setScrapeOneLoading(true);
    setToast(null);
    try {
      const res = await fetch(`${API_BASE_URL}/stock-news/scrap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol.trim().toUpperCase(), news_limit: 10 })
      });
      const json = await res.json();
      if (json.status === 'success') {
        setToast({ type: 'success', message: `Scraped ${symbol.toUpperCase()}` });
        fetchNews();
      } else {
        setToast({ type: 'error', message: json.message || 'Failed to scrape symbol' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error while scraping symbol' });
    } finally {
      setScrapeOneLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const totalPages = Math.max(1, Math.ceil((totalRecords || 0) / (perPage || 1)));

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-sm ${toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {toast.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <AlertIcon className="w-5 h-5" />}
          <span className="text-sm">{toast.message}</span>
        </div>
      )}

      {/* Filters Row */}
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-300">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
            {/* Symbol search */}
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={symbol}
                onChange={(e) => { setSymbol(e.target.value); setPage(1); }}
                placeholder="Search by symbol (e.g., TCS)"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {/* Date picker */}
            <div className="relative w-full lg:w-56">
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => { setPublishedDate(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton
              onClick={() => setIsConfirmAllOpen(true)}
              variant="ghost"
              size="sm"
              disabled={scrapeAllLoading}
              className="!bg-green-500 !text-white !border !border-green-500 hover:!bg-green-600 hover:!border-green-600 !shadow-sm hover:!shadow"
            >
              Scrape All
            </ActionButton>
            <ActionButton
              onClick={() => setIsSelectSymbolOpen(true)}
              variant="ghost"
              size="sm"
              disabled={scrapeOneLoading}
              className="!bg-blue-500 !text-white !border !border-blue-500 hover:!bg-blue-600 hover:!border-blue-600 !shadow-sm hover:!shadow"
            >
              Scrape Symbol
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-300">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading news...</div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg m-4 flex items-center gap-2">
            <AlertIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-10 text-center">
            <div className="inline-block bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-sm">
              <div className="text-sm font-medium text-slate-900">No news</div>
              <div className="text-xs text-slate-600 mt-1">Try a different symbol or date filter</div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-300 rounded-lg">
            <div className="divide-y divide-purple-200">
            {groups.map((g) => {
              const isOpen = !!expanded[g.symbol];
              const latestTime = g.news && g.news.length > 0 ? formatTime(g.news[0].published_date) : '';
              const firstTitle = g.news && g.news.length > 0 ? g.news[0].title : '';
              const isSelected = selectedRows.has(g.symbol);
              return (
                <div 
                  key={g.symbol} 
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-violet-50 border-l-4 border-violet-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={(e) => handleRowSelection(g.symbol, e)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(g.symbol);
                        }}
                        className="mt-0.5 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                        aria-label={isOpen ? 'Collapse' : 'Expand'}
                      >
                        {isOpen ? (
                          <ChevronDownIcon className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <SymbolLink symbol={g.symbol} className="text-sm font-semibold text-violet-700 hover:text-violet-900 hover:underline">{g.symbol}</SymbolLink>
                          <Badge variant="default"><span className="text-slate-800">{g.no_of_news}</span> news</Badge>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-violet-600 text-[11px] font-medium">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-700 mt-0.5">
                          {g.date} {latestTime && <span className="text-slate-500">• Latest {latestTime}</span>}
                        </div>
                        <div className="mt-1">
                          {firstTitle && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-900 truncate flex-1 min-w-0">
                                {firstTitle}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(g.symbol);
                                }}
                                className="text-xs text-violet-600 font-medium hover:text-violet-700 underline cursor-pointer flex-none whitespace-nowrap"
                              >
                                (click to see more)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrefilled({ symbol: g.symbol, company_name: g.symbol, date: getTodayLocal() });
                          setIsAddModalOpen(true);
                        }}
                        leftIcon={<ShoppingBasketIcon className="h-4 w-4" />}
                        variant="ghost"
                        size="sm"
                        className="!text-purple-600 hover:!text-purple-700 !border !border-purple-200 hover:!border-purple-300 !bg-purple-50 hover:!bg-purple-100"
                      >
                        Add to Basket
                      </ActionButton>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-3 bg-gray-50 border border-gray-300 rounded-lg">
                              <ul className="divide-y divide-purple-200">
                        {g.news.map((n) => (
                          <li key={n.news_id} className="p-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <a
                                  href={n.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-violet-600 font-medium hover:text-violet-700 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {n.title}
                                </a>
                                <div className="mt-1 text-xs text-slate-800 flex flex-wrap items-center gap-2">
                                  <span className="text-orange-600 font-medium">{n.source}</span>
                                  <span className="text-slate-500">•</span>
                                  <span>{(n.published_date || '').slice(0,10)} {formatTime(n.published_date)}</span>
                                  {n.urgency && (
                                    <Badge variant={urgencyVariant(n.urgency)}>{n.urgency}</Badge>
                                  )}
                                  {n.is_read && (
                                    <span className="inline-flex items-center gap-1 text-green-600 text-[11px]">
                                      <CheckCircleIcon className="w-4 h-4" /> Read
                                    </span>
                                  )}
                                </div>
                              </div>
                              <a
                                href={n.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-md hover:bg-gray-100"
                                aria-label="Open link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLinkIcon className="w-4 h-4 text-gray-600" />
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  </div>
                );
            })}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalRecords > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700">
            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, totalRecords)} of {totalRecords} symbol groups
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            totalRecords={totalRecords}
            perPage={perPage}
            showInfo={false}
          />
        </div>
      )}

      {/* Add To Basket Modal */}
      <AddToBasketModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
        }}
        categories={availableCategories}
        prefilledData={prefilled}
      />

      {/* Confirm Scrape All Modal */}
      <Modal isOpen={isConfirmAllOpen} onClose={() => setIsConfirmAllOpen(false)} maxWidth="md">
        <div className="bg-white rounded-xl shadow-lg w-full">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-slate-900">Run scrape for all stocks?</h3>
            <p className="text-sm text-slate-600 mt-1">This will clear existing news and fetch the latest for all symbols.</p>
          </div>
          <div className="p-6 flex items-center justify-end gap-3">
            <ActionButton variant="outline" size="sm" onClick={() => setIsConfirmAllOpen(false)}>
              Cancel
            </ActionButton>
            <ActionButton variant="primary" size="sm" onClick={async () => { setIsConfirmAllOpen(false); await handleScrapeAll(); }}>
              Run Scrape
            </ActionButton>
          </div>
        </div>
      </Modal>

      {/* Select Symbol to Scrape Modal */}
      <Modal isOpen={isSelectSymbolOpen} onClose={() => setIsSelectSymbolOpen(false)} maxWidth="md">
        <div className="bg-white rounded-xl shadow-lg w-full">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-slate-900">Scrape a specific symbol</h3>
            <p className="text-sm text-slate-600 mt-1">Search and select a stock to run news scraping.</p>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Search Stock</label>
              <div className="relative">
                <input
                  type="text"
                  value={symbolSearch}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setSymbolSearch(val);
                    if (val.length < 2) { setSymbolResults([]); return; }
                    setIsSymbolSearching(true);
                    try {
                      const resp = await fetch(`${API_BASE_URL}/equity?search_field=symbol&search_value=${val}`, { method: 'POST' });
                      const data = await resp.json();
                      setSymbolResults(data.status === 'success' ? data.data : []);
                    } catch {
                      setSymbolResults([]);
                    } finally {
                      setIsSymbolSearching(false);
                    }
                  }}
                  placeholder="Type symbol (e.g., TCS)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              </div>

              <div className="mt-2 max-h-56 overflow-auto border border-gray-100 rounded-lg">
                {isSymbolSearching ? (
                  <div className="p-3 text-sm text-slate-600">Searching...</div>
                ) : symbolResults.length === 0 ? (
                  <div className="p-3 text-sm text-slate-600">No results</div>
                ) : (
                  symbolResults.map((s, idx) => (
                    <button key={idx} type="button" className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0" onClick={async () => {
                      setIsSelectSymbolOpen(false);
                      setSymbol(s.symbol);
                      await handleScrapeOne();
                    }}>
                      <div className="font-medium text-slate-900">{s.symbol}</div>
                      <div className="text-sm text-slate-600">{s.company_name}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="p-6 flex items-center justify-end">
            <ActionButton variant="outline" size="sm" onClick={() => setIsSelectSymbolOpen(false)}>
              Close
            </ActionButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StockNewsContainer;


