


// import React, { useState, useEffect } from "react";
// import {
//   Search,
//   Filter,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Award,
//   Calendar,
//   Clock,
//   Users,
// } from "lucide-react";

// // 👇 Match Django API serializer response
// interface OJTStatus {
//   id: number;
//   traineeId: string;
//   trainee_name: string;
//   trainer_name: string;
//   production_or_quality: string | null;
//   line: string | null;
//   station: string | null;
//   daysCompleted: number;
//   score: number;
//   status: "Complete" | "Incomplete";
//   result: "Pass" | "Fail" | "N/A";
//   category: "Production" | "Quality";
// }

// const OJTStatusList: React.FC = () => {
//   const [data, setData] = useState<OJTStatus[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [hoveredRow, setHoveredRow] = useState<number | null>(null);
//   const [selectedView, setSelectedView] = useState<"OJT" | "TenCycle">("OJT");

//   // ✅ Fetch data from Django API
//   useEffect(() => {
//     fetch("http://127.0.0.1:8000/ojt-status/")
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to fetch OJT data");
//         return res.json();
//       })
//       .then((data) => {
//         setData(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching OJT status:", err);
//         setError("Unable to load OJT data. Please try again later.");
//         setLoading(false);
//       });
//   }, []);

//   // ✅ Filtered data
//   const filteredData = data.filter((item) => {
//     const matchesSearch =
//       item.traineeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.trainee_name.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesStatus =
//       statusFilter === "All" ||
//       statusFilter === item.status ||
//       statusFilter === item.result;

//     return matchesSearch && matchesStatus;
//   });

//   // ✅ Stats summary
//   const stats = {
//     total: data.length,
//     complete: data.filter((item) => item.status === "Complete").length,
//     incomplete: data.filter((item) => item.status === "Incomplete").length,
//     passed: data.filter((item) => item.result === "Pass").length,
//     failed: data.filter((item) => item.result === "Fail").length,
//   };

//   // ✅ Render status pill
//   const renderStatus = (status: string) => {
//     if (status === "Complete") {
//       return (
//         <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200 shadow-sm">
//           <CheckCircle className="w-3.5 h-3.5" />
//           <span>Complete</span>
//         </div>
//       );
//     }
//     return (
//       <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-yellow-50 text-amber-700 rounded-full border border-yellow-200 shadow-sm">
//         <Clock className="w-3.5 h-3.5" />
//         <span>Incomplete</span>
//       </div>
//     );
//   };

//   // ✅ Render result pill
//   const renderResult = (result: string) => {
//     if (result === "Pass") {
//       return (
//         <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-green-100 text-green-800 rounded-full border border-green-300 shadow-sm">
//           <CheckCircle className="w-3.5 h-3.5" />
//           <span>Pass</span>
//         </div>
//       );
//     }
//     if (result === "Fail") {
//       return (
//         <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-red-100 text-red-800 rounded-full border border-red-300 shadow-sm">
//           <XCircle className="w-3.5 h-3.5" />
//           <span>Fail</span>
//         </div>
//       );
//     }
//     return <span className="italic text-gray-400 text-sm">N/A</span>;
//   };

//   // ✅ Show loading or error
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-600">
//         Loading OJT Data...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-red-600 font-medium">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
//       <div className="p-6 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
//           <div>
//             <div className="flex items-center gap-3 mb-2">
//               <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
//                 <Award className="w-6 h-6 text-white" />
//               </div>
//               <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
//                 {selectedView === "OJT" ? "OJT Status" : "TenCycle Status"}
//               </h1>
//             </div>
//             <p className="text-gray-600 ml-14">
//               {selectedView === "OJT"
//                 ? "Track and manage trainee OJT completion"
//                 : "TenCycle view coming soon"}
//             </p>
//           </div>
//           <div className="relative">
//             <select
//               value={selectedView}
//               onChange={(e) =>
//                 setSelectedView(e.target.value as "OJT" | "TenCycle")
//               }
//               className="pl-4 pr-10 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
//             >
//               <option value="OJT">OJT Status</option>
//               <option value="TenCycle">TenCycle Status</option>
//             </select>
//           </div>
//         </div>

