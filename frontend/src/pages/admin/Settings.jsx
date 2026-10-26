import React, { useState } from 'react';
import { useAuth } from '../../context/Authcontext';
import { authService } from '../../services';
import { API_BASE_URL } from '../../services/api';
import toast from 'react-hot-toast';
import { User, Lock, Palette, Layout, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const TABS = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'password', icon: Lock, label: 'Password' },
  { id: 'personalization', icon: Palette, label: 'Personalization' },
  { id: 'homepage', icon: Layout, label: 'Homepage Layout' },
];

const inputCls = "w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]/30 focus:border-[#A6754D] transition";
const labelCls = "block text-sm font-bold text-[#4E3B2C] mb-1.5";

function ProfileTab({ user, onSaved }) {
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm(form => ({ ...form, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.updateProfile(form);
      toast.success('Profile updated');
      onSaved();
    } catch { toast.error('Error updating profile'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls}>First Name</label>
          <input className={inputCls} value={form.first_name} onChange={set('first_name')} />
        </div>
        <div>
          <label className={labelCls}>Last Name</label>
          <input className={inputCls} value={form.last_name} onChange={set('last_name')} />
        </div>
      </div>
      <div className="mb-4">
        <label className={labelCls}>Email</label>
        <input className={`${inputCls} bg-gray-100 text-gray-500 cursor-not-allowed`} value={user?.email || ''} disabled />
        <p className="text-xs text-[#7C6652] mt-1">Email cannot be changed.</p>
      </div>
      <div className="mb-4">
        <label className={labelCls}>Phone</label>
        <input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="+254 7XX XXX XXX" />
      </div>
      <div className="mb-6">
        <label className={labelCls}>Default Address</label>
        <textarea className={`${inputCls} resize-none`} value={form.address} onChange={set('address')} rows={3} placeholder="e.g., Bazaar Plaza, Nairobi CBD" />
      </div>
      <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B] disabled:opacity-60 transition shadow-md" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

function PasswordTab() {
  const [form, setForm] = useState({ old_password: '', new_password1: '', new_password2: '' });
  const [show, setShow] = useState({ old: false, new1: false, new2: false });
  const [loading, setLoading] = useState(false);
  
  const set = (f) => (e) => setForm(form => ({ ...form, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password1 !== form.new_password2) {
      toast.error("Passwords don't match");
      return;
    }
    if (form.new_password1.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      // 🛠️ FIX: Connect to the real Django password change endpoint
      const res = await fetch(`${API_BASE_URL}/api/accounts/auth/password/change/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        toast.success('Password updated successfully');
        setForm({ old_password: '', new_password1: '', new_password2: '' });
      } else {
        const err = await res.json();
        toast.error(Object.values(err).flat().join(", ") || "Failed to update password");
      }
    } catch { 
      toast.error('Network error. Please try again.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const PasswordField = ({ label, field, showKey }) => (
    <div className="mb-4">
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? "text" : "password"}
          className={`${inputCls} pr-12`}
          value={form[field]}
          onChange={set(field)}
          required
        />
        <button
          type="button"
          onClick={() => setShow(p => ({ ...p, [showKey]: !p[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A6754D] hover:text-[#4E3B2C] transition"
        >
          {show[showKey] ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 p-4 bg-[#FAF6F0] border border-[#DCC7AA] rounded-xl text-sm text-[#7C6652] flex gap-3">
        <ShieldCheck size={20} className="text-[#A6754D] flex-shrink-0" />
        <span>For security, use a strong password with at least 8 characters including numbers and symbols.</span>
      </div>
      
      <PasswordField label="Current Password" field="old_password" showKey="old" />
      <PasswordField label="New Password" field="new_password1" showKey="new1" />
      <PasswordField label="Confirm New Password" field="new_password2" showKey="new2" />
      
      <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B] disabled:opacity-60 transition shadow-md mt-2" disabled={loading}>
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const refetchUser = async () => {
    try {
      const { data } = await authService.me();
      setUser(data);
    } catch (err) {
      console.error("Failed to refresh user", err);
    }
  };

  return (
    <div className="bg-[#F4EDE4] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#4E3B2C]">Account Settings</h1>
          <p className="text-sm text-[#7C6652] mt-1">Manage your profile and security preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Sidebar Navigation */}
          <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-3 h-fit">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors mb-1 ${
                    active 
                      ? 'bg-[#FAF6F0] text-[#A6754D]' 
                      : 'text-[#7C6652] hover:bg-gray-50'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm overflow-hidden">
              
              <div className="px-6 py-4 border-b border-[#DCC7AA] bg-[#FAF6F0]">
                <h3 className="font-bold text-[#4E3B2C]">{TABS.find(t => t.id === activeTab)?.label}</h3>
              </div>

              <div className="p-6 md:p-8">
                {activeTab === 'profile' && <ProfileTab user={user} onSaved={refetchUser} />}
                {activeTab === 'password' && <PasswordTab />}
                
                {activeTab === 'personalization' && (
                  <div className="text-center py-12">
                    <Palette size={48} className="mx-auto text-[#DCC7AA] mb-4" />
                    <h3 className="text-lg font-bold text-[#4E3B2C] mb-2">Coming Soon</h3>
                    <p className="text-sm text-[#7C6652] max-w-sm mx-auto">
                      Theme color pickers, custom fonts, and display preferences will be available in a future update.
                    </p>
                  </div>
                )}

                {activeTab === 'homepage' && (
                  <div className="text-center py-12">
                    <Layout size={48} className="mx-auto text-[#DCC7AA] mb-4" />
                    <h3 className="text-lg font-bold text-[#4E3B2C] mb-2">Coming Soon</h3>
                    <p className="text-sm text-[#7C6652] max-w-sm mx-auto">
                      Drag-and-drop homepage editor to customize your storefront layout.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}