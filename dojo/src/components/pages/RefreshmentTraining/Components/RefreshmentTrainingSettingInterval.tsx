import React, { useState, useEffect } from 'react';
import { Settings, Clock, Save, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE = 'http://192.168.2.51:8000';

interface RecurrenceInterval {
  id: number;
  interval_months: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const RecurrenceSettings: React.FC = () => {
  const [intervals, setIntervals] = useState<RecurrenceInterval[]>([]);
  const [activeInterval, setActiveInterval] = useState<RecurrenceInterval | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInterval, setNewInterval] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchIntervals();
    fetchActiveInterval();
  }, []);

  const fetchIntervals = async () => {
    try {
      const res = await fetch(`${API_BASE}/recurrence-intervals/`);
      if (res.ok) {
        const data = await res.json();
        setIntervals(data);
      }
    } catch (error) {
      console.error('Error fetching intervals:', error);
    }
  };

  const fetchActiveInterval = async () => {
    try {
      const res = await fetch(`${API_BASE}/recurrence-intervals/active/`);
      if (res.ok) {
        const data = await res.json();
        setActiveInterval(data);
      }
    } catch (error) {
      console.error('Error fetching active interval:', error);
    }
  };

  const handleAddInterval = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const months = parseInt(newInterval);
    if (isNaN(months) || months < 1) {
      showMessage('error', 'Please enter a valid number of months (minimum 1)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recurrence-intervals/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interval_months: months,
          is_active: true
        }),
      });

      if (res.ok) {
        showMessage('success', 'Recurrence interval added successfully');
        setNewInterval('');
        setShowAddForm(false);
        await fetchIntervals();
        await fetchActiveInterval();
      } else {
        showMessage('error', 'Failed to add recurrence interval');
      }
    } catch (error) {
      console.error('Error adding interval:', error);
      showMessage('error', 'Error adding recurrence interval');
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (id: number) => {
    setLoading(true);
    try {
      // Deactivate all intervals first
      await Promise.all(
        intervals.map(interval =>
          fetch(`${API_BASE}/recurrence-intervals/${interval.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: false }),
          })
        )
      );

      // Activate selected interval
      const res = await fetch(`${API_BASE}/recurrence-intervals/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true }),
      });

      if (res.ok) {
        showMessage('success', 'Active interval updated successfully');
        await fetchIntervals();
        await fetchActiveInterval();
      } else {
        showMessage('error', 'Failed to update active interval');
      }
    } catch (error) {
      console.error('Error updating interval:', error);
      showMessage('error', 'Error updating active interval');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-blue-600" />
            Recurrence Settings
          </h2>
          <p className="text-gray-600 mt-2">
            Configure automatic recurring training schedules
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Clock className="w-5 h-5" />
          <span>Add Interval</span>
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span
            className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}
          >
            {message.text}
          </span>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Add New Recurrence Interval
          </h3>
          <form onSubmit={handleAddInterval} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interval (in months) *
              </label>
              <input
                type="number"
                min="1"
                value={newInterval}
                onChange={(e) => setNewInterval(e.target.value)}
                placeholder="Enter number of months (e.g., 3, 6)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Training will automatically reschedule after this many months
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Interval'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewInterval('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Active Interval */}
      {activeInterval && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border-2 border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 flex items-center mb-2">
                <CheckCircle className="w-5 h-5 mr-2" />
                Currently Active Interval
              </h3>
              <p className="text-3xl font-bold text-blue-700">
                {activeInterval.interval_months} Month{activeInterval.interval_months !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-blue-600 mt-2">
                Trainings will automatically reschedule every {activeInterval.interval_months} month
                {activeInterval.interval_months !== 1 ? 's' : ''}
              </p>
            </div>
            <Clock className="w-16 h-16 text-blue-400" />
          </div>
        </div>
      )}

      {/* All Intervals List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">All Recurrence Intervals</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interval (Months)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {intervals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    No recurrence intervals configured yet
                  </td>
                </tr>
              ) : (
                intervals.map((interval) => (
                  <tr key={interval.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-lg font-semibold text-gray-900">
                          {interval.interval_months} Month{interval.interval_months !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {interval.is_active ? (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center w-fit">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(interval.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!interval.is_active && (
                        <button
                          onClick={() => handleSetActive(interval.id)}
                          disabled={loading}
                          className={`text-blue-600 hover:text-blue-900 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          Set as Active
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">How Automatic Scheduling Works</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• When you schedule a training with a recurrence interval, it will automatically create a new schedule after the specified months</li>
              <li>• The new schedule will have the same training category, training name, trainer, venue, and employees</li>
              <li>• Only the date will be updated (original date + interval months)</li>
              <li>• Recurring schedules are created automatically when a training is marked as completed</li>
              <li>• You can have multiple intervals configured, but only one can be active at a time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurrenceSettings;