// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { List, Plus, Trash2, Book, AlertTriangle, Edit2, X, Check } from 'lucide-react';
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
// interface Topic {
//     id?: number;
//     sr_no: number;
//     topic_name: string;
//     description: string;
// }

// // ====================================================================================
// // --- REACT COMPONENT ---
// // ====================================================================================
// function TopicManagement() {
//     const navigate = useNavigate();
//     const [topics, setTopics] = useState<Topic[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     // Form state
//     const [srNo, setSrNo] = useState('');
//     const [topicName, setTopicName] = useState('');
//     const [description, setDescription] = useState('');

//     // Edit state
//     const [editingId, setEditingId] = useState<number | null>(null);
//     const [editSrNo, setEditSrNo] = useState('');
//     const [editTopicName, setEditTopicName] = useState('');
//     const [editDescription, setEditDescription] = useState('');

//     // Fetch existing topics
//     useEffect(() => {
//         const fetchTopics = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);
//                 const response = await api.get<Topic[]>('topics/');
//                 setTopics(response.data.sort((a, b) => a.sr_no - b.sr_no));
//             } catch (err: any) {
//                 if (err.response?.status === 403) {
//                     setError("Permission Denied. Please ensure you are logged in as a Django administrator.");
//                 } else {
//                     setError("Failed to fetch topics. The API might be down.");
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchTopics();
//     }, []);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!srNo || !topicName || !description) {
//             alert('Please fill in all fields.');
//             return;
//         }

//         // Check for duplicate sr_no
//         if (topics.some(t => t.sr_no === Number(srNo))) {
//             alert('Serial Number already exists. Please use a unique serial number.');
//             return;
//         }

//         try {
//             const payload = {
//                 sr_no: Number(srNo),
//                 topic_name: topicName,
//                 description: description,
//             };
//             const response = await api.post<Topic>('topics/', payload);

//             // Add new topic to the list and sort it
//             setTopics(prev => [...prev, response.data].sort((a, b) => a.sr_no - b.sr_no));

//             // Clear form
//             setSrNo('');
//             setTopicName('');
//             setDescription('');

//             alert('Topic added successfully!');
//         } catch (err: any) {
//             alert(`Failed to add topic: ${err.response?.data?.detail || err.message}`);
//         }
//     };

//     const handleEdit = (topic: Topic) => {
//         setEditingId(topic.id || null);
//         setEditSrNo(topic.sr_no.toString());
//         setEditTopicName(topic.topic_name);
//         setEditDescription(topic.description);
//     };

//     const handleCancelEdit = () => {
//         setEditingId(null);
//         setEditSrNo('');
//         setEditTopicName('');
//         setEditDescription('');
//     };

//     const handleUpdate = async (id: number) => {
//         if (!editSrNo || !editTopicName || !editDescription) {
//             alert('Please fill in all fields.');
//             return;
//         }

//         // Check for duplicate sr_no (excluding current topic)
//         if (topics.some(t => t.sr_no === Number(editSrNo) && t.id !== id)) {
//             alert('Serial Number already exists. Please use a unique serial number.');
//             return;
//         }

//         try {
//             const payload = {
//                 sr_no: Number(editSrNo),
//                 topic_name: editTopicName,
//                 description: editDescription,
//             };
//             const response = await api.put<Topic>(`topics/${id}/`, payload);

//             // Update topic in the list and re-sort
//             setTopics(prev => 
//                 prev.map(t => t.id === id ? response.data : t).sort((a, b) => a.sr_no - b.sr_no)
//             );

//             handleCancelEdit();
//             alert('Topic updated successfully!');
//         } catch (err: any) {
//             alert(`Failed to update topic: ${err.response?.data?.detail || err.message}`);
//         }
//     };

//     const handleDelete = async (id: number) => {
//         if (!window.confirm('Are you sure you want to delete this topic?')) {
//             return;
//         }
//         try {
//             await api.delete(`topics/${id}/`);
//             setTopics(prev => prev.filter(t => t.id !== id));
//             alert('Topic deleted successfully!');
//         } catch (err: any) {
//             alert(`Failed to delete topic: ${err.response?.data?.detail || err.message}`);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                     <p className="text-gray-600">Loading topics...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="p-8 max-w-6xl mx-auto">
//             <div className="flex items-center justify-between mb-6">
//                 <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
//                     <Book className="text-blue-600" /> 
//                     Topic Management
//                 </h1>
//                 <button 
//                     onClick={() => navigate(-1)} 
//                     className="text-blue-600 hover:underline font-medium"
//                 >
//                     ← Go Back
//                 </button>
//             </div>

//             {error && (
//                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
//                     <p className="font-bold flex items-center gap-2">
//                         <AlertTriangle size={20} /> Error
//                     </p>
//                     <p>{error}</p>
//                 </div>
//             )}

//             {/* --- Add New Topic Form --- */}
//             <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//                 <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
//                     <Plus className="text-green-600" /> Add New Topic
//                 </h2>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div>
//                             <label htmlFor="srNo" className="block text-sm font-medium text-gray-600 mb-1">
//                                 Serial Number <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 id="srNo"
//                                 type="number"
//                                 value={srNo}
//                                 onChange={(e) => setSrNo(e.target.value)}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 placeholder="e.g., 1"
//                                 required
//                                 min="1"
//                             />
//                         </div>
//                         <div className="md:col-span-2">
//                             <label htmlFor="topicName" className="block text-sm font-medium text-gray-600 mb-1">
//                                 Topic Name <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 id="topicName"
//                                 type="text"
//                                 value={topicName}
//                                 onChange={(e) => setTopicName(e.target.value)}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 placeholder="e.g., Quality Awareness"
//                                 required
//                             />
//                         </div>
//                     </div>
//                     <div>
//                         <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">
//                             Description <span className="text-red-500">*</span>
//                         </label>
//                         <textarea
//                             id="description"
//                             value={description}
//                             onChange={(e) => setDescription(e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
//                             placeholder="Enter detailed description of the topic..."
//                             required
//                         />
//                     </div>
//                     <div className="flex justify-end">
//                         <button 
//                             type="submit" 
//                             className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
//                         >
//                             <Plus size={18} /> Add Topic
//                         </button>
//                     </div>
//                 </form>
//             </div>

//             {/* --- Existing Topics List --- */}
//             <div className="bg-white p-6 rounded-lg shadow-md">
//                 <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
//                     <List className="text-indigo-600" /> Existing Topics ({topics.length})
//                 </h2>
//                 <div className="space-y-3">
//                     {topics.length > 0 ? topics.map(topic => (
//                         <div key={topic.id} className="p-4 bg-gray-50 rounded-md border border-gray-200 hover:border-blue-300 transition">
//                             {editingId === topic.id ? (
//                                 // Edit Mode
//                                 <div className="space-y-3">
//                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                                         <div>
//                                             <label className="block text-xs font-medium text-gray-600 mb-1">
//                                                 Serial Number
//                                             </label>
//                                             <input
//                                                 type="number"
//                                                 value={editSrNo}
//                                                 onChange={(e) => setEditSrNo(e.target.value)}
//                                                 className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                                 min="1"
//                                             />
//                                         </div>
//                                         <div className="md:col-span-2">
//                                             <label className="block text-xs font-medium text-gray-600 mb-1">
//                                                 Topic Name
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={editTopicName}
//                                                 onChange={(e) => setEditTopicName(e.target.value)}
//                                                 className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                             />
//                                         </div>
//                                     </div>
//                                     <div>
//                                         <label className="block text-xs font-medium text-gray-600 mb-1">
//                                             Description
//                                         </label>
//                                         <textarea
//                                             value={editDescription}
//                                             onChange={(e) => setEditDescription(e.target.value)}
//                                             className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
//                                         />
//                                     </div>
//                                     <div className="flex justify-end gap-2">
//                                         <button
//                                             onClick={() => handleUpdate(topic.id!)}
//                                             className="bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 transition flex items-center gap-1 text-sm"
//                                         >
//                                             <Check size={16} /> Save
//                                         </button>
//                                         <button
//                                             onClick={handleCancelEdit}
//                                             className="bg-gray-500 text-white px-4 py-1.5 rounded-md hover:bg-gray-600 transition flex items-center gap-1 text-sm"
//                                         >
//                                             <X size={16} /> Cancel
//                                         </button>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 // View Mode
//                                 <div className="flex items-start justify-between">
//                                     <div className="flex-1">
//                                         <div className="flex items-center gap-3 mb-2">
//                                             <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white font-bold rounded-full text-sm">
//                                                 {topic.sr_no}
//                                             </span>
//                                             <h3 className="text-lg font-semibold text-gray-800">
//                                                 {topic.topic_name}
//                                             </h3>
//                                         </div>
//                                         <p className="text-gray-600 text-sm ml-13 pl-1">
//                                             {topic.description}
//                                         </p>
//                                     </div>
//                                     <div className="flex gap-2 ml-4">
//                                         <button
//                                             onClick={() => handleEdit(topic)}
//                                             className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition"
//                                             title="Edit topic"
//                                         >
//                                             <Edit2 size={18} />
//                                         </button>
//                                         <button
//                                             onClick={() => handleDelete(topic.id!)}
//                                             className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition"
//                                             title="Delete topic"
//                                         >
//                                             <Trash2 size={18} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     )) : (
//                         <div className="text-center py-8">
//                             <p className="text-gray-500 mb-2">No topics found.</p>
//                             <p className="text-gray-400 text-sm">Add your first topic using the form above.</p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default TopicManagement;




