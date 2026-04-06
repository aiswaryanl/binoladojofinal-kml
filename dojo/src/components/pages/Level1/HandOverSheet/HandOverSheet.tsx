// import React, { useState, useMemo, useEffect } from "react";

// // --- Interfaces for our data structures ---

// interface ApiScoreData {
//   id: number;
//   employee_details: string; // e.g., "John Doe (EMP123)"
//   skill_name: string;
//   marks: number;
//   percentage: number;
//   created_at: string;
// }

// interface EmployeeMasterData {
//   emp_id: string;
//   first_name: string;
//   last_name: string;
//   department_name: string;
//   date_of_joining: string;
// }

// interface HandoverFormData {
//   name: string;
//   industrialExperience: string;
//   kpaplExperience: string;
//   currentDepartment: string;
//   distributedDepartment: string;
//   handoverDate: string;
//   contractorName: string;
//   pAndAName: string;
//   qaHodName: string;
//   isTrainingCompleted: "yes" | "no" | "";
//   gojoInchargeName: string;
// }

// interface HandOverFormModalProps {
//   scoreData: ApiScoreData;
//   departments: string[];
//   onClose: () => void;
//   onSubmit: (formData: HandoverFormData) => void;
//   employeeDetails: EmployeeMasterData | null;
//   isLoading: boolean;
//   error: string | null;
//   initialFormData: HandoverFormData | null;
// }

// // --- Modal Component ---
// const HandOverFormModal: React.FC<HandOverFormModalProps> = ({
//   scoreData,
//   departments,
//   onClose,
//   onSubmit,
//   employeeDetails,
//   isLoading,
//   error,
//   initialFormData,
// }) => {
//   const [formData, setFormData] = useState<HandoverFormData>(
//     initialFormData || {
//       name: "",
//       industrialExperience: "",
//       kpaplExperience: "",
//       currentDepartment: "",
//       distributedDepartment: "",
//       handoverDate: new Date().toISOString().split("T")[0],
//       contractorName: "",
//       pAndAName: "",
//       qaHodName: "",
//       isTrainingCompleted: "",
//       gojoInchargeName: "",
//     }
//   );

//   // When initialFormData changes (switching employee), reset form
//   useEffect(() => {
//     if (initialFormData) {
//       setFormData(initialFormData);
//     }
//   }, [initialFormData]);

//   useEffect(() => {
//     if (employeeDetails && !initialFormData) {
//       setFormData((prevData) => ({
//         ...prevData,
//         name: `${employeeDetails.first_name} ${employeeDetails.last_name}`,
//         requiredDepartment: employeeDetails.department_name || "N/A",
//       }));
//     }
//   }, [employeeDetails, initialFormData]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit(formData);
//   };

//   const modalStyles: { [key: string]: React.CSSProperties } = {
//     backdrop: {
//       position: "fixed",
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: "rgba(17, 24, 39, 0.6)",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       zIndex: 1000,
//     },
//     content: {
//       backgroundColor: "white",
//       padding: "30px 40px",
//       borderRadius: "20px",
//       width: "90%",
//       maxWidth: "700px",
//       minHeight: "400px",
//       maxHeight: "90vh",
//       overflowY: "auto",
//       boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
//       position: "relative",
//       display: "flex",
//       flexDirection: "column",
//     },
//     closeButton: {
//       position: "absolute",
//       top: "15px",
//       right: "20px",
//       background: "transparent",
//       border: "none",
//       fontSize: "28px",
//       cursor: "pointer",
//       color: "#9ca3af",
//     },
//     header: {
//       textAlign: "center",
//       marginBottom: "30px",
//       borderBottom: "1px solid #e5e7eb",
//       paddingBottom: "20px",
//     },
//     title: { fontSize: "22px", fontWeight: "700", color: "#1f2937" },
//     formGrid: {
//       display: "grid",
//       gridTemplateColumns: "repeat(2, 1fr)",
//       gap: "25px",
//     },
//     formField: { display: "flex", flexDirection: "column" as const },
//     label: {
//       marginBottom: "8px",
//       fontSize: "14px",
//       fontWeight: "500",
//       color: "#374151",
//     },
//     input: {
//       padding: "10px 12px",
//       fontSize: "14px",
//       border: "1px solid #d1d5db",
//       borderRadius: "8px",
//       outline: "none",
//       transition: "all 0.2s",
//       boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
//     },
//     readOnlyInput: {
//       backgroundColor: "#f3f4f6",
//       cursor: "not-allowed",
//       color: "#4b5563",
//     },
//     submitButton: {
//       gridColumn: "1 / -1",
//       marginTop: "20px",
//       padding: "12px 20px",
//       fontSize: "16px",
//       fontWeight: "600",
//       color: "#ffffff",
//       background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
//       border: "none",
//       borderRadius: "10px",
//       cursor: "pointer",
//       transition: "all 0.2s ease",
//       boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)",
//     },
//     centeredStatus: {
//       flex: 1,
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       fontSize: "18px",
//       color: "#6b7280",
//     },
//   };

//   return (
//     <div style={modalStyles.backdrop} onClick={onClose}>
//       <div
//         style={modalStyles.content}
//         onClick={(e) => e.stopPropagation()} // Prevent closing if inside form
//       >
//         <button style={modalStyles.closeButton} onClick={onClose}>
//           &times;
//         </button>
//         <div style={modalStyles.header}>
//           <h2 style={modalStyles.title}>Dojo Handover Form</h2>
//         </div>

