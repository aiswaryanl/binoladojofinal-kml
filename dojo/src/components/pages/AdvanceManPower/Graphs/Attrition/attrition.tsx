

// import React from 'react';
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList,
// } from 'recharts';
// import ChartSkeleton from '../../../../../components/Common/ChartSkeleton';

// interface AttritionProps {
//   data: any[];
//   loading?: boolean;
// }

// // CHANGED: Fiscal year order → Apr to Mar
// // Note: Backend returns { month: 1..12, attrition_rate: ... }
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

// const AttritionTrendChart: React.FC<AttritionProps> = ({ data, loading = false }) => {

//   const formattedData = React.useMemo(() => {
//     if (!data) return [];
//     return financialYearConfig.map((config) => {
//       const item = data.find((d: any) => d.month === config.id);
//       return {
//         name: config.name,
//         attrition: item ? item.attrition_rate : 0
//       };
//     });
//   }, [data]);

//   const CustomLegend = () => (
//     <div className="text-sm text-gray-600 text-center mt-2">
//       <span className="inline-flex items-center gap-2">
//         <div className="w-3 h-3 rounded-full bg-[#007bff]" />
//         Attrition Rate
//       </span>
//     </div>
//   );

//   if (loading) return <ChartSkeleton />;

//   return (
//     <div className="w-full h-[350px] bg-white rounded-lg shadow-lg p-4 flex flex-col">

//       {/* Title + Legend together at the top */}
//       <div className="text-center mb-4">
//         <h2 className="text-lg font-semibold text-gray-700">
//           Attrition Rate Trend
//         </h2>

//         {/* LEGEND MOVED HERE — directly below title */}
//         <div className="mt-3">
//           <CustomLegend />
//         </div>
//       </div>

//       {/* Chart takes remaining space */}
//       <div className="flex-1">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
//             <defs>
//               <linearGradient id="colorAttrition" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#007bff" stopOpacity={0.8} />
//                 <stop offset="95%" stopColor="#007bff" stopOpacity={0.1} />
//               </linearGradient>
//             </defs>
//             <XAxis
//               dataKey="name"
//               axisLine={false}
//               tickLine={false}
//               interval={0}
//               padding={{ left: 20, right: 20 }}
//             />
//             <YAxis hide domain={[0, 'dataMax + 5']} />
//             <Tooltip formatter={(value: any) => [`${value}%`, 'Attrition']} />

//             <Area
//               type="monotone"
//               dataKey="attrition"
//               stroke="#007bff"
//               fillOpacity={1}
//               fill="url(#colorAttrition)"
//             >
//               <LabelList dataKey="attrition" position="top" formatter={(val: any) => val > 0 ? `${val}%` : ''} fontSize={12} />
//             </Area>
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default AttritionTrendChart;




// import React, { useEffect, useState } from 'react';
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Legend,
// } from 'recharts';

// interface AttritionProps {
//   hqId: string | null;
//   factoryId: string | null;
//   departmentId: string | null;
//   lineId: string | null;
//   sublineId: string | null;
//   stationId: string | null;
//   selectedYear?: number; 
// }

// const API_BASE_URL = "http://192.168.2.51:8000";

// // Financial Year Configuration: April to March
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

// const AttritionTrendChart: React.FC<AttritionProps> = ({ 
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

//         // --- DYNAMIC YEAR LOGIC ---
//         const today = new Date();
//         const currentMonth = today.getMonth(); // 0 = Jan, 11 = Dec
//         const currentYear = today.getFullYear();

//         // Calculate Start Year based on System Date
//         // If Jan(0), Feb(1), or Mar(2), the FY started last year.
//         const fyStartYear = selectedYear 
//             ? selectedYear 
//             : (currentMonth < 3 ? currentYear - 1 : currentYear);

//         const params = new URLSearchParams();
//         params.append('year', fyStartYear.toString());

//         if (hqId) params.append('hq', hqId);
//         if (factoryId) params.append('factory', factoryId);
//         if (departmentId) params.append('department', departmentId);
//         if (lineId) params.append('line', lineId);
//         if (sublineId) params.append('subline', sublineId);
//         if (stationId) params.append('station', stationId);

//         const response = await fetch(`${API_BASE_URL}/chart/attrition-trend/?${params.toString()}`);
//         if (!response.ok) throw new Error('Failed to fetch data');
        
//         const apiData = await response.json();

//         // --- DATA MAPPING LOGIC ---
//         // Map the API results (which have month IDs) to our Fixed April-March Labels
//         const fullYearData = financialYearConfig.map((config) => {
//             // Find the data point that matches the month ID (e.g., 4 for April, 1 for Jan)
//             const found = apiData.find((d: any) => d.month === config.id);
            
//             return {
//                 name: config.name,
//                 attrition: found ? found.attrition_rate : 0,
//             };
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

//   const CustomLegend = () => (
//     <div className="text-sm text-gray-600 text-center mt-2">
//       <span className="inline-flex items-center gap-2">
//         <div className="w-3 h-3 rounded-full bg-[#007bff]" />
//         Attrition Rate
//       </span>
//     </div>
//   );

//   if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;
//   if (error) return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;

//   return (
//     <div className="w-full h-[350px] bg-white rounded-lg shadow-lg p-4">
//       <h2 className="text-center text-lg font-semibold mb-2 text-gray-700">
//         Attrition Rate Trend– FY {displayFY}
//       </h2>
      
//       <ResponsiveContainer width="100%" height="90%">
//         <AreaChart 
//             data={data} 
//             margin={{ top: 20, right: 20, left: 20, bottom: 0 }} 
//         >
//           <defs>
//             <linearGradient id="colorAttrition" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#007bff" stopOpacity={0.8}/>
//               <stop offset="95%" stopColor="#007bff" stopOpacity={0.1}/>
//             </linearGradient>
//           </defs>
          
//           <XAxis 
//             dataKey="name" 
//             axisLine={false} 
//             tickLine={false} 
//             interval={0} 
//             padding={{ left: 10, right: 10 }} 
//           />
          
//           <YAxis hide domain={[0, 'dataMax + 2']} />
//           <Tooltip 
//             cursor={{ stroke: '#007bff', strokeWidth: 1, strokeDasharray: '4 4' }}
//             formatter={(value: number) => [`${value}%`, 'Attrition']} 
//             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
//           />
//           <Legend content={<CustomLegend />} verticalAlign="top" height={36}/>
          
//           <Area 
//             type="monotone" 
//             dataKey="attrition" 
//             stroke="#007bff" 
//             fillOpacity={1} 
//             fill="url(#colorAttrition)" 
//           >
//             <LabelList 
//                 dataKey="attrition" 
//                 position="top" 
//                 formatter={(val: number) => val > 0 ? `${val}%` : ''} 
//                 fontSize={12} 
//             />
//           </Area>
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default AttritionTrendChart;

// import React, { useEffect, useState } from 'react';
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Legend,
// } from 'recharts';

// interface AttritionProps {
//   hqId: string | null;
//   factoryId: string | null;
//   departmentId: string | null;
//   lineId: string | null;
//   sublineId: string | null;
//   stationId: string | null;
//   selectedYear?: number; 
// }

// const API_BASE_URL = "http://192.168.2.51:8000";

// // Financial Year Configuration: April to March
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

// const AttritionTrendChart: React.FC<AttritionProps> = ({ 
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

//         const today = new Date();
//         const currentMonth = today.getMonth(); // 0 = Jan, 11 = Dec
//         const currentYear = today.getFullYear();

//         const fyStartYear = selectedYear 
//             ? selectedYear 
//             : (currentMonth < 3 ? currentYear - 1 : currentYear);

//         const params = new URLSearchParams();
//         params.append('year', fyStartYear.toString());

//         if (hqId) params.append('hq', hqId);
//         if (factoryId) params.append('factory', factoryId);
//         if (departmentId) params.append('department', departmentId);
//         if (lineId) params.append('line', lineId);
//         if (sublineId) params.append('subline', sublineId);
//         if (stationId) params.append('station', stationId);

//         const response = await fetch(`${API_BASE_URL}/chart/attrition-trend/?${params.toString()}`);
//         if (!response.ok) throw new Error('Failed to fetch data');
        
//         const apiData = await response.json();

//         // ✅ Map data using only month ID (backend handles year logic)
//         const fullYearData = financialYearConfig.map((config) => {
//             const found = apiData.find((d: any) => d.month === config.id);
            
//             return {
//                 name: config.name,
//                 attrition: found ? found.attrition_rate : 0,
//             };
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

//   const CustomLegend = () => (
//     <div className="text-sm text-gray-600 text-center mt-2">
//       <span className="inline-flex items-center gap-2">
//         <div className="w-3 h-3 rounded-full bg-[#007bff]" />
//         Attrition Rate
//       </span>
//     </div>
//   );

//   if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;
//   if (error) return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;

