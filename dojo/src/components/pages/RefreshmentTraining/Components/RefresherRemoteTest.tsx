import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, ChevronRight, ChevronLeft, 
  CheckCircle, AlertCircle, Trophy, ArrowLeft
} from 'lucide-react';
import { ProgressStepper, StickyHeader, Confetti } from '../Components/shared/UIComponents';

const API_BASE = 'http://127.0.0.1:8000';
const WS_URL = "ws://127.0.0.1:8000/ws/quiz/"; // <--- WebSocket URL

// --- HARDWARE KEY MAPPING ---
const KEY_MAP: Record<string, string> = { 
  'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 
  'R52:3': 'NAV_NEXT',   
  'R52:6': 'NAV_PREV',   
  'R52:7': 'OK',         
};

interface Props {
  scheduleId: number;
  batchId?: number;
  testType: 'pre' | 'post';
  topicName: string;
  assignments: Record<string, number>;
  onExit: () => void;
}

interface Question {
  id: number;
  question_text: string;
  question_image_url?: string;
  option_a: string;
  option_b: string;
  option_c?: string;
  option_d?: string;
  option_a_image_url?: string;
  option_b_image_url?: string;
  option_c_image_url?: string;
  option_d_image_url?: string;
}

interface ResultData {
  passed: boolean;
  totalScore: number;
  totalQuestions: number;
  participants: number;
}

