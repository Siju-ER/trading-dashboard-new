'use client';

import React, { useState } from 'react';
import { Calendar, DateRangePicker, DateRange } from '@/components/shared/ui/calendar';
import EnhancedCalendar from '@/components/shared/ui/calendar/EnhancedCalendar';
import Feature from '@/components/features/Feature';
import { CalendarIcon } from '@/components/shared/icons';

const CalendarDemo: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange>({ start: null, end: null });
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  return (
    <Feature
      title="Beautiful Calendar Components"
      subtitle="Modern, responsive calendar and date picker components with multiple variants and features"
      icon={<CalendarIcon className="w-8 h-8 text-blue-600" />}
    >
      <div className="space-y-12">
        {/* Single Date Picker */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Single Date Picker</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Calendar
                label="Basic Date"
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Select a date"
                variant="modern"
                size="md"
              />
            </div>
            <div>
              <Calendar
                label="With Time"
                value={selectedDateTime}
                onChange={setSelectedDateTime}
                placeholder="Select date and time"
                showTime={true}
                variant="modern"
                size="md"
              />
            </div>
            <div>
              <Calendar
                label="Minimal Style"
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Select a date"
                variant="minimal"
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Date Range Picker</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <DateRangePicker
                label="Date Range"
                value={selectedRange}
                onChange={setSelectedRange}
                placeholder="Select date range"
                variant="modern"
                size="md"
              />
            </div>
            <div>
              <DateRangePicker
                label="With Presets"
                value={selectedRange}
                onChange={setSelectedRange}
                placeholder="Select date range"
                variant="modern"
                size="lg"
                presets={[
                  {
                    label: 'Today',
                    value: () => {
                      const today = new Date();
                      return { start: today, end: today };
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
                  }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Different Sizes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Different Sizes</h3>
          <div className="space-y-4">
            <Calendar
              label="Small"
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Small calendar"
              variant="modern"
              size="sm"
            />
            <Calendar
              label="Medium"
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Medium calendar"
              variant="modern"
              size="md"
            />
            <Calendar
              label="Large"
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Large calendar"
              variant="modern"
              size="lg"
            />
          </div>
        </div>

        {/* With Constraints */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">With Date Constraints</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Calendar
              label="Future Dates Only"
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Select future date"
              minDate={new Date()}
              variant="modern"
              size="md"
            />
            <Calendar
              label="Past 30 Days Only"
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Select past date"
              maxDate={new Date()}
              minDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
              variant="modern"
              size="md"
            />
          </div>
        </div>

        {/* Time Only */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Time Selection</h3>
          <div className="max-w-md">
            <Calendar
              label="Time Only"
              value={selectedTime}
              onChange={setSelectedTime}
              placeholder="Select time"
              showTime={true}
              variant="modern"
              size="md"
            />
          </div>
        </div>

        {/* Enhanced Calendar Component */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Enhanced Calendar Component</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <EnhancedCalendar
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Enhanced Date Picker"
                variant="modern"
                size="md"
                showQuickSelect={true}
                showTodayButton={true}
                showClearButton={true}
              />
            </div>
            <div>
              <EnhancedCalendar
                value={selectedDateTime}
                onChange={setSelectedDateTime}
                placeholder="With Time Selection"
                variant="modern"
                size="md"
                showTime={true}
                showQuickSelect={true}
                showTodayButton={true}
                showClearButton={true}
              />
            </div>
            <div>
              <EnhancedCalendar
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Minimal Style"
                variant="minimal"
                size="md"
                showQuickSelect={true}
                showTodayButton={true}
                showClearButton={true}
              />
            </div>
          </div>
        </div>

        {/* Selected Values Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Selected Values</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-slate-700">Selected Date:</span>{' '}
              <span className="text-blue-600">
                {selectedDate ? selectedDate.toLocaleDateString() : 'None'}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Selected DateTime:</span>{' '}
              <span className="text-blue-600">
                {selectedDateTime ? selectedDateTime.toLocaleString() : 'None'}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Selected Range:</span>{' '}
              <span className="text-blue-600">
                {selectedRange.start && selectedRange.end
                  ? `${selectedRange.start.toLocaleDateString()} - ${selectedRange.end.toLocaleDateString()}`
                  : 'None'}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Selected Time:</span>{' '}
              <span className="text-blue-600">
                {selectedTime ? selectedTime.toLocaleTimeString() : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Feature>
  );
};

export default CalendarDemo;
