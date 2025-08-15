'use client';

import React, { useState } from 'react';
import { API_BASE_URL } from '@/config';
import Modal from '@/components/shared/ui/modal/Modal';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Badge from '@/components/shared/ui/badge/Badge';
import { 
  XIcon, PlusIcon, ChartBarIcon, BookOpenIcon, AlertCircleIcon 
} from '@/components/shared/icons';

interface WatchlistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const WatchlistDialog: React.FC<WatchlistDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedStock, setSelectedStock] = useState('');
  const [notes, setNotes] = useState('');
  const [trend, setTrend] = useState('');
  const [followStatus, setFollowStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStock || !trend) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const url = new URL(`${API_BASE_URL}/equity/add/watch-list`);
      url.searchParams.append('symbol', selectedStock);
      url.searchParams.append('trend', trend);
      url.searchParams.append('notes', notes);
      
      if (followStatus) {
        url.searchParams.append('follow_status', followStatus);
      }

      const response = await fetch(url.toString(), { method: 'GET' });
      const data = await response.json();
      
      if (data.status === 'success') {
        onSubmit();
        setSelectedStock('');
        setNotes('');
        setTrend('');
        setFollowStatus('');
      } else {
        setError(data.message || 'Failed to add stock to watchlist');
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      setError('An error occurred while adding the stock to watchlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTrendVariant = (trendValue: string) => {
    switch (trendValue) {
      case 'Bullish': return 'success';
      case 'Bearish': return 'danger';
      case 'Cautious': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl shadow-xl">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <div className="flex items-center">
              <PlusIcon className="h-5 w-5 mr-2 text-blue-500" />
              <h2 className="text-xl font-bold">Add to Watchlist</h2>
            </div>
            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
              Track a new stock in your watchlist
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        {error && (
          <div className="px-6 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 flex items-center">
            <AlertCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
              Stock Symbol
            </label>
            <input
              type="text"
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value.toUpperCase())}
              className="w-full px-3 py-2.5 rounded-lg shadow-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              placeholder="Enter stock symbol (e.g., RELIANCE)"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Trend
              </label>
              <select
                value={trend}
                onChange={(e) => setTrend(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg shadow-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Select Trend</option>
                <option value="Bullish">Bullish</option>
                <option value="Bearish">Bearish</option>
                <option value="Neutral">Neutral</option>
                <option value="Cautious">Cautious</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Follow Status
              </label>
              <select
                value={followStatus}
                onChange={(e) => setFollowStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg shadow-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Status</option>
                <option value="Follow">Follow</option>
                <option value="Watch">Watch</option>
                <option value="Hold">Hold</option>
                <option value="Unfollow">Unfollow</option>
              </select>
            </div>
          </div>
          
          {trend && (
            <div className="flex items-center mt-2">
              <ChartBarIcon className="h-4 w-4 mr-2 text-blue-500" />
              <Badge variant={getTrendVariant(trend)}>
                {trend}
              </Badge>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
              Notes
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3">
                <BookOpenIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg shadow-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                rows={4}
                placeholder="Add your notes, analysis or observations..."
              />
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              You can use markdown formatting in your notes
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <ActionButton
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              variant="primary"
              disabled={!selectedStock || !trend || isSubmitting}
              loading={isSubmitting}
            >
              Add to Watchlist
            </ActionButton>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default WatchlistDialog;