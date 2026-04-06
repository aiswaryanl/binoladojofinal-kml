

// import React, { useEffect, useState } from "react";
// import ChartSkeleton from '../../../../../components/Common/ChartSkeleton';

// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   LabelList,
// } from "recharts";
// import type { LegendProps } from "recharts";

// /* =========================
//    Custom Legend
// ========================= */
// const renderCustomLegend = (props: LegendProps) => {
//   const { payload } = props;
//   if (!payload) return null;

//   const order: Record<string, number> = { Required: 0, Available: 1 };

//   const sorted = [...payload].sort((a, b) => {
//     const aKey = String(a.value);
//     const bKey = String(b.value);
//     return (order[aKey] ?? 99) - (order[bKey] ?? 99);
//   });

//   return (
//     <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
//       {sorted.map((entry, index) => (
//         <div
//           key={`legend-${index}`}
//           style={{ display: "flex", alignItems: "center", marginRight: 16 }}
//         >
//           <span
//             style={{
//               display: "inline-block",
//               width: 13,
//               height: 13,
//               marginRight: 4,
//               backgroundColor: entry.color || "#000",
//               borderRadius: 8,
//             }}
//           />
//           <span style={{ fontSize: 12, color: "#374151" }}>
//             {entry.value}
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// };

// /* =========================
//    Types
// ========================= */
// // Update Props Interface
// interface ManpowerTrendProps {
//   data: any[]; // Consider typing this properly if possible, e.g., { month: number, total_required: number, ... }[]
//   loading?: boolean;
// }

// const financialYearConfig = [
//   { name: "Apr", id: 4 },
//   { name: "May", id: 5 },
//   { name: "Jun", id: 6 },
//   { name: "Jul", id: 7 },
//   { name: "Aug", id: 8 },
//   { name: "Sep", id: 9 },
//   { name: "Oct", id: 10 },
//   { name: "Nov", id: 11 },
//   { name: "Dec", id: 12 },
//   { name: "Jan", id: 1 },
//   { name: "Feb", id: 2 },
//   { name: "Mar", id: 3 },
// ];

// /* =========================
//    Colors
// ========================= */
// const COLORS = {
//   Required: "#3B82F6",
//   Available: "#1E3A8A",
// };

// /* =========================
//    Component
// ========================= */
// const ManpowerTrendChart: React.FC<ManpowerTrendProps> = ({
//   data,
//   loading = false,
// }) => {
//   // Transform the flat month list into Financial Year Order
//   // The backend returns [{ month: 1, ...}, {month: 2, ...}] in calendar order (1-12) usually.
//   // We need to map it to the config order.

//   const formattedData = React.useMemo(() => {
//     if (!data) return [];
//     return financialYearConfig.map((config) => {
//       const monthData = data.find((d: any) => d.month === config.id);
//       return {
//         name: config.name,
//         Required: monthData ? monthData.total_required : 0,
//         Available: monthData ? monthData.total_available : 0,
//       };
//     });
//   }, [data]);

//   /* =========================
//      UI States
//   ========================= */
//   if (loading) {
//     return <ChartSkeleton />;
//   }


//   /* =========================
//      Render Chart
//   ========================= */
//   return (
//     <div className="w-full h-[350px] bg-white rounded-lg shadow-lg p-4">
//       <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">
//         Manpower Availability Trend (FY)
//       </h2>

//       <ResponsiveContainer width="100%" height="80%">
//         <BarChart
//           data={formattedData}
//           margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
//         >
//           <XAxis dataKey="name" axisLine={false} tickLine={false} />
//           <YAxis hide />

//           <Tooltip
//             cursor={{ fill: "#f3f4f6" }}
//             contentStyle={{
//               borderRadius: "8px",
//               border: "none",
//               boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
//             }}
//           />

//           <Legend
//             verticalAlign="top"
//             align="center"
//             content={renderCustomLegend as any}
//             wrapperStyle={{ paddingBottom: "20px" }}
//           />

//           {/* Required */}
//           <Bar
//             dataKey="Required"
//             fill={COLORS.Required}
//             radius={[4, 4, 0, 0]}
//             barSize={20}
//           >
//             <LabelList
//               dataKey="Required"
//               position="top"
//               fontSize={10}
//               formatter={(label: React.ReactNode) =>
//                 Number(label) > 0 ? label : ""
//               }
//             />
//           </Bar>

