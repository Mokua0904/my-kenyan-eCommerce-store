import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Tag, Upload, X, RefreshCw } from 'lucide-react';
import { productService } from '../../services';
import { LoadingState, EmptyState, ConfirmModal, Modal } from '../../components/common';
import toast from 'react-hot-toast';

// 🛠️ SAFE API URL
const API_URL = 
  import.meta.env?.VITE_API_URL || 
  process.env?.REACT_APP_API_URL || 
  'http://localhost:8000';

const getImageUrl = (path) => {
  if (!path) return null;
  if (typeof path !== 'string') return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/media')) return `${API_URL}${path}`;
  return `${API_URL}/media/${path}`;
};

const GENDER_CHOICES = [
  { value: 'M', label: 'Men' },
  { value: 'W', label: 'Women' },
  { value: 'U', label: 'Unisex' },
];

function CategoryForm({ initial, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name || '',
    gender: initial.gender || 'U',
    description: initial.description || '',
    is_active: initial.is_active ?? true,
  } : { name: '', gender: 'U', description: '', is_active: true });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(getImageUrl(initial?.image));

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const slug = form.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    onSubmit({ ...form, slug }, imageFile);
  };

  const inputCls = "w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]/30 focus:border-[#A6754D] transition";
  const labelCls = "block text-sm font-bold text-[#4E3B2C] mb-1.5";

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className={labelCls}>Category Name *</label>
        <input className={inputCls} value={form.name} onChange={set('name')} placeholder="e.g. Shirts" required />
      </div>

      <div className="mb-4">
        <label className={labelCls}>Gender</label>
        <select className={inputCls} value={form.gender} onChange={set('gender')}>
          {GENDER_CHOICES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <label className={labelCls}>Description</label>
        <textarea className={`${inputCls} resize-none`} value={form.description} onChange={set('description')} rows={3} placeholder="Optional description..." />
      </div>

      {/* Category Image */}
      <div className="mb-4">
        <label className={labelCls}>Category Image</label>
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer min-h-[110px] transition ${imageFile ? 'border-[#A6754D] bg-[#FAF6F0]' : 'border-[#DCC7AA] bg-gray-50 hover:bg-gray-100'}`}>
          {imagePreview ? (
            <img src={imagePreview} alt="preview" className="max-h-[80px] rounded-lg object-cover" onError={() => setImagePreview(null)} />
          ) : (
            <>
              <Upload size={22} className="text-[#A6754D] mb-2" />
              <span className="text-xs text-[#7C6652] text-center font-medium">Click to upload category image</span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </label>
        {imagePreview && (
          <button type="button" className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-red-500 hover:text-red-600 font-bold py-1" onClick={() => { setImagePreview(null); setImageFile(null); }}>
            <X size={12} /> Remove image
          </button>
        )}
      </div>

      {/* Toggle Status */}
      <div className="mb-6">
        <label className={labelCls}>Status</label>
        <div className="flex items-center gap-3 mt-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A6754D]"></div>
          </label>
          <span className="text-sm font-medium text-[#4E3B2C]">
            {form.is_active ? 'Active (visible in store)' : 'Inactive (hidden from store)'}
          </span>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6">
        <button type="button" className="px-4 py-2 rounded-lg font-bold text-[#7C6652] border border-[#DCC7AA] bg-white hover:bg-gray-50" onClick={onClose}>Cancel</button>
        <button type="submit" className="px-6 py-2 rounded-lg font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B] disabled:opacity-60" disabled={loading}>
          {loading ? 'Saving...' : initial ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}

const GENDER_LABEL = { M: 'Men', W: 'Women', U: 'Unisex' };

export default function ProductCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const r = await productService.categories();
      setCategories(r.data.results || r.data || []);
    } catch {
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const buildFormData = (data, imageFile) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      fd.append(k, typeof v === 'boolean' ? String(v) : v);
    });
    if (imageFile) fd.append('image', imageFile);
    return fd;
  };

  const handleCreate = async (data, imageFile) => {
    setSaving(true);
    try {
      const fd = buildFormData(data, imageFile);
      await productService.createCategory(fd);
      toast.success('Category created');
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : 'Error creating category';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data, imageFile) => {
    setSaving(true);
    try {
      const fd = buildFormData(data, imageFile);
      await productService.updateCategory(editCategory.id, fd);
      toast.success('Category updated');
      setEditCategory(null);
      fetchCategories();
    } catch {
      toast.error('Error updating category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await productService.deleteCategory(deleteTarget.id);
      toast.success('Category deleted');
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      toast.error('Error deleting category');
    }
  };

  return (
    <div className="bg-[#F4EDE4] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#4E3B2C]">Product Categories</h1>
            <p className="text-sm text-[#7C6652] mt-1">
              {categories.length} {categories.length === 1 ? 'category' : 'categories'} in your store
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button onClick={fetchCategories} className="p-2.5 bg-white border border-[#DCC7AA] rounded-xl text-[#4E3B2C] hover:bg-[#FAF6F0] transition" title="Refresh">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B] transition shadow-md" onClick={() => setModalOpen(true)}>
              <Plus size={18} /> Add Category
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center"><LoadingState /></div>
          ) : categories.length === 0 ? (
            <div className="py-20 text-center">
              <EmptyState
                icon={Tag}
                title="No categories yet"
                description="Create your first category to organise products"
                action={<button className="px-4 py-2 rounded-lg font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B]" onClick={() => setModalOpen(true)}>Add Category</button>}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#FAF6F0] border-b border-[#DCC7AA] text-[#7C6652] uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Gender</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Products</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map(cat => {
                    const imgUrl = getImageUrl(cat.image);
                    return (
                      <tr key={cat.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#FAF6F0] border border-[#DCC7AA] flex items-center justify-center overflow-hidden flex-shrink-0">
                              {imgUrl ? <img src={imgUrl} alt={cat.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} /> : <Tag size={15} className="text-[#A6754D]" />}
                            </div>
                            <span className="font-bold text-[#4E3B2C]">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {imgUrl ? <img src={imgUrl} alt={cat.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" onError={e => { e.target.style.display = 'none'; }} /> : <span className="text-xs text-[#7C6652]">No image</span>}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[#7C6652]">{cat.slug}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAF6F0] text-[#A6754D] border border-[#DCC7AA]">
                            {GENDER_LABEL[cat.gender] || cat.gender}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {cat.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#4E3B2C]">{cat.products_count ?? cat.product_count ?? '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-end">
                            <button className="p-2 rounded-lg border border-[#DCC7AA] text-[#7C6652] hover:bg-[#FAF6F0] transition" onClick={() => setEditCategory(cat)} title="Edit">
                              <Pencil size={14} />
                            </button>
                            <button className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition" onClick={() => setDeleteTarget(cat)} title="Delete">
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
        </div>
      </div>

      {/* Modals */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Category">
        <CategoryForm onSubmit={handleCreate} onClose={() => setModalOpen(false)} loading={saving} />
      </Modal>

      <Modal open={!!editCategory} onClose={() => setEditCategory(null)} title="Edit Category">
        {editCategory && <CategoryForm initial={editCategory} onSubmit={handleUpdate} onClose={() => setEditCategory(null)} loading={saving} />}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? Products in this category may be affected.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}