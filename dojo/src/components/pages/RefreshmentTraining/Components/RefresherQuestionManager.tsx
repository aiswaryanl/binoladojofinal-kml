import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Upload, Download, Save, Trash2, CheckCircle, AlertCircle, 
  FileText, Image as ImageIcon, X, Loader2, Edit2, Link as LinkIcon, 
  Search, Archive, RotateCcw, Copy, CheckSquare, Square, 
  LayoutGrid, List, AlignJustify, Eye, Keyboard, ChevronLeft, 
  ChevronRight, Sparkles, BookOpen, Zap
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

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
  correct_answer: string;
  marks: number;
  is_active: boolean;
}

interface Props {
  categoryId: number;
  categoryName: string;
  onClose: () => void;
}

// --- Skeleton Loader Component ---
const SkeletonCard: React.FC = () => (
  <div className="border border-gray-200 rounded-xl p-4 animate-pulse">
    <div className="flex gap-4">
      <div className="w-5 h-5 bg-gray-200 rounded" />
      <div className="flex-1 space-y-3">
        <div className="flex gap-3">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  </div>
);

// --- Live Preview Component ---
const LivePreview: React.FC<{
  form: any;
  previews: { [key: string]: string | null };
}> = ({ form, previews }) => {
  const hasContent = form.question_text || previews.question;
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4 text-gray-400">
        <Eye className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wide">Live Preview</span>
      </div>
      
      {!hasContent ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-300">
          <Sparkles className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-sm font-medium">Start typing to see preview</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 transform transition-all duration-300">
          {/* Question */}
          <div className="mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <span className="bg-purple-600 text-white w-7 h-7 flex items-center justify-center rounded-lg font-bold text-sm flex-shrink-0">
                Q
              </span>
              <div className="flex-1">
                {form.question_text && (
                  <p className="text-gray-800 font-medium leading-relaxed">
                    {form.question_text}
                  </p>
                )}
                {previews.question && (
                  <img 
                    src={previews.question} 
                    alt="Question" 
                    className="mt-3 max-h-32 rounded-lg border border-gray-200 object-contain"
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Options */}
          <div className="space-y-2">
            {['A', 'B', 'C', 'D'].map((opt) => {
              const optKey = `option_${opt.toLowerCase()}`;
              const text = form[optKey];
              const image = previews[optKey];
              const isCorrect = form.correct_answer === opt;
              
              if (!text && !image) return null;
              
              return (
                <div 
                  key={opt}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    isCorrect 
                      ? 'bg-green-50 border-2 border-green-400 shadow-sm' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCorrect ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {opt}
                  </div>
                  {image && (
                    <img src={image} alt={`Option ${opt}`} className="h-8 w-8 object-cover rounded border" />
                  )}
                  <span className={`text-sm ${isCorrect ? 'font-semibold text-green-800' : 'text-gray-700'}`}>
                    {text || '(Image only)'}
                  </span>
                  {isCorrect && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                </div>
              );
            })}
          </div>
          
          {/* Marks Badge */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
              {form.marks} {form.marks === 1 ? 'Mark' : 'Marks'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Empty State Component ---
const EmptyState: React.FC<{
  type: 'no-questions' | 'no-results' | 'archived-empty';
  onAddClick: () => void;
  onUploadClick: () => void;
}> = ({ type, onAddClick, onUploadClick }) => {
  const configs = {
    'no-questions': {
      icon: BookOpen,
      title: 'No questions yet!',
      subtitle: 'Start building your question bank',
      showActions: true,
      gradient: 'from-purple-500 to-pink-500'
    },
    'no-results': {
      icon: Search,
      title: 'No matching questions',
      subtitle: 'Try adjusting your search or filters',
      showActions: false,
      gradient: 'from-gray-400 to-gray-500'
    },
    'archived-empty': {
      icon: Archive,
      title: 'No archived questions',
      subtitle: 'Archived questions will appear here',
      showActions: false,
      gradient: 'from-orange-400 to-amber-500'
    }
  };
  
  const config = configs[type];
  const IconComponent = config.icon;
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-6 shadow-xl animate-bounce-slow`}>
        <IconComponent className="w-12 h-12 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{config.title}</h3>
      <p className="text-gray-500 mb-8">{config.subtitle}</p>
      
      {config.showActions && (
        <div className="flex gap-4">
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add First Question
          </button>
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200"
          >
            <Upload className="w-5 h-5" />
            Import from Excel
          </button>
        </div>
      )}
    </div>
  );
};

// --- Image Input Component ---
const ImageInput: React.FC<{
  label?: string;
  preview: string | null;
  onFileChange: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  currentUrlValue: string;
  compact?: boolean;
}> = ({ label, preview, onFileChange, onUrlChange, currentUrlValue, compact }) => {
  const [mode, setMode] = useState<'file' | 'url'>('file');

  return (
    <div className={`border rounded-xl p-3 transition-all duration-200 ${preview ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-200'}`}>
      {label && <div className="text-xs font-bold text-gray-500 uppercase mb-2">{label}</div>}
      
      {preview ? (
        <div className="relative mb-3 group">
          <img src={preview} alt="Preview" className={`w-full object-contain rounded-lg bg-gray-100 ${compact ? 'h-20' : 'h-32'}`} />
          <button 
            type="button"
            onClick={() => { onFileChange(null); onUrlChange(''); }}
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
            title="Remove Image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className={`w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 transition-all hover:border-purple-300 hover:bg-purple-50 ${compact ? 'h-20' : 'h-28'}`}>
          <ImageIcon className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase">No Image</span>
        </div>
      )}

      <div className="flex bg-gray-100 p-1 rounded-lg mb-2">
        <button 
          type="button"
          onClick={() => setMode('file')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-all ${mode === 'file' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Upload className="w-3 h-3" /> Upload
        </button>
        <button 
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-all ${mode === 'url' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <LinkIcon className="w-3 h-3" /> URL
        </button>
      </div>

      {mode === 'file' ? (
        <input 
          type="file" 
          accept="image/*" 
          className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 file:cursor-pointer file:transition-colors"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        />
      ) : (
        <input 
          type="url" 
          placeholder="https://example.com/image.png"
          className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all"
          value={currentUrlValue}
          onChange={(e) => onUrlChange(e.target.value)}
        />
      )}
    </div>
  );
};

// --- Question Card Component ---
const QuestionCard: React.FC<{
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onPreview: () => void;
  viewMode: 'card' | 'table' | 'compact';
  animationDelay: number;
}> = ({
  question: q,
  index,
  isSelected,
  onSelect,
  onEdit,
  onArchive,
  onRestore,
  onPreview,
  viewMode,
  animationDelay,
}) => {
  // Compact View
  if (viewMode === 'compact') {
    return (
      <div
        className={`flex items-center gap-4 p-3 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 cursor-pointer group animate-fade-in`}
        style={{ animationDelay: `${animationDelay}ms` }}
        onClick={onPreview}
      >
        <button
          onClick={e => {
            e.stopPropagation();
            onSelect();
          }}
          className="text-gray-400 hover:text-purple-600 transition-colors"
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-purple-600" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>
        <span className="text-xs font-bold text-gray-400 w-6">{index + 1}</span>
        <span className="flex-1 text-sm text-gray-700 truncate">
          {q.question_text || '(Image Question)'}
        </span>
        <span
          className={`px-2 py-0.5 text-xs font-bold rounded ${
            q.marks >= 3
              ? 'bg-amber-100 text-amber-700'
              : q.marks >= 2
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {q.marks}M
        </span>
        <span className="bg-green-100 text-green-700 px-2 py-0.5 text-xs font-bold rounded">
          {q.correct_answer}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Table View
  if (viewMode === 'table') {
    return (
      <tr
        className={`hover:bg-gray-50 transition-all duration-200 animate-fade-in ${
          isSelected ? 'bg-purple-50' : ''
        }`}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <td className="p-3">
          <button onClick={onSelect} className="text-gray-400 hover:text-purple-600">
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-purple-600" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
        </td>
        <td className="p-3 text-sm font-medium text-gray-500">{index + 1}</td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            {q.question_image_url && (
              <ImageIcon className="w-4 h-4 text-purple-400" />
            )}
            <span className="text-sm text-gray-800 max-w-md truncate">
              {q.question_text || '(Image)'}
            </span>
          </div>
        </td>
        <td className="p-3">
          <span className="bg-green-100 text-green-700 px-2 py-1 text-xs font-bold rounded-lg">
            {q.correct_answer}
          </span>
        </td>
        <td className="p-3">
          <span
            className={`px-2 py-1 text-xs font-bold rounded-lg ${
              q.marks >= 3
                ? 'bg-amber-100 text-amber-700'
                : q.marks >= 2
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {q.marks} marks
          </span>
        </td>
        <td className="p-3">
          <div className="flex gap-1">
            <button
              onClick={onPreview}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {q.is_active ? (
              <button
                onClick={onArchive}
                className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                title="Archive"
              >
                <Archive className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onRestore}
                className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                title="Restore"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  // Card View
  return (
    <div
      className={`relative border rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group animate-fade-in ${
        isSelected
          ? 'border-purple-400 bg-purple-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-purple-200'
      }`}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={onPreview}
    >
      <div className="flex gap-4">
        <div className="pt-1">
          <button
            onClick={e => {
              e.stopPropagation();
              onSelect();
            }}
            className="text-gray-400 hover:text-purple-600 transition-colors"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-purple-600" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex gap-3 mb-3">
            <span
              className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs flex-shrink-0 ${
                q.marks >= 3
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                  : q.marks >= 2
                  ? 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white'
                  : 'bg-gradient-to-br from-purple-400 to-pink-500 text-white'
              }`}
            >
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              {q.question_text && (
                <p className="font-medium text-gray-800 text-sm leading-relaxed line-clamp-2">
                  {q.question_text}
                </p>
              )}
              {q.question_image_url && (
                <img
                  src={`${API_BASE}${q.question_image_url}`}
                  alt="Q"
                  className="h-16 rounded-lg mt-2 border border-gray-200 object-contain bg-white shadow-sm"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {['A', 'B', 'C', 'D'].map(opt => {
              const txt = (q as any)[`option_${opt.toLowerCase()}`];
              const img = (q as any)[`option_${opt.toLowerCase()}_image_url`];

              if (!txt && !img) return null;

              const isCorrect = q.correct_answer === opt;

              return (
                <div
                  key={opt}
                  className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition-colors ${
                    isCorrect
                      ? 'text-green-700 font-bold bg-green-100 border border-green-200'
                      : 'text-gray-600 bg-gray-50'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCorrect ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {opt}
                  </span>
                  {img && (
                    <img
                      src={`${API_BASE}${img}`}
                      className="h-5 w-5 object-cover rounded border"
                    />
                  )}
                  <span className="truncate">{txt || '(Img)'}</span>
                  {isCorrect && <CheckCircle className="w-3 h-3 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {q.is_active ? (
            <button
              onClick={e => {
                e.stopPropagation();
                onArchive();
              }}
              className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              title="Archive"
            >
              <Archive className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={e => {
                e.stopPropagation();
                onRestore();
              }}
              className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
              title="Restore"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Marks Badge */}
      <div className="absolute top-3 right-3">
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
            q.marks >= 3
              ? 'bg-amber-100 text-amber-700'
              : q.marks >= 2
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {q.marks}M
        </span>
      </div>
    </div>
  );
};

// --- Preview Modal Component ---
const PreviewModal: React.FC<{
  question: Question | null;
  onClose: () => void;
  onEdit: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}> = ({ question, onClose, onEdit, onNext, onPrev, hasNext, hasPrev }) => {
  if (!question) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Question Preview
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <span className="bg-purple-600 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm flex-shrink-0">
                Q
              </span>
              <div className="flex-1">
                {question.question_text && (
                  <p className="text-gray-800 font-medium text-lg leading-relaxed">
                    {question.question_text}
                  </p>
                )}
                {question.question_image_url && (
                  <img
                    src={`${API_BASE}${question.question_image_url}`}
                    alt="Question"
                    className="mt-3 max-h-48 rounded-lg border border-gray-200 object-contain"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map(opt => {
              const text = (question as any)[`option_${opt.toLowerCase()}`];
              const image = (question as any)[`option_${opt.toLowerCase()}_image_url`];
              const isCorrect = question.correct_answer === opt;

              if (!text && !image) return null;

              return (
                <div
                  key={opt}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isCorrect
                      ? 'bg-green-50 border-2 border-green-400'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      isCorrect ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {opt}
                  </div>
                  {image && (
                    <img
                      src={`${API_BASE}${image}`}
                      alt={`Option ${opt}`}
                      className="h-12 w-12 object-cover rounded-lg border"
                    />
                  )}
                  <span
                    className={`flex-1 ${
                      isCorrect ? 'font-semibold text-green-800' : 'text-gray-700'
                    }`}
                  >
                    {text || '(Image only)'}
                  </span>
                  {isCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                </div>
              );
            })}
          </div>

          {/* Marks */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-gray-500 text-sm">Marks</span>
            <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-bold">
              {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          <div className="flex gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Question
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
const RefresherQuestionManager: React.FC<Props> = ({
  categoryId,
  categoryName,
  onClose,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [viewMode, setViewMode] = useState<'card' | 'table' | 'compact'>('card');
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<'preview' | 'edit' | 'add'>(
    'preview'
  );

  const [viewFilter, setViewFilter] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [manualForm, setManualForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    marks: 1,
    is_active: true,
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    question: null,
    option_a: null,
    option_b: null,
    option_c: null,
    option_d: null,
  });

  const [urls, setUrls] = useState<{ [key: string]: string }>({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
  });

  const [previews, setPreviews] = useState<{ [key: string]: string | null }>({});
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewQuestion) setPreviewQuestion(null);
        else if (showRightPanel) {
          setShowRightPanel(false);
          resetForm();
        }
      }
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleAddNewClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewQuestion, showRightPanel]);

  useEffect(() => {
    fetchQuestions();
  }, [categoryId]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/refresher/questions/?category_id=${categoryId}`
      );
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
        setSelectedIds([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (
    action: 'archive' | 'restore' | 'delete' | 'duplicate'
  ) => {
    if (
      action === 'delete' &&
      !confirm(
        `Permanently delete ${selectedIds.length} questions? This cannot be undone.`
      )
    )
      return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/refresher/questions/bulk-action/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedIds }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: data.message });
        fetchQuestions();
        setSelectedIds([]);
      } else {
        setMessage({ type: 'error', text: 'Action failed' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualForm.question_text && !files.question && !previews.question) {
      setMessage({
        type: 'error',
        text: 'Question must have text or an image.',
      });
      return;
    }
    if (
      (!manualForm.option_a && !files.option_a && !previews.option_a) ||
      (!manualForm.option_b && !files.option_b && !previews.option_b)
    ) {
      setMessage({
        type: 'error',
        text: 'Options A and B are required (Text or Image).',
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('category_id', String(categoryId));

    Object.entries(manualForm).forEach(([k, v]) =>
      formData.append(k, String(v))
    );

    formData.append('is_active', manualForm.is_active ? 'true' : 'false');

    if (files.question) formData.append('question_image', files.question);
    if (files.option_a) formData.append('option_a_image', files.option_a);
    if (files.option_b) formData.append('option_b_image', files.option_b);
    if (files.option_c) formData.append('option_c_image', files.option_c);
    if (files.option_d) formData.append('option_d_image', files.option_d);

    if (urls.question) formData.append('question_image_url_input', urls.question);
    if (urls.option_a) formData.append('option_a_image_url_input', urls.option_a);
    if (urls.option_b) formData.append('option_b_image_url_input', urls.option_b);
    if (urls.option_c) formData.append('option_c_image_url_input', urls.option_c);
    if (urls.option_d) formData.append('option_d_image_url_input', urls.option_d);

    try {
      const url = editingId
        ? `${API_BASE}/refresher/questions/${editingId}/`
        : `${API_BASE}/refresher/questions/`;

      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, { method, body: formData });

      if (res.ok) {
        setMessage({
          type: 'success',
          text: editingId ? 'Question updated!' : 'Question added!',
        });
        resetForm();
        setShowRightPanel(false);
        fetchQuestions();
      } else {
        const err = await res.json();
        console.error('Submit Error:', err);
        setMessage({
          type: 'error',
          text: 'Failed to save. ' + JSON.stringify(err),
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async () => {
    if (!excelFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', excelFile);
    formData.append('category_id', String(categoryId));

    try {
      const res = await fetch(`${API_BASE}/refresher/questions/bulk-upload/`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchQuestions();
        setShowUploadModal(false);
        setExcelFile(null);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Upload failed.',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesFilter =
        viewFilter === 'active' ? q.is_active : !q.is_active;
      const matchesSearch = q.question_text
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [questions, viewFilter, searchQuery]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredQuestions.length) setSelectedIds([]);
    else setSelectedIds(filteredQuestions.map(q => q.id));
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id))
      setSelectedIds(prev => prev.filter(pid => pid !== id));
    else setSelectedIds(prev => [...prev, id]);
  };

  const handleImageChange = (key: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [key]: file }));
    setUrls(prev => ({ ...prev, [key]: '' }));
    if (file) {
      setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    } else {
      setPreviews(prev => ({ ...prev, [key]: null }));
    }
  };

  const handleUrlChange = (key: string, url: string) => {
    setUrls(prev => ({ ...prev, [key]: url }));
    setFiles(prev => ({ ...prev, [key]: null }));
    setPreviews(prev => ({ ...prev, [key]: url }));
  };

  const handleEditClick = (q: Question) => {
    setEditingId(q.id);
    setManualForm({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_answer: q.correct_answer,
      marks: q.marks,
      is_active: q.is_active,
    });

    const getPreview = (path?: string) => (path ? `${API_BASE}${path}` : null);
    setPreviews({
      question: getPreview(q.question_image_url),
      option_a: getPreview(q.option_a_image_url),
      option_b: getPreview(q.option_b_image_url),
      option_c: getPreview(q.option_c_image_url),
      option_d: getPreview(q.option_d_image_url),
    });

    setFiles({
      question: null,
      option_a: null,
      option_b: null,
      option_c: null,
      option_d: null,
    });
    setUrls({
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
    });

    setRightPanelMode('edit');
    setShowRightPanel(true);
    setPreviewQuestion(null);
  };

  const handleAddNewClick = () => {
    resetForm();
    setRightPanelMode('add');
    setShowRightPanel(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setManualForm({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      marks: 1,
      is_active: true,
    });
    setFiles({
      question: null,
      option_a: null,
      option_b: null,
      option_c: null,
      option_d: null,
    });
    setUrls({
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
    });
    setPreviews({});
  };

  const handlePreviewClick = (q: Question) => {
    setPreviewQuestion(q);
  };

  const handlePreviewNav = (direction: 'next' | 'prev') => {
    if (!previewQuestion) return;
    const currentIndex = filteredQuestions.findIndex(
      q => q.id === previewQuestion.id
    );
    const newIndex =
      direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < filteredQuestions.length) {
      setPreviewQuestion(filteredQuestions[newIndex]);
    }
  };

  const activeCount = questions.filter(q => q.is_active).length;
  const archivedCount = questions.filter(q => !q.is_active).length;

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col h-[90vh] max-h-[900px]">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 p-5 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-purple-200 text-sm mb-1">
              <span>Question Bank</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">{categoryName}</span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              Manage Questions
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <span className="text-white/80 text-sm">Active:</span>
              <span className="bg-green-400 text-green-900 px-2 py-0.5 rounded-full text-xs font-bold">
                {activeCount}
              </span>
              <span className="text-white/50">|</span>
              <span className="text-white/80 text-sm">Archived:</span>
              <span className="bg-orange-400 text-orange-900 px-2 py-0.5 rounded-full text-xs font-bold">
                {archivedCount}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2 text-purple-200 text-xs">
            <Keyboard className="w-4 h-4" />
            <span>Press</span>
            <kbd className="bg-white/20 px-2 py-0.5 rounded text-white font-mono">
              Ctrl+N
            </kbd>
            <span>to add new question</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-4 bg-gray-50 flex-shrink-0">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm bg-white shadow-sm"
          />
        </div>

        <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setViewFilter('active')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              viewFilter === 'active'
                ? 'bg-green-100 text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Zap className="w-3 h-3" />
            Active
            <span className="bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full text-[10px]">
              {activeCount}
            </span>
          </button>
          <button
            onClick={() => setViewFilter('archived')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              viewFilter === 'archived'
                ? 'bg-orange-100 text-orange-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Archive className="w-3 h-3" />
            Archived
            <span className="bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full text-[10px]">
              {archivedCount}
            </span>
          </button>
        </div>

        <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'card'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('compact')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'compact'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Compact View"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={handleAddNewClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </div>

      {/* MESSAGE TOAST */}
      {message && (
        <div
          className={`mx-6 mt-4 p-4 rounded-xl flex items-center gap-3 text-sm animate-slide-down ${
            message.type === 'success'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200'
              : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <div className="bg-green-100 p-1 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          ) : (
            <div className="bg-red-100 p-1 rounded-full">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
          )}
          <span className="font-medium">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN SPLIT */}
      <div className="flex-1 flex overflow-hidden">
        <div
          className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${
            showRightPanel ? 'w-1/2' : 'w-full'
          }`}
        >
          {loading && questions.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <EmptyState
              type={
                questions.length === 0
                  ? 'no-questions'
                  : viewFilter === 'archived'
                  ? 'archived-empty'
                  : 'no-results'
              }
              onAddClick={handleAddNewClick}
              onUploadClick={() => setShowUploadModal(true)}
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors"
                >
                  {selectedIds.length > 0 &&
                  selectedIds.length === filteredQuestions.length ? (
                    <CheckSquare className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {selectedIds.length > 0
                      ? `${selectedIds.length} selected`
                      : 'Select all'}
                  </span>
                </button>
                <span className="text-xs text-gray-400">
                  Showing {filteredQuestions.length} of {questions.length} questions
                </span>
              </div>

              {viewMode === 'table' ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="p-3 text-left w-10"></th>
                        <th className="p-3 text-left text-xs font-bold text-gray-500 uppercase">
                          #
                        </th>
                        <th className="p-3 text-left text-xs font-bold text-gray-500 uppercase">
                          Question
                        </th>
                        <th className="p-3 text-left text-xs font-bold text-gray-500 uppercase">
                          Answer
                        </th>
                        <th className="p-3 text-left text-xs font-bold text-gray-500 uppercase">
                          Marks
                        </th>
                        <th className="p-3 text-left text-xs font-bold text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredQuestions.map((q, i) => (
                        <QuestionCard
                          key={q.id}
                          question={q}
                          index={i}
                          isSelected={selectedIds.includes(q.id)}
                          onSelect={() => handleSelectOne(q.id)}
                          onEdit={() => handleEditClick(q)}
                          onArchive={() => {
                            setSelectedIds([q.id]);
                            handleBulkAction('archive');
                          }}
                          onRestore={() => {
                            setSelectedIds([q.id]);
                            handleBulkAction('restore');
                          }}
                          onPreview={() => handlePreviewClick(q)}
                          viewMode={viewMode}
                          animationDelay={i * 50}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : viewMode === 'compact' ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm divide-y divide-gray-100">
                  {filteredQuestions.map((q, i) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      index={i}
                      isSelected={selectedIds.includes(q.id)}
                      onSelect={() => handleSelectOne(q.id)}
                      onEdit={() => handleEditClick(q)}
                      onArchive={() => {
                        setSelectedIds([q.id]);
                        handleBulkAction('archive');
                      }}
                      onRestore={() => {
                        setSelectedIds([q.id]);
                        handleBulkAction('restore');
                      }}
                      onPreview={() => handlePreviewClick(q)}
                      viewMode={viewMode}
                      animationDelay={i * 30}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredQuestions.map((q, i) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      index={i}
                      isSelected={selectedIds.includes(q.id)}
                      onSelect={() => handleSelectOne(q.id)}
                      onEdit={() => handleEditClick(q)}
                      onArchive={() => {
                        setSelectedIds([q.id]);
                        handleBulkAction('archive');
                      }}
                      onRestore={() => {
                        setSelectedIds([q.id]);
                        handleBulkAction('restore');
                      }}
                      onPreview={() => handlePreviewClick(q)}
                      viewMode={viewMode}
                      animationDelay={i * 50}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Panel */}
        {showRightPanel && (
          <div className="w-1/2 border-l border-gray-200 bg-gray-50 overflow-y-auto animate-slide-in-right">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  {editingId ? (
                    <>
                      <Edit2 className="w-5 h-5 text-blue-500" />
                      Edit Question
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-purple-500" />
                      Add New Question
                    </>
                  )}
                </h3>
                <button
                  onClick={() => {
                    setShowRightPanel(false);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                <form onSubmit={handleManualSubmit} className="space-y-5">
                  {/* Question */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Question
                    </label>
                    <textarea
                      value={manualForm.question_text}
                      onChange={e =>
                        setManualForm({
                          ...manualForm,
                          question_text: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm resize-none"
                      rows={3}
                      placeholder="Type your question here..."
                    />
                    <div className="mt-3">
                      <ImageInput
                        compact
                        preview={previews.question || null}
                        onFileChange={f => handleImageChange('question', f)}
                        onUrlChange={u => handleUrlChange('question', u)}
                        currentUrlValue={urls.question}
                      />
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {['a', 'b', 'c', 'd'].map(opt => (
                      <div
                        key={opt}
                        className={`bg-white rounded-xl p-4 border-2 transition-all ${
                          manualForm.correct_answer.toLowerCase() === opt
                            ? 'border-green-400 shadow-sm shadow-green-100'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <label className="font-bold text-gray-700 uppercase text-sm flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                manualForm.correct_answer.toLowerCase() === opt
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {opt.toUpperCase()}
                            </span>
                            Option {opt.toUpperCase()}
                          </label>
                          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                            <input
                              type="radio"
                              name="correct"
                              checked={
                                manualForm.correct_answer.toLowerCase() === opt
                              }
                              onChange={() =>
                                setManualForm({
                                  ...manualForm,
                                  correct_answer: opt.toUpperCase(),
                                })
                              }
                              className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                            />
                            Correct
                          </label>
                        </div>

                        <input
                          type="text"
                          value={(manualForm as any)[`option_${opt}`]}
                          onChange={e =>
                            setManualForm({
                              ...manualForm,
                              [`option_${opt}`]: e.target.value,
                            })
                          }
                          className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
                          placeholder={`Option ${opt.toUpperCase()} text...`}
                        />

                        <div className="mt-3">
                          <ImageInput
                            compact
                            preview={previews[`option_${opt}`] || null}
                            onFileChange={f =>
                              handleImageChange(`option_${opt}`, f)
                            }
                            onUrlChange={u =>
                              handleUrlChange(`option_${opt}`, u)
                            }
                            currentUrlValue={(urls as any)[`option_${opt}`]}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Marks */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Marks
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() =>
                            setManualForm({ ...manualForm, marks: m })
                          }
                          className={`w-10 h-10 rounded-lg font-bold transition-all ${
                            manualForm.marks === m
                              ? 'bg-purple-600 text-white shadow-lg scale-110'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRightPanel(false);
                        resetForm();
                      }}
                      className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {editingId ? 'Update' : 'Save'}
                    </button>
                  </div>
                </form>

                {/* Live Preview Section */}
                <div className="hidden lg:block sticky top-0 h-fit">
                  <LivePreview form={manualForm} previews={previews} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-slide-up z-20">
          <div className="font-bold text-sm flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-purple-400" />
            {selectedIds.length} selected
          </div>
          <div className="w-px h-8 bg-gray-700" />
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('duplicate')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors"
            >
              <Copy className="w-4 h-4" /> Duplicate
            </button>

            {viewFilter === 'active' ? (
              <button
                onClick={() => handleBulkAction('archive')}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-50 rounded-lg text-xs font-bold transition-colors"
              >
                <Archive className="w-4 h-4" /> Archive
              </button>
            ) : (
              <button
                onClick={() => handleBulkAction('restore')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-50 rounded-lg text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Restore
              </button>
            )}

            <button
              onClick={() => handleBulkAction('delete')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
          <button
            onClick={() => setSelectedIds([])}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PREVIEW MODAL */}
      <PreviewModal
        question={previewQuestion}
        onClose={() => setPreviewQuestion(null)}
        onEdit={() => {
          if (previewQuestion) handleEditClick(previewQuestion);
        }}
        onNext={() => handlePreviewNav('next')}
        onPrev={() => handlePreviewNav('prev')}
        hasNext={
          previewQuestion
            ? filteredQuestions.findIndex(q => q.id === previewQuestion.id) <
              filteredQuestions.length - 1
            : false
        }
        hasPrev={
          previewQuestion
            ? filteredQuestions.findIndex(q => q.id === previewQuestion.id) > 0
            : false
        }
      />

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import Questions from Excel
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 text-center">
                <a
                  href={`${API_BASE}/refresher/questions/template/`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 transition-colors"
                >
                  <Download className="w-5 h-5" /> Download Template
                </a>
                <p className="text-gray-500 text-sm mt-2">
                  Download and fill the template first
                </p>
              </div>

              {/* FIXED: added 'relative' so file input only covers dropzone */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer hover:bg-gray-50 ${
                  excelFile ? 'border-green-400 bg-green-50' : 'border-gray-300'
                }`}
              >
                <input
                  type="file"
                  accept=".csv, .xlsx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={e =>
                    setExcelFile(e.target.files?.[0] || null)
                  }
                />
                {excelFile ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-gray-700">
                      {excelFile.name}
                    </h4>
                    <p className="text-gray-500 text-sm">Ready to upload</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-gray-700">
                      Drop file here or click to browse
                    </h4>
                    <p className="text-gray-500 text-sm">
                      .xlsx or .csv files supported
                    </p>
                  </>
                )}
              </div>

              {excelFile && (
                <button
                  onClick={handleExcelUpload}
                  disabled={loading}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  Upload & Import
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS ANIMATIONS */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; opacity: 0; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        .animate-slide-down { animation: slide-down 0.3s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default RefresherQuestionManager;