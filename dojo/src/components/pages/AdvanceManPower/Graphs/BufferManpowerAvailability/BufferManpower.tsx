

// import React, { useEffect, useState } from 'react';
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList,
// } from 'recharts';
// import ChartSkeleton from '../../../../../components/Common/ChartSkeleton';

// interface BufferProps {
//   data: any[];
//   loading?: boolean;
// }

// // Fiscal year order (April to March)
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

// const BufferManpowerAvailability: React.FC<BufferProps> = ({
//   data, loading = false
// }) => {
//   const [containerWidth, setContainerWidth] = useState<number>(560);

//   useEffect(() => {
//     const handleResize = () => {
//       const container = document.getElementById('buffer-chart-container');
//       if (container) setContainerWidth(container.clientWidth);
//     };
//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const formattedData = React.useMemo(() => {
//     if (!data) return [];
//     return financialYearConfig.map((config) => {
//       const item = data.find((d: any) => d.month === config.id);
//       return {
//         month: config.name,
//         required: item ? item.buffer_manpower_required : 0,
//         available: item ? item.buffer_manpower_available : 0,
//       };
//     });
//   }, [data]);

//   const CustomLegend = () => (
//     <div className="bg-white rounded-full px-3 py-1 inline-flex gap-3 text-xs sm:text-sm shadow-sm">
//       <div className="flex items-center gap-1">
//         <div className="w-3 h-3 bg-[#1e40af] rounded-full" />
//         {/* You might want to rename this label in the UI to 'Difference' or 'Surplus/Deficit' */}
//         <span>Difference (Available)</span>
//       </div>
//       <div className="flex items-center gap-1">
//         <div className="w-3 h-3 bg-[#339CFF] rounded-full" />
//         <span>Buffer Required</span>
//       </div>
//     </div>
//   );

//   const labelFontSize = containerWidth < 500 ? 10 : 12;

//   if (loading) return <ChartSkeleton />;

//   return (
//     <div id="buffer-chart-container" className="relative w-full h-[350px] bg-white rounded-lg shadow-lg p-4 flex flex-col">

//       <div className="text-center mb-3">
//         <h2 className="text-lg font-semibold text-gray-700 inline-block">
//           Buffer Manpower Trend
//         </h2>
//         <div className="mt-2">
//           <CustomLegend />
//         </div>
//       </div>

//       <div className="flex-1">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
//             <defs>
//               <linearGradient id="colorRequired" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#339CFF" stopOpacity={0.7} />
//                 <stop offset="95%" stopColor="#339CFF" stopOpacity={0.1} />
//               </linearGradient>
//               <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#1e40af" stopOpacity={0.7} />
//                 <stop offset="95%" stopColor="#1e40af" stopOpacity={0.1} />
//               </linearGradient>
//             </defs>

//             <XAxis
//               dataKey="month"
//               axisLine={false}
//               tickLine={false}
//               interval={0}
//               padding={{ left: 20, right: 20 }}
//             />

//             {/* 
//               Changed domain to ['auto', 'auto'] 
//               because 'Difference' can be negative (shortage).
//             */}
//             <YAxis hide domain={['auto', 'auto']} />
//             <Tooltip />

//             {/* Difference (Mapped to 'available' key) */}
//             <Area type="monotone" dataKey="available" stroke="#1e40af" fill="url(#colorAvailable)">
//               <LabelList
//                 dataKey="available"
//                 position="top"
//                 fontSize={labelFontSize}
//                 // Removed the check > 0 so negative differences are also shown
//                 formatter={(v: any) => v !== 0 ? v : ''}
//               />
//             </Area>

//             {/* Buffer Required */}
//             <Area type="monotone" dataKey="required" stroke="#339CFF" fill="url(#colorRequired)">
//               <LabelList
//                 dataKey="required"
//                 position="top"
//                 fontSize={labelFontSize}
//                 formatter={(v: any) => v > 0 ? v : ''}
//               />
//             </Area>
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default BufferManpowerAvailability;




// import React, { useEffect, useState } from 'react';
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Legend,
// } from 'recharts';

// interface BufferProps {
//   hqId: number | null;
//   factoryId: number | null;
//   departmentId: number | null;
//   lineId: number | null;
//   sublineId: number | null;
//   stationId: number | null;
//   selectedYear?: number; 
//   // removed unused props for clarity
// }

// const API_BASE_URL = "http://127.0.0.1:8000";

// // Labels ordered for Financial Year (Apr - Mar)
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

