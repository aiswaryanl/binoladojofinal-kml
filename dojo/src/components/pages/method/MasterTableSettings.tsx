// // import React, { useState, useEffect } from "react";
// // import {
// //   Upload,
// //   Plus,
// //   Trash2,
// //   FileSpreadsheet,
// //   Users,
// //   Mail,
// //   Phone,
// //   Calendar,
// //   User,
// //   Building2,
// // } from "lucide-react";

// // interface EmployeeData {
// //   emp_id: string;
// //   first_name: string;
// //   last_name: string;
// //   department: number | null;
// //   department_name?: string;
// //   date_of_joining: string;
// //   birth_date: string;
// //   sex: string;
// //   email: string;
// //   phone: string;
// //   designation: string;
// // }

// // interface Department {
// //   department_id: number;
// //   department_name: string;
// // }

// // const MasterTableSettings: React.FC = () => {
// //   const [activeTab, setActiveTab] = useState("overview");
// //   const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
// //   const [departments, setDepartments] = useState<Department[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [uploadFile, setUploadFile] = useState<File | null>(null);
// //   const [uploadLoading, setUploadLoading] = useState(false);
// //   const [formData, setFormData] = useState<EmployeeData>({
// //     emp_id: "",
// //     first_name: "",
// //     last_name: "",
// //     department: null,
// //     designation: "",
// //     date_of_joining: "",
// //     birth_date: "",
// //     sex: "",
// //     email: "",
// //     phone: "",
// //   });

// //   const API_BASE_URL = "http://127.0.0.1:8000";

// //   const tabs = [
// //     { id: "overview", name: "Overview", icon: Users },
// //     { id: "add-data", name: "Add Employee", icon: Plus },
// //     { id: "upload", name: "Upload Excel", icon: Upload },
// //     { id: "employee-list", name: "Employee Records", icon: FileSpreadsheet },
// //   ];

// //   // DESIGNATION OPTIONS (for suggestions)
// //   const designationOptions = [
// //     { value: "CO-DRIVER", label: "CO-DRIVER" },
// //     { value: "DRIVER", label: "DRIVER" },
// //     { value: "HELPER", label: "HELPER" },
// //     { value: "MALI", label: "MALI" },
// //     { value: "OPERATOR", label: "OPERATOR" },
// //     { value: "PANTRY BOY", label: "PANTRY BOY" },
// //     { value: "SUPERVISOR", label: "SUPERVISOR" },
// //     { value: "SWEEPER", label: "SWEEPER" },
// //     { value: "OET", label: "OET" },
// //   ];

// //   const formFields = [
// //     { id: "emp_id", label: "Employee ID", type: "text", required: true, icon: User },
// //     { id: "first_name", label: "First Name", type: "text", required: true, icon: User },
// //     { id: "last_name", label: "Last Name", type: "text", required: false, icon: User },

// //     // COMBOBOX: CHOICES + FREE TYPING
// //     {
// //       id: "designation",
// //       label: "Designation",
// //       type: "text",
// //       required: false,
// //       icon: User,
// //       list: "designation-list",
// //       placeholder: "Type or select (e.g. Software Engineer)",
// //     },

// //     { id: "department", label: "Department", type: "select", required: true, icon: Building2 },
// //     { id: "date_of_joining", label: "Join Date", type: "date", required: true, icon: Calendar },
// //     { id: "birth_date", label: "Birth Date", type: "date", required: false, icon: Calendar },
// //     {
// //       id: "sex",
// //       label: "Gender",
// //       type: "select",
// //       required: false,
// //       icon: User,
// //       options: [
// //         { value: "", label: "Select Gender" },
// //         { value: "M", label: "Male" },
// //         { value: "F", label: "Female" },
// //         { value: "O", label: "Other" },
// //       ],
// //     },
// //     { id: "email", label: "Email Address", type: "email", required: false, icon: Mail },
// //     { id: "phone", label: "Phone Number", type: "tel", required: false, icon: Phone },
// //   ];

// //   // FETCH DATA
// //   const fetchEmployees = async () => {
// //     setLoading(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/mastertable/`);
// //       if (!response.ok) throw new Error("Failed to fetch employees");
// //       const data = await response.json();
// //       setEmployeeData(data);
// //     } catch (error) {
// //       console.error("Error:", error);
// //       alert("Failed to load employees.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchDepartments = async () => {
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/departments/`);
// //       if (!response.ok) throw new Error("Failed to fetch departments");
// //       const data = await response.json();
// //       setDepartments(data);
// //     } catch (error) {
// //       console.warn("Using fallback departments");
// //       setDepartments([
// //         { department_id: 1, department_name: "Engineering" },
// //         { department_id: 2, department_name: "HR" },
// //         { department_id: 3, department_name: "Marketing" },
// //       ]);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchEmployees();
// //     fetchDepartments();
// //   }, []);

// //   const handleInputChange = (field: keyof EmployeeData, value: string) => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       [field]: field === "department" ? (value ? parseInt(value) : null) : value,
// //     }));
// //   };

// //   const handleSubmit = async () => {
// //     const required = ["emp_id", "first_name", "date_of_joining", "department"];
// //     for (const field of required) {
// //       if (!formData[field as keyof EmployeeData]) {
// //         alert(`Please fill in ${field.replace("_", " ")}`);
// //         return;
// //       }
// //     }

// //     setLoading(true);
// //     try {
// //       const submitFormData = new FormData();
// //       submitFormData.append("emp_id", formData.emp_id);
// //       submitFormData.append("first_name", formData.first_name);
// //       submitFormData.append("last_name", formData.last_name || "");
// //       submitFormData.append("email", formData.email);
// //       submitFormData.append("date_of_joining", formData.date_of_joining);
// //       if (formData.department) {
// //         submitFormData.append("department", formData.department.toString());
// //       }
// //       if (formData.birth_date) {
// //         submitFormData.append("birth_date", formData.birth_date);
// //       }
// //       if (formData.sex) {
// //         submitFormData.append("sex", formData.sex);
// //       }
// //       if (formData.phone) {
// //         submitFormData.append("phone", formData.phone);
// //       }
// //       submitFormData.append("designation", formData.designation.trim());

// //       console.log("Submitting FormData:");
// //       for (let [k, v] of submitFormData.entries()) {
// //         console.log(`  ${k}: ${v}`);
// //       }

// //       const response = await fetch(`${API_BASE_URL}/mastertable/`, {
// //         method: "POST",
// //         body: submitFormData,
// //       });

// //       if (!response.ok) {
// //         const errorData = await response.json().catch(() => ({}));
// //         let msg = "Failed to add employee:\n";
// //         if (errorData.emp_id) msg += `ID: ${errorData.emp_id}\n`;
// //         if (errorData.email) msg += `Email: ${errorData.email}\n`;
// //         if (errorData.phone) msg += `Phone: ${errorData.phone}\n`;
// //         if (errorData.detail) msg += `${errorData.detail}\n`;
// //         throw new Error(msg.trim());
// //       }

// //       await fetchEmployees();
// //       alert("Employee added successfully!");
// //       setActiveTab("employee-list");

// //       setFormData({
// //         emp_id: "",
// //         first_name: "",
// //         last_name: "",
// //         department: null,
// //         designation: "",
// //         date_of_joining: "",
// //         birth_date: "",
// //         sex: "",
// //         email: "",
// //         phone: "",
// //       });
// //     } catch (error: any) {
// //       alert(error.message || "Failed to add employee.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // OTHER HANDLERS (delete, upload, etc.) — unchanged
// //   const handleDelete = async (empId: string) => {
// //     if (!window.confirm("Delete this employee?")) return;
// //     setLoading(true);
// //     try {
// //       const res = await fetch(`${API_BASE_URL}/mastertable/${empId}/`, { method: "DELETE" });
// //       if (!res.ok) throw new Error("Delete failed");
// //       await fetchEmployees();
// //       alert("Deleted successfully!");
// //     } catch {
// //       alert("Failed to delete.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleExcelUpload = async () => {
// //     if (!uploadFile) return alert("Select a file");
// //     setUploadLoading(true);
// //     try {
// //       const fd = new FormData();
// //       fd.append("file", uploadFile);
// //       const res = await fetch(`${API_BASE_URL}/mastertable/upload_excel/`, {
// //         method: "POST",
// //         body: fd,
// //       });
// //       const data = await res.json();
// //       if (res.ok) {
// //         let msg = `Created: ${data.created_count}, Updated: ${data.updated_count}`;
// //         if (data.errors?.length) {
// //           msg += "\n\nErrors:\n" + data.errors.map((e: any) => `Row ${e.row}: ${e.error}`).join("\n");
// //         }
// //         alert(msg);
// //         fetchEmployees();
// //       } else {
// //         alert(data.error || "Upload failed");
// //       }
// //     } catch (e: any) {
// //       alert(e.message);
// //     } finally {
// //       setUploadLoading(false);
// //       setUploadFile(null);
// //       const input = document.getElementById("excel-upload") as HTMLInputElement;
// //       if (input) input.value = "";
// //     }
// //   };

// //   const handleDownloadTemplate = async () => {
// //     try {
// //       const res = await fetch(`${API_BASE_URL}/mastertable/download_template/`);
// //       if (!res.ok) throw new Error();
// //       const blob = await res.blob();
// //       const url = URL.createObjectURL(blob);
// //       const a = document.createElement("a");
// //       a.href = url;
// //       a.download = "employee_template.xlsx";
// //       a.click();
// //       URL.revokeObjectURL(url);
// //       alert("Template downloaded!");
// //     } catch {
// //       alert("Download failed");
// //     }
// //   };

// //   const formatDate = (d: string) =>
// //     !d ? "" : new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
// //   const getDepartmentName = (id: number | null) =>
// //     id ? departments.find((d) => d.department_id === id)?.department_name || "Unknown" : "N/A";
// //   const getGenderDisplay = (s: string) => ({ M: "Male", F: "Female", O: "Other" }[s] || "N/A");

// //   const getOverviewStats = () => {
// //     const total = employeeData.length;
// //     const depts = new Set(employeeData.map((e) => e.department_name || getDepartmentName(e.department))).size;
// //     const male = employeeData.filter((e) => e.sex === "M").length;
// //     const female = employeeData.filter((e) => e.sex === "F").length;
// //     return [
// //       { title: "Total Employees", value: total, icon: Users, color: "bg-blue-500" },
// //       { title: "Departments", value: depts, icon: Building2, color: "bg-green-500" },
// //       { title: "Male", value: male, icon: User, color: "bg-purple-500" },
// //       { title: "Female", value: female, icon: User, color: "bg-pink-500" },
// //     ];
// //   };

// //   const getDepartmentStats = () => {
// //     const counts = employeeData.reduce((acc, e) => {
// //       const name = e.department_name || getDepartmentName(e.department);
// //       acc[name] = (acc[name] || 0) + 1;
// //       return acc;
// //     }, {} as Record<string, number>);
// //     return Object.entries(counts).map(([dept, count]) => ({ department: dept, count }));
// //   };

// //   const renderTabContent = () => {
// //     switch (activeTab) {
// //       case "overview":
// //         return (
// //           <div className="space-y-8">
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //               {getOverviewStats().map((s, i) => {
// //                 const Icon = s.icon;
// //                 return (
// //                   <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
// //                     <div className="flex justify-between items-center">
// //                       <div>
// //                         <p className="text-sm text-gray-600">{s.title}</p>
// //                         <p className="text-3xl font-bold">{s.value}</p>
// //                       </div>
// //                       <div className={`${s.color} p-3 rounded-xl`}>
// //                         <Icon className="h-6 w-6 text-white" />
// //                       </div>
// //                     </div>
// //                   </div>
// //                 );
// //               })}
// //             </div>

// //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //               <div className="bg-white rounded-2xl shadow-lg p-6 border">
// //                 <h3 className="text-xl font-semibold mb-4">Department Distribution</h3>
// //                 {getDepartmentStats().map((d, i) => (
// //                   <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl mb-2">
// //                     <span className="font-medium">{d.department}</span>
// //                     <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{d.count}</span>
// //                   </div>
// //                 ))}
// //               </div>

// //               <div className="bg-white rounded-2xl shadow-lg p-6 border">
// //                 <h3 className="text-xl font-semibold mb-4">Recent Additions</h3>
// //                 {employeeData.slice(-3).reverse().map((e, i) => (
// //                   <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl mb-2">
// //                     <User className="h-5 w-5 text-green-600 mr-3" />
// //                     <div>
// //                       <p className="font-medium">{`${e.first_name} ${e.last_name}`.trim()}</p>
// //                       <p className="text-sm text-gray-600">{e.department_name || getDepartmentName(e.department)}</p>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         );

// //       case "add-data":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg p-8 border">
// //             <div className="flex items-center mb-6">
// //               <Plus className="h-6 w-6 text-blue-600 mr-3" />
// //               <h2 className="text-2xl font-bold">Add New Employee</h2>
// //             </div>

// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //               {formFields.map((field) => {
// //                 const Icon = field.icon;
// //                 return (
// //                   <div key={field.id} className="space-y-2">
// //                     <label className="flex items-center text-sm font-medium text-gray-700">
// //                       <Icon className="h-4 w-4 mr-2 text-gray-500" />
// //                       {field.label}
// //                       {field.required && <span className="text-red-500 ml-1">*</span>}
// //                     </label>

// //                     {/* COMBOBOX FOR DESIGNATION */}
// //                     {field.id === "designation" ? (
// //                       <>
// //                         <input
// //                           type="text"
// //                           list={field.list}
// //                           value={formData.designation}
// //                           onChange={(e) => handleInputChange("designation", e.target.value)}
// //                           placeholder={field.placeholder}
// //                           className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //                         />
// //                         <datalist id="designation-list">
// //                           {designationOptions.map((opt) => (
// //                             <option key={opt.value} value={opt.value}>
// //                               {opt.label}
// //                             </option>
// //                           ))}
// //                         </datalist>
// //                       </>
// //                     ) : field.type === "select" ? (
// //                       <select
// //                         value={formData[field.id as keyof EmployeeData] as string}
// //                         onChange={(e) => handleInputChange(field.id as keyof EmployeeData, e.target.value)}
// //                         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                       >
// //                         {field.id === "department"
// //                           ? departments.map((d) => (
// //                               <option key={d.department_id} value={d.department_id}>
// //                                 {d.department_name}
// //                               </option>
// //                             ))
// //                           : field.options?.map((o) => (
// //                               <option key={o.value} value={o.value}>
// //                                 {o.label}
// //                               </option>
// //                             ))}
// //                       </select>
// //                     ) : (
// //                       <input
// //                         type={field.type}
// //                         value={formData[field.id as keyof EmployeeData] as string}
// //                         onChange={(e) => handleInputChange(field.id as keyof EmployeeData, e.target.value)}
// //                         placeholder={`Enter ${field.label.toLowerCase()}`}
// //                         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //                       />
// //                     )}
// //                   </div>
// //                 );
// //               })}
// //             </div>

// //             <div className="flex justify-end mt-8">
// //               <button
// //                 onClick={handleSubmit}
// //                 disabled={loading}
// //                 className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center"
// //               >
// //                 {loading ? (
// //                   <>Adding...</>
// //                 ) : (
// //                   <>
// //                     <Plus className="h-5 w-5 mr-2" />
// //                     Add Employee
// //                   </>
// //                 )}
// //               </button>
// //             </div>
// //           </div>
// //         );

// //       // ... upload and employee-list tabs unchanged (same as before)
// //       case "upload":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg p-8 border">
// //             <div className="flex items-center mb-6">
// //               <Upload className="h-6 w-6 text-green-600 mr-3" />
// //               <h2 className="text-2xl font-bold">Upload Excel</h2>
// //             </div>
// //             <div className="border-2 border-dashed rounded-xl p-8 text-center">
// //               <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
// //               <input
// //                 id="excel-upload"
// //                 type="file"
// //                 accept=".xlsx,.xls"
// //                 onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
// //                 className="block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:bg-green-50 file:text-green-700"
// //               />
// //             </div>
// //             <div className="flex justify-center gap-4 mt-6">
// //               <button
// //                 onClick={handleExcelUpload}
// //                 disabled={!uploadFile || uploadLoading}
// //                 className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center"
// //               >
// //                 {uploadLoading ? "Uploading..." : <><Upload className="h-5 w-5 mr-2" /> Upload</>}
// //               </button>
// //               <button
// //                 onClick={handleDownloadTemplate}
// //                 className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center"
// //               >
// //                 <FileSpreadsheet className="h-5 w-5 mr-2" /> Template
// //               </button>
// //             </div>
// //             {uploadFile && (
// //               <div className="mt-4 p-3 bg-green-50 rounded-xl text-green-800">
// //                 Selected: {uploadFile.name}
// //               </div>
// //             )}
// //           </div>
// //         );

// //       case "employee-list":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
// //             <div className="p-6 border-b">
// //               <h2 className="text-2xl font-bold flex items-center">
// //                 <FileSpreadsheet className="h-6 w-6 text-purple-600 mr-3" />
// //                 Employee Records
// //                 <span className="ml-3 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
// //                   {employeeData.length}
// //                 </span>
// //               </h2>
// //             </div>
// //             {loading ? (
// //               <div className="p-12 text-center">Loading...</div>
// //             ) : employeeData.length === 0 ? (
// //               <div className="p-12 text-center">
// //                 <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
// //                 <p className="text-xl font-medium mb-2">No employees</p>
// //                 <button onClick={() => setActiveTab("add-data")} className="px-4 py-2 bg-blue-600 text-white rounded-lg mr-2">
// //                   Add Employee
// //                 </button>
// //                 <button onClick={() => setActiveTab("upload")} className="px-4 py-2 border rounded-lg">
// //                   Upload Excel
// //                 </button>
// //               </div>
// //             ) : (
// //               <div className="overflow-x-auto">
// //                 <table className="min-w-full divide-y divide-gray-200">
// //                   <thead className="bg-gray-50">
// //                     <tr>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
// //                     </tr>
// //                   </thead>
// //                   <tbody className="bg-white divide-y divide-gray-200">
// //                     {employeeData.map((e) => (
// //                       <tr key={e.emp_id} className="hover:bg-gray-50">
// //                         <td className="px-6 py-4 text-sm font-medium">{e.emp_id}</td>
// //                         <td className="px-6 py-4 text-sm font-semibold">{`${e.first_name} ${e.last_name}`.trim()}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-500">{e.department_name || getDepartmentName(e.department)}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-500">{e.designation || "N/A"}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-500">{formatDate(e.date_of_joining)}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-500">{getGenderDisplay(e.sex)}</td>
// //                         <td className="px-6 py-4 text-sm">
// //                           <div>{e.email}</div>
// //                           <div className="text-gray-500">{e.phone || "N/A"}</div>
// //                         </td>
// //                         <td className="px-6 py-4">
// //                           <button
// //                             onClick={() => handleDelete(e.emp_id)}
// //                             className="text-red-600 hover:text-red-800 text-sm flex items-center"
// //                           >
// //                             <Trash2 className="h-4 w-4 mr-1" /> Delete
// //                           </button>
// //                         </td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </table>
// //               </div>
// //             )}
// //           </div>
// //         );

// //       default:
// //         return null;
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
// //       <div className="container mx-auto px-4 py-8">
// //         <div className="mb-8">
// //           <h1 className="text-4xl font-bold text-gray-900 mb-2">Master Table Settings</h1>
// //           <p className="text-lg text-gray-600">Manage employee data efficiently</p>
// //         </div>

// //         <div className="mb-8 bg-white rounded-t-2xl shadow-sm">
// //           <nav className="flex space-x-8 px-6 -mb-px">
// //             {tabs.map((tab) => {
// //               const Icon = tab.icon;
// //               return (
// //                 <button
// //                   key={tab.id}
// //                   onClick={() => setActiveTab(tab.id)}
// //                   className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all ${
// //                     activeTab === tab.id
// //                       ? "border-blue-500 text-blue-600 bg-blue-50"
// //                       : "border-transparent text-gray-500 hover:text-gray-700"
// //                   }`}
// //                 >
// //                   <Icon className="h-5 w-5" />
// //                   <span>{tab.name}</span>
// //                 </button>
// //               );
// //             })}
// //           </nav>
// //         </div>

// //         <div>{renderTabContent()}</div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default MasterTableSettings;



// // import React, { useState, useEffect } from "react";
// // import {
// //   Upload,
// //   Plus,
// //   Trash2,
// //   FileSpreadsheet,
// //   Users,
// //   Mail,
// //   Phone,
// //   Calendar,
// //   User,
// //   Building2,
// // } from "lucide-react";

// // interface EmployeeData {
// //   emp_id: string;
// //   first_name: string;
// //   last_name: string;
// //   department: number | null;
// //   department_name?: string;
// //   date_of_joining: string;
// //   birth_date: string;
// //   sex: string;
// //   email: string;
// //   phone: string;
// //   designation: string;
// // }

// // interface Department {
// //   department_id: number;
// //   department_name: string;
// // }

// // const MasterTableSettings: React.FC = () => {
// //   const [activeTab, setActiveTab] = useState("overview");
// //   const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
// //   const [departments, setDepartments] = useState<Department[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [uploadFile, setUploadFile] = useState<File | null>(null);
// //   const [uploadLoading, setUploadLoading] = useState(false);
// //   const [formData, setFormData] = useState<EmployeeData>({
// //     emp_id: "",
// //     first_name: "",
// //     last_name: "",
// //     department: null,
// //     designation: "",
// //     date_of_joining: "",
// //     birth_date: "",
// //     sex: "",
// //     email: "",
// //     phone: "",
// //   });

// //   const API_BASE_URL = "http://127.0.0.1:8000";

// //   const tabs = [
// //     { id: "overview", name: "Overview", icon: Users },
// //     { id: "add-data", name: "Add Employee", icon: Plus },
// //     { id: "upload", name: "Upload Excel", icon: Upload },
// //     { id: "employee-list", name: "Employee Records", icon: FileSpreadsheet },
// //   ];

// //   // DESIGNATION OPTIONS (for suggestions)
// //   const designationOptions = [
// //     { value: "CO-DRIVER", label: "CO-DRIVER" },
// //     { value: "DRIVER", label: "DRIVER" },
// //     { value: "HELPER", label: "HELPER" },
// //     { value: "MALI", label: "MALI" },
// //     { value: "OPERATOR", label: "OPERATOR" },
// //     { value: "PANTRY BOY", label: "PANTRY BOY" },
// //     { value: "SUPERVISOR", label: "SUPERVISOR" },
// //     { value: "SWEEPER", label: "SWEEPER" },
// //     { value: "OET", label: "OET" },
// //   ];

// //   const formFields = [
// //     { id: "emp_id", label: "Employee ID", type: "text", required: true, icon: User },
// //     { id: "first_name", label: "First Name", type: "text", required: true, icon: User },
// //     { id: "last_name", label: "Last Name", type: "text", required: false, icon: User },

// //     // COMBOBOX: CHOICES + FREE TYPING
// //     {
// //       id: "designation",
// //       label: "Designation",
// //       type: "text",
// //       required: false,
// //       icon: User,
// //       list: "designation-list",
// //       placeholder: "Type or select (e.g. Software Engineer)",
// //     },

// //     { id: "department", label: "Department", type: "select", required: true, icon: Building2 },
// //     { id: "date_of_joining", label: "Join Date", type: "date", required: true, icon: Calendar },
// //     { id: "birth_date", label: "Birth Date", type: "date", required: false, icon: Calendar },
// //     {
// //       id: "sex",
// //       label: "Gender",
// //       type: "select",
// //       required: false,
// //       icon: User,
// //       options: [
// //         { value: "", label: "Select Gender" },
// //         { value: "M", label: "Male" },
// //         { value: "F", label: "Female" },
// //         { value: "O", label: "Other" },
// //       ],
// //     },
// //     { id: "email", label: "Email Address", type: "email", required: false, icon: Mail },
// //     { id: "phone", label: "Phone Number", type: "tel", required: false, icon: Phone },
// //   ];