//           {/* Available */}
//           <Bar
//             dataKey="Available"
//             fill={COLORS.Available}
//             radius={[4, 4, 0, 0]}
//             barSize={20}
//           >
//             <LabelList
//               dataKey="Available"
//               position="top"
//               fontSize={10}
//               formatter={(label: React.ReactNode) =>
//                 Number(label) > 0 ? label : ""
//               }
//             />
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default ManpowerTrendChart;





// import React, { useEffect, useState } from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList,
// } from 'recharts';
// import type { LegendProps } from 'recharts';

// // ... (Keep your existing renderCustomLegend and LegendProps here) ...

// const renderCustomLegend = (props: LegendProps) => {
//   const { payload } = props;
//   if (!payload) return null;

//   const order: Record<string, number> = { Required: 0, Available: 1 };

//   const sorted = [...payload].sort((a, b) => {
//     const aKey = String(a.value);
//     const bKey = String(b.value);
//     return (order[aKey] ?? 99) - (order[bKey] ?? 99);
//   });

//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
//       {sorted.map((entry, index) => (
//         <div
//           key={`item-${index}`}
//           style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}
//         >
//           <span
//             style={{
//               display: 'inline-block',
//               width: 13,
//               height: 13,
//               marginRight: 4,
//               backgroundColor: entry.color || '#000',
//               borderRadius: 8,
//             }}
//           />
//           <span style={{ fontSize: 12, color: '#374151' }}>
//             {entry.value}
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// };

// interface ManpowerTrendProps {
//   hqId: number | null;
//   factoryId: number | null;
//   departmentId: number | null;
//   lineId: number | null;
//   sublineId: number | null;
//   stationId: number | null;
//   selectedYear?: number;
// }

// const API_BASE_URL = "http://127.0.0.1:8000";

// // Ordered sequence for Graph Labels
// const financialYearConfig = [
//   { name: "Apr", id: 4 },
//   { name: "May", id: 5 },
//   { name: "Jun", id: 6 },
//   { name: "Jul", id: 7 },
//   { name: "Aug", id: 8 },
//   { name: "Sep", id: 9 },
//   { name: "Oct", id: 10 },
//   { name: "Nov", id: 11 },
//   { name: "Dec", id: 12 },
//   { name: "Jan", id: 1 },
//   { name: "Feb", id: 2 },
//   { name: "Mar", id: 3 },
// ];

// const COLORS = {
//   Required: "#3B82F6",
//   Available: "#1E3A8A",
// };

// const ManpowerTrendChart: React.FC<ManpowerTrendProps> = ({
//   hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear
// }) => {
//   const [data, setData] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const displayFY = selectedYear 
//     ? `${selectedYear}-${(selectedYear + 1).toString().slice(-2)}`
//     : (() => {
//         const now = new Date();
//         const month = now.getMonth();
//         const year = now.getFullYear();
//         const fyStart = month < 3 ? year - 1 : year;
//         return `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
//       })();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         // --- LOGIC CHANGE START ---
//         const today = new Date();
//         const currentMonth = today.getMonth(); // 0=Jan, 11=Dec
//         const currentYear = today.getFullYear();

//         // If selectedYear is not passed via props, calculate FY Start Year
//         // If Jan(0), Feb(1), Mar(2) -> Start Year is previous year
//         const fyStartYear = selectedYear 
//             ? selectedYear 
//             : (currentMonth < 3 ? currentYear - 1 : currentYear);
            
//         const params = new URLSearchParams();
//         params.append('year', fyStartYear.toString());
//         // --- LOGIC CHANGE END ---

//         if (hqId) params.append('hq', hqId.toString());
//         if (factoryId) params.append('factory', factoryId.toString());
//         if (departmentId) params.append('department', departmentId.toString());
//         if (lineId) params.append('line', lineId.toString());
//         if (sublineId) params.append('subline', sublineId.toString());
//         if (stationId) params.append('station', stationId.toString());

//         const response = await fetch(`${API_BASE_URL}/chart/total-stats/?${params.toString()}`);
//         if (!response.ok) throw new Error('Failed to fetch data');
//         const apiData = await response.json();

//         // Map backend data to the fixed Financial Year Label order
//         const fullYearData = financialYearConfig.map((config) => {
//           // apiData now contains correct months from different years 
//           // (e.g., month 1 is Jan 2026, month 12 is Dec 2025)
//           const monthData = apiData.find((d: any) => d.month === config.id);
//           return {
//             name: config.name,
//             Required: monthData ? monthData.total_required : 0,
//             Available: monthData ? monthData.total_available : 0,
//           };
//         });
//         setData(fullYearData);
//       } catch (err: any) {
//         console.error(err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear]);

//   if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;
//   if (error) return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>;

//   const customLegendData = [
//     { id: 'Required', value: 'Required', type: 'square', color: COLORS.Required },
//     { id: 'Available', value: 'Available', type: 'square', color: COLORS.Available },
//   ];

//   return (
//     <div className="w-full h-[350px] bg-white rounded-lg shadow-lg p-4">
//       <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">
//         Manpower Availability Trend– FY {displayFY}
//       </h2>
      
//       <ResponsiveContainer width="100%" height="80%">
//         <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
//           <XAxis dataKey="name" axisLine={false} tickLine={false} />
//           <YAxis hide />
//           <Tooltip
//             cursor={{ fill: '#f3f4f6' }}
//             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
//           />
//           <Legend
//             verticalAlign="top"
//             iconType="circle"
//             align="center"
//             wrapperStyle={{ paddingBottom: '20px' }}
//             content={renderCustomLegend}
//           />
//           <Bar
//             dataKey="Required"
//             fill={COLORS.Required}
//             radius={[4, 4, 0, 0]}
//             barSize={20}
//             name="Required"
//           >
//             <LabelList
//               dataKey="Required"
//               position="top"
//               fontSize={10}
//               formatter={(label: React.ReactNode) => {
//                 const value = Number(label);
//                 return value > 0 ? label : '';
//               }}
//             />
//           </Bar>
//           <Bar
//             dataKey="Available"
//             fill={COLORS.Available}
//             radius={[4, 4, 0, 0]}
//             barSize={20}
//             name="Available"
//           >
//             <LabelList
//               dataKey="Available"
//               position="top"
//               fontSize={10}
//               formatter={(label: React.ReactNode) => {
//                 const value = Number(label);
//                 return value > 0 ? label : '';
//               }}
//             />
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default ManpowerTrendChart;


import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList,
} from 'recharts';
import type { LegendProps } from 'recharts';

const renderCustomLegend = (props: LegendProps) => {
  const { payload } = props;
  if (!payload) return null;

  const order: Record<string, number> = { Required: 0, Available: 1 };

  const sorted = [...payload].sort((a, b) => {
    const aKey = String(a.value);
    const bKey = String(b.value);
    return (order[aKey] ?? 99) - (order[bKey] ?? 99);
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
      {sorted.map((entry, index) => (
        <div
          key={`item-${index}`}
          style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 13,
              height: 13,
              marginRight: 4,
              backgroundColor: entry.color || '#000',
              borderRadius: 8,
            }}
          />
          <span style={{ fontSize: 12, color: '#374151' }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

interface ManpowerTrendProps {
  hqId: number | null;
  factoryId: number | null;
  departmentId: number | null;
  lineId: number | null;
  sublineId: number | null;
  stationId: number | null;
  selectedYear?: number;
}

const API_BASE_URL = "http://127.0.0.1:8000";

// Financial Year Config with year mapping
const financialYearConfig = [
  { name: "Apr", id: 4, fyPart: 'start' },
  { name: "May", id: 5, fyPart: 'start' },
  { name: "Jun", id: 6, fyPart: 'start' },
  { name: "Jul", id: 7, fyPart: 'start' },
  { name: "Aug", id: 8, fyPart: 'start' },
  { name: "Sep", id: 9, fyPart: 'start' },
  { name: "Oct", id: 10, fyPart: 'start' },
  { name: "Nov", id: 11, fyPart: 'start' },
  { name: "Dec", id: 12, fyPart: 'start' },
  { name: "Jan", id: 1, fyPart: 'end' },
  { name: "Feb", id: 2, fyPart: 'end' },
  { name: "Mar", id: 3, fyPart: 'end' },
];

const COLORS = {
  Required: "#3B82F6",
  Available: "#1E3A8A",
};

const ManpowerTrendChart: React.FC<ManpowerTrendProps> = ({
  hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate FY years
  const getFYYears = () => {
    if (selectedYear) {
      return { fyStartYear: selectedYear, fyEndYear: selectedYear + 1 };
    }
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const fyStart = month < 3 ? year - 1 : year;
    return { fyStartYear: fyStart, fyEndYear: fyStart + 1 };
  };

  const { fyStartYear, fyEndYear } = getFYYears();
  const displayFY = `${fyStartYear}-${fyEndYear.toString().slice(-2)}`;

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('year', fyStartYear.toString());

        if (hqId) params.append('hq', hqId.toString());
        if (factoryId) params.append('factory', factoryId.toString());
        if (departmentId) params.append('department', departmentId.toString());
        if (lineId) params.append('line', lineId.toString());
        if (sublineId) params.append('subline', sublineId.toString());
        if (stationId) params.append('station', stationId.toString());

        const response = await fetch(
          `${API_BASE_URL}/chart/total-stats/?${params.toString()}`,
          { signal: abortController.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiData = await response.json();

        if (!Array.isArray(apiData)) {
          console.error('Invalid API response format:', apiData);
          throw new Error('Invalid data format received from server');
        }

        console.log('Manpower API Data:', apiData);

        // ✅ CRITICAL FIX: Map data using BOTH month AND year
        const fullYearData = financialYearConfig.map((config) => {
          // Determine which year this month should come from
          const targetYear = config.fyPart === 'start' ? fyStartYear : fyEndYear;
          
          // Find data matching BOTH month and year
          const monthData = apiData.find(
            (d: any) => d.month === config.id && d.year === targetYear
          );

          return {
            name: config.name,
            Required: monthData ? (monthData.total_required || 0) : 0,
            Available: monthData ? (monthData.total_available || 0) : 0,
          };
        });

        console.log('Mapped Manpower Data:', fullYearData);

        setData(fullYearData);

      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Manpower fetch aborted');
          return;
        }
        console.error('Manpower fetch error:', err);
        setError(err.message || 'Failed to load manpower data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 100);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear, fyStartYear, fyEndYear]);

  // ✅ Better loading state
  if (loading) {
    return (
      <div className="w-full h-[350px] bg-white rounded-lg shadow-lg p-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 text-sm">Loading manpower data...</p>
        </div>
      </div>
    );
  }

  // ✅ Better error state
  if (error) {
    return (
      <div className="w-full h-[350px] bg-white rounded-lg shadow-lg p-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-red-500 text-4xl">⚠️</div>
          <p className="text-red-600 font-medium">Failed to load data</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // ✅ Check if we have any data
  const hasData = data.some(d => d.Required > 0 || d.Available > 0);

  const customLegendData = [
    { id: 'Required', value: 'Required', type: 'square', color: COLORS.Required },
    { id: 'Available', value: 'Available', type: 'square', color: COLORS.Available },
  ];

  return (
    <div className="w-full h-[350px] bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">
        Manpower Availability Trend – FY {displayFY}
      </h2>
      
      {!hasData ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-400 text-sm">No manpower data available for this period</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: '#f3f4f6' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend
              verticalAlign="top"
              iconType="circle"
              align="center"
              wrapperStyle={{ paddingBottom: '20px' }}
              content={renderCustomLegend}
            />
            <Bar
              dataKey="Required"
              fill={COLORS.Required}
              radius={[4, 4, 0, 0]}
              barSize={20}
              name="Required"
            >
              <LabelList
                dataKey="Required"
                position="top"
                fontSize={10}
                formatter={(label: React.ReactNode) => {
                  const value = Number(label);
                  return value > 0 ? label : '';
                }}
              />
            </Bar>
            <Bar
              dataKey="Available"
              fill={COLORS.Available}
              radius={[4, 4, 0, 0]}
              barSize={20}
              name="Available"
            >
              <LabelList
                dataKey="Available"
                position="top"
                fontSize={10}
                formatter={(label: React.ReactNode) => {
                  const value = Number(label);
                  return value > 0 ? label : '';
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ManpowerTrendChart;