import React from 'react';
import { User, Save, Download } from 'lucide-react';
import type { FormData } from '../../constants/types';

interface SignaturesSectionProps {
  formData: FormData;
  handleInputChange: (section: string, field: string, value: string) => void;
  handleSave: () => void; // ✅ Add this prop
  handleDownloadPDF?: () => void; // ✅ Optional for PDF
}

const SignaturesSection: React.FC<SignaturesSectionProps> = ({
  formData,
  handleInputChange,
  handleSave,
  handleDownloadPDF
}) => {
  return (
    <div className="space-y-10">
      {/* Signatures & Approval */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Signatures & Approval</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Prepared By</label>
            <input
              type="text"
              value={formData.signatures.preparedBy}
              onChange={(e) => handleInputChange('signatures', 'preparedBy', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
              placeholder="Enter preparer name"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Approved By</label>
            <input
              type="text"
              value={formData.signatures.approvedBy}
              onChange={(e) => handleInputChange('signatures', 'approvedBy', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
              placeholder="Enter approver name"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Save className="w-5 h-5" />
          Save Assessment
        </button>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default SignaturesSection;
