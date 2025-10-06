// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import EquityFilters from './EquityFilters';
// import EquityTable from './EquityTable';
// import EquityPagination from './EquityPagination';
// import { API_BASE_URL } from '@/config';

// // Custom debounce implementation
// const debounce = (func: Function, delay: number) => {
//   let timeoutId: NodeJS.Timeout;
  
//   const debouncedFunction = (...args: any[]) => {
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => func.apply(null, args), delay);
//   };
  
//   debouncedFunction.cancel = () => {
//     clearTimeout(timeoutId);
//   };
  
//   return debouncedFunction;
// };

// interface EquityItem {
//   symbol: string;
//   company_name: string;
//   current_price: number;
//   face_value: number;
//   sector: string;
//   industry: string;
//   listing_date: string;
// }

// const EquityContainer: React.FC = () => {
//   const [equities, setEquities] = useState<EquityItem[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filters, setFilters] = useState({
//     sector: '',
//     industry: '',
//     listed_date: '',
//   });
//   const [sortConfig, setSortConfig] = useState({
//     key: 'symbol',
//     direction: 'asc' as 'asc' | 'desc',
//   });
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     perPage: 50,
//     totalPages: 0,
//     totalRecords: 0,
//   });

//   const fetchEquities = async () => {
//     setIsLoading(true);
//     try {
//       // Build query parameters
//       const queryParams = new URLSearchParams({
//         page: pagination.currentPage.toString(),
//         per_page: pagination.perPage.toString(),
//       });

//       if (searchTerm) {
//         queryParams.append('search_field', 'symbol');
//         queryParams.append('search_value', searchTerm);
//       }

//       if (filters.sector) {
//         queryParams.append('sector', filters.sector);
//       }

//       if (filters.industry) {
//         queryParams.append('industry', filters.industry);
//       }

//       if (filters.listed_date) {
//         queryParams.append('listed_date', filters.listed_date);
//       }

//       if (sortConfig.key) {
//         queryParams.append('sort_by', sortConfig.key);
//         queryParams.append('sort_order', sortConfig.direction);
//       }

//       const response = await fetch(`${API_BASE_URL}/equity?${queryParams}`, {
//         method: 'POST',
//       });
//       const data = await response.json();

//       if (data.status === 'success') {
//         setEquities(data.data);
//         setPagination(prev => ({
//           ...prev,
//           totalPages: data.pagination.total_pages,
//           totalRecords: data.pagination.total_records,
//         }));
//       }
//     } catch (error) {
//       console.error('Error fetching equities:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Debounce fetch to prevent too many API calls
//   const debouncedFetch = useCallback(
//     debounce(() => {
//       fetchEquities();
//     }, 300),
//     [searchTerm, filters, pagination.currentPage, sortConfig]
//   );

//   useEffect(() => {
//     debouncedFetch();
//     return () => {
//       debouncedFetch.cancel();
//     };
//   }, [searchTerm, filters, pagination.currentPage, sortConfig]);

//   const handleFilterChange = (name: string, value: string) => {
//     setFilters(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//     // Reset to first page when filters change
//     setPagination(prev => ({
//       ...prev,
//       currentPage: 1,
//     }));
//   };

//   const handleSort = (key: string) => {
//     setSortConfig({
//       key,
//       direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
//     });
//   };

//   return (
//     <div className="space-y-6">
//       <EquityFilters
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         filters={filters}
//         setFilters={handleFilterChange}
//       />
      
//       <EquityTable
//         equities={equities}
//         isLoading={isLoading}
//         sortConfig={sortConfig}
//         onSort={handleSort}
//       />
      
//       <EquityPagination
//         currentPage={pagination.currentPage}
//         totalPages={pagination.totalPages}
//         onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
//         totalRecords={pagination.totalRecords}
//         perPage={pagination.perPage}
//       />
//     </div>
//   );
// };

// export default EquityContainer;


// src/components/features/equities/EquityContainer.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApiData } from '@/lib/hooks/useApiData';
import { API_BASE_URL } from '@/config';
import SearchInput from '@/components/shared/filters/SearchInput';
import FilterSection from '@/components/shared/filters/FilterSection';
import CompactFilterBar from '@/components/shared/filters/CompactFilterBar';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import Pagination from '@/components/shared/pagination/Pagination';
import { BarChart3Icon } from '@/components/shared/icons';

interface EquityItem {
  symbol: string;
  company_name: string;
  current_price: number;
  face_value: number;
  sector: string;
  industry: string;
  listing_date: string;
}

