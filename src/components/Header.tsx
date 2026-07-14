import React, { useState, useEffect } from 'react';
import { Shield, Info, Download, Upload, Clock, Calendar, Moon, Sun, User, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export default function Header({ onExport, onImport, isDarkMode, onToggleTheme }: HeaderProps) {
  const { user, logout } = useAuth();
  const [time, setTime] = useState<string>('');
  const [persianDate, setPersianDate] = useState<string>('');
  const [showInfo, setShowInfo] = useState<boolean>(false);

  useEffect(() => {
    // Update digital clock
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Format Persian date
    try {
      const today = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      setPersianDate(today.toLocaleDateString('fa-IR', options));
    } catch (e) {
      setPersianDate('امروز');
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="glass-card py-6 px-6 sm:px-8 text-natural-text mb-6 animate-fade-in-up" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Title and Date */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-natural-sage/20 text-natural-sage rounded-xl border border-natural-sage/30">
              <Calendar className="w-6 h-6 animate-pulse" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-natural-olive">
              برنامه‌ریزی و مدیریت زمان هوشمند
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-natural-muted font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-natural-sage" />
              {persianDate}
            </span>
            <span className="hidden sm:inline text-natural-border">|</span>
            <span className="flex items-center gap-1.5 font-mono text-natural-olive font-bold bg-natural-badge-bg py-0.5 px-2 rounded border border-natural-badge-border">
              <Clock className="w-4 h-4 text-natural-olive" />
              {time}
            </span>
          </div>
        </div>

        {/* Device Authentication status & Backups */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* User Profile Badge */}
          <div className="relative">
            <div className="flex items-center gap-3 bg-natural-badge-bg border border-natural-badge-border rounded-xl p-3 shadow-inner">
              <div className="p-1.5 bg-natural-sage/20 text-natural-sage rounded-lg border border-natural-sage/30">
                <User className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="text-[10px] text-natural-muted font-bold tracking-wider uppercase">
                  کاربر فعلی
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-natural-text font-bold">
                    {user?.username}
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-natural-sage opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-natural-sage"></span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Backup / Restore / Theme Controls */}
          <div className="flex items-center gap-2 bg-natural-container p-1 rounded-xl border border-natural-border">
            <button
              onClick={onToggleTheme}
              className="flex items-center justify-center p-2 text-natural-text glass-button"
              title={isDarkMode ? 'تغییر به حالت روز' : 'تغییر به حالت شب'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <span className="w-px h-6 bg-natural-border mx-1"></span>
            <button
              onClick={onExport}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-natural-text glass-button"
              title="خروجی بکاپ داده‌ها"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">پشتیبان‌گیری</span>
            </button>
            <label
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-natural-text glass-button cursor-pointer"
              title="بازیابی داده‌ها از فایل"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">بازیابی</span>
              <input
                type="file"
                accept=".json"
                onChange={onImport}
                className="hidden"
              />
            </label>
            <span className="w-px h-6 bg-natural-border mx-1"></span>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-natural-text glass-button"
                title="پنل مدیریت"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline">ادمین</span>
              </Link>
            )}
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-rose-500 hover:text-white hover:bg-rose-500 border border-transparent transition-all duration-300 rounded-xl"
              title="خروج از سیستم"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">خروج</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
