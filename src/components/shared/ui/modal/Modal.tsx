// ===================================
// Modal Component (Shared/Modal)
// ===================================

'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from '@/components/shared/icons';
import { cn } from '@/lib/utils/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  height?: string;
  className?: string;
  overlayClassName?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = '2xl',
  height = 'auto',
  className,
  overlayClassName,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  };

  const heightClasses = height === 'auto' ? 'h-auto' : height;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'fixed inset-0 backdrop-blur-sm transition-all duration-300 ease-out',
            overlayClassName
          )}
          onClick={closeOnOverlayClick ? onClose : undefined}
        />
        <div
          className={cn(
            'relative w-full mx-auto transform transition-all duration-300 ease-out scale-100 opacity-100',
            'bg-gradient-to-br from-white via-white to-gray-50 bg-opacity-95 backdrop-blur-xl',
            'border border-white border-opacity-60 shadow-2xl shadow-gray-500 shadow-opacity-25',
            'rounded-3xl overflow-hidden',
            'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white before:to-transparent before:opacity-50 before:pointer-events-none',
            maxWidthClasses[maxWidth],
            heightClasses,
            className
          )}
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-3 rounded-full bg-gradient-to-br from-white to-gray-100 bg-opacity-90 backdrop-blur-md text-gray-600 hover:text-gray-800 hover:from-gray-50 hover:to-gray-200 transition-all duration-300 shadow-xl border border-white border-opacity-40 hover:shadow-2xl hover:scale-105"
              aria-label="Close modal"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;