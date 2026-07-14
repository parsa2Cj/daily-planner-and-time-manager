import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardStats from './components/DashboardStats';
import TimelineSection from './components/TimelineSection';
import TaskSection from './components/TaskSection';
import PomodoroTimer from './components/PomodoroTimer';
import ReflectionSection from './components/ReflectionSection';
import { getOrCreateDeviceInfo } from './utils/device';
import { Task, ScheduleEvent, DailyLog, DeviceInfo, Priority } from './types';
import { ShieldAlert, RefreshCw } from 'lucide-react';

const DEFAULT_LOG: DailyLog = {
  energy: 3,
  mood: '😐',
  notes: '',
};

export default function App() {
  // Device Identity
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  // App State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [focusSessionsCount, setFocusSessionsCount] = useState<number>(0);
  const [dailyLog, setDailyLog] = useState<DailyLog>(DEFAULT_LOG);

  // 1. Initial Identity Fetch
  useEffect(() => {
    const info = getOrCreateDeviceInfo();
    setDeviceInfo(info);
  }, []);

  // 2. Load data mapped to specific Virtual MAC / Device ID
  useEffect(() => {
    if (!deviceInfo) return;

    const id = deviceInfo.id;
    const cachedTasks = localStorage.getItem(`planner_tasks_${id}`);
    const cachedEvents = localStorage.getItem(`planner_events_${id}`);
    const cachedSessions = localStorage.getItem(`planner_focus_${id}`);
    const cachedLog = localStorage.getItem(`planner_log_${id}`);

    if (cachedTasks) setTasks(JSON.parse(cachedTasks));
    if (cachedEvents) setEvents(JSON.parse(cachedEvents));
    if (cachedSessions) setFocusSessionsCount(parseInt(cachedSessions, 10) || 0);
    if (cachedLog) setDailyLog(JSON.parse(cachedLog));
  }, [deviceInfo]);

  // 3. Save modifications automatically to LocalStorage mapped to Device ID
  useEffect(() => {
    if (!deviceInfo) return;
    localStorage.setItem(`planner_tasks_${deviceInfo.id}`, JSON.stringify(tasks));
  }, [tasks, deviceInfo]);

  useEffect(() => {
    if (!deviceInfo) return;
    localStorage.setItem(`planner_events_${deviceInfo.id}`, JSON.stringify(events));
  }, [events, deviceInfo]);

  useEffect(() => {
    if (!deviceInfo) return;
    localStorage.setItem(`planner_focus_${deviceInfo.id}`, focusSessionsCount.toString());
  }, [focusSessionsCount, deviceInfo]);

  useEffect(() => {
    if (!deviceInfo) return;
    localStorage.setItem(`planner_log_${deviceInfo.id}`, JSON.stringify(dailyLog));
  }, [dailyLog, deviceInfo]);

  // Task Handlers
  const handleAddTask = (title: string, priority: Priority) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      completed: false,
      priority,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  // Schedule Handlers
  const handleAddEvent = (eventData: Omit<ScheduleEvent, 'id'>) => {
    const newEvent: ScheduleEvent = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setEvents((prev) => [...prev, newEvent].sort((a, b) => a.startTime.localeCompare(b.startTime)));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Reflection Handlers
  const handleChangeLog = (updatedFields: Partial<DailyLog>) => {
    setDailyLog((prev) => ({ ...prev, ...updatedFields }));
  };

  // Export Data Backup as JSON file
  const handleExportData = () => {
    if (!deviceInfo) return;
    const backupData = {
      deviceInfo,
      tasks,
      events,
      focusSessionsCount,
      dailyLog,
      exportDate: Date.now(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planner-backup-${deviceInfo.simulatedMac.replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import Data Backup from JSON file
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.tasks && parsed.events) {
          // Confirm overwrite
          if (confirm('آیا مطمئن هستید که می‌خواهید بکاپ جدید را جایگزین داده‌های فعلی کنید؟')) {
            if (parsed.deviceInfo) setDeviceInfo(parsed.deviceInfo);
            setTasks(parsed.tasks);
            setEvents(parsed.events);
            setFocusSessionsCount(parsed.focusSessionsCount || 0);
            setDailyLog(parsed.dailyLog || DEFAULT_LOG);
            alert('داده‌ها با موفقیت بازیابی شدند! 🎉');
          }
        } else {
          alert('فرمت فایل نامعتبر است.');
        }
      } catch (err) {
        alert('خطا در بارگذاری فایل پشتیبان.');
      }
    };
    reader.readAsText(file);
  };

  // Render Loading state
  if (!deviceInfo) {
    return (
      <div className="min-h-screen bg-natural-bg flex flex-col items-center justify-center text-natural-text" dir="rtl">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="w-8 h-8 text-natural-olive animate-spin" />
          <h3 className="text-lg font-bold">درحال شناسایی خودکار دستگاه شما...</h3>
          <p className="text-xs text-natural-muted font-semibold">تخصیص مک آدرس هوشمند و ایمن</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text py-6 px-4 sm:px-6 lg:px-8 font-sans transition-all selection:bg-natural-sage selection:text-white pb-16">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Modern Header (RTL) */}
        <Header
          deviceInfo={deviceInfo}
          onExport={handleExportData}
          onImport={handleImportData}
        />

        {/* Quick Achievement Widgets */}
        <DashboardStats
          tasks={tasks}
          events={events}
          focusSessionsCount={focusSessionsCount}
          log={dailyLog}
          deviceInfo={deviceInfo}
        />

        {/* Main interactive grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Right side: Daily Time Blocking (7 cols) */}
          <div className="lg:col-span-7">
            <TimelineSection
              events={events}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>

          {/* Left side: Task Planner (5 cols) */}
          <div className="lg:col-span-5">
            <TaskSection
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onClearCompleted={handleClearCompleted}
            />
          </div>
        </div>

        {/* Pomodoro Focus Block & Energy Log side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PomodoroTimer
            onFocusSessionComplete={() => setFocusSessionsCount((prev) => prev + 1)}
          />
          <ReflectionSection
            log={dailyLog}
            onChangeLog={handleChangeLog}
          />
        </div>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-natural-border text-[11px] text-natural-muted font-semibold space-y-2 flex flex-col items-center justify-center" dir="rtl">
          <div className="flex items-center gap-1.5 bg-natural-badge-bg py-1 px-3 rounded-full border border-natural-badge-border">
            <span className="h-1.5 w-1.5 rounded-full bg-natural-sage animate-pulse"></span>
            <span className="text-natural-text">سیستم احراز بدون رمزنگاری با مک‌آدرس مجازی {deviceInfo.simulatedMac} فعال است</span>
          </div>
          <p>© {new Date().getFullYear()} سامانه مدیریت هوشمند زمان و برنامه‌ریزی. تمام حقوق برای دستگاه کنونی محفوظ است.</p>
        </footer>
      </div>
    </div>
  );
}
