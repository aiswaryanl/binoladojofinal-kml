

// import React from 'react';
// import type { EmployeeInfo } from '../types/evaluation';
// import { User, Calendar, Award } from 'lucide-react';

// interface EmployeeInfoSectionProps {
//   employeeInfo: EmployeeInfo;
//   onUpdate: (field: keyof EmployeeInfo, value: string | number) => void;
// }
// const formatDate = (isoDate: string): string => {
//   if (!isoDate) return '';
//   // Assuming input is "2025-08-03"
//   const [year, month, day] = isoDate.split('-');
//   return `${day}-${month}-${year}`;           // → 03-08-2025
//   // Alternative: return `${day}/${month}/${year}`; // → 03/08/2025
// };
// const EmployeeInfoSection: React.FC<EmployeeInfoSectionProps> = ({
//   employeeInfo,
//   onUpdate,
// }) => {
//   return (
//     <div className="bg-white border-2 border-black shadow-lg">
//       {/* First Row */}
//       <div className="grid grid-cols-2 border-b-2 border-black">
//         <div className="border-r-2 border-black p-4 bg-gray-50">
//           <div className="flex items-center space-x-2 mb-2">
//             <User className="w-4 h-4 text-gray-600" />
//             <label className="block text-sm font-bold text-black">
//               Employee Name :
//             </label>
//           </div>
//           <input
//             type="text"
//             value={employeeInfo.name}
//             onChange={(e) => onUpdate('name', e.target.value)}
//             className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//             placeholder="Enter employee name"
//           />
//         </div>
//         <div className="border-r-2 border-black p-4 bg-gray-50">
//           <div className="flex items-center space-x-2 mb-2">
//             <User className="w-4 h-4 text-gray-600" />
//             <label className="block text-sm font-bold text-black">
//               Employee Code :
//             </label>
//           </div>
//           <input
//             type="text"
//             value={employeeInfo.code}
//             onChange={(e) => onUpdate('code', e.target.value)}
//             className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//             placeholder="Enter employee code"
//           />
//         </div>
//         {/* <div className="p-4 bg-gray-50">
//           <div className="flex items-center space-x-2 mb-2">
//             <User className="w-4 h-4 text-gray-600" />
//             <label className="block text-sm font-bold text-black">
//               Designation :
//             </label>
//           </div>
//           <input
//             type="text"
//             value={employeeInfo.designation}
//             onChange={(e) => onUpdate('designation', e.target.value)}
//             className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//             placeholder="Enter designation"
//           />
//         </div> */}
//       </div>

//       {/* Second Row */}
//       <div className="grid grid-cols-3 border-b-2 border-black">
//         <div className="border-r-2 border-black p-4 bg-white">
//           <div className="flex items-center space-x-2 mb-2">
//             <User className="w-4 h-4 text-gray-600" />
//             <label className="block text-sm font-bold text-black">
//               Department :
//             </label>
//           </div>
//           <input
//             type="text"
//             value={employeeInfo.department}
//             onChange={(e) => onUpdate('department', e.target.value)}
//             className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//             placeholder="Enter department"
//           />
//         </div>
//      <div className="border-r-2 border-black p-4 bg-white">
//   <div className="flex items-center space-x-2 mb-2">
//     <label className="block text-sm font-bold text-black">
//       Date of joining :
//     </label>
//   </div>
//   <div className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-800 font-medium">
//     {employeeInfo.dateOfJoining
//       ? formatDate(employeeInfo.dateOfJoining)
//       : 'Not specified'}
//   </div>
// </div>
//         <div className="p-4 bg-white">
//           <div className="flex items-center space-x-2 mb-2">
//             <Calendar className="w-4 h-4 text-gray-600" />
//             <label className="block text-sm font-bold text-black">
//               Evaluation Date:
//             </label>
//           </div>
//           <input
//             type="date"
//             value={employeeInfo.evaluationdate}
//             onChange={(e) => onUpdate('evaluationdate', e.target.value)}
//             className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//           />
//         </div>
//       </div>

//       {/* Third Row */}
//       <div className="grid grid-cols-2 border-b-2 border-black">
//   {/* First column - Max Marks */}
//   <div className="border-r-2 border-black p-4 bg-gray-50">
//     <div className="flex items-center space-x-2 mb-2">
//       <Award className="w-4 h-4 text-gray-600" />
//       <label className="block text-sm font-bold text-black">
//         Max. Marks : 15 nos.
//       </label>
//     </div>
//     <input
//       type="number"
//       value={employeeInfo.maxMarks}
//       onChange={(e) => onUpdate('maxMarks', parseInt(e.target.value) || 15)}
//       className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//       placeholder="15"
//     />
//   </div>
  
