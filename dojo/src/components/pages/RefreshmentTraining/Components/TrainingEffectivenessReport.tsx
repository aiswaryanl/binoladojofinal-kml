// src/Components/TrainingEffectivenessReport.tsx

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Award, Target, Users, BarChart3, ArrowLeft, Search, Minus, AlertCircle } from 'lucide-react';

const API_BASE = 'http://192.168.2.51:8000';

interface EffectivenessData {
  topic_id: number; // This is actually Category ID now from backend
  topic: string;    // This is Category Name
  category: string; // "General" or Group name
  pre_avg: number;
  post_avg: number;
  improvement: number;
  effectiveness: number;
  employee_count: number;
}

interface EmployeeDetail {
  id: string;
  name: string;
  code: string;
  pre_score: number;
  post_score: number;
  gain: number;
  status: 'Improved' | 'No Change' | 'Declined';
  date: string;
}

const TrainingEffectivenessReport: React.FC = () => {
  const [summaryData, setSummaryData] = useState<EffectivenessData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Detail View State
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null); // Renamed for clarity
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [details, setDetails] = useState<EmployeeDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchDetails(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/refresher/reports/effectiveness/`);
      if (res.ok) setSummaryData(await res.json());
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const fetchDetails = async (id: number) => {
    setLoadingDetails(true);
    try {
      // CHANGED: Uses category_id param now
      const res = await fetch(`${API_BASE}/refresher/reports/effectiveness/?category_id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setDetails(data.details);
        setSelectedCategoryName(data.topic); // Backend sends category name as 'topic' key
      }
    } catch (e) { console.error(e); } 
    finally { setLoadingDetails(false); }
  };

  // ... (Rest of render logic is mostly same, just use selectedCategoryId instead of selectedTopicId) ...

  // Calculated Stats
  const overallEffectiveness = summaryData.reduce((acc, item) => acc + item.effectiveness, 0) / (summaryData.length || 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  // ==================== DETAIL VIEW ====================
  if (selectedCategoryId) {
    const filteredDetails = details.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="animate-fade-in">
        <button 
          onClick={() => { setSelectedCategoryId(null); setDetails([]); setSearchQuery(''); }}
          className="mb-6 flex items-center text-gray-500 hover:text-purple-600 font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Summary
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{selectedCategoryName}</h2>
              <p className="text-purple-100 text-sm mt-1">Employee Performance Breakdown</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search employee..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-64"
              />
            </div>
          </div>

          {loadingDetails ? (
            <div className="py-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Pre-Test</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Post-Test</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Gain</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDetails.map((emp, idx) => (
                    <tr key={idx} className="hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-500">{emp.code}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg font-bold text-sm">{emp.pre_score}%</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-bold text-sm">{emp.post_score}%</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`flex items-center justify-center gap-1 font-bold ${emp.gain > 0 ? 'text-green-600' : emp.gain < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {emp.gain > 0 ? <TrendingUp className="w-4 h-4" /> : emp.gain < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                          {emp.gain > 0 ? '+' : ''}{Math.round(emp.gain)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          emp.status === 'Improved' ? 'bg-green-100 text-green-700' :
                          emp.status === 'Declined' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDetails.length === 0 && (
                <div className="text-center py-12 text-gray-500">No employees found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== SUMMARY VIEW ====================
  if (summaryData.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl shadow-lg border border-gray-100">
        <BarChart3 className="w-24 h-24 text-gray-300 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800">No Data Available</h3>
        <p className="text-gray-500">Complete both Pre-Tests and Post-Tests to see effectiveness reports.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Training Effectiveness</h1>
              <p className="text-indigo-100 text-lg">Real-time impact analysis of refresher training</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/30 text-center min-w-[200px]">
              <div className="text-5xl font-bold">{Math.round(overallEffectiveness)}%</div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-100 mt-1">Overall Impact</div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaryData.map((item, index) => (
            <button 
              key={index} 
              onClick={() => setSelectedCategoryId(item.topic_id)} // Using item.topic_id which is category_id
              className="text-left bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden group w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">Training Category</div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2 h-14">{item.topic}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${
                    item.effectiveness >= 100 ? 'bg-green-100 text-green-700' : 
                    item.effectiveness >= 50 ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {Math.round(item.effectiveness)}% Impact
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Pre-Test Avg</span>
                      <span className="font-bold text-gray-700">{item.pre_avg}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: `${item.pre_avg}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Post-Test Avg</span>
                      <span className="font-bold text-purple-600">{item.post_avg}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${item.post_avg}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-green-600 font-bold">
                    <TrendingUp className="w-5 h-5" />
                    +{Math.round(item.improvement)}% Gain
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm group-hover:text-purple-600 transition-colors">
                    <Users className="w-4 h-4" />
                    {item.employee_count} employees
                  </div>
                </div>
              </div>
              <div className={`h-1.5 w-full ${
                item.effectiveness >= 100 ? 'bg-green-500' : item.effectiveness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainingEffectivenessReport;