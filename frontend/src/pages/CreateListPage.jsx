/* UNUSED


"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { familyAPI, savedListAPI } from "../services/api";

export default function CreateListPage() {
  const navigate = useNavigate();
  const [listName, setListName] = useState("");
  const [description, setDescription] = useState("");
  const [families, setFamilies] = useState([]);
  const [selectedFamilies, setSelectedFamilies] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const data = await familyAPI.search();
        setFamilies(data.content || []);
      } catch (error) {
        console.error("Error fetching families:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFamilies.size === 0) {
      alert("يرجى اختيار عائلة واحدة على الأقل");
      return;
    }

    setCreating(true);
    try {
      await savedListAPI.create({
        name: listName,
        description: description || null,
        familyCodes: Array.from(selectedFamilies),
      });
      navigate("/lists");
    } catch (error) {
      console.error("Error creating list:", error);
      alert("حدث خطأ أثناء إنشاء القائمة");
    } finally {
      setCreating(false);
    }
  };

  const toggleFamily = (familyCode) => {
    const newSelected = new Set(selectedFamilies);
    if (newSelected.has(familyCode)) {
      newSelected.delete(familyCode);
    } else {
      newSelected.add(familyCode);
    }
    setSelectedFamilies(newSelected);
  };

  const selectAll = () => {
    const filteredFamilies = families.filter(
      (family) =>
        family.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.motherName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSelectedFamilies(new Set(filteredFamilies.map((f) => f.code)));
  };

  const clearAll = () => {
    setSelectedFamilies(new Set());
  };

  const filteredFamilies = families.filter(
    (family) =>
      family.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.motherName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-800 mx-auto mb-4"></div>
          <p className="text-slate-600">جاري تحميل العائلات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              إنشاء قائمة جديدة
            </h1>
            <button
              onClick={() => navigate("/lists")}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              إلغاء
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  اسم القائمة *
                </label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                  placeholder="أدخل اسم القائمة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  الوصف (اختياري)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="وصف مختصر للقائمة"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  اختيار العائلات ({selectedFamilies.size} محددة)
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="px-3 py-1 text-sm bg-cyan-100 text-cyan-800 rounded-lg hover:bg-cyan-200"
                  >
                    تحديد الكل
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                  >
                    إلغاء التحديد
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="البحث في العائلات..."
                />
              </div>

              <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
                {filteredFamilies.map((family) => (
                  <div
                    key={family.code}
                    className={`p-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 ${
                      selectedFamilies.has(family.code) ? "bg-cyan-50" : ""
                    }`}
                    onClick={() => toggleFamily(family.code)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedFamilies.has(family.code)}
                        onChange={() => toggleFamily(family.code)}
                        className="w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium text-slate-900">
                            {family.code}
                          </span>
                          <span className="text-slate-600">
                            {family.fatherName}
                          </span>
                          <span className="text-slate-600">
                            {family.motherName}
                          </span>
                          <span className="text-slate-500">
                            الأطفال: {family.childrenCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate("/lists")}
                className="px-6 py-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={creating || selectedFamilies.size === 0}
                className="px-6 py-2 bg-cyan-800 text-white rounded-lg hover:bg-cyan-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {creating ? "جاري الإنشاء..." : "إنشاء القائمة"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
  */
