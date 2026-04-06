
// import { useState, useEffect, useMemo } from 'react';
// import {
//   CheckCircle,
//   XCircle,
//   Calendar,
//   Save,
//   Loader2,
//   ChevronLeft,
//   ChevronRight,
//   Users,
//   History,
//   Search,
// } from 'lucide-react';

// interface Batch { batch_id: string; start_date?: string; is_completed?: boolean; }
// interface Employee { id: number; first_name: string; last_name?: string; email?: string; temp_id?: string; emp_id?: string; full_name: string; }
// interface Day { days_id: number; day: string; }

// interface AttendanceMarkingProps { onSuccess: () => void; }

// export default function AttendanceMarking({ onSuccess }: AttendanceMarkingProps) {
//   const [viewMode, setViewMode] = useState<'active' | 'past'>('active');
//   const [batches, setBatches] = useState<Batch[]>([]);
//   const [selectedBatch, setSelectedBatch] = useState<string>('');
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [days, setDays] = useState<Day[]>([]);
//   const [currentDay, setCurrentDay] = useState(1);
//   const [currentDate, setCurrentDate] = useState('');
//   const [attendance, setAttendance] = useState<Record<number, 'present' | 'absent' | ''>>({});
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState('');
//   const [isBatchCompleted, setIsBatchCompleted] = useState(false);

//   // Pagination & Search
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortConfig, setSortConfig] = useState<{ key: 'full_name' | 'temp_id'; direction: 'asc' | 'desc' } | null>(null);

//   // Fetch days
//   useEffect(() => {
//     const fetchDays = async () => {
//       try {
//         const res = await fetch('http://192.168.2.51:8000/days/');
//         if (!res.ok) throw new Error('Failed to load days');
//         const data: Day[] = await res.json();
//         setDays(data.sort((a, b) => a.days_id - b.days_id));
//       } catch {
//         setError('Could not load training days');
//       }
//     };
//     fetchDays();
//   }, []);

//   // Fetch batches
//   useEffect(() => {
//     const fetchBatches = async () => {
//       setLoading(true);
//       const endpoint = viewMode === 'active'
//         ? 'http://192.168.2.51:8000/training-batches/active/'
//         : 'http://192.168.2.51:8000/training-batches/past/';
//       try {
//         const res = await fetch(endpoint);
//         if (!res.ok) throw new Error(`Failed to fetch ${viewMode} batches`);
//         const data: Batch[] = await res.json();
//         setBatches(data);
//         setSelectedBatch('');
//       } catch (err: any) {
//         setError(err.message || 'Failed to load batches');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBatches();
//   }, [viewMode]);

//   // Fetch batch details
//   useEffect(() => {
//     if (!selectedBatch) {
//       setEmployees([]); setAttendance({}); setPage(1); return;
//     }

//     const fetchBatchDetails = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`http://192.168.2.51:8000/attendance-detail/${selectedBatch}/`);
//         if (!res.ok) throw new Error('Failed to load batch');
//         const data = await res.json();

//         setIsBatchCompleted(data.is_completed || false);

//         const formattedEmployees: Employee[] = data.users.map((u: any) => ({
//           id: u.id,
//           first_name: u.first_name,
//           last_name: u.last_name || '',
//           temp_id: u.temp_id || `EMP${u.id}`,
//           emp_id: u.emp_id,
//           full_name: `${u.first_name} ${u.last_name || ''}`.trim(),
//         }));
//         setEmployees(formattedEmployees);

//         const initial: Record<number, 'present' | 'absent' | ''> = {};
//         data.users.forEach((user: any) => {
//           const status = user.attendances[currentDay];
//           if (status) initial[user.id] = status;
//         });
//         setAttendance(initial);

//         const date = new Date();
//         date.setDate(date.getDate() + currentDay - 1);
//         setCurrentDate(date.toISOString().split('T')[0]);
//       } catch (err: any) {
//         setError(err.message || 'Failed to load data');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBatchDetails();
//   }, [selectedBatch, currentDay]);

//   // Processed employees
//   const processedEmployees = useMemo(() => {
//     let list = searchTerm
//       ? employees.filter(e =>
//         e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         e.temp_id?.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//       : employees;

//     if (sortConfig) {
//       list = [...list].sort((a, b) => {
//         const aVal = a[sortConfig.key] ?? '';
//         const bVal = b[sortConfig.key] ?? '';
//         return (aVal < bVal ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1);
//       });
//     }
//     return list;
//   }, [employees, searchTerm, sortConfig]);

//   const totalPages = Math.max(1, Math.ceil(processedEmployees.length / pageSize));
//   const paginated = processedEmployees.slice((page - 1) * pageSize, page * pageSize);

//   useEffect(() => setPage(1), [searchTerm, selectedBatch]);

//   const handleSort = (key: 'full_name' | 'temp_id') => {
//     setSortConfig(prev =>
//       prev?.key === key
//         ? prev.direction === 'asc' ? null : { key, direction: 'asc' }
//         : { key, direction: 'asc' }
//     );
//   };

//   const toggleAttendance = (id: number, status: 'present' | 'absent') => {
//     if (viewMode === 'past' || isBatchCompleted) return;
//     setAttendance(prev => ({ ...prev, [id]: prev[id] === status ? '' : status }));
//   };

//   const handleSave = async () => {
//     const changes = Object.entries(attendance)
//       .filter(([_, s]) => s)
//       .map(([id, status]) => ({
//         user: Number(id),
//         batch: selectedBatch,
//         day_number: currentDay,
//         status,
//       }));

//     if (!changes.length) return setError('No changes to save');

//     setSaving(true);
//     try {
//       const res = await fetch('http://192.168.2.51:8000/attendances/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(changes),
//       });
//       if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
//       alert('Attendance saved successfully!');
//       onSuccess?.();
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="w-full bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
//       <div className="w-full mx-auto space-y-6">

//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div className="flex items-center gap-3">
//               <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg">
//                 <Calendar className="w-7 h-7 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Training Attendance</h1>
//                 <p className="text-sm text-gray-600">Mark daily attendance for training batches</p>
//               </div>
//             </div>
//             <div className="flex bg-gray-100 rounded-lg p-1">
//               <button onClick={() => setViewMode('active')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'active' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600'}`}>
//                 <Users className="w-4 h-4 inline mr-1" /> Active
//               </button>
//               <button onClick={() => setViewMode('past')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'past' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-600'}`}>
//                 <History className="w-4 h-4 inline mr-1" /> Past
//               </button>
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
//             {error}
//           </div>
//         )}

//         {/* Batch Selection */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
//               <select
//                 value={selectedBatch}
//                 onChange={(e) => setSelectedBatch(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gradient-blue focus:border-blue-500 text-sm"
//                 disabled={loading}
//               >
//                 <option value="">{loading ? 'Loading...' : '-- Select Batch --'}</option>
//                 {batches.map(b => (
//                   <option key={b.batch_id} value={b.batch_id}>
//                     {b.batch_id} {b.is_completed && '(Completed)'}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
//               <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-center py-3 px-4 rounded-lg font-bold text-xl shadow-md">
//                 {days.length}
//               </div>
//             </div>
//           </div>
//         </div>

//         {loading && (
//           <div className="flex justify-center py-12">
//             <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
//           </div>
//         )}

//         {selectedBatch && !loading && employees.length > 0 && (
//           <>
//             {/* Day Header with Gradient */}
//             <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl p-5 shadow-lg">
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//                 <div>
//                   <h2 className="text-2xl font-bold">Batch: {selectedBatch}</h2>
//                   <p className="text-sm opacity-90">
//                     Day {currentDay}
//                   </p>
//                   {isBatchCompleted && <span className="inline-block mt-2 px-4 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">Batch Completed</span>}
//                 </div>
//               </div>

//               {/* Day Navigation Pills */}
//               <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-2">
//                 <button onClick={() => setCurrentDay(d => Math.max(1, d - 1))} disabled={currentDay === 1} className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 disabled:opacity-50 transition">
//                   <ChevronLeft className="w-5 h-5" />
//                 </button>
//                 {days.map(d => (
//                   <button
//                     key={d.days_id}
//                     onClick={() => setCurrentDay(d.days_id)}
//                     disabled={viewMode === 'past'}
//                     className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${d.days_id === currentDay
//                       ? 'bg-white text-blue-700 shadow-lg'
//                       : 'bg-white/20 backdrop-blur hover:bg-white/30'
//                       }`}
//                   >
//                     {d.day}
//                   </button>
//                 ))}
//                 <button onClick={() => setCurrentDay(d => Math.min(days.length, d + 1))} disabled={currentDay === days.length} className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 disabled:opacity-50 transition">
//                   <ChevronRight className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>

//             {/* Search */}
//             <div className="relative">
//               <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search by name or ID..."
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
//               />
//             </div>

//             {/* Attendance Table */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
//                     <tr>
//                       <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>
//                       <th onClick={() => handleSort('temp_id')} className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-blue-100/50">
//                         Employee ID {sortConfig?.key === 'temp_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
//                       </th>
//                       <th onClick={() => handleSort('full_name')} className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-blue-100/50">
//                         Name {sortConfig?.key === 'full_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium text-gray-700">Attendance</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {paginated.map((emp, i) => (
//                       <tr key={emp.id} className="hover:bg-blue-50/30 transition">
//                         <td className="px-4 py-3 text-gray-600">{(page - 1) * pageSize + i + 1}</td>
//                         <td className="px-4 py-3">
//                           {emp.emp_id ? (
//                             <div className="flex flex-col">
//                               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 w-fit mb-1">
//                                 Permanent
//                               </span>
//                               <span className="font-mono font-medium text-purple-900">{emp.emp_id}</span>
//                             </div>
//                           ) : (
//                             <div className="flex flex-col">
//                               <span className="font-mono font-medium text-blue-700">{emp.temp_id}</span>
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-4 py-3 font-medium">{emp.full_name}</td>
//                         <td className="px-4 py-3">
//                           <div className="flex justify-center gap-4">
//                             <button
//                               onClick={() => toggleAttendance(emp.id, 'present')}
//                               disabled={viewMode === 'past' || isBatchCompleted}
//                               className={`px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${attendance[emp.id] === 'present'
//                                 ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
//                                 : 'bg-gray-100 text-gray-700 hover:bg-green-100'
//                                 } disabled:opacity-50`}
//                             >
//                               <CheckCircle className="w-5 h-5" /> Present
//                             </button>
//                             <button
//                               onClick={() => toggleAttendance(emp.id, 'absent')}
//                               disabled={viewMode === 'past' || isBatchCompleted}
//                               className={`px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${attendance[emp.id] === 'absent'
//                                 ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md'
//                                 : 'bg-gray-100 text-gray-700 hover:bg-red-100'
//                                 } disabled:opacity-50`}
//                             >
//                               <XCircle className="w-5 h-5" /> Absent
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               <div className="px-4 py-3 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
//                 <div className="flex items-center gap-2">
//                   <span className="text-gray-700">Rows:</span>
//                   <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }} className="px-3 py-1 border rounded">
//                     {[10, 25, 50].map(n => <option key={n}>{n}</option>)}
//                   </select>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-gray-200 rounded disabled:opacity-50">
//                     <ChevronLeft className="w-4 h-4" />
//                   </button>
//                   <span className="font-medium text-gray-700">Page {page} of {totalPages}</span>
//                   <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 hover:bg-gray-200 rounded disabled:opacity-50">
//                     <ChevronRight className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Save Button with Gradient */}
//             {viewMode === 'active' && !isBatchCompleted && (
//               <button
//                 onClick={handleSave}
//                 disabled={saving || !Object.values(attendance).some(v => v)}
//                 className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-200"
//               >
//                 {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
//                 {saving ? 'Saving Attendance...' : 'Save Attendance for Day ' + currentDay}
//               </button>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }



import { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle,
  XCircle,
  Calendar,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
  History,
  Search,
  RotateCcw,
  Lock,
  Unlock,
  BarChart3,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface Batch { 
  batch_id: string; 
  start_date?: string; 
  is_active: boolean;
}

interface Employee { 
  id: number; 
  first_name: string; 
  last_name?: string; 
  email?: string; 
  temp_id?: string; 
  emp_id?: string;
  full_name: string; 
}

interface Day { 
  days_id: number; 
  day: string; 
}

interface AttendanceMarkingProps { 
  onSuccess: () => void; 
}

interface CompletionStatus {
  batch_id: string;
  is_active: boolean;
  status: string;
  total_days: number;
  total_users: number;
  total_required_records: number;
  total_marked_records: number;
  completion_percentage: number;
  all_days_complete: boolean;
  day_by_day_status: {
    day_id: number;
    day_name: string;
    marked: number;
    total: number;
    is_complete: boolean;
    percentage: number;
  }[];
  can_auto_complete: boolean;
}

export default function AttendanceMarking({ onSuccess }: AttendanceMarkingProps) {
  const [viewMode, setViewMode] = useState<'active' | 'past'>('active');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [currentDate, setCurrentDate] = useState('');
  const [dayDates, setDayDates] = useState<Record<number, string>>({});
  const [attendance, setAttendance] = useState<Record<number, 'present' | 'absent' | ''>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isBatchCompleted, setIsBatchCompleted] = useState(false);
  
  // New state for completion tracking
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ 
    key: 'full_name' | 'temp_id' | 'emp_id'; 
    direction: 'asc' | 'desc' 
  } | null>(null);

  // Fetch days
  useEffect(() => {
    const fetchDays = async () => {
      try {
        const res = await fetch('http://192.168.2.51:8000/days/');
        if (!res.ok) throw new Error('Failed to load days');
        const data: Day[] = await res.json();
        setDays(data.sort((a, b) => a.days_id - b.days_id));
      } catch {
        setError('Could not load training days');
      }
    };
    fetchDays();
  }, []);

  // Fetch batches
  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true);
      const endpoint = viewMode === 'active'
        ? 'http://192.168.2.51:8000/training-batches/active/'
        : 'http://192.168.2.51:8000/training-batches/past/';
      try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Failed to fetch ${viewMode} batches`);
        const data: Batch[] = await res.json();
        setBatches(data);
        setSelectedBatch('');
        setCompletionStatus(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load batches');
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [viewMode]);

  // Fetch completion status
  const fetchCompletionStatus = async (batchId: string) => {
    try {
      const res = await fetch(`http://192.168.2.51:8000/batch/${batchId}/completion-status/`);
      if (res.ok) {
        const data: CompletionStatus = await res.json();
        setCompletionStatus(data);
        setIsBatchCompleted(!data.is_active);
      }
    } catch (err) {
      console.error('Failed to fetch completion status:', err);
    }
  };

  // Fetch batch details and saved dates
  useEffect(() => {
    if (!selectedBatch) {
      setEmployees([]);
      setAttendance({});
      setPage(1);
      setCurrentDate('');
      setDayDates({});
      setCompletionStatus(null);
      return;
    }

    const fetchBatchDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://192.168.2.51:8000/attendance-detail/${selectedBatch}/`);
        if (!res.ok) throw new Error('Failed to load batch');
        const data = await res.json();

        setIsBatchCompleted(!data.is_active);

        // Format employees with emp_id support
        const formattedEmployees: Employee[] = data.users.map((u: any) => ({
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name || '',
          temp_id: u.temp_id || null,
          emp_id: u.emp_id || null,
          full_name: `${u.first_name} ${u.last_name || ''}`.trim(),
        }));
        setEmployees(formattedEmployees);

        // Fetch saved dates and completion status
        await Promise.all([
          fetchSavedDates(selectedBatch, data.users),
          fetchCompletionStatus(selectedBatch)
        ]);

      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedDates = async (batchId: string, users: any[]) => {
      try {
        const res = await fetch(`http://192.168.2.51:8000/batch/${batchId}/all-attendance/`);
        if (res.ok) {
          const attendanceData = await res.json();
          
          const dateMap: Record<number, string> = {};
          attendanceData.forEach((record: any) => {
            if (record.attendance_date && !dateMap[record.day_number]) {
              dateMap[record.day_number] = record.attendance_date;
            }
          });
          
          setDayDates(dateMap);
          
          if (dateMap[currentDay]) {
            setCurrentDate(dateMap[currentDay]);
          }

          const initial: Record<number, 'present' | 'absent' | ''> = {};
          users.forEach((user: any) => {
            const status = user.attendances?.[currentDay];
            if (status) initial[user.id] = status;
          });
          setAttendance(initial);
        }
      } catch (err) {
        console.error('Failed to fetch saved dates:', err);
      }
    };

    fetchBatchDetails();
  }, [selectedBatch, currentDay]);

  // Update current date when day changes
  useEffect(() => {
    const newDate = dayDates[currentDay] || '';
    setCurrentDate(newDate);
    
    if (selectedBatch && employees.length > 0) {
      loadAttendanceForDay(currentDay);
    }
  }, [currentDay, dayDates]);

  // Load attendance for a specific day
  const loadAttendanceForDay = async (dayId: number) => {
    try {
      const res = await fetch(`http://192.168.2.51:8000/attendance-detail/${selectedBatch}/`);
      if (res.ok) {
        const data = await res.json();
        const initial: Record<number, 'present' | 'absent' | ''> = {};
        data.users.forEach((user: any) => {
          const status = user.attendances?.[dayId];
          if (status) initial[user.id] = status;
        });
        setAttendance(initial);
      }
    } catch (err) {
      console.error('Failed to load attendance for day:', err);
    }
  };

  // Process employees (search & sort)
  const processedEmployees = useMemo(() => {
    let list = searchTerm
      ? employees.filter(e => {
          const searchLower = searchTerm.toLowerCase();
          const nameMatch = e.full_name.toLowerCase().includes(searchLower);
          const tempIdMatch = e.temp_id?.toLowerCase().includes(searchLower);
          const empIdMatch = e.emp_id?.toLowerCase().includes(searchLower);
          return nameMatch || tempIdMatch || empIdMatch;
        })
      : employees;

    if (sortConfig) {
      list = [...list].sort((a, b) => {
        const aVal = a[sortConfig.key] ?? '';
        const bVal = b[sortConfig.key] ?? '';
        return (aVal < bVal ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1);
      });
    }
    return list;
  }, [employees, searchTerm, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(processedEmployees.length / pageSize));
  const paginated = processedEmployees.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: 'full_name' | 'temp_id' | 'emp_id') => {
    setSortConfig(prev =>
      prev?.key === key
        ? prev.direction === 'asc' ? { key, direction: 'desc' } : null
        : { key, direction: 'asc' }
    );
  };

  const toggleAttendance = (id: number, status: 'present' | 'absent') => {
    if (isBatchCompleted) return;
    setAttendance(prev => ({ ...prev, [id]: prev[id] === status ? '' : status }));
  };

  const handleSave = async () => {
    if (!currentDate) {
      setError(`Please select a date for Day ${currentDay} within its navigation tile.`);
      return;
    }

    const changes = Object.entries(attendance)
      .filter(([_, s]) => s)
      .map(([id, status]) => ({
        user: Number(id),
        batch: selectedBatch,
        day_number: currentDay,
        status,
        attendance_date: currentDate,
      }));

    if (!changes.length) return setError('No attendance changes to save');

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('http://192.168.2.51:8000/attendances/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Save failed');
      }

      const result = await res.json();
      
      setSuccessMessage(result.message || 'Attendance saved successfully!');
      setDayDates(prev => ({ ...prev, [currentDay]: currentDate }));
      
      // Refresh completion status after save
      await fetchCompletionStatus(selectedBatch);
      
      // Check if batch was auto-completed
      const statusRes = await fetch(`http://192.168.2.51:8000/batch/${selectedBatch}/completion-status/`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (!statusData.is_active && isBatchCompleted === false) {
          // Batch just got auto-completed
          setSuccessMessage('✅ Attendance saved! Batch automatically completed - all days marked for all users.');
          setIsBatchCompleted(true);
          setTimeout(() => {
            // Refresh batch list to move it to past
            const endpoint = viewMode === 'active'
              ? 'http://192.168.2.51:8000/training-batches/active/'
              : 'http://192.168.2.51:8000/training-batches/past/';
            fetch(endpoint).then(res => res.json()).then(data => setBatches(data));
          }, 2000);
        }
      }
      
      onSuccess?.();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCompletion = async () => {
    if (!selectedBatch) return;
    
    setToggleLoading(true);
    try {
      const res = await fetch(`http://192.168.2.51:8000/batch/${selectedBatch}/toggle-completion/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to toggle batch status');

      const data = await res.json();
      setSuccessMessage(data.message);
      setIsBatchCompleted(!data.is_active);
      
      // Refresh completion status
      await fetchCompletionStatus(selectedBatch);
      
      // Refresh batch list
      const endpoint = viewMode === 'active'
        ? 'http://192.168.2.51:8000/training-batches/active/'
        : 'http://192.168.2.51:8000/training-batches/past/';
      const batchRes = await fetch(endpoint);
      if (batchRes.ok) {
        const batchData = await batchRes.json();
        setBatches(batchData);
      }
      
      setShowCompletionModal(false);
      
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to toggle batch completion');
    } finally {
      setToggleLoading(false);
    }
  };

  const handleReopenBatch = async () => {
    if (!selectedBatch) return;
    
    setToggleLoading(true);
    try {
      const res = await fetch(`http://192.168.2.51:8000/batch/${selectedBatch}/reopen/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to reopen batch');

      const data = await res.json();
      setSuccessMessage(data.message);
      setIsBatchCompleted(false);
      
      await fetchCompletionStatus(selectedBatch);
      
      const endpoint = 'http://192.168.2.51:8000/training-batches/active/';
      const batchRes = await fetch(endpoint);
      if (batchRes.ok) {
        const batchData = await batchRes.json();
        setBatches(batchData);
        setViewMode('active');
      }
      
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to reopen batch');
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="w-full mx-auto space-y-6">

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Training Attendance</h1>
                <p className="text-sm text-gray-600">Mark daily attendance for training batches</p>
              </div>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  viewMode === 'active' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" /> Active
              </button>
              <button
                onClick={() => setViewMode('past')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  viewMode === 'past' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-600'
                }`}
              >
                <History className="w-4 h-4 inline mr-1" /> Past
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Batch Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={loading}
              >
                <option value="">{loading ? 'Loading...' : '-- Select Batch --'}</option>
                {batches.map(b => (
                  <option key={b.batch_id} value={b.batch_id}>
                    {b.batch_id} {!b.is_active && '(Completed)'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-center py-2.5 px-4 rounded-lg font-bold text-xl shadow-md">
                {days.length}
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        )}

        {selectedBatch && !loading && employees.length > 0 && (
          <>
            {/* Completion Status Card */}
            {completionStatus && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-gray-900">Completion Progress</h3>
                      <p className="text-sm text-gray-600">
                        {completionStatus.total_marked_records} of {completionStatus.total_required_records} records marked
                      </p>
                    </div>
                  </div>
                  
                  {/* Batch Status Controls */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      completionStatus.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {completionStatus.status}
                    </span>
                    
                    {completionStatus.is_active && (
                      <button
                        onClick={() => setShowCompletionModal(true)}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition"
                        title="Mark batch as completed"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Complete
                      </button>
                    )}
                    
                    {!completionStatus.is_active && (
                      <button
                        onClick={handleReopenBatch}
                        disabled={toggleLoading}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition disabled:opacity-50"
                        title="Reopen batch for editing"
                      >
                        {toggleLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5" />
                        )}
                        Reopen
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Overall Progress</span>
                    <span className="font-semibold">{completionStatus.completion_percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${completionStatus.completion_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Day-by-Day Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {completionStatus.day_by_day_status.map((day) => (
                    <div 
                      key={day.day_id}
                      className={`p-2 rounded-lg border-2 ${
                        day.is_complete 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700">{day.day_name}</span>
                        {day.is_complete && <CheckCircle className="w-3.5 h-3.5 text-green-600" />}
                      </div>
                      <div className="text-xs text-gray-600">
                        {day.marked}/{day.total}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-full rounded-full ${
                            day.is_complete ? 'bg-green-500' : 'bg-blue-400'
                          }`}
                          style={{ width: `${day.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unified Navigation & Date Selection */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Batch: {selectedBatch}</h2>
                  <p className="text-blue-50 opacity-90 text-sm mt-1">
                    {currentDate 
                      ? `Current selection: Day ${currentDay} (${new Date(currentDate).toLocaleDateString()})` 
                      : `Please set a date for Day ${currentDay}`}
                  </p>
                </div>
                {isBatchCompleted && (
                  <span className="px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Completed
                  </span>
                )}
              </div>

              {/* Day Selection Tiles with Integrated Date Pickers */}
              <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {days.map((d) => {
                  const isSelected = d.days_id === currentDay;
                  const savedDate = dayDates[d.days_id] || "";
                  const dayStatus = completionStatus?.day_by_day_status.find(ds => ds.day_id === d.days_id);

                  return (
                    <div 
                      key={d.days_id} 
                      className={`flex flex-col min-w-[140px] rounded-xl overflow-hidden transition-all border-2 ${
                        isSelected ? "border-white shadow-xl scale-105" : "border-transparent opacity-80"
                      }`}
                    >
                      <button
                        onClick={() => setCurrentDay(d.days_id)}
                        className={`w-full py-2.5 text-sm font-bold relative ${
                          isSelected ? "bg-white text-blue-700" : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        {d.day}
                        {dayStatus?.is_complete && (
                          <CheckCircle className="w-4 h-4 absolute top-1 right-1 text-green-500" />
                        )}
                      </button>
                      <input
                        type="date"
                        value={savedDate}
                        disabled={isBatchCompleted}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          setDayDates((prev) => ({ ...prev, [d.days_id]: newDate }));
                          if (isSelected) setCurrentDate(newDate);
                        }}
                        className={`w-full text-xs p-2 focus:outline-none text-center ${
                          isSelected ? "bg-blue-50 text-gray-900" : "bg-blue-900/30 text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Search & Table Area */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, Temp ID, or Employee ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-4 text-left font-semibold text-gray-600">#</th>
                        <th 
                          onClick={() => handleSort('emp_id')} 
                          className="px-4 py-4 text-left font-semibold text-gray-600 cursor-pointer hover:text-blue-600"
                        >
                          Employee ID {sortConfig?.key === 'emp_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          onClick={() => handleSort('full_name')} 
                          className="px-4 py-4 text-left font-semibold text-gray-600 cursor-pointer hover:text-blue-600"
                        >
                          Name {sortConfig?.key === 'full_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-4 py-4 text-center font-semibold text-gray-600">Attendance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginated.map((emp, i) => (
                        <tr key={emp.id} className="hover:bg-blue-50/30 transition">
                          <td className="px-4 py-4 text-gray-500">{(page - 1) * pageSize + i + 1}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-2">
                              {emp.emp_id && (
                                <div className="flex flex-col">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 w-fit mb-1">
                                    Permanent
                                  </span>
                                  <span className="font-mono font-medium text-purple-900 text-sm">{emp.emp_id}</span>
                                </div>
                              )}
                              
                              {emp.temp_id && (
                                <div className="flex flex-col">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 w-fit mb-1">
                                    Temporary
                                  </span>
                                  <span className="font-mono font-medium text-blue-700 text-sm">{emp.temp_id}</span>
                                </div>
                              )}
                              
                              {!emp.emp_id && !emp.temp_id && (
                                <span className="text-gray-400 text-sm italic">No ID</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-900">{emp.full_name}</td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() => toggleAttendance(emp.id, 'present')}
                                disabled={isBatchCompleted}
                                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
                                  attendance[emp.id] === 'present'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                <CheckCircle className="w-4 h-4" /> Present
                              </button>
                              <button
                                onClick={() => toggleAttendance(emp.id, 'absent')}
                                disabled={isBatchCompleted}
                                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
                                  attendance[emp.id] === 'absent'
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                <XCircle className="w-4 h-4" /> Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Rows:</span>
                    <select
                      value={pageSize}
                      onChange={e => { setPageSize(+e.target.value); setPage(1); }}
                      className="px-2 py-1 border rounded bg-white"
                    >
                      {[10, 25, 50].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 hover:bg-gray-200 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-gray-700">Page {page} of {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 hover:bg-gray-200 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {!isBatchCompleted && (
              <button
                onClick={handleSave}
                disabled={saving || !Object.values(attendance).some(v => v)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-xl text-white font-bold text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                {saving ? 'Processing...' : `Confirm Attendance for Day ${currentDay}`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Lock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Complete Batch?</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to mark this batch as completed? This will:
            </p>
            
            <ul className="space-y-2 mb-6 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Move the batch to "Past Batches"</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Prevent further attendance edits</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Lock all training records</span>
              </li>
            </ul>

            {completionStatus && !completionStatus.all_days_complete && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Warning: Incomplete Days Detected</p>
                    <p>Some training days are not fully marked. You can still complete the batch, but consider reviewing the completion status above.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleCompletion}
                disabled={toggleLoading}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {toggleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Complete Batch
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}