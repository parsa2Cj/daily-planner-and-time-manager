import React, { useState, useEffect } from 'react';
import { Shield, Info, Download, Upload, Clock, Calendar } from 'lucide-react';
import { DeviceInfo } from '../types';

interface HeaderProps {
  deviceInfo: DeviceInfo;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Header({ deviceInfo, onExport, onImport }: HeaderProps) {
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
    <header className="bg-natural-card border border-natural-border py-6 px-6 sm:px-8 text-natural-text rounded-[32px] mb-6 shadow-sm" dir="rtl">
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
          {/* Mock MAC Identification Badge */}
          <div className="relative">
            <div className="flex items-center gap-3 bg-natural-badge-bg border border-natural-badge-border rounded-xl p-3 shadow-inner">
              <div className="p-1.5 bg-natural-sage/20 text-natural-sage rounded-lg border border-natural-sage/30">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] text-natural-muted font-bold tracking-wider uppercase">
                    مک آدرس مجازی (شناسه دستگاه)
                  </p>
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="text-natural-muted hover:text-natural-olive transition-colors"
                    title="توضیحات شناسایی"
                  >
                    <Info className="w-3.5 h-3.5 cursor-pointer" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-natural-text font-bold tracking-wider">
                    {deviceInfo.simulatedMac}
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-natural-sage opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-natural-sage"></span>
                  </span>
                </div>
              </div>
            </div>

            {/* Info Dropdown */}
            {showInfo && (
              <div className="absolute left-0 mt-2 w-72 bg-natural-card border border-natural-border p-4 rounded-xl shadow-2xl z-50 text-xs text-natural-text leading-relaxed space-y-2">
                <p className="font-bold text-natural-clay-dark">ℹ️ چرا مک آدرس واقعی نیست؟</p>
                <p>
                  به دلیل قوانین امنیتی و حفظ حریم خصوصی در مرورگرهای وب، وب‌سایت‌ها اجازه دسترسی مستقیم به مک‌آدرس (MAC Address) سخت‌افزاری شما را ندارند.
                </p>
                <p>
                  در پاسخ، ما یک <strong>مک آدرس مجازی یکتا و پایدار (Virtual MAC)</strong> برای مرورگر شما ایجاد کرده‌ایم که در حافظه امن مرورگر ذخیره شده و دقیقا مانند مک آدرس، بدون نیاز به ثبت‌نام یا لاگین، شما را شناسایی می‌کند.
                </p>
              </div>
            )}
          </div>

          {/* Backup / Restore Controls */}
          <div className="flex items-center gap-2 bg-natural-container p-1 rounded-xl border border-natural-border">
            <button
              onClick={onExport}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-natural-muted hover:text-natural-text hover:bg-natural-card rounded-lg transition-all"
              title="خروجی بکاپ داده‌ها"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">پشتیبان‌گیری</span>
            </button>
            <label
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-natural-muted hover:text-natural-text hover:bg-natural-card rounded-lg cursor-pointer transition-all"
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
          </div>
        </div>
      </div>
    </header>
  );
}
