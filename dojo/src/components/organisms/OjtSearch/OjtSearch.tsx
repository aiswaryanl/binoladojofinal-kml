// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Search, X, User } from "lucide-react";
// import { API_ENDPOINTS } from "../../constants/api";

// // ✅ Types
// interface Employee {
//   emp_id: string;
//   first_name: string;
//   last_name: string;
//   department_name: string;
// }

// interface LocationState {
//   stationId?: number;
//   stationName?: string;
//   sublineId?: number;
//   sublineName?: string;
//   lineId?: number;
//   lineName?: string;
//   departmentId?: number;
//   departmentName?: string;
//   levelId?: number;
//   levelName?: string;
// }

// const OjtSearch: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const {
//     stationId,
//     stationName,
//     sublineId,
//     sublineName,
//     lineId,
//     lineName,
//     departmentId,
//     departmentName,
//     levelId,
//     levelName,
//   } = (location.state as LocationState) || {};

//   const [query, setQuery] = useState("");
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
//   const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
//     null
//   );
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

//   const inputRef = useRef<HTMLInputElement>(null);
//   const suggestionsRef = useRef<HTMLDivElement>(null);

//   // ✅ Fetch Employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await fetch(
//           `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEES}`
//         );
//         if (!response.ok)
//           throw new Error(`Error fetching employees: ${response.statusText}`);
//         const data: Employee[] = await response.json();
//         setEmployees(data);
//         setFilteredEmployees(data);
//       } catch (error: any) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // ✅ Debounce Search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (query.trim() && employees.length > 0) {
//         const filtered = employees.filter(
//           (emp) =>
//             `${emp.first_name} ${emp.last_name}`
//               .toLowerCase()
//               .includes(query.toLowerCase()) ||
//             emp.emp_id.toLowerCase().includes(query.toLowerCase())
//         );
//         setFilteredEmployees(filtered.slice(0, 10));
//         setShowSuggestions(true);
//       } else {
//         setFilteredEmployees([]);
//         setShowSuggestions(false);
//       }
//     }, 200);
//     return () => clearTimeout(timer);
//   }, [query, employees]);

//   // ✅ Close dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         suggestionsRef.current &&
//         !suggestionsRef.current.contains(event.target as Node) &&
//         inputRef.current &&
//         !inputRef.current.contains(event.target as Node)
//       ) {
//         setShowSuggestions(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // ✅ Navigate to OJT Form
//   // const handleNavigation = (employee: Employee) => {
//   //   navigate("/OJTForm", {
//   //     state: {
//   //       ...location.state,
//   //       employeeId: employee.emp_id,
//   //       employeeName: `${employee.first_name} ${employee.last_name}`,
//   //     },
//   //   });
//   // };

//   const handleNavigation = (employee: Employee) => {
//     const { nextpage } = location.state || {};

//     if (nextpage === "tencycle") {
//       navigate("/TenCyclePage", {
//         // Replace with your actual Ten Cycle page route
//         state: {
//           ...location.state,
//           employeeId: employee.emp_id,
//           employeeName: `${employee.first_name} ${employee.last_name}`,
//         },
//       });
//     } else {
//       navigate("/OJTForm", {
//         state: {
//           ...location.state,
//           employeeId: employee.emp_id,
//           employeeName: `${employee.first_name} ${employee.last_name}`,
//         },
//       });
//     }
//   };

//   // ✅ Select Employee
//   const handleEmployeeSelect = (employee: Employee) => {
//     setSelectedEmployee(employee);
//     setQuery(`${employee.first_name} ${employee.last_name}`);
//     setShowSuggestions(false);
//     handleNavigation(employee);
//   };

//   const clearSearch = () => {
//     setQuery("");
//     setSelectedEmployee(null);
//     setShowSuggestions(false);
//     inputRef.current?.focus();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
//       {/* ✅ Floating Shapes Background */}
//       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
//         <div className="absolute w-72 h-72 bg-blue-100 rounded-full top-10 left-10 opacity-30 animate-pulse"></div>
//         <div className="absolute w-56 h-56 bg-purple-100 rounded-full bottom-20 right-20 opacity-30 animate-pulse"></div>
//       </div>

