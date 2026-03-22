"use client";

import { X, Users, FileText, Trash2 } from "lucide-react";
import { useState, useMemo, useEffect, use } from "react";
import { toast } from "react-toastify";
import { savedListAPI } from "../services/api";

function CreateListCard({ families, codes, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [localCodes, setLocalCodes] = useState(codes);
  const [campaign, setCampaign] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaigns = await savedListAPI.getCampaigns();
        setCampaigns(campaigns);
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    };
    fetchCampaigns();
  }, []);

  // Filter families by selected codes
  const selectedFamilies = useMemo(
    () => families.filter((f) => localCodes.includes(f.code)),
    [families, localCodes]
  );

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.warn("يرجى ادخال الاسم", {
        position: "top-left",
        theme: "colored",
        closeOnClick: true,
        pauseOnHover: false,
        autoClose: 1500,
        closeButton: false,
      });
      return;
    }
    if (!campaign) {
      toast.warn("يرجى اختيار الحملة", {
        position: "top-left",
        theme: "colored",
        closeOnClick: true,
        pauseOnHover: false,
        autoClose: 1500,
        closeButton: false,
      });
      return;
    }
    onSubmit?.({ name, description, campaign, localCodes });
  };

  const onDelete = (code) => {
    setLocalCodes((prev) => prev.filter((c) => c !== code));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b px-6 py-5 
        bg-gradient-to-r from-cyan-600 to-emerald-600 text-white rounded-t-xl"
        >
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-cyan-800" />
            إنشاء قائمة جديدة
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Form Section */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 text-right mb-2">
                  اسم القائمة *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-right focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="اسم القائمة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 text-right mb-2">
                  الوصف (اختياري)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-right focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors resize-none"
                  placeholder="وصف مختصر للقائمة"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  الحملة
                </label>
                <select
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm
               focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="" disabled>
                    -- اختر الحملة --
                  </option>
                  {Object.entries(campaigns).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Selected Families Info */}
          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-cyan-800" />
              <span className="font-medium text-cyan-900">العوائل المحددة</span>
            </div>
            <p className="text-sm text-cyan-700">
              سيتم إضافة {selectedFamilies.length} عائلة إلى القائمة الجديدة
            </p>
          </div>

          {/* Families Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-medium text-slate-900 text-right">
                العوائل المضافة للقائمة
              </h3>
            </div>

            {selectedFamilies.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>لا توجد عوائل محددة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-xs font-medium text-slate-500 text-center border-b border-slate-200">
                        الكود
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-slate-500 text-center border-b border-slate-200">
                        المنطقة
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-slate-500 text-center border-b border-slate-200">
                        الوالدين
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-slate-500 text-center border-b border-slate-200 w-20">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedFamilies.map((f, index) => (
                      <tr
                        key={f.code}
                        className={`hover:bg-slate-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-center font-medium text-slate-900">
                          {f.code}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-center text-slate-600">
                          {f.areaName || "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-right text-slate-600">
                          {f.parents || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <button
                            onClick={() => onDelete(f.code)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors group"
                            title="إزالة من القائمة"
                          >
                            <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="border-t border-slate-200 bg-white p-4 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {selectedFamilies.length > 0 && (
                <span>إجمالي العوائل: {selectedFamilies.length}</span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="
                  font-medium
                  border border-red-600 
                  rounded-lg px-6 py-2 
                  transition-all duration-200
                  cursor-pointer
                  bg-red-600 text-white
                  hover:bg-red-700 hover:shadow-md

                  sm:bg-white sm:text-red-600
                  sm:hover:bg-red-600 sm:hover:text-white"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                className={`
                  font-medium
                  border border-cyan-600 
                  rounded-lg px-6 py-2 
                  transition-all duration-200
                  cursor-pointer
                  ${
                    campaign && name.trim() && selectedFamilies.length > 0
                      ? `bg-cyan-600 text-white
                       hover:bg-cyan-700 hover:shadow-md
                       sm:bg-white sm:text-cyan-600
                       sm:hover:bg-cyan-600 sm:hover:text-white`
                      : "bg-slate-300 text-slate-500 cursor-not-allowed border-slate-300"
                  }
                `}
              >
                إنشاء القائمة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateListCard;
