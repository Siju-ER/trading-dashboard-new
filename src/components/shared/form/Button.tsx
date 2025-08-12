// src/components/shared/form/Button.tsx
'use client';

import React, { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  gradient?: boolean;
  pulse?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = 'md',
  shadow = 'sm',
  gradient = false,
  pulse = false,
  disabled,
  className,
  ...props
}, ref) => {
  // Size styles
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  // Variant styles
  const variantStyles = {
    primary: gradient 
      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
      : 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: gradient
      ? 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white'
      : 'bg-slate-500 hover:bg-slate-600 text-white',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white bg-transparent',
    ghost: 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-transparent',
    danger: gradient
      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
      : 'bg-red-500 hover:bg-red-600 text-white',
    success: gradient
      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
      : 'bg-green-500 hover:bg-green-600 text-white',
    warning: gradient
      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white'
      : 'bg-yellow-500 hover:bg-yellow-600 text-white',
  };

  // Rounded styles
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  // Shadow styles
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        
        // Size
        sizeStyles[size],
        
        // Variant
        variantStyles[variant],
        
        // Layout
        fullWidth && 'w-full',
        
        // Styling
        roundedStyles[rounded],
        shadowStyles[shadow],
        
        // Effects
        pulse && 'animate-pulse',
        loading && 'cursor-wait',
        
        // Custom className
        className
      )}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <svg
          className={cn(
            'animate-spin -ml-1 mr-2 h-4 w-4',
            size === 'xs' && 'h-3 w-3',
            size === 'sm' && 'h-3 w-3',
            size === 'lg' && 'h-5 w-5',
            size === 'xl' && 'h-6 w-6'
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Left icon */}
      {!loading && leftIcon && (
        <span className={cn('mr-2', children && 'mr-2')}>
          {leftIcon}
        </span>
      )}

      {/* Button content */}
      {children}

      {/* Right icon */}
      {!loading && rightIcon && (
        <span className={cn('ml-2', children && 'ml-2')}>
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;