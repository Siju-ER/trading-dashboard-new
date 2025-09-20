// src/components/shared/SearchAndFilter/SearchInput.tsx
'use client';

import React, { useState } from 'react';
import { SearchIcon, XIcon } from '@/components/shared/icons';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'modern' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showClearButton?: boolean;
  onClear?: () => void;
  icon?: React.ReactNode;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  variant = 'modern',
  size = 'md',
  showClearButton = true,
  onClear,
  icon,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const variantStyles = {
    default: 'border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    modern: 'border border-slate-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300 shadow-sm hover:shadow-md',
    minimal: 'border-0 bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500',
  };

  const baseClasses = `w-full ${sizeClasses[size]} rounded-xl text-slate-900 transition-all duration-200 ${variantStyles[variant]}`;
  const inputClasses = `${baseClasses} ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''}`;

  return (
    <div className={`relative group ${className}`}>
      {/* Search Icon */}
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 ${isFocused ? 'text-blue-500' : ''}`}>
        {icon || <SearchIcon className={iconSizeClasses[size]} />}
      </div>
      
      {/* Input Field */}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`${inputClasses} ${icon ? 'pl-12' : 'pl-12'} ${showClearButton && value ? 'pr-12' : 'pr-4'}`}
      />
      
      {/* Clear Button */}
      {showClearButton && value && (
        <button
          onClick={handleClear}
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 ${iconSizeClasses[size]}`}
          aria-label="Clear search"
        >
          <XIcon className="w-full h-full" />
        </button>
      )}
      
      {/* Focus Ring Effect */}
      {isFocused && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-blue-500/20 pointer-events-none" />
      )}
    </div>
  );
};

export default SearchInput;