//   return (
//     <div className="w-full h-[350px] bg-white rounded-lg shadow-lg p-4">
//       <h2 className="text-center text-lg font-semibold mb-2 text-gray-700">
//         Attrition Rate Trend – FY {displayFY}
//       </h2>
      
//       <ResponsiveContainer width="100%" height="90%">
//         <AreaChart 
//             data={data} 
//             margin={{ top: 20, right: 20, left: 20, bottom: 0 }} 
//         >
//           <defs>
//             <linearGradient id="colorAttrition" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#007bff" stopOpacity={0.8}/>
//               <stop offset="95%" stopColor="#007bff" stopOpacity={0.1}/>
//             </linearGradient>
//           </defs>
          
//           <XAxis 
//             dataKey="name" 
//             axisLine={false} 
//             tickLine={false} 
//             interval={0} 
//             padding={{ left: 10, right: 10 }} 
//           />
          
//           <YAxis hide domain={[0, 'dataMax + 2']} />
//           <Tooltip 
//             cursor={{ stroke: '#007bff', strokeWidth: 1, strokeDasharray: '4 4' }}
//             formatter={(value: number) => [`${value}%`, 'Attrition']} 
//             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
//           />
//           <Legend content={<CustomLegend />} verticalAlign="top" height={36}/>
          
//           <Area 
//             type="monotone" 
//             dataKey="attrition" 
//             stroke="#007bff" 
//             fillOpacity={1} 
//             fill="url(#colorAttrition)" 
//           >
//             <LabelList 
//                 dataKey="attrition" 
//                 position="top" 
//                 formatter={(val: number) => val > 0 ? `${val}%` : ''} 
//                 fontSize={12} 
//             />
//           </Area>
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default AttritionTrendChart;



// import React, { useEffect, useState } from 'react';
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
//   Legend, LabelList,
// } from 'recharts';

// interface AttritionProps {
//   hqId: string | null;
//   factoryId: string | null;
//   departmentId: string | null;
//   lineId: string | null;
//   sublineId: string | null;
//   stationId: string | null;
//   selectedYear?: number;
// }

// const API_BASE_URL = "http://192.168.2.51:8000";

// // Financial Year months (April → March)
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

// type AttritionType = 'attrition_rate' | 'oet_attrition' | 'associate_attrition';

// const AttritionTrendChart: React.FC<AttritionProps> = ({
//   hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear
// }) => {
//   const [data, setData] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [attritionType, setAttritionType] = useState<AttritionType>('attrition_rate');

//   const displayFY = selectedYear
//     ? `${selectedYear}-${(selectedYear + 1).toString().slice(-2)}`
//     : (() => {
//         const now = new Date();
//         const month = now.getMonth() + 1; // 1-12
//         const year = now.getFullYear();
//         return month <= 3 ? `${year - 1}-${year.toString().slice(-2)}` : `${year}-${(year + 1).toString().slice(-2)}`;
//       })();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const fyStartYear = selectedYear ?? (
//           new Date().getMonth() + 1 <= 3 ? new Date().getFullYear() - 1 : new Date().getFullYear()
//         );

//         const params = new URLSearchParams();
//         params.append('year', fyStartYear.toString());

//         if (hqId)       params.append('hq',       hqId);
//         if (factoryId)  params.append('factory',  factoryId);
//         if (departmentId) params.append('department', departmentId);
//         if (lineId)     params.append('line',     lineId);
//         if (sublineId)  params.append('subline',  sublineId);
//         if (stationId)  params.append('station',  stationId);

//         const url = `${API_BASE_URL}/chart/attrition-trend/?${params.toString()}`;
//         const response = await fetch(url);

//         if (!response.ok) {
//           throw new Error(`HTTP ${response.status}`);
//         }

//         const apiData = await response.json();

//         // Map to full 12-month structure
//         const fullYearData = financialYearConfig.map((config) => {
//           const found = apiData.find((d: any) => d.month === config.id);
//           return {
//             name: config.name,
//             attrition_rate: found ? found.attrition_rate : 0,
//             oet_attrition: found ? found.oet_attrition : 0,
//             associate_attrition: found ? found.associate_attrition : 0,
//           };
//         });

//         setData(fullYearData);
//       } catch (err: any) {
//         console.error(err);
//         setError(err.message || "Failed to load attrition trend");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear]);

//   const CustomLegend = () => (
//     <div className="text-sm text-gray-600 text-center mt-2">
//       <span className="inline-flex items-center gap-2">
//         <div className="w-3 h-3 rounded-full bg-[#007bff]" />
//         {attritionType === 'attrition_rate' ? 'Overall Attrition' :
//          attritionType === 'oet_attrition' ? 'OET Attrition' :
//          'Associate Attrition'}
//       </span>
//     </div>
//   );

