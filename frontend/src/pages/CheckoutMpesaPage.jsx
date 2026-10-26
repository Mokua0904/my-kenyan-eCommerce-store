import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";
import { ShieldCheck, Smartphone, MapPin, User, Phone, Lock } from "lucide-react";

export default function CheckoutMpesaPage() {
  const { cart = [], placeOrder } = useAppContext();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState({
    full_name: "", phone_number: "", address_line1: "",
    address_line2: "", city: "", county: "", postal_code: "",
  });
  const [processing, setProcessing] = useState(false);

  const BASE = `${API_BASE_URL}/api`;
  const formatPhone = (value) => value.replace(/\D/g, "").replace(/^0/, "254");

  const handleChange = (key, value) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    let orderId = null;

    try {
      const order = await placeOrder({
        address,
        items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      });
      orderId = order.id;

      const token = localStorage.getItem("access_token");

      const payRes = await fetch(`${BASE}/payments/initiate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          phone_number: formatPhone(phoneNumber),
        }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || "M-PESA initiation failed");

      showSuccess("M-PESA prompt sent. Complete payment on your phone.");

      for (let i = 0; i < 20; i += 1) {
        const statusRes = await fetch(`${BASE}/payments/status/${orderId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statusData = await statusRes.json();

        if (statusData.status === "completed") {
          showSuccess("Payment successful!");
          navigate("/orders");
          return;
        }

        if (statusData.status === "failed") {
          await fetch(`${BASE}/orders/${orderId}/cancel/`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          throw new Error("Payment failed. Order was cancelled.");
        }

        await new Promise((r) => setTimeout(r, 2000));
      }

      // Timeout — don't cancel, redirect to orders
      showSuccess("Payment is being confirmed. Check your orders for status.");
      navigate("/orders");

    } catch (err) {
      showError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const inputCls = "w-full border border-[#DCC7AA] rounded-lg px-4 py-3 text-sm text-[#4E3B2C] bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#A6754D]/30 focus:border-[#A6754D] transition";

  return (
    <div className="min-h-screen bg-[#F4EDE4] py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#4E3B2C] mb-2">M-PESA Checkout</h1>
          <p className="text-[#7C6652]">Complete your delivery details to pay via Safaricom M-PESA.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-xl overflow-hidden">
          
          <div className="bg-[#FAF6F0] border-b border-[#DCC7AA] p-4 flex items-center justify-center gap-2">
            <ShieldCheck size={20} className="text-[#A6754D]" />
            <span className="text-sm font-semibold text-[#4E3B2C]">Secure Checkout</span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            {/* Delivery Details Section */}
            <div>
              <h2 className="text-lg font-bold text-[#4E3B2C] mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-[#A6754D]" /> Delivery Information
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A6754D]" />
                      <input required value={address.full_name} onChange={(e) => handleChange("full_name", e.target.value)} placeholder="Jane Doe" className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A6754D]" />
                      <input required type="tel" value={address.phone_number} onChange={(e) => handleChange("phone_number", e.target.value)} placeholder="0712 345 678" className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">Street Address / Building <span className="text-red-500">*</span></label>
                  <input required value={address.address_line1} onChange={(e) => handleChange("address_line1", e.target.value)} placeholder="e.g., Bazaar Plaza, Moi Avenue" className={inputCls} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">Apartment / Suite / Landmark (Optional)</label>
                  <input value={address.address_line2} onChange={(e) => handleChange("address_line2", e.target.value)} placeholder="e.g., 4th Floor, Room 402" className={inputCls} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">City <span className="text-red-500">*</span></label>
                    <input required value={address.city} onChange={(e) => handleChange("city", e.target.value)} placeholder="Nairobi" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">County (Optional)</label>
                    <input value={address.county} onChange={(e) => handleChange("county", e.target.value)} placeholder="Nairobi" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">Postal Code (Optional)</label>
                    <input value={address.postal_code} onChange={(e) => handleChange("postal_code", e.target.value)} placeholder="00100" className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="border-t border-[#DCC7AA] pt-6">
              <h2 className="text-lg font-bold text-[#4E3B2C] mb-4 flex items-center gap-2">
                <Lock size={18} className="text-[#A6754D]" /> M-PESA Payment
              </h2>
              <div>
                <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">Safaricom Phone Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A6754D]" />
                  <input
                    required
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g., 0712345678"
                    className={`${inputCls} pl-10 bg-green-50/30 border-green-200 focus:ring-green-500/30 focus:border-green-500`}
                  />
                </div>
                <p className="text-xs text-[#7C6652] mt-2 flex items-center gap-1">
                  <ShieldCheck size={14} className="text-green-600" />
                  You will receive an STK push prompt on your phone to enter your M-PESA PIN.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-[#A6754D] hover:bg-[#8D5F3B] disabled:opacity-60 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Waiting for M-PESA Prompt...
                </>
              ) : (
                <>
                  <Smartphone size={20} />
                  Pay with M-PESA
                </>
              )}
            </button>
            
            <p className="text-center text-xs text-[#7C6652] mt-2">
              By placing this order, you agree to our Terms & Conditions.
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}