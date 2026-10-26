import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Smartphone, CreditCard, ArrowRight, Lock } from "lucide-react";
import Layout from "../components/Layout/Layout"; // Assuming you want the header/footer

export default function CheckoutPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen bg-[#F4EDE4] py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-full border border-[#DCC7AA] mb-4 shadow-sm">
              <Lock size={24} className="text-[#A6754D]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#4E3B2C] mb-3">Secure Checkout</h1>
            <p className="text-[#7C6652] max-w-md mx-auto">
              Please select your preferred payment method below to complete your order.
            </p>
          </div>

          {/* Payment Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* M-PESA Option (Highlighted) */}
            <button
              onClick={() => navigate('/checkout/mpesa')}
              className="group relative bg-white border-2 border-[#DCC7AA] hover:border-[#A6754D] rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-xl flex flex-col items-start"
            >
              <div className="absolute top-4 right-4 bg-[#A6754D] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                Recommended
              </div>
              
              <div className="w-14 h-14 bg-[#FAF6F0] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone size={28} className="text-[#A6754D]" />
              </div>
              
              <h2 className="text-2xl font-bold text-[#4E3B2C] mb-2">M-PESA</h2>
              <p className="text-sm text-[#7C6652] mb-6 flex-1">
                Pay instantly and securely using your Safaricom line. You will receive an STK push on your phone.
              </p>
              
              <div className="flex items-center gap-2 text-[#A6754D] font-bold text-sm">
                Pay with M-Pesa <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* PayPal Option */}
            <button
              onClick={() => navigate('/checkout/paypal')}
              className="group relative bg-white border-2 border-[#DCC7AA] hover:border-[#A6754D] rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-xl flex flex-col items-start"
            >
              <div className="w-14 h-14 bg-[#FAF6F0] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CreditCard size={28} className="text-[#A6754D]" />
              </div>
              
              <h2 className="text-2xl font-bold text-[#4E3B2C] mb-2">PayPal</h2>
              <p className="text-sm text-[#7C6652] mb-6 flex-1">
                Pay using your PayPal balance or linked credit/debit card securely from anywhere in the world.
              </p>
              
              <div className="flex items-center gap-2 text-[#A6754D] font-bold text-sm">
                Pay with PayPal <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

          </div>

          {/* Trust Badge */}
          <div className="mt-12 flex items-center justify-center gap-2 text-[#7C6652] text-sm font-medium">
            <ShieldCheck size={18} className="text-green-600" />
            All transactions are encrypted and 100% secure.
          </div>

        </div>
      </div>
    </Layout>
  );
}