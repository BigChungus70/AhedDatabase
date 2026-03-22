"use client";

import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { savedListAPI } from "../services/api";
import AddToListCard from "./AddToListCard";
import CreateListCard from "./CreateListCard";
import FamilyDetailCard from "./FamilyDetailCard";
import FamilyRow from "./FamilyRow";

const FamilyTable = ({ families, loading, setRefresh }) => {
  const [createList, setCreateList] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [listOfFamilies, setListOfFamilies] = useState([]);
  const [addToList, setAddToList] = useState(false);
  const totalChildren = families.reduce(
    (sum, f) => sum + (f.childrenCount || 0),
    0
  );
  
  const selectedCodesSet = useMemo(
    () => new Set(listOfFamilies),
    [listOfFamilies]
  );
  const selectedChildren = families
    .filter((f) => selectedCodesSet.has(f.code))
    .reduce((sum, f) => sum + (f.childrenCount || 0), 0);
  const handleRowClick = (family) => {
    setListOfFamilies((prev) =>
      prev.includes(family.code)
        ? prev.filter((f) => f !== family.code)
        : [...prev, family.code]
    );
  };
  const resetSelection = () => setListOfFamilies([]);
  const selectAllFamilies = () =>
    setListOfFamilies(families.map((f) => f.code));
  const handleCreateList = async (data) => {
    try {
      savedListAPI.create(data);
      setCreateList(false);
      resetSelection();
      setRefresh(true);
      toast.success("تم إنشاء القائمة بنجاح", {
        position: "top-left",
        theme: "colored",
        closeOnClick: true,
        pauseOnHover: false,
        autoClose: 1500,
        closeButton: false,
      });
    } catch (error) {
      toast.error("فشل أثناء الإنشاء", {
        position: "top-left",
        theme: "colored",
        closeOnClick: true,
        pauseOnHover: false,
        autoClose: 1500,
        closeButton: false,
      });
    } finally {
      setCreateList(false);
    }
  };
  const onClickAddToList = () => {
    if (listOfFamilies.length === 0) {
      toast.warn("يرجى اختيار عائلة واحدة على الأقل", {
        position: "top-left",
        theme: "colored",
        closeOnClick: true,
        pauseOnHover: false,
        autoClose: 1500,
        closeButton: false,
      });
      return;
    }
    setAddToList(true);
  };
  const onClickCreateList = () => {
    if (listOfFamilies.length === 0) {
      toast.warn("يرجى اختيار عائلة واحدة على الأقل", {
        position: "top-left",
        theme: "colored",
        closeOnClick: true,
        pauseOnHover: false,
        autoClose: 1500,
        closeButton: false,
      });
      return;
    }
    setCreateList(true);
  };

  const handleAddToList = async ({ addToLists, localCodes }) => {
    try {
      addToLists.forEach((list) => {
        savedListAPI.addFamilies(list.id, localCodes);
        toast.success(`تم إضافة العوائل للقائمة ${list.name}`, {
          position: "top-left",
          theme: "colored",
          closeOnClick: true,
          pauseOnHover: false,
          autoClose: 1000,
          closeButton: false,
        });
      });
      setAddToList(false);
      resetSelection();
      setRefresh(true);
    } catch (error) {
      console.error(error);
      toast.error(`فشل أثناء الإضافة`, {
        position: "top-left",
        theme: "colored",
        closeOnClick: true,
        pauseOnHover: false,
        autoClose: 1500,
        closeButton: false,
      });
    } finally {
      setAddToList(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="loading-spinner"></div>
            <span className="mr-2 text-slate-600">جاري التحميل...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-slate-200 flex flex-wrap gap-2 sm:gap-4 items-center justify-between">
          <h2 className="text-xl font-semibold text-right flex-shrink-0 mb-2 sm:mb-0">
            قائمة العائلات
          </h2>

          <div className="flex flex-1 flex-wrap gap-3 justify-end">
            <button
              className="
              cursor-pointer
      flex-1 sm:flex-auto min-w-[140px] inline-flex items-center justify-center gap-2
      px-4 py-2.5 text-sm font-medium
      text-yellow-600 hover:text-white 
      bg-white hover:bg-gradient-to-r hover:from-yellow-500 hover:to-orange-500
      border border-yellow-300 hover:border-yellow-500 
      rounded-xl transition-all duration-200 
      shadow-sm hover:shadow-md hover:shadow-yellow-500/25 
      transform hover:-translate-y-0.5 whitespace-nowrap
    "
              onClick={resetSelection}
            >
              إزالة الاختيارات
            </button>

            <button
              className="
              cursor-pointer
      flex-1 sm:flex-auto min-w-[140px] inline-flex items-center justify-center gap-2
      px-4 py-2.5 text-sm font-medium
      text-green-600 hover:text-white 
      bg-white hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500
      border border-green-300 hover:border-green-500 
      rounded-xl transition-all duration-200 
      shadow-sm hover:shadow-md hover:shadow-green-500/25 
      transform hover:-translate-y-0.5 whitespace-nowrap
    "
              onClick={selectAllFamilies}
            >
              تحديد الكل
            </button>

            <button
              className="
              cursor-pointer
      flex-1 sm:flex-auto min-w-[140px] inline-flex items-center justify-center gap-2
      px-4 py-2.5 text-sm font-medium
      text-teal-600 hover:text-white 
      bg-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500
      border border-teal-300 hover:border-teal-500 
      rounded-xl transition-all duration-200 
      shadow-sm hover:shadow-md hover:shadow-teal-500/25 
      transform hover:-translate-y-0.5 whitespace-nowrap
    "
              onClick={onClickCreateList}
            >
              إنشاء قائمة جديدة
            </button>

            <button
              className="
              cursor-pointer
      flex-1 sm:flex-auto min-w-[140px] inline-flex items-center justify-center gap-2
      px-4 py-2.5 text-sm font-medium
      text-indigo-600 hover:text-white 
      bg-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500
      border border-indigo-300 hover:border-indigo-500 
      rounded-xl transition-all duration-200 
      shadow-sm hover:shadow-md hover:shadow-indigo-500/25 
      transform hover:-translate-y-0.5 whitespace-nowrap
    "
              onClick={onClickAddToList}
            >
              إضافة إلى قائمة
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-8 text-center text-xs font-medium text-slate-500 tracking-wider ">
                  #
                </th>
                <th className="px-6 py-3 w-25 text-center text-xs font-medium text-slate-500 tracking-wider">
                  الكود
                </th>
                <th className="px-6 py-3 w-25 text-center text-xs font-medium text-slate-500 tracking-wider">
                  المنطقة
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 tracking-wider">
                  الوالدين
                </th>
                <th className="px-6 py-3 w-24 text-center text-xs font-medium text-slate-500 tracking-wider">
                  الحالة
                </th>
                <th className="px-5 py-3 w-25 text-center text-xs font-medium text-slate-500 tracking-wider">
                  عدد الأطفال {totalChildren}
                  {"("}
                  {selectedChildren}
                  {")"}
                </th>
                <th className="px-6 py-3 w-15 text-center text-xs font-medium text-slate-500 tracking-wider">
                  القوائم
                </th>
                <th className="px-4 py-3 w-30 text-center text-xs font-medium text-slate-500 tracking-wider">
                  الخيارات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {families.map((family, index) => (
                <FamilyRow
                  key={family.code}
                  family={family}
                  index={index}
                  isSelected={selectedCodesSet.has(family.code)}
                  onRowClick={handleRowClick}
                  onView={setSelectedFamily}
                  showArea={true}
                  showChildren={true}
                  showLists={true}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedFamily && (
        <FamilyDetailCard
          familyCode={selectedFamily}
          onClose={() => setSelectedFamily(null)}
        />
      )}
      {addToList && (
        <AddToListCard
          families={families}
          codes={listOfFamilies}
          onClose={() => setAddToList(false)}
          onSubmit={handleAddToList}
        />
      )}
      {createList && (
        <CreateListCard
          families={families}
          codes={listOfFamilies}
          onClose={() => setCreateList(false)}
          onSubmit={handleCreateList}
        />
      )}
    </>
  );
};

export default FamilyTable;
