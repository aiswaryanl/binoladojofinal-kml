import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  createContext,
  useContext,
} from 'react';
import type { ReactNode, ChangeEvent } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';

// ================== CONFIGURATION ==================
const BACKEND_BASE_URL = 'http://192.168.2.51:8000';

const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Helper to handle Image URLs
const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_BASE_URL}${url}`;
};

// ================== TYPES ==================
export interface QuestionPaper {
  question_paper_id: number;
  question_paper_name: string;
  level?: { name: string };
  department?: { name: string };
}

export interface Question {
  id: number;
  question_paper: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  question_lang2?: string | null;
  option_a_lang2?: string | null;
  option_b_lang2?: string | null;
  option_c_lang2?: string | null;
  option_d_lang2?: string | null;
  option_a_image_url: string | null;
  option_b_image_url: string | null;
  option_c_image_url: string | null;
  option_d_image_url: string | null;
  question_image_url: string | null;
  correct_answer: string;
  correct_index?: number;
  is_archived?: boolean;
  is_active?: boolean;  // ADD THIS - backend field
  order?: number;       // ADD THIS - backend field
  created_at?: string;
  updated_at?: string;
}

export interface QuestionFormData  {
  question: string;
  options: string[];
  questionLang2: string;
  optionsLang2: string[];
  correctAnswerIndex: number | null;
  questionImage: File | null;
  optionImages: (File | null)[];
}

interface UploadResult {
  status: string;
  created_count: number;
  error_count: number;
  errors: { row: number; errors: any }[];
  detail?: string;
}

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ViewMode = 'list' | 'grid';
type TabView = 'active' | 'archived';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ================== TOAST CONTEXT ==================
interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// ================== ICONS ==================
const Icons = {
  Document: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Search: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Grid: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  List: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  Edit: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
    </svg>
  ),
  Delete: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Archive: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  Restore: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Duplicate: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Check: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  CheckCircle: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  X: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Warning: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Info: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Upload: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Download: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Eye: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Plus: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  ChevronDown: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Image: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Language: ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
  ),
};

// ================== TOAST CONTAINER ==================
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconBg = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-emerald-100 text-emerald-600';
      case 'error': return 'bg-red-100 text-red-600';
      case 'warning': return 'bg-amber-100 text-amber-600';
      case 'info': return 'bg-blue-100 text-blue-600';
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <Icons.CheckCircle className="h-5 w-5" />;
      case 'error': return <Icons.X className="h-5 w-5" />;
      case 'warning': return <Icons.Warning className="h-5 w-5" />;
      case 'info': return <Icons.Info className="h-5 w-5" />;
    }
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <div key={toast.id} className={`${getToastStyles(toast.type)} border rounded-xl p-4 shadow-lg animate-slide-in-right`}>
          <div className="flex items-start gap-3">
            <div className={`${getIconBg(toast.type)} p-2 rounded-lg flex-shrink-0`}>{getIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{toast.title}</h4>
              <p className="text-sm opacity-80 mt-0.5">{toast.message}</p>
              {toast.action && (
                <button onClick={toast.action.onClick} className="mt-2 text-sm font-medium underline hover:no-underline">
                  {toast.action.label}
                </button>
              )}
            </div>
            <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
              <Icons.X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
};

// ================== BULK UPLOAD MODAL ==================
interface TemplateQuestionBulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
    questionPaper: QuestionPaper | null;
  }
  
  const TemplateQuestionBulkUploadModal: React.FC<TemplateQuestionBulkUploadModalProps> = ({
    isOpen,
    onClose,
    onUploadSuccess,
    questionPaper,
  }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'result'>('idle');
    const [result, setResult] = useState<UploadResult | null>(null);
  
    useEffect(() => {
      if (!isOpen) {
        resetState();
      }
    }, [isOpen]);
  
    const buildDownloadUrl = () => {
      return `${BACKEND_BASE_URL}/template-questions/download-template/?question_paper_id=${questionPaper?.question_paper_id}`;
    };
  
    const formatErrorObject = (errors: any): string => {
      if (typeof errors === 'string') return errors;
      return Object.entries(errors)
        .map(([field, messages]) => {
          const messageStr = Array.isArray(messages) ? messages.join(', ') : String(messages);
          return `${field}: ${messageStr}`;
        })
        .join(' | ');
    };
  
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
      }
    };
  
    const resetState = () => {
      setSelectedFile(null);
      setUploadState('idle');
      setResult(null);
    };
  
    const handleUpload = async () => {
      if (!selectedFile || !questionPaper) return;
      
      setUploadState('uploading');
  
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('question_paper_id', String(questionPaper.question_paper_id));
  
      try {
        const response = await apiClient.post<UploadResult>('/template-questions/bulk-upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        setResult(response.data);
        if (response.data.created_count > 0) {
          onUploadSuccess();
        }
      } catch (error: any) {
        if (error.response?.data) {
          setResult(error.response.data as UploadResult);
        } else {
          setResult({
            status: 'Upload Failed',
            created_count: 0,
            error_count: 1,
            errors: [],
            detail: 'A network error occurred. Please check your connection.',
          });
        }
      } finally {
        setUploadState('result');
      }
    };
  
    if (!isOpen || !questionPaper) return null;
  
    return createPortal(
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4 animate-scale-in">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Upload Questions</h2>
              <p className="text-sm text-gray-500 mt-1">For: {questionPaper.question_paper_name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icons.X className="h-6 w-6" />
            </button>
          </div>
  
          <div className="p-6 overflow-y-auto">
            {uploadState === 'idle' && (
              <>
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-900 p-5 rounded-xl mb-6">
                  <h3 className="font-bold flex items-center gap-2 mb-3">
                    <Icons.Info className="h-5 w-5 text-indigo-600" />
                    How to use Bulk Upload
                  </h3>
                  
                  <ol className="list-decimal list-inside space-y-2 text-sm text-indigo-800">
                    <li>Download the Excel template below.</li>
                    <li>Fill in question text and options for Language 1 (Required).</li>
                    <li>Optionally fill Language 2 columns for bilingual support.</li>
                    <li>
                      <strong>Images:</strong> Insert images directly into Excel cells using <em>Insert → Pictures</em>.
                    </li>
                    <li>Save the file and upload it here.</li>
                  </ol>
  
                  <a
                    href={buildDownloadUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-sm"
                  >
                    <Icons.Download className="h-4 w-4" />
                    Download Template
                  </a>
                </div>
  
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <input
                    id="template-upload-input"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <div className="mb-4">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <Icons.Upload className="h-12 w-12" />
                    </div>
                  </div>
  
                  <label
                    htmlFor="template-upload-input"
                    className="cursor-pointer inline-flex items-center px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm transition-all"
                  >
                    Choose Excel File
                  </label>
                  
                  {selectedFile ? (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                        <Icons.Check className="h-4 w-4" />
                        {selectedFile.name}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">No file selected</p>
                  )}
                </div>
              </>
            )}
  
            {uploadState === 'uploading' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="text-lg font-medium text-gray-900">Processing File...</p>
                <p className="text-sm text-gray-500 mt-1">Extracting questions and images</p>
              </div>
            )}
  
            {uploadState === 'result' && result && (
              <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${
                (result.status || 'fail').toLowerCase().includes('fail')
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                  <div className="flex items-center gap-3">
                    {result.status.toLowerCase().includes('fail') ? (
                       <Icons.Warning className="h-6 w-6 text-red-600" />
                    ) : (
                       <Icons.CheckCircle className="h-6 w-6 text-emerald-600" />
                    )}
                    <div>
                        <h3 className="font-bold">{result.status}</h3>
                        {result.detail && <p className="text-sm mt-1">{result.detail}</p>}
                    </div>
                  </div>
                </div>
  
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-sm text-emerald-600 font-medium">Successfully Created</p>
                    <p className="text-3xl font-bold text-emerald-700 mt-1">{result.created_count}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <p className="text-sm text-red-600 font-medium">Errors Found</p>
                    <p className="text-3xl font-bold text-red-700 mt-1">{result.error_count}</p>
                  </div>
                </div>
  
                {result.errors && result.errors.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-amber-100 border-b border-amber-200">
                        <h4 className="text-sm font-bold text-amber-900">Error Log</h4>
                    </div>
                    <ul className="p-4 max-h-48 overflow-y-auto space-y-2 text-sm text-amber-800">
                      {result.errors.map((e, idx) => (
                        <li key={idx} className="pb-2 border-b border-amber-200 last:border-0">
                          <span className="font-bold">Row {e.row}:</span> {formatErrorObject(e.errors)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
  
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
             {uploadState === 'result' ? (
                 <>
                    <button 
                        onClick={resetState}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors"
                    >
                        Upload Another
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium text-sm transition-colors"
                    >
                        Done
                    </button>
                 </>
             ) : (
                <>
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploadState === 'uploading'}
                        className="px-6 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploadState === 'uploading' ? 'Uploading...' : 'Upload & Process'}
                    </button>
                </>
             )}
          </div>
        </div>
      </div>,
      document.body
    );
  };

// ================== CONFIRM DIALOG ==================
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 animate-scale-in">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
              confirmVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } disabled:opacity-50`}
          >
            {isLoading && (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ================== PAPER SELECTOR ==================
interface PaperSelectorProps {
  papers: QuestionPaper[];
  selectedPaperId: number | null;
  onSelect: (paper: QuestionPaper) => void;
  onClear: () => void;
  isLoading: boolean;
}

const PaperSelector: React.FC<PaperSelectorProps> = ({
  papers,
  selectedPaperId,
  onSelect,
  onClear,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPaper = papers.find((p) => p.question_paper_id === selectedPaperId);

  const filteredPapers = useMemo(() => {
    if (!searchTerm) return papers;
    return papers.filter(
      (paper) =>
        paper.question_paper_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.question_paper_id.toString().includes(searchTerm)
    );
  }, [searchTerm, papers]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedPaper) {
      setSearchTerm(selectedPaper.question_paper_name);
    }
  }, [selectedPaper]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (selectedPaperId) onClear();
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search question papers..."
          className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-shadow shadow-sm"
        />
        {(searchTerm || selectedPaperId) && (
          <button
            onClick={() => {
              setSearchTerm('');
              onClear();
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Icons.X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && !selectedPaperId && (
        <div className="absolute z-30 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2 text-gray-500">
                <div className="h-5 w-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                Loading papers...
              </div>
            </div>
          ) : filteredPapers.length > 0 ? (
            <ul className="max-h-72 overflow-y-auto">
              {filteredPapers.map((paper) => (
                <li
                  key={paper.question_paper_id}
                  onClick={() => {
                    onSelect(paper);
                    setSearchTerm(paper.question_paper_name);
                    setIsOpen(false);
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-indigo-50 border-b border-gray-100 last:border-0 transition-colors"
                >
                  <p className="font-medium text-gray-900">{paper.question_paper_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">ID: {paper.question_paper_id}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Icons.Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="font-medium">No results found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ================== QUESTION CARD (GRID VIEW) ==================
interface QuestionCardProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  isArchived: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
  isArchived,
}) => {
  const options = [
    { label: 'A', text: question.option_a, textL2: question.option_a_lang2 },
    { label: 'B', text: question.option_b, textL2: question.option_b_lang2 },
    { label: 'C', text: question.option_c, textL2: question.option_c_lang2 },
    { label: 'D', text: question.option_d, textL2: question.option_d_lang2 },
  ];

  const hasL2 = !!(
    question.question_lang2 ||
    question.option_a_lang2 ||
    question.option_b_lang2 ||
    question.option_c_lang2 ||
    question.option_d_lang2
  );

  return (
    <div
      className={`group relative bg-white rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-200'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      } ${isArchived ? 'opacity-75' : ''}`}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Quick Actions */}
      <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
          title="Edit"
        >
          <Icons.Edit className="h-4 w-4" />
        </button>
        <button
          onClick={onDuplicate}
          className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 transition-colors"
          title="Duplicate"
        >
          <Icons.Duplicate className="h-4 w-4" />
        </button>
        {isArchived ? (
          <button
            onClick={onRestore}
            className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
            title="Restore"
          >
            <Icons.Restore className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onArchive}
            className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-colors"
            title="Archive"
          >
            <Icons.Archive className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <Icons.Delete className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 pt-12">
        {/* Question Number & Tags */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center justify-center h-7 w-7 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-lg">
            {index + 1}
          </span>
          {hasL2 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
              <Icons.Language className="h-3 w-3" />
              Bilingual
            </span>
          )}
          {(question.question_image_url ||
            question.option_a_image_url ||
            question.option_b_image_url ||
            question.option_c_image_url ||
            question.option_d_image_url) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              <Icons.Image className="h-3 w-3" />
              Image
            </span>
          )}
        </div>

        {/* --- ADDED: DISPLAY IMAGE IF AVAILABLE --- */}
        {(question.question_image_url ||
          question.option_a_image_url ||
          question.option_b_image_url ||
          question.option_c_image_url ||
          question.option_d_image_url) && (
          <div className="mb-3">
            <img
              src={getImageUrl(
                question.question_image_url ||
                question.option_a_image_url ||
                question.option_b_image_url ||
                question.option_c_image_url ||
                question.option_d_image_url
              )!}
              alt="Question/Option"
              className="max-h-32 rounded-lg border border-gray-200 w-auto object-contain"
            />
          </div>
        )}

        {/* Question Text */}
        <p className="text-gray-900 font-medium text-sm line-clamp-2 mb-3">{question.question}</p>
        {question.question_lang2 && (
          <p className="text-gray-500 text-xs line-clamp-1 mb-3">{question.question_lang2}</p>
        )}

        {/* Options Preview */}
        <div className="space-y-2">
          {options.map((opt, idx) => {
          const isCorrect = question.correct_index != null
            ? question.correct_index === idx
            : question.correct_answer === opt.text;            return (
              <div
                key={idx}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                  isCorrect
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <span
                  className={`font-bold ${isCorrect ? 'text-emerald-600' : 'text-gray-500'}`}
                >
                  {opt.label}
                </span>
                <span className={`truncate flex-1 ${isCorrect ? 'text-emerald-700' : 'text-gray-600'}`}>
                  {opt.text}
                </span>
                {isCorrect && <Icons.CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ================== QUESTION LIST ITEM ==================
interface QuestionListItemProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  isArchived: boolean;
}

const QuestionListItem: React.FC<QuestionListItemProps> = ({
  question,
  index,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
  isArchived,
}) => {
  const hasL2 = !!(
    question.question_lang2 ||
    question.option_a_lang2 ||
    question.option_b_lang2 ||
    question.option_c_lang2 ||
    question.option_d_lang2
  );

  return (
    <div
      className={`group flex items-center gap-4 p-4 bg-white rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-200'
          : 'border-gray-200 hover:border-gray-300'
      } ${isArchived ? 'opacity-75' : ''}`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
      />

      {/* Number */}
      <span className="inline-flex items-center justify-center h-8 w-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-lg flex-shrink-0">
        {index + 1}
      </span>

      {/* Question Info */}
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 font-medium text-sm truncate">{question.question}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            Answer: <span className="font-medium text-emerald-600">{question.correct_answer}</span>
          </span>
          {hasL2 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
              <Icons.Language className="h-3 w-3" />
              L2
            </span>
          )}
          {(question.question_image_url ||
            question.option_a_image_url ||
            question.option_b_image_url ||
            question.option_c_image_url ||
            question.option_d_image_url) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              <Icons.Image className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 hover:bg-indigo-50 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors"
          title="Edit"
        >
          <Icons.Edit className="h-4 w-4" />
        </button>
        <button
          onClick={onDuplicate}
          className="p-2 hover:bg-purple-50 rounded-lg text-gray-500 hover:text-purple-600 transition-colors"
          title="Duplicate"
        >
          <Icons.Duplicate className="h-4 w-4" />
        </button>
        {isArchived ? (
          <button
            onClick={onRestore}
            className="p-2 hover:bg-emerald-50 rounded-lg text-gray-500 hover:text-emerald-600 transition-colors"
            title="Restore"
          >
            <Icons.Restore className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onArchive}
            className="p-2 hover:bg-amber-50 rounded-lg text-gray-500 hover:text-amber-600 transition-colors"
            title="Archive"
          >
            <Icons.Archive className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <Icons.Delete className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ================== SELECTION TOOLBAR ==================
interface SelectionToolbarProps {
  selectedCount: number;
  onDuplicate: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
  isArchiveView: boolean;
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedCount,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
  onClearSelection,
  isArchiveView,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl">
        <span className="text-sm font-medium">
          {selectedCount} selected
        </span>
        <div className="w-px h-6 bg-gray-700" />
        <button
          onClick={onDuplicate}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Icons.Duplicate className="h-4 w-4" />
          Duplicate
        </button>
        {isArchiveView ? (
          <button
            onClick={onRestore}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Icons.Restore className="h-4 w-4" />
            Restore
          </button>
        ) : (
          <button
            onClick={onArchive}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Icons.Archive className="h-4 w-4" />
            Archive
          </button>
        )}
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Icons.Delete className="h-4 w-4" />
          Delete
        </button>
        <div className="w-px h-6 bg-gray-700" />
        <button
          onClick={onClearSelection}
          className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Icons.X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ================== LIVE PREVIEW ==================
interface LivePreviewProps {
  formData: QuestionFormData;
  showLang2: boolean;
  existingQuestionImages?: {
    question?: string | null;
    options?: (string | null)[];
  };
}

const LivePreview: React.FC<LivePreviewProps> = ({ formData, showLang2, existingQuestionImages }) => {
  const options = ['A', 'B', 'C', 'D'];
  const hasContent =
    formData.question.trim() || formData.options.some((opt) => opt.trim());

  return (
    <div className="sticky top-4">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            <Icons.Eye className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="font-semibold text-gray-800 text-sm">Live Preview</span>
        </div>

        <div className="p-4">
          {!hasContent ? (
            <div className="text-center py-12 text-gray-400">
              <Icons.Document className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Start typing to see preview</p>
              <p className="text-sm mt-1">Your question will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Question Preview */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-7 w-7 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-lg flex-shrink-0">
                    Q
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">
                      {formData.question || (
                        <span className="text-gray-400 italic">Question text...</span>
                      )}
                    </p>
                    {showLang2 && formData.questionLang2 && (
                      <p className="text-gray-500 text-sm mt-1">{formData.questionLang2}</p>
                    )}
                  </div>
                </div>
                {formData.questionImage && (
                  <div className="mt-3 ml-10">
                    <img
                      src={URL.createObjectURL(formData.questionImage)}
                      alt="Question"
                      className="max-h-32 rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                {!formData.questionImage && existingQuestionImages?.question && (
                  <div className="mt-3 ml-10">
                    <img
                      src={getImageUrl(existingQuestionImages.question)!} 
                      alt="Question"
                      className="max-h-32 rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Options Preview */}
              <div className="space-y-2">
                {formData.options.map((opt, idx) => {
                  const isCorrect = formData.correctAnswerIndex === idx;
                  const hasText = opt.trim();

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300'
                          : hasText
                          ? 'bg-white border-gray-200'
                          : 'bg-gray-50 border-dashed border-gray-300'
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center h-6 w-6 rounded-full text-sm font-bold flex-shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {options[idx]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`${hasText ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                          {opt || `Option ${options[idx]}...`}
                        </p>
                        {showLang2 && formData.optionsLang2[idx] && (
                          <p className="text-gray-500 text-xs mt-0.5">
                            {formData.optionsLang2[idx]}
                          </p>
                        )}
                        {formData.optionImages[idx] ? (
                          <img
                            src={URL.createObjectURL(formData.optionImages[idx]!)}
                            alt={`Option ${options[idx]}`}
                            className="mt-2 max-h-20 rounded-md border border-gray-200"
                          />
                        ) : existingQuestionImages?.options?.[idx] ? (
                          <img
                            src={getImageUrl(existingQuestionImages.options[idx])!}
                            alt={`Option ${options[idx]}`}
                            className="mt-2 max-h-20 rounded-md border border-gray-200"
                          />
                        ) : null}
                      </div>
                      {isCorrect && (
                        <Icons.CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                {showLang2 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    <Icons.Language className="h-3 w-3" />
                    Bilingual
                  </span>
                )}
                {formData.correctAnswerIndex !== null && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    <Icons.Check className="h-3 w-3" />
                    Answer: {options[formData.correctAnswerIndex]}
                  </span>
                )}
                {formData.correctAnswerIndex === null && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    <Icons.Warning className="h-3 w-3" />
                    No answer selected
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ================== QUESTIONS LIST PANEL ==================
interface QuestionsListPanelProps {
  questions: Question[];
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onEdit: (q: Question) => void;
  onDuplicate: (q: Question) => void;
  onArchive: (ids: number[]) => void;
  onRestore: (ids: number[]) => void;
  onDelete: (ids: number[]) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  tabView: TabView;
  onTabViewChange: (tab: TabView) => void;
  activeCount: number;
  archivedCount: number;
  isLoading: boolean;
  paperSelected: boolean;
}

const QuestionsListPanel: React.FC<QuestionsListPanelProps> = ({
  questions,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onEdit,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
  viewMode,
  onViewModeChange,
  tabView,
  onTabViewChange,
  activeCount,
  archivedCount,
  isLoading,
  paperSelected,
}) => {
  const allSelected = questions.length > 0 && selectedIds.size === questions.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < questions.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <Icons.Document className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Questions</h2>
              <p className="text-sm text-gray-500">
                {tabView === 'active' ? activeCount : archivedCount} questions
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icons.List className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icons.Grid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => onTabViewChange('active')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              tabView === 'active'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => onTabViewChange('archived')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              tabView === 'archived'
                ? 'bg-amber-100 text-amber-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Icons.Archive className="h-4 w-4 inline mr-1" />
            Archived ({archivedCount})
          </button>
        </div>

        {/* Select All */}
        {questions.length > 0 && (
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={() => (allSelected ? onClearSelection() : onSelectAll())}
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">Select all</span>
            </label>
            {selectedIds.size > 0 && (
              <span className="text-sm text-indigo-600 font-medium">
                {selectedIds.size} selected
              </span>
            )}
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {!paperSelected ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <Icons.Search className="h-16 w-16 mb-4 opacity-40" />
            <p className="font-semibold text-lg">No Paper Selected</p>
            <p className="text-sm mt-1">Select a question paper to view questions</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="h-8 w-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <Icons.Document className="h-16 w-16 mb-4 opacity-40" />
            <p className="font-semibold text-lg">
              {tabView === 'active' ? 'No Questions Yet' : 'No Archived Questions'}
            </p>
            <p className="text-sm mt-1">
              {tabView === 'active'
                ? 'Create your first question using the form or Bulk Upload'
                : 'Archived questions will appear here'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={idx}
                isSelected={selectedIds.has(q.id)}
                onSelect={() => onToggleSelect(q.id)}
                onEdit={() => onEdit(q)}
                onDuplicate={() => onDuplicate(q)}
                onArchive={() => onArchive([q.id])}
                onRestore={() => onRestore([q.id])}
                onDelete={() => onDelete([q.id])}
                isArchived={tabView === 'archived'}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <QuestionListItem
                key={q.id}
                question={q}
                index={idx}
                isSelected={selectedIds.has(q.id)}
                onSelect={() => onToggleSelect(q.id)}
                onEdit={() => onEdit(q)}
                onDuplicate={() => onDuplicate(q)}
                onArchive={() => onArchive([q.id])}
                onRestore={() => onRestore([q.id])}
                onDelete={() => onDelete([q.id])}
                isArchived={tabView === 'archived'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ================== QUESTION FORM ==================
interface QuestionFormProps {
    existingQuestion: Question | null;
    onSubmit: (formData: QuestionFormData) => Promise<void>;
    onCancel: () => void;
    disabled: boolean;
    formData: QuestionFormData;
    setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
    showLang2: boolean;
    setShowLang2: React.Dispatch<React.SetStateAction<boolean>>;
    showImages: boolean;
    setShowImages: React.Dispatch<React.SetStateAction<boolean>>;
  }
  
  const QuestionForm: React.FC<QuestionFormProps> = ({
    existingQuestion,
    onSubmit,
    onCancel,
    disabled,
    formData,
    setFormData,
    showLang2,
    setShowLang2,
    showImages,
    setShowImages,
  }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!existingQuestion;
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (disabled || isSubmitting) return;
  
      if (
        !formData.question.trim() ||
        formData.options.some((opt) => !opt.trim()) ||
        formData.correctAnswerIndex === null
      ) {
        return;
      }
  
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const updateOption = (index: number, value: string, isLang2 = false) => {
      if (isLang2) {
        const newOptionsLang2 = [...formData.optionsLang2];
        newOptionsLang2[index] = value;
        setFormData((prev) => ({ ...prev, optionsLang2: newOptionsLang2 }));
      } else {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData((prev) => ({ ...prev, options: newOptions }));
      }
    };
  
    const updateImage = (field: 'questionImage' | number, file: File | null) => {
      if (field === 'questionImage') {
        setFormData((prev) => ({ ...prev, questionImage: file }));
      } else {
        const newOptionImages = [...formData.optionImages];
        newOptionImages[field] = file;
        setFormData((prev) => ({ ...prev, optionImages: newOptionImages }));
      }
    };
  
    const optionLabels = ['A', 'B', 'C', 'D'];
  
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${disabled ? 'opacity-60' : ''}`}>
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isEditing ? 'bg-amber-100' : 'bg-indigo-100'}`}>
                {isEditing ? (
                  <Icons.Edit className="h-5 w-5 text-amber-600" />
                ) : (
                  <Icons.Plus className="h-5 w-5 text-indigo-600" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {disabled ? 'Select a Paper' : isEditing ? 'Edit Question' : 'Add New Question'}
                </h2>
                <p className="text-sm text-gray-500">
                  {disabled
                    ? 'Choose a question paper first'
                    : isEditing
                    ? 'Update the question details'
                    : 'Create a new question'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
                <button
                type="button"
                onClick={() => setShowImages((prev) => !prev)}
                disabled={disabled}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    showImages
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
                >
                <Icons.Image className="h-4 w-4" />
                {showImages ? 'Images Active' : 'Add Images'}
                </button>

                <button
                type="button"
                onClick={() => setShowLang2((prev) => !prev)}
                disabled={disabled}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    showLang2
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
                >
                <Icons.Language className="h-4 w-4" />
                {showLang2 ? 'Language 2 Active' : 'Add Language 2'}
                </button>
            </div>
          </div>
        </div>
  
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Question Input */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Icons.Edit className="h-4 w-4 text-gray-400" />
              Question Text
            </label>
  
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Language 1 (Required)</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
                  disabled={disabled}
                  rows={3}
                  placeholder="Enter your question..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none transition-shadow"
                  required
                />
              </div>
  
              {showLang2 && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Language 2 (Optional)</label>
                  <textarea
                    value={formData.questionLang2}
                    onChange={(e) => setFormData((prev) => ({ ...prev, questionLang2: e.target.value }))}
                    disabled={disabled}
                    rows={2}
                    placeholder="Enter translation..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none transition-shadow"
                  />
                </div>
              )}
  
              {/* Question Image */}
              {showImages && (
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Question Image (Optional)</label>
                    <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                        <Icons.Upload className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                        {formData.questionImage ? formData.questionImage.name : 'Upload image'}
                        </span>
                        <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => updateImage('questionImage', e.target.files?.[0] || null)}
                        className="hidden"
                        disabled={disabled}
                        />
                    </label>
                    {formData.questionImage && (
                        <button
                        type="button"
                        onClick={() => updateImage('questionImage', null)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                        <Icons.X className="h-5 w-5" />
                        </button>
                    )}
                    </div>
                </div>
              )}
            </div>
          </div>
  
          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Icons.CheckCircle className="h-4 w-4 text-gray-400" />
              Answer Options
            </label>
  
            <div className="space-y-3">
              {formData.options.map((option, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.correctAnswerIndex === idx
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Option Label & Radio */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswerIndex === idx}
                        onChange={() => setFormData((prev) => ({ ...prev, correctAnswerIndex: idx }))}
                        disabled={disabled}
                        className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span
                        className={`flex items-center justify-center h-7 w-7 rounded-lg font-bold text-sm ${
                          formData.correctAnswerIndex === idx
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {optionLabels[idx]}
                      </span>
                    </div>
  
                    {/* Option Inputs */}
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        disabled={disabled}
                        placeholder={`Option ${optionLabels[idx]}`}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        required
                      />
  
                      {showLang2 && (
                        <input
                          type="text"
                          value={formData.optionsLang2[idx]}
                          onChange={(e) => updateOption(idx, e.target.value, true)}
                          disabled={disabled}
                          placeholder={`Option ${optionLabels[idx]} (L2)`}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      )}
  
                      {/* Option Image */}
                      {showImages && (
                        <div className="flex items-center gap-2">
                            <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 text-xs text-gray-500">
                            <Icons.Image className="h-4 w-4" />
                            {formData.optionImages[idx]?.name || 'Add image'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => updateImage(idx, e.target.files?.[0] || null)}
                                className="hidden"
                                disabled={disabled}
                            />
                            </label>
                            {formData.optionImages[idx] && (
                            <button
                                type="button"
                                onClick={() => updateImage(idx, null)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            >
                                <Icons.X className="h-4 w-4" />
                            </button>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
  
            {formData.correctAnswerIndex === null && (
              <p className="flex items-center gap-2 text-sm text-amber-600">
                <Icons.Warning className="h-4 w-4" />
                Please select the correct answer
              </p>
            )}
          </div>
  
          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            {isEditing && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={disabled || isSubmitting || formData.correctAnswerIndex === null}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icons.Check className="h-4 w-4" />
                  {isEditing ? 'Update Question' : 'Save Question'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

const sendBulkAction = async (action: string, ids: number[]) => {
  return apiClient.post('/template-questions/bulk-action/', { action, ids });
};




// ================== MAIN COMPONENT ==================
const QuestionManager: React.FC = () => {
  // State
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [tabView, setTabView] = useState<TabView>('active');
  const [isLoading, setIsLoading] = useState({ papers: false, questions: false });
  const [showLang2, setShowLang2] = useState(false);
  const [showImages, setShowImages] = useState(false); // NEW STATE FOR IMAGES
  const [showUploadModal, setShowUploadModal] = useState(false); // NEW STATE FOR MODAL

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
    confirmVariant?: 'danger' | 'primary';
  } | null>(null);

  // Form State
const initialFormState: QuestionFormData = {
  question: '',
  options: ['', '', '', ''],
  questionLang2: '',
  optionsLang2: ['', '', '', ''],
  correctAnswerIndex: null,
  questionImage: null,
  optionImages: [null, null, null, null],
};

  const [formData, setFormData] = useState<QuestionFormData>(initialFormState);

  const { addToast } = useToast();

  // Derived State
const activeQuestions = useMemo(
  () => allQuestions.filter((q) => {
    // Backend might return is_active, frontend uses is_archived
    if ('is_active' in q) {
      return q.is_active !== false; // is_active=true or undefined means active
    }
    return !q.is_archived; // fallback to is_archived check
  }),
  [allQuestions]
);

const archivedQuestions = useMemo(
  () => allQuestions.filter((q) => {
    if ('is_active' in q) {
      return q.is_active === false;
    }
    return q.is_archived === true;
  }),
  [allQuestions]
);


  const displayedQuestions = tabView === 'active' ? activeQuestions : archivedQuestions;

  const selectedPaperObj = questionPapers.find(p => p.question_paper_id === selectedPaperId) || null;

  // Fetch Papers
  useEffect(() => {
    const fetchPapers = async () => {
      setIsLoading((prev) => ({ ...prev, papers: true }));
      try {
        const response = await apiClient.get<QuestionPaper[]>('/questionpapers/');
        setQuestionPapers(response.data);
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Failed to load papers',
          message: 'Could not fetch question papers. Please try again.',
        });
      } finally {
        setIsLoading((prev) => ({ ...prev, papers: false }));
      }
    };
    fetchPapers();
  }, []);

  // Fetch Questions
  const fetchQuestions = useCallback(async () => {
    if (!selectedPaperId) {
      setAllQuestions([]);
      return;
    }

    setIsLoading((prev) => ({ ...prev, questions: true }));
    try {
      const response = await apiClient.get<Question[]>(
        `/template-questions/?question_paper=${selectedPaperId}`
      );
      setAllQuestions(response.data);
      setSelectedIds(new Set());
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to load questions',
        message: 'Could not fetch questions for this paper.',
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, questions: false }));
    }
  }, [selectedPaperId, addToast]);

  // Trigger fetch when paper changes
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Populate form when editing
  useEffect(() => {
    if (editingQuestion) {
      const optionsL1 = [
        editingQuestion.option_a,
        editingQuestion.option_b,
        editingQuestion.option_c,
        editingQuestion.option_d,
      ];
      const correctIndex = optionsL1.findIndex(
        (opt) => opt === editingQuestion.correct_answer
      );

      setFormData({
        question: editingQuestion.question,
        options: optionsL1,
        questionLang2: editingQuestion.question_lang2 || '',
        optionsLang2: [
          editingQuestion.option_a_lang2 || '',
          editingQuestion.option_b_lang2 || '',
          editingQuestion.option_c_lang2 || '',
          editingQuestion.option_d_lang2 || '',
        ],
        correctAnswerIndex: correctIndex !== -1 ? correctIndex : null,
        questionImage: null,
        optionImages: [null, null, null, null],
      });

      const hasL2 = !!(
        editingQuestion.question_lang2 ||
        editingQuestion.option_a_lang2 ||
        editingQuestion.option_b_lang2 ||
        editingQuestion.option_c_lang2 ||
        editingQuestion.option_d_lang2
      );
      setShowLang2(hasL2);

      const hasImages = !!(
        editingQuestion.question_image_url ||
        editingQuestion.option_a_image_url ||
        editingQuestion.option_b_image_url ||
        editingQuestion.option_c_image_url ||
        editingQuestion.option_d_image_url
      );
      setShowImages(hasImages);

    } else {
      setFormData(initialFormState);
      setShowLang2(false);
      setShowImages(false);
    }
  }, [editingQuestion]);

  // Handlers
  const handlePaperSelect = (paper: QuestionPaper) => {
    setSelectedPaperId(paper.question_paper_id);
    setEditingQuestion(null);
    setFormData(initialFormState);
  };

  const handleClearPaper = () => {
    setSelectedPaperId(null);
    setAllQuestions([]);
    setEditingQuestion(null);
    setFormData(initialFormState);
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };



const handleSelectAll = () => {
  setSelectedIds(new Set(displayedQuestions.map((q) => q.id)));
};

const handleClearSelection = () => {
  setSelectedIds(new Set());
};

useEffect(() => {
  setSelectedIds(new Set());
}, [tabView]);

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setTabView(question.is_active === false || question.is_archived ? 'archived' : 'active');
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setFormData(initialFormState);
    setShowLang2(false);
    setShowImages(false);
  };

  const handleFormSubmit = async (data: QuestionFormData) => {
    if (!selectedPaperId) return;

    const formPayload = new FormData();
    formPayload.append('question_paper', String(selectedPaperId));
    formPayload.append('question', data.question);
    formPayload.append('option_a', data.options[0]);
    formPayload.append('option_b', data.options[1]);
    formPayload.append('option_c', data.options[2]);
    formPayload.append('option_d', data.options[3]);
    formPayload.append('question_lang2', showLang2 ? data.questionLang2 : '');
    formPayload.append('option_a_lang2', showLang2 ? data.optionsLang2[0] : '');
    formPayload.append('option_b_lang2', showLang2 ? data.optionsLang2[1] : '');
    formPayload.append('option_c_lang2', showLang2 ? data.optionsLang2[2] : '');
    formPayload.append('option_d_lang2', showLang2 ? data.optionsLang2[3] : '');
    formPayload.append('correct_answer', data.options[data.correctAnswerIndex!]);
    formPayload.append('correct_index', String(data.correctAnswerIndex));

    if (data.questionImage) formPayload.append('question_image', data.questionImage);
    data.optionImages.forEach((img, idx) => {
      if (img) formPayload.append(`option_${['a', 'b', 'c', 'd'][idx]}_image`, img);
    });

    try {
      if (editingQuestion) {
        const response = await apiClient.put<Question>(
          `/template-questions/${editingQuestion.id}/`,
          formPayload
        );
        setAllQuestions((prev) =>
          prev.map((q) => {
            if (q.id !== response.data.id) return q;
          
            // preserve where it was (active stays active, archived stays archived)
            const isActive = (q.is_active ?? (q.is_archived ? false : true)) !== false;
          
            return {
              ...response.data,
              is_active: isActive,
              is_archived: !isActive,
            };
          })
        );
        addToast({
          type: 'success',
          title: 'Question Updated',
          message: 'Your changes have been saved successfully.',
        });
      } else {
        const response = await apiClient.post<Question>('/template-questions/', formPayload);
setAllQuestions((prev) => [
  ...prev,
  { ...response.data, is_active: true, is_archived: false },
]);        addToast({
          type: 'success',
          title: 'Question Created',
          message: 'New question has been added successfully.',
        });
      }
      setEditingQuestion(null);
      setFormData(initialFormState);
      setShowLang2(false);
      setShowImages(false);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to save',
        message: 'Could not save the question. Please try again.',
      });
    }
  };

  const handleDuplicate = async (question: Question) => {
    if (!selectedPaperId) return;

    const formPayload = new FormData();
    formPayload.append('question_paper', String(selectedPaperId));
    formPayload.append('question', `${question.question} (Copy)`);
    formPayload.append('option_a', question.option_a);
    formPayload.append('option_b', question.option_b);
    formPayload.append('option_c', question.option_c);
    formPayload.append('option_d', question.option_d);
    formPayload.append('question_lang2', question.question_lang2 || '');
    formPayload.append('option_a_lang2', question.option_a_lang2 || '');
    formPayload.append('option_b_lang2', question.option_b_lang2 || '');
    formPayload.append('option_c_lang2', question.option_c_lang2 || '');
    formPayload.append('option_d_lang2', question.option_d_lang2 || '');
    formPayload.append('correct_answer', question.correct_answer);

    try {
      const response = await apiClient.post<Question>('/template-questions/', formPayload);
setAllQuestions((prev) => [
  ...prev,
  { ...response.data, is_active: true, is_archived: false },
]);      addToast({
        type: 'success',
        title: 'Question Duplicated',
        message: 'A copy has been created successfully.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Duplication Failed',
        message: 'Could not duplicate the question.',
      });
    }
  };

  const handleBulkDuplicate = async () => {
    const questionsTodup = displayedQuestions.filter((q) => selectedIds.has(q.id));
    for (const q of questionsTodup) {
      await handleDuplicate(q);
    }
    setSelectedIds(new Set());
  };

  // UPDATED ARCHIVE LOGIC FOR BACKEND
const handleArchive = async (ids: number[]) => {
  setConfirmDialog({
    isOpen: true,
    title: 'Archive Questions',
    message: `Are you sure you want to archive ${ids.length} question(s)? They can be restored later.`,
    confirmLabel: 'Archive',
    confirmVariant: 'primary',
    onConfirm: async () => {
      try {
        await sendBulkAction('archive', ids);

        // Update local state - backend sets is_active=false, we track as is_archived=true
        setAllQuestions((prev) =>
        prev.map((q) =>
          ids.includes(q.id) ? { ...q, is_active: false, is_archived: true } : q
        ));
        addToast({
          type: 'success',
          title: 'Questions Archived',
          message: `${ids.length} question(s) moved to archive.`,
          action: {
            label: 'Undo',
            onClick: () => handleRestore(ids),
          },
        });
        setSelectedIds(new Set());
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Archive Failed',
          message: 'Could not archive the questions.',
        });
      }
      setConfirmDialog(null);
    },
  });
};

const handleRestore = async (ids: number[]) => {
  try {
    await sendBulkAction('restore', ids);

    // Update local state - backend sets is_active=true, we track as is_archived=false
    setAllQuestions((prev) =>
prev.map((q) =>
  ids.includes(q.id) ? { ...q, is_active: true, is_archived: false } : q
)    );
    addToast({
      type: 'success',
      title: 'Questions Restored',
      message: `${ids.length} question(s) restored to active.`,
    });
    setSelectedIds(new Set());
  } catch (error) {
    addToast({
      type: 'error',
      title: 'Restore Failed',
      message: 'Could not restore the questions.',
    });
  }
};

const handleDelete = async (ids: number[]) => {
  setConfirmDialog({
    isOpen: true,
    title: 'Delete Questions',
    message: `Are you sure you want to permanently delete ${ids.length} question(s)? This action cannot be undone.`,
    confirmLabel: 'Delete',
    confirmVariant: 'danger',
    onConfirm: async () => {
      try {
        await sendBulkAction('delete', ids);

        setAllQuestions((prev) => prev.filter((q) => !ids.includes(q.id)));
        addToast({
          type: 'success',
          title: 'Questions Deleted',
          message: `${ids.length} question(s) permanently deleted.`,
        });
        setSelectedIds(new Set());
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Delete Failed',
          message: 'Could not delete the questions.',
        });
      }
      setConfirmDialog(null);
    },
  });
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg">
                <Icons.Search className="h-7 w-7 text-white" />
              </div>
              <div className="w-full lg:w-96">
                <PaperSelector
                  papers={questionPapers}
                  selectedPaperId={selectedPaperId}
                  onSelect={handlePaperSelect}
                  onClear={handleClearPaper}
                  isLoading={isLoading.papers}
                />
              </div>
              
              {/* === BULK UPLOAD BUTTON === */}
              {selectedPaperId && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-100 font-medium transition-colors whitespace-nowrap"
                >
                  <Icons.Upload className="h-5 w-5" />
                  Bulk Upload
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
          {/* Left Panel - Questions List */}
          <div className="lg:col-span-5 xl:col-span-4 h-full overflow-hidden">
            <QuestionsListPanel
              questions={displayedQuestions}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDelete={handleDelete}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              tabView={tabView}
              onTabViewChange={setTabView}
              activeCount={activeQuestions.length}
              archivedCount={archivedQuestions.length}
              isLoading={isLoading.questions}
              paperSelected={!!selectedPaperId}
            />
          </div>

          {/* Right Panel - Form & Preview */}
          <div className="lg:col-span-7 xl:col-span-8 h-full overflow-y-auto">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Form */}
              <div>
                <QuestionForm
                  existingQuestion={editingQuestion}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCancelEdit}
                  disabled={!selectedPaperId}
                  formData={formData}
                  setFormData={setFormData}
                  showLang2={showLang2}
                  setShowLang2={setShowLang2}
                  showImages={showImages}
                  setShowImages={setShowImages}
                />
              </div>

              {/* Live Preview */}
              <div className="hidden xl:block">
                <LivePreview
                  formData={formData}
                  showLang2={showLang2}
                  existingQuestionImages={
                    editingQuestion
                      ? {
                          question: editingQuestion.question_image_url,
                          options: [
                            editingQuestion.option_a_image_url,
                            editingQuestion.option_b_image_url,
                            editingQuestion.option_c_image_url,
                            editingQuestion.option_d_image_url,
                          ],
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Toolbar */}
      <SelectionToolbar
        selectedCount={selectedIds.size}
        onDuplicate={handleBulkDuplicate}
        onArchive={() => handleArchive(Array.from(selectedIds))}
        onRestore={() => handleRestore(Array.from(selectedIds))}
        onDelete={() => handleDelete(Array.from(selectedIds))}
        onClearSelection={handleClearSelection}
        isArchiveView={tabView === 'archived'}
      />

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          confirmVariant={confirmDialog.confirmVariant}
        />
      )}

      {/* === BULK UPLOAD MODAL === */}
      <TemplateQuestionBulkUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={() => {
            fetchQuestions(); // Refresh list on success
        }}
        questionPaper={selectedPaperObj}
      />

      {/* Styles */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slide-up {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
        
        /* Custom Scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

// ================== WRAPPER WITH PROVIDER ==================
const QuestionUpload: React.FC = () => {
  return (
    <ToastProvider>
      <QuestionManager />
    </ToastProvider>
  );
};

export default QuestionUpload;