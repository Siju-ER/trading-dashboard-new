'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  AnalysisIcon, 
  BreakoutIcon, 
  DashboardIcon, 
  EquitiesIcon, 
  NewsIcon, 
  SettingsIcon, 
  ScannerIcon, 
  WatchlistIcon, 
  PortfolioIcon 
} from '@/components/shared/icons';

// Toggle Arrow Icon
const ChevronIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg 
    className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/ui/dashboard' },
  { id: 'equities', label: 'Equities', icon: EquitiesIcon, path: '/ui/equities' },
  { id: 'news', label: 'Market News', icon: NewsIcon, path: '/news' },
  { id: 'portfolio', label: 'Portfolio', icon: PortfolioIcon, path: '/portfolio' },
  { id: 'analysis', label: 'Analysis', icon: AnalysisIcon, path: '/analysis' },
  { id: 'scanner', label: 'Scanner', icon: ScannerIcon, path: '/scanner' },
  { id: 'watchlist', label: 'Watchlist', icon: WatchlistIcon, path: '/watchlist' },
  { id: 'breakout', label: 'Breakout', icon: BreakoutIcon, path: '/breakout' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  // Determine active item based on current path
  const getActiveItem = () => {
    const activeItem = menuItems.find(item => item.path === pathname);
    return activeItem?.id || '/ui/dashboard';
  };

  const handleNavigation = (path: string, itemId: string) => {
    router.push(path);
  };

  return (
    <div className={`${isExpanded ? 'w-72' : 'w-20'} h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col shadow-2xl transition-all duration-300 ease-in-out`}>
      
      {/* Toggle Button */}
      <div className="p-4 flex justify-end">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-110"
        >
          <ChevronIcon isExpanded={isExpanded} />
        </button>
      </div>

      {/* Header */}
      <div className={`${isExpanded ? 'p-6' : 'p-4'} border-b border-white/10`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          {isExpanded && (
            <div className="transition-opacity duration-300">
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                TradePro
              </h1>
              <p className="text-xs text-slate-400">Professional Trading</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={`flex-1 ${isExpanded ? 'p-4' : 'p-2'} space-y-2`}>
        <div className="mb-6">
          {isExpanded && (
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3 px-2 transition-opacity duration-300">
              Main Menu
            </p>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = getActiveItem() === item.id;
            
            return (
              <div
                key={item.id}
                className="relative group"
              >
                <button
                  onClick={() => handleNavigation(item.path, item.id)}
                  className={`w-full flex items-center ${isExpanded ? 'space-x-3 px-4 py-3' : 'justify-center px-2 py-3'} rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-1'
                  }`}
                >
                  <div className={`${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'} transition-colors flex-shrink-0`}>
                    <Icon />
                  </div>
                  {isExpanded && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse"></div>
                      )}
                    </>
                  )}
                </button>
                
                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      {isExpanded ? (
        <div className="p-4 border-t border-white/10 transition-opacity duration-300">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-800/50 to-purple-800/30 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">JS</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">John Smith</p>
              <p className="text-xs text-slate-400">Pro Trader</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-white/10">
          <div className="flex justify-center p-2 rounded-xl bg-gradient-to-r from-slate-800/50 to-purple-800/30 border border-white/10 relative group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
              <span className="text-white font-semibold text-xs">JS</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 absolute -top-1 -right-1"></div>
            
            {/* User tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
              John Smith
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {isExpanded && (
        <div className="p-4 transition-opacity duration-300">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">Portfolio Value</span>
              <span className="text-xs text-green-400">+2.4%</span>
            </div>
            <p className="text-xl font-bold text-white">$127,543.89</p>
          </div>
        </div>
      )}
    </div>
  );
}