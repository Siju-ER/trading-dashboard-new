'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SymbolLink from '@/components/shared/symbol/SymbolLink';
import { useApiData } from '@/lib/hooks/useApiData';
import { API_BASE_URL } from '@/config';
import SearchInput from '@/components/shared/filters/SearchInput';
import FilterSection from '@/components/shared/filters/FilterSection';
import CompactFilterBar from '@/components/shared/filters/CompactFilterBar';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import Pagination from '@/components/shared/pagination/Pagination';
import Modal from '@/components/shared/ui/modal/Modal';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Badge from '@/components/shared/ui/badge/Badge';
import FilterPanel from '@/components/shared/filters/FilterPanel';
import AddToBucketModal from '@/components/features/my-bucket/AddToBucketModal';
import {
    TrendingUpIcon, TrendingDownIcon, BarChart3Icon, StarIcon, EditIcon, TrashIcon,
    PlusIcon, ArrowUpIcon, ArrowDownIcon, RefreshCwIcon,
    ActivityIcon, HeartIcon, ZapIcon, ShoppingBasketIcon, FileTextIcon, FilterIcon
} from '@/components/shared/icons';

// Analysis record interface
export interface AnalysisRecord {
    id: string;
    symbol: string;
    logged_date: string;
    logged_price: number;
    current_price: number;
    logged_volume: number;
    current_volume?: number;
    rsi?: string;
    macd?: string;
    price_spike?: string;
    volume_spike?: string;
    previous_trend?: string;
    previous_trend_length?: string;
    previous_trend_started?: string;
    funda?: string;
    gap_up?: boolean;
    summary?: string;
    new_stock?: boolean;
    trending_stock?: boolean;
    follow?: boolean;
    strategy?: boolean;
    conclusion?: string;
    type?: string;
    gain: number;
    max_gain: number;
    created_at?: string;
    updated_at?: string;
}

const AnalysisTracker: React.FC = () => {
    const router = useRouter();
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
    const [modalContent, setModalContent] = useState<'summary' | 'conclusion'>('summary');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBucketModalOpen, setIsBucketModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<AnalysisRecord | null>(null);
    const [bucketRecord, setBucketRecord] = useState<AnalysisRecord | null>(null);

    // Form states for add/edit
    const [editForm, setEditForm] = useState({
        symbol: '',
        logged_date: '',
        logged_price: '',
        current_price: '',
        logged_volume: '',
        current_volume: '',
        rsi: '',
        macd: '',
        price_spike: '',
        volume_spike: '',
        previous_trend: '',
        previous_trend_length: '',
        previous_trend_started: '',
        funda: '',
        gap_up: false,
        summary: '',
        new_stock: false,
        trending_stock: false,
        follow: false,
        strategy: false,
        conclusion: '',
        type: ''
    });

    const [addForm, setAddForm] = useState({
        symbol: '',
        date: ''
    });

    // Generate available dates (last 30 days)
    const generateDateOptions = () => {
        const options = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const formattedDate = date.toISOString().split('T')[0];
            options.push(formattedDate);
        }
        return options;
    };

    // Use your existing useApiData hook
    const {
    data: analysisRecords,
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
} = useApiData<AnalysisRecord>({
    endpoint: `${API_BASE_URL}/analysis/all`,
    method: 'GET',
    initialSort: { key: 'logged_date', direction: 'desc' },
    searchField: 'symbol',
    initialFilters: {
        logged_date: '', // Remove the default date filter
        limit: '100',
        skip: '0'
    },
});

