import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart, ShoppingCart, Zap, Check, Sparkles } from "lucide-react";
import { useAppContext } from "../context/AppContext";

function ProductCard({ product, viewMode = "grid" }) {
  const navigate = useNavigate();
  const { addToCart } = useAppContext();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAddedNotif, setShowAddedNotif] = useState(false);

  const handleClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const defaultSize =
      product.sizes && product.sizes.length > 0
        ? product.sizes[0].value
        : "Standard";

    addToCart(product, defaultSize, 1);
    setShowAddedNotif(true);
    setTimeout(() => setShowAddedNotif(false), 2000);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const price = product.current_price || product.price;
  const originalPrice = product.discount_percentage > 0 ? product.price : null;
  
  // Detect if it's a thrift item
  const isThrift = product.is_thrift || product.condition === "thrift";

  const stockStatus =
    product.stock > 10
      ? "In Stock"
      : product.stock > 0
        ? "Low Stock"
        : "Out of Stock";
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock === 0;

  // ─── LIST VIEW ───────────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <div
        onClick={handleClick}
        className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-[#DCC7AA] flex flex-col sm:flex-row gap-4 p-4 group"
      >
        {/* Image Section */}
        <div className="relative w-full sm:w-48 h-48 sm:h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {product.primary_image && (
            <img
              src={product.primary_image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.discount_percentage > 0 && (
              <div className="bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                -{product.discount_percentage}%
              </div>
            )}
            {isThrift && (
              <div className="bg-[#4E3B2C] text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Sparkles size={10} /> Thrift
              </div>
            )}
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg mb-1 text-[#4E3B2C] group-hover:text-[#A6754D] transition-colors line-clamp-2">
                {product.name}
              </h3>
            </div>
            <p className="text-sm text-[#7C6652] mb-3 capitalize">
              {product.product_type}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-3">
              {product.average_rating > 0 ? (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={`${
                          i < Math.round(product.average_rating)
                            ? "text-[#A6754D] fill-[#A6754D]"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#4E3B2C]">
                    {product.average_rating}
                  </span>
                  <span className="text-xs text-[#7C6652]">
                    ({product.review_count})
                  </span>
                </div>
              ) : (
                <span className="text-xs text-[#7C6652]">No reviews yet</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-3">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isOutOfStock
                    ? "bg-red-100 text-red-700"
                    : isLowStock
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {stockStatus}
              </span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-gray-100 gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#4E3B2C]">
                KES {price.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  KES {originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#A6754D] hover:bg-[#8D5F3B] disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg font-bold transition-all duration-300 text-sm shadow-sm"
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── GRID VIEW ───────────────────────────────────────────────────────────
  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group border border-[#DCC7AA] h-full flex flex-col relative"
    >
      {/* Image Container */}
      <div className="relative h-64 sm:h-72 bg-gray-100 overflow-hidden">
        {product.primary_image && (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.discount_percentage > 0 && (
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg w-fit">
              -{product.discount_percentage}%
            </div>
          )}
          {isThrift && (
            <div className="bg-[#4E3B2C] text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1 w-fit">
              <Sparkles size={10} /> Thrift
            </div>
          )}
          {product.is_featured && (
            <div className="bg-amber-400 text-gray-900 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg w-fit">
              <Zap size={12} className="fill-current" /> Featured
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          <Heart
            size={18}
            className={`transition-all duration-300 ${
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg bg-black/50 px-4 py-2 rounded-lg">Out of Stock</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category/Type */}
        <p className="text-[10px] text-[#A6754D] font-bold uppercase tracking-wider mb-1">
          {product.product_type}
        </p>

        {/* Product Name */}
        <h3 className="font-bold text-base mb-2 line-clamp-2 text-[#4E3B2C] group-hover:text-[#A6754D] transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-3">
          {product.average_rating > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={`${
                      i < Math.round(product.average_rating)
                        ? "text-[#A6754D] fill-[#A6754D]"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-[#4E3B2C]">
                {product.average_rating}
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">No reviews</span>
          )}
        </div>

        {/* Price & Button */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-extrabold text-[#4E3B2C]">
              KES {price.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                KES {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Stock indicator mini */}
          {isLowStock && (
            <p className="text-[10px] text-orange-600 font-bold mb-2">Only {product.stock} left!</p>
          )}

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full flex items-center justify-center gap-2 bg-[#A6754D] hover:bg-[#8D5F3B] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-bold transition-all duration-300 text-sm shadow-md hover:shadow-lg"
          >
            <ShoppingCart size={16} />
            {isOutOfStock ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showAddedNotif && (
        <div className="fixed top-24 right-4 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 animate-fadeIn">
          <Check size={18} className="flex-shrink-0" />
          <span className="font-bold text-sm">Added to cart!</span>
        </div>
      )}
    </div>
  );
}

export default ProductCard;