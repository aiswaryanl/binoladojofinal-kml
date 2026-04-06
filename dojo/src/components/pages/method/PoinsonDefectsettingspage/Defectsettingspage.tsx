
// import React, { useEffect, useState } from "react";
// import {
//   Settings,
//   Plus,
//   Trash2,
//   ToggleLeft,
//   ToggleRight,
//   Search,
//   X,
//   Loader2,
//   CheckCircle,
//   AlertCircle,
// } from "lucide-react";

// /* ============================================================
//    CONFIG
// ============================================================ */
// const BASE_URL = "http://192.168.2.51:8000"; 
// const DEFECT_CATEGORIES = "/defect-categories/";
// const DEFECT_TYPES = "/defect-types/";

// /* ============================================================
//    TYPES
// ============================================================ */
// interface DefectCategory {
//   category_id: number;
//   category_name: string;
//   description?: string;
//   is_active: boolean;
//   defect_types_count: number;
// }

// interface DefectType {
//   defect_type_id: number;
//   defect_name: string;
//   category: number;
//   category_name: string;
//   description?: string;
//   is_active: boolean;
// }

// interface Alert {
//   type: "success" | "error";
//   message: string;
// }

// /* ============================================================
//    API HELPER
// ============================================================ */
// class ApiError extends Error {
//   constructor(public message: string, public status?: number) {
//     super(message);
//   }
// }

// async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
//   const response = await fetch(url, {
//     headers: {
//       "Content-Type": "application/json",
//       ...(options?.headers || {}),
//     },
//     ...options,
//   });

//   if (!response.ok) {
//     const text = await response.text();
//     throw new ApiError(text || response.statusText, response.status);
//   }
//   return response.status === 204 ? ({} as T) : response.json();
// }

// /* ============================================================
//    COMPONENT
// ============================================================ */
// const DefectManagementSettings: React.FC = () => {
//   const [categories, setCategories] = useState<DefectCategory[]>([]);
//   const [defectTypes, setDefectTypes] = useState<DefectType[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [alert, setAlert] = useState<Alert | null>(null);
//   const [activeTab, setActiveTab] = useState<"categories" | "types">("categories");
//   const [searchQuery, setSearchQuery] = useState("");

//   // Modal States
//   const [showCategoryModal, setShowCategoryModal] = useState(false);
//   const [showTypeModal, setShowTypeModal] = useState(false);

//   // Form States
//   const [categoryName, setCategoryName] = useState("");
//   const [categoryDescription, setCategoryDescription] = useState("");
//   const [typeName, setTypeName] = useState("");
//   const [typeDescription, setTypeDescription] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState<number>(0);

//   const showAlert = (type: Alert["type"], message: string) => {
//     setAlert({ type, message });
//     setTimeout(() => setAlert(null), 4000);
//   };

//   const fetchCategories = async () => {
//     try {
//       const data = await apiRequest<DefectCategory[]>(`${BASE_URL}${DEFECT_CATEGORIES}`);
//       setCategories(data);
//     } catch { showAlert("error", "Failed to load categories"); }
//   };

//   const fetchTypes = async () => {
//     try {
//       const data = await apiRequest<DefectType[]>(`${BASE_URL}${DEFECT_TYPES}`);
//       setDefectTypes(data);
//     } catch { showAlert("error", "Failed to load defect types"); }
//   };

//   useEffect(() => {
//     fetchCategories();
//     fetchTypes();
//   }, []);

//   const createCategory = async () => {
//     if (!categoryName.trim()) return showAlert("error", "Category name required");
//     try {
//       setLoading(true);
//       await apiRequest(`${BASE_URL}${DEFECT_CATEGORIES}`, {
//         method: "POST",
//         body: JSON.stringify({ category_name: categoryName.trim(), description: categoryDescription.trim(), is_active: true }),
//       });
//       showAlert("success", "Category created");
//       setShowCategoryModal(false);
//       setCategoryName("");
//       setCategoryDescription("");
//       fetchCategories();
//     } catch (error: any) { showAlert("error", error.message || "Creation failed"); }
//     finally { setLoading(false); }
//   };

//   const createType = async () => {
//     if (!typeName.trim()) return showAlert("error", "Defect name required");
//     if (!selectedCategory) return showAlert("error", "Select category");
//     try {
//       setLoading(true);
//       await apiRequest(`${BASE_URL}${DEFECT_TYPES}`, {
//         method: "POST",
//         body: JSON.stringify({ defect_name: typeName.trim(), category: selectedCategory, description: typeDescription.trim(), is_active: true }),
//       });
//       showAlert("success", "Defect type created");
//       setShowTypeModal(false);
//       setTypeName("");
//       setTypeDescription("");
//       setSelectedCategory(0);
//       fetchTypes();
//       fetchCategories();
//     } catch (error: any) { showAlert("error", error.message || "Creation failed"); }
//     finally { setLoading(false); }
//   };

//   const deleteCategory = async (id: number) => {
//     if (!window.confirm("Delete this category?")) return;
//     try {
//       setLoading(true);
//       await apiRequest(`${BASE_URL}${DEFECT_CATEGORIES}${id}/`, { method: "DELETE" });
//       showAlert("success", "Category deleted");
//       fetchCategories();
//       fetchTypes();
//     } catch { showAlert("error", "Delete failed"); }
//     finally { setLoading(false); }
//   };

//   const toggleCategory = async (category: DefectCategory) => {
//     try {
//       setLoading(true);
//       await apiRequest(`${BASE_URL}${DEFECT_CATEGORIES}${category.category_id}/toggle_active/`, { method: "POST" });
//       fetchCategories();
//     } catch { showAlert("error", "Status update failed"); }
//     finally { setLoading(false); }
//   };

//   const toggleType = async (type: DefectType) => {
//     try {
//       setLoading(true);
//       await apiRequest(`${BASE_URL}${DEFECT_TYPES}${type.defect_type_id}/toggle_active/`, { method: "POST" });
//       fetchTypes();
//     } catch { showAlert("error", "Status update failed"); }
//     finally { setLoading(false); }
//   };

//   const filteredCategories = categories.filter((c) => c.category_name.toLowerCase().includes(searchQuery.toLowerCase()));
//   const filteredTypes = defectTypes.filter((t) => t.defect_name.toLowerCase().includes(searchQuery.toLowerCase()));

//   return (
//     <div className="min-h-screen bg-slate-100 p-8">
//       <div className="max-w-6xl mx-auto bg-white rounded-xl shadow border">
        
//         {/* HEADER */}
//         <div className="p-6 border-b flex justify-between items-center">
//           <div className="flex items-center gap-3">
//             <Settings className="w-7 h-7 text-purple-600" />
//             <h1 className="text-xl font-bold">Defect Management</h1>
//           </div>
//           <button
//             onClick={() => activeTab === "categories" ? setShowCategoryModal(true) : setShowTypeModal(true)}
//             className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
//           >
//             <Plus size={16} />
//             Add {activeTab === "categories" ? "Category" : "Defect Type"}
//           </button>
//         </div>

//         {/* ALERTS */}
//         {alert && (
//           <div className={`m-6 p-3 rounded flex items-center gap-2 ${alert.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
//             {alert.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
//             {alert.message}
//           </div>
//         )}

//         {/* TABS */}
//         <div className="flex border-b">
//           <button onClick={() => setActiveTab("categories")} className={`flex-1 p-3 font-medium ${activeTab === "categories" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-500"}`}>
//             Categories ({categories.length})
//           </button>
//           <button onClick={() => setActiveTab("types")} className={`flex-1 p-3 font-medium ${activeTab === "types" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-500"}`}>
//             Types ({defectTypes.length})
//           </button>
//         </div>

//         {/* SEARCH */}
//         <div className="p-6 border-b">
//           <div className="relative max-w-sm">
//             <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
//             <input className="pl-9 pr-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
//           </div>
//         </div>

//         {/* TABLES */}
//         <div className="p-6 overflow-x-auto">
//           {activeTab === "categories" ? (
//             <table className="w-full text-sm">
//               <thead className="bg-slate-50">
//                 <tr className="border-b">
//                   <th className="text-left p-3">Name</th>
//                   <th className="text-center p-3">Count</th>
//                   <th className="text-center p-3">Status</th>
//                   <th className="text-right p-3">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredCategories.map((c) => (
//                   <tr key={c.category_id} className="border-b hover:bg-slate-50">
//                     <td className="p-3 font-medium">{c.category_name}</td>
//                     <td className="text-center p-3">{c.defect_types_count}</td>
//                     <td className="text-center p-3">
//                       <button onClick={() => toggleCategory(c)} className="text-purple-600">
//                         {c.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} className="text-gray-400" />}
//                       </button>
//                     </td>
//                     <td className="text-right p-3">
//                       <button onClick={() => deleteCategory(c.category_id)} className="text-red-500 hover:text-red-700">
//                         <Trash2 size={18} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <table className="w-full text-sm">
//               <thead className="bg-slate-50">
//                 <tr className="border-b">
//                   <th className="text-left p-3">Name</th>
//                   <th className="text-left p-3">Category</th>
//                   <th className="text-center p-3">Status</th>
//                   <th className="text-right p-3">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredTypes.map((t) => (
//                   <tr key={t.defect_type_id} className="border-b hover:bg-slate-50">
//                     <td className="p-3 font-medium">{t.defect_name}</td>
//                     <td className="p-3"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">{t.category_name}</span></td>
//                     <td className="text-center p-3">
//                       <button onClick={() => toggleType(t)} className="text-purple-600">
//                         {t.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} className="text-gray-400" />}
//                       </button>
//                     </td>
//                     <td className="text-right p-3">
//                       <button onClick={() => deleteType(t.defect_type_id)} className="text-red-500 hover:text-red-700">
//                         <Trash2 size={18} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>

//       {/* CATEGORY MODAL */}
//       {showCategoryModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-bold">Add New Category</h2>
//               <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name *</label>
//                 <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-purple-500" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g., Appearance" />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
//                 <textarea className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]" value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} placeholder="Optional details..." />
//               </div>
//               <div className="flex gap-3 pt-4">
//                 <button onClick={() => setShowCategoryModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
//                 <button disabled={loading} onClick={createCategory} className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2">
//                   {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Category"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* TYPE MODAL */}
//       {showTypeModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-bold">Add New Defect Type</h2>
//               <button onClick={() => setShowTypeModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Defect Name *</label>
//                 <input className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-purple-500" value={typeName} onChange={(e) => setTypeName(e.target.value)} placeholder="e.g., Scratch" />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Category *</label>
//                 <select className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-purple-500 bg-white" value={selectedCategory} onChange={(e) => setSelectedCategory(Number(e.target.value))}>
//                   <option value={0}>Select a category</option>
//                   {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
//                 <textarea className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]" value={typeDescription} onChange={(e) => setTypeDescription(e.target.value)} placeholder="Optional details..." />
//               </div>
//               <div className="flex gap-3 pt-4">
//                 <button onClick={() => setShowTypeModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
//                 <button disabled={loading} onClick={createType} className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2">
//                   {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Defect Type"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DefectManagementSettings;





import React, { useEffect, useState, useCallback } from "react";
import {
  Settings,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Edit3,
  Filter,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

/* ============================================================
   CONFIG
============================================================ */
const BASE_URL = "http://192.168.2.51:8000";
const DEFECT_CATEGORIES = "/defect-categories/";
const DEFECT_TYPES = "/defect-types/";

/* ============================================================
   TYPES
============================================================ */
interface DefectCategory {
  category_id: number;
  category_name: string;
  description?: string;
  is_active: boolean;
  defect_types_count: number;
}

interface DefectType {
  defect_type_id: number;
  defect_name: string;
  category: number;
  category_name: string;
  description?: string;
  is_active: boolean;
}

interface Alert {
  type: "success" | "error";
  message: string;
}

type StatusFilter = "all" | "active" | "inactive";
type ModalMode = "create" | "edit";

/* ============================================================
   API HELPER
============================================================ */
class ApiError extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
  }
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText, response.status);
  }
  return response.status === 204 ? ({} as T) : response.json();
}

/* ============================================================
   COMPONENT
============================================================ */
const DefectManagementSettings: React.FC = () => {
  // ── Data State ──
  const [categories, setCategories] = useState<DefectCategory[]>([]);
  const [defectTypes, setDefectTypes] = useState<DefectType[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [activeTab, setActiveTab] = useState<"categories" | "types">(
    "categories"
  );

  // ── Filter State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<number>(0);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // ── Modal State ──
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");

  // ── Category Form State ──
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  // ── Type Form State ──
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [typeName, setTypeName] = useState("");
  const [typeDescription, setTypeDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  // ── Delete Confirmation State ──
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "defectType";
    id: number;
    name: string;
  } | null>(null);

  /* ──────────────────────────────────────────────────
     HELPERS
  ────────────────────────────────────────────────── */
  const showAlertMsg = useCallback((type: Alert["type"], message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  }, []);

  const resetCategoryForm = () => {
    setCategoryName("");
    setCategoryDescription("");
    setEditingCategoryId(null);
  };

  const resetTypeForm = () => {
    setTypeName("");
    setTypeDescription("");
    setSelectedCategory(0);
    setEditingTypeId(null);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter(0);
  };

  /* ──────────────────────────────────────────────────
     FETCH
  ────────────────────────────────────────────────── */
  const fetchCategories = useCallback(async () => {
    try {
      setTableLoading(true);
      const data = await apiRequest<DefectCategory[]>(
        `${BASE_URL}${DEFECT_CATEGORIES}`
      );
      setCategories(data);
    } catch {
      showAlertMsg("error", "Failed to load categories");
    } finally {
      setTableLoading(false);
    }
  }, [showAlertMsg]);

  const fetchTypes = useCallback(async () => {
    try {
      setTableLoading(true);
      const data = await apiRequest<DefectType[]>(
        `${BASE_URL}${DEFECT_TYPES}`
      );
      setDefectTypes(data);
    } catch {
      showAlertMsg("error", "Failed to load defect types");
    } finally {
      setTableLoading(false);
    }
  }, [showAlertMsg]);

  useEffect(() => {
    fetchCategories();
    fetchTypes();
  }, [fetchCategories, fetchTypes]);

  /* ──────────────────────────────────────────────────
     CATEGORY CRUD
  ────────────────────────────────────────────────── */
  const openCreateCategory = () => {
    resetCategoryForm();
    setModalMode("create");
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat: DefectCategory) => {
    setEditingCategoryId(cat.category_id);
    setCategoryName(cat.category_name);
    setCategoryDescription(cat.description || "");
    setModalMode("edit");
    setShowCategoryModal(true);
  };

  const saveCategory = async () => {
    if (!categoryName.trim())
      return showAlertMsg("error", "Category name is required");

    try {
      setLoading(true);
      const payload = {
        category_name: categoryName.trim(),
        description: categoryDescription.trim(),
        is_active: true,
      };

      if (modalMode === "create") {
        await apiRequest(`${BASE_URL}${DEFECT_CATEGORIES}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showAlertMsg("success", "Category created successfully");
      } else {
        await apiRequest(
          `${BASE_URL}${DEFECT_CATEGORIES}${editingCategoryId}/`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
        showAlertMsg("success", "Category updated successfully");
      }

      setShowCategoryModal(false);
      resetCategoryForm();
      fetchCategories();
      fetchTypes();
    } catch (error: any) {
      showAlertMsg("error", error.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = async (category: DefectCategory) => {
    try {
      setLoading(true);
      await apiRequest(
        `${BASE_URL}${DEFECT_CATEGORIES}${category.category_id}/toggle_active/`,
        { method: "POST" }
      );
      fetchCategories();
      showAlertMsg(
        "success",
        `Category ${category.is_active ? "deactivated" : "activated"}`
      );
    } catch {
      showAlertMsg("error", "Status update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ──────────────────────────────────────────────────
     DEFECT TYPE CRUD
  ────────────────────────────────────────────────── */
  const openCreateType = () => {
    resetTypeForm();
    setModalMode("create");
    setShowTypeModal(true);
  };

  const openEditType = (dt: DefectType) => {
    setEditingTypeId(dt.defect_type_id);
    setTypeName(dt.defect_name);
    setTypeDescription(dt.description || "");
    setSelectedCategory(dt.category);
    setModalMode("edit");
    setShowTypeModal(true);
  };

  const saveType = async () => {
    if (!typeName.trim())
      return showAlertMsg("error", "Defect name is required");
    if (!selectedCategory)
      return showAlertMsg("error", "Please select a category");

    try {
      setLoading(true);
      const payload = {
        defect_name: typeName.trim(),
        category: selectedCategory,
        description: typeDescription.trim(),
        is_active: true,
      };

      if (modalMode === "create") {
        await apiRequest(`${BASE_URL}${DEFECT_TYPES}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showAlertMsg("success", "Defect type created successfully");
      } else {
        await apiRequest(
          `${BASE_URL}${DEFECT_TYPES}${editingTypeId}/`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
        showAlertMsg("success", "Defect type updated successfully");
      }

      setShowTypeModal(false);
      resetTypeForm();
      fetchTypes();
      fetchCategories();
    } catch (error: any) {
      showAlertMsg("error", error.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleType = async (type: DefectType) => {
    try {
      setLoading(true);
      await apiRequest(
        `${BASE_URL}${DEFECT_TYPES}${type.defect_type_id}/toggle_active/`,
        { method: "POST" }
      );
      fetchTypes();
      showAlertMsg(
        "success",
        `Defect type ${type.is_active ? "deactivated" : "activated"}`
      );
    } catch {
      showAlertMsg("error", "Status update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ──────────────────────────────────────────────────
     DELETE (shared)
  ────────────────────────────────────────────────── */
  const confirmDelete = (
    type: "category" | "defectType",
    id: number,
    name: string
  ) => {
    setDeleteTarget({ type, id, name });
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      setLoading(true);
      const endpoint =
        deleteTarget.type === "category"
          ? `${BASE_URL}${DEFECT_CATEGORIES}${deleteTarget.id}/`
          : `${BASE_URL}${DEFECT_TYPES}${deleteTarget.id}/`;

      await apiRequest(endpoint, { method: "DELETE" });
      showAlertMsg(
        "success",
        `${deleteTarget.type === "category" ? "Category" : "Defect type"} deleted`
      );
      fetchCategories();
      fetchTypes();
    } catch {
      showAlertMsg("error", "Delete failed");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  /* ──────────────────────────────────────────────────
     FILTERING
  ────────────────────────────────────────────────── */
  const filteredCategories = categories.filter((c) => {
    const matchesSearch = c.category_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && c.is_active) ||
      (statusFilter === "inactive" && !c.is_active);
    return matchesSearch && matchesStatus;
  });

  const filteredTypes = defectTypes.filter((t) => {
    const matchesSearch = t.defect_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && t.is_active) ||
      (statusFilter === "inactive" && !t.is_active);
    const matchesCategory =
      categoryFilter === 0 || t.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) + (categoryFilter !== 0 ? 1 : 0);

  /* ──────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow border">
        {/* ── HEADER ── */}
        <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Settings className="w-7 h-7 text-purple-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Defect Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage categories & defect types
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              activeTab === "categories"
                ? openCreateCategory()
                : openCreateType()
            }
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 
                       rounded-lg flex items-center gap-2 transition shadow-sm"
          >
            <Plus size={16} />
            Add {activeTab === "categories" ? "Category" : "Defect Type"}
          </button>
        </div>

        {/* ── ALERT ── */}
        {alert && (
          <div
            className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium
              ${
                alert.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
          >
            {alert.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {alert.message}
            <button
              className="ml-auto"
              onClick={() => setAlert(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── TABS ── */}
        <div className="flex border-b">
          <button
            onClick={() => {
              setActiveTab("categories");
              resetFilters();
            }}
            className={`flex-1 p-3 font-medium text-sm transition
              ${
                activeTab === "categories"
                  ? "border-b-2 border-purple-600 text-purple-600 bg-purple-50/40"
                  : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("types");
              resetFilters();
            }}
            className={`flex-1 p-3 font-medium text-sm transition
              ${
                activeTab === "types"
                  ? "border-b-2 border-purple-600 text-purple-600 bg-purple-50/40"
                  : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Defect Types ({defectTypes.length})
          </button>
        </div>

        {/* ── SEARCH + FILTER BAR ── */}
        <div className="p-4 md:p-6 border-b space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                className="pl-9 pr-9 py-2 border rounded-lg w-full 
                           focus:ring-2 focus:ring-purple-400 outline-none text-sm"
                placeholder={`Search ${activeTab === "categories" ? "categories" : "defect types"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 
                         text-sm font-medium transition
                ${
                  showFilterPanel || activeFilterCount > 0
                    ? "bg-purple-50 border-purple-300 text-purple-700"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
            >
              <Filter size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span
                  className="bg-purple-600 text-white text-xs rounded-full 
                             w-5 h-5 flex items-center justify-center"
                >
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                size={14}
                className={`transition-transform ${showFilterPanel ? "rotate-180" : ""}`}
              />
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                fetchCategories();
                fetchTypes();
              }}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 
                         text-gray-600 transition"
              title="Refresh data"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* ── Filter Panel ── */}
          {showFilterPanel && (
            <div
              className="bg-slate-50 rounded-lg p-4 border flex flex-col 
                          sm:flex-row gap-4 items-start sm:items-end"
            >
              {/* Status Filter */}
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Status
                </label>
                <select
                  className="w-full border rounded-lg p-2 text-sm outline-none 
                             focus:ring-2 focus:ring-purple-400 bg-white"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              {/* Category Filter (only for types tab) */}
              {activeTab === "types" && (
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Category
                  </label>
                  <select
                    className="w-full border rounded-lg p-2 text-sm outline-none 
                               focus:ring-2 focus:ring-purple-400 bg-white"
                    value={categoryFilter}
                    onChange={(e) =>
                      setCategoryFilter(Number(e.target.value))
                    }
                  >
                    <option value={0}>All Categories</option>
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Clear Filters */}
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 
                           rounded-lg font-medium transition"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* ── TABLE ── */}
        <div className="p-4 md:p-6 overflow-x-auto">
          {tableLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin mr-2" size={24} />
              Loading…
            </div>
          ) : activeTab === "categories" ? (
            /* ── CATEGORIES TABLE ── */
            filteredCategories.length === 0 ? (
              <EmptyState
                message={
                  searchQuery || statusFilter !== "all"
                    ? "No categories match your filters"
                    : "No categories yet. Create your first one!"
                }
                onClear={
                  searchQuery || statusFilter !== "all"
                    ? resetFilters
                    : undefined
                }
              />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left p-3 font-semibold text-gray-600">
                      Name
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-600 hidden md:table-cell">
                      Description
                    </th>
                    <th className="text-center p-3 font-semibold text-gray-600">
                      Types
                    </th>
                    <th className="text-center p-3 font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((c) => (
                    <tr
                      key={c.category_id}
                      className="border-b hover:bg-slate-50/70 transition"
                    >
                      <td className="p-3">
                        <span className="font-medium text-gray-900">
                          {c.category_name}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500 hidden md:table-cell max-w-[250px] truncate">
                        {c.description || "—"}
                      </td>
                      <td className="text-center p-3">
                        <span
                          className="bg-blue-50 text-blue-700 px-2.5 py-0.5 
                                     rounded-full text-xs font-medium"
                        >
                          {c.defect_types_count}
                        </span>
                      </td>
                      <td className="text-center p-3">
                        <button
                          onClick={() => toggleCategory(c)}
                          disabled={loading}
                          className="inline-flex items-center gap-1 transition"
                        >
                          {c.is_active ? (
                            <>
                              <ToggleRight
                                size={24}
                                className="text-purple-600"
                              />
                              <span className="text-xs text-green-600 font-medium">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft
                                size={24}
                                className="text-gray-400"
                              />
                              <span className="text-xs text-gray-400 font-medium">
                                Inactive
                              </span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="text-right p-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditCategory(c)}
                            className="p-2 rounded-lg text-gray-500 hover:text-blue-600 
                                       hover:bg-blue-50 transition"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              confirmDelete(
                                "category",
                                c.category_id,
                                c.category_name
                              )
                            }
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 
                                       hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : /* ── DEFECT TYPES TABLE ── */
          filteredTypes.length === 0 ? (
            <EmptyState
              message={
                searchQuery || statusFilter !== "all" || categoryFilter !== 0
                  ? "No defect types match your filters"
                  : "No defect types yet. Create your first one!"
              }
              onClear={
                searchQuery || statusFilter !== "all" || categoryFilter !== 0
                  ? resetFilters
                  : undefined
              }
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="text-left p-3 font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-600">
                    Category
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-600 hidden md:table-cell">
                    Description
                  </th>
                  <th className="text-center p-3 font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-right p-3 font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTypes.map((t) => (
                  <tr
                    key={t.defect_type_id}
                    className="border-b hover:bg-slate-50/70 transition"
                  >
                    <td className="p-3">
                      <span className="font-medium text-gray-900">
                        {t.defect_name}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className="bg-purple-100 text-purple-700 px-2.5 py-0.5 
                                   rounded-full text-xs font-medium"
                      >
                        {t.category_name}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 hidden md:table-cell max-w-[250px] truncate">
                      {t.description || "—"}
                    </td>
                    <td className="text-center p-3">
                      <button
                        onClick={() => toggleType(t)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 transition"
                      >
                        {t.is_active ? (
                          <>
                            <ToggleRight
                              size={24}
                              className="text-purple-600"
                            />
                            <span className="text-xs text-green-600 font-medium">
                              Active
                            </span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft
                              size={24}
                              className="text-gray-400"
                            />
                            <span className="text-xs text-gray-400 font-medium">
                              Inactive
                            </span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="text-right p-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditType(t)}
                          className="p-2 rounded-lg text-gray-500 hover:text-blue-600 
                                     hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            confirmDelete(
                              "defectType",
                              t.defect_type_id,
                              t.defect_name
                            )
                          }
                          className="p-2 rounded-lg text-gray-500 hover:text-red-600 
                                     hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── Result Count ── */}
          {!tableLoading && (
            <div className="mt-4 text-xs text-gray-400 text-right">
              Showing{" "}
              {activeTab === "categories"
                ? filteredCategories.length
                : filteredTypes.length}{" "}
              of{" "}
              {activeTab === "categories"
                ? categories.length
                : defectTypes.length}{" "}
              {activeTab}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          CATEGORY MODAL  (Create / Edit)
      ═══════════════════════════════════════════════ */}
      {showCategoryModal && (
        <Modal
          onClose={() => {
            setShowCategoryModal(false);
            resetCategoryForm();
          }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {modalMode === "create" ? "Add New Category" : "Edit Category"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {modalMode === "create"
              ? "Create a new defect category"
              : "Update category details"}
          </p>

          <div className="space-y-4">
            <Field label="Category Name *">
              <input
                className="w-full border rounded-lg p-2.5 outline-none 
                           focus:ring-2 focus:ring-purple-500 text-sm"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., Appearance"
                autoFocus
              />
            </Field>

            <Field label="Description">
              <textarea
                className="w-full border rounded-lg p-2.5 outline-none 
                           focus:ring-2 focus:ring-purple-500 min-h-[100px] text-sm"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Optional details about this category…"
              />
            </Field>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  resetCategoryForm();
                }}
                className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 
                           font-medium text-sm transition"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={saveCategory}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white 
                           py-2.5 rounded-lg font-medium text-sm flex items-center 
                           justify-center gap-2 transition disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : modalMode === "create" ? (
                  "Create Category"
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════
          TYPE MODAL  (Create / Edit)
      ═══════════════════════════════════════════════ */}
      {showTypeModal && (
        <Modal
          onClose={() => {
            setShowTypeModal(false);
            resetTypeForm();
          }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {modalMode === "create"
              ? "Add New Defect Type"
              : "Edit Defect Type"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {modalMode === "create"
              ? "Create a new defect type under a category"
              : "Update defect type details"}
          </p>

          <div className="space-y-4">
            <Field label="Defect Name *">
              <input
                className="w-full border rounded-lg p-2.5 outline-none 
                           focus:ring-2 focus:ring-purple-500 text-sm"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                placeholder="e.g., Scratch"
                autoFocus
              />
            </Field>

            <Field label="Parent Category *">
              <select
                className="w-full border rounded-lg p-2.5 outline-none 
                           focus:ring-2 focus:ring-purple-500 bg-white text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(Number(e.target.value))}
              >
                <option value={0}>Select a category</option>
                {categories
                  .filter((c) => c.is_active)
                  .map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
              </select>
            </Field>

            <Field label="Description">
              <textarea
                className="w-full border rounded-lg p-2.5 outline-none 
                           focus:ring-2 focus:ring-purple-500 min-h-[80px] text-sm"
                value={typeDescription}
                onChange={(e) => setTypeDescription(e.target.value)}
                placeholder="Optional details about this defect type…"
              />
            </Field>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowTypeModal(false);
                  resetTypeForm();
                }}
                className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 
                           font-medium text-sm transition"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={saveType}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white 
                           py-2.5 rounded-lg font-medium text-sm flex items-center 
                           justify-center gap-2 transition disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : modalMode === "create" ? (
                  "Create Defect Type"
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ═══════════════════════════════════════════════ */}
      {showDeleteConfirm && deleteTarget && (
        <Modal onClose={() => setShowDeleteConfirm(false)} small>
          <div className="text-center">
            <div
              className="mx-auto w-12 h-12 bg-red-100 rounded-full flex 
                          items-center justify-center mb-4"
            >
              <Trash2 className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                "{deleteTarget.name}"
              </span>
              ?
              {deleteTarget.type === "category" && (
                <span className="block mt-1 text-red-500 text-xs">
                  This will also remove all defect types under this category.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 
                           font-medium text-sm transition"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={executeDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 
                           rounded-lg font-medium text-sm flex items-center 
                           justify-center gap-2 transition disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ============================================================
   SUB-COMPONENTS
============================================================ */

/** Reusable modal wrapper */
const Modal: React.FC<{
  children: React.ReactNode;
  onClose: () => void;
  small?: boolean;
}> = ({ children, onClose, small }) => (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div
      className={`bg-white rounded-xl shadow-2xl w-full p-6 
        animate-in fade-in zoom-in duration-200
        ${small ? "max-w-sm" : "max-w-md"}`}
    >
      <div className="flex justify-end -mt-2 -mr-2 mb-2">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg 
                     hover:bg-gray-100 transition"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

/** Reusable form field wrapper */
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    {children}
  </div>
);

/** Empty state placeholder */
const EmptyState: React.FC<{ message: string; onClear?: () => void }> = ({
  message,
  onClear,
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <Search size={40} className="mb-3 opacity-40" />
    <p className="text-sm">{message}</p>
    {onClear && (
      <button
        onClick={onClear}
        className="mt-3 text-purple-600 text-sm font-medium 
                   hover:underline transition"
      >
        Clear filters
      </button>
    )}
  </div>
);

export default DefectManagementSettings;