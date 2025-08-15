'use client';

import React from 'react';
import Feature from '@/components/features/Feature';
import { ScannerIcon, WatchlistIcon } from '@/components/shared/icons';
import TechnicalScanner from '@/components/features/scanner/TechnicalScanner';

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
      title="Scanner"
      subtitle="Browse and analyze equities that you added to your watchlist"
      headerActions={headerActions}
      icon={<ScannerIcon />}
    >
      <TechnicalScanner />
    </Feature>
  );

}