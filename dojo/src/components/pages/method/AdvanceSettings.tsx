


// import React, { useState, useEffect } from "react";
// import {
//   Upload, Plus, Trash2, FileSpreadsheet, Users,
//   Calendar, BarChart3, Building, Layers, CheckCircle, Loader2, Download
// } from "lucide-react";

// // --- API Configuration ---
// const API_BASE_URL = "http://127.0.0.1:8000";

// // --- Frontend Form Data Interface ---
// interface AdvanceSettingsData {
//   id?: number;
//   hq: number | null;
//   factory: number | null;
//   department: number | null;
//   line: number | null;
//   subline: number | null;
//   station: number | null;
//   month_year: string;

//   // KPIs
//   total_stations_ctq: number;
//   operator_required_ctq: number;
//   operator_availability_ctq: number;
//   buffer_manpower_required_ctq: number;
//   buffer_manpower_availability_ctq: number;
//   attrition_trend_ctq: number;
//   absentee_trend_ctq: number;

//   // Skill Levels
//   l1_required: number; l1_available: number;
//   l2_required: number; l2_available: number;
//   l3_required: number; l3_available: number;
//   l4_required: number; l4_available: number;
// }

// // --- API Payload/Response Interface ---
// interface ApiAdvanceManpowerData {
//   id: number;
//   hq: number | null;
//   factory: number;
//   department: number | null;
//   line: number | null;
//   subline: number | null;
//   station: number | null;

//   month: number;
//   year: number;

//   total_stations: number;
//   operators_required: number;
//   operators_available: number;
//   buffer_manpower_required: number;
//   buffer_manpower_available: number;

//   l1_required: number; l1_available: number;
//   l2_required: number; l2_available: number;
//   l3_required: number; l3_available: number;
//   l4_required: number; l4_available: number;

//   attrition_rate: string;
//   absenteeism_rate: string;
// }

// // --- UPDATED Hierarchy Interfaces ---
// // We add 'stations?' to LineNode to allow direct parent-child relationship
// interface StationNode { id: number; station_name: string; }
// interface SublineNode { id: number; subline_name: string; stations?: StationNode[]; }
// interface LineNode {
//   id: number;
//   line_name: string;
//   sublines?: SublineNode[];
//   stations?: StationNode[]; // <--- ADDED: Stations can exist directly under Line
// }
// interface DepartmentNode { id: number; department_name: string; lines?: LineNode[]; }

// interface HierarchyStructure {
//   hq: number; hq_name: string;
//   factory: number; factory_name: string;
//   structure_data: {
//     departments: DepartmentNode[];
//   };
// }

// interface DropdownOption { id: number; name: string; }

// // --- Data Transformers (Kept same as before) ---
// const apiToFrontend = (apiData: ApiAdvanceManpowerData): AdvanceSettingsData => ({
//   id: apiData.id,
//   hq: apiData.hq, factory: apiData.factory, department: apiData.department,
//   line: apiData.line, subline: apiData.subline, station: apiData.station,
//   // month_year: `${apiData.year}-${apiData.month.toString().padStart(2, '0')}`,
//   month_year: `${apiData.year}-${apiData.month.toString().padStart(2, '0')}-01`,

//   total_stations_ctq: apiData.total_stations,
//   operator_required_ctq: apiData.operators_required,
//   operator_availability_ctq: apiData.operators_available,
//   buffer_manpower_required_ctq: apiData.buffer_manpower_required,
//   buffer_manpower_availability_ctq: apiData.buffer_manpower_available,

//   l1_required: apiData.l1_required, l1_available: apiData.l1_available,
//   l2_required: apiData.l2_required, l2_available: apiData.l2_available,
//   l3_required: apiData.l3_required, l3_available: apiData.l3_available,
//   l4_required: apiData.l4_required, l4_available: apiData.l4_available,

//   attrition_trend_ctq: parseFloat(apiData.attrition_rate),
//   absentee_trend_ctq: parseFloat(apiData.absenteeism_rate),
// });

// const frontendToApi = (formData: Omit<AdvanceSettingsData, 'id'>) => {
//   // const [year, month] = formData.month_year.split('-').map(Number);
//   const [yearStr, monthStr, dayStr] = formData.month_year.split('-');
//   return {
//     hq: formData.hq, factory: formData.factory, department: formData.department,
//     line: formData.line, subline: formData.subline, station: formData.station,
//     year: parseInt(yearStr),
//     month: parseInt(monthStr),
//     total_stations: formData.total_stations_ctq,
//     operators_required: formData.operator_required_ctq,
//     operators_available: formData.operator_availability_ctq,
//     buffer_manpower_required: formData.buffer_manpower_required_ctq,
//     buffer_manpower_available: formData.buffer_manpower_availability_ctq,

//     l1_required: formData.l1_required, l1_available: formData.l1_available,
//     l2_required: formData.l2_required, l2_available: formData.l2_available,
//     l3_required: formData.l3_required, l3_available: formData.l3_available,
//     l4_required: formData.l4_required, l4_available: formData.l4_available,

//     attrition_rate: formData.attrition_trend_ctq.toFixed(2),
//     absenteeism_rate: formData.absentee_trend_ctq.toFixed(2),
//   };
// };

// const AdvanceSettings: React.FC = () => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [advanceSettingsData, setAdvanceSettingsData] = useState<AdvanceSettingsData[]>([]);
//   const [loading, setLoading] = useState(true);

//   // --- Hierarchy State ---
//   const [fullHierarchy, setFullHierarchy] = useState<HierarchyStructure[]>([]);

//   // Dropdown Options State
//   const [hqOptions, setHqOptions] = useState<DropdownOption[]>([]);
//   const [factoryOptions, setFactoryOptions] = useState<DropdownOption[]>([]);
//   const [departmentOptions, setDepartmentOptions] = useState<DropdownOption[]>([]);
//   const [lineOptions, setLineOptions] = useState<DropdownOption[]>([]);
//   const [sublineOptions, setSublineOptions] = useState<DropdownOption[]>([]);
//   const [stationOptions, setStationOptions] = useState<DropdownOption[]>([]);

//   // Display Maps (ID -> Name) for Table
//   const [allHqsMap, setAllHqsMap] = useState<Record<number, string>>({});
//   const [allFactoriesMap, setAllFactoriesMap] = useState<Record<number, string>>({});
//   const [allDepartmentsMap, setAllDepartmentsMap] = useState<Record<number, string>>({});
//   const [allLinesMap, setAllLinesMap] = useState<Record<number, string>>({});
//   const [allSublinesMap, setAllSublinesMap] = useState<Record<number, string>>({});
//   const [allStationsMap, setAllStationsMap] = useState<Record<number, string>>({});

//   // Upload State
//   const [uploadFile, setUploadFile] = useState<File | null>(null);
//   const [uploadLoading, setUploadLoading] = useState(false);

//   const initialFormData: Omit<AdvanceSettingsData, 'id'> = {
//     hq: null, factory: null, department: null,
//     line: null, subline: null, station: null,
//     // month_year: `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
//     // month_year: `${apiData.year}-${apiData.month.toString().padStart(2, '0')}-01`,
//     month_year: new Date().toISOString().split('T')[0], 
//     total_stations_ctq: 0, operator_required_ctq: 0, operator_availability_ctq: 0,
//     buffer_manpower_required_ctq: 0, buffer_manpower_availability_ctq: 0,
//     l1_required: 0, l1_available: 0,
//     l2_required: 0, l2_available: 0,
//     l3_required: 0, l3_available: 0,
//     l4_required: 0, l4_available: 0,
//     attrition_trend_ctq: 0.00, absentee_trend_ctq: 0.00,
//   };

//   const [formData, setFormData] = useState<Omit<AdvanceSettingsData, 'id'>>(initialFormData);

//   // --- Initial Load ---
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoading(true);

//         // 1. Fetch Dashboard Data
//         const dashboardRes = await fetch(`${API_BASE_URL}/advance-dashboard/`);
//         const dashboardJson: ApiAdvanceManpowerData[] = await dashboardRes.json();
//         setAdvanceSettingsData(dashboardJson.map(apiToFrontend));

//         // 2. Fetch Deep Hierarchy
//         const hierarchyRes = await fetch(`${API_BASE_URL}/hierarchy-simple/`);
//         const hierarchyJson: HierarchyStructure[] = await hierarchyRes.json();
//         setFullHierarchy(hierarchyJson);

//         // 3. Flatten Hierarchy for Maps & Top-level Options
//         const hMap: Record<number, string> = {};
//         const fMap: Record<number, string> = {};
//         const dMap: Record<number, string> = {};
//         const lMap: Record<number, string> = {};
//         const slMap: Record<number, string> = {};
//         const stMap: Record<number, string> = {};

//         const uniqueHqs = new Map<number, string>();

//         hierarchyJson.forEach(item => {
//           if (item.hq) {
//             hMap[item.hq] = item.hq_name;
//             uniqueHqs.set(item.hq, item.hq_name);
//           }
//           fMap[item.factory] = item.factory_name;

//           // Traverse down
//           item.structure_data.departments.forEach(dept => {
//             dMap[dept.id] = dept.department_name;
//             dept.lines?.forEach(line => {
//               lMap[line.id] = line.line_name;

//               // Mapping direct stations under line (if any)
//               line.stations?.forEach(stn => {
//                 stMap[stn.id] = stn.station_name;
//               });

//               line.sublines?.forEach(sub => {
//                 slMap[sub.id] = sub.subline_name;
//                 sub.stations?.forEach(stn => {
//                   stMap[stn.id] = stn.station_name;
//                 });
//               });
//             });
//           });
//         });

//         setHqOptions(Array.from(uniqueHqs).map(([id, name]) => ({ id, name })));
//         setAllHqsMap(hMap);
//         setAllFactoriesMap(fMap);
//         setAllDepartmentsMap(dMap);
//         setAllLinesMap(lMap);
//         setAllSublinesMap(slMap);
//         setAllStationsMap(stMap);

//       } catch (err) {
//         console.error("Failed to load data", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, []);


//   // --- UPDATED Cascading Dropdown Logic ---

//   const handleHqChange = (hqId: number | null) => {
//     setFormData(prev => ({ ...prev, hq: hqId, factory: null, department: null, line: null, subline: null, station: null }));

//     if (hqId) {
//       const filtered = fullHierarchy.filter(item => item.hq === hqId);
//       const uniqueFacs = [...new Map(filtered.map(item => [item.factory, { id: item.factory, name: item.factory_name }])).values()];
//       setFactoryOptions(uniqueFacs);
//     } else {
//       setFactoryOptions([]);
//     }
//     setDepartmentOptions([]); setLineOptions([]); setSublineOptions([]); setStationOptions([]);
//   };

//   const handleFactoryChange = (factoryId: number | null) => {
//     setFormData(prev => ({ ...prev, factory: factoryId, department: null, line: null, subline: null, station: null }));

//     if (factoryId) {
//       const structure = fullHierarchy.find(item => item.factory === factoryId && item.hq === formData.hq);
//       if (structure) {
//         setDepartmentOptions(structure.structure_data.departments.map(d => ({ id: d.id, name: d.department_name })));
//       } else {
//         setDepartmentOptions([]);
//       }
//     } else {
//       setDepartmentOptions([]);
//     }
//     setLineOptions([]); setSublineOptions([]); setStationOptions([]);
//   };

//   const handleDepartmentChange = (deptId: number | null) => {
//     setFormData(prev => ({ ...prev, department: deptId, line: null, subline: null, station: null }));

//     if (deptId && formData.factory) {
//       const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
//       const dept = structure?.structure_data.departments.find(d => d.id === deptId);
//       if (dept && dept.lines) {
//         setLineOptions(dept.lines.map(l => ({ id: l.id, name: l.line_name })));
//       } else {
//         setLineOptions([]);
//       }
//     } else {
//       setLineOptions([]);
//     }
//     setSublineOptions([]); setStationOptions([]);
//   };

//   // --- CRITICAL UPDATE: Handle Flexible Hierarchy Here ---
//   const handleLineChange = (lineId: number | null) => {
//     // Reset subline and station when line changes
//     setFormData(prev => ({ ...prev, line: lineId, subline: null, station: null }));

//     if (lineId && formData.department && formData.factory) {
//       const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
//       const dept = structure?.structure_data.departments.find(d => d.id === formData.department);
//       const line = dept?.lines?.find(l => l.id === lineId);

//       // 1. Set Subline Options (if any exist)
//       if (line && line.sublines && line.sublines.length > 0) {
//         setSublineOptions(line.sublines.map(sl => ({ id: sl.id, name: sl.subline_name })));
//       } else {
//         setSublineOptions([]); // No sublines
//       }

//       // 2. Set Station Options (Look for direct stations first)
//       if (line && line.stations && line.stations.length > 0) {
//         setStationOptions(line.stations.map(st => ({ id: st.id, name: st.station_name })));
//       } else {
//         setStationOptions([]); // Clear stations until subline selected or none exist
//       }
//     } else {
//       setSublineOptions([]);
//       setStationOptions([]);
//     }
//   };

//   const handleSublineChange = (sublineId: number | null) => {
//     // Reset station when subline changes
//     setFormData(prev => ({ ...prev, subline: sublineId, station: null }));

//     if (formData.line && formData.department) {
//       const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
//       const dept = structure?.structure_data.departments.find(d => d.id === formData.department);
//       const line = dept?.lines?.find(l => l.id === formData.line);

//       if (sublineId) {
//         // User SELECTED a subline: Show subline's stations
//         const subline = line?.sublines?.find(sl => sl.id === sublineId);
//         if (subline && subline.stations) {
//           setStationOptions(subline.stations.map(st => ({ id: st.id, name: st.station_name })));
//         } else {
//           setStationOptions([]);
//         }
//       } else {
//         // User CLEARED subline (or selected "All Sublines"): Revert to Line's direct stations (if any)
//         if (line && line.stations) {
//           setStationOptions(line.stations.map(st => ({ id: st.id, name: st.station_name })));
//         } else {
//           setStationOptions([]);
//         }
//       }
//     } else {
//       setStationOptions([]);
//     }
//   };
// const handleRequiredChange = (level: string, value: string) => {
//   const newValue = Number(value) || 0; // Convert input to number

//   setFormData((prev) => {
//     // Create a temporary object with the new level value
//     // We need this to calculate the sum correctly
//     const nextState = {
//       ...prev,
//       [`${level}_required`]: newValue
//     };

//     // Calculate sum using the specific keys
//     const totalRequired = 
//       (nextState.l1_required || 0) + 
//       (nextState.l2_required || 0) + 
//       (nextState.l3_required || 0) + 
//       (nextState.l4_required || 0);

//     // Return the updated state with BOTH the specific level and the total
//     return {
//       ...nextState,
//       operator_required_ctq: totalRequired
//     };
//   });
// };
//   // --- Submit & Delete Handlers ---
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.factory) { alert("Factory is a required field."); return; }

//     const apiPayload = frontendToApi(formData);
//     try {
//       const response = await fetch(`${API_BASE_URL}/advance-dashboard/`, {
//         method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(apiPayload),
//       });
//       if (!response.ok) {
//         const errorData = await response.json(); throw new Error(JSON.stringify(errorData));
//       }
//       const newApiData: ApiAdvanceManpowerData = await response.json();
//       setAdvanceSettingsData(prev => [...prev, apiToFrontend(newApiData)]);
//       setFormData(initialFormData);
//       setFactoryOptions([]); setDepartmentOptions([]); setLineOptions([]); setSublineOptions([]); setStationOptions([]);
//       alert('Data added successfully!');
//       setActiveTab('data-list');
//     } catch (err: any) {
//       alert(`Failed to add entry: ${err.message}`);
//     }
//   };

//   const handleDelete = async (id: number) => {
//     if (window.confirm('Are you sure you want to delete this entry?')) {
//       try {
//         await fetch(`${API_BASE_URL}/advance-dashboard/${id}/`, { method: 'DELETE' });
//         setAdvanceSettingsData(prev => prev.filter(item => item.id !== id));
//       } catch (err: any) {
//         alert(`Error: ${err.message}`);
//       }
//     }
//   };

//   // --- UPLOAD & DOWNLOAD HANDLERS ---
//   const handleDownloadTemplate = () => {
//     window.location.href = `${API_BASE_URL}/advance-dashboard/download-template/`;
//   };

//   const handleExcelUpload = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!uploadFile) return;
//     setUploadLoading(true);
//     const formData = new FormData();
//     formData.append('file', uploadFile);
//     try {
//       const response = await fetch(`${API_BASE_URL}/advance-dashboard/upload-data/`, { method: 'POST', body: formData });
//       const result = await response.json();
//       if (!response.ok) throw new Error(result.error || (result.errors && result.errors.join('\n')) || 'Upload failed');

//       alert(`Upload successful!\nCreated: ${result.records_created}\nUpdated: ${result.records_updated}`);

//       // Refresh data
//       const dashboardRes = await fetch(`${API_BASE_URL}/advance-dashboard/`);
//       const dashboardJson = await dashboardRes.json();
//       setAdvanceSettingsData(dashboardJson.map(apiToFrontend));
//       setActiveTab('data-list');
//     } catch (err: any) {
//       alert(`Upload failed:\n${err.message}`);
//     } finally {
//       setUploadLoading(false); setUploadFile(null);
//     }
//   };

//   // 
//   const formatDate = (dateString: string) => {
//     if (!dateString) return '';
//     const [year, month, day] = dateString.split('-').map(Number);
//     // Create date object (Note: Month is 0-indexed in JS Date)
//     const date = new Date(year, month - 1, day || 1); 

//     // Returns "November 2023" or "November 1, 2023" depending on input
//     return date.toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'long', 
//         day: day ? 'numeric' : undefined // Only show day if it exists in the string
//     });
//   };

//   // --- Render ---
//   const renderTabContent = () => {
//     if (loading) return <div className="text-center p-12 text-gray-600">Loading system data...</div>;

//     switch (activeTab) {
//       case 'overview':
//         return (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between">
//                 <div><p className="text-gray-500 text-sm">Total Records</p><p className="text-3xl font-bold text-gray-800">{advanceSettingsData.length}</p></div>
//                 <div className="bg-blue-500 p-3 rounded-xl text-white"><FileSpreadsheet size={24} /></div>
//               </div>
//               <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between">
//                 <div><p className="text-gray-500 text-sm">Total Operators Req.</p><p className="text-3xl font-bold text-gray-800">{advanceSettingsData.reduce((a, b) => a + b.operator_required_ctq, 0)}</p></div>
//                 <div className="bg-green-500 p-3 rounded-xl text-white"><Users size={24} /></div>
//               </div>
//             </div>
//             <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//               <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Entries</h3>
//               <div className="space-y-3">
//                 {advanceSettingsData.slice(-5).reverse().map(item => (
//                   <div key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
//                     <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3"><Calendar size={18} /></div>
//                     <div>
//                       <p className="font-semibold text-sm text-gray-800">{formatDate(item.month_year)}</p>
//                       <p className="text-xs text-gray-500">
//                         {allFactoriesMap[item.factory || 0]} • {allDepartmentsMap[item.department || 0]}
//                       </p>
//                     </div>
//                     <div className="ml-auto text-right">
//                       <p className="text-sm font-bold text-gray-700">{item.operator_required_ctq} Ops</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         );

//       case 'add-data':
//         // Helper to determine if Subline Input should be visible
//         const isSublineVisible = sublineOptions.length > 0;

//         return (
//           <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><Plus className="h-6 w-6 mr-3 text-blue-600" />Add New Entry</h2>
//             <form onSubmit={handleSubmit} className="space-y-8">
//               {/* Hierarchy Inputs (Same as your code) */}
//               <div className="bg-gray-50 rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Building className="h-5 w-5 mr-2 text-blue-600" />Location Details</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {/* HQ */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Headquarters</label>
//                     <select value={formData.hq ?? ''} onChange={(e) => handleHqChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
//                       <option value="">Select HQ</option>
//                       {hqOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>
//                   {/* Factory */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Factory <span className="text-red-500">*</span></label>
//                     <select value={formData.factory ?? ''} onChange={(e) => handleFactoryChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.hq}>
//                       <option value="">Select Factory</option>
//                       {factoryOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>
//                   {/* Department */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
//                     <select value={formData.department ?? ''} onChange={(e) => handleDepartmentChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.factory}>
//                       <option value="">All Departments</option>
//                       {departmentOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Org Hierarchy Level 2 */}
//               <div className="bg-gray-50 rounded-xl p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {/* Line */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Line</label>
//                     <select value={formData.line ?? ''} onChange={(e) => handleLineChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.department}>
//                       <option value="">All Lines</option>
//                       {lineOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>

//                   {/* Subline - VISUAL TOGGLE BASED ON AVAILABILITY */}
//                   <div className={isSublineVisible ? "block" : "hidden"}>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">SubLine</label>
//                     <select value={formData.subline ?? ''} onChange={(e) => handleSublineChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
//                       <option value="">Select SubLine</option>
//                       {sublineOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>

//                   {/* Station */}
//                   {/* <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Station</label>
//                     <select value={formData.station ?? ''} onChange={(e) => setFormData(prev => ({ ...prev, station: e.target.value ? parseInt(e.target.value) : null }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.line}>
//                       <option value="">All Stations</option>
//                       {stationOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div> */}

//                   {/* Filler div if subline is hidden to keep grid layout nice (optional) */}
//                   {!isSublineVisible && <div className="hidden md:block"></div>}

//                 </div>
//               </div>

//               {/* Metrics */}
//               <div className="bg-gray-50 rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><BarChart3 className="h-5 w-5 mr-2 text-green-600" />General Metrics</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {/* <div><label className="block text-sm font-medium text-gray-700 mb-2">Month/Year</label><input type="month" value={formData.month_year} onChange={(e) => setFormData(prev => ({...prev, month_year: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
//                   //  */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Date (Month/Year will be saved)
//                     </label>
//                     <input
//                       type="date" // <--- CHANGE THIS from 'month' to 'date'
//                       value={formData.month_year}
//                       onChange={(e) => setFormData(prev => ({ ...prev, month_year: e.target.value }))}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                       required
//                     />
//                   </div>
//                   <div><label className="block text-sm font-medium text-gray-700 mb-2">Total Stations</label><input type="number" min="0" value={formData.total_stations_ctq} onChange={(e) => setFormData(prev => ({ ...prev, total_stations_ctq: +e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
//                   <div><label className="block text-sm font-medium text-gray-700 mb-2">Attrition (%)</label><input type="number" step="0.01" value={formData.attrition_trend_ctq} onChange={(e) => setFormData(prev => ({ ...prev, attrition_trend_ctq: +e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
//                   {/* <div><label className="block text-sm font-medium text-gray-700 mb-2">Absenteeism (%)</label><input type="number" step="0.01" value={formData.absentee_trend_ctq} onChange={(e) => setFormData(prev => ({ ...prev, absentee_trend_ctq: +e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div> */}
//                   <div><label className="block text-sm font-medium text-gray-700 mb-2">Buffer Req.</label><input type="number" min="0" value={formData.buffer_manpower_required_ctq} onChange={(e) => setFormData(prev => ({ ...prev, buffer_manpower_required_ctq: +e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
//                   {/* <div><label className="block text-sm font-medium text-gray-700 mb-2">Buffer Avail.</label><input type="number" min="0" value={formData.buffer_manpower_availability_ctq} onChange={(e) => setFormData(prev => ({ ...prev, buffer_manpower_availability_ctq: +e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div> */}
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
//                   <div>
//   <label className="block text-sm font-medium text-gray-700 mb-2">
//     Total Operators Required
//   </label>
//   <input
//     type="number"
//     min="0"
//     // It is recommended to make this readOnly since it is calculated
//     readOnly 
//     value={formData.operator_required_ctq} 
//     className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-green-50 text-gray-600 cursor-not-allowed" 
//   />
// </div>
//                   {/* <div><label className="block text-sm font-medium text-gray-700 mb-2">Total Operators Required</label><input type="number" min="0" value={formData.operator_required_ctq} onChange={(e) => setFormData(prev => ({ ...prev, operator_required_ctq: +e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-green-50" /></div> */}
//                   <div><label className="block text-sm font-medium text-gray-700 mb-2">Total Operators Available</label><input type="number" min="0" value={formData.operator_availability_ctq} onChange={(e) => setFormData(prev => ({ ...prev, operator_availability_ctq: +e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-blue-50" /></div>
//                 </div>
//               </div>

//               {/* Skill Level Metrics */}
//               <div className="bg-gray-50 rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Layers className="h-5 w-5 mr-2 text-orange-600" />Manpower AvailableLevel (L1-L4)</h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                   {['l1', 'l2', 'l3', 'l4'].map((level) => (
//                     <div key={level} className="space-y-2 border-r border-gray-200 pr-2 last:border-r-0">
//                       <h4 className="font-bold text-gray-600 text-center uppercase">{level}</h4>
//                       <div className="text-xs text-gray-500">Required</div>
//                       {/* <input type="number" min="0"
//                         value={formData[`${level}_required` as keyof typeof formData] as number}
//                         onChange={(e) => setFormData(prev => ({ ...prev, [`${level}_required`]: +e.target.value }))}
//                         className="w-full px-3 py-1 border rounded" />
//                       <div className="text-xs text-gray-500">Available</div>
//                       <input type="number" min="0"
//                         value={formData[`${level}_available` as keyof typeof formData] as number}
//                         onChange={(e) => setFormData(prev => ({ ...prev, [`${level}_available`]: +e.target.value }))}
//                         className="w-full px-3 py-1 border rounded" /> */}

//                           <input
//           type="number"
//           min="0"
//           value={formData[`${level}_required` as keyof typeof formData] as number}
//           onChange={(e) => handleRequiredChange(level, e.target.value)}
//           className="w-full px-3 py-1 border rounded"
//         />

//         <div className="text-xs text-gray-500">Available</div>
//         <input
//           type="number"
//           min="0"
//           value={formData[`${level}_available` as keyof typeof formData] as number}
//           onChange={(e) => setFormData(prev => ({ ...prev, [`${level}_available`]: +e.target.value }))}
//           className="w-full px-3 py-1 border rounded"
//         />
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex justify-end pt-6">
//                 <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg">Save Entry</button>
//               </div>
//             </form>
//           </div>
//         );

//       case 'upload':
//         return (
//           <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center max-w-3xl mx-auto mt-8">
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">Bulk Upload Data</h2>
//             <p className="text-gray-600 mb-8">Download the template, fill in your data, and upload it back.</p>

//             {/* Step 1: Download */}
//             <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
//               <h4 className="font-bold text-blue-800 mb-2 flex items-center justify-center">
//                 <FileSpreadsheet className="h-5 w-5 mr-2" /> Step 1: Get the Template
//               </h4>
//               <p className="text-sm text-blue-600 mb-4">
//                 This template includes columns for Hierarchy, KPIs, and Skill Levels (L1-L4).
//               </p>
//               <button
//                 onClick={handleDownloadTemplate}
//                 className="px-6 py-2 bg-white text-blue-700 font-bold rounded-lg border border-blue-200 shadow-sm hover:bg-blue-50 transition-all flex items-center mx-auto"
//               >
//                 <Download className="h-4 w-4 mr-2" /> Download Template.xlsx
//               </button>
//             </div>

//             {/* Step 2: Upload */}
//             <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
//               <h4 className="font-bold text-gray-700 mb-4">Step 2: Upload Filled File</h4>

//               <input
//                 type="file"
//                 accept=".xlsx, .xls"
//                 onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
//                 className="mb-6 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
//               />

//               {uploadFile && (
//                 <div className="flex items-center text-sm text-green-600 font-medium mb-4 bg-green-50 px-4 py-2 rounded-full">
//                   <CheckCircle className="h-4 w-4 mr-2" />
//                   {uploadFile.name} selected
//                 </div>
//               )}

//               <button
//                 onClick={handleExcelUpload}
//                 disabled={!uploadFile || uploadLoading}
//                 className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center shadow-lg disabled:shadow-none transition-all"
//               >
//                 {uploadLoading ? (
//                   <>
//                     <Loader2 className="h-5 w-5 animate-spin mr-2" /> Uploading...
//                   </>
//                 ) : (
//                   <>
//                     <Upload className="h-5 w-5 mr-2" /> Upload Excel File
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         );

//       case 'data-list':
//         return (
//           <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line / Station</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Req / Avail</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill Gaps</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {advanceSettingsData.map((item) => (
//                     <tr key={item.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 text-sm">
//                         <div className="font-medium text-gray-900">{allFactoriesMap[item.factory || 0]}</div>
//                         <div className="text-gray-500">{allDepartmentsMap[item.department || 0]}</div>
//                       </td>
//                       <td className="px-4 py-3 text-sm">
//                         <div className="text-gray-900 font-medium">{item.line ? (allLinesMap[item.line] || `Line ${item.line}`) : '-'}</div>
//                         <div className="text-xs text-gray-500">
//                           {item.subline ? (allSublinesMap[item.subline] || `Sub ${item.subline}`) : ''}
//                           {item.station ? ` / ${allStationsMap[item.station] || 'Stn ' + item.station}` : ''}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(item.month_year)}</td>
//                       <td className="px-4 py-3 text-sm">
//                         <div className="flex space-x-2">
//                           <span className="text-blue-600 font-bold">R: {item.operator_required_ctq}</span>
//                           <span className="text-green-600 font-bold">A: {item.operator_availability_ctq}</span>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-sm text-xs text-gray-600">
//                         <div className="grid grid-cols-2 gap-x-2">
//                           <span>L1: {item.l1_required}/{item.l1_available}</span>
//                           <span>L2: {item.l2_required}/{item.l2_available}</span>
//                           <span>L3: {item.l3_required}/{item.l3_available}</span>
//                           <span>L4: {item.l4_required}/{item.l4_available}</span>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-sm">
//                         <button onClick={() => handleDelete(item.id!)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         );
//       default: return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-6">Manpower Planning Dashboard</h1>
//         <div className="flex space-x-4 mb-6 border-b border-gray-200">
//           {[
//             { id: 'overview', label: 'Overview', icon: BarChart3 },
//             { id: 'add-data', label: 'Add Data', icon: Plus },
//             { id: 'upload', label: 'Bulk Upload', icon: Upload },
//             { id: 'data-list', label: 'Records', icon: FileSpreadsheet }
//           ].map(tab => (
//             <button key={tab.id} onClick={() => setActiveTab(tab.id)}
//               className={`pb-2 px-4 flex items-center space-x-2 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}>
//               <tab.icon size={18} /> <span>{tab.label}</span>
//             </button>
//           ))}
//         </div>
//         {renderTabContent()}
//       </div>
//     </div>
//   );
// };

// export default AdvanceSettings;  