//   const getDataKey = () => attritionType;
//   const getStrokeColor = () => {
//     if (attritionType === 'oet_attrition') return "#007bff";       // emerald
//     if (attritionType === 'associate_attrition') return "#007bff"; // amber
//     return "#007bff"; // blue (default)
//   };

//   if (loading) return <div className="h-full flex items-center justify-center text-gray-500">Loading chart...</div>;
//   if (error)   return <div className="h-full flex items-center justify-center text-red-600">{error}</div>;

//   return (
//     <div className="w-full h-[380px] bg-white rounded-lg shadow-lg p-5">
//       <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
//         <h2 className="text-lg font-semibold text-gray-800">
//           Attrition Rate Trend – FY {displayFY}
//         </h2>

//         <select
//           value={attritionType}
//           onChange={(e) => setAttritionType(e.target.value as AttritionType)}
//           className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="attrition_rate">Overall Attrition</option>
//           <option value="oet_attrition">OET Attrition</option>
//           <option value="associate_attrition">Associate Attrition</option>
//         </select>
//       </div>

//       <ResponsiveContainer width="100%" height="85%">
//         <AreaChart
//           data={data}
//           margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
//         >
//           <defs>
//             <linearGradient id="colorAttr" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor={getStrokeColor()} stopOpacity={0.7} />
//               <stop offset="95%" stopColor={getStrokeColor()} stopOpacity={0.1} />
//             </linearGradient>
//           </defs>

//           <XAxis
//             dataKey="name"
//             axisLine={false}
//             tickLine={false}
//             interval={0}
//             padding={{ left: 10, right: 10 }}
//           />

//           <YAxis
//             hide={true}
//             domain={[0, 'dataMax + 2']}
//             tickFormatter={(v) => `${v}%`}
//           />

//           <Tooltip
//             formatter={(value: number) => [`${value.toFixed(2)}%`, 'Rate']}
//             contentStyle={{
//               borderRadius: '8px',
//               border: 'none',
//               boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//               backgroundColor: 'white',
//             }}
//           />

//           <Legend content={<CustomLegend />} verticalAlign="top" height={36} />

//           <Area
//             type="monotone"
//             dataKey={getDataKey()}
//             stroke={getStrokeColor()}
//             strokeWidth={2}
//             fillOpacity={1}
//             fill="url(#colorAttr)"
//           >
//             <LabelList
//               dataKey={getDataKey()}
//               position="top"
//               formatter={(val: number) => val > 0 ? `${val.toFixed(1)}%` : ''}
//               fontSize={12}
//               fill="#374151"
//             />
//           </Area>
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default AttritionTrendChart;


import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, LabelList,
} from 'recharts';

interface AttritionProps {
  hqId: string | null;
  factoryId: string | null;
  departmentId: string | null;
  lineId: string | null;
  sublineId: string | null;
  stationId: string | null;
  selectedYear?: number;
}

const API_BASE_URL = "http://192.168.2.51:8000";

// Financial Year months (April → March)
const financialYearConfig = [
  { name: "Apr", id: 4 },
  { name: "May", id: 5 },
  { name: "Jun", id: 6 },
  { name: "Jul", id: 7 },
  { name: "Aug", id: 8 },
  { name: "Sep", id: 9 },
  { name: "Oct", id: 10 },
  { name: "Nov", id: 11 },
  { name: "Dec", id: 12 },
  { name: "Jan", id: 1 },
  { name: "Feb", id: 2 },
  { name: "Mar", id: 3 },
];

type AttritionType = 'overall' | 'oet' | 'associate';

// Build FY label from start year  e.g. 2024 → "2024-25"
const fyLabel = (startYear: number) =>
  `${startYear}-${(startYear + 1).toString().slice(-2)}`;

// Get current FY start year
const currentFYStartYear = () => {
  const now = new Date();
  return now.getMonth() + 1 <= 3 ? now.getFullYear() - 1 : now.getFullYear();
};

// Generate FY options: last 4 years + current + next 1
const generateFYOptions = () => {
  const current = currentFYStartYear();
  return Array.from({ length: 6 }, (_, i) => current - 4 + i);
};

