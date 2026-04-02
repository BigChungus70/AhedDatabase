import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { savedListAPI } from "../services/api";
import FamilyRow from "../components/FamilyRow";
import FamilyDetailCard from "../components/FamilyDetailCard";
import { toast } from "react-toastify";
import useDebounceLoading from "../hooks/useDebounceLoading";
import FamilyNotesCard from "../components/FamilyNotesCard";
import ListEdit from "../components/ListEdit";
import ExportModal from "../components/ExportModal";
import { ArchiveIcon, ArrowLeftIcon, DownloadIcon } from "lucide-react";
import { useRole, isAtLeast } from "../hooks/useRole";
import ReportSection from "../components/ListReportEdit";


export default function ListDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = useRole();

  const canArchive = isAtLeast(role, "High");
  const canEditList = isAtLeast(role, "High");
  const canRemoveFamilies = isAtLeast(role, "High");
  const canToggleDone = isAtLeast(role, "Mid");
  const canEditNotes = isAtLeast(role, "Mid");

  const [selectedFamily, setSelectedFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmpty, setShowEmpty] = useState(false);
  const showLoading = useDebounceLoading(loading, 300);
  const [list, setList] = useState(null);
  const [listOfFamilies, setListOfFamilies] = useState([]);
  const [editList, setEditList] = useState(false);
  const [editNotes, setEditNotes] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [showExport, setShowExport] = useState(false);

  const selectedCodesSet = useMemo(
    () => new Set(listOfFamilies),
    [listOfFamilies],
  );

  const fetchListDetails = async () => {
    setLoading(true);
    setShowEmpty(false);
    try {
      const listFetch = await savedListAPI.getList(id);
      setList(listFetch);
    } catch {
      setShowEmpty(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const data = await savedListAPI.getCampaigns();
      setCampaigns(data);
    } catch {}
  };

  useEffect(() => {
    fetchListDetails();
    fetchCampaigns();
  }, [id]);

  const handleEditSubmit = async (edits) => {
    await savedListAPI.update(
      id,
      edits.name,
      edits.description,
      edits.campaign,
    );
    setEditList(false);
    fetchListDetails();
  };

  const handleEditNotes = (entry) => {
    setEditingEntry(entry);
    setEditNotes(true);
  };

  const handleSaveNotes = async (entryId, newText) => {
    try {
      await savedListAPI.updateNotes(entryId, newText);
      fetchListDetails();
      toast.success("تم حفظ الملاحظة", {
        position: "top-left",
        autoClose: 1500,
        theme: "colored",
        pauseOnHover: false,
        closeButton: false,
      });
    } catch {
      toast.error("فشل الحفظ", {
        position: "top-left",
        autoClose: 1500,
        theme: "colored",
        pauseOnHover: false,
        closeButton: false,
      });
    }
  };

  const handleRowClick = (family) => {
    if (!canRemoveFamilies) return;
    setListOfFamilies((prev) =>
      prev.includes(family.code)
        ? prev.filter((f) => f !== family.code)
        : [...prev, family.code],
    );
  };

  const resetSelection = () => setListOfFamilies([]);

  const deleteSelectedFamilies = async () => {
    try {
      await savedListAPI.removeFamilies(id, listOfFamilies);
      resetSelection();
      toast.success("تم حذف العائلات بنجاح", {
        position: "top-left",
        autoClose: 1500,
        theme: "colored",
      });
      fetchListDetails();
    } catch {
      toast.error("حدث خطأ أثناء الحذف", {
        position: "top-left",
        autoClose: 1500,
        theme: "colored",
      });
    }
  };

  const confirmDelete = () => {
    if (listOfFamilies.length === 0) {
      toast.warn("اختر عوائل للحذف", {
        position: "top-left",
        autoClose: 1500,
        theme: "colored",
      });
      return;
    }
    toast(
      ({ closeToast }) => (
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-5 flex flex-col items-center text-center gap-4">
          <p className="text-gray-800 text-sm sm:text-base font-medium">
            هل أنت متأكد من حذف {listOfFamilies.length} عائلة من القائمة؟
          </p>
          <div className="flex justify-center gap-3 w-full">
            <button
              onClick={() => {
                deleteSelectedFamilies();
                closeToast();
              }}
              className="flex-1 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition"
            >
              نعم
            </button>
            <button
              onClick={closeToast}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-300 transition"
            >
              لا
            </button>
          </div>
        </div>
      ),
      { autoClose: false, position: "bottom-center", closeButton: false },
    );
  };

  const handleArchive = async () => {
    try {
      await savedListAPI.archive(list.id);
      fetchListDetails();
      toast.success("تم أرشفة القائمة بنجاح", {
        position: "top-left",
        autoClose: 1500,
        theme: "colored",
      });
    } catch {
      toast.error("حدث خطأ أثناء أرشفة القائمة", {
        position: "top-left",
        autoClose: 1500,
        theme: "colored",
      });
    }
  };

  const confirmArchive = () => {
    toast(
      ({ closeToast }) => (
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-5 flex flex-col items-center text-center gap-4">
          <p className="text-gray-800 text-sm sm:text-base font-medium">
            هل أنت متأكد من أرشفة هذه القائمة؟{" "}
            <span className="font-bold">{list.name}</span>
          </p>
          <div className="flex justify-center gap-3 w-full">
            <button
              onClick={() => {
                handleArchive();
                closeToast();
              }}
              className="flex-1 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition"
            >
              نعم
            </button>
            <button
              onClick={closeToast}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-300 transition"
            >
              لا
            </button>
          </div>
        </div>
      ),
      { autoClose: false, position: "bottom-center", closeButton: false },
    );
  };

  const handleMark = async (familyId) => {
    try {
      await savedListAPI.toggleDone(list.id, familyId);
      fetchListDetails();
    } catch {}
  };

  if (showLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-800 mx-auto mb-4" />
          <p className="text-slate-600">جاري تحميل تفاصيل القائمة...</p>
        </div>
      </div>
    );
  }

  if (showEmpty) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">لم يتم العثور على القائمة</p>
          <button
            onClick={() => navigate("/lists")}
            className="mt-4 px-4 py-2 bg-cyan-800 text-white rounded-lg hover:bg-cyan-900"
          >
            العودة للقوائم
          </button>
        </div>
      </div>
    );
  }

  if (!list) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/lists")}
            className="cursor-pointer inline-flex items-center justify-center gap-2
              px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-white
              bg-white hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-600
              border border-gray-300 hover:border-gray-500 rounded-xl transition-all duration-200
              shadow-sm hover:shadow-md transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            العودة للقوائم
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 p-6 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/20 pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex-1 text-right space-y-4">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                    {campaigns[list.campaign] ?? list.campaign}
                  </h1>
                  <h4 className="text-xl sm:text-2xl font-semibold text-slate-700">
                    {list.name}
                  </h4>
                </div>
                {list.description && (
                  <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
                    {list.description}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col lg:flex-row gap-3">
                {list.archived && (
                  <span className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-full px-4 py-2 shadow-lg">
                    مؤرشفة
                  </span>
                )}

                {/* Export — all roles */}
                <button
                  onClick={() => setShowExport(true)}
                  className="cursor-pointer inline-flex items-center justify-center gap-2
                    px-4 py-2.5 text-sm font-medium
                    text-green-600 hover:text-white
                    bg-white hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600
                    border border-green-300 hover:border-green-500
                    rounded-xl transition-all duration-200 shadow-sm hover:shadow-md
                    transform hover:-translate-y-0.5 whitespace-nowrap"
                >
                  طباعة Excel
                  <DownloadIcon className="w-4 h-4" />
                </button>

                {/* Archive — High+ only, active lists only */}
                {canArchive && !list.archived && (
                  <button
                    onClick={confirmArchive}
                    className="cursor-pointer inline-flex items-center justify-center gap-2
                      px-4 py-2.5 text-sm font-medium
                      text-indigo-600 hover:text-white
                      bg-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500
                      border border-indigo-300 hover:border-indigo-500
                      rounded-xl transition-all duration-200 shadow-sm hover:shadow-md
                      transform hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    أرشفة القائمة
                    <ArchiveIcon className="w-4 h-4" />
                  </button>
                )}

                {/* Edit — High+ only, active lists only */}
                {canEditList && !list.archived && (
                  <button
                    onClick={() => setEditList(true)}
                    className="cursor-pointer px-4 py-2.5 text-sm font-medium
                      text-slate-700 hover:text-white bg-white hover:bg-slate-700
                      border border-slate-300 hover:border-slate-700
                      rounded-xl transition-all duration-200 shadow-sm hover:shadow-md
                      transform hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    تعديل
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Meta info */}
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="grid grid-rows-2 gap-1 bg-slate-200 rounded-lg px-4 py-1">
                <span className="font-medium text-slate-900">
                  عدد العائلات: {list.entries.length || 0}
                </span>
                <span className="font-medium text-slate-900">
                  عدد العائلات المنجزة: {list.doneCount || 0}
                </span>
              </div>
              <div className="grid grid-rows-2 gap-1 bg-slate-200 rounded-lg px-4 py-1">
                <span className="font-medium text-slate-900">
                  تاريخ الإنشاء:{" "}
                  <span dir="ltr">
                    {list.createdDate
                      ? new Date(list.createdDate)
                          .toISOString()
                          .split("T")[0]
                          .replace(/-/g, "/")
                      : "-"}
                  </span>
                </span>
                <span className="font-medium text-slate-900">
                  آخر تعديل:{" "}
                  <span dir="ltr">
                    {list.lastModified
                      ? new Date(list.lastModified)
                          .toLocaleString("en-CA", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          .replace(/-/g, "/")
                      : "-"}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div>
            <ReportSection
              listId={list.id}
              initialReport={list.report}
              archived={list.archived}
            />
          </div>
          {/* Families table */}
          {list.entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                لا توجد عائلات في هذه القائمة
              </h3>
              <p className="text-slate-600">قد تكون العائلات حذفت من النظام</p>
            </div>
          ) : (
            <>
              {/* Remove families controls — High+ only */}
              {canRemoveFamilies && !list.archived && (
                <div className="flex gap-4 items-center mb-4">
                  <button
                    onClick={resetSelection}
                    className="cursor-pointer min-w-[140px] inline-flex items-center justify-center gap-2
                      px-4 py-2.5 text-sm font-medium
                      text-yellow-600 hover:text-white
                      bg-white hover:bg-gradient-to-r hover:from-yellow-500 hover:to-orange-500
                      border border-yellow-300 hover:border-yellow-500
                      rounded-xl transition-all duration-200 shadow-sm hover:shadow-md
                      transform hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    إزالة الاختيارات
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="cursor-pointer min-w-[140px] inline-flex items-center justify-center gap-2
                      px-4 py-2.5 text-sm font-medium
                      text-red-600 hover:text-white
                      bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600
                      border border-red-300 hover:border-red-500
                      rounded-xl transition-all duration-200 shadow-sm hover:shadow-md
                      transform hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    حذف المختارات من القائمة
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-center p-3 font-semibold text-slate-900">
                        #
                      </th>
                      <th className="text-center p-3 font-semibold text-slate-900">
                        الكود
                      </th>
                      <th className="text-center p-3 font-semibold text-slate-900">
                        الوالدين
                      </th>
                      <th className="text-center p-3 font-semibold text-slate-900">
                        الحالة
                      </th>
                      <th className="text-center p-3 font-semibold text-slate-900 w-60">
                        الملاحظات
                      </th>
                      <th className="text-center p-3 font-semibold text-slate-900">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.entries.map((entry, index) => (
                      <FamilyRow
                        key={entry.family.code}
                        family={entry.family}
                        index={index}
                        isSelected={selectedCodesSet.has(entry.family.code)}
                        onRowClick={
                          canRemoveFamilies ? handleRowClick : undefined
                        }
                        onView={setSelectedFamily}
                        showArea={false}
                        showLists={false}
                        showNumbers={false}
                        showChildren={false}
                        showNotes={true}
                        showMark={canToggleDone && !list.archived}
                        onMark={handleMark}
                        isDone={entry.done || false}
                        entry={entry}
                        onEditNotes={canEditNotes ? handleEditNotes : undefined}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedFamily && (
        <FamilyDetailCard
          familyCode={selectedFamily}
          onClose={() => setSelectedFamily(null)}
        />
      )}
      {editNotes && (
        <FamilyNotesCard
          entry={editingEntry}
          onSave={handleSaveNotes}
          onClose={() => setEditNotes(false)}
        />
      )}
      {editList && (
        <ListEdit
          name={list.name}
          description={list.description}
          campaign={list.campaign}
          campaigns={campaigns}
          onClose={() => setEditList(false)}
          onSubmit={handleEditSubmit}
        />
      )}
      {showExport && (
        <ExportModal listId={list.id} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}
