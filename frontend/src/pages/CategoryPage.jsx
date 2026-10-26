import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { Search, Grid, List } from "lucide-react";

function CategoryPage() {
  const { categorySlug } = useParams();
  const { 
    products = [], 
    isLoading, 
    fetchProductsByCategory, 
    categories = [] 
  } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [itemType, setItemType] = useState("all"); // all | new | thrift

  // Get category name from context for display
  const category = categories.find((c) => c.slug === categorySlug);
  const categoryName = category?.name || (categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : "Shop");

  useEffect(() => {
    // 🛠️ FIX: Added fetchProductsByCategory to the dependency array.
    // This ensures it fetches when the URL slug changes, WITHOUT causing an infinite loop.
    if (fetchProductsByCategory && categorySlug) {
      fetchProductsByCategory(categorySlug);
    }
  }, [categorySlug, fetchProductsByCategory]);

  // Safe fallback for products array
  const safeProducts = Array.isArray(products) ? products : [];

  // Use useMemo to prevent unnecessary recalculations
  const filteredProducts = useMemo(() => {
    let result = [...safeProducts];

    // 1. Filter by New vs Thrift
    if (itemType === "new") {
      result = result.filter((p) => !p.is_thrift && p.condition !== "thrift");
    } else if (itemType === "thrift") {
      result = result.filter((p) => p.is_thrift || p.condition === "thrift");
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((p) => {
        const name = p?.name?.toLowerCase() || "";
        const brand = p?.brand?.toLowerCase() || "";
        const type = p?.product_type?.toLowerCase() || "";
        return name.includes(term) || brand.includes(term) || type.includes(term);
      });
    }

    // 3. Sort
    return result.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.current_price || a.price || 0) - (b.current_price || b.price || 0);
        case "price-high":
          return (b.current_price || b.price || 0) - (a.current_price || a.price || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        default:
          return 0;
      }
    });
  }, [safeProducts, searchTerm, sortBy, itemType]);

  if (isLoading)
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#F4EDE4]">
        <div className="w-10 h-10 border-4 border-[#DCC7AA] border-t-[#A6754D] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#4E3B2C] font-semibold">Loading {categoryName}...</p>
      </div>
    );

  return (
    <div className="w-full bg-[#F4EDE4] min-h-screen py-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[#4E3B2C] capitalize">{categoryName}</h1>
          <p className="text-[#7C6652]">Explore our collection of new and thrift items in this category.</p>
        </div>

        {/* New vs Thrift Toggle */}
        <div className="flex gap-6 mb-6 border-b border-[#DCC7AA] pb-4 overflow-x-auto">
          <button 
            onClick={() => setItemType("all")}
            className={`font-semibold whitespace-nowrap transition ${itemType === "all" ? "text-[#A6754D] border-b-2 border-[#A6754D] pb-1" : "text-gray-500 hover:text-[#4E3B2C]"}`}
          >
            All Items
          </button>
          <button 
            onClick={() => setItemType("new")}
            className={`font-semibold whitespace-nowrap transition ${itemType === "new" ? "text-[#A6754D] border-b-2 border-[#A6754D] pb-1" : "text-gray-500 hover:text-[#4E3B2C]"}`}
          >
            Brand New
          </button>
          <button 
            onClick={() => setItemType("thrift")}
            className={`font-semibold whitespace-nowrap transition ${itemType === "thrift" ? "text-[#A6754D] border-b-2 border-[#A6754D] pb-1" : "text-gray-500 hover:text-[#4E3B2C]"}`}
          >
            Thrift (Mitumba)
          </button>
        </div>

        {/* Search + Sort + View */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A6754D]"
              size={20}
            />
            <input
              type="text"
              placeholder={`Search ${categoryName.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#DCC7AA] rounded-lg text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white border border-[#DCC7AA] rounded-lg text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D] flex-1 md:flex-none"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name A–Z</option>
            </select>

            <div className="flex border border-[#DCC7AA] rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 transition ${viewMode === "grid" ? "bg-[#A6754D] text-white" : "text-[#A6754D] hover:bg-gray-50"}`}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 transition ${viewMode === "list" ? "bg-[#A6754D] text-white" : "text-[#A6754D] hover:bg-gray-50"}`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-6"}>
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-[#DCC7AA]">
            <p className="text-5xl mb-4">🛍️</p>
            <h3 className="text-xl font-semibold text-[#4E3B2C]">No products found in {categoryName}</h3>
            <p className="text-[#7C6652]">Try adjusting your search or filter settings.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;