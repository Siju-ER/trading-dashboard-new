// src/components/features/dashboard/EnhancedOverviewCard.tsx
'use client';

import React, { useState } from 'react';

import {
    TrendingUpIcon,
    TrendingDownIcon,
    InfoIcon,
    SparklesIcon
} from '@/components/shared/icons';

interface OverviewCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  isDarkMode?: boolean;
  subtitle?: string;
  trend?: number[]; // Optional trend data for sparkline
  badge?: string; // Optional badge text
  onClick?: () => void;
  isLoading?: boolean;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon,
  isDarkMode = false,
  subtitle,
  trend,
  badge,
  onClick,
  isLoading = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = isDarkMode 
    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600' 
    : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-slate-300';

  const textClasses = {
    title: isDarkMode ? 'text-slate-300' : 'text-slate-600',
    value: isDarkMode ? 'text-white' : 'text-slate-900',
    subtitle: isDarkMode ? 'text-slate-400' : 'text-slate-500',
  };

  const changeColorClasses = isPositive
    ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
    : isDarkMode ? 'text-rose-400' : 'text-rose-600';

  const changeBgClasses = isPositive
    ? isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'
    : isDarkMode ? 'bg-rose-900/20' : 'bg-rose-50';

  const iconBgClasses = isDarkMode 
    ? 'bg-slate-700/50 text-slate-300' 
    : 'bg-slate-100 text-slate-600';

  // Simple sparkline component
  const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = range === 0 ? 50 : ((max - value) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="absolute bottom-2 right-2 w-16 h-8 opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
          />
        </svg>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`${baseClasses} border rounded-xl p-6 shadow-lg transition-all duration-300 relative overflow-hidden`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className={`h-4 w-24 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
            <div className={`h-8 w-8 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-lg`}></div>
          </div>
          <div className={`h-8 w-32 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded mb-2`}></div>
          <div className={`h-4 w-20 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${
        isPositive ? 'bg-gradient-to-r from-emerald-500 to-blue-500' : 'bg-gradient-to-r from-rose-500 to-orange-500'
      }`}></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-semibold tracking-wide ${textClasses.title}`}>
            {title}
          </h3>
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
            }`}>
              {badge}
            </span>
          )}
          <button
            className={`opacity-0 group-hover:opacity-100 transition-opacity ${textClasses.subtitle} hover:text-blue-500`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <InfoIcon />
          </button>
        </div>
        
        <div className={`${iconBgClasses} p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          {icon}
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className={`absolute top-12 left-4 z-20 p-2 rounded-lg shadow-lg text-xs ${
          isDarkMode ? 'bg-slate-700 text-slate-200 border border-slate-600' : 'bg-white text-slate-700 border border-slate-200'
        }`}>
          {subtitle || 'Click for more details'}
        </div>
      )}

      {/* Main Value */}
      <div className="relative z-10 mb-3">
        <div className={`text-3xl font-bold ${textClasses.value} mb-1 transition-all duration-300 group-hover:scale-105`}>
          {typeof value === 'number' 
            ? new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
              }).format(value)
            : value
          }
        </div>
        
        {subtitle && (
          <p className={`text-xs ${textClasses.subtitle}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Change Indicator */}
      <div className="flex items-center justify-between relative z-10">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${changeBgClasses} transition-all duration-300`}>
          <div className={`${changeColorClasses} transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
            {isPositive ? (
              <TrendingUpIcon />
            ) : (
              <TrendingDownIcon />
            )}
          </div>
          <span className={`text-sm font-semibold ${changeColorClasses}`}>
            {change}
          </span>
        </div>

        {/* Sparkle animation for positive changes */}
        {isPositive && isHovered && (
          <div className="absolute top-0 right-0">
            <SparklesIcon className={`h-4 w-4 ${changeColorClasses} animate-pulse`} />
          </div>
        )}
      </div>

      {/* Sparkline trend */}
      {trend && trend.length > 1 && (
        <Sparkline 
          data={trend} 
          color={isPositive ? (isDarkMode ? '#10b981' : '#059669') : (isDarkMode ? '#f87171' : '#dc2626')} 
        />
      )}

      {/* Subtle glow effect */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
        isPositive 
          ? 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
          : 'shadow-[0_0_20px_rgba(248,113,113,0.3)]'
      }`}></div>
    </div>
  );
};

export default OverviewCard;