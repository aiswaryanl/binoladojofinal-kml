import React from 'react';
import type { Employee } from '../types/Employee';
import { Calendar, Clock, MapPin, User, Building2, GraduationCap, CheckCircle } from 'lucide-react';

interface ScheduledListProps {
  scheduledEmployees: Employee[];
  onOpenRetrainingForm: (employee: Employee) => void;
}

export const ScheduledList: React.FC<ScheduledListProps> = ({ 
  scheduledEmployees, 
  onOpenRetrainingForm 
}) => {
  const getEvaluationBadgeColor = (type: string) => {
    switch (type) {
      case 'Evaluation':
        return 'bg-blue-100 text-blue-800';
      case 'OJT':
        return 'bg-green-100 text-green-800';
      case '10 Cycle':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (scheduledEmployees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Scheduled Sessions</h3>
        <p className="text-gray-600">Training sessions will appear here once scheduled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Scheduled Training Sessions</h2>
            <p className="text-sm text-gray-600">{scheduledEmployees.length} sessions scheduled</p>
          </div>
        </div>

        <div className="grid gap-4">
          {scheduledEmployees.map((employee, index) => {
            // Get the latest session for display
            const latestSession = employee.retraining_records?.[0];
            
            // Calculate correct session and attempt numbers
            const maxSessions = employee.max_attempts - 1; // Max retraining sessions (excluding initial evaluation)
            const totalAttempts = employee.max_attempts; // Total attempts including initial evaluation
            
            return (
              <div
                key={`${employee.employee_id}-${index}`}
                className={`border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer ${
                  employee.retraining_status === 'completed' 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                    : employee.retraining_status === 'scheduled'
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                    : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                }`}
                onClick={() => onOpenRetrainingForm(employee)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                      employee.retraining_status === 'completed' 
                        ? 'bg-green-100' 
                        : employee.retraining_status === 'scheduled'
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}>
                      {employee.retraining_status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <User className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{employee.employee_name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEvaluationBadgeColor(employee.evaluation_type)}`}>
                          {employee.evaluation_type}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(employee.retraining_status)}`}>
                          {employee.retraining_status === 'scheduled' ? 'Scheduled' :
                           employee.retraining_status === 'completed' ? 'Completed' :
                           employee.retraining_status === 'failed' ? 'Failed' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4" />
                            <span>{employee.department_name}</span>
                          </div>
                          
                          <div className="text-gray-600">
                            <span className="font-medium">Station:</span> {employee.station_name}
                          </div>
                          
                          <div className="text-gray-600">
                            <span className="font-medium">Level:</span> {employee.level_name}
                          </div>
                          
                          {latestSession && (
                            <>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">{formatDate(latestSession.scheduled_date)}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>{latestSession.scheduled_time}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span>{latestSession.venue}</span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-gray-600">
                            <span className="font-medium">Employee ID:</span> {employee.employee_id}
                          </div>
                          <div className="text-gray-600">
                            <span className="font-medium">Performance Gap:</span> 
                            <span className="text-red-600 font-medium"> {employee.performance_gap.toFixed(1)}%</span>
                          </div>
                          <div className="text-gray-600">
                            <span className="font-medium">Current Score:</span> {employee.obtained_percentage.toFixed(1)}% / {employee.required_percentage.toFixed(1)}%
                          </div>
                          {/* Show retraining sessions vs max retraining sessions */}
                          <div className="text-gray-600">
                            <span className="font-medium">Sessions:</span> {employee.existing_sessions_count} / {maxSessions}
                            <span className="text-xs text-gray-500 ml-2">(Attempt {employee.existing_sessions_count + 1}/{totalAttempts})</span>
                          </div>
                          {latestSession?.performance_percentage && (
                            <div className="text-gray-600">
                              <span className="font-medium">Latest Score:</span> 
                              <span className={`font-medium ${latestSession.performance_percentage >= employee.required_percentage ? 'text-green-600' : 'text-red-600'}`}>
                                {latestSession.performance_percentage.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Session History Summary */}
                      {employee.retraining_records && employee.retraining_records.length > 1 && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-500">
                            Previous attempts: {employee.retraining_records.length - 1} completed
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-sm text-gray-600 mb-1">Performance</div>
                    <div className={`text-lg font-bold ${
                      employee.obtained_percentage >= employee.required_percentage 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {employee.obtained_percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">of {employee.required_percentage.toFixed(1)}% required</div>
                    
                    {employee.retraining_status === 'completed' && (
                      <div className="mt-2">
                        <div className="text-xs text-green-600 font-medium">✓ Retraining Complete</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Total sessions: {scheduledEmployees.length}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-600">
                {scheduledEmployees.filter(emp => emp.retraining_status === 'scheduled').length} scheduled
              </span>
              <span className="text-green-600">
                {scheduledEmployees.filter(emp => emp.retraining_status === 'completed').length} completed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
