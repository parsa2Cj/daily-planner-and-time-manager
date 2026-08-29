import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import DashboardStats from '../components/DashboardStats';
import TimelineSection from '../components/TimelineSection';
import TaskSection from '../components/TaskSection';
import PomodoroTimer from '../components/PomodoroTimer';
import ReflectionSection from '../components/ReflectionSection';
import MonthlyCalendar from '../components/MonthlyCalendar';
import RecurringTasksManager from '../components/RecurringTasksManager';
import { Task, ScheduleEvent, DailyLog, Priority, ActivityMap, RecurringTask } from '../types';
import { ShieldAlert, RefreshCw, CalendarDays, Zap } from 'lucide-react';

const DEFAULT_LOG: DailyLog = {
  energy: 3,
  mood: '😐',
  notes: '',
};

export default function Dashboard() {
  // App State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [focusSessionsCount, setFocusSessionsCount] = useState<number>(0);
  const [dailyLog, setDailyLog] = useState<DailyLog>(DEFAULT_LOG);
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);

  // Calendar State
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [activityMap, setActivityMap] = useState<ActivityMap>({});

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('planner_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('planner_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('planner_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Load data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/data?date=${selectedDate}`);
        const json = await res.json();
        if (res.ok && json.data) {
          setTasks(json.data.tasks || []);
          setEvents(json.data.events || []);
          setFocusSessionsCount(json.data.focusSessionsCount || 0);
          setDailyLog(json.data.dailyLog || DEFAULT_LOG);
        } else {
          // Reset if no data for the day
          setTasks([]);
          setEvents([]);
          setFocusSessionsCount(0);
          setDailyLog(DEFAULT_LOG);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, [selectedDate]);

  const fetchActivityMap = async () => {
    try {
      const res = await fetch('/api/activity');
      const json = await res.json();
      if (res.ok && json.data) {
        setActivityMap(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch activity map', err);
    }
  };

  const fetchRecurringTasks = async () => {
    try {
      const res = await fetch('/api/recurring');
      const json = await res.json();
      if (res.ok && json.data) {
        setRecurringTasks(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch recurring tasks', err);
    }
  };

  useEffect(() => {
    fetchActivityMap();
    fetchRecurringTasks();
  }, []);

  const saveRecurringTasks = async (newTasks: RecurringTask[]) => {
    setRecurringTasks(newTasks);
    try {
      await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTasks)
      });
    } catch (err) {
      console.error('Failed to save recurring tasks', err);
    }
  };

  // Save modifications to API
  const saveData = async (dataToSave: any) => {
    try {
      await fetch(`/api/data?date=${selectedDate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });
      // Optionally re-fetch activity map here if it might have changed
      fetchActivityMap();
    } catch (err) {
      console.error('Failed to save data', err);
    }
  };

  // Debounce save or save immediately. For simplicity, we'll save on every change here:
  useEffect(() => {
    const timer = setTimeout(() => {
      saveData({ tasks, events, focusSessionsCount, dailyLog });
    }, 1000);
    return () => clearTimeout(timer);
  }, [tasks, events, focusSessionsCount, dailyLog]);

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
    const backupData = {
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
    a.download = `planner-backup.json`;
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

  const currentDayOfWeek = new Date(selectedDate).getDay();
  const suggestedRecurringTasks = recurringTasks.filter(rt => 
    rt.daysOfWeek.includes(currentDayOfWeek) && 
    !events.some(e => e.title === rt.title)
  );

  const handleAddSuggestedTask = (rt: RecurringTask) => {
    const endHourInt = parseInt(rt.time.split(':')[0], 10) + 1;
    const formattedEndHour = endHourInt < 10 ? `0${endHourInt}:00` : `${endHourInt}:00`;
    
    handleAddEvent({
      title: rt.title,
      startTime: rt.time,
      endTime: formattedEndHour,
      color: 'bg-natural-sage/15 text-natural-sage border-natural-sage/25',
      checklist: []
    });
  };

  const handleUpdateEvent = (updatedEvent: ScheduleEvent) => {
    setEvents((prev) => prev.map((e) => e.id === updatedEvent.id ? updatedEvent : e));
  };

  return (
    <div className="min-h-screen text-natural-text py-8 px-4 sm:px-8 lg:px-12 font-sans transition-all selection:bg-natural-sage selection:text-white pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Modern Header (RTL) */}
        <Header
          onExport={handleExportData}
          onImport={handleImportData}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        {/* Quick Achievement Widgets */}
        <DashboardStats
          tasks={tasks}
          events={events}
          focusSessionsCount={focusSessionsCount}
          log={dailyLog}
        />

        <div className="flex items-center justify-end">
          <button 
            onClick={() => setIsRecurringModalOpen(true)}
            className="flex items-center gap-2 bg-natural-container/60 hover:bg-natural-container border border-natural-border px-4 py-2 rounded-xl text-sm font-bold text-natural-olive transition-colors shadow-sm"
          >
            <CalendarDays className="w-4 h-4" />
            مدیریت برنامه‌های دوره‌ای و ثابت
          </button>
        </div>

        {/* Monthly Calendar */}
        <div className="flex justify-center w-full max-w-3xl mx-auto">
          <div className="w-full">
            <MonthlyCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              activityMap={activityMap}
            />
          </div>
        </div>

        {/* Suggested Recurring Tasks for Today */}
        {suggestedRecurringTasks.length > 0 && (
          <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in border-natural-sage/30 bg-natural-sage/5" dir="rtl">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-natural-sage" />
              <p className="text-sm font-bold text-natural-olive">برنامه‌های ثابت پیشنهادی برای امروز:</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedRecurringTasks.map(rt => (
                <button
                  key={rt.id}
                  onClick={() => handleAddSuggestedTask(rt)}
                  className="bg-white/80 hover:bg-white text-xs font-bold px-3 py-1.5 rounded-lg border border-natural-border hover:border-natural-sage transition-all flex items-center gap-1.5"
                >
                  <span className="text-natural-olive">{rt.title}</span>
                  <span className="text-natural-muted font-mono">{rt.time}</span>
                  <span className="text-natural-sage">+</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main interactive grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Right side: Daily Time Blocking (7 cols) */}
          <div className="lg:col-span-7">
            <TimelineSection
              events={events}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
              onUpdateEvent={handleUpdateEvent}
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

        <footer className="text-center pt-8 border-t border-natural-border text-[11px] text-natural-muted font-semibold space-y-2 flex flex-col items-center justify-center" dir="rtl">
          <p>© {new Date().getFullYear()} سامانه مدیریت هوشمند زمان و برنامه‌ریزی.</p>
        </footer>
      </div>

      {isRecurringModalOpen && (
        <RecurringTasksManager
          tasks={recurringTasks}
          onSave={saveRecurringTasks}
          onClose={() => setIsRecurringModalOpen(false)}
        />
      )}
    </div>
  );
}
