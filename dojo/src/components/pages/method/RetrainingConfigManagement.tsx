import React, { useState, useEffect } from 'react';
import { Settings, Save, Plus, Edit2, Trash2 } from 'lucide-react';

interface RetrainingConfig {
  id: number;
  level: number;
  level_name?: string;
  evaluation_type: 'Evaluation' | 'OJT' | '10 Cycle';
  max_count: number;
  created_at: string;
  updated_at: string;
}

interface Level {
  level_id: number;
  level_name: string;
}

const RetrainingConfigManagement = () => {
  const [configs, setConfigs] = useState<RetrainingConfig[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<RetrainingConfig | null>(null);

  const [formData, setFormData] = useState({
    level: '',
    evaluation_type: 'Evaluation' as 'Evaluation' | 'OJT' | '10 Cycle',
    max_count: 2
  });

  const API_BASE_URL = 'http://192.168.2.51:8000';

  useEffect(() => {
    fetchConfigs();
    fetchLevels();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/retraining-configs/`);
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/levels/`);
      const data = await response.json();
      setLevels(data);
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingConfig
        ? `${API_BASE_URL}/retraining-configs/${editingConfig.id}/`
        : `${API_BASE_URL}/retraining-configs/`;

      const method = editingConfig ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: parseInt(formData.level),
          evaluation_type: formData.evaluation_type,
          max_count: formData.max_count
        })
      });

      if (response.ok) {
        fetchConfigs();
        setShowModal(false);
        setEditingConfig(null);
        setFormData({
          level: '',
          evaluation_type: 'Evaluation',
          max_count: 2
        });
        alert(editingConfig ? 'Configuration updated successfully!' : 'Configuration created successfully!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error saving configuration');
    }
  };

  const handleEdit = (config: RetrainingConfig) => {
    setEditingConfig(config);
    setFormData({
      level: config.level.toString(),
      evaluation_type: config.evaluation_type,
      max_count: config.max_count
    });
    setShowModal(true);
  };

  const handleDelete = async (configId: number) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/retraining-configs/${configId}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchConfigs();
        alert('Configuration deleted successfully!');
      } else {
        alert('Failed to delete configuration');
      }
    } catch (error) {
      console.error('Error deleting config:', error);
      alert('Error deleting configuration');
    }
  };

  const getLevelName = (levelId: number) => {
    const level = levels.find(l => l.level_id === levelId);
    return level ? level.level_name : `Level ${levelId}`;
  };

  const ConfigModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {editingConfig ? 'Edit Configuration' : 'Add New Configuration'}
          </h3>
          <button
            onClick={() => {
              setShowModal(false);
              setEditingConfig(null);
              setFormData({ level: '', evaluation_type: 'Evaluation', max_count: 2 });
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Level</label>
            <select
              required
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Level</option>
              {levels.map(level => (
                <option key={level.level_id} value={level.level_id}>
                  {level.level_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Evaluation Type</label>
            <select
              required
              value={formData.evaluation_type}
              onChange={(e) => setFormData({ ...formData, evaluation_type: e.target.value as 'Evaluation' | 'OJT' | '10 Cycle' })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Evaluation">Evaluation</option>
              <option value="OJT">OJT</option>
              <option value="10 Cycle">10 Cycle</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Maximum Retraining Attempts</label>
            <input
              type="number"
              min="1"
              max="5"
              required
              value={formData.max_count}
              onChange={(e) => setFormData({ ...formData, max_count: parseInt(e.target.value) })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 2-3 attempts</p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingConfig(null);
                setFormData({ level: '', evaluation_type: 'Evaluation', max_count: 2 });
              }}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingConfig ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-gray-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Retraining Configuration</h1>
              <p className="text-gray-600">Manage maximum retraining attempts for different evaluation types</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Configuration
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading configurations...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evaluation Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {configs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No configurations found</h3>
                      <p className="text-gray-500">Create your first retraining configuration to get started.</p>
                    </td>
                  </tr>
                ) : (
                  configs.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getLevelName(config.level)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.evaluation_type === 'Evaluation' ? 'bg-blue-100 text-blue-800' :
                            config.evaluation_type === 'OJT' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                          }`}>
                          {config.evaluation_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{config.max_count} attempts</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(config.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(config)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(config.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && <ConfigModal />}
    </div>
  );
};

export default RetrainingConfigManagement;