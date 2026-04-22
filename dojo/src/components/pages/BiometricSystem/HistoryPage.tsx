import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FiCalendar, FiCpu, FiUser, FiActivity, FiGrid, FiList, FiClock, FiTrash2, FiRefreshCw, FiClock as FiTimeline, FiHash
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
  
  // View Modes
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [typeMode, setTypeMode] = useState<'summary' | 'detailed'>('summary');

  // Filter & Search
  const [searchId, setSearchId] = useState('');

  // Manual Sync State
  const [syncRange, setSyncRange] = useState({ start: selectedDate, end: selectedDate });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'info' | 'success' | 'error', text: string } | null>(null);

  // Pagination/Expansion State (Industrial Density)
  const [expandedMachines, setExpandedMachines] = useState<Record<string, boolean>>({});
  const toggleMachineExpand = (machine: string) => {
    setExpandedMachines(prev => ({ ...prev, [machine]: !prev[machine] }));
  };

  // API Call
  const fetchHistory = async () => {
    setIsLoading(true);
    setExpandedMachines({});
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/attendance-db/?date=${selectedDate}&type=${typeMode}`);
      if (typeMode === 'detailed') {
        setDetailedRecords(res.data.logs || []);
      } else {
        setSummaryRecords(res.data.logs || []);
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedDate, typeMode]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage({ type: 'info', text: "Sync in progress..." });
    try {
      await axios.post('http://127.0.0.1:8000/biometric-devices/sync_all/', {
        start_date: syncRange.start,
        end_date: syncRange.end
      });
      setSyncMessage({ type: 'success', text: 'Sync sequence triggered. Fetching latest logs...' });
      
      // Wait for background task to start processing
      setTimeout(() => {
        fetchHistory();
        setSyncMessage({ type: 'success', text: 'Sync complete. Dashboard updated!' });
      }, 2000);
    } catch (err: any) {
      setSyncMessage({ type: 'error', text: "Sync failed. Check connection." });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCleanup = async () => {
    if (window.confirm("Purge logs older than 3 months?")) {
      try {
        await axios.post(`http://127.0.0.1:8000/api/attendance-db/`, { action: 'cleanup' });
        fetchHistory();
      } catch (err) { alert("Cleanup failed."); }
    }
  };

  // Grouping Logic
  const filteredSummary = summaryRecords.filter(r => 
    searchId === '' || r.employee_code.toLowerCase().includes(searchId.toLowerCase()) || r.employee_name.toLowerCase().includes(searchId.toLowerCase())
  );

  const filteredDetailed = detailedRecords.filter(r => 
    searchId === '' || r.employee_code.toLowerCase().includes(searchId.toLowerCase()) || r.employee_name.toLowerCase().includes(searchId.toLowerCase())
  );

  // Align EVERYTHING to Newest-First
  const sortedSummary = [...filteredSummary].reverse();
  const sortedDetailed = [...filteredDetailed].reverse();

  const currentRecords = typeMode === 'detailed' ? detailedRecords : summaryRecords;
  
  // High-Density Sorting: Sort machines by their LATEST punch time
  const machineLastActivity: Record<string, string> = {};
  currentRecords.forEach((r: any) => {
    const activityTime = typeMode === 'detailed' ? r.time : r.last_punch;
    if (!machineLastActivity[r.device_name] || activityTime > machineLastActivity[r.device_name]) {
      machineLastActivity[r.device_name] = activityTime;
    }
  });

  const uniqueMachines = Array.from(new Set(currentRecords.map(r => r.device_name)))
    .sort((a, b) => (machineLastActivity[b] || '').localeCompare(machineLastActivity[a] || ''));

  const groupedSummary = uniqueMachines.reduce((acc, m) => {
    const records = sortedSummary.filter(r => r.device_name === m)
      .sort((a, b) => b.last_punch.localeCompare(a.last_punch)); // Internal sort
    if (records.length > 0) acc[m] = records;
    return acc;
  }, {} as Record<string, DailyRecord[]>);

  const groupedDetailed = uniqueMachines.reduce((acc, m) => {
    const records = filteredDetailed.filter(r => r.device_name === m);
    if (records.length > 0) acc[m] = records;
    return acc;
  }, {} as Record<string, DetailedRecord[]>);

  // Industrial Metrics
  const metrics = {
    total: typeMode === 'detailed' ? detailedRecords.length : summaryRecords.length,
    machines: uniqueMachines.length,
    ops: new Set(currentRecords.map(r => r.employee_code)).size
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans">
      
      {/* 1. INDUSTRIAL HEADER & STATS BAR */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm"><FiCpu size={18}/></div>
             <div>
                <h1 className="text-lg font-black tracking-tight leading-none">MACHINE LOGS</h1>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mt-1">Biometric System History</p>
             </div>
          </div>

          <div className="flex items-center gap-2">
             <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-600 uppercase">Records</span>
                    <span className="text-sm font-black text-blue-600">{metrics.total}</span>
                </div>
                <div className="w-px h-4 bg-gray-200"></div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-600 uppercase">Nodes</span>
                    <span className="text-sm font-black text-gray-700">{metrics.machines}</span>
                </div>
                <div className="w-px h-4 bg-gray-200"></div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-600 uppercase">Operators</span>
                    <span className="text-sm font-black text-indigo-600">{metrics.ops}</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* 2. ADVANCED TOOLBAR (INDUSTRIAL DENSITY) */}
        <div className="flex flex-col lg:flex-row items-center gap-4 bg-white p-3 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80 transition-all hover:shadow-md">
            
            {/* SYNC TOOL BOX */}
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 w-full lg:w-auto">
                <div className="flex items-center gap-1 pl-2">
                    <FiRefreshCw className="text-gray-600" size={14}/>
                    <input type="date" value={syncRange.start} onChange={e => setSyncRange({...syncRange, start: e.target.value})} className="text-[11px] font-bold bg-transparent border-none focus:ring-0 w-28 uppercase" />
                    <span className="text-gray-500 text-xs">→</span>
                    <input type="date" value={syncRange.end} onChange={e => setSyncRange({...syncRange, end: e.target.value})} className="text-[11px] font-bold bg-transparent border-none focus:ring-0 w-28 uppercase" />
                </div>
                <button onClick={handleManualSync} disabled={isSyncing} className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${isSyncing ? 'bg-gray-200 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'}`}>
                    {isSyncing ? 'Syncing...' : 'Sync All Nodes'}
                </button>
            </div>

            <div className="h-6 w-px bg-gray-100 hidden lg:block"></div>

            {/* VIEWER CONTROLS */}
            <div className="flex flex-wrap items-center gap-3 flex-1 w-full lg:w-auto">
                {/* Mode Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setTypeMode('summary')} className={`px-4 py-2 rounded-lg text-[11px] font-black transition-all ${typeMode === 'summary' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>SUMMARY</button>
                    <button onClick={() => setTypeMode('detailed')} className={`px-4 py-2 rounded-lg text-[11px] font-black transition-all ${typeMode === 'detailed' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>TIMELINE</button>
                </div>

                {/* Sub View Toggle */}
                {typeMode === 'summary' && (
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><FiGrid size={14}/></button>
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><FiList size={14}/></button>
                    </div>
                )}

                {/* Search & Date */}
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1 group">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14}/>
                        <input placeholder="Search..." value={searchId} onChange={e => setSearchId(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                    </div>
                    <div className="relative w-36 group">
                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14}/>
                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none uppercase" />
                    </div>
                    <button onClick={handleCleanup} className="p-2.5 text-gray-600 hover:text-red-500 transition-colors" title="Purge Records"><FiTrash2 size={16}/></button>
                </div>
            </div>
        </div>

        {/* 3. SYNC NOTIFICATIONS */}
        {syncMessage && (
            <div className={`p-3 rounded-xl border flex items-center gap-3 animate-in fade-in duration-300 ${syncMessage.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : syncMessage.type === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                <FiActivity size={14} className={syncMessage.type === 'info' ? 'animate-pulse' : ''} />
                <span className="text-[11px] font-black uppercase tracking-wider">{syncMessage.text}</span>
            </div>
        )}

        {/* 4. CONTENT GRID (SUMMARY & TIMELINE) */}
        <div className="min-h-[500px]">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-40">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Loading Infrastructure...</span>
             </div>
          ) : (metrics.total === 0) ? (
             <div className="flex flex-col items-center justify-center py-40 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                <FiHash size={32} className="text-gray-200 mb-2" />
                <h3 className="font-bold text-gray-600">NO DATA FOUND</h3>
             </div>
          ) : (
            <div className="space-y-6">
                {/* SUMMARY MODE */}
                {typeMode === 'summary' && (
                    <>
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {Object.keys(groupedSummary).map((m) => {
                                    const expanded = expandedMachines[m];
                                    const records = groupedSummary[m];
                                    const visible = expanded ? records : records.slice(0, 5);
                                    return (
                                        <div key={m} className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                            <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                                    <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-tight">{m}</h3>
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-600">{records.length} OPS</span>
                                            </div>
                                            <div className="p-3 space-y-2">
                                                {visible.map(r => (
                                                    <div key={r.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50/50 border border-gray-100/50 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all group">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-[9px] font-black text-gray-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">{r.employee_code.slice(-2)}</div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-700 leading-none">{r.employee_name}</p>
                                                                <p className="text-[9px] text-gray-600 font-bold mt-1 uppercase tracking-tighter">{r.employee_code}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-blue-600">{r.first_punch.slice(0,5)}</p>
                                                            <p className="text-[8px] font-black text-gray-500 mt-0.5">{r.last_punch === '-' ? 'ACTIVE' : r.last_punch.slice(0,5)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {records.length > 5 && (
                                                    <button onClick={() => toggleMachineExpand(m)} className="w-full py-2 text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-blue-600 transition-colors">
                                                        {expanded ? 'Show Less' : `+ ${records.length - 5} More`}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {viewMode === 'table' && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Operator Info</th>
                                            <th className="px-6 py-4">Machine Node</th>
                                            <th className="px-6 py-4 text-center">In Time</th>
                                            <th className="px-6 py-4 text-center">Last Activity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {sortedSummary.map(r => (
                                            <tr key={r.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-colors uppercase">{r.employee_code.slice(-2)}</div>
                                                        <div><p className="text-xs font-black text-gray-700">{r.employee_name}</p><p className="text-[9px] text-gray-600 font-bold tracking-tighter uppercase">{r.employee_code}</p></div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-[11px] font-black text-gray-600">{r.device_name}</td>
                                                <td className="px-6 py-3 text-center"><span className="text-[10px] font-black text-gray-700 bg-white px-2 py-1 border border-gray-100 rounded shadow-sm">{r.first_punch}</span></td>
                                                <td className="px-6 py-3 text-center"><span className="text-[10px] font-black text-blue-600 bg-blue-50/50 px-2 py-1 border border-blue-100 rounded shadow-sm">{r.last_punch}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* TIMELINE MODE (NEWEST-FIRST TIME RANGE) */}
                {typeMode === 'detailed' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.keys(groupedDetailed).map((m) => {
                            const rawRecords = groupedDetailed[m];
                            
                            // 1. Group consecutive punches by the same user into "Sessions"
                            const sessions: any[] = [];
                            rawRecords.forEach(r => {
                                const last = sessions[sessions.length - 1];
                                if (last && last.employee_code === r.employee_code) {
                                    last.end_time = r.time;
                                    last.punches += 1;
                                    last.raw_punches.push(r.time);
                                } else {
                                    sessions.push({ 
                                        ...r, 
                                        start_time: r.time, 
                                        end_time: r.time, 
                                        punches: 1,
                                        raw_punches: [r.time]
                                    });
                                }
                            });

                            // 2. Newest First for Manufacturing
                            const sortedSessions = [...sessions].reverse();
                            const isExpanded = expandedMachines[m];
                            const visibleSessions = isExpanded ? sortedSessions : sortedSessions.slice(0, 5);

                            return (
                                <div key={m} className="flex flex-col space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                                            <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-tight">{m}</h3>
                                        </div>
                                        {/* <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Live Forensics</span> */}
                                    </div>
                                    <div className="bg-white rounded-3xl border border-gray-100/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] p-5 relative space-y-6">
                                        <div className="absolute left-[2.25rem] top-8 bottom-8 w-px bg-gray-100 z-0"></div>
                                        {visibleSessions.map((session, idx) => {
                                            const hasDuration = session.start_time !== session.end_time;
                                            return (
                                                <div key={`${session.id}-${idx}`} className="relative z-10 flex items-start gap-4 group">
                                                    {/* TIME RANGE COLUMN (NEWEST AT TOP) */}
                                                    <div className="flex flex-col items-center w-12 pt-1">
                                                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                                            <FiTimeline size={12}/>
                                                        </div>
                                                        <div className="mt-2 flex flex-col items-center gap-1">
                                                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1 border border-blue-100 rounded shadow-sm" title="Latest Activity">
                                                                {session.end_time.slice(0,5)}
                                                            </span>
                                                            {hasDuration && (
                                                                <>
                                                                    <div className="w-px h-2 bg-gray-200"></div>
                                                                    <span className="text-[10px] font-black text-gray-600 bg-gray-50 px-1 border border-gray-100 rounded" title="Session Start">
                                                                        {session.start_time.slice(0,5)}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* ACTIVITY CARD */}
                                                    <div className="flex-1 bg-gray-50/80 p-4 rounded-2xl border border-gray-100/50 hover:border-blue-200 hover:bg-gradient-to-r hover:from-white hover:to-blue-50/30 hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02]">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                                                {session.employee_name}
                                                            </h4>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[9px] font-black px-2 py-0.5 bg-blue-600 text-white rounded-lg shadow-sm">
                                                                    {session.punches} {session.punches === 1 ? 'PUNCH' : 'PUNCHES'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="px-2 py-0.5 bg-white border border-gray-100 rounded text-[9px] font-bold text-gray-600 shadow-sm">
                                                                ID: {session.employee_code}
                                                            </div>
                                                            <div className="flex-1 h-px bg-gray-100"></div>
                                                            <span className="text-[9px] text-blue-400 font-black uppercase tracking-tighter">
                                                                {hasDuration ? 'ACTIVE SESSION' : 'INSTANT CHECK'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {sessions.length > 5 && (
                                            <button onClick={() => toggleMachineExpand(m)} className="w-full py-2 bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl text-[9px] font-black text-gray-600 uppercase tracking-widest transition-all">
                                                {isExpanded ? 'Collapse Session History' : `Review ${sessions.length - 5} Previous Blocks`}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistoryPage;