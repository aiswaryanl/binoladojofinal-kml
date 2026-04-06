// // src/components/CriteriaManagement.tsx

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { List, Plus, Trash2, Book, AlertTriangle, Edit2, X, CheckCircle } from 'lucide-react';
// import axios from 'axios';

// // ====================================================================================
// // --- AXIOS API CONFIGURATION ---
// // ====================================================================================
// const api = axios.create({
//     baseURL: "http://127.0.0.1:8000",
//     headers: { 'Content-Type': 'application/json' },
// });

// // ====================================================================================
// // --- TYPE DEFINITIONS ---
// // ====================================================================================
// interface Level {
//     level_id: number;
//     level_name: string;
// }

// // Updated to match your Serializer fields
// interface Criterion {
//     id: number;
//     level: number;
//     level_name?: string; // Read-only from serializer
//     criteria_text: string;
//     display_order: number;
//     is_active: boolean;
// }

// // ====================================================================================
// // --- REACT COMPONENT ---
// // ====================================================================================
// function CriteriaManagement() {
//     const navigate = useNavigate();

//     // Data State
//     const [criteria, setCriteria] = useState<Criterion[]>([]);
//     const [levels, setLevels] = useState<Level[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     // Form State
//     const [editingId, setEditingId] = useState<number | null>(null); // Track which ID we are editing
//     const [criteriaText, setCriteriaText] = useState('');
//     const [selectedLevelId, setSelectedLevelId] = useState<number | string>('');
//     const [displayOrder, setDisplayOrder] = useState('0');
//     const [isActive, setIsActive] = useState(true);

//     // --- 1. Fetch Data ---
//     useEffect(() => {
//         fetchData();
//     }, []);

//     const fetchData = async () => {
//         try {
//             setLoading(true);
//             setError(null);
//             const [criteriaRes, levelsRes] = await Promise.all([
//                 api.get<Criterion[]>('criteria/'),
//                 api.get<Level[]>('levels/')
//             ]);

//             // Sort criteria by level, then by display order
//             const sortedCriteria = sortCriteria(criteriaRes.data);

//             setCriteria(sortedCriteria);
//             setLevels(levelsRes.data);

//             // Set default level selection if available and not editing
//             if (levelsRes.data.length > 0 && !selectedLevelId) {
//                 setSelectedLevelId(levelsRes.data[0].level_id);
//             }
//         } catch (err: any) {
//             console.error(err);
//             setError("Failed to fetch data. Ensure API is running.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Helper to sort list
//     const sortCriteria = (list: Criterion[]) => {
//         return [...list].sort((a, b) => {
//             if (a.level !== b.level) return a.level - b.level;
//             return a.display_order - b.display_order;
//         });
//     };

//     // --- 2. Handle Edit Setup ---
//     const handleEditClick = (crit: Criterion) => {
//         setEditingId(crit.id);
//         setCriteriaText(crit.criteria_text);
//         setSelectedLevelId(crit.level);
//         setDisplayOrder(String(crit.display_order));
//         setIsActive(crit.is_active);

//         // Scroll to form
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     };

//     const resetForm = () => {
//         setEditingId(null);
//         setCriteriaText('');
//         setDisplayOrder('0');
//         setIsActive(true);
//         // We leave the level as is for convenience
//     };

//     // --- 3. Handle Submit (Create or Update) ---
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!criteriaText || !selectedLevelId) {
//             alert('Please fill in all fields.');
//             return;
//         }

//         const payload = {
//             criteria_text: criteriaText,
//             level: Number(selectedLevelId),
//             display_order: Number(displayOrder),
//             is_active: isActive,
//         };

//         try {
//             if (editingId) {
//                 // --- UPDATE (PUT) ---
//                 const response = await api.put<Criterion>(`criteria/${editingId}/`, payload);

//                 // Update local state
//                 const updatedList = criteria.map(item => 
//                     item.id === editingId ? { ...response.data, level_name: getLevelName(response.data.level) } : item
//                 );
//                 setCriteria(sortCriteria(updatedList));
//                 alert('Criterion updated successfully!');
//             } else {
//                 // --- CREATE (POST) ---
//                 const response = await api.post<Criterion>('criteria/', payload);

//                 // Add to local state
//                 const newItem = { ...response.data, level_name: getLevelName(response.data.level) };
//                 setCriteria(sortCriteria([...criteria, newItem]));
//             }
//             resetForm();
//         } catch (err: any) {
//             console.error(err);
//             alert(`Operation failed: ${err.response?.data?.detail || err.message}`);
//         }
//     };

//     // --- 4. Handle Delete ---
//     const handleDelete = async (id: number) => {
//         if (!window.confirm('Are you sure you want to delete this criterion?')) {
//             return;
//         }
//         try {
//             await api.delete(`criteria/${id}/`);
//             setCriteria(prev => prev.filter(c => c.id !== id));

//             // If we deleted the item currently being edited, reset form
//             if (editingId === id) resetForm();
//         } catch (err: any) {
//             alert(`Failed to delete: ${err.message}`);
//         }
//     };

//     // Helper to find level name for UI updates
//     const getLevelName = (id: number) => levels.find(l => l.level_id === id)?.level_name || 'Unknown';

//     if (loading) return <div className="text-center p-10">Loading...</div>;

//     return (
//         <div className="p-8 max-w-5xl mx-auto">
//             {/* Header */}
//             <div className="flex items-center justify-between mb-6">
//                 <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
//                     <Book className="text-blue-600" /> Criteria Management
//                 </h1>
//                 <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">Go Back</button>
//             </div>

//             {error && (
//                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
//                     <p className="font-bold flex items-center gap-2"><AlertTriangle size={20} /> Error</p>
//                     <p>{error}</p>
//                 </div>
//             )}

//             {/* --- Form Section (Add or Edit) --- */}
//             <div className={`p-6 rounded-lg shadow-md mb-8 border-t-4 ${editingId ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-blue-500'}`}>
//                 <div className="flex justify-between items-center mb-4">
//                     <h2 className={`text-xl font-bold flex items-center gap-2 ${editingId ? 'text-yellow-700' : 'text-gray-700'}`}>
//                         {editingId ? <><Edit2 size={20}/> Edit Criterion</> : <><Plus size={20}/> Add New Criterion</>}
//                     </h2>
//                     {editingId && (
//                         <button onClick={resetForm} className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
//                             <X size={16}/> Cancel Edit
//                         </button>
//                     )}
//                 </div>

//                 <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

//                     {/* Criterion Text */}
//                     <div className="md:col-span-6">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Criterion Text</label>
//                         <input
//                             type="text"
//                             value={criteriaText}
//                             onChange={(e) => setCriteriaText(e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                             placeholder="e.g., Awareness of safety protocols..."
//                             required
//                         />
//                     </div>

//                     {/* Level Select */}
//                     <div className="md:col-span-3">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
//                         <select
//                             value={selectedLevelId}
//                             onChange={(e) => setSelectedLevelId(Number(e.target.value))}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                             required
//                         >
//                             <option value="" disabled>Select Level</option>
//                             {levels.map(level => (
//                                 <option key={level.level_id} value={level.level_id}>
//                                     {level.level_name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     {/* Display Order */}
//                     <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
//                         <input
//                             type="number"
//                             value={displayOrder}
//                             onChange={(e) => setDisplayOrder(e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                             min="0"
//                         />
//                     </div>

//                     {/* Is Active Checkbox - Aligned differently */}
//                     <div className="md:col-span-1 flex justify-center pb-3">
//                          <label className="flex items-center cursor-pointer" title="Is Active?">
//                             <input
//                                 type="checkbox"
//                                 checked={isActive}
//                                 onChange={(e) => setIsActive(e.target.checked)}
//                                 className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
//                             />
//                         </label>
//                     </div>
//                 </form>

//                 {/* Form Actions */}
//                 <div className="mt-4 flex justify-end">
//                     <button 
//                         onClick={handleSubmit}
//                         className={`font-bold py-2 px-6 rounded-lg shadow-sm transition flex items-center gap-2 ${
//                             editingId 
//                             ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
//                             : 'bg-blue-600 hover:bg-blue-700 text-white'
//                         }`}
//                     >
//                         {editingId ? 'Update Criterion' : 'Add Criterion'}
//                     </button>
//                 </div>
//             </div>

//             {/* --- List Section --- */}
//             <div className="bg-white p-6 rounded-lg shadow-md">
//                 <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
//                     <List /> Existing Criteria ({criteria.length})
//                 </h2>

//                 <div className="overflow-x-auto">
//                     <table className="min-w-full text-left text-sm whitespace-nowrap">
//                         <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50 text-gray-600">
//                             <tr>
//                                 <th scope="col" className="px-4 py-3">Order</th>
//                                 <th scope="col" className="px-4 py-3">Level</th>
//                                 <th scope="col" className="px-4 py-3 w-full">Criterion Text</th>
//                                 <th scope="col" className="px-4 py-3 text-center">Status</th>
//                                 <th scope="col" className="px-4 py-3 text-right">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {criteria.length > 0 ? criteria.map((crit) => (
//                                 <tr key={crit.id} className={`border-b hover:bg-gray-50 ${editingId === crit.id ? 'bg-yellow-50' : ''}`}>
//                                     <td className="px-4 py-3 font-mono text-gray-500">{crit.display_order}</td>
//                                     <td className="px-4 py-3 font-semibold text-blue-700">
//                                         {crit.level_name || getLevelName(crit.level)}
//                                     </td>
//                                     <td className="px-4 py-3 whitespace-normal text-gray-800 max-w-md">
//                                         {crit.criteria_text}
//                                     </td>
//                                     <td className="px-4 py-3 text-center">
//                                         {crit.is_active ? (
//                                             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
//                                                 Active
//                                             </span>
//                                         ) : (
//                                             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                                                 Inactive
//                                             </span>
//                                         )}
//                                     </td>
//                                     <td className="px-4 py-3 text-right">
//                                         <div className="flex items-center justify-end gap-2">
//                                             <button 
//                                                 onClick={() => handleEditClick(crit)} 
//                                                 className="p-1 text-yellow-600 hover:bg-yellow-100 rounded transition"
//                                                 title="Edit"
//                                             >
//                                                 <Edit2 size={18} />
//                                             </button>
//                                             <button 
//                                                 onClick={() => handleDelete(crit.id)} 
//                                                 className="p-1 text-red-500 hover:bg-red-100 rounded transition"
//                                                 title="Delete"
//                                             >
//                                                 <Trash2 size={18} />
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             )) : (
//                                 <tr>
//                                     <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
//                                         No criteria found. Add one above.
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default CriteriaManagement;

// src/components/CriteriaManagement.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Plus, Trash2, Book, AlertTriangle, Edit2, X, Filter } from 'lucide-react';
import axios from 'axios';

// ====================================================================================
// --- CONFIGURATION ---
// ====================================================================================
const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: { 'Content-Type': 'application/json' },
});

