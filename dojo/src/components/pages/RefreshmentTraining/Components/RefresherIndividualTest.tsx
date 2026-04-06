import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Trophy } from 'lucide-react';
import { ProgressStepper, StickyHeader, Confetti, Avatar } from '../Components/shared/UIComponents';

const API_BASE = 'http://127.0.0.1:8000';

interface Props {
  testSessionId: number;
  topicName: string;
  testType: 'pre' | 'post';
  employeeName?: string;
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

const RefresherIndividualTest: React.FC<Props> = ({ 
  testSessionId, 
  topicName, 
  testType, 
  employeeName: initialEmployeeName,
  onExit 
}) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [employeeName, setEmployeeName] = useState(initialEmployeeName || '');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreData, setScoreData] = useState<{score: number, total: number, passed: boolean} | null>(null);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch test data
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${API_BASE}/refresher/test/start/?session_id=${testSessionId}`, {
          method: 'GET',
        });
        
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.questions);
          setEmployeeName(data.employee_name || initialEmployeeName || 'Employee');
        } else {
          const err = await res.json();
          if (res.status === 403) {
            alert("This test has already been completed.");
            onExit();
          } else {
            setError(err.error || "Failed to load test");
          }
        }
      } catch (e) {
        console.error(e);
        setError("Network error loading test");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [testSessionId, onExit, initialEmployeeName]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (submitted || loading || isSubmitting) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Enter':
          e.preventDefault();
          if (currentIndex === questions.length - 1) {
            handleSubmit();
          }
          break;
        case 'a':
        case 'A':
          selectOption('A');
          break;
        case 'b':
        case 'B':
          selectOption('B');
          break;
        case 'c':
        case 'C':
          if (questions[currentIndex]?.option_c) selectOption('C');
          break;
        case 'd':
        case 'D':
          if (questions[currentIndex]?.option_d) selectOption('D');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions, submitted, loading, isSubmitting]);

  const selectOption = (option: string) => {
    const qId = questions[currentIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  }, [currentIndex, questions.length]);

  const handleSubmit = async () => {
    if (submitted || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/refresher/test/submit/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          test_session_id: testSessionId,
          answers: answers
        })
      });
      
      const data = await res.json();
      const result = data.results ? data.results[0] : data;
      
      setScoreData({
        score: result.score,
        total: result.total_questions || questions.length,
        passed: result.passed
      });
      setSubmitted(true);
      
      if (result.passed) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    } catch (e) {
      alert("Submission failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Loading State
  if (loading && !submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading test...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{error}</h3>
          <button 
            onClick={onExit} 
            className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black font-bold transition-colors w-full"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  // Result State
  if (submitted && scoreData) {
    const percentage = Math.round((scoreData.score / scoreData.total) * 100);
    
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        {showConfetti && <Confetti />}
        
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          {scoreData.passed ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-orange-500" />
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {scoreData.passed ? "Congratulations!" : "Test Completed"}
          </h2>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <Avatar name={employeeName} size="sm" />
            <span className="text-gray-500 font-medium">{employeeName}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-xs text-gray-400 font-bold uppercase mb-1">Score</div>
              <div className={`text-3xl font-bold ${scoreData.passed ? 'text-green-600' : 'text-orange-500'}`}>
                {percentage}%
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-xs text-gray-400 font-bold uppercase mb-1">Correct</div>
              <div className="text-3xl font-bold text-gray-900">
                {scoreData.score}<span className="text-base text-gray-400">/{scoreData.total}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={onExit} 
            className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Test UI
  const q = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
{/* Header */}
<StickyHeader>
  <div className="max-w-6xl mx-auto px-4 py-3">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => { if(confirm("Exit test? Progress may be lost.")) onExit(); }} 
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
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-1.5">
              <Avatar name={employeeName} size="sm" />  {/* Changed from "xs" to "sm" */}
              <span className="text-gray-600 font-medium">{employeeName}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <ProgressStepper currentStage={testType === 'pre' ? 1 : 3} />
        
        {/* Answered Counter */}
        <div className="bg-purple-50 px-4 py-2 rounded-xl">
          <div className="text-lg font-bold text-purple-700">
            {answeredCount}/{questions.length}
          </div>
          <div className="text-[10px] text-purple-500 uppercase font-bold">Answered</div>
        </div>
      </div>
    </div>
  </div>
  
  {/* Progress Bar */}
  <div className="h-1 bg-gray-200 w-full">
    <div 
      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300" 
      style={{ width: `${progress}%` }} 
    />
  </div>
</StickyHeader>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pb-24">
        <div className="max-w-5xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                
                {answers[q.id] && (
                  <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-bold text-sm">Answered</span>
                  </div>
                )}
              </div>

              {/* Question Text */}
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 leading-relaxed flex-1">
                {q.question_text}
              </h2>

              {/* Question Image */}
              {q.question_image_url && (
                <div className="flex justify-center mt-2">
                  <img 
                    src={`${API_BASE}${q.question_image_url}`} 
                    alt="Question" 
                    className="max-h-48 rounded-xl border border-gray-200" 
                  />
                </div>
              )}

              {/* Progress Info */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500 font-medium">Progress</span>
                  <span className="font-bold text-gray-700">{answeredCount}/{questions.length} answered</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2">
              {['A', 'B', 'C', 'D'].map((letter) => {
                const optionKey = `option_${letter.toLowerCase()}` as keyof Question;
                const optionImgKey = `option_${letter.toLowerCase()}_image_url` as keyof Question;
                const text = q[optionKey] as string;
                const img = q[optionImgKey] as string;

                if (!text && !img) return null;

                const isSelected = answers[q.id] === letter;

                return (
                  <button
                    key={letter}
                    onClick={() => selectOption(letter)}
                    className={`
                      w-full text-left rounded-xl border-2 overflow-hidden flex items-stretch transition-all group
                      ${isSelected 
                        ? 'border-purple-500 bg-purple-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {/* Letter Badge */}
                    <div className={`
                      w-14 flex items-center justify-center font-bold text-xl flex-shrink-0 transition-colors
                      ${isSelected 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-50 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600 border-r border-gray-200'
                      }
                    `}>
                      {letter}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {img && (
                          <img 
                            src={`${API_BASE}${img}`} 
                            alt={letter} 
                            className="h-12 rounded-lg mb-2 object-cover" 
                          />
                        )}
                        <span className={`text-base font-medium block ${
                          isSelected ? 'text-purple-900' : 'text-gray-700'
                        }`}>
                          {text}
                        </span>
                      </div>
                      
                      {/* Selected Indicator */}
                      {isSelected && (
                        <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 ml-3" />
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Keyboard Hints */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 mt-2">
                <div className="text-xs font-bold text-gray-400 uppercase mb-2">Keyboard Shortcuts</div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">A</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">B</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">C</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">D</kbd>
                    Select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">←</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">→</kbd>
                    Navigate
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="px-5 py-2.5 font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-5 h-5" /> Previous
          </button>

          {/* Question Dots */}
          <div className="hidden md:flex items-center gap-1.5">
            {questions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`
                  w-8 h-8 rounded-lg font-bold text-xs transition-all
                  ${idx === currentIndex 
                    ? 'bg-purple-600 text-white' 
                    : answers[question.id]
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }
                `}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
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
                onClick={goToNext}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors flex items-center gap-1.5"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefresherIndividualTest;