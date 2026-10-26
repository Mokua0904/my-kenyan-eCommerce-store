import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({ 
  open, 
  title, 
  message, 
  confirmText = "Yes, Delete", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel,
  danger = true // Default to red for delete actions
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#DCC7AA] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Warning Icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-50 text-red-500' : 'bg-[#FAF6F0] text-[#A6754D]'}`}>
          <AlertTriangle size={28} />
        </div>

        {/* Text */}
        <h3 className="text-xl font-bold text-[#4E3B2C] text-center mb-2">
          {title}
        </h3>
        <p className="text-sm text-[#7C6652] text-center leading-relaxed mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={onCancel} 
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#DCC7AA] text-[#4E3B2C] font-bold bg-white hover:bg-[#FAF6F0] transition"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold transition shadow-md ${
              danger 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-[#A6754D] hover:bg-[#8D5F3B]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}