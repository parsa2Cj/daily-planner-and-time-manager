import React from 'react';
import { CheckCircle2, Calendar, Clock, Activity, Shield } from 'lucide-react';
import { Task, ScheduleEvent, DailyLog } from '../types';

interface DashboardStatsProps {
  tasks: Task[];
  events: ScheduleEvent[];
  focusSessionsCount: number;
  log: DailyLog;
}

export default function DashboardStats({
  tasks,
  events,
  focusSessionsCount,
  log,
}: DashboardStatsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate total blocked hours
  const totalBlockedHours = events.reduce((acc, event) => {
    const start = parseInt(event.startTime.split(':')[0], 10);
    const end = parseInt(event.endTime.split(':')[0], 10);
    return acc + (end - start);
  }, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" dir="rtl">
      {/* Task progress widget */}
      <div className="glass-card p-4 sm:p-5 flex items-center gap-3.5 hover:scale-[1.02] cursor-default animate-scale-in" style={{ animationDelay: '0.1s' }}>
        <div className="p-2.5 bg-natural-sage/20 text-natural-sage rounded-2xl border border-natural-sage/30 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-extrabold text-natural-muted tracking-wider">پیشرفت کارهای امروز</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <h3 className="text-lg sm:text-xl font-black text-natural-text">{taskPercentage}%</h3>
            <span className="text-xs text-natural-muted font-mono">({completedTasks}/{totalTasks})</span>
          </div>
          {/* Progress bar */}
          <div className="w-24 bg-natural-container h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-natural-sage h-full rounded-full transition-all duration-500"
              style={{ width: `${taskPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Blocked hours widget */}
      <div className="glass-card p-4 sm:p-5 flex items-center gap-3.5 hover:scale-[1.02] cursor-default animate-scale-in" style={{ animationDelay: '0.2s' }}>
        <div className="p-2.5 bg-natural-olive/20 text-natural-olive rounded-2xl border border-natural-olive/30 shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-extrabold text-natural-muted tracking-wider">زمان برنامه‌ریزی شده</p>
          <h3 className="text-lg sm:text-xl font-black text-natural-text mt-0.5">{totalBlockedHours} ساعت</h3>
          <p className="text-[10px] text-natural-muted font-bold mt-1">
            در قالب {events.length} رویداد فعال
          </p>
        </div>
      </div>

      {/* Focus segments completed widget */}
      <div className="glass-card p-4 sm:p-5 flex items-center gap-3.5 hover:scale-[1.02] cursor-default animate-scale-in" style={{ animationDelay: '0.3s' }}>
        <div className="p-2.5 bg-natural-clay/20 text-natural-clay rounded-2xl border border-natural-clay/30 shrink-0">
          <Clock className="w-5 h-5 animate-pulse" />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-extrabold text-natural-muted tracking-wider">دستیابی به تمرکز</p>
          <h3 className="text-lg sm:text-xl font-black text-natural-text mt-0.5">{focusSessionsCount * 25} دقیقه</h3>
          <p className="text-[10px] text-natural-muted font-bold mt-1">
            شامل {focusSessionsCount} دوره پومودورو
          </p>
        </div>
      </div>

      {/* Energy & Mood summary widget */}
      <div className="glass-card p-4 sm:p-5 flex items-center gap-3.5 hover:scale-[1.02] cursor-default animate-scale-in" style={{ animationDelay: '0.4s' }}>
        <div className="p-2.5 bg-natural-sage/20 text-natural-sage rounded-2xl border border-natural-sage/30 shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-extrabold text-natural-muted tracking-wider">سلامت روحی و انرژی</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-lg sm:text-xl font-black text-natural-text">انرژی {log.energy}/۵</span>
            <span className="text-lg" title="احساس شما">{log.mood}</span>
          </div>
          <p className="text-[10px] text-natural-muted font-bold mt-1">
            ثبت شده برای شما
          </p>
        </div>
      </div>
    </div>
  );
}
