import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Calendar,
  Save,
  AlertCircle,
  RefreshCw,
  Users,
  User,
  ArrowRight,
  ArrowLeft,
  Plus
} from 'lucide-react';
import RefresherRemoteTest from './RefresherRemoteTest';
import RefresherIndividualLobby from './RefresherIndividualLobby';
import RefresherRemoteLobby from './RefresherRemoteLobby';
import RefresherBatchView from './RefresherBatchView';

const API_BASE = 'http://192.168.2.51:8000';

// --- Types ---
interface TrainingCategory { id: number; name: string; }
interface TrainingTopic { id: number; category: TrainingCategory; topic: string; description: string; }
interface Trainer { id: number; name: string; }
interface Venue { id: number; name: string; }

interface SessionEmployee {
  id: string;
  employee_code: string;
  full_name: string;
}

interface TrainingSession {
  id: number;
  training_category: TrainingCategory;
  topics: TrainingTopic[];
  trainer: Trainer;
  venue: Venue;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  date: string;
  time: string;
  employees: SessionEmployee[];
}

interface EmployeeAttendanceForm {
  employee_id: string;
  status: 'present' | 'absent' | 'rescheduled' | '';
  notes: string;
}

interface TopicFile {
  id: number;
  content_name: string;
  content_type: 'document' | 'image' | 'link';
  file?: string;
  link?: string;
}

interface TrainingBatchEmployee {
  emp_id: string;
  first_name?: string;
  last_name?: string;
}

interface TrainingBatch {
  id: number;
  batch_number: number;
  name: string;
  created_at: string;
  employees: TrainingBatchEmployee[];
}

interface TrainingProps {
  setActiveModule: (module: string) => void;
  selectedSessionId?: string | number | null;
  onSessionSelect?: (id: string | number | null) => void;
}

