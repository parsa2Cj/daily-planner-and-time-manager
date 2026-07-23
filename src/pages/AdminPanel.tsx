import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Plus, Trash2, ArrowRight, Edit, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserInfo {
  username: string;
  role: string;
  telegramUsername?: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserInfo[]>([]);
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newTelegram, setNewTelegram] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  // Edit State
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [editTelegram, setEditTelegram] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!newUsername || !newPassword) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: newUsername, 
          password: newPassword, 
          role: 'user',
          telegramUsername: newTelegram.replace('@', '') 
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        setNewUsername('');
        setNewPassword('');
        setNewTelegram('');
        setSuccessMsg('کاربر با موفقیت ساخته شد.');
        fetchUsers();
      } else {
        setError(data.error || 'خطا در ساخت کاربر');
      }
    } catch (err) {
      setError('خطای سرور');
    }
  };

  const handleDelete = async (username: string) => {
    if (!confirm(`آیا از حذف کامل کاربر ${username} مطمئن هستید؟ تمام داده‌های او پاک خواهد شد.`)) return;
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      alert('خطا در حذف کاربر');
    }
  };

  const openEditModal = (u: UserInfo) => {
    setEditingUser(u);
    setEditTelegram(u.telegramUsername || '');
    setEditPassword('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: editingUser.username,
          password: editPassword || undefined,
          telegramUsername: editTelegram.replace('@', '') || ''
        })
      });
      
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'خطا در بروزرسانی');
      }
    } catch (err) {
      alert('خطای سرور');
    }
  };

  const handleSetupWebhook = async () => {
    setSetupLoading(true);
    try {
      const res = await fetch('/api/admin/setup-webhook', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'اتصال با موفقیت انجام شد!');
      } else {
        alert(data.error || 'خطا در اتصال');
      }
    } catch (err) {
      alert('خطای سرور');
    } finally {
      setSetupLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-natural-bg flex items-center justify-center">درحال بارگذاری...</div>;

  return (
    <div className="min-h-screen bg-natural-bg p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-natural-olive/20 text-natural-olive rounded-xl">
              <Users className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-natural-olive">مدیریت کاربران</h1>
          </div>
          <Link to="/" className="flex items-center gap-1.5 text-sm font-bold text-natural-muted hover:text-natural-olive transition-colors">
             بازگشت به برنامه
             <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex justify-end mb-4">
          <button 
            onClick={handleSetupWebhook} 
            disabled={setupLoading}
            className="flex items-center gap-2 bg-[#2AABEE] hover:bg-[#229ED9] text-white text-sm font-bold py-2 px-4 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {setupLoading ? 'در حال اتصال...' : '🔗 اتصال خودکار ربات تلگرام'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Create User Form */}
          <div className="glass-card p-6 md:col-span-1">
            <h3 className="text-lg font-bold text-natural-olive mb-4">ساخت کاربر جدید</h3>
            {error && <p className="text-xs text-rose-500 mb-3 font-bold">{error}</p>}
            {successMsg && <p className="text-xs text-emerald-500 mb-3 font-bold">{successMsg}</p>}
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-natural-muted">نام کاربری</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-natural-container/50 border border-natural-border rounded-xl py-2 px-3 text-sm outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-natural-muted">رمز عبور</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-natural-container/50 border border-natural-border rounded-xl py-2 px-3 text-sm outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-natural-muted">آیدی تلگرام (بدون @) - اختیاری</label>
                <input
                  type="text"
                  value={newTelegram}
                  onChange={(e) => setNewTelegram(e.target.value)}
                  placeholder="مثال: myusername"
                  className="w-full bg-natural-container/50 border border-natural-border rounded-xl py-2 px-3 text-sm outline-none"
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 bg-natural-olive hover:bg-natural-olive-hover text-white text-sm font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                ثبت کاربر
              </button>
            </form>
          </div>

          {/* Users List */}
          <div className="glass-card p-6 md:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-natural-olive border-b border-natural-border pb-3">لیست دوستان / کاربران</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {users.map((u) => (
                <div key={u.username} className="flex items-center justify-between p-3 bg-natural-container/50 border border-natural-border rounded-xl">
                  <div>
                    <p className="font-bold text-natural-text text-sm flex items-center gap-2">
                      {u.username}
                      {u.telegramUsername && (
                        <span className="text-[10px] bg-sky-500/10 text-sky-600 px-1.5 py-0.5 rounded-md" dir="ltr">
                          @{u.telegramUsername}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] font-bold text-natural-muted uppercase mt-0.5">{u.role}</p>
                  </div>
                  {u.username !== 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-2 text-natural-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                        title="ویرایش کاربر"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.username)}
                        className="p-2 text-natural-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="حذف کاربر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {users.length === 0 && <p className="text-xs text-natural-muted">کاربری یافت نشد.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-sm p-6 relative animate-fade-in">
            <button 
              onClick={() => setEditingUser(null)}
              className="absolute top-4 left-4 p-1.5 text-natural-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-natural-olive mb-4">ویرایش کاربر: {editingUser.username}</h3>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-natural-muted">رمز عبور جدید (اختیاری)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="تنها برای تغییر رمز وارد کنید"
                  className="w-full bg-natural-container/50 border border-natural-border rounded-xl py-2 px-3 text-sm outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-natural-muted">آیدی تلگرام (بدون @)</label>
                <input
                  type="text"
                  value={editTelegram}
                  onChange={(e) => setEditTelegram(e.target.value)}
                  className="w-full bg-natural-container/50 border border-natural-border rounded-xl py-2 px-3 text-sm outline-none"
                  dir="ltr"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-natural-olive hover:bg-natural-olive-hover text-white text-sm font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                ذخیره تغییرات
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
