

import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, Users, MapPin, Filter, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface TrainingSession {
  id: string;
  training_name?: { topic: string };
  trainingName?: string;
  trainer?: { name: string };
  venue?: { name: string };
  date: string;
  time: string;
  employees: any[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
}

const Notification: React.FC = () => {
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<TrainingSession[]>([]);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'year'>('month');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'scheduled' | 'completed' | 'cancelled' | 'pending'>('all');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchSessionsFromBackend();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [trainingSessions, selectedMonth, selectedYear, viewMode, selectedStatus]);

  const fetchSessionsFromBackend = async () => {
    try {
      const res = await fetch('http://192.168.2.51:8000/schedules/'); 
      if (res.ok) {
        const data = await res.json();
        setTrainingSessions(data);
      } else {
        setTrainingSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setTrainingSessions([]);
    }
  };

  const filterSessions = () => {
    const now = new Date();
    let filtered = trainingSessions;

    if (viewMode === 'week') {
      const startOfWeek = new Date(selectedYear, selectedMonth, 1);
      const currentDay = new Date(selectedYear, selectedMonth, now.getDate());
      startOfWeek.setDate(currentDay.getDate() - currentDay.getDay());
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      filtered = trainingSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
      });
    } else if (viewMode === 'month') {
      const startOfMonth = new Date(selectedYear, selectedMonth, 1);
      const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);

      filtered = trainingSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startOfMonth && sessionDate <= endOfMonth;
      });
    } else if (viewMode === 'year') {
      filtered = trainingSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.getFullYear() === selectedYear;
      });
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(session => session.status === selectedStatus);
    }

    setFilteredSessions(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getName = (field: any) =>
    typeof field === 'object' && field !== null && 'name' in field
      ? field.name
      : typeof field === 'string'
        ? field
        : '';

  const getUpcomingTrainings = () => {
    const now = new Date();
    return filteredSessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate > now && session.status === 'scheduled';
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getStatusSummary = () => {
    return {
      scheduled: filteredSessions.filter(s => s.status === 'scheduled').length,
      completed: filteredSessions.filter(s => s.status === 'completed').length,
      pending: filteredSessions.filter(s => s.status === 'pending').length,
      cancelled: filteredSessions.filter(s => s.status === 'cancelled').length,
    };
  };

  const TrainingCard: React.FC<{ session: TrainingSession }> = ({ session }) => (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {session.training_name?.topic || session.trainingName}
          </h3>
          <p className="text-base text-gray-600 font-medium">
            with {getName(session.trainer)}
          </p>
        </div>
        <span className={`px-4 py-2 text-sm font-bold rounded-xl border-2 ${getStatusColor(session.status)}`}>
          {session.status}
        </span>
      </div>
      <div className="space-y-3 text-base text-gray-700 font-medium">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-purple-600" />
          <span>{formatDate(session.date)}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-purple-600" />
          <span>{session.time}</span>
        </div>
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-purple-600" />
          <span>{getName(session.venue)}</span>
        </div>
        <div className="flex items-center space-x-3 pt-3 border-t-2 border-gray-100">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-blue-700">{session.employees.length} participants</span>
        </div>
      </div>
    </div>
  );

  const summary = getStatusSummary();
  const upcomingCount = getUpcomingTrainings().length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Notifications
                </h1>
                <p className="text-gray-600 mt-1 text-lg font-medium">Stay updated on training schedules</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 px-8 py-6">
            <h3 className="text-2xl font-bold text-white flex items-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              <Filter className="w-7 h-7 mr-3" />
              Filter Trainings
            </h3>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* View Mode */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  View Mode
                </label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'week' | 'month' | 'year')}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 bg-white shadow-sm transition-all text-base font-medium"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>

              {/* Month Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  disabled={viewMode === 'year'}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 bg-white shadow-sm transition-all text-base font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  {monthNames.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>

              {/* Year Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 bg-white shadow-sm transition-all text-base font-medium"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 bg-white shadow-sm transition-all text-base font-medium"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Current Filter Display */}
            <div className="mt-6 p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <p className="text-base text-purple-800 font-bold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  <strong>Viewing:</strong>{' '}
                  {viewMode === 'year' 
                    ? `All trainings in ${selectedYear}`
                    : viewMode === 'month'
                    ? `${monthNames[selectedMonth]} ${selectedYear}`
                    : `Current week of ${monthNames[selectedMonth]} ${selectedYear}`
                  }
                  {' '}• {filteredSessions.length} training{filteredSessions.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setSelectedMonth(new Date().getMonth());
                  setSelectedYear(new Date().getFullYear());
                  setViewMode('month');
                  setSelectedStatus('all');
                }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 text-base"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Reset to Current Month
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Trainings Alert */}
        {upcomingCount > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Upcoming Trainings
                </h3>
                <p className="text-blue-700 font-medium text-base mt-1">
                  You have {upcomingCount} upcoming training session(s) in the selected period.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-10 h-10 text-blue-600" />
              <div className="text-3xl font-bold text-blue-700" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {summary.scheduled}
              </div>
            </div>
            <div className="text-sm text-blue-800 font-bold">Scheduled</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-10 h-10 text-green-600" />
              <div className="text-3xl font-bold text-green-700" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {summary.completed}
              </div>
            </div>
            <div className="text-sm text-green-800 font-bold">Completed</div>
          </div>
        </div>

        {/* Training Sessions Display */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {viewMode === 'year' 
                    ? `Trainings in ${selectedYear}`
                    : viewMode === 'month'
                    ? `Trainings in ${monthNames[selectedMonth]} ${selectedYear}`
                    : `Trainings This Week`
                  }
                </h3>
                <p className="text-base text-gray-600 mt-1 font-medium">
                  Showing all training sessions for the selected period
                </p>
              </div>
              <span className="bg-purple-100 text-purple-800 px-6 py-3 rounded-2xl text-base font-bold border-2 border-purple-200">
                {filteredSessions.length} training{filteredSessions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="p-8">
            {filteredSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSessions.map((session) => (
                  <TrainingCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  No Trainings Found
                </h3>
                <p className="text-gray-600 font-medium text-lg mb-6">
                  No trainings scheduled for the selected period.
                </p>
                <button
                  onClick={() => {
                    setSelectedMonth(new Date().getMonth());
                    setSelectedYear(new Date().getFullYear());
                    setViewMode('month');
                    setSelectedStatus('all');
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 text-base"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  View Current Month
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;