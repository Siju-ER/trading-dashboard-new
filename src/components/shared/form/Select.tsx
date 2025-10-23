'use client';

import React, { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/utils';
import { BaseFormProps } from '@/types/form';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>, BaseFormProps {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
  selectClassName?: string;
  loading?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  placeholder,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className,
  containerClassName,
  labelClassName,
  errorClassName,
  helperClassName,
  selectClassName,
  loading = false,
  clearable = false,
  onClear,
  value,
  ...props
}, ref) => {
  // Size styles
  const sizeStyles = {
    sm: {
      select: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      label: 'text-sm',
    },
    md: {
      select: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      label: 'text-sm',
    },
    lg: {
      select: 'px-5 py-3 text-lg',
      icon: 'w-6 h-6',
      label: 'text-base',
    },
    xl: {
      select: 'px-6 py-4 text-xl',
      icon: 'w-7 h-7',
      label: 'text-lg',
    },
  };

  // Variant styles
  const variantStyles = {
    default: cn(
      'border border-slate-300 bg-white rounded-lg',
      'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
    ),
    outlined: cn(
      'border-2 border-slate-400 bg-white rounded-lg',
      'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
    ),
    filled: cn(
      'border border-slate-200 bg-slate-50 rounded-lg',
      'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white'
    ),
    underlined: cn(
      'border-0 border-b-2 border-slate-300 bg-transparent rounded-none px-0',
      'focus:border-blue-500'
    ),
  };

  const hasValue = value !== undefined && value !== '';
  const shouldShowClear = clearable && hasValue && !disabled;

  // Group options by group property
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || 'default';
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, SelectOption[]>);

  const hasGroups = Object.keys(groupedOptions).length > 1 || (Object.keys(groupedOptions)[0] !== 'default');

  return (
    <div className={cn(fullWidth && 'w-full', containerClassName)}>
      {/* Label */}
      {label && (
        <label className={cn(
          'block font-medium text-slate-700 dark:text-slate-300 mb-2',
          disabled && 'opacity-50',
          sizeStyles[size].label,
          labelClassName
        )}>
          {label}
        </label>
      )}
      
      {/* Select Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10',
            sizeStyles[size].icon
          )}>
            {leftIcon}
          </div>
        )}
        
        {/* Loading Spinner */}
        {loading && (
          <div className={cn(
            'absolute top-1/2 -translate-y-1/2 right-8 z-10',
            sizeStyles[size].icon
          )}>
            <svg className="animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
        )}
        
        {/* Select */}
        <select
          ref={ref}
          disabled={disabled || loading}
          value={value}
          className={cn(
            'w-full text-slate-900 bg-transparent',
            'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
            'appearance-none cursor-pointer',
            sizeStyles[size].select,
            variantStyles[variant],
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            
            // Padding adjustments for icons
            leftIcon && 'pl-10',
            (shouldShowClear || rightIcon || loading) && 'pr-10',
            shouldShowClear && rightIcon && 'pr-16',
            
            selectClassName,
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {hasGroups ? (
            Object.entries(groupedOptions).map(([group, groupOptions]) => (
              group === 'default' ? (
                groupOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))
              ) : (
                <optgroup key={group} label={group}>
                  {groupOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              )
            ))
          ) : (
            options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))
          )}
        </select>

        {/* Dropdown Arrow */}
        {!loading && (
          <div className={cn(
            'absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none',
            shouldShowClear && 'right-8',
            sizeStyles[size].icon,
            'text-slate-400'
          )}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}

        {/* Clear Button */}
        {shouldShowClear && !loading && (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600',
              rightIcon ? 'right-8' : 'right-8', // Account for dropdown arrow
              sizeStyles[size].icon
            )}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* Right Icon */}
        {rightIcon && !loading && (
          <div className={cn(
            'absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none',
            shouldShowClear ? 'right-12' : 'right-8', // Account for dropdown arrow and clear button
            sizeStyles[size].icon
          )}>
            {rightIcon}
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className={cn(
          'mt-2 text-sm text-red-600 flex items-center gap-1',
          errorClassName
        )}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      
      {/* Helper Text */}
      {helperText && !error && (
        <p className={cn(
          'mt-2 text-sm text-slate-500',
          helperClassName
        )}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
