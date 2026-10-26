import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";
import { ShieldCheck, User, MapPin, Phone, Mail, Lock } from "lucide-react";

export default function CheckoutPaypalPage() {
  const { cart = [], placeOrder } = useAppContext();
  const navigate = useNavigate();
  const [paypalEmail, setPaypalEmail] = useState("");
  const [address, setAddress] = useState({
    full_name: "", phone_number: "", address_line1: "",
    address_line2: "", city: "", county: "", postal_code: ""
  });
  const [processing, setProcessing] = useState(false);

  const handleChange = (key, value) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    const paypalWindow = window.open("", "_blank");
    if (!paypalWindow) {
      showError("Popup was blocked. Please allow popups for this site and try again.");
      setProcessing(false);
      return;
    }

    paypalWindow.document.write(`
      <html>
        <head><title>Connecting to PayPal...</title></head>
        <body style="font-family:sans-serif;display:flex;align-items:center;
                     justify-content:center;height:100vh;margin:0;background:#F4EDE4;">
          <div style="text-align:center;">
            <h2 style="color:#A6754D;">Connecting to PayPal...</h2>
            <p style="color:#7C6652;">Please wait, do not close this tab.</p>
          </div>
        </body>
      </html>
    `);

    let orderId = null;

    try {
      const token = localStorage.getItem("access_token");

      // Step 1: Create order
      let order;
      try {
        order = await placeOrder({
          address,
          items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        });
        orderId = order.id;
      } catch (orderErr) {
        paypalWindow.close();
        throw new Error("Failed to create order: " + (orderErr.message || "Unknown error"));
      }

      // Step 2: Initiate PayPal
      let initRes, initData;
      try {
        initRes = await fetch(`${API_BASE_URL}/api/payments/paypal/initiate/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ order_id: orderId, email_hint: paypalEmail }),
        });
        initData = await initRes.json();
      } catch (fetchErr) {
        paypalWindow.close();
        showError("PayPal connection failed. Your order was saved — redirecting to your orders...");
        setTimeout(() => navigate("/orders"), 2000);
        return;
      }

      if (!initRes.ok) {
        paypalWindow.close();
        showError((initData?.error || "PayPal error") + " — your order was saved.");
        setTimeout(() => navigate("/orders"), 2000);
        return;
      }

      // Step 3: Redirect tab to PayPal
      if (initData.approval_url) {
        paypalWindow.location.href = initData.approval_url;
        showSuccess("PayPal opened! Complete payment there, then check your orders.");

        // Step 4: Poll for confirmation
        for (let i = 0; i < 20; i += 1) {
          const statusRes = await fetch(`${API_BASE_URL}/api/payments/status/${orderId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const statusData = await statusRes.json();

          if (statusData.status === "completed") {
            showSuccess("Payment successful!");
            navigate("/orders");
            return;
          }

          if (statusData.status === "failed") {
            await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel/`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
            throw new Error("Payment failed. Order was cancelled.");
          }

          await new Promise((r) => setTimeout(r, 2000));
        }

        showSuccess("Payment is being confirmed. Check your orders for status.");
        navigate("/orders");

      } else {
        paypalWindow.close();
        throw new Error("No PayPal approval URL returned from server.");
      }

    } catch (err) {
      showError(err.message || "Payment initiation failed");
      if (orderId) {
        setTimeout(() => navigate("/orders"), 2000);
      }
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
          <h1 className="text-3xl font-bold text-[#4E3B2C] mb-2">Secure Checkout</h1>
          <p className="text-[#7C6652]">Complete your delivery details to pay with PayPal.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-xl overflow-hidden">
          
          <div className="bg-[#FAF6F0] border-b border-[#DCC7AA] p-4 flex items-center justify-center gap-2">
            <ShieldCheck size={20} className="text-[#A6754D]" />
            <span className="text-sm font-semibold text-[#4E3B2C]">Your information is safe and secure</span>
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

            {/* PayPal Section */}
            <div className="border-t border-[#DCC7AA] pt-6">
              <h2 className="text-lg font-bold text-[#4E3B2C] mb-4 flex items-center gap-2">
                <Lock size={18} className="text-[#A6754D]" /> Payment Method: PayPal
              </h2>
              <div>
                <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">PayPal Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A6754D]" />
                  <input required type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="your-email@example.com" className={`${inputCls} pl-10`} />
                </div>
                <p className="text-xs text-[#7C6652] mt-2">
                  You will be redirected to PayPal to complete your payment securely.
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
                  Connecting to PayPal...
                </>
              ) : (
                "Pay with PayPal"
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