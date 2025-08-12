'use client';

import React, { ReactNode } from 'react';
import { FilterIcon, XIcon } from '@/components/shared/icons';

interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'date' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
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
}) => {
  const renderField = (field: FilterField) => {
    const baseClassName = "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={String(values[field.name] || '')}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={baseClassName}
          >
            <option value="">{field.placeholder || `Select ${field.label}`}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={String(values[field.name] || '')}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={baseClassName}
          />
        );
      
      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder || `Filter by ${field.label}`}
            value={String(values[field.name] || '')}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={baseClassName}
          />
        );
    }
  };

  return (
    <>
      {/* Filter Toggle Button */}
      <div>
        <button
          onClick={onToggle}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2 bg-white dark:bg-slate-800"
        >
          <FilterIcon />
          <span>Filters</span>
        </button>
      </div>
      
      {/* Filter Options */}
      {isVisible && (
        <div className="col-span-full mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {field.label}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
          
          {/* Filter Actions */}
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={onClear}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center gap-1 bg-white dark:bg-slate-800"
            >
              <XIcon />
              <span>Clear Filters</span>
            </button>
            
            {onApply && (
              <button
                onClick={onApply}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Apply Filters
              </button>
            )}
            
            {customActions}
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSection;