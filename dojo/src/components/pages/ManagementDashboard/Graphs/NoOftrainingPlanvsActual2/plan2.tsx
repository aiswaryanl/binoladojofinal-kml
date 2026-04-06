
// import React, { useEffect, useState } from "react";
// import BarChart from "../../Barchart/barchart";

// interface PlanTwoProps {
//   hqId?: string;
//   factoryId?: string;
//   departmentId?: string;
//   lineId?: string;
//   sublineId?: string;
//   stationId?: string;
// }

// const API_BASE_URL = "http://192.168.2.51:8000";

// const PlanTwo: React.FC<PlanTwoProps> = ({
//   hqId, factoryId, departmentId, lineId, sublineId, stationId
// }) => {
//   const [tier1TotalData, setTier1TotalData] = useState<number[]>(new Array(12).fill(0));
//   const [tier1CtqData, setTier1CtqData] = useState<number[]>(new Array(12).fill(0));
//   const [fiscalYearLabel, setFiscalYearLabel] = useState<string>("");

//   // Fiscal Year Labels: Apr → Mar
//   const fiscalLabels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTier1Data = async () => {
//       try {
//         setLoading(true);

//         const today = new Date();
//         const currentMonth = today.getMonth() + 1; // 1-12
//         const currentYear = today.getFullYear();

//         // Auto-detect current fiscal year (April start)
//         const fiscalStartYear = currentMonth >= 4 ? currentYear : currentYear - 1;
//         const fiscalEndYear = fiscalStartYear + 1;
//         setFiscalYearLabel(`FY ${fiscalStartYear}-${fiscalEndYear.toString().slice(2)}`);

//         const year1 = fiscalStartYear;     // e.g. 2025 → Apr-Dec
//         const year2 = fiscalEndYear;       // e.g. 2026 → Jan-Mar

//         const commonParams = new URLSearchParams();
//         if (hqId) commonParams.append('hq', hqId);
//         if (factoryId) commonParams.append('factory', factoryId);
//         if (departmentId) commonParams.append('department', departmentId);
//         if (lineId) commonParams.append('line', lineId);
//         if (sublineId) commonParams.append('subline', sublineId);
//         if (stationId) commonParams.append('station', stationId);

//         const fetchYear = async (year: number) => {
//           const params = new URLSearchParams(commonParams);
//           params.append('year', year.toString());
//           const res = await fetch(`${API_BASE_URL}/chart/tier1-defects/?${params.toString()}`);
//           if (!res.ok) throw new Error('Network error');
//           return await res.json();
//         };

//         const [dataYear1, dataYear2] = await Promise.all([
//           fetchYear(year1),
//           fetchYear(year2)
//         ]);

//         const filledTotal = new Array(12).fill(0);
//         const filledCtq = new Array(12).fill(0);

//         // Apr–Dec → indices 0–8
//         dataYear1.forEach((item: any) => {
//           const month = parseInt(item.month_year.split('-')[1], 10);
//           if (month >= 4 && month <= 12) {
//             const idx = month - 4;
//             filledTotal[idx] = item.total_defects_tier1 || 0;
//             filledCtq[idx] = item.ctq_defects_tier1 || 0;
//           }
//         });

//         // Jan–Mar → indices 9–11
//         dataYear2.forEach((item: any) => {
//           const month = parseInt(item.month_year.split('-')[1], 10);
//           if (month >= 1 && month <= 3) {
//             const idx = 8 + month;
//             filledTotal[idx] = item.total_defects_tier1 || 0;
//             filledCtq[idx] = item.ctq_defects_tier1 || 0;
//           }
//         });

//         setTier1TotalData(filledTotal);
//         setTier1CtqData(filledCtq);

//       } catch (err) {
//         console.error("Error fetching Tier 1 defects:", err);
//         setTier1TotalData(new Array(12).fill(0));
//         setTier1CtqData(new Array(12).fill(0));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTier1Data();
//   }, [hqId, factoryId, departmentId, lineId, sublineId, stationId]);

//   const title = `Tier 1 Defects Analysis (${fiscalYearLabel})`;

