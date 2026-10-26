import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { Search, Grid, List } from "lucide-react";

function AccessoriesPage() {
  const { products = [], isLoading, fetchProductsByCategory } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [itemType, setItemType] = useState("all"); // all | new | thrift

  useEffect(() => {
    // 🛠️ FIX: Empty dependency array ensures this ONLY runs once on page load.
    // This stops the infinite "blinking" loop.
    if (fetchProductsByCategory) {
      fetchProductsByCategory("accessories");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Safe check to ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  const filteredProducts = safeProducts
    .filter((p) => {
      // 1. Filter by Search Term
      const term = searchTerm.toLowerCase();
      const title = p?.title?.toLowerCase() || "";
      const brand = p?.brand?.toLowerCase() || "";
      const type = p?.product_type?.toLowerCase() || "";
      const matchesSearch = title.includes(term) || brand.includes(term) || type.includes(term);

      // 2. Filter by New vs Thrift
      const isThrift = p?.is_thrift || p?.condition === "thrift"; 
      let matchesType = true;
      if (itemType === "new") matchesType = !isThrift;
      if (itemType === "thrift") matchesType = isThrift;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.current_price || a.price || 0) - (b.current_price || b.price || 0);
        case "price-high":
          return (b.current_price || b.price || 0) - (a.current_price || a.price || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
          return (a.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });

  if (isLoading)
    return <p className="text-center py-16 text-[#4E3B2C] font-semibold">Loading accessories collection...</p>;

  return (
    <div className="w-full bg-[#F4EDE4] min-h-screen py-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[#4E3B2C]">Accessories</h1>
          <p className="text-[#7C6652]">Complete your look with our latest new arrivals and premium thrift (mitumba) accessories.</p>
        </div>

        {/* New vs Thrift Toggle */}
        <div className="flex gap-6 mb-6 border-b border-[#DCC7AA] pb-4 overflow-x-auto">
          <button 
            onClick={() => setItemType("all")}
            className={`font-semibold whitespace-nowrap transition ${itemType === "all" ? "text-[#A6754D] border-b-2 border-[#A6754D] pb-1" : "text-gray-500 hover:text-[#4E3B2C]"}`}
          >
            All Accessories
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
              placeholder="Search accessories by name or brand..."
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
                className={`p-3 transition ${
                  viewMode === "grid"
                    ? "bg-[#A6754D] text-white"
                    : "text-[#A6754D] hover:bg-gray-50"
                }`}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 transition ${
                  viewMode === "list"
                    ? "bg-[#A6754D] text-white"
                    : "text-[#A6754D] hover:bg-gray-50"
                }`}
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
            <p className="text-5xl mb-4">✨</p>
            <h3 className="text-xl font-semibold text-[#4E3B2C]">No accessories found</h3>
            <p className="text-[#7C6652]">Try adjusting your search or filter settings.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccessoriesPage;