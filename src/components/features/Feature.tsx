'use client';

import { ReactNode } from 'react';

interface FeatureProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export default function Feature({ 
  children, 
  title, 
  subtitle, 
  headerActions,
  icon,
  className = ""
}: FeatureProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className={`min-h-screen p-6 ${className}`}>
          {/* Page Header */}
          {(title || subtitle || headerActions) && (
            <div className="mb-8 flex items-start justify-between">
              <div>
                {title && (
                  <div className="flex items-center gap-3 mb-2">
                    {icon && (
                      <div className="text-slate-600 dark:text-slate-400">
                        {icon}
                      </div>
                    )}
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white">
                      {title}
                    </h1>
                  </div>
                )}
                {subtitle && (
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    {subtitle}
                  </p>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center space-x-4">
                  {headerActions}
                </div>
              )}
            </div>
          )}
          
          {/* Page Content */}
          <div className="max-w-72xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}