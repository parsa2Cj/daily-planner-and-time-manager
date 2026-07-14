import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, AlertTriangle, Sparkles } from 'lucide-react';
import { Task, Priority } from '../types';

interface TaskSectionProps {
  tasks: Task[];
  onAddTask: (title: string, priority: Priority) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
}

export default function TaskSection({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
}: TaskSectionProps) {
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), priority);
    setNewTitle('');
    setPriority('medium');
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // Sort tasks: high priority first, then medium, then low, then by completion status
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" />
            فوری
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-bold bg-natural-clay/10 text-natural-clay-dark border border-natural-clay/20">
            متوسط
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-bold bg-natural-sage/10 text-natural-sage border border-natural-sage/20">
            عادی
          </span>
        );
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col h-[520px] animate-fade-in-up" style={{ animationDelay: '0.2s' }} dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-natural-border">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-natural-sage/20 text-natural-sage rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-black text-natural-olive">کارها و وظایف امروز</h2>
        </div>
        <span className="text-xs font-bold bg-natural-container px-2.5 py-1 rounded-full text-natural-muted font-mono">
          {tasks.filter((t) => !t.completed).length} فعال
        </span>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="کار جدیدی اضافه کنید..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-natural-container/50 border border-natural-border focus:border-natural-sage/70 focus:ring-2 focus:ring-natural-sage/20 rounded-xl py-3 pl-4 pr-11 text-sm text-natural-text placeholder:text-natural-muted-light transition-all outline-none backdrop-blur-sm"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-natural-muted-light">
            <Sparkles className="w-4 h-4" />
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Priority selector */}
          <div className="flex items-center gap-1 glass-panel p-1">
            <button
              type="button"
              onClick={() => setPriority('high')}
              className={`text-xs py-1 px-3 rounded-md font-semibold transition-all ${
                priority === 'high'
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20 shadow-sm'
                  : 'text-natural-muted hover:text-natural-text'
              }`}
            >
              فوری
            </button>
            <button
              type="button"
              onClick={() => setPriority('medium')}
              className={`text-xs py-1 px-3 rounded-md font-semibold transition-all ${
                priority === 'medium'
                  ? 'bg-natural-clay/25 text-natural-clay-dark border border-natural-clay/35 shadow-sm'
                  : 'text-natural-muted hover:text-natural-text'
              }`}
            >
              متوسط
            </button>
            <button
              type="button"
              onClick={() => setPriority('low')}
              className={`text-xs py-1 px-3 rounded-md font-semibold transition-all ${
                priority === 'low'
                  ? 'bg-natural-sage/20 text-natural-sage border border-natural-sage/30 shadow-sm'
                  : 'text-natural-muted hover:text-natural-text'
              }`}
            >
              عادی
            </button>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 bg-natural-olive hover:bg-natural-olive-hover text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            افزودن کار
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between glass-panel p-1 mb-3 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`py-1 px-2.5 rounded-lg font-semibold transition-all ${
              filter === 'all' ? 'bg-natural-card text-natural-text border border-natural-border/60 shadow-sm' : 'text-natural-muted hover:text-natural-text'
            }`}
          >
            همه ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`py-1 px-2.5 rounded-lg font-semibold transition-all ${
              filter === 'active' ? 'bg-natural-card text-natural-text border border-natural-border/60 shadow-sm' : 'text-natural-muted hover:text-natural-text'
            }`}
          >
            فعال ({tasks.filter((t) => !t.completed).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`py-1 px-2.5 rounded-lg font-semibold transition-all ${
              filter === 'completed' ? 'bg-natural-card text-natural-text border border-natural-border/60 shadow-sm' : 'text-natural-muted hover:text-natural-text'
            }`}
          >
            انجام شده ({tasks.filter((t) => t.completed).length})
          </button>
        </div>
        {tasks.some((t) => t.completed) && (
          <button
            onClick={onClearCompleted}
            className="text-natural-muted hover:text-rose-500 font-semibold cursor-pointer py-1 px-1.5"
          >
            حذف نهایی
          </button>
        )}
      </div>

      {/* Task List container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 select-none scrollbar-thin scrollbar-thumb-natural-border scrollbar-track-transparent">
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-natural-muted text-sm space-y-2 py-8">
            <CheckCircle2 className="w-10 h-10 text-natural-muted/50 stroke-[1.5]" />
            <p>لیست کارها خالی است.</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${
                task.completed
                  ? 'bg-natural-item-bg/40 border-transparent text-natural-muted opacity-60'
                  : 'bg-white/60 backdrop-blur-md border border-natural-border hover:border-natural-sage/40 hover:shadow-md text-natural-text'
              }`}
            >
              <div
                onClick={() => onToggleTask(task.id)}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-natural-sage shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-natural-muted hover:text-natural-sage shrink-0" />
                )}
                <span className={`text-sm leading-relaxed font-semibold break-all pl-2 ${task.completed ? 'line-through text-natural-muted-light' : ''}`}>
                  {task.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!task.completed && getPriorityBadge(task.priority)}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 text-natural-muted hover:text-rose-500 rounded-lg hover:bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
