'use client';

import React from 'react';
import { cn } from '@/lib/utils/utils';

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'primary' | 'purple' | 'pink';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  outline?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  shape = 'rounded',
  children,
  className,
  icon,
  closable = false,
  onClose,
  outline = false,
}) => {
  // Build classes step by step to work with your simple cn function
  const baseClasses = ['inline-flex', 'items-center', 'font-medium', 'transition-colors'];
  
  // Add variant classes
  if (variant === 'success' && !outline) {
    baseClasses.push('bg-green-100', 'text-green-800', 'dark:bg-green-900/30', 'dark:text-green-300');
  } else if (variant === 'danger' && !outline) {
    baseClasses.push('bg-red-100', 'text-red-800', 'dark:bg-red-900/30', 'dark:text-red-300');
  } else if (variant === 'warning' && !outline) {
    baseClasses.push('bg-orange-100', 'text-orange-800', 'dark:bg-orange-900/30', 'dark:text-orange-300');
  } else if (variant === 'info' && !outline) {
    baseClasses.push('bg-blue-100', 'text-blue-800', 'dark:bg-blue-900/30', 'dark:text-blue-300');
  } else if (variant === 'neutral' && !outline) {
    baseClasses.push('bg-slate-100', 'text-slate-800', 'dark:bg-slate-700', 'dark:text-slate-300');
  } else if (variant === 'primary' && !outline) {
    baseClasses.push('bg-blue-600', 'text-white', 'dark:bg-blue-700');
  } else if (variant === 'purple' && !outline) {
    baseClasses.push('bg-purple-100', 'text-purple-800', 'dark:bg-purple-900/30', 'dark:text-purple-300');
  } else if (variant === 'pink' && !outline) {
    baseClasses.push('bg-pink-100', 'text-pink-800', 'dark:bg-pink-900/30', 'dark:text-pink-300');
  }
  
  // Add outline variant classes
  if (outline) {
    baseClasses.push('border');
    if (variant === 'success') {
      baseClasses.push('border-green-300', 'text-green-700', 'dark:border-green-600', 'dark:text-green-400');
    } else if (variant === 'danger') {
      baseClasses.push('border-red-300', 'text-red-700', 'dark:border-red-600', 'dark:text-red-400');
    } else if (variant === 'warning') {
      baseClasses.push('border-orange-300', 'text-orange-700', 'dark:border-orange-600', 'dark:text-orange-400');
    } else if (variant === 'info') {
      baseClasses.push('border-blue-300', 'text-blue-700', 'dark:border-blue-600', 'dark:text-blue-400');
    } else if (variant === 'neutral') {
      baseClasses.push('border-slate-300', 'text-slate-700', 'dark:border-slate-600', 'dark:text-slate-400');
    } else if (variant === 'primary') {
      baseClasses.push('border-blue-600', 'text-blue-600', 'dark:border-blue-500', 'dark:text-blue-400');
    } else if (variant === 'purple') {
      baseClasses.push('border-purple-300', 'text-purple-700', 'dark:border-purple-600', 'dark:text-purple-400');
    } else if (variant === 'pink') {
      baseClasses.push('border-pink-300', 'text-pink-700', 'dark:border-pink-600', 'dark:text-pink-400');
    }
  }
  
  // Add size classes
  if (size === 'xs') {
    baseClasses.push('px-1.5', 'py-0.5', 'text-xs', 'gap-1');
  } else if (size === 'sm') {
    baseClasses.push('px-2', 'py-0.5', 'text-xs', 'gap-1');
  } else if (size === 'md') {
    baseClasses.push('px-2.5', 'py-1', 'text-sm', 'gap-1.5');
  } else if (size === 'lg') {
    baseClasses.push('px-3', 'py-1.5', 'text-base', 'gap-2');
  }
  
  // Add shape classes
  if (shape === 'rounded') {
    baseClasses.push('rounded');
  } else if (shape === 'pill') {
    baseClasses.push('rounded-full');
  } else if (shape === 'square') {
    baseClasses.push('rounded-none');
  }

  // Get icon size classes
  const getIconSizeClasses = () => {
    if (size === 'xs' || size === 'sm') return 'w-3 h-3';
    if (size === 'md') return 'w-4 h-4';
    if (size === 'lg') return 'w-5 h-5';
    return 'w-4 h-4';
  };

  // Get close button size classes
  const getCloseButtonSizeClasses = () => {
    const baseCloseClasses = ['ml-1', 'hover:bg-black/10', 'dark:hover:bg-white/10', 'rounded-full', 'p-0.5', 'transition-colors'];
    
    if (size === 'xs') {
      baseCloseClasses.push('w-3', 'h-3');
    } else if (size === 'sm' || size === 'md') {
      baseCloseClasses.push('w-4', 'h-4');
    } else if (size === 'lg') {
      baseCloseClasses.push('w-5', 'h-5');
    }
    
    return cn(...baseCloseClasses);
  };

  return (
    <span className={cn(...baseClasses, className)}>
      {icon && (
        <span className={getIconSizeClasses()}>
          {icon}
        </span>
      )}
      
      <span>{children}</span>
      
      {closable && onClose && (
        <button
          onClick={onClose}
          className={getCloseButtonSizeClasses()}
          aria-label="Remove badge"
        >
          <svg
            className="w-full h-full"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Badge;