//         {/* OJT View */}
//         {selectedView === "OJT" ? (
//           <>
//             {/* Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
//               <StatCard icon={<Users />} label="Total" value={stats.total} color="blue" />
//               <StatCard icon={<Calendar />} label="Completed" value={stats.complete} color="green" />
//               <StatCard icon={<Clock />} label="Incomplete" value={stats.incomplete} color="yellow" />
//               <StatCard icon={<CheckCircle />} label="Passed" value={stats.passed} color="green" />
//               <StatCard icon={<XCircle />} label="Failed" value={stats.failed} color="red" />
//             </div>

//             {/* Filters */}
//             <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
//               <div className="flex flex-col lg:flex-row gap-4">
//                 <div className="flex-1 relative">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     type="text"
//                     className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md bg-gray-50"
//                     placeholder="Search by ID or Name..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//                 <div className="relative lg:w-64">
//                   <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <select
//                     className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md bg-gray-50"
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                   >
//                     <option value="All">All Status</option>
//                     <option value="Complete">Complete</option>
//                     <option value="Incomplete">Incomplete</option>
//                     <option value="Pass">Pass</option>
//                     <option value="Fail">Fail</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
//               <table className="w-full table-auto text-sm">
//                 <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
//                   <tr>
//                     <th className="px-6 py-3 text-left">Trainee ID</th>
//                     <th className="px-6 py-3 text-left">Name</th>
//                     <th className="px-6 py-3 text-left">Trainer</th>
//                     <th className="px-6 py-3 text-left"> Line</th>
//                     <th className="px-6 py-3 text-left">Station</th>
//                     <th className="px-6 py-3 text-left">Status</th>
//                     <th className="px-6 py-3 text-left">Result</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {filteredData.map((item) => (
//                     <tr
//                       key={item.id}
//                       className="hover:bg-gray-50 transition"
//                       onMouseEnter={() => setHoveredRow(item.id)}
//                       onMouseLeave={() => setHoveredRow(null)}
//                     >
//                       <td className="px-6 py-4 font-mono">{item.traineeId}</td>
//                       <td className="px-6 py-4">{item.trainee_name}</td>
//                       <td className="px-6 py-4">{item.trainer_name}</td>
//                       <td className="px-6 py-4">
//                         {item.production_or_quality ? (
//                           <span className="text-sm font-medium text-gray-700">
//                             {item.production_or_quality} /{" "}
//                             {item.line || "Not Assigned"}
//                           </span>
//                         ) : (
//                           <span className="italic text-gray-400">Not Assigned</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         {item.station || (
//                           <span className="italic text-gray-400">Not Assigned</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">{renderStatus(item.status)}</td>
//                       <td className="px-6 py-4">{renderResult(item.result)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         ) : (
//           // TenCycle placeholder
//           <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm mt-6">
//             <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
//             <h2 className="text-xl font-bold text-gray-800 mb-2">
//               TenCycle View Coming Soon
//             </h2>
//             <p className="text-gray-500">
//               This section is under construction. Please check back later.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Small stat card
// const StatCard = ({
//   icon,
//   label,
//   value,
//   color,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: number;
//   color: string;
// }) => (
//   <div className={`bg-white border border-${color}-100 rounded-md p-4 shadow-sm`}>
//     <div className="flex items-center gap-2 mb-1">
//       {icon}
//       <span className={`text-${color}-700 font-bold`}>{value}</span>
//     </div>
//     <div className={`text-sm text-${color}-700`}>{label}</div>
//   </div>
// );

// export default OJTStatusList;


// import React, { useState, useEffect } from "react";
// import {
//   Search,
//   Filter,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Award,
//   Calendar,
//   Clock,
//   Users,
// } from "lucide-react";

