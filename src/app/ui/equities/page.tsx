// src/app/dashboard/equities/page.tsx
'use client';

import Feature from '@/components/features/Feature';
import EquityContainer from '@/components/features/equities/EquityContainer';
import { EquitiesIcon } from '@/components/shared/icons';

export default function Equities() {
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
      title="Equities"
      subtitle="Browse and analyze equity instruments across different sectors and industries"
      headerActions={headerActions}
      icon={<EquitiesIcon />}
    >
      <EquityContainer />
    </Feature>
  );
}