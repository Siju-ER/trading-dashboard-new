'use client';

import React from 'react';
import WatchlistContainer from '@/components/features/watchlist/WatchlistContainer';
import Feature from '@/components/features/Feature';
import { WatchlistIcon } from '@/components/shared/icons';

export default function WatchlistPage() {
  const headerActions = (
    <div className="flex space-x-3">
      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
        Export Data
      </button>
      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
        Add to Watchlist
      </button>
    </div>
  );
  return (
    <Feature 
      title="Watchlist"
      subtitle="Browse and analyze equities that you added to your watchlist"
      headerActions={headerActions}
      icon={<WatchlistIcon />}
    >
      <WatchlistContainer />
    </Feature>
  );

}