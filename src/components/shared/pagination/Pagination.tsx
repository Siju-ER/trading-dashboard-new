// src/components/shared/Pagination/Pagination.tsx
'use client';

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/shared/icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords?: number;
  perPage?: number;
  showInfo?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords,
  perPage,
  showInfo = true,
  className = "",
  size = 'md',
}) => {
  // Function to generate page numbers to display
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const pages = [];
    
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
    
    return pages;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'px-2 py-1 text-xs',
          nav: 'p-1.5',
        };
      case 'lg':
        return {
          button: 'px-4 py-2 text-base',
          nav: 'p-3',
        };
      default:
        return {
          button: 'px-3 py-1',
          nav: 'p-2',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (totalPages <= 1) return null;

  const startRecord = totalRecords && perPage ? (currentPage - 1) * perPage + 1 : null;
  const endRecord = totalRecords && perPage ? Math.min(currentPage * perPage, totalRecords) : null;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 border border-slate-200 dark:border-slate-700 ${className}`}>
      {showInfo && startRecord && endRecord && totalRecords && (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Showing {startRecord} to {endRecord} of {totalRecords} entries
        </div>
      )}
      
      <div className="flex items-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${sizeClasses.nav} rounded-md ${
            currentPage === 1
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </button>
        
        <div className="flex mx-2 space-x-1">
          {getVisiblePages().map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={`${sizeClasses.button} rounded-md ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className={`${sizeClasses.button} text-slate-500 dark:text-slate-400`}>
                {page}
              </span>
            )
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${sizeClasses.nav} rounded-md ${
            currentPage === totalPages
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
};

export default Pagination;