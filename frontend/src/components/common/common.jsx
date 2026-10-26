import React from "react";
import { X, AlertTriangle, CheckCircle } from "lucide-react";

// 🛠️ FIX: Replaced undefined custom classes with standard Tailwind colors
const STATUS_STYLES = {
  active:    "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  approved:  "bg-green-100 text-green-700",
  
  pending:   "bg-yellow-100 text-yellow-700",
  processing:"bg-yellow-100 text-yellow-700",
  
  shipped:   "bg-blue-100 text-blue-700",
  info:      "bg-blue-100 text-blue-700",
  
  inactive:  "bg-gray-100 text-gray-500",
  draft:     "bg-gray-100 text-gray-500",
  refunded:  "bg-gray-100 text-gray-500",
  
  cancelled: "bg-red-100 text-red-700",
  banned:    "bg-red-100 text-red-700",
  rejected:  "bg-red-100 text-red-700",
};

export function StatusBadge({ status }) {
  const safeStatus = status?.toLowerCase() || "inactive";
  const style = STATUS_STYLES[safeStatus] || STATUS_STYLES.inactive;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${style}`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

export function Avatar({ user, size = 32 }) {
  const initials =
    ((user?.first_name?.[0] || "") + (user?.last_name?.[0] || "")).toUpperCase() || "?";
  const style = { width: size, height: size, fontSize: size * 0.38 };

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt=""
        className="rounded-full object-cover shrink-0 border border-[#DCC7AA]"
        style={style}
        onError={(e) => { e.target.style.display = 'none'; }} // Safe fallback
      />
    );
  }
  return (
    <div
      className="rounded-full bg-[#FAF6F0] border border-[#DCC7AA] text-[#A6754D] flex items-center justify-center font-bold shrink-0"
      style={style}
    >
      {initials}
    </div>
  );
}

export function Spinner({ size = 24 }) {
  return (
    <div
      className="rounded-full border-2 border-[#DCC7AA] border-t-[#A6754D] animate-spin"
      style={{ width: size, height: size }}
    />
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#7C6652]">
      <Spinner size={32} />
      <span className="text-sm font-medium">Loading...</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-[#FAF6F0] border border-[#DCC7AA] flex items-center justify-center text-[#A6754D] mb-1">
          <Icon size={28} />
        </div>
      )}
      <div className="text-base font-bold text-[#4E3B2C]">{title}</div>
      {description && <div className="text-sm text-[#7C6652]">{description}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, badge, badgeColor }) {
  return (
    <div className="bg-white border border-[#DCC7AA] rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200">
      <div className="w-10 h-10 rounded-lg bg-[#FAF6F0] text-[#A6754D] flex items-center justify-center mb-3">
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold text-[#4E3B2C] leading-tight mb-1">{value}</div>
      <div className="text-xs text-[#7C6652] font-semibold">{label}</div>
      {badge && (
        <div className={`mt-1.5 text-xs font-bold ${badgeColor || "text-green-600"}`}>
          {badge}
        </div>
      )}
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.15s_ease]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full overflow-y-auto max-h-[90vh] border border-[#DCC7AA] animate-[slideUp_0.2s_ease]"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCC7AA] bg-[#FAF6F0] sticky top-0 z-10">
          <h3 className="text-lg font-bold text-[#4E3B2C]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DCC7AA] text-[#7C6652] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all bg-white"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = false }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-[#DCC7AA]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center mb-5">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${danger ? "bg-red-50 text-red-500" : "bg-[#FAF6F0] text-[#A6754D]"}`}>
            {danger ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
          </div>
          <div className="text-lg font-bold text-[#4E3B2C] mb-2">{title}</div>
          <div className="text-sm text-[#7C6652] leading-relaxed">{message}</div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[#DCC7AA] text-[#4E3B2C] text-sm font-bold hover:bg-[#FAF6F0] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-bold transition-all shadow-md ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-[#A6754D] hover:bg-[#8D5F3B]"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const btnBase = "min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg border text-sm transition-all cursor-pointer font-bold ";
  const btnDefault = "border-[#DCC7AA] bg-white text-[#7C6652] hover:bg-[#FAF6F0] hover:border-[#A6754D] hover:text-[#A6754D]";
  const btnActive = "border-[#A6754D] bg-[#A6754D] text-white";
  const btnDisabled = "opacity-40 cursor-not-allowed";

  return (
    <div className="flex items-center justify-center sm:justify-end gap-1 px-4 py-3.5 border-t border-[#DCC7AA] bg-[#FAF6F0]">
      <button
        className={btnBase + (currentPage === 1 ? btnDisabled : btnDefault)}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </button>

      {start > 1 && (
        <>
          <button className={btnBase + btnDefault} onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span className="px-1 text-[#7C6652]">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={btnBase + (p === currentPage ? btnActive : btnDefault)}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-[#7C6652]">…</span>}
          <button className={btnBase + btnDefault} onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        className={btnBase + (currentPage === totalPages ? btnDisabled : btnDefault)}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    </div>
  );
}