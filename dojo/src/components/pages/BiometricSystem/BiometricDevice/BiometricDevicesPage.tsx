import React, { useEffect, useState } from 'react';
import { FiServer, FiPlus, FiEdit2, FiTrash2, FiMonitor, FiX, FiLink, FiCpu, FiCheck } from 'react-icons/fi';
import { 
  getBiometricDevices, 
  createBiometricDevice, 
  updateBiometricDevice, 
  deleteBiometricDevice, 
  type BiometricDevice 
} from '../deviceApi';

// --- IMPORT FIX ---
// Importing from the file you provided
import { fetchMachines } from '../../Machine/machinesApi';
// Importing Type from your types file
import type { Machine } from '../../Machine/types';


// 1. DEFINE THE PROPS INTERFACE
interface BiometricDevicesPageProps {
    isAuthorized: boolean; 
}

// const BiometricDevicesPage: React.FC = () => {
const BiometricDevicesPage: React.FC<BiometricDevicesPageProps> = ({ isAuthorized }) => {

  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [availableMachines, setAvailableMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);


  // --- AUTHENTICATION & ROLE CHECK ---
  // We get the user object from LocalStorage (saved during Login)
  // const [isAuthorized, setIsAuthorized] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '192.168.1.',
    port: 80,
    serial_number: '',
    username: 'essl',
    password: 'essl',
    linked_machine_id: '' as string | number // Single Value
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [devs, macs] = await Promise.all([getBiometricDevices(), fetchMachines()]);
      setDevices(devs);
      setAvailableMachines(macs);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
        name: '', ip_address: '192.168.1.', port: 80, serial_number: '', 
        username: 'essl', password: 'essl', linked_machine_id: '' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (device: BiometricDevice) => {
    setEditingId(device.id);
    
    // Find which machine is currently linked to this device
    // We check the machine list to see which one points to this device ID
    const linkedMachine = availableMachines.find(m => m.biometric_device === device.id);

    setFormData({
      name: device.name,
      ip_address: device.ip_address,
      port: device.port,
      serial_number: device.serial_number,
      username: device.username || 'essl',
      password: device.password || 'essl',
      linked_machine_id: linkedMachine ? linkedMachine.id : ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare payload: Convert empty string to null
      const payload = {
        ...formData,
        linked_machine_id: formData.linked_machine_id ? Number(formData.linked_machine_id) : null
      };

      if (editingId) {
        await updateBiometricDevice(editingId, payload);
      } else {
        await createBiometricDevice(payload);
      }
      setIsModalOpen(false);
      loadData(); 
    } catch (err) {
      alert("Error saving device.");
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Delete this device? This will unlink any connected machine.")) return;
    await deleteBiometricDevice(id);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FiServer className="text-blue-600" /> Biometric Device Manager
        </h1>
        {isAuthorized && (
        <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg">
          <FiPlus /> Add Device
        </button>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map(device => (
            <div key={device.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative group hover:shadow-md transition">
              
              {/* Status Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FiMonitor className="w-6 h-6" /></div>
                {/* Visual Indicator */}
                {device.machine_name ? (
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <FiCpu /> Machine Link
                    </span>
                ) : (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <FiCheck /> General
                    </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-1">{device.name}</h3>
              <p className="text-sm text-gray-500 font-mono mb-4">{device.ip_address}</p>

              {/* Connected Machine Display */}
              <div className={`rounded-lg p-3 mb-4 border ${device.machine_name ? 'bg-purple-50 border-purple-100' : 'bg-gray-50 border-gray-200'}`}>
                 <p className="text-xs font-bold uppercase mb-1 opacity-60">
                    {device.machine_name ? 'Controlling Machine:' : 'Usage Type:'}
                 </p>
                 <p className={`text-sm font-semibold ${device.machine_name ? 'text-purple-700' : 'text-gray-500'}`}>
                    {device.machine_name || "General Attendance Only"}
                 </p>
              </div>

              {/* Action Buttons */}
              {isAuthorized && (
              <div className="flex gap-3 mt-auto">
                <button onClick={() => openEditModal(device)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition">Edit</button>
                <button onClick={() => handleDelete(device.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium transition">Remove</button>
              </div>
              )}
            </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Device' : 'Connect New Device'}</h3>
              <button onClick={() => setIsModalOpen(false)}><FiX size={20} className="text-gray-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              {/* Basic Fields */}
              <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Device Name</label>
                    <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">IP Address</label>
                        <input name="ip_address" value={formData.ip_address} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 font-mono" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Port</label>
                        <input name="port" type="number" value={formData.port} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 font-mono" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Serial Number</label>
                    <input name="serial_number" value={formData.serial_number} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 font-mono" required />
                </div>
              </div>

              {/* SINGLE MACHINE SELECTOR */}
              <div className="border-t border-gray-100 pt-4 bg-blue-50/50 p-4 rounded-xl">
                 <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <FiLink className="text-blue-600"/> Link to Machine
                 </label>
                 
                 <p className="text-xs text-gray-500 mb-3">
                    Select a machine to link (1-to-1). Leave empty for General Attendance.
                 </p>

                 <select 
                    name="linked_machine_id"
                    value={formData.linked_machine_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                 >
                    <option value="">-- No Machine (Attendance Only) --</option>
                    {availableMachines.map(machine => {
                        // Logic: Show machine if:
                        // 1. It has NO device connected
                        // 2. OR if it is connected to THIS device we are currently editing
                        // (Assuming machine.biometric_device is the ID number)
                        const isAvailable = !machine.biometric_device || machine.biometric_device === editingId;
                        
                        // If taken by another device, hide it
                        if (!isAvailable) return null; 
                        
                        return (
                            <option key={machine.id} value={machine.id}>
                                {machine.name} {machine.department_name ? `(${machine.department_name})` : ''}
                            </option>
                        );
                    })}
                 </select>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg">Save Changes</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiometricDevicesPage;

// import React, { useEffect, useState } from 'react';
// import { FiServer, FiPlus, FiEdit2, FiTrash2, FiMonitor, FiX, FiCheck, FiActivity } from 'react-icons/fi';
// import { 
//   getBiometricDevices, 
//   createBiometricDevice, 
//   updateBiometricDevice, 
//   deleteBiometricDevice, 
//   type BiometricDevice 
// } from '../deviceApi';

// const BiometricDevicesPage: React.FC = () => {
//   const [devices, setDevices] = useState<BiometricDevice[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingId, setEditingId] = useState<number | null>(null);

//   // Form State
//   const [formData, setFormData] = useState({
//     name: '',
//     ip_address: '192.168.1.',
//     port: 80,
//     serial_number: '',
//     username: 'essl',
//     password: 'essl'
//   });

//   // Fetch Data
//   const loadDevices = async () => {
//     setIsLoading(true);
//     try {
//       const data = await getBiometricDevices();
//       setDevices(data);
//     } catch (err) {
//       console.error("Failed to load devices", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDevices();
//   }, []);

//   // Handlers
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const openAddModal = () => {
//     setEditingId(null);
//     setFormData({ name: '', ip_address: '192.168.1.', port: 80, serial_number: '', username: 'essl', password: 'essl' });
//     setIsModalOpen(true);
//   };

//   const openEditModal = (device: BiometricDevice) => {
//     setEditingId(device.id);
//     setFormData({
//       name: device.name,
//       ip_address: device.ip_address,
//       port: device.port,
//       serial_number: device.serial_number,
//       username: device.username || 'essl',
//       password: device.password || 'essl'
//     });
//     setIsModalOpen(true);
//   };

//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure? Deleting this device will disconnect it from linked machines.")) return;
//     try {
//       await deleteBiometricDevice(id);
//       loadDevices();
//     } catch (err) {
//       alert("Failed to delete device");
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       if (editingId) {
//         await updateBiometricDevice(editingId, formData);
//       } else {
//         await createBiometricDevice(formData);
//       }
//       setIsModalOpen(false);
//       loadDevices();
//     } catch (err) {
//       alert("Error saving device. Check connection or duplicate IP/Serial.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       {/* Header */}
//       <div className="w-full mx-auto mb-8 flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
//             <FiServer className="text-blue-600" />
//             Biometric Device Manager
//           </h1>
//           {/* <p className="text-gray-500 mt-1">Configure physical eSSL machines and their network settings.</p> */}
//         </div>
//         <button 
//           onClick={openAddModal}
//           className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg"
//         >
//           <FiPlus /> Add Device
//         </button>
//       </div>

//       {/* Device Grid */}
//       <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {isLoading ? (
//            <div className="col-span-full text-center py-10 text-gray-500">Loading devices...</div>
//         ) : devices.length === 0 ? (
//            <div className="col-span-full bg-white p-10 rounded-2xl shadow-sm text-center">
//              <FiMonitor className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
//              <h3 className="text-lg font-semibold text-gray-700">No Devices Found</h3>
//              <p className="text-gray-500">Add your first eSSL machine to get started.</p>
//            </div>
//         ) : (
//           devices.map(device => (
//             <div key={device.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-6 relative group">
//               {/* Top Status Bar */}
//               <div className="flex justify-between items-start mb-4">
//                 <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
//                   <FiMonitor className="w-6 h-6" />
//                 </div>
//                 <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
//                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                   Active
//                 </span>
//               </div>

//               {/* Content */}
//               <h3 className="text-xl font-bold text-gray-800 mb-1">{device.name}</h3>
//               <div className="space-y-2 text-sm text-gray-600 mt-4">
//                 <div className="flex justify-between border-b border-gray-50 pb-2">
//                   <span className="text-gray-400">IP Address</span>
//                   <span className="font-mono font-medium">{device.ip_address}:{device.port}</span>
//                 </div>
//                 <div className="flex justify-between border-b border-gray-50 pb-2">
//                   <span className="text-gray-400">Serial No.</span>
//                   <span className="font-mono font-medium">{device.serial_number || "N/A"}</span>
//                 </div>
//                 <div className="flex justify-between pt-1">
//                   <span className="text-gray-400">Credentials</span>
//                   <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
//                     {device.username} / ***
//                   </span>
//                 </div>
//               </div>

//               {/* Actions */}
//               <div className="mt-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
//                 <button 
//                   onClick={() => openEditModal(device)}
//                   className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition"
//                 >
//                   <FiEdit2 size={14} /> Edit
//                 </button>
//                 <button 
//                   onClick={() => handleDelete(device.id)}
//                   className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium transition"
//                 >
//                   <FiTrash2 size={14} /> Remove
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
//             {/* Modal Header */}
//             <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
//               <h3 className="text-lg font-bold text-gray-800">
//                 {editingId ? 'Edit Device' : 'Connect New Device'}
//               </h3>
//               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
//                 <FiX size={20} />
//               </button>
//             </div>

//             {/* Modal Form */}
//             <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Device Name</label>
//                 <input 
//                   name="name"
//                   value={formData.name} 
//                   onChange={handleInputChange}
//                   placeholder="e.g. Main Gate Entrance"
//                   className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-3 gap-4">
//                 <div className="col-span-2">
//                   <label className="block text-sm font-semibold text-gray-700 mb-1">IP Address</label>
//                   <input 
//                     name="ip_address"
//                     value={formData.ip_address} 
//                     onChange={handleInputChange}
//                     placeholder="192.168.1.x"
//                     className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-1">Port</label>
//                   <input 
//                     name="port"
//                     type="number"
//                     value={formData.port} 
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Serial Number</label>
//                 <div className="relative">
//                     <input 
//                     name="serial_number"
//                     value={formData.serial_number} 
//                     onChange={handleInputChange}
//                     placeholder="e.g. NYU725..."
//                     className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
//                     required
//                     />
//                     <FiActivity className="absolute left-3 top-3 text-gray-400" />
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">Find this on the back of your eSSL machine.</p>
//               </div>

//               {/* Optional Credentials */}
//               <div className="pt-2 border-t border-gray-100">
//                 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Advanced Settings (Defaults: essl)</p>
//                 <div className="grid grid-cols-2 gap-4">
//                     <input 
//                         name="username"
//                         value={formData.username} 
//                         onChange={handleInputChange}
//                         placeholder="Username"
//                         className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-blue-500 outline-none"
//                     />
//                     <input 
//                         name="password"
//                         value={formData.password} 
//                         onChange={handleInputChange}
//                         placeholder="Password"
//                         type="password"
//                         className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-blue-500 outline-none"
//                     />
//                 </div>
//               </div>

//               <div className="flex gap-3 mt-6">
//                 <button 
//                     type="button"
//                     onClick={() => setIsModalOpen(false)}
//                     className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
//                 >
//                     Cancel
//                 </button>
//                 <button 
//                     type="submit"
//                     className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
//                 >
//                     <FiCheck /> Save Device
//                 </button>
//               </div>

//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BiometricDevicesPage;