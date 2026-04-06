import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle, Lock, Play, Monitor, 
  MousePointer, BookOpen, RefreshCw 
} from 'lucide-react';
import { FileText, Image as ImageIcon, Link as LinkIcon } from "lucide-react";

const API_BASE = 'http://127.0.0.1:8000';

interface Props {
  batch: any;
  schedule: any;
  topicFiles: any[];
  onBack: () => void;
  onLaunchTest: (type: 'pre' | 'post', mode: 'individual' | 'remote') => void;
}

const RefresherBatchView: React.FC<Props> = ({ 
  batch, 
  schedule, 
  topicFiles, 
  onBack, 
  onLaunchTest 
}) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pre_completed: 0,
    post_completed: 0,
    total_employees: batch.employees.length
  });

  useEffect(() => {
    checkBatchProgress();
    const interval = setInterval(checkBatchProgress, 5000); // Poll every 5s for updates
    return () => clearInterval(interval);
  }, [batch.id]);

  const checkBatchProgress = async () => {
    try {
      // We assume backend has an endpoint or we filter sessions. 
      // For now, let's reuse the test start endpoint which returns session status
      const resPre = await fetch(`${API_BASE}/refresher/test/start/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          schedule_id: schedule.id, 
          batch_id: batch.id, 
          test_type: 'pre' 
        })
      });
      const dataPre = await resPre.json();
      
      const resPost = await fetch(`${API_BASE}/refresher/test/start/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          schedule_id: schedule.id, 
          batch_id: batch.id, 
          test_type: 'post' 
        })
      });
      const dataPost = await resPost.json();

      setStats({
        pre_completed: dataPre.total_completed || 0,
        post_completed: dataPost.total_completed || 0,
        total_employees: batch.employees.length
      });
    } catch (e) {
      console.error("Error checking progress", e);
    }
  };

  const isPreTestDone = stats.pre_completed === stats.total_employees && stats.total_employees > 0;
  const isPostTestDone = stats.post_completed === stats.total_employees && stats.total_employees > 0;

  const getFileIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="w-5 h-5 text-purple-600" />;
    if (type === 'link') return <LinkIcon className="w-5 h-5 text-blue-600" />;
    return <FileText className="w-5 h-5 text-orange-600" />;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-gray-500 hover:text-purple-600 font-bold transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Staging
        </button>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900">{batch.name}</h2>
          <p className="text-gray-500 text-sm">{stats.total_employees} Employees</p>
        </div>
      </div>

      {/* STEP 1: PRE-TEST */}
      <div className={`bg-white rounded-3xl shadow-lg border p-8 transition-all ${isPreTestDone ? 'border-green-200 bg-green-50/30' : 'border-purple-200'}`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
              <h3 className="text-xl font-bold text-gray-900">Pre-Test Assessment</h3>
            </div>
            <p className="text-gray-500 ml-11">Assess initial knowledge before training.</p>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${isPreTestDone ? 'text-green-600' : 'text-purple-600'}`}>
              {stats.pre_completed}/{stats.total_employees}
            </span>
            <p className="text-xs uppercase font-bold text-gray-400">Completed</p>
          </div>
        </div>

        {!isPreTestDone ? (
          <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => onLaunchTest('pre', 'individual')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center justify-center gap-3 group"
            >
              <MousePointer className="w-6 h-6 text-gray-400 group-hover:text-purple-600" />
              <span className="font-bold text-gray-600 group-hover:text-purple-700">Individual Mode</span>
            </button>
            <button 
              onClick={() => onLaunchTest('pre', 'remote')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center justify-center gap-3 group"
            >
              <Monitor className="w-6 h-6 text-gray-400 group-hover:text-purple-600" />
              <span className="font-bold text-gray-600 group-hover:text-purple-700">Remote Group Mode</span>
            </button>
          </div>
        ) : (
          <div className="ml-11 flex items-center gap-2 text-green-600 font-bold bg-green-100 px-4 py-2 rounded-xl w-fit">
            <CheckCircle className="w-5 h-5" /> Pre-Test Completed
          </div>
        )}
      </div>

      {/* STEP 2: CONTENT */}
      <div className={`bg-white rounded-3xl shadow-lg border p-8 transition-all ${!isPreTestDone ? 'opacity-50 grayscale' : 'border-blue-200'}`}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
             <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isPreTestDone ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}`}>2</span>
             <h3 className="text-xl font-bold text-gray-900">Training Content</h3>
          </div>
          {!isPreTestDone && <Lock className="w-6 h-6 text-gray-300" />}
        </div>

        <div className="ml-11">
           {isPreTestDone ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {topicFiles.length > 0 ? topicFiles.map(file => (
                  <a 
                    key={file.id}
                    href={file.content_type === 'link' ? file.link : `${API_BASE}${file.file}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 border rounded-xl hover:shadow-md hover:border-blue-300 transition-all bg-white"
                  >
                    <div className="p-2 bg-gray-50 rounded-lg">{getFileIcon(file.content_type)}</div>
                    <span className="font-bold text-gray-700 truncate">{file.content_name}</span>
                  </a>
               )) : <p className="text-gray-400 italic">No content uploaded.</p>}
             </div>
           ) : (
             <p className="text-gray-400">Complete Pre-Test to unlock training materials.</p>
           )}
        </div>
      </div>

      {/* STEP 3: POST-TEST */}
      <div className={`bg-white rounded-3xl shadow-lg border p-8 transition-all ${!isPreTestDone ? 'opacity-50 grayscale' : isPostTestDone ? 'border-green-200 bg-green-50/30' : 'border-orange-200'}`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isPreTestDone ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-500'}`}>3</span>
              <h3 className="text-xl font-bold text-gray-900">Post-Test Assessment</h3>
            </div>
            <p className="text-gray-500 ml-11">Verify knowledge retention.</p>
          </div>
          {!isPreTestDone ? (
             <Lock className="w-6 h-6 text-gray-300" />
          ) : (
            <div className="text-right">
              <span className={`text-2xl font-bold ${isPostTestDone ? 'text-green-600' : 'text-orange-600'}`}>
                {stats.post_completed}/{stats.total_employees}
              </span>
              <p className="text-xs uppercase font-bold text-gray-400">Completed</p>
            </div>
          )}
        </div>

        {isPreTestDone ? (
           !isPostTestDone ? (
            <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => onLaunchTest('post', 'individual')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-3 group"
              >
                <MousePointer className="w-6 h-6 text-gray-400 group-hover:text-orange-600" />
                <span className="font-bold text-gray-600 group-hover:text-orange-700">Individual Mode</span>
              </button>
              <button 
                onClick={() => onLaunchTest('post', 'remote')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-3 group"
              >
                <Monitor className="w-6 h-6 text-gray-400 group-hover:text-orange-600" />
                <span className="font-bold text-gray-600 group-hover:text-orange-700">Remote Group Mode</span>
              </button>
            </div>
           ) : (
            <div className="ml-11 flex items-center gap-2 text-green-600 font-bold bg-green-100 px-4 py-2 rounded-xl w-fit">
              <CheckCircle className="w-5 h-5" /> Batch Completed!
            </div>
           )
        ) : (
          <div className="ml-11 p-4 bg-gray-100 rounded-xl text-gray-400 text-sm font-medium">
             Locked until Pre-Test is completed.
          </div>
        )}
      </div>

    </div>
  );
};

export default RefresherBatchView;