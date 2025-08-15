'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApiData } from '@/lib/hooks/useApiData';
import { API_BASE_URL } from '@/config';
import SearchInput from '@/components/shared/filters/SearchInput';
import FilterSection from '@/components/shared/filters/FilterSection';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import Pagination from '@/components/shared/pagination/Pagination';
import Modal from '@/components/shared/ui/modal/Modal';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Badge from '@/components/shared/ui/badge/Badge';
import FilterPanel from '@/components/shared/filters/FilterPanel';
import WatchlistDetailsModal from './WatchlistDetailsModal';
import WatchlistDialog from './WatchlistDialog';
import { 
  TrendingUpIcon, BarChart3Icon, EyeIcon, StarIcon, EditIcon, TrashIcon,
  PlusIcon, ArrowUpIcon, ArrowDownIcon, ExternalLinkIcon 
} from '@/components/shared/icons';

export interface WatchlistItem {
  _id: string | { $oid: string };
  date: { $date: string };
  symbol: string;
  close: number;
  current_price: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  current_volume?: number;
  trend: string;
  news: string;
  notes: string;
  investment_case: string;
  following_price?: number;
  add_to_wishlist?: boolean;
  created_at?: string;
  followStatus?: string;
}

interface WatchlistContainerProps {
  isWishlist?: boolean;
}

