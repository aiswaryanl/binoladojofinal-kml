// src/pages/TestEnded.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle, 
  Maximize, 
  BarChart3, 
  ArrowRight, 
  Keyboard,
  Radio,
  Sparkles
} from 'lucide-react';

const API_BASE_URL = "http://192.168.2.51:8000";

// Remote Control Codes
const REMOTE_CODES = {
  EXAM_MODE_SELECTOR: "R52:13",
  VIEW_RESULTS: "R52:7",
};

const TestEnded: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // FIX: Use Refs instead of State for polling to prevent re-renders/loops
  const lastEventIdRef = useRef<number | null>(null);
  const initialEventIdRef = useRef<number | null>(null);
  
  const [countdown, setCountdown] = useState<number | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const navigationCalledRef = useRef(false);

  const endState = (location.state || {}) as {
    examMode?: string;
    levelId?: number;
    stationId?: number;
    departmentId?: number;
    sessionKey?: string | null;
    employee?: { name?: string };
    test_name?: string;
  };

  const examMode = endState.examMode;
  const levelId = endState.levelId;
  const stationId = endState.stationId;
  const departmentId = endState.departmentId;
  const sessionKey = endState.sessionKey || null;
  const employeeName = endState.employee?.name;
  const testName = endState.test_name;

  // For ResultsExplorer: 'remote' for remote exams, 'individual' for others
  const resultsMode = examMode === 'remote' ? 'remote' : 'individual';

  // --- FULLSCREEN LOGIC ---
  const enterFullScreen = async () => {
    if (document.fullscreenElement) {
      setIsFullScreen(true);
      return;
    }
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) await elem.requestFullscreen();
      else if ((elem as any).webkitRequestFullscreen) await (elem as any).webkitRequestFullscreen();
      else if ((elem as any).msRequestFullscreen) await (elem as any).msRequestFullscreen();
      setIsFullScreen(true);
    } catch (err) {
      console.error("FS Error:", err);
      // Allow usage without fullscreen if it fails
      setIsFullScreen(true);
    }
  };

  useEffect(() => {
    // Auto-enter fullscreen on mount
    if (document.fullscreenElement) {
      setIsFullScreen(true);
    } else {
      enterFullScreen();
    }

    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDownSecurity = (e: KeyboardEvent) => {
      if (["F11", "F5", "F12"].includes(e.key) || (e.ctrlKey && e.key === "r")) {
        e.preventDefault();
      }
    };

    // Prevent Back Button - Replace current history
    window.history.replaceState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.replaceState(null, "", window.location.href);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDownSecurity);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDownSecurity);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // --- NAVIGATION LOGIC ---
  const handleExitAndNavigate = async (path: string, label: string) => {
    if (navigationCalledRef.current) return;
    navigationCalledRef.current = true;

    setNavigatingTo(label);
    setCountdown(3);

    // Countdown before navigation
    for (let i = 2; i >= 0; i--) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(i);
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Error exiting full screen", err);
    }

    // Use replace: true to prevent going back to this page
    navigate(path, { replace: true });
  };

  const handleGoToExamMode = () => {
    handleExitAndNavigate('/ExamModeSelector', 'Exam Mode Selector');
  };

  const handleViewResults = () => {
    const params = new URLSearchParams();
    params.set('mode', resultsMode);
    if (levelId) params.set('level_id', String(levelId));
    if (departmentId) params.set('department_id', String(departmentId));
    if (stationId) params.set('station_id', String(stationId));
    if (resultsMode === 'remote' && sessionKey) {
      params.set('session_key', sessionKey);
    }
    const url = `/results-explorer?${params.toString()}`;
    handleExitAndNavigate(url, 'Results');
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    if (!isFullScreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (navigationCalledRef.current) return;

      if (event.key === "Backspace") {
        event.preventDefault();
        handleGoToExamMode();
      } else if (event.key === "Enter") {
        event.preventDefault();
        handleViewResults();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  // ==========================================
  //  ⚡ REMOTE POLLING (FIXED)
  // ==========================================
  useEffect(() => {
    if (!isFullScreen) return;

    // FIX: Polling set to 1000ms (1 second) to prevent server spam
    const interval = setInterval(async () => {
      if (navigationCalledRef.current) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/key-events/latest/`);
        if (!res.ok) return;
        
        const evt = await res.json();
        if (!evt?.id) return;

        // Logic using Refs instead of State to prevent re-renders
        if (initialEventIdRef.current === null) {
          initialEventIdRef.current = evt.id;
          lastEventIdRef.current = evt.id;
          return;
        }

        if (lastEventIdRef.current !== null && evt.id <= lastEventIdRef.current) {
            return;
        }
        
        // New event found
        lastEventIdRef.current = evt.id;
        const { info } = evt;
        if (!info) return;

        if (info === REMOTE_CODES.EXAM_MODE_SELECTOR) {
          handleGoToExamMode();
        } else if (info === REMOTE_CODES.VIEW_RESULTS) {
          handleViewResults();
        }
      } catch (e) {
        console.error("Remote polling error:", e);
      }
    }, 1000); // <-- 1 Second Interval (Safe)

    return () => clearInterval(interval);
  }, [isFullScreen]); // <-- Minimal dependencies

  // --- FULLSCREEN PROMPT ---
  if (!isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center text-white p-8 text-center select-none overflow-hidden">
        <div className="max-w-md w-full">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Test Completed!</h1>
          <p className="text-xl text-gray-300 mb-8">Enter fullscreen to view your results.</p>

          <button
            onClick={enterFullScreen}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all transform hover:scale-105 shadow-lg"
          >
            <Maximize className="w-6 h-6" />
            CONTINUE
          </button>
        </div>
      </div>
    );
  }

  // --- NAVIGATION COUNTDOWN OVERLAY ---
  if (navigatingTo) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center text-white select-none overflow-hidden">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border-4 border-white/20">
            <span className="text-6xl font-black text-white">{countdown}</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">Navigating to</h2>
          <p className="text-2xl text-purple-300 font-semibold">{navigatingTo}</p>
          <div className="mt-8">
            <div className="w-48 h-2 mx-auto bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${((3 - (countdown || 0)) / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN SUCCESS SCREEN ---
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col overflow-hidden select-none">
      
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-60 animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-300 rounded-full opacity-40 animate-ping" style={{ animationDelay: '0.7s' }}></div>
        <div className="absolute bottom-1/4 left-3/4 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-50 animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-indigo-300 rounded-full opacity-30 animate-ping" style={{ animationDelay: '0.3s' }}></div>
      </div>

      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 bg-black/20 backdrop-blur-md border-b border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Test Completed</p>
              <p className="text-xs text-slate-400">{testName || 'Assessment'}</p>
            </div>
          </div>

          {employeeName && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white font-medium">{employeeName}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Radio className="w-4 h-4" />
            <span>Remote Ready</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center relative z-10 p-8">
        <div className="text-center max-w-4xl">
          
          {/* Success Icon */}
          <div className="mb-8 inline-flex items-center justify-center w-28 h-28 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-2xl shadow-green-500/30 animate-bounce">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          {/* Main Message */}
          <h1 className="text-5xl md:text-7xl xl:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-6 leading-tight">
            Congratulations!
          </h1>
          
          <p className="text-xl md:text-2xl xl:text-3xl text-slate-300 font-light mb-12 leading-relaxed">
            You've completed the quiz successfully
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
            <button
              onClick={handleGoToExamMode}
              className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 active:scale-95 border border-blue-500/30"
            >
              <div className="flex items-center justify-center gap-3">
                <ArrowRight className="w-5 h-5" />
                <span>Exam Mode Selector</span>
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono">Backspace</kbd>
              </div>
            </button>
            
            <button
              onClick={handleViewResults}
              className="group relative px-10 py-5 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30 active:scale-95 border border-green-500/30"
            >
              <div className="flex items-center justify-center gap-3">
                <BarChart3 className="w-5 h-5" />
                <span>View Results</span>
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono">Enter</kbd>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Footer with Shortcuts */}
      <footer className="flex-shrink-0 px-6 py-4 bg-black/20 backdrop-blur-md border-t border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Keyboard & Remote Shortcuts */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Keyboard Shortcuts */}
            <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">Keyboard:</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 rounded-lg bg-slate-700 text-white text-xs font-mono border border-slate-600 shadow">Backspace</kbd>
                  <span className="text-xs text-slate-500">Exam Mode</span>
                </div>
                <div className="w-px h-4 bg-white/20"></div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 rounded-lg bg-slate-700 text-white text-xs font-mono border border-slate-600 shadow">Enter</kbd>
                  <span className="text-xs text-slate-500">Results</span>
                </div>
              </div>
            </div>

            {/* Remote Shortcuts */}
            <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">Remote:</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-mono border border-purple-500/30">R52:13</span>
                  <span className="text-xs text-slate-500">Exam Mode</span>
                </div>
                <div className="w-px h-4 bg-white/20"></div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs font-mono border border-green-500/30">R52:7</span>
                  <span className="text-xs text-slate-500">Results</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default TestEnded;