// //   // FETCH DATA
// //   const fetchEmployees = async () => {
// //     setLoading(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/mastertable/`);
// //       if (!response.ok) throw new Error("Failed to fetch employees");
// //       const data = await response.json();
// //       setEmployeeData(data);
// //     } catch (error) {
// //       console.error("Error:", error);
// //       alert("Failed to load employees.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchDepartments = async () => {
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/departments/`);
// //       if (!response.ok) throw new Error("Failed to fetch departments");
// //       const data = await response.json();
// //       setDepartments(data);
// //     } catch (error) {
// //       console.warn("Using fallback departments");
// //       setDepartments([
// //         { department_id: 1, department_name: "Engineering" },
// //         { department_id: 2, department_name: "HR" },
// //         { department_id: 3, department_name: "Marketing" },
// //       ]);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchEmployees();
// //     fetchDepartments();
// //   }, []);

// //   const handleInputChange = (field: keyof EmployeeData, value: string) => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       [field]: field === "department" ? (value ? parseInt(value) : null) : value,
// //     }));
// //   };

// //   const handleSubmit = async () => {
// //     const required = ["emp_id", "first_name", "date_of_joining", "department"];
// //     for (const field of required) {
// //       if (!formData[field as keyof EmployeeData]) {
// //         alert(`Please fill in ${field.replace("_", " ")}`);
// //         return;
// //       }
// //     }

// //     setLoading(true);
// //     try {
// //       const submitFormData = new FormData();
// //       submitFormData.append("emp_id", formData.emp_id);
// //       submitFormData.append("first_name", formData.first_name);
// //       submitFormData.append("last_name", formData.last_name || "");
// //       submitFormData.append("email", formData.email);
// //       submitFormData.append("date_of_joining", formData.date_of_joining);
// //       if (formData.department) {
// //         submitFormData.append("department", formData.department.toString());
// //       }
// //       if (formData.birth_date) {
// //         submitFormData.append("birth_date", formData.birth_date);
// //       }
// //       if (formData.sex) {
// //         submitFormData.append("sex", formData.sex);
// //       }
// //       if (formData.phone) {
// //         submitFormData.append("phone", formData.phone);
// //       }
// //       submitFormData.append("designation", formData.designation.trim());

// //       console.log("Submitting FormData:");
// //       for (let [k, v] of submitFormData.entries()) {
// //         console.log(`  ${k}: ${v}`);
// //       }

// //       const response = await fetch(`${API_BASE_URL}/mastertable/`, {
// //         method: "POST",
// //         body: submitFormData,
// //       });

// //       if (!response.ok) {
// //         const errorData = await response.json().catch(() => ({}));
// //         let msg = "Failed to add employee:\n";
// //         if (errorData.emp_id) msg += `ID: ${errorData.emp_id}\n`;
// //         if (errorData.email) msg += `Email: ${errorData.email}\n`;
// //         if (errorData.phone) msg += `Phone: ${errorData.phone}\n`;
// //         if (errorData.detail) msg += `${errorData.detail}\n`;
// //         throw new Error(msg.trim());
// //       }

// //       await fetchEmployees();
// //       alert("Employee added successfully!");
// //       setActiveTab("employee-list");

// //       setFormData({
// //         emp_id: "",
// //         first_name: "",
// //         last_name: "",
// //         department: null,
// //         designation: "",
// //         date_of_joining: "",
// //         birth_date: "",
// //         sex: "",
// //         email: "",
// //         phone: "",
// //       });
// //     } catch (error: any) {
// //       alert(error.message || "Failed to add employee.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // OTHER HANDLERS (delete, upload, etc.) — unchanged
// //   const handleDelete = async (empId: string) => {
// //     if (!window.confirm("Delete this employee?")) return;
// //     setLoading(true);
// //     try {
// //       const res = await fetch(`${API_BASE_URL}/mastertable/${empId}/`, { method: "DELETE" });
// //       if (!res.ok) throw new Error("Delete failed");
// //       await fetchEmployees();
// //       alert("Deleted successfully!");
// //     } catch {
// //       alert("Failed to delete.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleExcelUpload = async () => {
// //     if (!uploadFile) return alert("Select a file");
// //     setUploadLoading(true);
// //     try {
// //       const fd = new FormData();
// //       fd.append("file", uploadFile);
// //       const res = await fetch(`${API_BASE_URL}/mastertable/upload_excel/`, {
// //         method: "POST",
// //         body: fd,
// //       });
// //       const data = await res.json();
// //       if (res.ok) {
// //         let msg = `Created: ${data.created_count}, Updated: ${data.updated_count}`;
// //         if (data.errors?.length) {
// //           msg += "\n\nErrors:\n" + data.errors.map((e: any) => `Row ${e.row}: ${e.error}`).join("\n");
// //         }
// //         alert(msg);
// //         fetchEmployees();
// //       } else {
// //         alert(data.error || "Upload failed");
// //       }
// //     } catch (e: any) {
// //       alert(e.message);
// //     } finally {
// //       setUploadLoading(false);
// //       setUploadFile(null);
// //       const input = document.getElementById("excel-upload") as HTMLInputElement;
// //       if (input) input.value = "";
// //     }
// //   };

// //   const handleDownloadTemplate = async () => {
// //     try {
// //       const res = await fetch(`${API_BASE_URL}/mastertable/download_template/`);
// //       if (!res.ok) throw new Error();
// //       const blob = await res.blob();
// //       const url = URL.createObjectURL(blob);
// //       const a = document.createElement("a");
// //       a.href = url;
// //       a.download = "employee_template.xlsx";
// //       a.click();
// //       URL.revokeObjectURL(url);
// //       alert("Template downloaded!");
// //     } catch {
// //       alert("Download failed");
// //     }
// //   };

// //   const formatDate = (d: string) =>
// //     !d ? "" : new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
// //   const getDepartmentName = (id: number | null) =>
// //     id ? departments.find((d) => d.department_id === id)?.department_name || "Unknown" : "N/A";
// //   const getGenderDisplay = (s: string) => ({ M: "Male", F: "Female", O: "Other" }[s] || "N/A");

// //   const getOverviewStats = () => {
// //     const total = employeeData.length;
// //     const depts = new Set(employeeData.map((e) => e.department_name || getDepartmentName(e.department))).size;
// //     const male = employeeData.filter((e) => e.sex === "M").length;
// //     const female = employeeData.filter((e) => e.sex === "F").length;
// //     return [
// //       { title: "Total Employees", value: total, icon: Users, color: "bg-blue-500" },
// //       { title: "Departments", value: depts, icon: Building2, color: "bg-green-500" },
// //       { title: "Male", value: male, icon: User, color: "bg-purple-500" },
// //       { title: "Female", value: female, icon: User, color: "bg-pink-500" },
// //     ];
// //   };

// //   const getDepartmentStats = () => {
// //     const counts = employeeData.reduce((acc, e) => {
// //       const name = e.department_name || getDepartmentName(e.department);
// //       acc[name] = (acc[name] || 0) + 1;
// //       return acc;
// //     }, {} as Record<string, number>);
// //     return Object.entries(counts).map(([dept, count]) => ({ department: dept, count }));
// //   };

// //   const renderTabContent = () => {
// //     switch (activeTab) {
// //       case "overview":
// //         return (
// //           <div className="space-y-8">
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //               {getOverviewStats().map((s, i) => {
// //                 const Icon = s.icon;
// //                 return (
// //                   <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
// //                     <div className="flex justify-between items-center">
// //                       <div>
// //                         <p className="text-sm text-gray-600">{s.title}</p>
// //                         <p className="text-3xl font-bold">{s.value}</p>
// //                       </div>
// //                       <div className={`${s.color} p-3 rounded-xl`}>
// //                         <Icon className="h-6 w-6 text-white" />
// //                       </div>
// //                     </div>
// //                   </div>
// //                 );
// //               })}
// //             </div>

// //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //               <div className="bg-white rounded-2xl shadow-lg p-6 border">
// //                 <h3 className="text-xl font-semibold mb-4">Department Distribution</h3>
// //                 {getDepartmentStats().map((d, i) => (
// //                   <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl mb-2">
// //                     <span className="font-medium">{d.department}</span>
// //                     <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{d.count}</span>
// //                   </div>
// //                 ))}
// //               </div>

// //               <div className="bg-white rounded-2xl shadow-lg p-6 border">
// //                 <h3 className="text-xl font-semibold mb-4">Recent Additions</h3>
// //                 {employeeData.slice(-3).reverse().map((e, i) => (
// //                   <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl mb-2">
// //                     <User className="h-5 w-5 text-green-600 mr-3" />
// //                     <div>
// //                       {/* FIX #1: Correctly format name in Recent Additions */}
// //                       <p className="font-medium">{[e.first_name, e.last_name].filter(Boolean).join(" ")}</p>
// //                       <p className="text-sm text-gray-600">{e.department_name || getDepartmentName(e.department)}</p>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         );

// //       case "add-data":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg p-8 border">
// //             <div className="flex items-center mb-6">
// //               <Plus className="h-6 w-6 text-blue-600 mr-3" />
// //               <h2 className="text-2xl font-bold">Add New Employee</h2>
// //             </div>

// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //               {formFields.map((field) => {
// //                 const Icon = field.icon;
// //                 return (
// //                   <div key={field.id} className="space-y-2">
// //                     <label className="flex items-center text-sm font-medium text-gray-700">
// //                       <Icon className="h-4 w-4 mr-2 text-gray-500" />
// //                       {field.label}
// //                       {field.required && <span className="text-red-500 ml-1">*</span>}
// //                     </label>

// //                     {/* COMBOBOX FOR DESIGNATION */}
// //                     {field.id === "designation" ? (
// //                       <>
// //                         <input
// //                           type="text"
// //                           list={field.list}
// //                           value={formData.designation}
// //                           onChange={(e) => handleInputChange("designation", e.target.value)}
// //                           placeholder={field.placeholder}
// //                           className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //                         />
// //                         <datalist id="designation-list">
// //                           {designationOptions.map((opt) => (
// //                             <option key={opt.value} value={opt.value}>
// //                               {opt.label}
// //                             </option>
// //                           ))}
// //                         </datalist>
// //                       </>
// //                     ) : field.type === "select" ? (
// //                       <select
// //                         value={formData[field.id as keyof EmployeeData] as string}
// //                         onChange={(e) => handleInputChange(field.id as keyof EmployeeData, e.target.value)}
// //                         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                       >
// //                         {field.id === "department"
// //                           ? departments.map((d) => (
// //                               <option key={d.department_id} value={d.department_id}>
// //                                 {d.department_name}
// //                               </option>
// //                             ))
// //                           : field.options?.map((o) => (
// //                               <option key={o.value} value={o.value}>
// //                                 {o.label}
// //                               </option>
// //                             ))}
// //                       </select>
// //                     ) : (
// //                       <input
// //                         type={field.type}
// //                         value={formData[field.id as keyof EmployeeData] as string}
// //                         onChange={(e) => handleInputChange(field.id as keyof EmployeeData, e.target.value)}
// //                         placeholder={`Enter ${field.label.toLowerCase()}`}
// //                         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //                       />
// //                     )}
// //                   </div>
// //                 );
// //               })}
// //             </div>

// //             <div className="flex justify-end mt-8">
// //               <button
// //                 onClick={handleSubmit}
// //                 disabled={loading}
// //                 className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center"
// //               >
// //                 {loading ? (
// //                   <>Adding...</>
// //                 ) : (
// //                   <>
// //                     <Plus className="h-5 w-5 mr-2" />
// //                     Add Employee
// //                   </>
// //                 )}
// //               </button>
// //             </div>
// //           </div>
// //         );

// //       // ... upload and employee-list tabs unchanged (same as before)
// //       case "upload":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg p-8 border">
// //             <div className="flex items-center mb-6">
// //               <Upload className="h-6 w-6 text-green-600 mr-3" />
// //               <h2 className="text-2xl font-bold">Upload Excel</h2>
// //             </div>
// //             <div className="border-2 border-dashed rounded-xl p-8 text-center">
// //               <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
// //               <input
// //                 id="excel-upload"
// //                 type="file"
// //                 accept=".xlsx,.xls"
// //                 onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
// //                 className="block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:bg-green-50 file:text-green-700"
// //               />
// //             </div>
// //             <div className="flex justify-center gap-4 mt-6">
// //               <button
// //                 onClick={handleExcelUpload}
// //                 disabled={!uploadFile || uploadLoading}
// //                 className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center"
// //               >
// //                 {uploadLoading ? "Uploading..." : <><Upload className="h-5 w-5 mr-2" /> Upload</>}
// //               </button>
// //               <button
// //                 onClick={handleDownloadTemplate}
// //                 className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center"
// //               >
// //                 <FileSpreadsheet className="h-5 w-5 mr-2" /> Template
// //               </button>
// //             </div>
// //             {uploadFile && (
// //               <div className="mt-4 p-3 bg-green-50 rounded-xl text-green-800">
// //                 Selected: {uploadFile.name}
// //               </div>
// //             )}
// //           </div>
// //         );

// //       case "employee-list":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
// //             <div className="p-6 border-b">
// //               <h2 className="text-2xl font-bold flex items-center">
// //                 <FileSpreadsheet className="h-6 w-6 text-purple-600 mr-3" />
// //                 Employee Records
// //                 <span className="ml-3 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
// //                   {employeeData.length}
// //                 </span>
// //               </h2>
// //             </div>
// //             {loading ? (
// //               <div className="p-12 text-center">Loading...</div>
// //             ) : employeeData.length === 0 ? (
// //               <div className="p-12 text-center">
// //                 <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
// //                 <p className="text-xl font-medium mb-2">No employees</p>
// //                 <button onClick={() => setActiveTab("add-data")} className="px-4 py-2 bg-blue-600 text-white rounded-lg mr-2">
// //                   Add Employee
// //                 </button>
// //                 <button onClick={() => setActiveTab("upload")} className="px-4 py-2 border rounded-lg">
// //                   Upload Excel
// //                 </button>
// //               </div>
// //             ) : (
// //               <div className="overflow-x-auto">
// //                 <table className="min-w-full divide-y divide-gray-200">
// //                   <thead className="bg-gray-50">
// //                     <tr>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
// //                     </tr>
// //                   </thead>
// //                   <tbody className="bg-white divide-y divide-gray-200">
// //                     {employeeData.map((e) => (
// //                       <tr key={e.emp_id} className="hover:bg-gray-50">
// //                         <td className="px-6 py-4 text-sm font-medium">{e.emp_id}</td>
// //                         {/* FIX #2: Correctly format name in the main employee table */}
// //                         <td className="px-6 py-4 text-sm font-semibold">{[e.first_name, e.last_name].filter(Boolean).join(" ")}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-500">{e.department_name || getDepartmentName(e.department)}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-500">{e.designation || "N/A"}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-500">{formatDate(e.date_of_joining)}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-500">{getGenderDisplay(e.sex)}</td>
// //                         <td className="px-6 py-4 text-sm">
// //                           <div>{e.email}</div>
// //                           <div className="text-gray-500">{e.phone || "N/A"}</div>
// //                         </td>
// //                         <td className="px-6 py-4">
// //                           <button
// //                             onClick={() => handleDelete(e.emp_id)}
// //                             className="text-red-600 hover:text-red-800 text-sm flex items-center"
// //                           >
// //                             <Trash2 className="h-4 w-4 mr-1" /> Delete
// //                           </button>
// //                         </td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </table>
// //               </div>
// //             )}
// //           </div>
// //         );

// //       default:
// //         return null;
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
// //       <div className="container mx-auto px-4 py-8">
// //         <div className="mb-8">
// //           <h1 className="text-4xl font-bold text-gray-900 mb-2">Master Table Settings</h1>
// //           <p className="text-lg text-gray-600">Manage employee data efficiently</p>
// //         </div>

// //         <div className="mb-8 bg-white rounded-t-2xl shadow-sm">
// //           <nav className="flex space-x-8 px-6 -mb-px">
// //             {tabs.map((tab) => {
// //               const Icon = tab.icon;
// //               return (
// //                 <button
// //                   key={tab.id}
// //                   onClick={() => setActiveTab(tab.id)}
// //                   className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all ${
// //                     activeTab === tab.id
// //                       ? "border-blue-500 text-blue-600 bg-blue-50"
// //                       : "border-transparent text-gray-500 hover:text-gray-700"
// //                   }`}
// //                 >
// //                   <Icon className="h-5 w-5" />
// //                   <span>{tab.name}</span>
// //                 </button>
// //               );
// //             })}
// //           </nav>
// //         </div>

// //         <div>{renderTabContent()}</div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default MasterTableSettings;




// // import React, { useState, useEffect } from "react";
// // import {
// //   Upload,
// //   Plus,
// //   Trash2,
// //   FileSpreadsheet,
// //   Users,
// //   Mail,
// //   Phone,
// //   Calendar,
// //   User,
// //   Building2,
// // } from "lucide-react";

// // interface EmployeeData {
// //   emp_id: string;
// //   first_name: string;
// //   last_name: string;
// //   department: number | null;
// //   department_name?: string;
// //   date_of_joining: string;
// //   birth_date: string;
// //   sex: string;
// //   email: string;
// //   phone: string;
// //   designation: string;
// // }

// // interface Department {
// //   department_id: number;
// //   department_name: string;
// // }

// // const MasterTableSettings: React.FC = () => {
// //   const [activeTab, setActiveTab] = useState("overview");
// //   const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
// //   const [departments, setDepartments] = useState<Department[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [uploadFile, setUploadFile] = useState<File | null>(null);
// //   const [uploadLoading, setUploadLoading] = useState(false);
// //   const [formData, setFormData] = useState<EmployeeData>({
// //     emp_id: "",
// //     first_name: "",
// //     last_name: "",
// //     department: null,
// //     designation: "",
// //     date_of_joining: "",
// //     birth_date: "",
// //     sex: "",
// //     email: "",
// //     phone: "",
// //   });

// //   const API_BASE_URL = "http://127.0.0.1:8000";

// //   const tabs = [
// //     { id: "overview", name: "Overview", icon: Users },
// //     { id: "add-data", name: "Add Employee", icon: Plus },
// //     { id: "upload", name: "Upload Excel", icon: Upload },
// //     { id: "employee-list", name: "Employee Records", icon: FileSpreadsheet },
// //   ];

// //   const designationOptions = [
// //     { value: "CO-DRIVER", label: "CO-DRIVER" },
// //     { value: "DRIVER", label: "DRIVER" },
// //     { value: "HELPER", label: "HELPER" },
// //     { value: "MALI", label: "MALI" },
// //     { value: "OPERATOR", label: "OPERATOR" },
// //     { value: "PANTRY BOY", label: "PANTRY BOY" },
// //     { value: "SUPERVISOR", label: "SUPERVISOR" },
// //     { value: "SWEEPER", label: "SWEEPER" },
// //     { value: "OET", label: "OET" },
// //   ];

// //   const formFields = [
// //     { id: "emp_id", label: "Employee ID", type: "text", required: true, icon: User },
// //     { id: "first_name", label: "First Name", type: "text", required: true, icon: User },
// //     { id: "last_name", label: "Last Name", type: "text", required: false, icon: User },
// //     {
// //       id: "designation",
// //       label: "Designation",
// //       type: "text",
// //       required: false,
// //       icon: User,
// //       list: "designation-list",
// //       placeholder: "Type or select (e.g. Software Engineer)",
// //     },
// //     { id: "department", label: "Department", type: "select", required: true, icon: Building2 },
// //     { id: "date_of_joining", label: "Join Date", type: "date", required: true, icon: Calendar },
// //     { id: "birth_date", label: "Birth Date", type: "date", required: false, icon: Calendar },
// //     {
// //       id: "sex",
// //       label: "Gender",
// //       type: "select",
// //       required: false,
// //       icon: User,
// //       options: [
// //         { value: "", label: "Select Gender" },
// //         { value: "M", label: "Male" },
// //         { value: "F", label: "Female" },
// //         { value: "O", label: "Other" },
// //       ],
// //     },
// //     { id: "email", label: "Email Address", type: "email", required: false, icon: Mail },
// //     { id: "phone", label: "Phone Number", type: "tel", required: false, icon: Phone },
// //   ];

// //   // FETCH DATA
// //   const fetchEmployees = async () => {
// //     setLoading(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/mastertable/`);
// //       if (!response.ok) throw new Error("Failed to fetch employees");
// //       const data = await response.json();
// //       setEmployeeData(data);
// //     } catch (error) {
// //       console.error("Error:", error);
// //       alert("Failed to load employees.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchDepartments = async () => {
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/departments/`);
// //       if (!response.ok) throw new Error("Failed to fetch departments");
// //       const data = await response.json();
// //       setDepartments(data);
// //     } catch (error) {
// //       console.warn("Using fallback departments");
// //       setDepartments([
// //         { department_id: 1, department_name: "Engineering" },
// //         { department_id: 2, department_name: "HR" },
// //         { department_id: 3, department_name: "Marketing" },
// //       ]);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchEmployees();
// //     fetchDepartments();
// //   }, []);

// //   // FIXED: Handle empty department correctly
// //   const handleInputChange = (field: keyof EmployeeData, value: string) => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       [field]: field === "department"
// //         ? (value === "" ? null : parseInt(value))
// //         : value,
// //     }));
// //   };

// //   const handleSubmit = async () => {
// //     const required = ["emp_id", "first_name", "date_of_joining", "department"];
// //     for (const field of required) {
// //       if (!formData[field as keyof EmployeeData]) {
// //         alert(`Please fill in ${field.replace("_", " ")}`);
// //         return;
// //       }
// //     }

// //     setLoading(true);
// //     try {
// //       const submitFormData = new FormData();
// //       submitFormData.append("emp_id", formData.emp_id);
// //       submitFormData.append("first_name", formData.first_name);
// //       submitFormData.append("last_name", formData.last_name || "");
// //       submitFormData.append("email", formData.email);
// //       submitFormData.append("date_of_joining", formData.date_of_joining);
// //       if (formData.department) {
// //         submitFormData.append("department", formData.department.toString());
// //       }
// //       if (formData.birth_date) {
// //         submitFormData.append("birth_date", formData.birth_date);
// //       }
// //       if (formData.sex) {
// //         submitFormData.append("sex", formData.sex);
// //       }
// //       if (formData.phone) {
// //         submitFormData.append("phone", formData.phone);
// //       }
// //       submitFormData.append("designation", formData.designation.trim());

// //       const response = await fetch(`${API_BASE_URL}/mastertable/`, {
// //         method: "POST",
// //         body: submitFormData,
// //       });

// //       if (!response.ok) {
// //         const errorData = await response.json().catch(() => ({}));
// //         let msg = "Failed to add employee:\n";
// //         if (errorData.emp_id) msg += `ID: ${errorData.emp_id}\n`;
// //         if (errorData.email) msg += `Email: ${errorData.email}\n`;
// //         if (errorData.phone) msg += `Phone: ${errorData.phone}\n`;
// //         if (errorData.detail) msg += `${errorData.detail}\n`;
// //         throw new Error(msg.trim());
// //       }

// //       await fetchEmployees();
// //       alert("Employee added successfully!");
// //       setActiveTab("employee-list");

// //       // Reset form
// //       setFormData({
// //         emp_id: "",
// //         first_name: "",
// //         last_name: "",
// //         department: null,
// //         designation: "",
// //         date_of_joining: "",
// //         birth_date: "",
// //         sex: "",
// //         email: "",
// //         phone: "",
// //       });
// //     } catch (error: any) {
// //       alert(error.message || "Failed to add employee.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleDelete = async (empId: string) => {
// //     if (!window.confirm("Delete this employee?")) return;
// //     setLoading(true);
// //     try {
// //       const res = await fetch(`${API_BASE_URL}/mastertable/${empId}/`, { method: "DELETE" });
// //       if (!res.ok) throw new Error("Delete failed");
// //       await fetchEmployees();
// //       alert("Deleted successfully!");
// //     } catch {
// //       alert("Failed to delete.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleExcelUpload = async () => {
// //     if (!uploadFile) return alert("Select a file");
// //     setUploadLoading(true);
// //     try {
// //       const fd = new FormData();
// //       fd.append("file", uploadFile);
// //       const res = await fetch(`${API_BASE_URL}/mastertable/upload_excel/`, {
// //         method: "POST",
// //         body: fd,
// //       });
// //       const data = await res.json();
// //       if (res.ok) {
// //         let msg = `Created: ${data.created_count}, Updated: ${data.updated_count}`;
// //         if (data.errors?.length) {
// //           msg += "\n\nErrors:\n" + data.errors.map((e: any) => `Row ${e.row}: ${e.error}`).join("\n");
// //         }
// //         alert(msg);
// //         fetchEmployees();
// //       } else {
// //         alert(data.error || "Upload failed");
// //       }
// //     } catch (e: any) {
// //       alert(e.message);
// //     } finally {
// //       setUploadLoading(false);
// //       setUploadFile(null);
// //       const input = document.getElementById("excel-upload") as HTMLInputElement;
// //       if (input) input.value = "";
// //     }
// //   };

// //   const handleDownloadTemplate = async () => {
// //     try {
// //       const res = await fetch(`${API_BASE_URL}/mastertable/download_template/`);
// //       if (!res.ok) throw new Error();
// //       const blob = await res.blob();
// //       const url = URL.createObjectURL(blob);
// //       const a = document.createElement("a");
// //       a.href = url;
// //       a.download = "employee_template.xlsx";
// //       a.click();
// //       URL.revokeObjectURL(url);
// //       alert("Template downloaded!");
// //     } catch {
// //       alert("Download failed");
// //     }
// //   };

// //   const formatDate = (d: string) =>
// //     !d ? "" : new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
// //   const getDepartmentName = (id: number | null) =>
// //     id ? departments.find((d) => d.department_id === id)?.department_name || "Unknown" : "N/A";
// //   const getGenderDisplay = (s: string) => ({ M: "Male", F: "Female", O: "Other" }[s] || "N/A");

// //   const getOverviewStats = () => {
// //     const total = employeeData.length;
// //     const depts = new Set(employeeData.map((e) => e.department_name || getDepartmentName(e.department))).size;
// //     const male = employeeData.filter((e) => e.sex === "M").length;
// //     const female = employeeData.filter((e) => e.sex === "F").length;
// //     return [
// //       { title: "Total Employees", value: total, icon: Users, color: "bg-blue-500" },
// //       { title: "Departments", value: depts, icon: Building2, color: "bg-green-500" },
// //       { title: "Male", value: male, icon: User, color: "bg-purple-500" },
// //       { title: "Female", value: female, icon: User, color: "bg-pink-500" },
// //     ];
// //   };

// //   const getDepartmentStats = () => {
// //     const counts = employeeData.reduce((acc, e) => {
// //       const name = e.department_name || getDepartmentName(e.department);
// //       acc[name] = (acc[name] || 0) + 1;
// //       return acc;
// //     }, {} as Record<string, number>);
// //     return Object.entries(counts).map(([dept, count]) => ({ department: dept, count }));
// //   };

// //   const renderTabContent = () => {
// //     switch (activeTab) {
// //       case "overview":
// //         return (
// //           <div className="space-y-8">
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //               {getOverviewStats().map((s, i) => {
// //                 const Icon = s.icon;
// //                 return (
// //                   <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
// //                     <div className="flex justify-between items-center">
// //                       <div>
// //                         <p className="text-sm text-gray-600">{s.title}</p>
// //                         <p className="text-3xl font-bold">{s.value}</p>
// //                       </div>
// //                       <div className={`${s.color} p-3 rounded-xl`}>
// //                         <Icon className="h-6 w-6 text-white" />
// //                       </div>
// //                     </div>
// //                   </div>
// //                 );
// //               })}
// //             </div>

// //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //               <div className="bg-white rounded-2xl shadow-lg p-6 border">
// //                 <h3 className="text-xl font-semibold mb-4">Department Distribution</h3>
// //                 {getDepartmentStats().map((d, i) => (
// //                   <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl mb-2">
// //                     <span className="font-medium">{d.department}</span>
// //                     <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{d.count}</span>
// //                   </div>
// //                 ))}
// //               </div>

// //               <div className="bg-white rounded-2xl shadow-lg p-6 border">
// //                 <h3 className="text-xl font-semibold mb-4">Recent Additions</h3>
// //                 {employeeData.slice(-3).reverse().map((e, i) => (
// //                   <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl mb-2">
// //                     <User className="h-5 w-5 text-green-600 mr-3" />
// //                     <div>
// //                       <p className="font-medium">{[e.first_name, e.last_name].filter(Boolean).join(" ")}</p>
// //                       <p className="text-sm text-gray-600">{e.department_name || getDepartmentName(e.department)}</p>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         );

// //       case "add-data":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg p-8 border">
// //             <div className="flex items-center mb-6">
// //               <Plus className="h-6 w-6 text-blue-600 mr-3" />
// //               <h2 className="text-2xl font-bold">Add New Employee</h2>
// //             </div>

// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //               {formFields.map((field) => {
// //                 const Icon = field.icon;
// //                 return (
// //                   <div key={field.id} className="space-y-2">
// //                     <label className="flex items-center text-sm font-medium text-gray-700">
// //                       <Icon className="h-4 w-4 mr-2 text-gray-500" />
// //                       {field.label}
// //                       {field.required && <span className="text-red-500 ml-1">*</span>}
// //                     </label>

// //                     {/* DESIGNATION COMBOBOX */}
// //                     {field.id === "designation" ? (
// //                       <>
// //                         <input
// //                           type="text"
// //                           list={field.list}
// //                           value={formData.designation}
// //                           onChange={(e) => handleInputChange("designation", e.target.value)}
// //                           placeholder={field.placeholder}
// //                           className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //                         />
// //                         <datalist id="designation-list">
// //                           {designationOptions.map((opt) => (
// //                             <option key={opt.value} value={opt.value}>
// //                               {opt.label}
// //                             </option>
// //                           ))}
// //                         </datalist>
// //                       </>
// //                     ) 
// //                     // DEPARTMENT SELECT WITH PLACEHOLDER
// //                     : field.id === "department" ? (
// //                       <select
// //                         value={formData.department ?? ""}
// //                         onChange={(e) => handleInputChange("department", e.target.value)}
// //                         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                         required
// //                       >
// //                         <option value="" disabled>
// //                           Select Department
// //                         </option>
// //                         {departments.map((d) => (
// //                           <option key={d.department_id} value={d.department_id}>
// //                             {d.department_name}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     ) 
// //                     // GENDER SELECT
// //                     : field.type === "select" ? (
// //                       <select
// //                         value={formData[field.id as keyof EmployeeData] as string}
// //                         onChange={(e) => handleInputChange(field.id as keyof EmployeeData, e.target.value)}
// //                         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                       >
// //                         {field.options?.map((o) => (
// //                           <option key={o.value} value={o.value}>
// //                             {o.label}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     ) 
// //                     // TEXT / DATE / EMAIL / TEL
// //                     : (
// //                       <input
// //                         type={field.type}
// //                         value={formData[field.id as keyof EmployeeData] as string}
// //                         onChange={(e) => handleInputChange(field.id as keyof EmployeeData, e.target.value)}
// //                         placeholder={`Enter ${field.label.toLowerCase()}`}
// //                         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //                         required={field.required}
// //                       />
// //                     )}
// //                   </div>
// //                 );
// //               })}
// //             </div>

// //             <div className="flex justify-end mt-8">
// //               <button
// //                 onClick={handleSubmit}
// //                 disabled={loading}
// //                 className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center"
// //               >
// //                 {loading ? (
// //                   <>Adding...</>
// //                 ) : (
// //                   <>
// //                     <Plus className="h-5 w-5 mr-2" />
// //                     Add Employee
// //                   </>
// //                 )}
// //               </button>
// //             </div>
// //           </div>
// //         );

// //       case "upload":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg p-8 border">
// //             <div className="flex items-center mb-6">
// //               <Upload className="h-6 w-6 text-green-600 mr-3" />
// //               <h2 className="text-2xl font-bold">Upload Excel</h2>
// //             </div>
// //             <div className="border-2 border-dashed rounded-xl p-8 text-center">
// //               <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
// //               <input
// //                 id="excel-upload"
// //                 type="file"
// //                 accept=".xlsx,.xls"
// //                 onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
// //                 className="block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:bg-green-50 file:text-green-700"
// //               />
// //             </div>
// //             <div className="flex justify-center gap-4 mt-6">
// //               <button
// //                 onClick={handleExcelUpload}
// //                 disabled={!uploadFile || uploadLoading}
// //                 className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center"
// //               >
// //                 {uploadLoading ? "Uploading..." : <><Upload className="h-5 w-5 mr-2" /> Upload</>}
// //               </button>
// //               <button
// //                 onClick={handleDownloadTemplate}
// //                 className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center"
// //               >
// //                 <FileSpreadsheet className="h-5 w-5 mr-2" /> Template
// //               </button>
// //             </div>
// //             {uploadFile && (
// //               <div className="mt-4 p-3 bg-green-50 rounded-xl text-green-800">
// //                 Selected: {uploadFile.name}
// //               </div>
// //             )}
// //           </div>
// //         );

// // case "employee-list":
// //   return (
// //     <div className="bg-white rounded-2xl shadow-lg border overflow-hidden flex flex-col h-[680px]">
// //       {/* Fixed Header */}
// //       <div className="p-6 border-b bg-white">
// //         <h2 className="text-2xl font-bold flex items-center">
// //           <FileSpreadsheet className="h-6 w-6 text-purple-600 mr-3" />
// //           Employee Records
// //           <span className="ml-3 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
// //             {employeeData.length}
// //           </span>
// //         </h2>
// //       </div>

// //       {loading ? (
// //         <div className="flex-1 flex items-center justify-center">
// //           <div className="text-xl text-gray-500">Loading employees...</div>
// //         </div>
// //       ) : employeeData.length === 0 ? (
// //         <div className="flex-1 flex flex-col items-center justify-center p-12">
// //           <Users className="h-16 w-16 text-gray-400 mb-4" />
// //           <p className="text-xl font-medium mb-4">No employees yet</p>
// //           <div className="space-x-3">
// //             <button
// //               onClick={() => setActiveTab("add-data")}
// //               className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
// //             >
// //               Add Employee
// //             </button>
// //             <button
// //               onClick={() => setActiveTab("upload")}
// //               className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
// //             >
// //               Upload Excel
// //             </button>
// //           </div>
// //         </div>
// //       ) : (
// //         <>
// //           {/* Scrollable Table Body */}
// //           <div className="flex-1 overflow-y-auto">
// //             <table className="min-w-full divide-y divide-gray-200">
// //               <thead className="bg-gray-50 sticky top-0 z-10">
// //                 <tr>
// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
// //                     ID
// //                   </th>
// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
// //                     Name
// //                   </th>
// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
// //                     Department
// //                   </th>
// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
// //                     Designation
// //                   </th>
// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
// //                     Join Date
// //                   </th>
// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
// //                     Gender
// //                   </th>
// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
// //                     Contact
// //                   </th>
// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
// //                     Actions
// //                   </th>
// //                 </tr>
// //               </thead>
// //               <tbody className="bg-white divide-y divide-gray-200">
// //                 {employeeData.map((e) => (
// //                   <tr key={e.emp_id} className="hover:bg-gray-50 transition-colors">
// //                     <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.emp_id}</td>
// //                     <td className="px-6 py-4 text-sm font-semibold">
// //                       {[e.first_name, e.last_name].filter(Boolean).join(" ")}
// //                     </td>
// //                     <td className="px-6 py-4 text-sm text-gray-600">
// //                       {e.department_name || getDepartmentName(e.department)}
// //                     </td>
// //                     <td className="px-6 py-4 text-sm text-gray-600">{e.designation || "—"}</td>
// //                     <td className="px-6 py-4 text-sm text-gray-600">{formatDate(e.date_of_joining)}</td>
// //                     <td className="px-6 py-4 text-sm text-gray-600">{getGenderDisplay(e.sex)}</td>
// //                     <td className="px-6 py-4 text-sm">
// //                       <div className="text-gray-800">{e.email}</div>
// //                       <div className="text-gray-500 text-xs">{e.phone || "—"}</div>
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       <button
// //                         onClick={() => handleDelete(e.emp_id)}
// //                         className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
// //                       >
// //                         <Trash2 className="h-4 w-4" /> Delete
// //                       </button>
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );

// //       default:
// //         return null;
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
// //       <div className="container mx-auto px-4 py-8">
// //         <div className="mb-8">
// //           <h1 className="text-4xl font-bold text-gray-900 mb-2">Master Table Settings</h1>
// //           <p className="text-lg text-gray-600">Manage employee data efficiently</p>
// //         </div>

// //         <div className="mb-8 bg-white rounded-t-2xl shadow-sm">
// //           <nav className="flex space-x-8 px-6 -mb-px">
// //             {tabs.map((tab) => {
// //               const Icon = tab.icon;
// //               return (
// //                 <button
// //                   key={tab.id}
// //                   onClick={() => setActiveTab(tab.id)}
// //                   className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all ${
// //                     activeTab === tab.id
// //                       ? "border-blue-500 text-blue-600 bg-blue-50"
// //                       : "border-transparent text-gray-500 hover:text-gray-700"
// //                   }`}
// //                 >
// //                   <Icon className="h-5 w-5" />
// //                   <span>{tab.name}</span>
// //                 </button>
// //               );
// //             })}
// //           </nav>
// //         </div>

// //         <div>{renderTabContent()}</div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default MasterTableSettings;



// // import React, { useState, useEffect } from "react";
// // import {
// //   Upload,
// //   Plus,
// //   Trash2,
// //   FileSpreadsheet,
// //   Users,
// //   Mail,
// //   Phone,
// //   Calendar,
// //   User,
// //   Building2,
// //   Briefcase,
// // } from "lucide-react";

// // interface EmployeeData {
// //   emp_id: string;
// //   first_name: string;
// //   last_name: string;
// //   department: number | null;
// //   department_name?: string;
// //   sub_department: string;
// //   sub_department_display?: string;
// //   designation: string;
// //   designation_display?: string;
// //   date_of_joining: string;
// //   birth_date: string;
// //   sex: string;
// //   sex_display?: string;
// //   email: string;
// //   phone: string;
// // }

// // interface Department {
// //   department_id: number;
// //   department_name: string;
// // }

// // const MasterTableSettings: React.FC = () => {
// //   const [activeTab, setActiveTab] = useState("overview");
// //   const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
// //   const [departments, setDepartments] = useState<Department[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [uploadFile, setUploadFile] = useState<File | null>(null);
// //   const [uploadLoading, setUploadLoading] = useState(false);

// //   const [formData, setFormData] = useState<EmployeeData>({
// //     emp_id: "",
// //     first_name: "",
// //     last_name: "",
// //     department: null,
// //     sub_department: "",
// //     designation: "",
// //     date_of_joining: "",
// //     birth_date: "",
// //     sex: "",
// //     email: "",
// //     phone: "",
// //   });

// //   const API_BASE_URL = "http://127.0.0.1:8000";

// //   const tabs = [
// //     { id: "overview", name: "Overview", icon: Users },
// //     { id: "add-data", name: "Add Employee", icon: Plus },
// //     { id: "upload", name: "Upload Excel", icon: Upload },
// //     { id: "employee-list", name: "Employee Records", icon: FileSpreadsheet },
// //   ];

// //   // DESIGNATION: Short Code → Label
// //   const designationOptions = [
// //     { value: "", label: "--- Select Designation ---" },
// //     { value: "COD", label: "CO- DRIVER" },
// //     { value: "DRV", label: "DRIVER" },
// //     { value: "HLP", label: "HELPER" },
// //     { value: "MAL", label: "MALI" },
// //     { value: "OPR", label: "OPERATOR" },
// //     { value: "PNB", label: "PANTRY BOY" },
// //     { value: "SPV", label: "SUPERVISOR" },
// //     { value: "SWP", label: "SWEEPER" },
// //     { value: "OET", label: "OET" },
// //     { value: "OE", label: "OE" },
// //     { value: "Sr.OE", label: "Sr.OE" },
// //   ];

// //   // SUB-DEPARTMENTS
// //   const PRODUCTION_SUB_DEPARTMENTS = [
// //     { value: "", label: "--- Select Sub-Department ---" },
// //     { value: "ACTUATOR", label: "ACTUATOR" },
// //     { value: "E/MIRROR", label: "E/MIRROR" },
// //     { value: "IMM", label: "IMM" },
// //     { value: "MIRROR", label: "MIRROR" },
// //     { value: "OFF LINE", label: "OFF LINE" },
// //     { value: "PAINT SHOP", label: "PAINT SHOP" },
// //     { value: "Power Folding", label: "Power Folding" },
// //   ];

// //   const QUALITY_SUB_DEPARTMENTS = [
// //     { value: "", label: "--- Select Sub-Department ---" },
// //     { value: "IMM PQA", label: "IMM PQA" },
// //     { value: "PAINT SHOP PQA", label: "PAINT SHOP PQA" },
// //     { value: "E/MIRROR PQA", label: "E/MIRROR PQA" },
// //     { value: "OFF LINE PQA", label: "OFF LINE PQA" },
// //     { value: "IQC", label: "IQC" },
// //     { value: "IFC", label: "IFC" },
// //     { value: "QA DISP. PDI", label: "QA DISP. PDI" },
// //     { value: "QUALITY ASSURANCE", label: "QUALITY ASSURANCE" },
// //   ];

// //   // Get current department name
// //   const getCurrentDepartmentName = (): string | null => {
// //     if (!formData.department) return null;
// //     return departments.find((d) => d.department_id === formData.department)?.department_name || null;
// //   };

// //   const currentDeptName = getCurrentDepartmentName();

// //   // Dynamic sub-department options
// //   const getSubDepartmentOptions = () => {
// //     if (!currentDeptName) {
// //       return [{ value: "", label: "— Select Department First —" }];
// //     }
// //     if (currentDeptName === "Production") return PRODUCTION_SUB_DEPARTMENTS;
// //     if (currentDeptName === "Quality") return QUALITY_SUB_DEPARTMENTS;
// //     return [{ value: "", label: "— Not Applicable —" }];
// //   };

// //   const subDepartmentOptions = getSubDepartmentOptions();

// //   // Form fields
// //   const formFields = [
// //     { id: "emp_id", label: "Employee ID", type: "text", required: true, icon: User },
// //     { id: "first_name", label: "First Name", type: "text", required: false, icon: User },
// //     { id: "last_name", label: "Last Name", type: "text", required: false, icon: User },
// //     {
// //       id: "designation",
// //       label: "Designation",
// //       type: "select",
// //       required: false,
// //       icon: Briefcase,
// //       options: designationOptions,
// //     },
// //     { id: "department", label: "Department", type: "select", required: false, icon: Building2 },
// //     {
// //       id: "sub_department",
// //       label: "Sub-Department",
// //       type: "select",
// //       required: false,
// //       icon: Building2,
// //       options: subDepartmentOptions,
// //       disabled: !currentDeptName || (currentDeptName !== "Production" && currentDeptName !== "Quality"),
// //     },
// //     { id: "date_of_joining", label: "Join Date", type: "date", required: false, icon: Calendar },
// //     { id: "birth_date", label: "Birth Date", type: "date", required: false, icon: Calendar },
// //     {
// //       id: "sex",
// //       label: "Gender",
// //       type: "select",
// //       required: false,
// //       icon: User,
// //       options: [
// //         { value: "", label: "Select Gender" },
// //         { value: "M", label: "Male" },
// //         { value: "F", label: "Female" },
// //         { value: "O", label: "Other" },
// //       ],
// //     },
// //     { id: "email", label: "Email Address", type: "email", required: false, icon: Mail },
// //     { id: "phone", label: "Phone Number", type: "tel", required: false, icon: Phone },
// //   ];

// //   // FETCH DATA
// //   const fetchEmployees = async () => {
// //     setLoading(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/mastertable/`);
// //       if (!response.ok) throw new Error("Failed to fetch employees");
// //       const data = await response.json();
// //       setEmployeeData(data);
// //     } catch (error) {
// //       console.error("Error:", error);
// //       alert("Failed to load employees.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchDepartments = async () => {
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/departments/`);
// //       if (!response.ok) throw new Error("Failed to fetch departments");
// //       const data = await response.json();
// //       setDepartments(data);
// //     } catch (error) {
// //       console.warn("Using fallback departments");
// //       setDepartments([
// //         { department_id: 1, department_name: "Production" },
// //         { department_id: 2, department_name: "Quality" },
// //         { department_id: 3, department_name: "HR" },
// //         { department_id: 4, department_name: "IT" },
// //       ]);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchEmployees();
// //     fetchDepartments();
// //   }, []);

// //   // Reset sub_department when department changes
// //   useEffect(() => {
// //     setFormData((prev) => ({ ...prev, sub_department: "" }));
// //   }, [formData.department]);

// //   const handleInputChange = (field: keyof EmployeeData, value: string) => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       [field]: field === "department" ? (value === "" ? null : parseInt(value)) : value,
// //     }));
// //   };

// //   const handleSubmit = async () => {
// //     if (!formData.emp_id.trim()) {
// //       alert("Employee ID is required");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const submitData: any = { emp_id: formData.emp_id.trim() };

// //       const optionalFields: (keyof EmployeeData)[] = [
// //         "first_name", "last_name", "designation", "sub_department",
// //         "date_of_joining", "birth_date", "sex", "email", "phone"
// //       ];
// //       optionalFields.forEach((f) => {
// //         const val = formData[f];
// //         if (val && String(val).trim()) {
// //           submitData[f] = f === "email" || f === "phone" || f === "first_name" || f === "last_name"
// //             ? String(val).trim()
// //             : val;
// //         }
// //       });
// //       if (formData.department) submitData.department = formData.department;

// //       const response = await fetch(`${API_BASE_URL}/mastertable/`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(submitData),
// //       });

// //       if (!response.ok) {
// //         const errorData = await response.json().catch(() => ({}));
// //         let msg = "Failed to save:\n";
// //         Object.entries(errorData).forEach(([k, v]) => {
// //           msg += `${k}: ${Array.isArray(v) ? v.join("; ") : v}\n`;
// //         });
// //         throw new Error(msg.trim());
// //       }

// //       await fetchEmployees();
// //       alert("Employee saved successfully!");
// //       setActiveTab("employee-list");
// //       resetForm();
// //     } catch (error: any) {
// //       alert(error.message || "Failed to save.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const resetForm = () => {
// //     setFormData({
// //       emp_id: "",
// //       first_name: "",
// //       last_name: "",
// //       department: null,
// //       sub_department: "",
// //       designation: "",
// //       date_of_joining: "",
// //       birth_date: "",
// //       sex: "",
// //       email: "",
// //       phone: "",
// //     });
// //   };

// //   const handleDelete = async (empId: string) => {
// //     if (!window.confirm("Delete this employee?")) return;
// //     setLoading(true);
// //     try {
// //       const res = await fetch(`${API_BASE_URL}/mastertable/${empId}/`, { method: "DELETE" });
// //       if (!res.ok) throw new Error("Delete failed");
// //       await fetchEmployees();
// //       alert("Deleted successfully!");
// //     } catch {
// //       alert("Failed to delete.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleExcelUpload = async () => {
// //     if (!uploadFile) return alert("Select a file");
// //     setUploadLoading(true);
// //     try {
// //       const fd = new FormData();
// //       fd.append("file", uploadFile);
// //       const res = await fetch(`${API_BASE_URL}/mastertable/upload_excel/`, {
// //         method: "POST",
// //         body: fd,
// //       });
// //       const data = await res.json();
// //       if (res.ok) {
// //         let msg = `Created: ${data.created_count}, Updated: ${data.updated_count}`;
// //         if (data.errors?.length) {
// //           msg += "\n\nErrors:\n" + data.errors.map((e: any) => `Row ${e.row}: ${e.error}`).join("\n");
// //         }
// //         alert(msg);
// //         fetchEmployees();
// //       } else {
// //         alert(data.error || "Upload failed");
// //       }
// //     } catch (e: any) {
// //       alert(e.message);
// //     } finally {
// //       setUploadLoading(false);
// //       setUploadFile(null);
// //       const input = document.getElementById("excel-upload") as HTMLInputElement;
// //       if (input) input.value = "";
// //     }
// //   };

// //   const handleDownloadTemplate = async () => {
// //     try {
// //       const res = await fetch(`${API_BASE_URL}/mastertable/download_template/`);
// //       if (!res.ok) throw new Error();
// //       const blob = await res.blob();
// //       const url = URL.createObjectURL(blob);
// //       const a = document.createElement("a");
// //       a.href = url;
// //       a.download = "employee_template.xlsx";
// //       a.click();
// //       URL.revokeObjectURL(url);
// //     } catch {
// //       alert("Download failed");
// //     }
// //   };

// //   const formatDate = (d: string) =>
// //     !d ? "" : new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

// //   const getDepartmentName = (id: number | null) =>
// //     id ? departments.find((d) => d.department_id === id)?.department_name || "Unknown" : "—";

// //   const getOverviewStats = () => {
// //     const total = employeeData.length;
// //     const depts = new Set(employeeData.map((e) => e.department_name || getDepartmentName(e.department))).size;
// //     const male = employeeData.filter((e) => e.sex === "M").length;
// //     const female = employeeData.filter((e) => e.sex === "F").length;
// //     return [
// //       { title: "Total Employees", value: total, icon: Users, color: "bg-blue-500" },
// //       { title: "Departments", value: depts, icon: Building2, color: "bg-green-500" },
// //       { title: "Male", value: male, icon: User, color: "bg-purple-500" },
// //       { title: "Female", value: female, icon: User, color: "bg-pink-500" },
// //     ];
// //   };

// //   const getDepartmentStats = () => {
// //     const counts = employeeData.reduce((acc, e) => {
// //       const name = e.department_name || getDepartmentName(e.department);
// //       acc[name] = (acc[name] || 0) + 1;
// //       return acc;
// //     }, {} as Record<string, number>);
// //     return Object.entries(counts).map(([dept, count]) => ({ department: dept, count }));
// //   };

// //   const renderTabContent = () => {
// //     switch (activeTab) {
// //       case "overview":
// //         return (
// //           <div className="space-y-8">
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //               {getOverviewStats().map((s, i) => {
// //                 const Icon = s.icon;
// //                 return (
// //                   <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
// //                     <div className="flex justify-between items-center">
// //                       <div>
// //                         <p className="text-sm text-gray-600">{s.title}</p>
// //                         <p className="text-3xl font-bold">{s.value}</p>
// //                       </div>
// //                       <div className={`${s.color} p-3 rounded-xl`}>
// //                         <Icon className="h-6 w-6 text-white" />
// //                       </div>
// //                     </div>
// //                   </div>
// //                 );
// //               })}
// //             </div>

// //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //               <div className="bg-white rounded-2xl shadow-lg p-6 border">
// //                 <h3 className="text-xl font-semibold mb-4">Department Distribution</h3>
// //                 {getDepartmentStats().map((d, i) => (
// //                   <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl mb-2">
// //                     <span className="font-medium">{d.department}</span>
// //                     <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{d.count}</span>
// //                   </div>
// //                 ))}
// //               </div>

// //               <div className="bg-white rounded-2xl shadow-lg p-6 border">
// //                 <h3 className="text-xl font-semibold mb-4">Recent Additions</h3>
// //                 {employeeData.slice(-3).reverse().map((e, i) => (
// //                   <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl mb-2">
// //                     <User className="h-5 w-5 text-green-600 mr-3" />
// //                     <div>
// //                       <p className="font-medium">{[e.first_name, e.last_name].filter(Boolean).join(" ")}</p>
// //                       <p className="text-sm text-gray-600">
// //                         {e.sub_department_display || e.sub_department || "—"}, {e.department_name || getDepartmentName(e.department)}
// //                       </p>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         );

// //       case "add-data":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg p-8 border">
// //             <div className="flex items-center mb-6">
// //               <Plus className="h-6 w-6 text-blue-600 mr-3" />
// //               <h2 className="text-2xl font-bold">Add / Update Employee</h2>
// //             </div>

// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //               {formFields.map((field) => {
// //                 const Icon = field.icon;
// //                 return (
// //                   <div key={field.id} className="space-y-2">
// //                     <label className="flex items-center text-sm font-medium text-gray-700">
// //                       <Icon className="h-4 w-4 mr-2 text-gray-500" />
// //                       {field.label}
// //                       {field.required && <span className="text-red-500 ml-1">*</span>}
// //                     </label>

// //                     {/* DEPARTMENT SELECT */}
// //                     {field.id === "department" ? (
// //                       <select
// //                         value={formData.department ?? ""}
// //                         onChange={(e) => handleInputChange("department", e.target.value)}
// //                         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //                       >
// //                         <option value="">Select Department (Optional)</option>
// //                         {departments.map((d) => (
// //                           <option key={d.department_id} value={d.department_id}>
// //                             {d.department_name}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     )
// //                     /* SUB-DEPARTMENT SELECT */
// //                     : field.id === "sub_department" ? (
// //                       <select
// //                         value={formData.sub_department}
// //                         onChange={(e) => handleInputChange("sub_department", e.target.value)}
// //                         disabled={field.disabled}
// //                         className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
// //                           field.disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
// //                         }`}
// //                       >
// //                         {field.options.map((o) => (
// //                           <option key={o.value} value={o.value} disabled={o.value === "" && field.disabled}>
// //                             {o.label}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     )
// //                     /* OTHER SELECTS */
// //                     : field.type === "select" ? (
// //                       <select
// //                         value={formData[field.id as keyof EmployeeData] as string}
// //                         onChange={(e) => handleInputChange(field.id as keyof EmployeeData, e.target.value)}
// //                         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //                       >
// //                         {field.options?.map((o) => (
// //                           <option key={o.value} value={o.value}>
// //                             {o.label}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     )
// //                     /* INPUT FIELDS */
// //                     : (
// //                       <input
// //                         type={field.type}
// //                         value={formData[field.id as keyof EmployeeData] as string}
// //                         onChange={(e) => handleInputChange(field.id as keyof EmployeeData, e.target.value)}
// //                         placeholder={`Enter ${field.label.toLowerCase()}`}
// //                         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //                         required={field.required}
// //                       />
// //                     )}
// //                   </div>
// //                 );
// //               })}
// //             </div>

// //             <div className="flex justify-end mt-8 space-x-3">
// //               <button
// //                 onClick={resetForm}
// //                 className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
// //               >
// //                 Clear
// //               </button>
// //               <button
// //                 onClick={handleSubmit}
// //                 disabled={loading}
// //                 className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center"
// //               >
// //                 {loading ? (
// //                   <>Saving...</>
// //                 ) : (
// //                   <>
// //                     <Plus className="h-5 w-5 mr-2" />
// //                     Save Employee
// //                   </>
// //                 )}
// //               </button>
// //             </div>
// //           </div>
// //         );

// //       case "upload":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg p-8 border">
// //             <div className="flex items-center mb-6">
// //               <Upload className="h-6 w-6 text-green-600 mr-3" />
// //               <h2 className="text-2xl font-bold">Upload Excel</h2>
// //             </div>
// //             <div className="border-2 border-dashed rounded-xl p-8 text-center">
// //               <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
// //               <p className="text-sm text-gray-600 mb-4">
// //                 Use <code className="bg-gray-100 px-2 py-1 rounded">sub_department</code> = <code>ACTUATOR</code>, <code>SOE</code>, etc.
// //               </p>
// //               <input
// //                 id="excel-upload"
// //                 type="file"
// //                 accept=".xlsx,.xls"
// //                 onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
// //                 className="block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:bg-green-50 file:text-green-700"
// //               />
// //             </div>
// //             <div className="flex justify-center gap-4 mt-6">
// //               <button
// //                 onClick={handleExcelUpload}
// //                 disabled={!uploadFile || uploadLoading}
// //                 className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center"
// //               >
// //                 {uploadLoading ? "Uploading..." : <><Upload className="h-5 w-5 mr-2" /> Upload</>}
// //               </button>
// //               <button
// //                 onClick={handleDownloadTemplate}
// //                 className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 flex items-center"
// //               >
// //                 <FileSpreadsheet className="h-5 w-5 mr-2" /> Download Template
// //               </button>
// //             </div>
// //             {uploadFile && (
// //               <div className="mt-4 p-3 bg-green-50 rounded-xl text-green-800">
// //                 Selected: {uploadFile.name}
// //               </div>
// //             )}
// //           </div>
// //         );

// //       case "employee-list":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg border overflow-hidden flex flex-col h-[680px]">
// //             <div className="p-6 border-b bg-white">
// //               <h2 className="text-2xl font-bold flex items-center">
// //                 <FileSpreadsheet className="h-6 w-6 text-purple-600 mr-3" />
// //                 Employee Records
// //                 <span className="ml-3 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
// //                   {employeeData.length}
// //                 </span>
// //               </h2>
// //             </div>

// //             {loading ? (
// //               <div className="flex-1 flex items-center justify-center">
// //                 <div className="text-xl text-gray-500">Loading...</div>
// //               </div>
// //             ) : employeeData.length === 0 ? (
// //               <div className="flex-1 flex flex-col items-center justify-center p-12">
// //                 <Users className="h-16 w-16 text-gray-400 mb-4" />
// //                 <p className="text-xl font-medium mb-4">No employees yet</p>
// //                 <div className="space-x-3">
// //                   <button
// //                     onClick={() => setActiveTab("add-data")}
// //                     className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
// //                   >
// //                     Add Employee
// //                   </button>
// //                   <button
// //                     onClick={() => setActiveTab("upload")}
// //                     className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
// //                   >
// //                     Upload Excel
// //                   </button>
// //                 </div>
// //               </div>
// //             ) : (
// //               <div className="flex-1 overflow-y-auto">
// //                 <table className="min-w-full divide-y divide-gray-200">
// //                   <thead className="bg-gray-50 sticky top-0 z-10">
// //                     <tr>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sub-Dept</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Join Date</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
// //                     </tr>
// //                   </thead>
// //                   <tbody className="bg-white divide-y divide-gray-200">
// //                     {employeeData.map((e) => (
// //                       <tr key={e.emp_id} className="hover:bg-gray-50 transition-colors">
// //                         <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.emp_id}</td>
// //                         <td className="px-6 py-4 text-sm font-semibold">
// //                           {[e.first_name, e.last_name].filter(Boolean).join(" ")}
// //                         </td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">
// //                           {e.department_name || getDepartmentName(e.department)}
// //                         </td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">
// //                           {e.sub_department_display || e.sub_department || "—"}
// //                         </td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">
// //                           {e.designation_display || e.designation || "—"}
// //                         </td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">{formatDate(e.date_of_joining)}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">{e.sex_display || "—"}</td>
// //                         <td className="px-6 py-4 text-sm">
// //                           <div className="text-gray-800">{e.email || "—"}</div>
// //                           <div className="text-gray-500 text-xs">{e.phone || "—"}</div>
// //                         </td>
// //                         <td className="px-6 py-4">
// //                           <button
// //                             onClick={() => handleDelete(e.emp_id)}
// //                             className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
// //                           >
// //                             <Trash2 className="h-4 w-4" /> Delete
// //                           </button>
// //                         </td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </table>
// //               </div>
// //             )}
// //           </div>
// //         );

// //       default:
// //         return null;
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
// //       <div className="container mx-auto px-4 py-8">
// //         <div className="mb-8">
// //           <h1 className="text-4xl font-bold text-gray-900 mb-2">Master Table Settings</h1>
// //           <p className="text-lg text-gray-600">
// //             First select <strong>Department</strong>, then <strong>Sub-Department</strong> (only for Production & Quality)
// //           </p>
// //         </div>

// //         <div className="mb-8 bg-white rounded-t-2xl shadow-sm">
// //           <nav className="flex space-x-8 px-6 -mb-px">
// //             {tabs.map((tab) => {
// //               const Icon = tab.icon;
// //               return (
// //                 <button
// //                   key={tab.id}
// //                   onClick={() => setActiveTab(tab.id)}
// //                   className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all ${
// //                     activeTab === tab.id
// //                       ? "border-blue-500 text-blue-600 bg-blue-50"
// //                       : "border-transparent text-gray-500 hover:text-gray-700"
// //                   }`}
// //                 >
// //                   <Icon className="h-5 w-5" />
// //                   <span>{tab.name}</span>
// //                 </button>
// //               );
// //             })}
// //           </nav>
// //         </div>

// //         <div>{renderTabContent()}</div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default MasterTableSettings;


// // import React, { useState, useEffect } from "react";
// // import {
// //   Upload,
// //   Plus,
// //   Trash2,
// //   FileSpreadsheet,
// //   Users,
// //   Mail,
// //   Phone,
// //   Calendar,
// //   User,
// //   Building2,
// //   Briefcase,
// // } from "lucide-react";

// // interface EmployeeData {
// //   emp_id: string;
// //   first_name: string;
// //   last_name: string;
// //   department: number | null;
// //   department_name?: string;
// //   sub_department: number | null;          // ← now a Line FK (id)
// //   sub_department_name?: string;           // read‑only from serializer
// //   designation: string;
// //   designation_display?: string;
// //   date_of_joining: string;
// //   birth_date: string;
// //   sex: string;
// //   sex_display?: string;
// //   email: string;
// //   phone: string;
// // }

// // interface Department {
// //   department_id: number;
// //   department_name: string;
// // }

// // // structure returned by /mastertable/list_sub_departments/
// // interface SubDepartment {
// //   id: number;
// //   name: string;
// // }
// // interface SubDepartmentsByDept {
// //   [department_name: string]: SubDepartment[];
// // }

// // const MasterTableSettings: React.FC = () => {
// //   const [activeTab, setActiveTab] = useState("overview");
// //   const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
// //   const [departments, setDepartments] = useState<Department[]>([]);
// //   const [subDepartments, setSubDepartments] = useState<SubDepartmentsByDept>({});
// //   const [loading, setLoading] = useState(false);
// //   const [uploadFile, setUploadFile] = useState<File | null>(null);
// //   const [uploadLoading, setUploadLoading] = useState(false);

// //   const [formData, setFormData] = useState<EmployeeData>({
// //     emp_id: "",
// //     first_name: "",
// //     last_name: "",
// //     department: null,
// //     sub_department: null,
// //     designation: "",
// //     date_of_joining: "",
// //     birth_date: "",
// //     sex: "",
// //     email: "",
// //     phone: "",
// //   });

// //   const API_BASE_URL = "http://127.0.0.1:8000";

// //   const tabs = [
// //     { id: "overview", name: "Overview", icon: Users },
// //     { id: "add-data", name: "Add Employee", icon: Plus },
// //     { id: "upload", name: "Upload Excel", icon: Upload },
// //     { id: "employee-list", name: "Employee Records", icon: FileSpreadsheet },
// //   ];

// //   // --------------------------------------------------------------
// //   //  Choices that come from the backend
// //   // --------------------------------------------------------------
// //   const designationOptions = [
// //     { value: "", label: "--- Select Designation ---" },
// //     { value: "CO- DRIVER", label: "CO- DRIVER" },
// //     { value: "DRIVER", label: "DRIVER" },
// //     { value: "HELPER", label: "HELPER" },
// //     { value: "MALI", label: "MALI" },
// //     { value: "OPERATOR", label: "OPERATOR" },
// //     { value: "PANTRY BOY", label: "PANTRY BOY" },
// //     { value: "SUPERVISOR", label: "SUPERVISOR" },
// //     { value: "SWEEPER", label: "SWEEPER" },
// //     { value: "OET", label: "OET" },
// //     { value: "OE", label: "OE" },
// //     { value: "Sr.OE", label: "Sr.OE" },
// //   ];

// //   const genderOptions = [
// //     { value: "", label: "Select Gender" },
// //     { value: "M", label: "Male" },
// //     { value: "F", label: "Female" },
// //     { value: "O", label: "Other" },
// //   ];

// //   // --------------------------------------------------------------
// //   //  Helpers – department / sub‑department
// //   // --------------------------------------------------------------
// //   const getCurrentDepartmentName = (): string | null => {
// //     if (!formData.department) return null;
// //     return departments.find((d) => d.department_id === formData.department)?.department_name || null;
// //   };

// //   const currentDeptName = getCurrentDepartmentName();

// //   // dynamic sub‑department options (from API)
// //   const getSubDepartmentOptions = () => {
// //     if (!currentDeptName) {
// //       return [{ value: "", label: "— Select Department First —" }];
// //     }
// //     const opts = subDepartments[currentDeptName] || [];
// //     return [{ value: "", label: "--- Select Sub‑Department ---" }, ...opts.map((s) => ({ value: s.id, label: s.name }))];
// //   };

// //   const subDepartmentOptions = getSubDepartmentOptions();

// //   // --------------------------------------------------------------
// //   //  Form field description (used to render the “Add Employee” form)
// //   // --------------------------------------------------------------
// //   const formFields = [
// //     { id: "emp_id", label: "Employee ID", type: "text", required: true, icon: User },
// //     { id: "first_name", label: "First Name", type: "text", required: false, icon: User },
// //     { id: "last_name", label: "Last Name", type: "text", required: false, icon: User },
// //     {
// //       id: "designation",
// //       label: "Designation",
// //       type: "select",
// //       required: false,
// //       icon: Briefcase,
// //       options: designationOptions,
// //     },
// //     { id: "department", label: "Department", type: "select", required: false, icon: Building2 },
// //     {
// //       id: "sub_department",
// //       label: "Sub‑Department",
// //       type: "select",
// //       required: false,
// //       icon: Building2,
// //       options: subDepartmentOptions,
// //       disabled: !currentDeptName,
// //     },
// //     { id: "date_of_joining", label: "Join Date", type: "date", required: false, icon: Calendar },
// //     { id: "birth_date", label: "Birth Date", type: "date", required: false, icon: Calendar },
// //     {
// //       id: "sex",
// //       label: "Gender",
// //       type: "select",
// //       required: false,
// //       icon: User,
// //       options: genderOptions,
// //     },
// //     { id: "email", label: "Email Address", type: "email", required: false, icon: Mail },
// //     { id: "phone", label: "Phone Number", type: "tel", required: false, icon: Phone },
// //   ];

// //   // --------------------------------------------------------------
// //   //  API calls
// //   // --------------------------------------------------------------
// //   const fetchEmployees = async () => {
// //     setLoading(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/mastertable/`);
// //       if (!response.ok) throw new Error("Failed to fetch employees");
// //       const data = await response.json();
// //       setEmployeeData(data);
// //     } catch (error) {
// //       console.error("Error:", error);
// //       alert("Failed to load employees.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchDepartments = async () => {
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/departments/`);
// //       if (!response.ok) throw new Error("Failed to fetch departments");
// //       const data = await response.json();
// //       setDepartments(data);
// //     } catch (error) {
// //       console.warn("Using fallback departments");
// //       setDepartments([
// //         { department_id: 1, department_name: "Production" },
// //         { department_id: 2, department_name: "Quality" },
// //         { department_id: 3, department_name: "HR" },
// //         { department_id: 4, department_name: "IT" },
// //       ]);
// //     }
// //   };

// //   const fetchSubDepartments = async () => {
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/mastertable/list_sub_departments/`);
// //       if (!response.ok) throw new Error("Failed to fetch sub‑departments");
// //       const data: SubDepartmentsByDept = await response.json();
// //       setSubDepartments(data);
// //     } catch (error) {
// //       console.warn("No sub‑departments available");
// //       setSubDepartments({});
// //     }
// //   };

// //   useEffect(() => {
// //     fetchEmployees();
// //     fetchDepartments();
// //     fetchSubDepartments();
// //   }, []);

// //   // reset sub‑department when department changes
// //   useEffect(() => {
// //     setFormData((prev) => ({ ...prev, sub_department: null }));
// //   }, [formData.department]);

// //   // --------------------------------------------------------------
// //   //  Form handling
// //   // --------------------------------------------------------------
// //   const handleInputChange = (field: keyof EmployeeData, value: string) => {
// //     if (field === "department") {
// //       setFormData((prev) => ({
// //         ...prev,
// //         department: value === "" ? null : parseInt(value),
// //         sub_department: null, // reset sub‑dept when dept changes
// //       }));
// //     } else if (field === "sub_department") {
// //       setFormData((prev) => ({
// //         ...prev,
// //         sub_department: value === "" ? null : parseInt(value),
// //       }));
// //     } else {
// //       setFormData((prev) => ({ ...prev, [field]: value }));
// //     }
// //   };

// //   const handleSubmit = async () => {
// //     if (!formData.emp_id.trim()) {
// //       alert("Employee ID is required");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const submitData: any = { emp_id: formData.emp_id.trim() };

// //       const optionalFields: (keyof EmployeeData)[] = [
// //         "first_name",
// //         "last_name",
// //         "designation",
// //         "sub_department",
// //         "date_of_joining",
// //         "birth_date",
// //         "sex",
// //         "email",
// //         "phone",
// //       ];
// //       optionalFields.forEach((f) => {
// //         const val = formData[f];
// //         if (val && String(val).trim()) {
// //           // send the *id* for sub_department, otherwise the string value
// //           submitData[f] = f === "sub_department" ? formData.sub_department : val;
// //         }
// //       });
// //       if (formData.department) submitData.department = formData.department;

// //       const response = await fetch(`${API_BASE_URL}/mastertable/`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(submitData),
// //       });

// //       if (!response.ok) {
// //         const errorData = await response.json().catch(() => ({}));
// //         let msg = "Failed to save:\n";
// //         Object.entries(errorData).forEach(([k, v]) => {
// //           msg += `${k}: ${Array.isArray(v) ? v.join("; ") : v}\n`;
// //         });
// //         throw new Error(msg.trim());
// //       }

// //       await fetchEmployees();
// //       alert("Employee saved successfully!");
// //       setActiveTab("employee-list");
// //       resetForm();
// //     } catch (error: any) {
// //       alert(error.message || "Failed to save.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const resetForm = () => {
// //     setFormData({
// //       emp_id: "",
// //       first_name: "",
// //       last_name: "",
// //       department: null,
// //       sub_department: null,
// //       designation: "",
// //       date_of_joining: "",
// //       birth_date: "",
// //       sex: "",
// //       email: "",
// //       phone: "",
// //     });
// //   };

// //   const handleDelete = async (empId: string) => {
// //     if (!window.confirm("Delete this employee?")) return;
// //     setLoading(true);
// //     try {
// //       const res = await fetch(`${API_BASE_URL}/mastertable/${empId}/`, { method: "DELETE" });
// //       if (!res.ok) throw new Error("Delete failed");
// //       await fetchEmployees();
// //       alert("Deleted successfully!");
// //     } catch {
// //       alert("Failed to delete.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleExcelUpload = async () => {
// //     if (!uploadFile) return alert("Select a file");
// //     setUploadLoading(true);
// //     try {
// //       const fd = new FormData();
// //       fd.append("file", uploadFile);
// //       const res = await fetch(`${API_BASE_URL}/mastertable/upload_excel/`, {
// //         method: "POST",
// //         body: fd,
// //       });
// //       const data = await res.json();
// //       if (res.ok) {
// //         let msg = `Created: ${data.created_count}, Updated: ${data.updated_count}`;
// //         if (data.errors?.length) {
// //           msg += "\n\nErrors:\n" + data.errors.map((e: any) => `Row ${e.row}: ${e.error}`).join("\n");
// //         }
// //         alert(msg);
// //         fetchEmployees();
// //       } else {
// //         alert(data.error || "Upload failed");
// //       }
// //     } catch (e: any) {
// //       alert(e.message);
// //     } finally {
// //       setUploadLoading(false);
// //       setUploadFile(null);
// //       const input = document.getElementById("excel-upload") as HTMLInputElement;
// //       if (input) input.value = "";
// //     }
// //   };

// //   const handleDownloadTemplate = async () => {
// //     try {
// //       const res = await fetch(`${API_BASE_URL}/mastertable/download_template/`);
// //       if (!res.ok) throw new Error();
// //       const blob = await res.blob();
// //       const url = URL.createObjectURL(blob);
// //       const a = document.createElement("a");
// //       a.href = url;
// //       a.download = "employee_template.xlsx";
// //       a.click();
// //       URL.revokeObjectURL(url);
// //     } catch {
// //       alert("Download failed");
// //     }
// //   };

// //   // --------------------------------------------------------------
// //   //  Display helpers
// //   // --------------------------------------------------------------
// //   const formatDate = (d: string) => (!d ? "" : new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));

// //   const getDepartmentName = (id: number | null) => (id ? departments.find((d) => d.department_id === id)?.department_name || "Unknown" : "—");

// //   const getDesignationLabel = (value: string) => designationOptions.find((opt) => opt.value === value)?.label || value || "—";

// //   const getGenderLabel = (value: string) => genderOptions.find((opt) => opt.value === value)?.label || "—";

// //   // --------------------------------------------------------------
// //   //  Overview statistics
// //   // --------------------------------------------------------------
// //   const getOverviewStats = () => {
// //     const total = employeeData.length;
// //     const depts = new Set(employeeData.map((e) => e.department_name || getDepartmentName(e.department))).size;
// //     const male = employeeData.filter((e) => e.sex === "M").length;
// //     const female = employeeData.filter((e) => e.sex === "F").length;
// //     return [
// //       { title: "Total Employees", value: total, icon: Users, color: "bg-blue-500" },
// //       { title: "Departments", value: depts, icon: Building2, color: "bg-green-500" },
// //       { title: "Male", value: male, icon: User, color: "bg-purple-500" },
// //       { title: "Female", value: female, icon: User, color: "bg-pink-500" },
// //     ];
// //   };

// //   const getDepartmentStats = () => {
// //     const counts = employeeData.reduce((acc, e) => {
// //       const name = e.department_name || getDepartmentName(e.department);
// //       acc[name] = (acc[name] || 0) + 1;
// //       return acc;
// //     }, {} as Record<string, number>);
// //     return Object.entries(counts).map(([department, count]) => ({ department, count }));
// //   };

// //   // --------------------------------------------------------------
// //   //  Render the selected tab
// //   // --------------------------------------------------------------
// //   const renderTabContent = () => {
// //     switch (activeTab) {
// //       case "overview":
// //         return (
// //           <div className="space-y-8">
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //               {getOverviewStats().map((s, i) => {
// //                 const Icon = s.icon;
// //                 return (
// //                   <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
// //                     <div className="flex justify-between items-center">
// //                       <div>
// //                         <p className="text-sm text-gray-600">{s.title}</p>
// //                         <p className="text-3xl font-bold">{s.value}</p>
// //                       </div>
// //                       <div className={`${s.color} p-3 rounded-xl`}>
// //                         <Icon className="h-6 w-6 text-white" />
// //                       </div>
// //                     </div>
// //                   </div>
// //                 );
// //               })}
// //             </div>

// //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //               <div className="bg-white rounded-2xl shadow-lg p-6 border">
// //                 <h3 className="text-xl font-semibold mb-4">Department Distribution</h3>
// //                 {getDepartmentStats().map((d, i) => (
// //                   <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl mb-2">
// //                     <span className="font-medium">{d.department}</span>
// //                     <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{d.count}</span>
// //                   </div>
// //                 ))}
// //               </div>

// //               <div className="bg-white rounded-2xl shadow-lg p-6 border">
// //                 <h3 className="text-xl font-semibold mb-4">Recent Additions</h3>
// //                 {employeeData.slice(-3).reverse().map((e, i) => (
// //                   <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl mb-2">
// //                     <User className="h-5 w-5 text-green-600 mr-3" />
// //                     <div>
// //                       <p className="font-medium">{[e.first_name, e.last_name].filter(Boolean).join(" ")}</p>
// //                       <p className="text-sm text-gray-600">
// //                         {e.sub_department_name || "—"}, {e.department_name || getDepartmentName(e.department)}
// //                       </p>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         );

// //       case "add-data":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg p-8 border">
// //             <div className="flex items-center mb-6">
// //               <Plus className="h-6 w-6 text-blue-600 mr-3" />
// //               <h2 className="text-2xl font-bold">Add / Update Employee</h2>
// //             </div>

// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //               {formFields.map((field) => {
// //                 const Icon = field.icon;
// //                 return (
// //                   <div key={field.id} className="space-y-2">
// //                     <label className="flex items-center text-sm font-medium text-gray-700">
// //                       <Icon className="h-4 w-4 mr-2 text-gray-500" />
// //                       {field.label}
// //                       {field.required && <span className="text-red-500 ml-1">*</span>}
// //                     </label>

// //                     {/* DEPARTMENT SELECT */}
// //                     {field.id === "department" ? (
// //                       <select
// //                         value={formData.department ?? ""}
// //                         onChange={(e) => handleInputChange("department", e.target.value)}
// //                         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //                       >
// //                         <option value="">Select Department (Optional)</option>
// //                         {departments.map((d) => (
// //                           <option key={d.department_id} value={d.department_id}>
// //                             {d.department_name}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     )
// //                     /* SUB‑DEPARTMENT SELECT */
// //                     : field.id === "sub_department" ? (
// //                       <select
// //                         value={formData.sub_department ?? ""}
// //                         onChange={(e) => handleInputChange("sub_department", e.target.value)}
// //                         disabled={field.disabled}
// //                         className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
// //                           field.disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
// //                         }`}
// //                       >
// //                         {field.options.map((o) => (
// //                           <option key={o.value} value={o.value}>
// //                             {o.label}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     )
// //                     /* OTHER SELECTS */
// //                     : field.type === "select" ? (
// //                       <select
// //                         value={formData[field.id as keyof EmployeeData] as string}
// //                         onChange={(e) => handleInputChange(field.id as keyof EmployeeData, e.target.value)}
// //                         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //                       >
// //                         {field.options?.map((o) => (
// //                           <option key={o.value} value={o.value}>
// //                             {o.label}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     )
// //                     /* INPUT FIELDS */
// //                     : (
// //                       <input
// //                         type={field.type}
// //                         value={formData[field.id as keyof EmployeeData] as string}
// //                         onChange={(e) => handleInputChange(field.id as keyof EmployeeData, e.target.value)}
// //                         placeholder={`Enter ${field.label.toLowerCase()}`}
// //                         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //                         required={field.required}
// //                       />
// //                     )}
// //                   </div>
// //                 );
// //               })}
// //             </div>

// //             <div className="flex justify-end mt-8 space-x-3">
// //               <button onClick={resetForm} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
// //                 Clear
// //               </button>
// //               <button
// //                 onClick={handleSubmit}
// //                 disabled={loading}
// //                 className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center"
// //               >
// //                 {loading ? (
// //                   <>Saving...</>
// //                 ) : (
// //                   <>
// //                     <Plus className="h-5 w-5 mr-2" />
// //                     Save Employee
// //                   </>
// //                 )}
// //               </button>
// //             </div>
// //           </div>
// //         );

// //       case "upload":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg p-8 border">
// //             <div className="flex items-center mb-6">
// //               <Upload className="h-6 w-6 text-green-600 mr-3" />
// //               <h2 className="text-2xl font-bold">Upload Excel</h2>
// //             </div>
// //             <div className="border-2 border-dashed rounded-xl p-8 text-center">
// //               <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
// //               <p className="text-sm text-gray-600 mb-4">
// //                 Use <code className="bg-gray-100 px-2 py-1 rounded">sub_department</code> = <code>ACTUATOR</code>, <code>SOE</code>, etc.
// //               </p>
// //               <input
// //                 id="excel-upload"
// //                 type="file"
// //                 accept=".xlsx,.xls"
// //                 onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
// //                 className="block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:bg-green-50 file:text-green-700"
// //               />
// //             </div>
// //             <div className="flex justify-center gap-4 mt-6">
// //               <button
// //                 onClick={handleExcelUpload}
// //                 disabled={!uploadFile || uploadLoading}
// //                 className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center"
// //               >
// //                 {uploadLoading ? "Uploading..." : <><Upload className="h-5 w-5 mr-2" /> Upload</>}
// //               </button>
// //               <button
// //                 onClick={handleDownloadTemplate}
// //                 className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 flex items-center"
// //               >
// //                 <FileSpreadsheet className="h-5 w-5 mr-2" /> Download Template
// //               </button>
// //             </div>
// //             {uploadFile && (
// //               <div className="mt-4 p-3 bg-green-50 rounded-xl text-green-800">
// //                 Selected: {uploadFile.name}
// //               </div>
// //             )}
// //           </div>
// //         );

// //       case "employee-list":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg border overflow-hidden flex flex-col h-[680px]">
// //             <div className="p-6 border-b bg-white">
// //               <h2 className="text-2xl font-bold flex items-center">
// //                 <FileSpreadsheet className="h-6 w-6 text-purple-600 mr-3" />
// //                 Employee Records
// //                 <span className="ml-3 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
// //                   {employeeData.length}
// //                 </span>
// //               </h2>
// //             </div>

// //             {loading ? (
// //               <div className="flex-1 flex items-center justify-center">
// //                 <div className="text-xl text-gray-500">Loading...</div>
// //               </div>
// //             ) : employeeData.length === 0 ? (
// //               <div className="flex-1 flex flex-col items-center justify-center p-12">
// //                 <Users className="h-16 w-16 text-gray-400 mb-4" />
// //                 <p className="text-xl font-medium mb-4">No employees yet</p>
// //                 <div className="space-x-3">
// //                   <button
// //                     onClick={() => setActiveTab("add-data")}
// //                     className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
// //                   >
// //                     Add Employee
// //                   </button>
// //                   <button
// //                     onClick={() => setActiveTab("upload")}
// //                     className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
// //                   >
// //                     Upload Excel
// //                   </button>
// //                 </div>
// //               </div>
// //             ) : (
// //               <div className="flex-1 overflow-y-auto">
// //                 <table className="min-w-full divide-y divide-gray-200">
// //                   <thead className="bg-gray-50 sticky top-0 z-10">
// //                     <tr>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sub‑Dept</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Join Date</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
// //                     </tr>
// //                   </thead>
// //                   <tbody className="bg-white divide-y divide-gray-200">
// //                     {employeeData.map((e) => (
// //                       <tr key={e.emp_id} className="hover:bg-gray-50 transition-colors">
// //                         <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.emp_id}</td>
// //                         <td className="px-6 py-4 text-sm font-semibold">
// //                           {[e.first_name, e.last_name].filter(Boolean).join(" ")}
// //                         </td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">{e.department_name || getDepartmentName(e.department)}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">{e.sub_department_name || "—"}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">{getDesignationLabel(e.designation)}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">{formatDate(e.date_of_joining)}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">{getGenderLabel(e.sex)}</td>
// //                         <td className="px-6 py-4 text-sm">
// //                           <div className="text-gray-800">{e.email || "—"}</div>
// //                           <div className="text-gray-500 text-xs">{e.phone || "—"}</div>
// //                         </td>
// //                         <td className="px-6 py-4">
// //                           <button
// //                             onClick={() => handleDelete(e.emp_id)}
// //                             className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
// //                           >
// //                             <Trash2 className="h-4 w-4" /> Delete
// //                           </button>
// //                         </td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </table>
// //               </div>
// //             )}
// //           </div>
// //         );

// //       default:
// //         return null;
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
// //       <div className="container mx-auto px-4 py-8">
// //         <div className="mb-8">
// //           <h1 className="text-4xl font-bold text-gray-900 mb-2">Master Table Settings</h1>
// //           <p className="text-lg text-gray-600">
// //             First select <strong>Department</strong>, then <strong>Sub‑Department</strong> (only for Production & Quality)
// //           </p>
// //         </div>

// //         <div className="mb-8 bg-white rounded-t-2xl shadow-sm">
// //           <nav className="flex space-x-8 px-6 -mb-px">
// //             {tabs.map((tab) => {
// //               const Icon = tab.icon;
// //               return (
// //                 <button
// //                   key={tab.id}
// //                   onClick={() => setActiveTab(tab.id)}
// //                   className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all ${
// //                     activeTab === tab.id
// //                       ? "border-blue-500 text-blue-600 bg-blue-50"
// //                       : "border-transparent text-gray-500 hover:text-gray-700"
// //                   }`}
// //                 >
// //                   <Icon className="h-5 w-5" />
// //                   <span>{tab.name}</span>
// //                 </button>
// //               );
// //             })}
// //           </nav>
// //         </div>

// //         <div>{renderTabContent()}</div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default MasterTableSettings;


// // import React, { useEffect, useMemo, useState } from "react";
// // import { Toaster, toast } from "react-hot-toast";
// // import {
// //   UploadCloud as Upload,
// //   Plus,
// //   Trash2,
// //   FileSpreadsheet,
// //   Users,
// //   Mail,
// //   Phone,
// //   Calendar,
// //   User,
// //   Building2,
// //   Briefcase,
// //   Download,
// // } from "lucide-react";

// // // ---------------- Types aligned with backend ----------------
// // interface EmployeeData {
// //   emp_id: string;
// //   first_name: string;
// //   last_name: string;
// //   department: number | null;            // FK (Department.department_id)
// //   department_name?: string;             // read-only
// //   sub_department: number | null;        // FK (Line.line_id)
// //   sub_department_name?: string;         // read-only
// //   designation: string;
// //   date_of_joining: string;              // YYYY-MM-DD
// //   birth_date: string;                   // YYYY-MM-DD
// //   sex: string;                          // 'M' | 'F' | 'O' | ''
// //   email: string;
// //   phone: string;
// // }

// // interface Department {
// //   department_id: number;
// //   department_name: string;
// //   lines: { line_id: number; line_name: string }[];
// // }

// // interface ApiStation {
// //   id: number;
// //   station_name: string;
// // }

// // interface ApiSubline {
// //   id: number;
// //   subline_name: string;
// //   stations: ApiStation[];
// // }

// // interface ApiLine {
// //   id: number;
// //   line_name: string;
// //   sublines: ApiSubline[];
// //   stations: ApiStation[];
// // }

// // interface ApiDepartment {
// //   id: number;
// //   department_name: string;
// //   lines: ApiLine[];
// //   stations: ApiStation[];
// // }

// // interface ApiStructureData {
// //   hq_name: string;
// //   factory_name: string;
// //   departments: ApiDepartment[];
// // }

// // interface ApiHierarchyResponseItem {
// //   structure_id: number;
// //   structure_name: string;
// //   hq: number;
// //   hq_name: string;
// //   factory: number;
// //   factory_name: string;
// //   structure_data: ApiStructureData;
// // }

// // // ---------------- API service (token + toasts like your other page) ----------------
// // const API_BASE_URL = "http://127.0.0.1:8000/";

// // const api = {
// //   async call(endpoint: string, options: RequestInit = {}) {
// //     const token = localStorage.getItem("accessToken");
// //     const headers = new Headers({ "Content-Type": "application/json", ...options.headers });
// //     if (token) headers.append("Authorization", `Bearer ${token}`);
// //     const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
// //     if (!res.ok) {
// //       const errorData = await res.json().catch(() => ({ detail: res.statusText }));
// //       const message =
// //         (Array.isArray(errorData) ? errorData.join(" ") : Object.values(errorData).flat().join(" ")) ||
// //         `API Error: ${res.status}`;
// //       toast.error(message);
// //       throw new Error(message);
// //     }
// //     if (res.status === 204) return null;
// //     return res.json();
// //   },

// //   async form(endpoint: string, method: "POST" | "PUT", formData: FormData) {
// //     const token = localStorage.getItem("accessToken");
// //     const headers = new Headers();
// //     if (token) headers.append("Authorization", `Bearer ${token}`);

// //     const res = await fetch(`${API_BASE_URL}${endpoint}`, { method, body: formData, headers });
// //     if (!res.ok) {
// //       const errorData = await res.json().catch(() => ({ detail: res.statusText }));
// //       const message =
// //         (Array.isArray(errorData) ? errorData.join(" ") : Object.values(errorData).flat().join(" ")) ||
// //         `API Error: ${res.status}`;
// //       toast.error(message);
// //       throw new Error(message);
// //     }
// //     return res.json();
// //   },

// //   // Employees
// //   listEmployees: () => api.call("mastertable/"),
// //   createEmployee: (payload: Partial<EmployeeData>) =>
// //     api.call("mastertable/", { method: "POST", body: JSON.stringify(payload) }),
// //   deleteEmployee: (empId: string) => api.call(`mastertable/${empId}/`, { method: "DELETE" }),

// //   // Hierarchy (we will parse departments + lines from here)
// //   fetchHierarchy: () => api.call("hierarchy-simple/"),

// //   // Excel upload/download
// //   uploadExcel: (file: File) => {
// //     const fd = new FormData();
// //     fd.append("file", file);
// //     return api.form("mastertable/upload_excel/", "POST", fd);
// //   },
// //   async downloadTemplate() {
// //     const token = localStorage.getItem("accessToken");
// //     const headers = new Headers();
// //     if (token) headers.append("Authorization", `Bearer ${token}`);

// //     const res = await fetch(`${API_BASE_URL}mastertable/download_template/`, { headers });
// //     if (!res.ok) throw new Error("Download failed");
// //     const blob = await res.blob();
// //     const url = URL.createObjectURL(blob);
// //     const a = document.createElement("a");
// //     a.href = url;
// //     a.download = "employee_template.xlsx";
// //     a.click();
// //     URL.revokeObjectURL(url);
// //   },
// // };

// // // ---------------- Helpers: parse hierarchy → Department[] ----------------
// // const parseDepartmentsFromHierarchy = (items: ApiHierarchyResponseItem[]): Department[] => {
// //   const deptMap = new Map<number, Department>();

// //   items.forEach((item) => {
// //     item.structure_data?.departments?.forEach((dept: ApiDepartment) => {
// //       if (!dept?.id || !dept.department_name) return;
// //       let d = deptMap.get(dept.id);
// //       if (!d) {
// //         d = { department_id: dept.id, department_name: dept.department_name, lines: [] };
// //         deptMap.set(dept.id, d);
// //       }
// //       // merge unique lines
// //       dept.lines?.forEach((line) => {
// //         if (!line?.id || !line.line_name) return;
// //         if (!d!.lines.some((l) => l.line_id === line.id)) {
// //           d!.lines.push({ line_id: line.id, line_name: line.line_name });
// //         }
// //       });
// //     });
// //   });

// //   return Array.from(deptMap.values()).sort((a, b) =>
// //     a.department_name.localeCompare(b.department_name)
// //   );
// // };

// // // ---------------- UI helpers ----------------
// // const designationOptions = [
// //   { value: "", label: "--- Select Designation ---" },
// //   { value: "CO- DRIVER", label: "CO- DRIVER" },
// //   { value: "DRIVER", label: "DRIVER" },
// //   { value: "HELPER", label: "HELPER" },
// //   { value: "MALI", label: "MALI" },
// //   { value: "OPERATOR", label: "OPERATOR" },
// //   { value: "PANTRY BOY", label: "PANTRY BOY" },
// //   { value: "SUPERVISOR", label: "SUPERVISOR" },
// //   { value: "SWEEPER", label: "SWEEPER" },
// //   { value: "OET", label: "OET" },
// //   { value: "OE", label: "OE" },
// //   { value: "Sr.OE", label: "Sr.OE" },
// // ];

// // const genderOptions = [
// //   { value: "", label: "Select Gender" },
// //   { value: "M", label: "Male" },
// //   { value: "F", label: "Female" },
// //   { value: "O", label: "Other" },
// // ];

// // const sexToLabel = (v?: string | null) => (v === "M" ? "Male" : v === "F" ? "Female" : v === "O" ? "Other" : "—");

// // // ---------------- Component ----------------
// // const MasterTableSettings: React.FC = () => {
// //   const [activeTab, setActiveTab] = useState<"overview" | "add-data" | "upload" | "employee-list">("overview");

// //   const [employees, setEmployees] = useState<EmployeeData[]>([]);
// //   const [departments, setDepartments] = useState<Department[]>([]);
// //   const [loading, setLoading] = useState(false);

// //   const [uploadFile, setUploadFile] = useState<File | null>(null);
// //   const [uploadLoading, setUploadLoading] = useState(false);

// //   const [formData, setFormData] = useState<EmployeeData>({
// //     emp_id: "",
// //     first_name: "",
// //     last_name: "",
// //     department: null,
// //     sub_department: null,
// //     designation: "",
// //     date_of_joining: "",
// //     birth_date: "",
// //     sex: "",
// //     email: "",
// //     phone: "",
// //   });

// //   const tabs = [
// //     { id: "overview", name: "Overview", icon: Users },
// //     { id: "add-data", name: "Add Employee", icon: Plus },
// //     { id: "upload", name: "Upload Excel", icon: Upload },
// //     { id: "employee-list", name: "Employee Records", icon: FileSpreadsheet },
// //   ] as const;

// //   // Current Department + Lines (sub-departments)
// //   const currentDept = useMemo(
// //     () => (formData.department ? departments.find((d) => d.department_id === formData.department) || null : null),
// //     [departments, formData.department]
// //   );
// //   const lineOptions = useMemo(() => {
// //     if (!currentDept) return [{ value: "", label: "— Select Department First —" }];
// //     const lines = currentDept.lines || [];
// //     if (lines.length === 0) return [{ value: "", label: "— No lines under this department —" }];
// //     return [{ value: "", label: "--- Select Sub-Department ---" }, ...lines.map((l) => ({ value: l.line_id, label: l.line_name }))];
// //   }, [currentDept]);

// //   // Initial fetch: employees + hierarchy
// //   useEffect(() => {
// //     const init = async () => {
// //       try {
// //         setLoading(true);
// //         const [empData, hierarchy] = await Promise.all([api.listEmployees(), api.fetchHierarchy()]);
// //         setEmployees(empData || []);
// //         setDepartments(parseDepartmentsFromHierarchy(hierarchy || []));
// //       } catch (e) {
// //         // errors already toasted
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     init();
// //   }, []);

// //   // Reset sub_department on department change (cascade)
// //   useEffect(() => {
// //     setFormData((prev) => ({ ...prev, sub_department: null }));
// //   }, [formData.department]);

// //   // Handlers
// //   const handleInputChange = (field: keyof EmployeeData, value: string) => {
// //     if (field === "department") {
// //       setFormData((prev) => ({
// //         ...prev,
// //         department: value === "" ? null : parseInt(value, 10),
// //         sub_department: null,
// //       }));
// //     } else if (field === "sub_department") {
// //       setFormData((prev) => ({
// //         ...prev,
// //         sub_department: value === "" ? null : parseInt(value, 10),
// //       }));
// //     } else {
// //       setFormData((prev) => ({ ...prev, [field]: value }));
// //     }
// //   };

// //   const refreshEmployees = async () => {
// //     try {
// //       const data = await api.listEmployees();
// //       setEmployees(data || []);
// //     } catch {}
// //   };

// //   const resetForm = () => {
// //     setFormData({
// //       emp_id: "",
// //       first_name: "",
// //       last_name: "",
// //       department: null,
// //       sub_department: null,
// //       designation: "",
// //       date_of_joining: "",
// //       birth_date: "",
// //       sex: "",
// //       email: "",
// //       phone: "",
// //     });
// //   };

// //   const handleSubmit = async () => {
// //     const empId = formData.emp_id.trim();
// //     if (!empId) {
// //       toast.error("Employee ID is required");
// //       return;
// //     }

// //     // Build payload
// //     const payload: any = { emp_id: empId };
// //     ([
// //       "first_name",
// //       "last_name",
// //       "designation",
// //       "date_of_joining",
// //       "birth_date",
// //       "sex",
// //       "email",
// //       "phone",
// //     ] as (keyof EmployeeData)[]).forEach((f) => {
// //       const v = formData[f];
// //       if (v && String(v).trim()) payload[f] = String(v).trim();
// //     });
// //     if (formData.department !== null) payload.department = formData.department;
// //     if (formData.sub_department !== null) payload.sub_department = formData.sub_department;

// //     try {
// //       setLoading(true);
// //       await api.createEmployee(payload);
// //       toast.success("Employee saved");
// //       await refreshEmployees();
// //       resetForm();
// //       setActiveTab("employee-list");
// //     } catch (e) {
// //       /* error already toasted */
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleDelete = async (empId: string) => {
// //     if (!window.confirm("Delete this employee?")) return;
// //     try {
// //       setLoading(true);
// //       await api.deleteEmployee(empId);
// //       toast.success("Deleted successfully");
// //       await refreshEmployees();
// //     } catch (e) {
// //       /* error already toasted */
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleExcelUpload = async () => {
// //     if (!uploadFile) return toast.error("Please select a file");
// //     try {
// //       setUploadLoading(true);
// //       const res = await api.uploadExcel(uploadFile);
// //       let msg = `${res.message}\nCreated: ${res.created_count}, Updated: ${res.updated_count}`;
// //       if (res.errors?.length) {
// //         msg += "\n\nErrors:\n" + res.errors.map((e: any) => `Row ${e.row} (${e.emp_id}): ${e.error}`).join("\n");
// //       }
// //       toast.success("Upload complete");
// //       alert(msg); // full summary
// //       await refreshEmployees();
// //     } catch (e) {
// //       /* toast handled */
// //     } finally {
// //       setUploadLoading(false);
// //       setUploadFile(null);
// //       const input = document.getElementById("excel-upload") as HTMLInputElement | null;
// //       if (input) input.value = "";
// //     }
// //   };

// //   const handleDownloadTemplate = async () => {
// //     try {
// //       await api.downloadTemplate();
// //     } catch {
// //       toast.error("Download failed");
// //     }
// //   };

// //   // Display helpers
// //   const formatDate = (d: string) =>
// //     !d ? "—" : new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

// //   const getDepartmentName = (id: number | null) =>
// //     id ? departments.find((d) => d.department_id === id)?.department_name || "Unknown" : "—";

// //   const getDesignationLabel = (value: string) =>
// //     designationOptions.find((opt) => opt.value === value)?.label || value || "—";

// //   // Overview stats
// //   const overviewStats = () => {
// //     const total = employees.length;
// //     const depts = new Set(employees.map((e) => e.department_name || getDepartmentName(e.department))).size;
// //     const male = employees.filter((e) => e.sex === "M").length;
// //     const female = employees.filter((e) => e.sex === "F").length;
// //     return [
// //       { title: "Total Employees", value: total, icon: Users, color: "bg-blue-500" },
// //       { title: "Departments", value: depts, icon: Building2, color: "bg-green-500" },
// //       { title: "Male", value: male, icon: User, color: "bg-purple-500" },
// //       { title: "Female", value: female, icon: User, color: "bg-pink-500" },
// //     ];
// //   };

// //   const departmentStats = () => {
// //     const counts = employees.reduce((acc, e) => {
// //       const name = e.department_name || getDepartmentName(e.department);
// //       acc[name] = (acc[name] || 0) + 1;
// //       return acc;
// //     }, {} as Record<string, number>);
// //     return Object.entries(counts).map(([department, count]) => ({ department, count }));
// //   };

// //   // UI
// //   const renderTabContent = () => {
// //     switch (activeTab) {
// //       case "overview":
// //         return (
// //           <div className="space-y-8">
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //               {overviewStats().map((s, i) => {
// //                 const Icon = s.icon;
// //                 return (
// //                   <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
// //                     <div className="flex justify-between items-center">
// //                       <div>
// //                         <p className="text-sm text-gray-600">{s.title}</p>
// //                         <p className="text-3xl font-bold">{s.value}</p>
// //                       </div>
// //                       <div className={`${s.color} p-3 rounded-xl`}>
// //                         <Icon className="h-6 w-6 text-white" />
// //                       </div>
// //                     </div>
// //                   </div>
// //                 );
// //               })}
// //             </div>

// //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //               <div className="bg-white rounded-2xl shadow-lg p-6 border">
// //                 <h3 className="text-xl font-semibold mb-4">Department Distribution</h3>
// //                 {departmentStats().map((d, i) => (
// //                   <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl mb-2">
// //                     <span className="font-medium">{d.department}</span>
// //                     <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{d.count}</span>
// //                   </div>
// //                 ))}
// //               </div>

// //               <div className="bg-white rounded-2xl shadow-lg p-6 border">
// //                 <h3 className="text-xl font-semibold mb-4">Recent Additions</h3>
// //                 {employees.slice(-3).reverse().map((e, i) => (
// //                   <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl mb-2">
// //                     <User className="h-5 w-5 text-green-600 mr-3" />
// //                     <div>
// //                       <p className="font-medium">{[e.first_name, e.last_name].filter(Boolean).join(" ") || e.emp_id}</p>
// //                       <p className="text-sm text-gray-600">
// //                         {e.sub_department_name || "—"}, {e.department_name || getDepartmentName(e.department)}
// //                       </p>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         );

// //       case "add-data":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg p-8 border">
// //             <div className="flex items-center mb-6">
// //               <Plus className="h-6 w-6 text-blue-600 mr-3" />
// //               <h2 className="text-2xl font-bold">Add / Update Employee</h2>
// //             </div>

// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //               {/* Department */}
// //               <div className="space-y-2">
// //                 <label className="flex items-center text-sm font-medium text-gray-700">
// //                   <Building2 className="h-4 w-4 mr-2 text-gray-500" />
// //                   Department
// //                 </label>
// //                 <select
// //                   value={formData.department ?? ""}
// //                   onChange={(e) => handleInputChange("department", e.target.value)}
// //                   className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //                 >
// //                   <option value="">Select Department (Optional)</option>
// //                   {departments.map((d) => (
// //                     <option key={d.department_id} value={d.department_id}>
// //                       {d.department_name}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               {/* Sub-Department (Line) */}
// //               <div className="space-y-2">
// //                 <label className="flex items-center text-sm font-medium text-gray-700">
// //                   <Building2 className="h-4 w-4 mr-2 text-gray-500" />
// //                   Sub-Department
// //                 </label>
// //                 <select
// //                   value={formData.sub_department ?? ""}
// //                   onChange={(e) => handleInputChange("sub_department", e.target.value)}
// //                   disabled={lineOptions.length === 0}
// //                   className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
// //                     lineOptions.length === 0 ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
// //                   }`}
// //                 >
// //                   {lineOptions.map((o) => (
// //                     <option key={String(o.value)} value={o.value as any}>
// //                       {o.label}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               {/* First Name */}
// //               <LabeledInput
// //                 label="First Name"
// //                 icon={User}
// //                 type="text"
// //                 value={formData.first_name}
// //                 onChange={(v) => handleInputChange("first_name", v)}
// //               />
// //               {/* Last Name */}
// //               <LabeledInput
// //                 label="Last Name"
// //                 icon={User}
// //                 type="text"
// //                 value={formData.last_name}
// //                 onChange={(v) => handleInputChange("last_name", v)}
// //               />
// //               {/* Designation */}
// //               <LabeledSelect
// //                 label="Designation"
// //                 icon={Briefcase}
// //                 value={formData.designation}
// //                 options={designationOptions}
// //                 onChange={(v) => handleInputChange("designation", v)}
// //               />
// //               {/* Join Date */}
// //               <LabeledInput
// //                 label="Join Date"
// //                 icon={Calendar}
// //                 type="date"
// //                 value={formData.date_of_joining}
// //                 onChange={(v) => handleInputChange("date_of_joining", v)}
// //               />
// //               {/* Birth Date */}
// //               <LabeledInput
// //                 label="Birth Date"
// //                 icon={Calendar}
// //                 type="date"
// //                 value={formData.birth_date}
// //                 onChange={(v) => handleInputChange("birth_date", v)}
// //               />
// //               {/* Gender */}
// //               <LabeledSelect
// //                 label="Gender"
// //                 icon={User}
// //                 value={formData.sex}
// //                 options={genderOptions}
// //                 onChange={(v) => handleInputChange("sex", v)}
// //               />
// //               {/* Email */}
// //               <LabeledInput
// //                 label="Email Address"
// //                 icon={Mail}
// //                 type="email"
// //                 value={formData.email}
// //                 onChange={(v) => handleInputChange("email", v)}
// //               />
// //               {/* Phone */}
// //               <LabeledInput
// //                 label="Phone Number"
// //                 icon={Phone}
// //                 type="tel"
// //                 value={formData.phone}
// //                 onChange={(v) => handleInputChange("phone", v)}
// //               />
// //               {/* Employee ID */}
// //               <LabeledInput
// //                 label="Employee ID"
// //                 icon={User}
// //                 type="text"
// //                 value={formData.emp_id}
// //                 onChange={(v) => handleInputChange("emp_id", v)}
// //                 required
// //                 placeholder="Unique code (letters and numbers only)"
// //               />
// //             </div>

// //             <div className="flex justify-end mt-8 space-x-3">
// //               <button onClick={resetForm} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
// //                 Clear
// //               </button>
// //               <button
// //                 onClick={handleSubmit}
// //                 disabled={loading}
// //                 className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center"
// //               >
// //                 {loading ? "Saving..." : (<><Plus className="h-5 w-5 mr-2" /> Save Employee</>)}
// //               </button>
// //             </div>
// //           </div>
// //         );

// //       case "upload":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg p-8 border">
// //             <div className="flex items-center mb  -6">
// //               <Upload className="h-6 w-6 text-green-600 mr-3" />
// //               <h2 className="text-2xl font-bold">Upload Excel</h2>
// //             </div>
// //             <div className="border-2 border-dashed rounded-xl p-8 text-center">
// //               <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
// //               <p className="text-sm text-gray-600 mb-2">
// //                 Please use the downloaded template. emp_id is required.
// //               </p>
// //               <p className="text-sm text-gray-600 mb-4">
// //                 department_name must match DB; sub_department must be a valid Line name.
// //               </p>
// //               <input
// //                 id="excel-upload"
// //                 type="file"
// //                 accept=".xlsx,.xls"
// //                 onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
// //                 className="block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:bg-green-50 file:text-green-700"
// //               />
// //             </div>
// //             <div className="flex justify-center gap-4 mt-6">
// //               <button
// //                 onClick={handleExcelUpload}
// //                 disabled={!uploadFile || uploadLoading}
// //                 className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center"
// //               >
// //                 {uploadLoading ? "Uploading..." : (<><Upload className="h-5 w-5 mr-2" /> Upload</>)}
// //               </button>
// //               <button
// //                 onClick={handleDownloadTemplate}
// //                 className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 flex items-center"
// //               >
// //                 <Download className="h-5 w-5 mr-2" /> Download Template
// //               </button>
// //             </div>
// //             {uploadFile && <div className="mt-4 p-3 bg-green-50 rounded-xl text-green-800">Selected: {uploadFile.name}</div>}
// //           </div>
// //         );

// //       case "employee-list":
// //         return (
// //           <div className="bg-white rounded-2xl shadow-lg border overflow-hidden flex flex-col h-[680px]">
// //             <div className="p-6 border-b bg-white">
// //               <h2 className="text-2xl font-bold flex items-center">
// //                 <FileSpreadsheet className="h-6 w-6 text-purple-600 mr-3" />
// //                 Employee Records
// //                 <span className="ml-3 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
// //                   {employees.length}
// //                 </span>
// //               </h2>
// //             </div>

// //             {loading ? (
// //               <div className="flex-1 flex items-center justify-center">
// //                 <div className="text-xl text-gray-500">Loading...</div>
// //               </div>
// //             ) : employees.length === 0 ? (
// //               <div className="flex-1 flex flex-col items-center justify-center p-12">
// //                 <Users className="h-16 w-16 text-gray-400 mb-4" />
// //                 <p className="text-xl font-medium mb-4">No employees yet</p>
// //                 <div className="space-x-3">
// //                   <button
// //                     onClick={() => setActiveTab("add-data")}
// //                     className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
// //                   >
// //                     Add Employee
// //                   </button>
// //                   <button
// //                     onClick={() => setActiveTab("upload")}
// //                     className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
// //                   >
// //                     Upload Excel
// //                   </button>
// //                 </div>
// //               </div>
// //             ) : (
// //               <div className="flex-1 overflow-y-auto">
// //                 <table className="min-w-full divide-y divide-gray-200">
// //                   <thead className="bg-gray-50 sticky top-0 z-10">
// //                     <tr>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sub‑Dept</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Join Date</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
// //                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
// //                     </tr>
// //                   </thead>
// //                   <tbody className="bg-white divide-y divide-gray-200">
// //                     {employees.map((e) => (
// //                       <tr key={e.emp_id} className="hover:bg-gray-50 transition-colors">
// //                         <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.emp_id}</td>
// //                         <td className="px-6 py-4 text-sm font-semibold">
// //                           {[e.first_name, e.last_name].filter(Boolean).join(" ") || e.emp_id}
// //                         </td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">{e.department_name || getDepartmentName(e.department)}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">{e.sub_department_name || "—"}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">{getDesignationLabel(e.designation)}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">{formatDate(e.date_of_joining)}</td>
// //                         <td className="px-6 py-4 text-sm text-gray-600">{sexToLabel(e.sex)}</td>
// //                         <td className="px-6 py-4 text-sm">
// //                           <div className="text-gray-800">{e.email || "—"}</div>
// //                           <div className="text-gray-500 text-xs">{e.phone || "—"}</div>
// //                         </td>
// //                         <td className="px-6 py-4">
// //                           <button
// //                             onClick={() => handleDelete(e.emp_id)}
// //                             className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
// //                           >
// //                             <Trash2 className="h-4 w-4" /> Delete
// //                           </button>
// //                         </td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </table>
// //               </div>
// //             )}
// //           </div>
// //         );

// //       default:
// //         return null;
// //     }
// //   };

// //   return (
// //     <>
// //       <Toaster
// //         position="top-right"
// //         toastOptions={{
// //           duration: 3500,
// //           style: { background: "#363636", color: "#fff", borderRadius: "10px" },
// //           success: { style: { background: "#10b981" } },
// //           error: { style: { background: "#ef4444" } },
// //         }}
// //       />
// //       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
// //         <div className="container mx-auto px-4 py-8">
// //           <div className="mb-8">
// //             <h1 className="text-4xl font-bold text-gray-900 mb-2">Master Table Settings</h1>
// //             <p className="text-lg text-gray-600">
// //               Select a Department first, then choose a Sub‑Department (Lines are filtered by Department).
// //             </p>
// //           </div>

// //           <div className="mb-8 bg-white rounded-t-2xl shadow-sm">
// //             <nav className="flex space-x-8 px-6 -mb-px">
// //               {tabs.map((tab) => {
// //                 const Icon = tab.icon;
// //                 return (
// //                   <button
// //                     key={tab.id}
// //                     onClick={() => setActiveTab(tab.id as any)}
// //                     className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all ${
// //                       activeTab === tab.id
// //                         ? "border-blue-500 text-blue-600 bg-blue-50"
// //                         : "border-transparent text-gray-500 hover:text-gray-700"
// //                     }`}
// //                   >
// //                     <Icon className="h-5 w-5" />
// //                     <span>{tab.name}</span>
// //                   </button>
// //                 );
// //               })}
// //             </nav>
// //           </div>

// //           <div>{renderTabContent()}</div>
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // // Small labeled input/select helpers
// // function LabeledInput({
// //   label,
// //   icon: Icon,
// //   type,
// //   value,
// //   onChange,
// //   required = false,
// //   placeholder,
// // }: {
// //   label: string;
// //   icon: React.ElementType;
// //   type: string;
// //   value: string;
// //   onChange: (v: string) => void;
// //   required?: boolean;
// //   placeholder?: string;
// // }) {
// //   return (
// //     <div className="space-y-2">
// //       <label className="flex items-center text-sm font-medium text-gray-700">
// //         <Icon className="h-4 w-4 mr-2 text-gray-500" />
// //         {label}
// //         {required && <span className="text-red-500 ml-1">*</span>}
// //       </label>
// //       <input
// //         type={type}
// //         value={value}
// //         onChange={(e) => onChange(e.target.value)}
// //         placeholder={placeholder || `Enter ${label.toLowerCase()}`}
// //         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //         required={required}
// //       />
// //     </div>
// //   );
// // }

// // function LabeledSelect({
// //   label,
// //   icon: Icon,
// //   value,
// //   options,
// //   onChange,
// // }: {
// //   label: string;
// //   icon: React.ElementType;
// //   value: string;
// //   options: { value: string; label: string }[];
// //   onChange: (v: string) => void;
// // }) {
// //   return (
// //     <div className="space-y-2">
// //       <label className="flex items-center text-sm font-medium text-gray-700">
// //         <Icon className="h-4 w-4 mr-2 text-gray-500" />
// //         {label}
// //       </label>
// //       <select
// //         value={value}
// //         onChange={(e) => onChange(e.target.value)}
// //         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
// //       >
// //         {options.map((o) => (
// //           <option key={o.value} value={o.value}>
// //             {o.label}
// //           </option>
// //         ))}
// //       </select>
// //     </div>
// //   );
// // }

// // export default MasterTableSettings;



// import React, { useEffect, useMemo, useState } from "react";
// import {
//   UploadCloud as Upload,
//   Plus,
//   Trash2,
//   FileSpreadsheet,
//   Users,
//   Mail,
//   Phone,
//   Calendar,
//   User,
//   Building2,
//   Briefcase,
//   Download,
// } from "lucide-react";

// // ---------------- Types aligned with backend ----------------
// interface EmployeeData {
//   emp_id: string;
//   first_name: string;
//   last_name: string;
//   department: number | null;            // FK (Department.department_id)
//   department_name?: string;             // read-only
//   sub_department: number | null;        // FK (Line.line_id)
//   sub_department_name?: string;         // read-only
//   designation: string;
//   date_of_joining: string;              // YYYY-MM-DD
//   birth_date: string;                   // YYYY-MM-DD
//   sex: string;                          // 'M' | 'F' | 'O' | ''
//   email: string;
//   phone: string;
// }

// interface Department {
//   department_id: number;
//   department_name: string;
// }

// interface ApiStation {
//   id: number;
//   station_name: string;
// }
// interface ApiSubline {
//   id: number;
//   subline_name: string;
//   stations: ApiStation[];
// }
// interface ApiLine {
//   id: number;
//   line_name: string;
//   sublines: ApiSubline[];
//   stations: ApiStation[];
// }
// interface ApiDepartment {
//   id: number;
//   department_name: string;
//   lines: ApiLine[];
//   stations: ApiStation[];
// }
// interface ApiStructureData {
//   hq_name: string;
//   factory_name: string;
//   departments: ApiDepartment[];
// }
// interface ApiHierarchyResponseItem {
//   structure_id: number;
//   structure_name: string;
//   hq: number;
//   hq_name: string;
//   factory: number;
//   factory_name: string;
//   structure_data: ApiStructureData;
// }

// // ---------------- Config ----------------
// const API_BASE_URL = "http://127.0.0.1:8000"; // no trailing slash

// // Build a mapping of department_id -> lines[] from hierarchy-simple
// const buildLinesByDeptFromHierarchy = (
//   items: ApiHierarchyResponseItem[]
// ): Record<number, { line_id: number; line_name: string }[]> => {
//   const map: Record<number, { line_id: number; line_name: string }[]> = {};
//   items?.forEach((item) => {
//     item.structure_data?.departments?.forEach((dept) => {
//       if (!dept?.id) return;
//       if (!map[dept.id]) map[dept.id] = [];
//       const seen = new Set(map[dept.id].map((l) => l.line_id));
//       dept.lines?.forEach((line) => {
//         if (line?.id && line.line_name && !seen.has(line.id)) {
//           map[dept.id].push({ line_id: line.id, line_name: line.line_name });
//           seen.add(line.id);
//         }
//       });
//     });
//   });
//   return map;
// };

// // ---------------- UI helpers ----------------
// const designationOptions = [
//   { value: "", label: "--- Select Designation ---" },
//   { value: "CO- DRIVER", label: "CO- DRIVER" },
//   { value: "DRIVER", label: "DRIVER" },
//   { value: "HELPER", label: "HELPER" },
//   { value: "MALI", label: "MALI" },
//   { value: "OPERATOR", label: "OPERATOR" },
//   { value: "PANTRY BOY", label: "PANTRY BOY" },
//   { value: "SUPERVISOR", label: "SUPERVISOR" },
//   { value: "SWEEPER", label: "SWEEPER" },
//   { value: "OET", label: "OET" },
//   { value: "OE", label: "OE" },
//   { value: "Sr.OE", label: "Sr.OE" },
// ];

// const genderOptions = [
//   { value: "", label: "Select Gender" },
//   { value: "M", label: "Male" },
//   { value: "F", label: "Female" },
//   { value: "O", label: "Other" },
// ];

// const sexToLabel = (v?: string | null) => (v === "M" ? "Male" : v === "F" ? "Female" : v === "O" ? "Other" : "—");

// // Small labeled input/select helpers
// function LabeledInput({
//   label,
//   icon: Icon,
//   type,
//   value,
//   onChange,
//   required = false,
//   placeholder,
// }: {
//   label: string;
//   icon: React.ElementType;
//   type: string;
//   value: string;
//   onChange: (v: string) => void;
//   required?: boolean;
//   placeholder?: string;
// }) {
//   return (
//     <div className="space-y-2">
//       <label className="flex items-center text-sm font-medium text-gray-700">
//         <Icon className="h-4 w-4 mr-2 text-gray-500" />
//         {label}
//         {required && <span className="text-red-500 ml-1">*</span>}
//       </label>
//       <input
//         type={type}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder || `Enter ${label.toLowerCase()}`}
//         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
//         required={required}
//       />
//     </div>
//   );
// }

// function LabeledSelect({
//   label,
//   icon: Icon,
//   value,
//   options,
//   onChange,
// }: {
//   label: string;
//   icon: React.ElementType;
//   value: string;
//   options: { value: string; label: string }[];
//   onChange: (v: string) => void;
// }) {
//   return (
//     <div className="space-y-2">
//       <label className="flex items-center text-sm font-medium text-gray-700">
//         <Icon className="h-4 w-4 mr-2 text-gray-500" />
//         {label}
//       </label>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
//       >
//         {options.map((o) => (
//           <option key={o.value} value={o.value}>
//             {o.label}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }

// // ---------------- Component ----------------
// const MasterTableSettings: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<"overview" | "add-data" | "upload" | "employee-list">("overview");

//   const [employees, setEmployees] = useState<EmployeeData[]>([]);
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [linesByDept, setLinesByDept] = useState<Record<number, { line_id: number; line_name: string }[]>>({});
//   const [loading, setLoading] = useState(false);

//   const [uploadFile, setUploadFile] = useState<File | null>(null);
//   const [uploadLoading, setUploadLoading] = useState(false);

//   const [formData, setFormData] = useState<EmployeeData>({
//     emp_id: "",
//     first_name: "",
//     last_name: "",
//     department: null,
//     sub_department: null,
//     designation: "",
//     date_of_joining: "",
//     birth_date: "",
//     sex: "",
//     email: "",
//     phone: "",
//   });

//   const tabs = [
//     { id: "overview", name: "Overview", icon: Users },
//     { id: "add-data", name: "Add Employee", icon: Plus },
//     { id: "upload", name: "Upload Excel", icon: Upload },
//     { id: "employee-list", name: "Employee Records", icon: FileSpreadsheet },
//   ] as const;

//   // Current Department -> Lines from linesByDept
//   const currentLines = useMemo(() => {
//     if (!formData.department) return [];
//     return linesByDept[formData.department] || [];
//   }, [formData.department, linesByDept]);

//   const lineOptions = useMemo(() => {
//     if (!formData.department) return [{ value: "", label: "— Select Department First —" }];
//     if (currentLines.length === 0) return [{ value: "", label: "— No lines under this department —" }];
//     return [{ value: "", label: "--- Select Sub-Department ---" }, ...currentLines.map((l) => ({ value: String(l.line_id), label: l.line_name }))];
//   }, [formData.department, currentLines]);

//   // Initial fetch: employees + all departments + hierarchy (lines)
//   useEffect(() => {
//     const init = async () => {
//       try {
//         setLoading(true);
//         const [empRes, deptRes, hierRes] = await Promise.all([
//           fetch(`${API_BASE_URL}/mastertable/`),
//           fetch(`${API_BASE_URL}/departments/`),        // ALL departments list
//           fetch(`${API_BASE_URL}/hierarchy-simple/`),  // Lines per department
//         ]);

//         if (!empRes.ok) throw new Error("Failed to fetch employees");
//         if (!deptRes.ok) throw new Error("Failed to fetch departments");
//         if (!hierRes.ok) throw new Error("Failed to fetch hierarchy");

//         const empData = await empRes.json();
//         const deptData: Department[] = await deptRes.json();
//         const hierarchyData: ApiHierarchyResponseItem[] = await hierRes.json();

//         setEmployees(empData || []);

//         // Ensure unique and sorted department list
//         const uniqueMap = new Map<number, Department>();
//         deptData.forEach((d) => {
//           if (d?.department_id && d.department_name) uniqueMap.set(d.department_id, d);
//         });
//         const allDepartments = Array.from(uniqueMap.values()).sort((a, b) =>
//           a.department_name.localeCompare(b.department_name)
//         );
//         setDepartments(allDepartments);

//         // Build dept -> lines mapping from hierarchy
//         setLinesByDept(buildLinesByDeptFromHierarchy(hierarchyData || []));
//       } catch (e: any) {
//         alert(e.message || "Failed to load data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     init();
//   }, []);

//   // Reset sub_department on department change (cascade)
//   useEffect(() => {
//     setFormData((prev) => ({ ...prev, sub_department: null }));
//   }, [formData.department]);

//   // Handlers
//   const handleInputChange = (field: keyof EmployeeData, value: string) => {
//     if (field === "department") {
//       setFormData((prev) => ({
//         ...prev,
//         department: value === "" ? null : parseInt(value, 10),
//         sub_department: null,
//       }));
//     } else if (field === "sub_department") {
//       setFormData((prev) => ({
//         ...prev,
//         sub_department: value === "" ? null : parseInt(value, 10),
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [field]: value }));
//     }
//   };

