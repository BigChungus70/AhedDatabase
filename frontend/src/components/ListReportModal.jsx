// src/components/ReportModal.jsx
import { useState } from "react";
import { X } from "lucide-react";
import { savedListAPI } from "../services/api";
import { toast } from "react-toastify";

export default function ReportModal({
  listId,
  initialReport,
  onClose,
  onSave,
}) {
  const [draft, setDraft] = useState(initialReport ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await savedListAPI.updateReport(listId, draft);
      onSave(draft);
      toast.success("تم حفظ التقرير", {
        position: "top-left",
        autoClose: 1500,
        theme: "colored",
        pauseOnHover: false,
        closeButton: false,
      });
      onClose();
    } catch {
      toast.error("حدث خطأ أثناء حفظ التقرير", {
        position: "top-left",
        autoClose: 1500,
        theme: "colored",
        pauseOnHover: false,
        closeButton: false,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6 flex flex-col gap-4"
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
          <h2 className="text-lg font-bold text-slate-900">📝 التقرير</h2>
        </div>

        {/* Textarea */}
        <textarea
          className="w-full border border-slate-300 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 min-h-[250px]"
          placeholder="اكتب التقرير هنا..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
        />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-medium bg-cyan-700 text-white rounded-xl hover:bg-cyan-800 transition disabled:opacity-60"
          >
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}
