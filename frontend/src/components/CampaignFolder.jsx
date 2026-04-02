import { ArchiveIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRole, isAtLeast } from "../hooks/useRole";
import { savedListAPI } from "../services/api";
import { toast } from "react-toastify";
import ExportModal from "./ExportModal";
import ReportModal from "./ListReportModal";

export default function CampaignFolder({
  campaign,
  campaigns,
  lists,
  onArchive,
  onListsRefresh,
}) {
  const [open, setOpen] = useState(false);
  const [exportListId, setExportListId] = useState(null);
  const [editingReportId, setEditingReportId] = useState(null);
  const [reportListId, setReportListId] = useState(null);
  const [reportInitial, setReportInitial] = useState("");
  const [reportDrafts, setReportDrafts] = useState({});
  const navigate = useNavigate();
  const role = useRole();

  const canGoInside = isAtLeast(role, "Mid");
  const canArchive = isAtLeast(role, "High");

  const handleReportSave = async (e, listId) => {
    e.stopPropagation();
    try {
      await savedListAPI.updateReport(listId, reportDrafts[listId] ?? "");
      toast.success("تم حفظ التقرير", {
        position: "top-left",
        autoClose: 1500,
        theme: "colored",
      });
      setEditingReportId(null);
      onListsRefresh?.();
    } catch {
      toast.error("حدث خطأ أثناء حفظ التقرير", {
        position: "top-left",
        autoClose: 1500,
        theme: "colored",
      });
    }
  };

  return (
    <>
      {exportListId && (
        <ExportModal
          listId={exportListId}
          onClose={() => setExportListId(null)}
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Folder header */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-slate-700 font-semibold">
              {campaign === "None"
                ? `${campaigns[campaign] ?? campaign}`
                : `حملة: ${campaigns[campaign] ?? campaign}`}
            </span>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
              {lists.length} قائمة
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Folder body */}
        {open && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/50">
            {lists.map((list) => (
              <div
                key={list.id}
                onClick={() => canGoInside && navigate(`/lists/${list.id}`)}
                className={`
                  ${list.archived ? "bg-slate-200" : "bg-white"}
                  rounded-lg border border-slate-200 p-4 flex flex-col h-full transition-shadow
                  ${canGoInside ? "hover:shadow-md cursor-pointer" : "cursor-default"}
                `}
              >
                <div className="flex-1">
                  {/* Title row */}
                  <div className="flex flex-col mb-3 gap-2">
                    <div className="flex items-center gap-2 w-full">
                      {!list.archived && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExportListId(list.id);
                          }}
                          className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2
          py-1.5 text-sm font-medium
          text-green-600 hover:text-white
          bg-white hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600
          border border-green-300 hover:border-green-500
          rounded-xl transition-all duration-200 shadow-sm hover:shadow-md
          transform hover:-translate-y-0.5 whitespace-nowrap"
                        >
                          تحميل Excel
                          <DownloadIcon size={18} />
                        </button>
                      )}
                      {canArchive && !list.archived && onArchive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchive(list);
                          }}
                          className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2
          py-1.5 text-sm font-medium
          text-indigo-600 hover:text-white
          bg-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500
          border border-indigo-300 hover:border-indigo-500
          rounded-xl transition-all duration-200 shadow-sm hover:shadow-md
          transform hover:-translate-y-0.5 whitespace-nowrap"
                        >
                          أرشفة القائمة
                          <ArchiveIcon size={18} />
                        </button>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg">
                      {list.name}
                    </h3>
                  </div>
                  {list.description && (
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                      {list.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-500 mb-2">
                    <div className="space-y-1">
                      <div>
                        عدد العائلات:{" "}
                        <span className="font-medium text-slate-700">
                          {list.familyCount || 0}
                        </span>
                      </div>
                      <div>
                        عدد العائلات المنجزة:{" "}
                        <span className="font-medium text-slate-700">
                          {list.doneCount || 0}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div>
                        تاريخ الإنشاء:&nbsp;
                        <span
                          dir="ltr"
                          className="font-medium text-slate-700 inline-block"
                        >
                          {list.createdDate
                            ? new Date(list.createdDate)
                                .toISOString()
                                .split("T")[0]
                                .replace(/-/g, "/")
                            : "-"}
                        </span>
                      </div>
                      <div>
                        آخر تعديل:&nbsp;
                        <span
                          dir="ltr"
                          className="font-medium text-slate-700 inline-block"
                        >
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
                      </div>
                    </div>
                    <div className="sm:col-span-2 mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${list.archived ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                      >
                        مؤرشفة: {list.archived ? "نعم" : "لا"}
                      </span>
                    </div>
                  </div>

                  {/* Report field — all roles, active lists only */}
                  {!list.archived && (
                    <div
                      className="mt-3 pb-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportListId(list.id);
                          setReportInitial(list.report ?? "");
                        }}
                        className="w-full text-right text-xs text-slate-500 hover:text-cyan-700 border border-dashed border-slate-300 hover:border-cyan-400 rounded-lg p-2 transition"
                      >
                        {list.report ? (
                          <span className="line-clamp-2">📝 {list.report}</span>
                        ) : (
                          <span>＋ إضافة تقرير</span>
                        )}
                      </button>
                    </div>
                  )}
                  {reportListId && (
                    <ReportModal
                      listId={reportListId}
                      initialReport={reportInitial}
                      onClose={() => setReportListId(null)}
                      onSave={() => {
                        setReportListId(null);
                        onListsRefresh?.();
                      }}
                    />
                  )}
                </div>

                {/* Footer */}
                <div
                  className={`mt-auto pt-3 border-t ${list.archived ? "border-slate-400" : "border-slate-300"}`}
                />
                {canGoInside && (
                  <button className="cursor-pointer text-cyan-800 hover:text-cyan-900 text-sm font-medium text-right">
                    عرض التفاصيل ←
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
