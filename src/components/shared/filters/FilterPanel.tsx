// src/components/shared/filters/FilterPanel.tsx
'use client';

import React, { ReactNode, useState } from 'react';
import { FilterIcon, XIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/shared/icons';
import { cn } from '@/lib/utils/utils';

interface FilterPanelProps {
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  onClear?: () => void;
  title?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  clearButtonText?: string;
  toggleButtonText?: string;
  variant?: 'default' | 'bordered' | 'elevated' | 'modern';
  collapsible?: boolean;
  defaultOpen?: boolean;
  activeFiltersCount?: number;
  showActiveCount?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  children,
  isOpen: controlledIsOpen,
  onToggle,
  onClear,
  title = 'Advanced Filters',
  className,
  headerClassName,
  contentClassName,
  clearButtonText = 'Clear All',
  toggleButtonText = 'Filters',
  variant = 'modern',
  collapsible = true,
  defaultOpen = false,
  activeFiltersCount = 0,
  showActiveCount = true,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  
  // Use controlled or uncontrolled state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));

  // Enhanced variant styles
  const variantStyles = {
    default: 'bg-white border border-slate-200 shadow-sm',
    bordered: 'bg-white border-2 border-slate-300 shadow-sm',
    elevated: 'bg-white border border-slate-200 shadow-lg',
    modern: 'bg-gradient-to-r from-white to-slate-50 border border-slate-200 shadow-lg backdrop-blur-sm',
  };

  return (
    <div className={cn('rounded-xl transition-all duration-300', variantStyles[variant], className)}>
      {/* Enhanced Header */}
      <div className={cn(
        'p-5 flex items-center justify-between transition-all duration-200',
        collapsible && 'cursor-pointer hover:bg-slate-50/50',
        isOpen && 'border-b border-slate-200',
        headerClassName
      )} onClick={collapsible ? handleToggle : undefined}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <FilterIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
            {showActiveCount && activeFiltersCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                {activeFiltersCount} active
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {onClear && activeFiltersCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <XIcon className="w-4 h-4" />
              <span>{clearButtonText}</span>
            </button>
          )}
          
          {collapsible && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-all duration-200"
            >
              {isOpen ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Enhanced Content */}
      {isOpen && (
        <div className={cn(
          'p-6 bg-white/50 backdrop-blur-sm',
          contentClassName
        )}>
          {children}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;