//   const refreshEmployees = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/mastertable/`);
//       if (res.ok) {
//         const data = await res.json();
//         setEmployees(data || []);
//       }
//     } catch {}
//   };

//   const resetForm = () => {
//     setFormData({
//       emp_id: "",
//       first_name: "",
//       last_name: "",
//       department: null,
//       sub_department: null,
//       designation: "",
//       date_of_joining: "",
//       birth_date: "",
//       sex: "",
//       email: "",
//       phone: "",
//     });
//   };

//   const handleSubmit = async () => {
//     const empId = formData.emp_id.trim();
//     if (!empId) {
//       alert("Employee ID is required");
//       return;
//     }

//     const payload: any = { emp_id: empId };
//     ([
//       "first_name",
//       "last_name",
//       "designation",
//       "date_of_joining",
//       "birth_date",
//       "sex",
//       "email",
//       "phone",
//     ] as (keyof EmployeeData)[]).forEach((f) => {
//       const v = formData[f];
//       if (v && String(v).trim()) payload[f] = String(v).trim();
//     });
//     if (formData.department !== null) payload.department = formData.department;
//     if (formData.sub_department !== null) payload.sub_department = formData.sub_department;

//     try {
//       setLoading(true);
//       const res = await fetch(`${API_BASE_URL}/mastertable/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         let msg = "Failed to save:\n";
//         Object.entries(err).forEach(([k, v]) => {
//           msg += `${k}: ${Array.isArray(v) ? v.join("; ") : v}\n`;
//         });
//         throw new Error(msg.trim());
//       }

//       alert("Employee saved successfully!");
//       await refreshEmployees();
//       resetForm();
//       setActiveTab("employee-list");
//     } catch (e: any) {
//       alert(e.message || "Failed to save.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (empId: string) => {
//     if (!window.confirm("Delete this employee?")) return;
//     try {
//       setLoading(true);
//       const res = await fetch(`${API_BASE_URL}/mastertable/${empId}/`, { method: "DELETE" });
//       if (!res.ok) throw new Error("Delete failed");
//       alert("Deleted successfully!");
//       await refreshEmployees();
//     } catch {
//       alert("Failed to delete.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleExcelUpload = async () => {
//     if (!uploadFile) return alert("Select a file");
//     try {
//       setUploadLoading(true);
//       const fd = new FormData();
//       fd.append("file", uploadFile);
//       const res = await fetch(`${API_BASE_URL}/mastertable/upload_excel/`, {
//         method: "POST",
//         body: fd,
//       });
//       const data = await res.json();
//       if (res.ok) {
//         let msg = `${data.message}\nCreated: ${data.created_count}, Updated: ${data.updated_count}`;
//         if (data.errors?.length) {
//           msg += "\n\nErrors:\n" + data.errors.map((e: any) => `Row ${e.row} (${e.emp_id}): ${e.error}`).join("\n");
//         }
//         alert(msg);
//         await refreshEmployees();
//       } else {
//         alert(data.error || "Upload failed");
//       }
//     } catch (e: any) {
//       alert(e.message);
//     } finally {
//       setUploadLoading(false);
//       setUploadFile(null);
//       const input = document.getElementById("excel-upload") as HTMLInputElement | null;
//       if (input) input.value = "";
//     }
//   };

//   const handleDownloadTemplate = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/mastertable/download_template/`);
//       if (!res.ok) throw new Error();
//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "employee_template.xlsx";
//       a.click();
//       URL.revokeObjectURL(url);
//     } catch {
//       alert("Download failed");
//     }
//   };

//   // Display helpers
//   const formatDate = (d: string) =>
//     !d ? "—" : new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

//   const getDepartmentName = (id: number | null) =>
//     id ? departments.find((d) => d.department_id === id)?.department_name || "Unknown" : "—";

//   const getDesignationLabel = (value: string) =>
//     designationOptions.find((opt) => opt.value === value)?.label || value || "—";

//   // Overview stats
//   const overviewStats = () => {
//     const total = employees.length;
//     const depts = new Set(employees.map((e) => e.department_name || getDepartmentName(e.department))).size;
//     const male = employees.filter((e) => e.sex === "M").length;
//     const female = employees.filter((e) => e.sex === "F").length;
//     return [
//       { title: "Total Employees", value: total, icon: Users, color: "bg-blue-500" },
//       { title: "Departments", value: depts, icon: Building2, color: "bg-green-500" },
//       { title: "Male", value: male, icon: User, color: "bg-purple-500" },
//       { title: "Female", value: female, icon: User, color: "bg-pink-500" },
//     ];
//   };

//   const departmentStats = () => {
//     const counts = employees.reduce((acc, e) => {
//       const name = e.department_name || getDepartmentName(e.department);
//       acc[name] = (acc[name] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);
//     return Object.entries(counts).map(([department, count]) => ({ department, count }));
//   };

//   // UI
//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "overview":
//         return (
//           <div className="space-y-8">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {overviewStats().map((s, i) => {
//                 const Icon = s.icon;
//                 return (
//                   <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <p className="text-sm text-gray-600">{s.title}</p>
//                         <p className="text-3xl font-bold">{s.value}</p>
//                       </div>
//                       <div className={`${s.color} p-3 rounded-xl`}>
//                         <Icon className="h-6 w-6 text-white" />
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white rounded-2xl shadow-lg p-6 border">
//                 <h3 className="text-xl font-semibold mb-4">Department Distribution</h3>
//                 {departmentStats().map((d, i) => (
//                   <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl mb-2">
//                     <span className="font-medium">{d.department}</span>
//                     <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{d.count}</span>
//                   </div>
//                 ))}
//               </div>

//               <div className="bg-white rounded-2xl shadow-lg p-6 border">
//                 <h3 className="text-xl font-semibold mb-4">Recent Additions</h3>
//                 {employees.slice(-3).reverse().map((e, i) => (
//                   <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl mb-2">
//                     <User className="h-5 w-5 text-green-600 mr-3" />
//                     <div>
//                       <p className="font-medium">{[e.first_name, e.last_name].filter(Boolean).join(" ") || e.emp_id}</p>
//                       <p className="text-sm text-gray-600">
//                         {e.sub_department_name || "—"}, {e.department_name || getDepartmentName(e.department)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         );

//       case "add-data":
//         return (
//           <div className="bg-white rounded-2xl shadow-lg p-8 border">
//             <div className="flex items-center mb-6">
//               <Plus className="h-6 w-6 text-blue-600 mr-3" />
//               <h2 className="text-2xl font-bold">Add / Update Employee</h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


//               {/* Other inputs */}

//                 <LabeledInput
//                 label="Employee ID"
//                 icon={User}
//                 type="text"
//                 value={formData.emp_id}
//                 onChange={(v) => handleInputChange("emp_id", v)}
//                 required
//                 placeholder="Unique code (letters and numbers only)"
//               />
//               <LabeledInput
//                 label="First Name"
//                 icon={User}
//                 type="text"
//                 value={formData.first_name}
//                 onChange={(v) => handleInputChange("first_name", v)}
//               />
//               <LabeledInput
//                 label="Last Name"
//                 icon={User}
//                 type="text"
//                 value={formData.last_name}
//                 onChange={(v) => handleInputChange("last_name", v)}
//               />
//               <LabeledSelect
//                 label="Designation"
//                 icon={Briefcase}
//                 value={formData.designation}
//                 options={designationOptions}
//                 onChange={(v) => handleInputChange("designation", v)}
//               />

//                  {/* Department */}
//               <div className="space-y-2">
//                 <label className="flex items-center text-sm font-medium text-gray-700">
//                   <Building2 className="h-4 w-4 mr-2 text-gray-500" />
//                   Department
//                 </label>
//                 <select
//                   value={formData.department ?? ""}
//                   onChange={(e) => handleInputChange("department", e.target.value)}
//                   className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select Department (Optional)</option>
//                   {departments.map((d) => {
//                     const hasLines = (linesByDept[d.department_id]?.length || 0) > 0;
//                     return (
//                       <option key={d.department_id} value={d.department_id}>
//                         {d.department_name}{hasLines ? "" : " (No lines)"}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>

//               {/* Sub-Department (Line) */}
//               <div className="space-y-2">
//                 <label className="flex items-center text-sm font-medium text-gray-700">
//                   <Building2 className="h-4 w-4 mr-2 text-gray-500" />
//                   Sub-Department
//                 </label>
//                 <select
//                   value={formData.sub_department ?? ""}
//                   onChange={(e) => handleInputChange("sub_department", e.target.value)}
//                   disabled={lineOptions.length === 0 || (lineOptions.length === 1 && lineOptions[0].value === "")}
//                   className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
//                     lineOptions.length === 0 || (lineOptions.length === 1 && lineOptions[0].value === "")
//                       ? "bg-gray-100 text-gray-500 cursor-not-allowed"
//                       : ""
//                   }`}
//                 >
//                   {lineOptions.map((o) => (
//                     <option key={String(o.value)} value={o.value}>
//                       {o.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <LabeledInput
//                 label="Join Date"
//                 icon={Calendar}
//                 type="date"
//                 value={formData.date_of_joining}
//                 onChange={(v) => handleInputChange("date_of_joining", v)}
//               />
//               <LabeledInput
//                 label="Birth Date"
//                 icon={Calendar}
//                 type="date"
//                 value={formData.birth_date}
//                 onChange={(v) => handleInputChange("birth_date", v)}
//               />
//               <LabeledSelect
//                 label="Gender"
//                 icon={User}
//                 value={formData.sex}
//                 options={genderOptions}
//                 onChange={(v) => handleInputChange("sex", v)}
//               />
//               <LabeledInput
//                 label="Email Address"
//                 icon={Mail}
//                 type="email"
//                 value={formData.email}
//                 onChange={(v) => handleInputChange("email", v)}
//               />
//               <LabeledInput
//                 label="Phone Number"
//                 icon={Phone}
//                 type="tel"
//                 value={formData.phone}
//                 onChange={(v) => handleInputChange("phone", v)}
//               />

//             </div>

//             <div className="flex justify-end mt-8 space-x-3">
//               <button onClick={resetForm} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
//                 Clear
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center"
//               >
//                 {loading ? "Saving..." : (<><Plus className="h-5 w-5 mr-2" /> Save Employee</>)}
//               </button>
//             </div>
//           </div>
//         );

//       case "upload":
//         return (
//           <div className="bg-white rounded-2xl shadow-lg p-8 border">
//             <div className="flex items-center mb-6">
//               <Upload className="h-6 w-6 text-green-600 mr-3" />
//               <h2 className="text-2xl font-bold">Upload Excel</h2>
//             </div>
//             <div className="border-2 border-dashed rounded-xl p-8 text-center">
//               <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//               <p className="text-sm text-gray-600 mb-2">
//                 Please use the downloaded template. emp_id is required.
//               </p>
//               <p className="text-sm text-gray-600 mb-4">
//                 department_name must match DB; sub_department must be a valid Line name.
//               </p>
//               <input
//                 id="excel-upload"
//                 type="file"
//                 accept=".xlsx,.xls"
//                 onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
//                 className="block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:bg-green-50 file:text-green-700"
//               />
//             </div>
//             <div className="flex justify-center gap-4 mt-6">
//               <button
//                 onClick={handleExcelUpload}
//                 disabled={!uploadFile || uploadLoading}
//                 className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center"
//               >
//                 {uploadLoading ? "Uploading..." : (<><Upload className="h-5 w-5 mr-2" /> Upload</>)}
//               </button>
//               <button
//                 onClick={handleDownloadTemplate}
//                 className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 flex items-center"
//               >
//                 <Download className="h-5 w-5 mr-2" /> Download Template
//               </button>
//             </div>
//             {uploadFile && <div className="mt-4 p-3 bg-green-50 rounded-xl text-green-800">Selected: {uploadFile.name}</div>}
//           </div>
//         );

//       case "employee-list":
//         return (
//           <div className="bg-white rounded-2xl shadow-lg border overflow-hidden flex flex-col h-[680px]">
//             <div className="p-6 border-b bg-white">
//               <h2 className="text-2xl font-bold flex items-center">
//                 <FileSpreadsheet className="h-6 w-6 text-purple-600 mr-3" />
//                 Employee Records
//                 <span className="ml-3 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
//                   {employees.length}
//                 </span>
//               </h2>
//             </div>

//             {loading ? (
//               <div className="flex-1 flex items-center justify-center">
//                 <div className="text-xl text-gray-500">Loading...</div>
//               </div>
//             ) : employees.length === 0 ? (
//               <div className="flex-1 flex flex-col items-center justify-center p-12">
//                 <Users className="h-16 w-16 text-gray-400 mb-4" />
//                 <p className="text-xl font-medium mb-4">No employees yet</p>
//                 <div className="space-x-3">
//                   <button
//                     onClick={() => setActiveTab("add-data")}
//                     className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                   >
//                     Add Employee
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("upload")}
//                     className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//                   >
//                     Upload Excel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex-1 overflow-y-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50 sticky top-0 z-10">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sub‑Dept</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Join Date</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {employees.map((e) => (
//                       <tr key={e.emp_id} className="hover:bg-gray-50 transition-colors">
//                         <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.emp_id}</td>
//                         <td className="px-6 py-4 text-sm font-semibold">
//                           {[e.first_name, e.last_name].filter(Boolean).join(" ") || e.emp_id}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-600">{e.department_name || getDepartmentName(e.department)}</td>
//                         <td className="px-6 py-4 text-sm text-gray-600">{e.sub_department_name || "—"}</td>
//                         <td className="px-6 py-4 text-sm text-gray-600">{getDesignationLabel(e.designation)}</td>
//                         <td className="px-6 py-4 text-sm text-gray-600">{formatDate(e.date_of_joining)}</td>
//                         <td className="px-6 py-4 text-sm text-gray-600">{sexToLabel(e.sex)}</td>
//                         <td className="px-6 py-4 text-sm">
//                           <div className="text-gray-800">{e.email || "—"}</div>
//                           <div className="text-gray-500 text-xs">{e.phone || "—"}</div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <button
//                             onClick={() => handleDelete(e.emp_id)}
//                             className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
//                           >
//                             <Trash2 className="h-4 w-4" /> Delete
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
//       <div className="container mx-auto px-4 py-8">
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">Master Table Settings</h1>
//           <p className="text-lg text-gray-600">
//             Choose a Department (all departments). Sub‑Department shows Lines only for that Department (from hierarchy).
//           </p>
//         </div>

//         <div className="mb-8 bg-white rounded-t-2xl shadow-sm">
//           <nav className="flex space-x-8 px-6 -mb-px">
//             {[
//               { id: "overview", name: "Overview", icon: Users },
//               { id: "add-data", name: "Add Employee", icon: Plus },
//               { id: "upload", name: "Upload Excel", icon: Upload },
//               { id: "employee-list", name: "Employee Records", icon: FileSpreadsheet },
//             ].map((tab) => {
//               const Icon = tab.icon as any;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id as any)}
//                   className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all ${
//                     activeTab === tab.id
//                       ? "border-blue-500 text-blue-600 bg-blue-50"
//                       : "border-transparent text-gray-500 hover:text-gray-700"
//                   }`}
//                 >
//                   <Icon className="h-5 w-5" />
//                   <span>{tab.name}</span>
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         <div>{renderTabContent()}</div>
//       </div>
//     </div>
//   );
// };

// export default MasterTableSettings;




// import React, { useEffect, useMemo, useState } from "react";
// import {
//   UploadCloud as Upload,
//   Plus,
//   Trash2,
//   FileSpreadsheet,
//   Users,
//   Mail,
//   Phone,
//   Calendar,
//   User,
//   Building2,
//   Briefcase,
//   Download,
//   Edit as EditIcon,
//   ArrowUp,
//   ArrowDown,
//   Search,
// } from "lucide-react";

// // ---------------- Types aligned with backend ----------------
// interface EmployeeData {
//   emp_id: string;
//   first_name: string;
//   last_name: string;
//   department: number | null;
//   department_name?: string;
//   sub_department: number | null;
//   sub_department_name?: string;
//   designation: string;
//   date_of_joining: string;
//   birth_date: string;
//   sex: string;
//   email: string;
//   phone: string;
// }

// interface Department {
//   department_id: number;
//   department_name: string;
// }

// interface ApiStation {
//   id: number;
//   station_name: string;
// }
// interface ApiSubline {
//   id: number;
//   subline_name: string;
//   stations: ApiStation[];
// }
// interface ApiLine {
//   id: number;
//   line_name: string;
//   sublines: ApiSubline[];
//   stations: ApiStation[];
// }
// interface ApiDepartment {
//   id: number;
//   department_name: string;
//   lines: ApiLine[];
//   stations: ApiStation[];
// }
// interface ApiStructureData {
//   hq_name: string;
//   factory_name: string;
//   departments: ApiDepartment[];
// }
// interface ApiHierarchyResponseItem {
//   structure_id: number;
//   structure_name: string;
//   hq: number;
//   hq_name: string;
//   factory: number;
//   factory_name: string;
//   structure_data: ApiStructureData;
// }

// // ---------------- Config ----------------
// const API_BASE_URL = "http://127.0.0.1:8000"; // no trailing slash

// const buildLinesByDeptFromHierarchy = (
//   items: ApiHierarchyResponseItem[]
// ): Record<number, { line_id: number; line_name: string }[]> => {
//   const map: Record<number, { line_id: number; line_name: string }[]> = {};
//   items?.forEach((item) => {
//     item.structure_data?.departments?.forEach((dept) => {
//       if (!dept?.id) return;
//       if (!map[dept.id]) map[dept.id] = [];
//       const seen = new Set(map[dept.id].map((l) => l.line_id));
//       dept.lines?.forEach((line) => {
//         if (line?.id && line.line_name && !seen.has(line.id)) {
//           map[dept.id].push({ line_id: line.id, line_name: line.line_name });
//           seen.add(line.id);
//         }
//       });
//     });
//   });
//   return map;
// };

// // ---------------- UI helpers ----------------
// const designationOptions = [
//   { value: "", label: "--- Select Designation ---" },
//   { value: "CO- DRIVER", label: "CO- DRIVER" },
//   { value: "DRIVER", label: "DRIVER" },
//   { value: "HELPER", label: "HELPER" },
//   { value: "MALI", label: "MALI" },
//   { value: "OPERATOR", label: "OPERATOR" },
//   { value: "PANTRY BOY", label: "PANTRY BOY" },
//   { value: "SUPERVISOR", label: "SUPERVISOR" },
//   { value: "SWEEPER", label: "SWEEPER" },
//   { value: "OET", label: "OET" },
//   { value: "OE", label: "OE" },
//   { value: "Sr.OE", label: "Sr.OE" },
// ];

// const genderOptions = [
//   { value: "", label: "Select Gender" },
//   { value: "M", label: "Male" },
//   { value: "F", label: "Female" },
//   { value: "O", label: "Other" },
// ];

// const sexToLabel = (v?: string | null) => (v === "M" ? "Male" : v === "F" ? "Female" : v === "O" ? "Other" : "—");

// function LabeledInput({
//   label,
//   icon: Icon,
//   type,
//   value,
//   onChange,
//   required = false,
//   placeholder,
//   disabled = false,
// }: {
//   label: string;
//   icon: React.ElementType;
//   type: string;
//   value: string;
//   onChange: (v: string) => void;
//   required?: boolean;
//   placeholder?: string;
//   disabled?: boolean;
// }) {
//   return (
//     <div className="space-y-2">
//       <label className="flex items-center text-sm font-medium text-gray-700">
//         <Icon className="h-4 w-4 mr-2 text-gray-500" />
//         {label}
//         {required && <span className="text-red-500 ml-1">*</span>}
//       </label>
//       <input
//         type={type}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder || `Enter ${label.toLowerCase()}`}
//         disabled={disabled}
//         className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${disabled ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""
//           }`}
//         required={required}
//       />
//     </div>
//   );
// }

// function LabeledSelect({
//   label,
//   icon: Icon,
//   value,
//   options,
//   onChange,
//   disabled = false,
// }: {
//   label: string;
//   icon: React.ElementType;
//   value: string;
//   options: { value: string; label: string }[];
//   onChange: (v: string) => void;
//   disabled?: boolean;
// }) {
//   return (
//     <div className="space-y-2">
//       <label className="flex items-center text-sm font-medium text-gray-700">
//         <Icon className="h-4 w-4 mr-2 text-gray-500" />
//         {label}
//       </label>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         disabled={disabled}
//         className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${disabled ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""
//           }`}
//       >
//         {options.map((o) => (
//           <option key={o.value} value={o.value}>
//             {o.label}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }

// // ---------------- Main Component ----------------
// const MasterTableSettings: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<"overview" | "add-data" | "upload" | "employee-list">("overview");

//   const [employees, setEmployees] = useState<EmployeeData[]>([]);
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [linesByDept, setLinesByDept] = useState<Record<number, { line_id: number; line_name: string }[]>>({});
//   const [loading, setLoading] = useState(false);

//   const [uploadFile, setUploadFile] = useState<File | null>(null);
//   const [uploadLoading, setUploadLoading] = useState(false);

//   const [formData, setFormData] = useState<EmployeeData>({
//     emp_id: "",
//     first_name: "",
//     last_name: "",
//     department: null,
//     sub_department: null,
//     designation: "",
//     date_of_joining: "",
//     birth_date: "",
//     sex: "",
//     email: "",
//     phone: "",
//   });

//   const [isEditing, setIsEditing] = useState(false);

//   // Employee list features
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortColumn, setSortColumn] = useState<keyof EmployeeData | "name" | "department_name" | "sub_department_name">("emp_id");
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
//   const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

//   const tabs = [
//     { id: "overview", name: "Overview", icon: Users },
//     { id: "add-data", name: "Add Employee", icon: Plus },
//     { id: "upload", name: "Upload Excel", icon: Upload },
//     { id: "employee-list", name: "Employee Records", icon: FileSpreadsheet },
//   ] as const;

//   const currentLines = useMemo(() => {
//     if (!formData.department) return [];
//     return linesByDept[formData.department] || [];
//   }, [formData.department, linesByDept]);

//   const lineOptions = useMemo(() => {
//     if (!formData.department) return [{ value: "", label: "— Select Department First —" }];
//     if (currentLines.length === 0) return [{ value: "", label: "— No lines under this department —" }];
//     return [{ value: "", label: "--- Select Sub-Department ---" }, ...currentLines.map((l) => ({ value: String(l.line_id), label: l.line_name }))];
//   }, [formData.department, currentLines]);

//   // Fetch initial data
//   useEffect(() => {
//     const init = async () => {
//       try {
//         setLoading(true);
//         const [empRes, deptRes, hierRes] = await Promise.all([
//           fetch(`${API_BASE_URL}/mastertable/`),
//           fetch(`${API_BASE_URL}/departments/`),
//           fetch(`${API_BASE_URL}/hierarchy-simple/`),
//         ]);

//         if (!empRes.ok) throw new Error("Failed to fetch employees");
//         if (!deptRes.ok) throw new Error("Failed to fetch departments");
//         if (!hierRes.ok) throw new Error("Failed to fetch hierarchy");

//         const empData = await empRes.json();
//         const deptData: Department[] = await deptRes.json();
//         const hierarchyData: ApiHierarchyResponseItem[] = await hierRes.json();

//         setEmployees(empData || []);

//         const uniqueMap = new Map<number, Department>();
//         deptData.forEach((d) => {
//           if (d?.department_id && d.department_name) uniqueMap.set(d.department_id, d);
//         });
//         const allDepartments = Array.from(uniqueMap.values()).sort((a, b) =>
//           a.department_name.localeCompare(b.department_name)
//         );
//         setDepartments(allDepartments);

//         setLinesByDept(buildLinesByDeptFromHierarchy(hierarchyData || []));
//       } catch (e: any) {
//         alert(e.message || "Failed to load initial data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     init();
//   }, []);

//   useEffect(() => {
//     setFormData((prev) => ({ ...prev, sub_department: null }));
//   }, [formData.department]);

//   const handleInputChange = (field: keyof EmployeeData, value: string) => {
//     if (field === "department") {
//       setFormData((prev) => ({
//         ...prev,
//         department: value === "" ? null : parseInt(value, 10),
//         sub_department: null,
//       }));
//     } else if (field === "sub_department") {
//       setFormData((prev) => ({
//         ...prev,
//         sub_department: value === "" ? null : parseInt(value, 10),
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [field]: value }));
//     }
//   };

//   const refreshEmployees = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/mastertable/`);
//       if (res.ok) {
//         const data = await res.json();
//         setEmployees(data || []);
//       }
//     } catch { }
//   };

//   const resetForm = () => {
//     setFormData({
//       emp_id: "",
//       first_name: "",
//       last_name: "",
//       department: null,
//       sub_department: null,
//       designation: "",
//       date_of_joining: "",
//       birth_date: "",
//       sex: "",
//       email: "",
//       phone: "",
//     });
//     setIsEditing(false);
//   };

//   const handleSubmit = async () => {
//     const empId = formData.emp_id.trim();
//     if (!empId) {
//       alert("Employee ID is required");
//       return;
//     }

//     const payload: any = { emp_id: empId };
//     ([
//       "first_name",
//       "last_name",
//       "designation",
//       "date_of_joining",
//       "birth_date",
//       "sex",
//       "email",
//       "phone",
//     ] as (keyof EmployeeData)[]).forEach((f) => {
//       const v = formData[f];
//       if (v && String(v).trim()) payload[f] = String(v).trim();
//     });
//     if (formData.department !== null) payload.department = formData.department;
//     if (formData.sub_department !== null) payload.sub_department = formData.sub_department;

//     try {
//       setLoading(true);
//       const method = isEditing ? "PUT" : "POST";
//       const url = isEditing ? `${API_BASE_URL}/mastertable/${empId}/` : `${API_BASE_URL}/mastertable/`;

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         let msg = "Failed to save:\n";
//         Object.entries(err).forEach(([k, v]) => {
//           msg += `${k}: ${Array.isArray(v) ? v.join("; ") : v}\n`;
//         });
//         throw new Error(msg.trim());
//       }

//       alert(isEditing ? "Employee updated successfully!" : "Employee added successfully!");
//       await refreshEmployees();
//       resetForm();
//       setActiveTab("employee-list");
//     } catch (e: any) {
//       alert(e.message || "Failed to save employee.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (empId: string) => {
//     const firstConfirm = window.confirm("Are you sure you want to delete this employee?");
//     if (!firstConfirm) return;

//     const secondConfirm = window.confirm(
//       `This action cannot be undone!\n\nDeleting employee ${empId} will also remove all related data from the system (ojt,Skill evaluation,operator observance  etc.).\n\nDo you really want to proceed?`
//     );
//     if (!secondConfirm) return;

//     try {
//       setLoading(true);
//       const res = await fetch(`${API_BASE_URL}/mastertable/${empId}/`, { method: "DELETE" });
//       if (!res.ok) throw new Error("Delete failed");
//       alert("Employee and related data deleted successfully!");
//       await refreshEmployees();
//       setSelectedEmployees(new Set());
//     } catch (err) {
//       alert("Failed to delete employee.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (selectedEmployees.size === 0) return;

//     const firstConfirm = window.confirm(`Are you sure you want to delete ${selectedEmployees.size} employees?`);
//     if (!firstConfirm) return;

//     const secondConfirm = window.confirm(
//       `This action cannot be undone!\n\nDeleting ${selectedEmployees.size} employees will also remove all their related data from the system (attendance, salary, leaves, etc.).\n\nDo you really want to proceed?`
//     );
//     if (!secondConfirm) return;

//     try {
//       setLoading(true);
//       await Promise.all(
//         Array.from(selectedEmployees).map((empId) =>
//           fetch(`${API_BASE_URL}/mastertable/${empId}/`, { method: "DELETE" })
//         )
//       );
//       alert("Selected employees and their related data deleted successfully!");
//       await refreshEmployees();
//       setSelectedEmployees(new Set());
//     } catch {
//       alert("Failed to delete some employees.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (employee: EmployeeData) => {
//     setFormData({
//       ...employee,
//       department: employee.department ?? null,
//       sub_department: employee.sub_department ?? null,
//     });
//     setIsEditing(true);
//     setActiveTab("add-data");
//   };

//   const handleSelectAll = (checked: boolean) => {
//     if (checked) {
//       const allIds = new Set(filteredAndSortedEmployees.map((e) => e.emp_id));
//       setSelectedEmployees(allIds);
//     } else {
//       setSelectedEmployees(new Set());
//     }
//   };

//   const handleSelectEmployee = (empId: string, checked: boolean) => {
//     const newSelected = new Set(selectedEmployees);
//     if (checked) newSelected.add(empId);
//     else newSelected.delete(empId);
//     setSelectedEmployees(newSelected);
//   };

//   const handleSort = (column: typeof sortColumn) => {
//     if (sortColumn === column) {
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc");
//     } else {
//       setSortColumn(column);
//       setSortDirection("asc");
//     }
//   };

//   const handleExcelUpload = async () => {
//     if (!uploadFile) return alert("Select a file first");
//     try {
//       setUploadLoading(true);
//       const fd = new FormData();
//       fd.append("file", uploadFile);

//       const res = await fetch(`${API_BASE_URL}/mastertable/upload_excel/`, {
//         method: "POST",
//         body: fd,
//       });
//       const data = await res.json();

//       if (res.ok) {
//         let msg = `${data.message}\nCreated: ${data.created_count}, Updated: ${data.updated_count}`;
//         if (data.errors?.length) {
//           msg += "\n\nErrors:\n" + data.errors.map((e: any) => `Row ${e.row} (${e.emp_id}): ${e.error}`).join("\n");
//         }
//         alert(msg);
//         await refreshEmployees();
//       } else {
//         alert(data.error || "Upload failed");
//       }
//     } catch (e: any) {
//       alert(e.message || "Upload error");
//     } finally {
//       setUploadLoading(false);
//       setUploadFile(null);
//       const input = document.getElementById("excel-upload") as HTMLInputElement | null;
//       if (input) input.value = "";
//     }
//   };

//   const handleDownloadTemplate = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/mastertable/download_template/`);
//       if (!res.ok) throw new Error();
//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "employee_template.xlsx";
//       a.click();
//       URL.revokeObjectURL(url);
//     } catch {
//       alert("Failed to download template");
//     }
//   };

//   const formatDate = (d: string) =>
//     !d ? "—" : new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

//   const getDepartmentName = (id: number | null) =>
//     id ? departments.find((d) => d.department_id === id)?.department_name || "Unknown" : "—";

//   const getDesignationLabel = (value: string) =>
//     designationOptions.find((opt) => opt.value === value)?.label || value || "—";

//   const overviewStats = () => {
//     const total = employees.length;
//     const depts = new Set(employees.map((e) => e.department_name || getDepartmentName(e.department))).size;
//     const male = employees.filter((e) => e.sex === "M").length;
//     const female = employees.filter((e) => e.sex === "F").length;
//     return [
//       { title: "Total Employees", value: total, icon: Users, color: "bg-blue-500" },
//       { title: "Departments", value: depts, icon: Building2, color: "bg-green-500" },
//       { title: "Male", value: male, icon: User, color: "bg-purple-500" },
//       { title: "Female", value: female, icon: User, color: "bg-pink-500" },
//     ];
//   };

//   const departmentStats = () => {
//     const counts = employees.reduce((acc, e) => {
//       const name = e.department_name || getDepartmentName(e.department);
//       acc[name] = (acc[name] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);
//     return Object.entries(counts).map(([department, count]) => ({ department, count }));
//   };

//   const filteredAndSortedEmployees = useMemo(() => {
//     let filtered = employees.filter((e) => {
//       const name = `${e.first_name} ${e.last_name}`.toLowerCase();
//       const query = searchQuery.toLowerCase();
//       return (
//         e.emp_id.toLowerCase().includes(query) ||
//         name.includes(query) ||
//         e.email.toLowerCase().includes(query) ||
//         e.phone.includes(query)
//       );
//     });

//     filtered.sort((a, b) => {
//       let valA: any, valB: any;

//       switch (sortColumn) {
//         case "emp_id":
//           valA = a.emp_id;
//           valB = b.emp_id;
//           break;
//         case "name":
//           valA = `${a.first_name} ${a.last_name}`.toLowerCase();
//           valB = `${b.first_name} ${b.last_name}`.toLowerCase();
//           break;
//         case "department_name":
//           valA = (a.department_name || getDepartmentName(a.department) || "").toLowerCase();
//           valB = (b.department_name || getDepartmentName(b.department) || "").toLowerCase();
//           break;
//         case "sub_department_name":
//           valA = (a.sub_department_name || "").toLowerCase();
//           valB = (b.sub_department_name || "").toLowerCase();
//           break;
//         case "designation":
//           valA = a.designation.toLowerCase();
//           valB = b.designation.toLowerCase();
//           break;
//         case "date_of_joining":
//           valA = new Date(a.date_of_joining || "1900-01-01");
//           valB = new Date(b.date_of_joining || "1900-01-01");
//           break;
//         case "sex":
//           valA = a.sex;
//           valB = b.sex;
//           break;
//         default:
//           return 0;
//       }

//       if (valA < valB) return sortDirection === "asc" ? -1 : 1;
//       if (valA > valB) return sortDirection === "asc" ? 1 : -1;
//       return 0;
//     });

//     return filtered;
//   }, [employees, searchQuery, sortColumn, sortDirection, departments]);

//   // Render tab content
//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "overview":
//         return (
//           <div className="space-y-8">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {overviewStats().map((s, i) => {
//                 const Icon = s.icon;
//                 return (
//                   <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <p className="text-sm text-gray-600">{s.title}</p>
//                         <p className="text-3xl font-bold">{s.value}</p>
//                       </div>
//                       <div className={`${s.color} p-3 rounded-xl`}>
//                         <Icon className="h-6 w-6 text-white" />
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white rounded-2xl shadow-lg p-6 border">
//                 <h3 className="text-xl font-semibold mb-4">Department Distribution</h3>
//                 {departmentStats().map((d, i) => (
//                   <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl mb-2">
//                     <span className="font-medium">{d.department}</span>
//                     <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{d.count}</span>
//                   </div>
//                 ))}
//               </div>

//               <div className="bg-white rounded-2xl shadow-lg p-6 border">
//                 <h3 className="text-xl font-semibold mb-4">Recent Additions</h3>
//                 {employees.slice(-3).reverse().map((e, i) => (
//                   <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl mb-2">
//                     <User className="h-5 w-5 text-green-600 mr-3" />
//                     <div>
//                       <p className="font-medium">{[e.first_name, e.last_name].filter(Boolean).join(" ") || e.emp_id}</p>
//                       <p className="text-sm text-gray-600">
//                         {e.sub_department_name || "—"}, {e.department_name || getDepartmentName(e.department)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         );

//       case "add-data":
//         return (
//           <div className="bg-white rounded-2xl shadow-lg p-8 border">
//             <div className="flex items-center mb-6">
//               <Plus className="h-6 w-6 text-blue-600 mr-3" />
//               <h2 className="text-2xl font-bold">{isEditing ? "Edit Employee" : "Add New Employee"}</h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <LabeledInput
//                 label="Employee ID"
//                 icon={User}
//                 type="text"
//                 value={formData.emp_id}
//                 onChange={(v) => handleInputChange("emp_id", v)}
//                 required
//                 disabled={isEditing}
//                 placeholder="Unique code (cannot be changed after creation)"
//               />

//               <LabeledInput
//                 label="First Name"
//                 icon={User}
//                 type="text"
//                 value={formData.first_name}
//                 onChange={(v) => handleInputChange("first_name", v)}
//               />

//               <LabeledInput
//                 label="Last Name"
//                 icon={User}
//                 type="text"
//                 value={formData.last_name}
//                 onChange={(v) => handleInputChange("last_name", v)}
//               />

//               <LabeledSelect
//                 label="Designation"
//                 icon={Briefcase}
//                 value={formData.designation}
//                 options={designationOptions}
//                 onChange={(v) => handleInputChange("designation", v)}
//               />

//               <div className="space-y-2">
//                 <label className="flex items-center text-sm font-medium text-gray-700">
//                   <Building2 className="h-4 w-4 mr-2 text-gray-500" />
//                   Department
//                 </label>
//                 <select
//                   value={formData.department ?? ""}
//                   onChange={(e) => handleInputChange("department", e.target.value)}
//                   className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select Department (Optional)</option>
//                   {departments.map((d) => {
//                     const hasLines = (linesByDept[d.department_id]?.length || 0) > 0;
//                     return (
//                       <option key={d.department_id} value={d.department_id}>
//                         {d.department_name}{hasLines ? "" : " (No lines)"}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label className="flex items-center text-sm font-medium text-gray-700">
//                   <Building2 className="h-4 w-4 mr-2 text-gray-500" />
//                   Sub-Department
//                 </label>
//                 <select
//                   value={formData.sub_department ?? ""}
//                   onChange={(e) => handleInputChange("sub_department", e.target.value)}
//                   disabled={lineOptions.length === 0 || (lineOptions.length === 1 && lineOptions[0].value === "")}
//                   className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${lineOptions.length === 0 || (lineOptions.length === 1 && lineOptions[0].value === "")
//                       ? "bg-gray-100 text-gray-500 cursor-not-allowed"
//                       : ""
//                     }`}
//                 >
//                   {lineOptions.map((o) => (
//                     <option key={String(o.value)} value={o.value}>
//                       {o.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <LabeledInput
//                 label="Join Date"
//                 icon={Calendar}
//                 type="date"
//                 value={formData.date_of_joining}
//                 onChange={(v) => handleInputChange("date_of_joining", v)}
//               />

//               <LabeledInput
//                 label="Birth Date"
//                 icon={Calendar}
//                 type="date"
//                 value={formData.birth_date}
//                 onChange={(v) => handleInputChange("birth_date", v)}
//               />

//               <LabeledSelect
//                 label="Gender"
//                 icon={User}
//                 value={formData.sex}
//                 options={genderOptions}
//                 onChange={(v) => handleInputChange("sex", v)}
//               />

//               <LabeledInput
//                 label="Email Address"
//                 icon={Mail}
//                 type="email"
//                 value={formData.email}
//                 onChange={(v) => handleInputChange("email", v)}
//               />

//               <LabeledInput
//                 label="Phone Number"
//                 icon={Phone}
//                 type="tel"
//                 value={formData.phone}
//                 onChange={(v) => handleInputChange("phone", v)}
//               />
//             </div>

//             <div className="flex justify-end mt-8 space-x-3">
//               <button
//                 onClick={resetForm}
//                 className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
//               >
//                 {isEditing ? "Cancel Edit" : "Clear"}
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center"
//               >
//                 {loading ? "Saving..." : isEditing ? "Update Employee" : "Save Employee"}
//               </button>
//             </div>
//           </div>
//         );

//       case "upload":
//         return (
//           <div className="bg-white rounded-2xl shadow-lg p-8 border">
//             <div className="flex items-center mb-6">
//               <Upload className="h-6 w-6 text-green-600 mr-3" />
//               <h2 className="text-2xl font-bold">Upload Excel</h2>
//             </div>
//             <div className="border-2 border-dashed rounded-xl p-8 text-center">
//               <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//               <p className="text-sm text-gray-600 mb-2">
//                 Please use the downloaded template. emp_id is required.
//               </p>
//               <p className="text-sm text-gray-600 mb-4">
//                 department_name must match DB; sub_department must be a valid Line name.
//               </p>
//               <input
//                 id="excel-upload"
//                 type="file"
//                 accept=".xlsx,.xls"
//                 onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
//                 className="block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:bg-green-50 file:text-green-700"
//               />
//             </div>
//             <div className="flex justify-center gap-4 mt-6">
//               <button
//                 onClick={handleExcelUpload}
//                 disabled={!uploadFile || uploadLoading}
//                 className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center"
//               >
//                 {uploadLoading ? "Uploading..." : (<><Upload className="h-5 w-5 mr-2" /> Upload</>)}
//               </button>
//               <button
//                 onClick={handleDownloadTemplate}
//                 className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 flex items-center"
//               >
//                 <Download className="h-5 w-5 mr-2" /> Download Template
//               </button>
//             </div>
//             {uploadFile && <div className="mt-4 p-3 bg-green-50 rounded-xl text-green-800">Selected: {uploadFile.name}</div>}
//           </div>
//         );

//       case "employee-list":
//         return (
//           <div className="bg-white rounded-2xl shadow-lg border overflow-hidden flex flex-col h-[680px]">
//             <div className="p-6 border-b bg-white flex justify-between items-center flex-wrap gap-4">
//               <h2 className="text-2xl font-bold flex items-center">
//                 <FileSpreadsheet className="h-6 w-6 text-purple-600 mr-3" />
//                 Employee Records
//                 <span className="ml-3 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
//                   {filteredAndSortedEmployees.length}
//                 </span>
//               </h2>

//               <div className="flex items-center space-x-4">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search by ID, name, email, phone..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 w-64"
//                   />
//                 </div>

//                 {selectedEmployees.size > 0 && (
//                   <button
//                     onClick={handleBulkDelete}
//                     className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center"
//                   >
//                     <Trash2 className="h-4 w-4 mr-2" />
//                     Delete Selected ({selectedEmployees.size})
//                   </button>
//                 )}
//               </div>
//             </div>

