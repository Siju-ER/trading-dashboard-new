'use client';

import React from 'react';
import Feature from '@/components/features/Feature';
import MyBucketContainer from '@/components/features/my-bucket/MyBucketContainer';
import { ShoppingBasketIcon, PlusIcon, TrendingUpIcon } from '@/components/shared/icons';
import ActionButton from '@/components/shared/ui/button/ActionButton';

export default function MyBucketPage() {
  const headerActions = (
    <div className="flex space-x-3">
      <ActionButton
        leftIcon={<TrendingUpIcon className="w-4 h-4" />}
        variant="secondary"
        onClick={() => console.log('Export Data')}
      >
        Export Data
      </ActionButton>
      <ActionButton
        leftIcon={<PlusIcon className="w-4 h-4" />}
        variant="primary"
        onClick={() => console.log('Bulk Add')}
      >
        Bulk Add
      </ActionButton>
    </div>
  );

  return (
    <Feature
      title="Investment Basket"
      subtitle="Track and manage your investment opportunities with comprehensive analysis tools"
      // headerActions={headerActions}
      icon={<ShoppingBasketIcon />}
    >
      <MyBucketContainer />
    </Feature>
  );
}