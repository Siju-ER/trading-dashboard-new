'use client';

import { useState, useEffect } from 'react';
import { ConsolidationConfig, DEFAULT_CONSOLIDATION_CONFIG, PARAMETER_PRESETS, PARAMETER_RANGES, CreateCriteriaRequest } from '@/types/consolidation-screening';
import { useParameterValidation } from '@/lib/hooks/useConsolidationScreening';
import Button from '@/components/shared/form/Button';
import Input from '@/components/shared/form/Input';
import Select from '@/components/shared/form/Select';

interface ConsolidationCriteriaFormProps {
  onSubmit: (data: CreateCriteriaRequest) => void;
  onCancel: () => void;
  initialData?: ConsolidationConfig;
}

export default function ConsolidationCriteriaForm({ 
  onSubmit, 
  onCancel, 
  initialData 
}: ConsolidationCriteriaFormProps) {
  const [formData, setFormData] = useState<ConsolidationConfig>(
    initialData || DEFAULT_CONSOLIDATION_CONFIG
  );
  const [criteriaName, setCriteriaName] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [validation, setValidation] = useState({ isValid: true, errors: {} });

  const { validateConfig } = useParameterValidation();

  // Validate form whenever data changes
  useEffect(() => {
    const validationResult = validateConfig(formData);
    setValidation(validationResult);
  }, [formData, validateConfig]);

  const handlePresetChange = (presetKey: string) => {
    if (presetKey && PARAMETER_PRESETS[presetKey]) {
      setFormData(PARAMETER_PRESETS[presetKey].config);
      setCriteriaName(PARAMETER_PRESETS[presetKey].name);
    }
    setSelectedPreset(presetKey);
  };

  const handleParameterChange = (key: keyof ConsolidationConfig, value: number) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.isValid || !criteriaName.trim() || !createdBy.trim()) {
      return;
    }

    const requestData: CreateCriteriaRequest = {
      name: criteriaName.trim(),
      config: formData,
      created_by: createdBy.trim()
    };

    onSubmit(requestData);
  };

  const resetToDefaults = () => {
    setFormData(DEFAULT_CONSOLIDATION_CONFIG);
    setCriteriaName('');
    setSelectedPreset('');
  };

  const ParameterSlider = ({ 
    label, 
    key, 
    value, 
    range, 
    suffix = '', 
    description 
  }: {
    label: string;
    key: keyof ConsolidationConfig;
    value: number;
    range: { min: number; max: number; step: number };
    suffix?: string;
    description: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <span className="text-sm text-slate-600">
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(e) => handleParameterChange(key, parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>{range.min}{suffix}</span>
        <span>{range.max}{suffix}</span>
      </div>
      <p className="text-xs text-slate-500">{description}</p>
      {validation.errors[key] && (
        <p className="text-xs text-red-600">{validation.errors[key]}</p>
      )}
    </div>
  );

  const ParameterInput = ({ 
    label, 
    key, 
    value, 
    range, 
    suffix = '', 
    description 
  }: {
    label: string;
    key: keyof ConsolidationConfig;
    value: number;
    range: { min: number; max: number; step: number };
    suffix?: string;
    description: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min={range.min}
          max={range.max}
          step={range.step}
          value={value}
          onChange={(e) => handleParameterChange(key, parseFloat(e.target.value))}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {suffix && <span className="text-sm text-slate-600">{suffix}</span>}
      </div>
      <p className="text-xs text-slate-500">{description}</p>
      {validation.errors[key] && (
        <p className="text-xs text-red-600">{validation.errors[key]}</p>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Create Consolidation Criteria
        </h2>
        <p className="text-slate-600">
          Configure parameters to identify stocks in consolidation phases
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Criteria Name
            </label>
            <Input
              type="text"
              value={criteriaName}
              onChange={(e) => setCriteriaName(e.target.value)}
              placeholder="e.g., Tight Consolidation v1.0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Created By
            </label>
            <Input
              type="text"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              placeholder="Your name or username"
              required
            />
          </div>
        </div>

        {/* Preset Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Quick Setup Presets
          </label>
          <Select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
          >
            <option value="">Select a preset (optional)</option>
            {Object.entries(PARAMETER_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.name} - {preset.description}
              </option>
            ))}
          </Select>
        </div>

        {/* Parameter Configuration */}
        <div className="space-y-8">
          {/* Core Parameters */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Core Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ParameterSlider
                label="N - Consolidation Window Length"
                key="N"
                value={formData.N}
                range={PARAMETER_RANGES.N}
                suffix=" sessions"
                description="Number of recent trading sessions to analyze for consolidation"
              />
              <ParameterSlider
                label="X - Price Range Threshold"
                key="X"
                value={formData.X}
                range={PARAMETER_RANGES.X}
                suffix="%"
                description="Maximum allowed price range as percentage of median close price"
              />
              <ParameterSlider
                label="Y - Upward Drift Tolerance"
                key="Y"
                value={formData.Y}
                range={PARAMETER_RANGES.Y}
                suffix="%"
                description="Maximum allowable upward price drift between first and second half"
              />
              <ParameterSlider
                label="Z - Volatility Percentile Threshold"
                key="Z"
                value={formData.Z}
                range={PARAMETER_RANGES.Z}
                suffix=" percentile"
                description="Maximum percentile rank for price volatility vs 1-year history"
              />
              <ParameterSlider
                label="M - Volume Baseline Period"
                key="M"
                value={formData.M}
                range={PARAMETER_RANGES.M}
                suffix=" sessions"
                description="Number of prior sessions used to calculate baseline volume"
              />
            </div>
          </div>

          {/* Volume Parameters */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Volume Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ParameterSlider
                label="V_frac - Volume Contraction Ratio"
                key="V_frac"
                value={formData.V_frac}
                range={PARAMETER_RANGES.V_frac}
                suffix=" ratio"
                description="Maximum ratio of current average volume to prior period average"
              />
              <ParameterSlider
                label="P - Low Volume Days Requirement"
                key="P"
                value={formData.P}
                range={PARAMETER_RANGES.P}
                suffix="%"
                description="Percentage of consolidation days that must have low volume"
              />
              <ParameterSlider
                label="Q - Low Volume Percentile"
                key="Q"
                value={formData.Q}
                range={PARAMETER_RANGES.Q}
                suffix=" percentile"
                description="Percentile threshold for defining 'low volume' vs 1-year distribution"
              />
              <ParameterSlider
                label="S - Volume Spike Limit"
                key="S"
                value={formData.S}
                range={PARAMETER_RANGES.S}
                suffix=" multiple"
                description="Maximum allowed single-day volume spike as multiple of median prior volume"
              />
            </div>
          </div>

          {/* Additional Parameters */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Additional Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ParameterSlider
                label="R - Range Centering Width"
                key="R"
                value={formData.R}
                range={PARAMETER_RANGES.R}
                suffix="%"
                description="Width of acceptable range for recent close position within consolidation range"
              />
              <ParameterInput
                label="Minimum Median Volume"
                key="min_median_volume"
                value={formData.min_median_volume}
                range={PARAMETER_RANGES.min_median_volume}
                description="Minimum median daily volume over 1 year to include stock"
              />
              <ParameterInput
                label="Minimum Price Threshold"
                key="min_price"
                value={formData.min_price}
                range={PARAMETER_RANGES.min_price}
                suffix=" ₹"
                description="Minimum median price to avoid micro-cap noise"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={resetToDefaults}
            >
              Reset to Defaults
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
          <Button
            type="submit"
            disabled={!validation.isValid || !criteriaName.trim() || !createdBy.trim()}
          >
            Save Criteria
          </Button>
        </div>
      </form>
    </div>
  );
}
