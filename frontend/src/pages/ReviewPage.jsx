import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Check, ArrowLeft } from "lucide-react";
import { useAppContext } from "../context/AppContext";

// 🛠️ SAFE API URL: Checks Vite env first, then falls back
const API_BASE_URL = 
  import.meta.env?.VITE_API_URL || 
  process.env?.REACT_APP_API_URL || 
  "http://localhost:8000";

function ReviewPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products = [], user } = useAppContext();

  const product = products.find((p) => p.slug === slug);

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // --- AUTH GUARD ---
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4EDE4] px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#DCC7AA] text-center max-w-sm w-full">
          <p className="text-[#7C6652] mb-6 font-medium">Please log in to leave a review.</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-[#A6754D] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#8D5F3B] transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // --- 404 GUARD ---
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4EDE4] px-4">
        <p className="text-[#7C6652] mb-4 font-medium">Product not found.</p>
        <button
          onClick={() => navigate("/shop")}
          className="text-[#A6754D] font-semibold underline"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a star rating.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_BASE_URL}/api/products/${product.slug}/review/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            ...(title.trim() && { title: title.trim() }),
            ...(comment.trim() && { comment: comment.trim() }),
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || data.error || "Failed to submit.");
      }

      setSuccess(true);
      setTimeout(() => navigate(`/product/${slug}`), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  // --- SUCCESS SCREEN ---
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4]">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl border border-[#DCC7AA] max-w-sm w-full">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#4E3B2C] mb-2">Asante Sana!</h2>
          <p className="text-sm text-[#7C6652] leading-relaxed">
            Your review has been submitted successfully. It will appear after approval. Redirecting you back…
          </p>
        </div>
      </div>
    );
  }

  // --- MAIN REVIEW FORM ---
  return (
    <div className="min-h-screen bg-[#F4EDE4] py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-[#DCC7AA] p-6 md:p-10">

        {/* Back Button */}
        <button
          onClick={() => navigate(`/product/${slug}`)}
          className="flex items-center gap-1.5 text-sm text-[#7C6652] hover:text-[#4E3B2C] transition mb-8 font-medium"
        >
          <ArrowLeft size={16} />
          Back to product
        </button>

        {/* Product Summary */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#DCC7AA]">
          {product.primary_image && (
            <img
              src={product.primary_image}
              alt={product.name}
              className="w-20 h-20 rounded-xl object-cover bg-gray-100 flex-shrink-0 border border-[#DCC7AA]"
            />
          )}
          <div>
            <p className="text-xs text-[#A6754D] font-bold uppercase tracking-wider mb-1">
              {product.product_type}
            </p>
            <h1 className="text-lg font-bold text-[#4E3B2C] line-clamp-2">{product.name}</h1>
            <p className="text-sm font-semibold text-[#7C6652] mt-1">
              KES {parseFloat(product.current_price || product.price).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#4E3B2C] mb-1">Leave a Review</h2>
          <p className="text-sm text-[#7C6652]">
            Share your experience to help other shoppers in Nairobi.
          </p>
        </div>

        {/* Star Rating */}
        <div className="mb-8">
          <p className="text-sm font-bold text-[#4E3B2C] mb-3">
            Your rating <span className="text-red-500">*</span>
          </p>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setRating(val)}
                  onMouseEnter={() => setHovered(val)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${val} stars`}
                >
                  <Star
                    size={38}
                    className={
                      val <= (hovered || rating)
                        ? "text-[#A6754D] fill-[#A6754D]" // Brand color for stars
                        : "text-gray-200 fill-gray-200"
                    }
                  />
                </button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <span className="text-sm font-bold text-[#A6754D] bg-[#FAF6F0] px-3 py-1 rounded-lg">
                {ratingLabels[hovered || rating]}
              </span>
            )}
          </div>
          {!rating && error && (
            <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>
          )}
        </div>

        {/* Title Input */}
        <div className="mb-5">
          <label className="text-sm font-bold text-[#4E3B2C] block mb-2">
            Title <span className="text-[#A6754D] font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarise your experience"
            className="w-full border border-[#DCC7AA] rounded-xl px-4 py-3 text-sm text-[#4E3B2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A6754D]/30 focus:border-[#A6754D] transition bg-gray-50"
          />
        </div>

        {/* Comment Input */}
        <div className="mb-8">
          <label className="text-sm font-bold text-[#4E3B2C] block mb-2">
            Comment <span className="text-[#A6754D] font-normal">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="What did you like or dislike? Would you recommend this?"
            className="w-full border border-[#DCC7AA] rounded-xl px-4 py-3 text-sm text-[#4E3B2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A6754D]/30 focus:border-[#A6754D] transition bg-gray-50 resize-none"
          />
          <p className="text-xs text-[#7C6652] mt-2">
            A star rating alone is enough — a comment helps even more.
          </p>
        </div>

        {/* Error Message */}
        {error && rating > 0 && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg text-sm mb-6 font-medium">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !rating}
          className="w-full py-4 rounded-xl bg-[#A6754D] text-white text-sm font-bold hover:bg-[#8D5F3B] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>

        <p className="text-xs text-center text-[#7C6652] mt-4 font-medium">
          Reviews are held for moderation before going live.
        </p>
      </div>
    </div>
  );
}

export default ReviewPage;