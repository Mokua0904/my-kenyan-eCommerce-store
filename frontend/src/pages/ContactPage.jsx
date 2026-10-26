import React, { useState } from "react";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";
import Layout from "../components/Layout/Layout";
import { Send, MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess("Message sent! We'll get back to you within 24 hours.");
        setForm({ name: "", email: "", message: "" });
      } else {
        const errorMsg =
          Object.values(data)?.[0]?.[0] ||
          data.error ||
          data.detail ||
          "Failed to send message.";
        showError(errorMsg);
      }
    } catch {
      showError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#F4EDE4] flex flex-col">
        
        {/* Hero Banner */}
        <div className="bg-[#4E3B2C] text-white py-16 px-6 text-center w-full">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-[#F4EDE4]/80 text-lg max-w-xl mx-auto">
            Have a question about an order, a product, or just want to say hello? 
            Send us a message and our team will respond promptly.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-8">
                <h3 className="text-xl font-bold text-[#4E3B2C] mb-6">Visit Our Shop</h3>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-[#FAF6F0] rounded-lg text-[#A6754D]">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#4E3B2C]">Location</p>
                      <p className="text-sm text-[#7C6652] leading-relaxed">
                        [Insert Shop Building Name],<br />
                        [Street Name], Nairobi CBD,<br />
                        Kenya
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-[#FAF6F0] rounded-lg text-[#A6754D]">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#4E3B2C]">Phone / WhatsApp</p>
                      <p className="text-sm text-[#7C6652]">+254 7XX XXX XXX</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-[#FAF6F0] rounded-lg text-[#A6754D]">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#4E3B2C]">Email</p>
                      <p className="text-sm text-[#7C6652]">hello@yourstore.co.ke</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-[#FAF6F0] rounded-lg text-[#A6754D]">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#4E3B2C]">Opening Hours</p>
                      <p className="text-sm text-[#7C6652]">
                        Mon - Sat: 8:00 AM - 6:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-8 md:p-10">
                <h2 className="text-2xl font-bold text-[#4E3B2C] mb-1">Send a Message</h2>
                <p className="text-sm text-[#7C6652] mb-8">
                  Fill in the form below and we'll get back to you as soon as possible.
                </p>

                <form onSubmit={submit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        placeholder="Full Name"
                        className="w-full border border-[#DCC7AA] rounded-lg px-4 py-3 text-[#4E3B2C] placeholder-[#B5A090] focus:outline-none focus:ring-2 focus:ring-[#A6754D]/40 focus:border-[#A6754D] transition bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        placeholder="Email Address"
                        className="w-full border border-[#DCC7AA] rounded-lg px-4 py-3 text-[#4E3B2C] placeholder-[#B5A090] focus:outline-none focus:ring-2 focus:ring-[#A6754D]/40 focus:border-[#A6754D] transition bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4E3B2C] mb-1.5">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      className="w-full border border-[#DCC7AA] rounded-lg px-4 py-3 text-[#4E3B2C] placeholder-[#B5A090] focus:outline-none focus:ring-2 focus:ring-[#A6754D]/40 focus:border-[#A6754D] transition resize-none bg-gray-50"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-[#7C6652]">
                      Your message is sent securely to our support team.
                    </p>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#A6754D] hover:bg-[#8D5F3B] disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition shadow-md"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}