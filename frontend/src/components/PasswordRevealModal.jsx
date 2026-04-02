import { X, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function PasswordRevealModal({ username, password, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
          <h2 className="text-lg font-bold text-slate-900">كلمة المرور</h2>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-right">
          <p className="text-amber-700 text-sm font-medium">⚠️ تنبيه</p>
          <p className="text-amber-600 text-xs mt-1">
            ستظهر كلمة المرور هذه مرة واحدة فقط. احرص على نسخها وإعطائها
            للمستخدم الآن.
          </p>
        </div>

        {/* Credentials */}
        <div className="flex flex-col gap-3">
          <div className="bg-slate-50 rounded-xl p-4 text-right border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">اسم المستخدم</p>
            <p className="text-slate-900 font-semibold">{username}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-right border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">كلمة المرور</p>
            <p
              className="text-slate-900 font-bold text-lg tracking-widest"
              dir="ltr"
            >
              {password}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition"
          >
            إغلاق
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 text-sm font-medium bg-cyan-700 text-white rounded-xl hover:bg-cyan-800 transition inline-flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check size={16} /> تم النسخ
              </>
            ) : (
              <>
                <Copy size={16} /> نسخ كلمة المرور
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
