import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Play, Smile, CheckCircle, Users } from 'lucide-react';
import RefresherIndividualTest from './RefresherIndividualTest';
import { Avatar, ProgressStepper, StickyHeader, Confetti } from '../Components/shared/UIComponents';

const API_BASE = 'http://127.0.0.1:8000';

interface Props {
  scheduleId: number;
  batchId?: number;                  // NEW
  testType: 'pre' | 'post';
  topicName: string;
  onExit: () => void;
}

interface TestSession {
  session_id: number;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  is_completed: boolean;
}

const RefresherIndividualLobby: React.FC<Props> = ({
  scheduleId,
  batchId,
  testType,
  topicName,
  onExit,
}) => {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [totalPresent, setTotalPresent] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/refresher/test/start/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule_id: scheduleId,
          test_type: testType,
          mode: 'individual',
          batch_id: batchId ?? null,       // NEW
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions);
        setTotalPresent(data.total_present);
        setTotalCompleted(data.total_completed);

        if (data.total_present > 0 && data.total_present === data.total_completed) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestComplete = () => {
    setActiveSessionId(null);
    fetchSessions();
  };

  if (activeSessionId) {
    return (
      <RefresherIndividualTest
        testSessionId={activeSessionId}
        topicName={topicName}
        testType={testType}
        onExit={handleTestComplete}
      />
    );
  }

  const pendingSessions = sessions.filter(s => !s.is_completed);
  const completedSessions = sessions.filter(s => s.is_completed);
  const allDone = totalPresent > 0 && totalCompleted === totalPresent;

  return (
    <div className="min-h-screen bg-gray-50">
      {showConfetti && <Confetti />}

      <StickyHeader>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <button
                onClick={onExit}
                className="flex items-center text-gray-400 hover:text-purple-600 mb-2 font-bold transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{topicName}</h1>
              <p className="text-gray-500 text-sm">
                {testType === 'pre' ? 'Pre-Test' : 'Post-Test'} • Individual Mode
                {batchId && ` • Batch ${batchId}`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <ProgressStepper currentStage={testType === 'pre' ? 1 : 3} />
            </div>
          </div>
        </div>
      </StickyHeader>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-4">
            <div className="bg-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {pendingSessions.length}
                </div>
                <div className="text-xs text-gray-400 uppercase font-bold">
                  In Queue
                </div>
              </div>
            </div>

            <div
              className={`px-6 py-4 rounded-2xl shadow-lg flex items-center gap-4 ${
                allDone ? 'bg-green-50' : 'bg-white'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  allDone ? 'bg-green-200' : 'bg-purple-100'
                }`}
              >
                <CheckCircle
                  className={`w-6 h-6 ${
                    allDone ? 'text-green-600' : 'text-purple-600'
                  }`}
                />
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    allDone ? 'text-green-600' : 'text-gray-900'
                  }`}
                >
                  {totalCompleted}/{totalPresent}
                </div>
                <div className="text-xs text-gray-400 uppercase font-bold">
                  Completed
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={fetchSessions}
            disabled={loading}
            className="p-3 bg-white rounded-xl shadow-lg text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Main Content */}
        {loading && sessions.length === 0 ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-10 h-10 animate-spin text-purple-600" />
          </div>
        ) : allDone ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Smile className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              All Tests Complete!
            </h2>
            <p className="text-gray-500 mb-10 text-lg max-w-md mx-auto">
              Every present employee in this batch has successfully completed the{' '}
              {testType === 'pre' ? 'pre-test' : 'post-test'}.
            </p>
            <button
              onClick={onExit}
              className="px-10 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 shadow-lg transition-colors flex items-center gap-3 mx-auto"
            >
              <CheckCircle className="w-5 h-5" /> Continue
            </button>
          </div>
        ) : (
          <div>
            {/* Pending */}
            {pendingSessions.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full" />
                  Waiting ({pendingSessions.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pendingSessions.map(session => (
                    <button
                      key={session.session_id}
                      onClick={() => setActiveSessionId(session.session_id)}
                      className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-left group border-2 border-transparent hover:border-purple-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Avatar name={session.employee_name} size="lg" />
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Play className="w-5 h-5 text-purple-600 fill-current" />
                          </div>
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1 truncate">
                        {session.employee_name}
                      </h4>
                      <p className="text-sm text-gray-400 font-medium">
                        {session.employee_code}
                      </p>
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                          Ready to Start
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedSessions.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-400 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full" />
                  Completed ({completedSessions.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {completedSessions.map(session => (
                    <div
                      key={session.session_id}
                      className="bg-gray-50 p-6 rounded-2xl border border-gray-200 opacity-60"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Avatar name={session.employee_name} size="lg" className="opacity-50" />
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-600 text-lg mb-1 truncate">
                        {session.employee_name}
                      </h4>
                      <p className="text-sm text-gray-400 font-medium">
                        {session.employee_code}
                      </p>
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
                          Completed
                        </span>
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

export default RefresherIndividualLobby;