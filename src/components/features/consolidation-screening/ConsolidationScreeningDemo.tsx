'use client';

import { useState } from 'react';
import { DEFAULT_CONSOLIDATION_CONFIG, PARAMETER_PRESETS } from '@/types/consolidation-screening';
import Button from '@/components/shared/form/Button';
import Badge from '@/components/shared/ui/badge/Badge';

export default function ConsolidationScreeningDemo() {
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const handlePresetSelect = (presetKey: string) => {
    setSelectedPreset(presetKey);
  };

  const resetSelection = () => {
    setSelectedPreset('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Consolidation Screening System
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Identify stocks in consolidation phases using quantitative analysis. 
          Create custom screening criteria and discover potential breakout candidates.
        </p>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Custom Criteria</h3>
          <p className="text-slate-600 text-sm">
            Create screening criteria with 12 configurable parameters for precise consolidation detection.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Real-time Screening</h3>
          <p className="text-slate-600 text-sm">
            Run screenings across all NSE stocks and get immediate results with detailed analysis.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Smart Analysis</h3>
          <p className="text-slate-600 text-sm">
            Get categorized results (EXCELLENT, GOOD, FAIR, WEAK) with comprehensive metrics.
          </p>
        </div>
      </div>

      {/* Parameter Presets Demo */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Setup Presets</h2>
        <p className="text-slate-600 mb-6">
          Choose from predefined configurations optimized for different consolidation patterns.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(PARAMETER_PRESETS).map(([key, preset]) => (
            <div
              key={key}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPreset === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
              onClick={() => handlePresetSelect(key)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">{preset.name}</h3>
                {selectedPreset === key && (
                  <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 mb-3">{preset.description}</p>
              <div className="text-xs text-slate-500">
                <div className="grid grid-cols-2 gap-1">
                  <span>N: {preset.config.N}</span>
                  <span>X: {preset.config.X}%</span>
                  <span>Y: {preset.config.Y}%</span>
                  <span>Z: {preset.config.Z}</span>
                  <span>M: {preset.config.M}</span>
                  <span>V: {preset.config.V_frac}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedPreset && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-slate-900">
                {PARAMETER_PRESETS[selectedPreset].name} Configuration
              </h4>
              <Button size="sm" variant="secondary" onClick={resetSelection}>
                Clear Selection
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(PARAMETER_PRESETS[selectedPreset].config).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-slate-600">{key}:</span>
                  <span className="font-medium text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Default Configuration */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Default Configuration</h2>
        <p className="text-slate-600 mb-4">
          The default configuration provides balanced parameters for general consolidation screening.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {Object.entries(DEFAULT_CONSOLIDATION_CONFIG).map(([key, value]) => (
            <div key={key} className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">{key}:</span>
              <span className="font-medium text-slate-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Results */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Sample Results</h2>
        <p className="text-slate-600 mb-4">
          Example of how consolidation screening results are categorized and displayed.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Symbol</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Score</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Category</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Price Range</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Volume Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-2 font-medium text-slate-900">RELIANCE</td>
                <td className="px-4 py-2 text-green-600 font-bold">8.5</td>
                <td className="px-4 py-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">EXCELLENT</Badge>
                </td>
                <td className="px-4 py-2 text-slate-600">2.1%</td>
                <td className="px-4 py-2 text-slate-600">45%</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-slate-900">TCS</td>
                <td className="px-4 py-2 text-green-600 font-bold">8.2</td>
                <td className="px-4 py-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">EXCELLENT</Badge>
                </td>
                <td className="px-4 py-2 text-slate-600">2.3%</td>
                <td className="px-4 py-2 text-slate-600">48%</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-slate-900">INFY</td>
                <td className="px-4 py-2 text-blue-600 font-bold">7.8</td>
                <td className="px-4 py-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">GOOD</Badge>
                </td>
                <td className="px-4 py-2 text-slate-600">3.2%</td>
                <td className="px-4 py-2 text-slate-600">52%</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-slate-900">HDFC</td>
                <td className="px-4 py-2 text-blue-600 font-bold">7.5</td>
                <td className="px-4 py-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">GOOD</Badge>
                </td>
                <td className="px-4 py-2 text-slate-600">3.5%</td>
                <td className="px-4 py-2 text-slate-600">55%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-8">
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          Start Using Consolidation Screening
        </Button>
        <p className="text-sm text-slate-500 mt-2">
          Navigate to the Consolidation Screening section to create your first criteria
        </p>
      </div>
    </div>
  );
}
