
import React from 'react';
import { Calendar, Bell, BookOpen, Users, BarChart3, Clock, RefreshCw, UserX } from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const menuItems = [
    { id: 'scheduling', name: 'Scheduling', icon: Clock },
    { id: 'calendar', name: 'Calendar Overview', icon: Calendar },
    { id: 'notification', name: 'Notification', icon: Bell },
    { id: 'training', name: 'Training', icon: Users },
    { id: 'reschedule-list', name: 'Reschedule List', icon: UserX },
    { id: 'curriculum', name: 'Curriculum', icon: BookOpen },
    { id: 'recurrence', name: 'Recurrence Tracker', icon: RefreshCw },
    { id: 'status', name: 'Status', icon: BarChart3 },
  ];

  return (
    <div className="sticky top-0 h-screen w-72 bg-white shadow-xl border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-8 border-b border-gray-200 flex-shrink-0 bg-gradient-to-br from-purple-50 to-pink-50">
        <h1 
          className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          Training Module
        </h1>
        <p className="text-sm text-gray-600 mt-2 font-medium">Organize your content</p>
      </div>
      
      {/* Navigation */}
      <nav className="p-5 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-200 font-semibold text-base group ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 transform scale-[1.02]'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
              }`}
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              <div className={`p-2 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-white/20' 
                  : 'bg-gray-100 group-hover:bg-purple-100'
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-purple-600'}`} />
              </div>
              <span className="flex-1 text-left">{item.name}</span>
            </button>
          );
        })}
      </nav>
      
    </div>
  );
};

export default Sidebar;