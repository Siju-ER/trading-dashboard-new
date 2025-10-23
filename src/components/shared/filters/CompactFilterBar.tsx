'use client';

import React, { useState, useEffect } from 'react';
import { 
  FilterIcon, XIcon, ChevronDownIcon, SearchIcon, 
  CalendarIcon, BarChart3Icon, SettingsIcon, RefreshCwIcon 
} from '@/components/shared/icons';
import { cn } from '@/lib/utils/utils';
import EnhancedCalendar from '@/components/shared/ui/calendar/EnhancedCalendar';

interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'number' | 'range';
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  icon?: React.ReactNode;
}

interface CompactFilterBarProps {
  fields: FilterField[];
  values: Record<string, string | number | boolean>;
  onChange: (name: string, value: string | number | boolean) => void;
  onClear: () => void;
  onApply?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  className?: string;
  showSearch?: boolean;
  showQuickFilters?: boolean;
  quickFilterPresets?: Array<{
    label: string;
    values: Record<string, string | number | boolean>;
    icon?: React.ReactNode;
  }>;
}

const CompactFilterBar: React.FC<CompactFilterBarProps> = ({
  fields,
  values,
  onChange,
  onClear,
  onApply,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  className,
  showSearch = true,
  showQuickFilters = true,
  quickFilterPresets = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<Set<number>>(new Set());

  // Calculate active filters count dynamically
  const getActiveFiltersCount = () => {
    return fields.filter(field => {
      const value = values[field.name];
      return value !== undefined && value !== '' && value !== null;
    }).length;
  };

  // Track active filters
  useEffect(() => {
    const active = fields.filter(field => {
      const value = values[field.name];
      return value !== undefined && value !== '' && value !== null;
    }).map(field => field.name);
    setActiveFilters(active);
  }, [values, fields]);

  // Sync selected quick filters with current values
  useEffect(() => {
    const newSelected = new Set<number>();
    quickFilterPresets.forEach((preset, index) => {
      const isActive = Object.entries(preset.values).every(([key, value]) => {
        return values[key] === value;
      });
      if (isActive) {
        newSelected.add(index);
      }
    });
    setSelectedQuickFilters(newSelected);
  }, [values, quickFilterPresets]);

  const renderField = (field: FilterField, isInline = false) => {
    const baseClassName = isInline 
      ? "px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
      : "w-48 px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200";
    
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
              <option value="">{field.placeholder || field.label}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        );
      
      case 'date':
        return (
          <EnhancedCalendar
            value={values[field.name] ? (() => {
              const dateStr = values[field.name];
              // Parse YYYY-MM-DD format as local date to avoid timezone issues
              const [year, month, day] = dateStr.split('-').map(Number);
              return new Date(year, month - 1, day);
            })() : null}
            onChange={(date) => {
              if (date) {
                // Use local date formatting to avoid timezone issues
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                onChange(field.name, `${year}-${month}-${day}`);
              } else {
                onChange(field.name, '');
              }
            }}
            placeholder={field.placeholder || field.label}
            size="sm"
            variant="minimal"
            className="w-48"
            showQuickSelect={false}
            showTodayButton={false}
            showClearButton={true}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            placeholder={field.placeholder || field.label}
            value={String(values[field.name] || '')}
            onChange={(e) => onChange(field.name, parseInt(e.target.value) || 0)}
            min={field.min}
            max={field.max}
            step={field.step}
            className={`${baseClassName} ${hasValue ? 'border-blue-300 bg-blue-50/30' : ''}`}
          />
        );
      
      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder || field.label}
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
        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md border border-blue-200"
      >
        <span className="text-xs">{field.label}:</span>
        <span className="truncate max-w-20">{displayValue}</span>
        <button
          onClick={() => onChange(fieldName, '')}
          className="ml-1 hover:bg-blue-200 rounded p-0.5 transition-colors"
        >
          <XIcon className="w-2.5 h-2.5" />
        </button>
      </span>
    );
  };

  const handleQuickFilter = (preset: any, index: number) => {
    const isSelected = selectedQuickFilters.has(index);
    
    if (isSelected) {
      // Deselect - clear the filter
      Object.keys(preset.values).forEach((key) => {
        onChange(key, '');
      });
      setSelectedQuickFilters(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    } else {
      // Select - apply the filter
      Object.entries(preset.values).forEach(([key, value]) => {
        onChange(key, value);
      });
      setSelectedQuickFilters(prev => new Set(prev).add(index));
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-center">
        {/* Search Input */}
        {showSearch && (
          <div className="relative flex-1 min-w-0">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        )}

        {/* Date Filter with Calendar */}
        {fields.length > 0 && fields[0].name === 'logged_date' && (
          <div className="flex-shrink-0">
            <EnhancedCalendar
              value={values[fields[0].name] ? (() => {
                const dateStr = values[fields[0].name];
                // Parse YYYY-MM-DD format as local date to avoid timezone issues
                const [year, month, day] = dateStr.split('-').map(Number);
                return new Date(year, month - 1, day);
              })() : null}
              onChange={(date) => {
                if (date) {
                  // Use local date formatting to avoid timezone issues
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  onChange(fields[0].name, `${year}-${month}-${day}`);
                } else {
                  onChange(fields[0].name, '');
                }
              }}
              placeholder="Select Date"
              size="sm"
              variant="minimal"
              className="w-48"
              showQuickSelect={false}
              showTodayButton={false}
              showClearButton={true}
            />
          </div>
        )}

        {/* Additional Filters - All fields except the first if it's logged_date */}
        {(fields.length > 0 && fields[0].name === 'logged_date' ? fields.slice(1) : fields).map((field) => (
          <div key={field.name} className="flex-shrink-0">
            {renderField(field)}
          </div>
        ))}

        {/* Quick Filter Presets */}
        {showQuickFilters && quickFilterPresets.length > 0 && (
          <div className="flex gap-1 flex-wrap flex-shrink-0">
            {/* Follow Status Group - New, Hot, Hold, Funda */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50">
              {quickFilterPresets.slice(0, 4).map((preset, index) => {
                const isSelected = selectedQuickFilters.has(index);
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickFilter(preset, index)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-all duration-200",
                      isSelected
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-slate-600 hover:bg-blue-100 hover:text-blue-700"
                    )}
                  >
                    {preset.icon}
                    {preset.label}
                  </button>
                );
              })}
            </div>
            
            {/* Separator */}
            <div className="w-px h-8 bg-slate-300"></div>
            
            {/* Wishlist Group */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50">
              {quickFilterPresets.slice(4).map((preset, index) => {
                const actualIndex = index + 4;
                const isSelected = selectedQuickFilters.has(actualIndex);
                return (
                  <button
                    key={actualIndex}
                    onClick={() => handleQuickFilter(preset, actualIndex)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-all duration-200",
                      isSelected
                        ? "bg-yellow-500 text-white shadow-sm"
                        : "text-slate-600 hover:bg-yellow-100 hover:text-yellow-700"
                    )}
                  >
                    {preset.icon}
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reset Button */}
        <button
          onClick={() => {
            onClear();
            setSelectedQuickFilters(new Set());
          }}
          disabled={getActiveFiltersCount() === 0 && !searchValue && selectedQuickFilters.size === 0}
          className={cn(
            "flex items-center gap-1 px-2 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 flex-shrink-0",
            getActiveFiltersCount() > 0 || searchValue || selectedQuickFilters.size > 0
              ? "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          <XIcon className="w-3 h-3" />
          Clear
          {(getActiveFiltersCount() > 0 || selectedQuickFilters.size > 0) && (
            <span className="ml-1 px-1 py-0.5 bg-white/20 text-xs rounded-full">
              {getActiveFiltersCount() + selectedQuickFilters.size}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default CompactFilterBar;
