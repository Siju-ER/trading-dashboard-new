'use client';

import React, { useState } from 'react';
import { BarChart3Icon } from '@/components/shared/icons';
import Feature from '../Feature';
import BenchmarkAnalysis from './BenchmarkAnalysis';
import HistoricAnalysis from './HistoricAnalysis';
import TechnicalAnalysis from './TechnicalAnalysis';

const AnalysisContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'benchmark' | 'historic' | 'technical'>('benchmark');

  const tabs = [
    {
      id: 'benchmark',
      label: 'Benchmark Analysis',
      description: 'Compare stock performance against industry benchmarks',
      icon: '📊'
    },
    {
      id: 'historic',
      label: 'Historic Analysis',
      description: 'Analyze historical price movements and patterns',
      icon: '📈'
    },
    {
      id: 'technical',
      label: 'Technical Analysis',
      description: 'Comprehensive technical indicators and signals',
      icon: '🔍'
    }
  ];

  const handleNotificationClick = () => {
    console.log('Analysis notifications clicked');
  };

  const handleSettingsClick = () => {
    console.log('Analysis settings clicked');
  };

  return (
    <Feature
      title="Market Analysis"
      subtitle="Comprehensive analysis tools for informed trading decisions"
      icon={<BarChart3Icon className="h-6 w-6" />}
      onNotificationClick={handleNotificationClick}
      onSettingsClick={handleSettingsClick}
    >
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 pt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'benchmark' && <BenchmarkAnalysis />}
        {activeTab === 'historic' && <HistoricAnalysis />}
        {activeTab === 'technical' && <TechnicalAnalysis />}
      </div>
    </Feature>
  );
};

export default AnalysisContainer;
