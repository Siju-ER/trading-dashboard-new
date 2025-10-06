'use client';

import { ReactNode } from 'react';
import { BellIcon, SettingsIcon } from '@/components/shared/icons';

interface FeatureProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  icon?: ReactNode;
  className?: string;
  showNotifications?: boolean;
  showSettings?: boolean;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
}

export default function Feature({ 
  children, 
  title, 
  subtitle, 
  headerActions,
  icon,
  className = "",
  showNotifications = true,
  showSettings = true,
  onNotificationClick,
  onSettingsClick
}: FeatureProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100">
        <div className={`min-h-screen p-6 ${className}`}>
          {/* Page Header */}
          {(title || subtitle || headerActions) && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {icon && (
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-purple-100">
                      <div className="text-purple-600">
                        {icon}
                      </div>
                    </div>
                  )}
                  <div>
                    {title && (
                      <h1 className="text-2xl font-bold text-slate-900">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="text-sm text-slate-600 mt-1">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Custom Header Actions */}
                  {headerActions && (
                    <div className="flex items-center space-x-2">
                      {headerActions}
                    </div>
                  )}
                  
                  {/* Notification Icon */}
                  {showNotifications && (
                    <button
                      onClick={onNotificationClick}
                      className="p-2 rounded-lg bg-white/80 hover:bg-white shadow-sm border border-purple-100 hover:shadow-md transition-all duration-200 hover:scale-105"
                      title="Notifications"
                    >
                      <BellIcon className="h-5 w-5 text-slate-600 hover:text-purple-600" />
                    </button>
                  )}
                  
                  {/* Settings Icon */}
                  {showSettings && (
                    <button
                      onClick={onSettingsClick}
                      className="p-2 rounded-lg bg-white/80 hover:bg-white shadow-sm border border-purple-100 hover:shadow-md transition-all duration-200 hover:scale-105"
                      title="Settings"
                    >
                      <SettingsIcon className="h-5 w-5 text-slate-600 hover:text-purple-600" />
                    </button>
                  )}
                </div>
              </div>
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