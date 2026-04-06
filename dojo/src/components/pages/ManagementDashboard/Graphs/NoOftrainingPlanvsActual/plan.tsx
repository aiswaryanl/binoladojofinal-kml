
// import React, { useEffect, useState } from "react";
// import BarChart from "../../Barchart/barchart";

// interface PlanProps {
//   hqId?: string;
//   factoryId?: string;
//   departmentId?: string;
//   lineId?: string;
//   sublineId?: string;
//   stationId?: string;
// }

// const API_BASE_URL = "http://192.168.2.51:8000";

// // Define colors here
// const COLOR_PLAN = "rgba(52, 152, 219, 0.8)";
// const COLOR_ACTUAL = "rgba(13, 32, 160, 0.8)";

// const Plan: React.FC<PlanProps> = ({
//   hqId, factoryId, departmentId, lineId, sublineId, stationId
// }) => {
//   const [plannedData, setPlannedData] = useState<number[]>(new Array(12).fill(0));
//   const [actualData, setActualData] = useState<number[]>(new Array(12).fill(0));
//   const [fiscalYearLabel, setFiscalYearLabel] = useState<string>("");

//   const fiscalLabels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchPlanData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const today = new Date();
//         const currentMonth = today.getMonth() + 1;
//         const currentYear = today.getFullYear();

//         const fiscalStartYear = currentMonth >= 4 ? currentYear : currentYear - 1;
//         const fiscalEndYear = fiscalStartYear + 1;
//         setFiscalYearLabel(`FY ${fiscalStartYear}-${fiscalEndYear.toString().slice(2)}`);

//         const year1 = fiscalStartYear;
//         const year2 = fiscalEndYear;

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
//           const res = await fetch(`${API_BASE_URL}/chart/training-plans/?${params.toString()}`);
//           if (!res.ok) throw new Error('Failed to fetch');
//           return await res.json();
//         };

//         const [dataYear1, dataYear2] = await Promise.all([
//           fetchYear(year1),
//           fetchYear(year2)
//         ]);

//         const filledPlans = new Array(12).fill(0);
//         const filledActual = new Array(12).fill(0);

//         dataYear1.forEach((item: any) => {
//           const month = parseInt(item.month_year.split('-')[1], 10);
//           if (month >= 4 && month <= 12) {
//             const idx = month - 4;
//             filledPlans[idx] = item.training_plans || 0;
//             filledActual[idx] = item.trainings_actual || 0;
//           }
//         });

//         dataYear2.forEach((item: any) => {
//           const month = parseInt(item.month_year.split('-')[1], 10);
//           if (month >= 1 && month <= 3) {
//             const idx = 8 + month;
//             filledPlans[idx] = item.training_plans || 0;
//             filledActual[idx] = item.trainings_actual || 0;
//           }
//         });

//         setPlannedData(filledPlans);
//         setActualData(filledActual);

//       } catch (err) {
//         console.error("Error fetching plan data:", err);
//         setError("Failed to load plan data");
//         setPlannedData(new Array(12).fill(0));
//         setActualData(new Array(12).fill(0));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPlanData();
//   }, [hqId, factoryId, departmentId, lineId, sublineId, stationId]);

//   const title = `No. of Trainings Plan vs Actual`;

//   return (
//     <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>

//       {/* --- HEADER WITH CUSTOM LEGEND (STACKED VERTICALLY) --- */}
//       <div style={{
//         display: "flex",
//         flexDirection: "column", // <--- Changed from row to column
//         alignItems: "flex-start", // <--- Aligns everything to the left
//         gap: "8px",               // <--- Space between Title and Legend
//         padding: "12px 15px",
//         borderBottom: "1px solid #f0f0f0",
//         flexShrink: 0
//       }}>

//         {/* Top: Title */}
//         <h3 style={{
//           color: "black",
//           margin: "0",
//           fontSize: "16px",
//           fontWeight: "bold",
//           fontFamily: "Arial, sans-serif",
//         }}>
//           {title}
//         </h3>

//         {/* Bottom: Custom Legend */}
//         <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>

//           {/* Plan Legend Item */}
//           <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//             <span style={{
//               width: "12px",
//               height: "12px",
//               backgroundColor: COLOR_PLAN,
//               borderRadius: "50%",
//               display: "inline-block"
//             }}></span>
//             <span style={{ fontSize: "12px", color: "#374151", fontWeight: 600, fontFamily: "sans-serif" }}>
//               Plan
//             </span>
//           </div>

