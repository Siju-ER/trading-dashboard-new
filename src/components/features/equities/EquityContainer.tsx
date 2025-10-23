
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApiData } from '@/lib/hooks/useApiData';
import { useEquityMeta } from '@/lib/hooks/useEquityMeta';
import { API_BASE_URL } from '@/config';
import CompactFilterBar from '@/components/shared/filters/CompactFilterBar';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import Pagination from '@/components/shared/pagination/Pagination';
import { BarChart3Icon, EditIcon } from '@/components/shared/icons';
import SymbolLink from '@/components/shared/symbol/SymbolLink';
import EditEquityModal from './EditEquityModal';

interface EquityItem {
  _id?: string;
  symbol: string;
  name_of_company: string;
  series: string;
  date_of_listing: string; // ISO string
  sector: string;
  industry: string;
}

const EquityContainer: React.FC = () => {
  const router = useRouter();
  const [showFilters, setShowFilters] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedEquity, setSelectedEquity] = React.useState<EquityItem | null>(null);

  // Fetch equity meta data for dropdowns
  const { sectors, industries, isLoading: metaLoading } = useEquityMeta();

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
    refetch,
  } = useApiData<EquityItem>({
    endpoint: `${API_BASE_URL}/nse-equity`,
    method: 'POST',
    initialSort: { key: 'symbol', direction: 'asc' },
    searchField: 'symbol',
  });

  // Filter field definitions with dynamic options
  const filterFields = [
    {
      name: 'sector',
      label: 'Sector',
      type: 'select' as const,
      placeholder: 'Select Sector',
      options: sectors.map(sector => ({ value: sector, label: sector })),
    },
    {
      name: 'industry',
      label: 'Industry',
      type: 'select' as const,
      placeholder: 'Select Industry',
      options: industries.map(industry => ({ value: industry, label: industry })),
    },
    {
      name: 'listed_date',
      label: 'Listed Date',
      type: 'date' as const,
    },
  ];

  // Quick filter presets for equities - removed sector filters since we have dropdowns
  const quickFilterPresets = [
    {
      label: 'Reset',
      values: { symbol: '', sector: '', industry: '', listed_date: '' },
      icon: <BarChart3Icon className="w-3 h-3" />
    }
  ];

  // Table column definitions
  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const columns: Column<EquityItem>[] = [
    {
      field: 'symbol',
      label: 'Symbol',
      render: (value, item) => (
        <SymbolLink symbol={item.symbol} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">{value}</SymbolLink>
      ),
    },
    {
      field: 'name_of_company',
      label: 'Company Name',
      className: 'text-sm text-slate-600',
    },
    {
      field: 'series',
      label: 'Series',
      render: (value) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{value || '—'}</span>
      ),
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
      field: 'date_of_listing',
      label: 'Listed Date',
      render: (value) => <span className="text-sm text-slate-700">{value ? formatDate(value) : '—'}</span>,
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, item) => (
        <button
          onClick={() => {
            setSelectedEquity(item);
            setIsEditModalOpen(true);
          }}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
        >
          <EditIcon className="w-3 h-3" />
          Edit
        </button>
      ),
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
    updateFilter('symbol', '');
    updateFilter('sector', '');
    updateFilter('industry', '');
    updateFilter('listed_date', '');
  };

  // Handle edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEquity(null);
  };

  const handleEquityUpdate = () => {
    refetch(); // Refresh the data after update
  };

  // Custom mobile card render
  const renderMobileCard = (equity: EquityItem) => (
    <>
      <div className="flex justify-between items-center mb-2">
        <SymbolLink symbol={equity.symbol} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
          {equity.symbol}
        </SymbolLink>
        <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded-full border border-slate-200">
          {equity.series}
        </span>
      </div>
      
      <h3 className="text-sm text-slate-800 font-medium mb-2">
        {equity.name_of_company}
      </h3>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
        <div>
          <span className="font-medium">Listed:</span> {equity.date_of_listing ? formatDate(equity.date_of_listing) : '—'}
        </div>
        <div>
          <span className="font-medium">Series:</span> {equity.series}
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
      {/* Show loading state for filter options */}
      {metaLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-slate-500">Loading filter options...</div>
        </div>
      )}
      
      {/* Compact Search and Filters */}
      <CompactFilterBar
        fields={filterFields}
        values={filters}
        onChange={updateFilter}
        onClear={handleClearFilters}
        searchValue={filters.symbol || ''}
        onSearchChange={(value) => updateFilter('symbol', value)}
        searchPlaceholder="Search by symbol (e.g., TCS, RELIANCE)"
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
        rowKey={(row) => row._id || row.symbol}
      />
      
      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={(page) => setPagination({ currentPage: page })}
        totalRecords={pagination.totalRecords}
        perPage={pagination.perPage}
      />

      {/* Edit Equity Modal */}
      <EditEquityModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        equity={selectedEquity}
        onUpdate={handleEquityUpdate}
      />
    </div>
  );
};

export default EquityContainer;