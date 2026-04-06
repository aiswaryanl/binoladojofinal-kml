import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  Loader2, UploadCloud, File, X, ClipboardList, Type,
  Eye, Edit, Trash2, Plus, Search, RefreshCw,
  Building2, Factory, Gauge, MapPin, Trophy,
  Calendar, Clock, FileText, Sparkles, FileQuestion
} from 'lucide-react';

// === IMPORT YOUR COMPONENT ===
import QuestionUpload from './questionupload';

// ==================================================================================
// INTERFACES
// ==================================================================================
interface Station {
  station_id: number;
  station_name: string;
}

interface Subline {
  subline_id: number;
  subline_name: string;
  stations: Station[];
}

interface Line {
  line_id: number;
  line_name: string;
  sublines: Subline[];
  stations: Station[];
}

interface Department {
  department_id: number;
  department_name: string;
  lines: Line[];
  stations: Station[];
}

interface FactoryStructure {
  factory_id: number;
  factory_name: string;
  hq: number;
  departments: Department[];
}

interface ApiStation {
  id: number;
  station_name: string;
}

interface ApiSubline {
  id: number;
  subline_name: string;
  stations: ApiStation[];
}

interface ApiLine {
  id: number;
  line_name: string;
  sublines: ApiSubline[];
  stations: ApiStation[];
}

interface ApiDepartment {
  id: number;
  department_name: string;
  lines: ApiLine[];
  stations: ApiStation[];
}

interface ApiStructureData {
  hq_name: string;
  factory_name: string;
  departments: ApiDepartment[];
}

interface ApiHierarchyResponseItem {
  structure_id: number;
  structure_name: string;
  hq: number;
  hq_name: string;
  factory: number;
  factory_name: string;
  structure_data: ApiStructureData;
}

interface SelectOption { id: number | string | null; name: string; }

interface QuestionPaperFormData {
  question_paper_name: string;
  department: string;
  line: string;
  subline: string;
  station: string;
  level: string;
  file: File | null;
  is_timer_enabled: boolean;
  question_duration: string;
}

interface QuestionPaper {
  question_paper_id: number;
  question_paper_name: string;
  department: SelectOption;
  line: SelectOption;
  subline: SelectOption;
  station: SelectOption;
  level: SelectOption;
  file: string | null;
  created_at: string;
  updated_at: string;
  rawDepartmentId: number | string | null;
  rawLineId: number | string | null;
  rawSublineId: number | string | null;
  rawStationId: number | string | null;
  is_timer_enabled?: boolean;
  question_duration?: number;
}

interface RawQuestionPaper {
  question_paper_id: number;
  question_paper_name: string;
  department: SelectOption | null;
  line: SelectOption | null;
  subline: SelectOption | null;
  station: SelectOption | null;
  level: SelectOption;
  file: string | null;
  created_at: string;
  updated_at: string;
  is_timer_enabled?: boolean;
  question_duration?: number;
}

// ==================================================================================
// API SERVICE
// ==================================================================================
const API_BASE_URL = 'http://192.168.2.51:8000/';

