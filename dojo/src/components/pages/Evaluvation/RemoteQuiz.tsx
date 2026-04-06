// src/pages/RemoteQuiz.tsx

import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Maximize,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  BarChart2,
  Clock,
  Users,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  X,
  Radio
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000/ws/quiz/";

// Answer Keys
const INFO_TO_INDEX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

// Remote Control Codes
const REMOTE_CODES = {
  NAV_LEFT: "R52:6",
  NAV_RIGHT: "R52:3",
  OK: "R52:7",
  PLAY: "R52:9",
  PAUSE: "R52:12",
  STATS: "R52:5",
  QUICK_SKIP: "R52:1",
  RESTART_Q: "R52:13",
  LANG_TOGGLE: "R52:4",
};

interface Option {
  text_l1: string;
  text_l2?: string | null;
  imageUrl?: string | null;
}

interface Question {
  id: number;
  question_text_l1: string;
  question_text_l2?: string | null;
  questionImageUrl?: string | null;
  options: Option[];
  correct_index: number;
  duration?: number;
}

interface LocationState {
  paperId: number;
  skillId?: number;
  levelId: number;
  stationId?: number;
  employee?: { id: string; name: string; pay_code: string; section: string };
  employeeId?: string;
  test_name?: string;
  examMode?: string;
  departmentName?: string;
  testDate?: string;
}

type AnswersMap = Record<string, (number | null)[]>;

