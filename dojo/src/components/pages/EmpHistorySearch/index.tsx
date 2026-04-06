// // src/components/pages/EmployeeHistorySearch/index.tsx
// import { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { useEmployeeHistory } from "./hooks/useEmployeeHistory";
// import * as CertService from './utils/certificateService';
// import type { LocationState, MasterEmployee, OperatorSkill, Score, ExamResult } from './types';

// // Import all card components
// import EmployeeInfoCard from './components/EmployeeInfoCard';
// import SkillVisualizerCard from './components/SkillVisualizerCard';
// import OperatorSkillsCard from './components/OperatorSkillsCard';
// import AttendanceCard from './components/AttendanceCard';
// import ScoresCard from './components/ScoresCard';
// import TrainingCard from './components/TrainingCard';
// import ExamResultsCard from './components/ExamResultsCard';

// const EmployeeHistorySearch = () => {
//     const {
// 		searchTerm, filteredEmployees, employeeDetails, isLoading, error: dataError,
// 		handleSearch, handleEmployeeSelect, attendanceByBatch, allExamResults,
// 	} = useEmployeeHistory();

// 	const location = useLocation();
// 	const state = location.state as LocationState;
// 	const fromReport = state?.fromReport || false;

// 	const [downloadingId, setDownloadingId] = useState<string | null>(null);
// 	const [downloadSuccess, setDownloadSuccess] = useState(false);
// 	const [downloadError, setDownloadError] = useState("");

//     const handleDownload = async (type: string, data: any) => {
//         const id = `${type}-${data.id || data.emp_id}`;
//         setDownloadingId(id);
//         setDownloadError("");

//         try {
//             const employeeName = employeeDetails ? [employeeDetails.employee.first_name, employeeDetails.employee.last_name].filter(Boolean).join(" ") : "Employee";

//             switch (type) {
//                 case 'report':
//                     await CertService.downloadFullReport(data as MasterEmployee);
//                     setDownloadSuccess(true);
//                     break;
//                 case 'skill':
//                     await CertService.downloadSkillCertificate(data as OperatorSkill);
//                     break;
//                 case 'score':
//                     await CertService.downloadScoreCertificate(data as Score);
//                     break;
//                 case 'hanchou':
//                 case 'shokuchou':
//                     const examResult = data as ExamResult;
//                     if (examResult.type === 'hanchou') {
//                         await CertService.downloadHanchouCertificate(examResult, employeeName);
//                     } else {
//                         await CertService.downloadShokuchouCertificate(examResult, employeeName);
//                     }
//                     break;
//                 default:
//                     throw new Error("Unknown download type specified.");
//             }
//         } catch (err: any) {
//             setDownloadError(err.message || "An unknown error occurred during download.");
//         } finally {
//             setDownloadingId(null);
//         }
//     };

// 	useEffect(() => {
// 		let timer: ReturnType<typeof setTimeout>;
// 		if (downloadSuccess || downloadError) {
// 			timer = setTimeout(() => {
//                 setDownloadSuccess(false);
//                 setDownloadError("");
//             }, 5000);
// 		}
// 		return () => clearTimeout(timer);
// 	}, [downloadSuccess, downloadError]);

// 	return (
// 		<>
// 			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6'>
// 				<style dangerouslySetInnerHTML={{ __html: ` @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap'); .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; } .hide-scrollbar::-webkit-scrollbar { display: none; } body { font-family: 'Inter', sans-serif; } h1, h2, h3, h4, h5, h6 { font-family: 'Poppins', sans-serif; } ` }} />

// 				<div className='max-w-7xl mx-auto'>
// 					<div className='text-center mb-10'>
// 						<h1 className='text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4'>{fromReport ? "Employee History Report" : "Employee History Card"}</h1>
// 						<p className='text-xl text-gray-600 font-light'>Search and view comprehensive employee records</p>
// 					</div>

// 					<div className='relative mb-10'>
// 						<div className='relative'>
// 							<input type='text' placeholder='Search employee by name or ID...' className='w-full p-5 pl-14 text-lg bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-transparent transition-all duration-300 font-medium' value={searchTerm} onChange={handleSearch} />
// 							<svg className='absolute left-5 top-6 text-purple-500 w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' /></svg>
// 						</div>

