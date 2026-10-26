import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../services/api";
import { Mail, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

const PAGE_SIZE = 10;

export default function NewsletterPage() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      // 🛠️ FIX: Use "access_token" to match the rest of your app
      const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");
      const res = await fetch(`${API_BASE_URL}/api/accounts/admin/newsletter/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to fetch");
      
      const data = await res.json();
      setSubs(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const totalPages = Math.ceil(subs.length / PAGE_SIZE);
  const paginated = subs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCount = subs.filter((s) => s.is_active).length;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#DCC7AA] flex items-center justify-center shadow-sm">
            <Mail size={24} className="text-[#A6754D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#4E3B2C]">Newsletter Subscriptions</h1>
            <p className="text-sm text-[#7C6652]">{subs.length} total · {activeCount} active</p>
          </div>
        </div>

        {/* Stats + Refresh */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="px-4 py-2 bg-green-50 border border-green-100 rounded-xl text-center flex-1 sm:flex-none">
            <p className="text-lg font-bold text-green-700">{activeCount}</p>
            <p className="text-xs text-green-600 font-medium">Active</p>
          </div>
          <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center flex-1 sm:flex-none">
            <p className="text-lg font-bold text-[#7C6652]">{subs.length - activeCount}</p>
            <p className="text-xs text-[#7C6652] font-medium">Inactive</p>
          </div>
          <button 
            onClick={fetchSubs} 
            className="p-2.5 bg-white border border-[#DCC7AA] rounded-xl text-[#4E3B2C] hover:bg-[#FAF6F0] transition"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A6754D]" />
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAF6F0] border-b border-[#DCC7AA]">
                  <th className="text-left px-6 py-3.5 text-[#7C6652] font-bold uppercase tracking-wider text-xs">Email</th>
                  <th className="text-left px-6 py-3.5 text-[#7C6652] font-bold uppercase tracking-wider text-xs">Status</th>
                  <th className="text-left px-6 py-3.5 text-[#7C6652] font-bold uppercase tracking-wider text-xs">Subscribed At</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-gray-100 last:border-0 transition-colors ${
                      i % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50/50 hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#A6754D]/10 flex items-center justify-center text-[#A6754D] font-bold text-xs flex-shrink-0">
                          {s.email?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[#4E3B2C] font-semibold">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        s.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#7C6652] text-xs font-medium">
                      {new Date(s.created_at).toLocaleDateString("en-KE")}
                    </td>
                  </tr>
                ))}
                {subs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <Mail size={32} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-[#7C6652]">No subscriptions yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#DCC7AA] bg-[#FAF6F0]">
                <p className="text-xs text-[#7C6652]">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, subs.length)} of {subs.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DCC7AA] text-[#7C6652] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                        p === page
                          ? "bg-[#A6754D] text-white"
                          : "border border-[#DCC7AA] text-[#7C6652] hover:bg-white bg-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DCC7AA] text-[#7C6652] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}