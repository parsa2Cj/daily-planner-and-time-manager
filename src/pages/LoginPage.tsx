import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok) {
        login(data.user);
        navigate('/');
      } else {
        setError(data.error || 'خطا در ورود');
      }
    } catch (err) {
      setError('خطای ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-natural-bg flex items-center justify-center p-4" dir="rtl">
      <div className="glass-card w-full max-w-sm p-8 space-y-6 animate-scale-in text-center">
        <div className="flex flex-col items-center justify-center gap-2 mb-6">
          <div className="p-3 bg-natural-sage/20 text-natural-sage rounded-2xl border border-natural-sage/30">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-natural-olive mt-2">ورود به سیستم مدیریت</h2>
          <p className="text-xs text-natural-muted font-bold">برای استفاده از برنامه باید وارد شوید</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-xl p-3 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-natural-muted">نام کاربری</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-natural-container/50 border border-natural-border focus:border-natural-sage/70 rounded-xl py-3 pr-10 pl-4 text-sm outline-none transition-all"
                required
              />
              <UserIcon className="w-4 h-4 text-natural-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-natural-muted">رمز عبور</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-natural-container/50 border border-natural-border focus:border-natural-sage/70 rounded-xl py-3 pr-10 pl-4 text-sm outline-none transition-all"
                required
              />
              <Lock className="w-4 h-4 text-natural-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-natural-olive hover:bg-natural-olive-hover text-white text-sm font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {isLoading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  );
}
