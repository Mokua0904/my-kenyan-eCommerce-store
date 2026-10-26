import React, { useState } from "react";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/auth/password/reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
        showSuccess("Password reset link sent to your email.");
      } else {
        showError("Unable to send reset link. Please check the email address.");
      }
    } catch {
      showError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- SUCCESS SCREEN ---
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#F4EDE4] py-12">
        <div className="max-w-md w-full bg-white border border-[#DCC7AA] rounded-2xl p-10 shadow-xl text-center">
          <div className="w-20 h-20 bg-[#FAF6F0] text-[#A6754D] border border-[#DCC7AA] rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-[#4E3B2C]">Check your email</h1>
          <p className="text-[#7C6652] mb-8 leading-relaxed">
            We sent a password reset link to <br />
            <span className="font-semibold text-[#A6754D]">{email}</span>.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setSubmitted(false)}
              className="w-full bg-[#A6754D] text-white py-3 rounded-xl font-semibold hover:bg-[#8D5F3B] transition-all shadow-md"
            >
              Resend the link
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center w-full text-[#7C6652] hover:text-[#4E3B2C] font-medium transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" /> Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- FORM SCREEN ---
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F4EDE4] py-12">
      <div className="max-w-md w-full bg-white border border-[#DCC7AA] rounded-2xl p-8 shadow-2xl">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#4E3B2C] mb-3">Forgot Password?</h1>
          <p className="text-[#7C6652] leading-relaxed">
            A password reset link will be sent to your email address if you are already registered.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#4E3B2C] mb-2 ml-1 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-[#DCC7AA] rounded-xl px-4 py-3 text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]/30 focus:border-[#A6754D] transition-all"
              placeholder="Enter your registered email"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#A6754D] text-white rounded-xl py-4 font-bold hover:bg-[#8D5F3B] disabled:opacity-70 transition-all flex items-center justify-center shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Sending Link...
              </span>
            ) : (
              <span className="flex items-center">
                Send Reset Link <Send size={18} className="ml-2" />
              </span>
            )}
          </button>

          <div className="relative text-center my-2">
            <hr className="border-[#DCC7AA]" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-[#A6754D] font-bold">
              OR
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-center text-[#7C6652] hover:text-[#4E3B2C] font-semibold transition-colors text-sm"
          >
            Back to Sign In
          </button>
        </form>
      </div>
    </div>
  );
}