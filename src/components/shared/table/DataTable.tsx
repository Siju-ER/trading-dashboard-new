// src/components/shared/DataTable/DataTable.tsx
'use client';

import React, { ReactNode } from 'react';
import { ArrowUpDownIcon } from '@/components/shared/icons';
import TableLoader from '@/components/shared/loaders/TableLoader';

export interface Column<T = any> {
  field: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  sortConfig?: SortConfig;
  onSort?: (field: string) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
  mobileCardRender?: (item: T) => ReactNode;
  striped?: boolean;
  stickyHeader?: boolean;
  density?: 'comfortable' | 'compact';
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  sortConfig,
  onSort,
  onRowClick,
  emptyMessage = "No records found",
  className = "",
  mobileCardRender,
  striped = false,
  stickyHeader = false,
  density = 'comfortable',
}: DataTableProps<T>) {
  const densityClass = (density?: 'comfortable' | 'compact') => (
    density === 'compact' ? 'text-sm' : 'text-base'
  );

  const cellPaddingClass = (density?: 'comfortable' | 'compact') => (
    density === 'compact' ? 'px-3 py-2' : 'px-4 py-4'
  );
  // Render sort icon if sorting is enabled
  const renderSortIcon = (field: string) => {
    if (!sortConfig || !onSort) return null;
    
    return (
      <div className={`inline-block ml-1 ${
        sortConfig.key === field 
          ? 'text-blue-500' 
          : 'text-slate-400'
      }`}>
        <ArrowUpDownIcon />
      </div>
    );
  };

  // Handle the click on headers for sorting
  const handleHeaderClick = (field: string, sortable?: boolean) => {
    if (onSort && sortable !== false) {
      onSort(field);
    }
  };

  // Render cell content
  const renderCellContent = (column: Column<T>, item: T) => {
    const value = item[column.field];
    if (column.render) {
      return column.render(value, item);
    }
    return value;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden ${densityClass(density)} ${className}`}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className={`bg-slate-50 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.field)}
                  className={`px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${
                    onSort && column.sortable !== false ? 'cursor-pointer hover:bg-slate-100' : ''
                  } ${column.headerClassName || ''}`}
                  onClick={() => handleHeaderClick(String(column.field), column.sortable)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable !== false && renderSortIcon(String(column.field))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`bg-white divide-y divide-slate-200 ${striped ? '[&>tr:nth-child(even)]:bg-slate-50' : ''}`}>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-4">
                  <TableLoader rows={5} columns={columns.length} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-7 4h8M5 7h14M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7" />
                    </svg>
                    <div className="font-medium">{emptyMessage}</div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr 
                  key={index} 
                  className={`hover:bg-slate-100 transition duration-150 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td 
                      key={String(column.field)} 
                      className={`${cellPaddingClass(density)} whitespace-nowrap ${column.className || ''}`}
                    >
                      {renderCellContent(column, item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="p-4">
            <TableLoader rows={3} columns={1} />
          </div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {data.map((item, index) => (
              <div 
                key={index} 
                className={`p-4 hover:bg-slate-100 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {mobileCardRender ? mobileCardRender(item) : (
                  <div className="space-y-2">
                    {columns.slice(0, 3).map((column) => (
                      <div key={String(column.field)} className="flex justify-between">
                        <span className="text-sm font-medium text-slate-600">
                          {column.label}:
                        </span>
                        <span className="text-sm text-slate-900">
                          {renderCellContent(column, item)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;