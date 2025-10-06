'use client';

import React, { useEffect, useState } from 'react';
import Modal from '@/components/shared/ui/modal/Modal';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Badge from '@/components/shared/ui/badge/Badge';
import { API_BASE_URL } from '@/config';

interface SymbolDetailsModalProps {
  isOpen: boolean;
  symbol?: string;
  onClose: () => void;
}

type EquityDetailsResponse = {
  status: string;
  data?: any;
  message?: string;
};

const SymbolDetailsModal: React.FC<SymbolDetailsModalProps> = ({ isOpen, symbol, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<any | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!isOpen || !symbol) return;
      setIsLoading(true);
      setError(null);
      setDetails(null);
      try {
        const res = await fetch(`${API_BASE_URL}/equity-details?symbol=${encodeURIComponent(symbol)}`);
        const json: EquityDetailsResponse = await res.json();
        if (json.status === 'success' && json.data) {
          setDetails(json.data);
        } else {
          setError(json.message || 'Failed to load details');
        }
      } catch (e) {
        setError('Unable to fetch details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [isOpen, symbol]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="7xl">
      <div className="bg-white rounded-xl shadow-lg w-full">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-xl font-bold text-slate-900 truncate">{symbol || 'Symbol'}</h3>
            {details?.symbol_info?.company_name && (
              <Badge variant="neutral">{details.symbol_info.company_name}</Badge>
            )}
          </div>
          <ActionButton variant="outline" size="sm" onClick={onClose}>Close</ActionButton>
        </div>

        <div className="p-5 max-h-[85vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-10 text-center text-slate-600">Loading details…</div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
              <span>{error}</span>
            </div>
          ) : !details ? (
            <div className="p-10 text-center text-slate-600">No data</div>
          ) : (
            <div className="space-y-6">
              {details.breadcrumbs && Array.isArray(details.breadcrumbs) && details.breadcrumbs.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-2">Path</div>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                    {details.breadcrumbs.map((b: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="truncate max-w-[180px]">{b.text}</span>
                        {idx < details.breadcrumbs.length - 1 && <span className="text-slate-400">/</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-semibold text-slate-800 mb-2">Company Profile</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div><span className="text-slate-500">Sector:</span> <span className="text-slate-900">{details.company_profile?.sector || '—'}</span></div>
                      <div><span className="text-slate-500">Industry:</span> <span className="text-slate-900">{details.company_profile?.industry || '—'}</span></div>
                      <div><span className="text-slate-500">CEO:</span> <span className="text-slate-900">{details.company_profile?.ceo || '—'}</span></div>
                      <div><span className="text-slate-500">Headquarters:</span> <span className="text-slate-900">{details.company_profile?.headquarters || '—'}</span></div>
                      <div><span className="text-slate-500">Founded:</span> <span className="text-slate-900">{details.company_profile?.founded || '—'}</span></div>
                      <div><span className="text-slate-500">Website:</span> <span className="text-slate-900">{details.company_profile?.website || '—'}</span></div>
                      <div><span className="text-slate-500">ISIN:</span> <span className="text-slate-900">{details.company_profile?.isin || '—'}</span></div>
                      <div><span className="text-slate-500">FIGI:</span> <span className="text-slate-900">{details.company_profile?.figi || '—'}</span></div>
                    </div>
                    {details.company_profile?.description && (
                      <div className="mt-3 text-sm text-slate-700 leading-relaxed">
                        {details.company_profile.description}
                      </div>
                    )}
                  </div>

                  {details.faqs && Array.isArray(details.faqs) && details.faqs.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="text-sm font-semibold text-slate-800 mb-2">FAQs</div>
                      <div className="space-y-3">
                        {details.faqs.slice(0, 6).map((f: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            <div className="font-medium text-slate-900">{f.question}</div>
                            <div className="text-slate-700 mt-0.5">{f.answer}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-semibold text-slate-800 mb-2">Key Statistics</div>
                    <div className="grid grid-cols-1 gap-y-2 text-sm">
                      {details.key_statistics && Object.entries(details.key_statistics).map(([k, v]: [string, any]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-slate-600 truncate pr-3">{v?.label || k}</span>
                          <span className="text-slate-900 font-medium">{v?.value ?? '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {details.employee_data && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="text-sm font-semibold text-slate-800 mb-2">Employees</div>
                      <div className="space-y-2 text-sm">
                        {Object.values(details.employee_data).map((v: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-slate-600 truncate pr-3">{v.label}</span>
                            <span className="text-slate-900 font-medium">{v.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {details.performance_metrics && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="text-sm font-semibold text-slate-800 mb-2">Performance</div>
                      <div className="space-y-2 text-sm">
                        {Object.values(details.performance_metrics).map((v: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-slate-600 truncate pr-3">{(v as any).period}</span>
                            <span className="text-slate-900 font-medium">{(v as any).change}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SymbolDetailsModal;


