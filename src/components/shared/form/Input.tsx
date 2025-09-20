// src/components/shared/form/Input.tsx
'use client';

import React, { forwardRef, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { BaseFormProps } from '@/types/form';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseFormProps {
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
  inputClassName?: string;
  showPasswordToggle?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  loading?: boolean;
  prefix?: string;
  suffix?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
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
  inputClassName,
  showPasswordToggle = false,
  clearable = false,
  onClear,
  loading = false,
  prefix,
  suffix,
  type = 'text',
  value,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Size styles
  const sizeStyles = {
    sm: {
      input: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      label: 'text-sm',
    },
    md: {
      input: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      label: 'text-sm',
    },
    lg: {
      input: 'px-5 py-3 text-lg',
      icon: 'w-6 h-6',
      label: 'text-base',
    },
    xl: {
      input: 'px-6 py-4 text-xl',
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

  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password')
    : type;

  const hasValue = value !== undefined && value !== '';
  const shouldShowClear = clearable && hasValue && !disabled;
  const shouldShowPasswordToggle = showPasswordToggle && type === 'password';

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
      
      {/* Input Container */}
      <div className={cn(
        'relative',
        isFocused && 'z-10'
      )}>
        {/* Prefix */}
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium pointer-events-none">
            {prefix}
          </div>
        )}

        {/* Left Icon */}
        {leftIcon && (
          <div className={cn(
            'absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none',
            prefix ? 'left-8' : 'left-3',
            sizeStyles[size].icon
          )}>
            {leftIcon}
          </div>
        )}
        
        {/* Loading Spinner */}
        {loading && (
          <div className={cn(
            'absolute top-1/2 -translate-y-1/2 right-3',
            sizeStyles[size].icon
          )}>
            <svg className="animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
        )}
        
        {/* Input */}
        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            'w-full text-slate-900 placeholder-slate-500',
            'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
            sizeStyles[size].input,
            variantStyles[variant],
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            
            // Padding adjustments for icons and affixes
            prefix && 'pl-8',
            leftIcon && !prefix && 'pl-10',
            (leftIcon && prefix) && 'pl-16',
            
            (shouldShowClear || shouldShowPasswordToggle || rightIcon || suffix || loading) && 'pr-10',
            (shouldShowClear && shouldShowPasswordToggle) && 'pr-16',
            
            inputClassName,
            className
          )}
          {...props}
        />

        {/* Clear Button */}
        {shouldShowClear && !loading && (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600',
              shouldShowPasswordToggle ? 'right-8' : 'right-3',
              sizeStyles[size].icon
            )}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Password Toggle */}
        {shouldShowPasswordToggle && !loading && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 hover:text-slate-600',
              sizeStyles[size].icon
            )}
          >
            {showPassword ? (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
        
        {/* Right Icon */}
        {rightIcon && !shouldShowClear && !shouldShowPasswordToggle && !loading && (
          <div className={cn(
            'absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none',
            suffix ? 'right-8' : 'right-3',
            sizeStyles[size].icon
          )}>
            {rightIcon}
          </div>
        )}

        {/* Suffix */}
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium pointer-events-none">
            {suffix}
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

Input.displayName = 'Input';

export default Input;
