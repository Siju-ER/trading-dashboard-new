'use client';

import { useState } from 'react';
import { ScreenerCriteria } from '@/types/consolidation-screening';
import Button from '@/components/shared/form/Button';
import Badge from '@/components/shared/ui/badge/Badge';

interface ConsolidationCriteriaDashboardProps {
  criteria: ScreenerCriteria[];
  onRunScreening: (criteriaId: string) => void;
  onViewResults: (criteriaId: string) => void;
  onToggleStatus: (criteriaId: string, isActive: boolean) => void;
  onRateCriteria: (criteriaId: string, rating: number) => void;
  onEditCriteria: (criteria: ScreenerCriteria) => void;
}

export default function ConsolidationCriteriaDashboard({
  criteria,
  onRunScreening,
  onViewResults,
  onToggleStatus,
  onRateCriteria,
  onEditCriteria,
}: ConsolidationCriteriaDashboardProps) {
  const [ratingModal, setRatingModal] = useState<{ criteriaId: string; currentRating: number } | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [confirmModal, setConfirmModal] = useState<{ 
    type: 'run' | 'deactivate' | 'activate';
    criteriaId: string;
    criteriaName: string;
  } | null>(null);

  const activeCriteria = criteria.filter(c => c.is_active);
  const inactiveCriteria = criteria.filter(c => !c.is_active);

  const handleRateCriteria = (criteriaId: string, currentRating: number) => {
    setRatingModal({ criteriaId, currentRating });
    setNewRating(currentRating);
  };

  const submitRating = () => {
    if (ratingModal) {
      onRateCriteria(ratingModal.criteriaId, newRating);
      setRatingModal(null);
    }
  };

  const handleConfirmAction = () => {
    if (!confirmModal) return;
    
    switch (confirmModal.type) {
      case 'run':
        onRunScreening(confirmModal.criteriaId);
        break;
      case 'deactivate':
        onToggleStatus(confirmModal.criteriaId, true);
        break;
      case 'activate':
        onToggleStatus(confirmModal.criteriaId, false);
        break;
    }
    setConfirmModal(null);
  };

  const handleRunScreening = (criteriaId: string, criteriaName: string) => {
    setConfirmModal({ type: 'run', criteriaId, criteriaName });
  };

  const handleToggleStatus = (criteriaId: string, isActive: boolean, criteriaName: string) => {
    setConfirmModal({ 
      type: isActive ? 'deactivate' : 'activate', 
      criteriaId, 
      criteriaName 
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never run';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  const CriteriaCard = ({ criteria: c }: { criteria: ScreenerCriteria }) => (
    <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">{c.name}</h3>
            <Badge className={c.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
              {c.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Created by {c.created_by} • {formatDate(c.created_at)}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Rating:</span>
              <span className="ml-1 font-medium text-slate-900">{c.rating.toFixed(1)}/10</span>
            </div>
            <div>
              <span className="text-slate-500">Runs:</span>
              <span className="ml-1 font-medium text-slate-900">{c.run_count}</span>
            </div>
            <div>
              <span className="text-slate-500">Success Rate:</span>
              <span className="ml-1 font-medium text-slate-900">{c.success_rate.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-slate-500">Last Run:</span>
              <span className="ml-1 font-medium text-slate-900">{formatTimeAgo(c.last_run_at)}</span>
            </div>
          </div>
          
          {/* Last Run Date */}
          {c.last_run_at && (
            <div className="mt-2 text-xs text-slate-500">
              Last Run Date: {formatDate(c.last_run_at)}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          size="sm"
          onClick={() => handleRunScreening(c.id, c.name)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Run Screening
        </Button>
        {c.last_run_at && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onViewResults(c.id)}
          >
            View Results
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEditCriteria(c)}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleRateCriteria(c.id, c.rating)}
        >
          Rate
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleToggleStatus(c.id, c.is_active, c.name)}
        >
          {c.is_active ? 'Deactivate' : 'Activate'}
        </Button>
      </div>

      {/* Parameter Summary */}
      <div className="text-xs text-slate-500 bg-slate-50 rounded p-3">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <span>N: {c.criteria_config.N}</span>
          <span>X: {c.criteria_config.X}%</span>
          <span>Y: {c.criteria_config.Y}%</span>
          <span>Z: {c.criteria_config.Z}</span>
          <span>M: {c.criteria_config.M}</span>
          <span>V: {c.criteria_config.V_frac}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Consolidation Criteria Management
        </h2>
        <p className="text-slate-600">
          Manage your consolidation screening criteria and run screenings
        </p>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-slate-900">{criteria.length}</div>
          <div className="text-sm text-slate-600">Total Criteria</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{activeCriteria.length}</div>
          <div className="text-sm text-slate-600">Active Criteria</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {criteria.length > 0 ? (criteria.reduce((sum, c) => sum + c.rating, 0) / criteria.length).toFixed(1) : '0.0'}
          </div>
          <div className="text-sm text-slate-600">Avg Rating</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {criteria.reduce((sum, c) => sum + c.run_count, 0)}
          </div>
          <div className="text-sm text-slate-600">Total Runs</div>
        </div>
      </div>

      {/* Active Criteria */}
      {activeCriteria.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Active Criteria ({activeCriteria.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeCriteria.map((c) => (
              <CriteriaCard key={c.id} criteria={c} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Criteria */}
      {inactiveCriteria.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-slate-400 rounded-full mr-2"></span>
            Inactive Criteria ({inactiveCriteria.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {inactiveCriteria.map((c) => (
              <CriteriaCard key={c.id} criteria={c} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {criteria.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Criteria Found</h3>
          <p className="text-slate-600 mb-4">Create your first consolidation screening criteria to get started.</p>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Rate Criteria Performance
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rating (0-10)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={newRating}
                onChange={(e) => setNewRating(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-slate-500 mt-1">
                <span>0</span>
                <span className="font-medium">{newRating.toFixed(1)}</span>
                <span>10</span>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setRatingModal(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={submitRating}
              >
                Save Rating
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Confirm Action
            </h3>
            <p className="text-slate-600 mb-6">
              {confirmModal.type === 'run' && `Are you sure you want to run screening for "${confirmModal.criteriaName}"?`}
              {confirmModal.type === 'deactivate' && `Are you sure you want to deactivate "${confirmModal.criteriaName}"?`}
              {confirmModal.type === 'activate' && `Are you sure you want to activate "${confirmModal.criteriaName}"?`}
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAction}
                className={confirmModal.type === 'run' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {confirmModal.type === 'run' && 'Run Screening'}
                {confirmModal.type === 'deactivate' && 'Deactivate'}
                {confirmModal.type === 'activate' && 'Activate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
