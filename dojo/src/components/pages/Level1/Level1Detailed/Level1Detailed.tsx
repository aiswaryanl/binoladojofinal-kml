// import { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { ArrowLeft, Home, User, Upload, Grid, List, FileText, Link, Trash2, Eye, Download, BookOpen, Clock, Users, Image, Video, File, FileQuestion, Presentation } from 'lucide-react';

// const API_BASE = "http://192.168.2.51:8000";

// // Define the interfaces from your old code
// interface TabData {
//   id: string;
//   title: string;
//   content: string;
// }

// interface TrainingContent {
//   id: number; // alias of trainingcontent_id from API
//   description: string;
//   training_file?: string | null; // absolute URL from API if present
//   url_link?: string | null;
//   subtopiccontent: number;
// }

// interface SubtopicContent {
//   subtopiccontent_id: number;
//   subtopic: number;
//   content: string;
// }

// export default function Level1Detailed() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState<string>("tab1");
//   const [trainingContents, setTrainingContents] = useState<TrainingContent[]>([]);
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [uploadType, setUploadType] = useState<"file" | "link">("file");
//   const [newMaterial, setNewMaterial] = useState<{ description: string; file: File | null; url: string }>({
//     description: "",
//     file: null,
//     url: "",
//   });
//   const [subtopicContents, setSubtopicContents] = useState<SubtopicContent[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [uploadLoading, setUploadLoading] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [viewType, setViewType] = useState<"grid" | "list">("grid");
//   const subtopicId = id ? parseInt(id, 10) : 1;

//   // Fetch Subtopic Contents (from old code)
//   useEffect(() => {
//     const fetchSubtopicContents = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch(`${API_BASE}/subtopic-contents/?subtopic=${subtopicId}`);
//         if (!res.ok) throw new Error("Network response was not ok");
//         const data: SubtopicContent[] = await res.json();
//         if (!data.length) {
//           navigate("/lesson-details/1", { replace: true });
//           return;
//         }
//         setSubtopicContents(data);
//         setLoading(false);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load lesson contents");
//         setLoading(false);
//       }
//     };
//     fetchSubtopicContents();
//   }, [subtopicId, navigate]);

//   // Fetch Training Contents based on active tab (from old code)
//   useEffect(() => {
//     const fetchTrainingContents = async () => {
//       if (subtopicContents.length === 0) return;
//       const activeTabIndex = parseInt(activeTab.replace("tab", ""), 10) - 1;
//       const current = subtopicContents[activeTabIndex];
//       if (!current) return;

//       try {
//         const response = await fetch(
//           `${API_BASE}/training-contents/?subtopiccontent=${current.subtopiccontent_id}`
//         );
//         if (!response.ok) throw new Error("Failed to fetch training contents");
//         const data: TrainingContent[] = await response.json();
//         setTrainingContents(data);
//       } catch (error) {
//         console.error("Error fetching training contents:", error);
//         setTrainingContents([]);
//       }
//     };
//     fetchTrainingContents();
//   }, [activeTab, subtopicContents]);

//   const detailTabs: TabData[] = subtopicContents.map((c, i) => ({
//     id: `tab${i + 1}`,
//     title: c.content.length > 30 ? c.content.slice(0, 30) + "…" : c.content,
//     content: c.content,
//   }));

//   const activeTabData = detailTabs.find((tab) => tab.id === activeTab) || detailTabs[0];
//   const isMCQTab = activeTabData?.title?.toUpperCase() === "MCQ";

//   const onTabClick = (tabId: string) => setActiveTab(tabId);

//   // Upload Logic (from old code)
//   const handleUploadSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const activeTabIndex = parseInt(activeTab.replace("tab", ""), 10) - 1;
//     const current = subtopicContents[activeTabIndex];
//     if (!current) {
//       alert("No subtopic content selected");
//       return;
//     }

//     if (!newMaterial.description) {
//       alert("Please add a description");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("description", newMaterial.description);
//     formData.append("subtopiccontent", String(current.subtopiccontent_id));
//     if (uploadType === "file") {
//       if (!newMaterial.file) {
//         alert("Please select a file");
//         return;
//       }
//       formData.append("training_file", newMaterial.file);
//     } else {
//       if (!newMaterial.url) {
//         alert("Please provide a URL");
//         return;
//       }
//       formData.append("url_link", newMaterial.url);
//     }

//     try {
//       setUploadLoading(true);
//       const res = await fetch(`${API_BASE}/training-contents/`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) {
//         const err = await res.text();
//         console.error(err);
//         alert("Failed to upload material");
//         return;
//       }

//       const created: TrainingContent = await res.json();
//       setTrainingContents((prev) => [...prev, created]);
//       setNewMaterial({ description: "", file: null, url: "" });
//       setShowUploadModal(false);
//       alert("Material uploaded successfully!");
//     } catch (err) {
//       console.error(err);
//       alert("An error occurred while uploading.");
//     } finally {
//       setUploadLoading(false);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setNewMaterial({ ...newMaterial, file: e.target.files[0] });
//     }
//   };

//   const triggerFileInput = () => fileInputRef.current?.click();

//   const handleMaterialClick = (content: TrainingContent) => {
//     if (content.url_link) {
//       window.open(content.url_link, "_blank", "noopener,noreferrer");
//     } else if (content.training_file) {
//       window.open(content.training_file, "_blank", "noopener,noreferrer");
//     } else {
//       alert("No file or URL associated with this material.");
//     }
//   };

//   const getFileTypeFromUrl = (url: string): string => {
//     const ext = url.split(".").pop()?.toLowerCase() || "";
//     if (ext === "pdf") return "PDF";
//     if (["mp4", "mov", "avi", "mkv"].includes(ext)) return "Video";
//     if (["ppt", "pptx"].includes(ext)) return "Presentation";
//     if (["doc", "docx"].includes(ext)) return "Document";
//     if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "Image";
//     return "File";
//   };

//   // Custom file icon function using Lucide React icons
//   const getFileIcon = (content: TrainingContent) => {
//     if (content.url_link) {
//       return <Link className="w-6 h-6 text-blue-500" />;
//     }
//     if (content.training_file) {
//       const ext = content.training_file.split(".").pop()?.toLowerCase();
//       if (ext === "pdf") return <FileText className="w-6 h-6 text-red-500" />;
//       if (["mp4", "mov", "avi", "mkv"].includes(ext || "")) {
//         return <Video className="w-6 h-6 text-purple-500" />;
//       }
//       if (["ppt", "pptx"].includes(ext || "")) {
//         return <Presentation className="w-6 h-6 text-orange-500" />;
//       }
//       if (["doc", "docx"].includes(ext || "")) {
//         return <FileText className="w-6 h-6 text-blue-500" />;
//       }
//       // This is the line that caused the error.
//       if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext || "")) {
//         return <Image className="w-6 h-6 text-green-500" />; // Corrected to use the imported Image component
//       }
//     }
//     return <FileText className="w-6 h-6 text-gray-500" />;
//   };


//   // Delete Logic (from old code, using axios)
//   const handleDeleteContent = async (contentId: number) => {
//     if (!window.confirm("Are you sure you want to delete this material?")) return;
//     try {
//       const response = await axios.delete(`${API_BASE}/training-contents/${contentId}/`);
//       if (response.status === 204) {
//         setTrainingContents((prev) => prev.filter((c) => c.id !== contentId));
//         alert("Material deleted successfully");
//       } else {
//         alert("Failed to delete material");
//       }
//     } catch (error) {
//       console.error("Error deleting material:", error);
//       alert("An error occurred while deleting the material");
//     }
//   };

//   // Render Functions
//   const renderGridView = () => (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {trainingContents.map((content) => (
//         <div
//           key={content.id}
//           className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300"
//           onClick={() => handleMaterialClick(content)}
//         >
//           <div className="flex items-start justify-between mb-4">
//             <div className="flex items-center flex-1">
//               <div className="p-3 bg-gray-50 rounded-lg mr-4 group-hover:bg-blue-50 transition-colors">
//                 {getFileIcon(content)}
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
//                   {content.description}
//                 </h3>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {content.training_file ? `File: ${getFileTypeFromUrl(content.training_file)}` : "Web Link"}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleDeleteContent(content.id);
//               }}
//               className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all text-red-500 hover:text-red-700"
//               title="Delete this material"
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           </div>
//           <div className="flex items-center justify-between">
//             <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
//               {content.training_file ? getFileTypeFromUrl(content.training_file) : "Link"}
//             </span>
//             <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   const renderListView = () => (
//     <div className="space-y-3">
//       {trainingContents.map((content) => (
//         <div
//           key={content.id}
//           className="group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
//         >
//           <div className="flex items-center justify-between">
//             <div className="flex items-center flex-1 min-w-0" onClick={() => handleMaterialClick(content)}>
//               <div className="p-2 bg-gray-50 rounded-lg mr-4 group-hover:bg-blue-50 transition-colors">
//                 {getFileIcon(content)}
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
//                   {content.description}
//                 </h3>
//                 <div className="flex items-center space-x-2 mt-1">
//                   <span className="text-sm text-gray-500">
//                     {content.training_file ? `File: ${getFileTypeFromUrl(content.training_file)}` : "Web Link"}
//                   </span>
//                   {content.training_file && (
//                     <span className="text-sm text-gray-400 truncate" title={content.training_file}>
//                       {content.training_file.split("/").pop()}
//                     </span>
//                   )}
//                   {content.url_link && (
//                     <span className="text-sm text-gray-400 truncate" title={content.url_link}>
//                       {content.url_link.length > 40 ? content.url_link.substring(0, 40) + "..." : content.url_link}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={() => handleMaterialClick(content)}
//                 className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-500"
//                 title="View material"
//               >
//                 <Eye className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleDeleteContent(content.id);
//                 }}
//                 className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
//                 title="Delete this material"
//               >
//                 <Trash2 className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//         {/* <header className="bg-white shadow-lg border-b border-gray-200">
//           <div className="max-w-7xl mx-auto px-6 py-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <button
//                   onClick={() => navigate(-1)}
//                   className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
//                 >
//                   <ArrowLeft className="w-5 h-5 text-gray-600" />
//                 </button>
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
//                     <span className="text-white font-bold text-sm">NL</span>
//                   </div>
//                   <div>
//                     <h1 className="text-lg font-semibold text-gray-900">NL Technologies Pvt.Ltd Pvt Ltd</h1>
//                     <p className="text-xs text-gray-500">Training Management System</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="text-center">
//                 <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                   Dojo 2.0
//                 </h2>
//                 <p className="text-xs text-gray-500">Professional Training Platform</p>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
//                   <Home className="w-5 h-5 text-gray-600" />
//                 </button>
//                 <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
//                   <User className="w-5 h-5 text-white" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header> */}
//         <div className="flex h-[calc(100vh-80px)]">
//           <div className="w-80 bg-white shadow-lg border-r border-gray-200"></div>
//           <div className="flex-1 flex items-center justify-center">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Lesson Content</h3>
//               <p className="text-gray-500">Preparing your training materials...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//         {/* <header className="bg-white shadow-lg border-b border-gray-200">
//           <div className="max-w-7xl mx-auto px-6 py-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <button
//                   onClick={() => navigate(-1)}
//                   className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
//                 >
//                   <ArrowLeft className="w-5 h-5 text-gray-600" />
//                 </button>
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
//                     <span className="text-white font-bold text-sm">NL</span>
//                   </div>
//                   <div>
//                     <h1 className="text-lg font-semibold text-gray-900">NL Technologies Pvt.Ltd Pvt Ltd</h1>
//                     <p className="text-xs text-gray-500">Training Management System</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="text-center">
//                 <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                   Dojo 2.0
//                 </h2>
//                 <p className="text-xs text-gray-500">Professional Training Platform</p>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
//                   <Home className="w-5 h-5 text-gray-600" />
//                 </button>
//                 <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
//                   <User className="w-5 h-5 text-white" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header> */}
//         <div className="flex h-[calc(100vh-80px)] items-center justify-center">
//           <div className="text-center">
//             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <span className="text-2xl">⚠️</span>
//             </div>
//             <h3 className="text-xl font-semibold text-red-600 mb-2">Unable to Load Content</h3>
//             <p className="text-gray-600 mb-6">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//             >
//               Retry Loading
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//       {/* Professional Header */}
//       {/* <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 w-full">
//         <div className="w-full px-6 py-4">
//           <div className="flex items-center justify-between w-full">
//             <div className="flex items-center space-x-4 flex-1">
//               <button
//                 onClick={() => navigate(-1)}
//                 className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5 text-gray-600" />
//               </button>
//               <div className="flex items-center space-x-3">
//                 <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
//                   <span className="text-white font-bold text-sm">NL</span>
//                 </div>
//                 <div>
//                   <h1 className="text-lg font-semibold text-gray-900">NL Technologies Pvt.Ltd Pvt Ltd</h1>
//                   <p className="text-xs text-gray-500">Training Management System</p>
//                 </div>
//               </div>
//             </div>
//             <div className="flex-1 text-center">
//               <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                 Dojo 2.0
//               </h2>
//               <p className="text-xs text-gray-500">Professional Training Platform</p>
//             </div>
//             <div className="flex items-center space-x-3 flex-1 justify-end">
//               <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
//                 <Home className="w-5 h-5 text-gray-600" />
//               </button>
//               <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
//                 <User className="w-5 h-5 text-white" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </header> */}

//       {/* Content Layout */}
//       <div className="flex h-[calc(100vh-80px)] w-full">
//         {/* Left Sidebar */}
//         <div className="w-80 bg-white shadow-lg border-r border-gray-200">
//           <div className="p-6 border-b border-gray-200">
//             <div className="flex items-center space-x-3 mb-2">
//               <BookOpen className="w-6 h-6 text-blue-600" />
//               <h2 className="text-xl font-bold text-gray-900">Lesson Contents</h2>
//             </div>
//             {/* <p className="text-sm text-gray-500">Navigate through training modules</p> */}
//           </div>
//           <nav className="p-6">
//             <div className="space-y-3">
//               {detailTabs.map((tab, index) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => onTabClick(tab.id)}
//                   className={`w-full p-4 text-left rounded-xl transition-all duration-200 flex items-center group ${
//                     activeTab === tab.id
//                       ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
//                       : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
//                   }`}
//                 >
//                   <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 text-sm font-bold ${
//                     activeTab === tab.id
//                       ? "bg-white/20 text-white"
//                       : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
//                   }`}>
//                     {index + 1}
//                   </div>
//                   <div className="flex-1">
//                     <span className="font-semibold text-sm block">{tab.title}</span>
//                     <span className={`text-xs ${
//                       activeTab === tab.id ? "text-blue-100" : "text-gray-500"
//                     }`}>
//                       Module {index + 1}
//                     </span>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </nav>
//         </div>

//         {/* Right Content Area */}
//         <div className="flex-1 overflow-auto bg-gray-50 w-full">
//           <div className="p-8">
//             {/* Content Header */}
//             <div className="mb-8">
//               <div className="flex justify-between items-start mb-6">
//                 <div>
//                   <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                     {activeTabData?.title || "Loading..."}
//                   </h1>
//                   <div className="flex items-center space-x-4 text-sm text-gray-500">
//                     <div className="flex items-center space-x-1">
//                       <Clock className="w-4 h-4" />
//                       <span>Section {activeTab?.replace("tab", "")} of {detailTabs.length}</span>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <Users className="w-4 h-4" />
//                       <span>Level 1 Training</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
//                   Training Materials
//                 </div>
//               </div>

//               {/* Content Description */}
//               {!isMCQTab && (
//                 <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
//                   <p className="text-gray-700 leading-relaxed text-lg">
//                     {activeTabData?.content || "Content not available"}
//                   </p>
//                 </div>
//               )}
//             </div>

//             {isMCQTab ? (
//               <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
//                 <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <span className="text-4xl">📝</span>
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-900 mb-4">MCQ Assessment</h3>
//                 <p className="text-gray-600 text-lg mb-8">
//                   Multiple choice questions will be displayed here for assessment.
//                 </p>
//                 <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
//                   Start Assessment
//                 </button>
//               </div>
//             ) : (
//               <div>
//                 {/* Training Materials Header */}
//                 <div className="flex justify-between items-center mb-6">
//                   <div>
//                     <h2 className="text-2xl font-bold text-gray-900">Training Materials</h2>
//                     <p className="text-gray-600 mt-1">Resources and documents for this module</p>
//                   </div>
//                   <div className="flex items-center space-x-4">
//                     <button
//                       onClick={() => setShowUploadModal(true)}
//                       className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
//                     >
//                       <Upload className="w-4 h-4" />
//                       <span>Upload Material</span>
//                     </button>
//                     <div className="flex bg-white rounded-lg border border-gray-200 p-1">
//                       <button
//                         onClick={() => setViewType("grid")}
//                         className={`p-2 rounded-md transition-colors ${
//                           viewType === "grid"
//                             ? "bg-blue-600 text-white"
//                             : "text-gray-600 hover:text-blue-600"
//                         }`}
//                         title="Grid view"
//                       >
//                         <Grid className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={() => setViewType("list")}
//                         className={`p-2 rounded-md transition-colors ${
//                           viewType === "list"
//                             ? "bg-blue-600 text-white"
//                             : "text-gray-600 hover:text-blue-600"
//                         }`}
//                         title="List view"
//                       >
//                         <List className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Training Materials Content */}
//                 {trainingContents.length > 0 ? (
//                   <>
//                     {viewType === "grid" && renderGridView()}
//                     {viewType === "list" && renderListView()}
//                   </>
//                 ) : (
//                   <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-16 text-center">
//                     <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                       <span className="text-4xl">📚</span>
//                     </div>
//                     <h3 className="text-xl font-bold text-gray-900 mb-2">No Materials Yet</h3>
//                     <p className="text-gray-600 mb-8 text-lg">
//                       Upload your first training material to get started with this module.
//                     </p>
//                     <button
//                       onClick={() => setShowUploadModal(true)}
//                       className="inline-flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
//                     >
//                       <Upload className="w-4 h-4" />
//                       <span>Upload Material</span>
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Upload Modal */}
//       {showUploadModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-2xl font-bold text-gray-900">Upload New Material</h2>
//               <p className="text-gray-600 mt-1">Add a new training resource to this lesson</p>
//             </div>
//             <form onSubmit={handleUploadSubmit} className="p-6">
//               <div className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-900 mb-2">
//                     Material Description *
//                   </label>
//                   <input
//                     type="text"
//                     value={newMaterial.description}
//                     onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Enter a clear description of the material"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-900 mb-3">
//                     Upload Type *
//                   </label>
//                   <div className="grid grid-cols-2 gap-3">
//                     <button
//                       type="button"
//                       onClick={() => setUploadType("file")}
//                       className={`p-4 rounded-xl border-2 transition-all ${
//                         uploadType === "file"
//                           ? "border-blue-600 bg-blue-50 text-blue-900"
//                           : "border-gray-200 hover:border-gray-300"
//                       }`}
//                     >
//                       <FileText className="w-6 h-6 mx-auto mb-2" />
//                       <div className="font-semibold">File Upload</div>
//                       <div className="text-xs text-gray-500">PDF, DOC, PPT, Video</div>
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setUploadType("link")}
//                       className={`p-4 rounded-xl border-2 transition-all ${
//                         uploadType === "link"
//                           ? "border-blue-600 bg-blue-50 text-blue-900"
//                           : "border-gray-200 hover:border-gray-300"
//                       }`}
//                     >
//                       <Link className="w-6 h-6 mx-auto mb-2" />
//                       <div className="font-semibold">Web Link</div>
//                       <div className="text-xs text-gray-500">External URL</div>
//                     </button>
//                   </div>
//                 </div>
//                 {uploadType === "file" ? (
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-900 mb-2">
//                       Select File *
//                     </label>
//                     <input
//                       type="file"
//                       ref={fileInputRef}
//                       onChange={handleFileChange}
//                       className="hidden"
//                       accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.mov,.avi,.mkv,.jpg,.jpeg,.png,.gif,.webp,.bmp"
//                     />
//                     <div
//                       onClick={triggerFileInput}
//                       className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer transition-colors"
//                     >
//                       <div className="text-center">
//                         <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                         <div className="font-medium text-gray-900">
//                           {newMaterial.file ? newMaterial.file.name : "Click to choose file"}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           Supports PDF, PPT, DOC, Videos, Images
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-900 mb-2">
//                       URL *
//                     </label>
//                     <input
//                       type="url"
//                       value={newMaterial.url}
//                       onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
//                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="https://example.com/resource"
//                     />
//                   </div>
//                 )}
//               </div>
//               <div className="mt-8 flex justify-end space-x-3">
//                 <button
//                   type="button"
//                   onClick={() => setShowUploadModal(false)}
//                   className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
//                   disabled={uploadLoading}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2"
//                   disabled={uploadLoading}
//                 >
//                   {uploadLoading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                       <span>Uploading...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Upload className="w-4 h-4" />
//                       <span>Upload Material</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, BookOpen, Clock, Users, Edit, FileQuestion, Grid, List, Trash2, Upload, Eye, FileText, Link, Presentation, Video, Image, Home, CheckCircle, XCircle } from 'lucide-react';

