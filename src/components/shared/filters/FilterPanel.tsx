// src/components/shared/filters/FilterPanel.tsx
'use client';

import React, { ReactNode } from 'react';
import { FilterIcon, XIcon } from '@/components/shared/icons';
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
  variant?: 'default' | 'bordered' | 'elevated';
  collapsible?: boolean;
  defaultOpen?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  children,
  isOpen: controlledIsOpen,
  onToggle,
  onClear,
  title = 'Filters',
  className,
  headerClassName,
  contentClassName,
  clearButtonText = 'Clear Filters',
  toggleButtonText = 'Filters',
  variant = 'default',
  collapsible = true,
  defaultOpen = false,
}) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState(defaultOpen);
  
  // Use controlled or uncontrolled state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));

  // Variant styles
  const variantStyles = {
    default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
    bordered: 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600',
    elevated: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg',
  };

  return (
    <div className={cn('rounded-lg overflow-hidden', variantStyles[variant], className)}>
      {/* Header */}
      <div className={cn(
        'p-4 flex items-center justify-between',
        collapsible && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50',
        headerClassName
      )} onClick={collapsible ? handleToggle : undefined}>
        <div className="flex items-center gap-2">
          <FilterIcon className="text-slate-600 dark:text-slate-400" />
          <span className="font-medium text-slate-900 dark:text-white">{title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {onClear && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center gap-1 bg-white dark:bg-slate-800 transition-colors"
            >
              <XIcon className="w-3 h-3" />
              <span>{clearButtonText}</span>
            </button>
          )}
          
          {collapsible && !onToggle && (
            <button className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 transition-colors">
              {toggleButtonText}
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      {isOpen && (
        <div className={cn(
          'p-4 border-t border-slate-200 dark:border-slate-700',
          contentClassName
        )}>
          {children}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;