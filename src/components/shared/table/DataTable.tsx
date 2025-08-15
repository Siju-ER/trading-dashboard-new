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
}: DataTableProps<T>) {
  // Render sort icon if sorting is enabled
  const renderSortIcon = (field: string) => {
    if (!sortConfig || !onSort) return null;
    
    return (
      <div className={`inline-block ml-1 ${
        sortConfig.key === field 
          ? 'text-blue-500' 
          : 'text-slate-400 dark:text-slate-500'
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
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.field)}
                  className={`px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ${
                    onSort && column.sortable !== false ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800' : ''
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
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-4">
                  <TableLoader rows={5} columns={columns.length} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-4 text-center text-slate-500 dark:text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr 
                  key={index} 
                  className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition duration-150 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td 
                      key={String(column.field)} 
                      className={`px-4 py-4 whitespace-nowrap ${column.className || ''}`}
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
          <div className="p-4 text-center text-slate-500 dark:text-slate-400">
            {emptyMessage}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {data.map((item, index) => (
              <div 
                key={index} 
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {mobileCardRender ? mobileCardRender(item) : (
                  <div className="space-y-2">
                    {columns.slice(0, 3).map((column) => (
                      <div key={String(column.field)} className="flex justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {column.label}:
                        </span>
                        <span className="text-sm text-slate-900 dark:text-white">
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