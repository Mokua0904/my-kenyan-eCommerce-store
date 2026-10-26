import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/Authcontext';
import { Store, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);

      // 🛠️ SECURITY FIX: Check the role
      if (!['admin', 'editor'].includes(data?.user?.role)) {
        // If they aren't an admin, clear their token immediately so they can't browse the API
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        
        toast.error('Access denied. You do not have admin privileges.');
        return;
      }

      toast.success('Welcome back, Admin');
      navigate('/admin/dashboard');  
    } catch (err) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#4E3B2C] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#A6754D] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#8D5F3B] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="bg-white rounded-2xl p-8 sm:p-10 w-full max-w-md shadow-2xl relative z-10 border border-[#DCC7AA]">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FAF6F0] border border-[#DCC7AA] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Store size={32} className="text-[#A6754D]" />
          </div>
          <h1 className="text-2xl font-bold text-[#4E3B2C]">Nairobi Fashion</h1>
          <p className="text-sm text-[#7C6652] mt-1 flex items-center justify-center gap-1">
            <ShieldCheck size={14} /> Admin Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-[#4E3B2C] mb-1.5">Email Address</label>
            <input
              type="email"
              className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-3 text-[#4E3B2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A6754D]/30 focus:border-[#A6754D] transition"
              placeholder="admin@nairobiFashion.co.ke"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-[#4E3B2C] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-3 pr-12 text-[#4E3B2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A6754D]/30 focus:border-[#A6754D] transition"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A6754D] hover:text-[#4E3B2C] transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#A6754D] hover:bg-[#8D5F3B] text-white py-3.5 rounded-lg font-bold text-md transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Authenticating...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-center text-xs text-[#7C6652] mt-8">
          This is a restricted area. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}