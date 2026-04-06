
// import React, { useState, useEffect } from 'react';
// import LineGraph from '../../LineGraph/linegraph';

// interface TrainingProps {
//     hqId: string;
//     factoryId: string;
//     departmentId: string;
//     lineId: string;
//     sublineId: string;
//     stationId: string;
// }

// const Training: React.FC<TrainingProps> = ({
//     hqId, factoryId, departmentId, lineId, sublineId, stationId
// }) => {
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);

//     // Fiscal year labels: April → March
//     const fiscalLabels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

//     const [data1, setData1] = useState<number[]>(new Array(12).fill(0));
//     const [data2, setData2] = useState<number[]>(new Array(12).fill(0));
//     const [fiscalYearLabel, setFiscalYearLabel] = useState<string>(""); // e.g. "FY 2025-26"

//     useEffect(() => {
//         const fetchTrainingData = async () => {
//             try {
//                 setLoading(true);

//                 const today = new Date();
//                 const currentMonth = today.getMonth() + 1; // 1-12
//                 const currentYear = today.getFullYear();

//                 // Determine current fiscal year start (April of which year?)
//                 let fiscalStartYear: number;
//                 if (currentMonth >= 4) {
//                     fiscalStartYear = currentYear;        // Apr 2025 → Mar 2026 → FY 2025-26
//                 } else {
//                     fiscalStartYear = currentYear - 1;    // Jan-Mar 2025 → belongs to FY 2024-25
//                 }

//                 const fiscalEndYear = fiscalStartYear + 1;

//                 // For title
//                 setFiscalYearLabel(`FY ${fiscalStartYear}-${fiscalEndYear.toString().slice(2)}`);

//                 // We need data from two calendar years
//                 const year1 = fiscalStartYear;      // e.g. 2025 → contains Apr-Dec
//                 const year2 = fiscalEndYear;        // e.g. 2026 → contains Jan-Mar

//                 const baseUrl = 'http://192.168.2.51:8000/chart/operators/';
//                 const commonParams = new URLSearchParams();
//                 if (hqId) commonParams.append('hq', hqId);
//                 if (factoryId) commonParams.append('factory', factoryId);
//                 if (departmentId) commonParams.append('department', departmentId);
//                 if (lineId) commonParams.append('line', lineId);
//                 if (sublineId) commonParams.append('subline', sublineId);
//                 if (stationId) commonParams.append('station', stationId);

//                 const fetchYear = async (year: number) => {
//                     const params = new URLSearchParams(commonParams);
//                     params.append('year', year.toString());
//                     const res = await fetch(`${baseUrl}?${params.toString()}`);
//                     if (!res.ok) throw new Error('Network error');
//                     return await res.json();
//                 };

//                 const [dataYear1, dataYear2] = await Promise.all([
//                     fetchYear(year1),
//                     fetchYear(year2)
//                 ]);

//                 const filledJoined = new Array(12).fill(0);
//                 const filledTrained = new Array(12).fill(0);


//                 // Apr–Dec of fiscalStartYear → indices 0 to 8
//                 dataYear1.forEach((item: any) => {
//                     const monthStr = item.month_year.split('-')[1]; // "2025-07" → "07"
//                     const month = parseInt(monthStr, 10);           // → 7

//                     if (month >= 4 && month <= 12) {
//                         const idx = month - 4; // Apr=0, May=1, ..., Dec=8
//                         filledJoined[idx] = item.operators_joined || 0;
//                         filledTrained[idx] = item.operators_trained || 0;
//                     }
//                 });

//                 // Jan–Mar of next year → indices 9 to 11
//                 dataYear2.forEach((item: any) => {
//                     const monthStr = item.month_year.split('-')[1];
//                     const month = parseInt(monthStr, 10);

//                     if (month >= 1 && month <= 3) {
//                         const idx = 8 + month; // Jan=9, Feb=10, Mar=11
//                         filledJoined[idx] = item.operators_joined || 0;
//                         filledTrained[idx] = item.operators_trained || 0;
//                     }
//                 });

//                 setData1(filledJoined);
//                 setData2(filledTrained);

//             } catch (err: any) {
//                 console.error(err);
//                 setError('Failed to load training data');
//                 setData1(new Array(12).fill(0));
//                 setData2(new Array(12).fill(0));
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchTrainingData();
//     }, [hqId, factoryId, departmentId, lineId, sublineId, stationId]);

//     if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;
//     if (error) return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;

