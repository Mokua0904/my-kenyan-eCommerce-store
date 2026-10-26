import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, Pencil, Trash2, Clock, Users, ShieldCheck } from 'lucide-react';
import { userService } from '../../services';
import { StatusBadge, LoadingState, ConfirmModal, Pagination, Modal, EmptyState } from '../../components/common';
import toast from 'react-hot-toast';

const ROLES = ['', 'admin', 'editor', 'customer'];
const STATUSES = ['', 'active', 'inactive', 'pending', 'banned'];

const inputCls = "w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]/30 focus:border-[#A6754D] transition";
const labelCls = "block text-sm font-bold text-[#4E3B2C] mb-1.5";

function UserForm({ initial, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(initial || {
    email: '', first_name: '', last_name: '',
    role: 'customer', status: 'active', phone: '', address: '',
    password: '', confirm_password: ''
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!initial && form.password !== form.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls}>First Name</label>
          <input className={inputCls} value={form.first_name} onChange={set('first_name')} required />
        </div>
        <div>
          <label className={labelCls}>Last Name</label>
          <input className={inputCls} value={form.last_name} onChange={set('last_name')} required />
        </div>
      </div>
      <div className="mb-4">
        <label className={labelCls}>Email</label>
        <input type="email" className={inputCls} value={form.email} onChange={set('email')} required disabled={!!initial} />
        {initial && <p className="text-xs text-[#7C6652] mt-1">Email cannot be changed.</p>}
      </div>
      
      {!initial && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls}>Password</label>
            <input type="password" className={inputCls} value={form.password} onChange={set('password')} required />
          </div>
          <div>
            <label className={labelCls}>Confirm Password</label>
            <input type="password" className={inputCls} value={form.confirm_password} onChange={set('confirm_password')} required />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls}>Role</label>
          <select className={inputCls} value={form.role} onChange={set('role')}>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="customer">Customer</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select className={inputCls} value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className={labelCls}>Phone</label>
        <input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="+254 7XX XXX XXX" />
      </div>
      <div className="mb-6">
        <label className={labelCls}>Address</label>
        <textarea className={`${inputCls} resize-none`} value={form.address} onChange={set('address')} rows={2} placeholder="e.g., Bazaar Plaza, Nairobi CBD" />
      </div>

      <div className="flex gap-3 justify-end mt-6">
        <button type="button" className="px-4 py-2 rounded-lg font-bold text-[#7C6652] border border-[#DCC7AA] bg-white hover:bg-gray-50" onClick={onClose}>Cancel</button>
        <button type="submit" className="px-6 py-2 rounded-lg font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B] disabled:opacity-60" disabled={loading}>
          {loading ? 'Saving...' : (initial ? 'Update User' : 'Create User')}
        </button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await userService.list(params);
      setUsers(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch {
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    userService.stats().then(r => setStats(r.data || {})).catch(() => {});
    userService.recentActivity().then(r => setActivity(r.data?.results || r.data || [])).catch(() => {});
  }, []);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await userService.create(form);
      toast.success('User created');
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      const msg = Object.values(err.response?.data || {}).flat().join(', ') || 'Error creating user';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      await userService.update(editUser.id, form);
      toast.success('User updated');
      setEditUser(null);
      fetchUsers();
    } catch {
      toast.error('Error updating user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await userService.delete(deleteTarget.id);
      toast.success('User deleted');
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error('Error deleting user');
    }
  };

  const formatTime = (dt) => {
    if (!dt) return 'Never';
    const d = new Date(dt);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const n = (val) => Number(val) || 0;

  return (
    <div className="bg-[#F4EDE4] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#4E3B2C]">User Management</h1>
            <p className="text-sm text-[#7C6652] mt-1">Manage your staff and customer accounts</p>
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B] transition shadow-md" onClick={() => setModalOpen(true)}>
            <UserPlus size={18} /> Add New User
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-[#DCC7AA] p-4 shadow-sm">
                <div className="w-8 h-8 bg-[#FAF6F0] rounded-lg flex items-center justify-center mb-2"><Users size={16} className="text-[#A6754D]" /></div>
                <div className="text-2xl font-bold text-[#4E3B2C]">{n(stats.total_users).toLocaleString()}</div>
                <div className="text-xs text-[#7C6652] font-medium">Total Users</div>
              </div>
              <div className="bg-white rounded-xl border border-[#DCC7AA] p-4 shadow-sm">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mb-2"><ShieldCheck size={16} className="text-green-600" /></div>
                <div className="text-2xl font-bold text-[#4E3B2C]">{n(stats.active_users).toLocaleString()}</div>
                <div className="text-xs text-[#7C6652] font-medium">Active Users</div>
              </div>
              <div className="bg-white rounded-xl border border-[#DCC7AA] p-4 shadow-sm">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-2"><UserPlus size={16} className="text-blue-600" /></div>
                <div className="text-2xl font-bold text-[#4E3B2C]">{n(stats.new_today)}</div>
                <div className="text-xs text-[#7C6652] font-medium">New Today</div>
              </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm overflow-hidden">
              
              {/* Filters */}
              <div className="p-4 border-b border-[#DCC7AA] bg-[#FAF6F0] flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A6754D]" size={16} />
                  <input type="text" placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2 bg-white border border-[#DCC7AA] rounded-lg text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]" />
                </div>
                <select className="bg-white border border-[#DCC7AA] rounded-lg px-3 py-2 text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
                  <option value="">All Roles</option>
                  {ROLES.filter(Boolean).map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
                <select className="bg-white border border-[#DCC7AA] rounded-lg px-3 py-2 text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                  <option value="">All Status</option>
                  {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>

              {loading ? (
                <div className="py-20 flex justify-center"><LoadingState /></div>
              ) : users.length === 0 ? (
                <div className="py-16 text-center"><EmptyState icon={Users} title="No users found" description="Try adjusting your filters" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-[#7C6652] uppercase text-xs font-bold">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#A6754D]/10 flex items-center justify-center text-[#A6754D] font-bold text-xs flex-shrink-0">
                                {user.full_name?.[0] || user.email?.[0] || "?"}
                              </div>
                              <span className="font-bold text-[#4E3B2C]">{user.full_name || "No Name"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#7C6652]">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className="capitalize text-xs font-bold text-[#4E3B2C] bg-[#FAF6F0] border border-[#DCC7AA] px-2 py-1 rounded-md">{user.role}</span>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={(user.status ?? 'inactive').toLowerCase()} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 justify-end">
                              <button className="p-2 rounded-lg border border-[#DCC7AA] text-[#7C6652] hover:bg-[#FAF6F0] transition" onClick={() => setEditUser(user)}>
                                <Pencil size={14} />
                              </button>
                              <button className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition" onClick={() => setDeleteTarget(user)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="p-4 border-t border-[#DCC7AA] bg-[#FAF6F0]">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-5">
              <h3 className="font-bold text-[#4E3B2C] mb-4 pb-2 border-b border-gray-100">Recent Activity</h3>
              {activity.length === 0 ? (
                <div className="text-sm text-[#7C6652] text-center py-4">No recent activity</div>
              ) : (
                <div className="space-y-4">
                  {activity.slice(0, 6).map(log => (
                    <div key={log.id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#FAF6F0] border border-[#DCC7AA] flex items-center justify-center text-[#A6754D] text-xs font-bold flex-shrink-0">
                        {log.user_name?.[0] || 'S'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#4E3B2C] leading-tight">{log.description}</div>
                        <div className="text-[10px] text-[#7C6652] mt-1">{formatTime(log.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-5">
              <h3 className="font-bold text-[#4E3B2C] mb-4 pb-2 border-b border-gray-100">Quick Stats</h3>
              <div className="space-y-4">
                {[
                  { icon: Users, label: 'Total Users', value: n(stats.total_users) },
                  { icon: UserPlus, label: 'New Today', value: n(stats.new_today) },
                  { icon: Clock, label: 'Active Sessions', value: n(stats.active_users) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#DCC7AA] flex items-center justify-center text-[#A6754D]">
                      <Icon size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#4E3B2C]">{value.toLocaleString()}</div>
                      <div className="text-xs text-[#7C6652]">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New User">
        <UserForm onSubmit={handleCreate} onClose={() => setModalOpen(false)} loading={saving} />
      </Modal>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && <UserForm initial={editUser} onSubmit={handleUpdate} onClose={() => setEditUser(null)} loading={saving} />}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.full_name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}