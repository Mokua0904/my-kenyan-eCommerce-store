import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Package, Plus, Search, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services';
import { StatusBadge, LoadingState, Pagination, ConfirmModal, EmptyState } from '../../components/common';
import toast from 'react-hot-toast';

// 🛠️ SAFE API URL
const API_URL = 
  import.meta.env?.VITE_API_URL || 
  process.env?.REACT_APP_API_URL || 
  'http://localhost:8000';

const getImageUrl = (path) => {
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/media')) return `${API_URL}${path}`;
  return `${API_URL}/media/${path}`;
};

const kes = (v) => `KES ${parseFloat(v || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats]           = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 8 };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter === 'active') params.is_active = 'true';
      else if (statusFilter === 'inactive') params.is_active = 'false';
      
      const { data } = await productService.list(params);
      setProducts(data.results || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.count || 0);
    } catch {
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    productService.categories().then(r => setCategories(r.data.results || r.data || [])).catch(() => {});
    productService.stats().then(r => setStats(r.data || {})).catch(() => {});
  }, []);

  const handleDelete = async () => {
    try {
      await productService.delete(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toast.error('Error deleting product');
    }
  };

  const hasFilters = search || statusFilter || categoryFilter;
  const clearFilters = () => { setSearch(''); setStatusFilter(''); setCategoryFilter(''); setPage(1); };

  return (
    <div className="bg-[#F4EDE4] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#4E3B2C]">Product List</h1>
            <p className="text-sm text-[#7C6652] mt-1">{totalCount} products in your store</p>
          </div>
          <button 
            onClick={() => navigate('/admin/products/create')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B] transition shadow-md"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Products', value: Number(stats.total) || 0, color: '#A6754D', bg: '#FAF6F0' },
            { label: 'Active', value: Number(stats.active) || 0, color: '#2d7a4a', bg: '#eafaf1' },
            { label: 'Low Stock', value: Number(stats.low_stock) || 0, color: '#b8860b', bg: '#fef9e7' },
            { label: 'Out of Stock', value: Number(stats.out_of_stock) || 0, color: '#c0392b', bg: '#fdedec' },
          ].map(s => (
            <div className="bg-white rounded-xl border border-[#DCC7AA] p-4 shadow-sm" key={s.label}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: s.bg, color: s.color }}>
                <Package size={16} />
              </div>
              <div className="text-2xl font-bold text-[#4E3B2C]">{s.value}</div>
              <div className="text-xs text-[#7C6652] font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm overflow-hidden">
          
          {/* Filter Bar */}
          <div className="p-4 border-b border-[#DCC7AA] bg-[#FAF6F0] flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A6754D]" size={16} />
              <input 
                type="text"
                placeholder="Search products..." 
                value={search} 
                onChange={e => { setSearch(e.target.value); setPage(1); }} 
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#DCC7AA] rounded-lg text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]" 
              />
            </div>
            
            <select 
              className="bg-white border border-[#DCC7AA] rounded-lg px-3 py-2 text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]"
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select 
              className="bg-white border border-[#DCC7AA] rounded-lg px-3 py-2 text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button onClick={fetchProducts} className="p-2 bg-white border border-[#DCC7AA] rounded-lg text-[#A6754D] hover:bg-gray-50 transition" title="Refresh">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>

            {hasFilters && (
              <button onClick={clearFilters} className="text-sm font-bold text-red-500 hover:text-red-600 px-2">
                Clear
              </button>
            )}
          </div>

          {loading ? <div className="py-20 flex justify-center"><LoadingState /></div> : products.length === 0 ? (
            <div className="py-16 text-center">
              <EmptyState
                icon={Package}
                title="No products found"
                description={hasFilters ? "Try adjusting your filters" : "Add your first product to your store"}
                action={
                  !hasFilters && (
                    <button className="px-4 py-2 rounded-lg font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B] mt-4" onClick={() => navigate('/admin/products/create')}>
                      Add Product
                    </button>
                  )
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-[#7C6652] uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(product => {
                    const imgUrl = getImageUrl(product.images?.[0]?.image || product.image);
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {imgUrl ? (
                              <img src={imgUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" onError={e => { e.target.style.display = 'none'; }} />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#FAF6F0] border border-[#DCC7AA] flex items-center justify-center flex-shrink-0">
                                <Package size={18} className="text-[#A6754D]" />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-[#4E3B2C]">{product.name}</div>
                              <div className="text-xs text-[#7C6652] truncate max-w-[200px]">
                                {product.description || "No description"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#7C6652] font-medium">{product.category_name || '—'}</td>
                        <td className="px-4 py-3 capitalize text-xs font-semibold text-[#A6754D] bg-[#FAF6F0] rounded-md inline-block mt-2">
                          {product.product_type || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-[#4E3B2C] block">{kes(product.current_price ?? product.price)}</span>
                          {product.discount_price && (
                            <span className="text-xs text-gray-400 line-through">{kes(product.price)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${product.stock === 0 ? 'text-red-500' : product.stock <= 10 ? 'text-yellow-600' : 'text-[#4E3B2C]'}`}>
                            {product.stock ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={product.is_active ? 'active' : 'inactive'} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-end">
                            <button
                              className="p-2 rounded-lg border border-[#DCC7AA] text-[#7C6652] hover:bg-[#FAF6F0] transition"
                              onClick={() => navigate('/admin/products/create', { state: { editProduct: product } })}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                              onClick={() => setDeleteTarget(product)}
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

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Product"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}