//     return (
//         <div style={{ width: "100%", height: "100%", margin: "auto", display: "flex", flexDirection: "column" }}>
//             <h3 className="text-lg font-medium text-gray-900 p-4 pb-2">
//                 <div style={{
//                     color: "black",
//                     margin: "0",
//                     padding: "10px 15px",
//                     fontSize: "16px",
//                     fontFamily: "Arial, sans-serif",
//                     fontWeight: "bold"
//                 }}>
//                     Operator Trainings - Joined vs Trained
//                 </div>
//             </h3>
//             <div className="flex-1 w-full px-2">
//                 <LineGraph
//                     labels={fiscalLabels}
//                     data1={data1}
//                     data2={data2}
//                     area={true}
//                     showSecondLine={true}
//                     label1="Operators Joined"
//                     label2="Operators Trained"
//                     line1Color="#2196F3"
//                     line2Color="#00008B"
//                     area1Color="rgba(33, 150, 243, 0.3)"
//                     area2Color="rgba(0, 0, 139, 0.3)"
//                     maintainAspectRatio={false}
//                 />
//             </div>
//         </div>
//     );
// };

// export default Training;



import React, { useState, useEffect } from 'react';
import LineGraph from '../../LineGraph/linegraph';

interface TrainingProps {
  hqId: string;
  factoryId: string;
  departmentId: string;
  lineId: string;
  sublineId: string;
  stationId: string;
  financialYear: string; // NEW: Receive selected financial year from parent
}

const Training: React.FC<TrainingProps> = ({ 
  hqId, factoryId, departmentId, lineId, sublineId, stationId, financialYear 
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Labels ordered for Financial Year (Apr - Mar)
    const [labels] = useState<string[]>([
        "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
    ]);
    const [data1, setData1] = useState<number[]>([]);
    const [data2, setData2] = useState<number[]>([]);

    useEffect(() => {
        const fetchTrainingData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const baseUrl = 'http://192.168.2.51:8000/chart/operators/';
                const params = new URLSearchParams();

                // --- USE SELECTED FINANCIAL YEAR ---
                // If financialYear prop is provided, use it; otherwise calculate current FY
                let fyStartYear: number;
                
                if (financialYear) {
                    // Use the selected financial year from dropdown
                    fyStartYear = parseInt(financialYear);
                } else {
                    // Fallback: Calculate current financial year
                    const today = new Date();
                    const currentMonth = today.getMonth(); // 0 = Jan, 11 = Dec
                    const currentYear = today.getFullYear();
                    fyStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;
                }

                params.append('year', fyStartYear.toString()); 
                
                if (hqId) params.append('hq', hqId);
                if (factoryId) params.append('factory', factoryId);
                if (departmentId) params.append('department', departmentId);
                if (lineId) params.append('line', lineId);
                if (sublineId) params.append('subline', sublineId);
                if (stationId) params.append('station', stationId);

                const response = await fetch(`${baseUrl}?${params.toString()}`);
                if (!response.ok) throw new Error('Failed to fetch data');
                
                const apiData = await response.json();

                // 1. Create empty arrays for 12 months filled with 0
                const filledJoined = new Array(12).fill(0);
                const filledTrained = new Array(12).fill(0);

                // 2. Map Data
                if (apiData && apiData.length > 0) {
                    apiData.forEach((item: any) => {
                        // Backend returns 'month' as integer 1-12
                        const m = item.month; 
                        
                        let chartIndex = -1;

                        // Logic: Map Calendar Month (1-12) to Financial Year Index (0-11)
                        // Apr(4) -> 0, May(5) -> 1, ..., Dec(12) -> 8
                        // Jan(1) -> 9, Feb(2) -> 10, Mar(3) -> 11
                       if (m >= 4 && m <= 12) {
            chartIndex = m - 4;
        } else if (m >= 1 && m <= 3) {
            chartIndex = m + 8;
        }
                        
                        // Safety check
                        if (chartIndex >= 0 && chartIndex < 12) {
                            filledJoined[chartIndex] = item.operators_joined || 0;
                            filledTrained[chartIndex] = item.operators_trained || 0;
                        }
                    });
                }

                setData1(filledJoined);
                setData2(filledTrained);
                
            } catch (err: any) {
                console.error('Error fetching training data:', err);
                setError(err.message);
                setData1(new Array(12).fill(0));
                setData2(new Array(12).fill(0));
            } finally {
                setLoading(false);
            }
        };

        fetchTrainingData();
    }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, financialYear]); // Added financialYear to dependencies

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                    <div className="animate-pulse">Loading training data...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                <div className="text-center">
                    <p>Error loading data</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-white flex flex-col">
            <h3 className="text-lg font-medium text-gray-900 p-4 pb-2">
                Operators Training
                {financialYear && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                        (FY {financialYear}-{parseInt(financialYear) + 1})
                    </span>
                )}
            </h3>
            <div className="flex-1 w-full px-2">
                <LineGraph
                    labels={labels}
                    data1={data1} 
                    data2={data2}  
                    area={true}
                    showSecondLine={true}
                    label1="Operators Joined"
                    label2="Operators Trained"
                    line1Color="#46b1f0ff"
                    line2Color="#1c126eff"
                    area1Color="rgba(79, 70, 229, 0.1)"
                    area2Color="rgba(16, 185, 129, 0.1)"
                    maintainAspectRatio={false}
                />
            </div>
        </div>
    );
};

export default Training;