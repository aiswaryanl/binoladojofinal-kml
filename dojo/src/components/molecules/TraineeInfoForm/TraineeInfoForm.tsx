

import React from 'react';
import { User } from 'lucide-react';
import type { FormData } from '../../constants/types';

interface TraineeInfoFormProps {
  formData: FormData;
  handleInputChange: (section: string, field: string, value: string) => void;
}

const TraineeInfoForm: React.FC<TraineeInfoFormProps> = ({
  formData,
  handleInputChange
}) => {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
          <User className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Trainee Information</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200/50">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Trainee Name</label>
          <input
            type="text"
            value={formData.traineeInfo.name}
            onChange={(e) => handleInputChange('traineeInfo', 'name', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
            placeholder="Enter trainee name"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Trainee ID</label>
          <input
            type="text"
            value={formData.traineeInfo.id}
            onChange={(e) => handleInputChange('traineeInfo', 'id', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
            placeholder="Enter trainee ID"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Employee No.</label>
          <input
            type="text"
            value={formData.traineeInfo.empNo}
            onChange={(e) => handleInputChange('traineeInfo', 'empNo', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
            placeholder="Enter employee number"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Station Name</label>
        <input
            type="text"
            value={formData.traineeInfo.stationName}
            onChange={(e) => handleInputChange('traineeInfo', 'empNo', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
            placeholder="Enter employee number"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Line Name</label>
          <input
            type="text"
            value={formData.traineeInfo.lineName}
            onChange={(e) => handleInputChange('traineeInfo', 'lineName', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
            placeholder="Enter line name"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Process Name</label>
          <input
            type="text"
            value={formData.traineeInfo.processName}
            onChange={(e) => handleInputChange('traineeInfo', 'processName', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
            placeholder="Enter process name"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Revision Date</label>
          <input
            type="date"
            value={formData.traineeInfo.revisionDate}
            onChange={(e) => handleInputChange('traineeInfo', 'revisionDate', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">D.O.J.</label>
          <input
            type="date"
            value={formData.traineeInfo.doi}
            onChange={(e) => handleInputChange('traineeInfo', 'doi', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Trainer Name</label>
          <input
            type="text"
            value={formData.traineeInfo.trainerName}
            onChange={(e) => handleInputChange('traineeInfo', 'trainerName', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
            placeholder="Enter trainer name"
          />
        </div>
      </div>
    </div>
  );
};

export default TraineeInfoForm;