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
        <div className='bg-gray-50 min-h-screen p-6'>
            
            {/* Header & Device Filter */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-700">Biometric Control Center</h1>
                
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
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
                <DashboardCard value={registeredEmployees} label='Total Staff' color='bg-blue-100' />
                <DashboardCard value={activeEmployees} label='Active Today' color='bg-green-100' />
                <DashboardCard value={onlineDevices} label='Connected Devices' color='bg-yellow-100' />
                <DashboardCard value={logs.length} label='Total Punches' color='bg-purple-100' />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: Employee Management (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
                    <h2 className='text-xl font-semibold mb-4'>Employee Management</h2>
                    
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
                <div className="bg-white rounded-xl shadow p-6 max-h-[600px] overflow-y-auto">
                    <h2 className='text-xl font-semibold mb-4 sticky top-0 bg-white'>
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


// import React, { useEffect, useState } from "react";
// import { getBioUsers, addBioUser, deleteBioUser, type BioUser, enrollFace,enrollFingerprint } from "./biouserApi";
// import { getAttendanceLogs, type AttendanceLog } from "./attendanceApi";
// import DashboardCard from "./DashboardCard";
// import { MdDeleteForever,MdFace, MdFingerprint } from "react-icons/md";
// import { FaUserCircle } from "react-icons/fa";


// const BioUserDashboard: React.FC = () => {
// 	const [users, setUsers] = useState<BioUser[]>([]);
// 	const [logs, setLogs] = useState<AttendanceLog[]>([]);
// 	const [form, setForm] = useState({
// 		employeeid: "",
// 		first_name: "",
// 		last_name: "",
// 	});
// 	const [loading, setLoading] = useState(false);
// 	const [showFPModal, setShowFPModal] = useState(false);
// 	const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
// 	const [fingerIndex, setFingerIndex] = useState(0);

// 	const fingerOptions = [
// 		{ value: 0, label: "Left Little" },
// 		{ value: 1, label: "Left Ring" },
// 		{ value: 2, label: "Left Middle" },
// 		{ value: 3, label: "Left Index" },
// 		{ value: 4, label: "Left Thumb" },
// 		{ value: 5, label: "Right Thumb" },
// 		{ value: 6, label: "Right Index" },
// 		{ value: 7, label: "Right Middle" },
// 		{ value: 8, label: "Right Ring" },
// 		{ value: 9, label: "Right Little" },
// 	];

// 	// Fetch users and logs
// 	const fetchUsers = async () => {
// 		setLoading(true);
// 		setUsers(await getBioUsers());
// 		setLoading(false);
// 	};

// 	const fetchLogs = async () => {
// 		setLogs(await getAttendanceLogs());
// 	};

// 	useEffect(() => {
// 		fetchUsers();
// 		fetchLogs();
// 	}, []);

// 	// Calculate dashboard values
// 	  const registeredEmployees = users.length;
// 	// const registeredEmployees = logs.map((log) => log.employee_code).length;

// 	// Active Employees: unique employee_code in logs
// 	const activeEmployees = Array.from(
// 		new Set(logs.map((log) => log.employee_code))
// 	).length;

// 	// Present Employees: latest log for each employee is "IN"
// 	// If you have a status field, use it. If not, just count unique employee_code as present.
// 	// For demo, we'll just use unique employee_code as present

// 	const empLogCount: { [emp: string]: number } = {};
// 	logs.forEach((log) => {
// 		empLogCount[log.employee_code] =
// 			(empLogCount[log.employee_code] || 0) + 1;
// 	});
// 	const presentEmployees = Object.values(empLogCount).filter(
// 		(count) => count % 2 === 1
// 	).length;

// 	// const presentEmployees = activeEmployees;

// 	// Online/Offline Devices: You need a separate API for this, so keep as demo for now
// 	const onlineDevices = 1;
// 	const offlineDevices = 0;

// 	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		setForm({ ...form, [e.target.name]: e.target.value });
// 	};

// 	const handleAdd = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		await addBioUser(form);
// 		setForm({ employeeid: "", first_name: "", last_name: "" });
// 		fetchUsers();
// 	};

// 	const handleDelete = async (id: number) => {
// 		await deleteBioUser(id);
// 		fetchUsers();
// 	};

// 	const handleEnrollFace = async (id: number) => {
// 		try {
// 			const res = await enrollFace(id, true); // true = overwrite existing face
// 			// alert(res.result || "Enroll face command sent!");
// 			alert(
// 				res.result?.EnrollUserFaceResult
// 					? `Result: ${res.result.EnrollUserFaceResult}\nCommandId: ${res.result.CommandId}\n\nNow go to the device to complete face enrollment.`
// 					: JSON.stringify(res.result)
// 			);
// 		} catch (err) {
// 			alert("Failed to enroll face.");
// 		}
// 	};

// 	const openFPModal = (id: number) => {
// 		setSelectedUserId(id);
// 		setFingerIndex(0);
// 		setShowFPModal(true);
// 	};


// 	const handleEnrollFingerprint = async () => {
// 		if (selectedUserId === null) return;
// 		try {
// 			const res = await enrollFingerprint(selectedUserId, fingerIndex, true);
// 			alert(
// 			res.result?.EnrollUserFPResult
// 				? `Result: ${res.result.EnrollUserFPResult}\nCommandId: ${res.result.CommandId}`
// 				: JSON.stringify(res.result)
// 			);
// 		} catch (err) {
// 			alert("Failed to enroll fingerprint.");
// 		}
// 		setShowFPModal(false);
// 	};

// 	return (
// 		<div className='bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen'>
// 			{/* Dashboard Header */}
// 			<div className='bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg'>
// 				{/* <h1 className='text-3xl font-bold mb-2'>
// 					Dashboard{" "}
// 					<span className='text-gray-400 text-xl font-normal'>
// 						Biometric Attendance System
// 					</span>
// 				</h1> */}
// 				<div className='flex mt-6 justify-between gap-4'>
// 					<DashboardCard
// 						value={registeredEmployees}
// 						label='Registered Employees'
// 						color='bg-orange-200'
// 					/>
// 					<DashboardCard
// 						value={activeEmployees}
// 						label='Active Employees'
// 						color='bg-blue-200'
// 					/>
// 					<DashboardCard
// 						value={presentEmployees}
// 						label='Present Employees'
// 						color='bg-lime-200'
// 					/>
// 					<DashboardCard
// 						value={onlineDevices}
// 						label='Online Devices'
// 						color='bg-yellow-300'
// 					/>
// 					<DashboardCard
// 						value={offlineDevices}
// 						label='Offline Devices'
// 						color='bg-red-400'
// 					/>
// 				</div>
// 			</div>
// 			{/* Employee Management */}
// 			<div className='mx-auto mt-10 bg-white rounded-xl shadow-lg p-8'>
// 				<h2 className='text-2xl font-semibold mb-6'>
// 					Employee Management
// 				</h2>
// 				<form onSubmit={handleAdd} className='flex gap-4 mb-8'>
// 					<input
// 						name='employeeid'
// 						placeholder='Employee ID'
// 						value={form.employeeid}
// 						onChange={handleChange}
// 						required
// 						className='flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
// 					/>
// 					<input
// 						name='first_name'
// 						placeholder='First Name'
// 						value={form.first_name}
// 						onChange={handleChange}
// 						required
// 						className='flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
// 					/>
// 					<input
// 						name='last_name'
// 						placeholder='Last Name'
// 						value={form.last_name}
// 						onChange={handleChange}
// 						required
// 						className='flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
// 					/>
// 					<button
// 						type='submit'
// 						className='bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition'
// 					>
// 						Add Employee
// 					</button>
// 				</form>
// 				{loading ? (
// 					<p>Loading...</p>
// 				) : (
// 					<div className='overflow-x-auto'>
// 						<table className='w-full text-base border-collapse'>
// 							<thead>
// 								<tr className='bg-gray-100'>
// 									<th className='py-3 px-4 border-b-2 border-gray-200'>
// 										ID
// 									</th>
// 									<th className='py-3 px-4 border-b-2 border-gray-200'>
// 										Employee ID
// 									</th>
// 									<th className='py-3 px-4 border-b-2 border-gray-200'>
// 										Name
// 									</th>
// 									<th className='py-3 px-4 border-b-2 border-gray-200'>
// 										Action
// 									</th>
// 								</tr>
// 							</thead>
// 							<tbody>
// 								{users.map((u) => (
// 									<tr
// 										key={u.id}
// 										className='border-b border-gray-100  text-center'
// 									>
// 										<td className='py-2 px-4 text-center'>
// 											{String(u.id)}
// 										</td>
// 										<td className='py-2 px-4 text-center'>
// 											{u.employeeid}
// 										</td>
// 										<td className='py-2 px-4 text-center'>
// 											{u.first_name} {u.last_name}
// 										</td>
// 										<td className='py-2 px-4 text-center flex gap-2 justify-center'>
// 											<button
// 												onClick={() => handleEnrollFace(u.id)}
// 												className='text-blue-600 px-4 py-1 rounded hover:text-blue-700 transition'
// 												title="Enroll Face"
// 											>
// 												{/* Enroll Face */}
// 												<FaUserCircle size={24} />
// 											</button>

// 											<button
// 											  	onClick={() => openFPModal(u.id)}
// 												// onClick={() => handleEnrollFingerprint(u.id)}
// 												className='text-green-600 px-4 py-1 rounded hover:text-green-700 transition'
// 												title="Enroll Fingerprint"
// 											>
// 												<MdFingerprint size={24} />
// 											</button>

// 											<button
// 												onClick={() =>
// 													handleDelete(u.id)
// 												}
// 												className='text-red-600 px-4 py-1 rounded hover:text-red-700 transition'
// 											>
// 												<MdDeleteForever size={24} />
// 											</button>
// 										</td>
// 									</tr>
// 								))}
// 								{users.length === 0 && (
// 									<tr>
// 										<td
// 											colSpan={4}
// 											className='text-center py-6 text-gray-400'
// 										>
// 											No employees found.
// 										</td>
// 									</tr>
// 								)}
// 							</tbody>
// 						</table>
// 					</div>
// 				)}
// 			</div>

// 			{showFPModal && (
// 				<div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
// 					<div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px]">
// 					<h3 className="text-lg font-semibold mb-4">Enroll Fingerprint</h3>
// 					<label className="block mb-2">Select Finger:</label>
// 					<select
// 						className="w-full p-2 border rounded mb-4"
// 						value={fingerIndex}
// 						onChange={e => setFingerIndex(Number(e.target.value))}
// 					>
// 						{fingerOptions.map(opt => (
// 						<option key={opt.value} value={opt.value}>{opt.label}</option>
// 						))}
// 					</select>
// 					<div className="flex gap-2 justify-end">
// 						<button
// 						onClick={() => setShowFPModal(false)}
// 						className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
// 						>
// 						Cancel
// 						</button>
// 						<button
// 						onClick={handleEnrollFingerprint}
// 						className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
// 						>
// 						Enroll
// 						</button>
// 					</div>
// 					</div>
// 				</div>
// 			)}
// 		</div>
// 	);
// };

// export default BioUserDashboard;
