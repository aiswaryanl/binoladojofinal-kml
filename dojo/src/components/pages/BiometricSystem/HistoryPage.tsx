import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FiCalendar, FiCpu, FiUser, FiFilter, FiActivity, FiGrid, FiList, FiClock 
} from 'react-icons/fi';

// Interface
interface DailyRecord {
  id: number;
  employee_code: string;
  employee_name: string;
  device_name: string;   // e.g. "Lathe 1 (Bio-01)"
  first_punch: string;
  last_punch: string;
  date: string;
}

const AttendanceHistoryPage: React.FC = () => {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  
  // View Mode State: 'table' or 'grid'
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  // Filters
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [searchId, setSearchId] = useState('');

  // Fetch Data
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://192.168.2.51:8000/api/attendance-db/?date=${selectedDate}`);
      setRecords(res.data.logs);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedDate]);

  // Unique Machines List
  const uniqueMachines = Array.from(new Set(records.map(r => r.device_name)));

  // Filter Logic
  const filteredRecords = records.filter(r => {
    const matchesMachine = selectedMachine === '' || r.device_name === selectedMachine;
    const matchesId = searchId === '' || 
                      r.employee_code.toLowerCase().includes(searchId.toLowerCase()) || 
                      r.employee_name.toLowerCase().includes(searchId.toLowerCase());
    return matchesMachine && matchesId;
  });

  // Helper to Group Records by Machine (for Grid View)
  const groupedRecords = uniqueMachines.reduce((acc, machine) => {
    const machineRecords = filteredRecords.filter(r => r.device_name === machine);
    if (machineRecords.length > 0) {
      acc[machine] = machineRecords;
    }
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
          <p className="text-gray-500 mt-1">Track operator start times and active duration per machine.</p>
        </div>

        {/* --- CONTROLS --- */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
            
            {/* View Switcher Buttons */}
            <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Machine Grid View"
                >
                    <FiGrid />
                </button>
                <button 
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-md transition ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    title="List View"
                >
                    <FiList />
                </button>
            </div>

            {/* Date Picker */}
            <div className="relative">
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-gray-700 font-medium"
                />
            </div>
            
            {/* Operator Search */}
            <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400" />
                <input 
                    placeholder="Search Operator..." 
                    value={searchId}
                    onChange={e => setSearchId(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-100 outline-none w-40"
                />
            </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      
      {isLoading ? (
         <div className="text-center py-20 text-gray-400 animate-pulse">Loading machine data...</div>
      ) : filteredRecords.length === 0 ? (
         <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            No records found for this date.
         </div>
      ) : (
        <>
            {/* === VIEW 1: MACHINE GRID (The New User-Friendly View) === */}
            {viewMode === 'grid' && (
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.keys(groupedRecords).map((machineName) => (
                        <div key={machineName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            
                            {/* Card Header: Machine Name */}
                            <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <FiActivity />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-sm">{machineName}</h3>
                                </div>
                                <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                                    {groupedRecords[machineName].length} Operators
                                </span>
                            </div>

                            {/* Card Body: List of Operators */}
                            <div className="p-4 flex-1">
                                <div className="space-y-3">
                                    {groupedRecords[machineName].map((record) => (
                                        <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition group">
                                            
                                            {/* Operator Info */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-200">
                                                    {record.employee_code.slice(0,2)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-700">{record.employee_name}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono uppercase">{record.employee_code}</p>
                                                </div>
                                            </div>

                                            {/* Time Info */}
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 justify-end text-xs font-mono text-gray-600">
                                                    <FiClock size={10} className="text-green-500"/>
                                                    <span>{record.first_punch.slice(0,5)}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                    to {record.last_punch === '-' ? 'Active' : record.last_punch.slice(0,5)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                                    {selectedDate}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* === VIEW 2: TABLE LIST (The Old View) === */}
            {viewMode === 'table' && (
                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="px-6 py-4">Operator</th>
                                    <th className="px-6 py-4">Machine Used</th>
                                    <th className="px-6 py-4 text-center">Start Time</th>
                                    <th className="px-6 py-4 text-center">End Time / Active</th>
                                    <th className="px-6 py-4 text-center">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-blue-50/30 transition duration-150">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">
                                                    {record.employee_code.slice(0,2)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">{record.employee_name}</p>
                                                    <p className="text-xs text-gray-400 font-mono">{record.employee_code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded-md font-medium bg-gray-100 text-gray-600">
                                                {record.device_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-xs font-mono text-gray-700">
                                            {record.first_punch}
                                        </td>
                                        <td className="px-6 py-4 text-center text-xs font-mono text-blue-600">
                                            {record.last_punch}
                                        </td>
                                        <td className="px-6 py-4 text-center text-xs text-gray-400 font-mono">
                                            {record.date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
      )}

    </div>
  );
};

export default AttendanceHistoryPage;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { FiCalendar, FiCpu, FiUser, FiFilter, FiActivity } from 'react-icons/fi';

// // Interface
// interface DailyRecord {
//   id: number;
//   employee_code: string;
//   employee_name: string;
//   device_name: string;   // e.g. "Lathe 1 (Bio-01)"
//   first_punch: string;
//   last_punch: string;
//   date: string;
// }

// const AttendanceHistoryPage: React.FC = () => {
//   const [records, setRecords] = useState<DailyRecord[]>([]);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [isLoading, setIsLoading] = useState(false);

//   // Filters
//   const [selectedMachine, setSelectedMachine] = useState<string>('');
//   const [searchId, setSearchId] = useState('');

//   // Fetch Data
//   const fetchHistory = async () => {
//     setIsLoading(true);
//     try {
//       const res = await axios.get(`http://192.168.2.51:8000/api/attendance-db/?date=${selectedDate}`);
//       setRecords(res.data.logs);
//     } catch (err) {
//       console.error("Failed to fetch history", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, [selectedDate]);

//   // Unique Machines List
//   const uniqueMachines = Array.from(new Set(records.map(r => r.device_name)));

//   // Filter Logic
//   const filteredRecords = records.filter(r => {
//     const matchesMachine = selectedMachine === '' || r.device_name === selectedMachine;
//     const matchesId = searchId === '' || 
//                       r.employee_code.toLowerCase().includes(searchId.toLowerCase()) || 
//                       r.employee_name.toLowerCase().includes(searchId.toLowerCase());
//     return matchesMachine && matchesId;
//   });

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
      
//       {/* --- HEADER --- */}
//       <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
//             <FiCpu className="text-blue-600" /> Machine Operator Logs
//           </h1>
//           <p className="text-gray-500 mt-1">Track operator start times and active duration per machine.</p>
//         </div>

//         {/* --- CONTROLS --- */}
//         <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
            
//             {/* Machine Filter */}
//             <div className="relative group">
//                 <FiFilter className="absolute left-3 top-3 text-gray-400" />
//                 <select 
//                     value={selectedMachine}
//                     onChange={(e) => setSelectedMachine(e.target.value)}
//                     className="pl-10 pr-8 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-100 outline-none appearance-none font-medium text-gray-700 min-w-[240px] cursor-pointer"
//                 >
//                     <option value="">All Machines</option>
//                     {uniqueMachines.map(machine => (
//                         <option key={machine} value={machine}>{machine}</option>
//                     ))}
//                 </select>
//                 <div className="absolute right-3 top-3 pointer-events-none text-gray-400 text-xs">▼</div>
//             </div>

//             {/* Date Picker */}
//             <div className="relative">
//                 <FiCalendar className="absolute left-3 top-3 text-gray-400" />
//                 <input 
//                     type="date" 
//                     value={selectedDate}
//                     onChange={e => setSelectedDate(e.target.value)}
//                     className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-gray-700 font-medium"
//                 />
//             </div>

//             {/* Operator Search */}
//             <div className="relative">
//                 <FiUser className="absolute left-3 top-3 text-gray-400" />
//                 <input 
//                     placeholder="Search Operator..." 
//                     value={searchId}
//                     onChange={e => setSearchId(e.target.value)}
//                     className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-100 outline-none w-48"
//                 />
//             </div>
//         </div>
//       </div>

//       {/* --- TABLE --- */}
//       <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
//                 <th className="px-6 py-4">Operator</th>
//                 <th className="px-6 py-4">Machine Used</th>
//                 <th className="px-6 py-4 text-center">Start Time</th>
//                 <th className="px-6 py-4 text-center">End Time / Last Active</th>
//                 <th className="px-6 py-4 text-center">Date</th>
//               </tr>
//             </thead>
            
//             <tbody className="divide-y divide-gray-50">
//               {isLoading ? (
//                 <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 animate-pulse">Loading logs...</td></tr>
//               ) : filteredRecords.length === 0 ? (
//                 <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No machine logs found for this selection.</td></tr>
//               ) : (
//                 filteredRecords.map((record) => (
//                   <tr key={record.id} className="hover:bg-blue-50/30 transition duration-150">
                    
//                     {/* Operator Name/ID */}
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-200">
//                             {record.employee_code.slice(0,2)}
//                         </div>
//                         <div>
//                             <p className="font-bold text-gray-800 text-sm">{record.employee_name}</p>
//                             <p className="text-xs text-gray-400 font-mono tracking-wide">{record.employee_code}</p>
//                         </div>
//                       </div>
//                     </td>

//                     {/* Machine Name */}
//                     <td className="px-6 py-4">
//                        <div className="flex items-center gap-2">
//                           <FiActivity className="text-orange-400 shrink-0"/>
//                           <span className={`px-2 py-1 text-xs rounded-md font-medium whitespace-nowrap ${selectedMachine === record.device_name ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-gray-100 text-gray-600'}`}>
//                             {record.device_name}
//                           </span>
//                        </div>
//                     </td>

//                     {/* Start Time (First Punch) */}
//                     <td className="px-6 py-4 text-center">
//                         <span className="font-mono text-gray-700 font-bold bg-gray-100 px-3 py-1 rounded-md text-xs">
//                             {record.first_punch}
//                         </span>
//                     </td>

//                     {/* End Time (Last Punch) */}
//                     <td className="px-6 py-4 text-center">
//                         {record.last_punch === '-' ? (
//                             <span className="text-gray-400 font-mono text-xs italic">Currently Active / One Punch</span>
//                         ) : (
//                             <span className="font-mono text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-md border border-blue-100 text-xs">
//                                 {record.last_punch}
//                             </span>
//                         )}
//                     </td>

//                     {/* Date */}
//                     <td className="px-6 py-4 text-center text-sm text-gray-400 font-mono">
//                         {record.date}
//                     </td>

//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
        
//         {/* Footer */}
//         {!isLoading && filteredRecords.length > 0 && (
//             <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
//                 <span>Total Operators: <strong>{filteredRecords.length}</strong></span>
//                 {selectedMachine && <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded">Machine: {selectedMachine}</span>}
//             </div>
//         )}
//       </div>

//     </div>
//   );
// };

// export default AttendanceHistoryPage;