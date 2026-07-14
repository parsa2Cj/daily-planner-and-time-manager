import React from 'react';
import { Edit3, Activity, Heart, Save } from 'lucide-react';
import { DailyLog } from '../types';

interface ReflectionSectionProps {
  log: DailyLog;
  onChangeLog: (log: Partial<DailyLog>) => void;
}

const MOODS = [
  { emoji: '⚡', label: 'پرانرژی' },
  { emoji: '😊', label: 'خوب' },
  { emoji: '😐', label: 'معمولی' },
  { emoji: '😴', label: 'خسته' },
  { emoji: '🤯', label: 'پراضطراب' },
];

export default function ReflectionSection({ log, onChangeLog }: ReflectionSectionProps) {
  return (
    <div className="bg-natural-card border border-natural-border rounded-[32px] p-6 shadow-sm flex flex-col h-[300px]" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-natural-border shrink-0">
        <span className="p-1.5 bg-natural-sage/20 text-natural-sage rounded-xl">
          <Activity className="w-5 h-5" />
        </span>
        <h2 className="text-lg font-black text-natural-olive">ارزیابی حال و روز امروز</h2>
      </div>

      {/* Mood Selector */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-natural-border scrollbar-track-transparent">
        {/* Mood select */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-natural-muted flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            حالت روحی امروز چطوره؟
          </label>
          <div className="flex items-center justify-between gap-1 bg-natural-container p-1.5 rounded-xl border border-natural-border">
            {MOODS.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => onChangeLog({ mood: m.emoji })}
                className={`flex-1 flex flex-col items-center py-1.5 rounded-lg transition-all cursor-pointer ${
                  log.mood === m.emoji
                    ? 'bg-natural-sage/20 text-natural-sage border border-natural-sage/30 scale-105 shadow-sm'
                    : 'text-natural-muted hover:text-natural-text'
                }`}
                title={m.label}
              >
                <span className="text-lg mb-0.5">{m.emoji}</span>
                <span className="text-[9px] font-bold opacity-80">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-natural-muted">سطح تمرکز و انرژی روزانه</label>
            <span className="text-xs font-black text-natural-olive font-mono">
              {log.energy} از ۵
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={log.energy}
            onChange={(e) => onChangeLog({ energy: parseInt(e.target.value, 10) })}
            className="w-full accent-natural-olive bg-natural-container h-2.5 rounded-lg cursor-pointer appearance-none border border-natural-border"
          />
          <div className="flex justify-between text-[9px] text-natural-muted-light font-bold px-0.5">
            <span>کم انرژی</span>
            <span>بسیار پرانرژی</span>
          </div>
        </div>

        {/* Quick Notepad */}
        <div className="space-y-2 pt-2 border-t border-natural-border">
          <label className="text-xs font-bold text-natural-muted flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-natural-sage" />
            یادداشت / بازخورد امروز (ذخیره خودکار)
          </label>
          <textarea
            placeholder="دستاوردها، چالش‌ها یا نکات امروز را یادداشت کنید..."
            value={log.notes}
            onChange={(e) => onChangeLog({ notes: e.target.value })}
            className="w-full bg-natural-bg border border-natural-border focus:border-natural-sage/50 focus:ring-1 focus:ring-natural-sage/30 rounded-xl p-3 text-xs text-natural-text placeholder:text-natural-muted-light transition-all outline-none h-20 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
