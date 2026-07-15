import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { ActivityMap } from '../types';

interface MonthlyCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  activityMap: ActivityMap;
}

const MONTHS_FA = [
  'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن',
  'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
];

export default function MonthlyCalendar({
  selectedDate,
  onSelectDate,
  activityMap
}: MonthlyCalendarProps) {
  // Parse initial selected date or default to today
  const [currentViewDate, setCurrentViewDate] = useState(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d || 1);
  });

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  };

  const currentYear = currentViewDate.getFullYear();
  const currentMonth = currentViewDate.getMonth();
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    setCurrentViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Activity colors (similar to GitHub contributions)
  const getActivityColor = (score: number) => {
    if (score === 0) return 'bg-natural-surface border border-natural-border';
    if (score <= 2) return 'bg-[#d1e8e2] border border-[#a3c9bf] dark:bg-[#204038] dark:border-[#2e574c]';
    if (score <= 5) return 'bg-[#70a9a1] border border-[#528a82] dark:bg-[#2b6b5c] dark:border-[#388574]';
    if (score <= 8) return 'bg-[#40798c] border border-[#2b5d6e] dark:bg-[#1f5966] dark:border-[#266978]';
    return 'bg-[#0b525b] border border-[#063b42] dark:bg-[#116e78] dark:border-[#137e8a]';
  };

  const renderDays = () => {
    const days = [];
    // Padding for first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8 sm:h-10 sm:w-10"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const score = activityMap[dateStr] || 0;
      const isSelected = dateStr === selectedDate;
      const colorClass = getActivityColor(score);

      days.push(
        <button
          key={d}
          onClick={() => onSelectDate(dateStr)}
          title={`${dateStr} (امتیاز فعالیت: ${score})`}
          className={`h-8 w-8 sm:h-10 sm:w-10 rounded-md flex items-center justify-center text-xs sm:text-sm transition-all hover:scale-110 
            ${colorClass} 
            ${isSelected ? 'ring-2 ring-natural-sage ring-offset-2 dark:ring-offset-natural-bg' : ''}
            ${score === 0 ? 'text-natural-text hover:bg-natural-sage/10' : 'text-white'}
          `}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="bg-natural-surface rounded-xl p-4 sm:p-6 shadow-sm border border-natural-border/50" dir="ltr">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-natural-sage/10 text-natural-text transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h3 className="font-semibold text-natural-text text-lg">
          {MONTHS_FA[currentMonth]} {currentYear}
        </h3>
        
        <button 
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-natural-sage/10 text-natural-text transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-medium text-natural-muted">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {renderDays()}
      </div>
      
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-natural-muted" dir="rtl">
        <span>کمتر</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-natural-surface border border-natural-border"></div>
          <div className="w-3 h-3 rounded-sm bg-[#d1e8e2] dark:bg-[#204038]"></div>
          <div className="w-3 h-3 rounded-sm bg-[#70a9a1] dark:bg-[#2b6b5c]"></div>
          <div className="w-3 h-3 rounded-sm bg-[#40798c] dark:bg-[#1f5966]"></div>
          <div className="w-3 h-3 rounded-sm bg-[#0b525b] dark:bg-[#116e78]"></div>
        </div>
        <span>بیشتر</span>
      </div>
    </div>
  );
}