// 						{isLoading && (
// 							<div className='absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-purple-200 rounded-2xl shadow-2xl p-4'><div className='flex justify-center'><div className='animate-spin rounded-full h-8 w-8 border-b-3 border-purple-600'></div></div></div>
// 						)}

// 						{dataError && !isLoading && searchTerm.length > 0 && (
// 							<div className='absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-red-200 rounded-2xl shadow-2xl p-4 text-red-600 text-lg font-medium'>{dataError}</div>
// 						)}

// 						{filteredEmployees.length > 0 && !isLoading && (
// 							<ul className='absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-purple-200 rounded-2xl shadow-2xl overflow-hidden'>
// 								{filteredEmployees.map((emp) => {
// 									const displayName = [emp.first_name, emp.last_name].filter(Boolean).join(" ");
//       								return (
// 									<li key={emp.emp_id} className='p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-200 border-b border-purple-100 last:border-0' onClick={() => handleEmployeeSelect(emp)}>
// 										<div className='flex items-center justify-between'>
// 											<span className='font-semibold text-lg text-gray-800'>{displayName || emp.emp_id}</span>
// 											<span className='text-sm text-purple-600 bg-purple-100 px-3 py-1.5 rounded-full font-medium'>{emp.department} - {emp.emp_id}</span>
// 										</div>
// 									</li>
// 									);
// 								})}
// 							</ul>
// 						)}
// 					</div>

// 					{employeeDetails && !isLoading && (
// 						<div className='space-y-8'>
// 							{fromReport && (
// 								<div className='flex justify-end'>
// 									<button onClick={() => handleDownload('report', employeeDetails.employee)} disabled={downloadingId === `report-${employeeDetails.employee.emp_id}`} className={`flex items-center px-6 py-3 rounded-xl text-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 ${downloadingId === `report-${employeeDetails.employee.emp_id}` ? "bg-gray-400" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"} text-white`}>
// 										{downloadingId === `report-${employeeDetails.employee.emp_id}` ? (
// 											<><svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path></svg>Generating Report...</>
// 										) : (
// 											<><svg className='w-5 h-5 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' /></svg>Download Full Report</>
// 										)}
// 									</button>
// 								</div>
// 							)}
// 							<EmployeeInfoCard employee={employeeDetails.employee} />
//                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                                 <SkillVisualizerCard skills={employeeDetails.operator_skills} />
//                                 <OperatorSkillsCard skills={employeeDetails.operator_skills} onDownload={(skill) => handleDownload('skill', skill)} downloadingId={downloadingId} />
//                                 <AttendanceCard attendanceByBatch={attendanceByBatch} />
//                                 <ScoresCard scores={employeeDetails.scores} onDownload={(score) => handleDownload('score', score)} downloadingId={downloadingId} />
//                                 <TrainingCard trainings={employeeDetails.scheduled_trainings} />
//                                 <ExamResultsCard results={allExamResults} onDownload={(result) => handleDownload(result.type, result)} downloadingId={downloadingId} />
//                             </div>
// 						</div>
// 					)}
// 				</div>

//                 {downloadSuccess && (
//                     <div className='fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105'>
//                         <div className='flex items-center'><svg className='w-6 h-6 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' /></svg><span className='font-semibold text-lg'>Report downloaded successfully!</span></div>
//                     </div>
//                 )}
//                 {downloadError && (
//                     <div className='fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl'>
//                         <div className='flex items-center'><svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span className='font-semibold text-lg'>{downloadError}</span></div>
//                     </div>
//                 )}
// 			</div>
// 		</>
// 	);
// };

// export default EmployeeHistorySearch;





// src/components/pages/EmployeeHistorySearch/index.tsx
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useEmployeeHistory } from "./hooks/useEmployeeHistory";
import * as CertService from './utils/certificateService';
import type { LocationState, MasterEmployee, OperatorSkill, Score, ExamResult } from './types';

// Import all card components
import EmployeeInfoCard from './components/EmployeeInfoCard';
import SkillVisualizerCard from './components/SkillVisualizerCard';
import OperatorSkillsCard from './components/OperatorSkillsCard';
import AttendanceCard from './components/AttendanceCard';
import ScoresCard from './components/ScoresCard';
import TrainingCard from './components/TrainingCard';
import ExamResultsCard from './components/ExamResultsCard';
import ProductivityCard from './components/ProductivityCard';
import QualityCard from './components/QualityCard';
import OJTCard from './components/OJTCard';

