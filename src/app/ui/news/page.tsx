'use client';

import React from 'react';
import Feature from '@/components/features/Feature';
import MarketNewsContainer from '@/components/features/news/MarketNewsContainer';
import { NewsIcon } from '@/components/shared/icons';

export default function NewsPage() {
  const headerActions = (
    <div className="flex space-x-3">
      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
        Export News
      </button>
      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
        Add Alert
      </button>
    </div>
  );

  return (
    <Feature 
      title="Market News"
      subtitle="Stay updated with the latest global and Indian market news"
      headerActions={headerActions}
      icon={<NewsIcon className="h-6 w-6" />}
    >
      <MarketNewsContainer />
    </Feature>
  );
}
