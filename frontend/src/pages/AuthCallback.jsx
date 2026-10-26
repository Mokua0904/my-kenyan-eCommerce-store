import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { showError, showSuccess } from "../services/toast";

// 🛠️ SAFE API URL: Checks Vite env first, then falls back
const API_BASE = 
  import.meta.env?.VITE_API_URL || 
  process.env?.REACT_APP_API_URL || 
  "http://localhost:8000";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAppContext();
  const [status, setStatus] = useState("Completing sign-in…");

  useEffect(() => {
    let isMounted = true; // Prevents state updates if the component unmounts

    async function finishLogin() {
      try {
        if (isMounted) setStatus("Verifying with server…");

        const res = await fetch(`${API_BASE}/api/auth/social/token/`, {
          method: "GET",
          credentials: "include", // Send the allauth session cookie
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error("Session verification failed.");
        }

        const data = await res.json();

        // 🛠️ FIX 1: Use the correct token key "access_token" to match the rest of the app
        localStorage.setItem("access_token", data.token);

        // 🛠️ FIX 2: Safely update the user context
        if (setUser && isMounted) {
          setUser({
            email: data.email,
            first_name: data.first_name, // Match the backend serializer naming
            last_name: data.last_name,
            first_name: data.first_name,
          });
        }

        if (isMounted) {
          showSuccess(`Welcome, ${data.first_name || data.email}!`);
          setStatus("Done! Redirecting…");
        }

        // Redirect to where the user was trying to reach, or home
        const redirectTo = sessionStorage.getItem("loginRedirect") || "/";
        sessionStorage.removeItem("loginRedirect");
        
        // Small delay to let the user see the success message
        setTimeout(() => {
          if (isMounted) navigate(redirectTo, { replace: true });
        }, 1000);

      } catch (err) {
        console.error("AuthCallback error:", err);
        if (isMounted) {
          setStatus("Sign-in failed. Redirecting…");
          showError("Social login failed. Please try again.");
        }
        setTimeout(() => {
          if (isMounted) navigate("/login", { replace: true });
        }, 2000);
      }
    }

    finishLogin();

    return () => {
      isMounted = false;
    };
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4]">
      <div className="text-center bg-white p-10 rounded-2xl shadow-xl border border-[#DCC7AA] max-w-sm w-full">
        <div className="w-12 h-12 border-4 border-[#DCC7AA] border-t-[#A6754D] rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-bold text-[#4E3B2C] mb-2">Almost there...</h2>
        <p className="text-[#7C6652] font-medium">{status}</p>
      </div>
    </div>
  );
}