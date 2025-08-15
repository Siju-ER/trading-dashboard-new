'use client';

import React from 'react';
import SettingsContainer from '@/components/features/settings/SettingsContainer';
import Feature from '@/components/features/Feature';
import { SettingsIcon } from '@/components/shared/icons';

export default function SettingsPage() {

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
      icon={<SettingsIcon />}
    >
      <SettingsContainer />;
    </Feature>
  );
}