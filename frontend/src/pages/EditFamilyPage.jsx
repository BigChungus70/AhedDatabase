"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { familyAPI } from "../services/api";
import { DATA_STATUS_TRANSLATIONS, FAMILY_CONDITIONS } from "../services/constants";
import { Plus, Trash2, Save, X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

export default function EditFamilyPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const data = await familyAPI.getByCode(code);
        // Ensure children is an array
        if (!data.children) data.children = [];
        setFamily(data);
      } catch (error) {
        console.error("Error fetching family:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFamily();
  }, [code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await familyAPI.updateFamily(family);
      toast.success("تم حفظ العائلة بنجاح", {
        position: "top-left",
        theme: "colored",
        closeOnClick: true,
        pauseOnHover: false,
        autoClose: 1500,
        closeButton: false,
      });
      navigate("/families");
    } catch (error) {
      toast.error("فشل أثناء الحفظ", {
        position: "top-left",
        theme: "colored",
        closeOnClick: true,
        pauseOnHover: false,
        autoClose: 1500,
        closeButton: false,
      });
      console.error("Error updating family:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFamily((prev) => ({ ...prev, [field]: value }));
  };

  const addChild = () => {
    const newChild = {
      name: "",
      yearOfBirth: null,
    };
    setFamily((prev) => ({
      ...prev,
      children: [...prev.children, newChild],
    }));
  };

  const removeChild = (index) => {
    setFamily((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index),
    }));
  };

  const updateChild = (index, field, value) => {
    setFamily((prev) => ({
      ...prev,
      children: prev.children.map((child, i) =>
        i === index ? { ...child, [field]: value } : child
      ),
    }));
  };

  const calculateAge = (yearOfBirth) => {
    const currentYear = new Date().getFullYear();
    if (
      yearOfBirth === "" ||
      isNaN(yearOfBirth) ||
      yearOfBirth > currentYear ||
      yearOfBirth < 1939
    ) {
      return "";
    }

    return currentYear - parseInt(yearOfBirth);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-800 mx-auto mb-4"></div>
          <p className="text-slate-600">جاري تحميل بيانات العائلة...</p>
        </div>
      </div>
    );
  }

  if (!family && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">لم يتم العثور على العائلة</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-cyan-800 text-white rounded-lg hover:bg-cyan-900"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">
              تعديل بيانات العائلة - {family.code}
            </h1>
            <button
              onClick={() => navigate("/families")}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                المعلومات الأساسية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الحالة
                  </label>
                  <select
                    value={family.dataStatus || ""}
                    onChange={(e) => {
                      handleInputChange("dataStatus", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="" disabled>
                      اختر حالة البيانات
                    </option>
                    {Object.entries(DATA_STATUS_TRANSLATIONS).map(
                      ([key, status]) => (
                        <option key={key} value={key}>
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    كود العائلة *
                  </label>
                  <input
                    type="text"
                    value={family.code || ""}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الحالة
                  </label>
                  <select
                    value={family.condition || ""}
                    onChange={(e) =>
                      handleInputChange("condition", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="" disabled>
                      اختر الحالة
                    </option>
                    {Object.entries(FAMILY_CONDITIONS).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الوالدين
                  </label>
                  <input
                    type="text"
                    value={family.parents || ""}
                    onChange={(e) =>
                      handleInputChange("parents", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    المحافظة
                  </label>
                  <input
                    type="text"
                    value={family.governate || ""}
                    onChange={(e) =>
                      handleInputChange("governate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    حجم العائلة
                  </label>
                  <input
                    type="number"
                    value={family.size || ""}
                    onChange={(e) =>
                      handleInputChange("size", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    عدد الزيارات
                  </label>
                  <input
                    type="number"
                    value={family.numberOfVisits || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "numberOfVisits",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  أرقام الهاتف (رقم واحد في كل سطر)
                </label>
                <textarea
                  value={family.numbers || ""}
                  onChange={(e) => handleInputChange("numbers", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="رقم الهاتف الأول&#10;رقم الهاتف الثاني&#10;..."
                />
              </div>
            </div>

            {/* Housing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                معلومات السكن
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    المنطقة
                  </label>
                  <input
                    type="text"
                    value={family.areaName || ""}
                    onChange={(e) =>
                      handleInputChange("areaName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    عدد العائلات في المنزل
                  </label>
                  <input
                    type="number"
                    value={family.numberOfFamiliesInHouse || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "numberOfFamiliesInHouse",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    عدد السكان
                  </label>
                  <input
                    type="string"
                    value={family.numberOfResidents || ""}
                    onChange={(e) =>
                      handleInputChange("numberOfResidents", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    min="0"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    حالة الأجهزة والمنزل
                  </label>
                  <select
                    value={family.appliancesAndHouseCondition || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "appliancesAndHouseCondition",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="">اختر الحالة</option>
                    {Object.entries(FAMILY_CONDITIONS).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  العنوان
                </label>
                <textarea
                  value={family.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  رابط الخريطة
                </label>
                <textarea
                  value={family.mapLink || ""}
                  onChange={(e) => handleInputChange("mapLink", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                معلومات العمل
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    عمل المعيل
                  </label>
                  <input
                    type="text"
                    value={family.providerJob || ""}
                    onChange={(e) =>
                      handleInputChange("providerJob", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    سبب عدم وجود معيل
                  </label>
                  <input
                    type="text"
                    value={family.noProviderReason || ""}
                    onChange={(e) =>
                      handleInputChange("noProviderReason", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    معيل في الخارج
                  </label>
                  <input
                    type="text"
                    value={family.providerAbroad || ""}
                    onChange={(e) =>
                      handleInputChange("providerAbroad", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    القدرة على العمل
                  </label>
                  <input
                    type="text"
                    value={family.abilityToWork || ""}
                    onChange={(e) =>
                      handleInputChange("abilityToWork", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                المعلومات المالية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الدخل الشهري
                  </label>
                  <input
                    type="string"
                    value={family.monthlyIncome || ""}
                    onChange={(e) =>
                      handleInputChange("monthlyIncome", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الإيجار
                  </label>
                  <input
                    type="string"
                    value={family.rent || ""}
                    onChange={(e) => handleInputChange("rent", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الديون
                  </label>
                  <input
                    type="string"
                    value={family.debt || ""}
                    onChange={(e) => handleInputChange("debt", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Health Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                المعلومات الصحية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الصحة العامة
                  </label>
                  <input
                    type="text"
                    value={family.generalHealth || ""}
                    onChange={(e) =>
                      handleInputChange("generalHealth", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    المشاكل الصحية
                  </label>
                  <input
                    type="text"
                    value={family.healthProblems || ""}
                    onChange={(e) =>
                      handleInputChange("healthProblems", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    مشاكل الأسنان
                  </label>
                  <input
                    type="text"
                    value={family.teethProblems || ""}
                    onChange={(e) =>
                      handleInputChange("teethProblems", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    وجود مدخنين
                  </label>
                  <select
                    value={family.hasSmokers || ""}
                    onChange={(e) =>
                      handleInputChange("hasSmokers", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="">اختر</option>
                    <option value="yes">نعم</option>
                    <option value="no">لا</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    عدد المدخنين
                  </label>
                  <input
                    type="string"
                    value={family.numberOfSmokers || ""}
                    onChange={(e) =>
                      handleInputChange("numberOfSmokers", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Support Agencies */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                الجهات المانحة والمساعدات
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    مفوضية
                  </label>
                  <input
                    type="text"
                    value={family.commissioner || ""}
                    onChange={(e) =>
                      handleInputChange("commissioner", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    بصمة عين
                  </label>
                  <input
                    type="text"
                    value={family.irisPrint || ""}
                    onChange={(e) =>
                      handleInputChange("irisPrint", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    يونيسيف
                  </label>
                  <input
                    type="text"
                    value={family.unicef || ""}
                    onChange={(e) =>
                      handleInputChange("unicef", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    كوبونات
                  </label>
                  <input
                    type="text"
                    value={family.coupon || ""}
                    onChange={(e) =>
                      handleInputChange("coupon", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  مساعدات أخرى
                </label>
                <textarea
                  value={family.otherSupplies || ""}
                  onChange={(e) =>
                    handleInputChange("otherSupplies", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Children Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  الأطفال
                </h3>
                <button
                  type="button"
                  onClick={addChild}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  إضافة طفل
                </button>
              </div>

              {family.children && family.children.length > 0 ? (
                <div className="space-y-4">
                  {family.children.map((child, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-slate-700">
                          طفل {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeChild(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            الاسم
                          </label>
                          <input
                            type="text"
                            value={child.name || ""}
                            onChange={(e) =>
                              updateChild(index, "name", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            سنة الميلاد
                          </label>
                          <input
                            type="number"
                            value={child.yearOfBirth || ""}
                            onChange={(e) => {
                              updateChild(index, "yearOfBirth", e.target.value);
                            }}
                            className=" w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            style={{ textAlign: "right" }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            العمر الحالي
                          </label>
                          <div className="text-right w-full px-3 py-2 border border-slate-300 rounded-lg bg-gray-100 min-h-[44px] flex items-center">
                            {calculateAge(child.yearOfBirth)}
                          </div>
                        </div>
                        <div
                          hidden={
                            calculateAge(child.yearOfBirth) === 0 ? false : true
                          }
                          className="text-center w-full px-3 py-2 min-h-[44px] flex items-center"
                        >
                          ههههههههه عمرو صفر
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  لا يوجد أطفال مسجلين
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                معلومات إضافية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    احتياجات الأطفال والمواهب
                  </label>
                  <textarea
                    value={family.childrenTalentsAndNeeds || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "childrenTalentsAndNeeds",
                        e.target.value
                      )
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الاحتياجات المهمة
                  </label>
                  <textarea
                    value={family.importantNeeds || ""}
                    onChange={(e) =>
                      handleInputChange("importantNeeds", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={family.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Footer */}
        
            <div className="flex justify-end gap-4 pt-3 pb-3 border-t border-slate-200 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => navigate(-1)}
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
                type="submit"
                disabled={saving}
                className="cursor-pointer inline-flex items-center justify-center gap-2
      px-4 py-2.5 text-sm font-medium
      text-blue-600 hover:text-white 
      bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500
      border border-blue-300 hover:border-blue-500 
      rounded-xl transition-all duration-200 
      shadow-sm hover:shadow-md hover:shadow-teal-500/25 
      transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Save className="h-4 w-4" />
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
