import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { 
  ShieldCheck, Zap, Save, Lock, Plus, Search, Edit2, 
  Check, X, Trash2, LayoutGrid, Layers, AlertCircle,
  RotateCw
} from 'lucide-react';

import Switch from '../atoms/Buttons/Switch';
import { Button } from '../atoms/Buttons/Button';
import { tiles } from '../constants/tileData';
import { API_ENDPOINTS } from '../constants/api';
const API_BASE_URL = API_ENDPOINTS.BASE_URL;

interface Role {
  id: number;
  name: string;
  is_active: boolean;
}

const RolePermissions = () => {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const authHeader = { headers: { Authorization: `Bearer ${accessToken}` } };

  // Data States
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [userPermissions, setUserPermissions] = useState<number[]>([]);
  
  // UI States
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [matrixSearch, setMatrixSearch] = useState(''); // Search inside the matrix

  useEffect(() => {
    fetchInitialData();
  }, [accessToken]);

  const fetchInitialData = async () => {
    try {
      // Fetch roles from /roles/ to ensure we get the correct is_active status
      const [matrixRes, rolesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/permission-matrix/`, authHeader),
        axios.get(`${API_BASE_URL}/roles/`, authHeader)
      ]);

      setRoles(rolesRes.data || []);
      setModules(matrixRes.data.modules || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  // --- NEW: GLOBAL SELECTION LOGIC ---
  const handleSelectAll = () => {
    if (fullAccess) return;
    const allIds: number[] = [];
    modules.forEach((mod: any) => {
      allIds.push(mod.id);
      mod.sub_modules?.forEach((sub: any) => allIds.push(sub.id));
    });
    setUserPermissions(allIds);
  };

  const handleDisableAll = () => {
    if (fullAccess) return;
    setUserPermissions([]);
  };

  const handleRoleSelect = async (role: Role) => {
    console.log("Selecting Role ID & Name:", role.id,role.name,role.is_active);
    setSelectedRole(role);
    
    // 1. Check if it's a Full Access Role
    const isFullAccess = role.name.toLowerCase() === 'admin' || role.name.toLowerCase() === 'developer';

    if (isFullAccess) {
      // 2. If Admin/Dev, manually fill userPermissions with ALL available IDs
      const allIds: number[] = [];
      modules.forEach((mod: any) => {
        allIds.push(mod.id);
        mod.sub_modules?.forEach((sub: any) => allIds.push(sub.id));
      });
      setUserPermissions(allIds);
      console.log("Full Access Role detected. UI force-filled with all permissions.");
    } else {
      // 3. Otherwise, fetch from the database as usual
      try {
        const res = await axios.get(`${API_BASE_URL}/roles/${role.id}/permissions/`, authHeader);
        console.log("Permissions received for role:", res.data);
        setUserPermissions(res.data || []);
      } catch (err) {
        console.error("Error loading permissions", err);
      }
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      await axios.post(`${API_BASE_URL}/roles/`, { name: newRoleName }, authHeader);
      setNewRoleName('');
      fetchInitialData();
    } catch (err) {
      alert("Failed to create role");
    }
  };

  const handleUpdateRole = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Stop selection trigger when clicking edit save
    try {
      await axios.patch(`${API_BASE_URL}/roles/${id}/`, { name: editValue }, authHeader);
      setEditingRoleId(null);
      fetchInitialData();
    } catch (err) { alert("Update failed"); }
  };


  const handleToggleActive = async (e: React.MouseEvent | any, role: Role) => {
      // Safety check: only call stopPropagation if 'e' exists
      if (e && typeof e.stopPropagation === 'function') {
          e.stopPropagation();
      }

      // Optimistic Update: Calculate new status and update state immediately
      const newStatus = !role.is_active;
      
      setRoles(prevRoles => 
          prevRoles.map(r => r.id === role.id ? { ...r, is_active: newStatus } : r)
      );

      // Deselect if deactivated
      if (selectedRole?.id === role.id && newStatus === false) {
          setSelectedRole(null);
      }

      try {
          const response = await axios.post(`${API_BASE_URL}/roles/${role.id}/toggle_status/`, {}, authHeader);
          // Sync with server if needed (e.g. if server rejected the change)
          if (response.data.is_active !== newStatus) {
              setRoles(prevRoles => prevRoles.map(r => r.id === role.id ? { ...r, is_active: response.data.is_active } : r));
          }
      } catch (err) {
          console.error("Toggle Error:", err);
          // Revert on error
          setRoles(prevRoles => prevRoles.map(r => r.id === role.id ? { ...r, is_active: !newStatus } : r));
          alert("Status toggle failed");
      }
  };

  const handleToggle = (moduleId: number, isParent: boolean, childrenIds: number[] = []) => {
    // if (selectedRole?.name.toLowerCase() === 'admin') return;
    if (fullAccess) return;

    setUserPermissions(prev => {
      const isSelected = prev.includes(moduleId);
      if (isParent) {
        if (isSelected) {
          return prev.filter(id => id !== moduleId && !childrenIds.includes(id));
        } else {
          return Array.from(new Set([...prev, moduleId, ...childrenIds]));
        }
      } else {
        return isSelected ? prev.filter(id => id !== moduleId) : [...prev, moduleId];
      }
    });
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    try {

      // We only send the modules that are currently in our 'userPermissions' array
      // because the backend will reset everything else to false
      const payload = {
          role_id: selectedRole.id,
          permissions: userPermissions.map(id => ({
              module_id: id,
              is_allowed: true
          }))
      };

      // await axios.post(`${API_BASE_URL}/permission-matrix/`, {
      //   role_id: selectedRole.id,
      //   permissions: userPermissions.map(id => ({ module_id: id, is_allowed: true }))
      // }, authHeader);
      await axios.post(`${API_BASE_URL}/permission-matrix/`, payload, authHeader);
      alert("Matrix Saved Successfully!");

      // Refresh data to ensure UI is in sync
      fetchInitialData();
    } catch (err) { 
      console.error("Save Error:", err);
      alert("Save failed"); }
  };


  const fullAccess = selectedRole?.name.toLowerCase() === 'admin' || selectedRole?.name.toLowerCase() === 'developer';

  // --- SYNC MODULES LOGIC ---
  const handleSyncModules = async () => {
    if (!window.confirm(
      "This will sync the database with the latest codebase configuration.\n\n" +
      "NOTE: If a Permission Key already exists, the Module Name will be updated to match the codebase. No duplicates will be created.\n\n" +
      "Continue?"
    )) return;
    
    try {
      const response = await axios.post(`${API_BASE_URL}/sync-modules/`, { tiles }, authHeader);
      
      let message = `Sync Complete!\n\nCreated: ${response.data.created}\nUpdated: ${response.data.updated}`;
      
      if (response.data.skipped_keys && response.data.skipped_keys.length > 0) {
        message += `\n\nWARNING: The following Duplicate Keys were IGNORED:\n- ${response.data.skipped_keys.join('\n- ')}\n\nPlease fix these in tileData.ts`;
      }
      
      alert(message);
      fetchInitialData(); // Refresh the matrix to show new modules
    } catch (err) {
      console.error("Sync Error:", err);
      alert("Failed to sync modules. Check console for details.");
    }
  };


  // Filter modules based on matrix search
  const filteredModules = modules.filter(mod => 
    mod.name.toLowerCase().includes(matrixSearch.toLowerCase()) ||
    mod.sub_modules?.some((s: any) => s.name.toLowerCase().includes(matrixSearch.toLowerCase()))
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-2xl shadow-slate-200/50">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl text-white shadow-lg shadow-indigo-200">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">Roles & Access</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Configuration</p>
            </div>
          </div>

          <form onSubmit={handleAddRole} className="relative group">
            <input 
              className="w-full bg-slate-50 border border-slate-200 pl-4 pr-10 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 shadow-sm" 
              placeholder="Create new role..." 
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white text-indigo-600 rounded-lg shadow-sm border border-slate-100 hover:bg-indigo-50 transition-colors">
              <Plus size={16} />
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {roles.map(role => {
            const isProtected = role.name.toLowerCase() === 'admin' || role.name.toLowerCase() === 'developer';
            const isSelected = selectedRole?.id === role.id;
            
            return (
              <div 
                key={role.id} 
                onClick={() => handleRoleSelect(role)}
                className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
                  isSelected 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-transparent shadow-lg shadow-indigo-200 translate-x-1' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:shadow-md hover:border-slate-100'
                }`}
              >
                {/* Active Indicator Strip */}
                {/* {isSelected && <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full" />} */}

                <div className="flex items-center gap-3 pl-2 overflow-hidden">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-indigo-50 text-indigo-600 group-hover:bg-white group-hover:shadow-sm group-hover:scale-110'}`}>
                    {isProtected ? <Lock size={14} /> : <LayoutGrid size={14} />}
                  </div>
                  
                  {editingRoleId === role.id ? (
                    <input 
                      autoFocus 
                      value={editValue} 
                      onChange={(e) => setEditValue(e.target.value)}
                      className="min-w-0 bg-white text-slate-900 px-2 py-1 rounded-md border border-indigo-300 outline-none text-sm font-medium shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateRole(e as any, role.id);
                        if (e.key === 'Escape') setEditingRoleId(null);
                      }}
                    />
                  ) : (
                    <div className="flex flex-col min-w-0">
                      <span className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-white' : 'text-slate-700'} ${!role.is_active && !isSelected && 'opacity-50 line-through'}`}>
                        {role.name}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${role.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        {role.is_active ? 'Active' : 'Inactive'} 
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className={`flex items-center gap-2 ${editingRoleId === role.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                  {editingRoleId === role.id ? (
                    <>
                      <button onClick={(e) => handleUpdateRole(e, role.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingRoleId(null); }} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={14} /></button>
                    </>
                  ) : (
                    <>
                      {!isProtected && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingRoleId(role.id); setEditValue(role.name); }}
                          className={`p-1.5 rounded-md transition-colors ${isSelected ? 'text-indigo-200 hover:text-white hover:bg-white/20' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      <div onClick={(e) => e.stopPropagation()}>
                        <div className={isSelected ? 'brightness-125 contrast-125' : ''}>
                           <Switch checked={!!role.is_active} onChange={(e: any) => handleToggleActive(e, role)} disabled={isProtected} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative">
        
        {/* Glass Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10 px-8 py-5 flex justify-between items-center shadow-sm supports-[backdrop-filter]:bg-white/60">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {selectedRole ? (
                  <>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{selectedRole.name}</span>
                    <span className="text-slate-300">/</span>
                    <span>Permissions</span>
                  </>
                ) : 'Permission Matrix'}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {selectedRole ? 'Manage access levels and module visibility' : 'Select a role to configure access'}
              </p>
            </div>

            {selectedRole && (
              <div className="relative ml-8 hidden lg:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  value={matrixSearch}
                  onChange={(e) => setMatrixSearch(e.target.value)}
                  className="bg-slate-100 border-transparent pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none w-64 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-200 transition-all placeholder:text-slate-400 shadow-inner"
                  placeholder="Filter modules..."
                />
              </div>
            )}
          </div>
          

          <div className="flex items-center gap-3">
             {/* Sync Button (Visible to Admin/Dev only) */}
             {(true) && ( // You might want to restrict this button's visibility
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleSyncModules}
                className="!text-xs !px-4 !py-2 flex items-center !rounded-xl border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-all mr-2"
                title="Sync Database Modules with Codebase"
              >
                <RotateCw size={14} className="mr-2 text-blue-500" /> 
                <span className="font-bold">Sync Modules</span>
              </Button>
            )}

            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleSelectAll}
              disabled={!selectedRole || fullAccess}
              className="!text-xs !px-4 !py-2 flex items-center !rounded-xl border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition-all"
            >
              <Zap size={14} className="mr-2 text-amber-500" fill="currentColor" /> 
              <span className="font-bold">Select All</span>
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleDisableAll}
              disabled={!selectedRole || fullAccess}
              className="!text-xs !px-4 !py-2 flex items-center !rounded-xl border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition-all"
            >
              <Trash2 size={14} className="mr-2 text-rose-500" /> 
              <span className="font-bold">Clear</span>
            </Button>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <Button 
              variant="primary" 
              size="sm" 
              onClick={savePermissions}
              disabled={!selectedRole}
              className="!bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 flex items-center !px-6 !py-2.5 !rounded-xl transition-all hover:shadow-indigo-300 hover:-translate-y-0.5"
            >
              <Save size={16} className="mr-2" /> 
              <span className="font-bold tracking-wide">Save Changes</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {!selectedRole ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-32 h-32 bg-gradient-to-tr from-slate-100 to-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                <Layers size={48} className="text-slate-300/50" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">No Role Selected</h3>
              <p className="text-sm max-w-xs text-center mt-2 text-slate-400">Select a role from the sidebar to view and modify its access permissions.</p>
            </div>
          ) : (
            <div className="space-y-8 pb-20">
              {fullAccess && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl flex items-start gap-3 text-amber-800 shadow-sm">
                  <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">System Override Active</h4>
                    <p className="text-xs mt-1 opacity-90">This role has permanent full access to all features. Permissions cannot be manually toggled.</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredModules.map((mod) => (
                  <div 
                    key={mod.id} 
                    className={`flex flex-col bg-white rounded-2xl border transition-all duration-300 group ${
                      userPermissions.includes(mod.id) 
                        ? 'border-indigo-200 shadow-xl shadow-indigo-100/50 ring-1 ring-indigo-100 scale-[1.01]' 
                        : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-1'
                    }`}
                  >
                    {/* Card Header */}
                    <div className={`p-4 border-b border-slate-50 flex justify-between items-center rounded-t-2xl transition-colors ${userPermissions.includes(mod.id) ? 'bg-gradient-to-r from-indigo-50/80 to-violet-50/80' : 'bg-white group-hover:bg-slate-50/50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${userPermissions.includes(mod.id) ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm'}`}>
                          <LayoutGrid size={16} />
                        </div>
                        <span className={`font-bold text-sm transition-colors ${userPermissions.includes(mod.id) ? 'text-indigo-900' : 'text-slate-700'}`}>{mod.name}</span>
                      </div>
                      
                      {/* Custom Checkbox for Parent */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={fullAccess || userPermissions.includes(mod.id)}
                          disabled={fullAccess}
                          onChange={() => handleToggle(mod.id, true, mod.sub_modules?.map((s:any) => s.id))}
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-violet-500"></div>
                      </label>
                    </div>

                    {/* Sub Modules */}
                    <div className="p-4 space-y-3 flex-1">
                      {mod.sub_modules?.map((sub: any) => (
                        <label 
                          key={sub.id} 
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            fullAccess ? 'cursor-not-allowed opacity-70' : 'hover:bg-slate-50 group-hover:hover:bg-indigo-50/30'
                          }`}
                        >
                          <span className={`text-xs font-medium ${userPermissions.includes(sub.id) ? 'text-slate-700' : 'text-slate-500'}`}>
                            {sub.name}
                          </span>
                          
                          <div className="relative flex items-center">
                            <input 
                              type="checkbox"
                              className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded checked:bg-indigo-500 checked:border-indigo-500 transition-all cursor-pointer"
                              checked={fullAccess || userPermissions.includes(sub.id)}
                              disabled={fullAccess}
                              onChange={() => handleToggle(sub.id, false)}
                            />
                            <Check size={10} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={4} />
                          </div>
                        </label>
                      ))}
                      
                      {(!mod.sub_modules || mod.sub_modules.length === 0) && (
                        <div className="text-center py-4 text-xs text-slate-300 italic">No sub-modules available</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RolePermissions;