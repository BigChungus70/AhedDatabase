import React, { useState, useEffect, useMemo } from "react";
import { X, Check, List, Users } from "lucide-react";
import { toast } from "react-toastify";
import { savedListAPI } from "../services/api";

function AddToListCard({ families, codes, onSubmit, onClose }) {
  const [localCodes, setLocalCodes] = useState(codes);
  const [addToLists, setAddToLists] = useState([]);
  const [availableLists, setAvailableLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const lists = await savedListAPI.getAll();
        setAvailableLists(lists);
      } catch (error) {
        console.error("Error fetching lists:", error);
        toast.error("فشل في تحميل القوائم", {
          position: "top-left",
          theme: "colored",
          closeOnClick: true,
          pauseOnHover: false,
          autoClose: 1500,
          closeButton: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  const selectedFamilies = useMemo(
    () => families.filter((f) => localCodes.includes(f.code)),
    [families, localCodes]
  );

  const handleAddToList = () => {
    if (addToLists.length === 0) {
      toast.warn("يرجى اختيار قائمة واحدة على الأقل", {
        position: "top-left",
        theme: "colored",
        closeOnClick: true,
        pauseOnHover: false,
        autoClose: 1500,
        closeButton: false,
      });
      return;
    }

    const selectedLists = availableLists.filter((list) =>
      addToLists.includes(list.id)
    );
    onSubmit?.({ addToLists: selectedLists, localCodes });
  };

  const onDelete = (code) => {
    setLocalCodes((prev) => prev.filter((c) => c !== code));
  };

  const toggleList = (listId) => {
    setAddToLists((prev) =>
      prev.includes(listId)
        ? prev.filter((id) => id !== listId)
        : [...prev, listId]
    );
  };

  const isListSelected = (listId) => addToLists.includes(listId);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-800"></div>
            <span className="mr-3 text-slate-600">جاري تحميل القوائم...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-200 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b px-6 py-5 
        bg-gradient-to-r from-cyan-600 to-emerald-600 text-white rounded-t-xl">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <List className="h-6 w-6 text-cyan-800" />
            إضافة العوائل للقوائم
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Selected families info */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-cyan-800" />
              <span className="font-medium text-slate-700">
                العوائل المحددة
              </span>
            </div>
            <p className="text-sm text-slate-600">
              سيتم إضافة {selectedFamilies.length} عائلة إلى القوائم المختارة
            </p>
            {selectedFamilies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedFamilies.slice(0, 5).map((family) => (
                  <span
                    key={family.code}
                    className="text-xs bg-white px-2 py-1 rounded border"
                  >
                    {family.code}
                  </span>
                ))}
                {selectedFamilies.length > 5 && (
                  <span className="text-xs text-slate-500">
                    و {selectedFamilies.length - 5} أخرى...
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Available lists */}
          <div className="space-y-3">
            <h3 className="font-medium text-slate-900 mb-4">اختر القوائم:</h3>

            {availableLists.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <List className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>لا توجد قوائم</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableLists
                  .filter((list) => !list.archived)
                  .map((list) => (
                    <div
                      key={list.id}
                      onClick={() => toggleList(list.id)}
                      className={`
                      group cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
                      ${
                        isListSelected(list.id)
                          ? "border-cyan-500 bg-cyan-50 shadow-md"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      }
                    `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {/* List info */}
                          <div className="flex-1 text-right">
                            <h4 className="font-medium text-slate-900 group-hover:text-cyan-800 transition-colors">
                              {list.name}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {list.familyCount} عائلة
                            </p>
                          </div>
                        </div>

                        {/* Checkbox */}
                        <div
                          className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                        ${
                          isListSelected(list.id)
                            ? "border-cyan-500 bg-cyan-500"
                            : "border-slate-300 group-hover:border-cyan-400"
                        }
                      `}
                        >
                          {isListSelected(list.id) && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="border-t border-slate-200 bg-white p-4 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {addToLists.length > 0 && (
                <span>
                  مختار: {addToLists.length} من {availableLists.length} قائمة
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="font-medium
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
                onClick={handleAddToList}
                disabled={addToLists.length === 0}
                className={`
                  font-medium
                  border border-cyan-600 
                  rounded-lg px-6 py-2 
                  transition-all duration-200
                  cursor-pointer
                  ${
                    addToLists.length > 0
                      ? `bg-cyan-600 text-white
                       hover:bg-cyan-700 hover:shadow-md
                       sm:bg-white sm:text-cyan-600
                       sm:hover:bg-cyan-600 sm:hover:text-white`
                      : "bg-slate-300 text-slate-500 cursor-not-allowed border-slate-300"
                  }
                `}
              >
                إضافة ({addToLists.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddToListCard;
