import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";
import { ShieldCheck, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState({ new_password1: "", new_password2: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.new_password1 !== password.new_password2)
      return showError("Passwords do not match.");
    if (password.new_password1.length < 8)
      return showError("Password must be at least 8 characters.");

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/auth/password/reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          token,
          new_password1: password.new_password1,
          new_password2: password.new_password2,
        }),
      });

      if (res.ok) {
        setDone(true);
        showSuccess("Password reset successfully!");
      } else {
        const data = await res.json().catch(() => ({}));
        const message = data?.detail || "Failed to reset password. The link may have expired.";
        showError(message);
      }
    } catch {
      showError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- SUCCESS SCREEN ---
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#F4EDE4] py-12">
        <div className="max-w-md w-full bg-white border border-[#DCC7AA] rounded-2xl p-10 shadow-xl text-center">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-[#4E3B2C]">All Set!</h1>
          <p className="text-[#7C6652] mb-8 leading-relaxed">
            Your password has been securely updated. You can now log back into your account.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-[#A6754D] text-white rounded-xl py-4 font-bold hover:bg-[#8D5F3B] transition-all shadow-lg"
          >
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  // --- FORM SCREEN ---
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F4EDE4] py-12">
      <div className="max-w-md w-full bg-white border border-[#DCC7AA] rounded-2xl p-8 shadow-2xl">
        
        <div className="mb-8 text-center">
          <div className="inline-flex p-3 bg-[#FAF6F0] text-[#A6754D] rounded-xl mb-4 border border-[#DCC7AA]">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#4E3B2C] mb-2">New Password</h1>
          <p className="text-[#7C6652]">
            Please enter your new secure password below.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#4E3B2C] mb-2 ml-1 uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={password.new_password1}
                onChange={(e) => setPassword({ ...password, new_password1: e.target.value })}
                className="w-full bg-gray-50 border border-[#DCC7AA] rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#A6754D]/30 focus:border-[#A6754D] transition-all"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A6754D] hover:text-[#4E3B2C]"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#4E3B2C] mb-2 ml-1 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type={showPw ? "text" : "password"}
              required
              value={password.new_password2}
              onChange={(e) => setPassword({ ...password, new_password2: e.target.value })}
              className="w-full bg-gray-50 border border-[#DCC7AA] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A6754D]/30 focus:border-[#A6754D] transition-all"
              placeholder="Repeat new password"
            />
          </div>

          {/* Password Strength Meter */}
          {password.new_password1 && (
            <div>
              <div style={{ fontSize: 11, color: "#7C6652", marginBottom: 6, fontWeight: 600 }}>Password strength</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4].map(i => {
                  const score = [
                    password.new_password1.length >= 8,
                    /[A-Z]/.test(password.new_password1),
                    /[0-9]/.test(password.new_password1),
                    /[^A-Za-z0-9]/.test(password.new_password1),
                  ].filter(Boolean).length;
                  const colors = ["#e74c3c", "#e67e22", "#f39c12", "#27ae60"];
                  return <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? colors[score - 1] : "#e8e2db", transition: "background 0.2s" }} />;
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#A6754D] text-white rounded-xl py-4 font-bold hover:bg-[#8D5F3B] disabled:opacity-70 transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
          >
            <Lock size={18} />
            {isLoading ? "Updating Security..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}