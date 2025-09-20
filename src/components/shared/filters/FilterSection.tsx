'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { FilterIcon, XIcon, CheckIcon, ChevronDownIcon } from '@/components/shared/icons';
import { Calendar, DateRangePicker } from '@/components/shared/ui/calendar';

interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'date' | 'dateRange' | 'select' | 'number' | 'range';
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  icon?: ReactNode;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
}

interface FilterSectionProps {
  isVisible: boolean;
  onToggle: () => void;
  fields: FilterField[];
  values: Record<string, string | number | boolean>;
  onChange: (name: string, value: string | number | boolean) => void;
  onClear: () => void;
  onApply?: () => void;
  customActions?: ReactNode;
  variant?: 'default' | 'modern' | 'minimal';
  showActiveChips?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  isVisible,
  onToggle,
  fields,
  values,
  onChange,
  onClear,
  onApply,
  customActions,
  variant = 'modern',
  showActiveChips = true,
}) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Track active filters
  useEffect(() => {
    const active = fields.filter(field => {
      const value = values[field.name];
      return value !== undefined && value !== '' && value !== null;
    }).map(field => field.name);
    setActiveFilters(active);
  }, [values, fields]);

  const renderField = (field: FilterField) => {
    const baseClassName = "w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-300";
    const hasValue = values[field.name] && String(values[field.name]).trim() !== '';
    
    switch (field.type) {
      case 'select':
        return (
          <div className="relative">
            <select
              value={String(values[field.name] || '')}
              onChange={(e) => onChange(field.name, e.target.value)}
              className={`${baseClassName} appearance-none cursor-pointer ${hasValue ? 'border-blue-300 bg-blue-50/30' : ''}`}
            >
              <option value="">{field.placeholder || `Select ${field.label}`}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        );
      
      case 'date':
        return (
          <Calendar
            value={values[field.name] ? new Date(String(values[field.name])) : null}
            onChange={(date) => onChange(field.name, date ? date.toISOString().split('T')[0] : '')}
            placeholder={field.placeholder || `Select ${field.label}`}
            variant="modern"
            size="md"
            minDate={field.minDate}
            maxDate={field.maxDate}
            showTime={field.showTime}
            className="w-full"
          />
        );

      case 'dateRange':
        const rangeValue = values[field.name] ? {
          start: values[field.name].start ? new Date(String(values[field.name].start)) : null,
          end: values[field.name].end ? new Date(String(values[field.name].end)) : null
        } : { start: null, end: null };
        
        return (
          <DateRangePicker
            value={rangeValue}
            onChange={(range) => onChange(field.name, range)}
            placeholder={field.placeholder || `Select ${field.label} range`}
            variant="modern"
            size="md"
            minDate={field.minDate}
            maxDate={field.maxDate}
            className="w-full"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            placeholder={field.placeholder || `Enter ${field.label}`}
            value={String(values[field.name] || '')}
            onChange={(e) => onChange(field.name, parseInt(e.target.value) || 0)}
            min={field.min}
            max={field.max}
            step={field.step}
            className={`${baseClassName} ${hasValue ? 'border-blue-300 bg-blue-50/30' : ''}`}
          />
        );

      case 'range':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{field.min || 0}</span>
              <span className="font-medium">{values[field.name] || field.min || 0}</span>
              <span>{field.max || 100}</span>
            </div>
            <input
              type="range"
              min={field.min}
              max={field.max}
              step={field.step || 1}
              value={values[field.name] || field.min || 0}
              onChange={(e) => onChange(field.name, parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder || `Filter by ${field.label}`}
            value={String(values[field.name] || '')}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={`${baseClassName} ${hasValue ? 'border-blue-300 bg-blue-50/30' : ''}`}
          />
        );
    }
  };

  const getActiveFilterChip = (fieldName: string) => {
    const field = fields.find(f => f.name === fieldName);
    const value = values[fieldName];
    if (!field || !value) return null;

    let displayValue = String(value);
    if (field.type === 'select') {
      const option = field.options?.find(opt => opt.value === value);
      displayValue = option?.label || displayValue;
    }

    return (
      <span
        key={fieldName}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200"
      >
        <span className="text-xs">{field.label}:</span>
        <span>{displayValue}</span>
        <button
          onClick={() => onChange(fieldName, '')}
          className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
        >
          <XIcon className="w-3 h-3" />
        </button>
      </span>
    );
  };

  const variantStyles = {
    default: 'bg-white border border-slate-200 rounded-lg',
    modern: 'bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl shadow-sm',
    minimal: 'bg-transparent border-0',
  };

  return (
    <div className={variantStyles[variant]}>
      {/* Enhanced Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onToggle}
          className="group flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
            <FilterIcon className="w-4 h-4" />
          </div>
          <span className="font-medium">Advanced Filters</span>
          {activeFilters.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {activeFilters.length}
            </span>
          )}
        </button>

        {activeFilters.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200"
          >
            <XIcon className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {showActiveChips && activeFilters.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Active Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(getActiveFilterChip)}
          </div>
        </div>
      )}
      
      {/* Enhanced Filter Options */}
      {isVisible && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  {field.icon}
                  {field.label}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
          
          {/* Enhanced Filter Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              {activeFilters.length > 0 ? (
                <span className="font-medium text-blue-600">{activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} applied</span>
              ) : (
                'No filters applied'
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {customActions}
              
              {onApply && (
                <button
                  onClick={onApply}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <CheckIcon className="w-4 h-4" />
                  Apply Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;