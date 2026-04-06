

'use client';
import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  AlertCircle,
  XCircle as XIcon,
  Building,
  MapPin,
  BarChart3,
  Award,
  Download,
} from "lucide-react";
import axios from "axios";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/* ---------- Types ---------- */
interface EvaluationListItem {
  id: number;
  employee: string;
  snapshot_full_name: string;
  snapshot_department: string;
  snapshot_designation: string;
  station_name: string;
  evaluation_date: string;
  total_marks: number;
  status: string;
  level: number;
  department: number;
}

/* ---------- API ---------- */
const API_URL = "http://192.168.2.51:8000/skillevaluations/";

/* ---------- Component ---------- */
const SkillEvaluationList: React.FC = () => {
  const [data, setData] = useState<EvaluationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pass" | "Fail" | "Pending">("All");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [levelFilter, setLevelFilter] = useState<string>("All");
  const handleSearch = () => {
    setSearchTerm(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchTerm(inputValue);
    }
  };
  /* ---- FETCH DATA ---- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        if (departmentFilter !== "All") params.append("department", departmentFilter);
        if (levelFilter !== "All") params.append("level", levelFilter);
        if (statusFilter !== "All") params.append("status", statusFilter);

        const response = await axios.get(`${API_URL}?${params.toString()}`);
        setData(response.data);
      } catch (err: any) {
        console.error("Fetch failed:", err);
        const errorMsg =
          err.response?.data?.detail ||
          err.response?.data ||
          err.message ||
          "Failed to load evaluations";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchTerm, departmentFilter, levelFilter, statusFilter]);

  /* ---- FILTER OPTIONS ---- */
  const departmentOptions = useMemo(() => {
    const map = new Map<number, string>();
    data.forEach((item) => {
      if (item.department && item.snapshot_department) {
        map.set(item.department, item.snapshot_department);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [data]);

  const levels = useMemo(() => {
    const lvls = new Set(data.map((i) => i.level.toString()));
    return Array.from(lvls).sort((a, b) => parseInt(a) - parseInt(b));
  }, [data]);

  /* ---- FILTERED DATA ---- */
  /* ---- FILTERED DATA ---- */
  const filtered = useMemo(() => {
    return data.filter((item) => {
      // Convert search term to lowercase once
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        item.employee.toLowerCase().includes(term) ||
        item.snapshot_full_name.toLowerCase().includes(term) ||
        // --- ADDED THESE FIELDS ---
        (item.station_name ?? "").toLowerCase().includes(term) ||
        (item.snapshot_department ?? "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || item.status.includes(statusFilter);
      const matchesDepartment =
        departmentFilter === "All" || item.department.toString() === departmentFilter;
      const matchesLevel =
        levelFilter === "All" || item.level.toString() === levelFilter;

      return matchesSearch && matchesStatus && matchesDepartment && matchesLevel;
    });
  }, [data, searchTerm, statusFilter, departmentFilter, levelFilter]);
  /* ---- STATS ---- */
  const stats = useMemo(
    () => ({
      total: data.length,
      passed: data.filter((i) => i.status.includes("Pass")).length,
      failed: data.filter((i) => i.status.includes("Fail")).length,
      pending: data.filter((i) => i.status === "Pending").length,
      avgMarks:
        data.length > 0
          ? (data.reduce((a, b) => a + b.total_marks, 0) / data.length).toFixed(1)
          : "0",
    }),
    [data]
  );

  /* ---- EXCEL EXPORT WITH HEADING & STRUCTURE ---- */
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Evaluations", {
      pageSetup: { paperSize: 9, orientation: "landscape" },
    });

    // === COMPANY & TITLE ===
    worksheet.mergeCells("A1:H1");
    const companyCell = worksheet.getCell("A1");
    companyCell.value = "Krishna Maruti Limited Penstone";
    companyCell.font = { size: 16, bold: true, color: { argb: "FF1E40AF" } };
    companyCell.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("A2:H2");
    const titleCell = worksheet.getCell("A2");
    titleCell.value = "Skill Evaluation Report – Level 2";
    titleCell.font = { size: 14, bold: true, color: { argb: "FF1E40AF" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // === GENERATED INFO ===
    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const filterSummary = [
      searchTerm ? `Search: ${searchTerm}` : null,
      statusFilter !== "All" ? `Status: ${statusFilter}` : null,
      departmentFilter !== "All"
        ? `Dept: ${departmentOptions.find(([id]) => id.toString() === departmentFilter)?.[1] || ""}`
        : null,
      levelFilter !== "All" ? `Level: ${levelFilter}` : null,
    ].filter(Boolean).join(" | ") || "All Records";

    worksheet.mergeCells("A3:H3");
    const infoCell = worksheet.getCell("A3");
    infoCell.value = `Generated on: ${now} | Filters: ${filterSummary}`;
    infoCell.font = { size: 10, italic: true, color: { argb: "FF6B7280" } };
    infoCell.alignment = { horizontal: "center" };

    // === COLUMN HEADERS ===
    const headerRow = worksheet.getRow(5);
    const headers = [
      "Emp ID",
      "Name",
      "Department",
      "Station",
      "Level",
      "Date",
      "Marks (%)",
      "Status",
    ];
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" }, // Indigo-600
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    headerRow.height = 30;

    // === DATA ROWS ===
    filtered.forEach((item, idx) => {
      const row = worksheet.addRow([
        item.employee,
        item.snapshot_full_name,
        item.snapshot_department,
        item.station_name,
        item.level,
        new Date(item.evaluation_date).toLocaleDateString("en-IN"),
        item.total_marks,
        item.status,
      ]);

      // Alternating background
      if (idx % 2 === 1) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF9FAFB" },
        };
      }

      // Border for all cells
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle" };
      });

      // Status color
      const statusCell = row.getCell(8);
      let statusColor = "FF6B7280";
      if (item.status.includes("Pass")) statusColor = "FF10B981"; // Emerald
      else if (item.status.includes("Fail")) statusColor = "FFEF4444"; // Red
      else if (item.status === "Pending") statusColor = "FFF59E0B"; // Amber

      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: statusColor } };
      statusCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      statusCell.alignment = { horizontal: "center" };

      // Department color
      const deptCell = row.getCell(3);
      const hash = item.snapshot_department.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
      const deptColors = [
        "FF3B82F6", // blue-500
        "FF6366F1", // indigo-500
        "FF8B5CF6", // violet-500
        "FFEC4899", // pink-500
        "FF14B8A6", // teal-500
        "FF06B6D4", // cyan-500
      ];
      deptCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: deptColors[hash % deptColors.length] },
      };
      deptCell.font = { color: { argb: "FFFFFFFF" } };

      // Center numeric columns
      row.getCell(5).alignment = { horizontal: "center" }; // Level
      row.getCell(7).alignment = { horizontal: "center" }; // Marks
    });

    // === AUTO-SIZE COLUMNS ===
    worksheet.columns = [
      { width: 12 },
      { width: 28 },
      { width: 22 },
      { width: 20 },
      { width: 10 },
      { width: 14 },
      { width: 12 },
      { width: 16 },
    ];

    // === DOWNLOAD ===
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `Skill_Evaluation_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  /* ---- UI HELPERS ---- */
  const renderStatus = (status: string) => {
    if (status.includes("Pass"))
      return (
        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{status}</span>
        </div>
      );
    if (status.includes("Fail"))
      return (
        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-rose-100 text-rose-800 rounded-full border border-rose-300">
          <XCircle className="w-3.5 h-3.5" />
          <span>{status}</span>
        </div>
      );
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
        <Clock className="w-3.5 h-3.5" />
        <span>Pending</span>
      </div>
    );
  };

  const getDepartmentBadgeStyle = (dept: string) => {
    const hash = dept.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-300",
      "bg-indigo-100 text-indigo-700 border-indigo-300",
      "bg-purple-100 text-purple-700 border-purple-300",
      "bg-pink-100 text-pink-700 border-pink-300",
      "bg-teal-100 text-teal-700 border-teal-300",
      "bg-cyan-100 text-cyan-700 border-cyan-300",
    ];
    return colors[hash % colors.length];
  };

  const clearFilters = () => {
    setInputValue(""); // Clear the UI input
    setSearchTerm("");
    setStatusFilter("All");
    setDepartmentFilter("All");
    setLevelFilter("All");
  };

  /* ---- RENDER ---- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Skill Evaluations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-800 mb-2">Failed to Load Data</h3>
          <p className="text-red-600 mb-4 break-words">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-2xl shadow-2xl border border-white/20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.3),_transparent_50%)]" />
          </div>
          <div className="absolute inset-0 backdrop-blur-xl bg-white/10" />
          <div className="relative p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 transform transition-all duration-300 hover:scale-110 hover:shadow-2xl group">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl scale-75 group-hover:scale-100 transition-all duration-500" />
                <Award className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent drop-shadow-lg">
                  Skill Evaluation Dashboard
                </h1>
                {/* <p className="text-white/80 mt-2 text-sm sm:text-base font-medium drop-shadow">
                  Level 2 evaluation tracking with real-time insights
                </p> */}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:flex items-center gap-2 text-white/70 text-xs font-medium">
                <Clock className="w-4 h-4" />
                <span>Updated: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
              </span>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-all font-medium"
              >
                <Download className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Evaluations" value={stats.total} color="indigo" />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Passed" value={stats.passed} color="emerald" />
          <StatCard icon={<XCircle className="w-5 h-5" />} label="Failed" value={stats.failed} color="rose" />
          {/* <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={stats.pending} color="amber" /> */}
          <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Avg Marks" value={`${stats.avgMarks}%`} color="purple" />
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-semibold">Filters</span>
            </div>
            {(searchTerm || statusFilter !== "All" || departmentFilter !== "All" || levelFilter !== "All") && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white transition-colors"
              >
                <XIcon className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>
          <div className="p-6 space-y-5">
            <div className="flex gap-3 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                <input
                  type="text"
                  placeholder="Search by ID, Name, Station, or Dept..."
                  value={inputValue} // Bind to inputValue
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown} // Listen for Enter
                  className="w-full pl-12 pr-4 py-3 text-sm border border-indigo-200 rounded-xl bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-indigo-400"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Status */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full pl-12 pr-10 py-3 text-sm border border-emerald-200 rounded-xl bg-emerald-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer transition-all"
                >
                  <option value="All">All Status</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  {/* <option value="Pending">Pending</option> */}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {/* Department */}
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 text-sm border border-purple-200 rounded-xl bg-purple-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer transition-all"
                >
                  <option value="All">All Departments</option>
                  {departmentOptions.map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {/* Level */}
              <div className="relative">
                <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600" />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 text-sm border border-teal-200 rounded-xl bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none cursor-pointer transition-all"
                >
                  <option value="All">All Levels</option>
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>Level {lvl}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        {/* TABLE – HORIZONTAL SIDE SCROLL ONLY */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-gray-100">
            {/* Force minimum width for side scroll */}
            <div className="min-w-[1200px]">
              <table className="w-full text-sm table-auto">
                {/* STICKY HEADER */}
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Emp ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Station</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Level</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Marks</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                  </tr>
                </thead>

                {/* BODY – NO VERTICAL SCROLL */}
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="text-gray-400">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-3" />
                          <p className="text-sm font-medium">No evaluations found</p>
                          <p className="text-xs mt-1">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 font-mono text-xs text-gray-700 whitespace-nowrap">{item.employee}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{item.snapshot_full_name}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getDepartmentBadgeStyle(
                              item.snapshot_department
                            )}`}
                          >
                            {item.snapshot_department}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 flex items-center gap-1.5 whitespace-nowrap">
                          <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                          {item.station_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-center font-semibold text-indigo-700">{item.level}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(item.evaluation_date).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 flex items-center gap-1.5 whitespace-nowrap">
                          <BarChart3 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          {item.total_marks}%
                        </td>
                        <td className="px-6 py-4">{renderStatus(item.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>




      </div>
    </div>
  );
};

/* ──────────────────────── STAT CARD ──────────────────────── */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: "indigo" | "emerald" | "rose" | "amber" | "purple";
}
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  const colors = {
    indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
    rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
    purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  };
  const { bg, border, text } = colors[color];
  return (
    <div className={`bg-white ${border} border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-2xl font-bold ${text}`}>{value}</p>
          <p className={`text-xs font-medium ${text} mt-1`}>{label}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${bg} group-hover:scale-110 transition-transform`}>
          <div className={text}>{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default SkillEvaluationList;