// import React, { useState, useEffect } from "react";
// import {
//   Upload, Plus, Trash2, FileSpreadsheet, Users,
//   Calendar, BarChart3, Building, Layers, CheckCircle, Loader2, Download,
//   Edit, ArrowUp, ArrowDown
// } from "lucide-react";
// // --- API Configuration ---
// const API_BASE_URL = "http://127.0.0.1:8000";
// // --- Frontend Form Data Interface ---
// interface AdvanceSettingsData {
//   id?: number;
//   hq: number | null;
//   factory: number | null;
//   department: number | null;
//   line: number | null;
//   subline: number | null;
//   station: number | null;
//   month_year: string;
//   // KPIs
//   total_stations_ctq: number;
//   operator_required_ctq: number;
//   operator_availability_ctq: number;
//   buffer_manpower_required_ctq: number;
//   buffer_manpower_availability_ctq: number;
//   attrition_trend_ctq: number;
//   absentee_trend_ctq: number;
//   // Skill Levels
//   l1_required: number; l1_available: number;
//   l2_required: number; l2_available: number;
//   l3_required: number; l3_available: number;
//   l4_required: number; l4_available: number;
// }
// // --- API Payload/Response Interface ---
// interface ApiAdvanceManpowerData {
//   id: number;
//   hq: number | null;
//   factory: number;
//   department: number | null;
//   line: number | null;
//   subline: number | null;
//   station: number | null;
//   month: number;
//   year: number;
//   total_stations: number;
//   operators_required: number;
//   operators_available: number;
//   buffer_manpower_required: number;
//   buffer_manpower_available: number;
//   l1_required: number; l1_available: number;
//   l2_required: number; l2_available: number;
//   l3_required: number; l3_available: number;
//   l4_required: number; l4_available: number;
//   attrition_rate: string;
//   absenteeism_rate: string;
// }
// // --- UPDATED Hierarchy Interfaces ---
// // We add 'stations?' to LineNode to allow direct parent-child relationship
// interface StationNode { id: number; station_name: string; }
// interface SublineNode { id: number; subline_name: string; stations?: StationNode[]; }
// interface LineNode {
//   id: number;
//   line_name: string;
//   sublines?: SublineNode[];
//   stations?: StationNode[]; // <--- ADDED: Stations can exist directly under Line
// }
// interface DepartmentNode { id: number; department_name: string; lines?: LineNode[]; }
// interface HierarchyStructure {
//   hq: number; hq_name: string;
//   factory: number; factory_name: string;
//   structure_data: {
//     departments: DepartmentNode[];
//   };
// }
// interface DropdownOption { id: number; name: string; }
// // --- Data Transformers (Kept same as before) ---
// const apiToFrontend = (apiData: ApiAdvanceManpowerData): AdvanceSettingsData => ({
//   id: apiData.id,
//   hq: apiData.hq, factory: apiData.factory, department: apiData.department,
//   line: apiData.line, subline: apiData.subline, station: apiData.station,
//   // month_year: `${apiData.year}-${apiData.month.toString().padStart(2, '0')}`,
//   month_year: `${apiData.year}-${apiData.month.toString().padStart(2, '0')}-01`,
//   total_stations_ctq: apiData.total_stations,
//   operator_required_ctq: apiData.operators_required,
//   operator_availability_ctq: apiData.operators_available,
//   buffer_manpower_required_ctq: apiData.buffer_manpower_required,
//   buffer_manpower_availability_ctq: apiData.buffer_manpower_available,
//   l1_required: apiData.l1_required, l1_available: apiData.l1_available,
//   l2_required: apiData.l2_required, l2_available: apiData.l2_available,
//   l3_required: apiData.l3_required, l3_available: apiData.l3_available,
//   l4_required: apiData.l4_required, l4_available: apiData.l4_available,
//   attrition_trend_ctq: parseFloat(apiData.attrition_rate),
//   absentee_trend_ctq: parseFloat(apiData.absenteeism_rate),
// });
// const frontendToApi = (formData: AdvanceSettingsData) => {
//   // const [year, month] = formData.month_year.split('-').map(Number);
//   const [yearStr, monthStr, dayStr] = formData.month_year.split('-');
//   return {
//     hq: formData.hq, factory: formData.factory, department: formData.department,
//     line: formData.line, subline: formData.subline, station: formData.station,
//     year: parseInt(yearStr),
//     month: parseInt(monthStr),
//     total_stations: formData.total_stations_ctq,
//     operators_required: formData.operator_required_ctq,
//     operators_available: formData.operator_availability_ctq,
//     buffer_manpower_required: formData.buffer_manpower_required_ctq,
//     buffer_manpower_available: formData.buffer_manpower_availability_ctq,
//     l1_required: formData.l1_required, l1_available: formData.l1_available,
//     l2_required: formData.l2_required, l2_available: formData.l2_available,
//     l3_required: formData.l3_required, l3_available: formData.l3_available,
//     l4_required: formData.l4_required, l4_available: formData.l4_available,
//     attrition_rate: formData.attrition_trend_ctq.toFixed(2),
//     absenteeism_rate: formData.absentee_trend_ctq.toFixed(2),
//   };
// };
// const AdvanceSettings: React.FC = () => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [advanceSettingsData, setAdvanceSettingsData] = useState<AdvanceSettingsData[]>([]);
//   const [loading, setLoading] = useState(true);
//   // --- Hierarchy State ---
//   const [fullHierarchy, setFullHierarchy] = useState<HierarchyStructure[]>([]);
//   // Dropdown Options State
//   const [hqOptions, setHqOptions] = useState<DropdownOption[]>([]);
//   const [factoryOptions, setFactoryOptions] = useState<DropdownOption[]>([]);
//   const [departmentOptions, setDepartmentOptions] = useState<DropdownOption[]>([]);
//   const [lineOptions, setLineOptions] = useState<DropdownOption[]>([]);
//   const [sublineOptions, setSublineOptions] = useState<DropdownOption[]>([]);
//   const [stationOptions, setStationOptions] = useState<DropdownOption[]>([]);
//   // Display Maps (ID -> Name) for Table
//   const [allHqsMap, setAllHqsMap] = useState<Record<number, string>>({});
//   const [allFactoriesMap, setAllFactoriesMap] = useState<Record<number, string>>({});
//   const [allDepartmentsMap, setAllDepartmentsMap] = useState<Record<number, string>>({});
//   const [allLinesMap, setAllLinesMap] = useState<Record<number, string>>({});
//   const [allSublinesMap, setAllSublinesMap] = useState<Record<number, string>>({});
//   const [allStationsMap, setAllStationsMap] = useState<Record<number, string>>({});
//   // Upload State
//   const [uploadFile, setUploadFile] = useState<File | null>(null);
//   const [uploadLoading, setUploadLoading] = useState(false);
//   const initialFormData: AdvanceSettingsData = {
//     id: undefined,
//     hq: null, factory: null, department: null,
//     line: null, subline: null, station: null,
//     // month_year: `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
//     // month_year: `${apiData.year}-${apiData.month.toString().padStart(2, '0')}-01`,
//     month_year: new Date().toISOString().split('T')[0],
//     total_stations_ctq: 0, operator_required_ctq: 0, operator_availability_ctq: 0,
//     buffer_manpower_required_ctq: 0, buffer_manpower_availability_ctq: 0,
//     l1_required: 0, l1_available: 0,
//     l2_required: 0, l2_available: 0,
//     l3_required: 0, l3_available: 0,
//     l4_required: 0, l4_available: 0,
//     attrition_trend_ctq: 0.00, absentee_trend_ctq: 0.00,
//   };
//   const [formData, setFormData] = useState<AdvanceSettingsData>(initialFormData);
//   const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
//   // --- Initial Load ---
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoading(true);
//         // 1. Fetch Dashboard Data
//         const dashboardRes = await fetch(`${API_BASE_URL}/advance-dashboard/`);
//         const dashboardJson: ApiAdvanceManpowerData[] = await dashboardRes.json();
//         setAdvanceSettingsData(dashboardJson.map(apiToFrontend));
//         // 2. Fetch Deep Hierarchy
//         const hierarchyRes = await fetch(`${API_BASE_URL}/hierarchy-simple/`);
//         const hierarchyJson: HierarchyStructure[] = await hierarchyRes.json();
//         setFullHierarchy(hierarchyJson);
//         // 3. Flatten Hierarchy for Maps & Top-level Options
//         const hMap: Record<number, string> = {};
//         const fMap: Record<number, string> = {};
//         const dMap: Record<number, string> = {};
//         const lMap: Record<number, string> = {};
//         const slMap: Record<number, string> = {};
//         const stMap: Record<number, string> = {};
//         const uniqueHqs = new Map<number, string>();
//         hierarchyJson.forEach(item => {
//           if (item.hq) {
//             hMap[item.hq] = item.hq_name;
//             uniqueHqs.set(item.hq, item.hq_name);
//           }
//           fMap[item.factory] = item.factory_name;
//           // Traverse down
//           item.structure_data.departments.forEach(dept => {
//             dMap[dept.id] = dept.department_name;
//             dept.lines?.forEach(line => {
//               lMap[line.id] = line.line_name;
//               // Mapping direct stations under line (if any)
//               line.stations?.forEach(stn => {
//                 stMap[stn.id] = stn.station_name;
//               });
//               line.sublines?.forEach(sub => {
//                 slMap[sub.id] = sub.subline_name;
//                 sub.stations?.forEach(stn => {
//                   stMap[stn.id] = stn.station_name;
//                 });
//               });
//             });
//           });
//         });
//         setHqOptions(Array.from(uniqueHqs).map(([id, name]) => ({ id, name })));
//         setAllHqsMap(hMap);
//         setAllFactoriesMap(fMap);
//         setAllDepartmentsMap(dMap);
//         setAllLinesMap(lMap);
//         setAllSublinesMap(slMap);
//         setAllStationsMap(stMap);
//       } catch (err) {
//         console.error("Failed to load data", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, []);
//   // --- UPDATED Cascading Dropdown Logic ---
//   const handleHqChange = (hqId: number | null) => {
//     setFormData(prev => ({ ...prev, hq: hqId, factory: null, department: null, line: null, subline: null, station: null }));
//     if (hqId) {
//       const filtered = fullHierarchy.filter(item => item.hq === hqId);
//       const uniqueFacs = [...new Map(filtered.map(item => [item.factory, { id: item.factory, name: item.factory_name }])).values()];
//       setFactoryOptions(uniqueFacs);
//     } else {
//       setFactoryOptions([]);
//     }
//     setDepartmentOptions([]); setLineOptions([]); setSublineOptions([]); setStationOptions([]);
//   };
//   const handleFactoryChange = (factoryId: number | null) => {
//     setFormData(prev => ({ ...prev, factory: factoryId, department: null, line: null, subline: null, station: null }));
//     if (factoryId) {
//       const structure = fullHierarchy.find(item => item.factory === factoryId && item.hq === formData.hq);
//       if (structure) {
//         setDepartmentOptions(structure.structure_data.departments.map(d => ({ id: d.id, name: d.department_name })));
//       } else {
//         setDepartmentOptions([]);
//       }
//     } else {
//       setDepartmentOptions([]);
//     }
//     setLineOptions([]); setSublineOptions([]); setStationOptions([]);
//   };
//   const handleDepartmentChange = (deptId: number | null) => {
//     setFormData(prev => ({ ...prev, department: deptId, line: null, subline: null, station: null }));
//     if (deptId && formData.factory) {
//       const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
//       const dept = structure?.structure_data.departments.find(d => d.id === deptId);
//       if (dept && dept.lines) {
//         setLineOptions(dept.lines.map(l => ({ id: l.id, name: l.line_name })));
//       } else {
//         setLineOptions([]);
//       }
//     } else {
//       setLineOptions([]);
//     }
//     setSublineOptions([]); setStationOptions([]);
//   };
//   // --- CRITICAL UPDATE: Handle Flexible Hierarchy Here ---
//   const handleLineChange = (lineId: number | null) => {
//     // Reset subline and station when line changes
//     setFormData(prev => ({ ...prev, line: lineId, subline: null, station: null }));
//     if (lineId && formData.department && formData.factory) {
//       const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
//       const dept = structure?.structure_data.departments.find(d => d.id === formData.department);
//       const line = dept?.lines?.find(l => l.id === lineId);
//       // 1. Set Subline Options (if any exist)
//       if (line && line.sublines && line.sublines.length > 0) {
//         setSublineOptions(line.sublines.map(sl => ({ id: sl.id, name: sl.subline_name })));
//       } else {
//         setSublineOptions([]); // No sublines
//       }
//       // 2. Set Station Options (Look for direct stations first)
//       if (line && line.stations && line.stations.length > 0) {
//         setStationOptions(line.stations.map(st => ({ id: st.id, name: st.station_name })));
//       } else {
//         setStationOptions([]); // Clear stations until subline selected or none exist
//       }
//     } else {
//       setSublineOptions([]);
//       setStationOptions([]);
//     }
//   };
//   const handleSublineChange = (sublineId: number | null) => {
//     // Reset station when subline changes
//     setFormData(prev => ({ ...prev, subline: sublineId, station: null }));
//     if (formData.line && formData.department) {
//       const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
//       const dept = structure?.structure_data.departments.find(d => d.id === formData.department);
//       const line = dept?.lines?.find(l => l.id === formData.line);
//       if (sublineId) {
//         // User SELECTED a subline: Show subline's stations
//         const subline = line?.sublines?.find(sl => sl.id === sublineId);
//         if (subline && subline.stations) {
//           setStationOptions(subline.stations.map(st => ({ id: st.id, name: st.station_name })));
//         } else {
//           setStationOptions([]);
//         }
//       } else {
//         // User CLEARED subline (or selected "All Sublines"): Revert to Line's direct stations (if any)
//         if (line && line.stations) {
//           setStationOptions(line.stations.map(st => ({ id: st.id, name: st.station_name })));
//         } else {
//           setStationOptions([]);
//         }
//       }
//     } else {
//       setStationOptions([]);
//     }
//   };
//   const handleRequiredChange = (level: string, value: string) => {
//     const newValue = Number(value) || 0; // Convert input to number
//     setFormData((prev) => {
//       // Create a temporary object with the new level value
//       // We need this to calculate the sum correctly
//       const nextState = {
//         ...prev,
//         [`${level}_required`]: newValue
//       };
//       // Calculate sum using the specific keys
//       const totalRequired =
//         (nextState.l1_required || 0) +
//         (nextState.l2_required || 0) +
//         (nextState.l3_required || 0) +
//         (nextState.l4_required || 0);
//       // Return the updated state with BOTH the specific level and the total
//       return {
//         ...nextState,
//         operator_required_ctq: totalRequired
//       };
//     });
//   };
//   // --- Edit Handler ---
//   const handleEdit = (item: AdvanceSettingsData) => {
//     setFormData(item);
//     // Populate dropdown options based on item values (without relying on formData state)
//     if (item.hq) {
//       const filtered = fullHierarchy.filter(i => i.hq === item.hq);
//       const uniqueFacs = [...new Map(filtered.map(i => [i.factory, { id: i.factory, name: i.factory_name }])).values()];
//       setFactoryOptions(uniqueFacs);
//     }
//     if (item.factory && item.hq) {
//       const structure = fullHierarchy.find(i => i.factory === item.factory && i.hq === item.hq);
//       if (structure) {
//         setDepartmentOptions(structure.structure_data.departments.map(d => ({ id: d.id, name: d.department_name })));
//       }
//     }
//     if (item.department && item.factory && item.hq) {
//       const structure = fullHierarchy.find(i => i.factory === item.factory && i.hq === item.hq);
//       const dept = structure?.structure_data.departments.find(d => d.id === item.department);
//       if (dept && dept.lines) {
//         setLineOptions(dept.lines.map(l => ({ id: l.id, name: l.line_name })));
//       }
//     }
//     if (item.line && item.department && item.factory && item.hq) {
//       const structure = fullHierarchy.find(i => i.factory === item.factory && i.hq === item.hq);
//       const dept = structure?.structure_data.departments.find(d => d.id === item.department);
//       const line = dept?.lines?.find(l => l.id === item.line);
//       if (line) {
//         if (line.sublines && line.sublines.length > 0) {
//           setSublineOptions(line.sublines.map(sl => ({ id: sl.id, name: sl.subline_name })));
//         }
//         if (line.stations && line.stations.length > 0) {
//           setStationOptions(line.stations.map(st => ({ id: st.id, name: st.station_name })));
//         }
//       }
//     }
//     if (item.subline && item.line && item.department && item.factory && item.hq) {
//       const structure = fullHierarchy.find(i => i.factory === item.factory && i.hq === item.hq);
//       const dept = structure?.structure_data.departments.find(d => d.id === item.department);
//       const line = dept?.lines?.find(l => l.id === item.line);
//       const subline = line?.sublines?.find(sl => sl.id === item.subline);
//       if (subline && subline.stations) {
//         setStationOptions(subline.stations.map(st => ({ id: st.id, name: st.station_name })));
//       }
//     }
//     setActiveTab('add-data');
//   };
//   // --- Submit & Delete Handlers ---
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.factory) { alert("Factory is a required field."); return; }
//     if (!formData.line) { alert("Line is a required field."); return; }
//     const apiPayload = frontendToApi(formData);
//     try {
//       const method = formData.id ? 'PUT' : 'POST';
//       const url = formData.id ? `${API_BASE_URL}/advance-dashboard/${formData.id}/` : `${API_BASE_URL}/advance-dashboard/`;
//       const response = await fetch(url, {
//         method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(apiPayload),
//       });
//       if (!response.ok) {
//         const errorData = await response.json(); throw new Error(JSON.stringify(errorData));
//       }
//       const newApiData: ApiAdvanceManpowerData = await response.json();
//       if (formData.id) {
//         setAdvanceSettingsData(prev => prev.map(i => i.id === formData.id ? apiToFrontend(newApiData) : i));
//         alert('Data updated successfully!');
//       } else {
//         setAdvanceSettingsData(prev => [...prev, apiToFrontend(newApiData)]);
//         alert('Data added successfully!');
//       }
//       setFormData(initialFormData);
//       setFactoryOptions([]); setDepartmentOptions([]); setLineOptions([]); setSublineOptions([]); setStationOptions([]);
//       setActiveTab('data-list');
//     } catch (err: any) {
//       alert(`Failed to save entry: ${err.message}`);
//     }
//   };
//   const handleDelete = async (id: number) => {
//     if (window.confirm('Are you sure you want to delete this entry?')) {
//       if (window.confirm('This action cannot be undone. Confirm again?')) {
//         try {
//           await fetch(`${API_BASE_URL}/advance-dashboard/${id}/`, { method: 'DELETE' });
//           setAdvanceSettingsData(prev => prev.filter(item => item.id !== id));
//         } catch (err: any) {
//           alert(`Error: ${err.message}`);
//         }
//       }
//     }
//   };
//   // --- UPLOAD & DOWNLOAD HANDLERS ---
//   const handleDownloadTemplate = () => {
//     window.location.href = `${API_BASE_URL}/advance-dashboard/download-template/`;
//   };
//   const handleExcelUpload = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!uploadFile) return;
//     setUploadLoading(true);
//     const formData = new FormData();
//     formData.append('file', uploadFile);
//     try {
//       const response = await fetch(`${API_BASE_URL}/advance-dashboard/upload-data/`, { method: 'POST', body: formData });
//       const result = await response.json();
//       if (!response.ok) throw new Error(result.error || (result.errors && result.errors.join('\n')) || 'Upload failed');
//       alert(`Upload successful!\nCreated: ${result.records_created}\nUpdated: ${result.records_updated}`);
//       // Refresh data
//       const dashboardRes = await fetch(`${API_BASE_URL}/advance-dashboard/`);
//       const dashboardJson = await dashboardRes.json();
//       setAdvanceSettingsData(dashboardJson.map(apiToFrontend));
//       setActiveTab('data-list');
//     } catch (err: any) {
//       alert(`Upload failed:\n${err.message}`);
//     } finally {
//       setUploadLoading(false); setUploadFile(null);
//     }
//   };
//   //
//   const formatDate = (dateString: string) => {
//     if (!dateString) return '';
//     const [year, month, day] = dateString.split('-').map(Number);
//     // Create date object (Note: Month is 0-indexed in JS Date)
//     const date = new Date(year, month - 1, day || 1);

