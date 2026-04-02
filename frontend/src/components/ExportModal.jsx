import { useState } from "react";
import { DownloadIcon, X } from "lucide-react";
import Switch from "react-switch";
import { savedListAPI } from "../services/api";
import { toast } from "react-toastify";

const CURRENT_YEAR = new Date().getFullYear();

export default function ExportModal({ listId, onClose }) {
  const [residence, setResidence] = useState(false);
  const [children, setChildren] = useState(false);
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [loading, setLoading] = useState(false);

  const ageError =
    minAge && maxAge && parseInt(minAge) > parseInt(maxAge)
      ? "العمر الأدنى يجب أن يكون أقل من العمر الأقصى"
      : null;

  const handleExport = async () => {
    if (ageError) return;
    setLoading(true);
    try {
      await savedListAPI.exportList(listId, {
        residence,
        children,
        minDOB: maxAge ? CURRENT_YEAR - parseInt(maxAge) : null,
        maxDOB: minAge ? CURRENT_YEAR - parseInt(minAge) : null,
      });
      onClose();
    } catch {
      toast.error("حدث خطأ أثناء الطباعة", {
        position: "top-left",
        autoClose: 1500,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">خيارات الطباعة</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toggles */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3 text-right">
            أعمدة إضافية
          </p>
          <div className="flex flex-col gap-3">
            {[
              {
                label: "منطقة السكن",
                value: residence,
                onChange: setResidence,
              },
              { label: "الأطفال", value: children, onChange: setChildren },
            ].map(({ label, value, onChange }) => (
              <div
                key={label}
                className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 hover:bg-slate-100 transition"
              >
                <span className="text-sm font-medium text-slate-700">
                  {label}
                </span>
                <Switch
                  checked={value}
                  onChange={onChange}
                  onColor="#00b345"
                  offColor="#E2E8F0"
                  height={20}
                  width={40}
                  handleDiameter={16}
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Age range — only when children enabled */}
        {children && (
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-700 mb-3 text-right">
              تصفية الأطفال حسب العمر
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "من عمر", value: minAge, setter: setMinAge },
                { label: "إلى عمر", value: maxAge, setter: setMaxAge },
              ].map(({ label, value, setter }) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500 text-right">
                    {label}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    placeholder="—"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      ageError ? "border-red-400" : "border-slate-300"
                    }`}
                  />
                  {value !== "" && !ageError && (
                    <p className="text-xs text-cyan-700 text-center font-medium">
                      مواليد {CURRENT_YEAR - parseInt(value)}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {ageError && (
              <p className="text-xs text-red-500 text-right mt-2">{ageError}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="cursor-pointer inline-flex items-center justify-center gap-2
      px-4 py-2.5 text-sm font-medium
      text-gray-600 hover:text-white
      bg-white hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-600
      border border-gray-300 hover:border-gray-500 
      rounded-xl transition-all duration-200 
      shadow-sm hover:shadow-md hover:shadow-teal-500/25 
      transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            إلغاء
          </button>
          <button
            onClick={handleExport}
            disabled={loading || !!ageError}
            className="cursor-pointer inline-flex items-center justify-center gap-2
      px-4 py-2.5 text-sm font-medium
      text-green-600 hover:text-white 
      bg-white hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600
      border border-green-300 hover:border-green-500 
      rounded-xl transition-all duration-200 
      shadow-sm hover:shadow-md hover:shadow-teal-500/25 
      transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            {loading ? (
              <span className="animate-pulse">جاري الطباعة...</span>
            ) : (
              <>
                <DownloadIcon size={16} /> طباعة
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
