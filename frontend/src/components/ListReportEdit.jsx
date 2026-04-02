import { useState } from "react";
import ReportModal from "./ListReportModal";


export default function ReportSection({ listId, initialReport, archived }) {
  const [report, setReport] = useState(initialReport ?? "");
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="p-3 text-sm font-semibold rounded-lg border border-slate-200 text-slate-900 bg-slate-200">
            التقرير 📝
          </h3>
          {!archived && (
            <button
              onClick={() => setShowModal(true)}
              className="cursor-pointer inline-flex items-center justify-center gap-2
                px-4 py-2.5 text-sm font-medium
                text-teal-600 hover:text-white
                bg-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-500
                border border-teal-300 hover:border-teal-500
                rounded-xl transition-all duration-200 shadow-sm hover:shadow-md
                transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              {report ? "تعديل" : "إضافة تقرير"}
            </button>
          )}
        </div>
        <p
          className={`p-4 text-sm leading-relaxed text-right whitespace-pre-wrap ${
            report ? "text-slate-700" : "text-slate-400 italic"
          }`}
        >
          {report || "لا يوجد تقرير"}
        </p>
      </div>

      {showModal && (
        <ReportModal
          listId={listId}
          initialReport={report}
          onClose={() => setShowModal(false)}
          onSave={(saved) => setReport(saved)}
        />
      )}
    </>
  );
}