//           {/* Actual Legend Item */}
//           <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//             <span style={{
//               width: "12px",
//               height: "12px",
//               backgroundColor: COLOR_ACTUAL,
//               borderRadius: "50%",
//               display: "inline-block"
//             }}></span>
//             <span style={{ fontSize: "12px", color: "#374151", fontWeight: 600, fontFamily: "sans-serif" }}>
//               Actual
//             </span>
//           </div>

//         </div>
//       </div>
//       {/* --- END HEADER --- */}

//       {/* Chart Container */}
//       <div style={{
//         flex: 1,
//         minHeight: 0,
//         position: "relative",
//         width: "100%",
//         padding: "10px"
//       }}>
//         {loading ? (
//           <div className="flex items-center justify-center h-full">Loading...</div>
//         ) : (
//           <div style={{ height: "100%", width: "100%" }}>
//             <BarChart
//               key={`${hqId}-${factoryId}-${stationId}-${fiscalYearLabel}`}
//               labels={fiscalLabels}
//               data1={plannedData}
//               data2={actualData}
//               groupLabels={["Plan", "Actual"]}
//               title=""
//               color1={COLOR_PLAN}
//               color2={COLOR_ACTUAL}
//               showLegend={false}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Plan;



// ============================================
// 1. Plan.tsx - Training Plans vs Actual
// ============================================
import React, { useEffect, useState } from "react";
import BarChart from "../../Barchart/barchart";

interface PlanProps {
  hqId?: string;
  factoryId?: string;
  departmentId?: string;
  lineId?: string;
  sublineId?: string;
  stationId?: string;
  financialYear: string; // NEW
}

const API_BASE_URL = "http://192.168.2.51:8000";

const Plan: React.FC<PlanProps> = ({
  hqId,
  factoryId,
  departmentId,
  lineId,
  sublineId,
  stationId,
  financialYear, // NEW
}) => {
  const [plannedData, setPlannedData] = useState<number[]>([]);
  const [actualData, setActualData] = useState<number[]>([]);

  const [labels] = useState<string[]>([
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        // Use selected financial year
        let fyStartYear: number;
        if (financialYear) {
          fyStartYear = parseInt(financialYear);
        } else {
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          fyStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;
        }

        params.append("year", fyStartYear.toString());

        if (hqId) params.append("hq", hqId);
        if (factoryId) params.append("factory", factoryId);
        if (departmentId) params.append("department", departmentId);
        if (lineId) params.append("line", lineId);
        if (sublineId) params.append("subline", sublineId);
        if (stationId) params.append("station", stationId);

        const url = `${API_BASE_URL}/chart/training-plans/?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiData = await response.json();

        const filledPlans = new Array(12).fill(0);
        const filledActual = new Array(12).fill(0);

        apiData.forEach((item: any) => {
          const m = item.month || parseInt(item.month_year.split("-")[1], 10);

          if (isNaN(m) || m < 1 || m > 12) {
            console.warn("Invalid month:", item.month_year);
            return;
          }

          // Map calendar month to FY index
          const chartIndex = m >= 4 ? m - 4 : m + 8;

          if (chartIndex >= 0 && chartIndex < 12) {
            filledPlans[chartIndex] = Number(item.training_plans) || 0;
            filledActual[chartIndex] = Number(item.trainings_actual) || 0;
          }
        });

        setPlannedData(filledPlans);
        setActualData(filledActual);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("Failed to load training data");
        setPlannedData(new Array(12).fill(0));
        setActualData(new Array(12).fill(0));
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingData();
  }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, financialYear]);

  return (
    <div className="bg-white rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          No of Trainings Plan vs Actual
          {financialYear && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              (FY {financialYear}-{parseInt(financialYear) + 1})
            </span>
          )}
        </h3>
      </div>
      <div className="p-2 flex-1">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="w-full h-full">
            <BarChart
              key={`${hqId || ''}-${factoryId || ''}-${departmentId || ''}-${lineId || ''}-${sublineId || ''}-${stationId || ''}-${financialYear}`}
              labels={labels}
              data1={plannedData}
              data2={actualData}
              groupLabels={["Plan", "Actual"]}
              title=""
              color1="rgba(52, 152, 219, 0.8)"
              color2="rgba(13, 32, 160, 0.8)"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Plan;