const RemoteQuiz: React.FC = () => {
  // --- STATE ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<AnswersMap>({});
  // Ref to hold answers for immediate access in event handlers/submit
  const answersRef = useRef<AnswersMap>({});

  const [answeredRemotes, setAnsweredRemotes] = useState<Set<string>>(new Set());
  const [registeredRemotes, setRegisteredRemotes] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const [timerEnabled, setTimerEnabled] = useState(true);
  const [defaultDuration, setDefaultDuration] = useState(30);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const [primaryLanguage, setPrimaryLanguage] = useState<'L1' | 'L2'>('L1');

  // --- HOOKS ---
  const navigate = useNavigate();
  const location = useLocation();

  // --- REFS ---
  const isPausedRef = useRef(isPaused);
  const currentIndexRef = useRef(currentIndex);
  const questionsRef = useRef<Question[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nextCalledRef = useRef(false);
  const submitCalledRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);

  // 🔥 CRITICAL: Ref to hold the latest version of handleHardwareEvent
  const latestHandlerRef = useRef<(evt: any) => void>(() => { });

  const state = location.state as LocationState;
  const paperId = state?.paperId;
  const skillId = state?.skillId || state?.stationId;
  const levelId = state?.levelId;
  const testName = state?.test_name || `Remote_Group_Test_${new Date().toISOString().slice(0, 10)}`;
  const departmentName = state?.departmentName || "N/A";
  const allowedRemotes = state?.allowedRemotes || [];
  const testDate = state?.testDate || new Date().toISOString().split("T")[0];

  const currentQuestion = questions[currentIndex];
  const currentDuration = currentQuestion?.duration ?? defaultDuration;

  // Sync State to Refs
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  // Recompute answered set on question change
  useEffect(() => {
    const newAnsweredSet = new Set<string>();
    Object.entries(answers).forEach(([remoteId, ansArray]) => {
      if (ansArray[currentIndex] !== null && ansArray[currentIndex] !== undefined) {
        newAnsweredSet.add(remoteId);
      }
    });
    setAnsweredRemotes(newAnsweredSet);
  }, [currentIndex, answers]);

  // --- FULLSCREEN & SECURITY ---
  const enterFullScreen = async () => {
    if (document.fullscreenElement) {
      setIsFullScreen(true);
      setHasStarted(true);
      return;
    }
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) await elem.requestFullscreen();
      else if ((elem as any).webkitRequestFullscreen) await (elem as any).webkitRequestFullscreen();
      else if ((elem as any).msRequestFullscreen) await (elem as any).msRequestFullscreen();
      setIsFullScreen(true);
      setHasStarted(true);
    } catch (err) {
      console.error("FS Error:", err);
    }
  };

  useEffect(() => {
    if (document.fullscreenElement) {
      setIsFullScreen(true);
      setHasStarted(true);
    }
    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDownSecurity = (e: KeyboardEvent) => {
      if (["F11", "F5"].includes(e.key) || (e.ctrlKey && e.key === "r")) e.preventDefault();
      if (e.key === "Backspace" && (e.target as HTMLElement).tagName !== "INPUT") e.preventDefault();
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDownSecurity);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDownSecurity);
    };
  }, []);

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!paperId || !skillId || !levelId) {
      setLoading(false);
      setErrorMessage("Invalid navigation state.");
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/questionpapers/${paperId}/questions/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const paperSettings = data.question_paper || {};

        const paperDuration = paperSettings.question_duration || 30;
        const paperTimerEnabled = paperSettings.is_timer_enabled !== false;

        setDefaultDuration(paperDuration);
        setTimerEnabled(paperTimerEnabled);

        const questionsData = data.questions || [];
        if (!Array.isArray(questionsData) || questionsData.length === 0) {
          setErrorMessage("No questions available.");
          setQuestions([]);
          return;
        }

        const mapped: Question[] = questionsData.map((q: any, idx: number) => {
          const qTextL1 = q.question || q.question_text || q.text || "Question Text Missing";
          const qTextL2 = q.question_lang2 || "";

          const optA = q.option_a || "";
          const optB = q.option_b || "";
          const optC = q.option_c || "";
          const optD = q.option_d || "";

          const optA2 = q.option_a_lang2 || "";
          const optB2 = q.option_b_lang2 || "";
          const optC2 = q.option_c_lang2 || "";
          const optD2 = q.option_d_lang2 || "";

          const options: Option[] = [
            { text_l1: optA, text_l2: optA2, imageUrl: q.option_a_image },
            { text_l1: optB, text_l2: optB2, imageUrl: q.option_b_image },
            { text_l1: optC, text_l2: optC2, imageUrl: q.option_c_image },
            { text_l1: optD, text_l2: optD2, imageUrl: q.option_d_image },
          ].filter(o => o.text_l1 || o.imageUrl);

          return {
            id: q.question_id || q.id || idx,
            question_text_l1: qTextL1,
            question_text_l2: qTextL2,
            questionImageUrl: q.question_image || null,
            options,
            correct_index: Number.isInteger(q.correct_answer_index ?? q.correct_index)
              ? (q.correct_answer_index ?? q.correct_index)
              : 0,
            duration: (q.duration && q.duration > 0) ? q.duration : paperDuration,
          };
        });

        setQuestions(mapped);
        setTimeLeft(mapped[0].duration ?? paperDuration);
      } catch (e) {
        console.error(e);
        setErrorMessage("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [paperId, skillId, levelId]);

  // --- NAVIGATION ACTIONS ---
  const goToNextQuestion = () => {
    if (nextCalledRef.current) return;
    nextCalledRef.current = true;

    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx >= questionsRef.current.length) {
      setQuizEnded(true);
      submitQuiz();
    } else {
      setCurrentIndex(nextIdx);
      setTimeLeft(questionsRef.current[nextIdx].duration ?? defaultDuration);
      setIsPaused(false);
      setShowStats(false);
    }
    setTimeout(() => { nextCalledRef.current = false; }, 300);
  };

  const goToPrevQuestion = () => {
    const prevIdx = Math.max(0, currentIndexRef.current - 1);
    if (prevIdx < currentIndexRef.current) {
      setCurrentIndex(prevIdx);
      setTimeLeft(questionsRef.current[prevIdx].duration ?? defaultDuration);
      setIsPaused(false);
      setShowStats(false);
    }
  };

  const handleRestartQuestion = () => {
    const duration = questionsRef.current[currentIndexRef.current]?.duration ?? defaultDuration;
    setTimeLeft(duration);
    setIsPaused(false);
  };

  const handleQuickSkip = () => {
    setTimeLeft(0);
    goToNextQuestion();
  };

  const toggleStats = () => setShowStats(prev => !prev);
  const togglePrimaryLanguage = () => setPrimaryLanguage(prev => (prev === 'L1' ? 'L2' : 'L1'));

  // ==========================================
  //  ⚡ SUBMIT LOGIC (FULL FIX)
  // ==========================================
  const submitQuiz = async () => {
    if (submitCalledRef.current || quizEnded) return;
    submitCalledRef.current = true;

    if (document.fullscreenElement) document.exitFullscreen().catch(() => { });

    try {
      const answersData: Record<string, number[]> = {};
      const totalQs = questionsRef.current.length;

      // 1. ITERATE ALLOWED REMOTES TO ENSURE DATA FILLING
      allowedRemotes.forEach(remoteId => {
        const userAnswers = answersRef.current[remoteId];

        if (userAnswers) {
          // User answered some questions. Fill nulls with -1.
          answersData[remoteId] = userAnswers.map(a => a ?? -1);
        } else {
          // User answered NOTHING. Send all -1s so Score(0) is created.
          answersData[remoteId] = Array(totalQs).fill(-1);
        }
      });

      console.log("Submitting Answers Payload:", answersData);

      const payload = {
        department_name: departmentName,
        paper_id: paperId,
        skill_id: skillId,
        level_id: levelId,
        test_name: testName,
        test_date: testDate,
        answers: answersData,
      };

      const resp = await fetch(`${API_BASE_URL}/api/end-test/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error(await resp.text());
      const results = await resp.json();

      const grouped = results.grouped_results || results.results || [];
      const sessionKey = grouped.length > 0 && grouped[0].test_name ? grouped[0].test_name : null;

      navigate("/test-ended", {
        state: { ...state, results: grouped, sessionKey },
        replace: true,
      });

    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to submit. Check console.");
      setQuizEnded(false);
      submitCalledRef.current = false;
    }
  };

  // --- TIMER ---
  useEffect(() => {
    if (loading || !questions.length || timeLeft === null || quizEnded || !timerEnabled || !hasStarted || !isFullScreen) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;

      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) return 0;
        const newVal = prev - 1;
        if (newVal <= 0) {
          if (currentIndexRef.current === questionsRef.current.length - 1) {
            setQuizEnded(true);
            submitQuiz();
            return 0;
          } else {
            goToNextQuestion();
            return questionsRef.current[currentIndexRef.current + 1]?.duration ?? defaultDuration;
          }
        }
        return newVal;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading, questions.length, timeLeft, quizEnded, timerEnabled, defaultDuration, hasStarted, isFullScreen]);

  // ==========================================
  //  ⚡ EVENT HANDLER LOGIC (FULL FIX)
  // ==========================================
  const handleHardwareEvent = (evt: any) => {
    if (!evt || !evt.key_id) return;

    const { key_id: rawId, info } = evt;
    const remoteId = String(rawId);

    const isControlCode = Object.values(REMOTE_CODES).includes(info);
    const isAnswerCode = info in INFO_TO_INDEX;

    // --- 1. HANDLE CONTROLS FIRST (No Restriction Check) ---
    // This allows Master Remote (unregistered) to still control the quiz.
    if (isControlCode) {
      if (info === REMOTE_CODES.PAUSE) { setIsPaused(true); return; }
      if (info === REMOTE_CODES.PLAY) { setIsPaused(false); return; }
      if (info === REMOTE_CODES.STATS) { toggleStats(); return; }
      if (info === REMOTE_CODES.QUICK_SKIP) { handleQuickSkip(); return; }
      if (info === REMOTE_CODES.RESTART_Q) { handleRestartQuestion(); return; }
      if (info === REMOTE_CODES.LANG_TOGGLE) { togglePrimaryLanguage(); return; }

      // Navigation
      if (!isPausedRef.current) {
        if (info === REMOTE_CODES.NAV_LEFT) { goToPrevQuestion(); return; }
        if (info === REMOTE_CODES.NAV_RIGHT) {
          if (currentIndexRef.current < questionsRef.current.length - 1) goToNextQuestion();
          return;
        }
      }

      // Submit (OK Button)
      if (info === REMOTE_CODES.OK && !isPausedRef.current && !quizEnded) {
        console.log(`Remote ${remoteId} triggered Submit`);
        submitQuiz();
        return;
      }
    }

    // --- 2. HANDLE ANSWERS (With Restriction Check) ---
    if (isAnswerCode) {
      // ⛔ RESTRICTION: Only allow assigned remotes
      if (allowedRemotes.length > 0 && !allowedRemotes.includes(remoteId)) {
        // console.log(`Ignored unregistered remote: ${remoteId}`);
        return;
      }

      // Participation tracking
      if (!registeredRemotes.has(remoteId)) {
        setRegisteredRemotes((s) => new Set(s).add(remoteId));
      }

      // Record Answer
      if (!isPausedRef.current) {
        setAnswers((prev) => {
          const copy = { ...prev };
          if (!copy[remoteId]) copy[remoteId] = Array(questionsRef.current.length).fill(null);
          copy[remoteId][currentIndexRef.current] = INFO_TO_INDEX[info];
          return copy;
        });

        setAnsweredRemotes((prev) => {
          const newSet = new Set(prev);
          newSet.add(remoteId);
          return newSet;
        });
      }
    }
  };

  // 🔥 UPDATE REF ON EVERY RENDER (STALE CLOSURE FIX)
  useEffect(() => {
    latestHandlerRef.current = handleHardwareEvent;
  });

  // ==========================================
  //  ⚡ WEBSOCKET CONNECTION
  // ==========================================
  useEffect(() => {
    if (loading || quizEnded || !hasStarted) return;

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        return;
      }
    }

    console.log("🔌 Connecting WebSocket...");
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Quiz WebSocket Connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const actualEvent = data.payload ? data.payload : data;

        // 🔥 CALL THE REF, NOT THE FUNCTION
        if (latestHandlerRef.current) {
          latestHandlerRef.current(actualEvent);
        }
      } catch (e) {
        console.error("WebSocket Parse Error:", e);
      }
    };

    ws.onclose = (e) => {
      console.log("⚠️ WebSocket Disconnected", e.code);
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket Error:", err);
      ws.close();
    };

    return () => {
      if (wsRef.current === ws) {
        console.log("🧹 Cleaning up WebSocket");
        ws.onclose = null;
        ws.close();
        wsRef.current = null;
      }
    };
  }, [loading, hasStarted, quizEnded]);


  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (quizEnded || !hasStarted || !isFullScreen) return;

      if (event.code === "Space") { event.preventDefault(); setIsPaused(prev => !prev); return; }
      if (event.key.toLowerCase() === "s") { toggleStats(); return; }
      if (event.key.toLowerCase() === "n") { handleQuickSkip(); return; }
      if (event.key.toLowerCase() === "r") { handleRestartQuestion(); return; }
      if (event.key.toLowerCase() === "l") { togglePrimaryLanguage(); return; }
      if (event.key === "?") { setShowShortcuts(prev => !prev); return; }

      if (isPausedRef.current) return;

      if (event.key === "ArrowLeft") { event.preventDefault(); goToPrevQuestion(); }
      else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (currentIndexRef.current < questionsRef.current.length - 1) goToNextQuestion();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hasStarted, isFullScreen, questions, quizEnded]);

  // --- COMPUTED VALUES FOR UI ---
  const percentLeft = timeLeft && currentDuration ? (timeLeft / currentDuration) * 100 : 0;
  let timerColorClass = "text-white";
  let timerBgClass = "bg-white/10";
  let timerRingClass = "ring-white/20";

  if (percentLeft <= 20) {
    timerColorClass = "text-red-400";
    timerBgClass = "bg-red-500/20";
    timerRingClass = "ring-red-500/50";
  } else if (percentLeft <= 50) {
    timerColorClass = "text-yellow-400";
    timerBgClass = "bg-yellow-500/20";
    timerRingClass = "ring-yellow-500/50";
  }

  if (isPaused) {
    timerColorClass = "text-yellow-400";
    timerBgClass = "bg-yellow-500/20";
    timerRingClass = "ring-yellow-500/50";
  }

  const stats = [0, 0, 0, 0]; // A, B, C, D
  Object.values(answers).forEach(ansArr => {
    const ans = ansArr[currentIndex];
    if (ans !== null && ans >= 0 && ans <= 3) stats[ans]++;
  });
  const maxVotes = Math.max(...stats, 1);
  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const hasQuestionImage = currentQ?.questionImageUrl ? true : false;
  const hasSecondLanguage = currentQ?.question_text_l2 && currentQ.question_text_l2.trim() !== '';


  // --- RENDERING (Loading / Fullscreen Prompt) ---
  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center text-white overflow-hidden">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl">Loading Quiz...</p>
        </div>
      </div>
    );
  }

  if (!hasStarted || !isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center text-white p-8 text-center select-none overflow-hidden">
        <div className="max-w-md w-full">
          {hasStarted ? (
            <>
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold mb-4 text-red-500">QUIZ PAUSED</h1>
              <p className="text-xl text-gray-300 mb-8">You exited fullscreen mode. Click below to resume.</p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Remote Group Quiz</h1>
              <p className="text-xl text-gray-300 mb-6">The quiz will run in fullscreen mode.</p>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-8 border border-white/20">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testName}</p>
                    <p className="text-sm text-slate-400">{departmentName} • {questions.length} Questions</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            onClick={enterFullScreen}
            className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg ${hasStarted
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
              }`}
          >
            <Maximize className="w-6 h-6" />
            {hasStarted ? "RESUME QUIZ" : "START QUIZ"}
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN UI ---
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900/90 to-slate-900 flex flex-col overflow-hidden select-none">

      {/* HEADER */}
      <header className="flex-shrink-0 px-4 py-3 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
              {currentIndex + 1}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">Remote Group Quiz</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Users className="w-3 h-3" />
                <span>{registeredRemotes.size} participants</span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 whitespace-nowrap font-medium">Q {currentIndex + 1}/{questions.length}</span>
              <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex items-center gap-1 text-xs text-green-400 whitespace-nowrap font-medium">
                <CheckCircle className="w-3 h-3" />
                <span>{answeredRemotes.size}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isPaused ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
              <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`} />
              <span className={`text-xs font-bold ${isPaused ? 'text-yellow-400' : 'text-green-400'}`}>{isPaused ? 'PAUSED' : 'LIVE'}</span>
            </div>

            <button onClick={togglePrimaryLanguage} className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium text-white transition-colors border border-white/10" title="Toggle Language (L)">
              <span className={primaryLanguage === 'L1' ? 'text-blue-400 font-bold' : 'text-slate-500'}>L1</span>
              <span className="text-slate-600">/</span>
              <span className={primaryLanguage === 'L2' ? 'text-purple-400 font-bold' : 'text-slate-500'}>L2</span>
            </button>

            <button onClick={toggleStats} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${showStats ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`} title="Toggle Stats (S)">
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </button>

            {timerEnabled && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ring-2 ${timerRingClass} ${timerBgClass} ${percentLeft <= 20 && !isPaused ? 'animate-pulse' : ''}`}>
                {isPaused ? <PauseCircle className={`w-5 h-5 ${timerColorClass}`} /> : <Clock className={`w-4 h-4 ${timerColorClass}`} />}
                <span className={`text-2xl font-black tabular-nums ${timerColorClass}`}>{timeLeft ?? 0}</span>
                <span className={`text-xs ${timerColorClass} opacity-70`}>sec</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SPLIT SCREEN CONTENT */}
      <main className="flex-1 flex overflow-hidden relative">
        {questions.length > 0 && currentQ && (
          <>
            <div className="w-1/2 flex flex-col p-6 xl:p-8 overflow-hidden border-r border-white/10">
              <div className={`flex-1 flex flex-col overflow-y-auto custom-scrollbar ${!hasQuestionImage ? 'justify-center items-center' : 'justify-start'}`}>
                <div className={`flex items-center gap-3 mb-6 flex-shrink-0 ${!hasQuestionImage ? 'justify-center' : ''}`}>
                  <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold shadow-lg">Question {currentIndex + 1} of {questions.length}</span>
                  {hasSecondLanguage && <span className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">🌐 Bilingual</span>}
                </div>

                <div className={`flex-shrink-0 ${!hasQuestionImage ? 'text-center max-w-2xl' : 'max-w-full'} mb-6`}>
                  {currentQ.question_text_l1 && (
                    <p className={`leading-relaxed transition-all duration-300 ${primaryLanguage === 'L1' ? 'text-2xl md:text-3xl xl:text-4xl font-bold text-white mb-4' : 'text-base md:text-lg xl:text-xl text-slate-400 font-medium mb-3'}`}>
                      {currentQ.question_text_l1}
                    </p>
                  )}
                  {hasSecondLanguage && (
                    <p className={`leading-relaxed transition-all duration-300 ${primaryLanguage === 'L2' ? 'text-2xl md:text-3xl xl:text-4xl font-bold text-white' : 'text-base md:text-lg xl:text-xl text-slate-400 font-medium'}`}>
                      {currentQ.question_text_l2}
                    </p>
                  )}
                </div>

                {hasQuestionImage && (
                  <div className="flex-shrink-0 flex justify-center mt-auto pt-4">
                    <div className="bg-black/30 rounded-2xl p-4 border border-white/10 inline-flex items-center justify-center">
                      <img src={currentQ.questionImageUrl!} alt="Question visual" className="max-h-40 xl:max-h-56 2xl:max-h-64 w-auto object-contain rounded-xl shadow-lg" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-1/2 flex flex-col p-4 xl:p-6 overflow-hidden bg-black/10">
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 xl:gap-4 content-center">
                {currentQ.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const hasOptLang2 = opt.text_l2 && opt.text_l2.trim() !== '';

                  return (
                    <div key={idx} className="relative flex flex-col p-4 xl:p-5 rounded-2xl border-2 border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-lg xl:text-xl text-white border border-white/20">{letter}</div>
                        <div className="flex-1 min-w-0">
                          {opt.imageUrl && (
                            <div className="mb-3 bg-black/20 rounded-lg p-2 border border-white/10">
                              <img src={opt.imageUrl} alt={`Option ${letter}`} className="max-h-20 xl:max-h-24 w-auto object-contain rounded" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                            </div>
                          )}
                          <p className={`leading-snug transition-all ${primaryLanguage === 'L1' ? 'text-base xl:text-lg font-semibold text-white' : 'text-sm text-slate-400'}`}>{opt.text_l1}</p>
                          {hasOptLang2 && <p className={`leading-snug mt-1 transition-all ${primaryLanguage === 'L2' ? 'text-base xl:text-lg font-semibold text-white' : 'text-sm text-slate-400'}`}>{opt.text_l2}</p>}
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-white/10 text-xs text-slate-400 font-medium">{stats[idx]} votes</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* STATS OVERLAY */}
        {showStats && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="bg-slate-800/95 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><BarChart2 className="w-5 h-5 text-blue-400" />Live Responses</h3>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">{answeredRemotes.size} / {registeredRemotes.size} answered</span>
                  <button onClick={() => setShowStats(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5 text-white" /></button>
                </div>
              </div>
              <div className="flex justify-between items-end h-40 gap-4 mb-4">
                {["A", "B", "C", "D"].map((opt, i) => (
                  <div key={opt} className="flex flex-col items-center justify-end w-full h-full gap-2">
                    <span className="font-bold text-white text-lg">{stats[i]}</span>
                    <div className="w-full bg-gradient-to-t from-blue-600 to-purple-500 rounded-t-xl transition-all duration-500 min-h-[4px]" style={{ height: `${Math.max((stats[i] / maxVotes) * 100, 5)}%` }} />
                    <span className="font-bold text-slate-400 text-lg">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="flex-shrink-0 px-4 py-3 bg-black/30 backdrop-blur-md border-t border-white/10">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={goToPrevQuestion} disabled={currentIndex === 0 || isPaused} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium transition-all border border-white/10">
              <ChevronLeft className="w-5 h-5" /><span className="hidden sm:inline">Prev</span>
            </button>
            <button onClick={() => { if (currentIndex < questions.length - 1) goToNextQuestion(); }} disabled={currentIndex === questions.length - 1 || isPaused} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium transition-all border border-white/10">
              <span className="hidden sm:inline">Next</span><ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={() => setIsPaused(prev => !prev)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all border ${isPaused ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30'}`}>
              {isPaused ? <><PlayCircle className="w-5 h-5" /><span className="hidden sm:inline">Resume</span></> : <><PauseCircle className="w-5 h-5" /><span className="hidden sm:inline">Pause</span></>}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            {questions.map((_, i) => {
              const isCurrent = currentIndex === i;
              if (questions.length > 15) {
                const showRange = i < 3 || i > questions.length - 4 || (i >= currentIndex - 2 && i <= currentIndex + 2);
                if (!showRange) { if (i === 3 || i === questions.length - 4) return <span key={i} className="text-slate-600 text-xs px-1">•••</span>; return null; }
              }
              return (
                <button key={i} onClick={() => { setCurrentIndex(i); setTimeLeft(questionsRef.current[i].duration ?? defaultDuration); setShowStats(false); }} disabled={isPaused} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all disabled:opacity-50 ${isCurrent ? 'bg-white text-slate-900 shadow-lg scale-110 ring-2 ring-blue-400' : 'bg-white/10 text-slate-500 hover:bg-white/20'}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleRestartQuestion} className="hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/10" title="Restart Timer (R)">
              <Clock className="w-4 h-4" /><span className="hidden lg:inline">Restart</span>
            </button>
            <button onClick={() => setShowShortcuts(true)} className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10" title="Keyboard Shortcuts (?)">
              <Keyboard className="w-4 h-4" /><span className="text-xs font-medium">?</span>
            </button>
            {currentIndex === questions.length - 1 && (
              <button onClick={submitQuiz} disabled={quizEnded} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold transition-all shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/30">
                <CheckCircle className="w-5 h-5" /><span>{quizEnded ? "Submitted" : "End Quiz"}</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* SHORTCUTS MODAL */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Keyboard className="w-5 h-5" />Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5 text-white" /></button>
            </div>
            <div className="space-y-3">
              {[
                { keys: ['Space'], desc: 'Pause / Resume timer' },
                { keys: ['←', '→'], desc: 'Navigate questions' },
                { keys: ['S'], desc: 'Toggle live stats' },
                { keys: ['L'], desc: 'Toggle primary language' },
                { keys: ['N'], desc: 'Skip to next question' },
                { keys: ['R'], desc: 'Restart question timer' },
                { keys: ['?'], desc: 'Show this help' },
              ].map(({ keys, desc }, i) => (
                <div key={i} className="flex items-center justify-between py-2"><span className="text-slate-300">{desc}</span><div className="flex gap-1">{keys.map((key, j) => (<kbd key={j} className="px-2.5 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-mono border border-slate-600 shadow">{key}</kbd>))}</div></div>
              ))}
            </div>
            <button onClick={() => setShowShortcuts(false)} className="w-full mt-6 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition-colors">Got it!</button>
          </div>
        </div>
      )}

      {/* ERROR TOAST */}
      {errorMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-600/95 backdrop-blur text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-red-500/50">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" /><span className="font-medium text-sm">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-2 p-1.5 hover:bg-white/20 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }`}</style>
    </div>
  );
};

export default RemoteQuiz;