//       <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
//         {/* ✅ Header */}
//         <div className="text-center mb-10">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
//             <User className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-4xl font-bold gradient-text mb-2">
//             {/* OJT Training -  */}Select Employee
//           </h1>
//           <p className="text-lg text-gray-600">
//             Search for an employee to start their session
//             {/* OJT */}
//           </p>
//         </div>

//         {/* ✅ Location Info */}
//         {(departmentName ||
//           lineName ||
//           sublineName ||
//           stationName ||
//           levelName) && (
//           <div className="glass-card rounded-xl p-6 mb-8 shadow-lg">
//             <h2 className="text-lg font-semibold text-gray-700 mb-4">
//               Training Location
//             </h2>
//             <div className="flex flex-wrap gap-2">
//               {departmentName && (
//                 <span className="px-3 py-1 bg-blue-100 rounded-full">
//                   {departmentName}
//                 </span>
//               )}
//               {lineName && (
//                 <span className="px-3 py-1 bg-purple-100 rounded-full">
//                   {lineName}
//                 </span>
//               )}
//               {sublineName && (
//                 <span className="px-3 py-1 bg-indigo-100 rounded-full">
//                   {sublineName}
//                 </span>
//               )}
//               {stationName && (
//                 <span className="px-3 py-1 bg-green-100 rounded-full">
//                   {stationName}
//                 </span>
//               )}
//               {levelName && (
//                 <span className="px-3 py-1 bg-yellow-100 rounded-full">
//                   {levelName}
//                 </span>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ✅ Error State */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
//             {error}
//           </div>
//         )}

//         {/* ✅ Search Box */}
//         <div className="glass-card rounded-xl p-6 shadow-lg relative">
//           <div className="relative mb-4">
//             <input
//               ref={inputRef}
//               type="text"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search by name or employee ID..."
//               className="w-full px-12 py-4 glass-input rounded-xl text-lg text-gray-800 placeholder-gray-500"
//               onFocus={() => query && setShowSuggestions(true)}
//             />
//             <Search className="absolute left-4 top-4 text-gray-400" size={22} />
//             {query && (
//               <button
//                 onClick={clearSearch}
//                 className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
//               >
//                 <X size={20} />
//               </button>
//             )}
//           </div>

//           {/* ✅ Suggestions Dropdown */}
//           {showSuggestions && (
//             <div
//               ref={suggestionsRef}
//               className="absolute w-full mt-2 bg-white rounded-xl shadow-lg max-h-80 overflow-y-auto z-50"
//             >
//               {loading ? (
//                 <div className="p-4 text-center text-gray-500">
//                   Loading employees...
//                 </div>
//               ) : filteredEmployees.length > 0 ? (
//                 filteredEmployees.map((employee) => (
//                   <div
//                     key={employee.emp_id}
//                     className="p-4 flex justify-between items-center hover:bg-indigo-50 cursor-pointer transition"
//                     onClick={() => handleEmployeeSelect(employee)}
//                   >
//                     <div>
//                       <div className="font-semibold text-gray-800">
//                         {employee.first_name} {employee.last_name}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {employee.emp_id}
//                       </div>
//                     </div>
//                     <span className="text-sm text-gray-400">
//                       {employee.department_name}
//                     </span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="p-4 text-center text-gray-500">
//                   No employees found
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OjtSearch;

// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Search, X, User } from "lucide-react";
// import { API_ENDPOINTS } from "../../constants/api";

// // ✅ Types
// interface Employee {
//   emp_id: string;
//   first_name: string;
//   last_name: string;
//   department_name: string;
// }

// interface LocationState {
//   stationId?: number;
//   stationName?: string;
//   sublineId?: number;
//   sublineName?: string;
//   lineId?: number;
//   lineName?: string;
//   departmentId?: number;
//   departmentName?: string;
//   levelId?: number;
//   levelName?: string;
//   // ADDED: Explicitly add nextpage to the type for better clarity
//   nextpage?: 'tencycle' | 'skillevaluation';
// }

// const OjtSearch: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const {
//     stationId,
//     stationName,
//     sublineId,
//     sublineName,
//     lineId,
//     lineName,
//     departmentId,
//     departmentName,
//     levelId,
//     levelName,
//   } = (location.state as LocationState) || {};

//   const [query, setQuery] = useState("");
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
//   const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
//     null
//   );
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  
//   // ADDED: State to hold dynamic page title and subtitle
//   const [pageContext, setPageContext] = useState({
//     title: "On-Job Training (OJT)",
//     subtitle: "Search for an employee to start their OJT session",
//   });

//   const inputRef = useRef<HTMLInputElement>(null);
//   const suggestionsRef = useRef<HTMLDivElement>(null);

//   // ADDED: useEffect to set the page context based on the navigation state
//   useEffect(() => {
//     const { nextpage } = location.state || {};
//     if (nextpage === "tencycle") {
//         setPageContext({
//             title: "Ten Cycle",
//             subtitle: "Search for an employee to start their Ten Cycle training",
//         });
//     } else if (nextpage === "skillevaluation") {
//         setPageContext({
//             title: "Skill Evaluation",
//             subtitle: "Search for an employee to view or update their skill evaluation",
//         });
//     } else {
//         // Default to OJT if nextpage is not specified
//         setPageContext({
//             title: "On-Job Training (OJT)",
//             subtitle: "Search for an employee to start their OJT session",
//         });
//     }
//   }, [location.state]);


//   // ✅ Fetch Employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await fetch(
//           `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEES}`
//         );
//         if (!response.ok)
//           throw new Error(`Error fetching employees: ${response.statusText}`);
//         const data: Employee[] = await response.json();
//         setEmployees(data);
//         setFilteredEmployees(data);
//       } catch (error: any) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // ✅ Debounce Search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (query.trim() && employees.length > 0) {
//         const filtered = employees.filter(
//           (emp) =>
//             `${emp.first_name} ${emp.last_name}`
//               .toLowerCase()
//               .includes(query.toLowerCase()) ||
//             emp.emp_id.toLowerCase().includes(query.toLowerCase())
//         );
//         setFilteredEmployees(filtered.slice(0, 10));
//         setShowSuggestions(true);
//       } else {
//         setFilteredEmployees([]);
//         setShowSuggestions(false);
//       }
//     }, 200);
//     return () => clearTimeout(timer);
//   }, [query, employees]);

//   // ✅ Close dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         suggestionsRef.current &&
//         !suggestionsRef.current.contains(event.target as Node) &&
//         inputRef.current &&
//         !inputRef.current.contains(event.target as Node)
//       ) {
//         setShowSuggestions(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);


//   const handleNavigation = (employee: Employee) => {
//     const { nextpage } = location.state || {};

//     if (nextpage === "tencycle") {
//       navigate("/TenCyclePage", {
//         state: {
//           ...location.state,
//           employeeId: employee.emp_id,
//           employeeName: `${employee.first_name} ${employee.last_name}`,
//         },
//       });
//     } else if (nextpage === "skillevaluation") { // ADDED: New condition for Skill evaluation
//       navigate("/SkillEvaluationleveltwo", { // Make sure this route exists in your router setup
//         state: {
//           ...location.state,
//           employeeId: employee.emp_id,
//           employeeName: `${employee.first_name} ${employee.last_name}`,
//         },
//       });
//     }
//     else { // Default to OJT Form
//       navigate("/OJTForm", {
//         state: {
//           ...location.state,
//           employeeId: employee.emp_id,
//           employeeName: `${employee.first_name} ${employee.last_name}`,
//         },
//       });
//     }
//   };

//   // ✅ Select Employee
//   const handleEmployeeSelect = (employee: Employee) => {
//     setSelectedEmployee(employee);
//     setQuery(`${employee.first_name} ${employee.last_name}`);
//     setShowSuggestions(false);
//     handleNavigation(employee);
//   };

//   const clearSearch = () => {
//     setQuery("");
//     setSelectedEmployee(null);
//     setShowSuggestions(false);
//     inputRef.current?.focus();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
//       {/* ✅ Floating Shapes Background */}
//       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
//         <div className="absolute w-72 h-72 bg-blue-100 rounded-full top-10 left-10 opacity-30 animate-pulse"></div>
//         <div className="absolute w-56 h-56 bg-purple-100 rounded-full bottom-20 right-20 opacity-30 animate-pulse"></div>
//       </div>

//       <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
//         {/* MODIFIED: Header now uses dynamic content */}
//         <div className="text-center mb-10">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
//             <User className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-4xl font-bold gradient-text mb-2">
//             {pageContext.title} - Select Employee
//           </h1>
//           <p className="text-lg text-gray-600">
//             {pageContext.subtitle}
//           </p>
//         </div>