const Training: React.FC<TrainingProps> = ({ setActiveModule, selectedSessionId, onSessionSelect }) => {
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);

  // Auto-select session from props/URL
  useEffect(() => {
    if (selectedSessionId && trainingSessions.length > 0 && !selectedSession) {
      const match = trainingSessions.find(s => String(s.id) === String(selectedSessionId));
      if (match) {
        handleSessionClick(match);
      }
    }
  }, [selectedSessionId, trainingSessions]);

  // Attendance State
  const [attendanceForms, setAttendanceForms] = useState<{ [key: string]: EmployeeAttendanceForm }>({});
  const [savedAttendanceStatus, setSavedAttendanceStatus] = useState<Record<string, string>>({}); // Tracks backend status
  const [rescheduleCompletion, setRescheduleCompletion] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Data
  const [topicFiles, setTopicFiles] = useState<TopicFile[]>([]);
  const [batches, setBatches] = useState<TrainingBatch[]>([]);

  // Navigation / Mode State
  const [activeBatch, setActiveBatch] = useState<TrainingBatch | null>(null); // The selected batch object
  const [isTestMode, setIsTestMode] = useState(false);
  const [testType, setTestType] = useState<'pre' | 'post' | null>(null);
  const [testMode, setTestMode] = useState<'remote' | 'individual' | null>(null);
  const [remoteAssignments, setRemoteAssignments] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const t = setTimeout(() => { setSuccessMessage(''); setErrorMessage(''); }, 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, errorMessage]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/schedules/`);
      if (!res.ok) { setTrainingSessions([]); return; }
      const data = await res.json();
      const mapped: TrainingSession[] = data.map((s: any) => ({
        ...s,
        employees: (s.employees || []).map((e: any) => ({
          id: String(e.emp_id ?? e.id ?? ''),
          full_name: [e.first_name, e.last_name].filter(Boolean).join(' ').trim() || String(e.emp_id),
          employee_code: String(e.employee_code ?? e.emp_id),
        })),
      }));
      setTrainingSessions(mapped);
    } catch (err) { console.error(err); setTrainingSessions([]); }
  };

  const fetchBatches = async (scheduleId: number) => {
    try {
      const res = await fetch(`${API_BASE}/schedules/${scheduleId}/batches/`);
      if (res.ok) setBatches(await res.json());
      else setBatches([]);
    } catch (err) { console.error(err); setBatches([]); }
  };

  const fetchTopicFiles = async (scheduleId: number) => {
    try {
      const res = await fetch(`${API_BASE}/schedules/${scheduleId}/contents/`);
      if (res.ok) setTopicFiles(await res.json());
      else setTopicFiles([]);
    } catch (err) { console.error(err); setTopicFiles([]); }
  };

  const loadExistingAttendance = async (scheduleId: number) => {
    setLoadingAttendance(true);
    try {
      const res = await fetch(`${API_BASE}/attendances/by_schedule/?schedule_id=${scheduleId}`);
      if (res.ok) {
        const data = await res.json();

        // Update saved status map for filtering
        const savedMap: Record<string, string> = {};
        const completionMap: Record<string, boolean> = {};
        data.forEach((att: any) => {
          if (att.employee && att.employee.emp_id) {
            savedMap[String(att.employee.emp_id)] = att.status;
            completionMap[String(att.employee.emp_id)] = Boolean(
              att.reschedule_date && att.reschedule_time && att.reschedule_reason
            );
          }
        });
        setSavedAttendanceStatus(savedMap);
        setRescheduleCompletion(completionMap);

        if (selectedSession && selectedSession.id === scheduleId) {
          initializeAttendanceForms(selectedSession, data);
        }
      } else if (selectedSession && selectedSession.id === scheduleId) {
        initializeAttendanceForms(selectedSession, null);
        setRescheduleCompletion({});
      }
    } catch (err) {
      console.error(err);
      if (selectedSession && selectedSession.id === scheduleId) initializeAttendanceForms(selectedSession, null);
      setRescheduleCompletion({});
    } finally {
      setLoadingAttendance(false);
    }
  };

  const initializeAttendanceForms = (session: TrainingSession, existing: any[] | null) => {
    const forms: { [key: string]: EmployeeAttendanceForm } = {};
    session.employees.forEach(emp => {
      const existingAtt = existing?.find((a: any) => String(a.employee.emp_id) === String(emp.id));
      forms[emp.id] = {
        employee_id: emp.id,
        status: existingAtt ? existingAtt.status : '',
        notes: existingAtt ? existingAtt.notes || '' : '',
      };
    });
    setAttendanceForms(forms);
  };

  const handleSaveAttendance = async (silent = false) => {
    if (!selectedSession) return;
    setIsSaving(true);
    if (!silent) { setErrorMessage(''); setSuccessMessage(''); }

    const attendances = selectedSession.employees.map(emp => {
      const form = attendanceForms[emp.id] || { status: '', notes: '' };
      return {
        employee_id: emp.id,
        status: form.status || 'absent',
        notes: form.notes || '',
        reschedule_date: null, reschedule_time: null, reschedule_reason: null,
      };
    });

    try {
      const res = await fetch(`${API_BASE}/attendances/bulk_save_attendance/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule_id: selectedSession.id, attendances }),
      });
      const data = await res.json();
      if (res.ok) {
        if (!silent) setSuccessMessage(data.message || 'Attendance saved!');
        if (!silent) await loadExistingAttendance(selectedSession.id); // Reload to hide processed rows
      } else {
        if (!silent) setErrorMessage(data.error || 'Failed to save attendance');
      }
    } catch (err) {
      console.error(err);
      if (!silent) setErrorMessage('Network error while saving attendance');
    } finally {
      setIsSaving(false);
    }
  };

  // --- BATCH CREATION ---
  const handleCreateBatch = async () => {
    if (!selectedSession) return;

    const staging = getStagingEmployees();
    const presentIds = staging
      .map(emp => String(emp.id))
      .filter(eid => attendanceForms[eid]?.status === 'present');

    if (!presentIds.length) {
      alert('Please mark at least one employee as Present');
      return;
    }

    await handleSaveAttendance(true);

    try {
      const res = await fetch(`${API_BASE}/schedules/${selectedSession.id}/create_batch/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_ids: presentIds }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Batch created: ${data.name}`);
        await fetchBatches(selectedSession.id);
        await loadExistingAttendance(selectedSession.id);

        // AUTO BLOOM: Navigate to the new batch
        setActiveBatch(data);
      } else {
        setErrorMessage(data.error || 'Failed to create batch');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error while creating batch');
    }
  };

  const handleSessionClick = async (session: TrainingSession) => {
    // Sync with URL if prop provided
    if (onSessionSelect) onSessionSelect(session.id);

    setSelectedSession(session);
    setActiveBatch(null);
    setIsTestMode(false);
    setAttendanceForms({});
    setRescheduleCompletion({});
    setBatches([]);
    setTopicFiles([]);
    setSuccessMessage('');
    setErrorMessage('');

    await Promise.all([
      loadExistingAttendance(session.id),
      fetchTopicFiles(session.id),
      fetchBatches(session.id),
    ]);
  };

  const getStagingEmployees = () => {
    if (!selectedSession) return [];

    // 1. Get IDs of employees already in a batch
    const batchedIds = new Set<string>();
    batches.forEach(batch => {
      (batch.employees || []).forEach(emp => {
        if (emp.emp_id) batchedIds.add(String(emp.emp_id));
      });
    });

    // 2. Filter the session employees
    return selectedSession.employees.filter(emp => {
      const eid = String(emp.id);

      // Filter out if:
      // a) Already in a batch
      if (batchedIds.has(eid)) return false;

      // b) Saved Status Filtering
      // Hide any employee already marked in attendance (present/absent/rescheduled)
      // Rescheduled should re-appear only after reschedule details are completed
      const dbStatus = savedAttendanceStatus[eid];
      if (dbStatus === 'present' || dbStatus === 'absent') {
        return false;
      }
      if (dbStatus === 'rescheduled') {
        const isCompleted = rescheduleCompletion[eid];
        return isCompleted === true;
      }

      return true;
    });
  };

  const stats = getAttendanceStats();
  function getAttendanceStats() {
    const staging = getStagingEmployees();
    let present = 0, absent = 0, rescheduled = 0;
    staging.forEach(emp => {
      const s = attendanceForms[emp.id]?.status;
      if (s === 'present') present++;
      else if (s === 'rescheduled') rescheduled++;
      else if (s === 'absent') absent++;
    });
    return { total: staging.length, present, absent, rescheduled };
  }

  // --- HANDLERS FOR TESTS ---
  const handleLaunchTest = (type: 'pre' | 'post', mode: 'individual' | 'remote') => {
    setTestType(type);
    setTestMode(mode);
    setIsTestMode(true);
    setRemoteAssignments(null);
  };

  const handleCloseTest = () => {
    setIsTestMode(false);
    setTestType(null);
    setTestMode(null);
    setRemoteAssignments(null);
    // Keep activeBatch set so we return to the Batch View, not the main session list
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // --- RENDER LOGIC ---

  // 1. TEST MODE (Takes over screen)
  if (isTestMode && selectedSession && testType && testMode && activeBatch) {
    if (testMode === 'remote') {
      if (remoteAssignments) {
        return <RefresherRemoteTest scheduleId={selectedSession.id} testType={testType} topicName={selectedSession.training_category.name} assignments={remoteAssignments} onExit={handleCloseTest} />;
      }
      return <RefresherRemoteLobby scheduleId={selectedSession.id} batchId={activeBatch.id} testType={testType} topicName={selectedSession.training_category.name} onBack={handleCloseTest} onStartTest={setRemoteAssignments} />;
    }
    return <RefresherIndividualLobby scheduleId={selectedSession.id} batchId={activeBatch.id} testType={testType} topicName={selectedSession.training_category.name} onExit={handleCloseTest} />;
  }

  // 2. BATCH VIEW (The "Bloom" View)
  if (selectedSession && activeBatch) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <RefresherBatchView
          batch={activeBatch}
          schedule={selectedSession}
          topicFiles={topicFiles}
          onBack={() => setActiveBatch(null)}
          onLaunchTest={handleLaunchTest}
        />
      </div>
    );
  }

  // 3. MAIN TRAINING UI (Session List or Staging)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* VIEW 1: SESSION LIST */}
        {!selectedSession && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900">Training Management</h1>
              <p className="text-gray-600 mt-2 text-lg">Mark attendance, create batches and run tests</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white flex items-center"><Calendar className="w-7 h-7 mr-3" /> Available Sessions</h3>
                <button onClick={fetchSessions} className="text-white/90 hover:text-white p-2 hover:bg-white/20 rounded-xl"><RefreshCw className="w-5 h-5" /></button>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trainingSessions.map(session => (
                  <div key={session.id} onClick={() => handleSessionClick(session)} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-purple-300 cursor-pointer transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusClass(session.status)}`}>{session.status}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-purple-600 line-clamp-2">{session.training_category.name}</h4>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {session.topics.slice(0, 3).map(t => <span key={t.id} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border">{t.topic}</span>)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-center"><User className="w-4 h-4 mr-2 text-purple-500" />{session.trainer.name}</div>
                      <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-purple-500" />{session.date} • {session.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: STAGING AREA (Session Selected) */}
        {selectedSession && !activeBatch && (
          <div className="animate-fade-in">
            <button onClick={() => {
              setSelectedSession(null);
              setAttendanceForms({});
              setBatches([]);
              setActiveBatch(null);
              setIsTestMode(false);
              fetchSessions(); // <-- Refresh list on exit
            }} className="mb-4 flex items-center text-gray-500 hover:text-purple-600 font-bold transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Sessions
            </button>

            {/* Session Header */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 px-10 py-8 flex justify-between items-start">
                <div className="text-white">
                  <h3 className="text-3xl font-bold mb-3">{selectedSession.training_category.name}</h3>
                  <div className="flex flex-wrap gap-2 text-white/90">
                    {selectedSession.topics.map(t => <span key={t.id} className="bg-white/20 px-2 py-0.5 rounded text-sm">{t.topic}</span>)}
                  </div>
                </div>
              </div>

              {/* Attendance Stats */}
              <div className="grid grid-cols-4 gap-6 px-10 py-6 bg-gray-50 border-b">
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm border"><div className="text-3xl font-bold text-gray-800">{stats.total}</div><div className="text-sm text-gray-500 font-bold uppercase mt-1">Staging</div></div>
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-green-100"><div className="text-3xl font-bold text-green-600">{stats.present}</div><div className="text-sm text-gray-500 font-bold uppercase mt-1">Present</div></div>
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-red-100"><div className="text-3xl font-bold text-red-600">{stats.absent}</div><div className="text-sm text-gray-500 font-bold uppercase mt-1">Absent</div></div>
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-yellow-100"><div className="text-3xl font-bold text-yellow-600">{stats.rescheduled}</div><div className="text-sm text-gray-500 font-bold uppercase mt-1">Rescheduled</div></div>
              </div>

              {successMessage && <div className="px-10 py-4 bg-green-50 text-green-800 font-bold flex gap-2"><CheckCircle className="w-5 h-5" /> {successMessage}</div>}
              {errorMessage && <div className="px-10 py-4 bg-red-50 text-red-800 font-bold flex gap-2"><AlertCircle className="w-5 h-5" /> {errorMessage}</div>}

              {/* Attendance Table */}
              <div className="p-10">
                <div className="mb-6 flex justify-between items-center">
                  <h4 className="text-2xl font-bold text-gray-900">Staging Area</h4>
                  <div className="flex gap-3">
                    <button onClick={() => { setAttendanceForms({}); loadExistingAttendance(selectedSession.id); }} className="text-purple-600 font-bold hover:bg-purple-50 px-4 py-2 rounded-xl transition-colors">Refresh</button>
                    <button onClick={handleCreateBatch} disabled={!stats.present} className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black shadow flex items-center gap-2 disabled:opacity-50">
                      <Plus className="w-4 h-4" /> Start New Batch
                    </button>
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-8 py-5 text-left text-sm font-bold text-gray-500 uppercase">Employee</th>
                        <th className="px-4 py-5 text-center text-sm font-bold text-gray-500 uppercase">Present</th>
                        <th className="px-4 py-5 text-center text-sm font-bold text-gray-500 uppercase">Resch</th>
                        <th className="px-4 py-5 text-center text-sm font-bold text-gray-500 uppercase">Absent</th>
                        <th className="px-8 py-5 text-left text-sm font-bold text-gray-500 uppercase">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getStagingEmployees().map(emp => {
                        const form = attendanceForms[emp.id] || { status: '', notes: '' };
                        return (
                          <tr key={emp.id} className={form.status ? 'bg-blue-50/30' : ''}>
                            <td className="px-8 py-5 font-bold text-gray-900">{emp.full_name}<div className="text-sm text-gray-500 font-medium">{emp.employee_code}</div></td>
                            <td className="px-4 py-5 text-center"><input type="radio" checked={form.status === 'present'} onChange={() => setAttendanceForms(p => ({ ...p, [emp.id]: { ...p[emp.id], status: 'present' } }))} className="w-6 h-6 text-green-600 cursor-pointer" /></td>
                            <td className="px-4 py-5 text-center"><input type="radio" checked={form.status === 'rescheduled'} onChange={() => setAttendanceForms(p => ({ ...p, [emp.id]: { ...p[emp.id], status: 'rescheduled' } }))} className="w-6 h-6 text-yellow-600 cursor-pointer" /></td>
                            <td className="px-4 py-5 text-center"><input type="radio" checked={form.status === 'absent'} onChange={() => setAttendanceForms(p => ({ ...p, [emp.id]: { ...p[emp.id], status: 'absent' } }))} className="w-6 h-6 text-red-600 cursor-pointer" /></td>
                            <td className="px-8 py-5"><input type="text" value={form.notes} onChange={e => setAttendanceForms(p => ({ ...p, [emp.id]: { ...p[emp.id], notes: e.target.value } }))} placeholder="Notes..." className="w-full border-2 border-gray-200 rounded-xl px-4 py-2" /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ACTIVE BATCHES LIST */}
            {batches.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Active Batches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {batches.map(batch => (
                    <div key={batch.id} onClick={() => setActiveBatch(batch)} className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-purple-500 hover:shadow-xl cursor-pointer transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-6 h-6 text-purple-600" /></div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Batch {batch.batch_number}</div>
                      <div className="text-xl font-bold text-gray-900 mb-2">{batch.name}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Users className="w-4 h-4" /> {batch.employees.length} Employees
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Training;
