"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { familyAPI } from "../services/api";
import FamilyTable from "../components/FamilyTable";
import FamilyFilters from "../components/FamilyFilters";

const FamiliesPage = () => {
  const navigate = useNavigate();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [filters, setFilters] = useState({
    filterByLowercaseFirstLetter: false, // boolean
    conditions: [], // FamilyCondition[]
    areas: [], // string[]
    minAge: undefined, // number | undefined
    maxAge: undefined, // number | undefined
    archiveOption: "Exclude", // "All" | "Archived" | "Exclude"
    allowedStatuses: [], // DataStatus[]
    priorityOnly: false, // boolean
    searchText: "",
  });

  useEffect(() => {
    loadFamilies();
  }, [filters, refresh]);


  const loadFamilies = async () => {
    try {
      setLoading(true);
      const data = await familyAPI.searchFamilies(filters);
      setFamilies(data);
     
    } catch (error) {
      console.error("Error loading families:", error);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-cyan-800">
            إدارة العائلات
          </h1>
          <button
            onClick={() => navigate("/")}
            className="cursor-pointer inline-flex items-center justify-center gap-2
      px-4 py-2.5 text-sm font-medium
      text-gray-600 hover:text-white
      bg-white hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-600
      border border-gray-300 hover:border-gray-500 
      rounded-xl transition-all duration-200 
      shadow-sm hover:shadow-md hover:shadow-teal-500/25 
      transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            العودة للرئيسية
          </button>
        </div>

        {/* Filters */}
        <FamilyFilters filters={filters} onFiltersChange={setFilters} />

        {/* Family Table */}
        <FamilyTable
          families={families}
          loading={loading}
          setRefresh={setRefresh}
        />
      </div>
    </div>
  );
};

export default FamiliesPage;
