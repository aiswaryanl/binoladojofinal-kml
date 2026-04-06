import React, { useState, useEffect } from 'react';
import { FiActivity, FiServer, FiCpu, FiClock } from 'react-icons/fi';

// Import your two pages as components
import BioUserDashboard from './biometric'; // Adjust path as needed
import BiometricDevicesPage from './BiometricDevice/BiometricDevicesPage'; // Adjust path as needed
import AttendanceHistoryPage from './HistoryPage';// <--- Import the new History Page

const BiometricSystemPage: React.FC = () => {
  // State to switch tabs
  // const [activeTab, setActiveTab] = useState<'dashboard' | 'devices'>('dashboard');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'devices'| 'history'>('dashboard');


    // --- AUTHENTICATION & ROLE CHECK ---
    // We get the user object from LocalStorage (saved during Login)
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        try {
            const authStr = localStorage.getItem('auth'); // Assuming you save 'user' object here on login
            // console.log('authStr', authStr);
            if (authStr) {
                const authData = JSON.parse(authStr);
                // Extract user object from the auth data structure
                const user = authData.user; 
                
                if (user && user.role) {
                    const role = user.role;
                    console.log("Current User Role:", role); // Debugging

                    // Strict Case-Sensitive Check
                    // if (role === 'Developer' || role === 'admin') {
                    if (role === 'Developer') {
                        setIsAuthorized(true);
                    } else {
                        setIsAuthorized(false);
                    }
                }
            } else {
                console.warn("No auth data found in localStorage");
                setIsAuthorized(false);
            }
        } catch (e) {
            console.error("Auth check failed", e);
            setIsAuthorized(false);
        }
    }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo / Title */}
            <div className="flex items-center gap-3">
              {/* <div className="bg-blue-600 p-2 rounded-lg text-white">
                <FiCpu size={24} />
              </div> */}
              <div>
                {/* <h1 className="text-xl font-bold text-gray-800">Biometric Control</h1> */}
                {/* <p className="text-xs text-gray-500">eTimeTrack Lite Integration</p> */}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2">
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${activeTab === 'dashboard' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <FiActivity />
                Attendance Dashboard
              </button>

              {/* TAB 2: History (NEW) */}
              <button
                onClick={() => setActiveTab('history')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${activeTab === 'history' 
                    ? 'bg-purple-50 text-blue-700 border border-purple-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <FiClock />
                <span>Operator History</span>
              </button>

              {/* TAB 3: Device Manager */}
              <button
                onClick={() => setActiveTab('devices')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${activeTab === 'devices' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <FiServer />
                Device Manager
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="max-w-8xl mx-auto">

        {/* Render Tab 1: Live Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
              <BioUserDashboard
                isAuthorized={isAuthorized} // Pass Permission
              />
          </div>
        )}

        {/* Render Tab 2: History Page (NEW) */}
        {activeTab === 'history' && (
            <div className="animate-in fade-in duration-300">
                <AttendanceHistoryPage />
            </div>
        )}
        {/* Render Tab 3: Device Manager */}
        {activeTab === 'devices' && (
            <div className="animate-in fade-in duration-300">
                <BiometricDevicesPage 
                  isAuthorized={isAuthorized}
                />
            </div>
        )}

      </div>

    </div>
  );
};

export default BiometricSystemPage;