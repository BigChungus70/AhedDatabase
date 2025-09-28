import { Edit, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function ListEdit({
  name,
  description,
  campaign,
  campaigns,
  onSubmit,
  onClose,
}) {
  const [listName, setListName] = useState(name);
  const [listDescription, setListDescription] = useState(description);
  const [listCampaign, setListCampaign] = useState(campaign);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleSubmit = () => {
    onSubmit({
      name: listName,
      description: listDescription,
      campaign: listCampaign,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col">
        {/* header */}
        <div
          className="flex items-center justify-between p-6 border-b px-6 py-5 
        bg-gradient-to-r from-cyan-600 to-emerald-600 text-white rounded-t-xl"
        >
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Edit className="h-6 w-6" />
            تحديث القائمة
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-slate-800 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-5 grid gap-5 text-sm text-slate-700">
          <label className="block">
            <span className="mb-1 block font-medium">اسم القائمة</span>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
              placeholder="مثال: عائلات منطقة الشمال"
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-medium">وصف القائمة</span>
            <textarea
              rows={4}
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none transition"
              placeholder="اكتب ملاحظات أو تفاصيل…"
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-medium">الحملة</span>
            <select
              value={listCampaign}
              onChange={(e) => setListCampaign(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
            >
              {Object.entries(campaigns).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            
          </label>
        </div>

        {/* footer */}
        <div className="px-6 py-4 flex gap-3 justify-end bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="cursor-pointer
       inline-flex items-center justify-center gap-2
      px-4 py-2.5 text-sm font-medium
      text-red-600 hover:text-white 
      bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600
      border border-red-300 hover:border-red-500 
      rounded-xl transition-all duration-200 
      shadow-sm hover:shadow-md hover:shadow-teal-500/25 
      transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            className="cursor-pointer
      inline-flex items-center justify-center gap-2
      px-4 py-2.5 text-sm font-medium
      text-teal-600 hover:text-white 
      bg-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500
      border border-teal-300 hover:border-teal-500 
      rounded-xl transition-all duration-200 
      shadow-sm hover:shadow-md hover:shadow-teal-500/25 
      transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
}
