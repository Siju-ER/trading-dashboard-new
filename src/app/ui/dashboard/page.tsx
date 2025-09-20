// src/app/dashboard/page.tsx
'use client';

import React from 'react';
import Feature from '@/components/features/Feature';
import OverviewCard from '@/components/features/dashboard/OverviewCard';
import MarketOverview from '@/components/features/dashboard/MarketOverview';
import InstitutionalActivity from '@/components/features/dashboard/InstitutionalActivity';

// Dashboard Icon
const DashboardIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

// Portfolio Icons
const WalletIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TrendingUpIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const PortfolioIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const BarChart3Icon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CreditCardIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const TargetIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// Dashboard Container Component
const DashboardContainer: React.FC = () => {
  // Sample portfolio data
  const portfolioMetrics = [
    {
      title: "Total Portfolio Value",
      value: 1258475.50,
      change: "+12.5%",
      isPositive: true,
      icon: <WalletIcon />,
      subtitle: "vs last month",
      trend: [1100000, 1150000, 1120000, 1180000, 1220000, 1200000, 1258475],
      badge: "All time high"
    },
    {
      title: "Today's P&L",
      value: "+8,247.23",
      change: "+0.66%",
      isPositive: true,
      icon: <TrendingUpIcon />,
      subtitle: "Unrealized gains",
      trend: [0, 2000, 1500, 4000, 6000, 7500, 8247],
    },
    {
      title: "Active Positions",
      value: 47,
      change: "+5 new",
      isPositive: true,
      icon: <PortfolioIcon />,
      subtitle: "Across 18 sectors",
      trend: [38, 40, 42, 41, 44, 45, 47],
    },
    {
      title: "Monthly Returns",
      value: "11.8%",
      change: "+3.2%",
      isPositive: true,
      icon: <BarChart3Icon />,
      subtitle: "vs S&P 500: 8.5%",
      trend: [8.5, 9.2, 10.1, 9.8, 10.5, 11.2, 11.8],
      badge: "Outperforming"
    },
    {
      title: "Cash Available",
      value: "$45,280",
      change: "-$5,000",
      isPositive: false,
      icon: <CreditCardIcon />,
      subtitle: "Ready to invest",
      trend: [50000, 48000, 47000, 46500, 45800, 45500, 45280],
    },
    {
      title: "Win Rate",
      value: "73.5%",
      change: "+2.1%",
      isPositive: true,
      icon: <TargetIcon />,
      subtitle: "Last 30 trades",
      trend: [68, 70, 71, 69, 72, 73, 73.5],
    }
  ];

  return (
    <div className="space-y-8">
      {/* Portfolio Overview Cards */}
      {/* <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio Overview</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Your trading performance at a glance</p>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Live • Updates every 5 seconds
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioMetrics.map((metric, index) => (
            <OverviewCard
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              isPositive={metric.isPositive}
              icon={metric.icon}
              subtitle={metric.subtitle}
              trend={metric.trend}
              badge={metric.badge}
              onClick={() => console.log(`Navigating to ${metric.title} details`)}
            />
          ))}
        </div>
      </section> */}

      {/* Market Intelligence */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Market Intelligence</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Global markets and institutional flows</p>
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Global Markets - Full Width */}
          <MarketOverview />
          
          {/* Institutional Activity - Full Width */}
          <InstitutionalActivity />
        </div>
      </section>

      {/* Trading Insights */}
      {/* <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trading Insights</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Quick actions and recent activity</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Buy Stock", color: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700", icon: "📈" },
                { label: "Sell Position", color: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700", icon: "📉" },
                { label: "View Analytics", color: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700", icon: "📊" },
                { label: "Add Funds", color: "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700", icon: "💰" }
              ].map((action, index) => (
                <button
                  key={index}
                  className={`${action.color} text-white px-4 py-4 rounded-xl transition-all duration-300 text-sm font-semibold hover:scale-105 hover:shadow-lg flex items-center gap-2 justify-center`}
                >
                  <span className="text-lg">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>


          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                { action: "Bought AAPL", amount: "+25 shares", time: "2 hours ago", type: "buy", icon: "🍎" },
                { action: "Sold TSLA", amount: "-10 shares", time: "4 hours ago", type: "sell", icon: "🚗" },
                { action: "Dividend MSFT", amount: "+$125.50", time: "1 day ago", type: "dividend", icon: "💎" },
                { action: "Bought NVDA", amount: "+15 shares", time: "2 days ago", type: "buy", icon: "🖥️" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{activity.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {activity.action}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      activity.type === 'buy' ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' :
                      activity.type === 'sell' ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30' :
                      'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
                    }`}>
                      {activity.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors">
                View All Activity →
              </button>
            </div>
          </div>
        </div>
      </section> /*}

      {/* Performance Summary */}
      {/* <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Summary</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Key metrics and benchmarks</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: "Sharpe Ratio", 
              value: "1.85", 
              change: "+0.12", 
              isPositive: true, 
              description: "Risk-adjusted returns",
              color: "blue"
            },
            { 
              label: "Max Drawdown", 
              value: "-8.5%", 
              change: "+2.1%", 
              isPositive: true, 
              description: "Worst peak-to-trough",
              color: "purple"
            },
            { 
              label: "Beta", 
              value: "1.24", 
              change: "+0.08", 
              isPositive: false, 
              description: "Market correlation",
              color: "orange"
            },
            { 
              label: "Alpha", 
              value: "3.2%", 
              change: "+0.8%", 
              isPositive: true, 
              description: "Excess returns",
              color: "green"
            }
          ].map((metric, index) => (
            <div key={index} className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all duration-300 group`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  metric.color === 'blue' ? 'bg-blue-500' :
                  metric.color === 'purple' ? 'bg-purple-500' :
                  metric.color === 'orange' ? 'bg-orange-500' :
                  'bg-green-500'
                } group-hover:animate-pulse`}></div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  metric.isPositive 
                    ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' 
                    : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                }`}>
                  {metric.change}
                </div>
              </div>
              
              <div className="mb-2">
                <div className="text-2xl font-bold text-slate-900 dark:text-white group-hover:scale-105 transition-transform">
                  {metric.value}
                </div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {metric.label}
                </div>
              </div>
              
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {metric.description}
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* Market Alerts */}
       {/* <section>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">⚠️</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">
                Market Alerts & Notifications
              </h3>
              <div className="space-y-3">
                {[
                  { 
                    message: "AAPL approaching resistance level at $180", 
                    time: "5 minutes ago", 
                    type: "technical",
                    priority: "high"
                  },
                  { 
                    message: "Fed meeting minutes released - Positive sentiment", 
                    time: "1 hour ago", 
                    type: "news",
                    priority: "medium"
                  },
                  { 
                    message: "Your TSLA position is up 12% today", 
                    time: "2 hours ago", 
                    type: "portfolio",
                    priority: "low"
                  }
                ].map((alert, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.priority === 'high' ? 'bg-red-500 animate-pulse' :
                        alert.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {alert.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {alert.time}
                        </p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button className="text-sm text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium">
                  View All Alerts →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default function Dashboard() {
  const headerActions = (
    <div className="flex space-x-3">
      <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium">
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </span>
      </button>
      <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium">
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Generate Report
        </span>
      </button>
    </div>
  );

  return (
    <Feature 
      title="Trading Dashboard"
      subtitle="Comprehensive overview of your portfolio performance and market intelligence"
      headerActions={headerActions}
      icon={<DashboardIcon />}
    >
      <DashboardContainer />
    </Feature>
  );
}