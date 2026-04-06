
// // import React, { useEffect, useState } from 'react';
// // import {
// //   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid
// // } from 'recharts';
// // import ChartSkeleton from '../../../../../components/Common/ChartSkeleton';

// // interface AbsenteeismProps {
// //   data: any[];
// //   loading?: boolean;
// // }

// // // FISCAL YEAR ORDER removed monthNames constant


// // const financialYearConfig = [
// //   { name: "Apr", id: 4 },
// //   { name: "May", id: 5 },
// //   { name: "Jun", id: 6 },
// //   { name: "Jul", id: 7 },
// //   { name: "Aug", id: 8 },
// //   { name: "Sep", id: 9 },
// //   { name: "Oct", id: 10 },
// //   { name: "Nov", id: 11 },
// //   { name: "Dec", id: 12 },
// //   { name: "Jan", id: 1 },
// //   { name: "Feb", id: 2 },
// //   { name: "Mar", id: 3 },
// // ];

// // const Absenteeism: React.FC<AbsenteeismProps> = ({
// //   data, loading = false
// // }) => {
// //   const [containerWidth, setContainerWidth] = useState<number>(560);

// //   useEffect(() => {
// //     const handleResize = () => {
// //       const container = document.getElementById('absentee-chart-container');
// //       if (container) setContainerWidth(container.clientWidth);
// //     };
// //     handleResize();
// //     window.addEventListener('resize', handleResize);
// //     return () => window.removeEventListener('resize', handleResize);
// //   }, []);

// //   const formattedData = React.useMemo(() => {
// //     if (!data) return [];
// //     return financialYearConfig.map((config) => {
// //       const item = data.find((d: any) => d.month === config.id);
// //       return {
// //         month: config.name,
// //         absenteeism: item ? item.absenteeism_rate : 0,
// //       };
// //     });
// //   }, [data]);

// //   if (loading) return <ChartSkeleton />;

// //   return (
// //     <div id="absentee-chart-container" className="w-full h-[350px] bg-white rounded-lg shadow-md p-4 border border-gray-100 flex flex-col">

// //       <div className="flex flex-col items-center justify-center mb-4 px-2 w-full gap-1">

// //         {/* Title */}
// //         <h2 className="text-lg font-semibold text-gray-700">
// //           Absenteeism Rate Trend
// //         </h2>

// //         {/* Legend (Stacked under title) */}
// //         <div className="text-xs sm:text-sm text-gray-600">
// //           <span className="inline-flex items-center gap-2">
// //             <div className="w-3 h-3 rounded-full bg-[#007bff]" />
// //             Absenteeism Rate
// //           </span>
// //         </div>
// //       </div>

// //       {/* Chart Area */}
// //       <div className="flex-1">
// //         <ResponsiveContainer width="100%" height="100%">
// //           <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
// //             <defs>
// //               <linearGradient id="colorAbsentee" x1="0" y1="0" x2="0" y2="1">
// //                 <stop offset="5%" stopColor="#007bff" stopOpacity={0.6} />
// //                 <stop offset="95%" stopColor="#007bff" stopOpacity={0.05} />
// //               </linearGradient>
// //             </defs>

// //             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />

// //             <XAxis
// //               dataKey="month"
// //               axisLine={false}
// //               tickLine={false}
// //               interval={0}
// //               padding={{ left: 20, right: 20 }}
// //               dy={10}
// //             />

// //             <Tooltip
// //               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
// //               formatter={(value: any) => [`${value}%`, 'Absentee Rate']}
// //               cursor={{ stroke: '#007bff', strokeWidth: 1, strokeDasharray: '5 5' }}
// //             />

// //             <Area
// //               type="monotone"
// //               dataKey="absenteeism"
// //               stroke="#007bff"
// //               strokeWidth={2}
// //               fill="url(#colorAbsentee)"
// //               animationDuration={1500}
// //             >
// //               <LabelList
// //                 dataKey="absenteeism"
// //                 position="top"
// //                 offset={10}
// //                 fontSize={11}
// //                 fill="#007bff"
// //                 formatter={(v: any) => v > 0 ? `${v}%` : ''}
// //               />
// //             </Area>
// //           </AreaChart>
// //         </ResponsiveContainer>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Absenteeism;