// Temporary debugging - add this after the useApiData hook
// Add this after the useApiData hook
console.log('Raw API response in network tab vs useApiData result:');
console.log('useApiData analysisRecords:', analysisRecords);
console.log('useApiData analysisRecords length:', analysisRecords?.length);
console.log('useApiData analysisRecords type:', typeof analysisRecords);

    // Filter field definitions
    const filterFields = [
        {
            name: 'logged_date',
            label: 'Date',
            type: 'select' as const,
            placeholder: 'Select Date',
            options: generateDateOptions().map(date => ({
                value: date,
                label: new Date(date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })
            })),
        },
        {
            name: 'type',
            label: 'Type',
            type: 'select' as const,
            placeholder: 'Select Type',
            options: [
                { value: 'PRICE_SPIKE', label: 'Price Spike' },
                { value: 'VOLUME_SPIKE', label: 'Volume Spike' },
            ],
        },
        {
            name: 'stockStatus',
            label: 'Status',
            type: 'select' as const,
            placeholder: 'Select Status',
            options: [
                { value: 'new_stock', label: 'New' },
                { value: 'trending_stock', label: 'Trending' },
                { value: 'follow', label: 'Follow' },
                { value: 'strategy', label: 'Strategy' },
            ],
        },
        {
            name: 'limit',
            label: 'Records Limit',
            type: 'select' as const,
            placeholder: 'Select Limit',
            options: [
                { value: '50', label: '50' },
                { value: '100', label: '100' },
                { value: '200', label: '200' },
                { value: '500', label: '500' },
            ],
        },
    ];

    // Follow system configuration
    const followConfig = {
        new_stock: {
            label: 'New',
            color: '#8B5CF6',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-800',
            borderColor: 'border-purple-500',
            icon: StarIcon
        },
        trending_stock: {
            label: 'Hot',
            color: '#EF4444',
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            borderColor: 'border-red-500',
            icon: ZapIcon
        },
        follow: {
            label: 'Hold',
            color: '#10B981',
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            borderColor: 'border-green-500',
            icon: HeartIcon
        },
        strategy: {
            label: 'Funda',
            color: '#3B82F6',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
            borderColor: 'border-blue-500',
            icon: ActivityIcon
        }
    };

    // Dropdown options
    const dropdownOptions = {
        rsi: [
            'CROSSING UPWARD',
            'CROSSING DOWNWARD',
            'MOVING CLOSE IN UPWARD',
            'MOVING CLOSE IN DOWNWARD',
            'REVERSING FROM BOTTOM',
            'REVERSING FROM TOP',
            'CONTINUING UPWARD',
            'CONTINUING DOWNWARD'
        ],
        macd: [
            'CROSSING UPWARD',
            'CROSSING DOWNWARD',
            'MOVING CLOSE IN UPWARD',
            'MOVING CLOSE IN DOWNWARD',
            'CONTINUING UPWARD',
            'CONTINUING DOWNWARD'
        ],
        price_spike: ['HIGH', 'NORMAL', 'LOW'],
        volume_spike: ['HIGH', 'NORMAL', 'LOW'],
        previous_trend: [
            'UPTREND-SHORT',
            'UPTREND-NORMAL',
            'UPTREND-STRONG',
            'DOWNTREND-SHORT',
            'DOWNTREND-NORMAL',
            'DOWNTREND-STRONG',
            'SIDEWAYS/CONSOLIDATION-SHORT',
            'SIDEWAYS/CONSOLIDATION-NORMAL',
            'SIDEWAYS/CONSOLIDATION-STRONG',
            'CHOPPY'
        ],
        funda: ['GOOD', 'NEUTRAL', 'BAD'],
        stockStatus: [
            'new_stock',
            'trending_stock',
            'follow',
            'strategy'
        ]
    };

    // Calculate percentage change
    const calculatePercentageChange = (currentPrice: number, loggedPrice: number) => {
        if (!currentPrice || !loggedPrice) return { value: 'N/A', isPositive: null };
        const change = ((currentPrice - loggedPrice) / loggedPrice) * 100;
        return { value: change.toFixed(2), isPositive: change >= 0 };
    };

    // Get variant for different badges
    const getTrendVariant = (trend: string): 'success' | 'danger' | 'warning' | 'neutral' => {
        if (trend?.includes('UPWARD') || trend?.includes('BOTTOM')) return 'success';
        if (trend?.includes('DOWNWARD') || trend?.includes('TOP')) return 'danger';
        return 'neutral';
    };

    const getSpikeVariant = (spike: string): 'success' | 'danger' | 'warning' | 'neutral' => {
        switch (spike) {
            case 'HIGH': return 'danger';
            case 'LOW': return 'success';
            default: return 'neutral';
        }
    };

    const getFundaVariant = (funda: string): 'success' | 'danger' | 'neutral' => {
        switch (funda) {
            case 'GOOD': return 'success';
            case 'BAD': return 'danger';
            default: return 'neutral';
        }
    };

    // Toggle follow status
    const handleFollowToggle = async (record: AnalysisRecord, followType: string) => {
        try {
            const updateData = {
                id: record.id,
                [followType]: !record[followType as keyof AnalysisRecord]
            };

            const response = await fetch(`${API_BASE_URL}/analysis/update-analysis`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await refetch();
        } catch (err) {
            console.error('Error toggling follow status:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            alert(`Error updating follow status: ${errorMessage}`);
        }
    };

    // Follow Toggle Component
    const FollowToggle = ({ record, followType, config }: {
        record: AnalysisRecord;
        followType: string;
        config: any;
    }) => {
        const isActive = record[followType as keyof AnalysisRecord] as boolean;
        const Icon = config.icon;

        return (
            <ActionButton
                variant={isActive ? "primary" : "ghost"}
                size="xs"
                onClick={() => handleFollowToggle(record, followType)}
                className={`flex items-center gap-1 ${isActive ? config.bgColor + ' ' + config.textColor : ''}`}
            >
                <Icon className="h-3 w-3" />
                <span className="text-xs">{config.label}</span>
            </ActionButton>
        );
    };

    // Handle actions
    const handleViewDetails = (record: AnalysisRecord, content: 'summary' | 'conclusion') => {
        setSelectedRecord(record);
        setModalContent(content);
        setIsModalOpen(true);
    };

    const handleEditRecord = (record: AnalysisRecord) => {
        setSelectedRecord(record);
        setEditForm({
            symbol: record.symbol,
            logged_date: new Date(record.logged_date).toISOString().split('T')[0],
            logged_price: record.logged_price.toString(),
            current_price: record.current_price.toString(),
            logged_volume: record.logged_volume.toString(),
            current_volume: record.current_volume?.toString() || '',
            rsi: record.rsi || '',
            macd: record.macd || '',
            price_spike: record.price_spike || '',
            volume_spike: record.volume_spike || '',
            previous_trend: record.previous_trend || '',
            previous_trend_length: record.previous_trend_length || '',
            previous_trend_started: record.previous_trend_started || '',
            funda: record.funda || '',
            gap_up: record.gap_up || false,
            summary: record.summary || '',
            new_stock: record.new_stock || false,
            trending_stock: record.trending_stock || false,
            follow: record.follow || false,
            strategy: record.strategy || false,
            conclusion: record.conclusion || '',
            type: record.type || ''
        });
        setIsEditModalOpen(true);
    };

    const handleAddToBucket = (record: AnalysisRecord) => {
        setBucketRecord(record);
        setIsBucketModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/analysis/delete/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await refetch();
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            console.error('Error deleting record:', error);
            alert('An error occurred while deleting the record');
        }
    };

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const addData = {
                symbol: addForm.symbol.toUpperCase(),
                date: new Date(addForm.date).toISOString()
            };

            const response = await fetch(`${API_BASE_URL}/analysis/add-stock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await refetch();
            setIsAddModalOpen(false);
            setAddForm({ symbol: '', date: '' });
        } catch (err) {
            console.error('Error adding record:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            alert(`Error updating follow status: ${errorMessage}`);
        }
    };

    const handleUpdateRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecord) return;

        try {
            const updateData = {
                symbol: editForm.symbol,
                logged_date: new Date(editForm.logged_date).toISOString(),
                logged_price: parseFloat(editForm.logged_price),
                current_price: parseFloat(editForm.current_price),
                logged_volume: parseInt(editForm.logged_volume),
                current_volume: editForm.current_volume ? parseInt(editForm.current_volume) : undefined,
                rsi: editForm.rsi,
                macd: editForm.macd,
                price_spike: editForm.price_spike,
                volume_spike: editForm.volume_spike,
                previous_trend: editForm.previous_trend,
                previous_trend_length: editForm.previous_trend_length,
                previous_trend_started: editForm.previous_trend_started,
                funda: editForm.funda,
                gap_up: editForm.gap_up,
                summary: editForm.summary,
                new_stock: editForm.new_stock,
                trending_stock: editForm.trending_stock,
                follow: editForm.follow,
                strategy: editForm.strategy,
                conclusion: editForm.conclusion,
                type: editForm.type
            };

            const response = await fetch(`${API_BASE_URL}/analysis/update-analysis`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: selectedRecord.id,
                    ...updateData
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await refetch();
            setIsEditModalOpen(false);
            setSelectedRecord(null);
        } catch (err) {
            console.error('Error updating record:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            alert(`Error updating follow status: ${errorMessage}`);
        }
    };

    const handleClearFilters = () => {
        // Clear all filters
        updateFilter('logged_date', '');
        updateFilter('type', '');
        updateFilter('stockStatus', '');
        updateFilter('limit', '100');
        
        // Clear search term
        setSearchTerm('');
    };

    // Generate TradingView URL
    const getTradingViewUrl = (symbol: string) => {
        return `https://www.tradingview.com/chart/?symbol=${symbol}`;
    };

    // Generate Screener.in URL
    const getScreenerUrl = (symbol: string) => {
        return `https://www.screener.in/company/${symbol}/consolidated/`;
    };

    // Table column definitions
    const columns: Column<AnalysisRecord>[] = [
        {
            field: 'symbol',
            label: 'Symbol',
            sortable: true,
            render: (value, record) => (
                <SymbolLink symbol={record.symbol} className="text-blue-700 hover:text-blue-900 hover:underline font-medium">{value}</SymbolLink>
            ),
        },
        {
            field: 'type',
            label: 'Type',
            render: (value) => (
                <Badge
                    variant={value === 'PRICE_SPIKE' ? 'danger' : value === 'VOLUME_SPIKE' ? 'info' : 'neutral'}
                    size="sm"
                >
                    {value ? value.replace('_', ' ') : 'N/A'}
                </Badge>
            ),
        },
        {
            field: 'logged_date',
            label: 'Date',
            sortable: true,
            render: (value) => formatDate(value),
            className: 'text-sm text-slate-600',
        },
        {
            field: 'logged_price',
            label: 'Logged Price',
            sortable: true,
            render: (value) => (
                <span className="font-medium text-slate-900">
                    ₹{value?.toFixed(2)}
                </span>
            ),
            className: 'text-right',
        },
        {
            field: 'current_price',
            label: 'Current Price',
            sortable: true,
            render: (value, record) => {
                const change = calculatePercentageChange(value, record.logged_price);
                return (
                    <div className="flex flex-col items-end text-right">
                        <span className={`font-medium ${
                            change.isPositive === true 
                                ? 'text-green-600' 
                                : change.isPositive === false 
                                    ? 'text-red-600' 
                                    : 'text-slate-900'
                        }`}>
                            ₹{value?.toFixed(2)}
                        </span>
                        {change.isPositive !== null && (
                            <span className={`text-xs flex items-center justify-end ${
                                change.isPositive 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                            }`}>
                                {change.isPositive ? (
                                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                                ) : (
                                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                                )}
                                {change.value}%
                            </span>
                        )}
                    </div>
                );
            },
            className: 'text-right',
        },
        {
            field: 'gain',
            label: 'Gain %',
            sortable: true,
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${value > 0
                        ? 'bg-green-100 text-green-800'
                        : value < 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                    {value > 0 ? (
                        <TrendingUpIcon className="h-3 w-3" />
                    ) : value < 0 ? (
                        <TrendingDownIcon className="h-3 w-3" />
                    ) : null}
                    {value.toFixed(2)}%
                </span>
            ),
        },
        {
            field: 'max_gain',
            label: 'Max Gain %',
            sortable: true,
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${value > 0
                        ? 'bg-green-100 text-green-800'
                        : value < 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                    {value > 0 ? (
                        <TrendingUpIcon className="h-3 w-3" />
                    ) : value < 0 ? (
                        <TrendingDownIcon className="h-3 w-3" />
                    ) : null}
                    {value ? value.toFixed(2) : '0.00'}%
                </span>
            ),
        },
        {
            field: 'price_spike',
            label: 'Price Spike',
            render: (value) => (
                <Badge variant={getSpikeVariant(value)} size="sm">
                    {value || 'N/A'}
                </Badge>
            ),
        },
        {
            field: 'volume_spike',
            label: 'Volume Spike',
            render: (value) => (
                <Badge variant={getSpikeVariant(value)} size="sm">
                    {value || 'N/A'}
                </Badge>
            ),
        },
        {
            field: 'funda',
            label: 'Funda',
            render: (value) => (
                <Badge variant={getFundaVariant(value)} size="sm">
                    {value || 'N/A'}
                </Badge>
            ),
        },
        {
            field: 'gap_up',
            label: 'Gap Up',
            render: (value) => (
                <Badge variant={value ? 'success' : 'neutral'} size="sm">
                    {value ? 'Yes' : 'No'}
                </Badge>
            ),
        },
        {
            field: 'stock_status',
            label: 'Stock Status',
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    {record.new_stock && (
                        <FollowToggle
                            record={record}
                            followType="new_stock"
                            config={followConfig.new_stock}
                        />
                    )}
                    {record.trending_stock && (
                        <FollowToggle
                            record={record}
                            followType="trending_stock"
                            config={followConfig.trending_stock}
                        />
                    )}
                    {record.follow && (
                        <FollowToggle
                            record={record}
                            followType="follow"
                            config={followConfig.follow}
                        />
                    )}
                    {record.strategy && (
                        <FollowToggle
                            record={record}
                            followType="strategy"
                            config={followConfig.strategy}
                        />
                    )}
                </div>
            ),
        },
        {
            field: 'actions',
            label: 'Actions',
            render: (_, record) => (
                <div className="flex items-center space-x-2">
                    <ActionButton
                        onClick={() => handleAddToBucket(record)}
                        leftIcon={<ShoppingBasketIcon className="h-4 w-4" />}
                        variant="ghost"
                        size="sm"
                        className="!text-purple-500 hover:!bg-purple-50 hover:!text-purple-600 !border !border-purple-200"
                    >
                        Basket
                    </ActionButton>

                    <ActionButton
                        onClick={() => handleViewDetails(record, 'summary')}
                        leftIcon={<FileTextIcon className="h-4 w-4" />}
                        variant="ghost"
                        size="sm"
                        className="!text-purple-500 hover:!bg-purple-50 hover:!text-purple-600"
                    >
                        Summary
                    </ActionButton>

                    <ActionButton
                        onClick={() => handleEditRecord(record)}
                        leftIcon={<EditIcon className="h-4 w-4" />}
                        variant="ghost"
                        size="sm"
                        className="!text-blue-500 hover:!bg-blue-50 hover:!text-blue-600"
                    >
                        Edit
                    </ActionButton>

                    <ActionButton
                        onClick={() => {
                            setItemToDelete(record);
                            setIsDeleteModalOpen(true);
                        }}
                        leftIcon={<TrashIcon className="h-4 w-4" />}
                        variant="ghost"
                        size="sm"
                        className="!text-red-500 hover:!bg-red-50 hover:!text-red-600"
                    >
                        Delete
                    </ActionButton>

                    <ActionButton
                        href={getTradingViewUrl(record.symbol)}
                        external
                        leftIcon={<TrendingUpIcon className="h-4 w-4" />}
                        variant="ghost"
                        size="sm"
                        className="!text-blue-500 hover:!bg-blue-50 hover:!text-blue-600"
                    >
                        Chart
                    </ActionButton>

                    <ActionButton
                        href={getScreenerUrl(record.symbol)}
                        external
                        leftIcon={<BarChart3Icon className="h-4 w-4" />}
                        variant="ghost"
                        size="sm"
                        className="!text-green-500 hover:!bg-green-50 hover:!text-green-600"
                    >
                        Screener
                    </ActionButton>
                </div>
            ),
        },
    ];

    // Mobile card render
    const renderMobileCard = (record: AnalysisRecord) => {
        const change = calculatePercentageChange(record.current_price, record.logged_price);

        return (
            <>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => router.push(`/dashboard/analysis?symbol=${record.symbol}`)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                            {record.symbol}
                        </button>
                        <Badge
                            variant={record.type === 'PRICE_SPIKE' ? 'danger' : record.type === 'VOLUME_SPIKE' ? 'info' : 'neutral'}
                            size="sm"
                        >
                            {record.type ? record.type.replace('_', ' ') : 'N/A'}
                        </Badge>
                    </div>

                    <span className={`text-sm font-medium ${change.isPositive === true
                            ? 'text-green-600'
                            : change.isPositive === false
                                ? 'text-red-600'
                                : 'text-slate-900'
                        }`}>
                        ₹{record.current_price?.toFixed(2)}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600 mb-3">
                    <div>
                        <span className="font-semibold text-slate-700">Logged:</span> 
                        <span className="ml-1 text-slate-900">₹{record.logged_price.toFixed(2)}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-700">Change:</span>
                        {change.isPositive !== null && (
                            <span className={`ml-1 font-medium ${change.isPositive
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}>
                                {change.isPositive ? '+' : ''}{change.value}%
                            </span>
                        )}
                    </div>
                    <div>
                        <span className="font-semibold text-slate-700">Gain:</span>
                        <span className={`ml-1 ${record.gain > 0
                                ? 'text-green-600'
                                : record.gain < 0
                                    ? 'text-red-600'
                                    : 'text-slate-600'
                            }`}>
                            {record.gain.toFixed(2)}%
                        </span>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-700">Date:</span> 
                        <span className="ml-1 text-slate-900">{formatDate(record.logged_date)}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant={getTrendVariant(record.rsi || '')} size="xs">
                        RSI: {record.rsi || 'N/A'}
                    </Badge>
                    <Badge variant={getTrendVariant(record.macd || '')} size="xs">
                        MACD: {record.macd || 'N/A'}
                    </Badge>
                    <Badge variant={getFundaVariant(record.funda || '')} size="xs">
                        {record.funda || 'N/A'}
                    </Badge>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                    <ActionButton
                        variant="outline"
                        size="xs"
                        onClick={() => handleViewDetails(record, 'summary')}
                    >
                        <FileTextIcon className="h-3 w-3 mr-1" />
                        Summary
                    </ActionButton>

                    <ActionButton
                        variant="outline"
                        size="xs"
                        onClick={() => handleAddToBucket(record)}
                        className="!bg-purple-50 !text-purple-700 !border-purple-200 hover:!bg-purple-100 !border-2"
                        leftIcon={<ShoppingBasketIcon className="h-3 w-3" />}
                    >
                        Basket
                    </ActionButton>

                    <ActionButton
                        variant="outline"
                        size="xs"
                        href={getTradingViewUrl(record.symbol)}
                        external
                    >
                        <TrendingUpIcon className="h-3 w-3 mr-1" />
                        Chart
                    </ActionButton>

                    <ActionButton
                        variant="outline"
                        size="xs"
                        onClick={() => handleEditRecord(record)}
                    >
                        <EditIcon className="h-3 w-3 mr-1" />
                        Edit
                    </ActionButton>
                </div>
            </>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
          

            {/* Compact Search and Filters */}
            <CompactFilterBar
                fields={filterFields}
                values={filters}
                onChange={updateFilter}
                onClear={handleClearFilters}
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search symbols..."
                showSearch={true}
                showQuickFilters={true}
                quickFilterPresets={[
                    {
                        label: 'New',
                        values: { new_stock: 'true' },
                        icon: <StarIcon className="w-3 h-3" />
                    },
                    {
                        label: 'Trending',
                        values: { trending_stock: 'true' },
                        icon: <ZapIcon className="w-3 h-3" />
                    },
                    {
                        label: 'Follow',
                        values: { follow: 'true' },
                        icon: <HeartIcon className="w-3 h-3" />
                    },
                    {
                        label: 'Strategy',
                        values: { strategy: 'true' },
                        icon: <ActivityIcon className="w-3 h-3" />
                    }
                ]}
                className="mb-6"
            />

            {/* Data Table */}
            <DataTable
                data={analysisRecords}
                columns={columns}
                isLoading={isLoading}
                sortConfig={sortConfig}
                onSort={(field) => setSortConfig({
                    key: field,
                    direction: sortConfig.key === field && sortConfig.direction === 'asc' ? 'desc' : 'asc',
                })}
                onRowSelectionChange={(item, isSelected) => {
                    setSelectedRows(prev => {
                        const newSet = new Set(prev);
                        const key = item.id;
                        if (isSelected) {
                            newSet.add(key);
                        } else {
                            newSet.delete(key);
                        }
                        return newSet;
                    });
                }}
                selectedRows={selectedRows}
                rowKey={(item) => item.id}
                mobileCardRender={renderMobileCard}
                emptyMessage="No analysis records found"
                striped
                stickyHeader
                density="compact"
            />

            {/* Pagination */}
            <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setPagination({ currentPage: page })}
                totalRecords={pagination.totalRecords}
                perPage={pagination.perPage}
                showInfo
            />

            {/* Add to Bucket Modal */}
            {bucketRecord && (
                <AddToBucketModal
                    isOpen={isBucketModalOpen}
                    onClose={() => {
                        setIsBucketModalOpen(false);
                        setBucketRecord(null);
                    }}
                    onSuccess={() => {
                        setIsBucketModalOpen(false);
                        setBucketRecord(null);
                    }}
                    categories={[
                        'WEEK_52_HIGH',
                        'TRENDING',
                        'NEWLY_LISTED',
                        'TRENDING_NEWLY_LISTED',
                        'STRONG_FUNDAMENTAL',
                        'MY_FAVORITES',
                        'MY_PORTFOLIO',
                        'WATCHLIST',
                        'STRATEGY_CONSOLIDATION',
                        'STRATEGY_RESISTANCE_RETEST',
                        'STRATEGY_SUPPORT_RETEST',
                        'CONSOLIDATION_BREAKOUT_CONFIRMED',
                        'RESISTANCE_BREAKOUT_CONFIRMED',
                        'SUPPORT_BREAKOUT_CONFIRMED'
                    ]}
                    prefilledData={{
                        symbol: bucketRecord.symbol,
                        company_name: bucketRecord.symbol,
                        date: bucketRecord.logged_date,
                        logged_price: bucketRecord.current_price || bucketRecord.logged_price
                    }}
                />
            )}

            {/* Details Modal */}
            {selectedRecord && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    maxWidth="lg"
                >
                    <div className="p-6">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl mb-6 border border-purple-100">
                            <h3 className="text-xl font-bold text-slate-900">
                                {modalContent === 'summary' ? 'Analysis Summary' : 'Conclusion'} - {selectedRecord.symbol}
                            </h3>
                        </div>
                        <div className="bg-white p-4 rounded-lg mb-4 border border-gray-100 shadow-sm">
                            <p className="text-slate-900 whitespace-pre-wrap">
                                {modalContent === 'summary' ? selectedRecord.summary : selectedRecord.conclusion}
                            </p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Add Record Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                maxWidth="md"
            >
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Add New Analysis Record</h3>
                    <form onSubmit={handleAddRecord} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Symbol
                            </label>
                            <input
                                type="text"
                                value={addForm.symbol}
                                onChange={(e) => setAddForm(prev => ({ ...prev, symbol: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                placeholder="Enter stock symbol"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                value={addForm.date}
                                onChange={(e) => setAddForm(prev => ({ ...prev, date: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <ActionButton
                                variant="ghost"
                                onClick={() => setIsAddModalOpen(false)}
                                type="button"
                            >
                                Cancel
                            </ActionButton>
                            <ActionButton
                                variant="primary"
                                type="submit"
                            >
                                Add Record
                            </ActionButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Edit Record Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                maxWidth="xl"
            >
                <div className="p-6 max-h-[90vh] overflow-y-auto">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl mb-6 border border-purple-100">
                        <h3 className="text-xl font-bold text-slate-900">
                            Edit Analysis Record - {editForm.symbol}
                        </h3>
                    </div>
                    <form onSubmit={handleUpdateRecord} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Symbol
                                </label>
                                <input
                                    type="text"
                                    value={editForm.symbol}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, symbol: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Logged Date
                                </label>
                                <input
                                    type="date"
                                    value={editForm.logged_date}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, logged_date: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Logged Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editForm.logged_price}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, logged_price: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Current Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editForm.current_price}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, current_price: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    RSI
                                </label>
                                <select
                                    value={editForm.rsi}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, rsi: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                >
                                    <option value="">Select RSI</option>
                                    {dropdownOptions.rsi.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    MACD
                                </label>
                                <select
                                    value={editForm.macd}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, macd: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                >
                                    <option value="">Select MACD</option>
                                    {dropdownOptions.macd.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Price Spike
                                </label>
                                <select
                                    value={editForm.price_spike}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, price_spike: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                >
                                    <option value="">Select Price Spike</option>
                                    {dropdownOptions.price_spike.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Volume Spike
                                </label>
                                <select
                                    value={editForm.volume_spike}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, volume_spike: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                >
                                    <option value="">Select Volume Spike</option>
                                    {dropdownOptions.volume_spike.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Previous Trend
                                </label>
                                <select
                                    value={editForm.previous_trend}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, previous_trend: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                >
                                    <option value="">Select Previous Trend</option>
                                    {dropdownOptions.previous_trend.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Fundamental Analysis
                                </label>
                                <select
                                    value={editForm.funda}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, funda: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                >
                                    <option value="">Select Funda</option>
                                    {dropdownOptions.funda.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editForm.gap_up}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, gap_up: e.target.checked }))}
                                    className="mr-2"
                                />
                                <span className="text-sm text-slate-700">Gap Up</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editForm.new_stock}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, new_stock: e.target.checked }))}
                                    className="mr-2"
                                />
                                <span className="text-sm text-slate-700">New</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editForm.trending_stock}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, trending_stock: e.target.checked }))}
                                    className="mr-2"
                                />
                                <span className="text-sm text-slate-700">Hot</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editForm.follow}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, follow: e.target.checked }))}
                                    className="mr-2"
                                />
                                <span className="text-sm text-slate-700">Hold</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editForm.strategy}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, strategy: e.target.checked }))}
                                    className="mr-2"
                                />
                                <span className="text-sm text-slate-700">Funda</span>
                            </label>
                        </div>

                        {/* Text areas */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Summary
                            </label>
                            <textarea
                                value={editForm.summary}
                                onChange={(e) => setEditForm(prev => ({ ...prev, summary: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                placeholder="Enter analysis summary..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Conclusion
                            </label>
                            <textarea
                                value={editForm.conclusion}
                                onChange={(e) => setEditForm(prev => ({ ...prev, conclusion: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                placeholder="Enter conclusion..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <ActionButton
                                variant="ghost"
                                onClick={() => setIsEditModalOpen(false)}
                                type="button"
                            >
                                Cancel
                            </ActionButton>
                            <ActionButton
                                variant="primary"
                                type="submit"
                            >
                                Update Record
                            </ActionButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && itemToDelete && (
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    maxWidth="md"
                >
                    <div className="p-6">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl mb-6 border border-purple-100">
                            <h3 className="text-xl font-bold text-slate-900">
                                Delete Analysis Record
                            </h3>
                        </div>
                        <p className="mb-6 text-slate-900">
                            Are you sure you want to delete the analysis record for <span className="font-medium text-slate-900">{itemToDelete.symbol}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <ActionButton
                                variant="ghost"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancel
                            </ActionButton>
                            <ActionButton
                                variant="danger"
                                onClick={() => handleDelete(itemToDelete.id)}
                            >
                                Delete
                            </ActionButton>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// Helper functions
const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        timeZone: 'UTC',
    });
};

const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return 'N/A';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default AnalysisTracker;