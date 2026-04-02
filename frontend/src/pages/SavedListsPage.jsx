import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { savedListAPI } from "../services/api";
import { toast } from "react-toastify";
import CampaignFolder from "../components/CampaignFolder";
import { useRole, isAtLeast } from "../hooks/useRole";

export default function SavedListsPage() {
  const navigate = useNavigate();
  const role = useRole();

  const [allLists, setAllLists] = useState([]);
  const [filteredLists, setFilteredLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archiveOption, setArchiveOption] = useState("Exclude");
  const [campaigns, setCampaigns] = useState([]);

  const canCreateList = isAtLeast(role, "High");
  const canArchive = isAtLeast(role, "High");

  const effectiveArchiveOption = isAtLeast(role, "High")
    ? archiveOption
    : "Exclude";

  const fetchLists = async () => {
    try {
      const data = await savedListAPI.getAll();
      setAllLists(data);
    } catch (error) {
      console.error("Error fetching lists:", error);
      toast.error("حدث خطأ أثناء تحميل القوائم", {
        position: "top-left",
        autoClose: 1500,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const data = await savedListAPI.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  useEffect(() => {
    fetchLists();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    let filtered = [...allLists];
    if (effectiveArchiveOption === "Archived") {
      filtered = allLists.filter((l) => l.archived === true);
    } else if (effectiveArchiveOption === "Exclude") {
      filtered = allLists.filter((l) => l.archived === false);
    }
    setFilteredLists(filtered);
  }, [allLists, archiveOption, role]);

  const groupByCampaign = (lists) =>
    lists.reduce((acc, list) => {
      const key = list.campaign;
      acc[key] = acc[key] || [];
      acc[key].push(list);
      return acc;
    }, {});

  const handleArchive = async (list) => {
    try {
      await savedListAPI.archive(list.id);
      await fetchLists();
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

  const confirmArchive = (list) => {
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
                handleArchive(list);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-800 mx-auto mb-4" />
          <p className="text-slate-600">جاري تحميل القوائم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-2xl font-bold text-slate-900">
                القوائم المحفوظة
              </h1>

              <div className="flex flex-col sm:flex-row gap-3">
                {canCreateList && (
                  <button
                    onClick={() => navigate("/families")}
                    className="cursor-pointer inline-flex items-center justify-center gap-2
                      px-4 py-2.5 text-sm font-medium
                      text-blue-600 hover:text-white
                      bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500
                      border border-blue-300 hover:border-blue-500
                      rounded-xl transition-all duration-200
                      shadow-sm hover:shadow-md hover:shadow-teal-500/25
                      transform hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    <span>+</span>
                    إنشاء قائمة جديدة
                  </button>
                )}
                <button
                  onClick={() => navigate("/")}
                  className="cursor-pointer inline-flex items-center justify-center gap-2
                    px-4 py-2.5 text-sm font-medium
                    text-gray-600 hover:text-white
                    bg-white hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-600
                    border border-gray-300 hover:border-gray-500
                    rounded-xl transition-all duration-200
                    shadow-sm hover:shadow-md
                    transform hover:-translate-y-0.5 whitespace-nowrap"
                >
                  العودة للرئيسية
                </button>
              </div>
            </div>

            {/* Archive filter — hidden for Low */}
            {isAtLeast(role, "High") && (
              <div className="mt-4 flex justify-center sm:justify-end">
                <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white w-full max-w-md">
                  {[
                    { label: "عرض الكل", value: "All" },
                    { label: "المؤرشف فقط", value: "Archived" },
                    { label: "استبعاد المؤرشف", value: "Exclude" },
                  ].map((option) => {
                    const isActive = archiveOption === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`flex-1 flex items-center justify-center cursor-pointer px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200
                          ${
                            isActive
                              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                              : "bg-white text-slate-700 hover:text-white hover:bg-gradient-to-r hover:from-slate-600 hover:to-slate-700 hover:shadow-md"
                          }`}
                      >
                        <input
                          type="radio"
                          name="archiveOption"
                          value={option.value}
                          checked={isActive}
                          onChange={() => setArchiveOption(option.value)}
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Body */}
          {filteredLists.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {allLists.length === 0
                  ? "لا توجد قوائم محفوظة"
                  : "لا توجد قوائم تطابق المرشح المحدد"}
              </h3>
              <p className="text-slate-600 mb-6">
                {allLists.length === 0
                  ? "ابدأ بإنشاء قائمة جديدة لتنظيم العائلات"
                  : "جرب تغيير المرشح لعرض قوائم أخرى"}
              </p>
              {allLists.length === 0 && canCreateList && (
                <button
                  onClick={() => navigate("/families")}
                  className="px-6 py-3 bg-cyan-800 text-white rounded-lg hover:bg-cyan-900"
                >
                  إنشاء قائمة جديدة
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupByCampaign(filteredLists)).map(
                ([campaign, lists]) => (
                  <CampaignFolder
                    key={campaign}
                    campaign={campaign}
                    campaigns={campaigns}
                    lists={lists}
                    onArchive={canArchive ? confirmArchive : null}
                    onListsRefresh={fetchLists}
                  />
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