//   return (
//     <div style={{ width: "100%", height: "100%", margin: "auto", display: "flex", flexDirection: "column" }}>
//       <h3
//         style={{
//           color: "black",
//           margin: "0",
//           padding: "10px 15px",
//           fontSize: "16px",
//           fontFamily: "Arial, sans-serif",
//           fontWeight: "bold"
//         }}
//       >{title}</h3>

//       <div className="p-2 flex-1">
//         {loading ? (
//           <div className="w-full h-full flex items-center justify-center">
//             <p className="text-gray-500">Loading data...</p>
//           </div>
//         ) : (
//           <div className="w-full h-full">
//             <BarChart
//               key={`${hqId}-${factoryId}-${stationId}-${fiscalYearLabel}`}
//               labels={fiscalLabels}
//               data1={tier1TotalData}
//               data2={tier1CtqData}
//               groupLabels={["Total Defects", "CTQ Defects"]}
//               title=""
//               color1="rgba(52, 152, 219, 0.8)"
//               color2="rgba(13, 32, 160, 0.8)"
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PlanTwo;


import React, { useEffect, useState } from "react";
import BarChart from "../../Barchart/barchart";

// 1. Define Props
interface PlanTwoProps {
  hqId?: string;
  factoryId?: string;
  departmentId?: string;
  lineId?: string;
  sublineId?: string;
  stationId?: string;
}

const API_BASE_URL = "http://192.168.2.51:8000";

const PlanTwo: React.FC<PlanTwoProps> = ({
  hqId, factoryId, departmentId, lineId, sublineId, stationId
}) => {
  // State for data
  const [tier1TotalData, setTier1TotalData] = useState<number[]>([]);
  const [tier1CtqData, setTier1CtqData] = useState<number[]>([]);
  
  // Standard 12-Month Labels
  const [labels] = useState<string[]>([
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTier1Data = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build URL Params
        const params = new URLSearchParams();
        params.append('year', '2025'); // Force 2025
        
        if (hqId) params.append('hq', hqId);
        if (factoryId) params.append('factory', factoryId);
        if (departmentId) params.append('department', departmentId);
        if (lineId) params.append('line', lineId);
        if (sublineId) params.append('subline', sublineId);
        if (stationId) params.append('station', stationId);

        const response = await fetch(`${API_BASE_URL}/chart/tier1-defects/?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const apiData = await response.json();

        // --- ZERO FILLING LOGIC ---
        const filledTotal = new Array(12).fill(0);
        const filledCtq = new Array(12).fill(0);

        if (apiData && apiData.length > 0) {
          apiData.forEach((item: any) => {
            // "2025-10" -> Index 9
            const date = new Date(item.month_year);
            const monthIndex = date.getMonth(); 
            
            filledTotal[monthIndex] = item.total_defects_tier1;
            filledCtq[monthIndex] = item.ctq_defects_tier1;
          });
        }

        setTier1TotalData(filledTotal);
        setTier1CtqData(filledCtq);

      } catch (err) {
        console.error("Error fetching Tier 1 defects:", err);
        setError("Failed to load data");
        setTier1TotalData(new Array(12).fill(0));
        setTier1CtqData(new Array(12).fill(0));
      } finally {
        setLoading(false);
      }
    };

    fetchTier1Data();
  }, [hqId, factoryId, departmentId, lineId, sublineId, stationId]);

  const title = "Tier 1 Defects Analysis";

  return (
    <div className="bg-white rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-2 flex-1">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">Loading data...</p>
          </div>
        ) : (
          <div className="w-full h-full">
             {/* Key forces re-render on filter change */}
            <BarChart
              key={`${hqId}-${factoryId}-${stationId}`}
              labels={labels}
              data1={tier1TotalData}
              data2={tier1CtqData}
              groupLabels={["Total Defects", "CTQ Defects"]}
              title=""
              color1="rgba(52, 152, 219, 0.8)" // Blue
              color2="rgba(13, 32, 160, 0.8)" // Dark Blue
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanTwo;