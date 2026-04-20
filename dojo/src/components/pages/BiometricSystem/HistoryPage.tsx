import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FiCalendar, FiCpu, FiUser, FiFilter, FiActivity, FiGrid, FiList, FiClock, FiTrash2, FiClock as FiTimeline
} from 'react-icons/fi';

// Interfaces
interface DailyRecord {
  id: number;
  employee_code: string;
  employee_name: string;
  device_name: string;
  first_punch: string;
  last_punch: string;
  date: string;
}

interface DetailedRecord {
  id: number;
  employee_code: string;
  employee_name: string;
  device_name: string;
  time: string;
  date: string;
}

const AttendanceHistoryPage: React.FC = () => {
  const [summaryRecords, setSummaryRecords] = useState<DailyRecord[]>([]);
  const [detailedRecords, setDetailedRecords] = useState<DetailedRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  
  // View Mode: 'table' or 'grid' (for summary)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  // Type Mode: 'summary' or 'detailed'
  const [typeMode, setTypeMode] = useState<'summary' | 'detailed'>('summary');

  // Filters
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [searchId, setSearchId] = useState('');

  // Fetch Data
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/attendance-db/?date=${selectedDate}&type=${typeMode}`);
      if (typeMode === 'detailed') {
        setDetailedRecords(res.data.logs);
      } else {
        setSummaryRecords(res.data.logs);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedDate, typeMode]);

  // Handle Cleanup (Admin Action)
  const handleCleanup = async () => {
    if (!window.confirm("Are you sure you want to delete biometric logs older than 3 months? This action cannot be undone.")) {
      return;
    }
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/attendance-db/`, { action: 'cleanup' });
      alert(res.data.message || "Cleanup successful");
    } catch (err) {
      console.error("Cleanup failed", err);
      alert("Failed to perform cleanup.");
    }
  };

  // Filter Logic for Summary
  const filteredSummary = summaryRecords.filter(r => {
    const matchesMachine = selectedMachine === '' || r.device_name === selectedMachine;
    const matchesId = searchId === '' || 
                      r.employee_code.toLowerCase().includes(searchId.toLowerCase()) || 
                      r.employee_name.toLowerCase().includes(searchId.toLowerCase());
    return matchesMachine && matchesId;
  });

  // Filter Logic for Detailed
  const filteredDetailed = detailedRecords.filter(r => {
    const matchesMachine = selectedMachine === '' || r.device_name === selectedMachine;
    const matchesId = searchId === '' || 
                      r.employee_code.toLowerCase().includes(searchId.toLowerCase()) || 
                      r.employee_name.toLowerCase().includes(searchId.toLowerCase());
    return matchesMachine && matchesId;
  });

  // Unique Machines List (from current records)
  const currentRecords = typeMode === 'detailed' ? detailedRecords : summaryRecords;
  const uniqueMachines = Array.from(new Set(currentRecords.map(r => r.device_name)));

  // Group Summary Records by Machine (for Grid View)
  const groupedSummary = uniqueMachines.reduce((acc, machine) => {
    const machineRecords = filteredSummary.filter(r => r.device_name === machine);
    if (machineRecords.length > 0) acc[machine] = machineRecords;
    return acc;
  }, {} as Record<string, DailyRecord[]>);


  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      
      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FiCpu className="text-blue-600" /> Machine Operator Logs
          </h1>
          <p className="text-gray-500 mt-1">Track operator activity and individual biometric punches.</p>
        </div>

        {/* --- MAIN CONTROLS --- */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
            
            {/* 1. VIEW TYPE TOGGLE (Summary vs Detailed) */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => setTypeMode('summary')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition ${typeMode === 'summary' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                >
                    <FiList /> Daily Summary
                </button>
                <button 
                    onClick={() => setTypeMode('detailed')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition ${typeMode === 'detailed' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
                >
                    <FiTimeline /> Global Timeline
                </button>
            </div>

            {/* 2. GRID/TABLE TOGGLE (Only for summary) */}
            {typeMode === 'summary' && (
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                        title="Grid View"
                    >
                        <FiGrid />
                    </button>
                    <button 
                        onClick={() => setViewMode('table')}
                        className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                        title="Table View"
                    >
                        <FiList />
                    </button>
                </div>
            )}

            {/* 3. DATE PICKER */}
            <div className="relative">
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-gray-700 font-medium text-sm"
                />
            </div>
            
            {/* 4. OPERATOR SEARCH */}
            <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400" />
                <input 
                    placeholder="Search Operator..." 
                    value={searchId}
                    onChange={e => setSearchId(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-100 outline-none w-40 text-sm"
                />
            </div>

            {/* 5. ADMIN CLEANUP (Pruning) */}
            <button 
                onClick={handleCleanup}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Cleanup Historical Data (> 3 Months)"
            >
                <FiTrash2 size={18} />
            </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      
      {isLoading ? (
         <div className="text-center py-20 text-gray-400 animate-pulse">Loading machine activity...</div>
      ) : (typeMode === 'summary' ? filteredSummary.length === 0 : filteredDetailed.length === 0) ? (
         <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            No records found for this date.
         </div>
      ) : (
        <>
            {/* === MODE A: DAILY SUMMARY === */}
            {typeMode === 'summary' && (
                <>
                    {/* View 1: Machine Grid */}
                    {viewMode === 'grid' && (
                        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.keys(groupedSummary).map((machineName) => (
                                <div key={machineName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                    <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-100 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FiActivity /></div>
                                            <h3 className="font-bold text-gray-800 text-sm">{machineName}</h3>
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 space-y-3">
                                        {groupedSummary[machineName].map((record) => (
                                            <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/20">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{record.employee_code.slice(0,2)}</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-700">{record.employee_name}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono uppercase">{record.employee_code}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-mono text-gray-600">Start: {record.first_punch.slice(0,5)}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono">End: {record.last_punch === '-' ? 'Active' : record.last_punch.slice(0,5)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* View 2: Table List */}
                    {viewMode === 'table' && (
                        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Operator</th>
                                        <th className="px-6 py-4">Machine</th>
                                        <th className="px-6 py-4 text-center">First Punch</th>
                                        <th className="px-6 py-4 text-center">Last Punch</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredSummary.map((record) => (
                                        <tr key={record.id} className="hover:bg-blue-50/30 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">{record.employee_code.slice(0,2)}</div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-xs">{record.employee_name}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono">{record.employee_code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-600 font-medium">{record.device_name}</td>
                                            <td className="px-6 py-4 text-center text-xs font-mono">{record.first_punch}</td>
                                            <td className="px-6 py-4 text-center text-xs font-mono text-blue-600">{record.last_punch}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* === MODE B: DETAILED GLOBAL TIMELINE === */}
            {typeMode === 'detailed' && (
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
                        {/* Timeline Connector Line */}
                        <div className="absolute left-[2.45rem] top-8 bottom-8 w-0.5 bg-gray-100 z-0"></div>
                        
                        <div className="p-6 space-y-6">
                            {filteredDetailed.map((record, idx) => (
                                <div key={record.id} className="relative flex items-start gap-6 z-10">
                                    
                                    {/* Timeline Node (Time) */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center border-4 border-white shadow-sm ring-1 ring-purple-100">
                                            <FiTimeline size={16} />
                                        </div>
                                        <span className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter whitespace-nowrap bg-white px-1">
                                            {record.time.slice(0,5)}
                                        </span>
                                    </div>

                                    {/* Transaction Card */}
                                    <div className="flex-1 bg-gray-50/50 hover:bg-white p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition group">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600 font-bold text-sm border border-gray-100 shadow-sm">
                                                    {record.employee_code.replace(/[^a-zA-Z0-9]/g, '').slice(0,2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-sm">{record.employee_name}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-gray-400 font-mono px-1.5 py-0.5 bg-white border border-gray-100 rounded">
                                                            {record.employee_code}
                                                        </span>
                                                        <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">
                                                           •  Recorded Punch
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg group-hover:border-purple-100 transition">
                                                <FiCpu className="text-gray-400" size={14}/>
                                                <div>
                                                    <p className="text-[9px] text-gray-400 uppercase font-bold leading-none mb-0.5">Machine</p>
                                                    <p className="text-xs font-bold text-gray-700 leading-none">{record.device_name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
      )}

    </div>
  );
};

export default AttendanceHistoryPage;