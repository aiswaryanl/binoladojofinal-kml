import React, { useEffect, useState } from "react";
import { FiUploadCloud } from 'react-icons/fi'; // Import Icon
import { getBioUsers, addBioUser, deleteBioUser, type BioUser, enrollFace, enrollFingerprint, syncUserToDevice } from "./biouserApi";
import { getAttendanceLogs, type AttendanceLog } from "./attendanceApi";
import { getBiometricDevices, type BiometricDevice } from "./deviceApi";
import DashboardCard from "./DashboardCard"; // Assuming you have this component
import { MdDeleteForever, MdFingerprint } from "react-icons/md";
import { FaUserCircle, FaServer } from "react-icons/fa";

// 1. DEFINE THE PROPS INTERFACE
interface BioUserDashboardProps {
    isAuthorized: boolean; 
}

// const BioUserDashboard: React.FC = () => {
const BioUserDashboard: React.FC<BioUserDashboardProps> = ({ isAuthorized }) => {
    // Data States
    const [users, setUsers] = useState<BioUser[]>([]);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [devices, setDevices] = useState<BiometricDevice[]>([]);
    
    // Filter States
    const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

    // Form States
    const [form, setForm] = useState({ employeeid: "", first_name: "", last_name: "" });
    const [loading, setLoading] = useState(false);

    // Modal States
    const [modalType, setModalType] = useState<"face" | "finger" | "sync" | null>(null);
    const [targetUserId, setTargetUserId] = useState<number | null>(null);
    const [targetDeviceId, setTargetDeviceId] = useState<number | string>(""); // For modal selection
    const [fingerIndex, setFingerIndex] = useState(6); // Default Right Index

    const fingerOptions = [
        { value: 4, label: "Left Thumb" },
        { value: 3, label: "Left Index" },
        { value: 5, label: "Right Thumb" },
        { value: 6, label: "Right Index" },
    ];


    // --- AUTHENTICATION & ROLE CHECK ---
    // We get the user object from LocalStorage (saved during Login)
    // const [isAuthorized, setIsAuthorized] = useState(false);


    // --- Data Fetching ---
    const loadAllData = async () => {
        setLoading(true);
        const [usersData, devicesData] = await Promise.all([getBioUsers(), getBiometricDevices()]);
        setUsers(usersData);
        setDevices(devicesData);
        
        // If we have devices, select the first one by default for the modal? 
        // Or keep empty to force choice.
        if (devicesData.length > 0) {
            setTargetDeviceId(devicesData[0].id);
        }
        
        setLoading(false);
    };

    const loadLogs = async () => {
        // Fetch logs based on selected device filter
        const logsData = await getAttendanceLogs(selectedDeviceId || undefined);
        setLogs(logsData);
    };

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        loadLogs();
    }, [selectedDeviceId]); // Reload logs when filter changes

    // --- Calculations ---
    const registeredEmployees = users.length;
    const activeEmployees = new Set(logs.map((log) => log.employee_code)).size;
    const onlineDevices = devices.length; // Assuming listed devices are online for now

    // --- Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        await addBioUser(form);
        setForm({ employeeid: "", first_name: "", last_name: "" });
        loadAllData();
    };

    const handleDelete = async (id: number) => {
        if(!confirm("Are you sure? This removes user from ALL devices.")) return;
        await deleteBioUser(id);
        loadAllData();
    };

    // --- Modal Handlers ---
    const openEnrollModal = (type: "face" | "finger", userId: number) => {
        setModalType(type);
        setTargetUserId(userId);
    };
    // 4. FIX THE MODAL TYPE ERROR
    // Update the type definition to include "sync"
    // const openEnrollModal = (type: "face" | "finger" | "sync", userId: number) => {
    //     setModalType(type as "face" | "finger" | "sync"); // Cast or update state type
    //     setTargetUserId(userId);
    // };

    const closeEnrollModal = () => {
        setModalType(null);
        setTargetUserId(null);
    };

    const submitEnrollment = async () => {
        if (!targetUserId || !targetDeviceId) {
            alert("Please select a device.");
            return;
        }
        
        const deviceIdNum = Number(targetDeviceId);
        
        try {
            let res;
            // if (modalType === 'face') {
            //     res = await enrollFace(targetUserId, deviceIdNum, true);
            //     alert(res.result?.Message || "Command sent!");
            // } else {
            //     res = await enrollFingerprint(targetUserId, deviceIdNum, fingerIndex, true);
            //     alert(res.result?.Message || "Command sent!");
            // } else if (modalType === 'sync') {
            //     // NEW: Handle Sync
            //     res = await syncUserToDevice(targetUserId, deviceIdNum);
            //     alert(res.message || "User uploaded successfully!");
            // }
            if (modalType === 'face') {
                res = await enrollFace(targetUserId, deviceIdNum, true);
                alert(res.result?.Message || "Command sent!");
            } else if (modalType === 'finger') {
                res = await enrollFingerprint(targetUserId, deviceIdNum, fingerIndex, true);
                alert(res.result?.Message || "Command sent!");
            } else if (modalType === 'sync') {
                // NEW: Handle Sync
                res = await syncUserToDevice(targetUserId, deviceIdNum);
                alert(res.message || "User uploaded successfully!");
            }
            closeEnrollModal();
        } catch (err) {
            alert("Error sending command. Check device connection.");
            console.error(err);
        }
    };

    return (
        <div className='min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden font-sans text-slate-800'>
            {/* Ambient Animated Gradients */}
            <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none mix-blend-multiply"></div>
            
            <div className="relative z-10 max-w-screen-2xl mx-auto">
            {/* Header & Device Filter */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-500 tracking-tight drop-shadow-sm">Biometric Control Center</h1>
                
                <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">Monitor Device:</span>
                    <select 
                        className="p-2 border rounded-md shadow-sm bg-white"
                        value={selectedDeviceId || ""}
                        onChange={(e) => setSelectedDeviceId(e.target.value ? Number(e.target.value) : null)}
                    >
                        <option value="">All Devices (Global Logs)</option>
                        {devices.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.ip_address})</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Dashboard Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
                <DashboardCard value={registeredEmployees} label='Total Staff' color='bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' />
                <DashboardCard value={activeEmployees} label='Active Today' color='bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200' />
                <DashboardCard value={onlineDevices} label='Connected Devices' color='bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200' />
                <DashboardCard value={logs.length} label='Total Punches' color='bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200' />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: Employee Management (2/3 width) */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] border border-white/60 p-8 transition-all hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)]">
                    <h2 className='text-xl font-black text-slate-800 mb-6 uppercase tracking-widest'>Employee Management</h2>
                    
                    {/* Add User Form */}
                    {isAuthorized && (
                    <form onSubmit={handleAdd} className='flex gap-2 mb-6'>
                        <input name='employeeid' placeholder='Emp ID' value={form.employeeid} onChange={handleChange} required className='w-1/4 p-2 border rounded' />
                        <input name='first_name' placeholder='First Name' value={form.first_name} onChange={handleChange} required className='w-1/3 p-2 border rounded' />
                        <input name='last_name' placeholder='Last Name' value={form.last_name} onChange={handleChange} className='w-1/3 p-2 border rounded' />
                        <button type='submit' className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>Add</button>
                    </form>
                    )}

                    {/* Users Table */}
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm text-left'>
                            <thead className="bg-gray-100 text-gray-600 uppercase">
                                <tr>
                                    <th className='py-3 px-4'>ID</th>
                                    <th className='py-3 px-4'>Name</th>
                                    <th className='py-3 px-4 text-center'>Actions (Enroll)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className='border-b hover:bg-gray-50'>
                                        <td className='py-3 px-4 font-medium'>{u.employeeid}</td>
                                        <td className='py-3 px-4'>{u.first_name} {u.last_name}</td>
                                        <td className='py-3 px-4 flex justify-center gap-3'>
                                            
                                            {/* Face Enroll Button */}
                                            <button 
                                                onClick={() => openEnrollModal('face', u.id)}
                                                className='text-blue-600 hover:bg-blue-50 p-2 rounded tooltip'
                                                title="Enroll Face"
                                            >
                                                <FaUserCircle size={20} />
                                            </button>

                                            {/* Finger Enroll Button */}
                                            <button 
                                                onClick={() => openEnrollModal('finger', u.id)}
                                                className='text-green-600 hover:bg-green-50 p-2 rounded'
                                                title="Enroll Fingerprint"
                                            >
                                                <MdFingerprint size={20} />
                                            </button>

                                            {/* Add this button next to Enroll Face/Finger */}
                                            <button 
                                                onClick={() => openEnrollModal('sync', u.id)}
                                                className='text-purple-600 hover:bg-purple-50 p-2 rounded tooltip'
                                                title="Upload User to Device"
                                            >
                                                <FiUploadCloud size={20} />
                                            </button>

                                            {/* Delete Button */}
                                            <button 
                                                onClick={() => handleDelete(u.id)}
                                                className='text-red-600 hover:bg-red-50 p-2 rounded'
                                                title="Delete User"
                                            >
                                                <MdDeleteForever size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT: Recent Logs (1/3 width) */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] border border-white/60 p-8 max-h-[600px] overflow-y-auto transition-all hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] custom-scrollbar">
                    <h2 className='text-xl font-black text-slate-800 mb-6 sticky top-0 bg-white/80 backdrop-blur-md pb-4 pt-2 -mt-2 z-10 uppercase tracking-widest'>
                        {selectedDeviceId ? "Device Logs" : "Global Logs"}
                    </h2>
                    
                    <div className="space-y-3">
                        {logs.length === 0 ? <p className="text-gray-400 text-center py-4">No logs found today.</p> : 
                        logs.map((log, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                                <div>
                                    <p className="font-bold text-gray-800">{log.employee_code}</p>
                                    <p className="text-xs text-gray-500">{log.device_name}</p>
                                </div>
                                <span className="text-sm font-mono text-gray-600">
                                    {log.datetime.split(' ')[1]} {/* Show Time Only */}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            </div> {/* END INNER WRAPPER */}

            {/* --- ENROLLMENT MODAL --- */}
            {modalType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96 animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            {modalType === 'face' ? <FaUserCircle className="text-blue-500"/> : <MdFingerprint className="text-green-500"/>}
                            Enroll {modalType === 'face' ? 'Face' : 'Fingerprint'}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-4">
                            Select the machine where the employee is currently standing. The device will enter enrollment mode.
                        </p>

                        <label className="block text-sm font-bold text-gray-700 mb-2">Target Device</label>
                        <select 
                            className="w-full p-2 border rounded mb-4"
                            value={targetDeviceId}
                            onChange={(e) => setTargetDeviceId(e.target.value)}
                        >
                            {devices.map(d => (
                                // <option key={d.id} value={d.id}>{d.name} ({d.ip_address})</option>
                                <option key={d.id} value={d.id}>{d.name} ({d.serial_number})</option>
                            ))}
                        </select>

                        {/* Show Finger Selector only for Fingerprint Mode */}
                        {modalType === 'finger' && (
                            <>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Finger Index</label>
                                <select 
                                    className="w-full p-2 border rounded mb-6"
                                    value={fingerIndex}
                                    onChange={(e) => setFingerIndex(Number(e.target.value))}
                                >
                                    {fingerOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={closeEnrollModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                            <button 
                                onClick={submitEnrollment} 
                                className={`px-4 py-2 text-white rounded shadow ${modalType === 'face' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                Start Enrollment
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default BioUserDashboard;
