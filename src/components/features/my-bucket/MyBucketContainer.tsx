'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, ShoppingBasketIcon, Edit2Icon, Trash2Icon, TrendingUpIcon, BarChart2Icon, EyeIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon, XIcon, DollarSignIcon, CheckCircleIcon, AlertCircleIcon, ArrowUpDownIcon, SearchIcon, CalendarIcon, FilterIcon, RefreshCwIcon, FileTextIcon } from '@/components/shared/icons';
import DataTable from '@/components/shared/table/DataTable';
import Pagination from '@/components/shared/pagination/Pagination';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Modal from '@/components/shared/ui/modal/Modal';
import CompactFilterBar from '@/components/shared/filters/CompactFilterBar';
import EnhancedCalendar from '@/components/shared/ui/calendar/EnhancedCalendar';
import AddToBasketModal from './AddToBucketModal';
import { MyBucketItem } from '@/types/my-bucket';
import { API_BASE_URL } from '@/config';
import { cn } from '@/lib/utils/utils';

const MyBucketContainer: React.FC = () => {
  const [items, setItems] = useState<MyBucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewNotesModalOpen, setIsViewNotesModalOpen] = useState(false);
  const [isViewBusinessSummaryModalOpen, setIsViewBusinessSummaryModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MyBucketItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MyBucketItem | null>(null);
  const [itemToView, setItemToView] = useState<MyBucketItem | null>(null);
  const [itemToViewBusinessSummary, setItemToViewBusinessSummary] = useState<MyBucketItem | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'logged_date',
    direction: 'desc'
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    start_date: '',
    end_date: ''
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Category display mapping
  const categoryDisplayMap: { [key: string]: string } = {
    'WEEK_52_HIGH': 'Week 52 High',
    'TRENDING': 'Trending',
    'NEWLY_LISTED': 'Newly Listed',
    'TRENDING_NEWLY_LISTED': 'Trending Newly Listed',
    'STRONG_FUNDAMENTAL': 'Strong Fundamental',
    'MY_FAVORITES': 'My Favorites',
    'MY_PORTFOLIO': 'My Portfolio',
    'WATCHLIST': 'Watchlist',
    'STRATEGY_CONSOLIDATION': 'Strategy Consolidation',
    'STRATEGY_RESISTANCE_RETEST': 'Strategy Resistance Retest',
    'STRATEGY_SUPPORT_RETEST': 'Strategy Support Retest',
    'CONSOLIDATION_BREAKOUT_CONFIRMED': 'Consolidation Breakout',
    'RESISTANCE_BREAKOUT_CONFIRMED': 'Resistance Breakout',
    'SUPPORT_BREAKOUT_CONFIRMED': 'Support Breakout',
    'IN_MY_RADAR': 'My Radar',
    'BACKLOG': 'Backlog',
  };

  // Available categories
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

  // Filter field definitions
  const filterFields = [
    {
      name: 'category',
      label: 'Category',
      type: 'select' as const,
      placeholder: 'Select Category',
      options: availableCategories.map(category => ({
        value: category,
        label: categoryDisplayMap[category] || category.replace(/_/g, ' ')
      })),
    },
    {
      name: 'start_date',
      label: 'Start Date',
      type: 'date' as const,
      placeholder: 'Select Start Date',
    },
    {
      name: 'end_date',
      label: 'End Date',
      type: 'date' as const,
      placeholder: 'Select End Date',
    },
  ];

  // Update filter function
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Clear filters function
  const handleClearFilters = useCallback(() => {
    setFilters({
      category: '',
      start_date: '',
      end_date: ''
    });
    setSearchTerm('');
  }, []);

  // Sync Status Helper Functions
  const isDataSynced = (updatedAt: string) => {
    const today = new Date();
    const updatedDate = new Date(updatedAt);

    // Use local date strings to avoid timezone issues
    const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    const updatedStr = updatedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format

    return todayStr === updatedStr;
  };

  const getSyncStatus = (updatedAt: string) => {
    const synced = isDataSynced(updatedAt);
    return {
      synced,
      bgColor: synced ? 'bg-green-50' : 'bg-red-50',
      textColor: synced ? 'text-green-800' : 'text-red-800',
      borderColor: synced ? 'border-green-200' : 'border-red-200',
      icon: synced ? CheckCircleIcon : AlertCircleIcon,
      label: synced ? 'Up to date' : 'Outdated',
      iconColor: synced ? 'text-green-500' : 'text-red-500'
    };
  };

  const formatUpdatedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTimeDifference = (updatedAt: string) => {
    const now = new Date();
    const updated = new Date(updatedAt);
    
    // Get local date strings for accurate comparison
    const nowStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    const updatedStr = updated.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    // Debug logging
    console.log('Date comparison:', {
      originalDate: updatedAt,
      parsedDate: updated.toISOString(),
      nowStr,
      updatedStr,
      isToday: nowStr === updatedStr
    });
    
    if (nowStr === updatedStr) return 'Today';
    
    // Calculate difference in days using date strings
    const nowDate = new Date(nowStr);
    const updatedDate = new Date(updatedStr);
    const diffMs = nowDate.getTime() - updatedDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getCategoryBadgeClass = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'WEEK_52_HIGH': 'bg-blue-100 text-blue-800',
      'TRENDING': 'bg-green-100 text-green-800',
      'NEWLY_LISTED': 'bg-purple-100 text-purple-800',
      'TRENDING_NEWLY_LISTED': 'bg-yellow-100 text-yellow-800',
      'STRONG_FUNDAMENTAL': 'bg-indigo-100 text-indigo-800',
      'MY_FAVORITES': 'bg-pink-100 text-pink-800',
      'MY_PORTFOLIO': 'bg-red-100 text-red-800',
      'WATCHLIST': 'bg-emerald-100 text-emerald-800',
      'STRATEGY_CONSOLIDATION': 'bg-cyan-100 text-cyan-800',
      'STRATEGY_RESISTANCE_RETEST': 'bg-orange-100 text-orange-800',
      'STRATEGY_SUPPORT_RETEST': 'bg-lime-100 text-lime-800',
      'CONSOLIDATION_BREAKOUT_CONFIRMED': 'bg-teal-100 text-teal-800',
      'RESISTANCE_BREAKOUT_CONFIRMED': 'bg-violet-100 text-violet-800',
      'SUPPORT_BREAKOUT_CONFIRMED': 'bg-rose-100 text-rose-800',
      'IN_MY_RADAR': 'bg-amber-100 text-amber-800',
      'BACKLOG': 'bg-slate-100 text-slate-800',
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const calculatePercentageChange = (current: number, logged: number) => {
    if (logged === 0) return 0;
    return ((current - logged) / logged) * 100;
  };

  const getChangeDisplay = (current: number, logged: number) => {
    const change = calculatePercentageChange(current, logged);
    const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-800';
    const ChangeIcon = change > 0 ? ArrowUpIcon : change < 0 ? ArrowDownIcon : MinusIcon;

    return (
      <span className={`flex items-center font-medium ${changeColor}`}>
        <ChangeIcon className="h-3 w-3 mr-1" />
        {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  // Generate TradingView URL for a given symbol
  const getTradingViewUrl = (symbol: string) => {
    return `https://www.tradingview.com/chart/?symbol=${symbol}`;
  };

  // Generate Screener.in URL for a given symbol
  const getScreenerUrl = (symbol: string) => {
    return `https://www.screener.in/company/${symbol}/consolidated/`;
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: itemsPerPage.toString(),
        sort_by: sortConfig.key,
        sort_order: sortConfig.direction,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.category && { category: filters.category }),
        ...(filters.start_date && { date_from: filters.start_date }),
        ...(filters.end_date && { date_to: filters.end_date }),
      });

      const response = await fetch(`${API_BASE_URL}/my-basket?${params}`);
      const data = await response.json();

      if (data.status === 'success') {
        setItems(data.data || []);
        setTotalItems(data.total || 0);
      } else {
        setError(data.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, sortConfig, searchTerm, filters]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/my-basket-categories`);
      const data = await response.json();
      if (data.status === 'success') {
        setCategories(data.data || availableCategories);
      } else {
        setCategories(availableCategories);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories(availableCategories);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle sort
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/my-basket/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.status === 'success') {
        setItems(prev => prev.filter(item => item.id !== id));
        setTotalItems(prev => prev - 1);
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('An error occurred while deleting the item');
    }
  };

  // Handle edit
  const handleEdit = (item: MyBucketItem) => {
    setItemToEdit(item);
    setIsEditModalOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    if (!itemToEdit) return;

    try {
      const response = await fetch(`${API_BASE_URL}/my-basket`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemToEdit.id,
          category: itemToEdit.category,
          company_name: itemToEdit.company_name,
          symbol: itemToEdit.symbol,
          date: itemToEdit.logged_date,
          notes: itemToEdit.notes
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === itemToEdit.id
              ? { ...item, updated_at: new Date().toISOString() }
              : item
          )
        );
        setIsEditModalOpen(false);
        setItemToEdit(null);
      } else {
        alert('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('An error occurred while updating the item');
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !item.symbol.toLowerCase().includes(searchLower) &&
        !item.company_name.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (filters.category && item.category !== filters.category) {
      return false;
    }

    if (filters.start_date && new Date(item.logged_date) < new Date(filters.start_date)) {
      return false;
    }

    if (filters.end_date && new Date(item.logged_date) > new Date(filters.end_date)) {
      return false;
    }

    return true;
  });

  // Table columns
  const columns = [
    {
      field: 'symbol',
      label: 'Symbol',
      sortable: true,
      render: (value: any, item: MyBucketItem) => (
        <button
          onClick={() => window.open(`/dashboard/analysis?symbol=${item.symbol}`, '_blank')}
          className="text-violet-600 hover:text-violet-800 hover:underline font-medium"
        >
          {item.symbol}
        </button>
      )
    },
    {
      field: 'logged_date',
      label: 'Logged Date',
      sortable: true,
      render: (value: any, item: MyBucketItem) => (
        <span className="text-sm text-slate-600">
          {formatDate(item.logged_date)}
        </span>
      )
    },
    {
      field: 'category',
      label: 'Category',
      sortable: true,
      render: (value: any, item: MyBucketItem) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeClass(item.category)}`}>
          {categoryDisplayMap[item.category] || item.category.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      field: 'sector',
      label: 'Sector',
      sortable: true,
      render: (value: any, item: MyBucketItem) => (
        <span className="text-sm text-slate-900">
          {item.sector || 'N/A'}
        </span>
      )
    },
    {
      field: 'industry',
      label: 'Industry',
      sortable: true,
      render: (value: any, item: MyBucketItem) => (
        <span className="text-sm text-slate-900">
          {item.industry || 'N/A'}
        </span>
      )
    },
    {
      field: 'logged_price',
      label: 'Logged Price',
      render: (value: any, item: MyBucketItem) => (
        <span className="font-medium text-slate-900">
          {formatCurrency(item.logged_price)}
        </span>
      ),
      className: 'text-right',
    },
    {
      field: 'current_price',
      label: 'Current Price',
      render: (value: any, item: MyBucketItem) => (
        <div className="flex flex-col items-end text-right">
          <span className={`font-medium ${item.current_price > item.logged_price ? 'text-green-600' :
            item.current_price < item.logged_price ? 'text-red-600' : 'text-slate-900'}`}>
            {formatCurrency(item.current_price)}
          </span>
          <span className="text-xs">
            {getChangeDisplay(item.current_price, item.logged_price)}
          </span>
        </div>
      ),
      className: 'text-right',
    },
    {
      field: 'gain',
      label: 'Gain %',
      sortable: true,
      render: (value: any, item: MyBucketItem) => (
        <span className={`font-medium ${item.gain > 0 ? 'text-green-600' :
          item.gain < 0 ? 'text-red-600' : 'text-slate-900'}`}>
          {item.gain > 0 ? '+' : ''}{item.gain.toFixed(2)}%
        </span>
      ),
      className: 'text-right',
    },
    {
      field: 'max_gain',
      label: 'Max Gain %',
      sortable: true,
      render: (value: any, item: MyBucketItem) => (
        <span className={`font-medium ${item.max_gain > 0 ? 'text-green-600' :
          item.max_gain < 0 ? 'text-red-600' : 'text-slate-900'}`}>
          {item.max_gain > 0 ? '+' : ''}{item.max_gain.toFixed(2)}%
        </span>
      ),
      className: 'text-right',
    },
    {
      field: 'logged_volume',
      label: 'Logged Vol',
      render: (value: any, item: MyBucketItem) => (
        <span className="text-sm text-slate-600">
          {formatNumber(item.logged_volume)}
        </span>
      ),
      className: 'text-right',
    },
    {
      field: 'current_volume',
      label: 'Current Vol',
      render: (value: any, item: MyBucketItem) => (
        <div className="flex flex-col items-end text-right">
          <span className="text-slate-900">{formatNumber(item.current_volume)}</span>
          <span className="text-xs">
            {getChangeDisplay(item.current_volume, item.logged_volume)}
          </span>
        </div>
      ),
      className: 'text-right',
    },
    {
      field: 'updated_at',
      label: 'Last Updated',
      sortable: true,
      render: (value: any, item: MyBucketItem) => {
        const syncStatus = getSyncStatus(item.updated_at);
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{formatUpdatedDate(item.updated_at)}</span>
            <span className="text-xs text-slate-600">{getTimeDifference(item.updated_at)}</span>
          </div>
        );
      }
    },
    {
      field: 'sync_status',
      label: 'Sync Status',
      render: (value: any, item: MyBucketItem) => {
        const syncStatus = getSyncStatus(item.updated_at);
        return (
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${syncStatus.bgColor} ${syncStatus.textColor}`}>
            <syncStatus.icon className={`h-3 w-3 mr-1 ${syncStatus.iconColor}`} />
            {syncStatus.label}
          </div>
        );
      }
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (value: any, item: MyBucketItem) => (
        <div className="flex items-center space-x-2">
          <ActionButton
            onClick={() => {
              setItemToView(item);
              setIsViewNotesModalOpen(true);
            }}
            leftIcon={<EyeIcon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-gray-500 hover:!bg-gray-50 hover:!text-gray-600"
            disabled={!item.notes}
          >
            Notes
          </ActionButton>
          <ActionButton
            onClick={() => {
              setItemToViewBusinessSummary(item);
              setIsViewBusinessSummaryModalOpen(true);
            }}
            leftIcon={<FileTextIcon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-purple-500 hover:!bg-purple-50 hover:!text-purple-600"
            disabled={!item.business_summary}
          >
            Summary
          </ActionButton>
          <ActionButton
            onClick={() => handleEdit(item)}
            leftIcon={<Edit2Icon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-green-500 hover:!bg-green-50 hover:!text-green-600"
          >
            Edit
          </ActionButton>
          <ActionButton
            onClick={() => window.open(getTradingViewUrl(item.symbol), '_blank')}
            leftIcon={<TrendingUpIcon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-blue-500 hover:!bg-blue-50 hover:!text-blue-600"
          >
            Chart
          </ActionButton>
          <ActionButton
            onClick={() => window.open(getScreenerUrl(item.symbol), '_blank')}
            leftIcon={<BarChart2Icon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-blue-500 hover:!bg-blue-50 hover:!text-blue-600"
          >
            Screener
          </ActionButton>
          <ActionButton
            onClick={() => {
              setItemToDelete(item);
              setIsDeleteModalOpen(true);
            }}
            leftIcon={<Trash2Icon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-red-500 hover:!bg-red-50 hover:!text-red-600"
          >
            Delete
          </ActionButton>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div>
        <h2 className="text-2xl font-bold text-slate-900">Investment Basket</h2>
        <p className="text-sm text-slate-600">Track and manage your investment opportunities</p>
      </div> */}

      {/* Custom Filter Bar with Add Button */}
      <div className="flex flex-col lg:flex-row gap-3 items-center mb-6">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by symbol or company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        {/* Category Filter */}
        <div className="flex-shrink-0">
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-48 px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Category</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>
                {categoryDisplayMap[category] || category.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date Filter */}
        <div className="flex-shrink-0">
          <EnhancedCalendar
            value={filters.start_date ? (() => {
              const dateStr = filters.start_date;
              const [year, month, day] = dateStr.split('-').map(Number);
              return new Date(year, month - 1, day);
            })() : null}
            onChange={(date) => {
              if (date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                updateFilter('start_date', `${year}-${month}-${day}`);
              } else {
                updateFilter('start_date', '');
              }
            }}
            placeholder="Select Start Date"
            size="sm"
            variant="minimal"
            className="w-48"
            showQuickSelect={false}
            showTodayButton={false}
            showClearButton={true}
          />
        </div>

        {/* End Date Filter */}
        <div className="flex-shrink-0">
          <EnhancedCalendar
            value={filters.end_date ? (() => {
              const dateStr = filters.end_date;
              const [year, month, day] = dateStr.split('-').map(Number);
              return new Date(year, month - 1, day);
            })() : null}
            onChange={(date) => {
              if (date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                updateFilter('end_date', `${year}-${month}-${day}`);
              } else {
                updateFilter('end_date', '');
              }
            }}
            placeholder="Select End Date"
            size="sm"
            variant="minimal"
            className="w-48"
            showQuickSelect={false}
            showTodayButton={false}
            showClearButton={true}
          />
        </div>

        {/* Reset Button */}
        <button
          onClick={handleClearFilters}
          disabled={Object.values(filters).every(v => !v) && !searchTerm}
          className={cn(
            "flex items-center gap-1 px-2 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 flex-shrink-0",
            Object.values(filters).some(v => v) || searchTerm
              ? "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          <XIcon className="w-3 h-3" />
          Clear
          {Object.values(filters).filter(v => v).length > 0 && (
            <span className="ml-1 px-1 py-0.5 bg-white/20 text-xs rounded-full">
              {Object.values(filters).filter(v => v).length}
            </span>
          )}
        </button>

        {/* Add to Basket Button */}
        <ActionButton
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<PlusIcon className="h-4 w-4" />}
          variant="primary"
          size="sm"
          className="flex-shrink-0"
        >
          Add to Basket
        </ActionButton>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
        <DataTable
          data={filteredItems}
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleSort}
          onRowSelectionChange={(item, isSelected) => {
            setSelectedRows(prev => {
              const newSet = new Set(prev);
              const key = item._id || item.id as string;
              if (isSelected) {
                newSet.add(key);
              } else {
                newSet.delete(key);
              }
              return newSet;
            });
          }}
          selectedRows={selectedRows}
          rowKey={(item) => item._id || item.id || item.symbol}
          isLoading={loading}
          emptyMessage="No items found in your bucket. Add some investment opportunities to get started!"
          striped
          stickyHeader
          density="compact"
        />
      </div>

      {/* Pagination */}
      {totalItems > itemsPerPage && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add Modal */}
      <AddToBasketModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchData();
        }}
        categories={categories}
      />

      {/* Edit Modal */}
      {isEditModalOpen && itemToEdit && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="2xl">
          <div className="w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl mb-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900">Edit {itemToEdit.symbol}</h3>
              </div>

              {/* Item Summary */}
              <div className="bg-white p-4 rounded-lg mb-6 border border-gray-100 shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-900">Symbol:</span>
                    <span className="ml-2 font-medium text-gray-900">{itemToEdit.symbol}</span>
                  </div>
                  <div>
                    <span className="text-gray-900">Logged Date:</span>
                    <span className="ml-2 font-medium text-gray-900">{formatDate(itemToEdit.logged_date)}</span>
                  </div>
                  <div>
                    <span className="text-gray-900">Current Price:</span>
                    <span className="ml-2 font-medium text-gray-900">{formatCurrency(itemToEdit.current_price)}</span>
                  </div>
                  <div>
                    <span className="text-gray-900">Current Gain:</span>
                    <span className={`ml-2 font-medium ${itemToEdit.gain > 0 ? 'text-green-600' :
                      itemToEdit.gain < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {itemToEdit.gain > 0 ? '+' : ''}{itemToEdit.gain.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category
                  </label>
                  <select
                    value={itemToEdit.category}
                    onChange={(e) => setItemToEdit({ ...itemToEdit, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {availableCategories.map((category) => (
                      <option key={category} value={category}>
                        {categoryDisplayMap[category] || category.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={itemToEdit.notes}
                    onChange={(e) => setItemToEdit({ ...itemToEdit, notes: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add your investment notes, analysis, or any other relevant information..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <ActionButton
                  onClick={() => setIsEditModalOpen(false)}
                  variant="secondary"
                >
                  Cancel
                </ActionButton>
                <ActionButton
                  onClick={handleEditSubmit}
                  variant="primary"
                >
                  Update Item
                </ActionButton>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="md">
          <div className="p-6 w-full">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl mb-6 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900">Delete Item</h3>
            </div>
            <p className="text-gray-900 mb-6">
              Are you sure you want to delete <span className="font-medium text-gray-900">{itemToDelete.symbol}</span> from your basket? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <ActionButton
                onClick={() => setIsDeleteModalOpen(false)}
                variant="secondary"
              >
                Cancel
              </ActionButton>
              <ActionButton
                onClick={() => {
                  handleDelete(itemToDelete.id);
                  setIsDeleteModalOpen(false);
                }}
                variant="danger"
              >
                Delete
              </ActionButton>
            </div>
          </div>
        </Modal>
      )}

      {/* View Notes Modal */}
      {isViewNotesModalOpen && itemToView && (
        <Modal isOpen={isViewNotesModalOpen} onClose={() => setIsViewNotesModalOpen(false)} maxWidth="2xl">
          <div className="w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl mb-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900">Notes for {itemToView.symbol}</h3>
              </div>

              {/* Item Summary */}
              <div className="bg-white p-4 rounded-lg mb-4 border border-gray-100 shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-900">Category:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeClass(itemToView.category)}`}>
                      {categoryDisplayMap[itemToView.category] || itemToView.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-900">Logged Date:</span>
                    <span className="ml-2 font-medium text-gray-900">{formatDate(itemToView.logged_date)}</span>
                  </div>
                  <div>
                    <span className="text-gray-900">Current Price:</span>
                    <span className="ml-2 font-medium text-gray-900">{formatCurrency(itemToView.current_price)}</span>
                  </div>
                  <div>
                    <span className="text-gray-900">Current Gain:</span>
                    <span className={`ml-2 font-medium ${itemToView.gain > 0 ? 'text-green-600' :
                      itemToView.gain < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {itemToView.gain > 0 ? '+' : ''}{itemToView.gain.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes Content */}
              <div className="bg-white border border-gray-100 p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Notes:</h4>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {itemToView.notes || 'No notes available'}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 mt-4">
                <ActionButton
                  onClick={() => window.open(getTradingViewUrl(itemToView.symbol), '_blank')}
                  leftIcon={<TrendingUpIcon className="h-4 w-4" />}
                  variant="secondary"
                  size="sm"
                >
                  View Chart
                </ActionButton>
                <ActionButton
                  onClick={() => window.open(getScreenerUrl(itemToView.symbol), '_blank')}
                  leftIcon={<BarChart2Icon className="h-4 w-4" />}
                  variant="secondary"
                  size="sm"
                >
                  View Screener
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    setIsViewNotesModalOpen(false);
                    handleEdit(itemToView);
                  }}
                  leftIcon={<Edit2Icon className="h-4 w-4" />}
                  variant="secondary"
                  size="sm"
                >
                  Edit Item
                </ActionButton>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* View Business Summary Modal */}
      {isViewBusinessSummaryModalOpen && itemToViewBusinessSummary && (
        <Modal isOpen={isViewBusinessSummaryModalOpen} onClose={() => setIsViewBusinessSummaryModalOpen(false)} maxWidth="4xl">
          <div className="w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FileTextIcon className="h-6 w-6 text-purple-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">Business Summary</h3>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {itemToViewBusinessSummary.symbol}
                </div>
              </div>

              {/* Item Summary - Enhanced Design */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl mb-6 border border-purple-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Symbol</div>
                    <div className="text-lg font-bold text-gray-900">{itemToViewBusinessSummary.symbol}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Sector</div>
                    <div className="text-sm font-semibold text-gray-900">{itemToViewBusinessSummary.sector || 'N/A'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Industry</div>
                    <div className="text-sm font-semibold text-gray-900">{itemToViewBusinessSummary.industry || 'N/A'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Country</div>
                    <div className="text-sm font-semibold text-gray-900">{itemToViewBusinessSummary.country || 'N/A'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Market Cap</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {itemToViewBusinessSummary.market_cap 
                        ? `₹${(itemToViewBusinessSummary.market_cap / 10000000).toFixed(2)} Cr`
                        : 'N/A'
                      }
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Current Price</div>
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(itemToViewBusinessSummary.current_price)}</div>
                  </div>
                </div>
              </div>

              {/* Business Summary Content - Enhanced */}
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <FileTextIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Business Summary</h4>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                    {itemToViewBusinessSummary.business_summary || 'No business summary available'}
                  </p>
                </div>
              </div>

              {/* Quick Actions - Enhanced */}
              <div className="flex flex-wrap gap-3 mt-6">
                <ActionButton
                  onClick={() => window.open(getTradingViewUrl(itemToViewBusinessSummary.symbol), '_blank')}
                  leftIcon={<TrendingUpIcon className="h-4 w-4" />}
                  variant="secondary"
                  size="sm"
                  className="!bg-blue-50 !text-blue-700 hover:!bg-blue-100 !border-blue-200"
                >
                  View Chart
                </ActionButton>
                <ActionButton
                  onClick={() => window.open(getScreenerUrl(itemToViewBusinessSummary.symbol), '_blank')}
                  leftIcon={<BarChart2Icon className="h-4 w-4" />}
                  variant="secondary"
                  size="sm"
                  className="!bg-green-50 !text-green-700 hover:!bg-green-100 !border-green-200"
                >
                  View Screener
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    setIsViewBusinessSummaryModalOpen(false);
                    handleEdit(itemToViewBusinessSummary);
                  }}
                  leftIcon={<Edit2Icon className="h-4 w-4" />}
                  variant="secondary"
                  size="sm"
                  className="!bg-purple-50 !text-purple-700 hover:!bg-purple-100 !border-purple-200"
                >
                  Edit Item
                </ActionButton>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyBucketContainer;