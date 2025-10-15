'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApiData } from '@/lib/hooks/useApiData';
import { API_BASE_URL } from '@/config';
import SearchInput from '@/components/shared/filters/SearchInput';
import FilterSection from '@/components/shared/filters/FilterSection';
import CompactFilterBar from '@/components/shared/filters/CompactFilterBar';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import Pagination from '@/components/shared/pagination/Pagination';
import Modal from '@/components/shared/ui/modal/Modal';
import { SymbolDetailsProvider } from '@/components/shared/symbol/SymbolDetailsContext';
import SymbolLink from '@/components/shared/symbol/SymbolLink';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Badge from '@/components/shared/ui/badge/Badge';
import FilterPanel from '@/components/shared/filters/FilterPanel';
import WatchlistDetailsModal from './WatchlistDetailsModal';
import WatchlistDialog from './WatchlistDialog';
import AddToBucketModal from '@/components/features/my-bucket/AddToBucketModal';
import { 
  TrendingUpIcon, BarChart3Icon, EyeIcon, StarIcon, EditIcon, TrashIcon,
  PlusIcon, ArrowUpIcon, ArrowDownIcon, ExternalLinkIcon, HoldIcon, FundaIcon,
  FileTextIcon, ShoppingBasketIcon
} from '@/components/shared/icons';
import { WatchlistItem } from '@/types/watchlist';

interface WatchlistContainerProps {
  isWishlist?: boolean;
}

const WatchlistContainer: React.FC<WatchlistContainerProps> = ({ isWishlist = false }) => {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);
  const [modalContent, setModalContent] = useState<'news' | 'notes' | 'investment_case' | 'business_summary'>('news');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WatchlistItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<WatchlistItem | null>(null);
  const [isAddToBasketModalOpen, setIsAddToBasketModalOpen] = useState(false);
  const [itemToAddToBasket, setItemToAddToBasket] = useState<WatchlistItem | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  // Symbol details modal now managed globally via provider

  // Use your existing useApiData hook
  const {
    data: watchlist,
    isLoading,
    pagination,
    filters,
    sortConfig,
    searchTerm,
    setSearchTerm,
    updateFilter,
    setSortConfig,
    setPagination,
    refetch,
  } = useApiData<WatchlistItem>({
    endpoint: `${API_BASE_URL}/watchlist`,
    method: 'GET',
    initialSort: { key: 'created_at', direction: 'desc' },
    searchField: 'symbol',
    initialFilters: isWishlist ? { add_to_wishlist: 'true' } : {},
  });

  // Local state for optimistic updates
  const [localWatchlist, setLocalWatchlist] = useState<WatchlistItem[]>([]);
  
  // Update local state when watchlist data changes
  useEffect(() => {
    setLocalWatchlist(watchlist);
  }, [watchlist]);

  // Use local watchlist for display
  const displayWatchlist = localWatchlist.length > 0 ? localWatchlist : watchlist;

  // Debug: Log filters when they change
  useEffect(() => {
    console.log('Watchlist filters updated:', filters);
  }, [filters]);

  // Enhanced filter field definitions with beautiful calendar components
  const filterFields = [
    {
      name: 'follow_status',
      label: 'Status',
      type: 'select' as const,
      placeholder: 'Select Status',
      options: [
        { value: 'New', label: 'New' },
        { value: 'Hot', label: 'Hot' },
        { value: 'Hold', label: 'Hold' },
        { value: 'Funda', label: 'Funda' },
      ],
    },
    {
      name: 'trend',
      label: 'Trend',
      type: 'select' as const,
      placeholder: 'Select Trend',
      options: [
        { value: 'Bullish', label: 'Bullish' },
        { value: 'Bearish', label: 'Bearish' },
        { value: 'Neutral', label: 'Neutral' },
        { value: 'Cautious', label: 'Cautious' },
      ],
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

  // Quick filter presets for watchlist
  const quickFilterPresets = [
    {
      label: 'New',
      values: { follow_status: 'New' } as Record<string, string | number | boolean>,
      icon: <PlusIcon className="w-3 h-3" />
    },
    {
      label: 'Hot',
      values: { follow_status: 'Hot' } as Record<string, string | number | boolean>,
      icon: <TrendingUpIcon className="w-3 h-3" />
    },
    {
      label: 'Hold',
      values: { follow_status: 'Hold' } as Record<string, string | number | boolean>,
      icon: <HoldIcon className="w-3 h-3" />
    },
    {
      label: 'Funda',
      values: { follow_status: 'Funda' } as Record<string, string | number | boolean>,
      icon: <FundaIcon className="w-3 h-3" />
    },
    {
      label: 'Wishlist',
      values: { add_to_wishlist: 'true' } as Record<string, string | number | boolean>,
      icon: <StarIcon className="w-3 h-3" />
    }
  ];

  // Memoized calculation functions for better performance
  const calculatePercentageChange = useCallback((currentPrice: number | undefined, closePrice: number) => {
    if (!currentPrice || !closePrice) return { value: 'N/A', isPositive: null };
    const change = ((currentPrice - closePrice) / closePrice) * 100;
    return { value: change.toFixed(2), isPositive: change >= 0 };
  }, []);

  const calculateFollowingPercentageChange = useCallback((followingPrice: number | undefined, currentPrice: number | undefined) => {
    if (!followingPrice || !currentPrice) return { value: 'N/A', isPositive: null };
    const change = ((currentPrice - followingPrice) / followingPrice) * 100;
    return { value: change.toFixed(2), isPositive: change >= 0 };
  }, []);

  // Get trend badge variant
  const getTrendVariant = (trend: string): 'success' | 'danger' | 'warning' | 'neutral' => {
    switch (trend) {
      case 'Bullish': return 'success';
      case 'Bearish': return 'danger';
      case 'Cautious': return 'warning';
      default: return 'neutral';
    }
  };

  const getFollowStatusVariant = (status: string | undefined): 'success' | 'warning' | 'info' | 'neutral' => {
    switch (status) {
      case 'New': return 'info';
      case 'Hot': return 'warning';
      case 'Hold': return 'success';
      case 'Funda': return 'neutral';
      default: return 'neutral';
    }
  };

  // Memoized action handlers for better performance
  const handleViewDetails = useCallback((item: WatchlistItem, content: 'news' | 'notes' | 'investment_case' | 'business_summary') => {
    setSelectedItem(item);
    setModalContent(content);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string | { $oid: string }) => {
    if (!id) return;

    try {
      const response = await fetch(`${API_BASE_URL}/watchlist/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.status === 'success') {
        await refetch();
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      } else {
        alert('Failed to remove item from watchlist');
      }
    } catch (error) {
      console.error('Error removing item from watchlist:', error);
      alert('An error occurred while removing the item');
    }
  }, [refetch]);

  const handleToggleWishlist = useCallback(async (item: WatchlistItem) => {
    // Optimistic update - update UI immediately
    const updatedItem = { ...item, add_to_wishlist: !item.add_to_wishlist };
    
    try {
      const response = await fetch(`${API_BASE_URL}/watchlist/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          add_to_wishlist: !item.add_to_wishlist 
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Update the local data state directly
        setLocalWatchlist((prevData) => 
          prevData?.map((watchlistItem) => 
            watchlistItem._id === item._id ? updatedItem : watchlistItem
          ) || []
        );
      } else {
        // Revert on error
        alert(data.message || 'Failed to update wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('An error occurred while updating wishlist');
    }
  }, []);

  const handleFollowStatusChange = useCallback(async (item: WatchlistItem, newStatus: string) => {
    // Optimistic update - update UI immediately
    const updatedItem = { ...item, followStatus: newStatus };
    
    try {
      const response = await fetch(`${API_BASE_URL}/watchlist/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          followStatus: newStatus 
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Update the local data state directly
        setLocalWatchlist((prevData) => 
          prevData?.map((watchlistItem) => 
            watchlistItem._id === item._id ? updatedItem : watchlistItem
          ) || []
        );
      } else {
        // Revert on error
        alert(data.message || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      alert('An error occurred while updating follow status');
    }
  }, []);

  const handleClearFilters = () => {
    updateFilter('trend', '');
    updateFilter('follow_status', '');
    updateFilter('start_date', '');
    updateFilter('end_date', '');
  };

  // Handle edit button click
  const handleEdit = useCallback((item: WatchlistItem) => {
    setItemToEdit({
      ...item,
      current_price: item.current_price || item.close,
      current_volume: item.current_volume || item.volume,
      following_price: item.following_price || item.current_price || item.close,
      notes: item.notes || '',
      followStatus: item.followStatus || 'New',
    });
    setIsEditModalOpen(true);
  }, []);

  // Handle edit submit
  const handleEditSubmit = useCallback(async () => {
    if (!itemToEdit) return;

    try {
      const response = await fetch(`${API_BASE_URL}/watchlist/${itemToEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemToEdit),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setIsEditModalOpen(false);
        setItemToEdit(null);
        await refetch();
      } else {
        alert(data.message || 'Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('An error occurred while updating the item');
    }
  }, [itemToEdit, refetch]);

  // Handle add to basket
  const handleAddToBasket = useCallback((item: WatchlistItem) => {
    console.log('Add to basket clicked for:', item.symbol);
    setItemToAddToBasket(item);
    setIsAddToBasketModalOpen(true);
  }, []);

  // Memoized table column definitions for better performance
  const columns: Column<WatchlistItem>[] = useMemo(() => [
    {
      field: 'symbol',
      label: 'Symbol',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <SymbolLink symbol={item.symbol}>{value}</SymbolLink>
          <div className="flex items-center space-x-2">
            {/* Follow Status Options Group */}
            <div className="flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md border border-slate-200 bg-slate-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollowStatusChange(item, 'New');
                }}
                className={`px-1.5 py-0.5 rounded text-xs font-medium transition-all duration-200 ${
                  item.followStatus === 'New' 
                    ? 'bg-purple-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-purple-100 hover:text-purple-700'
                }`}
                title="New - Recently added stock"
              >
                New
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollowStatusChange(item, 'Hot');
                }}
                className={`px-1.5 py-0.5 rounded text-xs font-medium transition-all duration-200 ${
                  item.followStatus === 'Hot' 
                    ? 'bg-red-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-red-100 hover:text-red-700'
                }`}
                title="Hot - Trending stock"
              >
                Hot
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollowStatusChange(item, 'Hold');
                }}
                className={`px-1.5 py-0.5 rounded text-xs font-medium transition-all duration-200 ${
                  item.followStatus === 'Hold' 
                    ? 'bg-green-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-green-100 hover:text-green-700'
                }`}
                title="Hold - Holding position in this stock"
              >
                Hold
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollowStatusChange(item, 'Funda');
                }}
                className={`px-1.5 py-0.5 rounded text-xs font-medium transition-all duration-200 ${
                  item.followStatus === 'Funda' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-blue-100 hover:text-blue-700'
                }`}
                title="Funda - Fundamental analysis based"
              >
                Funda
              </button>
            </div>
            
            {/* Separator */}
            <div className="w-px h-6 bg-slate-300"></div>
            
            {/* Wishlist Option */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleWishlist(item);
              }}
              className={`px-1.5 py-0.5 rounded text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
                item.add_to_wishlist 
                  ? 'bg-yellow-500 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-yellow-100 hover:text-yellow-700 border border-slate-200'
              }`}
              title={item.add_to_wishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <StarIcon className="w-3 h-3" filled={item.add_to_wishlist} />
              <span>{item.add_to_wishlist ? 'Wishlist' : 'Wish'}</span>
            </button>
          </div>
        </div>
      ),
    },
    {
      field: 'created_at',
      label: 'Date Added',
      sortable: true,
      render: (value) => formatDate(value),
      className: 'text-sm text-slate-600',
    },
    {
      field: 'sector',
      label: 'Sector',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-slate-900">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      field: 'industry',
      label: 'Industry',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-slate-900">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      field: 'close',
      label: 'Logged Price',
      render: (value) => (
        <span className="font-medium text-slate-900">
          ₹{value.toFixed(2)}
        </span>
      ),
      className: 'text-right',
    },
    {
      field: 'current_price',
      label: 'Current Price',
      sortable: true,
      render: (value, item) => {
        const change = calculatePercentageChange(value, item.close);
        return (
          <div className="flex flex-col items-end text-right">
            <span className={`font-medium ${
              change.isPositive === true 
                ? 'text-green-600' 
                : change.isPositive === false 
                  ? 'text-red-600' 
                  : 'text-slate-900'
            }`}>
              ₹{value?.toFixed(2) || '0.00'}
            </span>
            {change.isPositive !== null && (
              <span className={`text-xs flex items-center justify-end ${
                change.isPositive 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {change.isPositive ? (
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                )}
                {change.value}%
              </span>
            )}
          </div>
        );
      },
      className: 'text-right',
    },
    {
      field: 'following_price',
      label: 'Following Price',
      render: (value, item) => {
        if (!value) return <span className="text-slate-500">N/A</span>;
        
        const change = calculateFollowingPercentageChange(value, item.current_price);
        return (
          <div className="flex flex-col items-end text-right">
            <span className="font-medium text-slate-900">
              ₹{value.toFixed(2)}
            </span>
            {change.isPositive !== null && (
              <span className={`text-xs flex items-center justify-end ${
                change.isPositive 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {change.isPositive ? (
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                )}
                {change.value}%
              </span>
            )}
          </div>
        );
      },
      className: 'text-right',
    },
    {
      field: 'volume',
      label: 'Volume',
      render: (value, item) => formatNumber(item.current_volume || value),
      className: 'text-sm text-slate-600 text-right',
    },
    {
      field: 'trend',
      label: 'Trend',
      sortable: true,
      render: (value) => (
        <Badge variant={getTrendVariant(value)}>
          {value}
        </Badge>
      ),
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, item) => (
        <div className="flex items-center space-x-2">
          <ActionButton
            onClick={() => handleViewDetails(item, 'news')}
            leftIcon={<EyeIcon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-blue-500 hover:!bg-blue-50 hover:!text-blue-600"
          >
            News
          </ActionButton>
          
          <ActionButton
            onClick={() => handleViewDetails(item, 'notes')}
            leftIcon={<EyeIcon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-green-500 hover:!bg-green-50 hover:!text-green-600"
          >
            Notes
          </ActionButton>
          
          <ActionButton
            onClick={() => handleViewDetails(item, 'investment_case')}
            leftIcon={<EyeIcon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-purple-500 hover:!bg-purple-50 hover:!text-purple-600"
          >
            Case
          </ActionButton>
          
          <ActionButton
            onClick={() => handleViewDetails(item, 'business_summary')}
            leftIcon={<FileTextIcon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-orange-500 hover:!bg-orange-50 hover:!text-orange-600"
            disabled={!item.business_summary}
          >
            Summary
          </ActionButton>
          
          <ActionButton
            onClick={() => handleAddToBasket(item)}
            leftIcon={<ShoppingBasketIcon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-purple-500 hover:!bg-purple-50 hover:!text-purple-600 !border !border-purple-200"
          >
            Basket
          </ActionButton>
          
          <ActionButton
            onClick={() => window.open(`https://www.tradingview.com/chart/?symbol=${item.symbol}`, '_blank')}
            leftIcon={<TrendingUpIcon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-blue-500 hover:!bg-blue-50 hover:!text-blue-600"
          >
            Chart
          </ActionButton>
          
          <ActionButton
            onClick={() => window.open(`https://www.screener.in/company/${item.symbol}/consolidated/`, '_blank')}
            leftIcon={<BarChart3Icon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-blue-500 hover:!bg-blue-50 hover:!text-blue-600"
          >
            Screener
          </ActionButton>
          
          <ActionButton
            onClick={() => handleEdit(item)}
            leftIcon={<EditIcon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-green-500 hover:!bg-green-50 hover:!text-green-600"
          >
            Edit
          </ActionButton>
          
          <ActionButton
            onClick={() => {
              setItemToDelete(item);
              setIsDeleteModalOpen(true);
            }}
            leftIcon={<TrashIcon className="h-4 w-4" />}
            variant="ghost"
            size="sm"
            className="!text-red-500 hover:!bg-red-50 hover:!text-red-600"
          >
            Delete
          </ActionButton>
        </div>
      ),
    },
  ], [router, calculatePercentageChange, calculateFollowingPercentageChange, getTrendVariant, getFollowStatusVariant, handleViewDetails, handleToggleWishlist, handleAddToBasket, setItemToDelete, setIsDeleteModalOpen]);

  // Memoized mobile card render for better performance
  const renderMobileCard = useCallback((item: WatchlistItem) => {
    const change = calculatePercentageChange(item.current_price, item.close);

    return (
      <>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push(`/dashboard/analysis?symbol=${item.symbol}`)}
              className="text-violet-600 hover:text-violet-800 hover:underline font-medium"
            >
              {item.symbol}
            </button>
            <Badge variant={getTrendVariant(item.trend)} size="sm">
              {item.trend}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <ActionButton
              variant="ghost"
              size="xs"
              onClick={() => handleToggleWishlist(item)}
            >
              <StarIcon 
                className={`h-4 w-4 ${
                  item.add_to_wishlist 
                    ? 'text-yellow-500' 
                    : 'text-slate-400'
                }`}
                filled={item.add_to_wishlist}
              />
            </ActionButton>
            
            <span className={`text-sm font-medium ${
              change.isPositive === true 
                ? 'text-green-600' 
                : change.isPositive === false 
                  ? 'text-red-600' 
                  : 'text-slate-900'
            }`}>
              ₹{item.current_price?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600 mb-3">
          <div>
            <span className="font-semibold text-slate-700">Logged:</span> 
            <span className="ml-1 text-slate-900">₹{item.close.toFixed(2)}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">Change:</span> 
            {change.isPositive !== null && (
              <span className={`ml-1 font-medium ${
                change.isPositive 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
            )}
          </div>
          <div>
            <span className="font-semibold text-slate-700">Following:</span> 
            <span className="ml-1 text-slate-900">
              {item.following_price ? `₹${item.following_price.toFixed(2)}` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">Date:</span> 
            <span className="ml-1 text-slate-900">{formatDate(item.created_at)}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs">
          <ActionButton
            variant="outline"
            size="xs"
            onClick={() => handleViewDetails(item, 'news')}
            className="!bg-blue-50 !text-blue-700 !border-blue-200 hover:!bg-blue-100"
            leftIcon={<EyeIcon className="h-3 w-3" />}
          >
            News
          </ActionButton>
          
          <ActionButton
            variant="outline"
            size="xs"
            onClick={() => handleViewDetails(item, 'notes')}
            className="!bg-green-50 !text-green-700 !border-green-200 hover:!bg-green-100"
            leftIcon={<EyeIcon className="h-3 w-3" />}
          >
            Notes
          </ActionButton>
          
          <ActionButton
            variant="outline"
            size="xs"
            onClick={() => handleAddToBasket(item)}
            className="!bg-purple-50 !text-purple-700 !border-purple-200 hover:!bg-purple-100 !border-2"
            leftIcon={<ShoppingBasketIcon className="h-3 w-3" />}
          >
            Basket
          </ActionButton>
          
          <ActionButton
            variant="outline"
            size="xs"
            onClick={() => window.open(`https://www.tradingview.com/chart/?symbol=${item.symbol}`, '_blank')}
            className="!bg-blue-50 !text-blue-700 !border-blue-200 hover:!bg-blue-100"
            leftIcon={<TrendingUpIcon className="h-3 w-3" />}
          >
            Chart
          </ActionButton>
          
          <ActionButton
            variant="outline"
            size="xs"
            onClick={() => window.open(`https://www.screener.in/company/${item.symbol}/consolidated/`, '_blank')}
            className="!bg-blue-50 !text-blue-700 !border-blue-200 hover:!bg-blue-100"
            leftIcon={<BarChart3Icon className="h-3 w-3" />}
          >
            Screener
          </ActionButton>
          
          <ActionButton
            variant="outline"
            size="xs"
            onClick={() => handleEdit(item)}
            className="!bg-green-50 !text-green-700 !border-green-200 hover:!bg-green-100"
            leftIcon={<EditIcon className="h-3 w-3" />}
          >
            Edit
          </ActionButton>
          
          <ActionButton
            variant="outline"
            size="xs"
            onClick={() => {
              setItemToDelete(item);
              setIsDeleteModalOpen(true);
            }}
            className="!bg-red-50 !text-red-700 !border-red-200 hover:!bg-red-100"
            leftIcon={<TrashIcon className="h-3 w-3" />}
          >
            Delete
          </ActionButton>
        </div>
      </>
    );
  }, [router, calculatePercentageChange, getTrendVariant, handleToggleWishlist, handleViewDetails, handleAddToBasket, setItemToDelete, setIsDeleteModalOpen]);

  return (
    <SymbolDetailsProvider>
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex items-center justify-between"> */}
        {/* <div> */}
          {/* <h1 className="text-2xl font-bold text-slate-900">
            {isWishlist ? 'Stock Wishlist' : 'Stock Watchlist'}
          </h1>
          <p className="text-sm text-slate-600">
            {isWishlist 
              ? 'Track stocks you want to invest in' 
              : 'Monitor your tracked stocks and price movements'}
          </p> */}
        {/* </div> */}
        
        {/* <ActionButton
          variant="primary"
          onClick={() => setIsAddDialogOpen(true)}
          leftIcon={<PlusIcon />}
        >
          Add Stock
        </ActionButton> */}
      {/* </div> */}

      {/* Compact Search and Filters */}
      <CompactFilterBar
        fields={filterFields}
        values={filters}
        onChange={updateFilter}
        onClear={handleClearFilters}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={`Search ${isWishlist ? 'wishlist' : 'watchlist'}...`}
        showSearch={true}
        showQuickFilters={true}
        quickFilterPresets={quickFilterPresets}
        className="mb-6"
      />

      {/* Data Table */}
      <DataTable
        data={displayWatchlist}
        columns={columns}
        isLoading={isLoading}
        sortConfig={sortConfig}
        onSort={(field) => setSortConfig({
          key: field,
          direction: sortConfig.key === field && sortConfig.direction === 'asc' ? 'desc' : 'asc',
        })}
        onRowSelectionChange={(item, isSelected) => {
          setSelectedRows(prev => {
            const newSet = new Set(prev);
            const key = typeof item._id === 'string' ? item._id : item._id?.$oid || item.symbol;
            if (isSelected) {
              newSet.add(key);
            } else {
              newSet.delete(key);
            }
            return newSet;
          });
        }}
        selectedRows={selectedRows}
        rowKey={(item) => typeof item._id === 'string' ? item._id : item._id?.$oid || item.symbol}
        mobileCardRender={renderMobileCard}
        emptyMessage={isWishlist ? "No stocks in wishlist" : "No stocks in watchlist"}
        striped
        stickyHeader
        density="compact"
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={(page) => setPagination({ currentPage: page })}
        totalRecords={pagination.totalRecords}
        perPage={pagination.perPage}
        showInfo
      />

      {/* Modals */}
      <WatchlistDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedItem={selectedItem}
        modalContent={modalContent}
      />

      <WatchlistDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={() => {
          setIsAddDialogOpen(false);
          refetch();
        }}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          maxWidth="md"
        >
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-slate-900">
              Remove from {isWishlist ? 'Wishlist' : 'Watchlist'}
            </h3>
            <p className="mb-6 text-slate-600">
              Are you sure you want to remove <span className="font-medium">{itemToDelete.symbol}</span> from your {isWishlist ? 'wishlist' : 'watchlist'}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <ActionButton
                variant="ghost"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton
                variant="danger"
                onClick={() => handleDelete(itemToDelete._id)}
              >
                Remove
              </ActionButton>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && itemToEdit && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          maxWidth="4xl"
        >
          <div className="bg-white p-6 rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleEditSubmit();
              }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-900">Edit {itemToEdit.symbol}</h3>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    Symbol
                  </label>
                  <input
                    type="text"
                    value={itemToEdit.symbol}
                    disabled
                    className="block w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    Follow Status
                  </label>
                  <select
                    value={itemToEdit.followStatus || 'New'}
                    onChange={(e) =>
                      setItemToEdit((prev) => ({
                        ...prev!,
                        followStatus: e.target.value,
                      }))
                    }
                    className="block w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="New">New</option>
                    <option value="Hot">Hot</option>
                    <option value="Hold">Hold</option>
                    <option value="Funda">Funda</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    Current Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemToEdit.current_price}
                    onChange={(e) =>
                      setItemToEdit((prev) => ({
                        ...prev!,
                        current_price: parseFloat(e.target.value),
                      }))
                    }
                    className="block w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    Following Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemToEdit.following_price}
                    onChange={(e) =>
                      setItemToEdit((prev) => ({
                        ...prev!,
                        following_price: parseFloat(e.target.value),
                      }))
                    }
                    className="block w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    Current Volume
                  </label>
                  <input
                    type="number"
                    value={itemToEdit.current_volume}
                    onChange={(e) =>
                      setItemToEdit((prev) => ({
                        ...prev!,
                        current_volume: parseFloat(e.target.value),
                      }))
                    }
                    className="block w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Trend
                </label>
                <select
                  value={itemToEdit.trend || 'Neutral'}
                  onChange={(e) =>
                    setItemToEdit((prev) => ({
                      ...prev!,
                      trend: e.target.value,
                    }))
                  }
                  className="block w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Bullish">Bullish</option>
                  <option value="Bearish">Bearish</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Cautious">Cautious</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Notes
                </label>
                <textarea
                  value={itemToEdit.notes || ''}
                  onChange={(e) =>
                    setItemToEdit((prev) => ({
                      ...prev!,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Add or edit notes about this stock..."
                  rows={6}
                  className="block w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-3">
                <ActionButton
                  variant="ghost"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </ActionButton>
                <ActionButton
                  variant="primary"
                  onClick={handleEditSubmit}
                >
                  Save Changes
                </ActionButton>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Add to Basket Modal */}
      {itemToAddToBasket && (
        <AddToBucketModal
          isOpen={isAddToBasketModalOpen}
          onClose={() => {
            setIsAddToBasketModalOpen(false);
            setItemToAddToBasket(null);
          }}
          onSuccess={() => {
            setIsAddToBasketModalOpen(false);
            setItemToAddToBasket(null);
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
            symbol: itemToAddToBasket.symbol,
            company_name: itemToAddToBasket.symbol, // Using symbol as company name since company_name doesn't exist
            date: itemToAddToBasket.created_at,
            logged_price: itemToAddToBasket.current_price || itemToAddToBasket.close
          }}
        />
      )}

      {/* Symbol Details Modal is mounted by SymbolDetailsProvider */}
    </div>
    </SymbolDetailsProvider>
  );
};

// Helper functions
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatNumber = (num: number | undefined): string => {
  if (num === undefined) return 'N/A';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default WatchlistContainer;