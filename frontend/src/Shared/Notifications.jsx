/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Activity, CheckCheck, Clock, User } from 'lucide-react';
import { notificationService } from '../services';
import { useNotifications } from '../context/NotificationContext';
import { StatusBadge, LoadingState, EmptyState } from '../components/common';
import toast from 'react-hot-toast';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const { setUnreadCount } = useNotifications();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'notifications') {
        const { data } = await notificationService.list();
        const list = data.results || data || [];
        setNotifications(Array.isArray(list) ? list : []);
      } else {
        const { data } = await notificationService.activityLogs();
        const list = data.results || data || [];
        setLogs(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data');
      setNotifications([]);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const markOneRead = async (n) => {
    if (n.is_read) return;
    try {
      await notificationService.markRead(n.id);
      setNotifications(prev =>
        prev.map(item => item.id === n.id ? { ...item, is_read: true } : item)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  // 🛠️ FIX: Use Nairobi status colors instead of generic CSS variables
  const typeColor = {
    info: '#1a6fa8',
    success: '#2d7a4a',
    warning: '#b87a10',
    error: '#c0392b'
  };

  return (
    <div className="bg-[#F4EDE4] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#4E3B2C]">Notifications & Activity</h1>
            <p className="text-sm text-[#7C6652] mt-1">Stay updated on your store's latest events.</p>
          </div>
          {activeTab === 'notifications' && notifications.length > 0 && (
            <button 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white border border-[#DCC7AA] text-[#4E3B2C] hover:bg-[#FAF6F0] transition shadow-sm"
              onClick={markAllRead}
            >
              <CheckCheck size={16} className="text-[#A6754D]" /> Mark All Read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === 'notifications' 
                ? 'bg-[#A6754D] text-white shadow-md' 
                : 'bg-white text-[#7C6652] border border-[#DCC7AA] hover:bg-[#FAF6F0]'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={16} /> Notifications
          </button>
          <button
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === 'activity' 
                ? 'bg-[#A6754D] text-white shadow-md' 
                : 'bg-white text-[#7C6652] border border-[#DCC7AA] hover:bg-[#FAF6F0]'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            <Activity size={16} /> Activity Log
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center"><LoadingState /></div>
          ) : activeTab === 'notifications' ? (
            notifications.length === 0 ? (
              <div className="py-16 text-center">
                <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markOneRead(n)}
                    className={`flex gap-4 p-5 transition-all ${
                      n.is_read 
                        ? 'bg-white opacity-70' 
                        : 'bg-[#FAF6F0] cursor-pointer hover:bg-[#F4EDE4]'
                    }`}
                    title={n.is_read ? '' : 'Click to mark as read'}
                  >
                    {/* Status Dot */}
                    <div 
                      className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" 
                      style={{ background: typeColor[n.notification_type] || '#1a6fa8' }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="font-bold text-[#4E3B2C] text-sm">{n.title}</div>
                        {!n.is_read && (
                          <span className="text-[10px] font-bold bg-[#A6754D] text-white rounded-full px-2 py-0.5 flex-shrink-0 uppercase tracking-wider">
                            New
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-[#7C6652] mt-1 leading-relaxed">
                        {n.message}
                      </div>
                      
                      <div className="text-xs text-[#B5A090] mt-2 flex items-center gap-1.5 font-medium">
                        <Clock size={12} />
                        {/* 🛠️ FIX: Use Kenyan locale for date formatting */}
                        {new Date(n.created_at).toLocaleString("en-KE", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            logs.length === 0 ? (
              <div className="py-16 text-center">
                <EmptyState icon={Activity} title="No activity logs" description="Actions taken by staff will appear here." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#FAF6F0] border-b border-[#DCC7AA] text-[#7C6652] uppercase text-xs font-bold">
                    <tr>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Action</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#FAF6F0] border border-[#DCC7AA] flex items-center justify-center text-[#A6754D]">
                              <User size={12} />
                            </div>
                            <span className="font-bold text-[#4E3B2C]">{log.user_name || 'System'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={log.action} />
                        </td>
                        <td className="px-5 py-4 text-[#7C6652] max-w-xs truncate" title={log.description}>
                          {log.description}
                        </td>
                        <td className="px-5 py-4 text-xs text-[#B5A090] font-medium">
                          {new Date(log.created_at).toLocaleString("en-KE", {
                            day: "numeric", month: "short",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}