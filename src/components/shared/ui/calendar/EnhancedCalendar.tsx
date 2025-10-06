'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CalendarIcon,
  CheckIcon,
  XIcon
} from '@/components/shared/icons';
import { cn } from '@/lib/utils/utils';

interface EnhancedCalendarProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'modern' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  disabled?: boolean;
  showQuickSelect?: boolean;
  showTodayButton?: boolean;
  showClearButton?: boolean;
  format?: 'short' | 'medium' | 'long';
  weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday
}

const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  className,
  variant = 'modern',
  size = 'md',
  minDate,
  maxDate,
  showTime = false,
  disabled = false,
  showQuickSelect = true,
  showTodayButton = true,
  showClearButton = true,
  format = 'medium',
  weekStartsOn = 1,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [timeValue, setTimeValue] = useState('09:30');

  // Update selected date when value prop changes
  useEffect(() => {
    setSelectedDate(value || null);
  }, [value]);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const variantStyles = {
    default: 'border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    modern: 'border border-slate-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300 shadow-sm hover:shadow-md',
    minimal: 'border-0 bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500',
  };

  const formatDate = (date: Date, format: string) => {
    const options: Record<string, Intl.DateTimeFormatOptions> = {
      short: { month: 'short', day: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    };
    return date.toLocaleDateString('en-US', options[format] || options.medium);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get first day of week (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = (firstDay.getDay() + (7 - weekStartsOn)) % 7;
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toLocaleDateString('en-CA') === today.toLocaleDateString('en-CA');
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toLocaleDateString('en-CA') === selectedDate.toLocaleDateString('en-CA');
  };

  const isDisabled = (date: Date) => {
    if (disabled) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDateSelect = (date: Date) => {
    if (isDisabled(date)) return;
    
    let newDate = new Date(date);
    
    if (showTime && selectedDate) {
      // Preserve time if it was previously set
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
    } else if (showTime) {
      // Set default time
      const [hours, minutes] = timeValue.split(':').map(Number);
      newDate.setHours(hours, minutes);
    }
    
    setSelectedDate(newDate);
    onChange?.(newDate);
    setIsOpen(false);
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes);
      setSelectedDate(newDate);
      onChange?.(newDate);
    }
  };

  const handleQuickSelect = (days: number) => {
    const today = new Date();
    const newDate = new Date(today);
    newDate.setDate(today.getDate() + days);
    handleDateSelect(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    // Ensure we're using local timezone
    const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    handleDateSelect(localToday);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange?.(null);
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = weekStartsOn === 1 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={cn('relative', className)}>
      {/* Input Field */}
      <div
        className={cn(
          'flex items-center gap-3 cursor-pointer rounded-lg transition-all duration-200',
          sizeClasses[size],
          variantStyles[variant],
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'ring-2 ring-blue-500 border-blue-500'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <CalendarIcon className="w-4 h-4 text-slate-400" />
        <div className="flex-1">
          {selectedDate ? (
            <span className="text-slate-900">
              {formatDate(selectedDate, format)}
              {showTime && selectedDate && (
                <span className="ml-2 text-slate-500">
                  {selectedDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </div>
        {showClearButton && selectedDate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <XIcon className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 min-w-[320px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
              </button>
              
              <h3 className="text-lg font-semibold text-slate-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Quick Select */}
            {showQuickSelect && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleQuickSelect(0)}
                  className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => handleQuickSelect(1)}
                  className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => handleQuickSelect(7)}
                  className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
                >
                  Next Week
                </button>
                <button
                  onClick={() => handleQuickSelect(30)}
                  className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
                >
                  Next Month
                </button>
              </div>
            )}
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="h-10" />;
                }

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateSelect(day)}
                    disabled={isDisabled(day)}
                    className={cn(
                      'h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center',
                      isSelected(day) && 'bg-blue-600 text-white',
                      !isSelected(day) && isToday(day) && 'bg-blue-100 text-blue-700 font-semibold',
                      !isSelected(day) && !isToday(day) && 'text-slate-700 hover:bg-slate-100',
                      isDisabled(day) && 'text-slate-300 cursor-not-allowed hover:bg-transparent'
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker */}
          {showTime && (
            <div className="p-4 border-t border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 flex justify-between">
            {showTodayButton && (
              <button
                onClick={handleToday}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Today
              </button>
            )}
            
            <div className="flex gap-2">
              {showClearButton && selectedDate && (
                <button
                  onClick={handleClear}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default EnhancedCalendar;