const WatchlistContainer: React.FC<WatchlistContainerProps> = ({ isWishlist = false }) => {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);
  const [modalContent, setModalContent] = useState<'news' | 'notes' | 'investment_case'>('news');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WatchlistItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  // Filter field definitions using your FilterSection format
  const filterFields = [
    {
      name: 'trend',
      label: 'Trend',
      type: 'select' as const,
      placeholder: 'All Trends',
      options: [
        { value: 'Bullish', label: 'Bullish' },
        { value: 'Bearish', label: 'Bearish' },
        { value: 'Neutral', label: 'Neutral' },
        { value: 'Cautious', label: 'Cautious' },
      ],
    },
    {
      name: 'follow_status',
      label: 'Follow Status',
      type: 'select' as const,
      placeholder: 'All Status',
      options: [
        { value: 'Follow', label: 'Follow' },
        { value: 'Watch', label: 'Watch' },
        { value: 'Hold', label: 'Hold' },
        { value: 'Unfollow', label: 'Unfollow' },
      ],
    },
    {
      name: 'start_date',
      label: 'Start Date',
      type: 'date' as const,
    },
    {
      name: 'end_date',
      label: 'End Date',
      type: 'date' as const,
    },
  ];

  // Calculate percentage change
  const calculatePercentageChange = (currentPrice: number | undefined, closePrice: number) => {
    if (!currentPrice || !closePrice) return { value: 'N/A', isPositive: null };
    const change = ((currentPrice - closePrice) / closePrice) * 100;
    return { value: change.toFixed(2), isPositive: change >= 0 };
  };

  const calculateFollowingPercentageChange = (followingPrice: number | undefined, currentPrice: number | undefined) => {
    if (!followingPrice || !currentPrice) return { value: 'N/A', isPositive: null };
    const change = ((currentPrice - followingPrice) / followingPrice) * 100;
    return { value: change.toFixed(2), isPositive: change >= 0 };
  };

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
      case 'Follow': return 'success';
      case 'Hold': return 'warning';
      case 'Watch': return 'info';
      default: return 'neutral';
    }
  };

  // Handle actions
  const handleViewDetails = (item: WatchlistItem, content: 'news' | 'notes' | 'investment_case') => {
    setSelectedItem(item);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | { $oid: string }) => {
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
  };

  const handleToggleWishlist = async (item: WatchlistItem) => {
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
        await refetch();
      } else {
        alert(data.message || 'Failed to update wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('An error occurred while updating wishlist');
    }
  };

  const handleClearFilters = () => {
    updateFilter('trend', '');
    updateFilter('follow_status', '');
    updateFilter('start_date', '');
    updateFilter('end_date', '');
  };

  // Table column definitions using your DataTable format
  const columns: Column<WatchlistItem>[] = [
    {
      field: 'symbol',
      label: 'Symbol',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/dashboard/analysis?symbol=${item.symbol}`)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium"
          >
            {value}
          </button>
          {item.followStatus && (
            <Badge 
              variant={getFollowStatusVariant(item.followStatus)}
              size="sm"
            >
              {item.followStatus}
            </Badge>
          )}
        </div>
      ),
    },
    {
      field: 'created_at',
      label: 'Date Added',
      sortable: true,
      render: (value) => formatDate(value),
      className: 'text-sm text-slate-600 dark:text-slate-300',
    },
    {
      field: 'close',
      label: 'Logged Price',
      render: (value) => (
        <span className="font-medium text-slate-900 dark:text-white">
          ₹{value.toFixed(2)}
        </span>
      ),
    },
    {
      field: 'current_price',
      label: 'Current Price',
      sortable: true,
      render: (value, item) => {
        const change = calculatePercentageChange(value, item.close);
        return (
          <div className="flex flex-col">
            <span className={`font-medium ${
              change.isPositive === true 
                ? 'text-green-600 dark:text-green-400' 
                : change.isPositive === false 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-slate-900 dark:text-white'
            }`}>
              ₹{value?.toFixed(2) || '0.00'}
            </span>
            {change.isPositive !== null && (
              <span className={`text-xs flex items-center ${
                change.isPositive 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
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
    },
    {
      field: 'following_price',
      label: 'Following Price',
      render: (value, item) => {
        if (!value) return <span className="text-slate-500">N/A</span>;
        
        const change = calculateFollowingPercentageChange(value, item.current_price);
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-white">
              ₹{value.toFixed(2)}
            </span>
            {change.isPositive !== null && (
              <span className={`text-xs flex items-center ${
                change.isPositive 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
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
    },
    {
      field: 'volume',
      label: 'Volume',
      render: (value, item) => formatNumber(item.current_volume || value),
      className: 'text-sm text-slate-600 dark:text-slate-300',
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
        <div className="flex items-center space-x-1">
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(item, 'news')}
          >
            <EyeIcon className="h-4 w-4 text-blue-500" />
          </ActionButton>
          
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(item, 'notes')}
          >
            <EyeIcon className="h-4 w-4 text-green-500" />
          </ActionButton>
          
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(item, 'investment_case')}
          >
            <EyeIcon className="h-4 w-4 text-purple-500" />
          </ActionButton>
          
          <ActionButton
            variant="ghost"
            size="sm"
            href={`https://www.tradingview.com/chart/?symbol=${item.symbol}`}
            external
          >
            <TrendingUpIcon className="h-4 w-4 text-blue-500" />
          </ActionButton>
          
          <ActionButton
            variant="ghost"
            size="sm"
            href={`https://www.screener.in/company/${item.symbol}/consolidated/`}
            external
          >
            <BarChart3Icon className="h-4 w-4 text-blue-500" />
          </ActionButton>
          
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => handleToggleWishlist(item)}
          >
            <StarIcon 
              className={`h-4 w-4 ${
                item.add_to_wishlist 
                  ? 'text-yellow-400' 
                  : 'text-gray-400'
              }`}
              filled={item.add_to_wishlist}
            />
          </ActionButton>
          
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => {
              setItemToDelete(item);
              setIsDeleteModalOpen(true);
            }}
          >
            <TrashIcon className="h-4 w-4 text-red-500" />
          </ActionButton>
        </div>
      ),
    },
  ];

  // Mobile card render
  const renderMobileCard = (item: WatchlistItem) => {
    const change = calculatePercentageChange(item.current_price, item.close);

    return (
      <>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push(`/dashboard/analysis?symbol=${item.symbol}`)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium"
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
                    ? 'text-yellow-400' 
                    : 'text-gray-400'
                }`}
                filled={item.add_to_wishlist}
              />
            </ActionButton>
            
            <span className={`text-sm font-medium ${
              change.isPositive === true 
                ? 'text-green-600 dark:text-green-400' 
                : change.isPositive === false 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-slate-900 dark:text-white'
            }`}>
              ₹{item.current_price?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-400 mb-3">
          <div>
            <span className="font-medium">Logged:</span> ₹{item.close.toFixed(2)}
          </div>
          <div>
            <span className="font-medium">Change:</span> 
            {change.isPositive !== null && (
              <span className={`ml-1 ${
                change.isPositive 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
            )}
          </div>
          <div>
            <span className="font-medium">Following:</span> 
            {item.following_price ? `₹${item.following_price.toFixed(2)}` : 'N/A'}
          </div>
          <div>
            <span className="font-medium">Date:</span> {formatDate(item.created_at)}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs">
          <ActionButton
            variant="outline"
            size="xs"
            onClick={() => handleViewDetails(item, 'news')}
          >
            <EyeIcon className="h-3 w-3 mr-1" />
            News
          </ActionButton>
          
          <ActionButton
            variant="outline"
            size="xs"
            onClick={() => handleViewDetails(item, 'notes')}
          >
            <EyeIcon className="h-3 w-3 mr-1" />
            Notes
          </ActionButton>
          
          <ActionButton
            variant="outline"
            size="xs"
            href={`https://www.tradingview.com/chart/?symbol=${item.symbol}`}
            external
          >
            <TrendingUpIcon className="h-3 w-3 mr-1" />
            Chart
          </ActionButton>
          
          <ActionButton
            variant="outline"
            size="xs"
            onClick={() => {
              setItemToDelete(item);
              setIsDeleteModalOpen(true);
            }}
          >
            <TrashIcon className="h-3 w-3 mr-1 text-red-600" />
            Delete
          </ActionButton>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isWishlist ? 'Stock Wishlist' : 'Stock Watchlist'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {isWishlist 
              ? 'Track stocks you want to invest in' 
              : 'Monitor your tracked stocks and price movements'}
          </p>
        </div>
        
        <ActionButton
          variant="primary"
          onClick={() => setIsAddDialogOpen(true)}
          leftIcon={<PlusIcon />}
        >
          Add Stock
        </ActionButton>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={`Search ${isWishlist ? 'wishlist' : 'watchlist'}...`}
            className="flex-1"
          />
        </div>
        
        <FilterPanel
          title="Advanced Filters"
          isOpen={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
          onClear={handleClearFilters}
          variant="bordered"
          collapsible
        >
          <FilterSection
            isVisible={true}
            onToggle={() => {}}
            fields={filterFields}
            values={filters}
            onChange={updateFilter}
            onClear={handleClearFilters}
          />
        </FilterPanel>
      </div>

      {/* Data Table */}
      <DataTable
        data={watchlist}
        columns={columns}
        isLoading={isLoading}
        sortConfig={sortConfig}
        onSort={(field) => setSortConfig({
          key: field,
          direction: sortConfig.key === field && sortConfig.direction === 'asc' ? 'desc' : 'asc',
        })}
        mobileCardRender={renderMobileCard}
        emptyMessage={isWishlist ? "No stocks in wishlist" : "No stocks in watchlist"}
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
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
              Remove from {isWishlist ? 'Wishlist' : 'Watchlist'}
            </h3>
            <p className="mb-6 text-slate-600 dark:text-slate-300">
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
    </div>
  );
};

// Helper functions
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  });
};

const formatNumber = (num: number | undefined): string => {
  if (num === undefined) return 'N/A';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default WatchlistContainer;