// // 👇 Match Django API serializer response
// interface OJTStatus {
//   id: number;
//   traineeId: string;
//   trainee_name: string;
//   trainer_name: string;
//   production_or_quality: string | null;
//   line: string | null;
//   station: string | null;
//   daysCompleted: number;
//   score: number;
//   status: "Complete" | "Incomplete";
//   result: "Pass" | "Fail" | "N/A";
//   category: "Production" | "Quality";
// }

// const OJTStatusList: React.FC = () => {
//   const [data, setData] = useState<OJTStatus[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [categoryFilter, setCategoryFilter] = useState<
//     "All" | "Production" | "Quality"
//   >("All"); // ✅ new
//   const [hoveredRow, setHoveredRow] = useState<number | null>(null);
//   const [selectedView, setSelectedView] = useState<"OJT" | "TenCycle">("OJT");

//   // ✅ Fetch data from Django API
//   useEffect(() => {
//     fetch("http://127.0.0.1:8000/ojt-status/")
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to fetch OJT data");
//         return res.json();
//       })
//       .then((data) => {
//         setData(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching OJT status:", err);
//         setError("Unable to load OJT data. Please try again later.");
//         setLoading(false);
//       });
//   }, []);

//   // ✅ Filtered data
//   const filteredData = data.filter((item) => {
//     const matchesSearch =
//       item.traineeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.trainee_name.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesStatus =
//       statusFilter === "All" ||
//       statusFilter === item.status ||
//       statusFilter === item.result;

//     const matchesCategory =
//       categoryFilter === "All" || categoryFilter === item.category; // ✅ new

//     return matchesSearch && matchesStatus && matchesCategory;
//   });

//   // ✅ Stats summary
//   const stats = {
//     total: data.length,
//     complete: data.filter((item) => item.status === "Complete").length,
//     incomplete: data.filter((item) => item.status === "Incomplete").length,
//     passed: data.filter((item) => item.result === "Pass").length,
//     failed: data.filter((item) => item.result === "Fail").length,
//   };

//   // ✅ Render status pill
//   const renderStatus = (status: string) => {
//     if (status === "Complete") {
//       return (
//         <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200 shadow-sm">
//           <CheckCircle className="w-3.5 h-3.5" />
//           <span>Complete</span>
//         </div>
//       );
//     }
//     return (
//       <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-yellow-50 text-amber-700 rounded-full border border-yellow-200 shadow-sm">
//         <Clock className="w-3.5 h-3.5" />
//         <span>Incomplete</span>
//       </div>
//     );
//   };

//   // ✅ Render result pill
//   const renderResult = (result: string) => {
//     if (result === "Pass") {
//       return (
//         <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-green-100 text-green-800 rounded-full border border-green-300 shadow-sm">
//           <CheckCircle className="w-3.5 h-3.5" />
//           <span>Pass</span>
//         </div>
//       );
//     }
//     if (result === "Fail") {
//       return (
//         <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-red-100 text-red-800 rounded-full border border-red-300 shadow-sm">
//           <XCircle className="w-3.5 h-3.5" />
//           <span>Fail</span>
//         </div>
//       );
//     }
//     return <span className="italic text-gray-400 text-sm">N/A</span>;
//   };

//   // ✅ Show loading or error
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-600">
//         Loading OJT Data...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-red-600 font-medium">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
//       <div className="p-6 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
//           <div>
//             <div className="flex items-center gap-3 mb-2">
//               <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
//                 <Award className="w-6 h-6 text-white" />
//               </div>
//               <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
//                 {selectedView === "OJT" ? "OJT Status" : "TenCycle Status"}
//               </h1>
//             </div>
//             <p className="text-gray-600 ml-14">
//               {selectedView === "OJT"
//                 ? "Track and manage trainee OJT completion"
//                 : "TenCycle view coming soon"}
//             </p>
//           </div>
//           <div className="relative">
//             <select
//               value={selectedView}
//               onChange={(e) =>
//                 setSelectedView(e.target.value as "OJT" | "TenCycle")
//               }
//               className="pl-4 pr-10 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
//             >
//               <option value="OJT">OJT Status</option>
//               <option value="TenCycle">TenCycle Status</option>
//             </select>
//           </div>
//         </div>