// const BufferManpowerAvailability: React.FC<BufferProps> = ({ 
//   hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear 
// }) => {
//   const [data, setData] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [containerWidth, setContainerWidth] = useState<number>(560);
//   const displayFY = selectedYear 
//     ? `${selectedYear}-${(selectedYear + 1).toString().slice(-2)}`
//     : (() => {
//         const now = new Date();
//         const month = now.getMonth();
//         const year = now.getFullYear();
//         const fyStart = month < 3 ? year - 1 : year;
//         return `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
//       })();

//   // Handle Resize
//   useEffect(() => {
//     const handleResize = () => {
//       const container = document.getElementById('buffer-chart-container');
//       if (container) setContainerWidth(container.clientWidth);
//     };
//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

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

//         if (hqId) params.append('hq', hqId.toString());
//         if (factoryId) params.append('factory', factoryId.toString());
//         if (departmentId) params.append('department', departmentId.toString());
//         if (lineId) params.append('line', lineId.toString());
//         if (sublineId) params.append('subline', sublineId.toString());
//         if (stationId) params.append('station', stationId.toString());

//         const response = await fetch(`${API_BASE_URL}/chart/buffer-manpower-trend/?${params.toString()}`);
//         if (!response.ok) throw new Error('Failed to fetch data');
        
//         const apiData = await response.json();

//         // --- DATA MAPPING LOGIC ---
//         // Map API data (Month IDs 1-12) to Financial Year Order (Apr-Mar)
//         const fullYearData = financialYearConfig.map((config) => {
//             const found = apiData.find((d: any) => d.month === config.id);
            
//             return {
//                 month: config.name,
//                 required: found ? found.buffer_manpower_required : 0,
//                 available: found ? found.buffer_manpower_available : 0,
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
//     <div className="w-full flex justify-center items-center gap-4 mt-2">
//       <div className="flex items-center gap-1">
//         <div className="w-3 h-3 bg-[#339CFF] rounded-full" />
//         <span className="text-sm text-gray-600">Required</span>
//       </div>
//       <div className="flex items-center gap-1">
//         <div className="w-3 h-3 bg-[#1a365d] rounded-full" />
//         <span className="text-sm text-gray-600">Available</span>
//       </div>
//     </div>
//   );

//   const labelFontSize = containerWidth < 500 ? 10 : 12;
//   const tickFontSize = containerWidth < 500 ? 10 : 12;

//   if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;
//   if (error) return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;

//   return (
//     <div id="buffer-chart-container" className="relative w-full h-[350px] bg-white rounded-lg shadow-lg p-4">
//       <h2 className="text-center text-lg font-semibold mb-2 text-gray-700">Buffer Manpower Trend– FY {displayFY}</h2>
//       <ResponsiveContainer width="100%" height="90%">
//         <AreaChart 
//             data={data} 
//             margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
//         >
//           <defs>
//             <linearGradient id="colorRequired" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#339CFF" stopOpacity={0.7}/>
//                 <stop offset="95%" stopColor="#339CFF" stopOpacity={0.1}/>
//             </linearGradient>
//             <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#1a365d" stopOpacity={0.7}/>
//                 <stop offset="95%" stopColor="#1a365d" stopOpacity={0.1}/>
//             </linearGradient>
//           </defs>
          
//           <Legend content={<CustomLegend />} verticalAlign="top" height={36} />

//           <XAxis 
//             dataKey="month" 
//             tick={{ fontSize: tickFontSize }} 
//             axisLine={false} 
//             tickLine={false}
//             interval={0} 
//             padding={{ left: 10, right: 10 }}
//           />
          
//           <YAxis hide domain={[0, 'dataMax + 5']} />
//           <Tooltip />
          
//           <Area type="monotone" dataKey="required" stroke="#339CFF" fill="url(#colorRequired)">
//             <LabelList dataKey="required" position="top" fontSize={labelFontSize} formatter={(v: number) => v > 0 ? v : ''} />
//           </Area>
//           <Area type="monotone" dataKey="available" stroke="#1a365d" fill="url(#colorAvailable)">
//             <LabelList dataKey="available" position="top" fontSize={labelFontSize} formatter={(v: number) => v > 0 ? v : ''} />
//           </Area>
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default BufferManpowerAvailability;



// import React, { useEffect, useState } from 'react';
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Legend,
// } from 'recharts';

// interface BufferProps {
//   hqId: number | null;
//   factoryId: number | null;
//   departmentId: number | null;
//   lineId: number | null;
//   sublineId: number | null;
//   stationId: number | null;
//   selectedYear?: number; 
// }

// const API_BASE_URL = "http://127.0.0.1:8000";

// // Financial Year Config: Maps month names to month IDs and which FY-part they belong to
// const financialYearConfig = [
//   { name: "Apr", id: 4, fyPart: 'start' },
//   { name: "May", id: 5, fyPart: 'start' },
//   { name: "Jun", id: 6, fyPart: 'start' },
//   { name: "Jul", id: 7, fyPart: 'start' },
//   { name: "Aug", id: 8, fyPart: 'start' },
//   { name: "Sep", id: 9, fyPart: 'start' },
//   { name: "Oct", id: 10, fyPart: 'start' },
//   { name: "Nov", id: 11, fyPart: 'start' },
//   { name: "Dec", id: 12, fyPart: 'start' },
//   { name: "Jan", id: 1, fyPart: 'end' },   // Belongs to next calendar year
//   { name: "Feb", id: 2, fyPart: 'end' },   // Belongs to next calendar year
//   { name: "Mar", id: 3, fyPart: 'end' },   // Belongs to next calendar year
// ];

// const BufferManpowerAvailability: React.FC<BufferProps> = ({ 
//   hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear 
// }) => {
//   const [data, setData] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [containerWidth, setContainerWidth] = useState<number>(560);
  
//   // Calculate FY Start Year
//   const getFYStartYear = () => {
//     if (selectedYear) return selectedYear;
//     const now = new Date();
//     const currentMonth = now.getMonth() + 1; // 1-12
//     const currentYear = now.getFullYear();
//     return currentMonth <= 3 ? currentYear - 1 : currentYear;
//   };

//   const fyStartYear = getFYStartYear();
//   const fyEndYear = fyStartYear + 1;
//   const displayFY = `${fyStartYear}-${fyEndYear.toString().slice(-2)}`;

//   // Handle Resize
//   useEffect(() => {
//     const handleResize = () => {
//       const container = document.getElementById('buffer-chart-container');
//       if (container) setContainerWidth(container.clientWidth);
//     };
//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const params = new URLSearchParams();
//         params.append('year', fyStartYear.toString());

//         if (hqId) params.append('hq', hqId.toString());
//         if (factoryId) params.append('factory', factoryId.toString());
//         if (departmentId) params.append('department', departmentId.toString());
//         if (lineId) params.append('line', lineId.toString());
//         if (sublineId) params.append('subline', sublineId.toString());
//         if (stationId) params.append('station', stationId.toString());

//         const response = await fetch(`${API_BASE_URL}/chart/buffer-manpower-trend/?${params.toString()}`);
//         if (!response.ok) throw new Error('Failed to fetch data');
        
//         const apiData = await response.json();

//         // --- CORRECT FY DATA MAPPING ---
//         // For Apr-Dec: look for data where year = fyStartYear
//         // For Jan-Mar: look for data where year = fyEndYear
//         const fullYearData = financialYearConfig.map((config) => {
//           const targetYear = config.fyPart === 'start' ? fyStartYear : fyEndYear;
          
//           const found = apiData.find(
//             (d: any) => d.month === config.id && d.year === targetYear
//           );
          
//           return {
//             month: config.name,
//             required: found ? found.buffer_manpower_required : 0,
//             available: found ? found.buffer_manpower_available : 0,
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
//   }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear, fyStartYear]);

//   const CustomLegend = () => (
//     <div className="w-full flex justify-center items-center gap-4 mt-2">
//       <div className="flex items-center gap-1">
//         <div className="w-3 h-3 bg-[#339CFF] rounded-full" />
//         <span className="text-sm text-gray-600">Required</span>
//       </div>
//       <div className="flex items-center gap-1">
//         <div className="w-3 h-3 bg-[#1a365d] rounded-full" />
//         <span className="text-sm text-gray-600">Available</span>
//       </div>
//     </div>
//   );

//   const labelFontSize = containerWidth < 500 ? 10 : 12;
//   const tickFontSize = containerWidth < 500 ? 10 : 12;

//   if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;
//   if (error) return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;

//   return (
//     <div id="buffer-chart-container" className="relative w-full h-[350px] bg-white rounded-lg shadow-lg p-4">
//       <h2 className="text-center text-lg font-semibold mb-2 text-gray-700">
//         Buffer Manpower Trend – FY {displayFY}
//       </h2>
//       <ResponsiveContainer width="100%" height="90%">
//         <AreaChart 
//           data={data} 
//           margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
//         >
//           <defs>
//             <linearGradient id="colorRequired" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#339CFF" stopOpacity={0.7}/>
//               <stop offset="95%" stopColor="#339CFF" stopOpacity={0.1}/>
//             </linearGradient>
//             <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#1a365d" stopOpacity={0.7}/>
//               <stop offset="95%" stopColor="#1a365d" stopOpacity={0.1}/>
//             </linearGradient>
//           </defs>
          
//           <Legend content={<CustomLegend />} verticalAlign="top" height={36} />

//           <XAxis 
//             dataKey="month" 
//             tick={{ fontSize: tickFontSize }} 
//             axisLine={false} 
//             tickLine={false}
//             interval={0} 
//             padding={{ left: 10, right: 10 }}
//           />
          
//           <YAxis hide domain={[0, 'dataMax + 5']} />
//           <Tooltip />
          
//           <Area type="monotone" dataKey="required" stroke="#339CFF" fill="url(#colorRequired)">
//             <LabelList dataKey="required" position="top" fontSize={labelFontSize} formatter={(v: number) => v > 0 ? v : ''} />
//           </Area>
//           <Area type="monotone" dataKey="available" stroke="#1a365d" fill="url(#colorAvailable)">
//             <LabelList dataKey="available" position="top" fontSize={labelFontSize} formatter={(v: number) => v > 0 ? v : ''} />
//           </Area>
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default BufferManpowerAvailability;


import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Legend,
} from 'recharts';

interface BufferProps {
  hqId: number | null;
  factoryId: number | null;
  departmentId: number | null;
  lineId: number | null;
  sublineId: number | null;
  stationId: number | null;
  selectedYear?: number; 
}

const API_BASE_URL = "http://127.0.0.1:8000";

// Financial Year Config
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

const BufferManpowerAvailability: React.FC<BufferProps> = ({ 
  hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear 
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(560);
  
  // Calculate FY Start Year
  const getFYStartYear = () => {
    if (selectedYear) return selectedYear;
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    return currentMonth <= 3 ? currentYear - 1 : currentYear;
  };

  const fyStartYear = getFYStartYear();
  const fyEndYear = fyStartYear + 1;
  const displayFY = `${fyStartYear}-${fyEndYear.toString().slice(-2)}`;

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('buffer-chart-container');
      if (container) setContainerWidth(container.clientWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
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

        const response = await fetch(`${API_BASE_URL}/chart/buffer-manpower-trend/?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const apiData = await response.json();

        // ✅ Map data using only month ID (backend handles year logic)
        const fullYearData = financialYearConfig.map((config) => {
          const found = apiData.find((d: any) => d.month === config.id);
          
          return {
            month: config.name,
            required: found ? found.buffer_manpower_required : 0,
            available: found ? found.buffer_manpower_available : 0,
          };
        });

        setData(fullYearData);

      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear, fyStartYear]);

  const CustomLegend = () => (
    <div className="w-full flex justify-center items-center gap-4 mt-2">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-[#339CFF] rounded-full" />
        <span className="text-sm text-gray-600">Required</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-[#1a365d] rounded-full" />
        <span className="text-sm text-gray-600">Available</span>
      </div>
    </div>
  );

  const labelFontSize = containerWidth < 500 ? 10 : 12;
  const tickFontSize = containerWidth < 500 ? 10 : 12;

  if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;

  return (
    <div id="buffer-chart-container" className="relative w-full h-[350px] bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-center text-lg font-semibold mb-2 text-gray-700">
        Buffer Manpower Trend – FY {displayFY}
      </h2>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart 
          data={data} 
          margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorRequired" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#339CFF" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="#339CFF" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1a365d" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="#1a365d" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <Legend content={<CustomLegend />} verticalAlign="top" height={36} />

          <XAxis 
            dataKey="month" 
            tick={{ fontSize: tickFontSize }} 
            axisLine={false} 
            tickLine={false}
            interval={0} 
            padding={{ left: 10, right: 10 }}
          />
          
          <YAxis hide domain={[0, 'dataMax + 5']} />
          <Tooltip />
          
          <Area type="monotone" dataKey="required" stroke="#339CFF" fill="url(#colorRequired)">
            <LabelList dataKey="required" position="top" fontSize={labelFontSize} formatter={(v: number) => v > 0 ? v : ''} />
          </Area>
          <Area type="monotone" dataKey="available" stroke="#1a365d" fill="url(#colorAvailable)">
            <LabelList dataKey="available" position="top" fontSize={labelFontSize} formatter={(v: number) => v > 0 ? v : ''} />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BufferManpowerAvailability;