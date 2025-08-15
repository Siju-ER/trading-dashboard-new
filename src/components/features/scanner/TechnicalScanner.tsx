'use client';

import React, { useState, useEffect } from 'react';
import { 
  SearchIcon, 
  BarChart3Icon, 
  TrendingUpIcon, 
  AnalyticsIcon,
  ZapIcon,
  PieChartIcon 
} from '@/components/shared/icons';
import SupportResistanceScanner from './SupportResistanceScanner';
import DeliveryVolumePeaks from './DeliveryVolumePeaks';
import DeliveryPeaksRSIRange from './DeliveryPeaksRSIRange';
import AnalysisTracker from './AnalysisTracker';

interface TabProps {
  id: string;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
  comingSoon?: boolean;
}

const TechnicalScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState('support-resistance');
  
  // Check URL params for initial tab (useful for navigation from other components)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);
  
  const tabs: TabProps[] = [
    { 
      id: 'support-resistance', 
      label: 'Support & Resistance', 
      icon: TrendingUpIcon 
    },
    { 
      id: 'delivery-volume-peaks', 
      label: 'Delivery Volume Peaks', 
      icon: BarChart3Icon 
    },
    { 
      id: 'delivery-volume-peaks-rsi-range', 
      label: 'Delivery Volume Peaks RSI Range', 
      icon: AnalyticsIcon 
    },
    { 
      id: 'analysis-tracker', 
      label: 'Analysis Tracker', 
      icon: SearchIcon 
    },
    { 
      id: 'momentum', 
      label: 'Momentum', 
      icon: ZapIcon, 
      disabled: true, 
      comingSoon: true 
    },
    { 
      id: 'fundamental', 
      label: 'Fundamental', 
      icon: PieChartIcon, 
      disabled: true, 
      comingSoon: true 
    },
  ];
  
  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (!disabled) {
      setActiveTab(tabId);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'support-resistance':
        return <SupportResistanceScanner />;
      case 'delivery-volume-peaks':
        return <DeliveryVolumePeaks />;
      case 'delivery-volume-peaks-rsi-range':
        return <DeliveryPeaksRSIRange />;
      case 'analysis-tracker':
        return <AnalysisTracker />;
      case 'momentum':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <ZapIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Momentum Scanner</h3>
              <p>This feature is coming soon. Stay tuned for momentum-based stock analysis!</p>
            </div>
          </div>
        );
      case 'fundamental':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <PieChartIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Fundamental Scanner</h3>
              <p>This feature is coming soon. Stay tuned for fundamental analysis tools!</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Technical Scanner</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Advanced technical analysis tools for stock screening and analysis
          </p>
        </div>
      </div>
      
      {/* Tab Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, tab.disabled)}
                  disabled={tab.disabled}
                  className={`px-6 py-4 flex items-center space-x-2 whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10' 
                      : tab.disabled
                        ? 'border-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${index < tabs.length - 1 ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.comingSoon && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default TechnicalScanner;