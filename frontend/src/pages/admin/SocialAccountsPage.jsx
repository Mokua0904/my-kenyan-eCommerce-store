import React, { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, ExternalLink, ShieldAlert } from 'lucide-react';
import { LoadingState, EmptyState, Pagination, ConfirmModal } from '../../components/common';
import toast from 'react-hot-toast';
import api from '../../services/api';

const API_URL = 
  import.meta.env?.VITE_API_URL || 
  process.env?.REACT_APP_API_URL || 
  'http://localhost:8000';

const PROVIDER_STYLE = {
  google:   { bg: '#fce8e6', color: '#c5221f', label: 'Google' },
  facebook: { bg: '#e7f0ff', color: '#1877f2', label: 'Facebook' },
  twitter:  { bg: '#e8f5fe', color: '#1da1f2', label: 'Twitter' },
  github:   { bg: '#f0f0f0', color: '#24292e', label: 'GitHub' },
};

const providerStyle = (p) =>
  PROVIDER_STYLE[p?.toLowerCase()] || { bg: 'var(--surface-2)', color: 'var(--text-primary)', label: p };

function ProviderBadge({ provider }) {
  const s = providerStyle(provider);
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

const socialAccountService = {
  list: (params) => api.get('/api/admin/social-accounts/', { params }),
  delete: (id)   => api.delete(`/api/admin/social-accounts/${id}/`),
};

export default function SocialAccountsPage() {
  const [accounts,     setAccounts]    = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [search,       setSearch]      = useState('');
  const [provider,     setProvider]    = useState('');
  const [page,         setPage]        = useState(1);
  const [totalPages,   setTotalPages]  = useState(1);
  const [totalCount,   setTotalCount]  = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 15 };
      if (search)   params.search   = search;
      if (provider) params.provider = provider;
      const { data } = await socialAccountService.list(params);
      setAccounts(data.results || data || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.count       || 0);
    } catch {
      toast.error('Failed to load social accounts');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, provider]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleDelete = async () => {
    try {
      await socialAccountService.delete(deleteTarget.id);
      toast.success('Social account disconnected');
      setDeleteTarget(null);
      fetchAccounts();
    } catch {
      toast.error('Error disconnecting account');
    }
  };

  const formatDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-[#F4EDE4] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#4E3B2C]">Social Accounts</h1>
          <p className="text-sm text-[#7C6652] mt-1">
            Users who signed in via Google, Facebook, or other OAuth providers
            {totalCount > 0 && ` · ${totalCount} total`}
          </p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl mb-6 bg-[#FAF6F0] border border-[#DCC7AA] text-sm text-[#7C6652]">
          <ShieldAlert size={20} className="text-[#A6754D] flex-shrink-0" />
          <div>
            These accounts are managed by <strong>django-allauth</strong>. You can view and disconnect them here. Disconnecting removes the OAuth link — the user's account itself is not deleted. To manage individual users, visit the <a href="/admin/users" className="text-[#A6754D] font-semibold underline">Users page</a>.
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm overflow-hidden">
          
          {/* Filters */}
          <div className="p-4 border-b border-[#DCC7AA] bg-[#FAF6F0] flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A6754D]" size={16} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#DCC7AA] rounded-lg text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]"
              />
            </div>
            <select
              className="bg-white border border-[#DCC7AA] rounded-lg px-3 py-2 text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]"
              value={provider}
              onChange={e => { setProvider(e.target.value); setPage(1); }}
            >
              <option value="">All Providers</option>
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
              <option value="github">GitHub</option>
            </select>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><LoadingState /></div>
          ) : accounts.length === 0 ? (
            <div className="py-16 text-center">
              <EmptyState
                icon={ExternalLink}
                title="No social accounts"
                description={
                  search || provider
                    ? 'No accounts match your filters'
                    : 'No users have signed in via social OAuth yet'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-[#7C6652] uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Connected</th>
                    <th className="px-4 py-3">Last Login</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accounts.map(account => {
                    const avatarUrl = account.extra_data?.picture || account.extra_data?.avatar_url;
                    const userName = 
                      account.user?.full_name ||
                      `${account.user?.first_name || ''} ${account.user?.last_name || ''}`.trim() ||
                      account.extra_data?.name ||
                      '—';

                    return (
                      <tr key={account.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" onError={e => { e.target.style.display = 'none'; }} />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#A6754D]/10 flex items-center justify-center text-[#A6754D] font-bold text-xs">
                                {userName[0]}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-[#4E3B2C] text-sm">{userName}</div>
                              {account.user?.username && (
                                <div className="text-xs text-[#7C6652]">@{account.user.username}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#7C6652] text-sm">
                          {account.user?.email || account.extra_data?.email || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <ProviderBadge provider={account.provider} />
                        </td>
                        <td className="px-4 py-3 text-xs text-[#7C6652] font-medium">
                          {formatDate(account.date_joined || account.created_at)}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#7C6652] font-medium">
                          {formatDate(account.user?.last_login)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                              title="Disconnect social account"
                              onClick={() => setDeleteTarget(account)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-[#DCC7AA] bg-[#FAF6F0]">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>

      {/* Confirm disconnect */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Disconnect Social Account"
        message={`Disconnect the ${deleteTarget?.provider} account for ${deleteTarget?.user?.full_name || deleteTarget?.user?.email || 'this user'}? Their account will remain but they won't be able to log in via ${deleteTarget?.provider} until they reconnect.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}