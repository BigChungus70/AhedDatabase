import { useState } from "react";

export default function FamilyNotesCard({ entry, onSave, onClose }) {
  const [text, setText] = useState(entry.notes || "");

  const handleSave = () => {
    onSave(entry.id, text);
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">
          ملاحظات العائلة {entry.family.name}
        </h2>

        <textarea
          className="w-full h-48 p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-600"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="أضف ملاحظتك هنا..."
        />

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
            onClick={handleSave}
            className="cursor-pointer inline-flex items-center justify-center gap-2
      px-4 py-2.5 text-sm font-medium
      text-blue-600 hover:text-white 
      bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500
      border border-blue-300 hover:border-blue-500 
      rounded-xl transition-all duration-200 
      shadow-sm hover:shadow-md hover:shadow-teal-500/25 
      transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
