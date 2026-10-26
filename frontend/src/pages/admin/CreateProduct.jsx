import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Upload, X, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { productService } from "../../services";
import toast from "react-hot-toast";

const PRODUCT_TYPES = [
  { value: "clothing", label: "Clothing" },
  { value: "shoes", label: "Shoes" },
  { value: "accessories", label: "Accessories" },
];
const NO_SIZE_TYPES = ["accessories"];
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
const DEFAULT_COLORS = ["Red", "Blue", "Green", "Black", "White", "Beige"];

// 🛠️ SAFE API URL
const API_URL = 
  import.meta.env?.VITE_API_URL || 
  process.env?.REACT_APP_API_URL || 
  "http://localhost:8000";

export const getImageUrl = (path) => {
  if (!path || typeof path !== "string") return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${API_URL}${path}`;
  return `${API_URL}/media/${path}`;
};

export const getProductImage = (product) => {
  if (!product) return null;
  if (product.image) return getImageUrl(product.image);
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    if (typeof first === "string") return getImageUrl(first);
    if (first?.image) return getImageUrl(first.image);
  }
  if (product.thumbnail) return getImageUrl(product.thumbnail);
  return null;
};

export default function CreateProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const initial = location.state?.editProduct || null;
  const isEditing = !!initial;

  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name || "",
          description: initial.description || "",
          category: initial.category || "",
          product_type: initial.product_type || "clothing",
          price: initial.price || "",
          sale_price: initial.discount_price || "",
          stock: initial.stock || "",
          is_featured: initial.is_featured ?? false,
          status: initial.is_active !== undefined ? (initial.is_active ? "active" : "inactive") : "active",
        }
      : {
          name: "",
          description: "",
          category: "",
          product_type: "clothing",
          price: "",
          sale_price: "",
          stock: "",
          status: "active",
          is_featured: false,
        }
  );

  const [selectedSizes, setSelectedSizes] = useState(initial?.sizes?.map((v) => v.value).filter(Boolean) || []);
  const [selectedColors, setSelectedColors] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(getProductImage(initial));

  useEffect(() => {
    productService
      .categories()
      .then((r) => setCategories(r.data.results || r.data || []))
      .catch(() => {});
  }, []);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const priceNum = parseFloat(form.price) || 0;
      const salePriceNum = parseFloat(form.sale_price) || 0;

      if (form.sale_price !== "" && salePriceNum >= priceNum) {
        toast.error("Sale price must be less than the regular price.");
        setSaving(false);
        return;
      }

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("product_type", form.product_type);
      fd.append("category", form.category);
      fd.append("price", form.price);
      fd.append("stock", form.stock || 0);
      fd.append("is_active", form.status === "active" ? "true" : "false");
      fd.append("is_featured", String(form.is_featured));

      if (form.sale_price !== "" && parseFloat(form.sale_price) > 0) {
        fd.append("discount_price", form.sale_price);
      }

      const slug = form.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
      fd.append("slug", slug);
      
      if (imageFile) {
        fd.append("uploaded_images", imageFile);
      }
      
      if (!NO_SIZE_TYPES.includes(form.product_type) && selectedSizes.length > 0) {
        const sizesArray = selectedSizes.map((s) => ({
          size_type: form.product_type,
          value: s,
          stock: parseInt(form.stock) || 0,
        }));
        fd.append("sizes_json", JSON.stringify(sizesArray));
      }

      if (isEditing) {
        await productService.update(initial.id, fd);
        toast.success("Product updated successfully!");
      } else {
        await productService.create(fd);
        toast.success("Product created successfully!");
      }

      navigate("/admin/products");
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      const data = err.response?.data;
      const msg = data
        ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("\n")
        : "Error saving product";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]/30 focus:border-[#A6754D] transition";
  const labelCls = "block text-sm font-bold text-[#4E3B2C] mb-1.5";

  return (
    <div className="bg-[#F4EDE4] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/products")}
              className="p-2 bg-white border border-[#DCC7AA] rounded-lg text-[#4E3B2C] hover:bg-gray-50 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#4E3B2C]">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-sm text-[#7C6652]">
                {isEditing ? `Editing: ${initial.name}` : "Add a new item to your Nairobi shop."}
              </p>
            </div>
          </div>
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="w-full sm:w-auto bg-[#A6754D] hover:bg-[#8D5F3B] text-white px-6 py-2.5 rounded-lg font-bold transition disabled:opacity-60 shadow-md"
          >
            {saving ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
          </button>
        </div>

        <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Product Info */}
            <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#4E3B2C] mb-4 border-b border-gray-100 pb-2">Product Information</h3>
              
              <div className="mb-4">
                <label className={labelCls}>Product Name *</label>
                <input className={inputCls} value={form.name} onChange={set("name")} placeholder="e.g. Classic White Shirt" required />
              </div>
              
              <div>
                <label className={labelCls}>Description</label>
                <textarea className={`${inputCls} resize-none`} value={form.description} onChange={set("description")} rows={5} placeholder="Describe the product..." />
              </div>
            </div>

            {/* Right: Pricing & Inventory */}
            <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#4E3B2C] mb-4 border-b border-gray-100 pb-2">Pricing & Inventory</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelCls}>Category</label>
                  <select className={inputCls} value={form.category} onChange={set("category")}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Product Type *</label>
                  <select className={inputCls} value={form.product_type} onChange={(e) => { set("product_type")(e); setSelectedSizes([]); }} required>
                    {PRODUCT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              {/* 🇰🇪 PRICE FIELDS (KES) */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelCls}>Price (KES) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A6754D] font-bold text-sm">KSh</span>
                    <input type="number" step="0.01" min="0" className={`${inputCls} pl-12`} value={form.price} onChange={set("price")} placeholder="1500" required />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Sale Price (KES)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A6754D] font-bold text-sm">KSh</span>
                    <input type="number" step="0.01" min="0" className={`${inputCls} pl-12`} value={form.sale_price} onChange={set("sale_price")} placeholder="Optional" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelCls}>Stock Quantity</label>
                  <input type="number" min="0" className={inputCls} value={form.stock} onChange={set("stock")} placeholder="0" />
                </div>
                <div>
                  <label className={labelCls}>Visibility</label>
                  <div className="flex items-center gap-2 mt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={form.status === "active"} onChange={(e) => setForm(f => ({ ...f, status: e.target.checked ? "active" : "inactive" }))} />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A6754D]"></div>
                      <span className="ml-3 text-sm font-medium text-[#4E3B2C] capitalize">{form.status}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Featured Product</label>
                <div className="flex items-center gap-2 mt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={form.is_featured} onChange={(e) => setForm(f => ({ ...f, is_featured: e.target.checked }))} />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A6754D]"></div>
                    <span className="ml-3 text-sm font-medium text-[#4E3B2C]">{form.is_featured ? "Featured on homepage" : "Not featured"}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Media & Variants */}
          <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#4E3B2C] mb-6 border-b border-gray-100 pb-2">Media & Variants</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-[#4E3B2C] mb-2">Product Image</label>
                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer min-h-[150px] transition ${imageFile ? 'border-[#A6754D] bg-[#FAF6F0]' : 'border-[#DCC7AA] bg-gray-50 hover:bg-gray-100'}`}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="max-h-[110px] rounded-lg object-cover" onError={() => setImagePreview(null)} />
                  ) : (
                    <>
                      <Upload size={28} className="text-[#A6754D] mb-2" />
                      <span className="text-xs text-[#7C6652] text-center font-medium">Click to upload</span>
                      <span className="text-[10px] text-gray-400 mt-1">JPG, PNG, WEBP (Max 5MB)</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                {imageFile && (
                  <div className="mt-2 text-xs text-[#A6754D] text-center font-medium">✓ {imageFile.name}</div>
                )}
                {imagePreview && (
                  <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }} className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium py-1">
                    <X size={12} /> Remove image
                  </button>
                )}
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-bold text-[#4E3B2C] mb-2">Available Sizes</label>
                {NO_SIZE_TYPES.includes(form.product_type) ? (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-500">
                    Accessories don't require sizes.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(form.product_type === "shoes" ? SHOE_SIZES : CLOTHING_SIZES).map((s) => (
                      <button key={s} type="button" onClick={() => setSelectedSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])} className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${selectedSizes.includes(s) ? 'bg-[#A6754D] border-[#A6754D] text-white' : 'bg-white border-[#DCC7AA] text-[#4E3B2C] hover:border-[#A6754D]'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-bold text-[#4E3B2C] mb-2">Available Colors</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setSelectedColors((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${selectedColors.includes(c) ? 'bg-[#4E3B2C] border-[#4E3B2C] text-white' : 'bg-white border-[#DCC7AA] text-[#4E3B2C] hover:border-[#4E3B2C]'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => navigate("/admin/products")} className="px-6 py-3 rounded-lg font-bold text-[#7C6652] bg-white border border-[#DCC7AA] hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-8 py-3 rounded-lg font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B] transition shadow-md disabled:opacity-60">
              {saving ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}