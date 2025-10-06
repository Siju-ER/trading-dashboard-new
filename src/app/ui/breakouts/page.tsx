'use client';

import React from 'react';
import BreakoutContainer from '@/components/features/breakouts/BreakoutContainer';
import Feature from '@/components/features/Feature';
import { BarChart3Icon } from '@/components/shared/icons';

export default function BreakoutsPage() {
  const headerActions = (
    <div className="flex space-x-3">
      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
        Export Data
      </button>
      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
        Add Alert
      </button>
    </div>
  );

  return (
    <Feature 
      title="Breakout Scanner"
      subtitle="Discover high-potential breakout opportunities with detailed trade setups"
      headerActions={headerActions}
      icon={<BarChart3Icon />}
    >
      <BreakoutContainer />
    </Feature>
  );
}
