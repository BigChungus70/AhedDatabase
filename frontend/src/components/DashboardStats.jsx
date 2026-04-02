import { useState, useEffect } from "react";
import { Users, Archive, List } from "lucide-react";
import { familyAPI, savedListAPI } from "../services/api";
import { useRole, isAtLeast } from "../hooks/useRole";

const DashboardStats = () => {
  const role = useRole();

  const [stats, setStats] = useState({
    totalFamilies: 0,
    nonArchivedFamilies: 0,
    savedLists: 0,
  });
  const [loading, setLoading] = useState(true);

  // Only High+ can see stats — don't even fetch for others
  if (!isAtLeast(role, "High")) return null;

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [totalCount, nonArchivedCount, listsCount] = await Promise.all([
          familyAPI.getFamilyCount(),
          familyAPI.getNonArchivedFamilyCount(),
          savedListAPI.getCount(),
        ]);
        setStats({
          totalFamilies: totalCount,
          nonArchivedFamilies: nonArchivedCount,
          savedLists: listsCount,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const statsCards = [
    {
      title: "إجمالي العائلات",
      value: stats.totalFamilies,
      icon: Users,
      color: "text-cyan-800",
      bgColor: "bg-cyan-50",
    },
    {
      title: "العائلات النشطة",
      value: stats.nonArchivedFamilies,
      icon: Archive,
      color: "text-teal-700",
      bgColor: "bg-teal-50",
    },
    {
      title: "القوائم المحفوظة",
      value: stats.savedLists,
      icon: List,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-8 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-slate-600 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
