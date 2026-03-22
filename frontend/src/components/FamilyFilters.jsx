"use client";
import {
  FAMILY_CONDITIONS,
  AREAS,
  CONDITION_COLORS,
} from "../services/constants";
import { useState, useEffect } from "react";

const FamilyFilters = ({ filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleArrayChange = (key, value, checked) => {
    setLocalFilters((prev) => {
      const currentArray = prev[key] || [];
      return {
        ...prev,
        [key]: checked
          ? [...currentArray, value]
          : currentArray.filter((item) => item !== value),
      };
    });
  };

  // Debounce all filter changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      onFiltersChange(localFilters);
    }, 400);
    return () => clearTimeout(timeout);
  }, [localFilters, onFiltersChange]);

  const clearFilters = () => {
    setLocalFilters({
      filterByLowercaseFirstLetter: false, // boolean
      conditions: [], // FamilyCondition[]
      areas: [], // string[]
      minAge: undefined, // number | undefined
      maxAge: undefined, // number | undefined
      archiveOption: "Exclude", // "All" | "Archived" | "Exclude"
      allowedStatuses: [], // DataStatus[]
      priorityOnly: false, // boolean
      searchText: "",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-right mb-4">فلاتر البحث</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Search Text */}
        <div className="py-4 lg:col-span-4 md:col-span-3">
          <textarea
            rows={
              !localFilters.searchText || localFilters.searchText === ""
                ? 2 // empty → 2 rows
                : localFilters.searchText.split("\n").length // match number of lines typed
            }
            value={localFilters.searchText || ""}
            onChange={(e) => handleChange("searchText", e.target.value)}
            placeholder={`ابحث بالكود أو أسماء الوالدين أو عنوان السكن
افصل بين الجمل باستخدام "+"`}
            className="text-sm w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-right resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Conditions */}
        <div className="space-y-3 text-right bg-slate-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 text-right mb-4">
            الحالة
          </label>
          <div className="space-y-2 max-h-44 overflow-y-auto">
            {Object.entries(FAMILY_CONDITIONS).map(([key, label]) => (
              <label key={key} className="flex items-center text-right gap-1">
                <input
                  type="checkbox"
                  checked={localFilters.conditions?.includes(key) || false}
                  onChange={(e) =>
                    handleArrayChange("conditions", key, e.target.checked)
                  }
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span
                  className={`mr-2 rounded-full border font-bold px-2 py-1 text-xs ${
                    CONDITION_COLORS[key] ||
                    "bg-gray-100 text-gray-800 border-gray-200"
                  }`}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Areas */}
        <div className="space-y-3 text-right bg-slate-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 text-right mb-4">
            المنطقة
          </label>
          <div className="space-y-2 gap-1 grid grid-cols-2">
            {AREAS.map((area) => (
              <label key={area} className="flex items-center text-right gap-1">
                <input
                  type="checkbox"
                  checked={localFilters.areas?.includes(area) || false}
                  onChange={(e) =>
                    handleArrayChange("areas", area, e.target.checked)
                  }
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="mr-2 text-sm">{area}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 text-right bg-slate-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            خيارات إضافية
          </label>

          <div className="space-y-2">
            {/* Archive Option - Segmented Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm w-full">
              <div className="grid grid-cols-3 rounded-lg overflow-hidden border border-gray-300 w-full">
                {[
                  { label: "عرض الكل", value: "All" },
                  { label: "المؤرشف فقط", value: "Archived" },
                  { label: "استبعاد المؤرشف", value: "Exclude" },
                ].map((option) => {
                  const isActive = localFilters.archiveOption === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`
            flex items-center justify-center cursor-pointer px-3 py-2 text-center text-xs md:text-sm font-medium transition
            ${
              isActive
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : "bg-white text-slate-700 hover:text-white hover:bg-gradient-to-r hover:from-slate-600 hover:to-slate-700 hover:shadow-md"
            }
          `}
                    >
                      <input
                        type="radio"
                        name="archiveOption"
                        value={option.value}
                        checked={isActive}
                        onChange={() =>
                          handleChange("archiveOption", option.value)
                        }
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Checkboxes */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={localFilters.filterByLowercaseFirstLetter || false}
                onChange={(e) =>
                  handleChange("filterByLowercaseFirstLetter", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span>أيتام فقط</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={localFilters.priorityOnly || false}
                onChange={(e) => handleChange("priorityOnly", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span>أولوية فقط</span>
            </label>
          </div>
        </div>

        {/* Min/Max Age */}
        <div className="space-y-3 text-right bg-slate-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 text-right mb-4">
            أعمار الأطفال
          </label>
          <div className="flex gap-2 max-w-[200px]">
            <input
              type="number"
              value={localFilters.minAge || ""}
              onChange={(e) => handleChange("minAge", e.target.value)}
              placeholder="من"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-right focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <input
              type="number"
              value={localFilters.maxAge || ""}
              onChange={(e) => handleChange("maxAge", e.target.value)}
              placeholder="إلى"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-right focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="mt-4 text-right">
        <button
          onClick={clearFilters}
          className="
          cursor-pointer
      flex-1 sm:flex-auto min-w-[140px] inline-flex items-center justify-center gap-2
      px-4 py-2.5 text-sm font-medium
      text-red-600 hover:text-white 
      bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600
      border border-red-300 hover:border-red-500 
      rounded-xl transition-all duration-200 
      shadow-sm hover:shadow-md hover:shadow-teal-500/25 
      transform hover:-translate-y-0.5 whitespace-nowrap
    "
        >
          مسح جميع الفلاتر
        </button>
      </div>
    </div>
  );
};

export default FamilyFilters;
