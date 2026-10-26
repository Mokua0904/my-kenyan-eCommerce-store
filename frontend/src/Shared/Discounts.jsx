/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Star, Check, X, Trash2, Tag, Bell, Activity, Plus, RefreshCw, Pencil } from 'lucide-react';
import { reviewService, discountService, notificationService } from '../services';
import { StatusBadge, LoadingState, Pagination, Modal, ConfirmModal, EmptyState } from '../components/common';
import toast from 'react-hot-toast';

// 🇰🇪 KES Formatter
const kes = (v) => `KES ${parseFloat(v || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

function DiscountForm({ initial, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(initial || {
    code: '', description: '', discount_type: 'percentage',
    value: '', min_order_amount: '0', max_uses: '',
    status: 'active', valid_from: '', valid_until: '',
  });
  const set = (f) => (e) => setForm(form => ({ ...form, [f]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold text-[#4E3B2C] mb-1.5">Coupon Code</label>
          <input className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-sm text-[#4E3B2C] font-mono font-bold uppercase" value={form.code} onChange={set('code')} required placeholder="SUMMER20" />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#4E3B2C] mb-1.5">Discount Type</label>
          <select className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-sm text-[#4E3B2C]" value={form.discount_type} onChange={set('discount_type')}>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (KES)</option> {/* 🛠️ Changed from $ to KES */}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold text-[#4E3B2C] mb-1.5">Value</label>
          <input type="number" step="0.01" className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-sm text-[#4E3B2C]" value={form.value} onChange={set('value')} required />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#4E3B2C] mb-1.5">Min Order Amount (KES)</label>
          <input type="number" step="0.01" className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-sm text-[#4E3B2C]" value={form.min_order_amount} onChange={set('min_order_amount')} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold text-[#4E3B2C] mb-1.5">Max Uses (empty = unlimited)</label>
          <input type="number" className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-sm text-[#4E3B2C]" value={form.max_uses} onChange={set('max_uses')} />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#4E3B2C] mb-1.5">Status</label>
          <select className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-sm text-[#4E3B2C]" value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold text-[#4E3B2C] mb-1.5">Valid From</label>
          <input type="datetime-local" className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-sm text-[#4E3B2C]" value={form.valid_from} onChange={set('valid_from')} />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#4E3B2C] mb-1.5">Valid Until</label>
          <input type="datetime-local" className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-sm text-[#4E3B2C]" value={form.valid_until} onChange={set('valid_until')} />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-[#4E3B2C] mb-1.5">Description</label>
        <textarea className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-sm text-[#4E3B2C] resize-none" value={form.description} onChange={set('description')} rows={2} />
      </div>

      <div className="flex gap-3 justify-end mt-6">
        <button type="button" className="px-4 py-2 rounded-lg font-bold text-[#7C6652] border border-[#DCC7AA] bg-white hover:bg-gray-50" onClick={onClose}>Cancel</button>
        <button type="submit" className="px-6 py-2 rounded-lg font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B] disabled:opacity-60" disabled={loading}>
          {loading ? 'Saving...' : (initial ? 'Update' : 'Create Discount')}
        </button>
      </div>
    </form>
  );
}

export function DiscountsPage() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDiscount, setEditDiscount] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await discountService.list({ page, page_size: 15 });
      setDiscounts(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch { 
      toast.error('Failed to load discounts'); 
      setDiscounts([]);
    }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await discountService.create(form);
      toast.success('Discount created');
      setModalOpen(false);
      fetchDiscounts();
    } catch { toast.error('Error creating discount'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      await discountService.update(editDiscount.id, form);
      toast.success('Discount updated');
      setEditDiscount(null);
      fetchDiscounts();
    } catch { toast.error('Error updating discount'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await discountService.delete(deleteTarget.id);
      toast.success('Discount deleted');
      setDeleteTarget(null);
      fetchDiscounts();
    } catch { toast.error('Error deleting discount'); }
  };

  return (
    <div className="bg-[#F4EDE4] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#4E3B2C]">Discounts & Coupons</h1>
            <p className="text-sm text-[#7C6652] mt-1">Create and manage promotional codes for your customers.</p>
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B] transition shadow-md" onClick={() => setModalOpen(true)}>
            <Plus size={18} /> Add Discount
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center"><LoadingState /></div>
          ) : discounts.length === 0 ? (
            <div className="py-16 text-center">
              <EmptyState 
                icon={Tag} 
                title="No discounts yet" 
                description="Create your first discount code to start attracting customers." 
                action={<button className="px-4 py-2 rounded-lg font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B] mt-4" onClick={() => setModalOpen(true)}>Add Discount</button>} 
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#FAF6F0] border-b border-[#DCC7AA] text-[#7C6652] uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Uses</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Valid Until</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {discounts.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-[#4E3B2C]">{d.code}</div>
                        {d.description && <div className="text-xs text-[#7C6652] mt-0.5">{d.description}</div>}
                      </td>
                      <td className="px-4 py-3 capitalize text-[#7C6652] font-medium">{d.discount_type}</td>
                      <td className="px-4 py-3 font-bold text-[#4E3B2C]">
                        {/* 🛠️ FIX: Conditional KES formatting */}
                        {d.discount_type === 'percentage' ? `${d.value}%` : kes(d.value)}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#4E3B2C]">{d.uses_count}{d.max_uses ? ` / ${d.max_uses}` : ''}</td>
                      <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                      <td className="px-4 py-3 text-xs text-[#7C6652] font-medium">
                        {d.valid_until ? new Date(d.valid_until).toLocaleDateString("en-KE") : 'No expiry'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button className="p-2 rounded-lg border border-[#DCC7AA] text-[#7C6652] hover:bg-[#FAF6F0] transition" onClick={() => setEditDiscount(d)}><Pencil size={14} /></button>
                          <button className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition" onClick={() => setDeleteTarget(d)}><Trash2 size={14} /></button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Discount">
        <DiscountForm onSubmit={handleCreate} onClose={() => setModalOpen(false)} loading={saving} />
      </Modal>
      
      <Modal open={!!editDiscount} onClose={() => setEditDiscount(null)} title="Edit Discount">
        {editDiscount && <DiscountForm initial={editDiscount} onSubmit={handleUpdate} onClose={() => setEditDiscount(null)} loading={saving} />}
      </Modal>
      
      <ConfirmModal open={!!deleteTarget} title="Delete Discount"
        message={`Delete discount "${deleteTarget?.code}"? This cannot be undone.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} danger />
    </div>
  );
}