//         {/* OJT View */}
//         {selectedView === "OJT" ? (
//           <>
//             {/* Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
//               <StatCard icon={<Users />} label="Total" value={stats.total} color="blue" />
//               <StatCard icon={<Calendar />} label="Completed" value={stats.complete} color="green" />
//               <StatCard icon={<Clock />} label="Incomplete" value={stats.incomplete} color="yellow" />
//               <StatCard icon={<CheckCircle />} label="Passed" value={stats.passed} color="green" />
//               <StatCard icon={<XCircle />} label="Failed" value={stats.failed} color="red" />
//             </div>

//             {/* Filters */}
//             <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
//               <div className="flex flex-col lg:flex-row gap-4">
//                 <div className="flex-1 relative">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     type="text"
//                     className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md bg-gray-50"
//                     placeholder="Search by ID or Name..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//                 <div className="relative lg:w-64">
//                   <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <select
//                     className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md bg-gray-50"
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                   >
//                     <option value="All">All Status</option>
//                     <option value="Complete">Complete</option>
//                     <option value="Incomplete">Incomplete</option>
//                     <option value="Pass">Pass</option>
//                     <option value="Fail">Fail</option>
//                   </select>
//                 </div>
//                 {/* ✅ Category Filter */}
//                 <div className="relative lg:w-64">
//                   <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <select
//                     className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md bg-gray-50"
//                     value={categoryFilter}
//                     onChange={(e) =>
//                       setCategoryFilter(e.target.value as "All" | "Production" | "Quality")
//                     }
//                   >
//                     <option value="All">All Categories</option>
//                     <option value="Production">Production</option>
//                     <option value="Quality">Quality</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
//               <table className="w-full table-auto text-sm">
//                 <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
//                   <tr>
//                     <th className="px-6 py-3 text-left">Trainee ID</th>
//                     <th className="px-6 py-3 text-left">Name</th>
//                     <th className="px-6 py-3 text-left">Trainer</th>
//                     <th className="px-6 py-3 text-left">Category</th>
//                     <th className="px-6 py-3 text-left"> Line</th>
//                     <th className="px-6 py-3 text-left">Station</th>
//                      {/* ✅ new */}
//                     <th className="px-6 py-3 text-left">Status</th>
//                     <th className="px-6 py-3 text-left">Result</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {filteredData.map((item) => (
//                     <tr
//                       key={item.id}
//                       className="hover:bg-gray-50 transition"
//                       onMouseEnter={() => setHoveredRow(item.id)}
//                       onMouseLeave={() => setHoveredRow(null)}
//                     >
//                       <td className="px-6 py-4 font-mono">{item.traineeId}</td>
//                       <td className="px-6 py-4">{item.trainee_name}</td>
//                       <td className="px-6 py-4">{item.trainer_name}</td>
//                        {/* ✅ Category column */}
//                       <td className="px-6 py-4">
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                             item.category === "Production"
//                               ? "bg-blue-100 text-blue-700 border border-blue-300"
//                               : "bg-purple-100 text-purple-700 border border-purple-300"
//                           }`}
//                         >
//                           {item.category}
//                         </span>
//                       </td>



//                       <td className="px-6 py-4">
//                         {item.production_or_quality ? (
//                           <span className="text-sm font-medium text-gray-700">
//                             {item.production_or_quality} /{" "}
//                             {item.line || "Not Assigned"}
//                           </span>
//                         ) : (
//                           <span className="italic text-gray-400">Not Assigned</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         {item.station || (
//                           <span className="italic text-gray-400">Not Assigned</span>
//                         )}
//                       </td>

