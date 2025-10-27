'use client';

import React from 'react';
import Modal from '@/components/shared/ui/modal/Modal';
import Badge from '@/components/shared/ui/badge/Badge';
import { DEFAULT_CONSOLIDATION_CONFIG, PARAMETER_PRESETS } from '@/types/consolidation-screening';

interface ConsolidationInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConsolidationInfoModal: React.FC<ConsolidationInfoModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="7xl">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Consolidation Screening Guide
          </h2>
          <p className="text-slate-600">
            Learn how to use the consolidation screening system to identify stocks in consolidation phases.
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* Parameter Presets */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Quick Setup Presets</h3>
          <p className="text-slate-600 mb-6">
            Choose from predefined configurations optimized for different consolidation patterns.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(PARAMETER_PRESETS).map(([key, preset]) => (
              <div
                key={key}
                className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{preset.name}</h4>
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
        </div>

        {/* Default Configuration */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Default Configuration</h3>
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
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Sample Results</h3>
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

        {/* How to Use */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">How to Use</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <span className="font-semibold">1.</span>
              <span>Create your screening criteria using the "Create Criteria" button</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">2.</span>
              <span>Choose from presets or customize parameters based on your strategy</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">3.</span>
              <span>Run the screening to analyze all NSE stocks</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">4.</span>
              <span>Review results categorized by consolidation strength</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">5.</span>
              <span>Click on symbols to view detailed analysis and add to your basket</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConsolidationInfoModal;
