// import React, { useState, useEffect, useCallback } from 'react';
// import { useLocation } from 'react-router-dom';
// import Header from './components/Header';
// import EmployeeInfoSection from './components/EmployeeInfoSection';
// import QualityEvaluation from './components/QualityEvaluation';
// import type { EmployeeInfo, Module, Sequence } from './types/evaluation';
// import { Save, Download, CheckCircle, Loader2 } from 'lucide-react';
// import { employeeData } from '../../../Retraining/data/employeeData';

// interface LocationState {
//   employeeData?: {
//     name: string;
//     code: string;
//     designation: string;
//     department: string;
//     line: '',  // Add this
//     station: '',
//     dateOfJoining: string;
//     email: string;
//     phone: string;
//   };
//   stationId?: number;
//   stationName?: string;
//   sublineId?: number;
//   sublineName?: string;
//   lineId?: number;
//   lineName?: string;
//   departmentId?: number;
//   departmentName?: string;
//   levelId?: number;
//   levelName?: string;
//   sheetType?: 'productivity' | 'quality';
// }
// console.log()
// async function fetchEmployeeDetails(empId: string) {
//   const response = await fetch(`http://192.168.2.51:8000/mastertable/?emp_id=${empId}`);
//   if (!response.ok) throw new Error('Failed to fetch employee details');
//   const data = await response.json();
//   if (!data.length) throw new Error('Employee not found');
//   return data[0];
// }

// async function fetchEmployeeEvaluations(empId: string) {
//   const response = await fetch(`http://192.168.2.51:8000/qualityevaluations/?employee=${empId}`);
//   if (!response.ok) throw new Error('Failed to fetch evaluations');
//   return await response.json();
// }

// async function fetchEmployeeIdByEmpId(empId: string) {
//   const response = await fetch(`http://192.168.2.51:8000/mastertable/${empId}`);
//   if (!response.ok) throw new Error('Cannot fetch employee');
//   const employees = await response.json();
//   if (!employees.length) throw new Error('Employee not found');
//   return employees[0].emp_id;
// }

// function QualitySheet() {
//   const location = useLocation();
//   const locationState = location.state as LocationState;

//   const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo>({
//     name: '',
//     code: '',
//     designation: '',
//     department: '',
//     line: '',  // Add this
//     station: '',  // Add this
//     dateOfJoining: '',
//     evaluationdate: '',
//     maxMarks: 15,
//     obtainedMarks: 0,
//     percentage: 0,
//     result: '',
//     trainerName: '',
//     trainerSign: '',
//   });

//   const [qualityModule, setQualityModule] = useState<Module>({
//     id: 'quality',
//     title: 'Defective Part Segregation',
//     focusPoint: 'Quality',
//     sequences: [
//       {
//         id: 'seq1',
//         description: "Following dress code & uses PPE's",
//         methodTime: 1,
//         e1: 0,
//         e2: 0,
//         e3: 0,
//         cycleTime: 0,
//         actualTime: 0,
//       },
//       {
//         id: 'seq2',
//         description: "5'S' check",
//         methodTime: 2,
//         e1: 0,
//         e2: 0,
//         e3: 0,
//         cycleTime: 0,
//         actualTime: 0,
//       },
//       {
//         id: 'seq3',
//         description: 'Picking & Observe the master part',
//         methodTime: 2,
//         e1: 0,
//         e2: 0,
//         e3: 0,
//         cycleTime: 0,
//         actualTime: 0,
//       },
//       {
//         id: 'seq4',
//         description: 'Compare working Part with master part',
//         methodTime: 2,
//         e1: 0,
//         e2: 0,
//         e3: 0,
//         cycleTime: 0,
//         actualTime: 0,
//       },
//       {
//         id: 'seq5',
//         description: 'Adherence of W.I.',
//         methodTime: 2,
//         e1: 0,
//         e2: 0,
//         e3: 0,
//         cycleTime: 0,
//         actualTime: 0,
//       },
//       {
//         id: 'seq6',
//         description: 'Quality check',
//         methodTime: 2,
//         e1: 0,
//         e2: 0,
//         e3: 0,
//         cycleTime: 0,
//         actualTime: 0,
//       },
//       {
//         id: 'seq7',
//         description: 'Defect Identification',
//         methodTime: 2,
//         e1: 0,
//         e2: 0,
//         e3: 0,
//         cycleTime: 0,
//         actualTime: 0,
//       },
//       {
//         id: 'seq8',
//         description: 'Cycle Time (in secs.) : 10',
//         methodTime: 0,
//         e1: 0,
//         e2: 0,
//         e3: 0,
//         cycleTime: 10,
//         actualTime: 0,
//       },
//       {
//         id: 'seq9',
//         description: 'Actual Time (in secs.) .........',
//         methodTime: 2,
//         e1: 0,
//         e2: 0,
//         e3: 0,
//         cycleTime: 10,
//         actualTime: 0,
//       },
//     ],
//     marksObtained: 0,
//     maxMarks: 15,
//     remarks: '',
//     cycleTime: 10,
//     actualTime: 0,
//   });

//   const [isSaving, setIsSaving] = useState(false);
//   const [currentEvaluationRound, setCurrentEvaluationRound] = useState<1 | 2 | 3>(1);

//   const getThreshold = (methodTime: number) => Math.ceil(methodTime * 0.8);

//   const updateEmployeeInfo = (field: keyof EmployeeInfo, value: string | number) => {
//     setEmployeeInfo(prev => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const updateQualityModule = (field: keyof Module, value: any) => {
//     setQualityModule(prev => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const updateQualitySequence = (sequenceId: string, field: keyof Sequence, value: any) => {
//     setQualityModule(prev => ({
//       ...prev,
//       sequences: prev.sequences.map(sequence =>
//         sequence.id === sequenceId
//           ? { ...sequence, [field]: value }
//           : sequence
//       ),
//     }));
//   };

//   const addQualitySequence = () => {
//     const newSequence: Sequence = {
//       id: `seq${Date.now()}`,
//       description: '',
//       methodTime: 2,
//       e1: 0,
//       e2: 0,
//       e3: 0,
//       cycleTime: qualityModule.sequences[0]?.cycleTime || 10,
//       actualTime: 0,
//     };

//     setQualityModule(prev => ({
//       ...prev,
//       sequences: [...prev.sequences, newSequence],
//     }));
//   };

//   const removeQualitySequence = (sequenceId: string) => {
//     setQualityModule(prev => ({
//       ...prev,
//       sequences: prev.sequences.filter(seq => seq.id !== sequenceId),
//     }));
//   };

//   // Calculate individual column totals (E1, E2, E3)
//   const calculateColumnTotals = useCallback(() => {
//     let e1Total = 0;
//     let e2Total = 0;
//     let e3Total = 0;

//     for (const seq of qualityModule.sequences) {
//       // Skip cycle time row (methodTime = 0)
//       if (seq.description.toLowerCase().includes('cycle time') && seq.methodTime === 0) continue;

//       e1Total += seq.e1;
//       e2Total += seq.e2;
//       e3Total += seq.e3;
//     }

//     return { e1Total, e2Total, e3Total };
//   }, [qualityModule.sequences]);

//   // Corrected function to determine current evaluation round
//   const determineCurrentEvaluationRound = useCallback((e1Total: number, e2Total: number, e3Total: number) => {
//     console.log('Determining evaluation round with totals:', { e1Total, e2Total, e3Total });

//     // If any round has passed (>=12), that's the successful round
//     if (e1Total >= 12) {
//       console.log('E1 passed, setting round to 1');
//       return 1;
//     }
//     if (e2Total >= 12) {
//       console.log('E2 passed, setting round to 2');
//       return 2;
//     }
//     if (e3Total >= 12) {
//       console.log('E3 passed, setting round to 3');
//       return 3;
//     }

//     // If no round has passed, determine which round should be active
//     if (e1Total === 0 && e2Total === 0 && e3Total === 0) {
//       // No attempts yet, start with E1
//       console.log('No attempts yet, setting round to 1');
//       return 1;
//     } else if (e1Total > 0 && e1Total < 12 && e2Total === 0 && e3Total === 0) {
//       // E1 attempted but failed, move to E2
//       console.log('E1 failed, moving to E2');
//       return 2;
//     } else if (e2Total > 0 && e2Total < 12 && e3Total === 0) {
//       // E2 attempted but failed, move to E3
//       console.log('E2 failed, moving to E3');
//       return 3;
//     } else if (e2Total > 0 && e3Total === 0) {
//       // E2 has data but E3 is empty, continue with E2
//       console.log('E2 has data, continuing with E2');
//       return 2;
//     } else if (e3Total > 0) {
//       // E3 has data, continue with E3
//       console.log('E3 has data, continuing with E3');
//       return 3;
//     }

//     // Default fallback
//     console.log('Fallback to E1');
//     return 1;
//   }, []);

//   useEffect(() => {
//     if (locationState?.employeeData) {
//       console.log("Navigation state received:", locationState?.employeeData);
//       const { employeeData } = locationState;
//       setEmployeeInfo(prev => ({
//         ...prev,
//         name: employeeData.name,
//         code: employeeData.code,
//         designation: employeeData.designation || '',
//         // department: employeeData.department,
//         dateOfJoining: employeeData.dateOfJoining,
//         evaluationdate: new Date().toISOString().split('T')[0],
//       }));
//     }
//   }, [locationState]);

//   useEffect(() => {
//     if (employeeInfo.code) {
//       Promise.all([
//         fetchEmployeeDetails(employeeInfo.code),
//         fetchEmployeeEvaluations(employeeInfo.code),
//       ])
//         .then(([employee, evaluations]) => {
//           setEmployeeInfo(prev => ({
//             ...prev,
//             // name: `${employee.first_name} ${employee.last_name}`,
//             designation: employee.designation || '',
//          department: employee.department_name || prev.department || '',           // ← backend preferred
//         line: employee.sub_department_name || prev.line || '',                   // ← backend preferred
//         station: employee.station_name || prev.station || '', 
//             dateOfJoining: prev.dateOfJoining || employee.date_of_joining || '',
//           }));

//           if (evaluations.length > 0) {
//             const latestEval = evaluations[0];
//             const mappedSequences = latestEval.qualitysequences.map((seq: any) => ({
//               id: seq.id,
//               description: seq.sequence_name,
//               methodTime: seq.mt,
//               e1: seq.e1,
//               e2: seq.e2,
//               e3: seq.e3,
//               cycleTime: seq.cycle_time,
//               actualTime: seq.actual_time,
//             }));

//             console.log('Loading sequences from backend:', mappedSequences);

//             setQualityModule(prev => ({
//               ...prev,
//               sequences: mappedSequences,
//               marksObtained: latestEval.obtained_marks,
//               maxMarks: latestEval.max_marks,
//               remarks: latestEval.remarks || '',
//             }));

//             setEmployeeInfo(prev => ({
//               ...prev,
//               obtainedMarks: latestEval.obtained_marks,
//               maxMarks: latestEval.max_marks,
//               percentage: latestEval.percentage,
//               result: latestEval.status,
//               evaluationdate: latestEval.evaluation_date,
//               trainerName: latestEval.trainer_name || '',
//             }));

//             // Calculate column totals from loaded data
//             let e1Total = 0, e2Total = 0, e3Total = 0;
//             mappedSequences.forEach((seq: any) => {
//               if (!(seq.description.toLowerCase().includes('cycle time') && seq.methodTime === 0)) {
//                 e1Total += seq.e1;
//                 e2Total += seq.e2;
//                 e3Total += seq.e3;
//               }
//             });

//             console.log('Calculated totals from loaded data:', { e1Total, e2Total, e3Total });

//             // Set current evaluation round based on the calculated totals
//             const newRound = determineCurrentEvaluationRound(e1Total, e2Total, e3Total);
//             setCurrentEvaluationRound(newRound);
//             console.log('Set current evaluation round to:', newRound);
//           }
//         })
//         .catch(error => {
//           console.error('Fetch employee or evaluations error:', error);
//         });
//     }
//   }, [employeeInfo.code, determineCurrentEvaluationRound]);

//   const calculateFrontendResults = useCallback(() => {
//     const { e1Total, e2Total, e3Total } = calculateColumnTotals();

//     // Determine the final marks based on the best performance across all rounds
//     let finalMarks = 0;
//     let finalPercentage = 0;
//     let finalStatus = 'FAIL';

//     // Check each evaluation round separately
//     if (e1Total >= 12) {
//       finalMarks = e1Total;
//       finalPercentage = (e1Total / 15) * 100;
//       finalStatus = 'PASS';
//     } else if (e2Total >= 12) {
//       finalMarks = e2Total;
//       finalPercentage = (e2Total / 15) * 100;
//       finalStatus = 'PASS';
//     } else if (e3Total >= 12) {
//       finalMarks = e3Total;
//       finalPercentage = (e3Total / 15) * 100;
//       finalStatus = 'PASS';
//     } else {
//       // If none passed, use the highest score
//       finalMarks = Math.max(e1Total, e2Total, e3Total);
//       finalPercentage = (finalMarks / 15) * 100;
//       finalStatus = 'FAIL';
//     }

