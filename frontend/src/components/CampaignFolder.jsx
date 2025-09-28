import { ArchiveIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CampaignFolder({
  campaign,
  campaigns,
  lists,
  onArchive,
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* folder header */}
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
          className={`w-5 h-5 text-slate-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
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

      {/* folder body */}
      {open && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/50">
          {lists.map((list) => (
            <div
              key={list.id}
              onClick={() => navigate(`/lists/${list.id}`)}
              className={`${
                list.archived ? "bg-slate-200" : "bg-white"
              } rounded-lg border border-slate-200 p-4
      hover:shadow-md transition-shadow cursor-pointer
      flex flex-col h-full`} /* 1 */
            >
              {/* ----- content area ----- */}
              <div className="flex-1">
                {" "}
                
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 text-lg">
                    {list.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(list);
                    }}
                    className="text-red-500 hover:text-red-700 p-1 cursor-alias"
                    title="أرشفة القائمة"
                    hidden={list.archived}
                  >
                    <ArchiveIcon color="gray" />
                  </button>
                </div>
                {list.description && (
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                    {list.description}
                  </p>
                )}
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
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        list.archived
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      مؤرشفة: {list.archived ? "نعم" : "لا"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ----- footer (glued to bottom) ----- */}
              <div
                className={`mt-auto pt-3 border-t ${
                  list.archived ? "border-slate-400" : "border-slate-300"
                }`}
              />
              <button className="cursor-pointer text-cyan-800 hover:text-cyan-900 text-sm font-medium">
                عرض التفاصيل ←
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
