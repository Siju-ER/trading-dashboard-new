
'use client';

import React from 'react';
import { cn } from '@/lib/utils/utils';
import { LoadingIcon } from '@/components/shared/icons';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  external?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  href,
  external = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  fullWidth = false,
  ...props
}) => {
  // Build classes step by step to work with your simple cn function
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'border'
  ];

  // Add variant classes
  if (variant === 'primary') {
    baseClasses.push(
      'bg-blue-600',
      'text-white',
      'hover:bg-blue-700',
      'focus:ring-blue-500',
      'border-blue-600',
      'hover:border-blue-700',
      'shadow-sm',
      'hover:shadow'
    );
  } else if (variant === 'secondary') {
    baseClasses.push(
      'bg-slate-100',
      'text-slate-900',
      'hover:bg-slate-200',
      'focus:ring-slate-500',
      'border-slate-200',
      'hover:border-slate-300',
      'dark:bg-slate-700',
      'dark:text-slate-100',
      'dark:hover:bg-slate-600',
      'dark:border-slate-600',
      'dark:hover:border-slate-500'
    );
  } else if (variant === 'ghost') {
    baseClasses.push(
      'text-slate-600',
      'hover:text-slate-900',
      'hover:bg-slate-100',
      'focus:ring-slate-500',
      'border-transparent',
      'hover:border-slate-200',
      'dark:text-slate-400',
      'dark:hover:text-slate-100',
      'dark:hover:bg-slate-700',
      'dark:hover:border-slate-600'
    );
  } else if (variant === 'outline') {
    baseClasses.push(
      'border-slate-300',
      'text-slate-700',
      'hover:bg-slate-50',
      'focus:ring-slate-500',
      'bg-white',
      'hover:border-slate-400',
      'dark:border-slate-600',
      'dark:text-slate-300',
      'dark:hover:bg-slate-800',
      'dark:bg-slate-700',
      'dark:hover:border-slate-500'
    );
  } else if (variant === 'danger') {
    baseClasses.push(
      'bg-red-600',
      'text-white',
      'hover:bg-red-700',
      'focus:ring-red-500',
      'border-red-600',
      'hover:border-red-700',
      'shadow-sm',
      'hover:shadow'
    );
  } else if (variant === 'success') {
    baseClasses.push(
      'bg-green-600',
      'text-white',
      'hover:bg-green-700',
      'focus:ring-green-500',
      'border-green-600',
      'hover:border-green-700',
      'shadow-sm',
      'hover:shadow'
    );
  } else if (variant === 'warning') {
    baseClasses.push(
      'bg-orange-500',
      'text-white',
      'hover:bg-orange-600',
      'focus:ring-orange-500',
      'border-orange-500',
      'hover:border-orange-600',
      'shadow-sm',
      'hover:shadow'
    );
  }

  // Add size classes
  if (size === 'xs') {
    baseClasses.push('px-2', 'py-1', 'text-xs', 'gap-1');
  } else if (size === 'sm') {
    baseClasses.push('px-2.5', 'py-1.5', 'text-xs', 'gap-1.5');
  } else if (size === 'md') {
    baseClasses.push('px-3', 'py-2', 'text-sm', 'gap-2');
  } else if (size === 'lg') {
    baseClasses.push('px-4', 'py-2.5', 'text-base', 'gap-2');
  } else if (size === 'xl') {
    baseClasses.push('px-6', 'py-3', 'text-lg', 'gap-3');
  }

  // Add full width class
  if (fullWidth) {
    baseClasses.push('w-full');
  }

  // Get loading icon size classes
  const getLoadingIconClasses = () => {
    const iconClasses = ['animate-spin'];
    
    if (size === 'xs' || size === 'sm') {
      iconClasses.push('w-3', 'h-3');
    } else if (size === 'md') {
      iconClasses.push('w-4', 'h-4');
    } else if (size === 'lg' || size === 'xl') {
      iconClasses.push('w-5', 'h-5');
    }
    
    return cn(...iconClasses);
  };

  // Get span classes for loading state
  const getSpanClasses = () => {
    if (loading) {
      return 'opacity-75';
    }
    return '';
  };

  const content = (
    <>
      {loading ? (
        <LoadingIcon className={getLoadingIconClasses()} />
      ) : leftIcon}
      
      <span className={getSpanClasses()}>
        {children}
      </span>
      
      {!loading && rightIcon}
    </>
  );

  const finalClasses = cn(...baseClasses, className);

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={finalClasses}
      >
        {content}
      </a>
    );
  }

  return (
    <button 
      className={finalClasses} 
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
};

export default ActionButton;