type DownloadType = 'report' | 'skill' | 'score' | 'hanchou' | 'shokuchou';

interface DownloadStatus {
    isDownloading: boolean;
    success: boolean;
    error: string;
    type: DownloadType | null;
}

const EmployeeHistorySearch = () => {
    const {
        searchTerm, filteredEmployees, employeeDetails, isLoading, error: dataError,
        handleSearch, handleEmployeeSelect, attendanceByBatch, allExamResults,
    } = useEmployeeHistory();

    const location = useLocation();
    const state = location.state as LocationState;
    const fromReport = state?.fromReport || false;

    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({
        isDownloading: false,
        success: false,
        error: "",
        type: null
    });

    // Memoized employee name getter
    const getEmployeeName = useCallback((): string => {
        if (!employeeDetails?.employee) return "Employee";
        return [employeeDetails.employee.first_name, employeeDetails.employee.last_name]
            .filter(Boolean)
            .join(" ") || "Employee";
    }, [employeeDetails]);

    const handleDownload = async (type: DownloadType, data: any) => {
        const id = `${type}-${data.id || data.emp_id}`;
        setDownloadingId(id);
        setDownloadStatus({ isDownloading: true, success: false, error: "", type });

        try {
            const employeeName = getEmployeeName();

            switch (type) {
                case 'report':
                    await CertService.downloadFullReport(data as MasterEmployee);
                    break;
                case 'skill':
                    await CertService.downloadSkillCertificate(data as OperatorSkill);
                    break;
                case 'score':
                    await CertService.downloadScoreCertificate(data as Score);
                    break;
                case 'hanchou':
                    await CertService.downloadHanchouCertificate(data as ExamResult, employeeName);
                    break;
                case 'shokuchou':
                    await CertService.downloadShokuchouCertificate(data as ExamResult, employeeName);
                    break;
                default:
                    throw new Error("Unknown download type specified.");
            }

            setDownloadStatus({ isDownloading: false, success: true, error: "", type });
        } catch (err: any) {
            console.error('Download error:', err);
            setDownloadStatus({
                isDownloading: false,
                success: false,
                error: err.message || "An unknown error occurred during download.",
                type
            });
        } finally {
            setDownloadingId(null);
        }
    };

    // Auto-clear notifications
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (downloadStatus.success || downloadStatus.error) {
            timer = setTimeout(() => {
                setDownloadStatus(prev => ({ ...prev, success: false, error: "" }));
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [downloadStatus.success, downloadStatus.error]);

    // Download button component for reusability
    const DownloadReportButton = () => {
        if (!employeeDetails) return null;

        const isDownloading = downloadingId === `report-${employeeDetails.employee.emp_id}`;

        return (
            <button
                onClick={() => handleDownload('report', employeeDetails.employee)}
                disabled={isDownloading}
                className={`
                    flex items-center px-6 py-3 rounded-xl text-lg font-semibold 
                    shadow-lg transform transition-all duration-200 hover:scale-105
                    ${isDownloading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    } text-white
                `}
            >
                {isDownloading ? (
                    <>
                        <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' fill='none' viewBox='0 0 24 24'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                        </svg>
                        Generating Report...
                    </>
                ) : (
                    <>
                        <svg className='w-5 h-5 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
                        </svg>
                        Download Full Report
                    </>
                )}
            </button>
        );
    };

    // Success notification component
    const SuccessNotification = () => {
        if (!downloadStatus.success) return null;

        const messages: Record<DownloadType, string> = {
            report: 'Report downloaded successfully!',
            skill: 'Skill certificate downloaded!',
            score: 'Score certificate downloaded!',
            hanchou: 'Hanchou certificate downloaded!',
            shokuchou: 'Shokuchou certificate downloaded!'
        };

        return (
            <div className='fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 animate-slide-up'>
                <div className='flex items-center'>
                    <svg className='w-6 h-6 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                    </svg>
                    <span className='font-semibold text-lg'>
                        {downloadStatus.type ? messages[downloadStatus.type] : 'Download successful!'}
                    </span>
                </div>
            </div>
        );
    };

    // Error notification component
    const ErrorNotification = () => {
        if (!downloadStatus.error) return null;

        return (
            <div className='fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-up'>
                <div className='flex items-center'>
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className='font-semibold text-lg'>{downloadStatus.error}</span>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6'>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap');
                    .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    body { font-family: 'Inter', sans-serif; }
                    h1, h2, h3, h4, h5, h6 { font-family: 'Poppins', sans-serif; }
                    @keyframes slide-up {
                        from { transform: translateY(100px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .animate-slide-up { animation: slide-up 0.3s ease-out; }
                `}} />

                <div className='max-w-7xl mx-auto'>
                    {/* Header */}
                    <div className='text-center mb-10'>
                        <h1 className='text-5xl py-4 font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4'>
                            {fromReport ? "Employee History Report" : "Employee History Card"}
                        </h1>
                        <p className='text-xl text-gray-600 font-light'>
                            Search and view comprehensive employee records
                        </p>
                    </div>

                    {/* Search Section */}
                    <div className='relative mb-10'>
                        <div className='relative'>
                            <input
                                type='text'
                                placeholder='Search employee by name or ID...'
                                className='w-full p-5 pl-14 text-lg bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-transparent transition-all duration-300 font-medium'
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            <svg className='absolute left-5 top-6 text-purple-500 w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                            </svg>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className='absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-purple-200 rounded-2xl shadow-2xl p-4'>
                                <div className='flex justify-center'>
                                    <div className='animate-spin rounded-full h-8 w-8 border-b-3 border-purple-600'></div>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {dataError && !isLoading && searchTerm.length > 0 && (
                            <div className='absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-red-200 rounded-2xl shadow-2xl p-4 text-red-600 text-lg font-medium'>
                                {dataError}
                            </div>
                        )}

                        {/* Search Results */}
                        {filteredEmployees.length > 0 && !isLoading && (
                            <ul className='absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-purple-200 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto'>
                                {filteredEmployees.map((emp) => {
                                    const displayName = [emp.first_name, emp.last_name].filter(Boolean).join(" ");
                                    return (
                                        <li
                                            key={emp.emp_id}
                                            className='p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-200 border-b border-purple-100 last:border-0'
                                            onClick={() => handleEmployeeSelect(emp)}
                                        >
                                            <div className='flex items-center justify-between'>
                                                <span className='font-semibold text-lg text-gray-800'>
                                                    {displayName || emp.emp_id}
                                                </span>
                                                <span className='text-sm text-purple-600 bg-purple-100 px-3 py-1.5 rounded-full font-medium'>
                                                    {emp.department} - {emp.emp_id}
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Employee Details */}
                    {employeeDetails && !isLoading && (
                        <div className='space-y-8'>
                            {/* Download Report Button - Always visible or conditional */}
                            <div className='flex justify-end gap-4'>
                                {/* Option 1: Always show download button */}
                                <DownloadReportButton />

                                {/* Option 2: Only show when fromReport is true
                                {fromReport && <DownloadReportButton />}
                                */}
                            </div>

                            <EmployeeInfoCard employee={employeeDetails.employee} />

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <SkillVisualizerCard skills={employeeDetails.operator_skills} />
                                <OperatorSkillsCard
                                    skills={employeeDetails.operator_skills}
                                    onDownload={(skill) => handleDownload('skill', skill)}
                                    downloadingId={downloadingId}
                                />
                                <AttendanceCard
                                    attendanceByBatch={attendanceByBatch}
                                    rescheduledSessions={employeeDetails.rescheduled_sessions || []}
                                />
                                <ScoresCard
                                    scores={employeeDetails.scores}
                                    onDownload={(score) => handleDownload('score', score)}
                                    downloadingId={downloadingId}
                                />
                                <TrainingCard trainings={employeeDetails.scheduled_trainings} />
                                <ExamResultsCard
                                    results={allExamResults}
                                    onDownload={(result) => handleDownload(result.type as DownloadType, result)}
                                    downloadingId={downloadingId}
                                />
                                <ProductivityCard evaluations={employeeDetails.productivity_evaluations || []} />
                                <QualityCard evaluations={employeeDetails.quality_evaluations || []} />
                                <OJTCard ojtRecords={employeeDetails.ojt_evaluations || []} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <SuccessNotification />
                <ErrorNotification />
            </div>
        </>
    );
};

export default EmployeeHistorySearch;