'use client';

import React, { useState } from 'react';
import { ServerIcon, SettingsIcon, NetworkIcon, MoonIcon, SunIcon } from '@/components/shared/icons';
import ProcessStatus from '@/components/features/settings/ProcessStatus';
import { useTheme } from '@/components/shared/providers/ThemeProvider';
// import ApiSettings from '@/components/features/settings/ApiSettings';

interface TabProps {
  id: string;
  label: string;
  icon: React.ElementType;
}

const SettingsContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('system');
  const { theme, toggleTheme } = useTheme();
  
  const tabs: TabProps[] = [
    { id: 'system', label: 'System Status', icon: ServerIcon },
    { id: 'api', label: 'API Settings', icon: NetworkIcon },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <SettingsIcon className="h-6 w-6 mr-2 text-blue-600" />
            Settings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your system configuration and API settings
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
        </button>
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
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 flex items-center space-x-2 whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10' 
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${index < tabs.length - 1 ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'system' && <ProcessStatus />}
          {/* {activeTab === 'api' && <ApiSettings />} */}
        </div>
      </div>
    </div>
  );
};

export default SettingsContainer;