//     // Returns "November 2023" or "November 1, 2023" depending on input
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: day ? 'numeric' : undefined // Only show day if it exists in the string
//     });
//   };
//   // --- Sorting Logic ---
//   const requestSort = (key: string) => {
//     let direction: 'asc' | 'desc' = 'asc';
//     if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
//       direction = 'desc';
//     }
//     setSortConfig({ key, direction });
//   };

//   const getSortValue = (item: AdvanceSettingsData, key: string): any => {
//     switch (key) {
//       case 'location':
//         return `${allFactoriesMap[item.factory || 0] || ''} ${allDepartmentsMap[item.department || 0] || ''}`;
//       case 'line_station':
//         return `${allLinesMap[item.line || 0] || ''} ${allSublinesMap[item.subline || 0] || ''} ${allStationsMap[item.station || 0] || ''}`;
//       case 'period':
//         return new Date(item.month_year);
//       case 'required':
//         return item.operator_required_ctq;
//       case 'available':
//         return item.operator_availability_ctq;
//       default:
//         return item[key as keyof AdvanceSettingsData];
//     }
//   };

//   const getSortedData = () => {
//     const sorted = [...advanceSettingsData];
//     if (sortConfig) {
//       sorted.sort((a, b) => {
//         const aVal = getSortValue(a, sortConfig.key);
//         const bVal = getSortValue(b, sortConfig.key);
//         if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
//         if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
//         return 0;
//       });
//     }
//     return sorted;
//   };
//   // --- Render ---
//   const renderTabContent = () => {
//     if (loading) return <div className="text-center p-12 text-gray-600">Loading system data...</div>;
//     switch (activeTab) {
//       case 'overview':
//         return (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between">
//                 <div><p className="text-gray-500 text-sm">Total Records</p><p className="text-3xl font-bold text-gray-800">{advanceSettingsData.length}</p></div>
//                 <div className="bg-blue-500 p-3 rounded-xl text-white"><FileSpreadsheet size={24} /></div>
//               </div>
//               <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between">
//                 <div><p className="text-gray-500 text-sm">Total Operators Req.</p><p className="text-3xl font-bold text-gray-800">{advanceSettingsData.reduce((a, b) => a + b.operator_required_ctq, 0)}</p></div>
//                 <div className="bg-green-500 p-3 rounded-xl text-white"><Users size={24} /></div>
//               </div>
//             </div>
//             <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//               <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Entries</h3>
//               <div className="space-y-3">
//                 {advanceSettingsData.slice(-5).reverse().map(item => (
//                   <div key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
//                     <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3"><Calendar size={18} /></div>
//                     <div>
//                       <p className="font-semibold text-sm text-gray-800">{formatDate(item.month_year)}</p>
//                       <p className="text-xs text-gray-500">
//                         {allFactoriesMap[item.factory || 0]} • {allDepartmentsMap[item.department || 0]}
//                       </p>
//                     </div>
//                     <div className="ml-auto text-right">
//                       <p className="text-sm font-bold text-gray-700">{item.operator_required_ctq} Ops</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         );
//       case 'add-data':
//         // Helper to determine if Subline Input should be visible
//         const isSublineVisible = sublineOptions.length > 0;
//         return (
//           <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><Plus className="h-6 w-6 mr-3 text-blue-600" />{formData.id ? 'Edit Entry' : 'Add New Entry'}</h2>
//             <form onSubmit={handleSubmit} className="space-y-8">
//               {/* Hierarchy Inputs (Same as your code) */}
//               <div className="bg-gray-50 rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Building className="h-5 w-5 mr-2 text-blue-600" />Location Details</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {/* HQ */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Headquarters</label>
//                     <select value={formData.hq ?? ''} onChange={(e) => handleHqChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
//                       <option value="">Select HQ</option>
//                       {hqOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>
//                   {/* Factory */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Factory <span className="text-red-500">*</span></label>
//                     <select value={formData.factory ?? ''} onChange={(e) => handleFactoryChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.hq}>
//                       <option value="">Select Factory</option>
//                       {factoryOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>
//                   {/* Department */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
//                     <select value={formData.department ?? ''} onChange={(e) => handleDepartmentChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.factory}>
//                       <option value="">All Departments</option>
//                       {departmentOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>
//                 </div>
//               </div>
//               {/* Org Hierarchy Level 2 */}
//               <div className="bg-gray-50 rounded-xl p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {/* Line */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Line</label>
//                     <select value={formData.line ?? ''} onChange={(e) => handleLineChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.department}>
//                       <option value="">All Lines</option>
//                       {lineOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>
//                   {/* Subline - VISUAL TOGGLE BASED ON AVAILABILITY */}
//                   <div className={isSublineVisible ? "block" : "hidden"}>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">SubLine</label>
//                     <select value={formData.subline ?? ''} onChange={(e) => handleSublineChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
//                       <option value="">Select SubLine</option>
//                       {sublineOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>
//                   {/* Station */}
//                   {/* <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Station</label>
//                     <select value={formData.station ?? ''} onChange={(e) => setFormData(prev => ({ ...prev, station: e.target.value ? parseInt(e.target.value) : null }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.line}>
//                       <option value="">All Stations</option>
//                       {stationOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div> */}
//                   {/* Filler div if subline is hidden to keep grid layout nice (optional) */}
//                   {!isSublineVisible && <div className="hidden md:block"></div>}
//                 </div>
//               </div>
//               {/* Metrics */}
//               <div className="bg-gray-50 rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><BarChart3 className="h-5 w-5 mr-2 text-green-600" />General Metrics</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {/* <div><label className="block text-sm font-medium text-gray-700 mb-2">Month/Year</label><input type="month" value={formData.month_year} onChange={(e) => setFormData(prev => ({...prev, month_year: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
//                   // */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Date (Month/Year will be saved)
//                     </label>
//                     <input
//                       type="date" // <--- CHANGE THIS from 'month' to 'date'
//                       value={formData.month_year}
//                       onChange={(e) => setFormData(prev => ({ ...prev, month_year: e.target.value }))}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                       required
//                     />
//                   </div>
//                   <div><label className="block text-sm font-medium text-gray-700 mb-2">Total Stations</label><input type="number" min="0" value={formData.total_stations_ctq} onChange={(e) => setFormData(prev => ({ ...prev, total_stations_ctq: +e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
//                   <div><label className="block text-sm font-medium text-gray-700 mb-2">Attrition (%)</label><input type="number" step="0.01" value={formData.attrition_trend_ctq} onChange={(e) => setFormData(prev => ({ ...prev, attrition_trend_ctq: +e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
//                   {/* <div><label className="block text-sm font-medium text-gray-700 mb-2">Absenteeism (%)</label><input type="number" step="0.01" value={formData.absentee_trend_ctq} onChange={(e) => setFormData(prev => ({ ...prev, absentee_trend_ctq: +e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div> */}
//                   <div><label className="block text-sm font-medium text-gray-700 mb-2">Buffer Req.</label><input type="number" min="0" value={formData.buffer_manpower_required_ctq} onChange={(e) => setFormData(prev => ({ ...prev, buffer_manpower_required_ctq: +e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
//                   {/* <div><label className="block text-sm font-medium text-gray-700 mb-2">Buffer Avail.</label><input type="number" min="0" value={formData.buffer_manpower_availability_ctq} onChange={(e) => setFormData(prev => ({ ...prev, buffer_manpower_availability_ctq: +e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div> */}
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Total Operators Required
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       // It is recommended to make this readOnly since it is calculated
//                       readOnly
//                       value={formData.operator_required_ctq}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-green-50 text-gray-600 cursor-not-allowed"
//                     />
//                   </div>
//                   {/* <div><label className="block text-sm font-medium text-gray-700 mb-2">Total Operators Required</label><input type="number" min="0" value={formData.operator_required_ctq} onChange={(e) => setFormData(prev => ({ ...prev, operator_required_ctq: +e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-green-50" /></div> */}
//                   <div><label className="block text-sm font-medium text-gray-700 mb-2">Total Operators Available</label><input type="number" min="0" value={formData.operator_availability_ctq} onChange={(e) => setFormData(prev => ({ ...prev, operator_availability_ctq: +e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-blue-50" /></div>
//                 </div>
//               </div>
//               {/* Skill Level Metrics */}
//               <div className="bg-gray-50 rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Layers className="h-5 w-5 mr-2 text-orange-600" />Manpower AvailableLevel (L1-L4)</h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                   {['l1', 'l2', 'l3', 'l4'].map((level) => (
//                     <div key={level} className="space-y-2 border-r border-gray-200 pr-2 last:border-r-0">
//                       <h4 className="font-bold text-gray-600 text-center uppercase">{level}</h4>
//                       <div className="text-xs text-gray-500">Required</div>
//                       {/* <input type="number" min="0"
//                         value={formData[`${level}_required` as keyof typeof formData] as number}
//                         onChange={(e) => setFormData(prev => ({ ...prev, [`${level}_required`]: +e.target.value }))}
//                         className="w-full px-3 py-1 border rounded" />
//                       <div className="text-xs text-gray-500">Available</div>
//                       <input type="number" min="0"
//                         value={formData[`${level}_available` as keyof typeof formData] as number}
//                         onChange={(e) => setFormData(prev => ({ ...prev, [`${level}_available`]: +e.target.value }))}
//                         className="w-full px-3 py-1 border rounded" /> */}
//                       <input
//                         type="number"
//                         min="0"
//                         value={formData[`${level}_required` as keyof typeof formData] as number}
//                         onChange={(e) => handleRequiredChange(level, e.target.value)}
//                         className="w-full px-3 py-1 border rounded"
//                       />
//                       <div className="text-xs text-gray-500">Available</div>
//                       <input
//                         type="number"
//                         min="0"
//                         value={formData[`${level}_available` as keyof typeof formData] as number}
//                         onChange={(e) => setFormData(prev => ({ ...prev, [`${level}_available`]: +e.target.value }))}
//                         className="w-full px-3 py-1 border rounded"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div className="flex justify-end pt-6">
//                 {formData.id && (
//                   <button type="button" onClick={() => { setFormData(initialFormData); setActiveTab('data-list'); }} className="mr-4 px-8 py-3 bg-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-400 shadow-lg">
//                     Cancel
//                   </button>
//                 )}
//                 <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg">{formData.id ? 'Update Entry' : 'Save Entry'}</button>
//               </div>
//             </form>
//           </div>
//         );
//       case 'upload':
//         return (
//           <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center max-w-3xl mx-auto mt-8">
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">Bulk Upload Data</h2>
//             <p className="text-gray-600 mb-8">Download the template, fill in your data, and upload it back.</p>
//             {/* Step 1: Download */}
//             <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
//               <h4 className="font-bold text-blue-800 mb-2 flex items-center justify-center">
//                 <FileSpreadsheet className="h-5 w-5 mr-2" /> Step 1: Get the Template
//               </h4>
//               <p className="text-sm text-blue-600 mb-4">
//                 This template includes columns for Hierarchy, KPIs, and Skill Levels (L1-L4).
//               </p>
//               <button
//                 onClick={handleDownloadTemplate}
//                 className="px-6 py-2 bg-white text-blue-700 font-bold rounded-lg border border-blue-200 shadow-sm hover:bg-blue-50 transition-all flex items-center mx-auto"
//               >
//                 <Download className="h-4 w-4 mr-2" /> Download Template.xlsx
//               </button>
//             </div>
//             {/* Step 2: Upload */}
//             <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
//               <h4 className="font-bold text-gray-700 mb-4">Step 2: Upload Filled File</h4>
//               <input
//                 type="file"
//                 accept=".xlsx, .xls"
//                 onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
//                 className="mb-6 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
//               />
//               {uploadFile && (
//                 <div className="flex items-center text-sm text-green-600 font-medium mb-4 bg-green-50 px-4 py-2 rounded-full">
//                   <CheckCircle className="h-4 w-4 mr-2" />
//                   {uploadFile.name} selected
//                 </div>
//               )}
//               <button
//                 onClick={handleExcelUpload}
//                 disabled={!uploadFile || uploadLoading}
//                 className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center shadow-lg disabled:shadow-none transition-all"
//               >
//                 {uploadLoading ? (
//                   <>
//                     <Loader2 className="h-5 w-5 animate-spin mr-2" /> Uploading...
//                   </>
//                 ) : (
//                   <>
//                     <Upload className="h-5 w-5 mr-2" /> Upload Excel File
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         );
//       case 'data-list':
//         const sortedData = getSortedData();
//         return (
//           <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => requestSort('location')}>
//                       Location {sortConfig?.key === 'location' && (sortConfig.direction === 'asc' ? <ArrowUp size={12} className="inline" /> : <ArrowDown size={12} className="inline" />)}
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => requestSort('line_station')}>
//                       Line / Station {sortConfig?.key === 'line_station' && (sortConfig.direction === 'asc' ? <ArrowUp size={12} className="inline" /> : <ArrowDown size={12} className="inline" />)}
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => requestSort('period')}>
//                       Period {sortConfig?.key === 'period' && (sortConfig.direction === 'asc' ? <ArrowUp size={12} className="inline" /> : <ArrowDown size={12} className="inline" />)}
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => requestSort('required')}>
//                       Req / Avail {sortConfig?.key === 'required' && (sortConfig.direction === 'asc' ? <ArrowUp size={12} className="inline" /> : <ArrowDown size={12} className="inline" />)}
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill Gaps</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {sortedData.map((item) => (
//                     <tr key={item.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 text-sm">
//                         <div className="font-medium text-gray-900">{allFactoriesMap[item.factory || 0]}</div>
//                         <div className="text-gray-500">{allDepartmentsMap[item.department || 0]}</div>
//                       </td>
//                       <td className="px-4 py-3 text-sm">
//                         <div className="text-gray-900 font-medium">{item.line ? (allLinesMap[item.line] || `Line ${item.line}`) : '-'}</div>
//                         <div className="text-xs text-gray-500">
//                           {item.subline ? (allSublinesMap[item.subline] || `Sub ${item.subline}`) : ''}
//                           {item.station ? ` / ${allStationsMap[item.station] || 'Stn ' + item.station}` : ''}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(item.month_year)}</td>
//                       <td className="px-4 py-3 text-sm">
//                         <div className="flex space-x-2">
//                           <span className="text-blue-600 font-bold">R: {item.operator_required_ctq}</span>
//                           <span className="text-green-600 font-bold">A: {item.operator_availability_ctq}</span>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-sm text-xs text-gray-600">
//                         <div className="grid grid-cols-2 gap-x-2">
//                           <span>L1: {item.l1_required}/{item.l1_available}</span>
//                           <span>L2: {item.l2_required}/{item.l2_available}</span>
//                           <span>L3: {item.l3_required}/{item.l3_available}</span>
//                           <span>L4: {item.l4_required}/{item.l4_available}</span>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-sm">
//                         <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900 mr-2"><Edit size={18} /></button>
//                         <button onClick={() => handleDelete(item.id!)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         );
//       default: return null;
//     }
//   };
//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-6">Manpower Planning Dashboard</h1>
//         <div className="flex space-x-4 mb-6 border-b border-gray-200">
//           {[
//             { id: 'overview', label: 'Overview', icon: BarChart3 },
//             { id: 'add-data', label: 'Add Data', icon: Plus },
//             { id: 'upload', label: 'Bulk Upload', icon: Upload },
//             { id: 'data-list', label: 'Records', icon: FileSpreadsheet }
//           ].map(tab => (
//             <button key={tab.id} onClick={() => setActiveTab(tab.id)}
//               className={`pb-2 px-4 flex items-center space-x-2 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}>
//               <tab.icon size={18} /> <span>{tab.label}</span>
//             </button>
//           ))}
//         </div>
//         {renderTabContent()}
//       </div>
//     </div>
//   );
// };
// export default AdvanceSettings;

// import React, { useState, useEffect } from "react";
// import {
//   Upload, Plus, Trash2, FileSpreadsheet, Users,
//   Calendar, BarChart3, Building, Layers, CheckCircle, Loader2, Download,
//   Edit, ArrowUp, ArrowDown
// } from "lucide-react";

// const API_BASE_URL = "http://127.0.0.1:8000";

// interface AdvanceSettingsData {
//   id?: number;
//   hq: number | null;
//   factory: number | null;
//   department: number | null;
//   line: number | null;
//   subline: number | null;
//   station: number | null;
//   month_year: string;           // "YYYY-MM"
//   total_stations_ctq: number;
//   operator_required_ctq: number;
//   operator_availability_ctq: number;
//   buffer_manpower_required_ctq: number;
//   buffer_manpower_availability_ctq: number;
//   attrition_trend_ctq: number;
//   absentee_trend_ctq: number;
//   oet_attrition_ctq: number;
//   associate_attrition_ctq: number;
//   l1_required: number; l1_available: number;
//   l2_required: number; l2_available: number;
//   l3_required: number; l3_available: number;
//   l4_required: number; l4_available: number;
// }

// interface ApiAdvanceManpowerData {
//   id: number;
//   hq: number | null;
//   factory: number;
//   department: number | null;
//   line: number | null;
//   subline: number | null;
//   station: number | null;
//   month: number;
//   year: number;
//   total_stations: number;
//   operators_required: number;
//   operators_available: number;
//   buffer_manpower_required: number;
//   buffer_manpower_available: number;
//   l1_required: number; l1_available: number;
//   l2_required: number; l2_available: number;
//   l3_required: number; l3_available: number;
//   l4_required: number; l4_available: number;
//   attrition_rate: string;
//   absenteeism_rate: string;
//   oet_attrition: string;
//   associate_attrition: string;
// }

// interface StationNode { id: number; station_name: string; }
// interface SublineNode { id: number; subline_name: string; stations?: StationNode[]; }
// interface LineNode {
//   id: number;
//   line_name: string;
//   sublines?: SublineNode[];
//   stations?: StationNode[];
// }
// interface DepartmentNode { id: number; department_name: string; lines?: LineNode[]; }
// interface HierarchyStructure {
//   hq: number; hq_name: string;
//   factory: number; factory_name: string;
//   structure_data: { departments: DepartmentNode[]; };
// }
// interface DropdownOption { id: number; name: string; }

// const apiToFrontend = (apiData: ApiAdvanceManpowerData): AdvanceSettingsData => ({
//   id: apiData.id,
//   hq: apiData.hq,
//   factory: apiData.factory,
//   department: apiData.department,
//   line: apiData.line,
//   subline: apiData.subline,
//   station: apiData.station,
//   month_year: `${apiData.year}-${String(apiData.month).padStart(2, '0')}`,
//   total_stations_ctq: apiData.total_stations,
//   operator_required_ctq: apiData.operators_required,
//   operator_availability_ctq: apiData.operators_available,
//   buffer_manpower_required_ctq: apiData.buffer_manpower_required,
//   buffer_manpower_availability_ctq: apiData.buffer_manpower_available,
//   l1_required: apiData.l1_required,
//   l1_available: apiData.l1_available,
//   l2_required: apiData.l2_required,
//   l2_available: apiData.l2_available,
//   l3_required: apiData.l3_required,
//   l3_available: apiData.l3_available,
//   l4_required: apiData.l4_required,
//   l4_available: apiData.l4_available,
//   attrition_trend_ctq: parseFloat(apiData.attrition_rate || "0"),
//   absentee_trend_ctq: parseFloat(apiData.absenteeism_rate || "0"),
//   oet_attrition_ctq: parseFloat(apiData.oet_attrition || "0"),
//   associate_attrition_ctq: parseFloat(apiData.associate_attrition || "0"),
// });

// const frontendToApi = (formData: AdvanceSettingsData) => {
//   const [yearStr, monthStr] = formData.month_year.split('-');
//   return {
//     hq: formData.hq,
//     factory: formData.factory,
//     department: formData.department,
//     line: formData.line,
//     subline: formData.subline,
//     station: formData.station,
//     year: parseInt(yearStr),
//     month: parseInt(monthStr),
//     total_stations: formData.total_stations_ctq,
//     operators_required: formData.operator_required_ctq,
//     operators_available: formData.operator_availability_ctq,
//     buffer_manpower_required: formData.buffer_manpower_required_ctq,
//     buffer_manpower_available: formData.buffer_manpower_availability_ctq,
//     l1_required: formData.l1_required,
//     l1_available: formData.l1_available,
//     l2_required: formData.l2_required,
//     l2_available: formData.l2_available,
//     l3_required: formData.l3_required,
//     l3_available: formData.l3_available,
//     l4_required: formData.l4_required,
//     l4_available: formData.l4_available,
//     attrition_rate: formData.attrition_trend_ctq.toFixed(2),
//     absenteeism_rate: formData.absentee_trend_ctq.toFixed(2),
//     oet_attrition: formData.oet_attrition_ctq.toFixed(2),
//     associate_attrition: formData.associate_attrition_ctq.toFixed(2),
//   };
// };

// const AdvanceSettings: React.FC = () => {
//   const [activeTab, setActiveTab] = useState("overview");
//   const [advanceSettingsData, setAdvanceSettingsData] = useState<AdvanceSettingsData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [fullHierarchy, setFullHierarchy] = useState<HierarchyStructure[]>([]);
//   const [hqOptions, setHqOptions] = useState<DropdownOption[]>([]);
//   const [factoryOptions, setFactoryOptions] = useState<DropdownOption[]>([]);
//   const [departmentOptions, setDepartmentOptions] = useState<DropdownOption[]>([]);
//   const [lineOptions, setLineOptions] = useState<DropdownOption[]>([]);
//   const [sublineOptions, setSublineOptions] = useState<DropdownOption[]>([]);
//   const [stationOptions, setStationOptions] = useState<DropdownOption[]>([]);
//   const [allHqsMap, setAllHqsMap] = useState<Record<number, string>>({});
//   const [allFactoriesMap, setAllFactoriesMap] = useState<Record<number, string>>({});
//   const [allDepartmentsMap, setAllDepartmentsMap] = useState<Record<number, string>>({});
//   const [allLinesMap, setAllLinesMap] = useState<Record<number, string>>({});
//   const [allSublinesMap, setAllSublinesMap] = useState<Record<number, string>>({});
//   const [allStationsMap, setAllStationsMap] = useState<Record<number, string>>({});
//   const [uploadFile, setUploadFile] = useState<File | null>(null);
//   const [uploadLoading, setUploadLoading] = useState(false);

//   const initialFormData: AdvanceSettingsData = {
//     id: undefined,
//     hq: null, factory: null, department: null,
//     line: null, subline: null, station: null,
//     month_year: new Date().toISOString().slice(0, 7),
//     total_stations_ctq: 0,
//     operator_required_ctq: 0,
//     operator_availability_ctq: 0,
//     buffer_manpower_required_ctq: 0,
//     buffer_manpower_availability_ctq: 0,
//     l1_required: 0, l1_available: 0,
//     l2_required: 0, l2_available: 0,
//     l3_required: 0, l3_available: 0,
//     l4_required: 0, l4_available: 0,
//     attrition_trend_ctq: 0.00,
//     absentee_trend_ctq: 0.00,
//     oet_attrition_ctq: 0.00,
//     associate_attrition_ctq: 0.00,
//   };

//   const [formData, setFormData] = useState<AdvanceSettingsData>(initialFormData);
//   const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

//   // ────────────────────────────────────────────────
//   // Load initial data
//   // ────────────────────────────────────────────────
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoading(true);

//         const [dashboardRes, hierarchyRes] = await Promise.all([
//           fetch(`${API_BASE_URL}/advance-dashboard/`),
//           fetch(`${API_BASE_URL}/hierarchy-simple/`)
//         ]);

//         if (!dashboardRes.ok || !hierarchyRes.ok) throw new Error("Failed to fetch data");

//         const dashboardJson: ApiAdvanceManpowerData[] = await dashboardRes.json();
//         const hierarchyJson: HierarchyStructure[] = await hierarchyRes.json();

//         setAdvanceSettingsData(dashboardJson.map(apiToFrontend));
//         setFullHierarchy(hierarchyJson);

//         // Build maps
//         const hMap: Record<number, string> = {};
//         const fMap: Record<number, string> = {};
//         const dMap: Record<number, string> = {};
//         const lMap: Record<number, string> = {};
//         const slMap: Record<number, string> = {};
//         const stMap: Record<number, string> = {};
//         const uniqueHqs = new Map<number, string>();

//         hierarchyJson.forEach(item => {
//           if (item.hq) {
//             hMap[item.hq] = item.hq_name;
//             uniqueHqs.set(item.hq, item.hq_name);
//           }
//           fMap[item.factory] = item.factory_name;

//           item.structure_data.departments.forEach(dept => {
//             dMap[dept.id] = dept.department_name;
//             dept.lines?.forEach(line => {
//               lMap[line.id] = line.line_name;
//               line.stations?.forEach(stn => { stMap[stn.id] = stn.station_name; });
//               line.sublines?.forEach(sub => {
//                 slMap[sub.id] = sub.subline_name;
//                 sub.stations?.forEach(stn => { stMap[stn.id] = stn.station_name; });
//               });
//             });
//           });
//         });

//         setHqOptions(Array.from(uniqueHqs, ([id, name]) => ({ id, name })));
//         setAllHqsMap(hMap);
//         setAllFactoriesMap(fMap);
//         setAllDepartmentsMap(dMap);
//         setAllLinesMap(lMap);
//         setAllSublinesMap(slMap);
//         setAllStationsMap(stMap);
//       } catch (err) {
//         console.error("Data load error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   // ────────────────────────────────────────────────
//   // Cascading dropdown logic
//   // ────────────────────────────────────────────────
//   const handleHqChange = (hqId: number | null) => {
//     setFormData(p => ({ ...p, hq: hqId, factory: null, department: null, line: null, subline: null, station: null }));
//     if (!hqId) {
//       setFactoryOptions([]);
//       return;
//     }
//     const filtered = fullHierarchy.filter(item => item.hq === hqId);
//     const uniqueFacs = [...new Map(filtered.map(item => [item.factory, { id: item.factory, name: item.factory_name }])).values()];
//     setFactoryOptions(uniqueFacs);
//     setDepartmentOptions([]); setLineOptions([]); setSublineOptions([]); setStationOptions([]);
//   };

//   const handleFactoryChange = (factoryId: number | null) => {
//     setFormData(p => ({ ...p, factory: factoryId, department: null, line: null, subline: null, station: null }));
//     if (!factoryId || !formData.hq) {
//       setDepartmentOptions([]);
//       return;
//     }
//     const structure = fullHierarchy.find(item => item.factory === factoryId && item.hq === formData.hq);
//     setDepartmentOptions(structure?.structure_data.departments.map(d => ({ id: d.id, name: d.department_name })) || []);
//     setLineOptions([]); setSublineOptions([]); setStationOptions([]);
//   };

//   const handleDepartmentChange = (deptId: number | null) => {
//     setFormData(p => ({ ...p, department: deptId, line: null, subline: null, station: null }));
//     if (!deptId || !formData.factory) {
//       setLineOptions([]);
//       return;
//     }
//     const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
//     const dept = structure?.structure_data.departments.find(d => d.id === deptId);
//     setLineOptions(dept?.lines?.map(l => ({ id: l.id, name: l.line_name })) || []);
//     setSublineOptions([]); setStationOptions([]);
//   };

//   const handleLineChange = (lineId: number | null) => {
//     setFormData(p => ({ ...p, line: lineId, subline: null, station: null }));
//     if (!lineId || !formData.department) {
//       setSublineOptions([]); setStationOptions([]);
//       return;
//     }
//     const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
//     const dept = structure?.structure_data.departments.find(d => d.id === formData.department);
//     const line = dept?.lines?.find(l => l.id === lineId);

//     setSublineOptions(line?.sublines?.map(sl => ({ id: sl.id, name: sl.subline_name })) || []);
//     setStationOptions(line?.stations?.map(st => ({ id: st.id, name: st.station_name })) || []);
//   };

//   const handleSublineChange = (sublineId: number | null) => {
//     setFormData(p => ({ ...p, subline: sublineId, station: null }));
//     if (!formData.line) return;

//     const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
//     const dept = structure?.structure_data.departments.find(d => d.id === formData.department);
//     const line = dept?.lines?.find(l => l.id === formData.line);

//     if (sublineId) {
//       const sub = line?.sublines?.find(s => s.id === sublineId);
//       setStationOptions(sub?.stations?.map(st => ({ id: st.id, name: st.station_name })) || []);
//     } else {
//       setStationOptions(line?.stations?.map(st => ({ id: st.id, name: st.station_name })) || []);
//     }
//   };

//   const handleRequiredChange = (level: "l1" | "l2" | "l3" | "l4", value: string) => {
//     const num = Number(value) || 0;
//     setFormData(prev => {
//       const next = { ...prev, [`${level}_required`]: num };
//       next.operator_required_ctq =
//         (next.l1_required || 0) +
//         (next.l2_required || 0) +
//         (next.l3_required || 0) +
//         (next.l4_required || 0);
//       return next;
//     });
//   };

//   const handleEdit = (item: AdvanceSettingsData) => {
//     setFormData(item);
//     if (item.hq) handleHqChange(item.hq);
//     if (item.factory) handleFactoryChange(item.factory);
//     if (item.department) handleDepartmentChange(item.department);
//     if (item.line) handleLineChange(item.line);
//     if (item.subline) handleSublineChange(item.subline);
//     setActiveTab("add-data");
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.factory) return alert("Factory is required.");
//     if (!formData.line)   return alert("Line is required.");
//     if (!formData.month_year) return alert("Month/Year is required.");

//     const payload = frontendToApi(formData);

//     try {
//       const method = formData.id ? "PUT" : "POST";
//       const url = formData.id
//         ? `${API_BASE_URL}/advance-dashboard/${formData.id}/`
//         : `${API_BASE_URL}/advance-dashboard/`;

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const errText = await res.text();
//         throw new Error(errText || "Save failed");
//       }

//       const newApiData = await res.json();
//       const transformed = apiToFrontend(newApiData);

//       if (formData.id) {
//         setAdvanceSettingsData(prev => prev.map(i => i.id === formData.id ? transformed : i));
//       } else {
//         setAdvanceSettingsData(prev => [...prev, transformed]);
//       }

//       setFormData(initialFormData);
//       setActiveTab("data-list");
//       alert(formData.id ? "Updated successfully" : "Added successfully");
//     } catch (err: any) {
//       alert(`Error: ${err.message}`);
//     }
//   };

//   const handleDelete = async (id?: number) => {
//     if (!id || !window.confirm("Delete this record?")) return;
//     if (!window.confirm("This action cannot be undone. Continue?")) return;

//     try {
//       const res = await fetch(`${API_BASE_URL}/advance-dashboard/${id}/`, { method: "DELETE" });
//       if (!res.ok) throw new Error("Delete failed");
//       setAdvanceSettingsData(prev => prev.filter(item => item.id !== id));
//     } catch (err: any) {
//       alert(`Delete error: ${err.message}`);
//     }
//   };

//   const handleDownloadTemplate = () => {
//     window.location.href = `${API_BASE_URL}/advance-dashboard/download-template/`;
//   };

//   const handleExcelUpload = async () => {
//     if (!uploadFile) return;
//     setUploadLoading(true);

//     const form = new FormData();
//     form.append("file", uploadFile);

//     try {
//       const res = await fetch(`${API_BASE_URL}/advance-dashboard/upload-data/`, {
//         method: "POST",
//         body: form,
//       });

//       const result = await res.json();
//       if (!res.ok) throw new Error(result.error || "Upload failed");

//       alert(`Upload complete\nCreated: ${result.records_created || 0}\nUpdated: ${result.records_updated || 0}`);

//       const fresh = await (await fetch(`${API_BASE_URL}/advance-dashboard/`)).json();
//       setAdvanceSettingsData(fresh.map(apiToFrontend));
//       setActiveTab("data-list");
//     } catch (err: any) {
//       alert(`Upload failed: ${err.message}`);
//     } finally {
//       setUploadLoading(false);
//       setUploadFile(null);
//     }
//   };

//   const formatMonthYear = (my: string) => {
//     if (!my) return "—";
//     const [y, m] = my.split("-");
//     return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", {
//       month: "long",
//       year: "numeric",
//     });
//   };

//   const requestSort = (key: string) => {
//     let dir: "asc" | "desc" = "asc";
//     if (sortConfig?.key === key && sortConfig.direction === "asc") dir = "desc";
//     setSortConfig({ key, direction: dir });
//   };

//   const getSortValue = (item: AdvanceSettingsData, key: string) => {
//     switch (key) {
//       case "location":    return `${allFactoriesMap[item.factory || 0] || ""} ${allDepartmentsMap[item.department || 0] || ""}`;
//       case "line_station": return `${allLinesMap[item.line || 0] || ""} ${allSublinesMap[item.subline || 0] || ""}`;
//       case "period":      return item.month_year;
//       case "required":    return item.operator_required_ctq;
//       case "available":   return item.operator_availability_ctq;
//       default:            return (item as any)[key] ?? 0;
//     }
//   };

//   const sortedData = React.useMemo(() => {
//     if (!sortConfig) return advanceSettingsData;
//     return [...advanceSettingsData].sort((a, b) => {
//       const va = getSortValue(a, sortConfig.key);
//       const vb = getSortValue(b, sortConfig.key);
//       if (va < vb) return sortConfig.direction === "asc" ? -1 : 1;
//       if (va > vb) return sortConfig.direction === "asc" ? 1 : -1;
//       return 0;
//     });
//   }, [advanceSettingsData, sortConfig]);

//   if (loading) return <div className="p-12 text-center">Loading manpower data...</div>;

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-6">Manpower Planning Dashboard</h1>

//         {/* Tabs */}
//         <div className="flex flex-wrap gap-3 mb-8 border-b pb-4">
//           {[
//             { id: "overview",    label: "Overview",    icon: BarChart3 },
//             { id: "add-data",    label: "Add / Edit",  icon: Plus },
//             { id: "upload",      label: "Bulk Upload", icon: Upload },
//             { id: "data-list",   label: "Records",     icon: FileSpreadsheet },
//           ].map(t => (
//             <button
//               key={t.id}
//               onClick={() => setActiveTab(t.id)}
//               className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all ${
//                 activeTab === t.id
//                   ? "bg-blue-600 text-white shadow-md"
//                   : "bg-white text-gray-700 hover:bg-gray-100 border"
//               }`}
//             >
//               <t.icon size={18} />
//               {t.label}
//             </button>
//           ))}
//         </div>

//         {/* ──────────────────────────────────────────────── */}
//         {/* Overview Tab */}
//         {/* ──────────────────────────────────────────────── */}
//         {activeTab === "overview" && (
//           <div className="space-y-8">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
//                 <div>
//                   <p className="text-sm text-gray-500">Total Records</p>
//                   <p className="text-3xl font-bold">{advanceSettingsData.length}</p>
//                 </div>
//                 <FileSpreadsheet className="text-blue-500" size={32} />
//               </div>
//               <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
//                 <div>
//                   <p className="text-sm text-gray-500">Total Operators Required</p>
//                   <p className="text-3xl font-bold">
//                     {advanceSettingsData.reduce((s, i) => s + i.operator_required_ctq, 0)}
//                   </p>
//                 </div>
//                 <Users className="text-green-500" size={32} />
//               </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
//               <div className="space-y-3">
//                 {advanceSettingsData.slice(-5).reverse().map(item => (
//                   <div key={item.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
//                     <Calendar className="text-blue-500 mr-3" size={20} />
//                     <div className="flex-1">
//                       <p className="font-medium">{formatMonthYear(item.month_year)}</p>
//                       <p className="text-sm text-gray-600">
//                         {allFactoriesMap[item.factory || 0] || "—"} • {allDepartmentsMap[item.department || 0] || "—"}
//                       </p>
//                     </div>
//                     <div className="font-bold">{item.operator_required_ctq} ops</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ──────────────────────────────────────────────── */}
//         {/* Add / Edit Form */}
//         {/* ──────────────────────────────────────────────── */}
//         {activeTab === "add-data" && (
//           <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
//             <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
//               <Plus className="text-blue-600" size={24} />
//               {formData.id ? "Edit Entry" : "Add New Entry"}
//             </h2>

//             <form onSubmit={handleSubmit} className="space-y-8">
//               {/* Location */}
//               <div className="bg-gray-50 p-6 rounded-xl">
//                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                   <Building size={20} className="text-blue-600" /> Location
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5">Headquarters</label>
//                     <select
//                       value={formData.hq ?? ""}
//                       onChange={e => handleHqChange(e.target.value ? Number(e.target.value) : null)}
//                       className="w-full border rounded-lg px-4 py-2"
//                     >
//                       <option value="">Select HQ</option>
//                       {hqOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1.5">
//                       Factory <span className="text-red-600">*</span>
//                     </label>
//                     <select
//                       value={formData.factory ?? ""}
//                       onChange={e => handleFactoryChange(e.target.value ? Number(e.target.value) : null)}
//                       disabled={!formData.hq}
//                       className="w-full border rounded-lg px-4 py-2 disabled:opacity-60"
//                     >
//                       <option value="">Select Factory</option>
//                       {factoryOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1.5">Department</label>
//                     <select
//                       value={formData.department ?? ""}
//                       onChange={e => handleDepartmentChange(e.target.value ? Number(e.target.value) : null)}
//                       disabled={!formData.factory}
//                       className="w-full border rounded-lg px-4 py-2 disabled:opacity-60"
//                     >
//                       <option value="">All Departments</option>
//                       {departmentOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Line / Subline */}
//               <div className="bg-gray-50 p-6 rounded-xl">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5">
//                       Line <span className="text-red-600">*</span>
//                     </label>
//                     <select
//                       value={formData.line ?? ""}
//                       onChange={e => handleLineChange(e.target.value ? Number(e.target.value) : null)}
//                       disabled={!formData.department}
//                       className="w-full border rounded-lg px-4 py-2 disabled:opacity-60"
//                     >
//                       <option value="">Select Line</option>
//                       {lineOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
//                     </select>
//                   </div>

//                   {sublineOptions.length > 0 && (
//                     <div>
//                       <label className="block text-sm font-medium mb-1.5">Subline</label>
//                       <select
//                         value={formData.subline ?? ""}
//                         onChange={e => handleSublineChange(e.target.value ? Number(e.target.value) : null)}
//                         className="w-full border rounded-lg px-4 py-2"
//                       >
//                         <option value="">Select Subline</option>
//                         {sublineOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
//                       </select>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* General Metrics */}
//               <div className="bg-gray-50 p-6 rounded-xl">
//                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                   <BarChart3 size={20} className="text-green-600" /> General Metrics
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5">
//                       Month/Year <span className="text-red-600">*</span>
//                     </label>
//                     <input
//                       type="month"
//                       value={formData.month_year}
//                       onChange={e => setFormData(p => ({ ...p, month_year: e.target.value }))}
//                       className="w-full border rounded-lg px-4 py-2"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5">Total Stations</label>
//                     <input
//                       type="number" min="0"
//                       value={formData.total_stations_ctq}
//                       onChange={e => setFormData(p => ({ ...p, total_stations_ctq: +e.target.value }))}
//                       className="w-full border rounded-lg px-4 py-2"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5">Attrition (%)</label>
//                     <input
//                       type="number" step="0.01" min="0"
//                       value={formData.attrition_trend_ctq}
//                       onChange={e => setFormData(p => ({ ...p, attrition_trend_ctq: +e.target.value }))}
//                       className="w-full border rounded-lg px-4 py-2"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5">Absenteeism (%)</label>
//                     <input
//                       type="number" step="0.01" min="0"
//                       value={formData.absentee_trend_ctq}
//                       onChange={e => setFormData(p => ({ ...p, absentee_trend_ctq: +e.target.value }))}
//                       className="w-full border rounded-lg px-4 py-2"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5">OET Attrition (%)</label>
//                     <input
//                       type="number" step="0.01" min="0"
//                       value={formData.oet_attrition_ctq}
//                       onChange={e => setFormData(p => ({ ...p, oet_attrition_ctq: +e.target.value }))}
//                       className="w-full border rounded-lg px-4 py-2"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5">Associate Attrition (%)</label>
//                     <input
//                       type="number" step="0.01" min="0"
//                       value={formData.associate_attrition_ctq}
//                       onChange={e => setFormData(p => ({ ...p, associate_attrition_ctq: +e.target.value }))}
//                       className="w-full border rounded-lg px-4 py-2"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5">Total Operators Required</label>
//                     <input
//                       type="number"
//                       readOnly
//                       value={formData.operator_required_ctq}
//                       className="w-full px-4 py-2 border bg-gray-100 cursor-not-allowed rounded-lg"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5">Total Operators Available</label>
//                     <input
//                       type="number" min="0"
//                       value={formData.operator_availability_ctq}
//                       onChange={e => setFormData(p => ({ ...p, operator_availability_ctq: +e.target.value }))}
//                       className="w-full border px-4 py-2 rounded-lg bg-blue-50/30"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Skill Levels */}
//               <div className="bg-gray-50 p-6 rounded-xl">
//                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                   <Layers size={20} className="text-orange-600" /> Skill Levels
//                 </h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                   {["l1", "l2", "l3", "l4"].map(lvl => (
//                     <div key={lvl} className="space-y-3">
//                       <h4 className="font-bold text-center uppercase text-gray-700">{lvl.toUpperCase()}</h4>
//                       <div>
//                         <label className="block text-xs text-gray-500 mb-1">Required</label>
//                         <input
//                           type="number" min="0"
//                           value={formData[`${lvl}_required` as keyof AdvanceSettingsData]}
//                           onChange={e => handleRequiredChange(lvl as any, e.target.value)}
//                           className="w-full border rounded px-3 py-1.5"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-xs text-gray-500 mb-1">Available</label>
//                         <input
//                           type="number" min="0"
//                           value={formData[`${lvl}_available` as keyof AdvanceSettingsData]}
//                           onChange={e => setFormData(p => ({ ...p, [`${lvl}_available`]: +e.target.value }))}
//                           className="w-full border rounded px-3 py-1.5"
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex justify-end gap-4 pt-4">
//                 {formData.id && (
//                   <button
//                     type="button"
//                     onClick={() => { setFormData(initialFormData); setActiveTab("data-list"); }}
//                     className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg"
//                   >
//                     Cancel
//                   </button>
//                 )}
//                 <button
//                   type="submit"
//                   className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                 >
//                   {formData.id ? "Update Entry" : "Save Entry"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}

//         {/* ──────────────────────────────────────────────── */}
//         {/* Bulk Upload Tab */}
//         {/* ──────────────────────────────────────────────── */}
//         {activeTab === "upload" && (
//           <div className="bg-white rounded-xl shadow-sm border p-8 max-w-3xl mx-auto text-center">
//             <h2 className="text-2xl font-bold mb-3">Bulk Upload Data</h2>
//             <p className="text-gray-600 mb-8">Download template → fill → upload</p>

//             <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 mb-10">
//               <h4 className="font-bold text-blue-800 mb-4 flex items-center justify-center gap-2">
//                 <FileSpreadsheet size={20} /> Step 1: Download Template
//               </h4>
//               <button
//                 onClick={handleDownloadTemplate}
//                 className="px-6 py-2.5 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 flex items-center gap-2 mx-auto"
//               >
//                 <Download size={18} /> Download Template.xlsx
//               </button>
//             </div>

//             <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 bg-gray-50 hover:bg-gray-100 transition">
//               <h4 className="font-bold mb-4">Step 2: Upload Filled File</h4>
//               <input
//                 type="file"
//                 accept=".xlsx,.xls"
//                 onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
//                 className="mb-6 text-sm file:mr-4 file:py-2 file:px-5 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
//               />
//               {uploadFile && (
//                 <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full mb-6">
//                   <CheckCircle size={18} /> {uploadFile.name}
//                 </div>
//               )}
//               <button
//                 onClick={handleExcelUpload}
//                 disabled={!uploadFile || uploadLoading}
//                 className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
//               >
//                 {uploadLoading ? (
//                   <>
//                     <Loader2 className="animate-spin" size={20} /> Uploading...
//                   </>
//                 ) : (
//                   <>
//                     <Upload size={20} /> Upload Excel
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ──────────────────────────────────────────────── */}
//         {/* Data List / Records Tab */}
//         {/* ──────────────────────────────────────────────── */}
//         {activeTab === "data-list" && (
//           <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => requestSort("location")}>
//                       Location {sortConfig?.key === "location" && (sortConfig.direction === "asc" ? <ArrowUp className="inline" size={14} /> : <ArrowDown className="inline" size={14} />)}
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => requestSort("line_station")}>
//                       Line {sortConfig?.key === "line_station" && (sortConfig.direction === "asc" ? <ArrowUp className="inline" size={14} /> : <ArrowDown className="inline" size={14} />)}
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => requestSort("period")}>
//                       Period {sortConfig?.key === "period" && (sortConfig.direction === "asc" ? <ArrowUp className="inline" size={14} /> : <ArrowDown className="inline" size={14} />)}
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => requestSort("required")}>
//                       Req / Avail {sortConfig?.key === "required" && (sortConfig.direction === "asc" ? <ArrowUp className="inline" size={14} /> : <ArrowDown className="inline" size={14} />)}
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attrition Rates</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill Gaps</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {sortedData.map(item => (
//                     <tr key={item.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4">
//                         <div className="font-medium">{allFactoriesMap[item.factory || 0] || "—"}</div>
//                         <div className="text-sm text-gray-500">{allDepartmentsMap[item.department || 0] || "—"}</div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="font-medium">{allLinesMap[item.line || 0] || "—"}</div>
//                         <div className="text-sm text-gray-500">{allSublinesMap[item.subline || 0] || ""}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {formatMonthYear(item.month_year)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="font-bold text-blue-700">R: {item.operator_required_ctq}</span>
//                         <span className="ml-3 font-bold text-green-700">A: {item.operator_availability_ctq}</span>
//                       </td>
//                       <td className="px-6 py-4 text-sm">
//                         Attr: {item.attrition_trend_ctq.toFixed(2)}%<br />
//                         Abs: {item.absentee_trend_ctq.toFixed(2)}%<br />
//                         OET: {item.oet_attrition_ctq.toFixed(2)}%<br />
//                         Assoc: {item.associate_attrition_ctq.toFixed(2)}%
//                       </td>
//                       <td className="px-6 py-4 text-sm">
//                         <div className="grid grid-cols-4 gap-1">
//                           {["l1", "l2", "l3", "l4"].map(lvl => {
//                             const req = item[`${lvl}_required` as keyof AdvanceSettingsData] as number;
//                             const ava = item[`${lvl}_available` as keyof AdvanceSettingsData] as number;
//                             const gap = req - ava;
//                             return (
//                               <div key={lvl}>
//                                 {lvl.toUpperCase()}:{" "}
//                                 <span className={gap > 0 ? "text-red-600" : gap < 0 ? "text-green-600" : ""}>
//                                   {gap > 0 ? `-${gap}` : gap}
//                                 </span>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900 mr-3">
//                           <Edit size={18} />
//                         </button>
//                         <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
//                           <Trash2 size={18} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdvanceSettings;



import React, { useState, useEffect } from "react";
import {
  Upload, Plus, Trash2, FileSpreadsheet, Users,
  Calendar, BarChart3, Building, Layers, CheckCircle, Loader2, Download,
  Edit, ArrowUp, ArrowDown, TrendingDown, TrendingUp, RefreshCw
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

interface AdvanceSettingsData {
  id?: number;
  hq: number | null;
  factory: number | null;
  department: number | null;
  line: number | null;
  subline: number | null;
  station: number | null;
  month_year: string;
  total_stations_ctq: number;
  operator_required_ctq: number;
  operator_availability_ctq: number;
  buffer_manpower_required_ctq: number;
  buffer_manpower_availability_ctq: number;
  attrition_trend_ctq: number;
  absentee_trend_ctq: number;
  oet_attrition_ctq: number;
  associate_attrition_ctq: number;
  l1_required: number; l1_available: number;
  l2_required: number; l2_available: number;
  l3_required: number; l3_available: number;
  l4_required: number; l4_available: number;
}

interface ApiAdvanceManpowerData {
  id: number;
  hq: number | null;
  factory: number;
  department: number | null;
  line: number | null;
  subline: number | null;
  station: number | null;
  month: number;
  year: number;
  total_stations: number;
  operators_required: number;
  operators_available: number;
  buffer_manpower_required: number;
  buffer_manpower_available: number;
  l1_required: number; l1_available: number;
  l2_required: number; l2_available: number;
  l3_required: number; l3_available: number;
  l4_required: number; l4_available: number;
  attrition_rate: string;
  absenteeism_rate: string;
  oet_attrition: string;
  associate_attrition: string;
}

// ── Attrition interfaces ──
interface AttritionRecord {
  id?: number;
  date: string;       // "YYYY-MM-DD"
  oet: number;
  associate: number;
  overall: number;
  month_name?: string;
}

interface FySummary {
  financial_year: string;
  fy_start: string;
  fy_end: string;
  total_months: number;
  total_oet: number;
  total_associate: number;
  total_overall: number;
  avg_oet: number;
  avg_associate: number;
  avg_overall: number;
  monthly_data: AttritionRecord[];
}

interface StationNode { id: number; station_name: string; }
interface SublineNode { id: number; subline_name: string; stations?: StationNode[]; }
interface LineNode {
  id: number;
  line_name: string;
  sublines?: SublineNode[];
  stations?: StationNode[];
}
interface DepartmentNode { id: number; department_name: string; lines?: LineNode[]; }
interface HierarchyStructure {
  hq: number; hq_name: string;
  factory: number; factory_name: string;
  structure_data: { departments: DepartmentNode[]; };
}
interface DropdownOption { id: number; name: string; }

const apiToFrontend = (apiData: ApiAdvanceManpowerData): AdvanceSettingsData => ({
  id: apiData.id,
  hq: apiData.hq,
  factory: apiData.factory,
  department: apiData.department,
  line: apiData.line,
  subline: apiData.subline,
  station: apiData.station,
  month_year: `${apiData.year}-${String(apiData.month).padStart(2, '0')}`,
  total_stations_ctq: apiData.total_stations,
  operator_required_ctq: apiData.operators_required,
  operator_availability_ctq: apiData.operators_available,
  buffer_manpower_required_ctq: apiData.buffer_manpower_required,
  buffer_manpower_availability_ctq: apiData.buffer_manpower_available,
  l1_required: apiData.l1_required,
  l1_available: apiData.l1_available,
  l2_required: apiData.l2_required,
  l2_available: apiData.l2_available,
  l3_required: apiData.l3_required,
  l3_available: apiData.l3_available,
  l4_required: apiData.l4_required,
  l4_available: apiData.l4_available,
  attrition_trend_ctq: parseFloat(apiData.attrition_rate || "0"),
  absentee_trend_ctq: parseFloat(apiData.absenteeism_rate || "0"),
  oet_attrition_ctq: parseFloat(apiData.oet_attrition || "0"),
  associate_attrition_ctq: parseFloat(apiData.associate_attrition || "0"),
});

const frontendToApi = (formData: AdvanceSettingsData) => {
  const [yearStr, monthStr] = formData.month_year.split('-');
  return {
    hq: formData.hq,
    factory: formData.factory,
    department: formData.department,
    line: formData.line,
    subline: formData.subline,
    station: formData.station,
    year: parseInt(yearStr),
    month: parseInt(monthStr),
    total_stations: formData.total_stations_ctq,
    operators_required: formData.operator_required_ctq,
    operators_available: formData.operator_availability_ctq,
    buffer_manpower_required: formData.buffer_manpower_required_ctq,
    buffer_manpower_available: formData.buffer_manpower_availability_ctq,
    l1_required: formData.l1_required,
    l1_available: formData.l1_available,
    l2_required: formData.l2_required,
    l2_available: formData.l2_available,
    l3_required: formData.l3_required,
    l3_available: formData.l3_available,
    l4_required: formData.l4_required,
    l4_available: formData.l4_available,
    attrition_rate: formData.attrition_trend_ctq.toFixed(2),
    absenteeism_rate: formData.absentee_trend_ctq.toFixed(2),
    oet_attrition: formData.oet_attrition_ctq.toFixed(2),
    associate_attrition: formData.associate_attrition_ctq.toFixed(2),
  };
};

// ════════════════════════════════════════════════
// Attrition Sub-component
// ════════════════════════════════════════════════
const AttritionSection: React.FC = () => {
  const [attritionList, setAttritionList] = useState<AttritionRecord[]>([]);
  const [availableFYs, setAvailableFYs] = useState<string[]>([]);
  const [selectedFY, setSelectedFY] = useState<string>("");
  const [fySummary, setFySummary] = useState<FySummary | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [attritionTab, setAttritionTab] = useState<"list" | "add" | "summary">("list");
  const [editingRecord, setEditingRecord] = useState<AttritionRecord | null>(null);

  const emptyForm: AttritionRecord = {
    date: new Date().toISOString().slice(0, 10),
    oet: 0,
    associate: 0,
    overall: 0,
  };
  const [attrForm, setAttrForm] = useState<AttritionRecord>(emptyForm);

  // ── Load attrition list & available FYs on mount ──
  useEffect(() => {
    fetchAttritionList();
    fetchAvailableFYs();
  }, []);

  const fetchAttritionList = async (fy?: string) => {
    setLoadingList(true);
    try {
      const url = fy
        ? `${API_BASE_URL}/attrition/?fy=${fy}`
        : `${API_BASE_URL}/attrition/`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch attrition records");
      const data: AttritionRecord[] = await res.json();
      setAttritionList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchAvailableFYs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/attrition/available-fy/`);
      if (!res.ok) return;
      const data: string[] = await res.json();
      setAvailableFYs(data);
      if (data.length > 0) setSelectedFY(data[data.length - 1]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFySummary = async (fy: string) => {
    if (!fy) return;
    setLoadingSummary(true);
    try {
      const res = await fetch(`${API_BASE_URL}/attrition/fy-summary/?fy=${fy}`);
      if (!res.ok) throw new Error("No data for this FY");
      const data: FySummary = await res.json();
      setFySummary(data);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      setFySummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleAttritionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // try {
    //   const payload = { ...attrForm, overall: attrForm.oet + attrForm.associate };
    //   const isEdit = !!attrForm.id;
    try {
        const roundedOverall =
  Math.round((attrForm.oet + attrForm.associate) * 100) / 100;

const payload = {
  ...attrForm,
  oet: Math.round(attrForm.oet * 100) / 100,
  associate: Math.round(attrForm.associate * 100) / 100,
  overall: roundedOverall,
};
      const isEdit = !!attrForm.id;

      // ── Restrict: one record per month ──
      const selectedMonth = attrForm.date.slice(0, 7); // "YYYY-MM"
      const duplicate = attritionList.find(r => {
        if (isEdit && r.id === attrForm.id) return false; // skip self on edit
        return r.date.slice(0, 7) === selectedMonth;
      });
      if (duplicate) {
        const existingLabel = new Date(duplicate.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
        alert(`A record for ${existingLabel} already exists. Only one entry per month is allowed.`);
        return;
      }
      const url = isEdit
        ? `${API_BASE_URL}/attrition/${attrForm.id}/`
        : `${API_BASE_URL}/attrition/`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify(attrForm),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Save failed");
      }
      alert(isEdit ? "Updated successfully" : "Added successfully");
      setAttrForm(emptyForm);
      setEditingRecord(null);
      fetchAttritionList(selectedFY || undefined);
      fetchAvailableFYs();
      setAttritionTab("list");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAttritionEdit = (record: AttritionRecord) => {
    setAttrForm(record);
    setEditingRecord(record);
    setAttritionTab("add");
  };

  const handleAttritionDelete = async (id?: number) => {
    if (!id || !window.confirm("Delete this attrition record?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/attrition/${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setAttritionList(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleFYChange = (fy: string) => {
    setSelectedFY(fy);
    fetchAttritionList(fy || undefined);
  };
const overall =
  Math.round(
    (Number(attrForm.oet) + Number(attrForm.associate)) * 100
  ) / 100;
  return (
    <div className="bg-white rounded-xl shadow-sm border mt-10">
      {/* Header */}
      <div className="px-6 py-5 border-b flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <TrendingDown size={22} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Attrition Records</h2>
            <p className="text-sm text-gray-500">Track monthly OET, associate & overall attrition</p>
          </div>
        </div>

        {/* FY Filter */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Financial Year:</label>
          <select
            value={selectedFY}
            onChange={e => handleFYChange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Years</option>
            {availableFYs.map(fy => (
              <option key={fy} value={fy}>{fy}</option>
            ))}
          </select>
          <button
            onClick={() => fetchAttritionList(selectedFY || undefined)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 px-6 pt-4">
        {[
          { id: "list",    label: "Records",     icon: FileSpreadsheet },
          { id: "add",     label: editingRecord ? "Edit Entry" : "Add Entry", icon: Plus },
          { id: "summary", label: "FY Summary",  icon: BarChart3 },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => {
              if (t.id !== "add") {
                setEditingRecord(null);
                setAttrForm(emptyForm);
              }
              if (t.id === "summary" && selectedFY) fetchFySummary(selectedFY);
              setAttritionTab(t.id as any);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${
              attritionTab === t.id
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 border"
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* ── Records Table ── */}
        {attritionTab === "list" && (
          <>
            {loadingList ? (
              <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                <Loader2 className="animate-spin" size={20} /> Loading records...
              </div>
            ) : attritionList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <TrendingDown size={40} className="mx-auto mb-3 opacity-30" />
                <p>No attrition records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Month / Year", "OET Attrition", "Associate Attrition", "Overall Attrition", "Actions"].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attritionList.map(record => {
                      const date = new Date(record.date);
                      const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                      return (
                        <tr key={record.id} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3 font-medium text-gray-800">{label}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              record.oet > 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                            }`}>
                              {record.oet > 5 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {record.oet}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              record.associate > 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                            }`}>
                              {record.associate > 5 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {record.associate}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              record.overall > 5 ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {record.overall > 5 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {record.overall}
                            </span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <button
                              onClick={() => handleAttritionEdit(record)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleAttritionDelete(record.id)}
                              className="text-red-500 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── Add / Edit Form ── */}
        {attritionTab === "add" && (
          <form onSubmit={handleAttritionSubmit} className="max-w-lg mx-auto space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingDown size={20} className="text-red-600" />
              {editingRecord ? "Edit Attrition Record" : "Add Attrition Record"}
            </h3>

            <div className="bg-gray-50 rounded-xl p-6 space-y-5">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={attrForm.date}
                  onChange={e => setAttrForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
                <p className="text-xs text-gray-400 mt-1">Use the 1st of the month (e.g. 2024-04-01 for April 2024)</p>
              </div>

              {/* OET */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">OET Attrition %</label>
                <input
                  type="number"
                
                  value={attrForm.oet}
                  onChange={e => setAttrForm(p => ({ ...p, oet: +e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>

              {/* Associate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Associate Attrition %</label>
                <input
                  type="number"
                 
                  value={attrForm.associate}
                  onChange={e => setAttrForm(p => ({ ...p, associate: +e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>

              {/* Overall */}
            {/* Overall — auto-calculated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Overall Attrition 
                  <span className="ml-2 text-xs font-normal text-gray-400">(OET + Associate)</span>
                </label>
                {/* <input
                  type="number"
                  readOnly
                  // value={attrForm.oet + attrForm.associate}
                  // value={Number(attrForm.oet) + Number(attrForm.associate)}
                  // value={(Number(attrForm.oet) + Number(attrForm.associate)).toFixed(2)}

                  className="w-full border rounded-lg px-4 py-2.5 bg-gray-100 cursor-not-allowed text-gray-600"
                /> */}
                <input
  type="number"
  readOnly
  value={overall}
  className="w-full border rounded-lg px-4 py-2.5 bg-gray-100 cursor-not-allowed text-gray-600"
/>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              {editingRecord && (
                <button
                  type="button"
                  onClick={() => {
                    setAttrForm(emptyForm);
                    setEditingRecord(null);
                    setAttritionTab("list");
                  }}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-7 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                {editingRecord ? "Update Record" : "Save Record"}
              </button>
            </div>
          </form>
        )}

        {/* ── FY Summary ── */}
        {attritionTab === "summary" && (
          <div className="space-y-6">
            {/* FY Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Select Financial Year:</label>
              <select
                value={selectedFY}
                onChange={e => {
                  setSelectedFY(e.target.value);
                  if (e.target.value) fetchFySummary(e.target.value);
                }}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">-- Select FY --</option>
                {availableFYs.map(fy => (
                  <option key={fy} value={fy}>{fy}</option>
                ))}
              </select>
              {selectedFY && (
                <button
                  onClick={() => fetchFySummary(selectedFY)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-1.5"
                >
                  <BarChart3 size={15} /> Load Summary
                </button>
              )}
            </div>

            {loadingSummary && (
              <div className="flex items-center justify-center py-12 gap-2 text-gray-500">
                <Loader2 className="animate-spin" size={20} /> Loading summary...
              </div>
            )}

            {fySummary && !loadingSummary && (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    {
                      label: "OET Attrition",
                      total: fySummary.total_oet,
                      avg: fySummary.avg_oet,
                      color: "blue",
                    },
                    {
                      label: "Associate Attrition",
                      total: fySummary.total_associate,
                      avg: fySummary.avg_associate,
                      color: "purple",
                    },
                    {
                      label: "Overall Attrition",
                      total: fySummary.total_overall,
                      avg: fySummary.avg_overall,
                      color: "red",
                    },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      className={`bg-${stat.color}-50 border border-${stat.color}-100 rounded-xl p-5`}
                    >
                      <p className={`text-sm font-medium text-${stat.color}-600 mb-2`}>{stat.label}</p>
                      <p className={`text-3xl font-bold text-${stat.color}-800`}>{stat.total}</p>
                      <p className={`text-sm text-${stat.color}-500 mt-1`}>
                        Avg / month: <strong>{stat.avg}</strong>
                      </p>
                    </div>
                  ))}
                </div>

                {/* Summary info */}
                <div className="flex gap-6 text-sm text-gray-600 bg-gray-50 rounded-xl px-5 py-4">
                  <span>📅 FY: <strong>{fySummary.financial_year}</strong></span>
                  <span>🗓 {fySummary.fy_start} → {fySummary.fy_end}</span>
                  <span>📊 Months with data: <strong>{fySummary.total_months}</strong></span>
                </div>

                {/* Monthly breakdown table */}
                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-3">Monthly Breakdown</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {["Month", "OET", "Associate", "Overall"].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {fySummary.monthly_data.map(r => (
                          <tr key={r.id} className="hover:bg-gray-50">
                            <td className="px-5 py-3 font-medium">{r.month_name || new Date(r.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${r.oet > 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                {r.oet}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${r.associate > 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                {r.associate}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${r.overall > 5 ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                                {r.overall}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {!fySummary && !loadingSummary && (
              <div className="text-center py-12 text-gray-400">
                <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
                <p>Select a financial year and click "Load Summary".</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════
const AdvanceSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [advanceSettingsData, setAdvanceSettingsData] = useState<AdvanceSettingsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullHierarchy, setFullHierarchy] = useState<HierarchyStructure[]>([]);
  const [hqOptions, setHqOptions] = useState<DropdownOption[]>([]);
  const [factoryOptions, setFactoryOptions] = useState<DropdownOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<DropdownOption[]>([]);
  const [lineOptions, setLineOptions] = useState<DropdownOption[]>([]);
  const [sublineOptions, setSublineOptions] = useState<DropdownOption[]>([]);
  const [stationOptions, setStationOptions] = useState<DropdownOption[]>([]);
  const [allHqsMap, setAllHqsMap] = useState<Record<number, string>>({});
  const [allFactoriesMap, setAllFactoriesMap] = useState<Record<number, string>>({});
  const [allDepartmentsMap, setAllDepartmentsMap] = useState<Record<number, string>>({});
  const [allLinesMap, setAllLinesMap] = useState<Record<number, string>>({});
  const [allSublinesMap, setAllSublinesMap] = useState<Record<number, string>>({});
  const [allStationsMap, setAllStationsMap] = useState<Record<number, string>>({});
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const initialFormData: AdvanceSettingsData = {
    id: undefined,
    hq: null, factory: null, department: null,
    line: null, subline: null, station: null,
    month_year: new Date().toISOString().slice(0, 7),
    total_stations_ctq: 0,
    operator_required_ctq: 0,
    operator_availability_ctq: 0,
    buffer_manpower_required_ctq: 0,
    buffer_manpower_availability_ctq: 0,
    l1_required: 0, l1_available: 0,
    l2_required: 0, l2_available: 0,
    l3_required: 0, l3_available: 0,
    l4_required: 0, l4_available: 0,
    attrition_trend_ctq: 0.00,
    absentee_trend_ctq: 0.00,
    oet_attrition_ctq: 0.00,
    associate_attrition_ctq: 0.00,
  };

  const [formData, setFormData] = useState<AdvanceSettingsData>(initialFormData);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  // ────────────────────────────────────────────────
  // Load initial data
  // ────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, hierarchyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/advance-dashboard/`),
          fetch(`${API_BASE_URL}/hierarchy-simple/`)
        ]);

        if (!dashboardRes.ok || !hierarchyRes.ok) throw new Error("Failed to fetch data");

        const dashboardJson: ApiAdvanceManpowerData[] = await dashboardRes.json();
        const hierarchyJson: HierarchyStructure[] = await hierarchyRes.json();

        setAdvanceSettingsData(dashboardJson.map(apiToFrontend));
        setFullHierarchy(hierarchyJson);

        const hMap: Record<number, string> = {};
        const fMap: Record<number, string> = {};
        const dMap: Record<number, string> = {};
        const lMap: Record<number, string> = {};
        const slMap: Record<number, string> = {};
        const stMap: Record<number, string> = {};
        const uniqueHqs = new Map<number, string>();

        hierarchyJson.forEach(item => {
          if (item.hq) {
            hMap[item.hq] = item.hq_name;
            uniqueHqs.set(item.hq, item.hq_name);
          }
          fMap[item.factory] = item.factory_name;
          item.structure_data.departments.forEach(dept => {
            dMap[dept.id] = dept.department_name;
            dept.lines?.forEach(line => {
              lMap[line.id] = line.line_name;
              line.stations?.forEach(stn => { stMap[stn.id] = stn.station_name; });
              line.sublines?.forEach(sub => {
                slMap[sub.id] = sub.subline_name;
                sub.stations?.forEach(stn => { stMap[stn.id] = stn.station_name; });
              });
            });
          });
        });

        setHqOptions(Array.from(uniqueHqs, ([id, name]) => ({ id, name })));
        setAllHqsMap(hMap);
        setAllFactoriesMap(fMap);
        setAllDepartmentsMap(dMap);
        setAllLinesMap(lMap);
        setAllSublinesMap(slMap);
        setAllStationsMap(stMap);
      } catch (err) {
        console.error("Data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ────────────────────────────────────────────────
  // Cascading dropdown logic
  // ────────────────────────────────────────────────
  const handleHqChange = (hqId: number | null) => {
    setFormData(p => ({ ...p, hq: hqId, factory: null, department: null, line: null, subline: null, station: null }));
    if (!hqId) { setFactoryOptions([]); return; }
    const filtered = fullHierarchy.filter(item => item.hq === hqId);
    const uniqueFacs = [...new Map(filtered.map(item => [item.factory, { id: item.factory, name: item.factory_name }])).values()];
    setFactoryOptions(uniqueFacs);
    setDepartmentOptions([]); setLineOptions([]); setSublineOptions([]); setStationOptions([]);
  };

  const handleFactoryChange = (factoryId: number | null) => {
    setFormData(p => ({ ...p, factory: factoryId, department: null, line: null, subline: null, station: null }));
    if (!factoryId || !formData.hq) { setDepartmentOptions([]); return; }
    const structure = fullHierarchy.find(item => item.factory === factoryId && item.hq === formData.hq);
    setDepartmentOptions(structure?.structure_data.departments.map(d => ({ id: d.id, name: d.department_name })) || []);
    setLineOptions([]); setSublineOptions([]); setStationOptions([]);
  };

  const handleDepartmentChange = (deptId: number | null) => {
    setFormData(p => ({ ...p, department: deptId, line: null, subline: null, station: null }));
    if (!deptId || !formData.factory) { setLineOptions([]); return; }
    const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
    const dept = structure?.structure_data.departments.find(d => d.id === deptId);
    setLineOptions(dept?.lines?.map(l => ({ id: l.id, name: l.line_name })) || []);
    setSublineOptions([]); setStationOptions([]);
  };

  const handleLineChange = (lineId: number | null) => {
    setFormData(p => ({ ...p, line: lineId, subline: null, station: null }));
    if (!lineId || !formData.department) { setSublineOptions([]); setStationOptions([]); return; }
    const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
    const dept = structure?.structure_data.departments.find(d => d.id === formData.department);
    const line = dept?.lines?.find(l => l.id === lineId);
    setSublineOptions(line?.sublines?.map(sl => ({ id: sl.id, name: sl.subline_name })) || []);
    setStationOptions(line?.stations?.map(st => ({ id: st.id, name: st.station_name })) || []);
  };

  const handleSublineChange = (sublineId: number | null) => {
    setFormData(p => ({ ...p, subline: sublineId, station: null }));
    if (!formData.line) return;
    const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
    const dept = structure?.structure_data.departments.find(d => d.id === formData.department);
    const line = dept?.lines?.find(l => l.id === formData.line);
    if (sublineId) {
      const sub = line?.sublines?.find(s => s.id === sublineId);
      setStationOptions(sub?.stations?.map(st => ({ id: st.id, name: st.station_name })) || []);
    } else {
      setStationOptions(line?.stations?.map(st => ({ id: st.id, name: st.station_name })) || []);
    }
  };

  const handleRequiredChange = (level: "l1" | "l2" | "l3" | "l4", value: string) => {
    const num = Number(value) || 0;
    setFormData(prev => {
      const next = { ...prev, [`${level}_required`]: num };
      next.operator_required_ctq =
        (next.l1_required || 0) +
        (next.l2_required || 0) +
        (next.l3_required || 0) +
        (next.l4_required || 0);
      return next;
    });
  };

  const handleEdit = (item: AdvanceSettingsData) => {
    setFormData(item);
    if (item.hq) handleHqChange(item.hq);
    if (item.factory) handleFactoryChange(item.factory);
    if (item.department) handleDepartmentChange(item.department);
    if (item.line) handleLineChange(item.line);
    if (item.subline) handleSublineChange(item.subline);
    setActiveTab("add-data");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.factory) return alert("Factory is required.");
    if (!formData.line) return alert("Line is required.");
    if (!formData.month_year) return alert("Month/Year is required.");

    const payload = frontendToApi(formData);
    try {
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id
        ? `${API_BASE_URL}/advance-dashboard/${formData.id}/`
        : `${API_BASE_URL}/advance-dashboard/`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Save failed");
      }
      const newApiData = await res.json();
      const transformed = apiToFrontend(newApiData);
      if (formData.id) {
        setAdvanceSettingsData(prev => prev.map(i => i.id === formData.id ? transformed : i));
      } else {
        setAdvanceSettingsData(prev => [...prev, transformed]);
      }
      setFormData(initialFormData);
      setActiveTab("data-list");
      alert(formData.id ? "Updated successfully" : "Added successfully");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm("Delete this record?")) return;
    if (!window.confirm("This action cannot be undone. Continue?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/advance-dashboard/${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setAdvanceSettingsData(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = `${API_BASE_URL}/advance-dashboard/download-template/`;
  };

  const handleExcelUpload = async () => {
    if (!uploadFile) return;
    setUploadLoading(true);
    const form = new FormData();
    form.append("file", uploadFile);
    try {
      const res = await fetch(`${API_BASE_URL}/advance-dashboard/upload-data/`, {
        method: "POST",
        body: form,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");
      alert(`Upload complete\nCreated: ${result.records_created || 0}\nUpdated: ${result.records_updated || 0}`);
      const fresh = await (await fetch(`${API_BASE_URL}/advance-dashboard/`)).json();
      setAdvanceSettingsData(fresh.map(apiToFrontend));
      setActiveTab("data-list");
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploadLoading(false);
      setUploadFile(null);
    }
  };

  const formatMonthYear = (my: string) => {
    if (!my) return "—";
    const [y, m] = my.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const requestSort = (key: string) => {
    let dir: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") dir = "desc";
    setSortConfig({ key, direction: dir });
  };

  const getSortValue = (item: AdvanceSettingsData, key: string) => {
    switch (key) {
      case "location": return `${allFactoriesMap[item.factory || 0] || ""} ${allDepartmentsMap[item.department || 0] || ""}`;
      case "line_station": return `${allLinesMap[item.line || 0] || ""} ${allSublinesMap[item.subline || 0] || ""}`;
      case "period": return item.month_year;
      case "required": return item.operator_required_ctq;
      case "available": return item.operator_availability_ctq;
      default: return (item as any)[key] ?? 0;
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return advanceSettingsData;
    return [...advanceSettingsData].sort((a, b) => {
      const va = getSortValue(a, sortConfig.key);
      const vb = getSortValue(b, sortConfig.key);
      if (va < vb) return sortConfig.direction === "asc" ? -1 : 1;
      if (va > vb) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [advanceSettingsData, sortConfig]);

  if (loading) return <div className="p-12 text-center">Loading manpower data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manpower Planning Dashboard</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 border-b pb-4">
          {[
            { id: "overview",  label: "Overview",    icon: BarChart3 },
            { id: "add-data",  label: "Add / Edit",  icon: Plus },
            { id: "upload",    label: "Bulk Upload", icon: Upload },
            { id: "data-list", label: "Records",     icon: FileSpreadsheet },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all ${
                activeTab === t.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border"
              }`}
            >
              <t.icon size={18} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Records</p>
                  <p className="text-3xl font-bold">{advanceSettingsData.length}</p>
                </div>
                <FileSpreadsheet className="text-blue-500" size={32} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Operators Required</p>
                  <p className="text-3xl font-bold">
                    {advanceSettingsData.reduce((s, i) => s + i.operator_required_ctq, 0)}
                  </p>
                </div>
                <Users className="text-green-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
              <div className="space-y-3">
                {advanceSettingsData.slice(-5).reverse().map(item => (
                  <div key={item.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="text-blue-500 mr-3" size={20} />
                    <div className="flex-1">
                      <p className="font-medium">{formatMonthYear(item.month_year)}</p>
                      <p className="text-sm text-gray-600">
                        {allFactoriesMap[item.factory || 0] || "—"} • {allDepartmentsMap[item.department || 0] || "—"}
                      </p>
                    </div>
                    <div className="font-bold">{item.operator_required_ctq} ops</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Add / Edit Form ── */}
        {activeTab === "add-data" && (
          <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Plus className="text-blue-600" size={24} />
              {formData.id ? "Edit Entry" : "Add New Entry"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Location */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building size={20} className="text-blue-600" /> Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Headquarters</label>
                    <select value={formData.hq ?? ""} onChange={e => handleHqChange(e.target.value ? Number(e.target.value) : null)} className="w-full border rounded-lg px-4 py-2">
                      <option value="">Select HQ</option>
                      {hqOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Factory <span className="text-red-600">*</span></label>
                    <select value={formData.factory ?? ""} onChange={e => handleFactoryChange(e.target.value ? Number(e.target.value) : null)} disabled={!formData.hq} className="w-full border rounded-lg px-4 py-2 disabled:opacity-60">
                      <option value="">Select Factory</option>
                      {factoryOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Department</label>
                    <select value={formData.department ?? ""} onChange={e => handleDepartmentChange(e.target.value ? Number(e.target.value) : null)} disabled={!formData.factory} className="w-full border rounded-lg px-4 py-2 disabled:opacity-60">
                      <option value="">All Departments</option>
                      {departmentOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Line / Subline */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Line <span className="text-red-600">*</span></label>
                    <select value={formData.line ?? ""} onChange={e => handleLineChange(e.target.value ? Number(e.target.value) : null)} disabled={!formData.department} className="w-full border rounded-lg px-4 py-2 disabled:opacity-60">
                      <option value="">Select Line</option>
                      {lineOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                  {sublineOptions.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Subline</label>
                      <select value={formData.subline ?? ""} onChange={e => handleSublineChange(e.target.value ? Number(e.target.value) : null)} className="w-full border rounded-lg px-4 py-2">
                        <option value="">Select Subline</option>
                        {sublineOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* General Metrics */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 size={20} className="text-green-600" /> General Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Month/Year <span className="text-red-600">*</span></label>
                    <input type="month" value={formData.month_year} onChange={e => setFormData(p => ({ ...p, month_year: e.target.value }))} className="w-full border rounded-lg px-4 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Total Stations</label>
                    <input type="number" min="0" value={formData.total_stations_ctq} onChange={e => setFormData(p => ({ ...p, total_stations_ctq: +e.target.value }))} className="w-full border rounded-lg px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Attrition (%)</label>
                    <input type="number" step="0.01" min="0" value={formData.attrition_trend_ctq} onChange={e => setFormData(p => ({ ...p, attrition_trend_ctq: +e.target.value }))} className="w-full border rounded-lg px-4 py-2" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Absenteeism (%)</label>
                    <input type="number" step="0.01" min="0" value={formData.absentee_trend_ctq} onChange={e => setFormData(p => ({ ...p, absentee_trend_ctq: +e.target.value }))} className="w-full border rounded-lg px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">OET Attrition (%)</label>
                    <input type="number" step="0.01" min="0" value={formData.oet_attrition_ctq} onChange={e => setFormData(p => ({ ...p, oet_attrition_ctq: +e.target.value }))} className="w-full border rounded-lg px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Associate Attrition (%)</label>
                    <input type="number" step="0.01" min="0" value={formData.associate_attrition_ctq} onChange={e => setFormData(p => ({ ...p, associate_attrition_ctq: +e.target.value }))} className="w-full border rounded-lg px-4 py-2" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Total Operators Required</label>
                    <input type="number" readOnly value={formData.operator_required_ctq} className="w-full px-4 py-2 border bg-gray-100 cursor-not-allowed rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Total Operators Available</label>
                    <input type="number" min="0" value={formData.operator_availability_ctq} onChange={e => setFormData(p => ({ ...p, operator_availability_ctq: +e.target.value }))} className="w-full border px-4 py-2 rounded-lg bg-blue-50/30" />
                  </div>
                </div>
              </div>

              {/* Skill Levels */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Layers size={20} className="text-orange-600" /> Skill Levels
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {["l1", "l2", "l3", "l4"].map(lvl => (
                    <div key={lvl} className="space-y-3">
                      <h4 className="font-bold text-center uppercase text-gray-700">{lvl.toUpperCase()}</h4>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Required</label>
                        <input type="number" min="0" value={formData[`${lvl}_required` as keyof AdvanceSettingsData]} onChange={e => handleRequiredChange(lvl as any, e.target.value)} className="w-full border rounded px-3 py-1.5" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Available</label>
                        <input type="number" min="0" value={formData[`${lvl}_available` as keyof AdvanceSettingsData]} onChange={e => setFormData(p => ({ ...p, [`${lvl}_available`]: +e.target.value }))} className="w-full border rounded px-3 py-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                {formData.id && (
                  <button type="button" onClick={() => { setFormData(initialFormData); setActiveTab("data-list"); }} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg">
                    Cancel
                  </button>
                )}
                <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {formData.id ? "Update Entry" : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Bulk Upload Tab ── */}
        {activeTab === "upload" && (
          <div className="bg-white rounded-xl shadow-sm border p-8 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Bulk Upload Data</h2>
            <p className="text-gray-600 mb-8">Download template → fill → upload</p>
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 mb-10">
              <h4 className="font-bold text-blue-800 mb-4 flex items-center justify-center gap-2">
                <FileSpreadsheet size={20} /> Step 1: Download Template
              </h4>
              <button onClick={handleDownloadTemplate} className="px-6 py-2.5 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 flex items-center gap-2 mx-auto">
                <Download size={18} /> Download Template.xlsx
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 bg-gray-50 hover:bg-gray-100 transition">
              <h4 className="font-bold mb-4">Step 2: Upload Filled File</h4>
              <input type="file" accept=".xlsx,.xls" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} className="mb-6 text-sm file:mr-4 file:py-2 file:px-5 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
              {uploadFile && (
                <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full mb-6">
                  <CheckCircle size={18} /> {uploadFile.name}
                </div>
              )}
              <button onClick={handleExcelUpload} disabled={!uploadFile || uploadLoading} className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 mx-auto">
                {uploadLoading ? <><Loader2 className="animate-spin" size={20} /> Uploading...</> : <><Upload size={20} /> Upload Excel</>}
              </button>
            </div>
          </div>
        )}

        {/* ── Data List Tab ── */}
        {activeTab === "data-list" && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => requestSort("location")}>
                      Location {sortConfig?.key === "location" && (sortConfig.direction === "asc" ? <ArrowUp className="inline" size={14} /> : <ArrowDown className="inline" size={14} />)}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => requestSort("line_station")}>
                      Line {sortConfig?.key === "line_station" && (sortConfig.direction === "asc" ? <ArrowUp className="inline" size={14} /> : <ArrowDown className="inline" size={14} />)}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => requestSort("period")}>
                      Period {sortConfig?.key === "period" && (sortConfig.direction === "asc" ? <ArrowUp className="inline" size={14} /> : <ArrowDown className="inline" size={14} />)}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => requestSort("required")}>
                      Req / Avail {sortConfig?.key === "required" && (sortConfig.direction === "asc" ? <ArrowUp className="inline" size={14} /> : <ArrowDown className="inline" size={14} />)}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attrition Rates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill Gaps</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedData.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{allFactoriesMap[item.factory || 0] || "—"}</div>
                        <div className="text-sm text-gray-500">{allDepartmentsMap[item.department || 0] || "—"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{allLinesMap[item.line || 0] || "—"}</div>
                        <div className="text-sm text-gray-500">{allSublinesMap[item.subline || 0] || ""}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatMonthYear(item.month_year)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-blue-700">R: {item.operator_required_ctq}</span>
                        <span className="ml-3 font-bold text-green-700">A: {item.operator_availability_ctq}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        Attr: {item.attrition_trend_ctq.toFixed(2)}%<br />
                        Abs: {item.absentee_trend_ctq.toFixed(2)}%<br />
                        OET: {item.oet_attrition_ctq.toFixed(2)}%<br />
                        Assoc: {item.associate_attrition_ctq.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="grid grid-cols-4 gap-1">
                          {["l1", "l2", "l3", "l4"].map(lvl => {
                            const req = item[`${lvl}_required` as keyof AdvanceSettingsData] as number;
                            const ava = item[`${lvl}_available` as keyof AdvanceSettingsData] as number;
                            const gap = req - ava;
                            return (
                              <div key={lvl}>
                                {lvl.toUpperCase()}:{" "}
                                <span className={gap > 0 ? "text-red-600" : gap < 0 ? "text-green-600" : ""}>
                                  {gap > 0 ? `-${gap}` : gap}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900 mr-3"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════ */}
        {/* ATTRITION SECTION — always visible at the bottom */}
        {/* ════════════════════════════════════════════════ */}
        <AttritionSection />
      </div>
    </div>
  );
};

export default AdvanceSettings;