const apiService = {
  async apiCall(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('accessToken');
    const headers = new Headers({ 'Content-Type': 'application/json', ...options.headers });
    if (token) headers.append('Authorization', `Bearer ${token}`);

    const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      const errorMessage = Object.values(errorData).flat().join(' ') || `API Error: ${res.status}`;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    if (res.status === 204) return null;
    return res.json();
  },

  async formCall(endpoint: string, method: 'POST' | 'PUT', formData: FormData) {
    const token = localStorage.getItem('accessToken');
    const headers = new Headers();
    if (token) headers.append('Authorization', `Bearer ${token}`);

    const res = await fetch(`${API_BASE_URL}${endpoint}`, { method, body: formData, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      const errorMessage = Object.values(errorData).flat().join(' ') || `API Error: ${res.status}`;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  fetchHierarchy: () => apiService.apiCall('hierarchy-simple/'),
  fetchLevels: () => apiService.apiCall('levels/'),
  fetchQuestionPapers: () => apiService.apiCall('questionpapers/'),
  createQuestionPaper: (form: FormData) => apiService.formCall('questionpapers/', 'POST', form),
  updateQuestionPaper: (id: number, form: FormData) => apiService.formCall(`questionpapers/${id}/`, 'PUT', form),
  deleteQuestionPaper: (id: number) => apiService.apiCall(`questionpapers/${id}/`, { method: 'DELETE' }),
};

// ==================================================================================
// UI HELPERS
// ==================================================================================
const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return <Loader2 className={`animate-spin text-indigo-600 ${sizeClasses[size]}`} />;
};

const TextInputWithIcon = ({
  id, name, placeholder, value, onChange, icon: Icon, disabled = false,
}: {
  id: string; name: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ElementType;
  disabled?: boolean;
}) => (
  <div className="group">
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
      {name.replace(/_/g, ' ')}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
      </div>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-3 pl-10 border-2 rounded-lg shadow-sm transition-all duration-200 
          ${disabled 
            ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
            : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 hover:border-gray-300'
          }
        `}
        placeholder={placeholder}
      />
    </div>
  </div>
);

const CustomSelectInput = ({
  name, label, value, options, onChange, loading, icon: Icon, disabled = false,
}: {
  name: string; label: string; value: string; options: SelectOption[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  loading: boolean; icon?: React.ElementType; disabled?: boolean;
}) => (
  <div className="group">
    <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-10">
          <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
        </div>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={loading || disabled}
        className={`w-full p-3 ${Icon ? 'pl-10' : ''} border-2 rounded-lg shadow-sm transition-all duration-200 appearance-none cursor-pointer
          ${loading || disabled 
            ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' 
            : 'bg-white border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
          }`}
      >
        <option value="" disabled>{`Select a ${label}`}</option>
        {options.map((option) => (
          <option key={`opt-${name}-${option.id}`} value={String(option.id)}>
            {option.name}
          </option>
        ))}
      </select>
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  </div>
);

const QuestionPaperCard = ({ 
  paper, 
  onEdit, 
  onDelete, 
}: { 
  paper: QuestionPaper; 
  onEdit: (p: QuestionPaper) => void; 
  onDelete: (id: number) => void; 
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden group">
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 truncate flex-1 group-hover:text-indigo-600 transition-colors">
          {paper.question_paper_name}
        </h3>
        <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(paper)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 hover:scale-110"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(paper.question_paper_id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
            {paper.is_timer_enabled !== false ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Clock className="w-3 h-3 mr-1" />
                    {paper.question_duration || 30}s / question
                </span>
            ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Timer Disabled
                </span>
            )}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <span className="font-medium">{paper.department?.name || 'N/A'}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="p-1.5 bg-purple-50 rounded-lg">
            <Factory className="h-4 w-4 text-purple-600" />
          </div>
          <span className="font-medium">
            {paper.line?.name || 'N/A'}
            {(paper.subline?.id !== null && paper.line?.id !== null) && ` / ${paper.subline?.name}`}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="p-1.5 bg-green-50 rounded-lg">
            <MapPin className="h-4 w-4 text-green-600" />
          </div>
          <span className="font-medium">{paper.station?.name || 'N/A'}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="p-1.5 bg-amber-50 rounded-lg">
            <Trophy className="h-4 w-4 text-amber-600" />
          </div>
          <span className="font-medium">{paper.level?.name || 'N/A'}</span>
        </div>

        {paper.file && (
          <div className="flex items-center gap-3 text-sm">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <FileText className="h-4 w-4 text-indigo-600" />
            </div>
            <a
              href={API_BASE_URL + paper.file}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline truncate"
            >
              View attached file
            </a>
          </div>
        )}
      </div>

      <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
        <Calendar className="h-3.5 w-3.5" />
        <span>Created: {new Date(paper.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  </div>
);

// ==================================================================================
// HOOKS
// ==================================================================================
const useFormOptions = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [levels, setLevels] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndProcess = async () => {
      try {
        const [apiData, levelData] = await Promise.all([
          apiService.fetchHierarchy(),
          apiService.fetchLevels(),
        ]);

        const factoriesMap = new Map<number, FactoryStructure>();
        apiData.forEach((item: ApiHierarchyResponseItem) => {
          if (!item.factory || !item.factory_name) return;

          let factory = factoriesMap.get(item.factory);
          if (!factory) {
            factory = {
              factory_id: item.factory,
              factory_name: item.factory_name,
              hq: item.hq,
              departments: [],
            };
            factoriesMap.set(item.factory, factory);
          }

          item.structure_data?.departments?.forEach((deptData: ApiDepartment) => {
            if (!deptData.id || !deptData.department_name) return;

            let department = factory.departments.find(d => d.department_id === deptData.id);
            if (!department) {
              department = {
                department_id: deptData.id,
                department_name: deptData.department_name,
                lines: [],
                stations: [],
              };
              factory.departments.push(department);
            }

            deptData.stations?.forEach((stationData: ApiStation) => {
              if (!department.stations.some(s => s.station_id === stationData.id)) {
                department.stations.push({ station_id: stationData.id, station_name: stationData.station_name });
              }
            });

            deptData.lines?.forEach((lineData: ApiLine) => {
              if (!lineData.id || !lineData.line_name) return;
              
              let line = department.lines.find(l => l.line_id === lineData.id);
              if (!line) {
                line = { line_id: lineData.id, line_name: lineData.line_name, sublines: [], stations: [] };
                department.lines.push(line);
              }
              
              lineData.stations?.forEach((stationData: ApiStation) => {
                if (!line.stations.some(s => s.station_id === stationData.id)) {
                  line.stations.push({ station_id: stationData.id, station_name: stationData.station_name });
                }
              });

              lineData.sublines?.forEach((sublineData: ApiSubline) => {
                if (!sublineData.id || !sublineData.subline_name) return;
                let subline = line.sublines.find(sl => sl.subline_id === sublineData.id);
                if (!subline) {
                  subline = { subline_id: sublineData.id, subline_name: sublineData.subline_name, stations: [] };
                  line.sublines.push(subline);
                }

                sublineData.stations?.forEach((stationData: ApiStation) => {
                  if (!subline.stations.some(s => s.station_id === stationData.id)) {
                    subline.stations.push({ station_id: stationData.id, station_name: stationData.station_name });
                  }
                });
              });
            });
          });
        });

        const nestedStructures = Array.from(factoriesMap.values());
        const allDepartments = nestedStructures.flatMap(f => f.departments);
        setDepartments(allDepartments);

        setLevels((levelData || []).map((lv: any) => ({ id: lv.level_id, name: lv.level_name })));

      } catch (e) {
        setError('Failed to load dropdown options.');
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcess();
  }, []);

  return { departments, levels, loading, error };
};


const useQuestionPapers = (departments: Department[], levels: SelectOption[], optionsLoading: boolean) => {
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [rawPapers, setRawPapers] = useState<RawQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const data = await apiService.fetchQuestionPapers();
      const results: RawQuestionPaper[] = Array.isArray(data) ? data : data?.results || [];
      setRawPapers(results);
    } catch (e) {
      setError('Failed to load question papers.');
      setLoading(false);
    }
  };

  const deletePaper = async (id: number) => {
    try {
      await apiService.deleteQuestionPaper(id);
      await fetchPapers();
      toast.success('Question paper deleted successfully');
    } catch (e) {
      /* error handled in apiService */
    }
  };

  useEffect(() => {
    if (rawPapers.length === 0 && loading) {
        return; 
    }
    
    const hydratedPapers = rawPapers.map((rawPaper): QuestionPaper => {
      return {
        ...rawPaper,
        department: rawPaper.department || { id: null, name: 'All Departments' },
        line: rawPaper.line || { id: null, name: 'All Lines' },
        subline: rawPaper.subline || { id: null, name: 'All Sublines' },
        station: rawPaper.station || { id: null, name: 'All Stations' },
        level: rawPaper.level || { id: null, name: 'N/A' },
        
        rawDepartmentId: rawPaper.department?.id ?? null,
        rawLineId: rawPaper.line?.id ?? null,
        rawSublineId: rawPaper.subline?.id ?? null,
        rawStationId: rawPaper.station?.id ?? null,
        
        is_timer_enabled: rawPaper.is_timer_enabled,
        question_duration: rawPaper.question_duration,
      };
    });

    setPapers(hydratedPapers);
    setLoading(false);
  }, [rawPapers]);

  useEffect(() => {
    fetchPapers();
  }, []);

  return { papers, loading, error, refetch: fetchPapers, deletePaper };
};

// ==================================================================================
// MAIN COMPONENT
// ==================================================================================
const ALL_OPTION_ID = '0'; // Special ID for "All" selections

const QuestionPaperManager: React.FC = () => {
  const { departments, levels, loading: optionsLoading, error: optionsError } = useFormOptions();
  const { papers, loading: papersLoading, refetch, deletePaper } = useQuestionPapers(departments, levels, optionsLoading);

  // === TABS STATE ===
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'upload'>('create');
  
  const [editingPaper, setEditingPaper] = useState<QuestionPaper | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const initialFormData: QuestionPaperFormData = {
    question_paper_name: '',
    department: '',
    line: '',
    subline: '',
    station: '',
    level: '',
    file: null,
    is_timer_enabled: true,
    question_duration: '30',
  };
  const [formData, setFormData] = useState<QuestionPaperFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (optionsError) toast.error(optionsError);
  }, [optionsError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'question_paper_name') {
        setFormData(prev => ({ ...prev, [name]: value }));
        return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'department') {
      setFormData(prev => ({ ...prev, line: '', subline: '', station: '' }));
    } else if (name === 'line') {
      setFormData(prev => ({ ...prev, subline: '', station: '' }));
    } else if (name === 'subline') {
      setFormData(prev => ({ ...prev, station: '' }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingPaper(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // === LEVEL 1 CONSTRAINT ===
    const selectedLevelObj = levels.find(l => String(l.id) === formData.level);
    
    if (selectedLevelObj && selectedLevelObj.name.toLowerCase().includes('level 1')) {
      const duplicateLevel1 = papers.find(p => 
        String(p.level?.id) === formData.level && 
        (!editingPaper || p.question_paper_id !== editingPaper.question_paper_id)
      );

      if (duplicateLevel1) {
        toast.error("A 'Level 1' Question Paper already exists. You can only have one Level 1 paper.");
        return;
      }
    }

    const paperName = formData.question_paper_name.trim();

    if (!paperName) {
        toast.error("Question paper name is required.");
        return;
    }

    setIsSubmitting(true);
    const form = new FormData();
    
    const departmentValue = formData.department === ALL_OPTION_ID ? '' : formData.department;
    const lineValue = formData.line === ALL_OPTION_ID ? '' : formData.line;
    const sublineValue = formData.subline === ALL_OPTION_ID ? '' : formData.subline;
    const stationValue = formData.station === ALL_OPTION_ID ? '' : formData.station;
    
    form.append('question_paper_name', paperName);
    form.append('level_id', formData.level);
    form.append('department_id', departmentValue);
    form.append('line_id', lineValue);
    form.append('subline_id', sublineValue);
    form.append('station_id', stationValue);
    
    // === APPEND TIMER FIELDS ===
    form.append('is_timer_enabled', formData.is_timer_enabled ? 'True' : 'False');
    form.append('question_duration', formData.question_duration);

    if (formData.file) form.append('file', formData.file);

    try {
      if (editingPaper) {
        if (!formData.file) form.delete('file');
        await apiService.updateQuestionPaper(editingPaper.question_paper_id, form);
        toast.success('Question paper updated successfully!');
      } else {
        await apiService.createQuestionPaper(form);
        toast.success('Question paper created successfully!');
      }
      resetForm();
      await refetch();
      setActiveTab('list');
    } catch (err) {
      // toasts already shown via apiService
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (paper: QuestionPaper) => {
    setFormData({
      question_paper_name: paper.question_paper_name,
      department: paper.rawDepartmentId === null ? ALL_OPTION_ID : String(paper.rawDepartmentId || ''), 
      line: paper.rawLineId === null ? ALL_OPTION_ID : String(paper.rawLineId || ''),
      subline: paper.rawSublineId === null ? ALL_OPTION_ID : String(paper.rawSublineId || ''),
      station: paper.rawStationId === null ? ALL_OPTION_ID : String(paper.rawStationId || ''),
      level: String(paper.level?.id || ''),
      file: null,
      // === MAP TIMER FIELDS ===
      is_timer_enabled: paper.is_timer_enabled ?? true,
      question_duration: String(paper.question_duration ?? '30'),
    });
    setEditingPaper(paper);
    setActiveTab('create');
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this question paper?')) {
      deletePaper(id);
    }
  };

  const filteredPapers = papers.filter((p: QuestionPaper) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      p.question_paper_name.toLowerCase().includes(q) ||
      p.department?.name.toLowerCase().includes(q);
      
    const matchesDept = !filterDepartment || 
                        String(p.department?.id) === filterDepartment || 
                        (filterDepartment === ALL_OPTION_ID && p.department?.id === null);

    return matchesSearch && matchesDept;
  });

  const isListLoading = papersLoading || optionsLoading;

  // Compute dynamic options for cascading dropdowns
  // const deptOptions: SelectOption[] = [
  //   { id: ALL_OPTION_ID, name: 'All Departments' },
  //   ...departments.map(d => ({ id: d.department_id, name: d.department_name }))
  // ];

  // const selectedDeptId = formData.department && formData.department !== ALL_OPTION_ID ? parseInt(formData.department) : null;
  // const selectedDept = departments.find(d => d.department_id === selectedDeptId);

  // const lineOptions: SelectOption[] = selectedDept 
  //   ? [
  //       ...(selectedDept.lines.length > 0 || selectedDept.stations.length > 0 ? [{ id: ALL_OPTION_ID, name: 'All Lines' }] : []),
  //       ...selectedDept.lines.map(l => ({ id: l.line_id, name: l.line_name }))
  //     ]
  //   : [];

  // const selectedLineId = formData.line && formData.line !== ALL_OPTION_ID ? parseInt(formData.line) : null;
  // const selectedLine = selectedDept?.lines.find(l => l.line_id === selectedLineId);

  // const sublineOptions: SelectOption[] = selectedLine
  //   ? [
  //       ...(selectedLine.sublines.length > 0 || selectedLine.stations.length > 0 ? [{ id: ALL_OPTION_ID, name: 'All Sublines' }] : []),
  //       ...selectedLine.sublines.map(sl => ({ id: sl.subline_id, name: sl.subline_name }))
  //     ]
  //   : [];

  // const selectedSublineId = formData.subline && formData.subline !== ALL_OPTION_ID ? parseInt(formData.subline) : null;
  // const selectedSubline = selectedLine?.sublines.find(sl => sl.subline_id === selectedSublineId);
  
  // const stationOptions: SelectOption[] = (() => {
  //   let stations: Station[] = [];
  //   if (selectedSubline) stations = selectedSubline.stations;
  //   else if (selectedLine) stations = selectedLine.stations;
  //   else if (selectedDept) stations = selectedDept.stations;

  //   return stations.length > 0 
  //     ? [{ id: ALL_OPTION_ID, name: 'All Stations' }, ...stations.map(s => ({ id: s.station_id, name: s.station_name }))]
  //     : [];
  // })();

  // const isLineDisabled = !formData.department || formData.department === ALL_OPTION_ID || lineOptions.length === 0;
  // const isSublineDisabled = isLineDisabled || formData.line === ALL_OPTION_ID || sublineOptions.length === 0;
  // const isStationDisabled = isSublineDisabled || formData.subline === ALL_OPTION_ID || stationOptions.length === 0 || (formData.line !== ALL_OPTION_ID && formData.subline === '');
  // Compute dynamic options for cascading dropdowns
  const deptOptions: SelectOption[] = [
    { id: ALL_OPTION_ID, name: 'All Departments' },
    ...departments.map(d => ({ id: d.department_id, name: d.department_name }))
  ];

  const selectedDeptId = formData.department && formData.department !== ALL_OPTION_ID ? parseInt(formData.department) : null;
  const selectedDept = departments.find(d => d.department_id === selectedDeptId);

  // 1. Line Options: Only from selected Department
  const lineOptions: SelectOption[] = selectedDept && selectedDept.lines.length > 0
    ? [
        { id: ALL_OPTION_ID, name: 'All Lines' },
        ...selectedDept.lines.map(l => ({ id: l.line_id, name: l.line_name }))
      ]
    : [];

  const selectedLineId = formData.line && formData.line !== ALL_OPTION_ID ? parseInt(formData.line) : null;
  const selectedLine = selectedDept?.lines.find(l => l.line_id === selectedLineId);

  // 2. Subline Options: Only from selected Line
  const sublineOptions: SelectOption[] = selectedLine && selectedLine.sublines.length > 0
    ? [
        { id: ALL_OPTION_ID, name: 'All Sublines' },
        ...selectedLine.sublines.map(sl => ({ id: sl.subline_id, name: sl.subline_name }))
      ]
    : [];

  const selectedSublineId = formData.subline && formData.subline !== ALL_OPTION_ID ? parseInt(formData.subline) : null;
  const selectedSubline = selectedLine?.sublines.find(sl => sl.subline_id === selectedSublineId);
  
  // 3. Station Options: Aggregate based on the deepest selected level
  // Priority: Subline > Line > Department
  const stationOptions: SelectOption[] = (() => {
    let stations: Station[] = [];
    
    if (selectedSubline) {
      // If a specific Subline is selected, show its stations
      stations = selectedSubline.stations;
    } else if (selectedLine) {
      // If a specific Line is selected (but no Subline), show Line's direct stations
      stations = selectedLine.stations;
    } else if (selectedDept) {
      // If a specific Department is selected (but no Line), show Dept's direct stations
      stations = selectedDept.stations;
    }

    return stations.length > 0 
      ? [{ id: ALL_OPTION_ID, name: 'All Stations' }, ...stations.map(s => ({ id: s.station_id, name: s.station_name }))]
      : [];
  })();

  // 4. Disabled States
  // Line is disabled if no department selected OR department has no lines
  const isLineDisabled = !selectedDept || lineOptions.length === 0;

  // Subline is disabled if no line selected OR line has no sublines
  const isSublineDisabled = !selectedLine || sublineOptions.length === 0;

  // Station is disabled simply if there are no options available for the current selection
  // This allows selecting stations directly under a Department even if Lines are disabled
  const isStationDisabled = stationOptions.length === 0;
  // --- AUTO-GENERATE QUESTION PAPER NAME ---
  const levelName = levels.find(o => String(o.id) === formData.level)?.name || '';

  useEffect(() => {
    if (editingPaper || optionsLoading) return; 
    
    const departmentName = deptOptions.find(o => String(o.id) === formData.department)?.name || '';
    const lineName = lineOptions.find(o => String(o.id) === formData.line)?.name || '';
    const sublineName = sublineOptions.find(o => String(o.id) === formData.subline)?.name || '';
    const stationName = stationOptions.find(o => String(o.id) === formData.station)?.name || '';
    
    const locationParts = [];

    if (formData.station && formData.station !== ALL_OPTION_ID && stationOptions.length > 0) {
        locationParts.push(stationName);
    } else if (formData.subline && formData.subline !== ALL_OPTION_ID && sublineOptions.length > 0) {
        locationParts.push(sublineName);
    } else if (formData.line && formData.line !== ALL_OPTION_ID && lineOptions.length > 0) {
        locationParts.push(lineName);
    } else if (formData.department && formData.department !== ALL_OPTION_ID) {
        locationParts.push(departmentName);
    } else if (formData.department === ALL_OPTION_ID) {
        locationParts.push("Global");
    }

    const locationString = locationParts.filter(Boolean).join(' / '); 
    
    let newName = '';
    if (levelName || locationString) {
        newName = `QP - ${levelName}${levelName && locationString ? ' - ' : ''}${locationString}`;
    }

    setFormData(prev => {
        if (prev.question_paper_name.trim() === newName.trim()) {
            return prev;
        }
        return {
            ...prev,
            question_paper_name: newName.trim(),
        };
    });

  }, [
      formData.department, 
      formData.line, 
      formData.subline, 
      formData.station, 
      formData.level,
      editingPaper,
      optionsLoading,
      levelName,
  ]);

  // Tab Button Helper
  const TabButton = ({ id, label, icon: Icon }: { id: 'create' | 'list' | 'upload', label: string, icon: React.ElementType }) => (
    <button
      onClick={() => { 
          setActiveTab(id); 
          if(id === 'create') resetForm();
      }}
      className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
        activeTab === id
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      {id === 'create' && editingPaper ? 'Edit Paper' : label}
    </button>
  );

  return (
    <>
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff', borderRadius: '10px' },
          success: { style: { background: '#10b981' } },
          error: { style: { background: '#ef4444' } },
        }}
      />
      
      {/* FULL WIDTH WRAPPER */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-indigo-50 min-h-screen w-full">
        {/* FULL WIDTH CONTAINER WITH PADDING */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                <ClipboardList className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl py-3 font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Question Paper Manager
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  Manage papers and questions in one place
                </p>
              </div>
            </div>
            
            {/* TABS: Create Paper -> View Papers -> Create Questions */}
            <div className="flex bg-white rounded-xl p-1.5 shadow-lg border border-gray-100 gap-1 overflow-x-auto">
              <TabButton id="create" label="Create Paper" icon={Plus} />
              <TabButton id="list" label="View Papers" icon={Eye} />
              <TabButton id="upload" label="Create Questions" icon={FileQuestion} />
            </div>
          </div>

          {/* === CONTENT AREA === */}

          {/* 1. VIEW PAPERS (LIST) */}
          {activeTab === 'list' && (
            <div className="space-y-6 animate-fade-in">
              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-full sm:flex-1 relative group">
                    <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search papers, departments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                  <div className="w-full sm:w-64">
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="">All Departments (Filter)</option>
                      <option value={ALL_OPTION_ID}>Global Papers Only</option> 
                      {departments.map((dept) => (
                        <option key={`filter-dept-${dept.department_id}`} value={String(dept.department_id)}>
                          {dept.department_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button onClick={refetch} className="p-3 text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group" title="Refresh">
                    <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>
              </div>

              {/* Responsive Grid */}
              {isListLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <Spinner size="lg" />
                  <p className="mt-4 text-gray-600 font-medium">Loading question papers...</p>
                </div>
              ) : filteredPapers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ClipboardList className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Question Papers Found</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">{searchTerm || filterDepartment ? 'Try adjusting your search or filters' : 'Create your first question paper to get started'}</p>
                  <button onClick={() => { setActiveTab('create'); resetForm(); }} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Paper
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {filteredPapers.map((paper) => (
                    <QuestionPaperCard key={`paper-${paper.question_paper_id}`} paper={paper} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. CREATE PAPER (FORM) */}
          {activeTab === 'create' && (
            <div className="max-w-5xl mx-auto animate-fade-in">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                  <h2 className="text-3xl font-bold mb-2">{editingPaper ? 'Edit Question Paper' : 'Create New Question Paper'}</h2>
                  <p className="text-indigo-100">{editingPaper ? `Editing: ${editingPaper.question_paper_name}` : 'Fill out the details below to create a new question paper'}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <TextInputWithIcon 
                        id="question_paper_name" 
                        name="question_paper_name" 
                        value={formData.question_paper_name} 
                        onChange={handleChange} 
                        placeholder="e.g., Safety Assessment - Level 2" 
                        icon={Type} 
                        disabled={!editingPaper}
                      />
                      {!editingPaper && <p className="mt-1 text-sm text-gray-500">Auto-generated name based on selection.</p>}
                    </div>

                    {/* === TIMER SETTINGS CONTROLS === */}
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${formData.is_timer_enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700">Exam Timer</label>
                                    <p className="text-xs text-gray-500">Enable countdown for each question</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, is_timer_enabled: !prev.is_timer_enabled }))}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.is_timer_enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.is_timer_enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {formData.is_timer_enabled && (
                                <div className="flex items-center gap-3 animate-fade-in">
                                    <label htmlFor="question_duration" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                                        Seconds per Question:
                                    </label>
                                    <div className="relative w-24">
                                        <input
                                            type="number"
                                            id="question_duration"
                                            name="question_duration"
                                            value={formData.question_duration}
                                            onChange={handleChange}
                                            min="10"
                                            max="300"
                                            className="w-full p-2 pl-3 pr-8 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-center font-medium"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">s</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* =============================== */}

                    <CustomSelectInput label="Level" name="level" value={formData.level} onChange={handleChange} options={levels} loading={optionsLoading} icon={Trophy} />
                    <CustomSelectInput label="Department" name="department" value={formData.department} onChange={handleChange} options={deptOptions} loading={optionsLoading} icon={Building2} />
                    
                    <CustomSelectInput
                      label="Line"
                      name="line"
                      value={formData.line}
                      onChange={handleChange}
                      options={lineOptions}
                      loading={optionsLoading}
                      icon={Factory}
                      disabled={isLineDisabled}
                    />

                    <CustomSelectInput
                      label="Subline"
                      name="subline"
                      value={formData.subline}
                      onChange={handleChange}
                      options={sublineOptions}
                      loading={optionsLoading}
                      icon={Gauge}
                      disabled={isSublineDisabled}
                    />

                    <CustomSelectInput
                      label="Station"
                      name="station"
                      value={formData.station}
                      onChange={handleChange}
                      options={stationOptions}
                      loading={optionsLoading}
                      icon={MapPin}
                      disabled={isStationDisabled}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-10 pt-8 border-t-2 border-gray-100">
                    <div className="text-sm text-gray-500">
                      <p className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-yellow-500" />Select level and location as needed</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setActiveTab('list')} className="py-3 px-6 text-sm font-semibold text-gray-700 bg-white rounded-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">Cancel</button>
                      <button type="submit" disabled={isSubmitting || optionsLoading} className="inline-flex justify-center items-center py-3 px-8 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg transform hover:scale-105 disabled:transform-none">
                        {isSubmitting && <Spinner size="sm" />}
                        <span className={isSubmitting ? 'ml-2' : ''}>{isSubmitting ? (editingPaper ? 'Updating...' : 'Creating...') : (editingPaper ? 'Update Paper' : 'Create Paper')}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 3. CREATE QUESTIONS (UPLOAD COMPONENT) */}
          {activeTab === 'upload' && (
            <div className="animate-fade-in w-full">
              <QuestionUpload />
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default QuestionPaperManager;