import React, { useState, useEffect, useMemo } from 'react';
import {
  Filter,
  TrendingUp,
  BookOpen,
  Users,
  CheckCircle,
  Calendar,
  PieChart,
  BarChart2,
} from 'lucide-react';
import TrainingEffectivenessReport from './TrainingEffectivenessReport';

const API_BASE = 'http://192.168.2.51:8000';

interface TrainingCategory {
  id: number;
  name: string;
}

interface TrainingTopic {
  id: number;
  category: TrainingCategory;
  topic: string;
  description: string;
}

interface TrainingSession {
  id: number;
  training_category?: TrainingCategory;
  topics?: TrainingTopic[]; // UPDATED: use topics instead of training_name
  date: string;
  time: string;
  trainer?: { name?: string } | string;
  venue?: { name?: string } | string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  employees: Array<{
    emp_id: string;
    first_name?: string;
    last_name?: string;
  }>;
}

interface EmployeeStatus {
  id: number;
  schedule: number | { id: number };
  employee: string | { emp_id: string; id: string };
  status: 'present' | 'absent' | 'rescheduled';
  notes?: string;
  reschedule_date?: string;
  reschedule_time?: string;
  reschedule_reason?: string;
}

type SessionDetail = {
  sessionId: number;
  date: string;
  totalEmployees: number;
  completedEmployees: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
};

type CategoryTopicStats = {
  categoryId: number;
  categoryName: string;
  topicId: number;
  topicName: string;
  totalEmployees: number;
  completedEmployees: number;
  sessions: SessionDetail[];
};

function getScheduleId(schedule: any): number | null {
  if (!schedule) return null;
  if (typeof schedule === 'number') return schedule;
  if (typeof schedule === 'object' && schedule.id) return schedule.id;
  return null;
}

function getEmployeeId(employee: any): string | null {
  if (!employee) return null;
  if (typeof employee === 'string') return employee;
  if (typeof employee === 'object') {
    return employee.emp_id || employee.id || null;
  }
  return null;
}

const Status: React.FC = () => {
  // --- Tab State ---
  const [activeTab, setActiveTab] = useState<'completion' | 'effectiveness'>('completion');

  // --- Completion View States ---
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showYearOnly, setShowYearOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>([]);
  const [trainingCategories, setTrainingCategories] = useState<TrainingCategory[]>([]);
  const [trainingTopics, setTrainingTopics] = useState<TrainingTopic[]>([]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, categoriesRes, topicsRes] = await Promise.all([
        fetch(`${API_BASE}/schedules/`),
        fetch(`${API_BASE}/training-categories/`),
        fetch(`${API_BASE}/curriculums/`),
      ]);

      if (!sessionsRes.ok) throw new Error('Failed to fetch training sessions');
      if (!categoriesRes.ok) throw new Error('Failed to fetch training categories');
      if (!topicsRes.ok) throw new Error('Failed to fetch training topics');

      const sessionsData = await sessionsRes.json();
      const categoriesData = await categoriesRes.json();
      const topicsData = await topicsRes.json();

      setTrainingSessions(sessionsData);
      setTrainingCategories(categoriesData);
      setTrainingTopics(topicsData);

      let allAttendances: EmployeeStatus[] = [];
      
      try {
        const attendanceRes = await fetch(`${API_BASE}/attendances/`);
        
        if (attendanceRes.ok) {
          const attendanceData = await attendanceRes.json();
          
          if (Array.isArray(attendanceData)) {
            allAttendances = attendanceData;
          } else if (attendanceData.results && Array.isArray(attendanceData.results)) {
            allAttendances = attendanceData.results;
          }
        }
        
        // Fallback: fetch by schedule if /attendances/ is empty
        if (allAttendances.length === 0) {
          for (const session of sessionsData) {
            try {
              const sessionAttendanceRes = await fetch(
                `${API_BASE}/attendances/by_schedule/?schedule_id=${session.id}`
              );
              
              if (sessionAttendanceRes.ok) {
                const sessionAttendances = await sessionAttendanceRes.json();
                if (Array.isArray(sessionAttendances)) {
                  allAttendances.push(...sessionAttendances);
                }
              }
            } catch (err) {
              console.warn(`Failed to fetch attendance for session ${session.id}`);
            }
          }
        }
        
        setEmployeeStatuses(allAttendances);
        
      } catch (error) {
        console.error('Error fetching attendance:', error);
        setEmployeeStatuses([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableTopics = useMemo(() => {
    if (selectedCategory === 'all') return trainingTopics;
    return trainingTopics.filter(topic => 
      topic.category && topic.category.id === parseInt(selectedCategory)
    );
  }, [selectedCategory, trainingTopics]);

  const categoryTopicStats = useMemo(() => {
    if (!trainingSessions.length) return [];

    // Filter sessions by time period and completed status
    const filteredSessions = trainingSessions.filter(session => {
      if (session.status !== 'completed') return false;
      if (!session.date) return false;

      const sessionDate = new Date(session.date);
      if (isNaN(sessionDate.getTime())) return false;

      const sessionYear = sessionDate.getFullYear();
      const sessionMonth = sessionDate.getMonth();

      if (showYearOnly) {
        return sessionYear === selectedYear;
      } else {
        return sessionYear === selectedYear && sessionMonth === selectedMonth;
      }
    });

    const statsMap = new Map<string, CategoryTopicStats>();

    filteredSessions.forEach(session => {
      const categoryId = session.training_category?.id ?? 0;
      const categoryName = session.training_category?.name || 'Unknown Category';

      // If no topics attached to this schedule, skip (or you can create an "Unknown Topic" bucket)
      if (!session.topics || session.topics.length === 0) {
        return;
      }

      // For each topic in the session, treat it as a separate (category, topic) bucket
      session.topics.forEach(topic => {
        const topicId = Number(topic.id);
        const topicName = topic.topic || 'Unknown Topic';

        // Apply category filter
        if (selectedCategory !== 'all' && categoryId !== parseInt(selectedCategory)) {
          return;
        }

        // Apply topic filter
        if (selectedTopic !== 'all' && topicId !== parseInt(selectedTopic)) {
          return;
        }

        const key = `${categoryId}-${topicId}`;

        if (!statsMap.has(key)) {
          statsMap.set(key, {
            categoryId,
            categoryName,
            topicId,
            topicName,
            totalEmployees: 0,
            completedEmployees: 0,
            sessions: [],
          });
        }

        const stats = statsMap.get(key)!;

        const sessionEmployees = session.employees || [];
        const sessionTotalEmployees = sessionEmployees.length;
        let sessionCompletedEmployees = 0;

        // Count how many of this session's employees are present
        sessionEmployees.forEach(emp => {
          const empId = emp.emp_id;
          
          const attendance = employeeStatuses.find(att => {
            const attScheduleId = getScheduleId(att.schedule);
            const attEmployeeId = getEmployeeId(att.employee);
            const scheduleMatch = String(attScheduleId) === String(session.id);
            const employeeMatch = String(attEmployeeId) === String(empId);
            return scheduleMatch && employeeMatch;
          });

          if (attendance && attendance.status === 'present') {
            sessionCompletedEmployees++;
          }
        });

        stats.sessions.push({
          sessionId: Number(session.id),
          date: session.date,
          totalEmployees: sessionTotalEmployees,
          completedEmployees: sessionCompletedEmployees,
          status: session.status,
        });

        stats.totalEmployees += sessionTotalEmployees;
        stats.completedEmployees += sessionCompletedEmployees;
      });
    });

    const result = Array.from(statsMap.values()).sort((a, b) => {
      const catCompare = a.categoryName.localeCompare(b.categoryName);
      if (catCompare !== 0) return catCompare;
      return a.topicName.localeCompare(b.topicName);
    });

    return result;
  }, [
    trainingSessions,
    employeeStatuses,
    selectedYear,
    selectedMonth,
    showYearOnly,
    selectedCategory,
    selectedTopic,
  ]);

  const overallStats = useMemo(() => {
    const totalCategories = new Set(categoryTopicStats.map(s => s.categoryId)).size;
    const totalTopics = categoryTopicStats.length;
    const totalEmployees = categoryTopicStats.reduce((sum, s) => sum + s.totalEmployees, 0);
    const completedEmployees = categoryTopicStats.reduce((sum, s) => sum + s.completedEmployees, 0);
    
    const overallCompletionRate = totalEmployees > 0
      ? Math.round((completedEmployees / totalEmployees) * 100)
      : 0;

    return {
      totalCategories,
      totalTopics,
      totalEmployees,
      completedEmployees,
      overallCompletionRate
    };
  }, [categoryTopicStats]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
          <p className="text-purple-600 font-semibold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- Header Section with Tabs --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Training Reports
            </h1>
            <p className="text-gray-600 font-medium">Analyze training performance and impact</p>
          </div>
          
          <div className="bg-white p-1.5 rounded-xl shadow-sm border border-purple-100 flex gap-2">
            <button
              onClick={() => setActiveTab('completion')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === 'completion'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <PieChart className="w-5 h-5" /> Completion Status
            </button>
            <button
              onClick={() => setActiveTab('effectiveness')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === 'effectiveness'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
              }`}
            >
              <BarChart2 className="w-5 h-5" /> Effectiveness Report
            </button>
          </div>
        </div>

        {/* --- Content Area --- */}
        {activeTab === 'effectiveness' ? (
          <div className="animate-fade-in">
            <TrainingEffectivenessReport />
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
            {/* Filters Grid */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-purple-100">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                {/* Month Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    disabled={showYearOnly}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                </div>

                {/* Year Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedTopic('all');
                    }}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium"
                  >
                    <option value="all">All Categories</option>
                    {trainingCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Topic</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    disabled={selectedCategory === 'all'}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    <option value="all">All Topics</option>
                    {availableTopics.map(topic => (
                      <option key={topic.id} value={topic.id}>
                        {topic.topic}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">View Mode</label>
                  <div className="flex gap-2 h-12">
                    <button
                      onClick={() => setShowYearOnly(false)}
                      className={`flex-1 px-4 rounded-xl font-semibold transition-all ${
                        !showYearOnly
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-gray-100 text-gray-600 hover:bg-purple-50'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setShowYearOnly(true)}
                      className={`flex-1 px-4 rounded-xl font-semibold transition-all ${
                        showYearOnly
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-gray-100 text-gray-600 hover:bg-purple-50'
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-700">Active Period:</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-medium">
                  {showYearOnly ? `Year ${selectedYear}` : `${monthNames[selectedMonth]} ${selectedYear}`}
                </span>
                {selectedCategory !== 'all' && (
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg font-medium">
                    {trainingCategories.find(c => c.id === parseInt(selectedCategory))?.name}
                  </span>
                )}
                {selectedTopic !== 'all' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">
                    {availableTopics.find(t => t.id === parseInt(selectedTopic))?.topic}
                  </span>
                )}
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  label: 'Training Categories',
                  value: overallStats.totalCategories,
                  icon: <BookOpen className="w-8 h-8 text-purple-600" />,
                  gradient: 'from-purple-500 to-purple-600',
                  bg: 'from-purple-50 to-purple-100',
                  subtitle: 'unique categories'
                },
                {
                  label: 'Training Topics',
                  value: overallStats.totalTopics,
                  icon: <BookOpen className="w-8 h-8 text-purple-600" />,
                  gradient: 'from-blue-500 to-blue-600',
                  bg: 'from-purple-50 to-purple-100',
                  subtitle: 'unique topics'
                },
                {
                  label: 'Total Employees',
                  value: overallStats.totalEmployees,
                  icon: <Users className="w-8 h-8 text-purple-600" />,
                  gradient: 'from-indigo-500 to-indigo-600',
                  bg: 'from-purple-50 to-purple-100',
                  subtitle: 'in completed trainings'
                },
                {
                  label: 'Overall Completion',
                  value: `${overallStats.overallCompletionRate}%`,
                  icon: <CheckCircle className="w-8 h-8 text-purple-600" />,
                  gradient: 'from-green-500 to-green-600',
                  bg: 'from-purple-50 to-purple-100',
                  subtitle: `${overallStats.completedEmployees}/${overallStats.totalEmployees} present`
                },
              ].map(({ label, value, icon, gradient, bg, subtitle }) => (
                <div key={label} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all transform hover:scale-[1.02]">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${bg} mb-4`}>
                    <div className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                      {icon}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1`}>
                    {value}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
                </div>
              ))}
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-purple-100">
              <div className="px-8 py-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Training Completion Details</h3>
                <p className="text-sm text-gray-600 font-medium">
                  Showing {categoryTopicStats.length} training topic(s) • Only Completed Sessions
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Topic</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Schedule Date</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-purple-700 uppercase tracking-wider">No Employees</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-purple-700 uppercase tracking-wider">Completed Emp</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-purple-700 uppercase tracking-wider">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {categoryTopicStats.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <TrendingUp className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Available</h3>
                            <p className="text-gray-500 font-medium">
                              No completed training sessions found for the selected filters.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      categoryTopicStats.map(stat =>
                        stat.sessions.map((session, sessionIndex) => {
                          const isFirstRow = sessionIndex === 0;
                          const rowSpan = stat.sessions.length;
                          const completionRate =
                            session.totalEmployees > 0
                              ? Math.round(
                                  (session.completedEmployees / session.totalEmployees) *
                                    100
                                )
                              : 0;

                          return (
                            <tr
                              key={`${stat.categoryId}-${stat.topicId}-${session.sessionId}`}
                              className="hover:bg-purple-50 transition-colors"
                            >
                              {isFirstRow && (
                                <td
                                  className="px-6 py-4 whitespace-nowrap align-top"
                                  rowSpan={rowSpan}
                                >
                                  <div className="text-sm font-bold text-gray-900">
                                    {stat.categoryName}
                                  </div>
                                </td>
                              )}

                              {isFirstRow && (
                                <td className="px-6 py-4 align-top" rowSpan={rowSpan}>
                                  <div className="text-sm font-bold text-gray-900">
                                    {stat.topicName}
                                  </div>
                                  <div className="text-xs text-gray-500 font-medium mt-1 px-2 py-1 bg-purple-50 rounded-md inline-block">
                                    {stat.sessions.length} session(s)
                                  </div>
                                </td>
                              )}

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-purple-500" />
                                  <span className="text-sm font-semibold text-gray-900">
                                    {formatDate(session.date)}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
                                  <span className="text-base font-bold text-blue-700">
                                    {session.totalEmployees}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200">
                                  <span className="text-base font-bold text-green-700">
                                    {session.completedEmployees}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                                    completionRate === 100
                                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                      : completionRate >= 75
                                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                      : completionRate >= 50
                                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                                  }`}
                                >
                                  {completionRate}%
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Status;