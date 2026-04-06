// RescheduleList.tsx
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Trash2,
  Save,
  X,
  Edit2,
  Filter,
  Search,
  MapPin,
  User,
  Check,
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

interface Employee {
  emp_id: string;
  first_name: string;
  last_name: string;
}

interface TrainingCategory {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

interface TrainingTopic {
  id: number;
  topic: string;
  description?: string;
  category?: TrainingCategory;
}

interface Schedule {
  id: number;
  training_category: TrainingCategory;
  topics: TrainingTopic[];
  trainer: { id?: number; name: string };
  venue: { id?: number; name: string };
  status: string;
  date: string;
  time: string;
}

interface PendingReschedule {
  id: number;
  schedule: Schedule;
  employee: Employee;
  status: 'absent' | 'rescheduled' | 'present';
  notes: string;
  reschedule_date: string | null;
  reschedule_time: string | null;
  reschedule_reason: string | null;
}

interface EditingForm {
  reschedule_date: string;
  reschedule_time: string;
  reschedule_reason: string;
}

interface AllReschedules {
  pending: PendingReschedule[];
  completed: PendingReschedule[];
}

interface RescheduleHistory {
  id: number;
  employee: Employee;
  original_schedule: Schedule;
  original_date: string;
  original_time: string;
  original_venue: string;
  original_trainer: string;
  original_status: 'absent' | 'rescheduled';
  rescheduled_date: string;
  rescheduled_time: string;
  reschedule_reason: string;
  final_status: 'present' | 'absent' | 'pending';
  final_attendance_marked_at: string | null;
  created_at: string;
}

const RescheduleList: React.FC = () => {
  const [allReschedules, setAllReschedules] = useState<AllReschedules>({
    pending: [],
    completed: [],
  });
  const [rescheduleHistory, setRescheduleHistory] = useState<RescheduleHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingForm, setEditingForm] = useState<EditingForm>({
    reschedule_date: '',
    reschedule_time: '',
    reschedule_reason: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] =
    useState<'all' | 'pending' | 'completed' | 'history'>('pending');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [markingPresent, setMarkingPresent] = useState<number | null>(null);

  useEffect(() => {
    fetchAllReschedules();
    fetchRescheduleHistory();
    const interval = setInterval(() => {
      fetchAllReschedules();
      fetchRescheduleHistory();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllReschedules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/attendances/all_reschedules/`);
      if (res.ok) {
        const data = await res.json();
        setAllReschedules(data);
      } else {
        setAllReschedules({ pending: [], completed: [] });
      }
    } catch (error) {
      setAllReschedules({ pending: [], completed: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchRescheduleHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/attendances/reschedule_history/`);
      if (res.ok) {
        const data = await res.json();
        setRescheduleHistory(data);
      } else {
        setRescheduleHistory([]);
      }
    } catch (error) {
      setRescheduleHistory([]);
    }
  };

  const getEmployeeName = (employee: Employee): string => {
    if (!employee) return 'Unknown';
    const name = [employee.first_name, employee.last_name].filter(Boolean).join(' ').trim();
    return name || String(employee.emp_id);
  };

  // NEW: Helper to derive a training name from topics
  const getTrainingName = (schedule?: Schedule | null): string => {
    if (!schedule || !schedule.topics || schedule.topics.length === 0) return 'Unknown';
    // Join all topics, or just use the first one if you prefer
    return schedule.topics.map(t => t.topic).join(', ');
  };

  const handleEditClick = (reschedule: PendingReschedule) => {
    setEditingId(reschedule.id);
    setEditingForm({
      reschedule_date: reschedule.reschedule_date || '',
      reschedule_time: reschedule.reschedule_time || '',
      reschedule_reason: reschedule.reschedule_reason || '',
    });
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingForm({ reschedule_date: '', reschedule_time: '', reschedule_reason: '' });
    setErrorMessage('');
  };

  const handleSaveReschedule = async (rescheduleId: number) => {
    if (
      !editingForm.reschedule_date ||
      !editingForm.reschedule_time ||
      !editingForm.reschedule_reason.trim()
    ) {
      setErrorMessage('Please fill in all reschedule details (date, time, and reason)');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/attendances/${rescheduleId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reschedule_date: editingForm.reschedule_date,
          reschedule_time: editingForm.reschedule_time,
          reschedule_reason: editingForm.reschedule_reason,
        }),
      });

      if (res.ok) {
        setSuccessMessage('Reschedule details saved successfully!');
        setEditingId(null);
        setEditingForm({ reschedule_date: '', reschedule_time: '', reschedule_reason: '' });
        setTimeout(() => {
          fetchAllReschedules();
          setSuccessMessage('');
        }, 1000);
      } else {
        const error = await res.json();
        setErrorMessage(error.error || 'Failed to save reschedule details');
      }
    } catch (error) {
      setErrorMessage('Error saving reschedule details. Please try again.');
    }
  };

  const handleMarkAsPresent = async (rescheduleId: number) => {
    if (
      !confirm(
        'Are you sure you want to mark this employee as present? This will create a history record and update the attendance status.',
      )
    ) {
      return;
    }
    setMarkingPresent(rescheduleId);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch(`${API_BASE}/attendances/${rescheduleId}/mark_as_present/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessMessage(data.message + ' History record created successfully!');
        setTimeout(() => {
          fetchAllReschedules();
          fetchRescheduleHistory();
          setSuccessMessage('');
          setMarkingPresent(null);
        }, 2000);
      } else {
        const error = await res.json();
        setErrorMessage(error.error || 'Failed to mark as present');
        setMarkingPresent(null);
      }
    } catch (error) {
      setErrorMessage('Error marking as present. Please try again.');
      setMarkingPresent(null);
    }
  };

  const handleDelete = async (rescheduleId: number) => {
    if (!confirm('Are you sure you want to delete this reschedule record?')) return;
    try {
      const res = await fetch(`${API_BASE}/attendances/${rescheduleId}/`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccessMessage('Reschedule record deleted successfully!');
        setTimeout(() => {
          fetchAllReschedules();
          setSuccessMessage('');
        }, 1500);
      } else {
        setErrorMessage('Failed to delete reschedule record');
      }
    } catch (error) {
      setErrorMessage('Error deleting reschedule record');
    }
  };

  const getFilteredReschedules = (): PendingReschedule[] => {
    let filtered: PendingReschedule[] = [];
    if (filterStatus === 'pending') {
      filtered = allReschedules.pending;
    } else if (filterStatus === 'completed') {
      filtered = allReschedules.completed;
    } else if (filterStatus === 'all') {
      filtered = [...allReschedules.pending, ...allReschedules.completed];
    }
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r => {
        const empName = getEmployeeName(r.employee).toLowerCase();
        const empId = String(r.employee?.emp_id || '').toLowerCase();
        const trainingName = getTrainingName(r.schedule).toLowerCase();
        return empName.includes(search) || empId.includes(search) || trainingName.includes(search);
      });
    }
    return filtered;
  };

  const getFilteredHistory = (): RescheduleHistory[] => {
    let filtered = rescheduleHistory;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(h => {
        const empName = getEmployeeName(h.employee).toLowerCase();
        const empId = String(h.employee?.emp_id || '').toLowerCase();
        const trainingName = getTrainingName(h.original_schedule).toLowerCase();
        return empName.includes(search) || empId.includes(search) || trainingName.includes(search);
      });
    }
    return filtered;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return '-';
    try {
      return new Date(dateTimeString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateTimeString;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'absent'
      ? 'bg-red-100 text-red-800 border-red-200'
      : status === 'present'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const showMarkPresentButton = (filterStatus: string, reschedule: PendingReschedule) => {
    return filterStatus === 'completed' && (reschedule.status === 'absent' || reschedule.status === 'rescheduled');
  };

  const filteredReschedules = filterStatus === 'history' ? [] : getFilteredReschedules();
  const filteredHistory = filterStatus === 'history' ? getFilteredHistory() : [];
  const pendingCount = allReschedules.pending.length;
  const completedCount = allReschedules.completed.length;
  const historyCount = rescheduleHistory.length;
  const absentCount = allReschedules.pending.filter(r => r.status === 'absent').length;
  const rescheduledCount = allReschedules.pending.filter(r => r.status === 'rescheduled').length;
  const presentCount = rescheduleHistory.filter(h => h.final_status === 'present').length;
  const showActionsColumn =
    (filterStatus !== 'completed' && filterStatus !== 'history') || filterStatus === 'completed';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Reschedule List</h2>
          <p className="text-gray-600 mt-1">Manage reschedule details and track attendance history</p>
        </div>
        <button
          onClick={() => {
            fetchAllReschedules();
            fetchRescheduleHistory();
          }}
          disabled={loading}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 text-base"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center space-x-3 bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Pending</p>
              <p className="text-3xl font-bold text-purple-600">{pendingCount}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-purple-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Absent</p>
              <p className="text-3xl font-bold text-red-600">{absentCount}</p>
            </div>
            <User className="w-12 h-12 text-red-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Rescheduled</p>
              <p className="text-3xl font-bold text-yellow-600">{rescheduledCount}</p>
            </div>
            <Calendar className="w-12 h-12 text-yellow-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedCount}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">History Records</p>
              <p className="text-3xl font-bold text-blue-600">{historyCount}</p>
            </div>
            <Check className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by employee name, ID, or training..."
              className="w-full px-5 py-4 pl-12 border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 bg-white text-base font-medium transition-all"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 bg-white shadow-sm transition-all text-base font-medium"
            >
              <option value="all">All Records</option>
              <option value="pending">Pending Only</option>
              <option value="completed">Rescheduled Only</option>
              <option value="history">Attendance History</option>
            </select>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('pending');
            }}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 bg-white shadow-sm transition-all text-base font-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filterStatus === 'history' ? (
        filteredHistory.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No History Records</h3>
            <p className="text-gray-600">No employees have been marked present after rescheduling yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Training
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Original Schedule
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Rescheduled To
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Final Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHistory.map(history => (
                    <tr key={history.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {getEmployeeName(history.employee)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {history.employee?.emp_id || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {getTrainingName(history.original_schedule)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {history.original_schedule?.training_category?.name || 'Unknown Category'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm font-bold text-gray-900">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            {formatDate(history.original_date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            {formatTime(history.original_time)}
                          </div>
                          {history.original_venue && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                              {history.original_venue}
                            </div>
                          )}
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                history.original_status,
                              )}`}
                            >
                              Original:{' '}
                              {history.original_status === 'absent'
                                ? '❌ Absent'
                                : '📅 Rescheduled'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded w-fit">
                            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                            {formatDate(history.rescheduled_date)}
                          </div>
                          <div className="flex items-center text-sm font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded w-fit">
                            <Clock className="w-4 h-4 mr-2 text-blue-600" />
                            {formatTime(history.rescheduled_time)}
                          </div>
                          <div className="text-xs text-gray-600 mt-2">
                            <strong>Reason:</strong> {history.reschedule_reason}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                              history.final_status,
                            )}`}
                          >
                            {history.final_status === 'present'
                              ? '✅ Present'
                              : history.final_status === 'absent'
                              ? '❌ Absent'
                              : '⏳ Pending'}
                          </span>
                          {history.final_attendance_marked_at && (
                            <div className="text-xs text-gray-500">
                              Marked: {formatDateTime(history.final_attendance_marked_at)}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : filteredReschedules.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {filterStatus === 'pending' ? 'All Caught Up!' : 'No Records Found'}
          </h3>
          <p className="text-gray-600">
            {filterStatus === 'pending'
              ? 'No pending reschedule details to fill in.'
              : 'No reschedule records match your filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Training
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Original Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Rescheduled Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  {showActionsColumn && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReschedules.map(reschedule => (
                  <React.Fragment key={reschedule.id}>
                    <tr
                      className={`hover:bg-gray-50 ${
                        editingId === reschedule.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {getEmployeeName(reschedule.employee)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {reschedule.employee?.emp_id || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {getTrainingName(reschedule.schedule)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reschedule.schedule?.training_category?.name || 'Unknown Category'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900 font-medium">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            {formatDate(reschedule.schedule?.date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            {formatTime(reschedule.schedule?.time)}
                          </div>
                          {reschedule.schedule?.venue?.name && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                              {reschedule.schedule.venue.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {reschedule.reschedule_date ? (
                          <div className="space-y-1">
                            <div className="flex items-center text-sm font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded w-fit">
                              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                              {formatDate(reschedule.reschedule_date)}
                            </div>
                            <div className="flex items-center text-sm font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded w-fit">
                              <Clock className="w-4 h-4 mr-2 text-blue-600" />
                              {formatTime(reschedule.reschedule_time)}
                            </div>
                            <div className="text-xs text-gray-600 mt-2">
                              <strong>Reason:</strong> {reschedule.reschedule_reason}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not yet rescheduled</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            reschedule.status,
                          )}`}
                        >
                          {reschedule.status === 'absent'
                            ? '❌ Absent'
                            : reschedule.status === 'present'
                            ? '✅ Present'
                            : reschedule.status === 'rescheduled'
                            ? '⏳ Rescheduled'
                            : reschedule.status}
                        </span>
                      </td>
                      {showActionsColumn && (
                        <td className="px-6 py-4">
                          {editingId === reschedule.id ? (
                            <div className="space-y-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Reschedule Date
                                  </label>
                                  <input
                                    type="date"
                                    value={editingForm.reschedule_date}
                                    onChange={e =>
                                      setEditingForm(form => ({
                                        ...form,
                                        reschedule_date: e.target.value,
                                      }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Reschedule Time
                                  </label>
                                  <input
                                    type="time"
                                    value={editingForm.reschedule_time}
                                    onChange={e =>
                                      setEditingForm(form => ({
                                        ...form,
                                        reschedule_time: e.target.value,
                                      }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Reason for Reschedule
                                </label>
                                <input
                                  type="text"
                                  value={editingForm.reschedule_reason}
                                  onChange={e =>
                                    setEditingForm(form => ({
                                      ...form,
                                      reschedule_reason: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter reason"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSaveReschedule(reschedule.id)}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                                >
                                  <Save className="w-4 h-4 mr-2" /> Save
                                </button>
                                <button
                                  onClick={handleCancel}
                                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center"
                                >
                                  <X className="w-4 h-4 mr-2" /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex space-x-4">
                              <button
                                onClick={() => handleEditClick(reschedule)}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center"
                              >
                                <Edit2 className="w-4 h-4 mr-2" /> Reschedule
                              </button>
                              {showMarkPresentButton(filterStatus, reschedule) && (
                                <button
                                  onClick={() => handleMarkAsPresent(reschedule.id)}
                                  disabled={markingPresent === reschedule.id}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                                >
                                  {markingPresent === reschedule.id ? (
                                    <>
                                      <Check className="w-4 h-4 mr-2 animate-pulse" />
                                      Marking...
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-4 h-4 mr-2" />
                                    </>
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(reschedule.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescheduleList;