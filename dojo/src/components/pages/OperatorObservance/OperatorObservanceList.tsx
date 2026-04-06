
// 'use client';

// import React, { useEffect, useState, useMemo } from "react";
// import {
//   Search, Filter, CheckCircle, XCircle,
//   Award, Clock, Users, AlertCircle, XCircle as XIcon,
// } from "lucide-react";

// const API_BASE_URL = "http://192.168.2.51:8000";

// /* ---------- Types ---------- */
// interface Topic {
//   id: number;
//   sr_no: number;
//   topic_name: string;
//   description: string;
// }

// interface Sheet {
//   id: number;
//   operator_name: string;
//   operator_category: string | null;
//   process_name: string;
//   supervisor_name: string;
//   evaluation_start_date: string;
//   evaluation_end_date: string;
//   level: "Level 2" | "Level 3" | "Level 4";
//   marks: Record<string, Record<string, string>>; // { "1": { "D1": "O", ... } }
//   remarks: string | null;
//   score: string;
//   marks_obtained: string;
//   value: string;
//   result: string; // "Qualified" | "Re-training" | "Pending" | ...
//   signatures: Record<string, string>;
//   department_id: number | null;
//   department_name: string | null;
//   topics: Topic[];
// }

// /* ---------- Status Logic ---------- */
// type Status = "Complete-Pass" | "Complete-Fail" | "Incomplete" | "Re-training";

// const getRequiredPeriods = (level: Sheet["level"]): string[] => {
//   switch (level) {
//     case "Level 2": return ["D1", "D2", "D3", "D4", "D5", "D6"];
//     case "Level 3": return ["W1", "W2", "W3", "W4"];
//     case "Level 4": return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//     default: return [];
//   }
// };

// const calculateStatus = (sheet: Sheet): Status => {
//   const periods = getRequiredPeriods(sheet.level);
//   const marks = sheet.marks ?? {};

//   // 1. Explicit "Pending" → Incomplete
//   if (sheet.result === "Pending") return "Incomplete";

//   // 2. "Re-training" → always show as Re-training
//   if (sheet.result === "Re-training") return "Re-training";

//   // 3. "Qualified" → must be FULLY filled (all cells present)
//   if (sheet.result === "Qualified") {
//     for (const topic of sheet.topics) {
//       const topicKey = String(topic.sr_no);
//       const dayMap = marks[topicKey] ?? {};

//       for (const p of periods) {
//         if (!dayMap[p]) return "Incomplete"; // Any missing cell → Incomplete
//       }
//     }
//     return "Complete-Pass";
//   }

//   // 4. Fallback: O/X logic + missing cell check
//   let allFilled = true;
//   let hasX = false;

//   for (const topic of sheet.topics) {
//     const topicKey = String(topic.sr_no);
//     const dayMap = marks[topicKey] ?? {};

//     for (const p of periods) {
//       const mark = dayMap[p] ?? "";
//       if (!mark) allFilled = false;
//       if (mark === "X") hasX = true;
//     }
//   }

//   if (!allFilled) return "Incomplete";     // e.g. 60/72 → Incomplete
//   if (hasX) return "Complete-Fail";
//   return "Complete-Pass";
// };

// /* ---------- Component ---------- */
// const OperatorObservanceStatusList: React.FC = () => {
//   const [sheets, setSheets] = useState<Sheet[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
//   const [departmentFilter, setDepartmentFilter] = useState<string>("All");
//   const [levelFilter, setLevelFilter] = useState<"All" | "Level 2" | "Level 3" | "Level 4">("All");

//   /* ---- FETCH ALL SHEETS ---- */
//   useEffect(() => {
//     const fetchSheets = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const res = await fetch(`${API_BASE_URL}/observancesheets/`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data: Sheet[] = await res.json();
//         setSheets(data);
//       } catch (err: any) {
//         console.error(err);
//         setError(err.message || "Failed to load sheets");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSheets();
//   }, []);

//   /* ---- UNIQUE VALUES ---- */
//   const departments = useMemo(() => {
//     const deps = new Set(sheets.map(s => s.department_name).filter(Boolean));
//     return Array.from(deps).sort();
//   }, [sheets]);

//   const levels = useMemo(() => {
//     const lvls = new Set(sheets.map(s => s.level));
//     return Array.from(lvls).sort();
//   }, [sheets]);

//   /* ---- FILTERING ---- */
//   const filtered = useMemo(() => {
//     return sheets.filter(sheet => {
//       const status = calculateStatus(sheet);
//       const matchesSearch =
//         sheet.operator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (sheet.department_name ?? "").toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesStatus = statusFilter === "All" || statusFilter === status;
//       const matchesDepartment = departmentFilter === "All" || sheet.department_name === departmentFilter;
//       const matchesLevel = levelFilter === "All" || sheet.level === levelFilter;

//       return matchesSearch && matchesStatus && matchesDepartment && matchesLevel;
//     });
//   }, [sheets, searchTerm, statusFilter, departmentFilter, levelFilter]);

//   /* ---- STATS ---- */
//   const stats = useMemo(() => {
//     const completePass = filtered.filter(s => calculateStatus(s) === "Complete-Pass").length;
//     const completeFail = filtered.filter(s => calculateStatus(s) === "Complete-Fail").length;
//     const incomplete = filtered.filter(s => calculateStatus(s) === "Incomplete").length;
//     const retraining = filtered.filter(s => calculateStatus(s) === "Re-training").length;
//     return {
//       total: filtered.length,
//       completePass,
//       completeFail,
//       incomplete,
//       retraining,
//     };
//   }, [filtered]);

//   /* ---- RENDER HELPERS ---- */
//   const renderStatus = (status: Status) => {
//     switch (status) {
//       case "Complete-Pass":
//         return (
//           <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
//             <CheckCircle className="w-3.5 h-3.5" />
//             <span>Complete-Pass</span>
//           </div>
//         );
//       case "Complete-Fail":
//         return (
//           <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-rose-100 text-rose-800 rounded-full border border-rose-300">
//             <XCircle className="w-3.5 h-3.5" />
//             <span>Complete-Fail</span>
//           </div>
//         );
//       case "Re-training":
//         return (
//           <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full border border-orange-300">
//             <AlertCircle className="w-3.5 h-3.5" />
//             <span>Re-training</span>
//           </div>
//         );
//       case "Incomplete":
//         return (
//           <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
//             <Clock className="w-3.5 h-3.5" />
//             <span>Incomplete</span>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   const getDepartmentBadgeStyle = (dept: string) => {
//     const hash = dept.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
//     const colors = [
//       "bg-blue-100 text-blue-700 border-blue-300",
//       "bg-indigo-100 text-indigo-700 border-indigo-300",
//       "bg-purple-100 text-purple-700 border-purple-300",
//       "bg-pink-100 text-pink-700 border-pink-300",
//       "bg-teal-100 text-teal-700 border-teal-300",
//       "bg-cyan-100 text-cyan-700 border-cyan-300",
//     ];
//     return colors[hash % colors.length];
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setStatusFilter("All");
//     setDepartmentFilter("All");
//     setLevelFilter("All");
//   };

//   /* ---- LOADING ---- */
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 font-medium">Loading Observance Sheets...</p>
//         </div>
//       </div>
//     );
//   }

//   /* ---- ERROR ---- */
//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
//         <div className="text-center max-w-md">
//           <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//           <h3 className="text-xl font-bold text-red-800 mb-2">Failed to Load Data</h3>
//           <p className="text-red-600 mb-4">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   /* ---- MAIN UI ---- */
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto space-y-6">

//         {/* HEADER */}
//         <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-2xl shadow-2xl border border-white/20">
//           <div className="absolute inset-0 opacity-10">
//             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.3),_transparent_50%)]" />
//           </div>
//           <div className="absolute inset-0 backdrop-blur-xl bg-white/10" />
//           <div className="relative p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
//             <div className="flex items-center gap-5">
//               <div className="relative p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 
//                               transform transition-all duration-300 hover:scale-110 hover:shadow-2xl group">
//                 <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl scale-75 group-hover:scale-100 transition-all duration-500" />
//                 <Award className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
//               </div>
//               <div>
//                 <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 
//                                bg-clip-text text-transparent animate-pulse-slow drop-shadow-lg">
//                   Operator Observance Status Dashboard
//                 </h1>
//                 <p className="text-white/80 mt-2 text-sm sm:text-base font-medium drop-shadow">
//                   Real-time Level 2, 3, 4 assessment tracking
//                 </p>
//               </div>
//             </div>
//             <div className="hidden sm:flex items-center gap-2 text-white/70 text-xs font-medium">
//               <Clock className="w-4 h-4" />
//               <span>Updated: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
//             </div>
//           </div>
//         </div>

//         {/* STATS */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
//           <StatCard icon={<Users className="w-5 h-5" />} label="Total Sheets" value={stats.total} color="indigo" />
//           <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Complete-Pass" value={stats.completePass} color="emerald" />
//           <StatCard icon={<XCircle className="w-5 h-5" />} label="Complete-Fail" value={stats.completeFail} color="rose" />
//           <StatCard icon={<AlertCircle className="w-5 h-5" />} label="Re-training" value={stats.retraining} color="orange" />
//           <StatCard icon={<Clock className="w-5 h-5" />} label="Incomplete" value={stats.incomplete} color="amber" />
//         </div>

//         {/* FILTER CARD */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 flex items-center justify-between">
//             <div className="flex items-center gap-2 text-white">
//               <Filter className="w-4 h-4" />
//               <span className="text-sm font-semibold">Filters</span>
//             </div>
//             {(searchTerm || statusFilter !== "All" || departmentFilter !== "All" || levelFilter !== "All") && (
//               <button
//                 onClick={clearFilters}
//                 className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white transition-colors"
//               >
//                 <XIcon className="w-3.5 h-3.5" />
//                 Clear all
//               </button>
//             )}
//           </div>

//           <div className="p-6 space-y-5">
//             <div className="relative max-w-md">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 transition-transform group-focus-within:scale-110" />
//               <input
//                 type="text"
//                 placeholder="Search by Operator or Department..."
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 text-sm border border-indigo-200 rounded-xl bg-indigo-50/50 
//                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
//                            transition-all placeholder-indigo-400"
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//               {/* Status */}
//               <div className="relative">
//                 <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
//                 <select
//                   value={statusFilter}
//                   onChange={e => setStatusFilter(e.target.value as any)}
//                   className="w-full pl-12 pr-10 py-3 text-sm border border-emerald-200 rounded-xl bg-emerald-50/50 
//                              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
//                              appearance-none cursor-pointer transition-all"
//                 >
//                   <option value="All">All Status</option>
//                   <option value="Complete-Pass">Complete-Pass</option>
//                   <option value="Complete-Fail">Complete-Fail</option>
//                   <option value="Re-training">Re-training</option>
//                   <option value="Incomplete">Incomplete</option>
//                 </select>
//                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
//                   <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </div>
//               </div>

//               {/* Department */}
//               <div className="relative">
//                 <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
//                 <select
//                   value={departmentFilter}
//                   onChange={e => setDepartmentFilter(e.target.value)}
//                   className="w-full pl-12 pr-10 py-3 text-sm border border-purple-200 rounded-xl bg-purple-50/50 
//                              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
//                              appearance-none cursor-pointer transition-all"
//                 >
//                   <option value="All">All Departments</option>
//                   {departments.map(d => <option key={d} value={d}>{d}</option>)}
//                 </select>
//                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
//                   <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </div>
//               </div>

//               {/* Level */}
//               <div className="relative">
//                 <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600" />
//                 <select
//                   value={levelFilter}
//                   onChange={e => setLevelFilter(e.target.value as any)}
//                   className="w-full pl-12 pr-10 py-3 text-sm border border-teal-200 rounded-xl bg-teal-50/50 
//                              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 
//                              appearance-none cursor-pointer transition-all"
//                 >
//                   <option value="All">All Levels</option>
//                   {levels.map(l => <option key={l} value={l}>{l}</option>)}
//                 </select>
//                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
//                   <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* TABLE */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Operator</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Station</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Level</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Score</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Marks</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Result</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {filtered.length === 0 ? (
//                   <tr>
//                     <td colSpan={8} className="px-6 py-16 text-center">
//                       <div className="text-gray-400">
//                         <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-3" />
//                         <p className="text-sm font-medium">No sheets found</p>
//                         <p className="text-xs mt-1">Try adjusting your filters</p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   filtered.map(sheet => {
//                     const status = calculateStatus(sheet);
//                     return (
//                       <tr key={sheet.id} className="hover:bg-gray-50 transition-colors duration-150">
//                         <td className="px-6 py-4 font-medium text-gray-900">{sheet.operator_name}</td>
//                         <td className="px-6 py-4 text-gray-600">{sheet.process_name}</td>
//                         <td className="px-6 py-4">
//                           <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-300">
//                             {sheet.level}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getDepartmentBadgeStyle(sheet.department_name ?? "Unknown")}`}>
//                             {sheet.department_name ?? "—"}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-700">{sheet.score}</td>
//                         <td className="px-6 py-4 text-sm text-gray-700">{sheet.marks_obtained}</td>
//                         <td className="px-6 py-4">
//                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
//                             sheet.result === "Qualified" ? "bg-emerald-100 text-emerald-700 border-emerald-300" :
//                             sheet.result === "Re-training" ? "bg-orange-100 text-orange-700 border-orange-300" :
//                             sheet.result === "Pending" ? "bg-amber-100 text-amber-700 border-amber-300" :
//                             "bg-gray-100 text-gray-700 border-gray-300"
//                           }`}>
//                             {sheet.result || "—"}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">{renderStatus(status)}</td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// /* ──────────────────────── STAT CARD ──────────────────────── */
// interface StatCardProps {
//   icon: React.ReactNode;
//   label: string;
//   value: number;
//   color: "indigo" | "emerald" | "rose" | "orange" | "amber";
// }
// const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
//   const colors = {
//     indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
//     emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
//     rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
//     orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
//     amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
//   };
//   const { bg, border, text } = colors[color];

//   return (
//     <div className={`bg-white ${border} border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group`}>
//       <div className="flex items-center justify-between">
//         <div>
//           <p className={`text-2xl font-bold ${text}`}>{value}</p>
//           <p className={`text-xs font-medium ${text} mt-1`}>{label}</p>
//         </div>
//         <div className={`p-2.5 rounded-lg ${bg} group-hover:scale-110 transition-transform`}>
//           <div className={text}>{icon}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OperatorObservanceStatusList;





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
  Award,
  Download,
} from "lucide-react";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const API_BASE_URL = "http://192.168.2.51:8000";

/* ---------- Types ---------- */
interface Topic {
  id: number;
  sr_no: number;
  topic_name: string;
  description: string;
}

interface Sheet {
  id: number;
  operator_name: string;
  operator_category: string | null;
  process_name: string;
  supervisor_name: string;
  evaluation_start_date: string;
  evaluation_end_date: string;
  level: "Level 2" | "Level 3" | "Level 4";
  marks: Record<string, Record<string, string>>;
  remarks: string | null;
  score: string;
  marks_obtained: string;
  value: string;
  result: string;
  signatures: Record<string, string>;
  department_id: number | null;
  department_name: string | null;
  topics: Topic[];
}

/* ---------- Status Logic ---------- */
type Status = "Complete-Pass" | "Complete-Fail" | "Incomplete" | "Re-training";

const getRequiredPeriods = (level: Sheet["level"]): string[] => {
  switch (level) {
    case "Level 2": return ["D1", "D2", "D3", "D4", "D5", "D6"];
    case "Level 3": return ["W1", "W2", "W3", "W4"];
    case "Level 4": return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    default: return [];
  }
};

const calculateStatus = (sheet: Sheet): Status => {
  const periods = getRequiredPeriods(sheet.level);
  const marks = sheet.marks ?? {};

  if (sheet.result === "Pending") return "Incomplete";
  if (sheet.result === "Re-training") return "Re-training";

  if (sheet.result === "Qualified") {
    for (const topic of sheet.topics) {
      const topicKey = String(topic.sr_no);
      const dayMap = marks[topicKey] ?? {};
      for (const p of periods) {
        if (!dayMap[p]) return "Incomplete";
      }
    }
    return "Complete-Pass";
  }

  let allFilled = true;
  let hasX = false;

  for (const topic of sheet.topics) {
    const topicKey = String(topic.sr_no);
    const dayMap = marks[topicKey] ?? {};
    for (const p of periods) {
      const mark = dayMap[p] ?? "";
      if (!mark) allFilled = false;
      if (mark === "X") hasX = true;
    }
  }

  if (!allFilled) return "Incomplete";
  if (hasX) return "Complete-Fail";
  return "Complete-Pass";
};

/* ---------- Component ---------- */
const OperatorObservanceStatusList: React.FC = () => {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");  // What user types
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [levelFilter, setLevelFilter] = useState<"All" | "Level 2" | "Level 3" | "Level 4">("All");


  const handleSearch = () => {
    setSearchTerm(inputValue);
  };

  /* ---- HANDLE ENTER KEY ---- */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchTerm(inputValue);
    }
  };
  /* ---- FETCH DATA ---- */
  useEffect(() => {
    const fetchSheets = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        if (departmentFilter !== "All") params.append("department", departmentFilter);
        if (levelFilter !== "All") params.append("level", levelFilter);
        if (statusFilter !== "All") params.append("status", statusFilter);

        const res = await fetch(`${API_BASE_URL}/observancesheets/?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Sheet[] = await res.json();
        setSheets(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load sheets");
      } finally {
        setLoading(false);
      }
    };
    fetchSheets();
  }, [searchTerm, statusFilter, departmentFilter, levelFilter]);

  /* ---- UNIQUE VALUES ---- */
  const departments = useMemo(() => {
    const map = new Map<number | null, string>();
    sheets.forEach(s => {
      if (s.department_id && s.department_name) {
        map.set(s.department_id, s.department_name);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [sheets]);

  const levels = useMemo(() => {
    const lvls = new Set(sheets.map(s => s.level));
    return Array.from(lvls).sort();
  }, [sheets]);

  /* ---- FILTERED DATA ---- */
  /* ---- FILTERED DATA ---- */
  const filtered = useMemo(() => {
    return sheets.filter(sheet => {
      const status = calculateStatus(sheet);

      // Convert search term to lowercase once
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        sheet.operator_name.toLowerCase().includes(term) ||
        (sheet.department_name ?? "").toLowerCase().includes(term) ||
        // --- ADDED NEW FIELDS HERE ---
        (sheet.process_name ?? "").toLowerCase().includes(term) ||    // Search by Station/Process
        (sheet.supervisor_name ?? "").toLowerCase().includes(term) || // Search by Supervisor
        (sheet.operator_category ?? "").toLowerCase().includes(term); // Search by Category

      const matchesStatus = statusFilter === "All" || status === statusFilter;
      const matchesDepartment = departmentFilter === "All" || sheet.department_name === departmentFilter;
      const matchesLevel = levelFilter === "All" || sheet.level === levelFilter;

      return matchesSearch && matchesStatus && matchesDepartment && matchesLevel;
    });
  }, [sheets, searchTerm, statusFilter, departmentFilter, levelFilter]);
  /* ---- STATS ---- */
  const stats = useMemo(() => {
    const completePass = filtered.filter(s => calculateStatus(s) === "Complete-Pass").length;
    const completeFail = filtered.filter(s => calculateStatus(s) === "Complete-Fail").length;
    const incomplete = filtered.filter(s => calculateStatus(s) === "Incomplete").length;
    const retraining = filtered.filter(s => calculateStatus(s) === "Re-training").length;
    return { total: filtered.length, completePass, completeFail, incomplete, retraining };
  }, [filtered]);

  /* ---- EXCEL EXPORT ---- */
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Observance Sheets", {
      pageSetup: { paperSize: 9, orientation: "landscape" },
    });

    // === COMPANY & TITLE ===
    worksheet.mergeCells("A1:I1");
    const companyCell = worksheet.getCell("A1");
    companyCell.value = "Krishna Maruti Limited Penstone";
    companyCell.font = { size: 16, bold: true, color: { argb: "FF1E40AF" } };
    companyCell.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("A2:I2");
    const titleCell = worksheet.getCell("A2");
    titleCell.value = "Operator Observance Status Report";
    titleCell.font = { size: 14, bold: true, color: { argb: "FF1E40AF" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // === GENERATED INFO ===
    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const filterSummary = [
      searchTerm ? `Search: ${searchTerm}` : null,
      statusFilter !== "All" ? `Status: ${statusFilter}` : null,
      departmentFilter !== "All"
        ? `Dept: ${departments.find(([id]) => id?.toString() === departmentFilter)?.[1] || ""}`
        : null,
      levelFilter !== "All" ? `Level: ${levelFilter}` : null,
    ].filter(Boolean).join(" | ") || "All Records";

    worksheet.mergeCells("A3:I3");
    const infoCell = worksheet.getCell("A3");
    infoCell.value = `Generated on: ${now} | Filters: ${filterSummary}`;
    infoCell.font = { size: 10, italic: true, color: { argb: "FF6B7280" } };
    infoCell.alignment = { horizontal: "center" };

    // === COLUMN HEADERS ===
    const headerRow = worksheet.getRow(5);
    const headers = [
      "Operator",
      "Station",
      "Level",
      "Department",
      "Score",
      "Marks Obtained",
      "Result",
      "Status",
    ];
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });
    headerRow.height = 30;

    // === DATA ROWS ===
    filtered.forEach((sheet, idx) => {
      const status = calculateStatus(sheet);
      const row = worksheet.addRow([
        sheet.operator_name,
        sheet.process_name,
        sheet.level,
        sheet.department_name ?? "—",
        sheet.score,
        sheet.marks_obtained,
        sheet.result || "—",
        status,
      ]);

      if (idx % 2 === 1) {
        row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
      }

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        cell.alignment = { vertical: "middle" };
      });

      // Status Color
      const statusCell = row.getCell(8);
      let statusColor = "FF6B7280";
      if (status === "Complete-Pass") statusColor = "FF10B981";
      else if (status === "Complete-Fail") statusColor = "FFEF4444";
      else if (status === "Re-training") statusColor = "FFF97316";
      else if (status === "Incomplete") statusColor = "FFF59E0B";
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: statusColor } };
      statusCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      statusCell.alignment = { horizontal: "center" };

      // Department Color
      const deptCell = row.getCell(4);
      const dept = sheet.department_name ?? "Unknown";
      const hash = dept.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
      const deptColors = [
        "FF3B82F6", "FF6366F1", "FF8B5CF6", "FFEC4899", "FF14B8A6", "FF06B6D4",
      ];
      deptCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: deptColors[hash % deptColors.length] } };
      deptCell.font = { color: { argb: "FFFFFFFF" } };

      // Center numeric/level columns
      row.getCell(3).alignment = { horizontal: "center" }; // Level
      row.getCell(5).alignment = { horizontal: "center" }; // Score
      row.getCell(6).alignment = { horizontal: "center" }; // Marks
    });

    // === COLUMN WIDTHS ===
    worksheet.columns = [
      { width: 24 }, // Operator
      { width: 20 }, // Station
      { width: 12 }, // Level
      { width: 22 }, // Department
      { width: 12 }, // Score
      { width: 16 }, // Marks Obtained
      { width: 14 }, // Result
      { width: 18 }, // Status
    ];

    // === DOWNLOAD ===
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `Operator_Observance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  /* ---- RENDER HELPERS ---- */
  const renderStatus = (status: Status) => {
    switch (status) {
      case "Complete-Pass":
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{status}</span>
          </div>
        );
      case "Complete-Fail":
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-rose-100 text-rose-800 rounded-full border border-rose-300">
            <XCircle className="w-3.5 h-3.5" />
            <span>{status}</span>
          </div>
        );
      case "Re-training":
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full border border-orange-300">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{status}</span>
          </div>
        );
      case "Incomplete":
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{status}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getDepartmentBadgeStyle = (dept: string) => {
    const hash = dept.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
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
    setInputValue(""); // Clear the input box
    setSearchTerm("");
    setStatusFilter("All");
    setDepartmentFilter("All");
    setLevelFilter("All");
  };

  /* ---- LOADING ---- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Observance Sheets...</p>
        </div>
      </div>
    );
  }

  /* ---- ERROR ---- */
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

  /* ---- MAIN UI ---- */
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
                  Operator Observance Status Dashboard
                </h1>
                <p className="text-white/80 mt-2 text-sm sm:text-base font-medium drop-shadow">
                  Level 2, 3, 4 assessment tracking
                </p>
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
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Sheets" value={stats.total} color="indigo" />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Complete-Pass" value={stats.completePass} color="emerald" />
          <StatCard icon={<XCircle className="w-5 h-5" />} label="Complete-Fail" value={stats.completeFail} color="rose" />
          <StatCard icon={<AlertCircle className="w-5 h-5" />} label="Re-training" value={stats.retraining} color="orange" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Incomplete" value={stats.incomplete} color="amber" />
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
                  placeholder="Search by Operator, Station, Dept, or Supervisor..."
                  value={inputValue} // Bind to inputValue, not searchTerm
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown} // Listen for Enter key
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
                  <option value="Complete-Pass">Complete-Pass</option>
                  <option value="Complete-Fail">Complete-Fail</option>
                  <option value="Re-training">Re-training</option>
                  <option value="Incomplete">Incomplete</option>
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
                  {departments.map(([id, name]) => (
                    <option key={id} value={name}>{name}</option>
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
                  onChange={(e) => setLevelFilter(e.target.value as any)}
                  className="w-full pl-12 pr-10 py-3 text-sm border border-teal-200 rounded-xl bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none cursor-pointer transition-all"
                >
                  <option value="All">All Levels</option>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
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

        {/* TABLE – HORIZONTAL SCROLL ONLY */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-gray-100">
            <div className="min-w-[1200px]">
              <table className="w-full text-sm table-auto">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Operator</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Station</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Level</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Score</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Marks</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Result</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="text-gray-400">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-3" />
                          <p className="text-sm font-medium">No sheets found</p>
                          <p className="text-xs mt-1">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map(sheet => {
                      const status = calculateStatus(sheet);
                      return (
                        <tr key={sheet.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{sheet.operator_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{sheet.process_name}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-300">
                              {sheet.level}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getDepartmentBadgeStyle(sheet.department_name ?? "Unknown")}`}>
                              {sheet.department_name ?? "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">{sheet.score}</td>
                          <td className="px-6 py-4 text-sm text-center text-gray-700">{sheet.marks_obtained}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${sheet.result === "Qualified" ? "bg-emerald-100 text-emerald-700 border-emerald-300" :
                                sheet.result === "Re-training" ? "bg-orange-100 text-orange-700 border-orange-300" :
                                  sheet.result === "Pending" ? "bg-amber-100 text-amber-700 border-amber-300" :
                                    "bg-gray-100 text-gray-700 border-gray-300"
                              }`}>
                              {sheet.result || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4">{renderStatus(status)}</td>
                        </tr>
                      );
                    })
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
  value: number;
  color: "indigo" | "emerald" | "rose" | "orange" | "amber";
}
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  const colors = {
    indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
    rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
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

export default OperatorObservanceStatusList;