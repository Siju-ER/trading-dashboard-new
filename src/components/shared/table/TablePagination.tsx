// src/components/shared/table/TablePagination.tsx
'use client';

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/shared/icons';
import { cn } from '@/lib/utils/utils';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  showPerPageSelect?: boolean;
  showRecordCount?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'outlined';
  maxVisiblePages?: number;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 25, 50, 100],
  showPerPageSelect = false,
  showRecordCount = true,
  className,
  size = 'md',
  variant = 'default',
  maxVisiblePages = 5,
}) => {
  // Variant styles
  const variantStyles = {
    default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
    minimal: 'bg-transparent',
    outlined: 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600',
  };

  // Size styles
  const sizeStyles = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-3',
    lg: 'text-lg px-6 py-4',
  };

  const buttonSizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  const getVisiblePages = () => {
    const delta = Math.floor(maxVisiblePages / 2);
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always add first page
      pages.push(1);
      
      // Calculate range around current page
      const rangeStart = Math.max(2, currentPage - delta);
      const rangeEnd = Math.min(totalPages - 1, currentPage + delta);
      
      // Add ellipsis if needed before the range
      if (rangeStart > 2) {
        pages.push('...');
      }
      
      // Add pages in the range
      for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed after the range
      if (rangeEnd < totalPages - 1) {
        pages.push('...');
      }
      
      // Always add last page if it's not the first
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(currentPage * perPage, totalRecords);

  if (totalPages <= 1 && !showPerPageSelect) return null;

  return (
    <div className={cn(
      'rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4',
      variantStyles[variant],
      sizeStyles[size],
      className
    )}>
      {/* Left side - Record count and per page select */}
      <div className="flex items-center gap-4">
        {showRecordCount && (
          <div className="text-slate-600 dark:text-slate-400">
            Showing {startRecord} to {endRecord} of {totalRecords} entries
          </div>
        )}
        
        {showPerPageSelect && onPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">Show</span>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className={cn(
                'border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white',
                buttonSizes[size]
              )}
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-slate-600 dark:text-slate-400">entries</span>
          </div>
        )}
      </div>
      
      {/* Right side - Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              'rounded-md transition-colors',
              buttonSizes[size],
              currentPage === 1
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            )}
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </button>
          
          <div className="flex gap-1">
            {getVisiblePages().map((page, index) => (
              typeof page === 'number' ? (
                <button
                  key={index}
                  onClick={() => onPageChange(page)}
                  className={cn(
                    'rounded-md transition-colors',
                    buttonSizes[size],
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                  )}
                >
                  {page}
                </button>
              ) : (
                <span key={index} className={cn('text-slate-500 dark:text-slate-400', buttonSizes[size])}>
                  {page}
                </span>
              )
            ))}
          </div>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              'rounded-md transition-colors',
              buttonSizes[size],
              currentPage === totalPages
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            )}
            aria-label="Next page"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default TablePagination;