import React from "react";
import { CheckIcon, Eye, Minus } from "lucide-react";
import {
  FAMILY_CONDITIONS,
  CONDITION_COLORS,
  DATA_STATUSES_COLORS,
} from "../services/constants";

const FamilyRow = React.memo(
  ({
    family,
    index,
    onRowClick,
    onView,
    isSelected,
    showArea,
    showLists,
    showNumbers,
    showNotes,
    showChildren,
    showMark,
    onMark,
    isDone,
    entry,
    onEditNotes,
  }) => {
    // Compute row background with proper zebra striping + selection
    let rowBg = "";
    if (isDone && isSelected) {
      rowBg = "bg-yellow-600"; // dark yellow for done+selected
    } else if (isDone && !isSelected) {
      rowBg = "bg-gray-400"; // dark gray for done only
    } else if (!isDone && isSelected) {
      rowBg = "bg-yellow-100"; // current yellow for selected only
    } else {
      rowBg = index % 2 === 0 ? "bg-slate-50" : "bg-slate-100"; // normal zebra
    }

    const hoverClass = isSelected ? "" : "hover:bg-slate-200";

    return (
      <tr
        className={`cursor-pointer ${rowBg} ${hoverClass}`}
        onClick={() => onRowClick(family)}
      >
        {/* Sticky index */}
        <td
          className={`m-0 sticky right-0 w-8 z-40 text-xs font-mono text-center ${
            DATA_STATUSES_COLORS[family.dataStatus] || rowBg
          }`}
        >
          {index + 1}
        </td>

        {/* Code */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
          <span>{family.code}</span>
        </td>

        {/* Area */}
        {showArea && (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
            {family.areaName || "-"}
          </td>
        )}
        {/* Parents */}
        <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
          {family.parents || "-"}
        </td>

        {/* Condition */}
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
              CONDITION_COLORS[family.condition] ||
              "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            {FAMILY_CONDITIONS[family.condition] || family.condition}
          </span>
        </td>

        {/* Notes */}
        {showNotes && (
          <td
            className="px-6 py-4 text-sm text-right align-top"
            onClick={(e) => {
              e.stopPropagation();
              if (showMark) onEditNotes(entry);
            }}
          >
            <div className="inline-block w-fit">
              {entry.notes ? (
                <div
                  className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 whitespace-pre-wrap break-words shadow-sm hover:shadow-md transition-shadow duration-200"
                  style={{
                    minHeight: "40px",
                    width: "fit-content",
                    minWidth: "80px",
                  }}
                >
                  {entry.notes}
                </div>
              ) : (
                <div
                  className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-400 text-center shadow-sm"
                  style={{
                    height: "40px",
                    width: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  —
                </div>
              )}
            </div>
          </td>
        )}

        {/* Children count */}
        {showChildren && (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
            {family.childrenCount || 0}
          </td>
        )}

        {/* Lists */}
        {showLists && (
          <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
            {family.containingLists?.map((list, index) => (
              <div key={index}>{list}</div>
            ))}
          </td>
        )}
        {/* Numbers */}
        {showNumbers && (
          <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
            {family.numbers?.split("\n").map((number, index) => (
              <div key={index}>{number}</div>
            ))}
          </td>
        )}
        {/* Actions */}
        <td className="px-4 py-3 text-center whitespace-nowrap">
          <div className="flex gap-2 justify-center items-center">
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent row click from firing
                sessionStorage.setItem("scrollPosition", window.pageYOffset);
                onView(family);
              }}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-white bg-white hover:bg-slate-700 border border-slate-300 hover:border-slate-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap"
            >
              <Eye className="h-4 w-4" />
              عرض
            </button>
            {showMark && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMark(family.id);
                }}
                className={`
          inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer border transition-all duration-200 shadow-sm hover:shadow-md
          ${
            isDone
              ? "bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 hover:from-green-600 hover:to-emerald-600 text-white shadow-green-500/25"
              : "bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400 hover:from-yellow-600 hover:to-orange-600 text-white shadow-red-500/25"
          }
        `}
              >
                {isDone ? (
                  <CheckIcon/>
                  // <svg
                  //   className="w-4 h-4"
                  //   fill="none"
                  //   stroke="currentColor"
                  //   viewBox="0 0 24 24"
                  // >
                  //   <path
                  //     strokeLinecap="round"
                  //     strokeLinejoin="round"
                  //     strokeWidth={2}
                  //     d="M5 13l4 4L19 7"
                  //   />
                  // </svg>
                ) : (
                  <Minus/>
                  // <svg
                  //   className="w-4 h-4"
                  //   fill="none"
                  //   stroke="currentColor"
                  //   viewBox="0 0 24 24"
                  // >
                  //   <path
                  //     strokeLinecap="round"
                  //     strokeLinejoin="round"
                  //     strokeWidth={2}
                  //     d="M6 12h12"
                  //   />
                  // </svg>
                )}
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }
);

export default FamilyRow;
