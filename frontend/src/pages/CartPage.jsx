import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft, 
  ShieldCheck, 
  RotateCcw, 
  CreditCard 
} from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";

function CartPage() {
  const navigate = useNavigate();
  const { user, cart = [], updateCartItemQuantity, removeFromCart, getCartTotal } = useAppContext();
  const [deleteItemId, setDeleteItemId] = useState(null);

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token");
  
  const isAuthenticated = !!(user || token);

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItemQuantity(cartItemId, newQuantity);
  };

  const handleRemoveItem = (cartItemId) => {
    setDeleteItemId(cartItemId);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  const resolveImage = (item) => {
    if (item.primary_image) return item.primary_image;
    if (Array.isArray(item.images) && item.images.length > 0) {
      const first = item.images[0];
      return typeof first === "string" ? first : first?.image || null;
    }
    return null;
  };

  const cartTotal = getCartTotal ? getCartTotal() : 0;
  const shippingThreshold = 5000;
  
  // 🇰🇪 FIXED: Delivery fee is 200, not 300
  const shippingCost = cartTotal > shippingThreshold ? 0 : 200; 
  const totalWithShipping = cartTotal + shippingCost;

  // VIEW: Empty Cart
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4EDE4] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="bg-white border border-[#DCC7AA] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ShoppingBag className="h-12 w-12 text-[#A6754D]" />
          </div>
          <h2 className="text-3xl font-bold text-[#4E3B2C] mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-[#7C6652] mb-8">
            It looks like you haven't discovered your next favorite piece yet.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-[#A6754D] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#8D5F3B] transition-colors inline-flex items-center gap-2 shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F4EDE4] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <button
              onClick={() => navigate("/shop")}
              className="flex items-center text-[#7C6652] hover:text-[#A6754D] transition-colors mb-6 group font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Shop
            </button>
            <h1 className="text-4xl font-bold text-[#4E3B2C]">
              Shopping Cart
            </h1>
            <p className="text-[#7C6652] mt-2">
              {cart.length} {cart.length === 1 ? "item" : "items"} ready for checkout
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => {
                const price = parseFloat(item.current_price || item.price);
                const itemTotal = price * item.quantity;
                const imgSrc = resolveImage(item);

                return (
                  <div
                    key={item.cartItemId}
                    className="bg-white rounded-xl p-6 flex flex-col sm:flex-row gap-6 border border-[#DCC7AA] shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <div className="w-full sm:w-32 h-40 sm:h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-[#DCC7AA]">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-[#4E3B2C] mb-1 leading-tight">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#7C6652]">
                            <p>
                              Size:{" "}
                              <span className="text-[#4E3B2C] font-semibold">
                                {item.selectedSize}
                              </span>
                            </p>
                            {item.category_name && (
                              <p>
                                Category:{" "}
                                <span className="text-[#4E3B2C] font-semibold">
                                  {item.category_name}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.cartItemId)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center border border-[#DCC7AA] rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-[#4E3B2C] transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center font-bold text-[#4E3B2C]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-[#4E3B2C] transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-[#4E3B2C]">
                            KES {itemTotal.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                            KES {price.toLocaleString()} EA
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-[#DCC7AA] p-8 sticky top-24">
                <h2 className="text-xl font-bold text-[#4E3B2C] mb-6 pb-4 border-b border-[#DCC7AA]">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-[#7C6652]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#4E3B2C]">
                      KES {cartTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#7C6652]">
                    <span>Delivery</span>
                    <span className="font-semibold text-[#4E3B2C]">
                      {shippingCost === 0 ? (
                        <span className="text-green-600 font-bold">Free</span>
                      ) : (
                        `KES ${shippingCost.toLocaleString()}`
                      )}
                    </span>
                  </div>

                  {cartTotal < shippingThreshold && (
                    <div className="bg-[#FAF6F0] border border-[#DCC7AA] p-3 rounded-lg">
                      <p className="text-xs text-[#7C6652] leading-relaxed">
                        Enjoy free delivery on orders over{" "}
                        <b className="text-[#4E3B2C]">KES {shippingThreshold.toLocaleString()}</b>. Add{" "}
                        <b className="text-[#4E3B2C]">KES {(shippingThreshold - cartTotal).toLocaleString()}</b> more
                        to qualify.
                      </p>
                    </div>
                  )}

                  <div className="border-t border-[#DCC7AA] pt-4 mt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-bold text-[#4E3B2C]">Total</span>
                      <span className="text-2xl font-extrabold text-[#4E3B2C]">
                        KES {totalWithShipping.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#A6754D] text-white py-4 rounded-lg font-bold text-md hover:bg-[#8D5F3B] transition-all shadow-md active:scale-[0.98] mb-4"
                >
                  {isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}
                </button>

                <button
                  onClick={() => navigate("/shop")}
                  className="w-full border border-[#DCC7AA] text-[#7C6652] py-3 rounded-lg font-semibold hover:bg-[#FAF6F0] transition-colors"
                >
                  Continue Shopping
                </button>

                <div className="space-y-4 pt-6 mt-6 border-t border-[#DCC7AA]">
                  <div className="flex items-center gap-3 text-xs text-[#7C6652] uppercase tracking-widest font-bold">
                    <ShieldCheck className="h-4 w-4 text-[#A6754D]" />
                    <span>Secure Transactions</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#7C6652] uppercase tracking-widest font-bold">
                    <RotateCcw className="h-4 w-4 text-[#A6754D]" />
                    <span>Easy 7-Day Returns</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#7C6652] uppercase tracking-widest font-bold">
                    <CreditCard className="h-4 w-4 text-[#A6754D]" />
                    <span>M-Pesa & Card Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteItemId}
        title="Remove Item"
        message="Are you sure you want to remove this item from your cart?"
        confirmText="Remove"
        cancelText="Keep"
        onCancel={() => setDeleteItemId(null)}
        onConfirm={() => {
          removeFromCart(deleteItemId);
          setDeleteItemId(null);
        }}
      />
    </>
  );
}

export default CartPage;