import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Plus, Trash2, Book, AlertTriangle, Edit2, X, Check } from 'lucide-react';
import axios from 'axios';

// ====================================================================================
// --- AXIOS API CONFIGURATION ---
// ====================================================================================
const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: { 'Content-Type': 'application/json' },
});

// ====================================================================================
// --- TYPE DEFINITIONS ---
// ====================================================================================
interface Topic {
    sr_no: number;
    topic_name: string;
    description: string;
}

// ====================================================================================
// --- REACT COMPONENT ---
// ====================================================================================
function TopicManagement() {
    const navigate = useNavigate();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filteredTopics, setFilteredTopics] = useState<string[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Form state
    const [srNo, setSrNo] = useState('');
    const [topicName, setTopicName] = useState('');
    const [description, setDescription] = useState('');

    // Edit state
    const [editingSrNo, setEditingSrNo] = useState<number | null>(null);
    const [editSrNo, setEditSrNo] = useState('');
    const [editTopicName, setEditTopicName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Fetch existing topics
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get<Topic[]>('topics/');
                setTopics(response.data.sort((a, b) => a.sr_no - b.sr_no));
            } catch (err: any) {
                if (err.response?.status === 403) {
                    setError("Permission Denied. Please ensure you are logged in as a Django administrator.");
                } else {
                    setError("Failed to fetch topics. The API might be down.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchTopics();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!srNo || !topicName || !description) {
            alert('Please fill in all fields.');
            return;
        }

        // Check for duplicate sr_no
        if (topics.some(t => t.sr_no === Number(srNo))) {
            alert('Serial Number already exists. Please use a unique serial number.');
            return;
        }

        try {
            const payload = {
                sr_no: Number(srNo),
                topic_name: topicName,
                description: description,
            };
            const response = await api.post<Topic>('topics/', payload);

            // Add new topic to the list and sort it
            setTopics(prev => [...prev, response.data].sort((a, b) => a.sr_no - b.sr_no));

            // Clear form
            setSrNo('');
            setTopicName('');
            setDescription('');

            alert('Topic added successfully!');
        } catch (err: any) {
            alert(`Failed to add topic: ${err.response?.data?.detail || err.message}`);
        }
    };

    const handleEdit = (topic: Topic) => {
        setEditingSrNo(topic.sr_no);
        setEditSrNo(topic.sr_no.toString());
        setEditTopicName(topic.topic_name);
        setEditDescription(topic.description);
    };

    const handleCancelEdit = () => {
        setEditingSrNo(null);
        setEditSrNo('');
        setEditTopicName('');
        setEditDescription('');
    };

    const handleUpdate = async (originalSrNo: number) => {
        if (!editSrNo || !editTopicName || !editDescription) {
            alert('Please fill in all fields.');
            return;
        }

        // Check for duplicate sr_no (excluding current topic)
        if (topics.some(t => t.sr_no === Number(editSrNo) && t.sr_no !== originalSrNo)) {
            alert('Serial Number already exists. Please use a unique serial number.');
            return;
        }

        try {
            const payload = {
                sr_no: Number(editSrNo),
                topic_name: editTopicName,
                description: editDescription,
            };
            const response = await api.put<Topic>(`topics/${originalSrNo}/`, payload);

            // Update topic in the list and re-sort
            setTopics(prev =>
                prev.map(t => t.sr_no === originalSrNo ? response.data : t).sort((a, b) => a.sr_no - b.sr_no)
            );

            handleCancelEdit();
            alert('Topic updated successfully!');
        } catch (err: any) {
            alert(`Failed to update topic: ${err.response?.data?.detail || err.message}`);
        }
    };

    const handleDelete = async (srNo: number) => {
        if (!window.confirm('Are you sure you want to delete this topic?')) {
            return;
        }
        try {
            await api.delete(`topics/${srNo}/`);
            setTopics(prev => prev.filter(t => t.sr_no !== srNo));
            alert('Topic deleted successfully!');
        } catch (err: any) {
            alert(`Failed to delete topic: ${err.response?.data?.detail || err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading topics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Book className="text-blue-600" />
                    Topic Management
                </h1>
                <button
                    onClick={() => navigate(-1)}
                    className="text-blue-600 hover:underline font-medium"
                >
                    ← Go Back
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
                    <p className="font-bold flex items-center gap-2">
                        <AlertTriangle size={20} /> Error
                    </p>
                    <p>{error}</p>
                </div>
            )}

            {/* --- Add New Topic Form --- */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Plus className="text-green-600" /> Add New Topic
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="srNo" className="block text-sm font-medium text-gray-600 mb-1">
                                Serial Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="srNo"
                                type="number"
                                value={srNo}
                                onChange={(e) => setSrNo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., 1"
                                required
                                min="1"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="topicName" className="block text-sm font-medium text-gray-600 mb-1">
                                Topic Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="topicName"
                                    type="text"
                                    value={topicName}
                                    onChange={e => {
                                        const value = e.target.value;
                                        setTopicName(value);
                                        // Always filter from unique values
                                        const uniqueTopicNames = Array.from(new Set(topics.map(t => t.topic_name)));
                                        if (value.length > 0) {
                                            setFilteredTopics(
                                                uniqueTopicNames.filter(name =>
                                                    name.toLowerCase().includes(value.toLowerCase())
                                                )
                                            );
                                            setShowDropdown(true);
                                        } else {
                                            setFilteredTopics(uniqueTopicNames); // Show all on empty input
                                            setShowDropdown(true);
                                        }
                                    }}
                                    onFocus={() => {
                                        const uniqueTopicNames = Array.from(new Set(topics.map(t => t.topic_name)));
                                        setFilteredTopics(uniqueTopicNames);
                                        setShowDropdown(true);
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => setShowDropdown(false), 150); // Let dropdown click register
                                    }}
                                    autoComplete="off"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    placeholder="Type or select a topic"
                                    required
                                />
                                {showDropdown && filteredTopics.length > 0 && (
                                    <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto ring-1 ring-black ring-opacity-5 transition">
                                        {filteredTopics.map((name, idx) => (
                                            <li
                                                key={idx}
                                                className="px-5 py-2 text-sm text-gray-800 hover:bg-blue-500 hover:text-white transition-colors duration-200 cursor-pointer select-none first:rounded-t-xl last:rounded-b-xl border-b last:border-b-0 border-gray-100 flex items-center gap-2"
                                                onMouseDown={() => {
                                                    setTopicName(name);
                                                    setShowDropdown(false);
                                                }}
                                            >
                                                {name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                            placeholder="Enter detailed description of the topic..."
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <Plus size={18} /> Add Topic
                        </button>
                    </div>
                </form>
            </div>

            {/* --- Existing Topics List --- */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <List className="text-indigo-600" /> Existing Topics ({topics.length})
                </h2>
                <div className="space-y-3">
                    {topics.length > 0 ? topics.map(topic => (
                        <div key={topic.sr_no} className="p-4 bg-gray-50 rounded-md border border-gray-200 hover:border-blue-300 transition">
                            {editingSrNo === topic.sr_no ? (
                                // Edit Mode
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Serial Number
                                            </label>
                                            <input
                                                type="number"
                                                value={editSrNo}
                                                onChange={(e) => setEditSrNo(e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                min="1"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Topic Name
                                            </label>
                                            <input
                                                type="text"
                                                value={editTopicName}
                                                onChange={(e) => setEditTopicName(e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleUpdate(topic.sr_no)}
                                            className="bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 transition flex items-center gap-1 text-sm"
                                        >
                                            <Check size={16} /> Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="bg-gray-500 text-white px-4 py-1.5 rounded-md hover:bg-gray-600 transition flex items-center gap-1 text-sm"
                                        >
                                            <X size={16} /> Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white font-bold rounded-full text-sm">
                                                {topic.sr_no}
                                            </span>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {topic.topic_name}
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 text-sm ml-13 pl-1">
                                            {topic.description}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleEdit(topic)}
                                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition"
                                            title="Edit topic"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(topic.id!)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition"
                                            title="Delete topic"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-2">No topics found.</p>
                            <p className="text-gray-400 text-sm">Add your first topic using the form above.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TopicManagement;