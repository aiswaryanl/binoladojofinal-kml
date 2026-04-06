// import React, { useState, useEffect, useRef } from 'react';
// import { useLocation } from 'react-router-dom';

// // Configure your API base URL
// const API_BASE_URL = 'http://127.0.0.1:8000';

// interface Topic {
//   sr_no: number;
//   topic_name: string;
//   description: string;
// }

// interface CheckSheetData {
//   operatorCategory: string;
//   operatorName: string;
//   processName: string;
//   supervisorName: string;
//   evaluationStartDate: string;
//   evaluationEndDate: string;
//   level: 'Level 2' | 'Level 3' | 'Level 4';
//   topics: {
//     srNo: number;
//     topicName: string;
//     description: string;
//     days: Record<string, string>;
//   }[];
//   remarks: string;
//   score: string;
//   signatures: { supervisor: string; checkedBy: string };
//   marksObtained: string;
//   value: string;
//   result: string;
// }

// interface LocationState {
//   stationId: number;
//   stationName: string;
//   sublineId: number | null;
//   sublineName: string | null;
//   lineId: number | null;
//   lineName: string | null;
//   departmentId: number;
//   departmentName: string | null;
//   levelId: number;
//   levelName: string;
//   employeeName?: string;
//   employeeId?: string;
// }

// const OperatorObservanceCheckSheet = () => {
//   const location = useLocation();
//   const locationState = (location.state as LocationState & { employeeName?: string; employeeId?: string }) || {};

//   const [topics, setTopics] = useState<Topic[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   if (!locationState?.stationId || !locationState?.levelId || !locationState?.levelName) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center p-8">
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">Missing Required Information</h2>
//           <p className="text-gray-600">Station ID, Level ID, and Level Name are required.</p>
//         </div>
//       </div>
//     );
//   }

//   useEffect(() => {
//     const fetchTopics = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`${API_BASE_URL}/topics/`);
//         if (!response.ok) throw new Error('Failed to fetch topics');
//         const data = await response.json();
//         setTopics(data);
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching topics:', err);
//         setError('Failed to load topics from server');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTopics();
//   }, []);

//   const [formData, setFormData] = useState<CheckSheetData>(() => {
//     const validLevels = ['Level 2', 'Level 3', 'Level 4'];
//     const level = validLevels.includes(locationState.levelName)
//       ? (locationState.levelName as 'Level 2' | 'Level 3' | 'Level 4')
//       : 'Level 2';

//     return {
//       operatorCategory: '',
//       operatorName: locationState.employeeName || '',
//       processName: locationState.stationName || '',
//       supervisorName: '',
//       evaluationStartDate: '',
//       evaluationEndDate: '',
//       level,
//       topics: [],
//       remarks: '',
//       score: '0%',
//       signatures: { supervisor: '', checkedBy: '' },
//       marksObtained: '',
//       value: '',
//       result: '',
//     };
//   });

//   useEffect(() => {
//     if (topics.length > 0) {
//       let initialDays: Record<string, string>;
//       switch (formData.level) {
//         case 'Level 2':
//           initialDays = { D1: '', D2: '', D3: '', D4: '', D5: '', D6: '' };
//           break;
//         case 'Level 3':
//           initialDays = { W1: '', W2: '', W3: '', W4: '' };
//           break;
//         case 'Level 4':
//           initialDays = { Jan: '', Feb: '', Mar: '', Apr: '', May: '', Jun: '', Jul: '', Aug: '', Sep: '', Oct: '', Nov: '', Dec: '' };
//           break;
//         default:
//           initialDays = { D1: '', D2: '', D3: '', D4: '', D5: '', D6: '' };
//       }

//       setFormData((prev) => ({
//         ...prev,
//         topics: topics.map((topic) => ({
//           srNo: topic.sr_no,
//           topicName: topic.topic_name,
//           description: topic.description,
//           days: { ...initialDays },
//         })),
//       }));
//     }
//   }, [topics, formData.level]);

//   useEffect(() => {
//     const fetchExistingSheet = async () => {
//       if (!locationState.employeeName || !formData.level || !locationState.stationName) return;

//       const url = `${API_BASE_URL}/observancesheets/operator/${encodeURIComponent(locationState.employeeName)}/level/${encodeURIComponent(formData.level)}/station/${encodeURIComponent(locationState.stationName)}/`;

//       try {
//         const response = await fetch(url);
//         if (response.ok) {
//           const existingData = await response.json();
//           setFormData(prev => ({
//             ...prev,
//             operatorCategory: existingData.operator_category || '',
//             operatorName: existingData.operator_name || locationState.employeeName || '',
//             processName: existingData.process_name || locationState.stationName || '',
//             supervisorName: existingData.supervisor_name || '',
//             evaluationStartDate: existingData.evaluation_start_date || '',
//             evaluationEndDate: existingData.evaluation_end_date || '',
//             remarks: existingData.remarks || '',
//             marksObtained: existingData.marks_obtained || '',
//             signatures: existingData.signatures || { supervisor: '', checkedBy: '' },
//             topics: prev.topics.map(topic => ({
//               ...topic,
//               days: existingData.marks?.[topic.srNo] || topic.days,
//             })),
//           }));
//         }
//       } catch (err) {
//         console.error('Failed to fetch sheet:', err);
//       }
//     };

