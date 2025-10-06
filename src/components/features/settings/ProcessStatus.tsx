'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config';
import { 
  RefreshCwIcon,
  CheckCircleIcon,
  SearchIcon,
  CalendarIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
  ClockIcon,
  ServerIcon,
  DatabaseIcon,
  XCircleIcon,
  ZapIcon,
  ArrowUpRightIcon,
  Clock3Icon
} from '@/components/shared/icons';
import Modal from '@/components/shared/ui/modal/Modal';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Badge from '@/components/shared/ui/badge/Badge';

interface SystemStatus {
  attribute: string;
  value: string;
}

const ProcessStatus: React.FC = () => {
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateOptions, setDateOptions] = useState<{ value: string; display: string }[]>([]);

  // Generate date options for the last 10 days
  useEffect(() => {
    const generateDateOptions = () => {
      const options = [];
      const today = new Date();
      
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Format date as YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        // Format date for display: Month Day, Year
        const displayDate = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        
        options.push({ value: formattedDate, display: displayDate });
      }
      
      return options;
    };
    
    setDateOptions(generateDateOptions());
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/process-status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        setSystems(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch system status');
      }
    } catch (error) {
      console.error('Error fetching status:', error);
      showNotification('Failed to fetch system status. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const triggerSync = async (system: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/trigger-sync/${system}`, { 
        method: 'POST' 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        showNotification(`${formatSystemName(system)} sync has been triggered`, 'success');
        fetchStatus();
      } else {
        throw new Error(data.message || 'Failed to trigger sync');
      }
    } catch (error) {
      console.error('Error triggering sync:', error);
      showNotification('Error occurred while triggering sync', 'error');
    } finally {
      setLoading(false);
    }
  };

  const triggerBreakoutScan = async () => {
    if (!selectedDate) {
      showNotification('Please select a date first', 'warning');
      return;
    }

    try {
      setIsScanning(true);
      const response = await fetch(`${API_BASE_URL}/scan-breakouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: selectedDate }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        showNotification('Breakout scan completed successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to complete breakout scan');
      }
    } catch (error) {
      console.error('Error scanning breakouts:', error);
      showNotification('Error occurred while scanning breakouts', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'warning' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const getStatusColor = (lastRunDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const runDate = new Date(lastRunDate);
    runDate.setHours(0, 0, 0, 0);
    return today.getTime() === runDate.getTime() ? 'text-green-600' : 'text-red-600';
  };

  const getStatusVariant = (lastRunDate: string): 'success' | 'danger' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const runDate = new Date(lastRunDate);
    runDate.setHours(0, 0, 0, 0);
    return today.getTime() === runDate.getTime() ? 'success' : 'danger';
  };

  const handleTriggerClick = (system: string) => {
    setSelectedSystem(system);
    setShowConfirmation(true);
  };

  const handleConfirmSync = async () => {
    if (selectedSystem) {
      await triggerSync(selectedSystem);
      setShowConfirmation(false);
      setSelectedSystem(null);
    }
  };

  const formatSystemName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getSystemIcon = (systemName: string) => {
    // Map system names to icons
    const iconMap: Record<string, React.ReactNode> = {
      price_data: <DatabaseIcon className="h-5 w-5" />,
      market_data: <ChevronDownIcon className="h-5 w-5" />,
      technical_indicators: <ZapIcon className="h-5 w-5" />,
      breakout_scanner: <ArrowUpRightIcon className="h-5 w-5" />,
      default: <ServerIcon className="h-5 w-5" />
    };
    
    return iconMap[systemName] || iconMap.default;
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-600 border border-green-200' 
            : notification.type === 'warning'
              ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
              : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {notification.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
          {notification.type === 'warning' && <AlertTriangleIcon className="h-5 w-5" />}
          {notification.type === 'error' && <XCircleIcon className="h-5 w-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitor and manage data processing systems
          </p>
        </div>
        
        <ActionButton
          variant="outline"
          size="sm"
          onClick={fetchStatus}
          leftIcon={<RefreshCwIcon className={loading ? 'animate-spin' : ''} />}
          disabled={loading}
        >
          Refresh
        </ActionButton>
      </div>

      {/* System Status Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Data Processing Systems</h3>
        
        {loading && systems.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-24 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systems.map((system) => {
              const isToday = new Date(system.value).toDateString() === new Date().toDateString();
              const statusBadge = isToday ? 'Up to date' : 'Needs update';
              const formattedDate = new Date(system.value).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              
              return (
                <div 
                  key={system.attribute} 
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow"
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getSystemIcon(system.attribute)}
                        <h4 className="font-medium text-gray-900">
                          {formatSystemName(system.attribute)}
                        </h4>
                      </div>
                      <Badge variant={getStatusVariant(system.value)} size="sm">
                        {statusBadge}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Last Run: {formattedDate}
                      </span>
                    </div>
                    
                    {!isToday && (
                      <ActionButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleTriggerClick(system.attribute)}
                        leftIcon={<RefreshCwIcon className={loading ? 'animate-spin' : ''} />}
                        disabled={loading}
                      >
                        Sync Now
                      </ActionButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Breakout Scanner Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Stock Scanner</h3>
        
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
            <div className="flex items-center space-x-2">
              <SearchIcon className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-800">Breakout Scanner</h4>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-sm text-gray-600">
                Scan for potential breakout stocks based on technical patterns and volume analysis
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg 
                      bg-white text-gray-900 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a date</option>
                    {dateOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.display}
                      </option>
                    ))}
                  </select>
                  
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <ActionButton
                  variant="primary"
                  size="sm"
                  onClick={triggerBreakoutScan}
                  leftIcon={isScanning ? <RefreshCwIcon className="animate-spin" /> : <SearchIcon />}
                  disabled={isScanning || !selectedDate}
                >
                  {isScanning ? 'Scanning...' : 'Scan Now'}
                </ActionButton>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-500">
                <Clock3Icon className="h-4 w-4 mr-2" />
                <span>Scan results will be available in the Breakouts page after processing is complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">System Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-500">CPU Usage</div>
              <Badge variant="success" size="sm">Healthy</Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">24%</div>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: '24%' }}></div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-500">Memory Usage</div>
              <Badge variant="warning" size="sm">Moderate</Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">68%</div>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
              <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '68%' }}></div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-500">Storage</div>
              <Badge variant="success" size="sm">Healthy</Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">42%</div>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: '42%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <Modal
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setSelectedSystem(null);
          }}
          maxWidth="md"
        >
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Confirm Sync</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to trigger sync for {selectedSystem ? formatSystemName(selectedSystem) : ''}?
              This process will fetch the latest data and may take a few minutes to complete.
            </p>
            <div className="flex justify-end space-x-3">
              <ActionButton
                variant="ghost"
                onClick={() => {
                  setShowConfirmation(false);
                  setSelectedSystem(null);
                }}
              >
                Cancel
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={handleConfirmSync}
                disabled={loading}
              >
                Confirm
              </ActionButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProcessStatus;