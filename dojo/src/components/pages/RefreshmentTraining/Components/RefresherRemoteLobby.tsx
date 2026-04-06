import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Play,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Wifi,
  CheckCircle,
} from 'lucide-react';
import { Avatar, ProgressStepper, StickyHeader } from '../Components/shared/UIComponents';

const API_BASE = 'http://192.168.2.51:8000';

interface Props {
  scheduleId: number;
  batchId?: number;
  testType: 'pre' | 'post';
  topicName: string;
  onBack: () => void;
  onStartTest: (assignments: Record<string, number>) => void;
}

interface TestSession {
  session_id: number;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  is_completed: boolean;
}

// ============== EASYTEST REMOTE COMPONENT ==============
interface EasyTestRemoteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isActive?: boolean;
  maxLength?: number;
}

const EasyTestRemote: React.FC<EasyTestRemoteProps> = ({ 
  value, 
  onChange, 
  onSubmit,
  isActive = true,
  maxLength = 6
}) => {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key) && value.length < maxLength) {
        onChange(value + e.key);
        setPressedKey(e.key);
        setTimeout(() => setPressedKey(null), 150);
      }
      if (e.key === 'Backspace') {
        onChange(value.slice(0, -1));
        setPressedKey('back');
        setTimeout(() => setPressedKey(null), 150);
      }
      if (e.key === 'Enter' && value.trim()) {
        onSubmit();
        setPressedKey('ok');
        setTimeout(() => setPressedKey(null), 150);
      }
      if (e.key.toLowerCase() === 'c') {
        onChange('');
        setPressedKey('c');
        setTimeout(() => setPressedKey(null), 150);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, onChange, onSubmit, isActive, maxLength]);

  const handleNumClick = (num: string) => {
    if (value.length < maxLength) {
      onChange(value + num);
      setPressedKey(num);
      setTimeout(() => setPressedKey(null), 150);
    }
  };

  const handleClear = () => {
    onChange('');
    setPressedKey('c');
    setTimeout(() => setPressedKey(null), 150);
  };

  const handleOk = () => {
    if (value.trim()) {
      onSubmit();
      setPressedKey('ok');
      setTimeout(() => setPressedKey(null), 150);
    }
  };

  const Button = ({ 
    label, 
    subLabel, 
    color = "black", 
    onClick, 
    id
  }: { 
    label: string | React.ReactNode; 
    subLabel?: string; 
    color?: "black" | "green" | "red"; 
    onClick: () => void;
    id?: string;
  }) => {
    const isPressed = pressedKey === id;
    
    const bgColors = {
      black: `bg-gradient-to-b ${isPressed ? 'from-gray-700 to-gray-900' : 'from-gray-800 to-black'} border-gray-700`,
      green: `bg-gradient-to-b ${isPressed ? 'from-green-500 to-green-700' : 'from-green-400 to-green-600'} border-green-500`,
      red: `bg-gradient-to-b ${isPressed ? 'from-orange-600 to-red-700' : 'from-orange-500 to-red-600'} border-red-500`
    };

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className={`
          relative flex flex-col items-center justify-center h-12
          ${bgColors[color]} 
          rounded-lg shadow-lg 
          transition-all duration-100
          border-b-4 border-r-2 border-l-2
          focus:outline-none
          ${isPressed ? 'brightness-75' : 'hover:brightness-110'}
        `}
      >
        <span className="text-lg font-bold text-white drop-shadow-md">{label}</span>
        {subLabel && (
          <span className="absolute bottom-0.5 right-1.5 text-[8px] font-medium text-gray-300">
            {subLabel}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={`flex justify-center select-none ${isActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
      <div className="w-64 flex-shrink-0">
        <div className="relative bg-white rounded-3xl p-3 shadow-2xl border-4 border-gray-200">
          <div className="absolute -top-1 -right-1 flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'} shadow-lg`} />
          </div>
          
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-4 flex flex-col items-center shadow-inner">
            <div className="mb-3 text-center">
              <h3 className="text-white font-serif text-lg tracking-wide italic">
                EasyTest<sup className="text-[8px] not-italic">™</sup>
              </h3>
              <div className="text-[8px] text-gray-500 tracking-widest">REMOTE STATION</div>
            </div>

            <div className="w-full bg-gradient-to-b from-[#a8b89a] to-[#9ea792] h-14 mb-4 rounded-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] flex items-center justify-end px-3 border-4 border-gray-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-10 pointer-events-none" />
              <div className="flex items-center">
                <span className="font-mono text-2xl tracking-widest text-black opacity-90 font-bold">
                  {value || <span className="opacity-30">______</span>}
                </span>
                <span className="animate-pulse text-black opacity-90 text-2xl ml-0.5">_</span>
              </div>
            </div>

            <div className="w-full space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button label="OK" color="green" onClick={handleOk} id="ok" />
                <Button label="C" color="red" onClick={handleClear} id="c" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button label="1" subLabel="A" onClick={() => handleNumClick('1')} id="1" />
                <Button label="2" subLabel="B" onClick={() => handleNumClick('2')} id="2" />
                <Button label="3" subLabel="C" onClick={() => handleNumClick('3')} id="3" />
                <Button label="4" subLabel="D" onClick={() => handleNumClick('4')} id="4" />
                <Button label="5" subLabel="E" onClick={() => handleNumClick('5')} id="5" />
                <Button label="6" subLabel="F" onClick={() => handleNumClick('6')} id="6" />
                <Button label="7" subLabel="G" onClick={() => handleNumClick('7')} id="7" />
                <Button label="8" subLabel="H" onClick={() => handleNumClick('8')} id="8" />
                <Button label="9" subLabel="I" onClick={() => handleNumClick('9')} id="9" />
                <div className="flex items-center justify-center text-gray-600 text-xs">↑</div>
                <Button label="0" subLabel="⌂" onClick={() => handleNumClick('0')} id="0" />
                <div className="flex items-center justify-center text-gray-600 text-xs">↓</div>
              </div>
            </div>

            <div className="mt-3 w-8 h-2 bg-gray-800 rounded-full border border-gray-700">
              <div className={`w-full h-full rounded-full transition-all duration-100 ${pressedKey ? 'bg-purple-500/50' : 'bg-transparent'}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============== EMPLOYEE SELECTION MODAL ==============
interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: TestSession[];
  assignedSessionIds: number[];
  onSelect: (session: TestSession) => void;
  remoteId: string;
  currentSessionId?: number | null;
}

const EmployeeSelectionModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  sessions,
  assignedSessionIds,
  onSelect,
  remoteId,
  currentSessionId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return sessions.filter(s => !s.is_completed).filter(session => {
      if (!q) return true;
      return (
        session.employee_name?.toLowerCase()?.includes(q) ||
        session.employee_code?.toLowerCase()?.includes(q)
      );
    });
  }, [sessions, searchQuery]);

  const availableSessions = filteredSessions.filter(
    s => !assignedSessionIds.includes(s.session_id) || s.session_id === currentSessionId
  );

  const alreadyAssignedSessions = filteredSessions.filter(
    s => assignedSessionIds.includes(s.session_id) && s.session_id !== currentSessionId
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-up overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold">{remoteId}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Assign Employee</h2>
                <p className="text-purple-200">Remote Station #{remoteId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by name or employee code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 pl-12 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{availableSessions.length}</span> available
              {alreadyAssignedSessions.length > 0 && (
                <span className="ml-2 text-orange-600">
                  • {alreadyAssignedSessions.length} already assigned
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Employees Found</h3>
              <p className="text-gray-500">Try adjusting your search query</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableSessions.map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => {
                    onSelect(session);
                    onClose();
                  }}
                  className={`
                    group p-4 rounded-2xl border-2 text-left transition-all duration-200
                    ${session.session_id === currentSessionId 
                      ? 'border-green-400 bg-green-50 ring-2 ring-green-200' 
                      : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 transition-transform group-hover:scale-110
                      ${session.session_id === currentSessionId 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-br from-purple-500 to-purple-700'
                      }
                    `}>
                      {session.employee_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 truncate">{session.employee_name}</p>
                        {session.session_id === currentSessionId && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">Current</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{session.employee_code}</p>
                    </div>
                  </div>
                </button>
              ))}

              {alreadyAssignedSessions.map((session) => (
                <div
                  key={session.session_id}
                  className="p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-300 text-white text-xl font-bold flex-shrink-0">
                      {session.employee_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-600 truncate">{session.employee_name}</p>
                        <span className="px-2 py-0.5 bg-orange-400 text-white text-xs rounded-full">Assigned</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{session.employee_code}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {availableSessions.map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => {
                    onSelect(session);
                    onClose();
                  }}
                  className={`
                    w-full p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all
                    ${session.session_id === currentSessionId 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                    }
                  `}
                >
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0
                    ${session.session_id === currentSessionId 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-br from-purple-500 to-purple-700'
                    }
                  `}>
                    {session.employee_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{session.employee_name}</p>
                    <p className="text-sm text-gray-500">{session.employee_code}</p>
                  </div>
                  {session.session_id === currentSessionId && (
                    <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">Current</span>
                  )}
                </button>
              ))}

              {alreadyAssignedSessions.map((session) => (
                <div
                  key={session.session_id}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 flex items-center gap-4 opacity-60"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-300 text-white text-lg font-bold flex-shrink-0">
                    {session.employee_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-600">{session.employee_name}</p>
                    <p className="text-sm text-gray-400">{session.employee_code}</p>
                  </div>
                  <span className="px-3 py-1 bg-orange-400 text-white text-sm rounded-full">Already Assigned</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">ESC</kbd> to close
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== REMOTE STATION CARD ==============
interface RemoteStationCardProps {
  remoteId: string;
  session: TestSession | null;
  onClickAssign: () => void;
  onRemove: () => void;
  index: number;
}

const RemoteStationCard: React.FC<RemoteStationCardProps> = ({
  remoteId,
  session,
  onClickAssign,
  onRemove,
  index,
}) => {
  const isAssigned = !!session;

  return (
    <div 
      className={`
        group relative bg-white rounded-2xl border-2 overflow-hidden
        transition-all duration-300 hover:shadow-2xl cursor-pointer
        ${isAssigned ? 'border-green-300 hover:border-green-400' : 'border-orange-300 hover:border-orange-400'}
        animate-slide-up
      `}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClickAssign}
    >
      {/* Top Gradient Bar */}
      <div className={`
        h-2 w-full transition-all
        ${isAssigned 
          ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-400' 
          : 'bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400'
        }
      `} />

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-4 right-3 w-8 h-8 rounded-full bg-red-50 hover:bg-red-500 flex items-center justify-center text-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
        title="Remove Remote"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-2xl
            ${isAssigned 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-200' 
              : 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-200'
            }
            transition-transform group-hover:scale-105
          `}>
            {remoteId}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-lg">Remote #{remoteId}</h4>
            <p className={`text-sm font-medium ${isAssigned ? 'text-green-600' : 'text-orange-600'}`}>
              {isAssigned ? '✓ Employee Assigned' : '⚠ Awaiting Assignment'}
            </p>
          </div>
        </div>

        {/* Content */}
        {isAssigned ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {session.employee_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 truncate">{session.employee_name}</p>
                <p className="text-sm text-gray-500 truncate">{session.employee_code}</p>
              </div>
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-dashed border-orange-200 flex items-center justify-center gap-3 min-h-[72px]">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-orange-600 font-medium">Click to assign employee</span>
          </div>
        )}
      </div>

      {/* Bottom Action Hint */}
      <div className={`
        absolute bottom-0 left-0 right-0 py-2 text-center text-xs font-medium
        transition-all duration-300 transform translate-y-full group-hover:translate-y-0
        ${isAssigned ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}
      `}>
        Click to {isAssigned ? 'change' : 'assign'} employee
      </div>
    </div>
  );
};

// ============== TOAST NOTIFICATION ==============
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-orange-500',
    info: 'bg-purple-500',
  };

  return (
    <div className={`
      ${styles[type]} text-white px-6 py-3 rounded-2xl shadow-2xl 
      flex items-center gap-3 animate-slide-up
    `}>
      {type === 'success' && <CheckCircle className="w-5 h-5" />}
      {type === 'error' && <AlertCircle className="w-5 h-5" />}
      {type === 'warning' && <AlertCircle className="w-5 h-5" />}
      {type === 'info' && <Wifi className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// ============== MAIN COMPONENT ==============
const RefresherRemoteLobby: React.FC<Props> = ({
  scheduleId,
  batchId,
  testType,
  topicName,
  onBack,
  onStartTest,
}) => {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Record<string, number | null>>({});
  const [remoteInputs, setRemoteInputs] = useState<string[]>([]);
  const [newRemote, setNewRemote] = useState('');
  const [error, setError] = useState('');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRemoteId, setActiveRemoteId] = useState<string>('');
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/refresher/test/start/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule_id: scheduleId,
          test_type: testType,
          mode: 'remote',
          batch_id: batchId ?? null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to fetch sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRemote = () => {
    const trimmed = newRemote.trim();
    if (!trimmed) return;
    
    if (remoteInputs.includes(trimmed)) {
      showToast(`Remote #${trimmed} already exists`, 'warning');
      return;
    }

    setRemoteInputs(prev => [...prev, trimmed]);
    setAssignments(prev => ({ ...prev, [trimmed]: null }));
    setNewRemote('');
    setError('');
    showToast(`Remote #${trimmed} added successfully!`, 'success');
  };

  const handleRemoveRemote = (remoteId: string) => {
    setRemoteInputs(prev => prev.filter(id => id !== remoteId));
    setAssignments(prev => {
      const newAssignments = { ...prev };
      delete newAssignments[remoteId];
      return newAssignments;
    });
    showToast(`Remote #${remoteId} removed`, 'info');
  };

  const handleOpenModal = (remoteId: string) => {
    setActiveRemoteId(remoteId);
    setModalOpen(true);
  };

  const handleEmployeeAssign = (session: TestSession) => {
    setAssignments(prev => ({
      ...prev,
      [activeRemoteId]: session.session_id,
    }));
    showToast(`${session.employee_name} assigned to Remote #${activeRemoteId}`, 'success');
  };

  const handleStartClick = () => {
    if (remoteInputs.length === 0) {
      setError('Please add at least one remote.');
      showToast('Please add at least one remote.', 'error');
      return;
    }

    const unassigned = remoteInputs.filter(id => !assignments[id]);
    if (unassigned.length > 0) {
      setError('Please assign an employee to every added remote.');
      showToast('Please assign an employee to every added remote.', 'error');
      return;
    }

    const sessionIds = Object.values(assignments).filter(Boolean) as number[];
    const uniqueSessionIds = new Set(sessionIds);
    if (sessionIds.length !== uniqueSessionIds.size) {
      setError('An employee cannot be assigned to multiple remotes.');
      showToast('An employee cannot be assigned to multiple remotes.', 'error');
      return;
    }

    const finalMap: Record<string, number> = {};
    for (const remoteId of remoteInputs) {
      const sessionId = assignments[remoteId];
      if (sessionId) {
        finalMap[remoteId] = sessionId;
      }
    }

    onStartTest(finalMap);
  };

  const pendingSessions = sessions.filter(s => !s.is_completed);
  const assignedSessionIds = Object.values(assignments).filter(Boolean) as number[];

  const stats = useMemo(() => {
    const total = remoteInputs.length;
    const assigned = remoteInputs.filter(id => assignments[id]).length;
    return { total, assigned, pending: total - assigned };
  }, [remoteInputs, assignments]);

  const getSessionById = (id: number | null): TestSession | null => {
    if (!id) return null;
    return sessions.find(s => s.session_id === id) ?? null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-up { animation: scale-up 0.3s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; opacity: 0; }
      `}</style>

      <StickyHeader>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <button
                onClick={onBack}
                className="flex items-center text-gray-400 hover:text-purple-600 mb-2 font-bold transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Wifi className="w-6 h-6 text-purple-600" />
                Remote Assignment
              </h1>
              <p className="text-gray-500 text-sm">
                {topicName} • {testType === 'pre' ? 'Pre-Test' : 'Post-Test'}
                {batchId && ` • Batch ${batchId}`}
              </p>
            </div>

            <ProgressStepper currentStage={testType === 'pre' ? 1 : 3} />
          </div>
        </div>
      </StickyHeader>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Wifi className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-xs text-gray-400 uppercase font-bold">
                Remotes
              </div>
            </div>
          </div>

          <div className="bg-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.assigned}/{stats.total}
              </div>
              <div className="text-xs text-gray-400 uppercase font-bold">
                Assigned
              </div>
            </div>
          </div>

          <div className="bg-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {pendingSessions.length}
              </div>
              <div className="text-xs text-gray-400 uppercase font-bold">
                Available
              </div>
            </div>
          </div>

          {stats.pending > 0 && (
            <div className="bg-orange-50 px-6 py-4 rounded-2xl shadow-lg flex items-center gap-4 border border-orange-200">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.pending}
                </div>
                <div className="text-xs text-orange-500 uppercase font-bold">
                  Pending
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* LEFT: Remote Stations Grid */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Wifi className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Remote Stations</h2>
                    <p className="text-sm text-gray-500">Click on a station to assign employee</p>
                  </div>
                </div>

                {stats.total > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {stats.total} Total
                    </div>
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {stats.assigned} Assigned
                    </div>
                    {stats.pending > 0 && (
                      <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium animate-pulse">
                        {stats.pending} Pending
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-3 font-medium mb-6">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {remoteInputs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {remoteInputs.map((remoteId, index) => (
                    <RemoteStationCard
                      key={remoteId}
                      remoteId={remoteId}
                      session={getSessionById(assignments[remoteId])}
                      onClickAssign={() => handleOpenModal(remoteId)}
                      onRemove={() => handleRemoveRemote(remoteId)}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                  <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Wifi className="w-12 h-12 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No Remote Stations</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Use the remote control panel to add stations. <br />
                    Enter a number and press <strong>OK</strong> to add.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Remote Control Panel */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-32">
              {/* <div className="text-center mb-6"> */}
                {/* <h3 className="text-lg font-bold text-gray-800 flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5 text-purple-600" /> Add Remote Station
                </h3> */}
                {/* <p className="text-sm text-gray-500 mt-1">Enter station number & press OK</p> */}
              {/* </div> */}

              <EasyTestRemote
                value={newRemote}
                onChange={setNewRemote}
                onSubmit={handleAddRemote}
                isActive={true}
              />

              {/* Quick Add Buttons */}
              {/* <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 text-center">Quick Add</p>
                <div className="grid grid-cols-5 gap-2">
                  {['1', '2', '3', '4', '5'].map(num => {
                    const exists = remoteInputs.includes(num);
                    return (
                      <button
                        key={num}
                        onClick={() => {
                          if (!exists) {
                            setRemoteInputs(prev => [...prev, num]);
                            setAssignments(prev => ({ ...prev, [num]: null }));
                            showToast(`Remote #${num} added`, 'success');
                          }
                        }}
                        disabled={exists}
                        className={`
                          h-10 rounded-xl font-bold text-sm transition-all
                          ${exists 
                            ? 'bg-green-100 text-green-600 cursor-not-allowed' 
                            : 'bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700'
                          }
                        `}
                      >
                        {exists ? '✓' : num}
                      </button>
                    );
                  })}
                </div>
              </div> */}

              {/* <div className="mt-6 p-4 bg-purple-50 text-purple-700 text-sm rounded-xl">
                <strong className="block mb-2">Instructions:</strong>
                <ul className="space-y-1 text-purple-600">
                  <li>• Enter the ID from the physical remote</li>
                  <li>• Click on a station to assign employee</li>
                  <li>• Click Start when all assigned</li>
                </ul>
              </div> */}

              <button
                onClick={handleStartClick}
                disabled={stats.total === 0 || stats.pending > 0}
                className="w-full mt-6 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black disabled:opacity-50 disabled:hover:bg-gray-900 transition-colors flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5 fill-current" /> Start Group Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Selection Modal */}
      <EmployeeSelectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        sessions={sessions}
        assignedSessionIds={assignedSessionIds}
        onSelect={handleEmployeeAssign}
        remoteId={activeRemoteId}
        currentSessionId={assignments[activeRemoteId]}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[101]">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
};

export default RefresherRemoteLobby;