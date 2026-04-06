// src/pages/IndividualQuiz.tsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Maximize, 
  AlertTriangle, 
  PlayCircle, 
  CheckCircle, 
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  X,
  Clock,
  User,
  Building2,
  Keyboard
} from "lucide-react";

const API_BASE_URL = "http://192.168.2.51:8000";

interface Question {
  id: number;
  question_text: string;
  question_text_lang2?: string | null;
  question_image?: string | null;
  options: string[];
  options_lang2?: (string | null)[];
  option_images: (string | null)[];
  correct_index: number;
  duration?: number;
}

interface LocationState {
  paperId: number;
  skillId?: number;
  levelId: number;
  stationId?: number;
  employee?: {
    id: string;
    name: string;
    pay_code: string;
    section: string;
  };
  employeeId?: string;
  test_name?: string;
  examMode?: string;
  departmentName?: string;
  testDate?: string;
}

const IndividualQuiz: React.FC = () => {
  // --- STATE ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizEnded, setQuizEnded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [defaultDuration, setDefaultDuration] = useState(30);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fullscreen / Security State
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // UI State
  const [primaryLanguage, setPrimaryLanguage] = useState<'L1' | 'L2'>('L1');
  const [showNavigator, setShowNavigator] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(currentIndex);
  const questionsRef = useRef<Question[]>([]);
  const submitCalledRef = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // Derived Data
  const paperId = state?.paperId;
  const stationId = state?.stationId || state?.skillId;
  const levelId = state?.levelId;
  const employeeId = state?.employeeId || state?.employee?.id;
  const testName = state?.test_name || `Individual_Test_${new Date().toISOString().slice(0, 10)}`;
  const departmentName = state?.departmentName || "N/A";
  const testDate = state?.testDate || new Date().toISOString().split("T")[0];

  const currentQuestion = questions[currentIndex];
  const currentDuration = currentQuestion?.duration ?? defaultDuration;

  // Keep refs updated
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  // Sync selected option when index changes
  useEffect(() => {
    setSelectedOption(answers[currentIndex] ?? null);
  }, [currentIndex, answers]);

  // --- FULLSCREEN & SECURITY LOGIC ---
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
      if (["F11", "F5", "F12"].includes(e.key) || (e.ctrlKey && e.key === "r")) {
        e.preventDefault();
      }
      if (e.key === "Backspace" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
      }
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
    if (!paperId || !levelId || !employeeId) {
      setLoading(false);
      setErrorMessage("Invalid navigation state. IDs missing.");
      setTimeout(() => navigate("/assign-employees"), 3000);
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/questionpapers/${paperId}/questions/`);
        if (!res.ok) throw new Error("Failed to fetch questions");

        const data = await res.json();
        const questionsData = data.questions || [];
        const paperData = data.question_paper || {};

        const pDuration = paperData.question_duration || 30;
        const pEnabled = paperData.is_timer_enabled !== false;
        setDefaultDuration(pDuration);
        setTimerEnabled(pEnabled);

        if (!Array.isArray(questionsData) || questionsData.length === 0) {
          setErrorMessage("No questions available.");
          setQuestions([]);
          return;
        }

        const mapped: Question[] = questionsData.map((q: any, index: number) => {
          const optA = q.option_a || "";
          const optB = q.option_b || "";
          const optC = q.option_c || "";
          const optD = q.option_d || "";

          const optA2 = q.option_a_lang2 || "";
          const optB2 = q.option_b_lang2 || "";
          const optC2 = q.option_c_lang2 || "";
          const optD2 = q.option_d_lang2 || "";

          return {
            id: q.question_id || q.id || index,
            question_text: q.question_text || q.text || q.question || "",
            question_text_lang2: q.question_lang2 || "",
            question_image: q.question_image || null,
            options: [optA, optB, optC, optD].filter(o => o),
            options_lang2: [optA2, optB2, optC2, optD2],
            option_images: [
              q.option_a_image || null,
              q.option_b_image || null,
              q.option_c_image || null,
              q.option_d_image || null,
            ],
            correct_index: Number.isInteger(q.correct_answer_index ?? q.correct_index)
              ? (q.correct_answer_index ?? q.correct_index)
              : 0,
            duration: (q.duration && q.duration > 0) ? q.duration : pDuration,
          };
        }).filter((q: Question) => q.question_text && q.options.length >= 2);

        setQuestions(mapped);
        setAnswers(Array(mapped.length).fill(null));
        if (pEnabled) {
          setTimeLeft(mapped[0].duration ?? pDuration);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to load quiz data.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [paperId, stationId, levelId, employeeId, navigate]);

  // --- NAVIGATION ---
  const goToNextQuestion = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx >= questionsRef.current.length) {
      setQuizEnded(true);
      submitQuiz();
    } else {
      setCurrentIndex(nextIdx);
      setTimeLeft(questionsRef.current[nextIdx].duration ?? defaultDuration);
    }
  }, [defaultDuration]);

  const goToPrevQuestion = useCallback(() => {
    const prevIdx = Math.max(0, currentIndexRef.current - 1);
    if (prevIdx < currentIndexRef.current) {
      setCurrentIndex(prevIdx);
      setTimeLeft(questionsRef.current[prevIdx].duration ?? defaultDuration);
    }
  }, [defaultDuration]);

  const handleJumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setTimeLeft(questionsRef.current[index].duration ?? defaultDuration);
    setShowNavigator(false);
  };

  const togglePrimaryLanguage = () => {
    setPrimaryLanguage(prev => (prev === 'L1' ? 'L2' : 'L1'));
  };

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (
      loading ||
      !questions.length ||
      timeLeft === null ||
      quizEnded ||
      !timerEnabled ||
      !hasStarted ||
      !isFullScreen
    ) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
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
  }, [
    loading,
    questions.length,
    timeLeft,
    quizEnded,
    timerEnabled,
    defaultDuration,
    hasStarted,
    isFullScreen,
    goToNextQuestion
  ]);

  // --- SUBMISSION ---
  const submitQuiz = async () => {
    if (submitCalledRef.current || quizEnded) return;
    submitCalledRef.current = true;

    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});

    const userAnswers = answers.map((answer) => answer ?? -1);
    const payload = {
      employee_id: employeeId || null,
      test_name: testName,
      question_paper_id: paperId,
      skill_id: stationId,
      level_id: levelId,
      department_name: departmentName,
      test_date: testDate,
      answers: userAnswers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/submit-web-test/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setQuizEnded(true);
        navigate("/test-ended", { state: { ...state }, replace: true });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Submission failed.");
        submitCalledRef.current = false;
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error during submission.");
      submitCalledRef.current = false;
    }
  };

  const handleSubmit = async () => {
    if (quizEnded || submitting) return;
    setSubmitting(true);
    await submitQuiz();
  };

  // --- OPTION SELECTION ---
  const handleOptionSelect = (optionIndex: number) => {
    if (quizEnded) return;
    setSelectedOption(optionIndex);
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentIndex] = optionIndex;
      return newAnswers;
    });
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    if (loading || !questions.length || quizEnded || !hasStarted || !isFullScreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Left / Right arrows for previous / next
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevQuestion();
        return;
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (currentIndexRef.current < questionsRef.current.length - 1) {
          goToNextQuestion();
        }
        return;
      }

      // Number keys 1–9: jump to that question number (if it exists)
      const digit = parseInt(event.key, 10);
      if (!isNaN(digit) && digit >= 1 && digit <= 9) {
        event.preventDefault();
        const targetIndex = digit - 1; // 1 -> Q1 (index 0), 2 -> Q2, ...
        if (targetIndex < questionsRef.current.length) {
          setCurrentIndex(targetIndex);
          if (timerEnabled) {
            const duration =
              questionsRef.current[targetIndex].duration ?? defaultDuration;
            setTimeLeft(duration);
          }
        }
        return;
      }

      // Language toggle
      if (event.key.toLowerCase() === "l") {
        togglePrimaryLanguage();
        return;
      }

      // Grid
      if (event.key.toLowerCase() === "g") {
        setShowNavigator(prev => !prev);
        return;
      }

      // Help
      if (event.key === "?") {
        setShowShortcuts(prev => !prev);
        return;
      }

      // Option selection via A/B/C/D
      const keyLower = event.key.toLowerCase();
      if (['a', 'b', 'c', 'd'].includes(keyLower)) {
        handleOptionSelect(['a', 'b', 'c', 'd'].indexOf(keyLower));
        return;
      }

      // Submit on Enter at last question
      if (event.key === "Enter" && currentIndexRef.current === questionsRef.current.length - 1) {
        handleSubmit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    loading,
    questions.length,
    quizEnded,
    hasStarted,
    isFullScreen,
    goToPrevQuestion,
    goToNextQuestion,
    timerEnabled,
    defaultDuration
  ]);

  // Timer styling
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

  const answeredCount = answers.filter((a) => a !== null).length;
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  // Check if current question has image
  const hasQuestionImage = currentQuestion?.question_image ? true : false;
  const hasSecondLanguage = currentQuestion?.question_text_lang2 && currentQuestion.question_text_lang2.trim() !== '';

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center text-white overflow-hidden">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl">Loading Exam...</p>
        </div>
      </div>
    );
  }

  // --- FULLSCREEN PROMPT ---
  if (!hasStarted || !isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center text-white p-8 text-center select-none overflow-hidden">
        <div className="max-w-md w-full">
          {hasStarted ? (
            <>
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold mb-4 text-red-500">EXAM PAUSED</h1>
              <p className="text-xl text-gray-300 mb-8">You exited fullscreen mode. Click below to resume your exam.</p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Ready to Begin?</h1>
              <p className="text-xl text-gray-300 mb-6">The exam will run in fullscreen mode for security.</p>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-8 border border-white/20">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{state?.employee?.name || "Candidate"}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Building2 className="w-3 h-3" />
                      <span>{departmentName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            onClick={enterFullScreen}
            className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg ${
              hasStarted 
                ? 'bg-red-600 hover:bg-red-500' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
            }`}
          >
            <Maximize className="w-6 h-6" />
            {hasStarted ? "RESUME EXAM" : "START EXAM"}
          </button>

          {!hasStarted && (
            <p className="mt-4 text-sm text-slate-500">
              Press ESC during exam to pause (not recommended)
            </p>
          )}
        </div>
      </div>
    );
  }

  // --- MAIN QUIZ UI (Split Screen) ---
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900/90 to-slate-900 flex flex-col overflow-hidden select-none">
      
      {/* ===== HEADER ===== */}
      <header className="flex-shrink-0 px-4 py-3 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Candidate Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
              {currentIndex + 1}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">{state?.employee?.name}</p>
              <p className="text-xs text-slate-400">{departmentName}</p>
            </div>
          </div>

          {/* Center: Progress */}
          <div className="flex-1 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 whitespace-nowrap font-medium">
                Q {currentIndex + 1}/{questions.length}
              </span>
              <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-green-400 whitespace-nowrap font-medium">
                ✓ {answeredCount}
              </span>
            </div>
          </div>

          {/* Right: Timer & Controls */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={togglePrimaryLanguage}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium text-white transition-colors border border-white/10"
              title="Toggle Language (L)"
            >
              <span className={primaryLanguage === 'L1' ? 'text-blue-400 font-bold' : 'text-slate-500'}>L1</span>
              <span className="text-slate-600">/</span>
              <span className={primaryLanguage === 'L2' ? 'text-purple-400 font-bold' : 'text-slate-500'}>L2</span>
            </button>

            {/* Navigator Button */}
            <button
              onClick={() => setShowNavigator(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium text-white transition-colors border border-white/10"
              title="Question Grid (G)"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            {/* Timer */}
            {timerEnabled && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ring-2 ${timerRingClass} ${timerBgClass} ${percentLeft <= 20 ? 'animate-pulse' : ''}`}>
                <Clock className={`w-4 h-4 ${timerColorClass}`} />
                <span className={`text-2xl font-black tabular-nums ${timerColorClass}`}>
                  {timeLeft ?? 0}
                </span>
                <span className={`text-xs ${timerColorClass} opacity-70`}>sec</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT (Split Screen) ===== */}
      <main className="flex-1 flex overflow-hidden">
        {questions.length > 0 && currentQuestion && (
          <>
            {/* ===== LEFT COLUMN: Question ===== */}
            <div className="w-1/2 flex flex-col p-6 xl:p-8 overflow-hidden border-r border-white/10">
              <div 
                className={`
                  flex-1 flex flex-col overflow-y-auto custom-scrollbar
                  ${!hasQuestionImage ? 'justify-center items-center' : 'justify-start'}
                `}
              >
                {/* Question Badge */}
                <div className={`flex items-center gap-3 mb-6 flex-shrink-0 ${!hasQuestionImage ? 'justify-center' : ''}`}>
                  <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold shadow-lg">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  {hasSecondLanguage && (
                    <span className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
                      🌐 Bilingual
                    </span>
                  )}
                </div>

                {/* Question Text - ALWAYS PROMINENT */}
                <div className={`flex-shrink-0 ${!hasQuestionImage ? 'text-center max-w-2xl' : 'max-w-full'} mb-6`}>
                  {/* Primary Language Text */}
                  {currentQuestion.question_text && (
                    <p
                      className={`
                        leading-relaxed transition-all duration-300
                        ${primaryLanguage === 'L1'
                          ? 'text-2xl md:text-3xl xl:text-4xl font-bold text-white mb-4'
                          : 'text-base md:text-lg xl:text-xl text-slate-400 font-medium mb-3'
                        }
                      `}
                    >
                      {currentQuestion.question_text}
                    </p>
                  )}
                  
                  {/* Secondary Language Text */}
                  {hasSecondLanguage && (
                    <p
                      className={`
                        leading-relaxed transition-all duration-300
                        ${primaryLanguage === 'L2'
                          ? 'text-2xl md:text-3xl xl:text-4xl font-bold text-white'
                          : 'text-base md:text-lg xl:text-xl text-slate-400 font-medium'
                        }
                      `}
                    >
                      {currentQuestion.question_text_lang2}
                    </p>
                  )}
                </div>

                {/* Question Image - ONLY IF EXISTS, CONTROLLED SIZE */}
                {hasQuestionImage && (
                  <div className="flex-shrink-0 flex justify-center mt-auto pt-4">
                    <div className="bg-black/30 rounded-2xl p-4 border border-white/10 inline-flex items-center justify-center">
                      <img
                        src={currentQuestion.question_image!}
                        alt="Question visual"
                        className="max-h-40 xl:max-h-56 2xl:max-h-64 w-auto object-contain rounded-xl shadow-lg"
                        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ===== RIGHT COLUMN: Options ===== */}
            <div className="w-1/2 flex flex-col p-4 xl:p-6 overflow-hidden bg-black/10">
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 xl:gap-4 content-center">
                {currentQuestion.options.map((optText, idx) => {
                  const isSelected = selectedOption === idx;
                  const optionImage = currentQuestion.option_images[idx];
                  const letter = String.fromCharCode(65 + idx);
                  const optLang2 = currentQuestion.options_lang2?.[idx];
                  const hasOptLang2 = optLang2 && optLang2.trim() !== '';

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`
                        relative flex flex-col p-4 xl:p-5 rounded-2xl border-2 transition-all duration-200 text-left group
                        ${isSelected
                          ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.3)] scale-[1.02]'
                          : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 hover:scale-[1.01]'
                        }
                      `}
                    >
                      {/* Selection indicator bar */}
                      {isSelected && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl" />
                      )}

                      <div className="flex items-start gap-3">
                        {/* Option Letter */}
                        <div
                          className={`
                            flex-shrink-0 w-10 h-10 xl:w-12 xl:h-12 rounded-xl flex items-center justify-center font-bold text-lg xl:text-xl transition-all
                            ${isSelected
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-white/10 text-slate-300 border border-white/20 group-hover:bg-white/20'
                            }
                          `}
                        >
                          {letter}
                        </div>

                        {/* Option Content */}
                        <div className="flex-1 min-w-0">
                          {/* Option Image */}
                          {optionImage && (
                            <div className="mb-3 bg-black/20 rounded-lg p-2 border border-white/10">
                              <img
                                src={optionImage}
                                alt={`Option ${letter}`}
                                className="max-h-20 xl:max-h-24 w-auto object-contain rounded"
                                onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                              />
                            </div>
                          )}
                          
                          {/* Option Text L1 */}
                          <p
                            className={`
                              leading-snug transition-all
                              ${primaryLanguage === 'L1'
                                ? 'text-base xl:text-lg font-semibold text-white'
                                : 'text-sm text-slate-400'
                              }
                            `}
                          >
                            {optText}
                          </p>
                          
                          {/* Option Text L2 */}
                          {hasOptLang2 && (
                            <p
                              className={`
                                leading-snug mt-1 transition-all
                                ${primaryLanguage === 'L2'
                                  ? 'text-base xl:text-lg font-semibold text-white'
                                  : 'text-sm text-slate-400'
                                }
                              `}
                            >
                              {optLang2}
                            </p>
                          )}
                        </div>

                        {/* Check Icon */}
                        {isSelected && (
                          <CheckCircle className="w-6 h-6 text-blue-400 flex-shrink-0" />
                        )}
                      </div>

                      {/* Keyboard hint – only letters now */}
                      <div className="absolute bottom-2 right-3 text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        Press {letter}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="flex-shrink-0 px-4 py-3 bg-black/30 backdrop-blur-md border-t border-white/10">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          
          {/* Left: Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevQuestion}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium transition-all border border-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <button
              onClick={() => {
                if (currentIndex < questions.length - 1) goToNextQuestion();
              }}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium transition-all border border-white/10"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Mini Navigator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== null;
              const isCurrent = currentIndex === i;
              
              if (questions.length > 15) {
                const showRange = 
                  i < 3 || 
                  i > questions.length - 4 || 
                  (i >= currentIndex - 2 && i <= currentIndex + 2);
                
                if (!showRange) {
                  if (i === 3 || i === questions.length - 4) {
                    return <span key={i} className="text-slate-600 text-xs px-1">•••</span>;
                  }
                  return null;
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleJumpToQuestion(i)}
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all
                    ${isCurrent
                      ? 'bg-white text-slate-900 shadow-lg scale-110 ring-2 ring-blue-400'
                      : isAnswered
                      ? 'bg-green-500/30 text-green-400 hover:bg-green-500/40'
                      : 'bg-white/10 text-slate-500 hover:bg-white/20'
                    }
                  `}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Right: Shortcuts & Submit */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShortcuts(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard className="w-4 h-4" />
              <span className="text-xs font-medium">?</span>
            </button>

            {currentIndex === questions.length - 1 && (
              <button
                onClick={handleSubmit}
                disabled={submitting || quizEnded}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold transition-all shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/30"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>End Test</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* ===== MODALS & OVERLAYS ===== */}

      {/* Question Navigator Modal */}
      {showNavigator && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Grid3X3 className="w-5 h-5" />
                Question Navigator
              </h3>
              <button
                onClick={() => setShowNavigator(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-6">
              {questions.map((_, i) => {
                const isAnswered = answers[i] !== null;
                const isCurrent = currentIndex === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleJumpToQuestion(i)}
                    className={`
                      aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all
                      ${isCurrent
                        ? 'bg-white text-slate-900 scale-110 shadow-lg ring-2 ring-blue-400'
                        : isAnswered
                        ? 'bg-green-500/30 text-green-400 border border-green-500/50 hover:bg-green-500/40'
                        : 'bg-white/10 text-slate-400 hover:bg-white/20 border border-white/10'
                      }
                    `}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-sm text-slate-400 pt-4 border-t border-white/10">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500/50" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-white/10 border border-white/10" />
                  <span>Remaining ({questions.length - answeredCount})</span>
                </div>
              </div>
              <button
                onClick={() => setShowNavigator(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { keys: ['←', '→'], desc: 'Navigate between questions' },
                { keys: ['1-9'], desc: 'Jump to question number (if it exists)' },
                // { keys: ['A', 'B', 'C', 'D'], desc: 'Select answer option' },
                { keys: ['G'], desc: 'Open question grid' },
                { keys: ['L'], desc: 'Toggle primary language' },
                { keys: ['?'], desc: 'Show this help' },
                { keys: ['Enter'], desc: 'Submit (on last question)' },
              ].map(({ keys, desc }, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <span className="text-slate-300">{desc}</span>
                  <div className="flex gap-1">
                    {keys.map((key, j) => (
                      <kbd key={j} className="px-2.5 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-mono border border-slate-600 shadow">
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="w-full mt-6 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-600/95 backdrop-blur text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-red-500/50">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-2 p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default IndividualQuiz;