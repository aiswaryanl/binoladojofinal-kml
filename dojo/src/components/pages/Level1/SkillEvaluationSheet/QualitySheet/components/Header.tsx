import React from 'react';
import { Shield } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="bg-white border-2 border-black shadow-lg">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div className="text-black">
            <div className="text-xl font-bold tracking-wide">KRISHNA</div>
            <div className="text-lg font-semibold text-gray-700">PENSTONE</div>
          </div>
        </div>
        
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-800 tracking-wide">
            DOJO Quality Evaluation
          </h1>
          <p className="text-lg text-green-600 font-semibold mt-2">
            Noise & Vibration Testing
          </p>
        </div>
        
        <div className="w-20"></div>
      </div>
    </div>
  );
};

export default Header;