//     setEmployeeInfo(prev => ({
//       ...prev,
//       obtainedMarks: finalMarks,
//       maxMarks: 15,
//       percentage: parseFloat(finalPercentage.toFixed(1)),
//       result: finalStatus,
//     }));

//     setQualityModule(prev => ({
//       ...prev,
//       marksObtained: finalMarks,
//       maxMarks: 15,
//     }));
//   }, [calculateColumnTotals]);

//   useEffect(() => {
//     calculateFrontendResults();
//   }, [qualityModule.sequences, calculateFrontendResults]);

//   const handleSave = async () => {
//     setIsSaving(true);
//     try {
//       if (!employeeInfo.code || !employeeInfo.evaluationdate) {
//         showNotification('Employee code and evaluation date are required!', 'error');
//         setIsSaving(false);
//         return;
//       }

//       // const employeePk = await fetchEmployeeIdByEmpId(employeeInfo.code);
//       // console.log("employeePk:", employeePk);

//       const employeePk = employeeInfo.code;
//       console.log("employeePk (emp_id):", employeePk);

//       // Calculate column totals for backend
//       const { e1Total, e2Total, e3Total } = calculateColumnTotals();

//       // Determine final results based on column totals
//       let finalMarks = 0;
//       let finalPercentage = 0;
//       let finalStatus = 'FAIL';

//       if (e1Total >= 12) {
//         finalMarks = e1Total;
//         finalPercentage = (e1Total / 15) * 100;
//         finalStatus = 'PASS';
//       } else if (e2Total >= 12) {
//         finalMarks = e2Total;
//         finalPercentage = (e2Total / 15) * 100;
//         finalStatus = 'PASS';
//       } else if (e3Total >= 12) {
//         finalMarks = e3Total;
//         finalPercentage = (e3Total / 15) * 100;
//         finalStatus = 'PASS';
//       } else {
//         // If none passed, use the highest score
//         finalMarks = Math.max(e1Total, e2Total, e3Total);
//         finalPercentage = (finalMarks / 15) * 100;
//         finalStatus = 'FAIL';
//       }

//       const evaluationResponse = await fetch('http://192.168.2.51:8000/qualityevaluations/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//         body: JSON.stringify({
//           employee: employeePk,
//           evaluation_date: employeeInfo.evaluationdate,
//           trainer_name: employeeInfo.trainerName || '',
//           obtained_marks: finalMarks,
//           max_marks: 15,
//           percentage: finalPercentage,
//           status: finalStatus,
//           remarks: qualityModule.remarks || '',
//         }),
//       });

//       if (!evaluationResponse.ok) {
//         const errorText = await evaluationResponse.text();
//         let errorData;
//         try {
//           errorData = JSON.parse(errorText);
//         } catch {
//           errorData = { error: errorText };
//         }
//         console.error('Failed to create evaluation:', errorData);
//         throw new Error(`Failed to create evaluation: ${JSON.stringify(errorData)}`);
//       }

//       const evaluationText = await evaluationResponse.text();
//       let evaluation;
//       try {
//         evaluation = JSON.parse(evaluationText);
//       } catch {
//         throw new Error('Invalid response format from server');
//       }

//       const evaluationId = evaluation.id;

//       for (const sequence of qualityModule.sequences) {
//         const sequenceResponse = await fetch('http://192.168.2.51:8000/qualitysequences/', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//           body: JSON.stringify({
//             evaluation: evaluationId,
//             sequence_name: sequence.description,
//             mt: sequence.methodTime,
//             e1: sequence.e1,
//             e2: sequence.e2,
//             e3: sequence.e3,
//             cycle_time: sequence.cycleTime,
//             actual_time: sequence.actualTime,
//           }),
//         });

//         if (!sequenceResponse.ok) {
//           const errorText = await sequenceResponse.text();
//           let errorData;
//           try {
//             errorData = JSON.parse(errorText);
//           } catch {
//             errorData = { error: errorText };
//           }
//           console.error('Failed to create sequence:', errorData);
//           throw new Error(`Failed to create sequence ${sequence.description}: ${JSON.stringify(errorData)}`);
//         }
//       }

//       const calculateResponse = await fetch(
//         `http://192.168.2.51:8000/qualityevaluations/${evaluationId}/calculate_results/`,
//         { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' } }
//       );

//       if (!calculateResponse.ok) {
//         const errorText = await calculateResponse.text();
//         let errorData;
//         try {
//           errorData = JSON.parse(errorText);
//         } catch {
//           errorData = { error: errorText };
//         }
//         console.error('Failed to calculate results:', errorData);
//         throw new Error(`Failed to calculate results: ${JSON.stringify(errorData)}`);
//       }

//       const resultText = await calculateResponse.text();
//       let result;
//       try {
//         result = JSON.parse(resultText);
//       } catch {
//         throw new Error('Invalid response format from calculation endpoint');
//       }

//       setEmployeeInfo(prev => ({
//         ...prev,
//         obtainedMarks: result.obtained_marks,
//         maxMarks: result.max_marks,
//         percentage: parseFloat(result.percentage.toFixed(1)),
//         result: result.status,
//       }));

//       setQualityModule(prev => ({
//         ...prev,
//         marksObtained: result.obtained_marks,
//         maxMarks: result.max_marks,
//       }));

//       // Update evaluation round based on new results after save
//       const newColumnTotals = calculateColumnTotals();
//       const newRound = determineCurrentEvaluationRound(newColumnTotals.e1Total, newColumnTotals.e2Total, newColumnTotals.e3Total);
//       setCurrentEvaluationRound(newRound);
//       console.log('After save, set current evaluation round to:', newRound);

//       showNotification('Evaluation saved successfully!', 'success');
//     } catch (err) {
//       console.error('Error saving evaluation:', err);
//       showNotification(`Error saving evaluation: ${err instanceof Error ? err.message : String(err)}`, 'error');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleExport = () => {
//     const evaluationData = {
//       employeeInfo,
//       qualityModule,
//       columnTotals: calculateColumnTotals(),
//       currentEvaluationRound,
//       locationInfo: {
//         stationId: locationState?.stationId,
//         stationName: locationState?.stationName,
//         sublineId: locationState?.sublineId,
//         sublineName: locationState?.sublineName,
//         lineId: locationState?.lineId,
//         lineName: locationState?.lineName,
//         departmentId: locationState?.departmentId,
//         departmentName: locationState?.departmentName,
//         levelId: locationState?.levelId,
//         levelName: locationState?.levelName,
//       },
//     };

//     const dataStr = JSON.stringify(evaluationData, null, 2);
//     const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

//     const exportFileDefaultName = `quality_evaluation_${employeeInfo.name.replace(/\s+/g, '_') || 'employee'}_${new Date().toISOString().split('T')[0]
//       }.json`;

//     const linkElement = document.createElement('a');
//     linkElement.setAttribute('href', dataUri);
//     linkElement.setAttribute('download', exportFileDefaultName);
//     linkElement.click();
//   };

//   const showNotification = (message: string, type: 'success' | 'error') => {
//     const notification = document.createElement('div');
//     notification.className = `fixed top-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 transition-all duration-300`;
//     notification.innerHTML = `
//       <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//         ${type === 'success'
//         ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>'
//         : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>'
//       }
//       </svg>
//       <span>${message}</span>
//     `;
//     document.body.appendChild(notification);
//     setTimeout(() => {
//       if (document.body.contains(notification)) {
//         document.body.removeChild(notification);
//       }
//     }, 4000);
//   };

//   // Get column totals for passing to ProductivityEvaluation
//   const { e1Total, e2Total, e3Total } = calculateColumnTotals();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100 p-6">
//       <div className="w-full space-y-6">
//         <Header />

//         <EmployeeInfoSection employeeInfo={employeeInfo} onUpdate={updateEmployeeInfo} />

//         <QualityEvaluation
//           module={qualityModule}
//           onUpdateModule={updateQualityModule}
//           onUpdateSequence={updateQualitySequence}
//           getThreshold={getThreshold}
//           onAddSequence={addQualitySequence}
//           onRemoveSequence={removeQualitySequence}
//           currentEvaluationRound={currentEvaluationRound}
//           obtainedMarks={employeeInfo.obtainedMarks}
//           e1Total={e1Total}
//           e2Total={e2Total}
//           e3Total={e3Total}
//         />

//         <div className="bg-white border-2 border-black shadow-lg rounded-lg p-6">
//           <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
//             <CheckCircle className="w-6 h-6 text-blue-600" />
//             <span>Quality Evaluation Summary</span>
//           </h3>

//           {/* Current Round Indicator */}
//           <div className="mb-6 text-center">
//             <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
//               <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
//               <span className="font-semibold">Currently on Evaluation Round: E{currentEvaluationRound}</span>
//             </div>
//           </div>

//           {/* Individual Column Results */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <div className={`text-center p-4 rounded-lg border-2 transition-all duration-300 ${e1Total >= 12
//                 ? 'bg-green-50 border-green-200 shadow-green-100'
//                 : e1Total > 0
//                   ? 'bg-red-50 border-red-200 shadow-red-100'
//                   : 'bg-gray-50 border-gray-200'
//               } ${currentEvaluationRound === 1 ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}>
//               <div className="text-sm font-semibold text-gray-700 mb-2">
//                 E1 Results
//                 {currentEvaluationRound === 1 && (
//                   <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Active</span>
//                 )}
//               </div>
//               <div className={`text-2xl font-bold ${e1Total >= 12
//                   ? 'text-green-600'
//                   : e1Total > 0
//                     ? 'text-red-600'
//                     : 'text-gray-500'
//                 }`}>
//                 {e1Total}/15 - {e1Total >= 12 ? 'PASS' : e1Total > 0 ? 'FAIL' : 'PENDING'}
//               </div>
//               <div className="text-sm text-gray-600">
//                 {e1Total > 0 ? `${((e1Total / 15) * 100).toFixed(1)}%` : 'Not attempted'}
//               </div>
//             </div>

//             <div className={`text-center p-4 rounded-lg border-2 transition-all duration-300 ${e2Total >= 12
//                 ? 'bg-green-50 border-green-200 shadow-green-100'
//                 : e2Total > 0
//                   ? 'bg-red-50 border-red-200 shadow-red-100'
//                   : 'bg-gray-50 border-gray-200'
//               } ${currentEvaluationRound === 2 ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}>
//               <div className="text-sm font-semibold text-gray-700 mb-2">
//                 E2 Results
//                 {currentEvaluationRound === 2 && (
//                   <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Active</span>
//                 )}
//               </div>
//               <div className={`text-2xl font-bold ${e2Total >= 12
//                   ? 'text-green-600'
//                   : e2Total > 0
//                     ? 'text-red-600'
//                     : 'text-gray-500'
//                 }`}>
//                 {e2Total}/15 - {e2Total >= 12 ? 'PASS' : e2Total > 0 ? 'FAIL' : 'PENDING'}
//               </div>
//               <div className="text-sm text-gray-600">
//                 {e2Total > 0 ? `${((e2Total / 15) * 100).toFixed(1)}%` : 'Not attempted'}
//               </div>
//             </div>

//             <div className={`text-center p-4 rounded-lg border-2 transition-all duration-300 ${e3Total >= 12
//                 ? 'bg-green-50 border-green-200 shadow-green-100'
//                 : e3Total > 0
//                   ? 'bg-red-50 border-red-200 shadow-red-100'
//                   : 'bg-gray-50 border-gray-200'
//               } ${currentEvaluationRound === 3 ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}>
//               <div className="text-sm font-semibold text-gray-700 mb-2">
//                 E3 Results
//                 {currentEvaluationRound === 3 && (
//                   <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Active</span>
//                 )}
//               </div>
//               <div className={`text-2xl font-bold ${e3Total >= 12
//                   ? 'text-green-600'
//                   : e3Total > 0
//                     ? 'text-red-600'
//                     : 'text-gray-500'
//                 }`}>
//                 {e3Total}/15 - {e3Total >= 12 ? 'PASS' : e3Total > 0 ? 'FAIL' : 'PENDING'}
//               </div>
//               <div className="text-sm text-gray-600">
//                 {e3Total > 0 ? `${((e3Total / 15) * 100).toFixed(1)}%` : 'Not attempted'}
//               </div>
//             </div>
//           </div>



//           {/* Overall Result */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//             <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
//               <div className="text-sm font-semibold text-blue-700 mb-2">Final Marks</div>
//               <div className="text-3xl font-bold text-blue-800">
//                 {employeeInfo.obtainedMarks} / {employeeInfo.maxMarks}
//               </div>
//             </div>

//             <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
//               <div className="text-sm font-semibold text-indigo-700 mb-2">Final Percentage</div>
//               <div
//                 className={`text-3xl font-bold ${employeeInfo.result === 'PASS' ? 'text-green-600' : 'text-red-600'}`}
//               >
//                 {employeeInfo.percentage.toFixed(1)}%
//               </div>
//             </div>