//   {/* Second column - Obtained Marks */}
//   {/* <div className="border-r-2 border-black p-4 bg-gray-50">
//     <div className="flex items-center space-x-2 mb-2">
//       <Award className="w-4 h-4 text-gray-600" />
//       <label className="block text-sm font-bold text-black">
//         Obtained Marks :
//       </label>
//     </div>
//     <input
//       type="number"
//       value={employeeInfo.obtainedMarks}
//       onChange={(e) => onUpdate('obtainedMarks', parseInt(e.target.value) || 0)}
//       className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//       placeholder="Enter obtained marks"
//     />
//   </div> */}
  
//   {/* Third column - Trainer Name */}
//   <div className="p-4 bg-white">
//     <div className="flex items-center space-x-2 mb-2">
//       <Award className="w-4 h-4 text-gray-600" />
//       <label className="block text-sm font-bold text-black">
//         Trainer Name :
//       </label>
//     </div>
//     <input
//       type="text"
//       value={employeeInfo.trainerName}
//       onChange={(e) => onUpdate('trainerName', e.target.value)}
//       className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//       placeholder="Enter trainer name"
//     />
//   </div>
// </div>

//       {/* Fourth Row */}
     
//     </div>
//   );
// };

// export default EmployeeInfoSection;/



import React from 'react';
import type { EmployeeInfo } from '../types/evaluation';
import { User, Calendar, Award, MapPin, Layers } from 'lucide-react';

interface EmployeeInfoSectionProps {
  employeeInfo: EmployeeInfo;
  onUpdate: (field: keyof EmployeeInfo, value: string | number) => void;
}

const formatDate = (isoDate: string): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
};

const EmployeeInfoSection: React.FC<EmployeeInfoSectionProps> = ({
  employeeInfo,
  onUpdate,
}) => {
  return (
    <div className="bg-white border-2 border-black shadow-lg">
      {/* First Row */}
      <div className="grid grid-cols-2 border-b-2 border-black">
        <div className="border-r-2 border-black p-4 bg-gray-50">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-bold text-black">
              Employee Name :
            </label>
          </div>
          <input
            type="text"
            value={employeeInfo.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Enter employee name"
          />
        </div>
        <div className="border-r-2 border-black p-4 bg-gray-50">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-bold text-black">
              Employee Code :
            </label>
          </div>
          <input
            type="text"
            value={employeeInfo.code}
            onChange={(e) => onUpdate('code', e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Enter employee code"
          />
        </div>
      </div>

      {/* Second Row - Department, Line, Station */}
      <div className="grid grid-cols-3 border-b-2 border-black">
        <div className="border-r-2 border-black p-4 bg-white">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-bold text-black">
              Department :
            </label>
          </div>
          <input
            type="text"
            value={employeeInfo.department}
            onChange={(e) => onUpdate('department', e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Enter department"
          />
        </div>
        <div className="border-r-2 border-black p-4 bg-white">
          <div className="flex items-center space-x-2 mb-2">
            <Layers className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-bold text-black">
              Line :
            </label>
          </div>
          <input
            type="text"
            value={employeeInfo.line}
            onChange={(e) => onUpdate('line', e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Enter line"
          />
        </div>
        <div className="p-4 bg-white">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-bold text-black">
              Station :
            </label>
          </div>
          <input
            type="text"
            value={employeeInfo.station}
            onChange={(e) => onUpdate('station', e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Enter station"
          />
        </div>
      </div>

      {/* Third Row - Date of Joining, Evaluation Date */}
      <div className="grid grid-cols-2 border-b-2 border-black">
        <div className="border-r-2 border-black p-4 bg-white">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-bold text-black">
              Date of Joining :
            </label>
          </div>
          <div className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-800 font-medium">
            {employeeInfo.dateOfJoining
              ? formatDate(employeeInfo.dateOfJoining)
              : 'Not specified'}
          </div>
        </div>
        <div className="p-4 bg-white">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-bold text-black">
              Evaluation Date :
            </label>
          </div>
          <input
            type="date"
            value={employeeInfo.evaluationdate}
            onChange={(e) => onUpdate('evaluationdate', e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
      </div>

      {/* Fourth Row - Max Marks, Trainer Name */}
      <div className="grid grid-cols-2 border-b-2 border-black">
        <div className="border-r-2 border-black p-4 bg-gray-50">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-bold text-black">
              Max. Marks : 15 nos.
            </label>
          </div>
          <input
            type="number"
            value={employeeInfo.maxMarks}
            onChange={(e) => onUpdate('maxMarks', parseInt(e.target.value) || 15)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="15"
          />
        </div>
        <div className="p-4 bg-white">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-bold text-black">
              Trainer Name :
            </label>
          </div>
          <input
            type="text"
            value={employeeInfo.trainerName}
            onChange={(e) => onUpdate('trainerName', e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Enter trainer name"
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeInfoSection;