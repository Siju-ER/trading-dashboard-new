'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CalendarIcon,
  XIcon,
  CheckIcon
} from '@/components/shared/icons';
import { cn } from '@/lib/utils/utils';

export interface CalendarProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  format?: 'date' | 'datetime' | 'time';
  variant?: 'default' | 'modern' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showClearButton?: boolean;
  onClear?: () => void;
  label?: string;
  error?: string;
  helperText?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false,
  minDate,
  maxDate,
  showTime = false,
  format = 'date',
  variant = 'modern',
  size = 'md',
  showClearButton = true,
  onClear,
  label,
  error,
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [view, setView] = useState<'calendar' | 'months' | 'years'>('calendar');
  const [timeValue, setTimeValue] = useState({ hours: 12, minutes: 0 });
  const [calendarPosition, setCalendarPosition] = useState({ top: '0px', left: '0px', position: 'fixed' as const });
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update selected date when value prop changes
  useEffect(() => {
    setSelectedDate(value || null);
    if (value) {
      setCurrentDate(value);
      if (showTime) {
        setTimeValue({
          hours: value.getHours(),
          minutes: value.getMinutes()
        });
      }
    }
  }, [value, showTime]);

  // Update calendar position when it opens
  useEffect(() => {
    if (isOpen) {
      setCalendarPosition(getCalendarPosition());
    }
  }, [isOpen]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate optimal position for calendar dropdown
  const getCalendarPosition = () => {
    if (!inputRef.current) return { top: '0px', left: '0px', position: 'fixed' as const };
    
    const rect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const calendarHeight = 400; // Approximate calendar height
    const calendarWidth = 320; // Calendar width
    
    // Calculate position relative to viewport
    let top = rect.bottom + 8;
    let left = rect.left;
    
    // Adjust if calendar would go off bottom of viewport
    if (top + calendarHeight > viewportHeight) {
      top = rect.top - calendarHeight - 8;
    }
    
    // Adjust if calendar would go off right of viewport
    if (left + calendarWidth > viewportWidth) {
      left = viewportWidth - calendarWidth - 16;
    }
    
    // Ensure calendar doesn't go off left of viewport
    if (left < 16) {
      left = 16;
    }
    
    return { 
      top: `${top}px`, 
      left: `${left}px`,
      position: 'fixed' as const
    };
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    if (format === 'datetime' || showTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return date.toLocaleDateString('en-US', options);
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    let newDate = new Date(date);
    if (showTime) {
      newDate.setHours(timeValue.hours, timeValue.minutes, 0, 0);
    }
    
    setSelectedDate(newDate);
    onChange?.(newDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange?.(null);
    onClear?.();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setFullYear(prev.getFullYear() - 1);
      } else {
        newDate.setFullYear(prev.getFullYear() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setView('calendar');
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Previous month's trailing days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day);
      days.push(
        <button
          key={`prev-${day}`}
          className="w-10 h-10 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
          disabled
        >
          {day}
        </button>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const disabled = isDateDisabled(date);
      const selected = isDateSelected(date);
      const today = isToday(date);

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(date)}
          disabled={disabled}
          className={cn(
            "w-10 h-10 rounded-lg transition-all duration-200 font-medium text-sm",
            "hover:bg-blue-50 hover:text-blue-600",
            selected && "bg-blue-600 text-white hover:bg-blue-700 shadow-lg",
            today && !selected && "bg-blue-100 text-blue-600 font-semibold",
            disabled && "text-slate-300 cursor-not-allowed hover:bg-transparent hover:text-slate-300"
          )}
        >
          {day}
        </button>
      );
    }

    // Next month's leading days
    const totalCells = 42; // 6 rows × 7 days
    const remainingCells = totalCells - days.length;
    
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <button
          key={`next-${day}`}
          className="w-10 h-10 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
          disabled
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const renderMonths = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return months.map((month, index) => {
      const isCurrentMonth = index === currentDate.getMonth();
      const isSelectedMonth = selectedDate && index === selectedDate.getMonth();
      
      return (
        <button
          key={month}
          onClick={() => {
            setCurrentDate(prev => new Date(prev.getFullYear(), index, 1));
            setView('calendar');
          }}
          className={cn(
            "px-4 py-3 rounded-lg font-medium transition-all duration-200",
            "hover:bg-blue-50 hover:text-blue-600",
            isCurrentMonth && "bg-blue-100 text-blue-600",
            isSelectedMonth && "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {month}
        </button>
      );
    });
  };

  const renderYears = () => {
    const currentYear = currentDate.getFullYear();
    const startYear = currentYear - 12;
    const years = [];

    for (let year = startYear; year <= startYear + 24; year++) {
      const isCurrentYear = year === new Date().getFullYear();
      const isSelectedYear = selectedDate && year === selectedDate.getFullYear();
      
      years.push(
        <button
          key={year}
          onClick={() => {
            setCurrentDate(prev => new Date(year, prev.getMonth(), 1));
            setView('calendar');
          }}
          className={cn(
            "px-4 py-3 rounded-lg font-medium transition-all duration-200",
            "hover:bg-blue-50 hover:text-blue-600",
            isCurrentYear && "bg-blue-100 text-blue-600",
            isSelectedYear && "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {year}
        </button>
      );
    }

    return years;
  };

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

  const baseInputClasses = `w-full ${sizeClasses[size]} rounded-xl text-slate-900 transition-all duration-200 ${variantStyles[variant]}`;

  return (
    <div className={cn("relative", className)} ref={calendarRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
        </label>
      )}

      {/* Input Field */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <CalendarIcon className="w-5 h-5" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={formatDate(selectedDate)}
          placeholder={placeholder}
          readOnly
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            baseInputClasses,
            "pl-12 pr-12 cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
        />

        {/* Clear Button */}
        {showClearButton && selectedDate && !disabled && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Calendar Dropdown */}
      {isOpen && !disabled && (
        <div 
          className="z-[9999] w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
          style={calendarPosition}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('years')}
                  className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  {currentDate.getFullYear()}
                </button>
                <button
                  onClick={() => setView('months')}
                  className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  {currentDate.toLocaleDateString('en-US', { month: 'long' })}
                </button>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Today Button */}
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>

          {/* Calendar Content */}
          <div className="p-4">
            {view === 'calendar' && (
              <>
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="w-10 h-10 flex items-center justify-center text-xs font-semibold text-slate-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendarDays()}
                </div>

                {/* Time Picker */}
                {showTime && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Time
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={timeValue.hours}
                            onChange={(e) => setTimeValue(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                            className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                          />
                          <span className="text-slate-500">:</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={timeValue.minutes}
                            onChange={(e) => setTimeValue(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                            className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {view === 'months' && (
              <div className="grid grid-cols-3 gap-2">
                {renderMonths()}
              </div>
            )}

            {view === 'years' && (
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {renderYears()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <XIcon className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-2 text-sm text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Calendar;
