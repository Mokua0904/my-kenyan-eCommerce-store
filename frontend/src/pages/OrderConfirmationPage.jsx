import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import { CheckCircle, Clock, XCircle, Download, ShoppingBag, Home, PhoneCall } from "lucide-react";

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);

  const token = localStorage.getItem("access_token");
  const BASE = `${API_BASE_URL}/api`;

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 15;

    const poll = async () => {
      try {
        const res = await fetch(`${BASE}/payments/status/${orderId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setData(json);
        setLoading(false);

        if (json.status === "completed" || json.status === "failed") {
          setPolling(false);
          return;
        }

        attempts += 1;
        if (attempts >= maxAttempts) {
          setPolling(false);
          return;
        }

        setTimeout(poll, 3000);
      } catch {
        setLoading(false);
        setPolling(false);
      }
    };

    poll();
  }, [orderId, token, BASE]);

  const handleDownloadReceipt = () => {
    window.open(`${BASE}/payments/receipt/${orderId}/`, "_blank");
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F4EDE4] p-4">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-lg border border-[#DCC7AA]">
          <div className="w-10 h-10 border-4 border-[#DCC7AA] border-t-[#A6754D] rounded-full animate-spin mx-auto" />
          <p className="text-[#7C6652] mt-4 font-medium">Checking payment status...</p>
        </div>
      </div>
    );
  }

  const isCompleted = data?.status === "completed";
  const isFailed = data?.status === "failed";
  const isPending = !isCompleted && !isFailed;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#F4EDE4] p-4 py-12">
      <div className="bg-white rounded-2xl p-8 md:p-10 max-w-lg w-full text-center shadow-xl border border-[#DCC7AA]">
        
        {/* Dynamic Icon based on status */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isCompleted ? "bg-green-100" : isFailed ? "bg-red-100" : "bg-yellow-100"
        }`}>
          {isCompleted ? (
            <CheckCircle size={48} className="text-green-600" />
          ) : isFailed ? (
            <XCircle size={48} className="text-red-600" />
          ) : (
            <Clock size={48} className="text-yellow-600" />
          )}
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl md:text-3xl font-bold text-[#4E3B2C] mb-3">
          {isCompleted ? "Payment Successful!" : isFailed ? "Payment Failed" : "Payment Pending"}
        </h1>

        <p className="text-[#7C6652] text-sm md:text-base mb-6 leading-relaxed">
          {isCompleted
            ? "Asante sana! Your order has been confirmed. A rider will call you shortly to arrange delivery."
            : isFailed
            ? "Your payment could not be completed. Please try again or choose Cash on Delivery."
            : polling
            ? "We are waiting for your M-Pesa confirmation. Please enter your PIN on your phone."
            : "Payment is still being confirmed. Check your orders page for the latest status."}
        </p>

        {/* Polling Indicator (Only shows when pending) */}
        {isPending && polling && (
          <div className="flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 rounded-lg py-3 px-4 mb-6 border border-yellow-200">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-sm font-medium">Waiting for M-PESA confirmation...</span>
          </div>
        )}

        {/* Nairobi Delivery Note */}
        {isCompleted && (
          <div className="flex items-start gap-3 bg-[#FAF6F0] border border-[#DCC7AA] rounded-lg p-4 mb-6 text-left">
            <PhoneCall className="text-[#A6754D] shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-[#4E3B2C]">
              <strong>Delivery Info:</strong> If you are in Nairobi CBD, our rider will call you before arriving. You can also pick up your order at our shop.
            </p>
          </div>
        )}

        {/* Order Details Box */}
        <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left border border-gray-100">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-sm text-gray-500">Order ID</span>
            <span className="text-sm font-semibold text-[#4E3B2C]">#{orderId}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-sm text-gray-500">Payment Method</span>
            <span className="text-sm font-semibold text-[#4E3B2C] uppercase">{data?.provider ?? "M-PESA"}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">Status</span>
            <span className={`text-sm font-bold capitalize ${
              isCompleted ? "text-green-600" : isFailed ? "text-red-600" : "text-yellow-600"
            }`}>
              {data?.status ?? "pending"}
            </span>
          </div>
          {data?.result_desc && (
            <div className="flex justify-between items-start py-2 border-t border-gray-200 mt-2">
              <span className="text-sm text-gray-500 shrink-0 mr-4">Note</span>
              <span className="text-sm text-gray-700 text-right">{data.result_desc}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {isCompleted && data?.has_receipt && (
            <button 
              onClick={handleDownloadReceipt}
              className="w-full flex items-center justify-center gap-2 bg-[#A6754D] text-white py-3 rounded-lg font-semibold hover:bg-[#8D5F3B] transition shadow-md"
            >
              <Download size={18} /> Download Receipt
            </button>
          )}
          
          <Link 
            to="/orders" 
            className="w-full flex items-center justify-center gap-2 bg-white text-[#4E3B2C] border border-[#DCC7AA] py-3 rounded-lg font-semibold hover:bg-[#F4EDE4] transition"
          >
            <ShoppingBag size={18} /> View My Orders
          </Link>
          
          <Link 
            to="/" 
            className="w-full flex items-center justify-center gap-2 text-[#7C6652] py-3 rounded-lg font-medium hover:text-[#4E3B2C] transition"
          >
            <Home size={18} /> Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}