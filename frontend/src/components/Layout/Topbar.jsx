import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, LogOut, User, Settings, Menu } from 'lucide-react';
import { useAuth } from '../../context/Authcontext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ onMobileMenuClick }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login'); // 🛠️ FIX: Added leading slash
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const initials = user
    ? (user.first_name?.[0] || '') + (user.last_name?.[0] || '') || 'A'
    : 'A';

  return (
    <header className="h-[60px] bg-white border-b border-[#DCC7AA] flex items-center justify-between px-4 gap-3 flex-shrink-0 shadow-sm z-40">
      
      {/* Left: Hamburger + Search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        
        {/* Mobile Hamburger */}
        <button
          className="lg:hidden flex items-center justify-center w-9 h-9 border border-[#DCC7AA] rounded-lg text-[#4E3B2C] hover:bg-[#FAF6F0] transition"
          onClick={onMobileMenuClick}
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md" ref={searchRef}>
          {/* Desktop Search Icon */}
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A6754D] hidden sm:block" />
          
          <input
            type="text"
            className="w-full bg-[#FAF6F0] border border-[#DCC7AA] rounded-lg py-2 pl-9 pr-3 text-sm text-[#4E3B2C] placeholder-[#7C6652] focus:outline-none focus:ring-2 focus:ring-[#A6754D]/30 focus:border-[#A6754D] transition"
            placeholder="Search products, orders, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-[#4E3B2C] hover:bg-[#FAF6F0] transition"
          onClick={() => navigate('/admin/notifications')}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1 border-2 border-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-[#DCC7AA]" />

        {/* User Dropdown */}
        <div className="relative" ref={menuRef}>
          <button 
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#FAF6F0] transition"
            onClick={() => setMenuOpen(o => !o)}
          >
            <div className="w-8 h-8 rounded-full bg-[#A6754D] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#4E3B2C] leading-tight">{user?.first_name || 'Admin'}</p>
              <p className="text-[10px] text-[#7C6652] leading-tight">Administrator</p>
            </div>
            <ChevronDown size={14} className="text-[#7C6652] hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#DCC7AA] rounded-xl shadow-xl z-50 overflow-hidden">
              
              {/* Header */}
              <div className="px-4 py-3 bg-[#FAF6F0] border-b border-[#DCC7AA]">
                <p className="text-sm font-bold text-[#4E3B2C] truncate">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-[#7C6652] truncate mt-0.5">{user?.email}</p>
              </div>

              {/* Links */}
              <div className="p-2">
                <button 
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#4E3B2C] hover:bg-[#FAF6F0] transition"
                  onClick={() => { navigate('/admin/settings'); setMenuOpen(false); }}
                >
                  <User size={15} /> My Profile
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#4E3B2C] hover:bg-[#FAF6F0] transition"
                  onClick={() => { navigate('/admin/settings'); setMenuOpen(false); }}
                >
                  <Settings size={15} /> Settings
                </button>
              </div>

              {/* Logout */}
              <div className="p-2 border-t border-[#DCC7AA]">
                <button 
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition"
                  onClick={handleLogout}
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}