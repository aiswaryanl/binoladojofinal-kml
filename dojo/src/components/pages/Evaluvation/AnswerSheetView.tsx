import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Loader2, Printer, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';

// --- TYPES ---
interface OptionData {
  text: string;
  text_lang2?: string | null;
  image_url: string | null;
}

interface AnswerSheetQuestion {
  id: number;
  question_text: string;
  question_text_lang2?: string | null;
  question_image_url: string | null;
  options: OptionData[];
  correct_index: number;
  employee_answer_index: number;
  is_correct: boolean;
}

interface AnswerSheetData {
  test_name: string;
  employee_name: string;
  employee_id: string;
  question_paper_name: string;
  department_name: string;
  station_name: string;
  level_name: string;
  test_date: string | null;
  questions: AnswerSheetQuestion[];
  score_summary: {
    total_questions: number;
    correct_answers: number;
    score: number;
    percentage: number;
    passed: boolean;
  };
}

type Page =
  | { type: 'cover' }
  | { type: 'questions'; questions: AnswerSheetQuestion[]; startIndex: number }
  | { type: 'closing' };

// Styles
const pdfViewerStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Patrick+Hand&family=Courier+Prime:wght@400;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');

  * { box-sizing: border-box; }

  .font-handwriting { font-family: 'Caveat', cursive; }
  .font-typewriter { font-family: 'Courier Prime', monospace; }
  .font-serif-exam { font-family: 'Libre Baskerville', Georgia, serif; }

  .pdf-viewer {
    background: #525659;
    min-height: 100vh;
    overflow-y: auto;
    padding: 20px 0 40px 0;
  }

  .pdf-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 0 20px;
  }

  .page-wrapper { position: relative; }

  .a4-page {
    width: 210mm;
    min-height: 297mm;
    background: #fffef0;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    transform-origin: top center;
    transition: transform 0.2s ease;
  }

  .page-break-indicator {
    width: 210mm;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 0;
    color: #888;
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    background: transparent;
  }

  .page-break-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, #666, transparent);
  }

  .page-break-text {
    padding: 0 15px;
    white-space: nowrap;
  }

  .page-content {
    padding: 15mm 20mm 20mm 25mm;
    min-height: 100%;
    position: relative;
  }

  .red-margin {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 20mm;
    width: 1.5px;
    background: #e74c3c;
    opacity: 0.4;
  }

  .staple-marks {
    position: absolute;
    top: 18mm;
    left: 7mm;
    display: flex;
    flex-direction: column;
    gap: 5mm;
  }

  .staple {
    width: 3px;
    height: 12px;
    background: linear-gradient(180deg, #666 0%, #999 50%, #666 100%);
    border-radius: 1px;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.4);
  }

  .dog-ear {
    position: absolute;
    top: 0;
    right: 0;
    width: 22px;
    height: 22px;
    background: linear-gradient(135deg, transparent 50%, #e5e1d6 50%);
    box-shadow: -2px 2px 4px rgba(0,0,0,0.1);
  }

  .page-number {
    position: absolute;
    bottom: 10mm;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    color: #666;
  }

  .student-circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    border: 2.5px solid #1e3a5f;
    border-radius: 50%;
    position: relative;
  }

  .student-circle::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border: 1.5px solid transparent;
    border-top-color: #1e3a5f;
    border-radius: 50%;
    transform: rotate(-12deg);
    opacity: 0.5;
  }

  .teacher-circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    border: 2px dashed #dc2626;
    border-radius: 50%;
  }

  .crossed-out { position: relative; }
  .crossed-out::after {
    content: '';
    position: absolute;
    top: 50%;
    left: -4px;
    right: -4px;
    height: 2px;
    background: #dc2626;
    transform: rotate(-8deg);
  }

  .score-display {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 18px;
    border: 3px solid #dc2626;
    border-radius: 50%;
    transform: rotate(-4deg);
    position: relative;
    background: rgba(255,255,255,0.5);
  }

  .score-display::before {
    content: '';
    position: absolute;
    inset: -5px;
    border: 2px solid transparent;
    border-top-color: #dc2626;
    border-left-color: #dc2626;
    border-radius: 50%;
    transform: rotate(25deg);
  }

  .tick-mark {
    font-family: 'Patrick Hand', cursive;
    color: #dc2626;
    font-size: 24px;
    font-weight: bold;
    line-height: 1;
  }

  .cross-mark {
    font-family: 'Patrick Hand', cursive;
    color: #dc2626;
    font-size: 20px;
    font-weight: bold;
    line-height: 1;
  }

  .toolbar {
    position: fixed;
    top: 80px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 50;
  }

  .toolbar-btn {
    width: 42px;
    height: 42px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  .toolbar-btn:hover:not(:disabled) {
    background: #f5f5f5;
    transform: scale(1.05);
  }

  .toolbar-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .zoom-display {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 6px 10px;
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    color: #555;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  .question-block {
    margin-bottom: 6mm;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .question-divider {
    border-top: 1px dashed #ccc;
    margin: 5mm 0;
  }

  .option-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 2.2mm 0;
  }

  .option-marker {
    flex-shrink: 0;
    width: 30px;
    display: flex;
    justify-content: center;
  }

  .blank-line {
    border-bottom: 1.5px solid #888;
    min-height: 28px;
  }

  .seal-area {
    width: 75px;
    height: 75px;
    border: 2px dashed #aaa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #999;
    font-size: 10px;
  }

  .image-container {
    display: inline-block;
    border: 1px solid #ddd;
    padding: 4px;
    background: white;
    border-radius: 4px;
  }

  .question-image {
    max-width: 100%;
    max-height: 120px;
    object-fit: contain;
    display: block;
  }

  .option-image {
    max-width: 100%;
    max-height: 60px;
    object-fit: contain;
    display: block;
  }

  /* Hidden measuring container (offscreen but measurable) */
  .measure-root {
    position: absolute;
    left: -99999px;
    top: 0;
    width: 210mm;
    visibility: hidden;
    pointer-events: none;
  }

  @media print {
    @page { size: A4; margin: 0; }

    body { margin: 0; padding: 0; background: white !important; }

    /* PRINT ISOLATION: show only #print-root */
    body * { visibility: hidden !important; }
    #print-root, #print-root * { visibility: visible !important; }

    #print-root {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      height: auto !important;
      overflow: visible !important;
      background: white !important;
      padding: 0 !important;
    }

    .no-print { display: none !important; }

    .pdf-viewer { background: white !important; padding: 0 !important; overflow: visible !important; }
    .pdf-container { gap: 0 !important; padding: 0 !important; }

    .page-wrapper { break-after: page; page-break-after: always; }
    .page-wrapper:last-child { break-after: auto; page-break-after: auto; }

    .a4-page {
      box-shadow: none !important;
      margin: 0 !important;
      transform: none !important; /* IMPORTANT: disable zoom transforms for print */
    }

    .page-break-indicator { display: none !important; }
  }
