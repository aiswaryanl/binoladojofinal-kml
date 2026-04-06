import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Building2 } from 'lucide-react';
import type { Employee } from '../types/Employee';

interface SchedulingModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeId: string, scheduledDate: string, scheduledTime: string, venue: string) => void;
}

export const SchedulingModal: React.FC<SchedulingModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSave
}) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [venue, setVenue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!scheduledDate || !scheduledTime || !venue) {
      setError('All fields are required');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // Use the helper method that handles employee PK lookup
      // await retrainingApi.scheduleRetrainingByEmployeeId(employee.employee_id, {
      //   scheduled_date: scheduledDate,
      //   scheduled_time: scheduledTime,
      //   venue: venue
      // });

      // Call parent's onSave for UI updates
      await onSave(employee.employee_id, scheduledDate, scheduledTime, venue);
      
      onClose();
      
      // Reset form
      setScheduledDate('');
      setScheduledTime('');
      setVenue('');
    } catch (error: any) {
      console.error('Error scheduling training:', error);
      setError(error.message || 'Failed to schedule training session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const venues = [
    'Training Room A',
    'Training Room B', 
    'Conference Hall',
    'Workshop Floor',
    'Simulation Lab',
    'Online Session'
  ];

  // Calculate session and attempt numbers correctly based on backend logic
  const maxRetrainingSessions = employee.max_attempts - 1; // Retraining sessions (excluding initial evaluation)
  const currentRetrainingSession = employee.existing_sessions_count + 1; // Next retraining session
  const currentAttemptNumber = employee.existing_sessions_count + 2; // Total attempts including initial + retraining

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-8 max-h-full overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Schedule Training</h2>
              <p className="text-sm text-gray-600">Set up retraining session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-800">Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Employee Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{employee.employee_name}</h3>
                <p className="text-sm text-gray-600">ID: {employee.employee_id}</p>
                {/* Display employee_pk for debugging if needed */}
                <p className="text-xs text-gray-500">PK: {employee.employee_pk}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>{employee.department_name}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Station:</span> {employee.station_name || 'N/A'}
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Level:</span> {employee.level_name}
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Evaluation:</span> {employee.evaluation_type}
              </div>
              <div className="text-red-600">
                <span className="font-medium">Performance Gap:</span> {employee.performance_gap.toFixed(1)}%
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Current Score:</span> {employee.obtained_percentage.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium text-amber-800">
                  Retraining Session: {currentRetrainingSession} / {maxRetrainingSessions}
                </span>
              </div>
              <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                Attempt {currentAttemptNumber} of {employee.max_attempts}
              </div>
            </div>
            <div className="mt-2 text-xs text-amber-700">
              Scheduling retraining session #{currentRetrainingSession}
              {employee.existing_sessions_count > 0 && (
                <span className="ml-2 text-amber-600">
                  (Previous attempts: {employee.existing_sessions_count})
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Training Date <span className="text-red-500">*</span></span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={getTomorrowDate()}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                <span>Training Time <span className="text-red-500">*</span></span>
              </label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">Select time slot</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Venue Selection */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                <span>Training Venue <span className="text-red-500">*</span></span>
              </label>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">Select venue</option>
                {venues.map(venueOption => (
                  <option key={venueOption} value={venueOption}>{venueOption}</option>
                ))}
              </select>
            </div>

            {/* Warning if near max attempts */}
            {currentRetrainingSession === maxRetrainingSessions && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-800">Final Retraining Opportunity</span>
                </div>
                <p className="text-red-700 text-xs mt-1">
                  This is the last retraining session allowed for this evaluation.
                </p>
              </div>
            )}

            {/* Submit Buttons */}
            {!employee.can_schedule_retraining ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-800 font-medium">Maximum retraining attempts reached. Cannot schedule new sessions.</p>
              </div>
            ) : (
              <div className="flex space-x-3 pt-4 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !scheduledDate || !scheduledTime || !venue}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Scheduling...
                    </div>
                  ) : (
                    'Schedule Training'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};