import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Clock, Edit3, X, Sparkles } from 'lucide-react';
import { ScheduleEvent } from '../types';

interface TimelineSectionProps {
  events: ScheduleEvent[];
  onAddEvent: (event: Omit<ScheduleEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

// Fixed list of hours for time blocking (6:00 AM to 11:00 PM)
const HOURS = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 6;
  const formatted = hour < 10 ? `0${hour}:00` : `${hour}:00`;
  return formatted;
});

const EVENT_COLORS = [
  { name: 'زیتونی', class: 'bg-natural-olive/10 text-natural-olive border-natural-olive/25' },
  { name: 'پونه‌ای', class: 'bg-natural-sage/15 text-natural-sage border-natural-sage/25' },
  { name: 'خاک رسی', class: 'bg-natural-clay/15 text-natural-clay-dark border-natural-clay/25' },
  { name: 'کرمی', class: 'bg-natural-badge-bg/40 text-natural-text border-natural-badge-border/50' },
  { name: 'صورتی ملایم', class: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
];

export default function TimelineSection({ events, onAddEvent, onDeleteEvent }: TimelineSectionProps) {
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(EVENT_COLORS[0].class);
  const [duration, setDuration] = useState('1'); // duration in hours (1 or 2)

  const handleOpenAdd = (hour: string) => {
    setSelectedHour(hour);
    setEventTitle('');
    setSelectedColor(EVENT_COLORS[0].class);
    setDuration('1');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHour || !eventTitle.trim()) return;

    // Calculate end time
    const startHourInt = parseInt(selectedHour.split(':')[0], 10);
    const endHourInt = startHourInt + parseInt(duration, 10);
    const formattedEndHour = endHourInt < 10 ? `0${endHourInt}:00` : `${endHourInt}:00`;

    onAddEvent({
      title: eventTitle.trim(),
      startTime: selectedHour,
      endTime: formattedEndHour,
      color: selectedColor,
    });

    setSelectedHour(null);
  };

  // Find event occupying a particular hour slot
  const getEventForHour = (hour: string) => {
    const hourVal = parseInt(hour.split(':')[0], 10);
    return events.find((e) => {
      const startVal = parseInt(e.startTime.split(':')[0], 10);
      const endVal = parseInt(e.endTime.split(':')[0], 10);
      return hourVal >= startVal && hourVal < endVal;
    });
  };

  return (
    <div className="glass-card p-6 flex flex-col h-[520px] animate-fade-in-up" style={{ animationDelay: '0.1s' }} dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-natural-border">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-natural-sage/20 text-natural-sage rounded-xl">
            <Calendar className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-black text-natural-olive">برنامه‌ریزی زمانی امروز</h2>
        </div>
        <span className="text-xs text-natural-muted font-bold">بخش‌بندی ۶ صبح تا ۱۱ شب</span>
      </div>

      {/* Hourly Timeline list container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-natural-border scrollbar-track-transparent">
        {HOURS.map((hour) => {
          const matchedEvent = getEventForHour(hour);
          const isStartOfEvent = matchedEvent && matchedEvent.startTime === hour;

          return (
            <div key={hour} className="flex gap-4 items-start relative group">
              {/* Timeline dot and line indicator */}
              <div className="flex flex-col items-center shrink-0 w-12 pt-1 font-mono text-xs text-natural-muted font-bold">
                {hour}
              </div>

              {/* Time block area */}
              <div className="flex-1">
                {matchedEvent ? (
                  isStartOfEvent ? (
                    <div
                      className={`flex items-center justify-between p-3 rounded-2xl border ${matchedEvent.color} shadow-sm relative group`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-current shrink-0 opacity-70" />
                        <div className="text-right">
                          <p className="text-xs font-bold leading-none mb-1 opacity-75">
                            {matchedEvent.startTime} - {matchedEvent.endTime}
                          </p>
                          <h4 className="text-sm font-extrabold tracking-wide">{matchedEvent.title}</h4>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteEvent(matchedEvent.id)}
                        className="p-1 text-current/50 hover:text-rose-600 rounded hover:bg-black/5 transition-colors cursor-pointer"
                        title="حذف رویداد"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    // Consecutive block for multi-hour events
                    <div
                      className={`flex items-center justify-between p-2 rounded-2xl border border-dashed border-t-0 -mt-2.5 pt-4 text-xs font-semibold ${matchedEvent.color} opacity-60`}
                    >
                      <span>ادامه: {matchedEvent.title}</span>
                    </div>
                  )
                ) : (
                  // Free hour slot button
                  <button
                    onClick={() => handleOpenAdd(hour)}
                    className="w-full text-right p-3 rounded-2xl border border-dashed border-[#DCD5CB] hover:border-natural-sage/50 bg-white/30 hover:bg-white/60 text-natural-muted hover:text-natural-sage text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group-hover:border-natural-muted-light backdrop-blur-sm"
                  >
                    <span>زمان خالی</span>
                    <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Event Modal overlay */}
      {selectedHour && (
        <div className="fixed inset-0 bg-[#4A443F]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-in" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-natural-border">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-natural-sage/20 text-natural-sage rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-natural-olive">بلوک‌بندی زمان: ساعت {selectedHour}</h3>
              </div>
              <button
                onClick={() => setSelectedHour(null)}
                className="p-1 text-natural-muted hover:text-natural-text hover:bg-natural-container rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-natural-muted">عنوان برنامه / رویداد</label>
                <input
                  type="text"
                  placeholder="مثال: کار روی پروژه، ناهار و استراحت..."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-natural-container/50 backdrop-blur-sm border border-natural-border focus:border-natural-sage/70 focus:ring-2 focus:ring-natural-sage/20 rounded-xl py-3 px-4 text-sm text-natural-text placeholder:text-natural-muted-light transition-all outline-none"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Duration select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-muted">مدت زمان</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-natural-container/50 backdrop-blur-sm border border-natural-border focus:border-natural-sage/70 focus:ring-2 focus:ring-natural-sage/20 rounded-xl py-2.5 px-3 text-sm text-natural-text outline-none transition-all"
                  >
                    <option value="1">۱ ساعت</option>
                    <option value="2">۲ ساعت</option>
                    <option value="3">۳ ساعت</option>
                  </select>
                </div>

                {/* Color select placeholder */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-muted">رنگ طبقه‌بندی</label>
                  <div className="flex flex-wrap gap-1.5 py-1">
                    {EVENT_COLORS.map((c) => (
                      <button
                        key={c.class}
                        type="button"
                        onClick={() => setSelectedColor(c.class)}
                        className={`w-6 h-6 rounded-full border transition-all ${c.class.split(' ')[0]} ${
                          selectedColor === c.class
                            ? 'ring-2 ring-natural-sage border-white scale-110'
                            : 'border-natural-border hover:scale-105'
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedHour(null)}
                  className="glass-button text-natural-text text-xs font-bold py-2.5 px-4 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-natural-olive hover:bg-natural-olive-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
                >
                  ثبت برنامه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
