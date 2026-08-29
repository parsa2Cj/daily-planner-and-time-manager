import React, { useState } from 'react';
import { RecurringTask } from '../types';
import { X, Plus, Clock, CalendarDays, Trash2 } from 'lucide-react';

interface Props {
  tasks: RecurringTask[];
  onSave: (tasks: RecurringTask[]) => void;
  onClose: () => void;
}

const DAYS = [
  { value: 0, label: 'یک‌شنبه' },
  { value: 1, label: 'دوشنبه' },
  { value: 2, label: 'سه‌شنبه' },
  { value: 3, label: 'چهارشنبه' },
  { value: 4, label: 'پنج‌شنبه' },
  { value: 5, label: 'جمعه' },
  { value: 6, label: 'شنبه' },
];

export default function RecurringTasksManager({ tasks, onSave, onClose }: Props) {
  const [localTasks, setLocalTasks] = useState<RecurringTask[]>(tasks);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const handleToggleDay = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue]
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedDays.length === 0) return;

    const newTask: RecurringTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      time,
      daysOfWeek: selectedDays,
    };
    
    setLocalTasks(prev => [...prev, newTask]);
    setTitle('');
    setSelectedDays([]);
  };

  const handleDelete = (id: string) => {
    setLocalTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveAndClose = () => {
    onSave(localTasks);
    onClose();
  };

  const getDayNames = (days: number[]) => {
    return days.map(d => DAYS.find(day => day.value === d)?.label).join('، ');
  };

  return (
    <div className="fixed inset-0 bg-[#4A443F]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
      <div className="glass-card w-full max-w-2xl p-6 shadow-2xl space-y-4 animate-scale-in max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-natural-border shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-natural-sage/20 text-natural-sage rounded-xl">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-natural-olive text-lg">مدیریت برنامه‌های دوره‌ای و ثابت</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-natural-muted hover:text-natural-text hover:bg-natural-container rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-natural-border scrollbar-track-transparent">
          {/* Add New */}
          <form onSubmit={handleAdd} className="bg-natural-container/50 p-4 rounded-2xl border border-natural-border space-y-4">
            <h4 className="font-bold text-sm text-natural-text">افزودن برنامه ثابت جدید (مثلا: باشگاه، کلاس زبان)</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-natural-muted">عنوان برنامه</label>
                <input
                  type="text"
                  placeholder="مثال: باشگاه ورزشی"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/50 backdrop-blur-sm border border-natural-border focus:border-natural-sage/70 rounded-xl py-2 px-3 text-sm outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-natural-muted">ساعت انجام (شروع)</label>
                <div className="relative">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white/50 backdrop-blur-sm border border-natural-border focus:border-natural-sage/70 rounded-xl py-2 px-3 pl-10 text-sm outline-none"
                    required
                  />
                  <Clock className="absolute left-3 top-2.5 w-4 h-4 text-natural-muted" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-natural-muted">روزهای هفته</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleToggleDay(day.value)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                      selectedDays.includes(day.value)
                        ? 'bg-natural-sage text-white border-natural-sage shadow-md'
                        : 'bg-white/50 text-natural-muted border-natural-border hover:border-natural-sage/50'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!title.trim() || selectedDays.length === 0}
                className="flex items-center gap-1.5 bg-natural-olive hover:bg-natural-olive-hover disabled:opacity-50 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                افزودن به لیست
              </button>
            </div>
          </form>

          {/* List */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-natural-text border-b border-natural-border pb-2">برنامه‌های ثبت شده</h4>
            {localTasks.length === 0 ? (
              <p className="text-sm text-natural-muted text-center py-4">هیچ برنامه ثابتی ثبت نشده است.</p>
            ) : (
              localTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-white/60 border border-natural-border rounded-xl">
                  <div>
                    <h5 className="font-bold text-sm text-natural-text">{task.title}</h5>
                    <p className="text-xs text-natural-muted mt-1">
                      ساعت {task.time} • روزها: {getDayNames(task.daysOfWeek)}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(task.id)} className="p-2 text-natural-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-natural-border flex justify-end shrink-0 gap-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-natural-muted hover:bg-natural-container transition-colors">
            انصراف
          </button>
          <button onClick={handleSaveAndClose} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-natural-sage text-white hover:bg-[#6A7B68] shadow-md transition-colors">
            ذخیره تغییرات
          </button>
        </div>
      </div>
    </div>
  );
}