const AttritionTrendChart: React.FC<AttritionProps> = ({
  hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [attritionType, setAttritionType] = useState<AttritionType>('overall');

  // Internal year state — initialise from prop or current FY
  const [internalYear, setInternalYear] = useState<number>(
    selectedYear ?? currentFYStartYear()
  );

  // Sync when parent changes selectedYear prop
  useEffect(() => {
    if (selectedYear !== undefined) setInternalYear(selectedYear);
  }, [selectedYear]);

  const displayFY = fyLabel(internalYear);

  // ── Fetch from /api/attrition/?fy=YYYY-YY ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const fy = fyLabel(internalYear);
        const url = `${API_BASE_URL}/attrition/?fy=${fy}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const apiData: { date: string; oet: number; associate: number; overall: number }[] =
          await response.json();

        // Map API records by month number
        // date format from backend: "YYYY-MM-DD"
        const monthMap: Record<number, { oet: number; associate: number; overall: number }> = {};
       apiData.forEach(record => {
          const month = parseInt(record.date.split('-')[1], 10);
          const oet       = parseFloat(String(record.oet))       || 0;
          const associate = parseFloat(String(record.associate)) || 0;
          monthMap[month] = {
            oet,
            associate,
            overall: parseFloat((oet + associate).toFixed(2)),
          };
        });

        // Build full 12-month chart data (zero-fill missing months)
        const fullYearData = financialYearConfig.map(config => {
          const found = monthMap[config.id];
          return {
            name: config.name,
            overall: found ? found.overall : 0,
            oet:     found ? found.oet     : 0,
            associate: found ? found.associate : 0,
          };
        });

        setData(fullYearData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load attrition trend");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [internalYear]); // re-fetch only when year changes (filters removed — new API has no filter params)

  const getDataKey = (): AttritionType => attritionType;

  const getStrokeColor = () => {
    if (attritionType === 'oet')       return "#007bff"; // amber
    if (attritionType === 'associate') return "#007bff"; // emerald
    return "#007bff";                                    // blue (overall)
  };

  const getLabel = () => {
    if (attritionType === 'oet')       return 'OET Attrition';
    if (attritionType === 'associate') return 'Associate Attrition';
    return 'Overall Attrition';
  };

  const CustomLegend = () => (
    <div className="text-sm text-gray-600 text-center mt-2">
      <span className="inline-flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStrokeColor() }} />
        {getLabel()}
      </span>
    </div>
  );

  if (loading) return (
    <div className="w-full h-[380px] bg-white rounded-lg shadow-lg p-5 flex items-center justify-center text-gray-500">
      Loading chart...
    </div>
  );

  if (error) return (
    <div className="w-full h-[380px] bg-white rounded-lg shadow-lg p-5 flex items-center justify-center text-red-600">
      {error}
    </div>
  );

  return (
    <div className="w-full h-[350px] bg-white rounded-lg shadow-lg p-5">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h2 className="text-lg font-semibold text-gray-800">
          Attrition Trend – FY {displayFY}
        </h2>

        <div className="flex items-center gap-3 flex-wrap">

          {/* ── Year Filter ── */}
          {/* <select
            value={internalYear}
            onChange={e => setInternalYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {generateFYOptions().map(yr => (
              <option key={yr} value={yr}>{fyLabel(yr)}</option>
            ))}
          </select> */}

          {/* ── Attrition Type Filter ── */}
          <select
            value={attritionType}
            onChange={e => setAttritionType(e.target.value as AttritionType)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="overall">Overall Attrition</option>
            <option value="oet">OET Attrition</option>
            <option value="associate">Associate Attrition</option>
          </select>

        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAttr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={getStrokeColor()} stopOpacity={0.7} />
              <stop offset="95%" stopColor={getStrokeColor()} stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            interval={0}
            padding={{ left: 10, right: 10 }}
          />

          <YAxis
            hide={true}
            domain={[0, 'dataMax + 2']}
          />

          {/* <Tooltip
            formatter={(value: number) => [`${value}`, getLabel()]} */}
            <Tooltip
            formatter={(value: number) => [`${parseFloat(String(value)).toFixed(2)}%`, getLabel()]}
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              backgroundColor: 'white',
            }}
          />

          <Legend content={<CustomLegend />} verticalAlign="top" height={36} />

          <Area
            type="monotone"
            dataKey={getDataKey()}
            stroke={getStrokeColor()}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAttr)"
          >
            <LabelList
              dataKey={getDataKey()}
              position="top"
              formatter={(val: number) => val > 0 ? `${parseFloat(String(val)).toFixed(2)}%` : ''}
              fontSize={12}
              fill="#374151"
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttritionTrendChart;