"use client";

import {
  X,
  Edit,
  Users,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  Heart,
  Building,
  FileText,
  Package,
  Cigarette,
  Activity,
  User,
  Copy,
  WrenchIcon,
} from "lucide-react";
import {
  FAMILY_CONDITIONS,
  CONDITION_COLORS,
  DATA_STATUS_TRANSLATIONS,
} from "../services/constants";
import { toast, ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FamilyDetailCard = ({ family, onClose }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleEdit = (family) => {
    navigate(`/families/edit/${family.code}`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("تم نسخ الرقم بنجاح!", {
          position: "top-left",
          theme: "colored",
          closeOnClick: true,
          pauseOnHover: false,
          autoClose: 1500,
          closeButton: false,
        });
      })
      .catch(() => {
        toast.error("فشل أثناء نسخ الرقم", {
          position: "top-left",
          theme: "colored",
          closeOnClick: true,
          pauseOnHover: false,
          autoClose: 1500,
          closeButton: false,
        });
      });
  };

  const parsePhoneNumbers = (numbersString) => {
    if (!numbersString) return [];
    return numbersString.split("\n").filter((num) => num.trim());
  };
  return (
    <div className="fixed inset-0 bg-gray-200 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-right">
            تفاصيل العائلة - {family.code}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* System Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-right">
              <FileText className="h-5 w-5 text-cyan-800" />
              <h3 className="font-semibold text-lg">معلومات النظام</h3>
            </div>
            <div className="text-right bg-slate-50 p-4 rounded-lg">
              <p>
                <span className="font-medium text-slate-700">آخر تحديث:</span>{" "}
                {family.dataUpdate?.split("T")[0] || "-"}
              </p>
            </div>
            <div className="text-right bg-slate-50 p-4 rounded-lg">
              <span className="font-medium text-slate-700">حالة البيانات:</span>{" "}
              {DATA_STATUS_TRANSLATIONS[family.dataStatus] || "-"}
            </div>
          </div>
          {/* Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-right">
                <Users className="h-5 w-5 text-cyan-800" />
                <h3 className="font-semibold text-lg">المعلومات الأساسية</h3>
              </div>
              <div className="space-y-3 text-right bg-slate-50 p-4 rounded-lg">
                <p>
                  <span className="font-medium text-slate-700">الكود:</span>{" "}
                  {family.code}
                </p>
                <p>
                  <span className="font-medium text-slate-700">الوالدين:</span>{" "}
                  {family.parents || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">المحافظة:</span>{" "}
                  {family.governate || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">
                    حجم العائلة:
                  </span>{" "}
                  {family.size || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">
                    عدد الأطفال:
                  </span>{" "}
                  {family.childrenCount || 0}
                </p>
                <p>
                  <span className="font-medium text-slate-700">
                    عدد الزيارات:
                  </span>{" "}
                  {family.numberOfVisits || "-"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">الحالة:</span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                      CONDITION_COLORS[family.condition] ||
                      "bg-gray-100 text-gray-800 border-gray-200"
                    }`}
                  >
                    {FAMILY_CONDITIONS[family.condition] || family.condition}
                  </span>
                </div>
                {/* Phone Numbers Section */}
                <div className="space-y-2">
                  <span className="font-medium text-slate-700 mb-2 block">
                    أرقام الهاتف:
                  </span>
                  {parsePhoneNumbers(family.numbers).length > 0 ? (
                    <div className="space-y-2">
                      {parsePhoneNumbers(family.numbers).map(
                        (number, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-gray-100 p-2 rounded border border-gray-400  max-w-40"
                          >
                            <span className="font-mono text-sm ml-auto">
                              {number.trim()}
                            </span>
                            <button
                              onClick={() => copyToClipboard(number.trim())}
                              className="flex-shrink-0 p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                              title="نسخ الرقم"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-right">
                <MapPin className="h-5 w-5 text-cyan-800" />
                <h3 className="font-semibold text-lg">معلومات السكن</h3>
              </div>
              <div className="space-y-3 text-right bg-slate-50 p-4 rounded-lg">
                <p>
                  <span className="font-medium text-slate-700">المنطقة:</span>{" "}
                  {family.areaName || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">العنوان:</span>{" "}
                  {family.address || "-"}
                </p>
                <p>
                  <span>
                    <span className="font-medium text-slate-700">
                      رابط الخريطة:
                    </span>{" "}
                  </span>
                  {family.mapLink && (
                    <a
                      href={family.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 hover:underline"
                    >
                      {family.mapLink.length > 20
                        ? `${family.mapLink.slice(0, 40)}...`
                        : family.mapLink}
                    </a>
                  )}{" "}
                </p>
                <p>
                  <span className="font-medium text-slate-700">
                    عدد العائلات في المنزل:
                  </span>{" "}
                  {family.numberOfFamiliesInHouse || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">
                    عدد السكان:
                  </span>{" "}
                  {family.numberOfResidents || "-"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">
                    حالة الأجهزة والمنزل:
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                      CONDITION_COLORS[family.appliancesAndHouseCondition] ||
                      "bg-gray-100 text-gray-800 border-gray-200"
                    }`}
                  >
                    {FAMILY_CONDITIONS[family.appliancesAndHouseCondition] ||
                      family.appliancesAndHouseCondition ||
                      "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/*Work Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-right">
                <WrenchIcon className="h-5 w-5 text-cyan-800" />
                <h3 className="font-semibold text-lg">معلومات العمل</h3>
              </div>
              <div className="space-y-3 text-right bg-slate-50 p-4 rounded-lg">
                <p>
                  <span className="font-medium text-slate-700">
                    عمل المعيل:
                  </span>{" "}
                  {family.providerJob || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">
                    سبب عدم وجود معيل:
                  </span>{" "}
                  {family.noProviderReason || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">
                    معيل في الخارج:
                  </span>{" "}
                  {family.providerAbroad || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">
                    القدرة على العمل:
                  </span>{" "}
                  {family.abilityToWork || "-"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-right">
                <DollarSign className="h-5 w-5 text-cyan-800" />
                <h3 className="font-semibold text-lg">المعلومات المالية</h3>
              </div>
              <div className="space-y-3 text-right bg-slate-50 p-4 rounded-lg">
                <p>
                  <span className="font-medium text-slate-700">
                    الدخل الشهري:
                  </span>{" "}
                  {family.monthlyIncome || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">الإيجار:</span>{" "}
                  {family.rent || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">الديون:</span>{" "}
                  {family.debt || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Health & Social Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-right">
                <Heart className="h-5 w-5 text-cyan-800" />
                <h3 className="font-semibold text-lg">الحالة الصحية</h3>
              </div>
              <div className="space-y-3 text-right bg-slate-50 p-4 rounded-lg">
                <p>
                  <span className="font-medium text-slate-700">
                    الصحة العامة:
                  </span>{" "}
                  {family.generalHealth || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">
                    المشاكل الصحية:
                  </span>{" "}
                  {family.healthProblems || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">
                    مشاكل الأسنان:
                  </span>{" "}
                  {family.teethProblems || "-"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-right">
                <Cigarette className="h-5 w-5 text-cyan-800" />
                <h3 className="font-semibold text-lg">معلومات التدخين</h3>
              </div>
              <div className="space-y-3 text-right bg-slate-50 p-4 rounded-lg">
                <p>
                  <span className="font-medium text-slate-700">
                    وجود مدخنين:
                  </span>{" "}
                  {family.hasSmokers || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">
                    عدد المدخنين:
                  </span>{" "}
                  {family.numberOfSmokers || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Support Agencies */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-right">
              <Building className="h-5 w-5 text-cyan-800" />
              <h3 className="font-semibold text-lg">
                الجهات المانحة والمساعدات
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2 text-right bg-slate-50 p-4 rounded-lg">
                <p>
                  <span className="font-medium text-slate-700">مفوضية:</span>{" "}
                  {family.commissioner || "-"}
                </p>
              </div>
              <div className="space-y-2 text-right bg-slate-50 p-4 rounded-lg">
                <p>
                  <span className="font-medium text-slate-700">بصمة عين:</span>{" "}
                  {family.irisPrint || "-"}
                </p>
              </div>
              <div className="space-y-2 text-right bg-slate-50 p-4 rounded-lg">
                <p>
                  <span className="font-medium text-slate-700">يونيسيف:</span>{" "}
                  {family.unicef || "-"}
                </p>
              </div>
              <div className="space-y-2 text-right bg-slate-50 p-4 rounded-lg">
                <p>
                  <span className="font-medium text-slate-700">كوبونات:</span>{" "}
                  {family.coupon || "-"}
                </p>
              </div>
              <div className="space-y-2 text-right bg-slate-50 p-4 rounded-lg col-span-full">
                <p>
                  <span className="font-medium text-slate-700">
                    مساعدات أخرى:
                  </span>{" "}
                  {family.otherSupplies || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Children */}
          {family.children && family.children.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-right">
                <User className="h-5 w-5 text-cyan-800" />
                <h3 className="font-semibold text-lg">الأطفال</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {family.children.map((child, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 p-4 rounded-lg text-right border"
                  >
                    <p className="font-medium text-lg">{child.name}</p>
                    <p className="text-sm text-slate-600">
                      سنة الميلاد: {child.yearOfBirth}
                    </p>
                    <p className="text-sm text-slate-600">
                      العمر الحالي: {child.currentAge}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-right">
                <Activity className="h-5 w-5 text-cyan-800" />
                <h3 className="font-semibold text-lg">
                  احتياجات الأطفال والمواهب
                </h3>
              </div>
              <div className="text-right bg-slate-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">
                  {family.childrenTalentsAndNeeds || "-"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-right">
                <Package className="h-5 w-5 text-cyan-800" />
                <h3 className="font-semibold text-lg">الاحتياجات المهمة</h3>
              </div>
              <div className="text-right bg-slate-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">
                  {family.importantNeeds || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {family.notes && (
            <div className="space-y-4 border-t border-slate-200 pt-6">
              <div className="flex items-center gap-2 text-right">
                <FileText className="h-5 w-5 text-cyan-800" />
                <h3 className="font-semibold text-lg">ملاحظات</h3>
              </div>
              <div className="text-right bg-slate-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{family.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-slate-200 sticky bottom-0 bg-white">
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
            إغلاق
          </button>
          <button
            onClick={() => handleEdit(family)}
            className="cursor-pointer inline-flex items-center justify-center gap-2
      px-4 py-2.5 text-sm font-medium
      text-teal-600 hover:text-white 
      bg-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500
      border border-teal-300 hover:border-teal-500 
      rounded-xl transition-all duration-200 
      shadow-sm hover:shadow-md hover:shadow-teal-500/25 
      transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Edit className="h-4 w-4" />
            تعديل
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyDetailCard;