// !!! CHANGE THIS IF YOUR DATABASE ID FOR LEVEL 1 IS DIFFERENT !!!
const RESTRICTED_LEVEL_ID = 1;

// ====================================================================================
// --- TYPE DEFINITIONS ---
// ====================================================================================
interface Level {
    level_id: number;
    level_name: string;
}

interface Criterion {
    id: number;
    level: number;
    level_name?: string;
    criteria_text: string;
    display_order: number;
    is_active: boolean;
}

// ====================================================================================
// --- REACT COMPONENT ---
// ====================================================================================
function CriteriaManagement() {
    const navigate = useNavigate();

    // --- Data State ---
    const [allCriteria, setAllCriteria] = useState<Criterion[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Filter State ---
    const [filterLevelId, setFilterLevelId] = useState<number | string>('');

    // --- Form State ---
    const [editingId, setEditingId] = useState<number | null>(null);
    const [criteriaText, setCriteriaText] = useState('');
    const [selectedLevelId, setSelectedLevelId] = useState<number | string>('');
    const [displayOrder, setDisplayOrder] = useState('0');
    const [isActive, setIsActive] = useState(true);

    // --- 1. Fetch Data ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [criteriaRes, levelsRes] = await Promise.all([
                api.get<Criterion[]>('criteria/'),
                api.get<Level[]>('levels/')
            ]);

            // --- RESTRICTION LOGIC START ---
            // Filter out Level 1 from the levels list (so it doesn't show in dropdowns)
            const allowedLevels = levelsRes.data.filter(l => l.level_id !== RESTRICTED_LEVEL_ID);

            // Filter out Level 1 data (so it doesn't show in the list)
            const allowedCriteria = criteriaRes.data.filter(c => c.level !== RESTRICTED_LEVEL_ID);
            // --- RESTRICTION LOGIC END ---

            const sorted = sortCriteria(allowedCriteria);

            setAllCriteria(sorted);
            setLevels(allowedLevels);

            // Automatically select the first ALLOWED level (e.g., Level 2)
            if (allowedLevels.length > 0) {
                setFilterLevelId(allowedLevels[0].level_id);
                setSelectedLevelId(allowedLevels[0].level_id);
            }

        } catch (err: any) {
            console.error(err);
            setError("Failed to fetch data. Ensure API is running.");
        } finally {
            setLoading(false);
        }
    };

    const sortCriteria = (list: Criterion[]) => {
        return [...list].sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return a.display_order - b.display_order;
        });
    };

    // --- 2. Filter Logic ---
    useEffect(() => {
        if (filterLevelId) {
            setSelectedLevelId(filterLevelId);
        }
    }, [filterLevelId]);

    const displayedCriteria = filterLevelId
        ? allCriteria.filter(c => c.level === Number(filterLevelId))
        : [];

    // --- 3. Handle Edit ---
    const handleEditClick = (crit: Criterion) => {
        setEditingId(crit.id);
        setCriteriaText(crit.criteria_text);
        setSelectedLevelId(crit.level);
        setDisplayOrder(String(crit.display_order));
        setIsActive(crit.is_active);
        setFilterLevelId(crit.level);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingId(null);
        setCriteriaText('');
        setDisplayOrder('0');
        setIsActive(true);
        if (filterLevelId) setSelectedLevelId(filterLevelId);
    };

    // --- 4. Handle Submit ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Safety check to ensure Level 1 isn't submitted even if hacked
        if (Number(selectedLevelId) === RESTRICTED_LEVEL_ID) {
            alert("Modifying Level 1 is not allowed.");
            return;
        }

        if (!criteriaText || !selectedLevelId) {
            alert('Please fill in all fields.');
            return;
        }

        const payload = {
            criteria_text: criteriaText,
            level: Number(selectedLevelId),
            display_order: Number(displayOrder),
            is_active: isActive,
        };

        try {
            let updatedList = [...allCriteria];

            if (editingId) {
                const response = await api.put<Criterion>(`criteria/${editingId}/`, payload);
                updatedList = updatedList.map(item =>
                    item.id === editingId ? { ...response.data, level_name: getLevelName(response.data.level) } : item
                );
                alert('Updated successfully');
            } else {
                const response = await api.post<Criterion>('criteria/', payload);
                const newItem = { ...response.data, level_name: getLevelName(response.data.level) };
                updatedList = [...updatedList, newItem];
            }

            setAllCriteria(sortCriteria(updatedList));
            resetForm();
            setFilterLevelId(Number(selectedLevelId));
        } catch (err: any) {
            alert(`Operation failed: ${err.response?.data?.detail || err.message}`);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`criteria/${id}/`);
            setAllCriteria(prev => prev.filter(c => c.id !== id));
            if (editingId === id) resetForm();
        } catch (err: any) {
            alert(`Failed to delete: ${err.message}`);
        }
    };

    const getLevelName = (id: number) => levels.find(l => l.level_id === id)?.level_name || 'Unknown';

    if (loading) return <div className="text-center p-10">Loading...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Book className="text-blue-600" /> Criteria Management
                </h1>
                <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">Go Back</button>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 mb-6 rounded">{error}</div>}

            {/* --- FILTER SECTION --- */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4 w-full md:w-1/2">
                    <div className="flex items-center gap-2 text-blue-800 font-bold">
                        <Filter size={20} />
                        <span>Select Level:</span>
                    </div>
                    <select
                        value={filterLevelId}
                        onChange={(e) => setFilterLevelId(Number(e.target.value))}
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        {/* Note: Level 1 is already filtered out of 'levels' array */}
                        {levels.map(level => (
                            <option key={level.level_id} value={level.level_id}>
                                {level.level_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- FORM SECTION --- */}
            <div className={`p-6 rounded-lg shadow-md mb-8 border-t-4 ${editingId ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-blue-500'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${editingId ? 'text-yellow-700' : 'text-gray-700'}`}>
                        {editingId ? <><Edit2 size={20} /> Edit Criterion</> : <><Plus size={20} /> Add New Criterion</>}
                    </h2>
                    {editingId && (
                        <button onClick={resetForm} className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
                            <X size={16} /> Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Criterion Text</label>
                        <input
                            type="text"
                            value={criteriaText}
                            onChange={(e) => setCriteriaText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Level</label>
                        <select
                            value={selectedLevelId}
                            onChange={(e) => setSelectedLevelId(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {levels.map(level => (
                                <option key={level.level_id} value={level.level_id}>
                                    {level.level_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                        <input
                            type="number"
                            value={displayOrder}
                            onChange={(e) => setDisplayOrder(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="md:col-span-1 flex justify-center pb-3">
                        <label className="flex items-center cursor-pointer" title="Is Active?">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                        </label>
                    </div>

                    <div className="md:col-span-12 flex justify-end mt-2">
                        <button type="submit" className={`font-bold py-2 px-6 rounded-lg text-white ${editingId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {editingId ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>

            {/* --- LIST SECTION --- */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <List />
                    {filterLevelId
                        ? `Criteria for: ${getLevelName(Number(filterLevelId))}`
                        : 'Select a level'}
                </h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                        <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-4 py-3">Order</th>
                                <th className="px-4 py-3 w-full">Criterion Text</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedCriteria.length > 0 ? displayedCriteria.map((crit) => (
                                <tr key={crit.id} className={`border-b hover:bg-gray-50 ${editingId === crit.id ? 'bg-yellow-50' : ''}`}>
                                    <td className="px-4 py-3 font-mono text-gray-500">{crit.display_order}</td>
                                    <td className="px-4 py-3 whitespace-normal text-gray-800 max-w-md">{crit.criteria_text}</td>
                                    <td className="px-4 py-3 text-center">
                                        {crit.is_active
                                            ? <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded text-xs">Active</span>
                                            : <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs">Inactive</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEditClick(crit)} className="p-1 text-yellow-600 hover:bg-yellow-100 rounded">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(crit.id)} className="p-1 text-red-500 hover:bg-red-100 rounded">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                                        No criteria found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default CriteriaManagement;