const EquityContainer: React.FC = () => {
  const router = useRouter();
  const [showFilters, setShowFilters] = React.useState(false);

  const {
    data: equities,
    isLoading,
    pagination,
    filters,
    sortConfig,
    searchTerm,
    setSearchTerm,
    updateFilter,
    setSortConfig,
    setPagination,
  } = useApiData<EquityItem>({
    endpoint: `${API_BASE_URL}/equity`,
    method: 'POST',
    initialSort: { key: 'symbol', direction: 'asc' },
    searchField: 'symbol',
  });

  // Filter field definitions
  const filterFields = [
    {
      name: 'sector',
      label: 'Sector',
      type: 'text' as const,
      placeholder: 'Filter by Sector',
    },
    {
      name: 'industry',
      label: 'Industry',
      type: 'text' as const,
      placeholder: 'Filter by Industry',
    },
    {
      name: 'listed_date',
      label: 'Listed Date',
      type: 'date' as const,
    },
  ];

  // Quick filter presets for equities
  const quickFilterPresets = [
    {
      label: 'Technology',
      values: { sector: 'Technology' },
      icon: <BarChart3Icon className="w-3 h-3" />
    },
    {
      label: 'Banking',
      values: { sector: 'Banking' },
      icon: <BarChart3Icon className="w-3 h-3" />
    },
    {
      label: 'Pharma',
      values: { sector: 'Pharmaceuticals' },
      icon: <BarChart3Icon className="w-3 h-3" />
    },
    {
      label: 'Auto',
      values: { sector: 'Automobile' },
      icon: <BarChart3Icon className="w-3 h-3" />
    },
    {
      label: 'Reset',
      values: { sector: '', industry: '', listed_date: '' },
      icon: <BarChart3Icon className="w-3 h-3" />
    }
  ];

  // Table column definitions
  const columns: Column<EquityItem>[] = [
    {
      field: 'symbol',
      label: 'Symbol',
      render: (value, item) => (
        <button
          onClick={() => router.push(`/dashboard/analysis?symbol=${item.symbol}`)}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {value}
        </button>
      ),
    },
    {
      field: 'company_name',
      label: 'Company Name',
      className: 'text-sm text-slate-600',
    },
    {
      field: 'current_price',
      label: 'Current Price',
      render: (value) => (
        <span className="font-medium text-slate-900">
          ₹{value.toFixed(2)}
        </span>
      ),
    },
    {
      field: 'face_value',
      label: 'Face Value',
      className: 'text-sm text-slate-600',
    },
    {
      field: 'sector',
      label: 'Sector',
      className: 'text-sm text-slate-600',
    },
    {
      field: 'industry',
      label: 'Industry',
      className: 'text-sm text-slate-600',
    },
    {
      field: 'listing_date',
      label: 'Listed Date',
      className: 'text-sm text-slate-600',
    },
  ];

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  // Handle filter clearing
  const handleClearFilters = () => {
    updateFilter('sector', '');
    updateFilter('industry', '');
    updateFilter('listed_date', '');
  };

  // Custom mobile card render
  const renderMobileCard = (equity: EquityItem) => (
    <>
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => router.push(`/dashboard/analysis?symbol=${equity.symbol}`)}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {equity.symbol}
        </button>
        <span className="text-sm font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
          ₹{equity.current_price.toFixed(2)}
        </span>
      </div>
      
      <h3 className="text-sm text-slate-800 font-medium mb-2">
        {equity.company_name}
      </h3>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
        <div>
          <span className="font-medium">Face Value:</span> {equity.face_value}
        </div>
        <div>
          <span className="font-medium">Listed:</span> {equity.listing_date}
        </div>
        <div className="col-span-2">
          <span className="font-medium">Sector:</span> {equity.sector}
        </div>
        <div className="col-span-2">
          <span className="font-medium">Industry:</span> {equity.industry}
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Compact Search and Filters */}
      <CompactFilterBar
        fields={filterFields}
        values={filters}
        onChange={updateFilter}
        onClear={handleClearFilters}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search equities..."
        showSearch={true}
        showQuickFilters={true}
        quickFilterPresets={quickFilterPresets}
        className="mb-6"
      />
      
      {/* Data Table */}
      <DataTable
        data={equities}
        columns={columns}
        isLoading={isLoading}
        sortConfig={sortConfig}
        onSort={handleSort}
        mobileCardRender={renderMobileCard}
        emptyMessage="No equities found"
      />
      
      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={(page) => setPagination({ currentPage: page })}
        totalRecords={pagination.totalRecords}
        perPage={pagination.perPage}
      />
    </div>
  );
};

export default EquityContainer;