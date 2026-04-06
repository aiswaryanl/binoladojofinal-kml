// AssignEmployees.tsx - Redesigned Layout with Horizontal Receiver
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ============== INSTRUCTIONS PANEL (EXPANDABLE - FULL WIDTH BLOCK) ==============
const InstructionsPanel: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-6 py-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-lg">📋 How to add a remote station</span>
          <span className="text-xs text-gray-500">(click to {open ? 'collapse' : 'expand'})</span>
        </div>
        <div className="text-gray-500 text-sm">{open ? '▲' : '▼'}</div>
      </button>

      {open && (
        <div className="px-6 pb-6 text-sm text-gray-700 space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 border">
              <div className="font-semibold text-gray-800 mb-2">Steps</div>
              <ol className="list-decimal ml-5 space-y-2">
                <li>Check receiver status (green = connected).</li>
                <li>Enter Remote ID using keypad or keyboard <b>[0-9]</b>.</li>
                <li>Press <b>OK</b> or <b>Enter</b> to add the remote.</li>
                <li>Press <b>C</b> to clear. Use <b>Backspace</b> to delete.</li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl bg-white border">
              <div className="font-semibold text-gray-800 mb-2">Keyboard shortcuts</div>
              <div className="flex flex-wrap gap-2 items-center">
                <kbd className="px-2 py-1 bg-gray-100 border rounded font-mono text-xs">0-9</kbd>
                <span>Digits</span>
                <kbd className="px-2 py-1 bg-gray-100 border rounded font-mono text-xs ml-3">Enter</kbd>
                <span>OK</span>
                <kbd className="px-2 py-1 bg-gray-100 border rounded font-mono text-xs ml-3">C</kbd>
                <span>Clear</span>
                <kbd className="px-2 py-1 bg-gray-100 border rounded font-mono text-xs ml-3">Backspace</kbd>
                <span>Delete</span>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Tip: Remote input works even if the receiver is disconnected.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============== EASYTEST RECEIVER COMPONENT (HORIZONTAL - OPTIMIZED) ==============
const EasyTestReceiverHorizontal: React.FC<{ onStatusChange?: (connected: boolean) => void }> = ({ onStatusChange }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false); // Used for manual refresh animation
  
  // Transition tracking
  const prevConnectedRef = useRef<boolean | null>(null);
  const didFirstConnectRef = useRef<boolean>(false);
  const confettiHostRef = useRef<HTMLDivElement | null>(null);

  // Confetti Logic (Kept same)
  const burstConfetti = useCallback(() => {
    const host = confettiHostRef.current;
    if (!host) return;
    host.innerHTML = '';
    const colors = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'];
    for (let i = 0; i < 26; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.background = colors[i % colors.length];
      const x1 = (Math.random() * 220 - 110).toFixed(0) + 'px';
      const y1 = (Math.random() * 200 + 120).toFixed(0) + 'px';
      el.style.setProperty('--x0', '0px');
      el.style.setProperty('--y0', '0px');
      el.style.setProperty('--x1', x1);
      el.style.setProperty('--y1', y1);
      el.style.width = `${6 + Math.floor(Math.random() * 5)}px`;
      el.style.height = `${10 + Math.floor(Math.random() * 7)}px`;
      el.style.animationDelay = `${Math.random() * 90}ms`;
      host.appendChild(el);
    }
  }, []);

  // 1. WebSocket Listener (Replaces Interval)
  useEffect(() => {
    // Initial Check
    const checkInitialStatus = async () => {
      try {
        const res = await fetch("http://192.168.2.51:8000/api/receiver-status/");
        if (res.ok) {
          const data = await res.json();
          setIsConnected(Boolean(data.connected));
        }
      } catch (e) {
        setIsConnected(false);
      }
    };
    checkInitialStatus();

    // WS Connection
    const ws = new WebSocket("ws://192.168.2.51:8000/ws/quiz/");
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connect_event') {
          const info = data.payload.info;
          setIsConnected(info === "1");
        }
      } catch (e) {
        console.error("WS Error", e);
      }
    };

    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, []);

  // 2. Status Change Effect (Toast + Confetti)
  useEffect(() => {
    const prev = prevConnectedRef.current;
    if (prev === null) {
      prevConnectedRef.current = isConnected;
      return;
    }
    if (prev !== isConnected) {
      onStatusChange?.(isConnected);
      if (isConnected && !didFirstConnectRef.current) {
        didFirstConnectRef.current = true;
        burstConfetti();
      }
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected, onStatusChange, burstConfetti]);

  // 3. Manual Refresh Handler
  const handleManualRefresh = async () => {
    setIsChecking(true);
    try {
      const res = await fetch("http://192.168.2.51:8000/api/receiver-status/");
      if (res.ok) {
        const data = await res.json();
        setIsConnected(Boolean(data.connected));
      }
    } catch {
      setIsConnected(false);
    } finally {
      // Small timeout to let spinner show
      setTimeout(() => setIsChecking(false), 500);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Horizontal USB Receiver Layout */}
      <div className={`relative flex items-center transition-all duration-500 ${isConnected ? 'opacity-100' : 'opacity-60 grayscale'}`}>
        <div ref={confettiHostRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none" aria-hidden="true" />

        {/* Metal USB Connector */}
        <div className="w-10 h-10 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 border border-gray-400 rounded-l-md relative shadow-sm z-0 flex items-center justify-center">
          <div className="absolute left-2.5 top-2 w-3 h-2.5 bg-white border border-gray-400 shadow-inner" />
          <div className="absolute left-2.5 bottom-2 w-3 h-2.5 bg-white border border-gray-400 shadow-inner" />
        </div>

        {/* White Body */}
        <div className="w-40 h-16 bg-slate-50 rounded-r-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),inset_0_-2px_4px_rgba(0,0,0,0.1)] border border-gray-200 relative -ml-1 z-10 flex items-center justify-center overflow-hidden">
          <div className="w-32 h-12 bg-gray-100 border border-gray-300 rounded flex items-center px-2 relative overflow-hidden">
            {/* LED */}
            <div className={`w-2 h-2 rounded-full mr-2 shadow-sm transition-colors duration-300 flex-shrink-0 ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-400'}`} />

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="text-[8px] font-mono text-gray-500 tracking-tighter">MD:EA1000</span>
              <div className="flex h-3 w-16 gap-[1px] justify-center items-center my-0.5 bg-white px-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`h-full bg-black ${i % 3 === 0 ? 'w-[2px]' : 'w-[1px]'}`} />
                ))}
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-serif italic font-bold text-gray-800 text-[10px]">EasyTest</span>
                <span className="text-[5px] align-top">TM</span>
              </div>
            </div>

            {!isConnected && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="receiver-scan-line-horizontal" />
              </div>
            )}
          </div>
        </div>

        {isConnected && <div className="receiver-glow-ring-horizontal" aria-hidden="true" />}
      </div>

      {/* Status Badge */}
      <div className={`mt-3 px-4 py-2 rounded-full border flex items-center gap-2 transition-colors duration-300 ${isConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 receiver-led-breathe' : 'bg-red-500 receiver-warn-pulse'}`} />
        <span className={`text-xs font-bold ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
          {isConnected ? "Connected" : "Not Connected"}
        </span>

        <button
          type="button"
          onClick={handleManualRefresh}
          className="ml-1 text-[11px] px-2 py-1 rounded-full bg-white border hover:bg-gray-50 transition-colors flex items-center gap-2"
          title="Manual refresh"
        >
          {isChecking && <span className="receiver-spinner" aria-hidden="true" />}
          {isChecking ? '...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

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

// ============== INTERFACES ==============
interface Employee {
  id: string;
  name: string;
  pay_code: string;
  section: string;
  eligible?: boolean;
}

interface Station {
  station_id: number;
  station_name: string;
  subline: number;
}

interface QuestionPaper {
  id: number;
  name: string;
  station_id?: number | null;
  level_id?: number | null;
}

interface LocationState {
  questionPaperId?: number;
  skillId?: number;
  levelId?: number;
  skillName?: string;
  levelName?: string;
  fromNavigation?: boolean;
  examMode?: "remote" | "computer" | "tablet";
  lineName?: string;
  prevpage?: string;
  sectionTitle?: string;
  Level?: any;
  departmentId?: number;
  lineId?: number;
  sublineId?: number;
  stationId?: number;
  stationName?: string;
}

// ============== TOAST NOTIFICATION COMPONENT ==============
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
    info: 'bg-blue-500',
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className={`
      ${styles[type]} text-white px-6 py-3 rounded-2xl shadow-2xl
      flex items-center gap-3 animate-slide-up
    `}>
      {icons[type]}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// ============== GLOBAL EMPLOYEE SELECTION MODAL ==============
interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  assignedEmployeeIds: string[];
  onSelect: (employee: Employee) => void;
  remoteId: string;
  currentEmployeeId?: string | null;
}

const EmployeeSelectionModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  employees,
  assignedEmployeeIds,
  onSelect,
  remoteId,
  currentEmployeeId,
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

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return employees.filter(emp => {
      if (!q) return true;
      return (
        emp.name?.toLowerCase()?.includes(q) ||
        emp.pay_code?.toLowerCase()?.includes(q) ||
        emp.section?.toLowerCase()?.includes(q)
      );
    });
  }, [employees, searchQuery]);

  const availableEmployees = filteredEmployees.filter(
    emp => !assignedEmployeeIds.includes(emp.id) || emp.id === currentEmployeeId
  );

  const alreadyAssignedEmployees = filteredEmployees.filter(
    emp => assignedEmployeeIds.includes(emp.id) && emp.id !== currentEmployeeId
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-up overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold">{remoteId}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Assign Employee</h2>
                <p className="text-blue-100">Remote Station #{remoteId}</p>
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

          <div className="mt-4 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by name, pay code, or section..."
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

        <div className="px-6 py-3 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{availableEmployees.length}</span> available
              {alreadyAssignedEmployees.length > 0 && (
                <span className="ml-2 text-orange-600">
                  • {alreadyAssignedEmployees.length} already assigned
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredEmployees.length === 0 ? (
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
              {availableEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => {
                    onSelect(emp);
                    onClose();
                  }}
                  className={`
                    group p-4 rounded-2xl border-2 text-left transition-all duration-200
                    ${emp.id === currentEmployeeId
                      ? 'border-green-400 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 transition-transform group-hover:scale-110
                      ${emp.id === currentEmployeeId
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }
                    `}>
                      {emp.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 truncate">{emp.name}</p>
                        {emp.id === currentEmployeeId && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">Current</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{emp.pay_code}</p>
                      <p className="text-xs text-gray-400 truncate mt-1">{emp.section}</p>
                    </div>
                  </div>
                </button>
              ))}

              {alreadyAssignedEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-300 text-white text-xl font-bold flex-shrink-0">
                      {emp.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-600 truncate">{emp.name}</p>
                        <span className="px-2 py-0.5 bg-orange-400 text-white text-xs rounded-full">Assigned</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{emp.pay_code}</p>
                      <p className="text-xs text-gray-400 truncate mt-1">{emp.section}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {availableEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => {
                    onSelect(emp);
                    onClose();
                  }}
                  className={`
                    w-full p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all
                    ${emp.id === currentEmployeeId
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }
                  `}
                >
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0
                    ${emp.id === currentEmployeeId
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    }
                  `}>
                    {emp.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{emp.name}</p>
                    <p className="text-sm text-gray-500">{emp.pay_code} • {emp.section}</p>
                  </div>
                  {emp.id === currentEmployeeId && (
                    <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">Current</span>
                  )}
                </button>
              ))}

              {alreadyAssignedEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 flex items-center gap-4 opacity-60"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-300 text-white text-lg font-bold flex-shrink-0">
                    {emp.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-600">{emp.name}</p>
                    <p className="text-sm text-gray-400">{emp.pay_code} • {emp.section}</p>
                  </div>
                  <span className="px-3 py-1 bg-orange-400 text-white text-sm rounded-full">Already Assigned</span>
                </div>
              ))}
            </div>
          )}
        </div>

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