// import React, { useEffect, useState } from 'react';
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid
// } from 'recharts';

// interface AbsenteeismProps {
//   hqId: number | null;
//   factoryId: number | null;
//   departmentId: number | null;
//   lineId: number | null;
//   sublineId: number | null;
//   stationId: number | null;
//   selectedYear?: number;
// }

// const API_BASE_URL = "http://127.0.0.1:8000";

// // FISCAL YEAR ORDER (Apr - Mar)
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

// const Absenteeism: React.FC<AbsenteeismProps> = ({
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

//         // --- AUTOMATIC YEAR SWITCH LOGIC ---
//         const today = new Date();
//         const currentMonth = today.getMonth(); // 0 = Jan, 11 = Dec
//         const currentYear = today.getFullYear();
        
//         // If Jan, Feb, Mar -> Start Year is Previous Year
//         const fyStartYear = selectedYear 
//             ? selectedYear 
//             : (currentMonth < 3 ? currentYear - 1 : currentYear);

//         const params = new URLSearchParams();
//         params.append('year', fyStartYear.toString());

//         if (hqId) params.append('hq', hqId.toString());
//         if (factoryId) params.append('factory', factoryId.toString());
//         if (departmentId) params.append('department', departmentId.toString());
//         if (lineId) params.append('line', lineId.toString());
//         if (sublineId) params.append('subline', sublineId.toString());
//         if (stationId) params.append('station', stationId.toString());

//         // Single Fetch (Backend now handles the overlap)
//         const response = await fetch(`${API_BASE_URL}/chart/absenteeism-trendlive/?${params.toString()}`);

//         if (!response.ok) throw new Error("Failed to fetch data");

//         const apiData = await response.json();

//         // --- MAP DATA TO APR-MAR LABELS ---
//         const fullYearData = financialYearConfig.map((config) => {
//           const found = apiData.find((d: any) => d.month === config.id);

//           return {
//             month: config.name,
//             absenteeism: found ? found.absenteeism_rate : 0,
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

//   if (loading) return <div className="h-[350px] flex items-center justify-center text-gray-500 animate-pulse">Loading Chart...</div>;
//   if (error) return <div className="h-[350px] flex items-center justify-center text-red-500">Error loading data</div>;

//   return (
//     <div id="absentee-chart-container" className="w-full h-[350px] bg-white rounded-lg shadow-md p-4 border border-gray-100 flex flex-col">
//       <div className="flex flex-col items-center justify-center mb-4 px-2 w-full gap-1">
//         <h2 className="text-lg font-semibold text-gray-700">
//           Absenteeism Rate Trend– FY {displayFY}
//         </h2>
//         <div className="text-xs sm:text-sm text-gray-600">
//           <span className="inline-flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full bg-[#007bff]" />
//             Absenteeism Rate 
//           </span>
//         </div>
//       </div>

//       <div className="flex-1">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
//             <defs>
//               <linearGradient id="colorAbsentee" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#007bff" stopOpacity={0.6} />
//                 <stop offset="95%" stopColor="#007bff" stopOpacity={0.05} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
//             <XAxis
//               dataKey="month"
//               axisLine={false}
//               tickLine={false}
//               interval={0} 
//               padding={{ left: 20, right: 20 }}
//               dy={10}
//             />
//             <Tooltip 
//               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
//               formatter={(value: number) => [`${value}%`, 'Absentee Rate']} 
//               cursor={{ stroke: '#007bff', strokeWidth: 1, strokeDasharray: '5 5' }}
//             />
//             <Area
//               type="monotone"
//               dataKey="absenteeism"
//               stroke="#007bff"
//               strokeWidth={2}
//               fill="url(#colorAbsentee)"
//               animationDuration={1500}
//             >
//               <LabelList
//                 dataKey="absenteeism"
//                 position="top"
//                 offset={10}
//                 fontSize={11}
//                 fill="#007bff"
//                 formatter={(v: number) => v > 0 ? `${v}%` : ''}
//               />
//             </Area>
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default Absenteeism;



// import React, { useEffect, useState } from 'react';
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid
// } from 'recharts';

// interface AbsenteeismProps {
//   hqId: number | null;
//   factoryId: number | null;
//   departmentId: number | null;
//   lineId: number | null;
//   sublineId: number | null;
//   stationId: number | null;
//   selectedYear?: number;
// }

// const API_BASE_URL = "http://127.0.0.1:8000";

// // FISCAL YEAR ORDER (Apr - Mar)
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

// const Absenteeism: React.FC<AbsenteeismProps> = ({
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

//         if (hqId) params.append('hq', hqId.toString());
//         if (factoryId) params.append('factory', factoryId.toString());
//         if (departmentId) params.append('department', departmentId.toString());
//         if (lineId) params.append('line', lineId.toString());
//         if (sublineId) params.append('subline', sublineId.toString());
//         if (stationId) params.append('station', stationId.toString());

//         const response = await fetch(`${API_BASE_URL}/chart/absenteeism-trendlive/?${params.toString()}`);

//         if (!response.ok) throw new Error("Failed to fetch data");

//         const apiData = await response.json();

//         // ✅ Map data using only month ID (backend handles year logic)
//         const fullYearData = financialYearConfig.map((config) => {
//           const found = apiData.find((d: any) => d.month === config.id);

//           return {
//             month: config.name,
//             absenteeism: found ? found.absenteeism_rate : 0,
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

//   if (loading) return <div className="h-[350px] flex items-center justify-center text-gray-500 animate-pulse">Loading Chart...</div>;
//   if (error) return <div className="h-[350px] flex items-center justify-center text-red-500">Error loading data</div>;

//   return (
//     <div id="absentee-chart-container" className="w-full h-[350px] bg-white rounded-lg shadow-md p-4 border border-gray-100 flex flex-col">
//       <div className="flex flex-col items-center justify-center mb-4 px-2 w-full gap-1">
//         <h2 className="text-lg font-semibold text-gray-700">
//           Absenteeism Rate Trend – FY {displayFY}
//         </h2>
//         <div className="text-xs sm:text-sm text-gray-600">
//           <span className="inline-flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full bg-[#007bff]" />
//             Absenteeism Rate 
//           </span>
//         </div>
//       </div>

//       <div className="flex-1">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
//             <defs>
//               <linearGradient id="colorAbsentee" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#007bff" stopOpacity={0.6} />
//                 <stop offset="95%" stopColor="#007bff" stopOpacity={0.05} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
//             <XAxis
//               dataKey="month"
//               axisLine={false}
//               tickLine={false}
//               interval={0} 
//               padding={{ left: 20, right: 20 }}
//               dy={10}
//             />
//             <Tooltip 
//               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
//               formatter={(value: number) => [`${value}%`, 'Absentee Rate']} 
//               cursor={{ stroke: '#007bff', strokeWidth: 1, strokeDasharray: '5 5' }}
//             />
//             <Area
//               type="monotone"
//               dataKey="absenteeism"
//               stroke="#007bff"
//               strokeWidth={2}
//               fill="url(#colorAbsentee)"
//               animationDuration={1500}
//             >
//               <LabelList
//                 dataKey="absenteeism"
//                 position="top"
//                 offset={10}
//                 fontSize={11}
//                 fill="#007bff"
//                 formatter={(v: number) => v > 0 ? `${v}%` : ''}
//               />
//             </Area>
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default Absenteeism;



// import React, { useEffect, useState } from 'react';
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid
// } from 'recharts';

// interface AbsenteeismProps {
//   hqId: number | null;
//   factoryId: number | null;
//   departmentId: number | null;
//   lineId: number | null;
//   sublineId: number | null;
//   stationId: number | null;
//   selectedYear?: number;
// }

// const API_BASE_URL = "http://127.0.0.1:8000";

// // FISCAL YEAR ORDER (Apr - Mar)
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

// const Absenteeism: React.FC<AbsenteeismProps> = ({
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
//     // ✅ Abort controller for cleanup
//     const abortController = new AbortController();
    
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

//         if (hqId) params.append('hq', hqId.toString());
//         if (factoryId) params.append('factory', factoryId.toString());
//         if (departmentId) params.append('department', departmentId.toString());
//         if (lineId) params.append('line', lineId.toString());
//         if (sublineId) params.append('subline', sublineId.toString());
//         if (stationId) params.append('station', stationId.toString());

//         const response = await fetch(
//           `${API_BASE_URL}/chart/absenteeism-trendlive/?${params.toString()}`,
//           { signal: abortController.signal }
//         );

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const apiData = await response.json();

//         // ✅ Validate data is array
//         if (!Array.isArray(apiData)) {
//           console.error('Invalid API response format:', apiData);
//           throw new Error('Invalid data format received from server');
//         }

//         console.log('Absenteeism API Data:', apiData); // Debug log

//         // ✅ Map data using only month ID
//         const fullYearData = financialYearConfig.map((config) => {
//           const found = apiData.find((d: any) => d.month === config.id);

//           // ✅ Parse and validate the value
//           let absenteeismValue = 0;
//           if (found && found.absenteeism_rate !== null && found.absenteeism_rate !== undefined) {
//             absenteeismValue = parseFloat(found.absenteeism_rate);
//             if (isNaN(absenteeismValue)) {
//               absenteeismValue = 0;
//             }
//           }

//           return {
//             month: config.name,
//             absenteeism: absenteeismValue,
//           };
//         });

//         console.log('Mapped Absenteeism Data:', fullYearData); // Debug log

//         setData(fullYearData);

//       } catch (err: any) {
//         if (err.name === 'AbortError') {
//           console.log('Absenteeism fetch aborted');
//           return;
//         }
//         console.error('Absenteeism fetch error:', err);
//         setError(err.message || 'Failed to load absenteeism data');
//         setData([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     // ✅ Debounce to prevent rapid requests
//     const timeoutId = setTimeout(fetchData, 150);

//     return () => {
//       clearTimeout(timeoutId);
//       abortController.abort();
//     };
//   }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear]);

//   // ✅ Better loading state
//   if (loading) {
//     return (
//       <div className="w-full h-[350px] bg-white rounded-lg shadow-md p-4 border border-gray-100 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//           <p className="text-gray-500 text-sm">Loading absenteeism data...</p>
//         </div>
//       </div>
//     );
//   }

//   // ✅ Better error state
//   if (error) {
//     return (
//       <div className="w-full h-[350px] bg-white rounded-lg shadow-md p-4 border border-gray-100 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3 text-center">
//           <div className="text-red-500 text-4xl">⚠️</div>
//           <p className="text-red-600 font-medium">Failed to load data</p>
//           <p className="text-gray-500 text-sm">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   // ✅ Check if we have any data
//   const hasData = data.some(d => d.absenteeism > 0);

//   return (
//     <div id="absentee-chart-container" className="w-full h-[350px] bg-white rounded-lg shadow-md p-4 border border-gray-100 flex flex-col">
//       <div className="flex flex-col items-center justify-center mb-4 px-2 w-full gap-1">
//         <h2 className="text-lg font-semibold text-gray-700">
//           Absenteeism Rate Trend – FY {displayFY}
//         </h2>
//         <div className="text-xs sm:text-sm text-gray-600">
//           <span className="inline-flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full bg-[#007bff]" />
//             Absenteeism Rate 
//           </span>
//         </div>
//       </div>

//       {!hasData ? (
//         <div className="flex-1 flex items-center justify-center">
//           <p className="text-gray-400 text-sm">No absenteeism data available for this period</p>
//         </div>
//       ) : (
//         <div className="flex-1">
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
//               <defs>
//                 <linearGradient id="colorAbsentee" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#007bff" stopOpacity={0.6} />
//                   <stop offset="95%" stopColor="#007bff" stopOpacity={0.05} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
//               <XAxis
//                 dataKey="month"
//                 axisLine={false}
//                 tickLine={false}
//                 interval={0} 
//                 padding={{ left: 20, right: 20 }}
//                 dy={10}
//               />
//               <YAxis hide domain={[0, 'dataMax + 2']} />
//               <Tooltip 
//                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
//                 formatter={(value: number) => [`${value}%`, 'Absentee Rate']} 
//                 cursor={{ stroke: '#007bff', strokeWidth: 1, strokeDasharray: '5 5' }}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="absenteeism"
//                 stroke="#007bff"
//                 strokeWidth={2}
//                 fill="url(#colorAbsentee)"
//                 animationDuration={1500}
//               >
//                 <LabelList
//                   dataKey="absenteeism"
//                   position="top"
//                   offset={10}
//                   fontSize={11}
//                   fill="#007bff"
//                   formatter={(v: number) => v > 0 ? `${v}%` : ''}
//                 />
//               </Area>
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Absenteeism;


import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid
} from 'recharts';

interface AbsenteeismProps {
  hqId: number | null;
  factoryId: number | null;
  departmentId: number | null;
  lineId: number | null;
  sublineId: number | null;
  stationId: number | null;
  selectedYear?: number;
}

const API_BASE_URL = "http://127.0.0.1:8000";

// FISCAL YEAR ORDER (Apr - Mar)
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
  { name: "Jan", id: 1, fyPart: 'end' },   // Next year
  { name: "Feb", id: 2, fyPart: 'end' },   // Next year
  { name: "Mar", id: 3, fyPart: 'end' },   // Next year
];

const Absenteeism: React.FC<AbsenteeismProps> = ({
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
          `${API_BASE_URL}/chart/absenteeism-trendlive/?${params.toString()}`,
          { signal: abortController.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

// ✅ Inside your Absenteeism component's fetchData function:

const apiData = await response.json();

// Map exactly 12 months in the Apr -> Mar order
const fullYearData = financialYearConfig.map((config) => {
  // Logic: Apr-Dec belong to fyStartYear, Jan-Mar belong to fyEndYear
  const targetYear = config.fyPart === 'start' ? fyStartYear : fyEndYear;
  
  // Find data where both month AND year match
  const found = apiData.find(
    (d: any) => d.month === config.id && d.year === targetYear
  );

  let absenteeismValue = 0;
  if (found && found.absenteeism_rate != null) {
    absenteeismValue = parseFloat(found.absenteeism_rate);
  }

  return {
    month: config.name,
    absenteeism: isNaN(absenteeismValue) ? 0 : absenteeismValue,
    fullDate: `${config.name} ${targetYear}` // Useful for Tooltip
  };
});

setData(fullYearData);

      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Absenteeism fetch aborted');
          return;
        }
        console.error('Absenteeism fetch error:', err);
        setError(err.message || 'Failed to load absenteeism data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 150);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear, fyStartYear, fyEndYear]);

  if (loading) {
    return (
      <div className="w-full h-[350px] bg-white rounded-lg shadow-md p-4 border border-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 text-sm">Loading absenteeism data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[350px] bg-white rounded-lg shadow-md p-4 border border-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-red-500 text-4xl">⚠️</div>
          <p className="text-red-600 font-medium">Failed to load data</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const hasData = data.some(d => d.absenteeism > 0);

  return (
    <div id="absentee-chart-container" className="w-full h-[350px] bg-white rounded-lg shadow-md p-4 border border-gray-100 flex flex-col">
      <div className="flex flex-col items-center justify-center mb-4 px-2 w-full gap-1">
        <h2 className="text-lg font-semibold text-gray-700">
          Absenteeism Rate Trend – FY {displayFY}
        </h2>
        <div className="text-xs sm:text-sm text-gray-600">
          <span className="inline-flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#007bff]" />
            Absenteeism Rate 
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No absenteeism data available for this period</p>
        </div>
      ) : (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorAbsentee" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007bff" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#007bff" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                interval={0} 
                padding={{ left: 20, right: 20 }}
                dy={10}
              />
              <YAxis hide domain={[0, 'dataMax + 2']} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value}%`, 'Absentee Rate']} 
                cursor={{ stroke: '#007bff', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Area
                type="monotone"
                dataKey="absenteeism"
                stroke="#007bff"
                strokeWidth={2}
                fill="url(#colorAbsentee)"
                animationDuration={1500}
              >
                <LabelList
                  dataKey="absenteeism"
                  position="top"
                  offset={10}
                  fontSize={11}
                  fill="#007bff"
                  formatter={(v: number) => v > 0 ? `${v}%` : ''}
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Absenteeism;