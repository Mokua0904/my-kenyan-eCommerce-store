import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import api, { socialAuth } from "../services/api";
import { showError, showSuccess } from "../services/toast";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

// 🛠️ SAFE CLIENT ID: Checks Vite env first, then CRA env.
// IMPORTANT: Put your actual Client ID here as a fallback so it NEVER crashes.
const GOOGLE_CLIENT_ID = 
  import.meta.env?.VITE_GOOGLE_CLIENT_ID || 
  process.env?.REACT_APP_GOOGLE_CLIENT_ID || 
  "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com";

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-[#4E3B2C]">
        {required && <span className="text-red-400 mr-1">*</span>}
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "", // Added phone for Nairobi delivery
    password: "",
    password2: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (key) => (e) => {
    setFormData((s) => ({ ...s, [key]: e.target.value }));
    setFieldErrors((s) => ({ ...s, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = "Required";
    if (!formData.lastName.trim()) errs.lastName = "Required";
    if (!formData.email.trim()) errs.email = "Email is required";
    // Simple Kenyan phone validation (starts with 07, 01, or +254)
    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required for delivery.";
    } else if (!/^(?:\+254|0)[17]\d{8}$/.test(formData.phone.replace(/\s+/g, ''))) {
      errs.phone = "Please enter a valid Kenyan phone number (e.g., 0712345678).";
    }
    if (!formData.password) errs.password = "Password is required";
    if (formData.password !== formData.password2)
      errs.password2 = "Passwords do not match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // --- MANUAL REGISTRATION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/accounts/register/", {
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone, // Send phone to backend
      });
      showSuccess("Account created successfully!");
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data) {
        setFieldErrors(err.response.data);
        showError("Registration failed. Please check the fields.");
      } else {
        showError("Backend unreachable. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE SIGNUP ---
  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        await socialAuth('google', tokenResponse.access_token);
        showSuccess("Google sign-up successful!");
        navigate("/");
      } catch (err) {
        showError(err.response?.data?.non_field_errors?.[0] || "Google sign-up failed.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => showError("Google sign-in was cancelled or failed."),
  });

  // --- FACEBOOK SIGNUP ---
  const handleFacebookSignup = () => {
    if (!window.FB) {
      showError("Facebook SDK not loaded. Please refresh and try again.");
      return;
    }
    window.FB.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          setLoading(true);
          socialAuth('facebook', response.authResponse.accessToken)
            .then(() => {
              showSuccess("Facebook sign-up successful!");
              navigate("/");
            })
            .catch((err) => {
              showError(err.response?.data?.non_field_errors?.[0] || "Facebook sign-up failed.");
            })
            .finally(() => setLoading(false));
        } else {
          showError("Facebook login was cancelled.");
        }
      },
      { scope: "email,public_profile" }
    );
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-lg border border-[#DCC7AA] text-sm text-[#4E3B2C] bg-white outline-none focus:ring-2 focus:ring-[#A6754D]/20 focus:border-[#A6754D] transition";

  return (
    <Layout>
      <div className="min-h-screen flex flex-col md:flex-row w-full">
        {/* Left Branding Panel */}
        <div className="hidden md:flex md:w-5/12 bg-[#A6754D] text-white p-12 flex-col justify-between items-center text-center">
          <Link to="/" className="self-start flex items-center gap-1 text-sm text-white no-underline hover:underline">
            <ChevronLeft size={16} /> Home Page
          </Link>
          <div className="max-w-xs">
            <h1 className="text-5xl font-bold mb-6">Get Started</h1>
            <p className="text-[#F4EDE4]/80 mb-10">Join us to shop the best new arrivals and curated thrift (mitumba) in Nairobi.</p>
            <p className="text-[#F4EDE4]/80 mb-4">Already have an account?</p>
            <Link
              to="/login"
              className="inline-block px-12 py-3 border-2 border-white text-white no-underline rounded-full font-bold hover:bg-white hover:text-black transition"
            >
              Log in
            </Link>
          </div>
          <div className="text-xs opacity-60">© {new Date().getFullYear()} Nairobi Fashion</div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-7/12 bg-[#F4EDE4] flex items-center justify-center p-8 md:p-16">
          <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl border border-[#DCC7AA] shadow-sm">
            <h2 className="text-2xl font-bold text-[#4E3B2C] mb-6">Create account</h2>

            <div className="flex gap-3 mb-5">
              <button
                type="button"
                onClick={() => handleGoogleSignup()}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[#DCC7AA] rounded-lg bg-white hover:bg-[#F4EDE4] transition text-sm font-medium text-[#4E3B2C]"
              >
                <svg className="w-4 h-4" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                  <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={handleFacebookSignup}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-medium transition hover:opacity-90 bg-[#1877F2]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            <div className="relative text-center mb-5">
              <hr className="border-[#DCC7AA]" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-[#B5A090]">
                OR
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Field label="First Name" required error={fieldErrors.first_name || fieldErrors.firstName}>
                  <input type="text" placeholder="First Name" className={inputCls} onChange={handleChange("firstName")} />
                </Field>
                <Field label="Last Name" required error={fieldErrors.last_name || fieldErrors.lastName}>
                  <input type="text" placeholder="Last Name" className={inputCls} onChange={handleChange("lastName")} />
                </Field>
              </div>

              <Field label="Email" required error={fieldErrors.email}>
                <input type="email" placeholder="Email Address" className={inputCls} onChange={handleChange("email")} />
              </Field>

              {/* 🇰🇪 Added Phone Number Field */}
              <Field label="Phone Number (for delivery)" required error={fieldErrors.phone}>
                <input 
                  type="tel" 
                  placeholder="07XX XXX XXX" 
                  className={inputCls} 
                  onChange={handleChange("phone")} 
                  value={formData.phone}
                />
              </Field>

              <Field label="Password" required error={fieldErrors.password}>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className={`${inputCls} pr-11`}
                    onChange={handleChange("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B5A090]"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>

              <Field label="Confirm Password" required error={fieldErrors.password2}>
                <input type="password" placeholder="••••••••" className={inputCls} onChange={handleChange("password2")} />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#A6754D] hover:bg-[#8D5F3B] text-white font-bold rounded-lg transition mt-2"
              >
                {loading ? "Processing..." : "Sign up"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function RegisterPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RegisterForm />
    </GoogleOAuthProvider>
  );
}