//     if (formData.topics.length > 0) {
//       fetchExistingSheet();
//     }
//   }, [locationState.employeeName, locationState.stationName, formData.topics.length]);

//   const clickState = useRef<{ srNo: number; period: string; clickCount: number; timeout?: NodeJS.Timeout }>({ 
//     srNo: 0, 
//     period: '', 
//     clickCount: 0 
//   });

//   useEffect(() => {
//     const periods = getPeriods();
//     const totalTopics = formData.topics.length;
//     let totalOCount = 0;
//     let totalPossibleMarks = totalTopics * periods.length;

//     let emptyCount = 0;
//     let totalFilledMarks = 0;
//     let hasCross = false;
//     let hasO = false;

//     formData.topics.forEach(topic => {
//       periods.forEach(period => {
//         const mark = topic.days[period];
//         if (mark === '') {
//           emptyCount++;
//         } else {
//           totalFilledMarks++;
//           if (mark === 'X') hasCross = true;
//           if (mark === 'O') hasO = true;
//         }
//         if (mark === 'O') {
//           totalOCount++;
//         }
//       });
//     });

//     const allEmpty = emptyCount === totalPossibleMarks;
//     const allFilled = emptyCount === 0;

//     const periodScores: Record<string, number> = {};
//     periods.forEach(period => {
//       let periodOkCount = 0;
//       formData.topics.forEach(topic => {
//         if (topic.days[period] === 'O') periodOkCount++;
//       });
//       periodScores[period] = totalTopics > 0 ? (periodOkCount / totalTopics) * 100 : 0;
//     });

//     const validPeriodScores = periods.map(period => periodScores[period]).filter(s => s !== undefined);
//     const overallScore = validPeriodScores.length > 0 ? validPeriodScores.reduce((sum, s) => sum + s, 0) / validPeriodScores.length : 0;

//     let newResult = '';
//     if (allEmpty) {
//       newResult = '';
//     } else if (allFilled && hasCross) {
//       newResult = 'Re-training';
//     } else if (allFilled && !hasCross && hasO) {
//       newResult = 'Qualified';
//     } else {
//       newResult = 'Pending';
//     }

//     setFormData(prev => ({
//       ...prev,
//       score: `${overallScore.toFixed(2)}%`,
//       value: `${overallScore.toFixed(2)}%`,
//       marksObtained: `${totalOCount} / ${totalPossibleMarks}`,
//       result: newResult,
//     }));
//   }, [formData.topics]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleTopicChange = (srNo: number, period: string, value: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       topics: prev.topics.map((topic) =>
//         topic.srNo === srNo ? { ...topic, days: { ...topic.days, [period]: value } } : topic
//       ),
//     }));
//   };

//   const handleDescriptionChange = (srNo: number, value: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       topics: prev.topics.map((topic) =>
//         topic.srNo === srNo ? { ...topic, description: value } : topic
//       ),
//     }));
//   };

//   const isPeriodEnabled = (period: string): boolean => {
//     const periods = getPeriods();
//     const periodIndex = periods.indexOf(period);

//     if (periodIndex === 0) return true;

//     for (let i = 0; i < periodIndex; i++) {
//       const previousPeriod = periods[i];
//       const allTopicsFilled = formData.topics.every(topic => 
//         topic.days[previousPeriod] && topic.days[previousPeriod] !== ''
//       );
//       if (!allTopicsFilled) return false;
//     }

//     return true;
//   };

//   const handlePeriodClick = (srNo: number, period: string, event: React.MouseEvent<HTMLInputElement>) => {
//     event.preventDefault();

//     if (!isPeriodEnabled(period)) {
//       return;
//     }

//     if (clickState.current.timeout) {
//       clearTimeout(clickState.current.timeout);
//     }

//     if (clickState.current.srNo === srNo && clickState.current.period === period) {
//       clickState.current.clickCount += 1;
//     } else {
//       clickState.current = { srNo, period, clickCount: 1 };
//     }

//     clickState.current.timeout = setTimeout(() => {
//       const { clickCount, srNo: currentSrNo, period: currentPeriod } = clickState.current;
//       const currentValue = formData.topics.find((t) => t.srNo === currentSrNo)?.days[currentPeriod] || '';

//       if (clickCount === 1 && currentValue !== 'O') {
//         handleTopicChange(currentSrNo, currentPeriod, 'O');
//       } else if (clickCount === 2 && currentValue !== 'X') {
//         handleTopicChange(currentSrNo, currentPeriod, 'X');
//       } else if (clickCount >= 3) {
//         handleTopicChange(currentSrNo, currentPeriod, '');
//       }
//       clickState.current = { srNo: 0, period: '', clickCount: 0 };
//     }, 300);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const marks: Record<string, Record<string, string>> = {};
//       formData.topics.forEach((topic) => {
//         marks[topic.srNo.toString()] = topic.days;
//       });

//       const payload = {
//         operator_name: formData.operatorName,
//         operator_category: formData.operatorCategory,
//         process_name: formData.processName,
//         supervisor_name: formData.supervisorName,
//         evaluation_start_date: formData.evaluationStartDate,
//         evaluation_end_date: formData.evaluationEndDate,
//         level: formData.level,
//         marks: marks,
//         remarks: formData.remarks,
//         score: formData.score,
//         marks_obtained: formData.marksObtained,
//         value: formData.value,
//         result: formData.result,
//         signatures: formData.signatures,
//         department_id: locationState.departmentId,
//         department_name: locationState.departmentName,
//       };

//       const checkUrl = `${API_BASE_URL}/observancesheets/operator/${encodeURIComponent(formData.operatorName)}/level/${encodeURIComponent(formData.level)}/station/${encodeURIComponent(formData.processName)}/`;

//       try {
//         const checkResponse = await fetch(checkUrl);

//         if (checkResponse.ok) {
//           const existingData = await checkResponse.json();
//           const updateUrl = `${API_BASE_URL}/observancesheets/${existingData.id}/`;

//           const updateResponse = await fetch(updateUrl, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload),
//           });

//           if (!updateResponse.ok) throw new Error('Failed to update check sheet');
//           const data = await updateResponse.json();
//           console.log('Form Data Updated Successfully:', data);
//           alert('Check sheet updated successfully!');
//         } else {
//           const response = await fetch(`${API_BASE_URL}/observancesheets/`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload),
//           });

//           if (!response.ok) throw new Error('Failed to submit check sheet');
//           const data = await response.json();
//           console.log('Form Data Submitted Successfully:', data);
//           alert('Check sheet submitted successfully!');
//         }
//       } catch (err) {
//         const response = await fetch(`${API_BASE_URL}/observancesheets/`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(payload),
//         });

//         if (!response.ok) throw new Error('Failed to submit check sheet');
//         const data = await response.json();
//         console.log('Form Data Submitted Successfully:', data);
//         alert('Check sheet submitted successfully!');
//       }
//     } catch (err) {
//       console.error('Error submitting form:', err);
//       alert('Failed to submit check sheet. Please try again.');
//     }
//   };

//   const getPeriods = (): string[] => {
//     switch (formData.level) {
//       case 'Level 2': return ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'];
//       case 'Level 3': return ['W1', 'W2', 'W3', 'W4'];
//       case 'Level 4': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//       default: return ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'];
//     }
//   };

//   const getHeading = (): string => {
//     switch (formData.level) {
//       case 'Level 2': return 'Days';
//       case 'Level 3': return 'Weeks';
//       case 'Level 4': return 'Months';
//       default: return 'Days';
//     }
//   };

//   const getPeriodScores = (): Record<string, number> => {
//     const periods = getPeriods();
//     const totalTopics = formData.topics.length;
//     const periodScores: Record<string, number> = {};
//     periods.forEach((period) => {
//       let periodOkCount = 0;
//       formData.topics.forEach((topic) => {
//         if (topic.days[period] === 'O') periodOkCount += 1;
//       });
//       periodScores[period] = totalTopics > 0 ? (periodOkCount / totalTopics) * 100 : 0;
//     });
//     return periodScores;
//   };

//   const rowGroups = (() => {
//     const groups: Record<string, { start: number; end: number; count: number }> = {};
//     formData.topics.forEach((topic) => {
//       if (!groups[topic.topicName]) {
//         groups[topic.topicName] = { start: topic.srNo, end: topic.srNo, count: 1 };
//       } else {
//         groups[topic.topicName].end = topic.srNo;
//         groups[topic.topicName].count += 1;
//       }
//     });
//     return Object.entries(groups).map(([topicName, { start, end, count }]) => ({
//       start, end, topicName, rowSpan: count,
//     }));
//   })();

//   const periodScores = getPeriodScores();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center p-8">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading check sheet...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center p-8">
//           <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
//           <p className="text-gray-600">{error}</p>
//           <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-6 sm:p-8 text-white text-center">
//           <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Operator Observance Check Sheet</h2>
//           <p className="text-sm mt-2">{locationState.stationName} - {locationState.levelName}</p>
//         </div>
//         <form onSubmit={handleSubmit} className="p-6 sm:p-8">
//           <div className="mb-8">
//             <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//               </svg>
//               Trainee Information
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-blue-50 p-4 sm:p-6 rounded-xl">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Operator Category</label>
//                 <div className="space-y-2">
//                   {['New Operator', 'Re-join after some time', 'Transfer from other station'].map((category) => (
//                     <label key={category} className="flex items-center">
//                       <input
//                         type="checkbox"
//                         value={category}
//                         checked={formData.operatorCategory.includes(category)}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           setFormData((prev) => ({
//                             ...prev,
//                             operatorCategory: prev.operatorCategory.includes(value)
//                               ? prev.operatorCategory.replace(value, '').replace(/, ,/g, ',').trim().replace(/^,|,$/g, '')
//                               : prev.operatorCategory + (prev.operatorCategory ? ', ' : '') + value,
//                           }));
//                         }}
//                         className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                       />
//                       <span className="ml-2 text-sm text-gray-600">{category}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Operator Name</label>
//                 <input type="text" name="operatorName" value={formData.operatorName} onChange={handleInputChange}
//                   className="block w-full border border-gray-200 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Process Name</label>
//                 <input type="text" name="processName" value={formData.processName} onChange={handleInputChange}
//                   className="block w-full border border-gray-200 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor Name</label>
//                 <input type="text" name="supervisorName" value={formData.supervisorName} onChange={handleInputChange}
//                   className="block w-full border border-gray-200 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Start Date</label>
//                 <input type="date" name="evaluationStartDate" value={formData.evaluationStartDate} onChange={handleInputChange}
//                   className="block w-full border border-gray-200 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation End Date</label>
//                 <input type="date" name="evaluationEndDate" value={formData.evaluationEndDate} onChange={handleInputChange}
//                   className="block w-full border border-gray-200 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
//               </div>
//             </div>
//           </div>
//           <div className="mb-8">
//             <h3 className="text-lg sm:text-xl font-semibold text-indigo-800 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//               </svg>
//               Training Topics & Assessment
//             </h3>
//             <div className="overflow-x-auto rounded-xl shadow-sm">
//               <table className="w-full border-collapse bg-white">
//                 <thead>
//                   <tr className="bg-indigo-700 text-white text-sm">
//                     <th className="border border-gray-200 p-2 w-12">Sr. No.</th>
//                     <th className="border border-gray-200 p-2 w-32">Topic Name</th>
//                     <th className="border border-gray-200 p-2 w-64">Procedure Description</th>
//                     {getPeriods().map((period) => (
//                       <th key={period} className="border border-gray-200 p-2 w-12 text-center">{period}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {rowGroups.map((group) => (
//                     <React.Fragment key={group.topicName}>
//                       {formData.topics.filter((topic) => topic.srNo >= group.start && topic.srNo <= group.end).map((topic, index) => (
//                         <tr key={topic.srNo} className="hover:bg-gray-100 transition">
//                           <td className="border border-gray-200 p-2 text-center text-sm">{topic.srNo}</td>
//                           {index === 0 && (
//                             <td className="border border-gray-200 p-2 text-center align-middle text-sm font-medium text-gray-700" rowSpan={group.rowSpan}>
//                               {group.topicName}
//                             </td>
//                           )}
//                           <td className="border border-gray-200 p-2">
//                             <input type="text" value={topic.description} onChange={(e) => handleDescriptionChange(topic.srNo, e.target.value)}
//                               className="w-full border border-gray-200 rounded-lg p-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
//                           </td>
//                           {getPeriods().map((period) => {
//                             const isEnabled = isPeriodEnabled(period);
//                             return (
//                               <td key={period} className="border border-gray-200 p-2 text-center">
//                                 <input 
//                                   type="text" 
//                                   value={topic.days[period] || ''} 
//                                   onClick={(e) => handlePeriodClick(topic.srNo, period, e)}
//                                   disabled={!isEnabled}
//                                   className={`w-8 h-8 text-center font-bold rounded-md border-2 focus:outline-none transition ${
//                                     isEnabled ? 'cursor-pointer border-gray-300' : 'cursor-not-allowed border-gray-200 bg-gray-100'
//                                   }`}
//                                   style={{
//                                     color: topic.days[period] === 'O' ? '#10B981' : topic.days[period] === 'X' ? '#EF4444' : '#1F2937',
//                                     backgroundColor: !isEnabled ? '#F9FAFB' : topic.days[period] ? '#F3F4F6' : 'white',
//                                     opacity: !isEnabled ? 0.5 : 1,
//                                   }}
//                                   readOnly
//                                   title={isEnabled ? "Single click for 'O' (OK), double click for 'X' (NG), triple click to clear" : "Complete previous periods first"}
//                                 />
//                               </td>
//                             );
//                           })}
//                         </tr>
//                       ))}
//                     </React.Fragment>
//                   ))}
//                   <tr className="bg-blue-50 font-semibold text-gray-800">
//                     <td className="border border-gray-200 p-2 text-center text-sm" colSpan={2}>{getHeading()}-wise Score</td>
//                     <td className="border border-gray-200 p-2 text-center text-sm">Total</td>
//                     {getPeriods().map((period) => (
//                       <td key={period} className="border border-gray-200 p-2 text-center text-sm">{periodScores[period].toFixed(2)}%</td>
//                     ))}
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Remarks: If any? (Mention details of NG observation)</label>
//             <textarea name="remarks" value={formData.remarks} onChange={handleInputChange}
//               className="block w-full border border-gray-200 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24 transition"
//               placeholder="Enter any remarks here..." />
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score</label>
//               <input type="text" value={formData.score} readOnly
//                 className="block w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-100 cursor-not-allowed" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained</label>
//               <input type="text" name="marksObtained" value={formData.marksObtained} onChange={handleInputChange}
//                 className="block w-full border border-gray-200 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-blue-500 transition" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Checked By (Incharge Name)</label>
//               <input type="text" value={formData.signatures.checkedBy}
//                 onChange={(e) => setFormData((prev) => ({ ...prev, signatures: { ...prev.signatures, checkedBy: e.target.value } }))}
//                 className="block w-full border border-gray-200 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-blue-500 transition" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Value (%)</label>
//               <input type="text" value={formData.value} readOnly
//                 className="block w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-100 cursor-not-allowed" />
//             </div>
//           </div>
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
//             <div className={`p-4 rounded-lg border-2 text-center font-bold text-lg ${
//               formData.result === 'Qualified' ? 'bg-green-100 border-green-500 text-green-800' :
//               formData.result === 'Re-training' ? 'bg-red-100 border-red-500 text-red-800' :
//               formData.result === 'Pending' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
//               'bg-gray-100 border-gray-300 text-gray-600'
//             }`}>
//               {formData.result || 'Not Evaluated'}
//             </div>
//           </div>
//           <div className="flex items-center mb-6">
//             <label className="block text-sm font-medium text-gray-700 mr-4">Legends:</label>
//             <span className="text-sm text-gray-600">
//               <span className="text-green-600 font-bold">O</span>: OK;{' '}
//               <span className="text-red-600 font-bold">X</span>: Not Good (NG); NA: Not Applicable
//             </span>
//           </div>
//           <button type="submit"
//             className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition duration-300 text-sm font-medium">
//             Submit Check Sheet
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default OperatorObservanceCheckSheet;




import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface Topic {
  sr_no: number;
  topic_name: string;
  description: string;
}

interface CheckSheetData {
  operatorCategory: string;
  operatorName: string;
  processName: string;
  supervisorName: string;
  evaluationStartDate: string;
  evaluationEndDate: string;
  level: 'Level 2' | 'Level 3' | 'Level 4';
  topics: {
    srNo: number;
    topicName: string;
    description: string;
    days: Record<string, string>;
  }[];
  remarks: string;
  score: string;
  signatures: { supervisor: string; checkedBy: string };
  marksObtained: string;
  value: string;
  result: string;
}

interface LocationState {
  stationId: number;
  stationName: string;
  sublineId: number | null;
  sublineName: string | null;
  lineId: number | null;
  lineName: string | null;
  departmentId: number;
  departmentName: string | null;
  levelId: number;
  levelName: string;
  employeeName?: string;
  employeeId?: string;
}

const OperatorObservanceCheckSheet = () => {
  const location = useLocation();
  const locationState = (location.state as LocationState & { employeeName?: string; employeeId?: string }) || {};

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!locationState?.stationId || !locationState?.levelId || !locationState?.levelName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Missing Required Information</h2>
          <p className="text-gray-600">Station ID, Level ID, and Level Name are required.</p>
        </div>
      </div>
    );
  }

  // === Fetch Topics ===
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/topics/`);
        if (!response.ok) throw new Error('Failed to fetch topics');
        const data = await response.json();
        setTopics(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError('Failed to load topics from server');
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  // === Initialize Form Data ===
  const [formData, setFormData] = useState<CheckSheetData>(() => {
    const validLevels = ['Level 2', 'Level 3', 'Level 4'];
    const level = validLevels.includes(locationState.levelName)
      ? (locationState.levelName as 'Level 2' | 'Level 3' | 'Level 4')
      : 'Level 2';

    return {
      operatorCategory: '',
      operatorName: locationState.employeeName || '',
      processName: locationState.stationName || '',
      supervisorName: '',
      evaluationStartDate: '',
      evaluationEndDate: '',
      level,
      topics: [],
      remarks: '',
      score: '0%',
      signatures: { supervisor: '', checkedBy: '' },
      marksObtained: '',
      value: '',
      result: '',
    };
  });

  // === Initialize Topics with Days ===
  useEffect(() => {
    if (topics.length === 0) return;

    let initialDays: Record<string, string> = {};
    switch (formData.level) {
      case 'Level 2':
        initialDays = { D1: '', D2: '', D3: '', D4: '', D5: '', D6: '' };
        break;
      case 'Level 3':
        initialDays = { W1: '', W2: '', W3: '', W4: '' };
        break;
      case 'Level 4':
        initialDays = { Jan: '', Feb: '', Mar: '', Apr: '', May: '', Jun: '', Jul: '', Aug: '', Sep: '', Oct: '', Nov: '', Dec: '' };
        break;
      default:
        initialDays = { D1: '', D2: '', D3: '', D4: '', D5: '', D6: '' };
    }

    setFormData((prev) => ({
      ...prev,
      topics: topics.map((topic) => ({
        srNo: topic.sr_no,
        topicName: topic.topic_name,
        description: topic.description,
        days: { ...initialDays },
      })),
    }));
  }, [topics, formData.level]);

  // === Fetch Existing Sheet (FIXED) ===
  useEffect(() => {
    const fetchExistingSheet = async () => {
      if (
        !locationState.employeeName ||
        !formData.level ||
        !locationState.stationName ||
        topics.length === 0
      ) {
        return;
      }

      setSheetLoading(true);
      const url = `${API_BASE_URL}/observancesheets/operator/${encodeURIComponent(
        locationState.employeeName
      )}/level/${encodeURIComponent(formData.level)}/station/${encodeURIComponent(
        locationState.stationName
      )}/`;

      try {
        const response = await fetch(url);
        if (response.ok) {
          const existingData = await response.json();
          console.log('Loaded saved sheet:', existingData); // DEBUG

          const savedMarks = existingData.marks || {};

          setFormData((prev) => ({
            ...prev,
            operatorCategory: existingData.operator_category || '',
            operatorName: existingData.operator_name || locationState.employeeName || '',
            processName: existingData.process_name || locationState.stationName || '',
            supervisorName: existingData.supervisor_name || '',
            evaluationStartDate: existingData.evaluation_start_date || '',
            evaluationEndDate: existingData.evaluation_end_date || '',
            remarks: existingData.remarks || '',
            marksObtained: existingData.marks_obtained || '',
            value: existingData.value || '',
            score: existingData.score || '0%',
            result: existingData.result || '',
            signatures: existingData.signatures || { supervisor: '', checkedBy: '' },
            topics: prev.topics.map((topic) => ({
              ...topic,
              days: savedMarks[String(topic.srNo)] || topic.days, // FIXED: String key
            })),
          }));
        }
      } catch (err) {
        console.error('Failed to fetch existing sheet:', err);
      } finally {
        setSheetLoading(false);
      }
    };

    fetchExistingSheet();
  }, [topics, locationState.employeeName, locationState.stationName, formData.level]);

  // === Score Calculation ===
  const clickState = useRef<{ srNo: number; period: string; clickCount: number; timeout?: NodeJS.Timeout }>({
    srNo: 0,
    period: '',
    clickCount: 0,
  });

  useEffect(() => {
    const periods = getPeriods();
    const totalTopics = formData.topics.length;
    let totalOCount = 0;
    let totalPossibleMarks = totalTopics * periods.length;

    let emptyCount = 0;
    let hasCross = false;
    let hasO = false;

    formData.topics.forEach((topic) => {
      periods.forEach((period) => {
        const mark = topic.days[period];
        if (!mark) emptyCount++;
        else {
          if (mark === 'O') {
            totalOCount++;
            hasO = true;
          }
          if (mark === 'X') hasCross = true;
        }
      });
    });

    const allEmpty = emptyCount === totalPossibleMarks;
    const allFilled = emptyCount === 0;

    const periodScores: Record<string, number> = {};
    periods.forEach((period) => {
      let okCount = 0;
      formData.topics.forEach((topic) => {
        if (topic.days[period] === 'O') okCount++;
      });
      periodScores[period] = totalTopics > 0 ? (okCount / totalTopics) * 100 : 0;
    });

    const validScores = Object.values(periodScores).filter((s) => s !== undefined);
    const overallScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;

    let newResult = '';
    if (allEmpty) newResult = '';
    else if (allFilled && hasCross) newResult = 'Re-training';
    else if (allFilled && hasO) newResult = 'Qualified';
    else newResult = 'Pending';

    setFormData((prev) => ({
      ...prev,
      score: `${overallScore.toFixed(2)}%`,
      value: `${overallScore.toFixed(2)}%`,
      marksObtained: `${totalOCount} / ${totalPossibleMarks}`,
      result: newResult,
    }));
  }, [formData.topics]);

  // === Handlers ===
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTopicChange = (srNo: number, period: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.map((t) =>
        t.srNo === srNo ? { ...t, days: { ...t.days, [period]: value } } : t
      ),
    }));
  };

  const handleDescriptionChange = (srNo: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.map((t) =>
        t.srNo === srNo ? { ...t, description: value } : t
      ),
    }));
  };

  const isPeriodEnabled = (period: string): boolean => {
    const periods = getPeriods();
    const idx = periods.indexOf(period);
    if (idx === 0) return true;
    for (let i = 0; i < idx; i++) {
      const prev = periods[i];
      const allFilled = formData.topics.every((t) => t.days[prev] && t.days[prev] !== '');
      if (!allFilled) return false;
    }
    return true;
  };

  const handlePeriodClick = (srNo: number, period: string, event: React.MouseEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (!isPeriodEnabled(period)) return;

    if (clickState.current.timeout) clearTimeout(clickState.current.timeout);

    if (clickState.current.srNo === srNo && clickState.current.period === period) {
      clickState.current.clickCount++;
    } else {
      clickState.current = { srNo, period, clickCount: 1 };
    }

    clickState.current.timeout = setTimeout(() => {
      const { clickCount, srNo: curSrNo, period: curPeriod } = clickState.current;
      const current = formData.topics.find((t) => t.srNo === curSrNo)?.days[curPeriod] || '';

      if (clickCount === 1 && current !== 'O') handleTopicChange(curSrNo, curPeriod, 'O');
      else if (clickCount === 2 && current !== 'X') handleTopicChange(curSrNo, curPeriod, 'X');
      else if (clickCount >= 3) handleTopicChange(curSrNo, curPeriod, '');

      clickState.current = { srNo: 0, period: '', clickCount: 0 };
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const marks: Record<string, Record<string, string>> = {};
    formData.topics.forEach((topic) => {
      marks[String(topic.srNo)] = topic.days; // Save as string keys
    });

    const payload = {
      operator_name: formData.operatorName,
      operator_category: formData.operatorCategory,
      process_name: formData.processName,
      supervisor_name: formData.supervisorName,
      evaluation_start_date: formData.evaluationStartDate,
      evaluation_end_date: formData.evaluationEndDate,
      level: formData.level,
      marks,
      remarks: formData.remarks,
      score: formData.score,
      marks_obtained: formData.marksObtained,
      value: formData.value,
      result: formData.result,
      signatures: formData.signatures,
      department_id: locationState.departmentId,
      department_name: locationState.departmentName,
    };

    const checkUrl = `${API_BASE_URL}/observancesheets/operator/${encodeURIComponent(
      formData.operatorName
    )}/level/${encodeURIComponent(formData.level)}/station/${encodeURIComponent(formData.processName)}/`;

    try {
      const checkResponse = await fetch(checkUrl);
      let response;

      if (checkResponse.ok) {
        const existing = await checkResponse.json();
        response = await fetch(`${API_BASE_URL}/observancesheets/${existing.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/observancesheets/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error('Failed to save');
      alert('Check sheet saved successfully!');
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to save. Please try again.');
    }
  };

  const getPeriods = (): string[] => {
    switch (formData.level) {
      case 'Level 2': return ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'];
      case 'Level 3': return ['W1', 'W2', 'W3', 'W4'];
      case 'Level 4': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default: return ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'];
    }
  };

  const getHeading = (): string => {
    switch (formData.level) {
      case 'Level 2': return 'Days';
      case 'Level 3': return 'Weeks';
      case 'Level 4': return 'Months';
      default: return 'Days';
    }
  };

  const getPeriodScores = (): Record<string, number> => {
    const periods = getPeriods();
    const total = formData.topics.length;
    const scores: Record<string, number> = {};
    periods.forEach((p) => {
      const ok = formData.topics.filter((t) => t.days[p] === 'O').length;
      scores[p] = total > 0 ? (ok / total) * 100 : 0;
    });
    return scores;
  };

  const rowGroups = (() => {
    const groups: Record<string, { start: number; end: number; count: number }> = {};
    formData.topics.forEach((t) => {
      if (!groups[t.topicName]) {
        groups[t.topicName] = { start: t.srNo, end: t.srNo, count: 1 };
      } else {
        groups[t.topicName].end = t.srNo;
        groups[t.topicName].count++;
      }
    });
    return Object.entries(groups).map(([name, { start, end, count }]) => ({
      topicName: name,
      start,
      end,
      rowSpan: count,
    }));
  })();

  const periodScores = getPeriodScores();

  // === Loading & Error States ===
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading check sheet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // === Main Render ===
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-6 sm:p-8 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Operator Observance Check Sheet</h2>
          <p className="text-sm mt-2">{locationState.stationName} - {locationState.levelName}</p>
        </div>

        {sheetLoading && (
          <div className="p-4 bg-blue-50 text-blue-700 text-center">
            Loading saved data...
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          {/* === Trainee Info === */}
          <div className="mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Trainee Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-blue-50 p-4 sm:p-6 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operator Category</label>
                <div className="space-y-2">
                  {['New Operator', 'Re-join after some time', 'Transfer from other station'].map((cat) => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="checkbox"
                        value={cat}
                        checked={formData.operatorCategory.includes(cat)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            operatorCategory: prev.operatorCategory.includes(val)
                              ? prev.operatorCategory.replace(val, '').replace(/, ,/g, ',').trim().replace(/^,|,$/g, '')
                              : prev.operatorCategory + (prev.operatorCategory ? ', ' : '') + val,
                          }));
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              {['operatorName', 'processName', 'supervisorName'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field === 'operatorName' ? 'Operator Name' : field === 'processName' ? 'Process Name' : 'Supervisor Name'}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field as keyof Pick<CheckSheetData, 'operatorName' | 'processName' | 'supervisorName'>]}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-200 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Start Date</label>
                <input type="date" name="evaluationStartDate" value={formData.evaluationStartDate} onChange={handleInputChange}
                  className="block w-full border border-gray-200 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation End Date</label>
                <input type="date" name="evaluationEndDate" value={formData.evaluationEndDate} onChange={handleInputChange}
                  className="block w-full border border-gray-200 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
              </div>
            </div>
          </div>

          {/* === Table === */}
          <div className="mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-indigo-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Training Topics & Assessment
            </h3>
            <div className="overflow-x-auto rounded-xl shadow-sm">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-indigo-700 text-white text-sm">
                    <th className="border border-gray-200 p-2 w-12">Sr. No.</th>
                    <th className="border border-gray-200 p-2 w-32">Topic Name</th>
                    <th className="border border-gray-200 p-2 w-64">Procedure Description</th>
                    {getPeriods().map((p) => (
                      <th key={p} className="border border-gray-200 p-2 w-12 text-center">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowGroups.map((group) => (
                    <React.Fragment key={group.topicName}>
                      {formData.topics
                        .filter((t) => t.srNo >= group.start && t.srNo <= group.end)
                        .map((topic, idx) => (
                          <tr key={topic.srNo} className="hover:bg-gray-100 transition">
                            <td className="border border-gray-200 p-2 text-center text-sm">{topic.srNo}</td>
                            {idx === 0 && (
                              <td className="border border-gray-200 p-2 text-center align-middle text-sm font-medium text-gray-700" rowSpan={group.rowSpan}>
                                {group.topicName}
                              </td>
                            )}
                            <td className="border border-gray-200 p-2">
                              <input
                                type="text"
                                value={topic.description}
                                onChange={(e) => handleDescriptionChange(topic.srNo, e.target.value)}
                                className="w-full border border-gray-200 rounded-lg p-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                              />
                            </td>
                            {getPeriods().map((period) => {
                              const enabled = isPeriodEnabled(period);
                              return (
                                <td key={period} className="border border-gray-200 p-2 text-center">
                                  <input
                                    type="text"
                                    value={topic.days[period] || ''}
                                    onClick={(e) => handlePeriodClick(topic.srNo, period, e)}
                                    disabled={!enabled}
                                    readOnly
                                    className={`w-8 h-8 text-center font-bold rounded-md border-2 focus:outline-none transition ${enabled ? 'cursor-pointer border-gray-300' : 'cursor-not-allowed border-gray-200 bg-gray-100'
                                      }`}
                                    style={{
                                      color: topic.days[period] === 'O' ? '#10B981' : topic.days[period] === 'X' ? '#EF4444' : '#1F2937',
                                      backgroundColor: enabled ? (topic.days[period] ? '#F3F4F6' : 'white') : '#F9FAFB',
                                      opacity: enabled ? 1 : 0.5,
                                    }}
                                    title={enabled ? "Click: O → X → Clear" : "Complete previous periods"}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
                  <tr className="bg-blue-50 font-semibold text-gray-800">
                    <td className="border border-gray-200 p-2 text-center text-sm" colSpan={2}>{getHeading()}-wise Score</td>
                    <td className="border border-gray-200 p-2 text-center text-sm">Total</td>
                    {getPeriods().map((p) => (
                      <td key={p} className="border border-gray-200 p-2 text-center text-sm">{periodScores[p].toFixed(2)}%</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* === Remarks & Results === */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks: If any? (Mention details of NG observation)</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="block w-full border border-gray-200 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24 transition"
              placeholder="Enter any remarks here..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score</label>
              <input type="text" value={formData.score} readOnly className="block w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-100 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained</label>
              <input type="text" name="marksObtained" value={formData.marksObtained} onChange={handleInputChange}
                className="block w-full border border-gray-200 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-blue-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Checked By (Incharge Name)</label>
              <input
                type="text"
                value={formData.signatures.checkedBy}
                onChange={(e) => setFormData((prev) => ({ ...prev, signatures: { ...prev.signatures, checkedBy: e.target.value } }))}
                className="block w-full border border-gray-200 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value (%)</label>
              <input type="text" value={formData.value} readOnly className="block w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-100 cursor-not-allowed" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
            <div className={`p-4 rounded-lg border-2 text-center font-bold text-lg ${formData.result === 'Qualified' ? 'bg-green-100 border-green-500 text-green-800' :
                formData.result === 'Re-training' ? 'bg-red-100 border-red-500 text-red-800' :
                  formData.result === 'Pending' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                    'bg-gray-100 border-gray-300 text-gray-600'
              }`}>
              {formData.result || 'Not Evaluated'}
            </div>
          </div>

          <div className="flex items-center mb-6">
            <label className="block text-sm font-medium text-gray-700 mr-4">Legends:</label>
            <span className="text-sm text-gray-600">
              <span className="text-green-600 font-bold">O</span>: OK;{' '}
              <span className="text-red-600 font-bold">X</span>: Not Good (NG); NA: Not Applicable
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition duration-300 text-sm font-medium"
          >
            Submit Check Sheet
          </button>
        </form>
      </div>
    </div>
  );
};

export default OperatorObservanceCheckSheet;