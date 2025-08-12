// src/components/features/dashboard/DashboardOverview.tsx
'use client';

import React, { useState } from 'react';
import OverviewCard from './OverviewCard';

import {
    WalletIcon,
    TrendingUpIcon,
    PortfolioIcon,
    BarChart3Icon,
    CreditCardIcon,
    TargetIcon,
    SunIcon, 
    MoonIcon,
    ArrowUpRightIcon, 
    ArrowDownRightIcon,
    PieChartIcon, 
    DollarSignIcon
} from '@/components/shared/icons';

const DashboardOverview: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Sample data with trends
    const overviewData = [
        {
            title: "Total Portfolio Value",
            value: 125847.50,
            change: "+12.5%",
            isPositive: true,
            icon: <WalletIcon />,
            subtitle: "vs last month",
            trend: [100, 105, 102, 110, 115, 112, 125],
            badge: "All time high"
        },
        {
            title: "Today's P&L",
            value: "+2,847.23",
            change: "+2.31%",
            isPositive: true,
            icon: <TrendingUpIcon />,
            subtitle: "Daily gains",
            trend: [0, 500, 300, 800, 1200, 2000, 2847],
        },
        {
            title: "Active Positions",
            value: 24,
            change: "+3 new",
            isPositive: true,
            icon: <PortfolioIcon />,
            subtitle: "Across 12 sectors",
            trend: [18, 19, 21, 20, 22, 23, 24],
        },
        {
            title: "Monthly Returns",
            value: "8.7%",
            change: "-1.2%",
            isPositive: false,
            icon: <BarChart3Icon />,
            subtitle: "vs market avg 7.5%",
            trend: [10, 9.5, 8.2, 7.8, 8.5, 9.1, 8.7],
            badge: "Outperforming"
        },
        {
            title: "Cash Available",
            value: "$15,240",
            change: "-$2,500",
            isPositive: false,
            icon: <CreditCardIcon />,
            subtitle: "Ready to invest",
            trend: [20000, 18500, 17200, 16800, 15900, 15500, 15240],
        },
        {
            title: "Win Rate",
            value: "73.5%",
            change: "+5.2%",
            isPositive: true,
            icon: <TargetIcon />,
            subtitle: "Last 30 trades",
            trend: [65, 67, 70, 68, 71, 72, 73.5],
        }
    ];

    return (
        <div className={`min-h-screen p-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Portfolio Dashboard
                    </h1>
                    <p className={`text-lg mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Welcome back! Here's your trading overview.
                    </p>
                </div>

                {/* Dark mode toggle */}
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-3 rounded-xl transition-all duration-300 ${isDarkMode
                            ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        } shadow-lg hover:shadow-xl`}
                >
                    {isDarkMode ? <SunIcon /> : <MoonIcon />}
                </button>
            </div>

            {/* Overview Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {overviewData.map((card, index) => (
                    <OverviewCard
                        key={index}
                        title={card.title}
                        value={card.value}
                        change={card.change}
                        isPositive={card.isPositive}
                        icon={card.icon}
                        isDarkMode={isDarkMode}
                        subtitle={card.subtitle}
                        trend={card.trend}
                        badge={card.badge}
                        onClick={() => console.log(`Clicked on ${card.title}`)}
                    />
                ))}
            </div>

            {/* Quick Actions */}
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                } rounded-xl p-6 shadow-lg border`}>
                <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Quick Actions
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Buy Stock", icon: <ArrowUpRightIcon />, color: "emerald" },
                        { label: "Sell Position", icon: <ArrowDownRightIcon />, color: "rose" },
                        { label: "View Analytics", icon: <PieChartIcon />, color: "blue" },
                        { label: "Add Funds", icon: <DollarSignIcon />, color: "purple" }
                    ].map((action, index) => (
                        <button
                            key={index}
                            className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${isDarkMode
                                    ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            <div className={`flex items-center gap-3`}>
                                <div className={`p-2 rounded-lg ${action.color === 'emerald' ? (isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600') :
                                        action.color === 'rose' ? (isDarkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-100 text-rose-600') :
                                            action.color === 'blue' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600') :
                                                (isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600')
                                    }`}>
                                    {action.icon}
                                </div>
                                <span className="text-sm font-medium">{action.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State Demo */}
            <div className="mt-8">
                <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Loading State Preview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((_, index) => (
                        <OverviewCard
                            key={`loading-${index}`}
                            title=""
                            value=""
                            change=""
                            isPositive={true}
                            icon={<div />}
                            isDarkMode={isDarkMode}
                            isLoading={true}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;