//                       <td className="px-6 py-4">{renderStatus(item.status)}</td>
//                       <td className="px-6 py-4">{renderResult(item.result)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         ) : (
//           // TenCycle placeholder
//           <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm mt-6">
//             <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
//             <h2 className="text-xl font-bold text-gray-800 mb-2">
//               TenCycle View Coming Soon
//             </h2>
//             <p className="text-gray-500">
//               This section is under construction. Please check back later.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Small stat card
// const StatCard = ({
//   icon,
//   label,
//   value,
//   color,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: number;
//   color: string;
// }) => (
//   <div className={`bg-white border border-${color}-100 rounded-md p-4 shadow-sm`}>
//     <div className="flex items-center gap-2 mb-1">
//       {icon}
//       <span className={`text-${color}-700 font-bold`}>{value}</span>
//     </div>
//     <div className={`text-sm text-${color}-700`}>{label}</div>
//   </div>
// );

// export default OJTStatusList;



// import { useState } from "react";
// import Level2OJTStatusList from "./Level2OJTStatusList";
// import Level3OJTStatusList from "./Level3OJTStatusList";

// const LevelSelector = () => {
//   const [selectedLevel, setSelectedLevel] = useState<string>("level2");

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       {/* Dropdown */}
//       <div className="max-w-2xl mx-auto mb-6">
//         <select
//           value={selectedLevel}
//           onChange={(e) => setSelectedLevel(e.target.value)}
//           className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">-- Select Level --</option>
//           <option value="level2">Level 2</option>
//           <option value="level3">Level 3</option>
//         </select>
//       </div>

//       {/* Conditional Rendering */}
//       {selectedLevel === "level2" && <Level2OJTStatusList />}
//       {selectedLevel === "level3" && <Level3OJTStatusList />}
//     </div>
//   );
// };

// export default LevelSelector;

// import { useState } from "react";
// import Level2OJTStatusList from "./Level2OJTStatusList";  // ✅ correct casing

// import Level3OJTStatusList from "./Level3OJTStatusList";
// import ErrorBoundary from "./ErrorBoundary"; // 👈 create this

// const LevelSelector = () => {
//   const [selectedLevel, setSelectedLevel] = useState<string>("level2");

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       {/* Dropdown */}
//       <div className="max-w-2xl mx-auto mb-6">
//         <select
//           value={selectedLevel}
//           onChange={(e) => setSelectedLevel(e.target.value)}
//           className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">-- Select Level --</option>
//           <option value="level2">Level 2</option>
//           <option value="level3">Level 3</option>
//         </select>
//       </div>

//       {/* Conditional Rendering with ErrorBoundary */}
//       {selectedLevel === "level2" && <Level2OJTStatusList />}
//       {selectedLevel === "level3" && (
//         <ErrorBoundary>
//           <Level3OJTStatusList />
//         </ErrorBoundary>
//       )}
//     </div>
//   );
// };

// export default LevelSelector;



// src/components/LevelSelector.tsx
import { useState } from "react";
import Level2OJTStatusList from "./Level2OJTStatusList";
import Level3OJTStatusList from "./Level3OJTStatusList";
import Level4OJTStatusList from "./Level4OJTStatusList"; // Import Level 4
import ErrorBoundary from "./ErrorBoundary";

const LevelSelector = () => {
  const [selectedLevel, setSelectedLevel] = useState<"level2" | "level3" | "level4">("level2");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto mb-6">
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value as any)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select Level --</option>
          <option value="level2">Level 2</option>
          <option value="level3">Level 3</option>
          <option value="level4">Level 4</option>
        </select>
      </div>

      {selectedLevel === "level2" && <Level2OJTStatusList />}
      {selectedLevel === "level3" && (
        <ErrorBoundary>
          <Level3OJTStatusList />
        </ErrorBoundary>
      )}
      {selectedLevel === "level4" && (
        <ErrorBoundary>
          <Level4OJTStatusList />
        </ErrorBoundary>
      )}
    </div>
  );
};

export default LevelSelector;