// ============== ENHANCED REMOTE STATION CARD ==============
interface RemoteStationCardProps {
  remoteId: string;
  employee: Employee | null;
  onClickAssign: () => void;
  onRemove: () => void;
  index: number;
}

const RemoteStationCard: React.FC<RemoteStationCardProps> = ({
  remoteId,
  employee,
  onClickAssign,
  onRemove,
  index,
}) => {
  const isAssigned = !!employee;

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
      <div className={`
        h-2 w-full transition-all
        ${isAssigned
          ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-400'
          : 'bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400'
        }
      `} />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-4 right-3 w-8 h-8 rounded-full bg-red-50 hover:bg-red-500 flex items-center justify-center text-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
        title="Remove Remote"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="p-5">
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

        {isAssigned ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {employee.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 truncate">{employee.name}</p>
                <p className="text-sm text-gray-500 truncate">{employee.pay_code}</p>
                <p className="text-xs text-gray-400 truncate">{employee.section}</p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-dashed border-orange-200 flex items-center justify-center gap-3 min-h-[72px]">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-orange-600 font-medium">Click to assign employee</span>
          </div>
        )}
      </div>

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

// ============== MAIN COMPONENT ==============
const AssignEmployees: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = useMemo(
    () => location.state as LocationState | undefined,
    [location.state]
  );

  const CurrentLevel: number = (locationState?.Level as number) ?? locationState?.levelId ?? 2;
  const examMode: 'remote' | 'computer' | 'tablet' = locationState?.examMode ?? 'remote';
  const stationId: number = locationState?.stationId ?? 1;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [skills, setSkills] = useState<Station[]>([]);
  const [selectedSkill] = useState<number>(stationId);
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [remoteInputs, setRemoteInputs] = useState<string[]>([]);
  const [newRemote, setNewRemote] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionPapersFetched, setQuestionPapersFetched] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeRemoteId, setActiveRemoteId] = useState<string>('');

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sequence, setSequence] = useState<number>(1);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const hasFetched = useRef(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  // Toast gating for receiver (avoid repeats)
  const receiverPrevToastRef = useRef<boolean | null>(null);

  const selectedPaperName = useMemo(() => {
    return questionPapers.find(p => p.id === selectedPaperId)?.name;
  }, [questionPapers, selectedPaperId]);

  useEffect(() => {
    if (!selectedPaperId || !selectedDate) return;
    
    fetch(`http://192.168.2.51:8000/api/next-test-sequence/?paper_id=${selectedPaperId}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.next_sequence) {
          setSequence(data.next_sequence);
        }
      })
      .catch(err => console.error("Error fetching sequence:", err));
  }, [selectedPaperId, selectedDate]);

  const testName = useMemo(() => {
    const displayDate = selectedDate.split('-').reverse().join('/');
    return `${selectedPaperName || "Test"} - ${displayDate} - ${sequence}`;
  }, [selectedPaperName, selectedDate, sequence]);

  const stats = useMemo(() => {
    const total = remoteInputs.length;
    const assigned = remoteInputs.filter(id => assignments[id]).length;
    return { total, assigned, pending: total - assigned };
  }, [remoteInputs, assignments]);

  const assignedEmployeeIds = useMemo(() => {
    return Object.values(assignments).filter(Boolean) as string[];
  }, [assignments]);

  const fetchWithRetry = async (
    url: string,
    retries = 3,
    delay = 1000
  ): Promise<any> => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            `HTTP error! Status: ${res.status}, Message: ${JSON.stringify(errorData)}`
          );
        }
        return await res.json();
      } catch (error) {
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const empUrl = `http://192.168.2.51:8000/skill-matrix/eligible-employees/?station_id=${stationId}&target_level=${CurrentLevel}`;

    fetchWithRetry(empUrl)
      .then(data => {
        if (Array.isArray(data)) {
          const mappedEmployees: Employee[] = data.map((item: any) => ({
            id: String(item.id),
            name: item.name || 'Unknown',
            pay_code: item.pay_code || 'N/A',
            section: item.section || 'N/A',
          }));
          setEmployees(mappedEmployees);
        } else {
          throw new Error("Invalid employee data format");
        }
      })
      .catch((error: any) => {
        console.error('Error fetching employees:', error);
        showToast('Failed to load eligible employees. ' + error.message, 'error');
      });

    fetchWithRetry('http://192.168.2.51:8000/stations/')
      .then(data => {
        if (Array.isArray(data)) {
          setSkills(data);
        } else {
          throw new Error("Invalid station data format");
        }
      })
      .catch((error: any) => {
        console.error('Error fetching stations:', error);
        showToast('Failed to load skills: ' + error.message, 'error');
      });
  }, [stationId, CurrentLevel, showToast]);

  useEffect(() => {
    if (!stationId || !CurrentLevel) return;

    const params = new URLSearchParams();
    params.append('station', stationId.toString());
    params.append('level', CurrentLevel.toString());

    fetchWithRetry(`http://192.168.2.51:8000/questionpapers/?${params.toString()}`)
      .then(data => {
        if (Array.isArray(data)) {
          const mappedPapers: QuestionPaper[] = data.map((item: any) => ({
            id: item.question_paper_id,
            name: item.question_paper_name,
            station_id: item.station ? item.station.id : null,
            level_id: item.level ? item.level.id : null,
          }));
          setQuestionPapers(mappedPapers);
        } else {
          throw new Error('Invalid question paper data format');
        }
        setQuestionPapersFetched(true);
      })
      .catch((error: any) => {
        console.error('Error fetching question papers:', error);
        showToast('Failed to load question papers: ' + error.message, 'error');
        setQuestionPapers([]);
        setQuestionPapersFetched(true);
      });
  }, [stationId, CurrentLevel, showToast]);

  useEffect(() => {
    if (!questionPapersFetched) return;
    if (questionPapers.length > 0) {
      setSelectedPaperId(questionPapers[0].id);
    } else {
      setSelectedPaperId(null);
      if (stationId && CurrentLevel) {
        showToast('No question papers found for this station/level.', 'warning');
      }
    }
  }, [questionPapers, questionPapersFetched, stationId, CurrentLevel, showToast]);

  const handleAddRemote = useCallback(() => {
    const trimmed = newRemote.trim();
    if (trimmed && !remoteInputs.includes(trimmed)) {
      setRemoteInputs(prev => [...prev, trimmed]);
      setNewRemote('');
      showToast(`Remote #${trimmed} added successfully!`, 'success');
    } else if (remoteInputs.includes(trimmed)) {
      showToast(`Remote #${trimmed} already exists`, 'warning');
    }
  }, [newRemote, remoteInputs, showToast]);

  const handleRemoveRemote = (remoteId: string) => {
    setRemoteInputs((prev) => prev.filter((id) => id !== remoteId));
    setAssignments((prev) => {
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

  const handleEmployeeAssign = (employee: Employee) => {
    setAssignments(prev => ({
      ...prev,
      [activeRemoteId]: employee.id,
    }));
    showToast(`${employee.name} assigned to Remote #${activeRemoteId}`, 'success');
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    showToast(`${employee.name} selected`, 'success');
  };

  const handleStartTest = async () => {
    if (!testName.trim()) {
      showToast('Please enter a test name.', 'error');
      return;
    }
    if (!selectedPaperId) {
      showToast('Please select a question paper.', 'error');
      return;
    }

    if (examMode === 'remote') {
      for (const remoteId of remoteInputs) {
        if (!assignments[remoteId]) {
          showToast(`Please assign an employee for Remote #${remoteId}.`, 'error');
          return;
        }
      }
      if (remoteInputs.length === 0) {
        showToast('Please add at least one remote station.', 'error');
        return;
      }
    } else {
      if (!selectedEmployee) {
        showToast('Please select an employee.', 'error');
        return;
      }
    }

    try {
      setIsLoading(true);

      let remoteEmployee: Employee | null = null;
      if (examMode === 'remote' && remoteInputs.length > 0) {
        const firstRemoteEmployeeId = assignments[remoteInputs[0]];
        remoteEmployee = employees.find(emp => emp.id === firstRemoteEmployeeId) ?? null;
      }

      if (examMode === "remote") {
        const payload = {
          test_name: testName.trim(),
          question_paper_id: selectedPaperId,
          level: CurrentLevel,
          skill: selectedSkill,
          test_date: selectedDate,
          assignments: Object.entries(assignments).map(([key_id, employee_id]) => ({
            key_id,
            employee_id,
          })),
        };

        const res = await fetch("http://192.168.2.51:8000/start-test/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          showToast(`Failed to start test: ${JSON.stringify(errorData)}`, 'error');
          return;
        }
      }

      navigate("/quiz-instructions", {
        state: {
          paperId: selectedPaperId,
          skillId: selectedSkill,
          levelId: CurrentLevel,
          examMode,
          employee: examMode !== "remote" ? selectedEmployee : remoteEmployee,
          employeeId: examMode !== "remote" ? selectedEmployee?.id : remoteEmployee?.id,
          testName: testName.trim(),
          testDate: selectedDate,
          allowedRemotes: examMode === "remote" ? remoteInputs : [],
          ...locationState,
        },
      });
    } catch (error) {
      console.error('Error starting test:', error);
      showToast(`Failed to start test: ${(error as Error).message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = examMode === 'remote'
    ? Boolean(testName.trim() && selectedPaperId && remoteInputs.length > 0 && remoteInputs.every(id => assignments[id]))
    : Boolean(testName.trim() && selectedPaperId && selectedEmployee);

  const filteredEmployees = employees.filter(emp => {
    const q = searchQuery.toLowerCase();
    return (
      emp.name?.toLowerCase()?.includes(q) ||
      emp.pay_code?.toLowerCase()?.includes(q)
    );
  });

  const stationDisplayName =
    locationState?.stationName ??
    skills.find(s => s.station_id === selectedSkill)?.station_name ??
    'Station 1';

  const progressSteps = examMode === 'remote'
    ? [
      { label: 'Test Setup', completed: !!selectedPaperId },
      { label: 'Add Remotes', completed: remoteInputs.length > 0 },
      { label: 'Assign All', completed: stats.pending === 0 && stats.total > 0 },
    ]
    : [
      { label: 'Test Setup', completed: !!selectedPaperId },
      { label: 'Select Employee', completed: !!selectedEmployee },
    ];

  const getEmployeeById = (id: string | undefined): Employee | null => {
    if (!id) return null;
    return employees.find(e => e.id === id) ?? null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <style>{`
        @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 25% { transform: translate(20px, -30px) scale(1.1); } 50% { transform: translate(-20px, 20px) scale(0.9); } 75% { transform: translate(30px, 10px) scale(1.05); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-blob { animation: blob 15s infinite ease-in-out; }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; opacity: 0; }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-up { animation: scale-up 0.3s ease-out forwards; }
        .animation-delay-2000 { animation-delay: 2s; }

        /* ===== Receiver animations (Horizontal) ===== */
        @keyframes receiverGlowHorizontal {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.35); }
          50% { box-shadow: 0 0 0 12px rgba(34,197,94,0.0); }
        }
        .receiver-glow-ring-horizontal{
          position:absolute;
          top:50%;
          left:50%;
          transform:translate(-50%, -50%);
          width:200px;
          height:70px;
          border-radius:14px;
          animation: receiverGlowHorizontal 1.4s ease-in-out infinite;
          pointer-events:none;
        }

        @keyframes receiverScanHorizontal {
          0% { transform: translateX(-20%); opacity: 0; }
          20% { opacity: 0.35; }
          60% { opacity: 0.2; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        .receiver-scan-line-horizontal{
          position:absolute;
          top:0;
          bottom:0;
          width:10px;
          left:0;
          background: linear-gradient(to right, transparent, rgba(239,68,68,0.25), transparent);
          animation: receiverScanHorizontal 1.6s ease-in-out infinite;
        }

        @keyframes receiverBreathe {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.25); opacity: 1; }
        }
        .receiver-led-breathe{
          animation: receiverBreathe 1.2s ease-in-out infinite;
        }

        @keyframes receiverWarn {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        .receiver-warn-pulse{
          animation: receiverWarn 1.4s ease-in-out infinite;
        }

        @keyframes receiverSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .receiver-spinner{
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: rgba(0,0,0,0.65);
          animation: receiverSpin 700ms linear infinite;
        }

        /* ===== Confetti ===== */
        @keyframes confetti-fall {
          0% { transform: translate(var(--x0), var(--y0)) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--x1), var(--y1)) rotate(720deg); opacity: 0; }
        }
        .confetti-piece{
          position:absolute;
          border-radius:2px;
          animation: confetti-fall 900ms ease-out forwards;
          pointer-events:none;
        }
      `}</style>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{examMode === 'remote' ? 'Remote Test Setup' : 'Test Assignment'}</h1>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            {progressSteps.map((step, idx) => (
              <div key={idx} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${step.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {step.label}
              </div>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <label className="text-xs font-medium text-blue-600 uppercase">Test Name</label>
                  <p className="font-bold text-gray-800 text-sm mt-1">{testName}</p>
                </div>
                <div className="flex flex-col items-end">
                  <label className="text-[10px] font-medium text-blue-600 uppercase mb-1">Select Date</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xs border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/50"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
              <label className="text-xs font-medium text-purple-600 uppercase">Paper</label>
              <p className="font-bold text-gray-800 text-sm mt-1 truncate">{selectedPaperName || 'Loading...'}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
              <label className="text-xs font-medium text-green-600 uppercase">Station</label>
              <p className="font-bold text-gray-800 text-sm mt-1">{stationDisplayName}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
              <label className="text-xs font-medium text-orange-600 uppercase">Level</label>
              <p className="font-bold text-gray-800 text-sm mt-1">Level {CurrentLevel}</p>
            </div>
          </div>
        </div>

        {/* Main Body */}
        <div className="px-6 py-6 pb-32">
          <div className="max-w-7xl mx-auto">
            {examMode === 'remote' ? (
              <>
                {/* Row 1: Remote Stations (Left) + Remote/Receiver (Right) */}
                <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                  
                  {/* Left: Remote Stations List (Takes most space) */}
                  <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/50 min-h-[500px]">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Remote Stations</h2>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {remoteInputs.length} Added
                      </span>
                    </div>

                    {remoteInputs.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {remoteInputs.map((remoteId, index) => (
                          <RemoteStationCard
                            key={remoteId}
                            remoteId={remoteId}
                            employee={getEmployeeById(assignments[remoteId])}
                            onClickAssign={() => handleOpenModal(remoteId)}
                            onRemove={() => handleRemoveRemote(remoteId)}
                            index={index}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        No remotes added yet.<br/>Use the keypad on the right.
                      </div>
                    )}
                  </div>

                  {/* Right: Remote Keypad + Receiver (Single Card) */}
                  <div className="flex-shrink-0 w-full lg:w-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/50 flex flex-col items-center">
                    {/* Remote Keypad Section */}
                    <div className="w-full">
                      <h3 className="text-lg font-bold text-gray-700 mb-4 text-center border-b pb-3">Add Remote</h3>
                      <EasyTestRemote value={newRemote} onChange={setNewRemote} onSubmit={handleAddRemote} />
                    </div>

                    {/* Divider */}
                    <div className="w-full my-6 border-t border-gray-200"></div>

                    {/* Receiver Section (Horizontal) */}
                    <div className="w-full">
                      <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">Receiver Status</h3>
                      <EasyTestReceiverHorizontal
                        onStatusChange={(connected) => {
                          if (receiverPrevToastRef.current === connected) return;
                          receiverPrevToastRef.current = connected;

                          if (connected) showToast('Receiver Connected!', 'success');
                          else showToast('Receiver Disconnected', 'warning');
                        }}
                      />
                    </div>
                  </div>

                </div>

                {/* Row 2: Instructions Panel (Full Width) */}
                <div className="mt-6">
                  <InstructionsPanel />
                </div>
              </>
            ) : (
              // Computer Mode (unchanged)
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Select Eligible Employee</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {employees.length} Eligible
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Search eligible employees..."
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl mb-6 focus:border-purple-400 outline-none"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto">
                  {filteredEmployees.map((employee, index) => (
                    <button
                      key={employee.id}
                      onClick={() => handleEmployeeSelect(employee)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all animate-slide-up ${selectedEmployee?.id === employee.id ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-100' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'}`}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 text-white flex items-center justify-center font-bold">
                          {employee.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{employee.name}</p>
                          <p className="text-xs text-gray-500">{employee.pay_code}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500">
                      {employees.length === 0 ? "No eligible employees found for this level/station." : "No matches found."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <EmployeeSelectionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          employees={employees}
          assignedEmployeeIds={assignedEmployeeIds}
          onSelect={handleEmployeeAssign}
          remoteId={activeRemoteId}
          currentEmployeeId={assignments[activeRemoteId]}
        />

        {toast && (
          <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-[101]">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-40 px-6 py-4 flex justify-between">
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-gray-100 font-semibold rounded-xl hover:bg-gray-200 transition-colors">Back</button>
          <button
            onClick={handleStartTest}
            disabled={isLoading || !isFormValid}
            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 ${isFormValid ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            {isLoading ? 'Starting...' : 'Start Test'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignEmployees;