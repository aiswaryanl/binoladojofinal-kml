import { useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // Import this
import Sidebar from './Components/Sidebar';
import Scheduling from './Components/Scheduling';
import CalendarOverview from './Components/CalendarOverview';
import Notification from './Components/Notification';
import Training from './Components/Training';
import Curriculum from './Components/Curriculum';
import Status from './Components/Status';
import RecurrenceTracker from './Components/RecurrenceTracker';
import RescheduleList from './Components/RescheduleList';

// List of valid modules to ensure URL safety
const VALID_MODULES = [
  'scheduling',
  'calendar',
  'notification',
  'training',
  'reschedule-list',
  'curriculum',
  'recurrence',
  'status'
];

function App() {
  // 1. Use Search Params instead of local state for the active module
  const [searchParams, setSearchParams] = useSearchParams();

  // 2. Determine active module from URL, fallback to 'scheduling'
  const moduleParam = searchParams.get('module');
  const activeModule = VALID_MODULES.includes(moduleParam || '') ? moduleParam! : 'scheduling';

  // 3. Keep IDs in sync with URL
  const selectedCategoryId = searchParams.get('category') || null;
  const selectedTopicId = searchParams.get('topic') || null;
  const selectedSessionId = searchParams.get('session') || null;

  // 4. Create wrapper functions to update the URL
  const handleModuleChange = (moduleName: string) => {
    // When switching modules, we might want to keep or clear other params.
    // Usually switching modules implies a context switch, so clearing is safer unless we specific logic.
    // For now, let's keep it simple: overwrite module, clear others? 
    // Or just merge? The existing code just `setSearchParams({ module: moduleName })` which CLEARS others.
    // So let's stick to that for module switching.
    setSearchParams({ module: moduleName });
  };

  const setSelectedCategoryId = (id: number | string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (id) newParams.set('category', String(id));
    else newParams.delete('category');
    setSearchParams(newParams);
  };

  const setSelectedTopicId = (id: number | string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (id) newParams.set('topic', String(id));
    else newParams.delete('topic');
    setSearchParams(newParams);
  };

  const setSelectedSessionId = (id: number | string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (id) newParams.set('session', String(id));
    else newParams.delete('session');
    setSearchParams(newParams);
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'scheduling':
        return <Scheduling />;
      case 'calendar':
        return <CalendarOverview />;
      case 'notification':
        return <Notification />;
      case 'training':
        return (
          <Training
            // Pass the URL updater function
            setActiveModule={handleModuleChange}
            setSelectedCategoryId={setSelectedCategoryId}
            setSelectedTopicId={setSelectedTopicId}
          />
        );
      case 'reschedule-list':
        return <RescheduleList />;
      case 'curriculum':
        return (
          <Curriculum
            selectedCategoryId={selectedCategoryId}
            selectedTopicId={selectedTopicId}
            setSelectedCategoryId={setSelectedCategoryId}
            setSelectedTopicId={setSelectedTopicId}
          />
        );
      case 'recurrence':
        return <RecurrenceTracker />;
      case 'status':
        return <Status />;

      default:
        return <Scheduling />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Pass activeModule (string) and the handler function */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={handleModuleChange}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderActiveModule()}
      </main>
    </div>
  );
}

export default App;