const RefresherRemoteTest: React.FC<Props> = ({ 
  scheduleId, batchId, testType, topicName, assignments, onExit 
}) => {
  // --- STATE ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [answers, setAnswers] = useState<Record<number, Record<number, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // --- REFS ---
  // Using refs to access fresh state inside WebSocket callback without re-binding
  const stateRef = useRef({
    isActive, currentIndex, questions, answers, assignments, isSubmitting
  });

  const lastNavTimeRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);

  // Sync Refs
  useEffect(() => {
    stateRef.current = { isActive, currentIndex, questions, answers, assignments, isSubmitting };
  }, [isActive, currentIndex, questions, answers, assignments, isSubmitting]);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initTest = async () => {
      try {
        // 1. Start Test Session
        const res = await fetch(`${API_BASE}/refresher/test/start/`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ 
            schedule_id: scheduleId, 
            test_type: testType, 
            mode: 'remote',
            batch_id: batchId ?? null,
          })
        });
        
        if (!res.ok) throw new Error("Failed to init");
        const data = await res.json();
        setQuestions(data.questions || []);
        
        // 2. Initialize Answers
        const initialAnswers: Record<number, Record<number, string>> = {};
        Object.values(assignments).forEach(sessId => {
          initialAnswers[sessId] = {};
        });
        setAnswers(initialAnswers);

      } catch (error) {
        console.error(error);
        alert("Failed to load test data.");
        onExit();
      } finally {
        setIsLoading(false);
      }
    };
    initTest();
  }, []);

  // --- WEBSOCKET CONNECTION ---
  useEffect(() => {
    if (isLoading || submitted) return;

    if (wsRef.current) return; // Prevent double connection

    console.log("🔌 Connecting WebSocket...");
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => console.log("✅ WebSocket Connected");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const actualEvent = data.payload ? data.payload : data;
        handleHardwareEvent(actualEvent);
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };

    ws.onclose = () => {
      console.log("⚠️ WebSocket Disconnected");
      wsRef.current = null;
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isLoading, submitted]);

  // --- HARDWARE EVENT HANDLER ---
  const handleHardwareEvent = (evt: any) => {
    if (stateRef.current.isSubmitting) return;

    const remoteId = String(evt.key_id);
    const action = KEY_MAP[evt.info] || evt.info; // Map 'R52:3' to 'NAV_NEXT'
    const assignedSessionId = stateRef.current.assignments[remoteId];

    const now = Date.now();
    const { isActive, currentIndex, questions } = stateRef.current;

    // --- NAVIGATION LOGIC ---
    if (action === 'NAV_NEXT') {
      if (now - lastNavTimeRef.current < 300) return; // Debounce
      lastNavTimeRef.current = now;

      if (!isActive) {
        setIsActive(true);
      } else if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
      return;
    }

    if (action === 'NAV_PREV') {
      if (now - lastNavTimeRef.current < 300) return;
      lastNavTimeRef.current = now;

      if (isActive && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
      return;
    }

    if (action === 'OK') {
      if (now - lastNavTimeRef.current < 1000) return;
      lastNavTimeRef.current = now;

      if (isActive && currentIndex === questions.length - 1) {
        submitTest();
      }
      return;
    }

    // --- VOTING LOGIC ---
    if (['A', 'B', 'C', 'D'].includes(action)) {
      if (!isActive) return;

      if (assignedSessionId) {
        setAnswers(prev => {
          // Only update if value changed to prevent unnecessary re-renders
          if (prev[assignedSessionId]?.[currentIndex] === action) return prev;
          
          return {
            ...prev,
            [assignedSessionId]: {
              ...prev[assignedSessionId],
              [currentIndex]: action
            }
          };
        });
      }
    }
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting || submitted) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (isActive && currentIndex > 0) setCurrentIndex(p => p - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!isActive) setIsActive(true);
          else if (currentIndex < questions.length - 1) setCurrentIndex(p => p + 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (isActive && currentIndex === questions.length - 1) submitTest();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentIndex, questions.length, isSubmitting, submitted]);

  const startTest = () => setIsActive(true);

  const changeQuestion = (delta: number) => {
    const newIndex = currentIndex + delta;
    if (newIndex >= 0 && newIndex < questions.length) {
      setCurrentIndex(newIndex);
    }
  };

  // --- SUBMIT TEST ---
  const submitTest = async () => {
    if (stateRef.current.isSubmitting) return;

    setIsSubmitting(true);
    stateRef.current.isSubmitting = true;
    
    // Close WS immediately to prevent late votes
    if (wsRef.current) wsRef.current.close();

    const submissions = Object.entries(stateRef.current.assignments).map(([remoteId, sessionId]) => {
      const userAnswers = stateRef.current.answers[sessionId] || {};
      const mappedAnswers: Record<string, string> = {};
      stateRef.current.questions.forEach((q, idx) => {
        if (userAnswers[idx]) {
          mappedAnswers[String(q.id)] = userAnswers[idx];
        }
      });
      return { test_session_id: sessionId, answers: mappedAnswers };
    });

    try {
      const res = await fetch(`${API_BASE}/refresher/test/submit/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ submissions })
      });
      
      if (res.ok) {
        const data = await res.json();
        const results = data.results || [];
        const totalScore = results.reduce((sum: number, r: any) => sum + (r.score || 0), 0);
        const totalQuestions = results.length > 0 ? (results[0].total_questions || questions.length) * results.length : 0;
        const allPassed = results.every((r: any) => r.passed);
        
        setResultData({
          passed: allPassed,
          totalScore,
          totalQuestions,
          participants: results.length
        });
        setSubmitted(true);
        
        if (allPassed) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        }
      } else {
        throw new Error("Submit failed");
      }
    } catch (e) {
      alert("Error submitting. Please try again.");
      setIsSubmitting(false);
      stateRef.current.isSubmitting = false;
      // Reconnect WS on error
      // Note: A simpler way is just to let the useEffect reconnect it since submitted is false
    }
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading test...</p>
        </div>
      </div>
    );
  }

  // --- RESULT STATE ---
  if (submitted && resultData) {
    const percentage = resultData.totalQuestions > 0 
      ? Math.round((resultData.totalScore / resultData.totalQuestions) * 100) 
      : 0;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {showConfetti && <Confetti />}
        
        <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-lg w-full">
          {resultData.passed ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-orange-500" />
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {resultData.passed ? "All Passed!" : "Test Completed"}
          </h2>
          <p className="text-gray-500 mb-6">Group test results submitted</p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-xs text-gray-400 font-bold uppercase mb-1">Participants</div>
              <div className="text-2xl font-bold text-gray-900">{resultData.participants}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-xs text-gray-400 font-bold uppercase mb-1">Avg Score</div>
              <div className={`text-2xl font-bold ${resultData.passed ? 'text-green-600' : 'text-orange-500'}`}>
                {percentage}%
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-xs text-gray-400 font-bold uppercase mb-1">Correct</div>
              <div className="text-2xl font-bold text-gray-900">{resultData.totalScore}</div>
            </div>
          </div>

          <button 
            onClick={onExit} 
            className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- NO QUESTIONS STATE ---
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No questions available</p>
          <button onClick={onExit} className="mt-4 px-6 py-2 bg-gray-200 rounded-xl font-bold hover:bg-gray-300">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalParticipants = Object.keys(assignments).length;
  const votesReceived = Object.values(answers).filter(sheet => sheet[currentIndex]).length;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <StickyHeader>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { if(confirm("Exit test? All progress will be lost.")) onExit(); }} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-800">{topicName}</h1>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase">
                    {testType}-test
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">
                    Remote Mode
                  </span>
                  {batchId && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold uppercase">
                      Batch {batchId}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ProgressStepper currentStage={testType === 'pre' ? 1 : 3} />
              
              {isActive && (
                <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-xl">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-700">
                      {votesReceived}/{totalParticipants}
                    </div>
                    <div className="text-[10px] text-purple-500 uppercase font-bold">Responses</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        {isActive && (
          <div className="h-1 bg-gray-200 w-full">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        )}
      </StickyHeader>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pb-24">
        {!isActive ? (
          /* START SCREEN */
          <div className="text-center max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Ready to Begin?</h2>
              <p className="text-gray-500 text-sm mb-6">Group test for {totalParticipants} participants</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="text-xs text-purple-500 font-bold uppercase mb-1">Participants</div>
                  <div className="text-3xl font-bold text-purple-600">{totalParticipants}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1">Questions</div>
                  <div className="text-3xl font-bold text-gray-900">{questions.length}</div>
                </div>
              </div>
              
              <button 
                onClick={startTest}
                className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                Start Test <ChevronRight className="w-5 h-5" />
              </button>
              
              <p className="text-xs text-gray-400 mt-4">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">→</kbd> or use remote to start
              </p>
            </div>
          </div>
        ) : (
          /* QUESTION DISPLAY */
          <div className="max-w-6xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Question Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  
                  {/* Response Indicator */}
                  <div className="flex items-center gap-2">
                    {votesReceived === totalParticipants ? (
                      <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-bold text-sm">All Responded</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-bold text-sm">{totalParticipants - votesReceived} Pending</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Question Text */}
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 leading-relaxed flex-1">
                  {currentQ.question_text}
                </h2>
                
                {/* Question Image */}
                {currentQ.question_image_url && (
                  <div className="flex justify-center mt-2">
                    <img 
                      src={`${API_BASE}${currentQ.question_image_url}`} 
                      alt="Question" 
                      className="max-h-48 rounded-xl border border-gray-200" 
                    />
                  </div>
                )}

                {/* Response Progress Bar */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500 font-medium">Response Progress</span>
                    <span className="font-bold text-gray-700">{votesReceived}/{totalParticipants}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        votesReceived === totalParticipants 
                          ? 'bg-green-500' 
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${(votesReceived / totalParticipants) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Options */}
              <div className="flex flex-col gap-2">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const txt = (currentQ as any)[`option_${opt.toLowerCase()}`];
                  const img = (currentQ as any)[`option_${opt.toLowerCase()}_image_url`];
                  if (!txt && !img) return null;
                  
                  return (
                    <div 
                      key={opt} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex items-stretch hover:border-gray-300 transition-colors"
                    >
                      {/* Letter */}
                      <div className="w-14 flex items-center justify-center text-xl font-bold flex-shrink-0 bg-gray-50 text-gray-500 border-r border-gray-200">
                        {opt}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-4 flex items-center">
                        {img && (
                          <img 
                            src={`${API_BASE}${img}`} 
                            alt={opt} 
                            className="h-10 rounded-lg mr-3 object-cover" 
                          />
                        )}
                        <span className="text-base font-medium text-gray-700">{txt}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Participant Grid - Shows who has responded */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-2">
                  <div className="text-xs font-bold text-gray-400 uppercase mb-3">Participant Status</div>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(assignments).map(([remoteId, sessionId]) => {
                      const hasAnswered = answers[sessionId]?.[currentIndex];
                      return (
                        <div 
                          key={remoteId}
                          className={`
                            aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all
                            ${hasAnswered 
                              ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                              : 'bg-gray-100 text-gray-400 border-2 border-transparent'
                            }
                          `}
                        >
                          {remoteId}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Footer Navigation */}
      {isActive && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <button
              onClick={() => changeQuestion(-1)}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>

            {/* Question Dots */}
            <div className="hidden md:flex items-center gap-1.5">
              {questions.map((_, idx) => {
                const allAnswered = Object.values(answers).every(sheet => sheet[idx]);
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`
                      w-8 h-8 rounded-lg font-bold text-xs transition-all
                      ${idx === currentIndex 
                        ? 'bg-purple-600 text-white' 
                        : allAnswered
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={submitTest}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" /> Submit Test
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => changeQuestion(1)}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors flex items-center gap-1.5"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefresherRemoteTest;