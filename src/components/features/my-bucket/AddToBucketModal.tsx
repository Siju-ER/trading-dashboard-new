'use client';

import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '@/config';
import Modal from '@/components/shared/ui/modal/Modal';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Badge from '@/components/shared/ui/badge/Badge';
import { 
  SearchIcon, XIcon, CalendarIcon, PlusIcon, DollarSignIcon,
  AlertCircleIcon, CheckCircleIcon
} from '@/components/shared/icons';

interface Stock {
  symbol: string;
  company_name: string;
  current_price?: number;
}

interface PrefilledData {
  symbol?: string;
  company_name?: string;
  date?: string;
  logged_price?: number;
}

interface AddToBucketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: string[];
  prefilledData?: PrefilledData;
}

const AddToBucketModal: React.FC<AddToBucketModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  prefilledData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [loggedPrice, setLoggedPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to handle prefilled data
  useEffect(() => {
    if (isOpen && prefilledData) {
      if (prefilledData.symbol && prefilledData.company_name) {
        const prefilledStock: Stock = {
          symbol: prefilledData.symbol,
          company_name: prefilledData.company_name,
          current_price: prefilledData.logged_price
        };
        
        setSelectedStock(prefilledStock);
        setSearchTerm(`${prefilledData.symbol} - ${prefilledData.company_name}`);
      }
      
      if (prefilledData.date) {
        const dateStr = prefilledData.date.includes('T') 
          ? prefilledData.date.split('T')[0] 
          : prefilledData.date;
        setSelectedDate(dateStr);
      }
      
      if (prefilledData.logged_price) {
        setLoggedPrice(prefilledData.logged_price.toString());
      }
    }
  }, [isOpen, prefilledData]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const searchStocks = async (value: string) => {
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/equity?search_field=symbol&search_value=${value}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSearchResults(data.data);
        setShowDropdown(true);
      } else {
        setError('Failed to fetch results. Please try again.');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching stocks:', err);
      setError('An error occurred while searching. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    searchStocks(value);
  };

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    setSearchTerm(`${stock.symbol} - ${stock.company_name}`);
    setShowDropdown(false);
    
    if (stock.current_price) {
      setLoggedPrice(stock.current_price.toString());
    }
  };

  const handleClearSelection = () => {
    setSelectedStock(null);
    setSearchTerm('');
    setLoggedPrice('');
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStock || !selectedDate || (!selectedCategory && !customCategory.trim()) || !loggedPrice) {
      setError('Please fill in all required fields');
      return;
    }

    const priceValue = parseFloat(loggedPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const categoryToUse = showCustomCategory ? customCategory.trim() : selectedCategory;
      
      const response = await fetch(`${API_BASE_URL}/my-basket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          category: categoryToUse,
          date: selectedDate,
          company_name: selectedStock.company_name,
          logged_price: priceValue,
          notes: notes.trim()
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setNotification({ message: 'Successfully added to investment bucket!', type: 'success' });
        setTimeout(() => {
          onSuccess();
          resetForm();
        }, 1000);
      } else {
        setError(data.message || 'Failed to add item to bucket');
      }
    } catch (err) {
      console.error('Error adding to bucket:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while adding the item';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSearchTerm('');
    setSelectedStock(null);
    setSearchResults([]);
    setShowDropdown(false);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedCategory('');
    setCustomCategory('');
    setShowCustomCategory(false);
    setLoggedPrice('');
    setNotes('');
    setError('');
    setNotification(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="2xl"
    >
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Add to Investment Bucket
          </h3>
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-2"
          >
            <XIcon className="h-5 w-5" />
          </ActionButton>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-4 rounded-lg border flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <AlertCircleIcon className="h-5 w-5" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
            <AlertCircleIcon className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stock Search */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Search Stock <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                  className={`w-full pl-10 pr-10 py-3 border border-slate-300 dark:border-slate-600 rounded-lg 
                    bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    ${prefilledData?.symbol ? 'bg-slate-50 dark:bg-slate-600' : ''}`}
                  placeholder={prefilledData?.symbol ? "Stock pre-selected from analysis" : "Search by symbol or company name..."}
                  readOnly={!!prefilledData?.symbol}
                  required
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                {selectedStock && !prefilledData?.symbol && (
                  <ActionButton
                    variant="ghost"
                    size="xs"
                    onClick={handleClearSelection}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    type="button"
                  >
                    <XIcon className="h-4 w-4" />
                  </ActionButton>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showDropdown && !prefilledData?.symbol && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {isSearching ? (
                    <div className="px-4 py-3 text-slate-500 dark:text-slate-400">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((stock, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 border-b border-slate-100 dark:border-slate-600 last:border-b-0"
                        onClick={() => handleStockSelect(stock)}
                      >
                        <div className="font-medium text-slate-800 dark:text-slate-200">{stock.symbol}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{stock.company_name}</div>
                        {stock.current_price && (
                          <div className="text-xs text-blue-600 dark:text-blue-400">Current Price: ₹{stock.current_price}</div>
                        )}
                      </button>
                    ))
                  ) : searchTerm.length >= 2 ? (
                    <div className="px-4 py-3 text-slate-500 dark:text-slate-400">No stocks found</div>
                  ) : null}
                </div>
              )}
            </div>
            {prefilledData?.symbol && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Stock automatically selected from your analysis record
              </p>
            )}
          </div>

          {/* Date and Price Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg 
                    bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    ${prefilledData?.date ? 'bg-slate-50 dark:bg-slate-600' : ''}`}
                  required
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              {prefilledData?.date && (
                <p className="text-xs text-blue-600 dark:text-blue-400">Date from analysis record</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Logged Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={loggedPrice}
                  onChange={(e) => setLoggedPrice(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg 
                    bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    ${prefilledData?.logged_price ? 'bg-slate-50 dark:bg-slate-600' : ''}`}
                  placeholder="Enter price"
                  required
                />
                <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              {prefilledData?.logged_price && (
                <p className="text-xs text-blue-600 dark:text-blue-400">Price from analysis record</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Category <span className="text-red-500">*</span>
            </label>
            
            {!showCustomCategory ? (
              <div className="space-y-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg 
                    bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={!showCustomCategory}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <ActionButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomCategory(true)}
                  leftIcon={<PlusIcon className="h-4 w-4" />}
                  type="button"
                >
                  Add custom category
                </ActionButton>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg 
                    bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter custom category"
                  required={showCustomCategory}
                />
                <ActionButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCustomCategory(false);
                    setCustomCategory('');
                  }}
                  type="button"
                >
                  Use predefined categories
                </ActionButton>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg 
                bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Add any notes about this investment opportunity..."
            />
          </div>

          {/* Summary Box for Prefilled Data */}
          {prefilledData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Analysis Record Summary</h4>
              <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <p><strong>Symbol:</strong> {prefilledData.symbol}</p>
                <p><strong>Company:</strong> {prefilledData.company_name}</p>
                <p><strong>Analysis Date:</strong> {prefilledData.date && formatDate(prefilledData.date)}</p>
                <p><strong>Price:</strong> ₹{prefilledData.logged_price}</p>
              </div>
              <Badge variant="info" size="sm" className="mt-2">
                You only need to select a category to add this to your investment bucket.
              </Badge>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <ActionButton
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              type="button"
            >
              Cancel
            </ActionButton>
            <ActionButton
              variant="primary"
              type="submit"
              disabled={isSubmitting || !selectedStock || !selectedDate || (!selectedCategory && !customCategory.trim()) || !loggedPrice}
            >
              {isSubmitting ? 'Adding...' : 'Add to Bucket'}
            </ActionButton>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// Helper function to format date
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

export default AddToBucketModal;