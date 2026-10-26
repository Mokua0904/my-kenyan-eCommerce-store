import React, { useState, useEffect, useCallback } from 'react';
import { Star, Check, X, Trash2, RefreshCw, User as UserIcon, Package } from 'lucide-react';
import { reviewService } from '../services';
import { StatusBadge, LoadingState, Pagination, EmptyState } from '../components/common';
import toast from 'react-hot-toast';

export function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await reviewService.list(params);
      setReviews(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch { 
      toast.error('Failed to load reviews'); 
      setReviews([]);
    }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const approve = async (id) => {
    try {
      await reviewService.approve(id);
      toast.success('Review approved');
      fetchReviews();
    } catch {
      toast.error('Failed to approve review');
    }
  };

  const reject = async (id) => {
    try {
      await reviewService.reject(id);
      toast.success('Review rejected');
      fetchReviews();
    } catch {
      toast.error('Failed to reject review');
    }
  };

  // 🛠️ FIX: Use the Nairobi brand orange for stars
  const stars = (n) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={14} fill={i < n ? '#A6754D' : 'none'} color={i < n ? '#A6754D' : '#DCC7AA'} />
  ));

  const filterTabs = [
    { key: 'pending', label: 'Pending', color: '#b87a10' },
    { key: 'approved', label: 'Approved', color: '#2d7a4a' },
    { key: 'rejected', label: 'Rejected', color: '#c0392b' },
    { key: '', label: 'All Reviews', color: '#4E3B2C' },
  ];

  return (
    <div className="bg-[#F4EDE4] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#4E3B2C]">Review Moderation</h1>
            <p className="text-sm text-[#7C6652] mt-1">Approve or reject customer reviews before they go live.</p>
          </div>
          <button 
            onClick={fetchReviews} 
            className="p-2.5 bg-white border border-[#DCC7AA] rounded-xl text-[#4E3B2C] hover:bg-[#FAF6F0] transition" 
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm overflow-hidden">
          
          {/* Filter Tabs */}
          <div className="p-4 border-b border-[#DCC7AA] bg-[#FAF6F0] flex gap-2 flex-wrap">
            {filterTabs.map(({ key, label }) => (
              <button
                key={key || 'all'}
                onClick={() => { setStatusFilter(key); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                  statusFilter === key
                    ? 'bg-[#A6754D] text-white shadow-md'
                    : 'bg-white text-[#7C6652] border border-[#DCC7AA] hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><LoadingState /></div>
          ) : reviews.length === 0 ? (
            <div className="py-16 text-center">
              <EmptyState 
                icon={Star} 
                title="No reviews found" 
                description={statusFilter ? `There are no ${statusFilter} reviews.` : "No reviews have been submitted yet."} 
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-[#7C6652] uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Review</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reviews.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition">
                      {/* User */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#DCC7AA] flex items-center justify-center text-[#A6754D]">
                            <UserIcon size={14} />
                          </div>
                          <span className="font-bold text-[#4E3B2C]">{r.user_name || 'Anonymous'}</span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-[#7C6652]">
                          <Package size={14} className="text-[#A6754D] flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{r.product_name}</span>
                        </div>
                      </td>

                      {/* Stars */}
                      <td className="px-4 py-4">
                        <div className="flex gap-0.5">{stars(r.rating)}</div>
                      </td>

                      {/* Review */}
                      <td className="px-4 py-4 max-w-xs">
                        {r.title && <div className="font-bold text-[#4E3B2C] text-sm mb-1">{r.title}</div>}
                        <div className="text-xs text-[#7C6652] line-clamp-2">{r.body}</div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <StatusBadge status={r.status} />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-xs text-[#7C6652] font-medium">
                        {new Date(r.created_at).toLocaleDateString("en-KE", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex gap-2 justify-end">
                          {r.status !== 'approved' && (
                            <button 
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition text-xs font-bold"
                              onClick={() => approve(r.id)}
                            >
                              <Check size={12} /> Approve
                            </button>
                          )}
                          {r.status !== 'rejected' && (
                            <button 
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition text-xs font-bold"
                              onClick={() => reject(r.id)}
                            >
                              <X size={12} /> Reject
                            </button>
                          )}
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
    </div>
  );
}