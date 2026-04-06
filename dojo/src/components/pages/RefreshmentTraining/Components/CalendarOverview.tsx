import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Clock,
  Calendar as CalendarIcon,
  User,
  Building2,
} from 'lucide-react';

interface TrainingTopic {
  id: number | string;
  topic: string;
}

interface TrainingCategory {
  name: string;
}

interface Trainer {
  name: string;
}

interface Venue {
  name: string;
}

interface TrainingSession {
  id: string | number;
  training_category?: TrainingCategory;
  topics?: TrainingTopic[];
  trainer?: Trainer;
  venue?: Venue;
  date: string;
  time: string;
  employees: any[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
}

const CalendarOverview: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionsFromBackend();
  }, []);

  const fetchSessionsFromBackend = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/schedules/');
      if (res.ok) {
        const data = await res.json();
        setTrainingSessions(data);
      } else {
        setTrainingSessions([]);
      }
    } catch (error) {
      setTrainingSessions([]);
    }
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const currentMonth = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(
      currentDate.getMonth() + (direction === 'next' ? 1 : -1)
    );
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const dayToString = (year: number, monthIndex: number, day: number) =>
    `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(
      2,
      '0'
    )}`;

  const getDayTrainings = (day: number) => {
    const dayString = dayToString(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return trainingSessions.filter(session => session.date === dayString);
  };

  const getSelectedDateTrainings = () => {
    if (!selectedDate) return [];
    return trainingSessions.filter(session => session.date === selectedDate);
  };

  const handleDateClick = (day: number) => {
    const dayString = dayToString(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(dayString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /** Get a readable title for a session (first topic or category name) */
  const getSessionTitle = (session: TrainingSession) => {
    if (session.topics && session.topics.length > 0) {
      return session.topics[0].topic;
    }
    if (session.training_category?.name) {
      return session.training_category.name;
    }
    return '';
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalCells =
      Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;

    // Empty cells before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-28 border border-gray-200 bg-gray-50"
        ></div>
      );
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTrainings = getDayTrainings(day);
      const isToday =
        new Date().toDateString() ===
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day
        ).toDateString();
      const dayString = dayToString(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const isSelected = selectedDate === dayString;

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-28 border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            isSelected
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400'
              : ''
          } ${isToday ? 'bg-purple-50 border-purple-300' : ''}`}
        >
          <div
            className={`text-sm font-bold mb-1 ${
              isToday ? 'text-purple-800' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
          <div className="space-y-1 overflow-hidden">
            {dayTrainings.slice(0, 2).map(session => {
              const title = getSessionTitle(session);
              return (
                <div
                  key={session.id}
                  className={`text-xs px-2 py-1 rounded-lg font-semibold truncate border ${getStatusColor(
                    session.status
                  )}`}
                  title={`${title} - ${session.trainer?.name ?? ''}`}
                >
                  {title}
                </div>
              );
            })}
            {dayTrainings.length > 2 && (
              <div className="text-xs text-gray-600 font-medium px-2">
                +{dayTrainings.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    // Empty cells after last day
    const remainingCells =
      totalCells - (daysInMonth + firstDayOfMonth);
    for (let i = 0; i < remainingCells; i++) {
      days.push(
        <div
          key={`empty-next-${i}`}
          className="h-28 border border-gray-200 bg-gray-50"
        ></div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className="text-4xl font-bold text-gray-900"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Calendar Overview
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                View and manage your training schedule
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-3 rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h3
                className="text-2xl font-bold text-gray-800 min-w-64 text-center"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                {currentMonth}
              </h3>
              <button
                onClick={() => navigateMonth('next')}
                className="p-3 rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-colors shadow-sm"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-7 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                  day => (
                    <div
                      key={day}
                      className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                      }}
                    >
                      {day}
                    </div>
                  )
                )}
              </div>
              <div className="grid grid-cols-7">
                {renderCalendarDays()}
              </div>
            </div>
          </div>

          {/* Selected Date Details */}
          <div className="space-y-4">
            <div
              className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col"
              style={{ maxHeight: '800px' }}
            >
              <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 px-6 py-5 flex-shrink-0">
                <h4
                  className="text-xl font-bold text-white flex items-center"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                >
                  <CalendarIcon className="w-6 h-6 mr-3" />
                  {selectedDate
                    ? formatDate(selectedDate)
                    : 'Select a date'}
                </h4>
              </div>

              {selectedDate ? (
                <div className="flex-1 overflow-y-auto p-6">
                  {getSelectedDateTrainings().length > 0 ? (
                    <div className="space-y-4">
                      {getSelectedDateTrainings().map(session => {
                        const title = getSessionTitle(session);
                        return (
                          <div
                            key={session.id}
                            className="border-2 border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h5
                                className="font-bold text-gray-900 text-lg"
                                style={{
                                  fontFamily:
                                    'Inter, system-ui, sans-serif',
                                }}
                              >
                                {title}
                              </h5>
                              <span
                                className={`px-3 py-1.5 text-xs font-bold rounded-full border ${getStatusColor(
                                  session.status
                                )}`}
                              >
                                {session.status}
                              </span>
                            </div>

                            {session.training_category?.name && (
                              <div className="flex items-center space-x-2 mb-3 text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                <Building2 className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold">
                                  {session.training_category.name}
                                </span>
                              </div>
                            )}

                            <div className="space-y-3 text-sm text-gray-700">
                              <div className="flex items-center space-x-3 bg-gray-50 px-3 py-2 rounded-lg">
                                <Clock className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                <span className="font-semibold">
                                  {session.time}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 bg-gray-50 px-3 py-2 rounded-lg">
                                <User className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                <span className="font-semibold">
                                  {session.trainer?.name ?? 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 bg-gray-50 px-3 py-2 rounded-lg">
                                <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                <span className="font-semibold">
                                  {session.venue?.name ?? 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                                <Users className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                <span className="font-bold text-purple-800">
                                  {session.employees.length}{' '}
                                  participants
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                        <CalendarIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-semibold text-lg">
                        No trainings scheduled
                      </p>
                      <p className="text-gray-400 mt-2">for this date</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-purple-100 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                      <CalendarIcon className="w-10 h-10 text-purple-600" />
                    </div>
                    <p className="text-gray-700 font-semibold text-lg">
                      Select a date
                    </p>
                    <p className="text-gray-500 mt-2">
                      Click on any date to view training details
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Legend */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
              <h4
                className="text-lg font-bold text-gray-800 mb-4"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Training Status Legend
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-blue-100 border-2 border-blue-200 rounded-lg"></div>
                  <span className="text-sm font-semibold text-gray-700">
                    Scheduled
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 border-2 border-green-200 rounded-lg"></div>
                  <span className="text-sm font-semibold text-gray-700">
                    Completed
                  </span>
                </div>
             
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarOverview;