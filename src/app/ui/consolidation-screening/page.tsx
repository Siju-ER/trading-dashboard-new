'use client';

import { useState, useEffect, useCallback } from 'react';
import { useConsolidationCriteria, useConsolidationScreening } from '@/lib/hooks/useConsolidationScreening';
import { ScreenerCriteria, ScreeningRunResponse, ScreeningResultsResponse, CreateCriteriaRequest } from '@/types/consolidation-screening';
import ConsolidationCriteriaForm from '@/components/features/consolidation-screening/ConsolidationCriteriaForm';
import ConsolidationCriteriaDashboard from '@/components/features/consolidation-screening/ConsolidationCriteriaDashboard';
import ConsolidationResultsDashboard from '@/components/features/consolidation-screening/ConsolidationResultsDashboard';
import ConsolidationScreeningDemo from '@/components/features/consolidation-screening/ConsolidationScreeningDemo';

type ViewMode = 'demo' | 'criteria' | 'create' | 'results';

export default function ConsolidationScreeningPage() {
  const [currentView, setCurrentView] = useState<ViewMode>('demo');
  const [screeningRun, setScreeningRun] = useState<ScreeningRunResponse | null>(null);
  const [screeningResults, setScreeningResults] = useState<ScreeningResultsResponse | null>(null);
  
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
      // Now fetch the actual results
      const results = await getScreeningResults(criteriaId);
      if (results) {
        setScreeningResults(results);
        setCurrentView('results');
      }
    }
  };

  const handleViewResults = async (criteriaId: string) => {
    const result = await getScreeningResults(criteriaId);
    if (result) {
      setScreeningResults(result);
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Consolidation Screening
              </h1>
              <p className="text-slate-600">
                Identify stocks in consolidation phases using quantitative analysis
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentView('demo')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'demo' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Demo
              </button>
              <button
                onClick={() => setCurrentView('create')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'create' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Create Criteria
              </button>
              <button
                onClick={() => setCurrentView('criteria')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'criteria' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Manage Criteria
              </button>
            </div>
          </div>
        </div>

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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {currentView === 'demo' && (
            <ConsolidationScreeningDemo />
          )}

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
        </div>
      </div>
    </div>
  );
}