const API_BASE = "http://192.168.2.51:8000";

// --- INTERFACES ---
interface TabData { id: string; title: string; content: string; }
interface TrainingContent { id: number; description: string; training_file?: string | null; url_link?: string | null; subtopiccontent: number; }
interface SubtopicContent { subtopiccontent_id: number; subtopic: number; content: string; }
interface Option { id?: number; option_text: string; is_correct: boolean; }
interface Question { id: number; question_text: string; options: Option[]; }

export default function Level1Detailed() {
  const { id } = useParams();
  const navigate = useNavigate();
  // --- STATE DECLARATIONS ---
  const [activeTab, setActiveTab] = useState<string>("tab1");
  const [trainingContents, setTrainingContents] = useState<TrainingContent[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<"file" | "link">("file");
  const [newMaterial, setNewMaterial] = useState<{ description: string; file: File | null; url: string }>({ description: "", file: null, url: "" });
  const [subtopicContents, setSubtopicContents] = useState<SubtopicContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const subtopicId = id ? parseInt(id, 10) : 1;

  // MCQ STATE
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: number]: { selectedOptionId: number | undefined; isCorrect: boolean } }>({});
  const [showResults, setShowResults] = useState(false);

  // MODAL STATE
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionFormData, setQuestionFormData] = useState<{ question_text: string, options: Omit<Option, 'id'>[] }>({
    question_text: "",
    options: [{ option_text: "", is_correct: false }, { option_text: "", is_correct: false }],
  });

  // --- DERIVED STATE & CONSTANTS ---
  const detailTabs: TabData[] = subtopicContents.map((c, i) => ({ id: `tab${i + 1}`, title: c.content, content: c.content }));
  const activeTabData = detailTabs.find((tab) => tab.id === activeTab) || detailTabs[0];
  const isMCQTab = activeTabData?.title?.toUpperCase() === "MCQ";

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchSubtopicContents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/subtopic-contents/?subtopic=${subtopicId}`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data: SubtopicContent[] = await res.json();
        if (!data.length) { navigate("/lesson-details/1", { replace: true }); return; }
        setSubtopicContents(data);
        setLoading(false);
      } catch (err) { console.error(err); setError("Failed to load lesson contents"); setLoading(false); }
    };
    fetchSubtopicContents();
  }, [subtopicId, navigate]);

  useEffect(() => {
    const fetchTrainingContents = async () => {
      if (subtopicContents.length === 0 || isMCQTab) return;
      const activeTabIndex = parseInt(activeTab.replace("tab", ""), 10) - 1;
      const current = subtopicContents[activeTabIndex];
      if (!current) return;
      try {
        const response = await fetch(`${API_BASE}/training-contents/?subtopiccontent=${current.subtopiccontent_id}`);
        if (!response.ok) throw new Error("Failed to fetch training contents");
        const data: TrainingContent[] = await response.json();
        setTrainingContents(data);
      } catch (error) { console.error("Error fetching training contents:", error); setTrainingContents([]); }
    };
    fetchTrainingContents();
  }, [activeTab, subtopicContents, isMCQTab]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (isMCQTab) {
        const activeTabIndex = parseInt(activeTab.replace("tab", ""), 10) - 1;
        const current = subtopicContents[activeTabIndex];
        if (!current) return;
        try {
          const res = await fetch(`${API_BASE}/questions/?subtopiccontent=${current.subtopiccontent_id}`);
          if (!res.ok) throw new Error("Failed to fetch questions");
          const data: Question[] = await res.json();
          setQuestions(data);
        } catch (error) { console.error("Error fetching questions:", error); setQuestions([]); }
      }
    };
    if (subtopicContents.length > 0) fetchQuestions();
  }, [isMCQTab, activeTab, subtopicContents]);

  // --- EVENT HANDLERS ---
  const onTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setQuizMode(false);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeTabIndex = parseInt(activeTab.replace("tab", ""), 10) - 1;
    const current = subtopicContents[activeTabIndex];
    if (!current) { alert("No subtopic content selected"); return; }
    if (!newMaterial.description) { alert("Please add a description"); return; }
    const formData = new FormData();
    formData.append("description", newMaterial.description);
    formData.append("subtopiccontent", String(current.subtopiccontent_id));
    if (uploadType === "file") {
      if (!newMaterial.file) { alert("Please select a file"); return; }
      formData.append("training_file", newMaterial.file);
    } else {
      if (!newMaterial.url) { alert("Please provide a URL"); return; }
      formData.append("url_link", newMaterial.url);
    }
    try {
      setUploadLoading(true);
      const res = await fetch(`${API_BASE}/training-contents/`, { method: "POST", body: formData });
      if (!res.ok) { const err = await res.text(); console.error(err); alert("Failed to upload material"); return; }
      const created: TrainingContent = await res.json();
      setTrainingContents((prev) => [...prev, created]);
      setNewMaterial({ description: "", file: null, url: "" });
      setShowUploadModal(false);
      alert("Material uploaded successfully!");
    } catch (err) { console.error(err); alert("An error occurred while uploading."); } finally { setUploadLoading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length) setNewMaterial({ ...newMaterial, file: e.target.files[0] }); };
  const triggerFileInput = () => fileInputRef.current?.click();
  const handleMaterialClick = (content: TrainingContent) => { if (content.url_link) window.open(content.url_link, "_blank", "noopener,noreferrer"); else if (content.training_file) window.open(content.training_file, "_blank", "noopener,noreferrer"); };
  const handleDeleteContent = async (contentId: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_BASE}/training-contents/${contentId}/`);
      setTrainingContents(prev => prev.filter(c => c.id !== contentId));
      alert("Material deleted successfully");
    } catch (error) { alert("Failed to delete content"); }
  };

  // --- MCQ HANDLERS ---
  const handleStartAssessment = () => { setShowResults(false); setCurrentQuestionIndex(0); setSelectedAnswers({}); setQuizMode(true); };
  const handleAnswerSelect = (questionId: number, selectedOption: Option) => setSelectedAnswers(prev => ({ ...prev, [questionId]: { selectedOptionId: selectedOption.id, isCorrect: selectedOption.is_correct } }));
  const handleNextQuestion = () => { if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1); };
  const handleFinishAssessment = () => setShowResults(true);
  const handleReturnToManager = () => { setShowResults(false); setQuizMode(false); setCurrentQuestionIndex(0); setSelectedAnswers({}); };

  // --- QUESTION CRUD HANDLERS ---
  const handleOpenAddModal = () => { setEditingQuestion(null); setQuestionFormData({ question_text: "", options: [{ option_text: "", is_correct: false }, { option_text: "", is_correct: false }] }); setShowQuestionModal(true); };
  const handleOpenEditModal = (question: Question) => { setEditingQuestion(question); setQuestionFormData({ question_text: question.question_text, options: question.options.map(({ id, ...rest }) => rest) }); setShowQuestionModal(true); };
  const handleDeleteQuestion = async (questionId: number) => { if (!window.confirm("Are you sure?")) return; try { await axios.delete(`${API_BASE}/questions/${questionId}/`); setQuestions(prev => prev.filter(q => q.id !== questionId)); } catch (error) { alert("Failed to delete question."); } };
  const handleQuestionFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionFormData.question_text.trim() || questionFormData.options.some(opt => !opt.option_text.trim()) || !questionFormData.options.some(opt => opt.is_correct)) { alert("Please fill all fields and select a correct answer."); return; }
    const activeTabIndex = parseInt(activeTab.replace("tab", ""), 10) - 1;
    const currentSubtopicContent = subtopicContents[activeTabIndex];
    const payload = { ...questionFormData, subtopiccontent: currentSubtopicContent.subtopiccontent_id };
    if (editingQuestion) {
      try { const response = await axios.put(`${API_BASE}/questions/${editingQuestion.id}/`, payload); setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? response.data : q)); setShowQuestionModal(false); } catch (error) { alert("Failed to update question."); }
    } else {
      try { const response = await axios.post(`${API_BASE}/questions/`, payload); setQuestions(prev => [...prev, response.data]); setShowQuestionModal(false); } catch (error) { alert("Failed to add question."); }
    }
  };
  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuestionFormData({ ...questionFormData, question_text: e.target.value });
  const handleOptionTextChange = (index: number, value: string) => { const opts = [...questionFormData.options]; opts[index].option_text = value; setQuestionFormData({ ...questionFormData, options: opts }); };
  const handleCorrectOptionChange = (index: number) => { const opts = questionFormData.options.map((opt, i) => ({ ...opt, is_correct: i === index })); setQuestionFormData({ ...questionFormData, options: opts }); };
  const handleAddOption = () => setQuestionFormData({ ...questionFormData, options: [...questionFormData.options, { option_text: "", is_correct: false }] });
  const handleRemoveOption = (index: number) => { if (questionFormData.options.length <= 2) return; const opts = questionFormData.options.filter((_, i) => i !== index); setQuestionFormData({ ...questionFormData, options: opts }); };

  // --- HELPER & RENDER FUNCTIONS ---
  const getFileTypeFromUrl = (url: string): string => { const ext = url.split(".").pop()?.toLowerCase() || ""; if (ext === "pdf") return "PDF"; if (["mp4", "mov", "avi"].includes(ext)) return "Video"; if (["ppt", "pptx"].includes(ext)) return "Presentation"; if (["doc", "docx"].includes(ext)) return "Document"; if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "Image"; return "File"; };
  const getFileIcon = (content: TrainingContent) => { if (content.url_link) return <Link className="w-6 h-6 text-blue-500" />; if (content.training_file) { const type = getFileTypeFromUrl(content.training_file); if (type === "PDF") return <FileText className="w-6 h-6 text-red-500" />; if (type === "Video") return <Video className="w-6 h-6 text-purple-500" />; if (type === "Presentation") return <Presentation className="w-6 h-6 text-orange-500" />; if (type === "Image") return <Image className="w-6 h-6 text-green-500" />; } return <FileText className="w-6 h-6 text-gray-500" />; };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trainingContents.map(content => (
        <div key={content.id} className="group bg-white rounded-xl border p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => handleMaterialClick(content)}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center flex-1">
              <div className="p-3 bg-gray-50 rounded-lg mr-4 group-hover:bg-blue-50">{getFileIcon(content)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700">{content.description}</h3>
                <p className="text-sm text-gray-500 mt-1">{content.training_file ? `File: ${getFileTypeFromUrl(content.training_file)}` : "Web Link"}</p>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteContent(content.id); }} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">{content.training_file ? getFileTypeFromUrl(content.training_file) : "Link"}</span>
            <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {trainingContents.map(content => (
        <div key={content.id} className="group bg-white rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0" onClick={() => handleMaterialClick(content)}>
              <div className="p-2 bg-gray-50 rounded-lg mr-4 group-hover:bg-blue-50">{getFileIcon(content)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700">{content.description}</h3>
                <span className="text-sm text-gray-400 truncate">{content.training_file || content.url_link}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => handleMaterialClick(content)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-500"><Eye className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteContent(content.id); }} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) { return (<div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div></div>); }
  if (error) { return (<div className="flex h-screen items-center justify-center text-red-600 font-semibold">Error: {error}</div>); }

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex h-screen w-full">
        <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200"><div className="flex items-center space-x-3 mb-2"><BookOpen className="w-6 h-6 text-blue-600" /><h2 className="text-xl font-bold text-gray-900">Lesson Contents</h2></div></div>
          <nav className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-3">
              {detailTabs.map((tab, index) => (<button key={tab.id} onClick={() => onTabClick(tab.id)} className={`w-full p-4 text-left rounded-xl transition-all duration-200 flex items-center group ${activeTab === tab.id ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"}`}> <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 text-sm font-bold ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"}`}>{index + 1}</div> <div className="flex-1"><span className="font-semibold text-sm block">{tab.title.length > 20 ? tab.title.slice(0, 20) + '...' : tab.title}</span><span className={`text-xs ${activeTab === tab.id ? "text-blue-100" : "text-gray-500"}`}>Module {index + 1}</span></div> </button>))}
            </div>
          </nav>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 w-full">
          <div className="p-8">
            <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 mb-2">{activeTabData?.title || "Loading..."}</h1></div>

            {isMCQTab ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8 border-b pb-4"><div><h2 className="text-2xl font-bold text-gray-900">Question Manager</h2><p className="text-sm text-gray-500">View, add, edit, or delete questions.</p></div><button onClick={handleOpenAddModal} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"><FileQuestion className="w-4 h-4" /><span>Add Question</span></button></div>
                {showResults ? (
                  <div className="text-center"><h3 className="text-3xl font-bold text-gray-800">Assessment Complete!</h3><p className="text-6xl font-bold my-6 text-blue-600">{Object.values(selectedAnswers).filter(a => a.isCorrect).length} / {questions.length}</p><button onClick={handleReturnToManager} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">Return to Manager</button></div>
                ) : quizMode ? (
                  <div>
                    {questions.length > 0 && (() => { const question = questions[currentQuestionIndex]; const answerState = selectedAnswers[question.id]; return (<div><p className="text-lg font-semibold text-gray-800 mb-4">{currentQuestionIndex + 1}. {question.question_text}</p><div className="space-y-3">{question.options.map(option => (<button key={option.id} onClick={() => handleAnswerSelect(question.id, option)} disabled={!!answerState} className={`block w-full text-left p-4 rounded-lg border-2 transition-all ${!!answerState ? 'cursor-not-allowed' : 'cursor-pointer'} ${answerState?.selectedOptionId === option.id ? (answerState.isCorrect ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800') : 'bg-white hover:bg-gray-100 border-gray-200'}`}><span className="font-medium">{option.option_text}</span></button>))}</div><div className="mt-8 flex justify-between items-center"><span className="text-sm font-semibold text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</span>{currentQuestionIndex < questions.length - 1 ? (<button onClick={handleNextQuestion} disabled={!answerState} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">Next</button>) : (<button onClick={handleFinishAssessment} disabled={!answerState} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400">Finish</button>)}</div></div>); })()}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-semibold text-gray-800">Existing Questions ({questions.length})</h3><button onClick={handleStartAssessment} disabled={questions.length === 0} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">Start Assessment</button></div>
                    {questions.length > 0 ? (
                      <div className="space-y-4">{questions.map((question, index) => (<div key={question.id} className="p-4 border rounded-lg bg-gray-50"><div className="flex justify-between items-start"><p className="font-semibold text-gray-700 flex-1 pr-4">{index + 1}. {question.question_text}</p><div className="flex items-center space-x-2 flex-shrink-0"><button onClick={() => handleOpenEditModal(question)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full" title="Edit"><Edit className="w-4 h-4" /></button><button onClick={() => handleDeleteQuestion(question.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Delete"><Trash2 className="w-4 h-4" /></button></div></div><div className="mt-3 pl-6 space-y-2">{question.options.map(option => (<div key={option.id} className={`flex items-center text-sm ${option.is_correct ? 'font-bold text-green-700' : 'text-gray-600'}`}>{option.is_correct ? <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> : <XCircle className="w-4 h-4 mr-2 text-gray-400" />}{option.option_text}</div>))}</div></div>))}</div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg"><p className="text-gray-500">No questions have been added yet.</p><p className="text-sm text-gray-400 mt-2">Click "Add Question" to get started.</p></div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold text-gray-900">Training Materials</h2><p className="text-gray-600 mt-1">Resources for this module</p></div><div className="flex items-center space-x-4"><button onClick={() => setShowUploadModal(true)} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm"><Upload className="w-4 h-4" /><span>Upload Material</span></button><div className="flex bg-white rounded-lg border border-gray-200 p-1"><button onClick={() => setViewType("grid")} className={`p-2 rounded-md ${viewType === "grid" ? "bg-blue-600 text-white" : "text-gray-600"}`}><Grid className="w-4 h-4" /></button><button onClick={() => setViewType("list")} className={`p-2 rounded-md ${viewType === "list" ? "bg-blue-600 text-white" : "text-gray-600"}`}><List className="w-4 h-4" /></button></div></div></div>
                {trainingContents.length > 0 ? (<>{viewType === "grid" ? renderGridView() : renderListView()}</>) : (<div className="bg-white rounded-xl border-2 border-dashed p-16 text-center"><h3 className="text-xl font-bold text-gray-900">No Materials Yet</h3><p className="text-gray-600 mt-2">Upload the first training material for this module.</p></div>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b"><h2 className="text-2xl font-bold text-gray-900">Upload New Material</h2><p className="text-gray-600 mt-1">Add a new resource to this lesson</p></div>
            <form onSubmit={handleUploadSubmit} className="p-6">
              <div className="space-y-6">
                <div><label className="block text-sm font-semibold text-gray-900 mb-2">Description *</label><input type="text" value={newMaterial.description} onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required /></div>
                <div><label className="block text-sm font-semibold text-gray-900 mb-3">Upload Type *</label><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setUploadType("file")} className={`p-4 rounded-xl border-2 ${uploadType === "file" ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}><FileText className="w-6 h-6 mx-auto mb-2" /><div className="font-semibold">File Upload</div></button><button type="button" onClick={() => setUploadType("link")} className={`p-4 rounded-xl border-2 ${uploadType === "link" ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}><Link className="w-6 h-6 mx-auto mb-2" /><div className="font-semibold">Web Link</div></button></div></div>
                {uploadType === "file" ? (<div><label className="block text-sm font-semibold text-gray-900 mb-2">Select File *</label><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" /><div onClick={triggerFileInput} className="w-full p-6 border-2 border-dashed rounded-lg cursor-pointer"><div className="text-center"><Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" /><div className="font-medium">{newMaterial.file ? newMaterial.file.name : "Click to choose file"}</div></div></div></div>) : (<div><label className="block text-sm font-semibold text-gray-900 mb-2">URL *</label><input type="url" value={newMaterial.url} onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required /></div>)}
              </div>
              <div className="mt-8 flex justify-end space-x-3"><button type="button" onClick={() => setShowUploadModal(false)} className="px-6 py-3 bg-gray-100 rounded-lg" disabled={uploadLoading}>Cancel</button><button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg" disabled={uploadLoading}>{uploadLoading ? "Uploading..." : "Upload"}</button></div>
            </form>
          </div>
        </div>
      )}

      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b"><h2 className="text-2xl font-bold">{editingQuestion ? "Edit Question" : "Add New Question"}</h2></div>
            <form onSubmit={handleQuestionFormSubmit} className="p-6">
              <div className="space-y-6"><div><label className="block text-sm font-semibold text-gray-900 mb-2">Question *</label><input type="text" value={questionFormData.question_text} onChange={handleQuestionTextChange} className="w-full p-3 border border-gray-300 rounded-lg" required /></div><div><label className="block text-sm font-semibold text-gray-900 mb-2">Options *</label><div className="space-y-3">{questionFormData.options.map((option, index) => (<div key={index} className="flex items-center space-x-3"><input type="radio" name="correct_option" checked={option.is_correct} onChange={() => handleCorrectOptionChange(index)} className="h-5 w-5 text-blue-600" /><input type="text" value={option.option_text} onChange={(e) => handleOptionTextChange(index, e.target.value)} className="flex-grow p-3 border border-gray-300 rounded-lg" required /><button type="button" onClick={() => handleRemoveOption(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-full disabled:opacity-50" disabled={questionFormData.options.length <= 2}><Trash2 className="w-5 h-5" /></button></div>))}</div><button type="button" onClick={handleAddOption} className="mt-4 text-sm font-semibold text-blue-600 hover:underline">+ Add another option</button></div></div>
              <div className="mt-8 flex justify-end space-x-3"><button type="button" onClick={() => setShowQuestionModal(false)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Cancel</button><button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">{editingQuestion ? "Save Changes" : "Save Question"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