//         {/* ✅ Location Info */} 
//         {(departmentName ||
//           lineName ||
//           sublineName ||
//           stationName ||
//           levelName) && (
//           <div className="glass-card rounded-xl p-6 mb-8 shadow-lg">
//             <h2 className="text-lg font-semibold text-gray-700 mb-4">
//               Training Location
//             </h2>
//             <div className="flex flex-wrap gap-2">
//               {departmentName && (
//                 <span className="px-3 py-1 bg-blue-100 rounded-full">
//                   {departmentName}
//                 </span>
//               )}
//               {lineName && (
//                 <span className="px-3 py-1 bg-purple-100 rounded-full">
//                   {lineName}
//                 </span>
//               )}
//               {sublineName && (
//                 <span className="px-3 py-1 bg-indigo-100 rounded-full">
//                   {sublineName}
//                 </span>
//               )}
//               {stationName && (
//                 <span className="px-3 py-1 bg-green-100 rounded-full">
//                   {stationName}
//                 </span>
//               )}
//               {levelName && (
//                 <span className="px-3 py-1 bg-yellow-100 rounded-full">
//                   {levelName}
//                 </span>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ✅ Error State */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
//             {error}
//           </div>
//         )}

//         {/* ✅ Search Box */}
//         <div className="glass-card rounded-xl p-6 shadow-lg relative">
//           <div className="relative mb-4">
//             <input
//               ref={inputRef}
//               type="text"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search by name or employee ID..."
//               className="w-full px-12 py-4 glass-input rounded-xl text-lg text-gray-800 placeholder-gray-500"
//               onFocus={() => query && setShowSuggestions(true)}
//             />
//             <Search className="absolute left-4 top-4 text-gray-400" size={22} />
//             {query && (
//               <button
//                 onClick={clearSearch}
//                 className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
//               >
//                 <X size={20} />
//               </button>
//             )}
//           </div>

//           {/* ✅ Suggestions Dropdown */}
//           {showSuggestions && (
//             <div
//               ref={suggestionsRef}
//               className="absolute w-full mt-2 bg-white rounded-xl shadow-lg max-h-80 overflow-y-auto z-50"
//             >
//               {loading ? (
//                 <div className="p-4 text-center text-gray-500">
//                   Loading employees...
//                 </div>
//               ) : filteredEmployees.length > 0 ? (
//                 filteredEmployees.map((employee) => (
//                   <div
//                     key={employee.emp_id}
//                     className="p-4 flex justify-between items-center hover:bg-indigo-50 cursor-pointer transition"
//                     onClick={() => handleEmployeeSelect(employee)}
//                   >
//                     <div>
//                       <div className="font-semibold text-gray-800">
//                         {employee.first_name} {employee.last_name}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {employee.emp_id}
//                       </div>
//                     </div>
//                     <span className="text-sm text-gray-400">
//                       {employee.department_name}
//                     </span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="p-4 text-center text-gray-500">
//                   No employees found
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OjtSearch;



// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Search, X, User } from "lucide-react";
// import { API_ENDPOINTS } from "../../constants/api";

// // ✅ Types
// interface Employee {
//   emp_id: string;
//   first_name: string;
//   last_name: string;
//   department_name: string;
// }

// interface LocationState {
//   stationId?: number;
//   stationName?: string;
//   sublineId?: number;
//   sublineName?: string;
//   lineId?: number;
//   lineName?: string;
//   departmentId?: number;
//   departmentName?: string;
//   levelId?: number;
//   levelName?: string;
//   // ✅ ADDED: New option 'operatorobservance'
//   nextpage?: "tencycle" | "skillevaluation" | "operatorobservance";
// }

// const OjtSearch: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const {
//     stationId,
//     stationName,
//     sublineId,
//     sublineName,
//     lineId,
//     lineName,
//     departmentId,
//     departmentName,
//     levelId,
//     levelName,
//   } = (location.state as LocationState) || {};

//   const [query, setQuery] = useState("");
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
//   const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
//     null
//   );
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

//   // ✅ Dynamic title/subtitle
//   const [pageContext, setPageContext] = useState({
//     title: "On-Job Training (OJT)",
//     subtitle: "Search for an employee to start their OJT session",
//   });

//   const inputRef = useRef<HTMLInputElement>(null);
//   const suggestionsRef = useRef<HTMLDivElement>(null);

//   // ✅ Dynamic title based on `nextpage`
//   useEffect(() => {
//     const { nextpage } = location.state || {};
//     if (nextpage === "tencycle") {
//       setPageContext({
//         title: "Ten Cycle",
//         subtitle: "Search for an employee to start their Ten Cycle training",
//       });
//     } else if (nextpage === "skillevaluation") {
//       setPageContext({
//         title: "Skill Evaluation",
//         subtitle:
//           "Search for an employee to view or update their skill evaluation",
//       });
//     } else if (nextpage === "operatorobservance") {
//       setPageContext({
//         title: "Operator Observance Check Sheet",
//         subtitle:
//           "Search for an employee to start their operator observance check sheet",
//       });
//     } else {
//       setPageContext({
//         title: "On-Job Training (OJT)",
//         subtitle: "Search for an employee to start their OJT session",
//       });
//     }
//   }, [location.state]);

//   // ✅ Fetch Employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await fetch(
//           `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEES}`
//         );
//         if (!response.ok)
//           throw new Error(`Error fetching employees: ${response.statusText}`);
//         const data: Employee[] = await response.json();
//         setEmployees(data);
//         setFilteredEmployees(data);
//       } catch (error: any) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // ✅ Debounce Search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (query.trim() && employees.length > 0) {
//         const filtered = employees.filter(
//           (emp) =>
//             `${emp.first_name} ${emp.last_name}`
//               .toLowerCase()
//               .includes(query.toLowerCase()) ||
//             emp.emp_id.toLowerCase().includes(query.toLowerCase())
//         );
//         setFilteredEmployees(filtered.slice(0, 10));
//         setShowSuggestions(true);
//       } else {
//         setFilteredEmployees([]);
//         setShowSuggestions(false);
//       }
//     }, 200);
//     return () => clearTimeout(timer);
//   }, [query, employees]);

//   // ✅ Close dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         suggestionsRef.current &&
//         !suggestionsRef.current.contains(event.target as Node) &&
//         inputRef.current &&
//         !inputRef.current.contains(event.target as Node)
//       ) {
//         setShowSuggestions(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // ✅ Navigation based on nextpage
//   const handleNavigation = (employee: Employee) => {
//     const { nextpage } = location.state || {};

//     if (nextpage === "tencycle") {
//       navigate("/TenCyclePage", {
//         state: {
//           ...location.state,
//           employeeId: employee.emp_id,
//           employeeName: `${employee.first_name} ${employee.last_name}`,
//         },
//       });
//     } else if (nextpage === "skillevaluation") {
//       navigate("/SkillEvaluationleveltwo", {
//         state: {
//           ...location.state,
//           employeeId: employee.emp_id,
//           employeeName: `${employee.first_name} ${employee.last_name}`,
//         },
//       });
//     } else if (nextpage === "operatorobservance") {
//       navigate("/operator-observance-check-sheet", {
//         state: {
//           ...location.state,
//           employeeId: employee.emp_id,
//           employeeName: `${employee.first_name} ${employee.last_name}`,
//         },
//       });
//     } else {
//       navigate("/OJTForm", {
//         state: {
//           ...location.state,
//           employeeId: employee.emp_id,
//           employeeName: `${employee.first_name} ${employee.last_name}`,
//         },
//       });
//     }
//   };

//   // ✅ Select Employee
//   const handleEmployeeSelect = (employee: Employee) => {
//     setSelectedEmployee(employee);
//     setQuery(`${employee.first_name} ${employee.last_name}`);
//     setShowSuggestions(false);
//     handleNavigation(employee);
//   };

//   const clearSearch = () => {
//     setQuery("");
//     setSelectedEmployee(null);
//     setShowSuggestions(false);
//     inputRef.current?.focus();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
//       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
//         <div className="absolute w-72 h-72 bg-blue-100 rounded-full top-10 left-10 opacity-30 animate-pulse"></div>
//         <div className="absolute w-56 h-56 bg-purple-100 rounded-full bottom-20 right-20 opacity-30 animate-pulse"></div>
//       </div>

//       <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
//         <div className="text-center mb-10">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
//             <User className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-4xl font-bold gradient-text mb-2">
//             {pageContext.title} - Select Employee
//           </h1>
//           <p className="text-lg text-gray-600">{pageContext.subtitle}</p>
//         </div>

//         {(departmentName ||
//           lineName ||
//           sublineName ||
//           stationName ||
//           levelName) && (
//           <div className="glass-card rounded-xl p-6 mb-8 shadow-lg">
//             <h2 className="text-lg font-semibold text-gray-700 mb-4">
//               Training Location
//             </h2>
//             <div className="flex flex-wrap gap-2">
//               {departmentName && (
//                 <span className="px-3 py-1 bg-blue-100 rounded-full">
//                   {departmentName}
//                 </span>
//               )}
//               {lineName && (
//                 <span className="px-3 py-1 bg-purple-100 rounded-full">
//                   {lineName}
//                 </span>
//               )}
//               {sublineName && (
//                 <span className="px-3 py-1 bg-indigo-100 rounded-full">
//                   {sublineName}
//                 </span>
//               )}
//               {stationName && (
//                 <span className="px-3 py-1 bg-green-100 rounded-full">
//                   {stationName}
//                 </span>
//               )}
//               {levelName && (
//                 <span className="px-3 py-1 bg-yellow-100 rounded-full">
//                   {levelName}
//                 </span>
//               )}
//             </div>
//           </div>
//         )}

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
//             {error}
//           </div>
//         )}

//         <div className="glass-card rounded-xl p-6 shadow-lg relative">
//           <div className="relative mb-4">
//             <input
//               ref={inputRef}
//               type="text"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search by name or employee ID..."
//               className="w-full px-12 py-4 glass-input rounded-xl text-lg text-gray-800 placeholder-gray-500"
//               onFocus={() => query && setShowSuggestions(true)}
//             />
//             <Search className="absolute left-4 top-4 text-gray-400" size={22} />
//             {query && (
//               <button
//                 onClick={clearSearch}
//                 className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
//               >
//                 <X size={20} />
//               </button>
//             )}
//           </div>

//           {showSuggestions && (
//             <div
//               ref={suggestionsRef}
//               className="absolute w-full mt-2 bg-white rounded-xl shadow-lg max-h-80 overflow-y-auto z-50"
//             >
//               {loading ? (
//                 <div className="p-4 text-center text-gray-500">
//                   Loading employees...
//                 </div>
//               ) : filteredEmployees.length > 0 ? (
//                 filteredEmployees.map((employee) => (
//                   <div
//                     key={employee.emp_id}
//                     className="p-4 flex justify-between items-center hover:bg-indigo-50 cursor-pointer transition"
//                     onClick={() => handleEmployeeSelect(employee)}
//                   >
//                     <div>
//                       <div className="font-semibold text-gray-800">
//                         {employee.first_name} {employee.last_name}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {employee.emp_id}
//                       </div>
//                     </div>
//                     <span className="text-sm text-gray-400">
//                       {employee.department_name}
//                     </span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="p-4 text-center text-gray-500">
//                   No employees found
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OjtSearch;


import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, X, User } from "lucide-react";
import { API_ENDPOINTS } from "../../constants/api";

/* ================================================================
   TYPES
================================================================ */

interface Employee {
  emp_id: string;
  first_name: string;
  last_name: string;
  department_name: string;
}

interface LocationState {
  stationId?: number;
  stationName?: string;
  sublineId?: number;
  sublineName?: string;
  lineId?: number;
  lineName?: string;
  departmentId?: number;
  departmentName?: string;
  levelId?: number;
  levelName?: string;
  nextpage?:
    | "tencycle"
    | "skillevaluation"
    | "operatorobservance"
    | "poisontest";
}

/* ================================================================
   COMPONENT
================================================================ */

const OjtSearch: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const {
    stationName,
    sublineName,
    lineName,
    departmentName,
    levelName,
    nextpage,
  } = state;

  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const [pageContext, setPageContext] = useState({
    title: "On-Job Training (OJT)",
    subtitle: "Search for an employee to start their OJT session",
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  /* ================================================================
     PAGE CONTEXT LOGIC
  ================================================================ */

  useEffect(() => {
    const contextMap: Record<
      NonNullable<LocationState["nextpage"]>,
      { title: string; subtitle: string }
    > = {
      tencycle: {
        title: "Ten Cycle",
        subtitle: "Search for an employee to start their Ten Cycle training",
      },
      skillevaluation: {
        title: "Skill Evaluation",
        subtitle:
          "Search for an employee to view or update their skill evaluation",
      },
      operatorobservance: {
        title: "Operator Observance Check Sheet",
        subtitle:
          "Search for an employee to start their operator observance check sheet",
      },
      poisontest: {
        title: "Poison Test Sheet",
        subtitle:
          "Search for an employee to start their poison test evaluation",
      },
    };

    if (nextpage && contextMap[nextpage]) {
      setPageContext(contextMap[nextpage]);
    }
  }, [nextpage]);

  /* ================================================================
     FETCH EMPLOYEES
  ================================================================ */

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEES}`
        );

        if (!response.ok) {
          throw new Error(`Error fetching employees: ${response.statusText}`);
        }

        const data: Employee[] = await response.json();
        setEmployees(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  /* ================================================================
     SEARCH LOGIC (Debounced)
  ================================================================ */

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setFilteredEmployees([]);
        setShowSuggestions(false);
        return;
      }

      const filtered = employees.filter((emp) =>
        `${emp.first_name} ${emp.last_name}`
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        emp.emp_id.toLowerCase().includes(query.toLowerCase())
      );

      setFilteredEmployees(filtered.slice(0, 10));
      setShowSuggestions(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [query, employees]);

  /* ================================================================
     CLOSE DROPDOWN ON OUTSIDE CLICK
  ================================================================ */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================================================================
     NAVIGATION LOGIC (SCALABLE VERSION)
  ================================================================ */

  const routeMap: Record<string, string> = {
    tencycle: "/TenCyclePage",
    skillevaluation: "/SkillEvaluationleveltwo",
    operatorobservance: "/operator-observance-check-sheet",
    poisontest: "/poison-test",
  };

  const handleNavigation = (employee: Employee) => {
    const route = nextpage && routeMap[nextpage];

    navigate(route || "/OJTForm", {
      state: {
        ...state,
        employeeId: employee.emp_id,
        employeeName: `${employee.first_name} ${employee.last_name}`,
      },
    });
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setQuery(`${employee.first_name} ${employee.last_name}`);
    setShowSuggestions(false);
    handleNavigation(employee);
  };

  const clearSearch = () => {
    setQuery("");
    setSelectedEmployee(null);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  /* ================================================================
     UI
  ================================================================ */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {pageContext.title} - Select Employee
          </h1>
          <p className="text-lg text-gray-600">
            {pageContext.subtitle}
          </p>
        </div>

        {/* LOCATION INFO */}
        {(departmentName || lineName || sublineName || stationName || levelName) && (
          <div className="bg-white rounded-xl p-6 mb-8 shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Training Location
            </h2>
            <div className="flex flex-wrap gap-2">
              {departmentName && <span className="px-3 py-1 bg-blue-100 rounded-full">{departmentName}</span>}
              {lineName && <span className="px-3 py-1 bg-purple-100 rounded-full">{lineName}</span>}
              {sublineName && <span className="px-3 py-1 bg-indigo-100 rounded-full">{sublineName}</span>}
              {stationName && <span className="px-3 py-1 bg-green-100 rounded-full">{stationName}</span>}
              {levelName && <span className="px-3 py-1 bg-yellow-100 rounded-full">{levelName}</span>}
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* SEARCH CARD */}
        <div className="bg-white rounded-xl p-6 shadow-lg relative">
          <div className="relative mb-4">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or employee ID..."
              className="w-full px-12 py-4 rounded-xl text-lg border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none"
              onFocus={() => query && setShowSuggestions(true)}
            />

            <Search className="absolute left-4 top-4 text-gray-400" size={22} />

            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* DROPDOWN */}
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute w-full mt-2 bg-white rounded-xl shadow-lg max-h-80 overflow-y-auto z-50"
            >
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading employees...
                </div>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee.emp_id}
                    className="p-4 flex justify-between items-center hover:bg-indigo-50 cursor-pointer transition"
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    <div>
                      <div className="font-semibold text-gray-800">
                        {employee.first_name} {employee.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.emp_id}
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {employee.department_name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No employees found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OjtSearch;