//             <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
//               <div className="text-sm font-semibold text-gray-700 mb-2">Final Status</div>
//               <div className="text-2xl font-bold px-4 py-2 rounded-lg flex items-center justify-center space-x-2">
//                 {employeeInfo.result === 'PASS' ? (
//                   <span className="bg-green-100 text-green-800 border border-green-300 px-3 py-1 rounded flex items-center">
//                     <CheckCircle className="w-5 h-5 mr-2" />
//                     <span>PASS</span>
//                   </span>
//                 ) : (
//                   <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded flex items-center">
//                     <CheckCircle className="w-5 h-5 mr-2" />
//                     <span>FAIL</span>
//                   </span>
//                 )}
//               </div>
//             </div>

//             <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
//               <div className="text-sm font-semibold text-purple-700 mb-2">Required</div>
//               <div className="text-2xl font-bold text-purple-800">80% Min</div>
//               <div className="text-xs text-purple-600 mt-1">(≥12/15 marks)</div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-wrap items-center justify-center gap-4">
//             <button
//               onClick={handleSave}
//               disabled={isSaving}
//               className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${isSaving
//                   ? 'bg-blue-400 cursor-not-allowed text-white'
//                   : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
//                 }`}
//             >
//               {isSaving ? (
//                 <div className="flex items-center">
//                   <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//                   <span className="font-semibold">Saving...</span>
//                 </div>
//               ) : (
//                 <>
//                   <Save className="w-5 h-5" />
//                   <span className="font-semibold">Save & Evaluate</span>
//                 </>
//               )}
//             </button>

//             <button
//               onClick={handleExport}
//               className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
//             >
//               <Download className="w-5 h-5" />
//               <span className="font-semibold">Export Data</span>
//             </button>
//           </div>



//         </div>
//       </div>
//     </div>
//   );
// }

// export default QualitySheet;




import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';
import EmployeeInfoSection from './components/EmployeeInfoSection';
import QualityEvaluation from './components/QualityEvaluation';
import type { EmployeeInfo, Module, Sequence } from './types/evaluation';
import { Save, Download, CheckCircle, Loader2 } from 'lucide-react';
import { employeeData } from '../../../Retraining/data/employeeData';

interface LocationState {
  employeeData?: {
    name: string;
    code: string;
    designation: string;
    department: string;
    line: '',  // Add this
    station: '',
    dateOfJoining: string;
    email: string;
    phone: string;
  };
  stationId?: number;
  stationName?: string;
  sublineId?: number;
  sublineName?: string;
  lineId?: number;
  lineName?: string;
  departmentId?: number;
  departmentName?: string;
  levelId?: number;
  levelName?: string;
  sheetType?: 'productivity' | 'quality';
}
console.log()
async function fetchEmployeeDetails(empId: string) {
  const response = await fetch(`http://192.168.2.51:8000/mastertable/?emp_id=${empId}`);
  if (!response.ok) throw new Error('Failed to fetch employee details');
  const data = await response.json();
  if (!data.length) throw new Error('Employee not found');
  return data[0];
}

async function fetchEmployeeEvaluations(empId: string) {
  const response = await fetch(`http://192.168.2.51:8000/qualityevaluations/?employee=${empId}`);
  if (!response.ok) throw new Error('Failed to fetch evaluations');
  return await response.json();
}

async function fetchEmployeeIdByEmpId(empId: string) {
  const response = await fetch(`http://192.168.2.51:8000/mastertable/${empId}`);
  if (!response.ok) throw new Error('Cannot fetch employee');
  const employees = await response.json();
  if (!employees.length) throw new Error('Employee not found');
  return employees[0].emp_id;
}