//             {loading ? (
//               <div className="flex-1 flex items-center justify-center">
//                 <div className="text-xl text-gray-500">Loading...</div>
//               </div>
//             ) : filteredAndSortedEmployees.length === 0 ? (
//               <div className="flex-1 flex flex-col items-center justify-center p-12">
//                 <Users className="h-16 w-16 text-gray-400 mb-4" />
//                 <p className="text-xl font-medium mb-4">
//                   {searchQuery ? "No employees match your search" : "No employees yet"}
//                 </p>
//                 <div className="space-x-3">
//                   <button
//                     onClick={() => setActiveTab("add-data")}
//                     className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                   >
//                     Add Employee
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("upload")}
//                     className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//                   >
//                     Upload Excel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex-1 overflow-y-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50 sticky top-0 z-10">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         <input
//                           type="checkbox"
//                           checked={selectedEmployees.size === filteredAndSortedEmployees.length && filteredAndSortedEmployees.length > 0}
//                           onChange={(e) => handleSelectAll(e.target.checked)}
//                           className="h-4 w-4"
//                         />
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         <button onClick={() => handleSort("emp_id")} className="flex items-center">
//                           ID
//                           {sortColumn === "emp_id" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
//                         </button>
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         <button onClick={() => handleSort("name")} className="flex items-center">
//                           Name
//                           {sortColumn === "name" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
//                         </button>
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         <button onClick={() => handleSort("department_name")} className="flex items-center">
//                           Department
//                           {sortColumn === "department_name" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
//                         </button>
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         <button onClick={() => handleSort("sub_department_name")} className="flex items-center">
//                           Sub‑Dept
//                           {sortColumn === "sub_department_name" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
//                         </button>
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         <button onClick={() => handleSort("designation")} className="flex items-center">
//                           Designation
//                           {sortColumn === "designation" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
//                         </button>
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         <button onClick={() => handleSort("date_of_joining")} className="flex items-center">
//                           Join Date
//                           {sortColumn === "date_of_joining" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
//                         </button>
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         <button onClick={() => handleSort("sex")} className="flex items-center">
//                           Gender
//                           {sortColumn === "sex" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
//                         </button>
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredAndSortedEmployees.map((e) => (
//                       <tr key={e.emp_id} className="hover:bg-gray-50 transition-colors">
//                         <td className="px-6 py-4">
//                           <input
//                             type="checkbox"
//                             checked={selectedEmployees.has(e.emp_id)}
//                             onChange={(ev) => handleSelectEmployee(e.emp_id, ev.target.checked)}
//                             className="h-4 w-4"
//                           />
//                         </td>
//                         <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.emp_id}</td>
//                         <td className="px-6 py-4 text-sm font-semibold">
//                           {[e.first_name, e.last_name].filter(Boolean).join(" ") || e.emp_id}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-600">{e.department_name || getDepartmentName(e.department)}</td>
//                         <td className="px-6 py-4 text-sm text-gray-600">{e.sub_department_name || "—"}</td>
//                         <td className="px-6 py-4 text-sm text-gray-600">{getDesignationLabel(e.designation)}</td>
//                         <td className="px-6 py-4 text-sm text-gray-600">{formatDate(e.date_of_joining)}</td>
//                         <td className="px-6 py-4 text-sm text-gray-600">{sexToLabel(e.sex)}</td>
//                         <td className="px-6 py-4 text-sm">
//                           <div className="text-gray-800">{e.email || "—"}</div>
//                           <div className="text-gray-500 text-xs">{e.phone || "—"}</div>
//                         </td>
//                         <td className="px-6 py-4 flex space-x-3">
//                           <button
//                             onClick={() => handleEdit(e)}
//                             className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
//                           >
//                             <EditIcon className="h-4 w-4" /> Edit
//                           </button>
//                           <button
//                             onClick={() => handleDelete(e.emp_id)}
//                             className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
//                           >
//                             <Trash2 className="h-4 w-4" /> Delete
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
//       <div className="container mx-auto px-4 py-8">
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">Master Table Settings</h1>
//           <p className="text-lg text-gray-600">
//             Manage employees • Edit name, designation, phone, join date • Employee ID cannot be changed after creation
//           </p>
//         </div>

//         <div className="mb-8 bg-white rounded-t-2xl shadow-sm">
//           <nav className="flex space-x-8 px-6 -mb-px">
//             {tabs.map((tab) => {
//               const Icon = tab.icon as any;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id as any)}
//                   className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all ${activeTab === tab.id
//                       ? "border-blue-500 text-blue-600 bg-blue-50"
//                       : "border-transparent text-gray-500 hover:text-gray-700"
//                     }`}
//                 >
//                   <Icon className="h-5 w-5" />
//                   <span>{tab.name}</span>
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         <div>{renderTabContent()}</div>
//       </div>
//     </div>
//   );
// };

// export default MasterTableSettings;





import React, { useEffect, useMemo, useState } from "react";
import {
  UploadCloud as Upload,
  Plus,
  Trash2,
  FileSpreadsheet,
  Users,
  Mail,
  Phone,
  Calendar,
  User,
  Building2,
  Briefcase,
  Download,
  Edit as EditIcon,
  ArrowUp,
  ArrowDown,
  Search,
  MapPin,
} from "lucide-react";

// ---------------- Types aligned with backend ----------------
interface EmployeeData {
  emp_id: string;
  first_name: string;
  last_name: string;
  department: number | null;
  department_name?: string;
  sub_department: number | null;
  sub_department_name?: string;
  station: number | null;
  station_name?: string;
  designation: string;
  date_of_joining: string;
  birth_date: string;
  sex: string;
  email: string;
  phone: string;
}

interface Department {
  department_id: number;
  department_name: string;
}

interface ApiStation {
  id: number;
  station_name: string;
}
interface ApiSubline {
  id: number;
  subline_name: string;
  stations: ApiStation[];
}
interface ApiLine {
  id: number;
  line_name: string;
  sublines: ApiSubline[];
  stations: ApiStation[];
}
interface ApiDepartment {
  id: number;
  department_name: string;
  lines: ApiLine[];
  stations: ApiStation[];
}
interface ApiStructureData {
  hq_name: string;
  factory_name: string;
  departments: ApiDepartment[];
}
interface ApiHierarchyResponseItem {
  structure_id: number;
  structure_name: string;
  hq: number;
  hq_name: string;
  factory: number;
  factory_name: string;
  structure_data: ApiStructureData;
}

// ---------------- Config ----------------
const API_BASE_URL = "http://127.0.0.1:8000";

const buildLinesByDeptFromHierarchy = (
  items: ApiHierarchyResponseItem[]
): Record<number, { line_id: number; line_name: string }[]> => {
  const map: Record<number, { line_id: number; line_name: string }[]> = {};
  items?.forEach((item) => {
    item.structure_data?.departments?.forEach((dept) => {
      if (!dept?.id) return;
      if (!map[dept.id]) map[dept.id] = [];
      const seen = new Set(map[dept.id].map((l) => l.line_id));
      dept.lines?.forEach((line) => {
        if (line?.id && line.line_name && !seen.has(line.id)) {
          map[dept.id].push({ line_id: line.id, line_name: line.line_name });
          seen.add(line.id);
        }
      });
    });
  });
  return map;
};

const buildStationsFromHierarchy = (
  items: ApiHierarchyResponseItem[]
): {
  byDept: Record<number, { station_id: number; station_name: string }[]>;
  byLine: Record<number, { station_id: number; station_name: string }[]>;
} => {
  const byDept: Record<number, { station_id: number; station_name: string }[]> = {};
  const byLine: Record<number, { station_id: number; station_name: string }[]> = {};

  items?.forEach((item) => {
    item.structure_data?.departments?.forEach((dept) => {
      if (!dept?.id) return;

      // Stations directly under department
      dept.stations?.forEach((station) => {
        if (station?.id && station.station_name) {
          if (!byDept[dept.id]) byDept[dept.id] = [];
          byDept[dept.id].push({ station_id: station.id, station_name: station.station_name });
        }
      });

      // Stations under lines
      dept.lines?.forEach((line) => {
        if (!line?.id) return;
        line.stations?.forEach((station) => {
          if (station?.id && station.station_name) {
            if (!byLine[line.id]) byLine[line.id] = [];
            byLine[line.id].push({ station_id: station.id, station_name: station.station_name });
          }
        });
      });
    });
  });

  return { byDept, byLine };
};

// ---------------- UI helpers ----------------
const designationOptions = [
  { value: "", label: "--- Select Designation ---" },
  { value: "CO- DRIVER", label: "CO- DRIVER" },
  { value: "DRIVER", label: "DRIVER" },
  { value: "HELPER", label: "HELPER" },
  { value: "MALI", label: "MALI" },
  { value: "OPERATOR", label: "OPERATOR" },
  { value: "PANTRY BOY", label: "PANTRY BOY" },
  { value: "SUPERVISOR", label: "SUPERVISOR" },
  { value: "SWEEPER", label: "SWEEPER" },
  { value: "OET", label: "OET" },
  { value: "OE", label: "OE" },
  { value: "Sr.OE", label: "Sr.OE" },
];

const genderOptions = [
  { value: "", label: "Select Gender" },
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "O", label: "Other" },
];

const sexToLabel = (v?: string | null) => (v === "M" ? "Male" : v === "F" ? "Female" : v === "O" ? "Other" : "—");

function LabeledInput({
  label,
  icon: Icon,
  type,
  value,
  onChange,
  required = false,
  placeholder,
  disabled = false,
}: {
  label: string;
  icon: React.ElementType;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        <Icon className="h-4 w-4 mr-2 text-gray-500" />
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        disabled={disabled}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
          disabled ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""
        }`}
        required={required}
      />
    </div>
  );
}

function LabeledSelect({
  label,
  icon: Icon,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        <Icon className="h-4 w-4 mr-2 text-gray-500" />
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
          disabled ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ---------------- Main Component ----------------
const MasterTableSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "add-data" | "upload" | "employee-list">("overview");

  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [linesByDept, setLinesByDept] = useState<Record<number, { line_id: number; line_name: string }[]>>({});
  const [stationsByDept, setStationsByDept] = useState<Record<number, { station_id: number; station_name: string }[]>>({});
  const [stationsByLine, setStationsByLine] = useState<Record<number, { station_id: number; station_name: string }[]>>({});
  const [loading, setLoading] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [formData, setFormData] = useState<EmployeeData>({
    emp_id: "",
    first_name: "",
    last_name: "",
    department: null,
    sub_department: null,
    station: null,
    designation: "",
    date_of_joining: "",
    birth_date: "",
    sex: "",
    email: "",
    phone: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Employee list features
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof EmployeeData | "name" | "department_name" | "sub_department_name" | "station_name">("emp_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

  const tabs = [
    { id: "overview", name: "Overview", icon: Users },
    { id: "add-data", name: "Add Employee", icon: Plus },
    { id: "upload", name: "Upload Excel", icon: Upload },
    { id: "employee-list", name: "Employee Records", icon: FileSpreadsheet },
  ] as const;

  const currentLines = useMemo(() => {
    if (!formData.department) return [];
    return linesByDept[formData.department] || [];
  }, [formData.department, linesByDept]);

  const currentStations = useMemo(() => {
    if (formData.sub_department) {
      return stationsByLine[formData.sub_department] || [];
    } else if (formData.department) {
      return stationsByDept[formData.department] || [];
    }
    return [];
  }, [formData.department, formData.sub_department, stationsByDept, stationsByLine]);

  const lineOptions = useMemo(() => {
    if (!formData.department) return [{ value: "", label: "— Select Department First —" }];
    if (currentLines.length === 0) return [{ value: "", label: "— No lines under this department —" }];
    return [{ value: "", label: "--- Select Sub-Department (Optional) ---" }, ...currentLines.map((l) => ({ value: String(l.line_id), label: l.line_name }))];
  }, [formData.department, currentLines]);

  const stationOptions = useMemo(() => {
    if (!formData.department) return [{ value: "", label: "— Select Department First —" }];
    if (currentStations.length === 0) return [{ value: "", label: "— No stations available —" }];
    return [{ value: "", label: "--- Select Station (Optional) ---" }, ...currentStations.map((s) => ({ value: String(s.station_id), label: s.station_name }))];
  }, [formData.department, currentStations]);

  // Fetch initial data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [empRes, deptRes, hierRes] = await Promise.all([
          fetch(`${API_BASE_URL}/mastertable/`),
          fetch(`${API_BASE_URL}/departments/`),
          fetch(`${API_BASE_URL}/hierarchy-simple/`),
        ]);

        if (!empRes.ok) throw new Error("Failed to fetch employees");
        if (!deptRes.ok) throw new Error("Failed to fetch departments");
        if (!hierRes.ok) throw new Error("Failed to fetch hierarchy");

        const empData = await empRes.json();
        const deptData: Department[] = await deptRes.json();
        const hierarchyData: ApiHierarchyResponseItem[] = await hierRes.json();

        setEmployees(empData || []);

        const uniqueMap = new Map<number, Department>();
        deptData.forEach((d) => {
          if (d?.department_id && d.department_name) uniqueMap.set(d.department_id, d);
        });
        const allDepartments = Array.from(uniqueMap.values()).sort((a, b) =>
          a.department_name.localeCompare(b.department_name)
        );
        setDepartments(allDepartments);

        setLinesByDept(buildLinesByDeptFromHierarchy(hierarchyData || []));
        const stations = buildStationsFromHierarchy(hierarchyData || []);
        setStationsByDept(stations.byDept);
        setStationsByLine(stations.byLine);
      } catch (e: any) {
        alert(e.message || "Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, sub_department: null, station: null }));
  }, [formData.department]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, station: null }));
  }, [formData.sub_department]);

  const handleInputChange = (field: keyof EmployeeData, value: string) => {
    if (field === "department") {
      setFormData((prev) => ({
        ...prev,
        department: value === "" ? null : parseInt(value, 10),
        sub_department: null,
        station: null,
      }));
    } else if (field === "sub_department") {
      setFormData((prev) => ({
        ...prev,
        sub_department: value === "" ? null : parseInt(value, 10),
        station: null,
      }));
    } else if (field === "station") {
      setFormData((prev) => ({
        ...prev,
        station: value === "" ? null : parseInt(value, 10),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const refreshEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/mastertable/`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data || []);
      }
    } catch {}
  };

  const resetForm = () => {
    setFormData({
      emp_id: "",
      first_name: "",
      last_name: "",
      department: null,
      sub_department: null,
      station: null,
      designation: "",
      date_of_joining: "",
      birth_date: "",
      sex: "",
      email: "",
      phone: "",
    });
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    const empId = formData.emp_id.trim();
    if (!empId) {
      alert("Employee ID is required");
      return;
    }

    const payload: any = { emp_id: empId };
    // ([
    //   "first_name",
    //   "last_name",
    //   "designation",
    //   "date_of_joining",
    //   "birth_date",
    //   "sex",
    //   "email",
    //   "phone",
    // ] as (keyof EmployeeData)[]).forEach((f) => {
    //   const v = formData[f];
    //   if (v && String(v).trim()) payload[f] = String(v).trim();
    // });
    (["first_name", "last_name", "designation", "date_of_joining", "birth_date", "sex", "email", "phone"] as (keyof EmployeeData)[]).forEach((f) => {
  const v = formData[f];
  payload[f] = v ? String(v).trim() : "";  // ✅ sends "" when cleared
});
    if (formData.department !== null) payload.department = formData.department;
    if (formData.sub_department !== null) payload.sub_department = formData.sub_department;
    if (formData.station !== null) payload.station = formData.station;

    try {
      setLoading(true);
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `${API_BASE_URL}/mastertable/${empId}/` : `${API_BASE_URL}/mastertable/`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let msg = "Failed to save:\n";
        Object.entries(err).forEach(([k, v]) => {
          msg += `${k}: ${Array.isArray(v) ? v.join("; ") : v}\n`;
        });
        throw new Error(msg.trim());
      }

      alert(isEditing ? "Employee updated successfully!" : "Employee added successfully!");
      await refreshEmployees();
      resetForm();
      setActiveTab("employee-list");
    } catch (e: any) {
      alert(e.message || "Failed to save employee.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (empId: string) => {
    const firstConfirm = window.confirm("Are you sure you want to delete this employee?");
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      `This action cannot be undone!\n\nDeleting employee ${empId} will also remove all related data from the system (ojt, Skill evaluation, operator observance etc.).\n\nDo you really want to proceed?`
    );
    if (!secondConfirm) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/mastertable/${empId}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      alert("Employee and related data deleted successfully!");
      await refreshEmployees();
      setSelectedEmployees(new Set());
    } catch (err) {
      alert("Failed to delete employee.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmployees.size === 0) return;

    const firstConfirm = window.confirm(`Are you sure you want to delete ${selectedEmployees.size} employees?`);
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      `This action cannot be undone!\n\nDeleting ${selectedEmployees.size} employees will also remove all their related data from the system (attendance, salary, leaves, etc.).\n\nDo you really want to proceed?`
    );
    if (!secondConfirm) return;

    try {
      setLoading(true);
      await Promise.all(
        Array.from(selectedEmployees).map((empId) =>
          fetch(`${API_BASE_URL}/mastertable/${empId}/`, { method: "DELETE" })
        )
      );
      alert("Selected employees and their related data deleted successfully!");
      await refreshEmployees();
      setSelectedEmployees(new Set());
    } catch {
      alert("Failed to delete some employees.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: EmployeeData) => {
    setFormData({
      ...employee,
      department: employee.department ?? null,
      sub_department: employee.sub_department ?? null,
      station: employee.station ?? null,
    });
    setIsEditing(true);
    setActiveTab("add-data");
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredAndSortedEmployees.map((e) => e.emp_id));
      setSelectedEmployees(allIds);
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const handleSelectEmployee = (empId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) newSelected.add(empId);
    else newSelected.delete(empId);
    setSelectedEmployees(newSelected);
  };

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleExcelUpload = async () => {
    if (!uploadFile) return alert("Select a file first");
    try {
      setUploadLoading(true);
      const fd = new FormData();
      fd.append("file", uploadFile);

      const res = await fetch(`${API_BASE_URL}/mastertable/upload_excel/`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (res.ok) {
        let msg = `${data.message}\nCreated: ${data.created_count}, Updated: ${data.updated_count}`;
        if (data.errors?.length) {
          msg += "\n\nErrors:\n" + data.errors.map((e: any) => `Row ${e.row} (${e.emp_id}): ${e.error}`).join("\n");
        }
        alert(msg);
        await refreshEmployees();
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (e: any) {
      alert(e.message || "Upload error");
    } finally {
      setUploadLoading(false);
      setUploadFile(null);
      const input = document.getElementById("excel-upload") as HTMLInputElement | null;
      if (input) input.value = "";
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/mastertable/download_template/`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "employee_template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download template");
    }
  };

  const formatDate = (d: string) =>
    !d ? "—" : new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const getDepartmentName = (id: number | null) =>
    id ? departments.find((d) => d.department_id === id)?.department_name || "Unknown" : "—";

  const getDesignationLabel = (value: string) =>
    designationOptions.find((opt) => opt.value === value)?.label || value || "—";

  const overviewStats = () => {
    const total = employees.length;
    const depts = new Set(employees.map((e) => e.department_name || getDepartmentName(e.department))).size;
    const male = employees.filter((e) => e.sex === "M").length;
    const female = employees.filter((e) => e.sex === "F").length;
    return [
      { title: "Total Employees", value: total, icon: Users, color: "bg-blue-500" },
      { title: "Departments", value: depts, icon: Building2, color: "bg-green-500" },
      { title: "Male", value: male, icon: User, color: "bg-purple-500" },
      { title: "Female", value: female, icon: User, color: "bg-pink-500" },
    ];
  };

  const departmentStats = () => {
    const counts = employees.reduce((acc, e) => {
      const name = e.department_name || getDepartmentName(e.department);
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([department, count]) => ({ department, count }));
  };

  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter((e) => {
      const name = `${e.first_name} ${e.last_name}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      return (
        e.emp_id.toLowerCase().includes(query) ||
        name.includes(query) ||
        e.email.toLowerCase().includes(query) ||
        e.phone.includes(query)
      );
    });

    filtered.sort((a, b) => {
      let valA: any, valB: any;

      switch (sortColumn) {
        case "emp_id":
          valA = a.emp_id;
          valB = b.emp_id;
          break;
        case "name":
          valA = `${a.first_name} ${a.last_name}`.toLowerCase();
          valB = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case "department_name":
          valA = (a.department_name || getDepartmentName(a.department) || "").toLowerCase();
          valB = (b.department_name || getDepartmentName(b.department) || "").toLowerCase();
          break;
        case "sub_department_name":
          valA = (a.sub_department_name || "").toLowerCase();
          valB = (b.sub_department_name || "").toLowerCase();
          break;
        case "station_name":
          valA = (a.station_name || "").toLowerCase();
          valB = (b.station_name || "").toLowerCase();
          break;
        case "designation":
          valA = a.designation.toLowerCase();
          valB = b.designation.toLowerCase();
          break;
        case "date_of_joining":
          valA = new Date(a.date_of_joining || "1900-01-01");
          valB = new Date(b.date_of_joining || "1900-01-01");
          break;
        case "sex":
          valA = a.sex;
          valB = b.sex;
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [employees, searchQuery, sortColumn, sortDirection, departments]);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewStats().map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">{s.title}</p>
                        <p className="text-3xl font-bold">{s.value}</p>
                      </div>
                      <div className={`${s.color} p-3 rounded-xl`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <h3 className="text-xl font-semibold mb-4">Department Distribution</h3>
                {departmentStats().map((d, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl mb-2">
                    <span className="font-medium">{d.department}</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{d.count}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <h3 className="text-xl font-semibold mb-4">Recent Additions</h3>
                {employees.slice(-3).reverse().map((e, i) => (
                  <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl mb-2">
                    <User className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium">{[e.first_name, e.last_name].filter(Boolean).join(" ") || e.emp_id}</p>
                      <p className="text-sm text-gray-600">
                        {e.sub_department_name || "—"}, {e.department_name || getDepartmentName(e.department)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "add-data":
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8 border">
            <div className="flex items-center mb-6">
              <Plus className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold">{isEditing ? "Edit Employee" : "Add New Employee"}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LabeledInput
                label="Employee ID"
                icon={User}
                type="text"
                value={formData.emp_id}
                onChange={(v) => handleInputChange("emp_id", v)}
                required
                disabled={isEditing}
                placeholder="Unique code (cannot be changed after creation)"
              />

              <LabeledInput
                label="First Name"
                icon={User}
                type="text"
                value={formData.first_name}
                onChange={(v) => handleInputChange("first_name", v)}
              />

              <LabeledInput
                label="Last Name"
                icon={User}
                type="text"
                value={formData.last_name}
                onChange={(v) => handleInputChange("last_name", v)}
              />

              <LabeledSelect
                label="Designation"
                icon={Briefcase}
                value={formData.designation}
                options={designationOptions}
                onChange={(v) => handleInputChange("designation", v)}
              />

              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                  Department
                </label>
                <select
                  value={formData.department ?? ""}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map((d) => {
                    const hasLines = (linesByDept[d.department_id]?.length || 0) > 0;
                    return (
                      <option key={d.department_id} value={d.department_id}>
                        {d.department_name}{hasLines ? "" : " (No lines)"}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                  Sub-Department (Line)
                </label>
                <select
                  value={formData.sub_department ?? ""}
                  onChange={(e) => handleInputChange("sub_department", e.target.value)}
                  disabled={lineOptions.length === 0 || (lineOptions.length === 1 && lineOptions[0].value === "")}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                    lineOptions.length === 0 || (lineOptions.length === 1 && lineOptions[0].value === "")
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {lineOptions.map((o) => (
                    <option key={String(o.value)} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  Station
                </label>
                <select
                  value={formData.station ?? ""}
                  onChange={(e) => handleInputChange("station", e.target.value)}
                  disabled={stationOptions.length === 0 || (stationOptions.length === 1 && stationOptions[0].value === "")}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                    stationOptions.length === 0 || (stationOptions.length === 1 && stationOptions[0].value === "")
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {stationOptions.map((o) => (
                    <option key={String(o.value)} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <LabeledInput
                label="Join Date"
                icon={Calendar}
                type="date"
                value={formData.date_of_joining}
                onChange={(v) => handleInputChange("date_of_joining", v)}
              />

              <LabeledInput
                label="Birth Date"
                icon={Calendar}
                type="date"
                value={formData.birth_date}
                onChange={(v) => handleInputChange("birth_date", v)}
              />

              <LabeledSelect
                label="Gender"
                icon={User}
                value={formData.sex}
                options={genderOptions}
                onChange={(v) => handleInputChange("sex", v)}
              />

              <LabeledInput
                label="Email Address"
                icon={Mail}
                type="email"
                value={formData.email}
                onChange={(v) => handleInputChange("email", v)}
              />

              <LabeledInput
                label="Phone Number"
                icon={Phone}
                type="tel"
                value={formData.phone}
                onChange={(v) => handleInputChange("phone", v)}
              />
            </div>

            <div className="flex justify-end mt-8 space-x-3">
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                {isEditing ? "Cancel Edit" : "Clear"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading ? "Saving..." : isEditing ? "Update Employee" : "Save Employee"}
              </button>
            </div>
          </div>
        );

      case "upload":
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8 border">
            <div className="flex items-center mb-6">
              <Upload className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold">Upload Excel</h2>
            </div>
            <div className="border-2 border-dashed rounded-xl p-8 text-center">
              <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Please use the downloaded template. emp_id is required.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                department_name must match DB; sub_department must be a valid Line name; station must be a valid Station name.
              </p>
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:bg-green-50 file:text-green-700"
              />
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleExcelUpload}
                disabled={!uploadFile || uploadLoading}
                className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {uploadLoading ? "Uploading..." : (<><Upload className="h-5 w-5 mr-2" /> Upload</>)}
              </button>
              <button
                onClick={handleDownloadTemplate}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 flex items-center"
              >
                <Download className="h-5 w-5 mr-2" /> Download Template
              </button>
            </div>
            {uploadFile && <div className="mt-4 p-3 bg-green-50 rounded-xl text-green-800">Selected: {uploadFile.name}</div>}
          </div>
        );

      case "employee-list":
        return (
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden flex flex-col h-[680px]">
            <div className="p-6 border-b bg-white flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-bold flex items-center">
                <FileSpreadsheet className="h-6 w-6 text-purple-600 mr-3" />
                Employee Records
                <span className="ml-3 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {filteredAndSortedEmployees.length}
                </span>
              </h2>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by ID, name, email, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>

                {selectedEmployees.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedEmployees.size})
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-xl text-gray-500">Loading...</div>
              </div>
            ) : filteredAndSortedEmployees.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <Users className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-xl font-medium mb-4">
                  {searchQuery ? "No employees match your search" : "No employees yet"}
                </p>
                <div className="space-x-3">
                  <button
                    onClick={() => setActiveTab("add-data")}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Employee
                  </button>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Upload Excel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.size === filteredAndSortedEmployees.length && filteredAndSortedEmployees.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="h-4 w-4"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <button onClick={() => handleSort("emp_id")} className="flex items-center">
                          ID
                          {sortColumn === "emp_id" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <button onClick={() => handleSort("name")} className="flex items-center">
                          Name
                          {sortColumn === "name" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <button onClick={() => handleSort("department_name")} className="flex items-center">
                          Department
                          {sortColumn === "department_name" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <button onClick={() => handleSort("sub_department_name")} className="flex items-center">
                          Sub‑Dept
                          {sortColumn === "sub_department_name" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <button onClick={() => handleSort("station_name")} className="flex items-center">
                          Station
                          {sortColumn === "station_name" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <button onClick={() => handleSort("designation")} className="flex items-center">
                          Designation
                          {sortColumn === "designation" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <button onClick={() => handleSort("date_of_joining")} className="flex items-center">
                          Join Date
                          {sortColumn === "date_of_joining" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <button onClick={() => handleSort("sex")} className="flex items-center">
                          Gender
                          {sortColumn === "sex" && (sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedEmployees.map((e) => (
                      <tr key={e.emp_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.has(e.emp_id)}
                            onChange={(ev) => handleSelectEmployee(e.emp_id, ev.target.checked)}
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.emp_id}</td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          {[e.first_name, e.last_name].filter(Boolean).join(" ") || e.emp_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{e.department_name || getDepartmentName(e.department)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{e.sub_department_name || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{e.station_name || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{getDesignationLabel(e.designation)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(e.date_of_joining)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{sexToLabel(e.sex)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-gray-800">{e.email || "—"}</div>
                          <div className="text-gray-500 text-xs">{e.phone || "—"}</div>
                        </td>
                        <td className="px-6 py-4 flex space-x-3">
                          <button
                            onClick={() => handleEdit(e)}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                          >
                            <EditIcon className="h-4 w-4" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(e.emp_id)}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Master Table Settings</h1>
          <p className="text-lg text-gray-600">
            Manage employees • Edit name, designation, phone, join date • Employee ID cannot be changed after creation
          </p>
        </div>

        <div className="mb-8 bg-white rounded-t-2xl shadow-sm">
          <nav className="flex space-x-8 px-6 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon as any;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default MasterTableSettings;