`;

const PX_PER_MM = 3.7795275591;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const AnswerSheetView: React.FC = () => {
  const location = useLocation();
  const { scoreId: scoreIdParam } = useParams<{ scoreId: string }>();
  const scoreId = scoreIdParam ? parseInt(scoreIdParam, 10) : null;

  const [answerSheetData, setAnswerSheetData] = useState<AnswerSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [zoom, setZoom] = useState(100);
  const minZoom = 50;
  const maxZoom = 200;

  const viewerRef = useRef<HTMLDivElement>(null);

  // For dynamic pagination measuring
  const measureRef = useRef<HTMLDivElement>(null);
  const measureItemsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const [questionHeights, setQuestionHeights] = useState<Map<number, number>>(new Map());

  const employeeName = location.state?.employeeName || '';
  const employeeId = location.state?.employeeId || '';

  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = pdfViewerStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    if (!scoreId) {
      setError('Missing Score ID.');
      setLoading(false);
      return;
    }

    const fetchAnswerSheet = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/answersheet/${scoreId}/`);
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const data: AnswerSheetData = await response.json();
        setAnswerSheetData(data);
      } catch (err) {
        setError(`Failed to load: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAnswerSheet();
  }, [scoreId]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, maxZoom));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, minZoom));

  const handleFitWidth = () => {
    if (!viewerRef.current) return;
    // viewer width minus some padding so we don't touch edges
    const containerWidth = viewerRef.current.clientWidth - 80;
    const pageWidthPx = 210 * PX_PER_MM;
    const fitZoom = Math.floor((containerWidth / pageWidthPx) * 100);
    setZoom(clamp(fitZoom, minZoom, maxZoom));
  };

  const handlePrint = () => window.print();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  // --- Derivatives ---
  const summary = answerSheetData?.score_summary;
  const total_questions = summary?.total_questions ?? 0;
  const correct_answers = summary?.correct_answers ?? 0;

  const wrongAnswers = useMemo(() => {
    if (!answerSheetData) return 0;
    return answerSheetData.questions.filter(q => !q.is_correct && q.employee_answer_index !== -1).length;
  }, [answerSheetData]);

  const skippedAnswers = useMemo(() => {
    if (!answerSheetData) return 0;
    return answerSheetData.questions.filter(q => q.employee_answer_index === -1).length;
  }, [answerSheetData]);

  // --- Render Question Block (used for actual pages + measuring) ---
  const renderQuestion = (q: AnswerSheetQuestion, globalIndex: number, showDivider: boolean) => {
    const isCorrect = q.is_correct;
    const isSkipped = q.employee_answer_index === -1;
    const isWrong = !isCorrect && !isSkipped;

    return (
      <div key={q.id} className="question-block">
        {showDivider && <div className="question-divider" />}

        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 pr-6">
            <p className="font-serif-exam text-gray-900 leading-relaxed" style={{ fontSize: '13px' }}>
              <span className="font-bold">{globalIndex + 1}.</span>{' '}
              {q.question_text}
            </p>

            {q.question_text_lang2 && (
              <p className="text-gray-500 mt-1 ml-5 italic font-serif-exam" style={{ fontSize: '11px' }}>
                {q.question_text_lang2}
              </p>
            )}
          </div>

          <div className="flex-shrink-0">
            {isCorrect && <span className="tick-mark">✓</span>}
            {isWrong && <span className="cross-mark">✗</span>}
            {isSkipped && <span className="text-gray-400 text-xl">○</span>}
          </div>
        </div>

        {q.question_image_url && (
          <div className="ml-5 mb-3">
            <div className="image-container">
              <img
                src={q.question_image_url}
                alt={`Q${globalIndex + 1}`}
                className="question-image"
                onError={handleImageError}
              />
            </div>
          </div>
        )}

        <div className="ml-5 space-y-1">
          {q.options.map((option, optIdx) => {
            const isStudentChoice = optIdx === q.employee_answer_index;
            const isCorrectOption = optIdx === q.correct_index;
            const label = String.fromCharCode(65 + optIdx);

            return (
              <div key={optIdx} className="option-row">
                <div className="option-marker">
                  {isStudentChoice && isCorrect && (
                    <div className="student-circle">
                      <span className="text-blue-900 font-bold" style={{ fontSize: '11px' }}>
                        {label}
                      </span>
                    </div>
                  )}

                  {isStudentChoice && isWrong && (
                    <div className="student-circle crossed-out">
                      <span className="text-blue-900 font-bold" style={{ fontSize: '11px' }}>
                        {label}
                      </span>
                    </div>
                  )}

                  {isCorrectOption && (isWrong || isSkipped) && (
                    <div className="teacher-circle">
                      <span className="text-red-600 font-bold" style={{ fontSize: '11px' }}>
                        {label}
                      </span>
                    </div>
                  )}

                  {!isStudentChoice && !(isCorrectOption && (isWrong || isSkipped)) && (
                    <span className="font-typewriter text-gray-500" style={{ fontSize: '11px' }}>
                      {label}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  {option.image_url && (
                    <div className="mb-1">
                      <div className="image-container" style={{ padding: '2px' }}>
                        <img
                          src={option.image_url}
                          alt={`Opt ${label}`}
                          className="option-image"
                          onError={handleImageError}
                        />
                      </div>
                    </div>
                  )}

                  <span
                    className={`font-serif-exam ${
                      isStudentChoice && isWrong
                        ? 'text-gray-400 line-through'
                        : isCorrectOption && (isWrong || isSkipped)
                          ? 'text-red-600 font-medium'
                          : 'text-gray-700'
                    }`}
                    style={{ fontSize: '12px' }}
                  >
                    {option.text}
                  </span>

                  {option.text_lang2 && (
                    <span className="text-gray-400 ml-2" style={{ fontSize: '10px' }}>
                      ({option.text_lang2})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {(isWrong || isSkipped) && (
          <div className="ml-5 mt-2">
            <span className="font-handwriting text-red-600" style={{ fontSize: '16px' }}>
              → Correct: {String.fromCharCode(65 + q.correct_index)}
            </span>
          </div>
        )}
      </div>
    );
  };

  // --- Cover Page ---
  const renderCoverPage = (pageNum: number, totalPages: number) => {
    if (!answerSheetData) return null;

    return (
      <div className="page-content">
        <div className="red-margin" />
        <div className="staple-marks">
          <div className="staple" />
          <div className="staple" />
        </div>
        <div className="dog-ear" />

        <div className="text-center mb-6">
          <h1 className="font-typewriter font-bold tracking-widest text-gray-800" style={{ fontSize: '20px' }}>
            QUALIFICATION TEST
          </h1>
          <div className="flex justify-center mt-2">
            <div className="w-40 border-b-2 border-gray-700" />
          </div>
          <div className="flex justify-center mt-1">
            <div className="w-36 border-b-2 border-gray-700" />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-baseline">
            <span className="font-typewriter text-gray-600 w-32" style={{ fontSize: '12px' }}>
              Name:
            </span>
            <span
              className="font-handwriting text-blue-900 flex-1 border-b-2 border-gray-400 pb-1 min-h-[28px]"
              style={{ fontSize: '24px' }}
            >
              {answerSheetData.employee_name || employeeName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-baseline">
              <span className="font-typewriter text-gray-600 w-28" style={{ fontSize: '11px' }}>
                Employee ID:
              </span>
              <span className="font-handwriting text-blue-900 flex-1 border-b-2 border-gray-400 pb-1" style={{ fontSize: '20px' }}>
                {answerSheetData.employee_id || employeeId}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="font-typewriter text-gray-600 w-16" style={{ fontSize: '11px' }}>
                Date:
              </span>
              <span className="font-handwriting text-blue-900 flex-1 border-b-2 border-gray-400 pb-1" style={{ fontSize: '20px' }}>
                {answerSheetData.test_date || currentDate}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-baseline">
              <span className="font-typewriter text-gray-600 w-28" style={{ fontSize: '11px' }}>
                Department:
              </span>
              <span className="font-handwriting text-blue-900 flex-1 border-b-2 border-gray-400 pb-1" style={{ fontSize: '20px' }}>
                {answerSheetData.department_name}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="font-typewriter text-gray-600 w-16" style={{ fontSize: '11px' }}>
                Level:
              </span>
              <span className="font-handwriting text-blue-900 flex-1 border-b-2 border-gray-400 pb-1" style={{ fontSize: '20px' }}>
                {answerSheetData.level_name}
              </span>
            </div>
          </div>

          <div className="flex items-baseline">
            <span className="font-typewriter text-gray-600 w-32" style={{ fontSize: '11px' }}>
              Station:
            </span>
            <span className="font-handwriting text-blue-900 flex-1 border-b-2 border-gray-400 pb-1" style={{ fontSize: '20px' }}>
              {answerSheetData.station_name}
            </span>
          </div>
        </div>

        {/* SCORE ONLY (no percentage, no pass/fail) */}
        <div className="flex items-center justify-center gap-8 my-8">
          <div className="score-display">
            <span className="font-handwriting text-red-600 font-bold" style={{ fontSize: '32px' }}>
              {correct_answers}
            </span>
            <div className="w-10 border-t-2 border-red-600 my-1" />
            <span className="font-handwriting text-red-600" style={{ fontSize: '22px' }}>
              {total_questions}
            </span>
          </div>

          <div className="text-center">
            <div className="font-typewriter text-gray-600" style={{ fontSize: '11px' }}>
              SCORE
            </div>
            <div className="font-handwriting text-blue-900" style={{ fontSize: '28px', transform: 'rotate(-2deg)' }}>
              {correct_answers}/{total_questions}
            </div>
          </div>
        </div>

        <div className="p-4 border-2 border-gray-300 bg-gray-50 mb-6">
          <h3 className="font-typewriter font-bold text-gray-700 mb-3" style={{ fontSize: '11px' }}>
            MARKING GUIDE:
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="student-circle" style={{ minWidth: '20px', height: '20px' }}>
                <span className="text-blue-900 font-bold" style={{ fontSize: '9px' }}>
                  A
                </span>
              </div>
              <span className="font-typewriter text-gray-600" style={{ fontSize: '10px' }}>
                Your Answer (Blue Pen)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="teacher-circle" style={{ minWidth: '20px', height: '20px' }}>
                <span className="text-red-600 font-bold" style={{ fontSize: '9px' }}>
                  B
                </span>
              </div>
              <span className="font-typewriter text-gray-600" style={{ fontSize: '10px' }}>
                Correct Answer (Red Pen)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="tick-mark" style={{ fontSize: '18px' }}>
                ✓
              </span>
              <span className="font-typewriter text-gray-600" style={{ fontSize: '10px' }}>
                Correct
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="cross-mark" style={{ fontSize: '16px' }}>
                ✗
              </span>
              <span className="font-typewriter text-gray-600" style={{ fontSize: '10px' }}>
                Wrong
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="font-typewriter text-gray-500" style={{ fontSize: '10px' }}>
            Question Paper: {answerSheetData.question_paper_name}
          </p>
        </div>

        <div className="page-number">
          {pageNum} / {totalPages}
        </div>
      </div>
    );
  };

  const renderQuestionsPage = (questions: AnswerSheetQuestion[], startIndex: number, pageNum: number, totalPages: number) => (
    <div className="page-content">
      <div className="red-margin" />
      <div className="space-y-2">
        {questions.map((q, idx) => renderQuestion(q, startIndex + idx, idx > 0))}
      </div>
      <div className="page-number">
        {pageNum} / {totalPages}
      </div>
    </div>
  );

  const renderClosingPage = (pageNum: number, totalPages: number) => (
    <div className="page-content">
      <div className="red-margin" />

      <div className="mb-8">
        <h2 className="font-typewriter font-bold text-gray-700 border-b-2 border-gray-400 pb-2 mb-4" style={{ fontSize: '14px' }}>
          TEST SUMMARY
        </h2>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <div className="flex justify-between border-b border-dotted border-gray-300 pb-2">
            <span className="font-typewriter text-gray-600" style={{ fontSize: '11px' }}>
              Total Questions:
            </span>
            <span className="font-handwriting text-blue-900" style={{ fontSize: '20px' }}>
              {total_questions}
            </span>
          </div>

          <div className="flex justify-between border-b border-dotted border-gray-300 pb-2">
            <span className="font-typewriter text-gray-600" style={{ fontSize: '11px' }}>
              Correct Answers:
            </span>
            <span className="font-handwriting text-green-700" style={{ fontSize: '20px' }}>
              {correct_answers}
            </span>
          </div>

          <div className="flex justify-between border-b border-dotted border-gray-300 pb-2">
            <span className="font-typewriter text-gray-600" style={{ fontSize: '11px' }}>
              Wrong Answers:
            </span>
            <span className="font-handwriting text-red-600" style={{ fontSize: '20px' }}>
              {wrongAnswers}
            </span>
          </div>

          <div className="flex justify-between border-b border-dotted border-gray-300 pb-2">
            <span className="font-typewriter text-gray-600" style={{ fontSize: '11px' }}>
              Skipped:
            </span>
            <span className="font-handwriting text-gray-600" style={{ fontSize: '20px' }}>
              {skippedAnswers}
            </span>
          </div>

          {/* Remove Percentage + Result (as requested) */}
          <div className="flex justify-between border-b border-dotted border-gray-300 pb-2">
            <span className="font-typewriter text-gray-600" style={{ fontSize: '11px' }}>
              Score:
            </span>
            <span className="font-handwriting text-blue-900" style={{ fontSize: '20px' }}>
              {correct_answers}/{total_questions}
            </span>
          </div>
        </div>
      </div>

      {/* Examiner Section - blank for manual writing */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div className="font-typewriter text-gray-600 mb-2" style={{ fontSize: '11px' }}>
            Checked By:
          </div>
          <div className="blank-line" />
        </div>
        <div>
          <div className="font-typewriter text-gray-600 mb-2" style={{ fontSize: '11px' }}>
            Date:
          </div>
          <div className="blank-line" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="font-typewriter text-gray-600 mb-2" style={{ fontSize: '11px' }}>
            Signature:
          </div>
          <div className="min-h-[60px] border-b-2 border-gray-400" />
        </div>
        <div className="flex justify-center items-end">
          <div className="seal-area font-typewriter">
            Official
            <br />
            Seal
          </div>
        </div>
      </div>

      <div className="page-number">
        {pageNum} / {totalPages}
      </div>
    </div>
  );

  // --- Dynamic Pagination ---
  // We compute how many questions fit in one A4 page content area by measuring DOM heights.
  const pageContents: Page[] = useMemo(() => {
    if (!answerSheetData) return [];

    // If we haven't measured yet, fall back to a safe split (temporary)
    // Once heights are measured, we repaginate accurately.
    const heightsReady = answerSheetData.questions.every(q => questionHeights.has(q.id));
    const pages: Page[] = [{ type: 'cover' }];

    const allQuestions = answerSheetData.questions;

    if (!heightsReady) {
      const fallbackPerPage = 3; // safer when images/lang2 exist
      for (let i = 0; i < allQuestions.length; i += fallbackPerPage) {
        pages.push({ type: 'questions', questions: allQuestions.slice(i, i + fallbackPerPage), startIndex: i });
      }
      pages.push({ type: 'closing' });
      return pages;
    }

    // Content height available inside page-content:
    // A4 height minus top/bottom padding and minus page-number space.
    // A4 height: 297mm.
    // page-content padding: top 15mm, bottom 20mm. Add ~12mm for footer page number area safety.
    const usableHeightMm = 297 - 15 - 20 - 12;
    const usableHeightPx = usableHeightMm * PX_PER_MM;

    let current: AnswerSheetQuestion[] = [];
    let currentHeight = 0;
    let startIndex = 0;

    for (let i = 0; i < allQuestions.length; i++) {
      const q = allQuestions[i];
      const h = questionHeights.get(q.id) ?? 0;

      // If single question exceeds a page, force it alone (will still be clipped only if extreme)
      if (current.length === 0 && h > usableHeightPx) {
        pages.push({ type: 'questions', questions: [q], startIndex: i });
        startIndex = i + 1;
        current = [];
        currentHeight = 0;
        continue;
      }

      // Add divider height for all but first question on a page (approx)
      const dividerExtra = current.length > 0 ? 18 : 0; // px estimate for dashed divider + margins

      if (currentHeight + h + dividerExtra <= usableHeightPx) {
        current.push(q);
        currentHeight += h + dividerExtra;
      } else {
        pages.push({ type: 'questions', questions: current, startIndex });
        startIndex = i;
        current = [q];
        currentHeight = h;
      }
    }

    if (current.length > 0) {
      pages.push({ type: 'questions', questions: current, startIndex });
    }

    pages.push({ type: 'closing' });
    return pages;
  }, [answerSheetData, questionHeights]);

  const totalPages = pageContents.length;

  // Measure question heights after render and after images load
  useEffect(() => {
    if (!answerSheetData) return;

    const measure = () => {
      const map = new Map<number, number>();
      for (const q of answerSheetData.questions) {
        const el = measureItemsRef.current.get(q.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        map.set(q.id, rect.height);
      }
      // Only set if something measured
      if (map.size > 0) setQuestionHeights(map);
    };

    // measure now + after images settle
    const t1 = window.setTimeout(measure, 50);
    const t2 = window.setTimeout(measure, 250);
    const t3 = window.setTimeout(measure, 800);

    // Re-measure when any image loads in the measure container
    const root = measureRef.current;
    const onLoad = () => measure();
    if (root) {
      root.addEventListener('load', onLoad, true);
    }

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      if (root) root.removeEventListener('load', onLoad, true);
    };
  }, [answerSheetData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#525659' }}>
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <p className="font-typewriter text-gray-300">Loading Answer Sheet...</p>
        </div>
      </div>
    );
  }

  if (error || !answerSheetData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#525659' }}>
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="font-typewriter text-xl text-red-700 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'No data found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="print-root"
      ref={viewerRef}
      className="pdf-viewer"
      style={{ height: '100vh', overflowY: 'auto' }}
    >
      {/* Toolbar */}
      <div className="toolbar no-print">
        <button className="toolbar-btn" onClick={handlePrint} title="Print / Save as PDF">
          <Printer className="w-5 h-5 text-gray-700" />
        </button>

        <div className="zoom-display">{zoom}%</div>

        <button className="toolbar-btn" onClick={handleZoomIn} title="Zoom In" disabled={zoom >= maxZoom}>
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>

        <button className="toolbar-btn" onClick={handleZoomOut} title="Zoom Out" disabled={zoom <= minZoom}>
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </button>

        <button className="toolbar-btn" onClick={handleFitWidth} title="Fit to Width">
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Hidden measuring DOM (for dynamic pagination) */}
      <div className="measure-root" ref={measureRef}>
        <div className="a4-page">
          <div className="page-content">
            <div className="red-margin" />
            <div className="space-y-2">
              {answerSheetData.questions.map((q, idx) => (
                <div
                  key={q.id}
                  ref={(el) => {
                    if (el) measureItemsRef.current.set(q.id, el);
                    else measureItemsRef.current.delete(q.id);
                  }}
                >
                  {renderQuestion(q, idx, idx > 0)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visible pages */}
      <div className="pdf-container">
        {pageContents.map((page, idx) => {
          const pageNum = idx + 1;

          return (
            <React.Fragment key={idx}>
              <div className="page-wrapper">
                <div className="a4-page" style={{ transform: `scale(${zoom / 100})` }}>
                  {page.type === 'cover' && renderCoverPage(pageNum, totalPages)}
                  {page.type === 'questions' && renderQuestionsPage(page.questions, page.startIndex, pageNum, totalPages)}
                  {page.type === 'closing' && renderClosingPage(pageNum, totalPages)}
                </div>
              </div>

              {idx < pageContents.length - 1 && (
                <div
                  className="page-break-indicator no-print"
                  style={{
                    width: `calc(210mm * ${zoom / 100})`,
                    maxWidth: '100%',
                  }}
                >
                  <div className="page-break-line" />
                  <span className="page-break-text">
                    Page {idx + 1} — Page {idx + 2}
                  </span>
                  <div className="page-break-line" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default AnswerSheetView;