function QualitySheet() {
  const location = useLocation();
  const locationState = location.state as LocationState;

  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo>({
    name: '',
    code: '',
    designation: '',
    department: '',
    line: '',  // Add this
    station: '',  // Add this
    dateOfJoining: '',
    evaluationdate: '',
    maxMarks: 15,
    obtainedMarks: 0,
    percentage: 0,
    result: '',
    trainerName: '',
    trainerSign: '',
  });

  const [qualityModule, setQualityModule] = useState<Module>({
    id: 'quality',
    title: 'Defective Part Segregation',
    focusPoint: 'Quality',
    sequences: [
      {
        id: 'seq1',
        description: "Following dress code & uses PPE's",
        methodTime: 1,
        e1: 0,
        e2: 0,
        e3: 0,
        cycleTime: 0,
        actualTime: 0,
      },
      {
        id: 'seq2',
        description: "5'S' check",
        methodTime: 2,
        e1: 0,
        e2: 0,
        e3: 0,
        cycleTime: 0,
        actualTime: 0,
      },
      {
        id: 'seq3',
        description: 'Picking & Observe the master part',
        methodTime: 2,
        e1: 0,
        e2: 0,
        e3: 0,
        cycleTime: 0,
        actualTime: 0,
      },
      {
        id: 'seq4',
        description: 'Compare working Part with master part',
        methodTime: 2,
        e1: 0,
        e2: 0,
        e3: 0,
        cycleTime: 0,
        actualTime: 0,
      },
      {
        id: 'seq5',
        description: 'Adherence of W.I.',
        methodTime: 2,
        e1: 0,
        e2: 0,
        e3: 0,
        cycleTime: 0,
        actualTime: 0,
      },
      {
        id: 'seq6',
        description: 'Quality check',
        methodTime: 2,
        e1: 0,
        e2: 0,
        e3: 0,
        cycleTime: 0,
        actualTime: 0,
      },
      {
        id: 'seq7',
        description: 'Defect Identification',
        methodTime: 2,
        e1: 0,
        e2: 0,
        e3: 0,
        cycleTime: 0,
        actualTime: 0,
      },
      {
        id: 'seq8',
        description: 'Cycle Time (in secs.) : 10',
        methodTime: 0,
        e1: 0,
        e2: 0,
        e3: 0,
        cycleTime: 10,
        actualTime: 0,
      },
      {
        id: 'seq9',
        description: 'Actual Time (in secs.) .........',
        methodTime: 2,
        e1: 0,
        e2: 0,
        e3: 0,
        cycleTime: 10,
        actualTime: 0,
      },
    ],
    marksObtained: 0,
    maxMarks: 15,
    remarks: '',
    cycleTime: 10,
    actualTime: 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [currentEvaluationRound, setCurrentEvaluationRound] = useState<1 | 2 | 3>(1);

  const getThreshold = (methodTime: number) => Math.ceil(methodTime * 0.8);

  const updateEmployeeInfo = (field: keyof EmployeeInfo, value: string | number) => {
    setEmployeeInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateQualityModule = (field: keyof Module, value: any) => {
    setQualityModule(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateQualitySequence = (sequenceId: string, field: keyof Sequence, value: any) => {
    setQualityModule(prev => ({
      ...prev,
      sequences: prev.sequences.map(sequence =>
        sequence.id === sequenceId
          ? { ...sequence, [field]: value }
          : sequence
      ),
    }));
  };

  const addQualitySequence = () => {
    const newSequence: Sequence = {
      id: `seq${Date.now()}`,
      description: '',
      methodTime: 2,
      e1: 0,
      e2: 0,
      e3: 0,
      cycleTime: qualityModule.sequences[0]?.cycleTime || 10,
      actualTime: 0,
    };

    setQualityModule(prev => ({
      ...prev,
      sequences: [...prev.sequences, newSequence],
    }));
  };

  const removeQualitySequence = (sequenceId: string) => {
    setQualityModule(prev => ({
      ...prev,
      sequences: prev.sequences.filter(seq => seq.id !== sequenceId),
    }));
  };

  // Calculate individual column totals (E1, E2, E3)
  const calculateColumnTotals = useCallback(() => {
    let e1Total = 0;
    let e2Total = 0;
    let e3Total = 0;

    for (const seq of qualityModule.sequences) {
      // Skip cycle time row (methodTime = 0)
      if (seq.description.toLowerCase().includes('cycle time') && seq.methodTime === 0) continue;

      e1Total += seq.e1;
      e2Total += seq.e2;
      e3Total += seq.e3;
    }

    return { e1Total, e2Total, e3Total };
  }, [qualityModule.sequences]);

  // Corrected function to determine current evaluation round
  const determineCurrentEvaluationRound = useCallback((e1Total: number, e2Total: number, e3Total: number) => {
    console.log('Determining evaluation round with totals:', { e1Total, e2Total, e3Total });

    // If any round has passed (>=12), that's the successful round
    if (e1Total >= 12) {
      console.log('E1 passed, setting round to 1');
      return 1;
    }
    if (e2Total >= 12) {
      console.log('E2 passed, setting round to 2');
      return 2;
    }
    if (e3Total >= 12) {
      console.log('E3 passed, setting round to 3');
      return 3;
    }

    // If no round has passed, determine which round should be active
    if (e1Total === 0 && e2Total === 0 && e3Total === 0) {
      // No attempts yet, start with E1
      console.log('No attempts yet, setting round to 1');
      return 1;
    } else if (e1Total > 0 && e1Total < 12 && e2Total === 0 && e3Total === 0) {
      // E1 attempted but failed, move to E2
      console.log('E1 failed, moving to E2');
      return 2;
    } else if (e2Total > 0 && e2Total < 12 && e3Total === 0) {
      // E2 attempted but failed, move to E3
      console.log('E2 failed, moving to E3');
      return 3;
    } else if (e2Total > 0 && e3Total === 0) {
      // E2 has data but E3 is empty, continue with E2
      console.log('E2 has data, continuing with E2');
      return 2;
    } else if (e3Total > 0) {
      // E3 has data, continue with E3
      console.log('E3 has data, continuing with E3');
      return 3;
    }

    // Default fallback
    console.log('Fallback to E1');
    return 1;
  }, []);

  useEffect(() => {
    if (locationState?.employeeData) {
      console.log("Navigation state received:", locationState?.employeeData);
      const { employeeData } = locationState;
      setEmployeeInfo(prev => ({
        ...prev,
        name: employeeData.name,
        code: employeeData.code,
        designation: employeeData.designation || '',
        // department: employeeData.department,
        dateOfJoining: employeeData.dateOfJoining,
        evaluationdate: new Date().toISOString().split('T')[0],
      }));
    }
  }, [locationState]);

  useEffect(() => {
    if (employeeInfo.code) {
      Promise.all([
        fetchEmployeeDetails(employeeInfo.code),
        fetchEmployeeEvaluations(employeeInfo.code),
      ])
        .then(([employee, evaluations]) => {
          setEmployeeInfo(prev => ({
            ...prev,
            // name: `${employee.first_name} ${employee.last_name}`,
            designation: employee.designation || '',
         department: employee.department_name || prev.department || '',           // ← backend preferred
        line: employee.sub_department_name || prev.line || '',                   // ← backend preferred
        station: employee.station_name || prev.station || '', 
            dateOfJoining: prev.dateOfJoining || employee.date_of_joining || '',
          }));

          if (evaluations.length > 0) {
            const latestEval = evaluations[0];
            const mappedSequences = latestEval.qualitysequences.map((seq: any) => ({
              id: seq.id,
              description: seq.sequence_name,
              methodTime: seq.mt,
              e1: seq.e1,
              e2: seq.e2,
              e3: seq.e3,
              cycleTime: seq.cycle_time,
              actualTime: seq.actual_time,
            }));

            console.log('Loading sequences from backend:', mappedSequences);

            setQualityModule(prev => ({
              ...prev,
              sequences: mappedSequences,
              marksObtained: latestEval.obtained_marks,
              maxMarks: latestEval.max_marks,
              remarks: latestEval.remarks || '',
            }));

            setEmployeeInfo(prev => ({
              ...prev,
              obtainedMarks: latestEval.obtained_marks,
              maxMarks: latestEval.max_marks,
              percentage: latestEval.percentage,
              result: latestEval.status,
              evaluationdate: latestEval.evaluation_date,
              trainerName: latestEval.trainer_name || '',
            }));

            // Calculate column totals from loaded data
            let e1Total = 0, e2Total = 0, e3Total = 0;
            mappedSequences.forEach((seq: any) => {
              if (!(seq.description.toLowerCase().includes('cycle time') && seq.methodTime === 0)) {
                e1Total += seq.e1;
                e2Total += seq.e2;
                e3Total += seq.e3;
              }
            });

            console.log('Calculated totals from loaded data:', { e1Total, e2Total, e3Total });

            // Set current evaluation round based on the calculated totals
            const newRound = determineCurrentEvaluationRound(e1Total, e2Total, e3Total);
            setCurrentEvaluationRound(newRound);
            console.log('Set current evaluation round to:', newRound);
          }
        })
        .catch(error => {
          console.error('Fetch employee or evaluations error:', error);
        });
    }
  }, [employeeInfo.code, determineCurrentEvaluationRound]);

  const calculateFrontendResults = useCallback(() => {
    const { e1Total, e2Total, e3Total } = calculateColumnTotals();

    // Determine the final marks based on the best performance across all rounds
    let finalMarks = 0;
    let finalPercentage = 0;
    let finalStatus = 'FAIL';

    // Check each evaluation round separately
    if (e1Total >= 12) {
      finalMarks = e1Total;
      finalPercentage = (e1Total / 15) * 100;
      finalStatus = 'PASS';
    } else if (e2Total >= 12) {
      finalMarks = e2Total;
      finalPercentage = (e2Total / 15) * 100;
      finalStatus = 'PASS';
    } else if (e3Total >= 12) {
      finalMarks = e3Total;
      finalPercentage = (e3Total / 15) * 100;
      finalStatus = 'PASS';
    } else {
      // If none passed, use the highest score
      finalMarks = Math.max(e1Total, e2Total, e3Total);
      finalPercentage = (finalMarks / 15) * 100;
      finalStatus = 'FAIL';
    }

    setEmployeeInfo(prev => ({
      ...prev,
      obtainedMarks: finalMarks,
      maxMarks: 15,
      percentage: parseFloat(finalPercentage.toFixed(1)),
      result: finalStatus,
    }));

    setQualityModule(prev => ({
      ...prev,
      marksObtained: finalMarks,
      maxMarks: 15,
    }));
  }, [calculateColumnTotals]);

  useEffect(() => {
    calculateFrontendResults();
  }, [qualityModule.sequences, calculateFrontendResults]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!employeeInfo.code || !employeeInfo.evaluationdate) {
        showNotification('Employee code and evaluation date are required!', 'error');
        setIsSaving(false);
        return;
      }

      // const employeePk = await fetchEmployeeIdByEmpId(employeeInfo.code);
      // console.log("employeePk:", employeePk);

      const employeePk = employeeInfo.code;
      console.log("employeePk (emp_id):", employeePk);

      // Calculate column totals for backend
      const { e1Total, e2Total, e3Total } = calculateColumnTotals();

      // Determine final results based on column totals
      let finalMarks = 0;
      let finalPercentage = 0;
      let finalStatus = 'FAIL';

      if (e1Total >= 12) {
        finalMarks = e1Total;
        finalPercentage = (e1Total / 15) * 100;
        finalStatus = 'PASS';
      } else if (e2Total >= 12) {
        finalMarks = e2Total;
        finalPercentage = (e2Total / 15) * 100;
        finalStatus = 'PASS';
      } else if (e3Total >= 12) {
        finalMarks = e3Total;
        finalPercentage = (e3Total / 15) * 100;
        finalStatus = 'PASS';
      } else {
        // If none passed, use the highest score
        finalMarks = Math.max(e1Total, e2Total, e3Total);
        finalPercentage = (finalMarks / 15) * 100;
        finalStatus = 'FAIL';
      }

      const evaluationResponse = await fetch('http://192.168.2.51:8000/qualityevaluations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          employee: employeePk,
          evaluation_date: employeeInfo.evaluationdate,
          trainer_name: employeeInfo.trainerName || '',
          obtained_marks: finalMarks,
          max_marks: 15,
          percentage: finalPercentage,
          status: finalStatus,
          remarks: qualityModule.remarks || '',
        }),
      });

      if (!evaluationResponse.ok) {
        const errorText = await evaluationResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        console.error('Failed to create evaluation:', errorData);
        throw new Error(`Failed to create evaluation: ${JSON.stringify(errorData)}`);
      }

      const evaluationText = await evaluationResponse.text();
      let evaluation;
      try {
        evaluation = JSON.parse(evaluationText);
      } catch {
        throw new Error('Invalid response format from server');
      }

      const evaluationId = evaluation.id;

      for (const sequence of qualityModule.sequences) {
        const sequenceResponse = await fetch('http://192.168.2.51:8000/qualitysequences/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            evaluation: evaluationId,
            sequence_name: sequence.description,
            mt: sequence.methodTime,
            e1: sequence.e1,
            e2: sequence.e2,
            e3: sequence.e3,
            cycle_time: sequence.cycleTime,
            actual_time: sequence.actualTime,
          }),
        });

        if (!sequenceResponse.ok) {
          const errorText = await sequenceResponse.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }
          console.error('Failed to create sequence:', errorData);
          throw new Error(`Failed to create sequence ${sequence.description}: ${JSON.stringify(errorData)}`);
        }
      }

      const calculateResponse = await fetch(
        `http://192.168.2.51:8000/qualityevaluations/${evaluationId}/calculate_results/`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' } }
      );

      if (!calculateResponse.ok) {
        const errorText = await calculateResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        console.error('Failed to calculate results:', errorData);
        throw new Error(`Failed to calculate results: ${JSON.stringify(errorData)}`);
      }

      const resultText = await calculateResponse.text();
      let result;
      try {
        result = JSON.parse(resultText);
      } catch {
        throw new Error('Invalid response format from calculation endpoint');
      }

      setEmployeeInfo(prev => ({
        ...prev,
        obtainedMarks: result.obtained_marks,
        maxMarks: result.max_marks,
        percentage: parseFloat(result.percentage.toFixed(1)),
        result: result.status,
      }));

      setQualityModule(prev => ({
        ...prev,
        marksObtained: result.obtained_marks,
        maxMarks: result.max_marks,
      }));

      // Update evaluation round based on new results after save
      const newColumnTotals = calculateColumnTotals();
      const newRound = determineCurrentEvaluationRound(newColumnTotals.e1Total, newColumnTotals.e2Total, newColumnTotals.e3Total);
      setCurrentEvaluationRound(newRound);
      console.log('After save, set current evaluation round to:', newRound);

      showNotification('Evaluation saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving evaluation:', err);
      showNotification(`Error saving evaluation: ${err instanceof Error ? err.message : String(err)}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const evaluationData = {
      employeeInfo,
      qualityModule,
      columnTotals: calculateColumnTotals(),
      currentEvaluationRound,
      locationInfo: {
        stationId: locationState?.stationId,
        stationName: locationState?.stationName,
        sublineId: locationState?.sublineId,
        sublineName: locationState?.sublineName,
        lineId: locationState?.lineId,
        lineName: locationState?.lineName,
        departmentId: locationState?.departmentId,
        departmentName: locationState?.departmentName,
        levelId: locationState?.levelId,
        levelName: locationState?.levelName,
      },
    };

    const dataStr = JSON.stringify(evaluationData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `quality_evaluation_${employeeInfo.name.replace(/\s+/g, '_') || 'employee'}_${new Date().toISOString().split('T')[0]
      }.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 transition-all duration-300`;
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        ${type === 'success'
        ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>'
        : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>'
      }
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  };

  // Get column totals for passing to ProductivityEvaluation
  const { e1Total, e2Total, e3Total } = calculateColumnTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100 p-6">
      <div className="w-full space-y-6">
        <Header />

        <EmployeeInfoSection employeeInfo={employeeInfo} onUpdate={updateEmployeeInfo} />

        <QualityEvaluation
          module={qualityModule}
          onUpdateModule={updateQualityModule}
          onUpdateSequence={updateQualitySequence}
          getThreshold={getThreshold}
          onAddSequence={addQualitySequence}
          onRemoveSequence={removeQualitySequence}
          currentEvaluationRound={currentEvaluationRound}
          obtainedMarks={employeeInfo.obtainedMarks}
          e1Total={e1Total}
          e2Total={e2Total}
          e3Total={e3Total}
        />

        <div className="bg-white border-2 border-black shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <span>Quality Evaluation Summary</span>
          </h3>

          {/* Current Round Indicator */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="font-semibold">Currently on Evaluation Round: E{currentEvaluationRound}</span>
            </div>
          </div>

          {/* Individual Column Results - WITH NA LOGIC */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`text-center p-4 rounded-lg border-2 transition-all duration-300 ${e1Total >= 12
                ? 'bg-green-50 border-green-200 shadow-green-100'
                : e1Total > 0
                  ? 'bg-red-50 border-red-200 shadow-red-100'
                  : 'bg-gray-50 border-gray-200'
              } ${currentEvaluationRound === 1 ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}>
              <div className="text-sm font-semibold text-gray-700 mb-2">
                E1 Results
                {currentEvaluationRound === 1 && (
                  <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Active</span>
                )}
              </div>
              <div className={`text-2xl font-bold ${e1Total >= 12
                  ? 'text-green-600'
                  : e1Total > 0
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}>
                {e1Total}/15 - {e1Total >= 12 ? 'PASS' : e1Total > 0 ? 'FAIL' : 'PENDING'}
              </div>
              <div className="text-sm text-gray-600">
                {e1Total > 0 ? `${((e1Total / 15) * 100).toFixed(1)}%` : 'Not attempted'}
              </div>
            </div>

            <div className={`text-center p-4 rounded-lg border-2 transition-all duration-300 ${
                e1Total >= 12
                  ? 'bg-gray-100 border-gray-300'
                  : e2Total >= 12
                    ? 'bg-green-50 border-green-200 shadow-green-100'
                    : e2Total > 0
                      ? 'bg-red-50 border-red-200 shadow-red-100'
                      : 'bg-gray-50 border-gray-200'
              } ${currentEvaluationRound === 2 ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}>
              <div className="text-sm font-semibold text-gray-700 mb-2">
                E2 Results
                {currentEvaluationRound === 2 && !e1Total >= 12 && (
                  <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Active</span>
                )}
              </div>
              {e1Total >= 12 ? (
                <>
                  <div className="text-2xl font-bold text-gray-500">NA</div>
                  <div className="text-sm text-gray-600">Not required</div>
                </>
              ) : (
                <>
                  <div className={`text-2xl font-bold ${e2Total >= 12
                      ? 'text-green-600'
                      : e2Total > 0
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                    {e2Total}/15 - {e2Total >= 12 ? 'PASS' : e2Total > 0 ? 'FAIL' : 'PENDING'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {e2Total > 0 ? `${((e2Total / 15) * 100).toFixed(1)}%` : 'Not attempted'}
                  </div>
                </>
              )}
            </div>

            <div className={`text-center p-4 rounded-lg border-2 transition-all duration-300 ${
                e1Total >= 12 || e2Total >= 12
                  ? 'bg-gray-100 border-gray-300'
                  : e3Total >= 12
                    ? 'bg-green-50 border-green-200 shadow-green-100'
                    : e3Total > 0
                      ? 'bg-red-50 border-red-200 shadow-red-100'
                      : 'bg-gray-50 border-gray-200'
              } ${currentEvaluationRound === 3 ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}>
              <div className="text-sm font-semibold text-gray-700 mb-2">
                E3 Results
                {currentEvaluationRound === 3 && !(e1Total >= 12 || e2Total >= 12) && (
                  <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Active</span>
                )}
              </div>
              {e1Total >= 12 || e2Total >= 12 ? (
                <>
                  <div className="text-2xl font-bold text-gray-500">NA</div>
                  <div className="text-sm text-gray-600">Not required</div>
                </>
              ) : (
                <>
                  <div className={`text-2xl font-bold ${e3Total >= 12
                      ? 'text-green-600'
                      : e3Total > 0
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                    {e3Total}/15 - {e3Total >= 12 ? 'PASS' : e3Total > 0 ? 'FAIL' : 'PENDING'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {e3Total > 0 ? `${((e3Total / 15) * 100).toFixed(1)}%` : 'Not attempted'}
                  </div>
                </>
              )}
            </div>
          </div>



          {/* Overall Result */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-semibold text-blue-700 mb-2">Final Marks</div>
              <div className="text-3xl font-bold text-blue-800">
                {employeeInfo.obtainedMarks} / {employeeInfo.maxMarks}
              </div>
            </div>

            <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="text-sm font-semibold text-indigo-700 mb-2">Final Percentage</div>
              <div
                className={`text-3xl font-bold ${employeeInfo.result === 'PASS' ? 'text-green-600' : 'text-red-600'}`}
              >
                {employeeInfo.percentage.toFixed(1)}%
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-2">Final Status</div>
              <div className="text-2xl font-bold px-4 py-2 rounded-lg flex items-center justify-center space-x-2">
                {employeeInfo.result === 'PASS' ? (
                  <span className="bg-green-100 text-green-800 border border-green-300 px-3 py-1 rounded flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>PASS</span>
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>FAIL</span>
                  </span>
                )}
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm font-semibold text-purple-700 mb-2">Required</div>
              <div className="text-2xl font-bold text-purple-800">80% Min</div>
              <div className="text-xs text-purple-600 mt-1">(≥12/15 marks)</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${isSaving
                  ? 'bg-blue-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                }`}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span className="font-semibold">Saving...</span>
                </div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span className="font-semibold">Save & Evaluate</span>
                </>
              )}
            </button>

            {/* <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Download className="w-5 h-5" />
              <span className="font-semibold">Export Data</span>
            </button> */}
          </div>



        </div>
      </div>
    </div>
  );
}

export default QualitySheet;