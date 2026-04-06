import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { Check, X, Plus, Save, User } from 'lucide-react';
import { Button } from '../../atoms/Buttons/Button';

import type { ActionBarProps, AddItemFormProps, CheckData, CheckItemRowProps, CheckSheetContainerProps, CheckSheetHeaderProps, CheckTableHeaderProps, CheckTableProps, HumanBodyCheckSheetProps, InfoItemProps, StatusToggleButtonProps, UserInfoCardProps } from '../../constants/types';
import { humanBodyCheckService } from '../../hooks/ServiceApis';

// New interfaces for dynamic questions
interface Question {
  id: number;
  question_text: string;
}

interface CheckItem {
  question_id?: number;
  description: string;
  status: 'pass' | 'fail' | '';
}

interface DynamicCheckData {
  [key: string]: CheckItem;
}

// Atomic Components

const CheckSheetHeader: React.FC<CheckSheetHeaderProps> = ({ title }) => (
  <header className="bg-gray-100 border-b-2 border-gray-800 p-4">
    <h1 className="text-xl font-bold text-center">{title}</h1>
  </header>
);

const UserInfoCard: React.FC<UserInfoCardProps> = ({ userDetails, tempId }) => {
  const { firstName, email, phoneNumber } = userDetails;

  return (
    <section className="bg-gray-50 p-4 border border-black">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <User className="w-5 h-5 mr-2 text-blue-600" />
        User Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <InfoItem label="Name" value={`${firstName} `} />
          <InfoItem
            label="Temp ID"
            value={tempId}
            valueClassName="font-mono bg-gray-100 px-2 py-1 rounded"
          />
        </div>

        <div className="space-y-2">
          <InfoItem label="Email" value={email} valueClassName="break-all" />
          <InfoItem label="Phone" value={phoneNumber} />
        </div>
      </div>
    </section>
  );
};

const InfoItem: React.FC<InfoItemProps> = ({ label, value, valueClassName = '' }) => (
  <div className="flex items-start">
    <span className="text-gray-600 font-medium w-24">{label}:</span>
    <span className={`text-gray-800 ${valueClassName}`}>{value}</span>
  </div>
);

const CheckTableHeader: React.FC<CheckTableHeaderProps> = () => (
  <header className="grid grid-cols-12 border-b-2 border-gray-800">
    <div className="col-span-1 p-3 border-r-2 border-gray-800 font-semibold text-center">Sr No</div>
    <div className="col-span-9 p-3 border-r-2 border-gray-800 font-semibold text-center">Description</div>
    <div className="col-span-2 p-3 font-semibold text-center">✓ / ✗</div>
  </header>
);

const CheckItemRow: React.FC<CheckItemRowProps> = ({ id, item, onStatusChange }) => {
  const getStatusColor = (status: 'pass' | 'fail' | '') => {
    if (status === 'pass') return 'bg-green-100 border-green-300';
    if (status === 'fail') return 'bg-red-100 border-red-300';
    return 'bg-gray-50 border-gray-300';
  };

  const handleToggleStatus = () => {
    let nextStatus: 'pass' | 'fail' | '' = '';
    if (item.status === '') nextStatus = 'pass';
    else if (item.status === 'pass') nextStatus = 'fail';
    else nextStatus = '';
    onStatusChange(id, nextStatus);
  };

  return (
    <article className={`grid grid-cols-12 border-b border-gray-300 ${getStatusColor(item.status)}`}>
      <div className="col-span-1 p-3 border-r-2 border-gray-800 text-center font-medium">{id}</div>
      <div className="col-span-9 p-3 border-r-2 border-gray-800">
        <span className="text-sm">{item.description}</span>
      </div>
      <div className="col-span-2 p-3 flex justify-center items-center">
        <StatusToggleButton
          status={item.status}
          onClick={handleToggleStatus}
        />
      </div>
    </article>
  );
};

const StatusToggleButton: React.FC<StatusToggleButtonProps> = ({ status, onClick }) => {
  const getButtonClasses = () => {
    const baseClasses = 'p-3 rounded border-2 transition-colors w-16 h-12 flex items-center justify-center';

    if (status === 'pass') return `${baseClasses} bg-green-500 border-green-500 text-white`;
    if (status === 'fail') return `${baseClasses} bg-red-500 border-red-500 text-white`;
    return `${baseClasses} bg-white border-gray-300 hover:border-blue-500`;
  };

  return (
    <button onClick={onClick} className={getButtonClasses()}>
      {status === 'pass' && <Check className="w-5 h-5" />}
      {status === 'fail' && <X className="w-5 h-5" />}
      {status === '' && <span className="text-gray-400">-</span>}
    </button>
  );
};

const AddItemForm: React.FC<AddItemFormProps> = ({
  newItem,
  onNewItemChange,
  onAdd,
  onCancel
}) => (
  <form className="grid grid-cols-12 border-b border-gray-300 bg-blue-50" onSubmit={(e) => { e.preventDefault(); onAdd(); }}>
    <div className="col-span-1 p-3 border-r-2 border-gray-800 text-center">+</div>
    <div className="col-span-9 p-3 border-r-2 border-gray-800">
      <input
        type="text"
        value={newItem}
        onChange={(e) => onNewItemChange(e.target.value)}
        placeholder="Enter new check item..."
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onKeyPress={(e) => e.key === 'Enter' && onAdd()}
        autoFocus
        required
      />
    </div>
    <div className="col-span-2 p-3 flex justify-center gap-2">
      <Button
        onClick={onAdd}
        variant="primary"
        size="sm"
        className="bg-green-500 hover:bg-green-600 text-white"
        type="button"
      >
        Add
      </Button>
      <Button
        onClick={onCancel}
        variant="secondary"
        size="sm"
        className="bg-gray-500 hover:bg-gray-600 text-white"
        type="button"
      >
        Cancel
      </Button>
    </div>
  </form>
);

const CheckTable: React.FC<CheckTableProps & { readOnly?: boolean }> = ({
  checkData,
  onStatusChange,
  showAddForm,
  newItem,
  onNewItemChange,
  onAddItem,
  onCancelAdd,
  readOnly
}) => (
  <section className="check-table">
    <CheckTableHeader />

    {Object.entries(checkData).map(([id, item]) => (
      <CheckItemRow
        key={id}
        id={id}
        item={item}
        onStatusChange={readOnly ? () => { } : onStatusChange}
      />
    ))}

    {!readOnly && showAddForm && (
      <AddItemForm
        newItem={newItem}
        onNewItemChange={onNewItemChange}
        onAdd={onAddItem}
        onCancel={onCancelAdd}
      />
    )}
  </section>
);

const ActionBar: React.FC<ActionBarProps> = ({
  onAddNew,
  onSave,
  showAddForm,
  isExisting,
  loading
}) => (
  <footer className="mt-6 p-2 flex justify-end items-center">
    {isExisting ? (
      <div className="flex items-center gap-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
        <span className="font-semibold">Read Only Mode</span>
        <span className="text-xs">(Assessment Completed)</span>
      </div>
    ) : (
      <Button
        onClick={onSave}
        variant="primary"
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
        loading={loading}
        title="Save check data"
      >
        <Save className="w-4 h-4" />
        Save Data
      </Button>
    )}
  </footer>
);

const CheckSheetContainer: React.FC<CheckSheetContainerProps> = ({ children }) => (
  <div className="max-w-4xl mx-auto p-6 bg-white">
    <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
      {children}
    </div>
  </div>
);

// Custom hooks for better separation of concerns

const useCheckData = (tempId: string) => {
  const [checkData, setCheckData] = useState<DynamicCheckData>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isExisting, setIsExisting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchQuestionsAndData = async () => {
      setLoading(true);
      setError('');

      try {
        // Fetch questions first
        const questionsData = await humanBodyCheckService.fetchQuestions();
        setQuestions(questionsData);

        // Initialize checkData with questions
        const initialCheckData: DynamicCheckData = {};
        questionsData.forEach((question, index) => {
          const id = (index + 1).toString();
          initialCheckData[id] = {
            question_id: question.id,
            description: question.question_text,
            status: ''
          };
        });

        // Try to fetch existing data
        if (tempId) {
          const existingData = await humanBodyCheckService.fetchCheckDataByTempId(tempId);

          if (existingData && existingData.checkData) {
            setIsExisting(true);
            // Merge existing data with questions
            Object.keys(existingData.checkData).forEach(key => {
              if (initialCheckData[key]) {
                initialCheckData[key].status = existingData.checkData[key].status;
              } else {
                // Handle additional custom questions
                initialCheckData[key] = existingData.checkData[key];
              }
            });
          }
        }

        setCheckData(initialCheckData);

      } catch (err) {
        setError('Failed to fetch questions and check data');
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsAndData();
  }, [tempId]);

  const updateCheckStatus = (id: string, status: 'pass' | 'fail' | '') => {
    setCheckData(prev => ({
      ...prev,
      [id]: { ...prev[id], status }
    }));
  };

  const addNewCheck = (description: string) => {
    if (description.trim()) {
      const existingIds = Object.keys(checkData).map(id => parseInt(id));
      const newId = Math.max(...existingIds) + 1;
      setCheckData(prev => ({
        ...prev,
        [newId.toString()]: {
          description,
          status: '',
          // Custom questions don't have question_id
        }
      }));
    }
  };

  return {
    checkData,
    questions,
    isExisting,
    loading,
    error,
    updateCheckStatus,
    addNewCheck
  };
};

const useSaveCheckData = () => {
  const [saving, setSaving] = useState<boolean>(false);
  const navigate = useNavigate(); // Add this hook

  const saveCheckData = async (tempId: string, checkData: DynamicCheckData, isExisting: boolean, onNext?: () => void) => {
    // Simplified: Allow updates
    // if (isExisting) { ... } logic removed

    setSaving(true);

    try {
      // Format data according to the new structure
      const payload = {
        temp_id: tempId,
        checkData: checkData
      };

      await humanBodyCheckService.saveCheckData(payload);

      alert('Data saved successfully!');

      // Navigate to home after successful save
      setTimeout(() => {
        navigate('/PassedUsersTable');
      }, 1500); // Wait 1.5 seconds to show the success message

      // Still call onNext if provided (for backward compatibility)
      if (onNext) onNext();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  return { saveCheckData, saving };
};

// Main Component

const HumanBodyCheckSheet: React.FC<HumanBodyCheckSheetProps> = ({ tempId, userDetails, onNext }) => {
  const [newItem, setNewItem] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const {
    checkData,
    questions,
    isExisting,
    loading,
    error,
    updateCheckStatus,
    addNewCheck
  } = useCheckData(tempId);

  const { saveCheckData, saving } = useSaveCheckData();

  const handleAddNewItem = () => {
    addNewCheck(newItem);
    setNewItem('');
    setShowAddForm(false);
  };

  const handleSaveData = () => {
    saveCheckData(tempId, checkData, isExisting, onNext);
  };

  if (loading) {
    return (
      <CheckSheetContainer>
        <div className="p-8 text-center">
          <p>Loading questions and check data...</p>
        </div>
      </CheckSheetContainer>
    );
  }

  if (error) {
    return (
      <CheckSheetContainer>
        <div className="p-8 text-center text-red-600">
          <p>{error}</p>
        </div>
      </CheckSheetContainer>
    );
  }

  return (
    <CheckSheetContainer>
      <CheckSheetHeader title="Human Body Check Point (Level-0)" />

      <UserInfoCard userDetails={userDetails} tempId={tempId} />

      <CheckTable
        checkData={checkData}
        onStatusChange={updateCheckStatus}
        showAddForm={showAddForm}
        newItem={newItem}
        onNewItemChange={setNewItem}
        onAddItem={handleAddNewItem}
        onCancelAdd={() => setShowAddForm(false)}
        readOnly={isExisting}
      />

      <ActionBar
        onAddNew={isExisting ? undefined : () => setShowAddForm(true)}
        onSave={handleSaveData}
        showAddForm={showAddForm}
        isExisting={isExisting}
        loading={saving}
      />
    </CheckSheetContainer>
  );
};

export default HumanBodyCheckSheet;