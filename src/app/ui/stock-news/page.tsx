'use client';

import React from 'react';
import Feature from '@/components/features/Feature';
import StockNewsContainer from '@/components/features/stock-news/StockNewsContainer';
import { NewsIcon } from '@/components/shared/icons';

const StockNewsPage: React.FC = () => {
  const handleNotificationClick = () => {};
  const handleSettingsClick = () => {};

  return (
    <Feature
      title="Stock In News"
      subtitle="Latest market news grouped by stock symbol. Expand to view all news for each symbol."
      icon={<NewsIcon className="h-6 w-6" />}
      onNotificationClick={handleNotificationClick}
      onSettingsClick={handleSettingsClick}
    >
      <StockNewsContainer />
    </Feature>
  );
};

export default StockNewsPage;


