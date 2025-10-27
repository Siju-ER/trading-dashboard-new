'use client';

import { useState, useEffect, useCallback } from 'react';
import { useConsolidationCriteria, useConsolidationScreening } from '@/lib/hooks/useConsolidationScreening';
import { ScreenerCriteria, ScreeningRunResponse, ScreeningResultsResponse, CreateCriteriaRequest } from '@/types/consolidation-screening';
import ConsolidationCriteriaForm from '@/components/features/consolidation-screening/ConsolidationCriteriaForm';
import ConsolidationCriteriaDashboard from '@/components/features/consolidation-screening/ConsolidationCriteriaDashboard';
import ConsolidationResultsDashboard from '@/components/features/consolidation-screening/ConsolidationResultsDashboard';
import ConsolidationInfoModal from '@/components/features/consolidation-screening/ConsolidationInfoModal';
import Feature from '@/components/features/Feature';
import { ConsolidationIcon } from '@/components/shared/icons';

type ViewMode = 'criteria' | 'create' | 'results';

export default function ConsolidationScreeningPage() {
  const [currentView, setCurrentView] = useState<ViewMode>('criteria');
  const [screeningRun, setScreeningRun] = useState<ScreeningRunResponse | null>(null);
  const [screeningResults, setScreeningResults] = useState<ScreeningResultsResponse | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  
  const { 
    loading: criteriaLoading, 
    error: criteriaError, 
    getCriteria,
    createCriteria,
    activateCriteria,
    deactivateCriteria,
    rateCriteria
  } = useConsolidationCriteria();
  
  const { 
    loading: screeningLoading, 
    error: screeningError, 
    runScreening,
    getScreeningResults
  } = useConsolidationScreening();

  const [criteriaList, setCriteriaList] = useState<ScreenerCriteria[]>([]);

  const loadCriteria = useCallback(async () => {
    const response = await getCriteria();
    if (response) {
      setCriteriaList(response.criteria);
    }
  }, [getCriteria]);

  // Load criteria on component mount
  useEffect(() => {
    loadCriteria();
  }, [loadCriteria]);

  const handleCreateCriteria = async (criteriaData: CreateCriteriaRequest) => {
    const result = await createCriteria(criteriaData);
    if (result) {
      await loadCriteria(); // Refresh the list
      setCurrentView('criteria');
    }
  };

  const handleRunScreening = async (criteriaId: string) => {
    const runResult = await runScreening(criteriaId);
    if (runResult) {
      setScreeningRun(runResult);
      // The API returns results directly, so we can use the same data for both
      setScreeningResults(runResult);
      setCurrentView('results');
    }
  };

  const handleViewResults = async (criteriaId: string) => {
    const result = await getScreeningResults(criteriaId);
    if (result) {
      setScreeningResults(result);
      // Also set screeningRun since the component needs both
      setScreeningRun(result);
      setCurrentView('results');
    }
  };

  const handleToggleCriteriaStatus = async (criteriaId: string, isActive: boolean) => {
    const success = isActive 
      ? await deactivateCriteria(criteriaId)
      : await activateCriteria(criteriaId);
    
    if (success) {
      await loadCriteria(); // Refresh the list
    }
  };

  const handleRateCriteria = async (criteriaId: string, rating: number) => {
    const success = await rateCriteria(criteriaId, rating);
    if (success) {
      await loadCriteria(); // Refresh the list
    }
  };

  return (
    <Feature 
      title="Consolidation Screening"
      subtitle="Identify stocks in consolidation phases using quantitative analysis"
      icon={<ConsolidationIcon />}
      headerActions={
        <div className="flex space-x-3">
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="p-2 rounded-lg bg-white/80 hover:bg-white shadow-sm border border-purple-100 hover:shadow-md transition-all duration-200 hover:scale-105"
            title="View consolidation screening guide"
          >
            <svg className="w-5 h-5 text-slate-600 hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentView('create')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'create' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 shadow-sm border border-purple-100'
            }`}
          >
            Create Criteria
          </button>
          <button
            onClick={() => setCurrentView('criteria')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'criteria' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 shadow-sm border border-purple-100'
            }`}
          >
            Manage Criteria
          </button>
        </div>
      }
    >
      {/* Error Display */}
      {(criteriaError || screeningError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">
            {criteriaError || screeningError}
          </p>
        </div>
      )}

      {/* Loading State */}
      {(criteriaLoading || screeningLoading) && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            {criteriaLoading ? 'Loading criteria...' : 'Running screening...'}
          </p>
        </div>
      )}

      {/* Main Content */}
      {currentView === 'create' && (
        <ConsolidationCriteriaForm
          onSubmit={handleCreateCriteria}
          onCancel={() => setCurrentView('criteria')}
        />
      )}

      {currentView === 'criteria' && (
        <ConsolidationCriteriaDashboard
          criteria={criteriaList}
          onRunScreening={handleRunScreening}
          onViewResults={handleViewResults}
          onToggleStatus={handleToggleCriteriaStatus}
          onRateCriteria={handleRateCriteria}
          onEditCriteria={() => {
            setCurrentView('create');
          }}
        />
      )}

      {currentView === 'results' && screeningRun && screeningResults && (
        <ConsolidationResultsDashboard
          screeningRun={screeningRun}
          screeningResults={screeningResults}
          onBack={() => setCurrentView('criteria')}
          onRunAgain={handleRunScreening}
        />
      )}

      {/* Info Modal */}
      <ConsolidationInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </Feature>
  );
}
