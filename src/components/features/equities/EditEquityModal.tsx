'use client';

import React, { useState, useEffect } from 'react';
import { SaveIcon, AlertCircleIcon } from '@/components/shared/icons';
import { useEquityMeta } from '@/lib/hooks/useEquityMeta';
import { API_BASE_URL } from '@/config';
import EnhancedCalendar from '@/components/shared/ui/calendar/EnhancedCalendar';
import Modal from '@/components/shared/ui/modal/Modal';

interface EquityItem {
  _id?: string;
  symbol: string;
  name_of_company: string;
  series: string;
  date_of_listing: string;
  sector: string;
  industry: string;
}

interface EditEquityModalProps {
  isOpen: boolean;
  onClose: () => void;
  equity: EquityItem | null;
  onUpdate: () => void;
}

const EditEquityModal: React.FC<EditEquityModalProps> = ({
  isOpen,
  onClose,
  equity,
  onUpdate,
}) => {
  const { sectors, industries, isLoading: metaLoading } = useEquityMeta();
  const [formData, setFormData] = useState({
    name_of_company: '',
    series: '',
    date_of_listing: '',
    sector: '',
    industry: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update form data when equity changes
  useEffect(() => {
    if (equity) {
      setFormData({
        name_of_company: equity.name_of_company || '',
        series: equity.series || '',
        date_of_listing: equity.date_of_listing ? equity.date_of_listing.split('T')[0] : '',
        sector: equity.sector || '',
        industry: equity.industry || '',
      });
      setError(null);
      setSuccess(false);
    }
  }, [equity]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      handleInputChange('date_of_listing', `${year}-${month}-${day}`);
    } else {
      handleInputChange('date_of_listing', '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equity?.symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      // Prepare payload - only include fields that have values
      const payload: Record<string, any> = {};
      
      if (formData.name_of_company.trim()) {
        payload.name_of_company = formData.name_of_company.trim();
      }
      if (formData.series.trim()) {
        payload.series = formData.series.trim();
      }
      if (formData.date_of_listing) {
        payload.date_of_listing = formData.date_of_listing;
      }
      if (formData.sector) {
        payload.sector = formData.sector;
      }
      if (formData.industry) {
        payload.industry = formData.industry;
      }

      const response = await fetch(`${API_BASE_URL}/equity?symbol=${encodeURIComponent(equity.symbol)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          onUpdate();
          onClose();
        }, 1500);
      } else {
        setError(result.message || 'Failed to update equity');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen || !equity) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="2xl"
      height="auto"
      className="max-h-[90vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Edit Equity: {equity.symbol}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Update the equity information
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-green-800 font-medium">Equity updated successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">
                Company Name
              </label>
              <input
                type="text"
                value={formData.name_of_company}
                onChange={(e) => handleInputChange('name_of_company', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 font-medium bg-white"
                placeholder="Enter company name"
              />
            </div>

            {/* Series */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">
                Series
              </label>
              <input
                type="text"
                value={formData.series}
                onChange={(e) => handleInputChange('series', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 font-medium bg-white"
                placeholder="Enter series"
              />
            </div>

            {/* Sector */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">
                Sector
              </label>
              <select
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 font-medium bg-white"
                disabled={metaLoading}
              >
                <option value="">Select Sector</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 font-medium bg-white"
                disabled={metaLoading}
              >
                <option value="">Select Industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Listed Date */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-800">
                Listed Date
              </label>
              <EnhancedCalendar
                value={formData.date_of_listing ? (() => {
                  const [year, month, day] = formData.date_of_listing.split('-').map(Number);
                  return new Date(year, month - 1, day);
                })() : null}
                onChange={handleDateChange}
                placeholder="Select listed date"
                size="md"
                variant="outline"
                className="w-full"
                showQuickSelect={false}
                showTodayButton={false}
                showClearButton={true}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-sm font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || metaLoading}
              className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4" />
                  Update Equity
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    );
};

export default EditEquityModal;