//         {isLoading && (
//           <div style={modalStyles.centeredStatus}>
//             Loading Employee Details...
//           </div>
//         )}
//         {error && (
//           <div style={{ ...modalStyles.centeredStatus, color: "red" }}>
//             {error}
//           </div>
//         )}
//         {!isLoading && !error && employeeDetails && (
//           <form onSubmit={handleSubmit}>
//             <div style={modalStyles.formGrid}>
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   style={{
//                     ...modalStyles.input,
//                     ...modalStyles.readOnlyInput,
//                   }}
//                   readOnly
//                 />
//               </div>
//               {/* <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Current Department</label>
//                 <input
//                   type="text"
//                   name="requiredDepartment"
//                   value={formData.currentDepartment}
//                   style={{
//                     ...modalStyles.input,
//                     ...modalStyles.readOnlyInput,
//                   }}
//                   readOnly
//                 />
//               </div> */}
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>
//                   Industrial Experience / Dept
//                 </label>
//                 <input
//                   type="text"
//                   name="industrialExperience"
//                   value={formData.industrialExperience}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>
//                   KPAPL Experience / Dept
//                 </label>
//                 <input
//                   type="text"
//                   name="kpaplExperience"
//                   value={formData.kpaplExperience}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>
//                   Distributed Department (Post-Dojo)
//                 </label>
//                 <select
//                   name="distributedDepartment"
//                   value={formData.distributedDepartment}
//                   onChange={handleChange}
//                   style={modalStyles.input as React.CSSProperties}
//                   required
//                 >
//                   <option value="" disabled>
//                     Select a department
//                   </option>
//                   {departments.map((deptName) => (
//                     <option key={deptName} value={deptName}>
//                       {deptName}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Date</label>
//                 <input
//                   type="date"
//                   name="handoverDate"
//                   value={formData.handoverDate}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Contractor Name</label>
//                 <input
//                   type="text"
//                   name="contractorName"
//                   value={formData.contractorName}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>P & A Name</label>
//                 <input
//                   type="text"
//                   name="pAndAName"
//                   value={formData.pAndAName}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>QA HOD Name</label>
//                 <input
//                   type="text"
//                   name="qaHodName"
//                   value={formData.qaHodName}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Is Training Completed?</label>
//                 <select
//                   name="isTrainingCompleted"
//                   value={formData.isTrainingCompleted}
//                   onChange={handleChange}
//                   style={modalStyles.input as React.CSSProperties}
//                   required
//                 >
//                   <option value="" disabled>
//                     Select an option
//                   </option>
//                   <option value="yes">Yes</option>
//                   <option value="no">No</option>
//                 </select>
//               </div>
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Dojo Incharge Name</label>
//                 <input
//                   type="text"
//                   name="gojoInchargeName"
//                   value={formData.gojoInchargeName}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>
//             </div>
//             <button type="submit" style={modalStyles.submitButton}>
//               Submit Handover
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// // --- Main Page Component ---
// const HandOverSheet: React.FC = () => {
//   const [scores, setScores] = useState<ApiScoreData[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [departments, setDepartments] = useState<string[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [hoveredCard, setHoveredCard] = useState<number | null>(null);

//   // --- Modal State ---
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [selectedScore, setSelectedScore] = useState<ApiScoreData | null>(null);
//   const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
//   const [modalError, setModalError] = useState<string | null>(null);
//   const [selectedEmployeeDetails, setSelectedEmployeeDetails] =
//     useState<EmployeeMasterData | null>(null);
//   const [initialFormData, setInitialFormData] =
//     useState<HandoverFormData | null>(null);

//   // Fetch initial lists (scores and all departments for dropdown)
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [scoresResponse, deptsResponse] = await Promise.all([
//           fetch("http://192.168.2.51:8000/scores/passed/level-1/"),
//           fetch("http://192.168.2.51:8000/departments/"),
//         ]);

//         if (!scoresResponse.ok)
//           throw new Error(`Scores API failed: ${scoresResponse.status}`);
//         if (!deptsResponse.ok)
//           throw new Error(`Departments API failed: ${deptsResponse.status}`);

//         const scoresData: ApiScoreData[] = await scoresResponse.json();
//         const deptsData: { department_name: string }[] =
//           await deptsResponse.json();

//         setScores(scoresData);
//         setDepartments(deptsData.map((dept) => dept.department_name));
//         setError(null);
//       } catch (err) {
//         if (err instanceof Error)
//           setError(`Failed to fetch data: ${err.message}`);
//         else setError("An unknown error occurred.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Memoized calculations for filtering and sorting
//   const uniqueMonths = useMemo(() => {
//     const months = new Set<string>();
//     scores.forEach((score) => months.add(score.created_at.substring(0, 7)));
//     return Array.from(months).sort().reverse();
//   }, [scores]);

//   useEffect(() => {
//     if (uniqueMonths.length > 0 && !selectedMonth) {
//       setSelectedMonth(uniqueMonths[0]);
//     }
//   }, [uniqueMonths, selectedMonth]);

//   const filteredEmployees = useMemo(() => {
//     let employees = [...scores];
//     if (selectedMonth && selectedMonth !== "all") {
//       employees = employees.filter((emp) =>
//         emp.created_at.startsWith(selectedMonth)
//       );
//     }
//     if (searchTerm.trim() !== "") {
//       const lowercasedSearchTerm = searchTerm.toLowerCase();
//       employees = employees.filter(
//         (emp) =>
//           emp.employee_details.toLowerCase().includes(lowercasedSearchTerm) ||
//           String(emp.id).includes(searchTerm)
//       );
//     }
//     return employees.sort((a, b) => b.percentage - a.percentage);
//   }, [scores, selectedMonth, searchTerm]);

//   const handleOpenModal = async (score: ApiScoreData) => {
//     setIsModalOpen(true);
//     setSelectedScore(score);
//     setIsModalLoading(true);
//     setModalError(null);
//     setSelectedEmployeeDetails(null);

//     try {
//       const empId =
//         score.employee_details.split("(").pop()?.replace(")", "") || null;

//       if (!empId) {
//         throw new Error(
//           `Could not parse Employee ID from the string: "${score.employee_details}"`
//         );
//       }

//       // Fetch employee details
//       const response = await fetch(
//         `http://192.168.2.51:8000/mastertable/${empId}/`
//       );
//       if (!response.ok) {
//         if (response.status === 404)
//           throw new Error(
//             `Employee with ID '${empId}' not found in Master Table.`
//           );
//         throw new Error(
//           `Failed to fetch employee details (Status: ${response.status})`
//         );
//       }
//       const data: EmployeeMasterData = await response.json();
//       setSelectedEmployeeDetails(data);

//       // Fetch existing handover data if any
//       const handResp = await fetch(
//         `http://192.168.2.51:8000/handovers/employee/${empId}/`
//       );
//       if (handResp.ok) {
//         const handData = await handResp.json();
//         setInitialFormData({
//           name: `${data.first_name} ${data.last_name}`,
//           industrialExperience: handData.industrial_experience || "",
//           kpaplExperience: handData.kpapl_experience || "",
//           currentDepartment:
//             handData.required_department_at_handover ||
//             data.department_name ||
//             "",
//           distributedDepartment:
//             handData.distributed_department_after_dojo?.department_name || "",
//           handoverDate:
//             handData.handover_date ||
//             new Date().toISOString().split("T")[0],
//           contractorName: handData.contractor_name || "",
//           pAndAName: handData.p_and_a_name || "",
//           qaHodName: handData.qa_hod_name || "",
//           isTrainingCompleted: handData.is_training_completed ? "yes" : "no",
//           gojoInchargeName: handData.gojo_incharge_name || "",
//         });
//       } else {
//         // No handover exists yet (new)
//         setInitialFormData({
//           name: `${data.first_name} ${data.last_name}`,
//           industrialExperience: "",
//           kpaplExperience: "",
//           currentDepartment: data.department_name || "",
//           distributedDepartment: "",
//           handoverDate: new Date().toISOString().split("T")[0],
//           contractorName: "",
//           pAndAName: "",
//           qaHodName: "",
//           isTrainingCompleted: "",
//           gojoInchargeName: "",
//         });
//       }
//     } catch (err) {
//       if (err instanceof Error) setModalError(err.message);
//       else setModalError("An unknown error occurred.");
//     } finally {
//       setIsModalLoading(false);
//     }
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedScore(null);
//     setSelectedEmployeeDetails(null);
//     setModalError(null);
//     setInitialFormData(null);
//   };

//   const handleFormSubmit = async (formData: HandoverFormData) => {
//     if (!selectedEmployeeDetails) {
//       alert("Error: Employee details are not loaded. Cannot submit.");
//       return;
//     }

//     const payload = {
//       emp_id: selectedEmployeeDetails.emp_id,
//       industrial_experience: formData.industrialExperience,
//       kpapl_experience: formData.kpaplExperience,
//       required_department_at_handover: formData.currentDepartment,
//       distributed_department_name: formData.distributedDepartment,
//       handover_date: formData.handoverDate,
//       contractor_name: formData.contractorName,
//       p_and_a_name: formData.pAndAName,
//       qa_hod_name: formData.qaHodName,
//       is_training_completed: formData.isTrainingCompleted,
//       gojo_incharge_name: formData.gojoInchargeName,
//     };

//     try {
//       const response = await fetch("http://192.168.2.51:8000/handovers/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         const errorMessage =
//           Object.values(errorData).flat().join(" ") ||
//           `Server error: ${response.status}`;
//         throw new Error(errorMessage);
//       }
//       alert("Handover form submitted successfully!");
//       handleCloseModal();
//     } catch (error) {
//       if (error instanceof Error) alert(`Error: ${error.message}`);
//       else alert("An unknown error occurred during submission.");
//     }
//   };

//   const formatDate = (dateString: string): string =>
//     new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   const formatMonthForDisplay = (monthStr: string): string => {
//     const [year, month] = monthStr.split("-");
//     return new Date(Number(year), Number(month) - 1).toLocaleString("en-US", {
//       month: "long",
//       year: "numeric",
//     });
//   };
//   const getScoreBarWidth = (percentage: number): string => `${percentage}%`;

//   const styles: { [key: string]: React.CSSProperties } = {
//     container: {
//       minHeight: "100vh",
//       backgroundColor: "#ffffffff",
//       padding: "40px 20px",
//     },
//     header: { textAlign: "center" as const, marginBottom: "50px" },
//     title: {
//       fontSize: "32px",
//       fontWeight: "800",
//       background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
//       WebkitBackgroundClip: "text",
//       WebkitTextFillColor: "transparent",
//       backgroundClip: "text",
//       marginBottom: "10px",
//     },
//     subtitle: { fontSize: "18px", color: "#6b7280", fontWeight: "400" },
//     controlsContainer: {
//       maxWidth: "1000px",
//       margin: "0 auto 40px",
//       display: "flex",
//       gap: "20px",
//       justifyContent: "space-between",
//     },
//     searchInput: {
//       flex: 1,
//       padding: "12px 16px",
//       fontSize: "16px",
//       border: "1px solid #e5e7eb",
//       borderRadius: "12px",
//       outline: "none",
//       transition: "all 0.2s",
//       boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
//     },
//     monthSelect: {
//       padding: "12px 16px",
//       fontSize: "16px",
//       border: "1px solid #e5e7eb",
//       borderRadius: "12px",
//       backgroundColor: "white",
//       cursor: "pointer",
//       outline: "none",
//       transition: "all 0.2s",
//       boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
//     },
//     resultsContainer: { maxWidth: "1000px", margin: "0 auto" },
//     noResults: {
//       textAlign: "center",
//       padding: "50px",
//       backgroundColor: "#ffffff",
//       borderRadius: "16px",
//       color: "#6b7280",
//       fontSize: "18px",
//       boxShadow:
//         "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
//     },
//     resultCard: {
//       backgroundColor: "#ffffff",
//       borderRadius: "16px",
//       padding: "30px",
//       marginBottom: "20px",
//       boxShadow:
//         "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
//       border: "1px solid #f3f4f6",
//       display: "flex",
//       alignItems: "center",
//       gap: "25px",
//       transition: "all 0.3s ease",
//     },
//     resultCardHover: {
//       boxShadow: "0 10px 25px rgba(124, 58, 237, 0.1)",
//       borderColor: "#e0e7ff",
//       transform: "translateY(-2px)",
//     },
//     rankCircle: {
//       width: "56px",
//       height: "56px",
//       borderRadius: "50%",
//       background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
//       color: "white",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       fontSize: "20px",
//       fontWeight: "700",
//       flexShrink: 0,
//       boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
//     },
//     mainInfo: { flex: 1 },
//     name: {
//       fontSize: "20px",
//       fontWeight: "700",
//       color: "#1f2937",
//       marginBottom: "8px",
//     },
//     details: {
//       display: "flex",
//       gap: "15px",
//       color: "#6b7280",
//       fontSize: "14px",
//       marginBottom: "15px",
//       flexWrap: "wrap" as const,
//     },
//     scoreSection: { marginTop: "15px" },
//     scoreBar: {
//       width: "100%",
//       height: "10px",
//       backgroundColor: "#f3f4f6",
//       borderRadius: "10px",
//       overflow: "hidden",
//       marginBottom: "8px",
//     },
//     scoreProgress: {
//       height: "100%",
//       background: "linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)",
//       borderRadius: "10px",
//       transition: "width 1s ease",
//       boxShadow: "0 2px 4px rgba(124, 58, 237, 0.2)",
//     },
//     scoreText: {
//       display: "flex",
//       justifyContent: "space-between",
//       fontSize: "13px",
//       color: "#6b7280",
//     },
//     badge: {
//       display: "inline-block",
//       padding: "4px 12px",
//       borderRadius: "20px",
//       fontSize: "12px",
//       fontWeight: "600",
//       backgroundColor: "#f3f4f6",
//       color: "#4b5563",
//       border: "1px solid #e5e7eb",
//     },
//     statusPill: {
//       display: "inline-flex",
//       alignItems: "center",
//       gap: "6px",
//       padding: "4px 12px",
//       borderRadius: "20px",
//       fontSize: "12px",
//       fontWeight: "600",
//       backgroundColor: "#dcfce7",
//       color: "#166534",
//       border: "1px solid #bbf7d0",
//     },
//     detailsButton: {
//       padding: "10px 20px",
//       fontSize: "14px",
//       fontWeight: "600",
//       color: "#ffffff",
//       background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
//       border: "none",
//       borderRadius: "10px",
//       cursor: "pointer",
//       transition: "all 0.2s ease",
//       boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)",
//     },
//   };

//   if (loading)
//     return (
//       <div
//         style={{ ...styles.container, textAlign: "center", fontSize: "20px" }}
//       >
//         Loading...
//       </div>
//     );
//   if (error)
//     return (
//       <div
//         style={{
//           ...styles.container,
//           textAlign: "center",
//           fontSize: "20px",
//           color: "red",
//         }}
//       >
//         Error: {error}
//       </div>
//     );

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <h1 style={styles.title}>Level 1 Passed Users</h1>
//         <p style={styles.subtitle}>Employee Assessment Outcomes</p>
//       </div>

//       <div style={styles.controlsContainer}>
//         <input
//           type="text"
//           placeholder="Search by Employee ID or Name..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           style={styles.searchInput}
//         />
//         <select
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           style={styles.monthSelect}
//         >
//           <option value="all">All Months</option>
//           {uniqueMonths.map((month) => (
//             <option key={month} value={month}>
//               {formatMonthForDisplay(month)}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div style={styles.resultsContainer}>
//         {filteredEmployees.length > 0 ? (
//           filteredEmployees.map((score, index) => (
//             <div
//               key={score.id}
//               style={{
//                 ...styles.resultCard,
//                 ...(hoveredCard === score.id ? styles.resultCardHover : {}),
//               }}
//               onMouseEnter={() => setHoveredCard(score.id)}
//               onMouseLeave={() => setHoveredCard(null)}
//             >
//               <div style={styles.rankCircle}>{index + 1}</div>
//               <div style={styles.mainInfo}>
//                 <h3 style={styles.name}>{score.employee_details}</h3>
//                 <div style={styles.details}>
//                   <span>{score.skill_name}</span>
//                   <span>•</span>
//                   <span style={styles.badge}>{score.skill_name}</span>
//                   <span>•</span>
//                   <span>{formatDate(score.created_at)}</span>
//                   <span>•</span>
//                   <span style={styles.statusPill}>
//                     <span>✓</span>
//                     <span>Passed</span>
//                   </span>
//                 </div>
//                 <div style={styles.scoreSection}>
//                   <div style={styles.scoreBar}>
//                     <div
//                       style={{
//                         ...styles.scoreProgress,
//                         width: getScoreBarWidth(score.percentage),
//                       }}
//                     />
//                   </div>
//                   <div style={styles.scoreText}>
//                     <span style={{ fontWeight: "600", color: "#4b5563" }}>
//                       Score: {score.percentage.toFixed(1)}%
//                     </span>
//                     <span>Minimum Required: 80%</span>
//                   </div>
//                 </div>
//               </div>
//               <button
//                 style={styles.detailsButton}
//                 onClick={() => handleOpenModal(score)}
//               >
//                 Create Handover
//               </button>
//             </div>
//           ))
//         ) : (
//           <div style={styles.noResults}>
//             <p>No employees found matching your criteria.</p>
//           </div>
//         )}
//       </div>

//       {isModalOpen && selectedScore && (
//         <HandOverFormModal
//           scoreData={selectedScore}
//           departments={departments}
//           onClose={handleCloseModal}
//           onSubmit={handleFormSubmit}
//           isLoading={isModalLoading}
//           error={modalError}
//           employeeDetails={selectedEmployeeDetails}
//           initialFormData={initialFormData}
//         />
//       )}
//     </div>
//   );
// };

// export default HandOverSheet;


// import React, { useState, useMemo, useEffect } from "react";

// // --- Interfaces for our data structures ---

// interface ApiScoreData {
//   id: number;
//   employee_details: string;
//   skill_name: string;
//   marks: number;
//   percentage: number;
//   created_at: string;
// }

// interface EmployeeMasterData {
//   emp_id: string;
//   first_name: string;
//   last_name: string;
//   department_name: string;
//   date_of_joining: string;
// }

// interface LineOption {
//   id: number;
//   name: string;
// }

// interface StationOption {
//   id: number;
//   name: string;
// }

// interface HandoverFormData {
//   name: string;
//   industrialExperience: string;
//   kpaplExperience: string;
//   currentDepartment: string;
//   distributedDepartment: string;
//   distributedLine: string;
//   distributedStation: string;
//   handoverDate: string;
//   contractorName: string;
//   pAndAName: string;
//   qaHodName: string;
//   isTrainingCompleted: "yes" | "no" | "";
//   gojoInchargeName: string;
// }

// interface HandOverFormModalProps {
//   scoreData: ApiScoreData;
//   departments: string[];
//   onClose: () => void;
//   onSubmit: (formData: HandoverFormData) => void;
//   employeeDetails: EmployeeMasterData | null;
//   isLoading: boolean;
//   error: string | null;
//   initialFormData: HandoverFormData | null;
// }

// // --- Modal Component ---
// const HandOverFormModal: React.FC<HandOverFormModalProps> = ({
//   scoreData,
//   departments,
//   onClose,
//   onSubmit,
//   employeeDetails,
//   isLoading,
//   error,
//   initialFormData,
// }) => {
//   const [formData, setFormData] = useState<HandoverFormData>(
//     initialFormData || {
//       name: "",
//       industrialExperience: "",
//       kpaplExperience: "",
//       currentDepartment: "",
//       distributedDepartment: "",
//       distributedLine: "",
//       distributedStation: "",
//       handoverDate: new Date().toISOString().split("T")[0],
//       contractorName: "",
//       pAndAName: "",
//       qaHodName: "",
//       isTrainingCompleted: "",
//       gojoInchargeName: "",
//     }
//   );

//   const [linesByDept, setLinesByDept] = useState<Record<string, LineOption[]>>({});
//   const [stationsByKey, setStationsByKey] = useState<Record<string, StationOption[]>>({});
//   const [filteredLines, setFilteredLines] = useState<LineOption[]>([]);
//   const [filteredStations, setFilteredStations] = useState<StationOption[]>([]);

//   // Fetch hierarchy data for lines and stations
//   useEffect(() => {
//     const fetchHierarchy = async () => {
//       try {
//         const response = await fetch("http://192.168.2.51:8000/hierarchy-simple/");
//         if (!response.ok) throw new Error("Failed to fetch hierarchy");
        
//         const hierarchyData = await response.json();
        
//         // Build linesByDept and stationsByKey
//         const linesMap: Record<string, LineOption[]> = {};
//         const stationsMap: Record<string, StationOption[]> = {};

//         hierarchyData.forEach((item: any) => {
//           item.structure_data?.departments?.forEach((dept: any) => {
//             const deptName = dept.department_name;
            
//             // Store lines by department
//             if (!linesMap[deptName]) linesMap[deptName] = [];
//             dept.lines?.forEach((line: any) => {
//               if (line?.id && line.line_name) {
//                 linesMap[deptName].push({ id: line.id, name: line.line_name });
                
//                 // Store stations by line
//                 const lineKey = `${deptName} > ${line.line_name}`;
//                 if (!stationsMap[lineKey]) stationsMap[lineKey] = [];
//                 line.stations?.forEach((station: any) => {
//                   if (station?.id && station.station_name) {
//                     stationsMap[lineKey].push({ id: station.id, name: station.station_name });
//                   }
//                 });
//               }
//             });

//             // Store stations directly under department
//             if (!stationsMap[deptName]) stationsMap[deptName] = [];
//             dept.stations?.forEach((station: any) => {
//               if (station?.id && station.station_name) {
//                 stationsMap[deptName].push({ id: station.id, name: station.station_name });
//               }
//             });
//           });
//         });

//         setLinesByDept(linesMap);
//         setStationsByKey(stationsMap);
//       } catch (err) {
//         console.error("Failed to fetch hierarchy:", err);
//       }
//     };

//     fetchHierarchy();
//   }, []);

//   // When initialFormData changes, reset form
//   useEffect(() => {
//     if (initialFormData) {
//       setFormData(initialFormData);
//     }
//   }, [initialFormData]);

//   useEffect(() => {
//     if (employeeDetails && !initialFormData) {
//       setFormData((prevData) => ({
//         ...prevData,
//         name: `${employeeDetails.first_name} ${employeeDetails.last_name}`,
//         currentDepartment: employeeDetails.department_name || "N/A",
//       }));
//     }
//   }, [employeeDetails, initialFormData]);

//   // Filter lines when department changes
//   useEffect(() => {
//     if (formData.distributedDepartment && linesByDept[formData.distributedDepartment]) {
//       setFilteredLines(linesByDept[formData.distributedDepartment]);
//     } else {
//       setFilteredLines([]);
//     }
//     // Reset line and station when department changes
//     setFormData(prev => ({ ...prev, distributedLine: "", distributedStation: "" }));
//   }, [formData.distributedDepartment, linesByDept]);

//   // Filter stations when line changes
//   useEffect(() => {
//     if (formData.distributedLine && formData.distributedDepartment) {
//       const lineKey = `${formData.distributedDepartment} > ${formData.distributedLine}`;
//       setFilteredStations(stationsByKey[lineKey] || []);
//     } else if (formData.distributedDepartment) {
//       setFilteredStations(stationsByKey[formData.distributedDepartment] || []);
//     } else {
//       setFilteredStations([]);
//     }
//     // Reset station when line changes
//     setFormData(prev => ({ ...prev, distributedStation: "" }));
//   }, [formData.distributedLine, formData.distributedDepartment, stationsByKey]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit(formData);
//   };

//   const modalStyles: { [key: string]: React.CSSProperties } = {
//     backdrop: {
//       position: "fixed",
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: "rgba(17, 24, 39, 0.6)",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       zIndex: 1000,
//     },
//     content: {
//       backgroundColor: "white",
//       padding: "30px 40px",
//       borderRadius: "20px",
//       width: "90%",
//       maxWidth: "800px",
//       minHeight: "400px",
//       maxHeight: "90vh",
//       overflowY: "auto",
//       boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
//       position: "relative",
//       display: "flex",
//       flexDirection: "column",
//     },
//     closeButton: {
//       position: "absolute",
//       top: "15px",
//       right: "20px",
//       background: "transparent",
//       border: "none",
//       fontSize: "28px",
//       cursor: "pointer",
//       color: "#9ca3af",
//     },
//     header: {
//       textAlign: "center",
//       marginBottom: "30px",
//       borderBottom: "1px solid #e5e7eb",
//       paddingBottom: "20px",
//     },
//     title: { fontSize: "22px", fontWeight: "700", color: "#1f2937" },
//     formGrid: {
//       display: "grid",
//       gridTemplateColumns: "repeat(2, 1fr)",
//       gap: "25px",
//     },
//     formField: { display: "flex", flexDirection: "column" as const },
//     label: {
//       marginBottom: "8px",
//       fontSize: "14px",
//       fontWeight: "500",
//       color: "#374151",
//     },
//     input: {
//       padding: "10px 12px",
//       fontSize: "14px",
//       border: "1px solid #d1d5db",
//       borderRadius: "8px",
//       outline: "none",
//       transition: "all 0.2s",
//       boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
//     },
//     readOnlyInput: {
//       backgroundColor: "#f3f4f6",
//       cursor: "not-allowed",
//       color: "#4b5563",
//     },
//     submitButton: {
//       gridColumn: "1 / -1",
//       marginTop: "20px",
//       padding: "12px 20px",
//       fontSize: "16px",
//       fontWeight: "600",
//       color: "#ffffff",
//       background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
//       border: "none",
//       borderRadius: "10px",
//       cursor: "pointer",
//       transition: "all 0.2s ease",
//       boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)",
//     },
//     centeredStatus: {
//       flex: 1,
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       fontSize: "18px",
//       color: "#6b7280",
//     },
//   };

//   return (
//     <div style={modalStyles.backdrop} onClick={onClose}>
//       <div
//         style={modalStyles.content}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button style={modalStyles.closeButton} onClick={onClose}>
//           &times;
//         </button>
//         <div style={modalStyles.header}>
//           <h2 style={modalStyles.title}>Dojo Handover Form</h2>
//         </div>

//         {isLoading && (
//           <div style={modalStyles.centeredStatus}>
//             Loading Employee Details...
//           </div>
//         )}
//         {error && (
//           <div style={{ ...modalStyles.centeredStatus, color: "red" }}>
//             {error}
//           </div>
//         )}
//         {!isLoading && !error && employeeDetails && (
//           <form onSubmit={handleSubmit}>
//             <div style={modalStyles.formGrid}>
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   style={{
//                     ...modalStyles.input,
//                     ...modalStyles.readOnlyInput,
//                   }}
//                   readOnly
//                 />
//               </div>

//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>
//                   Industrial Experience / Dept
//                 </label>
//                 <input
//                   type="text"
//                   name="industrialExperience"
//                   value={formData.industrialExperience}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>

//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>
//                   KPAPL Experience / Dept
//                 </label>
//                 <input
//                   type="text"
//                   name="kpaplExperience"
//                   value={formData.kpaplExperience}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>

//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>
//                   Distributed Department (Post-Dojo) *
//                 </label>
//                 <select
//                   name="distributedDepartment"
//                   value={formData.distributedDepartment}
//                   onChange={handleChange}
//                   style={modalStyles.input as React.CSSProperties}
//                   required
//                 >
//                   <option value="" disabled>
//                     Select a department
//                   </option>
//                   {departments.map((deptName) => (
//                     <option key={deptName} value={deptName}>
//                       {deptName}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>
//                   Distributed Line (Optional)
//                 </label>
//                 <select
//                   name="distributedLine"
//                   value={formData.distributedLine}
//                   onChange={handleChange}
//                   style={modalStyles.input as React.CSSProperties}
//                   disabled={!formData.distributedDepartment || filteredLines.length === 0}
//                 >
//                   <option value="">-- Select Line (Optional) --</option>
//                   {filteredLines.map((line) => (
//                     <option key={line.id} value={line.name}>
//                       {line.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>
//                   Distributed Station (Optional)
//                 </label>
//                 <select
//                   name="distributedStation"
//                   value={formData.distributedStation}
//                   onChange={handleChange}
//                   style={modalStyles.input as React.CSSProperties}
//                   disabled={!formData.distributedDepartment || filteredStations.length === 0}
//                 >
//                   <option value="">-- Select Station (Optional) --</option>
//                   {filteredStations.map((station) => (
//                     <option key={station.id} value={station.name}>
//                       {station.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Date</label>
//                 <input
//                   type="date"
//                   name="handoverDate"
//                   value={formData.handoverDate}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>

//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Contractor Name</label>
//                 <input
//                   type="text"
//                   name="contractorName"
//                   value={formData.contractorName}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>

//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>P & A Name</label>
//                 <input
//                   type="text"
//                   name="pAndAName"
//                   value={formData.pAndAName}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>

//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>QA HOD Name</label>
//                 <input
//                   type="text"
//                   name="qaHodName"
//                   value={formData.qaHodName}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>

//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Is Training Completed?</label>
//                 <select
//                   name="isTrainingCompleted"
//                   value={formData.isTrainingCompleted}
//                   onChange={handleChange}
//                   style={modalStyles.input as React.CSSProperties}
//                   required
//                 >
//                   <option value="" disabled>
//                     Select an option
//                   </option>
//                   <option value="yes">Yes</option>
//                   <option value="no">No</option>
//                 </select>
//               </div>

//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Dojo Incharge Name</label>
//                 <input
//                   type="text"
//                   name="gojoInchargeName"
//                   value={formData.gojoInchargeName}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>
//             </div>
//             <button type="submit" style={modalStyles.submitButton}>
//               Submit Handover
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// // --- Main Page Component ---
// const HandOverSheet: React.FC = () => {
//   const [scores, setScores] = useState<ApiScoreData[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [departments, setDepartments] = useState<string[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [hoveredCard, setHoveredCard] = useState<number | null>(null);

//   // --- Modal State ---
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [selectedScore, setSelectedScore] = useState<ApiScoreData | null>(null);
//   const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
//   const [modalError, setModalError] = useState<string | null>(null);
//   const [selectedEmployeeDetails, setSelectedEmployeeDetails] =
//     useState<EmployeeMasterData | null>(null);
//   const [initialFormData, setInitialFormData] =
//     useState<HandoverFormData | null>(null);

//   // Fetch initial lists (scores and all departments for dropdown)
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [scoresResponse, deptsResponse] = await Promise.all([
//           fetch("http://192.168.2.51:8000/scores/passed/level-1/"),
//           fetch("http://192.168.2.51:8000/departments/"),
//         ]);

//         if (!scoresResponse.ok)
//           throw new Error(`Scores API failed: ${scoresResponse.status}`);
//         if (!deptsResponse.ok)
//           throw new Error(`Departments API failed: ${deptsResponse.status}`);

//         const scoresData: ApiScoreData[] = await scoresResponse.json();
//         const deptsData: { department_name: string }[] =
//           await deptsResponse.json();

//         setScores(scoresData);
//         setDepartments(deptsData.map((dept) => dept.department_name));
//         setError(null);
//       } catch (err) {
//         if (err instanceof Error)
//           setError(`Failed to fetch data: ${err.message}`);
//         else setError("An unknown error occurred.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Memoized calculations for filtering and sorting
//   const uniqueMonths = useMemo(() => {
//     const months = new Set<string>();
//     scores.forEach((score) => months.add(score.created_at.substring(0, 7)));
//     return Array.from(months).sort().reverse();
//   }, [scores]);

//   useEffect(() => {
//     if (uniqueMonths.length > 0 && !selectedMonth) {
//       setSelectedMonth(uniqueMonths[0]);
//     }
//   }, [uniqueMonths, selectedMonth]);

//   const filteredEmployees = useMemo(() => {
//     let employees = [...scores];
//     if (selectedMonth && selectedMonth !== "all") {
//       employees = employees.filter((emp) =>
//         emp.created_at.startsWith(selectedMonth)
//       );
//     }
//     if (searchTerm.trim() !== "") {
//       const lowercasedSearchTerm = searchTerm.toLowerCase();
//       employees = employees.filter(
//         (emp) =>
//           emp.employee_details.toLowerCase().includes(lowercasedSearchTerm) ||
//           String(emp.id).includes(searchTerm)
//       );
//     }
//     return employees.sort((a, b) => b.percentage - a.percentage);
//   }, [scores, selectedMonth, searchTerm]);

//   const handleOpenModal = async (score: ApiScoreData) => {
//     setIsModalOpen(true);
//     setSelectedScore(score);
//     setIsModalLoading(true);
//     setModalError(null);
//     setSelectedEmployeeDetails(null);

//     try {
//       const empId =
//         score.employee_details.split("(").pop()?.replace(")", "") || null;

//       if (!empId) {
//         throw new Error(
//           `Could not parse Employee ID from the string: "${score.employee_details}"`
//         );
//       }

//       // Fetch employee details
//       const response = await fetch(
//         `http://192.168.2.51:8000/mastertable/${empId}/`
//       );
//       if (!response.ok) {
//         if (response.status === 404)
//           throw new Error(
//             `Employee with ID '${empId}' not found in Master Table.`
//           );
//         throw new Error(
//           `Failed to fetch employee details (Status: ${response.status})`
//         );
//       }
//       const data: EmployeeMasterData = await response.json();
//       setSelectedEmployeeDetails(data);

//       // Fetch existing handover data if any
//       const handResp = await fetch(
//         `http://192.168.2.51:8000/handovers/employee/${empId}/`
//       );
//       if (handResp.ok) {
//         const handData = await handResp.json();
//         setInitialFormData({
//           name: `${data.first_name} ${data.last_name}`,
//           industrialExperience: handData.industrial_experience || "",
//           kpaplExperience: handData.kpapl_experience || "",
//           currentDepartment:
//             handData.required_department_at_handover ||
//             data.department_name ||
//             "",
//           distributedDepartment:
//             handData.distributed_department_after_dojo?.department_name || "",
//           distributedLine:
//             handData.distributed_line_after_dojo?.line_name || "",
//           distributedStation:
//             handData.distributed_station_after_dojo?.station_name || "",
//           handoverDate:
//             handData.handover_date ||
//             new Date().toISOString().split("T")[0],
//           contractorName: handData.contractor_name || "",
//           pAndAName: handData.p_and_a_name || "",
//           qaHodName: handData.qa_hod_name || "",
//           isTrainingCompleted: handData.is_training_completed ? "yes" : "no",
//           gojoInchargeName: handData.gojo_incharge_name || "",
//         });
//       } else {
//         // No handover exists yet (new)
//         setInitialFormData({
//           name: `${data.first_name} ${data.last_name}`,
//           industrialExperience: "",
//           kpaplExperience: "",
//           currentDepartment: data.department_name || "",
//           distributedDepartment: "",
//           distributedLine: "",
//           distributedStation: "",
//           handoverDate: new Date().toISOString().split("T")[0],
//           contractorName: "",
//           pAndAName: "",
//           qaHodName: "",
//           isTrainingCompleted: "",
//           gojoInchargeName: "",
//         });
//       }
//     } catch (err) {
//       if (err instanceof Error) setModalError(err.message);
//       else setModalError("An unknown error occurred.");
//     } finally {
//       setIsModalLoading(false);
//     }
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedScore(null);
//     setSelectedEmployeeDetails(null);
//     setModalError(null);
//     setInitialFormData(null);
//   };

//   const handleFormSubmit = async (formData: HandoverFormData) => {
//     if (!selectedEmployeeDetails) {
//       alert("Error: Employee details are not loaded. Cannot submit.");
//       return;
//     }

//     const payload = {
//       emp_id: selectedEmployeeDetails.emp_id,
//       industrial_experience: formData.industrialExperience,
//       kpapl_experience: formData.kpaplExperience,
//       required_department_at_handover: formData.currentDepartment,
//       distributed_department_name: formData.distributedDepartment,
//       distributed_line_name: formData.distributedLine || "",
//       distributed_station_name: formData.distributedStation || "",
//       handover_date: formData.handoverDate,
//       contractor_name: formData.contractorName,
//       p_and_a_name: formData.pAndAName,
//       qa_hod_name: formData.qaHodName,
//       is_training_completed: formData.isTrainingCompleted,
//       gojo_incharge_name: formData.gojoInchargeName,
//     };

//     try {
//       const response = await fetch("http://192.168.2.51:8000/handovers/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         const errorMessage =
//           Object.values(errorData).flat().join(" ") ||
//           `Server error: ${response.status}`;
//         throw new Error(errorMessage);
//       }
//       alert("Handover form submitted successfully!");
//       handleCloseModal();
//     } catch (error) {
//       if (error instanceof Error) alert(`Error: ${error.message}`);
//       else alert("An unknown error occurred during submission.");
//     }
//   };

//   const formatDate = (dateString: string): string =>
//     new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   const formatMonthForDisplay = (monthStr: string): string => {
//     const [year, month] = monthStr.split("-");
//     return new Date(Number(year), Number(month) - 1).toLocaleString("en-US", {
//       month: "long",
//       year: "numeric",
//     });
//   };
//   const getScoreBarWidth = (percentage: number): string => `${percentage}%`;

//   const styles: { [key: string]: React.CSSProperties } = {
//     container: {
//       minHeight: "100vh",
//       backgroundColor: "#ffffffff",
//       padding: "40px 20px",
//     },
//     header: { textAlign: "center" as const, marginBottom: "50px" },
//     title: {
//       fontSize: "32px",
//       fontWeight: "800",
//       background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
//       WebkitBackgroundClip: "text",
//       WebkitTextFillColor: "transparent",
//       backgroundClip: "text",
//       marginBottom: "10px",
//     },
//     subtitle: { fontSize: "18px", color: "#6b7280", fontWeight: "400" },
//     controlsContainer: {
//       maxWidth: "1000px",
//       margin: "0 auto 40px",
//       display: "flex",
//       gap: "20px",
//       justifyContent: "space-between",
//     },
//     searchInput: {
//       flex: 1,
//       padding: "12px 16px",
//       fontSize: "16px",
//       border: "1px solid #e5e7eb",
//       borderRadius: "12px",
//       outline: "none",
//       transition: "all 0.2s",
//       boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
//     },
//     monthSelect: {
//       padding: "12px 16px",
//       fontSize: "16px",
//       border: "1px solid #e5e7eb",
//       borderRadius: "12px",
//       backgroundColor: "white",
//       cursor: "pointer",
//       outline: "none",
//       transition: "all 0.2s",
//       boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
//     },
//     resultsContainer: { maxWidth: "1000px", margin: "0 auto" },
//     noResults: {
//       textAlign: "center",
//       padding: "50px",
//       backgroundColor: "#ffffff",
//       borderRadius: "16px",
//       color: "#6b7280",
//       fontSize: "18px",
//       boxShadow:
//         "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
//     },
//     resultCard: {
//       backgroundColor: "#ffffff",
//       borderRadius: "16px",
//       padding: "30px",
//       marginBottom: "20px",
//       boxShadow:
//         "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
//       border: "1px solid #f3f4f6",
//       display: "flex",
//       alignItems: "center",
//       gap: "25px",
//       transition: "all 0.3s ease",
//     },
//     resultCardHover: {
//       boxShadow: "0 10px 25px rgba(124, 58, 237, 0.1)",
//       borderColor: "#e0e7ff",
//       transform: "translateY(-2px)",
//     },
//     rankCircle: {
//       width: "56px",
//       height: "56px",
//       borderRadius: "50%",
//       background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
//       color: "white",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       fontSize: "20px",
//       fontWeight: "700",
//       flexShrink: 0,
//       boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
//     },
//     mainInfo: { flex: 1 },
//     name: {
//       fontSize: "20px",
//       fontWeight: "700",
//       color: "#1f2937",
//       marginBottom: "8px",
//     },
//     details: {
//       display: "flex",
//       gap: "15px",
//       color: "#6b7280",
//       fontSize: "14px",
//       marginBottom: "15px",
//       flexWrap: "wrap" as const,
//     },
//     scoreSection: { marginTop: "15px" },
//     scoreBar: {
//       width: "100%",
//       height: "10px",
//       backgroundColor: "#f3f4f6",
//       borderRadius: "10px",
//       overflow: "hidden",
//       marginBottom: "8px",
//     },
//     scoreProgress: {
//       height: "100%",
//       background: "linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)",
//       borderRadius: "10px",
//       transition: "width 1s ease",
//       boxShadow: "0 2px 4px rgba(124, 58, 237, 0.2)",
//     },
//     scoreText: {
//       display: "flex",
//       justifyContent: "space-between",
//       fontSize: "13px",
//       color: "#6b7280",
//     },
//     badge: {
//       display: "inline-block",
//       padding: "4px 12px",
//       borderRadius: "20px",
//       fontSize: "12px",
//       fontWeight: "600",
//       backgroundColor: "#f3f4f6",
//       color: "#4b5563",
//       border: "1px solid #e5e7eb",
//     },
//     statusPill: {
//       display: "inline-flex",
//       alignItems: "center",
//       gap: "6px",
//       padding: "4px 12px",
//       borderRadius: "20px",
//       fontSize: "12px",
//       fontWeight: "600",
//       backgroundColor: "#dcfce7",
//       color: "#166534",
//       border: "1px solid #bbf7d0",
//     },
//     detailsButton: {
//       padding: "10px 20px",
//       fontSize: "14px",
//       fontWeight: "600",
//       color: "#ffffff",
//       background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
//       border: "none",
//       borderRadius: "10px",
//       cursor: "pointer",
//       transition: "all 0.2s ease",
//       boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)",
//     },
//   };

//   if (loading)
//     return (
//       <div
//         style={{ ...styles.container, textAlign: "center", fontSize: "20px" }}
//       >
//         Loading...
//       </div>
//     );
//   if (error)
//     return (
//       <div
//         style={{
//           ...styles.container,
//           textAlign: "center",
//           fontSize: "20px",
//           color: "red",
//         }}
//       >
//         Error: {error}
//       </div>
//     );

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <h1 style={styles.title}>Level 1 Passed Users</h1>
//         <p style={styles.subtitle}>Employee Assessment Outcomes</p>
//       </div>

//       <div style={styles.controlsContainer}>
//         <input
//           type="text"
//           placeholder="Search by Employee ID or Name..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           style={styles.searchInput}
//         />
//         <select
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           style={styles.monthSelect}
//         >
//           <option value="all">All Months</option>
//           {uniqueMonths.map((month) => (
//             <option key={month} value={month}>
//               {formatMonthForDisplay(month)}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div style={styles.resultsContainer}>
//         {filteredEmployees.length > 0 ? (
//           filteredEmployees.map((score, index) => (
//             <div
//               key={score.id}
//               style={{
//                 ...styles.resultCard,
//                 ...(hoveredCard === score.id ? styles.resultCardHover : {}),
//               }}
//               onMouseEnter={() => setHoveredCard(score.id)}
//               onMouseLeave={() => setHoveredCard(null)}
//             >
//               <div style={styles.rankCircle}>{index + 1}</div>
//               <div style={styles.mainInfo}>
//                 <h3 style={styles.name}>{score.employee_details}</h3>
//                 <div style={styles.details}>
//                   <span>{score.skill_name}</span>
//                   <span>•</span>
//                   <span style={styles.badge}>{score.skill_name}</span>
//                   <span>•</span>
//                   <span>{formatDate(score.created_at)}</span>
//                   <span>•</span>
//                   <span style={styles.statusPill}>
//                     <span>✓</span>
//                     <span>Passed</span>
//                   </span>
//                 </div>
//                 <div style={styles.scoreSection}>
//                   <div style={styles.scoreBar}>
//                     <div
//                       style={{
//                         ...styles.scoreProgress,
//                         width: getScoreBarWidth(score.percentage),
//                       }}
//                     />
//                   </div>
//                   <div style={styles.scoreText}>
//                     <span style={{ fontWeight: "600", color: "#4b5563" }}>
//                       Score: {score.percentage.toFixed(1)}%
//                     </span>
//                     <span>Minimum Required: 80%</span>
//                   </div>
//                 </div>
//               </div>
//               <button
//                 style={styles.detailsButton}
//                 onClick={() => handleOpenModal(score)}
//               >
//                 Create Handover
//               </button>
//             </div>
//           ))
//         ) : (
//           <div style={styles.noResults}>
//             <p>No employees found matching your criteria.</p>
//           </div>
//         )}
//       </div>

//       {isModalOpen && selectedScore && (
//         <HandOverFormModal
//           scoreData={selectedScore}
//           departments={departments}
//           onClose={handleCloseModal}
//           onSubmit={handleFormSubmit}
//           isLoading={isModalLoading}
//           error={modalError}
//           employeeDetails={selectedEmployeeDetails}
//           initialFormData={initialFormData}
//         />
//       )}
//     </div>
//   );
// };

// export default HandOverSheet;



// import React, { useState, useMemo, useEffect } from "react";

// // --- Interfaces ---
// interface ApiScoreData {
//   id: number;
//   employee_details: string;
//   skill_name: string;
//   marks: number;
//   percentage: number;
//   created_at: string;
// }

// interface EmployeeMasterData {
//   emp_id: string;
//   first_name: string;
//   last_name: string;
//   department_name: string;
//   date_of_joining: string;
// }

// interface LineOption {
//   id: number;
//   name: string;
// }

// interface StationOption {
//   id: number;
//   name: string;
// }

// interface HandoverFormData {
//   name: string;
//   industrialExperience: string;
//   kpaplExperience: string;
//   currentDepartment: string;
//   distributedDepartment: string;
//   distributedLine: string;
//   distributedStation: string;
//   handoverDate: string;
//   contractorName: string;
//   pAndAName: string;
//   qaHodName: string;
//   isTrainingCompleted: "yes" | "no" | "";
//   gojoInchargeName: string;
// }

// interface HandOverFormModalProps {
//   scoreData: ApiScoreData;
//   departments: string[];
//   onClose: () => void;
//   onSubmit: (formData: HandoverFormData) => void;
//   employeeDetails: EmployeeMasterData | null;
//   isLoading: boolean;
//   error: string | null;
//   initialFormData: HandoverFormData | null;
//   isEditMode: boolean;
// }

// // --- Modal Component ---
// const HandOverFormModal: React.FC<HandOverFormModalProps> = ({
//   scoreData,
//   departments,
//   onClose,
//   onSubmit,
//   employeeDetails,
//   isLoading,
//   error,
//   initialFormData,
//   isEditMode,
// }) => {
//   const [formData, setFormData] = useState<HandoverFormData>(
//     initialFormData || {
//       name: "",
//       industrialExperience: "",
//       kpaplExperience: "",
//       currentDepartment: "",
//       distributedDepartment: "",
//       distributedLine: "",
//       distributedStation: "",
//       handoverDate: new Date().toISOString().split("T")[0],
//       contractorName: "",
//       pAndAName: "",
//       qaHodName: "",
//       isTrainingCompleted: "",
//       gojoInchargeName: "",
//     }
//   );

//   const [linesByDept, setLinesByDept] = useState<Record<string, LineOption[]>>({});
//   const [stationsByKey, setStationsByKey] = useState<Record<string, StationOption[]>>({});
//   const [filteredLines, setFilteredLines] = useState<LineOption[]>([]);
//   const [filteredStations, setFilteredStations] = useState<StationOption[]>([]);

//   // Fetch hierarchy data
//   useEffect(() => {
//     const fetchHierarchy = async () => {
//       try {
//         const response = await fetch("http://192.168.2.51:8000/hierarchy-simple/");
//         if (!response.ok) throw new Error("Failed to fetch hierarchy");
//         const hierarchyData = await response.json();

//         const linesMap: Record<string, LineOption[]> = {};
//         const stationsMap: Record<string, StationOption[]> = {};

//         hierarchyData.forEach((item: any) => {
//           item.structure_data?.departments?.forEach((dept: any) => {
//             const deptName = dept.department_name;
//             if (!linesMap[deptName]) linesMap[deptName] = [];

//             dept.lines?.forEach((line: any) => {
//               if (line?.id && line.line_name) {
//                 linesMap[deptName].push({ id: line.id, name: line.line_name });
//                 const lineKey = `${deptName} > ${line.line_name}`;
//                 if (!stationsMap[lineKey]) stationsMap[lineKey] = [];
//                 line.stations?.forEach((station: any) => {
//                   if (station?.id && station.station_name) {
//                     stationsMap[lineKey].push({ id: station.id, name: station.station_name });
//                   }
//                 });
//               }
//             });

//             if (!stationsMap[deptName]) stationsMap[deptName] = [];
//             dept.stations?.forEach((station: any) => {
//               if (station?.id && station.station_name) {
//                 stationsMap[deptName].push({ id: station.id, name: station.station_name });
//               }
//             });
//           });
//         });

//         setLinesByDept(linesMap);
//         setStationsByKey(stationsMap);
//       } catch (err) {
//         console.error("Failed to fetch hierarchy:", err);
//       }
//     };
//     fetchHierarchy();
//   }, []);

//   // Reset form when initialFormData changes
//   useEffect(() => {
//     if (initialFormData) {
//       setFormData(initialFormData);
//     }
//   }, [initialFormData]);

//   useEffect(() => {
//     if (employeeDetails && !initialFormData) {
//       setFormData((prev) => ({
//         ...prev,
//         name: `${employeeDetails.first_name} ${employeeDetails.last_name}`,
//         currentDepartment: employeeDetails.department_name || "N/A",
//       }));
//     }
//   }, [employeeDetails, initialFormData]);

//   // Filter lines when department changes
//   useEffect(() => {
//     if (formData.distributedDepartment && linesByDept[formData.distributedDepartment]) {
//       setFilteredLines(linesByDept[formData.distributedDepartment]);
//     } else {
//       setFilteredLines([]);
//     }
//     // Only reset if NOT in edit mode initial load
//     setFormData((prev) => ({ ...prev, distributedLine: "", distributedStation: "" }));
//   }, [formData.distributedDepartment, linesByDept]);

//   // Filter stations when line changes
//   useEffect(() => {
//     if (formData.distributedLine && formData.distributedDepartment) {
//       const lineKey = `${formData.distributedDepartment} > ${formData.distributedLine}`;
//       setFilteredStations(stationsByKey[lineKey] || []);
//     } else if (formData.distributedDepartment) {
//       setFilteredStations(stationsByKey[formData.distributedDepartment] || []);
//     } else {
//       setFilteredStations([]);
//     }
//     setFormData((prev) => ({ ...prev, distributedStation: "" }));
//   }, [formData.distributedLine, formData.distributedDepartment, stationsByKey]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit(formData);
//   };

//   const modalStyles: { [key: string]: React.CSSProperties } = {
//     backdrop: {
//       position: "fixed",
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: "rgba(17, 24, 39, 0.65)",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       zIndex: 1000,
//       backdropFilter: "blur(4px)",
//     },
//     content: {
//       backgroundColor: "white",
//       padding: "30px 40px",
//       borderRadius: "20px",
//       width: "90%",
//       maxWidth: "820px",
//       minHeight: "400px",
//       maxHeight: "92vh",
//       overflowY: "auto",
//       boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
//       position: "relative",
//       display: "flex",
//       flexDirection: "column",
//     },
//     closeButton: {
//       position: "absolute",
//       top: "15px",
//       right: "20px",
//       background: "transparent",
//       border: "none",
//       fontSize: "28px",
//       cursor: "pointer",
//       color: "#9ca3af",
//     },
//     header: {
//       textAlign: "center",
//       marginBottom: "28px",
//       borderBottom: "1px solid #e5e7eb",
//       paddingBottom: "20px",
//     },
//     title: {
//       fontSize: "22px",
//       fontWeight: "700",
//       color: "#1f2937",
//       marginBottom: "6px",
//     },
//     editBadge: {
//       display: "inline-flex",
//       alignItems: "center",
//       gap: "5px",
//       padding: "4px 12px",
//       borderRadius: "20px",
//       fontSize: "12px",
//       fontWeight: "600",
//       backgroundColor: "#fef3c7",
//       color: "#92400e",
//       border: "1px solid #fde68a",
//     },
//     formGrid: {
//       display: "grid",
//       gridTemplateColumns: "repeat(2, 1fr)",
//       gap: "22px",
//     },
//     formField: { display: "flex", flexDirection: "column" as const },
//     label: {
//       marginBottom: "7px",
//       fontSize: "13px",
//       fontWeight: "600",
//       color: "#374151",
//       textTransform: "uppercase" as const,
//       letterSpacing: "0.03em",
//     },
//     input: {
//       padding: "10px 13px",
//       fontSize: "14px",
//       border: "1.5px solid #e5e7eb",
//       borderRadius: "10px",
//       outline: "none",
//       transition: "all 0.2s",
//       boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
//       backgroundColor: "white",
//     },
//     readOnlyInput: {
//       backgroundColor: "#f9fafb",
//       cursor: "not-allowed",
//       color: "#6b7280",
//       border: "1.5px solid #f3f4f6",
//     },
//     submitButton: {
//       gridColumn: "1 / -1",
//       marginTop: "20px",
//       padding: "13px 20px",
//       fontSize: "15px",
//       fontWeight: "700",
//       color: "#ffffff",
//       background: isEditMode
//         ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
//         : "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
//       border: "none",
//       borderRadius: "12px",
//       cursor: "pointer",
//       transition: "all 0.2s ease",
//       boxShadow: isEditMode
//         ? "0 4px 14px rgba(245, 158, 11, 0.3)"
//         : "0 4px 14px rgba(124, 58, 237, 0.25)",
//       letterSpacing: "0.02em",
//     },
//     centeredStatus: {
//       flex: 1,
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       fontSize: "17px",
//       color: "#6b7280",
//       minHeight: "200px",
//     },
//   };

//   return (
//     <div style={modalStyles.backdrop} onClick={onClose}>
//       <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
//         <button style={modalStyles.closeButton} onClick={onClose}>&times;</button>

//         <div style={modalStyles.header}>
//           <h2 style={modalStyles.title}>Dojo Handover Form</h2>
//           {isEditMode && (
//             <span style={modalStyles.editBadge}>✏️ Editing Existing Handover</span>
//           )}
//         </div>

//         {isLoading && (
//           <div style={modalStyles.centeredStatus}>
//             <span>⏳ Loading Employee Details...</span>
//           </div>
//         )}
//         {error && (
//           <div style={{ ...modalStyles.centeredStatus, color: "#dc2626" }}>
//             ⚠️ {error}
//           </div>
//         )}

//         {!isLoading && !error && employeeDetails && (
//           <form onSubmit={handleSubmit}>
//             <div style={modalStyles.formGrid}>

//               {/* Name */}
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   style={{ ...modalStyles.input, ...modalStyles.readOnlyInput }}
//                   readOnly
//                 />
//               </div>

//               {/* Industrial Experience */}
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Industrial Experience / Dept</label>
//                 <input
//                   type="text"
//                   name="industrialExperience"
//                   value={formData.industrialExperience}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   placeholder="e.g. 3 years / Welding"
//                   required
//                 />
//               </div>

//               {/* KPAPL Experience */}
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>KPAPL Experience / Dept</label>
//                 <input
//                   type="text"
//                   name="kpaplExperience"
//                   value={formData.kpaplExperience}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   placeholder="e.g. 1 year / Assembly"
//                   required
//                 />
//               </div>

//               {/* Current Department (read-only) */}
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Current Department</label>
//                 <input
//                   type="text"
//                   name="currentDepartment"
//                   value={formData.currentDepartment}
//                   style={{ ...modalStyles.input, ...modalStyles.readOnlyInput }}
//                   readOnly
//                 />
//               </div>

//               {/* Distributed Department */}
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Distributed Department (Post-Dojo) *</label>
//                 <select
//                   name="distributedDepartment"
//                   value={formData.distributedDepartment}
//                   onChange={handleChange}
//                   style={modalStyles.input as React.CSSProperties}
//                   required
//                 >
//                   <option value="" disabled>Select a department</option>
//                   {departments.map((deptName) => (
//                     <option key={deptName} value={deptName}>{deptName}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Distributed Line */}
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Distributed Line (Optional)</label>
//                 <select
//                   name="distributedLine"
//                   value={formData.distributedLine}
//                   onChange={handleChange}
//                   style={modalStyles.input as React.CSSProperties}
//                   disabled={!formData.distributedDepartment || filteredLines.length === 0}
//                 >
//                   <option value="">-- Select Line (Optional) --</option>
//                   {filteredLines.map((line) => (
//                     <option key={line.id} value={line.name}>{line.name}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Distributed Station */}
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Distributed Station (Optional)</label>
//                 <select
//                   name="distributedStation"
//                   value={formData.distributedStation}
//                   onChange={handleChange}
//                   style={modalStyles.input as React.CSSProperties}
//                   disabled={!formData.distributedDepartment || filteredStations.length === 0}
//                 >
//                   <option value="">-- Select Station (Optional) --</option>
//                   {filteredStations.map((station) => (
//                     <option key={station.id} value={station.name}>{station.name}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Handover Date */}
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Handover Date</label>
//                 <input
//                   type="date"
//                   name="handoverDate"
//                   value={formData.handoverDate}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   required
//                 />
//               </div>

//               {/* Contractor Name */}
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Contractor Name</label>
//                 <input
//                   type="text"
//                   name="contractorName"
//                   value={formData.contractorName}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   placeholder="Enter contractor name"
//                   required
//                 />
//               </div>

//               {/* P & A Name */}
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>P & A Name</label>
//                 <input
//                   type="text"
//                   name="pAndAName"
//                   value={formData.pAndAName}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   placeholder="Enter P & A name"
//                   required
//                 />
//               </div>

//               {/* QA HOD Name */}
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>QA HOD Name</label>
//                 <input
//                   type="text"
//                   name="qaHodName"
//                   value={formData.qaHodName}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   placeholder="Enter QA HOD name"
//                   required
//                 />
//               </div>

//               {/* Is Training Completed */}
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Is Training Completed?</label>
//                 <select
//                   name="isTrainingCompleted"
//                   value={formData.isTrainingCompleted}
//                   onChange={handleChange}
//                   style={modalStyles.input as React.CSSProperties}
//                   required
//                 >
//                   <option value="" disabled>Select an option</option>
//                   <option value="yes">Yes</option>
//                   <option value="no">No</option>
//                 </select>
//               </div>

//               {/* Dojo Incharge Name */}
//               <div style={modalStyles.formField}>
//                 <label style={modalStyles.label}>Dojo Incharge Name</label>
//                 <input
//                   type="text"
//                   name="gojoInchargeName"
//                   value={formData.gojoInchargeName}
//                   onChange={handleChange}
//                   style={modalStyles.input}
//                   placeholder="Enter Dojo incharge name"
//                   required
//                 />
//               </div>

//               {/* Submit Button */}
//               <button type="submit" style={modalStyles.submitButton}>
//                 {isEditMode ? "✏️ Update Handover" : "✅ Submit Handover"}
//               </button>

//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// // --- Main Page Component ---
// const HandOverSheet: React.FC = () => {
//   const [scores, setScores] = useState<ApiScoreData[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [departments, setDepartments] = useState<string[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [hoveredCard, setHoveredCard] = useState<number | null>(null);

//   // ✅ Track which employee IDs already have a handover
//   const [handoverDoneEmpIds, setHandoverDoneEmpIds] = useState<Set<string>>(new Set());

//   // Modal State
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [selectedScore, setSelectedScore] = useState<ApiScoreData | null>(null);
//   const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
//   const [modalError, setModalError] = useState<string | null>(null);
//   const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<EmployeeMasterData | null>(null);
//   const [initialFormData, setInitialFormData] = useState<HandoverFormData | null>(null);
//   const [isEditMode, setIsEditMode] = useState<boolean>(false);

//   // Fetch scores, departments, and handover statuses
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [scoresResponse, deptsResponse] = await Promise.all([
//           fetch("http://192.168.2.51:8000/scores/passed/level-1/"),
//           fetch("http://192.168.2.51:8000/departments/"),
//         ]);

//         if (!scoresResponse.ok) throw new Error(`Scores API failed: ${scoresResponse.status}`);
//         if (!deptsResponse.ok) throw new Error(`Departments API failed: ${deptsResponse.status}`);

//         const scoresData: ApiScoreData[] = await scoresResponse.json();
//         const deptsData: { department_name: string }[] = await deptsResponse.json();

//         setScores(scoresData);
//         setDepartments(deptsData.map((dept) => dept.department_name));

//         // ✅ Check handover status for all employees in parallel
//         const empIds = scoresData
//           .map((score) => score.employee_details.split("(").pop()?.replace(")", "") || "")
//           .filter(Boolean);

//         const handoverChecks = await Promise.all(
//           empIds.map(async (empId) => {
//             const res = await fetch(`http://192.168.2.51:8000/handovers/employee/${empId}/`);
//             return { empId, exists: res.ok };
//           })
//         );

//         const doneIds = new Set(
//           handoverChecks.filter((item) => item.exists).map((item) => item.empId)
//         );
//         setHandoverDoneEmpIds(doneIds);
//         setError(null);
//       } catch (err) {
//         if (err instanceof Error) setError(`Failed to fetch data: ${err.message}`);
//         else setError("An unknown error occurred.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const uniqueMonths = useMemo(() => {
//     const months = new Set<string>();
//     scores.forEach((score) => months.add(score.created_at.substring(0, 7)));
//     return Array.from(months).sort().reverse();
//   }, [scores]);

//   useEffect(() => {
//     if (uniqueMonths.length > 0 && !selectedMonth) {
//       setSelectedMonth(uniqueMonths[0]);
//     }
//   }, [uniqueMonths, selectedMonth]);

//   const filteredEmployees = useMemo(() => {
//     let employees = [...scores];
//     if (selectedMonth && selectedMonth !== "all") {
//       employees = employees.filter((emp) => emp.created_at.startsWith(selectedMonth));
//     }
//     if (searchTerm.trim() !== "") {
//       const lower = searchTerm.toLowerCase();
//       employees = employees.filter(
//         (emp) =>
//           emp.employee_details.toLowerCase().includes(lower) ||
//           String(emp.id).includes(searchTerm)
//       );
//     }
//     return employees.sort((a, b) => b.percentage - a.percentage);
//   }, [scores, selectedMonth, searchTerm]);

//   // Helper to extract empId from employee_details string
//   const getEmpId = (employeeDetails: string): string =>
//     employeeDetails.split("(").pop()?.replace(")", "") || "";

//   const handleOpenModal = async (score: ApiScoreData) => {
//     setIsModalOpen(true);
//     setSelectedScore(score);
//     setIsModalLoading(true);
//     setModalError(null);
//     setSelectedEmployeeDetails(null);
//     setInitialFormData(null);
//     setIsEditMode(false);

//     try {
//       const empId = getEmpId(score.employee_details);
//       if (!empId) {
//         throw new Error(`Could not parse Employee ID from: "${score.employee_details}"`);
//       }

//       // Fetch employee details
//       const response = await fetch(`http://192.168.2.51:8000/mastertable/${empId}/`);
//       if (!response.ok) {
//         if (response.status === 404)
//           throw new Error(`Employee with ID '${empId}' not found in Master Table.`);
//         throw new Error(`Failed to fetch employee details (Status: ${response.status})`);
//       }
//       const data: EmployeeMasterData = await response.json();
//       setSelectedEmployeeDetails(data);

//       // ✅ Fetch existing handover if any
//       const handResp = await fetch(`http://192.168.2.51:8000/handovers/employee/${empId}/`);
//       if (handResp.ok) {
//         // Existing handover found → Edit mode
//         const handData = await handResp.json();
//         setIsEditMode(true);
//         setInitialFormData({
//           name: `${data.first_name} ${data.last_name}`,
//           industrialExperience: handData.industrial_experience || "",
//           kpaplExperience: handData.kpapl_experience || "",
//           currentDepartment: handData.required_department_at_handover || data.department_name || "",
//           distributedDepartment: handData.distributed_department_after_dojo?.department_name || "",
//           distributedLine: handData.distributed_line_after_dojo?.line_name || "",
//           distributedStation: handData.distributed_station_after_dojo?.station_name || "",
//           handoverDate: handData.handover_date || new Date().toISOString().split("T")[0],
//           contractorName: handData.contractor_name || "",
//           pAndAName: handData.p_and_a_name || "",
//           qaHodName: handData.qa_hod_name || "",
//           isTrainingCompleted: handData.is_training_completed ? "yes" : "no",
//           gojoInchargeName: handData.gojo_incharge_name || "",
//         });
//       } else {
//         // No handover yet → Create mode
//         setIsEditMode(false);
//         setInitialFormData({
//           name: `${data.first_name} ${data.last_name}`,
//           industrialExperience: "",
//           kpaplExperience: "",
//           currentDepartment: data.department_name || "",
//           distributedDepartment: "",
//           distributedLine: "",
//           distributedStation: "",
//           handoverDate: new Date().toISOString().split("T")[0],
//           contractorName: "",
//           pAndAName: "",
//           qaHodName: "",
//           isTrainingCompleted: "",
//           gojoInchargeName: "",
//         });
//       }
//     } catch (err) {
//       if (err instanceof Error) setModalError(err.message);
//       else setModalError("An unknown error occurred.");
//     } finally {
//       setIsModalLoading(false);
//     }
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedScore(null);
//     setSelectedEmployeeDetails(null);
//     setModalError(null);
//     setInitialFormData(null);
//     setIsEditMode(false);
//   };

//   const handleFormSubmit = async (formData: HandoverFormData) => {
//     if (!selectedEmployeeDetails) {
//       alert("Error: Employee details are not loaded. Cannot submit.");
//       return;
//     }

//     const payload = {
//       emp_id: selectedEmployeeDetails.emp_id,
//       industrial_experience: formData.industrialExperience,
//       kpapl_experience: formData.kpaplExperience,
//       required_department_at_handover: formData.currentDepartment,
//       distributed_department_name: formData.distributedDepartment,
//       distributed_line_name: formData.distributedLine || "",
//       distributed_station_name: formData.distributedStation || "",
//       handover_date: formData.handoverDate,
//       contractor_name: formData.contractorName,
//       p_and_a_name: formData.pAndAName,
//       qa_hod_name: formData.qaHodName,
//       is_training_completed: formData.isTrainingCompleted,
//       gojo_incharge_name: formData.gojoInchargeName,
//     };

//     try {
//       const response = await fetch("http://192.168.2.51:8000/handovers/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         const errorMessage =
//           Object.values(errorData).flat().join(" ") || `Server error: ${response.status}`;
//         throw new Error(errorMessage);
//       }

//       // ✅ Mark employee as handover done instantly (no refetch needed)
//       setHandoverDoneEmpIds((prev) => {
//         const updated = new Set(prev);
//         updated.add(selectedEmployeeDetails.emp_id);
//         return updated;
//       });

//       alert(isEditMode ? "Handover updated successfully!" : "Handover submitted successfully!");
//       handleCloseModal();
//     } catch (error) {
//       if (error instanceof Error) alert(`Error: ${error.message}`);
//       else alert("An unknown error occurred during submission.");
//     }
//   };

//   const formatDate = (dateString: string): string =>
//     new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });

//   const formatMonthForDisplay = (monthStr: string): string => {
//     const [year, month] = monthStr.split("-");
//     return new Date(Number(year), Number(month) - 1).toLocaleString("en-US", {
//       month: "long",
//       year: "numeric",
//     });
//   };

//   const styles: { [key: string]: React.CSSProperties } = {
//     container: {
//       minHeight: "100vh",
//       backgroundColor: "#f8fafc",
//       padding: "40px 20px",
//     },
//     header: { textAlign: "center" as const, marginBottom: "50px" },
//     title: {
//       fontSize: "32px",
//       fontWeight: "800",
//       background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
//       WebkitBackgroundClip: "text",
//       WebkitTextFillColor: "transparent",
//       backgroundClip: "text",
//       marginBottom: "10px",
//     },
//     subtitle: { fontSize: "18px", color: "#6b7280", fontWeight: "400" },
//     controlsContainer: {
//       maxWidth: "1000px",
//       margin: "0 auto 40px",
//       display: "flex",
//       gap: "20px",
//       justifyContent: "space-between",
//     },
//     searchInput: {
//       flex: 1,
//       padding: "12px 16px",
//       fontSize: "15px",
//       border: "1.5px solid #e5e7eb",
//       borderRadius: "12px",
//       outline: "none",
//       transition: "all 0.2s",
//       boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
//       backgroundColor: "white",
//     },
//     monthSelect: {
//       padding: "12px 16px",
//       fontSize: "15px",
//       border: "1.5px solid #e5e7eb",
//       borderRadius: "12px",
//       backgroundColor: "white",
//       cursor: "pointer",
//       outline: "none",
//       transition: "all 0.2s",
//       boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
//     },
//     resultsContainer: { maxWidth: "1000px", margin: "0 auto" },
//     noResults: {
//       textAlign: "center",
//       padding: "50px",
//       backgroundColor: "#ffffff",
//       borderRadius: "16px",
//       color: "#6b7280",
//       fontSize: "18px",
//       boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
//     },
//     resultCard: {
//       backgroundColor: "#ffffff",
//       borderRadius: "16px",
//       padding: "28px 30px",
//       marginBottom: "18px",
//       boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
//       border: "1.5px solid #f3f4f6",
//       display: "flex",
//       alignItems: "center",
//       gap: "25px",
//       transition: "all 0.3s ease",
//     },
//     resultCardHover: {
//       boxShadow: "0 10px 30px rgba(124, 58, 237, 0.1)",
//       borderColor: "#e0e7ff",
//       transform: "translateY(-2px)",
//     },
//     resultCardDone: {
//       borderColor: "#d1fae5",
//       backgroundColor: "#f0fdf4",
//     },
//     rankCircle: {
//       width: "54px",
//       height: "54px",
//       borderRadius: "50%",
//       background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
//       color: "white",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       fontSize: "19px",
//       fontWeight: "700",
//       flexShrink: 0,
//       boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
//     },
//     mainInfo: { flex: 1 },
//     name: {
//       fontSize: "19px",
//       fontWeight: "700",
//       color: "#1f2937",
//       marginBottom: "8px",
//     },
//     details: {
//       display: "flex",
//       gap: "12px",
//       color: "#6b7280",
//       fontSize: "14px",
//       marginBottom: "14px",
//       flexWrap: "wrap" as const,
//       alignItems: "center",
//     },
//     scoreSection: { marginTop: "12px" },
//     scoreBar: {
//       width: "100%",
//       height: "9px",
//       backgroundColor: "#f3f4f6",
//       borderRadius: "10px",
//       overflow: "hidden",
//       marginBottom: "7px",
//     },
//     scoreProgress: {
//       height: "100%",
//       background: "linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)",
//       borderRadius: "10px",
//       transition: "width 1s ease",
//     },
//     scoreText: {
//       display: "flex",
//       justifyContent: "space-between",
//       fontSize: "13px",
//       color: "#6b7280",
//     },
//     badge: {
//       display: "inline-block",
//       padding: "3px 10px",
//       borderRadius: "20px",
//       fontSize: "12px",
//       fontWeight: "600",
//       backgroundColor: "#f3f4f6",
//       color: "#4b5563",
//       border: "1px solid #e5e7eb",
//     },
//     statusPill: {
//       display: "inline-flex",
//       alignItems: "center",
//       gap: "5px",
//       padding: "3px 10px",
//       borderRadius: "20px",
//       fontSize: "12px",
//       fontWeight: "600",
//       backgroundColor: "#dcfce7",
//       color: "#166534",
//       border: "1px solid #bbf7d0",
//     },
//     // ✅ Button area wrapper
//     buttonArea: {
//       display: "flex",
//       flexDirection: "column" as const,
//       alignItems: "center",
//       gap: "8px",
//       flexShrink: 0,
//     },
//     // Handover Done Badge
//     handoverDoneBadge: {
//       display: "inline-flex",
//       alignItems: "center",
//       gap: "5px",
//       padding: "5px 13px",
//       borderRadius: "20px",
//       fontSize: "12px",
//       fontWeight: "700",
//       backgroundColor: "#dcfce7",
//       color: "#166534",
//       border: "1.5px solid #86efac",
//       whiteSpace: "nowrap" as const,
//     },
//     // Create Handover Button (purple)
//     createButton: {
//       padding: "11px 20px",
//       fontSize: "14px",
//       fontWeight: "600",
//       color: "#ffffff",
//       background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
//       border: "none",
//       borderRadius: "10px",
//       cursor: "pointer",
//       transition: "all 0.2s ease",
//       boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
//       whiteSpace: "nowrap" as const,
//     },
//     // Edit Handover Button (amber)
//     editButton: {
//       padding: "9px 18px",
//       fontSize: "13px",
//       fontWeight: "600",
//       color: "#ffffff",
//       background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
//       border: "none",
//       borderRadius: "10px",
//       cursor: "pointer",
//       transition: "all 0.2s ease",
//       boxShadow: "0 4px 10px rgba(245, 158, 11, 0.3)",
//       whiteSpace: "nowrap" as const,
//     },
//   };

//   if (loading)
//     return (
//       <div style={{ ...styles.container, textAlign: "center", fontSize: "20px", paddingTop: "100px" }}>
//         ⏳ Loading...
//       </div>
//     );

//   if (error)
//     return (
//       <div style={{ ...styles.container, textAlign: "center", fontSize: "20px", color: "red", paddingTop: "100px" }}>
//         ⚠️ Error: {error}
//       </div>
//     );

//   return (
//     <div style={styles.container}>
//       {/* Header */}
//       <div style={styles.header}>
//         <h1 style={styles.title}>Level 1 Passed Users</h1>
//         <p style={styles.subtitle}>Employee Assessment Outcomes</p>
//       </div>

//       {/* Search & Month Filter */}
//       <div style={styles.controlsContainer}>
//         <input
//           type="text"
//           placeholder="Search by Employee ID or Name..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           style={styles.searchInput}
//         />
//         <select
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           style={styles.monthSelect}
//         >
//           <option value="all">All Months</option>
//           {uniqueMonths.map((month) => (
//             <option key={month} value={month}>
//               {formatMonthForDisplay(month)}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Cards */}
//       <div style={styles.resultsContainer}>
//         {filteredEmployees.length > 0 ? (
//           filteredEmployees.map((score, index) => {
//             const empId = getEmpId(score.employee_details);
//             const isDone = handoverDoneEmpIds.has(empId);

//             return (
//               <div
//                 key={score.id}
//                 style={{
//                   ...styles.resultCard,
//                   ...(isDone ? styles.resultCardDone : {}),
//                   ...(hoveredCard === score.id ? styles.resultCardHover : {}),
//                 }}
//                 onMouseEnter={() => setHoveredCard(score.id)}
//                 onMouseLeave={() => setHoveredCard(null)}
//               >
//                 {/* Rank */}
//                 <div style={styles.rankCircle}>{index + 1}</div>

//                 {/* Main Info */}
//                 <div style={styles.mainInfo}>
//                   <h3 style={styles.name}>{score.employee_details}</h3>
//                   <div style={styles.details}>
//                     <span>{score.skill_name}</span>
//                     <span>•</span>
//                     <span style={styles.badge}>{score.skill_name}</span>
//                     <span>•</span>
//                     <span>{formatDate(score.created_at)}</span>
//                     <span>•</span>
//                     <span style={styles.statusPill}>
//                       <span>✓</span>
//                       <span>Passed</span>
//                     </span>
//                   </div>
//                   <div style={styles.scoreSection}>
//                     <div style={styles.scoreBar}>
//                       <div
//                         style={{
//                           ...styles.scoreProgress,
//                           width: `${score.percentage}%`,
//                         }}
//                       />
//                     </div>
//                     <div style={styles.scoreText}>
//                       <span style={{ fontWeight: "600", color: "#4b5563" }}>
//                         Score: {score.percentage.toFixed(1)}%
//                       </span>
//                       <span>Minimum Required: 80%</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* ✅ Button Area — shows different UI based on handover status */}
//                 <div style={styles.buttonArea}>
//                   {isDone ? (
//                     <>
//                       {/* Already Done Badge */}
//                       <span style={styles.handoverDoneBadge}>
//                         ✅ Handover Done
//                       </span>
//                       {/* Edit Button */}
//                       <button
//                         style={styles.editButton}
//                         onClick={() => handleOpenModal(score)}
//                       >
//                         ✏️ Edit Handover
//                       </button>
//                     </>
//                   ) : (
//                     /* Create Button */
//                     <button
//                       style={styles.createButton}
//                       onClick={() => handleOpenModal(score)}
//                     >
//                       Create Handover
//                     </button>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div style={styles.noResults}>
//             <p>No employees found matching your criteria.</p>
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       {isModalOpen && selectedScore && (
//         <HandOverFormModal
//           scoreData={selectedScore}
//           departments={departments}
//           onClose={handleCloseModal}
//           onSubmit={handleFormSubmit}
//           isLoading={isModalLoading}
//           error={modalError}
//           employeeDetails={selectedEmployeeDetails}
//           initialFormData={initialFormData}
//           isEditMode={isEditMode}
//         />
//       )}
//     </div>
//   );
// };

// export default HandOverSheet;





import React, { useState, useMemo, useEffect, useRef } from "react";

// --- Interfaces ---
interface ApiScoreData {
  id: number;
  employee_details: string;
  skill_name: string;
  marks: number;
  percentage: number;
  created_at: string;
}

interface EmployeeMasterData {
  emp_id: string;
  first_name: string;
  last_name: string;
  department_name: string;
  date_of_joining: string;
}

interface LineOption {
  id: number;
  name: string;
}

interface StationOption {
  id: number;
  name: string;
}

interface HandoverFormData {
  name: string;
  industrialExperience: string;
  kpaplExperience: string;
  currentDepartment: string;
  distributedDepartment: string;
  distributedLine: string;
  distributedStation: string;
  handoverDate: string;
  contractorName: string;
  pAndAName: string;
  qaHodName: string;
  isTrainingCompleted: "yes" | "no" | "";
  gojoInchargeName: string;
}

interface HandoverDetail {
  emp_id: string;
  employee_name: string;
  industrial_experience: string;
  kpapl_experience: string;
  required_department_at_handover: string;
  distributed_department_after_dojo: { department_name: string } | null;
  distributed_line_after_dojo: { line_name: string } | null;
  distributed_station_after_dojo: { station_name: string } | null;
  handover_date: string;
  contractor_name: string;
  p_and_a_name: string;
  qa_hod_name: string;
  is_training_completed: boolean;
  gojo_incharge_name: string;
}

// ─────────────────────────────────────────────
// Handover FORM Modal
// ─────────────────────────────────────────────
interface HandOverFormModalProps {
  scoreData: ApiScoreData;
  departments: string[];
  onClose: () => void;
  onSubmit: (formData: HandoverFormData) => void;
  employeeDetails: EmployeeMasterData | null;
  isLoading: boolean;
  error: string | null;
  initialFormData: HandoverFormData | null;
  isEditMode: boolean;
}

const HandOverFormModal: React.FC<HandOverFormModalProps> = ({
  departments,
  onClose,
  onSubmit,
  employeeDetails,
  isLoading,
  error,
  initialFormData,
  isEditMode,
}) => {
  const [formData, setFormData] = useState<HandoverFormData>(
    initialFormData || {
      name: "",
      industrialExperience: "",
      kpaplExperience: "",
      currentDepartment: "",
      distributedDepartment: "",
      distributedLine: "",
      distributedStation: "",
      handoverDate: new Date().toISOString().split("T")[0],
      contractorName: "",
      pAndAName: "",
      qaHodName: "",
      isTrainingCompleted: "",
      gojoInchargeName: "",
    }
  );

  const [linesByDept, setLinesByDept] = useState<Record<string, LineOption[]>>({});
  const [stationsByKey, setStationsByKey] = useState<Record<string, StationOption[]>>({});
  const [filteredLines, setFilteredLines] = useState<LineOption[]>([]);
  const [filteredStations, setFilteredStations] = useState<StationOption[]>([]);
  const isInitialDeptLoad = useRef(true);
  const isInitialLineLoad = useRef(true);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const response = await fetch("http://192.168.2.51:8000/hierarchy-simple/");
        if (!response.ok) throw new Error("Failed to fetch hierarchy");
        const hierarchyData = await response.json();
        const linesMap: Record<string, LineOption[]> = {};
        const stationsMap: Record<string, StationOption[]> = {};
        hierarchyData.forEach((item: any) => {
          item.structure_data?.departments?.forEach((dept: any) => {
            const deptName = dept.department_name;
            if (!linesMap[deptName]) linesMap[deptName] = [];
            dept.lines?.forEach((line: any) => {
              if (line?.id && line.line_name) {
                linesMap[deptName].push({ id: line.id, name: line.line_name });
                const lineKey = `${deptName} > ${line.line_name}`;
                if (!stationsMap[lineKey]) stationsMap[lineKey] = [];
                line.stations?.forEach((station: any) => {
                  if (station?.id && station.station_name)
                    stationsMap[lineKey].push({ id: station.id, name: station.station_name });
                });
              }
            });
            if (!stationsMap[deptName]) stationsMap[deptName] = [];
            dept.stations?.forEach((station: any) => {
              if (station?.id && station.station_name)
                stationsMap[deptName].push({ id: station.id, name: station.station_name });
            });
          });
        });
        setLinesByDept(linesMap);
        setStationsByKey(stationsMap);
      } catch (err) {
        console.error("Failed to fetch hierarchy:", err);
      }
    };
    fetchHierarchy();
  }, []);

  useEffect(() => {
    if (initialFormData) {
      setFormData(initialFormData);
      isInitialDeptLoad.current = true;
      isInitialLineLoad.current = true;
    }
  }, [initialFormData]);

  useEffect(() => {
    if (employeeDetails && !initialFormData) {
      setFormData((prev) => ({
        ...prev,
        name: `${employeeDetails.first_name} ${employeeDetails.last_name}`,
        currentDepartment: employeeDetails.department_name || "N/A",
      }));
    }
  }, [employeeDetails, initialFormData]);

  useEffect(() => {
    if (!formData.distributedDepartment) { setFilteredLines([]); return; }
    setFilteredLines(linesByDept[formData.distributedDepartment] || []);
    if (isInitialDeptLoad.current && initialFormData?.distributedDepartment === formData.distributedDepartment) {
      isInitialDeptLoad.current = false; return;
    }
    setFormData((prev) => ({ ...prev, distributedLine: "", distributedStation: "" }));
  }, [formData.distributedDepartment, linesByDept]);

  useEffect(() => {
    if (!formData.distributedDepartment) { setFilteredStations([]); return; }
    const stations = formData.distributedLine
      ? stationsByKey[`${formData.distributedDepartment} > ${formData.distributedLine}`] || []
      : stationsByKey[formData.distributedDepartment] || [];
    setFilteredStations(stations);
    if (isInitialLineLoad.current && initialFormData?.distributedLine === formData.distributedLine) {
      isInitialLineLoad.current = false; return;
    }
    setFormData((prev) => ({ ...prev, distributedStation: "" }));
  }, [formData.distributedLine, formData.distributedDepartment, stationsByKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const s: { [key: string]: React.CSSProperties } = {
    backdrop: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(17,24,39,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
    box: { backgroundColor: "white", padding: "30px 40px", borderRadius: "20px", width: "90%", maxWidth: "820px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", position: "relative" },
    close: { position: "absolute", top: "15px", right: "20px", background: "transparent", border: "none", fontSize: "26px", cursor: "pointer", color: "#9ca3af" },
    head: { textAlign: "center", marginBottom: "24px", borderBottom: "1px solid #e5e7eb", paddingBottom: "18px" },
    title: { fontSize: "20px", fontWeight: "700", color: "#1f2937", marginBottom: "6px" },
    editBadge: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" },
    field: { display: "flex", flexDirection: "column" as const },
    label: { marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.04em" },
    input: { padding: "10px 13px", fontSize: "14px", border: "1.5px solid #e5e7eb", borderRadius: "10px", outline: "none", backgroundColor: "white" },
    readonly: { backgroundColor: "#f9fafb", cursor: "not-allowed", color: "#6b7280", border: "1.5px solid #f3f4f6" },
    submitBtn: { gridColumn: "1 / -1", marginTop: "16px", padding: "13px", fontSize: "15px", fontWeight: "700", color: "#fff", background: isEditMode ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#7c3aed,#2563eb)", border: "none", borderRadius: "12px", cursor: "pointer", boxShadow: isEditMode ? "0 4px 14px rgba(245,158,11,0.3)" : "0 4px 14px rgba(124,58,237,0.25)" },
    center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px", fontSize: "17px", color: "#6b7280" },
  };

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={s.box} onClick={(e) => e.stopPropagation()}>
        <button style={s.close} onClick={onClose}>&times;</button>
        <div style={s.head}>
          <h2 style={s.title}>Dojo Handover Form</h2>
          {isEditMode && <span style={s.editBadge}>✏️ Editing Existing Handover</span>}
        </div>

        {isLoading && <div style={s.center}>⏳ Loading Employee Details...</div>}
        {error && <div style={{ ...s.center, color: "#dc2626" }}>⚠️ {error}</div>}

        {!isLoading && !error && employeeDetails && (
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
            <div style={s.grid}>
              {[
                { label: "Name", name: "name", readonly: true },
              ].map(({ label, name, readonly }) => (
                <div key={name} style={s.field}>
                  <label style={s.label}>{label}</label>
                  <input type="text" name={name} value={(formData as any)[name]} onChange={handleChange} style={readonly ? { ...s.input, ...s.readonly } : s.input} readOnly={readonly} />
                </div>
              ))}

              <div style={s.field}>
                <label style={s.label}>Industrial Experience / Dept</label>
                <input type="text" name="industrialExperience" value={formData.industrialExperience} onChange={handleChange} style={s.input} placeholder="e.g. 3 years / Welding" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>KPAPL Experience / Dept</label>
                <input type="text" name="kpaplExperience" value={formData.kpaplExperience} onChange={handleChange} style={s.input} placeholder="e.g. 1 year / Assembly" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Current Department</label>
                <input type="text" name="currentDepartment" value={formData.currentDepartment} style={{ ...s.input, ...s.readonly }} readOnly />
              </div>
              <div style={s.field}>
                <label style={s.label}>Distributed Department (Post-Dojo) *</label>
                <select name="distributedDepartment" value={formData.distributedDepartment} onChange={handleChange} style={s.input as React.CSSProperties} required>
                  <option value="" disabled>Select a department</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Distributed Line (Optional)</label>
                <select name="distributedLine" value={formData.distributedLine} onChange={handleChange} style={s.input as React.CSSProperties} disabled={!formData.distributedDepartment || filteredLines.length === 0}>
                  <option value="">-- Select Line (Optional) --</option>
                  {filteredLines.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Distributed Station (Optional)</label>
                <select name="distributedStation" value={formData.distributedStation} onChange={handleChange} style={s.input as React.CSSProperties} disabled={!formData.distributedDepartment || filteredStations.length === 0}>
                  <option value="">-- Select Station (Optional) --</option>
                  {filteredStations.map((st) => <option key={st.id} value={st.name}>{st.name}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Handover Date</label>
                <input type="date" name="handoverDate" value={formData.handoverDate} onChange={handleChange} style={s.input} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Contractor Name</label>
                <input type="text" name="contractorName" value={formData.contractorName} onChange={handleChange} style={s.input} placeholder="Enter contractor name" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>P & A Name</label>
                <input type="text" name="pAndAName" value={formData.pAndAName} onChange={handleChange} style={s.input} placeholder="Enter P & A name" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>QA HOD Name</label>
                <input type="text" name="qaHodName" value={formData.qaHodName} onChange={handleChange} style={s.input} placeholder="Enter QA HOD name" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Is Training Completed?</label>
                <select name="isTrainingCompleted" value={formData.isTrainingCompleted} onChange={handleChange} style={s.input as React.CSSProperties} required>
                  <option value="" disabled>Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Dojo Incharge Name</label>
                <input type="text" name="gojoInchargeName" value={formData.gojoInchargeName} onChange={handleChange} style={s.input} placeholder="Enter Dojo incharge name" required />
              </div>

              <button type="submit" style={s.submitBtn}>
                {isEditMode ? "✏️ Update Handover" : "✅ Submit Handover"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Handover DETAIL VIEW Modal (Past tab)
// ─────────────────────────────────────────────
interface HandoverDetailModalProps {
  detail: HandoverDetail | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onEdit: () => void;
}

const HandoverDetailModal: React.FC<HandoverDetailModalProps> = ({ detail, isLoading, error, onClose, onEdit }) => {
  const s: { [key: string]: React.CSSProperties } = {
    backdrop: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(17,24,39,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
    box: { backgroundColor: "white", borderRadius: "20px", width: "90%", maxWidth: "700px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", position: "relative" },
    topBanner: { background: "linear-gradient(135deg,#22c55e,#16a34a)", padding: "28px 36px 24px", borderRadius: "20px 20px 0 0", position: "relative" },
    close: { position: "absolute", top: "16px", right: "20px", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "32px", height: "32px", fontSize: "18px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
    bannerTitle: { fontSize: "22px", fontWeight: "800", color: "#fff", marginBottom: "4px" },
    bannerSub: { fontSize: "14px", color: "rgba(255,255,255,0.8)" },
    body: { padding: "28px 36px 32px" },
    sectionTitle: { fontSize: "13px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "14px", paddingBottom: "8px", borderBottom: "1px solid #f3f4f6" },
    grid: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px", marginBottom: "24px" },
    item: { backgroundColor: "#f8fafc", borderRadius: "10px", padding: "12px 14px", border: "1px solid #f1f5f9" },
    itemLabel: { fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "4px" },
    itemValue: { fontSize: "14px", fontWeight: "600", color: "#1e293b" },
    trainingYes: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", backgroundColor: "#dcfce7", color: "#166534", border: "1px solid #86efac" },
    trainingNo: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
    editBtn: { width: "100%", marginTop: "8px", padding: "12px", fontSize: "14px", fontWeight: "700", color: "#fff", background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: "10px", cursor: "pointer", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" },
    center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px", fontSize: "17px", color: "#6b7280" },
  };

  const fmt = (val: string | null | undefined) => val || "—";

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={s.box} onClick={(e) => e.stopPropagation()}>
        {isLoading && <div style={{ ...s.center, minHeight: "300px" }}>⏳ Loading Handover Details...</div>}
        {error && <div style={{ ...s.center, color: "#dc2626", minHeight: "300px" }}>⚠️ {error}</div>}

        {!isLoading && !error && detail && (
          <>
            {/* Green banner */}
            <div style={s.topBanner}>
              <button style={s.close} onClick={onClose}>×</button>
              <div style={s.bannerTitle}>✅ Handover Completed</div>
              <div style={s.bannerSub}>{fmt(detail.employee_name)} · Emp ID: {fmt(detail.emp_id)}</div>
            </div>

            <div style={s.body}>
              {/* Employee Info */}
              <div style={s.sectionTitle}>👤 Employee Information</div>
              <div style={s.grid}>
                <div style={s.item}>
                  <div style={s.itemLabel}>Industrial Experience</div>
                  <div style={s.itemValue}>{fmt(detail.industrial_experience)}</div>
                </div>
                <div style={s.item}>
                  <div style={s.itemLabel}>KPAPL Experience</div>
                  <div style={s.itemValue}>{fmt(detail.kpapl_experience)}</div>
                </div>
                <div style={s.item}>
                  <div style={s.itemLabel}>Current Department</div>
                  <div style={s.itemValue}>{fmt(detail.required_department_at_handover)}</div>
                </div>
                <div style={s.item}>
                  <div style={s.itemLabel}>Handover Date</div>
                  <div style={s.itemValue}>{detail.handover_date ? new Date(detail.handover_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}</div>
                </div>
              </div>

              {/* Distribution Info */}
              <div style={s.sectionTitle}>🏭 Distribution Details (Post-Dojo)</div>
              <div style={s.grid}>
                <div style={s.item}>
                  <div style={s.itemLabel}>Distributed Department</div>
                  <div style={s.itemValue}>{fmt(detail.distributed_department_after_dojo?.department_name)}</div>
                </div>
                <div style={s.item}>
                  <div style={s.itemLabel}>Distributed Line</div>
                  <div style={s.itemValue}>{fmt(detail.distributed_line_after_dojo?.line_name)}</div>
                </div>
                <div style={{ ...s.item, gridColumn: "1 / -1" }}>
                  <div style={s.itemLabel}>Distributed Station</div>
                  <div style={s.itemValue}>{fmt(detail.distributed_station_after_dojo?.station_name)}</div>
                </div>
              </div>

              {/* Signatories */}
              <div style={s.sectionTitle}>✍️ Signatories & Confirmation</div>
              <div style={s.grid}>
                <div style={s.item}>
                  <div style={s.itemLabel}>Contractor Name</div>
                  <div style={s.itemValue}>{fmt(detail.contractor_name)}</div>
                </div>
                <div style={s.item}>
                  <div style={s.itemLabel}>P & A Name</div>
                  <div style={s.itemValue}>{fmt(detail.p_and_a_name)}</div>
                </div>
                <div style={s.item}>
                  <div style={s.itemLabel}>QA HOD Name</div>
                  <div style={s.itemValue}>{fmt(detail.qa_hod_name)}</div>
                </div>
                <div style={s.item}>
                  <div style={s.itemLabel}>Dojo Incharge Name</div>
                  <div style={s.itemValue}>{fmt(detail.gojo_incharge_name)}</div>
                </div>
                <div style={{ ...s.item, gridColumn: "1 / -1" }}>
                  <div style={s.itemLabel}>Training Completed</div>
                  <div style={{ marginTop: "4px" }}>
                    {detail.is_training_completed
                      ? <span style={s.trainingYes}>✅ Yes — Training Completed</span>
                      : <span style={s.trainingNo}>❌ No — Training Not Completed</span>}
                  </div>
                </div>
              </div>

              <button style={s.editBtn} onClick={onEdit}>✏️ Edit This Handover</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
type TabType = "active" | "past";

const HandOverSheet: React.FC = () => {
  const [scores, setScores] = useState<ApiScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [handoverDoneEmpIds, setHandoverDoneEmpIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabType>("active");

  // Form modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState<ApiScoreData | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [formModalError, setFormModalError] = useState<string | null>(null);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<EmployeeMasterData | null>(null);
  const [initialFormData, setInitialFormData] = useState<HandoverFormData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Detail view modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalData, setDetailModalData] = useState<HandoverDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailModalError, setDetailModalError] = useState<string | null>(null);
  const [detailScore, setDetailScore] = useState<ApiScoreData | null>(null);

  // ── Fetch initial data ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [scoresRes, deptsRes] = await Promise.all([
          fetch("http://192.168.2.51:8000/scores/passed/level-1/"),
          fetch("http://192.168.2.51:8000/departments/"),
        ]);
        if (!scoresRes.ok) throw new Error(`Scores API failed: ${scoresRes.status}`);
        if (!deptsRes.ok) throw new Error(`Departments API failed: ${deptsRes.status}`);

        const scoresData: ApiScoreData[] = await scoresRes.json();
        const deptsData: { department_name: string }[] = await deptsRes.json();

        setScores(scoresData);
        setDepartments(deptsData.map((d) => d.department_name));

        const empIds = scoresData
          .map((s) => s.employee_details.split("(").pop()?.replace(")", "") || "")
          .filter(Boolean);

        const checks = await Promise.all(
          empIds.map(async (empId) => {
            const res = await fetch(`http://192.168.2.51:8000/handovers/employee/${empId}/`);
            return { empId, exists: res.ok };
          })
        );
        setHandoverDoneEmpIds(new Set(checks.filter((c) => c.exists).map((c) => c.empId)));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getEmpId = (employeeDetails: string) =>
    employeeDetails.split("(").pop()?.replace(")", "") || "";

  const uniqueMonths = useMemo(() => {
    const months = new Set<string>();
    scores.forEach((s) => months.add(s.created_at.substring(0, 7)));
    return Array.from(months).sort().reverse();
  }, [scores]);

  useEffect(() => {
    if (uniqueMonths.length > 0 && !selectedMonth) setSelectedMonth(uniqueMonths[0]);
  }, [uniqueMonths, selectedMonth]);

  const filteredEmployees = useMemo(() => {
    let list = [...scores];
    if (selectedMonth && selectedMonth !== "all")
      list = list.filter((e) => e.created_at.startsWith(selectedMonth));
    if (searchTerm.trim())
      list = list.filter(
        (e) =>
          e.employee_details.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(e.id).includes(searchTerm)
      );
    return list.sort((a, b) => b.percentage - a.percentage);
  }, [scores, selectedMonth, searchTerm]);

  const activeEmployees = useMemo(
    () => filteredEmployees.filter((e) => !handoverDoneEmpIds.has(getEmpId(e.employee_details))),
    [filteredEmployees, handoverDoneEmpIds]
  );
  const pastEmployees = useMemo(
    () => filteredEmployees.filter((e) => handoverDoneEmpIds.has(getEmpId(e.employee_details))),
    [filteredEmployees, handoverDoneEmpIds]
  );

  // ── Open FORM modal (create or edit) ──
  const handleOpenFormModal = async (score: ApiScoreData) => {
    setIsFormModalOpen(true);
    setSelectedScore(score);
    setIsFormLoading(true);
    setFormModalError(null);
    setSelectedEmployeeDetails(null);
    setInitialFormData(null);
    setIsEditMode(false);

    try {
      const empId = getEmpId(score.employee_details);
      if (!empId) throw new Error(`Could not parse Employee ID from: "${score.employee_details}"`);

      const empRes = await fetch(`http://192.168.2.51:8000/mastertable/${empId}/`);
      if (!empRes.ok) throw new Error(empRes.status === 404 ? `Employee '${empId}' not found.` : `Error ${empRes.status}`);
      const data: EmployeeMasterData = await empRes.json();
      setSelectedEmployeeDetails(data);

      const handRes = await fetch(`http://192.168.2.51:8000/handovers/employee/${empId}/`);
      if (handRes.ok) {
        const handData = await handRes.json();
        setIsEditMode(true);
        setInitialFormData({
          name: `${data.first_name} ${data.last_name}`,
          industrialExperience: handData.industrial_experience || "",
          kpaplExperience: handData.kpapl_experience || "",
          currentDepartment: handData.required_department_at_handover || data.department_name || "",
          distributedDepartment: handData.distributed_department_after_dojo?.department_name || "",
          distributedLine: handData.distributed_line_after_dojo?.line_name || "",
          distributedStation: handData.distributed_station_after_dojo?.station_name || "",
          handoverDate: handData.handover_date || new Date().toISOString().split("T")[0],
          contractorName: handData.contractor_name || "",
          pAndAName: handData.p_and_a_name || "",
          qaHodName: handData.qa_hod_name || "",
          isTrainingCompleted: handData.is_training_completed ? "yes" : "no",
          gojoInchargeName: handData.gojo_incharge_name || "",
        });
      } else {
        setInitialFormData({
          name: `${data.first_name} ${data.last_name}`,
          industrialExperience: "", kpaplExperience: "",
          currentDepartment: data.department_name || "",
          distributedDepartment: "", distributedLine: "", distributedStation: "",
          handoverDate: new Date().toISOString().split("T")[0],
          contractorName: "", pAndAName: "", qaHodName: "",
          isTrainingCompleted: "", gojoInchargeName: "",
        });
      }
    } catch (err) {
      setFormModalError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsFormLoading(false);
    }
  };

  // ── Open DETAIL VIEW modal ──
  const handleOpenDetailModal = async (score: ApiScoreData) => {
    setDetailScore(score);
    setIsDetailModalOpen(true);
    setIsDetailLoading(true);
    setDetailModalError(null);
    setDetailModalData(null);

    try {
      const empId = getEmpId(score.employee_details);
      const res = await fetch(`http://192.168.2.51:8000/handovers/employee/${empId}/`);
      if (!res.ok) throw new Error(`Failed to load handover details (Status: ${res.status})`);
      const data: HandoverDetail = await res.json();
      setDetailModalData(data);
    } catch (err) {
      setDetailModalError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedScore(null);
    setSelectedEmployeeDetails(null);
    setFormModalError(null);
    setInitialFormData(null);
    setIsEditMode(false);
  };

  const handleFormSubmit = async (formData: HandoverFormData) => {
    if (!selectedEmployeeDetails) { alert("Employee details not loaded."); return; }
    const payload = {
      emp_id: selectedEmployeeDetails.emp_id,
      industrial_experience: formData.industrialExperience,
      kpapl_experience: formData.kpaplExperience,
      required_department_at_handover: formData.currentDepartment,
      distributed_department_name: formData.distributedDepartment,
      distributed_line_name: formData.distributedLine || "",
      distributed_station_name: formData.distributedStation || "",
      handover_date: formData.handoverDate,
      contractor_name: formData.contractorName,
      p_and_a_name: formData.pAndAName,
      qa_hod_name: formData.qaHodName,
      is_training_completed: formData.isTrainingCompleted,
      gojo_incharge_name: formData.gojoInchargeName,
    };
    try {
      const res = await fetch("http://192.168.2.51:8000/handovers/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(Object.values(errData).flat().join(" ") || `Error ${res.status}`);
      }
      setHandoverDoneEmpIds((prev) => new Set([...prev, selectedEmployeeDetails.emp_id]));
      alert(isEditMode ? "Handover updated!" : "Handover submitted!");
      handleCloseFormModal();
      // If we came from the detail modal's "edit", close detail too
      setIsDetailModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? `Error: ${err.message}` : "Unknown error");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const formatMonth = (m: string) => {
    const [y, mo] = m.split("-");
    return new Date(Number(y), Number(mo) - 1).toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  // ── Styles ──
  const pg: { [key: string]: React.CSSProperties } = {
    container: { minHeight: "100vh", backgroundColor: "#f8fafc", padding: "40px 20px" },
    header: { textAlign: "center", marginBottom: "40px" },
    title: { fontSize: "30px", fontWeight: "800", background: "linear-gradient(135deg,#7c3aed,#2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "8px" },
    subtitle: { fontSize: "16px", color: "#6b7280" },
    controls: { maxWidth: "1000px", margin: "0 auto 28px", display: "flex", gap: "16px" },
    searchInput: { flex: 1, padding: "11px 15px", fontSize: "14px", border: "1.5px solid #e5e7eb", borderRadius: "11px", outline: "none", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
    monthSelect: { padding: "11px 15px", fontSize: "14px", border: "1.5px solid #e5e7eb", borderRadius: "11px", backgroundColor: "white", cursor: "pointer", outline: "none", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },

    // Tab strip
    tabStrip: { maxWidth: "1000px", margin: "0 auto 24px", display: "flex", gap: "0", backgroundColor: "#fff", borderRadius: "14px", padding: "5px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1.5px solid #f3f4f6" },
    tabActive: { flex: 1, padding: "10px 20px", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s", background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "#fff", boxShadow: "0 3px 10px rgba(124,58,237,0.25)" },
    tabPast: { flex: 1, padding: "10px 20px", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", boxShadow: "0 3px 10px rgba(34,197,94,0.25)" },
    tabInactive: { flex: 1, padding: "10px 20px", fontSize: "14px", fontWeight: "600", border: "none", borderRadius: "10px", cursor: "pointer", background: "transparent", color: "#9ca3af" },

    // Count badge in tab
    countPill: { display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: "8px", width: "22px", height: "22px", borderRadius: "50%", fontSize: "12px", fontWeight: "800", backgroundColor: "rgba(255,255,255,0.3)", color: "#fff" },
    countPillInactive: { display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: "8px", width: "22px", height: "22px", borderRadius: "50%", fontSize: "12px", fontWeight: "800", backgroundColor: "#f3f4f6", color: "#9ca3af" },

    wrap: { maxWidth: "1000px", margin: "0 auto" },
    noResults: { textAlign: "center", padding: "50px", backgroundColor: "#fff", borderRadius: "16px", color: "#6b7280", fontSize: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
    
    // Card — 3-col grid: rank | info | button(fixed)
    card: { backgroundColor: "#fff", borderRadius: "14px", padding: "20px 22px", marginBottom: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1.5px solid #f3f4f6", display: "grid", gridTemplateColumns: "50px 1fr 148px", alignItems: "center", gap: "18px", transition: "all 0.25s ease" },
    cardHover: { boxShadow: "0 8px 28px rgba(124,58,237,0.1)", borderColor: "#e0e7ff", transform: "translateY(-2px)" },
    cardPast: { borderLeft: "4px solid #22c55e", backgroundColor: "#f0fdf4" },
    cardPastHover: { boxShadow: "0 8px 28px rgba(34,197,94,0.12)", borderColor: "#86efac", transform: "translateY(-2px)" },

    rank: { width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: "700", boxShadow: "0 3px 10px rgba(124,58,237,0.3)" },
    rankPast: { background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 3px 10px rgba(34,197,94,0.3)" },

    info: { overflow: "hidden" },
    name: { fontSize: "16px", fontWeight: "700", color: "#1f2937", marginBottom: "5px", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" },
    meta: { display: "flex", gap: "8px", color: "#6b7280", fontSize: "13px", flexWrap: "wrap" as const, alignItems: "center", marginBottom: "10px" },
    badge: { display: "inline-block", padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", backgroundColor: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb" },
    passedPill: { display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", backgroundColor: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
    bar: { width: "100%", height: "7px", backgroundColor: "#f3f4f6", borderRadius: "10px", overflow: "hidden", marginBottom: "5px" },
    barFill: { height: "100%", background: "linear-gradient(90deg,#7c3aed,#2563eb)", borderRadius: "10px" },
    barFillPast: { background: "linear-gradient(90deg,#22c55e,#16a34a)" },
    scoreText: { display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#6b7280" },

    // Button column — fixed 148px, all buttons fill full width
    btnCol: { display: "flex", flexDirection: "column" as const, alignItems: "stretch", gap: "7px", width: "148px" },
    createBtn: { padding: "10px", fontSize: "13px", fontWeight: "700", color: "#fff", background: "linear-gradient(135deg,#7c3aed,#2563eb)", border: "none", borderRadius: "9px", cursor: "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.25)", textAlign: "center" as const },
    viewBtn: { padding: "10px", fontSize: "13px", fontWeight: "700", color: "#fff", background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", borderRadius: "9px", cursor: "pointer", boxShadow: "0 3px 10px rgba(34,197,94,0.25)", textAlign: "center" as const },
    editSmallBtn: { padding: "8px", fontSize: "12px", fontWeight: "600", color: "#fff", background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: "8px", cursor: "pointer", boxShadow: "0 2px 7px rgba(245,158,11,0.3)", textAlign: "center" as const },
  };

  if (loading) return <div style={{ ...pg.container, textAlign: "center", paddingTop: "100px", fontSize: "20px" }}>⏳ Loading...</div>;
  if (error) return <div style={{ ...pg.container, textAlign: "center", paddingTop: "100px", fontSize: "18px", color: "red" }}>⚠️ {error}</div>;

  const displayList = activeTab === "active" ? activeEmployees : pastEmployees;

  return (
    <div style={pg.container}>
      {/* Header */}
      <div style={pg.header}>
        <h1 style={pg.title}>Level 1 Passed Users</h1>
        <p style={pg.subtitle}>Dojo Handover Management</p>
      </div>

      {/* Search + Month */}
      <div style={pg.controls}>
        <input
          type="text"
          placeholder="Search by Employee ID or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={pg.searchInput}
        />
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={pg.monthSelect}>
          <option value="all">All Months</option>
          {uniqueMonths.map((m) => <option key={m} value={m}>{formatMonth(m)}</option>)}
        </select>
      </div>

      {/* Tab Strip */}
      <div style={pg.tabStrip}>
        {/* Active Tab */}
        <button
          style={activeTab === "active" ? pg.tabActive : pg.tabInactive}
          onClick={() => setActiveTab("active")}
        >
          🔄 Active — Needs Handover
          <span style={activeTab === "active" ? pg.countPill : pg.countPillInactive}>
            {activeEmployees.length}
          </span>
        </button>
        {/* Past Tab */}
        <button
          style={activeTab === "past" ? pg.tabPast : pg.tabInactive}
          onClick={() => setActiveTab("past")}
        >
          ✅ Past — Handover Done
          <span style={activeTab === "past" ? pg.countPill : pg.countPillInactive}>
            {pastEmployees.length}
          </span>
        </button>
      </div>

      {/* Card List */}
      <div style={pg.wrap}>
        {displayList.length === 0 ? (
          <div style={pg.noResults}>
            {activeTab === "active"
              ? "🎉 All employees have completed their handover!"
              : "No completed handovers found."}
          </div>
        ) : (
          displayList.map((score, index) => {
            const isPast = activeTab === "past";
            const isHovered = hoveredCard === score.id;
            return (
              <div
                key={score.id}
                style={{
                  ...pg.card,
                  ...(isPast ? pg.cardPast : {}),
                  ...(isHovered ? (isPast ? pg.cardPastHover : pg.cardHover) : {}),
                }}
                onMouseEnter={() => setHoveredCard(score.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Rank */}
                <div style={{ ...pg.rank, ...(isPast ? pg.rankPast : {}) }}>{index + 1}</div>

                {/* Info */}
                <div style={pg.info}>
                  <div style={pg.name}>{score.employee_details}</div>
                  <div style={pg.meta}>
                    <span style={pg.badge}>{score.skill_name}</span>
                    <span>•</span>
                    <span>{formatDate(score.created_at)}</span>
                    <span>•</span>
                    <span style={pg.passedPill}>✓ Passed</span>
                  </div>
                  <div style={pg.bar}>
                    <div style={{ ...pg.barFill, ...(isPast ? pg.barFillPast : {}), width: `${score.percentage}%` }} />
                  </div>
                  <div style={pg.scoreText}>
                    <span style={{ fontWeight: "600", color: "#374151" }}>Score: {score.percentage.toFixed(1)}%</span>
                    <span>Min: 80%</span>
                  </div>
                </div>

                {/* Button column — FIXED width, never shifts */}
                <div style={pg.btnCol}>
                  {isPast ? (
                    <>
                      <button style={pg.viewBtn} onClick={() => handleOpenDetailModal(score)}>
                        👁 View Details
                      </button>
                      <button style={pg.editSmallBtn} onClick={() => handleOpenFormModal(score)}>
                        ✏️ Edit Handover
                      </button>
                    </>
                  ) : (
                    <button style={pg.createBtn} onClick={() => handleOpenFormModal(score)}>
                      + Create Handover
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {isFormModalOpen && selectedScore && (
        <HandOverFormModal
          scoreData={selectedScore}
          departments={departments}
          onClose={handleCloseFormModal}
          onSubmit={handleFormSubmit}
          isLoading={isFormLoading}
          error={formModalError}
          employeeDetails={selectedEmployeeDetails}
          initialFormData={initialFormData}
          isEditMode={isEditMode}
        />
      )}

      {/* Detail View Modal */}
      {isDetailModalOpen && (
        <HandoverDetailModal
          detail={detailModalData}
          isLoading={isDetailLoading}
          error={detailModalError}
          onClose={() => { setIsDetailModalOpen(false); setDetailModalData(null); }}
          onEdit={() => {
            setIsDetailModalOpen(false);
            if (detailScore) handleOpenFormModal(detailScore);
          }}
        />
      )}
    </div>
  );
};

export default HandOverSheet;