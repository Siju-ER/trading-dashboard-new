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

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  variant?: 'default' | 'modern' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showClearButton?: boolean;
  onClear?: () => void;
  label?: string;
  error?: string;
  helperText?: string;
  presets?: Array<{
    label: string;
    value: () => DateRange;
  }>;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date range",
  className,
  disabled = false,
  minDate,
  maxDate,
  variant = 'modern',
  size = 'md',
  showClearButton = true,
  onClear,
  label,
  error,
  helperText,
  presets = [
    {
      label: 'Today',
      value: () => {
        const today = new Date();
        return { start: today, end: today };
      }
    },
    {
      label: 'Yesterday',
      value: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: yesterday };
      }
    },
    {
      label: 'Last 7 days',
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return { start, end };
      }
    },
    {
      label: 'Last 30 days',
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return { start, end };
      }
    },
    {
      label: 'This month',
      value: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start, end };
      }
    },
    {
      label: 'Last month',
      value: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start, end };
      }
    }
  ]
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange>(value || { start: null, end: null });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [calendarPosition, setCalendarPosition] = useState({ top: '0px', left: '0px', position: 'fixed' as const });
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update selected range when value prop changes
  useEffect(() => {
    setSelectedRange(value || { start: null, end: null });
  }, [value]);

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
    const calendarHeight = 500; // Approximate calendar height
    const calendarWidth = 384; // Calendar width (w-96)
    
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

  const formatDateRange = (range: DateRange): string => {
    if (!range.start && !range.end) return '';
    if (!range.start) return 'Select start date';
    if (!range.end) return `${formatDate(range.start)} - Select end date`;
    return `${formatDate(range.start)} - ${formatDate(range.end)}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const isDateInRange = (date: Date): boolean => {
    if (!selectedRange.start || !selectedRange.end) return false;
    return date >= selectedRange.start && date <= selectedRange.end;
  };

  const isDateStart = (date: Date): boolean => {
    if (!selectedRange.start) return false;
    return date.getTime() === selectedRange.start.getTime();
  };

  const isDateEnd = (date: Date): boolean => {
    if (!selectedRange.end) return false;
    return date.getTime() === selectedRange.end.getTime();
  };

  const isDateHovered = (date: Date): boolean => {
    if (!hoveredDate || !selectedRange.start || selectedRange.end) return false;
    return date >= selectedRange.start && date <= hoveredDate;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      // Start new selection
      setSelectedRange({ start: date, end: null });
    } else if (selectedRange.start && !selectedRange.end) {
      // Complete the selection
      if (date < selectedRange.start) {
        setSelectedRange({ start: date, end: selectedRange.start });
      } else {
        setSelectedRange({ start: selectedRange.start, end: date });
      }
      onChange?.({ start: selectedRange.start, end: date });
      setIsOpen(false);
    }
  };

  const handlePresetClick = (preset: typeof presets[0]) => {
    const range = preset.value();
    setSelectedRange(range);
    onChange?.(range);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedRange({ start: null, end: null });
    onChange?.({ start: null, end: null });
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
      const inRange = isDateInRange(date);
      const isStart = isDateStart(date);
      const isEnd = isDateEnd(date);
      const isHovered = isDateHovered(date);
      const today = isToday(date);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          onMouseEnter={() => setHoveredDate(date)}
          onMouseLeave={() => setHoveredDate(null)}
          disabled={disabled}
          className={cn(
            "w-10 h-10 rounded-lg transition-all duration-200 font-medium text-sm relative",
            "hover:bg-blue-50 hover:text-blue-600",
            isStart && "bg-blue-600 text-white hover:bg-blue-700 shadow-lg",
            isEnd && "bg-blue-600 text-white hover:bg-blue-700 shadow-lg",
            inRange && !isStart && !isEnd && "bg-blue-100 text-blue-600",
            isHovered && !isStart && !isEnd && "bg-blue-50 text-blue-600",
            today && !inRange && "bg-blue-100 text-blue-600 font-semibold",
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
          value={formatDateRange(selectedRange)}
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
        {showClearButton && (selectedRange.start || selectedRange.end) && !disabled && (
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
          className="z-[9999] w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
          style={calendarPosition}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              
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

            {/* Presets */}
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetClick(preset)}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-left"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Content */}
          <div className="p-4">
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

            {/* Selection Status */}
            {selectedRange.start && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    {selectedRange.end ? 'Range selected' : 'Select end date'}
                  </span>
                  {selectedRange.start && selectedRange.end && (
                    <span className="font-medium text-blue-600">
                      {Math.ceil((selectedRange.end.getTime() - selectedRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                    </span>
                  )}
                </div>
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

export default DateRangePicker;
