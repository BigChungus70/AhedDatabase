import { useNavigate } from "react-router-dom";
import { Database, List, PersonStanding, ShieldCheck } from "lucide-react";
import DashboardStats from "../components/DashboardStats";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import { useRole, isAtLeast } from "../hooks/useRole";

const Dashboard = () => {
  const navigate = useNavigate();
  const role = useRole();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const confirmLogout = () => {
    toast(
      ({ closeToast }) => (
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-5 flex flex-col items-center text-center gap-4">
          <p className="text-gray-800 text-sm sm:text-base font-medium">
            هل أنت متأكد من تسجيل الخروج ؟
          </p>
          <div className="flex justify-center gap-3 w-full">
            <button
              onClick={() => {
                handleLogout();
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

  const allCards = [
    {
      title: "عرض جميع العائلات",
      description: "استعراض وإدارة بيانات جميع العائلات المسجلة في النظام",
      icon: Database,
      href: "/families",
      color: "bg-cyan-800 text-white hover:bg-cyan-900",
      iconColor: "text-cyan-800",
      minRole: "High",
    },
    {
      title: "القوائم المحفوظة",
      description: "عرض وإدارة القوائم المحفوظة مسبقاً",
      icon: List,
      href: "/lists",
      color: "bg-amber-700 text-white hover:bg-amber-800",
      iconColor: "text-amber-600",
      minRole: "Low",
    },
    {
      title: "إضافة عائلة",
      description: "اضافة عائلة جديدة للنظام",
      icon: PersonStanding,
      href: "/addFamily",
      color: "bg-teal-700 text-white hover:bg-teal-800",
      iconColor: "text-teal-600",
      minRole: "High",
    },
    {
      title: "إدارة الحسابات",
      description: "إنشاء وإدارة حسابات المستخدمين",
      icon: ShieldCheck,
      href: "/admin",
      color: "bg-rose-700 text-white hover:bg-rose-800",
      iconColor: "text-rose-600",
      minRole: "Admin",
    },
  ].filter((card) => isAtLeast(role, card.minRole));

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-3xl md:text-4xl font-bold text-cyan-800">
            مرحباً {localStorage.getItem("username")}
          </p>
          <button
            onClick={confirmLogout}
            className="cursor-pointer inline-flex items-center justify-center gap-2
              px-4 py-2.5 text-sm font-medium
              text-red-600 hover:text-white
              bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600
              border border-red-300 hover:border-red-500
              rounded-xl transition-all duration-200
              shadow-sm hover:shadow-md
              transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            تسجيل الخروج
          </button>
        </div>

        {/* Stats — renders null internally for Low/Mid */}
        <DashboardStats />

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="group relative bg-white hover:bg-gradient-to-br hover:from-white hover:to-slate-50 rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 hover:border-slate-300 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="relative p-8 text-right flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {card.title}
                      </h3>
                    </div>
                    <div className="flex-shrink-0 p-3 rounded-xl bg-slate-100 group-hover:scale-110 transition-all duration-300">
                      <Icon className={`h-7 w-7 ${card.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-slate-600 text-base leading-relaxed mb-8 flex-1">
                    {card.description}
                  </p>
                  <div className="mt-auto">
                    <button
                      className={`w-full inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer ${card.color}`}
                      onClick={() => navigate(card.href)}
                    >
                      الانتقال
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
