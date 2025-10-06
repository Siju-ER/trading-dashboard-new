'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, XIcon, CalendarIcon, PlusIcon, DollarSignIcon } from '@/components/shared/icons';
import Modal from '@/components/shared/ui/modal/Modal';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import { Stock, PrefilledData } from '@/types/my-bucket';
import { API_BASE_URL } from '@/config';

interface AddToBasketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: string[];
  prefilledData?: PrefilledData;
}

const AddToBasketModal: React.FC<AddToBasketModalProps> = ({
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
    } catch (error) {
      console.error('Error searching stocks:', error);
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
        onSuccess();
        resetForm();
      } else {
        setError(data.message || 'Failed to add item to bucket');
      }
    } catch (error) {
      console.error('Error adding to bucket:', error);
      setError('An error occurred while adding the item');
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
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="2xl">
      <div className="bg-white rounded-xl shadow-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">Add to Investment Basket</h3>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Stock Search */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Search Stock <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                  className={`w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-600 ${
                    prefilledData?.symbol ? 'bg-gray-50' : ''
                  }`}
                  placeholder={prefilledData?.symbol ? "Stock pre-selected from analysis" : "Search by symbol or company name..."}
                  readOnly={!!prefilledData?.symbol}
                  required
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                {selectedStock && !prefilledData?.symbol && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                  >
                    <XIcon className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showDropdown && !prefilledData?.symbol && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {isSearching ? (
                    <div className="px-4 py-3 text-gray-500">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((stock, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => handleStockSelect(stock)}
                      >
                        <div className="font-medium text-gray-800">{stock.symbol}</div>
                        <div className="text-sm text-gray-500">{stock.company_name}</div>
                        {stock.current_price && (
                          <div className="text-xs text-blue-600">Current Price: ₹{stock.current_price}</div>
                        )}
                      </button>
                    ))
                  ) : searchTerm.length >= 2 ? (
                    <div className="px-4 py-3 text-gray-500">No stocks found</div>
                  ) : null}
                </div>
              )}
            </div>
            {prefilledData?.symbol && (
              <p className="text-xs text-blue-600 mt-1">
                Stock automatically selected from your analysis record
              </p>
            )}
          </div>

          {/* Date and Price Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 ${
                    prefilledData?.date ? 'bg-gray-50' : ''
                  }`}
                  required
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {prefilledData?.date && (
                <p className="text-xs text-blue-600">Date from analysis record</p>
              )}
            </div>

            {/* Logged Price */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Logged Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={loggedPrice}
                  onChange={(e) => setLoggedPrice(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-600 ${
                    prefilledData?.logged_price ? 'bg-gray-50' : ''
                  }`}
                  placeholder="Enter price"
                  required
                />
                <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {prefilledData?.logged_price && (
                <p className="text-xs text-blue-600">Price from analysis record</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            
            {!showCustomCategory ? (
              <div className="space-y-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                  required={!showCustomCategory}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCustomCategory(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add custom category
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-600"
                  placeholder="Enter custom category"
                  required={showCustomCategory}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomCategory(false);
                    setCustomCategory('');
                  }}
                  className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                >
                  Use predefined categories
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-600"
              rows={4}
              placeholder="Add any notes about this investment opportunity..."
            />
          </div>

          {/* Summary Box for Prefilled Data */}
          {prefilledData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Analysis Record Summary</h4>
              <div className="text-sm text-blue-700">
                <p><strong>Symbol:</strong> {prefilledData.symbol}</p>
                <p><strong>Company:</strong> {prefilledData.company_name}</p>
                <p><strong>Analysis Date:</strong> {prefilledData.date && new Date(prefilledData.date).toLocaleDateString()}</p>
                <p><strong>Price:</strong> ₹{prefilledData.logged_price}</p>
              </div>
                     <p className="text-xs text-blue-600 mt-2">
                       You only need to select a category to add this to your investment basket.
                     </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <ActionButton
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </ActionButton>
            <ActionButton
              variant="primary"
              type="submit"
              disabled={isSubmitting || !selectedStock || !selectedDate || (!selectedCategory && !customCategory.trim()) || !loggedPrice}
            >
                     {isSubmitting ? 'Adding...' : 'Add to Basket'}
            </ActionButton>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddToBasketModal;