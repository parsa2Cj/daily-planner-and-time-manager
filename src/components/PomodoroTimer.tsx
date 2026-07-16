import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Sparkles } from 'lucide-react';

interface PomodoroTimerProps {
  onFocusSessionComplete: () => void;
}

type Mode = 'work' | 'shortBreak' | 'longBreak';

const MODE_TIMES = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function PomodoroTimer({ onFocusSessionComplete }: PomodoroTimerProps) {
  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_TIMES.work);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  // Synthesize a pleasant notification bell using Web Audio API
  const playSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High A pitch

      // Gentle bell envelope
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio synthesis failed or was blocked by browser autoplay rules:', e);
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    playSound();
    if (mode === 'work') {
      onFocusSessionComplete();
      alert('زمان تمرکز شما به پایان رسید! وقت استراحت است. 🎉');
    } else {
      alert('زمان استراحت به پایان رسید! آماده تمرکز مجدد هستید؟ 💪');
    }
    resetTimer(mode);
  };

  const resetTimer = (newMode: Mode = mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_TIMES[newMode]);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const total = MODE_TIMES[mode];
    return (timeLeft / total) * 100;
  };

  const getModeLabel = (m: Mode) => {
    switch (m) {
      case 'work':
        return 'بخش تمرکز (کار)';
      case 'shortBreak':
        return 'استراحت کوتاه';
      case 'longBreak':
        return 'استراحت طولانی';
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden h-[300px] animate-fade-in-up" style={{ animationDelay: '0.3s' }} dir="rtl">
      {/* Decorative gradient background pulse */}
      <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-700 opacity-10 pointer-events-none ${mode === 'work' ? 'from-natural-clay/30 to-natural-bg/0' : 'from-natural-sage/30 to-natural-bg/0'
        }`} />

      {/* Mode Switches */}
      <div className="flex items-center gap-1.5 glass-panel p-1 mb-4 z-10 text-xs">
        <button
          onClick={() => resetTimer('work')}
          className={`py-1.5 px-3 rounded-lg font-bold transition-all ${mode === 'work' ? 'bg-natural-clay/20 text-natural-clay-dark border border-natural-clay/30 shadow-sm' : 'text-natural-muted hover:text-natural-text'
            }`}
        >
          تمرکز (۲۵ د)
        </button>
        <button
          onClick={() => resetTimer('shortBreak')}
          className={`py-1.5 px-3 rounded-lg font-bold transition-all ${mode === 'shortBreak' ? 'bg-natural-sage/20 text-natural-sage border border-natural-sage/30 shadow-sm' : 'text-natural-muted hover:text-natural-text'
            }`}
        >
          کوتاه (۵ د)
        </button>
        <button
          onClick={() => resetTimer('longBreak')}
          className={`py-1.5 px-3 rounded-lg font-bold transition-all ${mode === 'longBreak' ? 'bg-natural-olive/20 text-natural-olive border border-natural-olive/30 shadow-sm' : 'text-natural-muted hover:text-natural-text'
            }`}
        >
          طولانی (۱۵ د)
        </button>
      </div>

      {/* Main Clock UI */}
      <div className="relative flex items-center justify-center w-36 h-36 mb-4">
        {/* Ring Background */}
        <svg className="absolute w-full h-full -rotate-90 drop-shadow-md margin:-1px">
          <circle
            cx="72"
            cy="72"
            r="64"
            className="stroke-natural-container fill-none"
            strokeWidth="6"
          />
          {/* Progress Ring */}
          <circle
            cx="72"
            cy="72"
            r="64"
            className={`fill-none transition-all duration-300 ${mode === 'work' ? 'stroke-natural-clay' : 'stroke-natural-sage'
              }`}
            strokeWidth="6"
            strokeDasharray={402} // 2 * pi * r (2 * 3.14 * 64)
            strokeDashoffset={402 - (402 * getProgressPercentage()) / 100}
            strokeLinecap="round"
          />
        </svg>

        {/* Counter Text */}
        <div className="text-center z-10 space-y-1">
          <p className="text-[10px] font-bold text-natural-muted uppercase tracking-wider">
            {getModeLabel(mode)}
          </p>
          <h3 className="text-3xl font-black font-mono tracking-wider text-natural-olive">
            {formatTime(timeLeft)}
          </h3>
        </div>
      </div>

      {/* Play/Pause/Reset Controls */}
      <div className="flex items-center gap-3 z-10">
        <button
          onClick={toggleTimer}
          className={`flex items-center justify-center w-11 h-11 rounded-full cursor-pointer transition-all border ${isRunning
              ? 'bg-natural-container border-natural-border text-natural-muted hover:text-natural-text'
              : mode === 'work'
                ? 'bg-natural-clay/20 border-natural-clay/30 text-natural-clay-dark hover:bg-natural-clay/30 hover:scale-105'
                : 'bg-natural-sage/20 border-natural-sage/30 text-natural-sage hover:bg-natural-sage/30 hover:scale-105'
            }`}
          title={isRunning ? 'توقف' : 'شروع'}
        >
          {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <button
          onClick={() => resetTimer()}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-natural-container border border-natural-border text-natural-muted hover:text-natural-text cursor-pointer transition-all"
          title="راه‌اندازی مجدد"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
