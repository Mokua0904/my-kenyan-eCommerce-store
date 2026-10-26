import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, ChevronLeft, ChevronRight, Check, ShoppingCart, Truck, MapPin, ShieldCheck } from "lucide-react";
import { useAppContext } from "../context/AppContext";

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedProduct, fetchProductBySlug, addToCart, user, isLoading } = useAppContext();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartState, setCartState] = useState("idle"); // idle | added
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchProductBySlug(id);
    setSelectedImage(0);
    setSelectedSize("");
    setQuantity(1);
    setActiveTab("description");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const product = selectedProduct;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4]">
        <div className="w-10 h-10 border-4 border-[#DCC7AA] border-t-[#A6754D] rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4EDE4]">
        <p className="text-[#7C6652] mb-4 font-medium">Product not found.</p>
        <button onClick={() => navigate("/shop")} className="text-[#A6754D] font-semibold underline">
          Back to Shop
        </button>
      </div>
    );
  }

  const rawImages = product.images?.length > 0 ? product.images : null;
  const displayImages = rawImages
    ? rawImages.map((img) => (typeof img === "string" ? img : img.image))
    : [product.primary_image || "https://via.placeholder.com/600x600?text=No+Image"];

  const price = parseFloat(product.current_price || product.price);
  const originalPrice = product.discount_percentage > 0 ? parseFloat(product.price) : null;
  
  // Detect if it's a thrift item
  const isThrift = product.is_thrift || product.condition === "thrift";

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) return;
    const size = product.sizes?.length > 0 ? selectedSize : "Standard";
    addToCart(product, size, quantity);
    setCartState("added");
    triggerToast();
    setTimeout(() => setCartState("idle"), 2500);
  };

  const handleBuyNow = () => {
    if (product.sizes?.length > 0 && !selectedSize) return;
    const size = product.sizes?.length > 0 ? selectedSize : "Standard";
    addToCart(product, size, quantity);
    navigate("/cart");
  };

  const Stars = ({ rating, size = 16 }) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={
          i < Math.floor(rating)
            ? "text-[#A6754D] fill-[#A6754D]"
            : "text-gray-200 fill-gray-200"
        }
      />
    ));

  return (
    <div className="min-h-screen bg-[#F4EDE4]">

      {/* ── Toast ── */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3.5 rounded-xl shadow-lg border border-green-700">
          <Check size={18} className="flex-shrink-0" />
          <span className="text-sm font-semibold">Product added to cart!</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="text-sm text-[#7C6652] mb-8 flex items-center gap-1.5">
          <button onClick={() => navigate("/")} className="hover:text-[#4E3B2C] transition">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/shop")} className="hover:text-[#4E3B2C] transition">Shop</button>
          <span>/</span>
          <span className="text-[#4E3B2C] font-semibold">{product.name}</span>
        </nav>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Images ── */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden group border border-[#DCC7AA]">
              <img
                src={displayImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.discount_percentage > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    -{product.discount_percentage}%
                  </span>
                )}
                {isThrift && (
                  <span className="bg-[#4E3B2C] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                    Thrift / Mitumba
                  </span>
                )}
              </div>

              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition text-[#4E3B2C] hover:bg-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev + 1) % displayImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition text-[#4E3B2C] hover:bg-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {displayImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition ${
                      selectedImage === i ? "border-[#A6754D]" : "border-transparent hover:border-[#DCC7AA]"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col gap-6">

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-[#4E3B2C] leading-tight">
                {product.name}
              </h1>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="flex-shrink-0 p-2.5 rounded-full border border-[#DCC7AA] hover:border-[#A6754D] transition bg-white"
              >
                <Heart
                  size={20}
                  className={isWishlisted ? "fill-red-500 text-red-500" : "text-[#A6754D]"}
                />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                <Stars rating={product.average_rating || 0} />
              </div>
              <span className="text-sm text-[#7C6652]">
                {product.average_rating > 0
                  ? `${product.average_rating} · ${product.review_count} review${product.review_count !== 1 ? "s" : ""}`
                  : "No reviews yet"}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[#4E3B2C]">
                KES {price.toLocaleString()}
              </span>
              {originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    KES {originalPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-green-700 font-semibold bg-green-100 px-2 py-1 rounded-md">
                    Save KES {(originalPrice - price).toLocaleString()}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-[#7C6652] -mt-4">Inclusive of 16% VAT</p>

            <hr className="border-[#DCC7AA]" />

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#4E3B2C] mb-3">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => s.stock > 0 && setSelectedSize(s.value)}
                      disabled={s.stock === 0}
                      className={`px-5 py-2.5 rounded-lg text-sm font-semibold border transition ${
                        s.stock === 0
                          ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                          : selectedSize === s.value
                          ? "border-[#A6754D] bg-[#A6754D] text-white shadow-md"
                          : "border-[#DCC7AA] text-[#4E3B2C] hover:border-[#A6754D] bg-white"
                      }`}
                    >
                      {s.value}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-xs text-red-500 mt-2 font-medium">Please select a size to continue</p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-[#4E3B2C] mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg border border-[#DCC7AA] bg-white hover:border-[#A6754D] flex items-center justify-center text-[#4E3B2C] font-bold transition"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-[#4E3B2C] text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 rounded-lg border border-[#DCC7AA] bg-white hover:border-[#A6754D] flex items-center justify-center text-[#4E3B2C] font-bold transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock */}
            <div>
              {product.stock === 0 ? (
                <span className="text-sm text-red-600 font-bold bg-red-50 px-3 py-1 rounded-md">Out of stock</span>
              ) : product.stock <= 10 ? (
                <span className="text-sm text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-md">Only {product.stock} left in stock</span>
              ) : (
                <span className="text-sm text-green-700 font-bold bg-green-50 px-3 py-1 rounded-md">In stock</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                  cartState === "added"
                    ? "bg-green-600 text-white"
                    : "bg-[#A6754D] hover:bg-[#8D5F3B] text-white"
                }`}
              >
                {cartState === "added" ? (
                  <><Check size={18} /> Added to Cart!</>
                ) : (
                  <><ShoppingCart size={18} /> Add to Cart</>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 py-4 rounded-xl text-sm font-bold bg-[#4E3B2C] text-white hover:bg-[#3a2c21] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            {/* Nairobi Delivery Info */}
            <div className="bg-[#FAF6F0] rounded-xl p-4 mt-2 space-y-3 border border-[#DCC7AA]">
              <div className="flex items-center gap-3 text-sm text-[#4E3B2C]">
                <Truck size={18} className="text-[#A6754D]" />
                <span>Free delivery in Nairobi for orders over KSh 5,000.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#4E3B2C]">
                <MapPin size={18} className="text-[#A6754D]" />
                <span>Ready for pickup at our Nairobi CBD shop.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#4E3B2C]">
                <ShieldCheck size={18} className="text-[#A6754D]" />
                <span>Secure checkout via M-Pesa or Cash on Delivery.</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-16 bg-white rounded-2xl border border-[#DCC7AA] p-6 md:p-8">
          <div className="flex gap-8 border-b border-gray-100 mb-6">
            {["description", "features", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold capitalize border-b-2 transition ${
                  activeTab === tab
                    ? "border-[#A6754D] text-[#A6754D]"
                    : "border-transparent text-gray-400 hover:text-[#4E3B2C]"
                }`}
              >
                {tab}
                {tab === "reviews" && product.review_count > 0 && (
                  <span className="ml-1.5 text-xs text-gray-400">({product.review_count})</span>
                )}
              </button>
            ))}
          </div>

          <div className="max-w-3xl">
            {activeTab === "description" && (
              <p className="text-[#7C6652] leading-relaxed text-sm">
                {product.description || "No description available for this item."}
              </p>
            )}

            {activeTab === "features" && (
              <ul className="space-y-3">
                {product.features?.length > 0 ? (
                  product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#7C6652]">
                      <Check size={16} className="text-[#A6754D] flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No specific features listed.</p>
                )}
              </ul>
            )}

            {activeTab === "reviews" && (
              <ReviewsTab product={product} user={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Reviews Tab Component ── */
function ReviewsTab({ product, user }) {
  const navigate = useNavigate();

  const Stars = ({ rating }) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={
          i < Math.floor(rating)
            ? "text-[#A6754D] fill-[#A6754D]"
            : "text-gray-200 fill-gray-200"
        }
      />
    ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {product.average_rating > 0 && (
            <>
              <span className="text-3xl font-bold text-[#4E3B2C]">
                {product.average_rating}
              </span>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  <Stars rating={product.average_rating} />
                </div>
                <p className="text-xs text-[#7C6652]">{product.review_count} reviews</p>
              </div>
            </>
          )}
        </div>

        {user ? (
          <button
            onClick={() => navigate(`/product/${product.slug}/review`)}
            className="text-sm font-bold text-white bg-[#A6754D] px-4 py-2 rounded-lg hover:bg-[#8D5F3B] transition"
          >
            Write a review
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-[#7C6652] border border-[#DCC7AA] px-4 py-2 rounded-lg hover:border-[#A6754D] hover:text-[#A6754D] transition"
          >
            Log in to review
          </button>
        )}
      </div>

      {product.reviews?.length > 0 ? (
        <div className="space-y-6">
          {product.reviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-[#4E3B2C]">{r.user_name}</span>
                <span className="text-xs text-gray-400">{r.date}</span>
              </div>
              <div className="flex gap-0.5 mb-2">
                <Stars rating={r.rating} />
              </div>
              {r.title && (
                <p className="text-sm font-semibold text-[#4E3B2C] mb-1">{r.title}</p>
              )}
              {r.comment && (
                <p className="text-sm text-[#7C6652] leading-relaxed">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-[#DCC7AA] rounded-xl bg-[#FAF6F0]">
          <p className="text-sm text-[#7C6652] mb-3">No reviews yet for this product.</p>
          {user ? (
            <button
              onClick={() => navigate(`/product/${product.slug}/review`)}
              className="text-sm font-bold text-[#A6754D] hover:underline"
            >
              Be the first to review this product
            </button>
          ) : (
            <p className="text-xs text-[#7C6652]">Log in to leave a review.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductPage;