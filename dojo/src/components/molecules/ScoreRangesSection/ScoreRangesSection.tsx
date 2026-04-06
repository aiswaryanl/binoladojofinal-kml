// // ScoreRangesSection.tsx
// import React, { useState, useEffect } from "react";
// import { ojtApi } from "../../hooks/ServiceApis";
// import { Target, Plus, Trash2, Edit, Save, X } from "lucide-react";

// interface ScoreRange {
//   id?: number;
//   score_range_id?: number;
//   min_score?: number;
//   max_score?: number;
//   department?: number;
//   level?: number;
// }

// interface TransformedScoreRange {
//   id: number;
//   min_score: number;
//   max_score: number;
//   department: number;
//   level: number;
// }

// interface ScoreRangesSectionProps {
//   selectedDepartment: number | null;
//   selectedLevel: number | null;
// }

// const ScoreRangesSection: React.FC<ScoreRangesSectionProps> = ({
//   selectedDepartment,
//   selectedLevel,
// }) => {
//   const [scoreRanges, setScoreRanges] = useState<TransformedScoreRange[]>([]);
//   const [minScore, setMinScore] = useState<string>("");
//   const [maxScore, setMaxScore] = useState<string>("");
//   const [editingScoreRangeId, setEditingScoreRangeId] = useState<number | null>(null);
//   const [isEditing, setIsEditing] = useState<boolean>(false);

//   // Fetch score ranges when department & level selected
//   useEffect(() => {
//     if (selectedDepartment && selectedLevel) {
//       fetchScoreRanges();
//     } else {
//       setScoreRanges([]);
//     }
//     resetForm();
//   }, [selectedDepartment, selectedLevel]);

//   const fetchScoreRanges = async () => {
//     try {
//       const data: ScoreRange[] = await ojtApi.getScoreRanges(
//         selectedDepartment!,
//         selectedLevel!
//       );

//       console.log(data)



//       const transformedScoreRanges: TransformedScoreRange[] = data.map((range: any) => ({
//         id: range.id || range.score_range_id,
//         min_score: range.min_score,
//         max_score: range.max_score,
//         department: range.department || selectedDepartment!,
//         level: range.level || selectedLevel!,
//       }));

//       setScoreRanges(transformedScoreRanges);
//     } catch (error) {
//       console.error("Error fetching score ranges:", error);
//     }
//   };

//   const resetForm = () => {
//     setMinScore("");
//     setMaxScore("");
//     setEditingScoreRangeId(null);
//     setIsEditing(false);
//   };

//   const validateInputs = (
//     min: string,
//     max: string
//   ): { isValid: boolean; minScore: number; maxScore: number } => {
//     if (!min.trim() || !max.trim() || !selectedDepartment || !selectedLevel) {
//       alert("Please select a department, level, and enter both min and max scores");
//       return { isValid: false, minScore: 0, maxScore: 0 };
//     }

//     const minScoreValue = parseInt(min);
//     const maxScoreValue = parseInt(max);

//     if (isNaN(minScoreValue) || isNaN(maxScoreValue) || minScoreValue < 0 || maxScoreValue <= 0) {
//       alert("Please enter valid numbers for min and max scores");
//       return { isValid: false, minScore: 0, maxScore: 0 };
//     }

//     if (minScoreValue >= maxScoreValue) {
//       alert("Max score must be greater than min score");
//       return { isValid: false, minScore: 0, maxScore: 0 };
//     }

//     return { isValid: true, minScore: minScoreValue, maxScore: maxScoreValue };
//   };

//   const handleSaveScoreRange = async () => {
//     const { isValid, minScore: minScoreValue, maxScore: maxScoreValue } =
//       validateInputs(minScore, maxScore);
//     if (!isValid) return;

//     try {
//       if (isEditing && editingScoreRangeId) {
//         // Update existing score range
//         await ojtApi.updateScoreRange(editingScoreRangeId, {
//           min_score: minScoreValue,
//           max_score: maxScoreValue,
//           department: selectedDepartment!,
//           level: selectedLevel!,
//         });

//         setScoreRanges(
//           scoreRanges.map((range) =>
//             range.id === editingScoreRangeId
//               ? { ...range, min_score: minScoreValue, max_score: maxScoreValue }
//               : range
//           )
//         );
//       } else {
//         // Create new score range
//         const created = await ojtApi.createScoreRange({
//           min_score: minScoreValue,
//           max_score: maxScoreValue,
//           department: selectedDepartment!,
//           level: selectedLevel!,
//         });

//         const transformedScoreRange: TransformedScoreRange = {
//           id: created.id || created.score_range_id,
//           min_score: created.min_score,
//           max_score: created.max_score,
//           department: created.department || selectedDepartment!,
//           level: created.level || selectedLevel!,
//         };

//         setScoreRanges([...scoreRanges, transformedScoreRange]);
//       }

//       resetForm();
//     } catch (error) {
//       console.error("Error saving score range:", error);
//     }
//   };

//   const handleEditScoreRange = (range: TransformedScoreRange) => {
//     setMinScore(range.min_score.toString());
//     setMaxScore(range.max_score.toString());
//     setEditingScoreRangeId(range.id);
//     setIsEditing(true);
//   };

//   const handleCancelEdit = () => {
//     resetForm();
//   };

//   const handleDeleteScoreRange = async (rangeId: number) => {
//     if (!window.confirm("Are you sure you want to delete this score range?")) {
//       return;
//     }

//     try {
//       await ojtApi.deleteScoreRange(rangeId);
//       setScoreRanges(scoreRanges.filter((range) => range.id !== rangeId));

//       // If we were editing the deleted item, reset the form
//       if (editingScoreRangeId === rangeId) {
//         resetForm();
//       }
//     } catch (error) {
//       console.error("Error deleting score range:", error);
//     }
//   };

//   return (
//     <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
//       <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//         <Target className="w-5 h-5 text-orange-600" />
//         Score Ranges
//       </h3>
//       <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
//         <h4 className="font-semibold text-gray-700 mb-3">
//           {isEditing ? "Edit Range" : "Add New Range"}
//           {isEditing && <span className="ml-2 text-sm text-orange-600">(Editing)</span>}
//         </h4>
//         <div className="grid grid-cols-2 gap-2 mb-4">
//           <input
//             type="number"
//             placeholder="Min score"
//             value={minScore}
//             onChange={(e) => setMinScore(e.target.value)}
//             min="0"
//             className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//           />
//           <input
//             type="number"
//             placeholder="Max score"
//             value={maxScore}
//             onChange={(e) => setMaxScore(e.target.value)}
//             min={minScore ? parseInt(minScore) + 1 : 1}
//             className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//           />
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={handleSaveScoreRange}
//             className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex-1 justify-center"
//           >
//             {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
//             {isEditing ? "Save Changes" : "Add Range"}
//           </button>
//           {isEditing && (
//             <button
//               onClick={handleCancelEdit}
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           )}
//         </div>
//       </div>
//       <div className="space-y-3 max-h-80 overflow-y-auto">
//         {!selectedDepartment || !selectedLevel ? (
//           <div className="p-3 text-center text-gray-500 text-sm">
//             Please select a department and level to view score ranges
//           </div>
//         ) : scoreRanges.length === 0 ? (
//           <div className="p-3 text-center text-gray-500 text-sm">
//             No score ranges found for the selected department and level
//           </div>
//         ) : (
//           scoreRanges.map((range) => (
//             <div
//               key={range.id}
//               className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
//             >
//               <div className="flex items-center gap-2">
//                 <span className="font-medium text-gray-800 text-sm">
//                   {range.min_score != null && range.max_score != null
//                     ? `${range.min_score} - ${range.max_score}`
//                     : "Invalid range"}
//                 </span>
//               </div>
//               <div className="flex gap-1">
//                 <button
//                   onClick={() => handleEditScoreRange(range)}
//                   className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
//                   title="Edit"
//                   disabled={isEditing && editingScoreRangeId === range.id}
//                 >
//                   <Edit className="w-3 h-3" />
//                 </button>
//                 <button
//                   onClick={() => handleDeleteScoreRange(range.id)}
//                   className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
//                   title="Delete"
//                 >
//                   <Trash2 className="w-3 h-3" />
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default ScoreRangesSection;




// ScoreRangesSection.tsx
import React, { useState, useEffect } from "react";
import { ojtApi } from "../../hooks/ServiceApis";
import { Target, Plus, Trash2, Edit, Save, X, Check, Hash, ToggleLeft } from "lucide-react";

interface ScoreRange {
  id?: number;
  score_range_id?: number;
  min_score?: number;
  max_score?: number;
  department?: number;
  level?: number;
}

interface TransformedScoreRange {
  id: number;
  min_score: number;
  max_score: number;
  department: number;
  level: number;
}

interface ScoreRangesSectionProps {
  selectedDepartment: number | null;
  selectedLevel: number | null;
}

type InputMode = 'numeric' | 'binary'; // 'numeric' = ranges, 'binary' = tick/cross
type BinaryValue = 1 | 0; // 1 = Tick, 0 = Cross

const ScoreRangesSection: React.FC<ScoreRangesSectionProps> = ({
  selectedDepartment,
  selectedLevel,
}) => {
  const [scoreRanges, setScoreRanges] = useState<TransformedScoreRange[]>([]);
  
  // Form States
  const [inputMode, setInputMode] = useState<InputMode>('numeric');
  const [minScore, setMinScore] = useState<string>("");
  const [maxScore, setMaxScore] = useState<string>("");
  const [binarySelection, setBinarySelection] = useState<BinaryValue>(1); // Default to Tick
  
  const [editingScoreRangeId, setEditingScoreRangeId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Fetch score ranges when department & level selected
  useEffect(() => {
    if (selectedDepartment && selectedLevel) {
      fetchScoreRanges();
    } else {
      setScoreRanges([]);
    }
    resetForm();
  }, [selectedDepartment, selectedLevel]);

  const fetchScoreRanges = async () => {
    try {
      const data: ScoreRange[] = await ojtApi.getScoreRanges(
        selectedDepartment!,
        selectedLevel!
      );

      const transformedScoreRanges: TransformedScoreRange[] = data.map((range: any) => ({
        id: range.id || range.score_range_id,
        min_score: range.min_score,
        max_score: range.max_score,
        department: range.department || selectedDepartment!,
        level: range.level || selectedLevel!,
      }));

      setScoreRanges(transformedScoreRanges);
    } catch (error) {
      console.error("Error fetching score ranges:", error);
    }
  };

  const resetForm = () => {
    setMinScore("");
    setMaxScore("");
    setInputMode('numeric'); 
    setBinarySelection(1);
    setEditingScoreRangeId(null);
    setIsEditing(false);
  };

  const handleSaveScoreRange = async () => {
    let minScoreValue: number;
    let maxScoreValue: number;

    // 1. Determine values based on Input Mode
    if (inputMode === 'binary') {
      // If Binary, min and max are identical (1 for tick, 0 for cross)
      minScoreValue = binarySelection;
      maxScoreValue = binarySelection;
    } else {
      // If Numeric, perform standard validation
      if (!minScore.trim() || !maxScore.trim() || !selectedDepartment || !selectedLevel) {
        alert("Please select a department, level, and enter both min and max scores");
        return;
      }
      minScoreValue = parseInt(minScore);
      maxScoreValue = parseInt(maxScore);

      if (isNaN(minScoreValue) || isNaN(maxScoreValue) || minScoreValue < 0 || maxScoreValue <= 0) {
        alert("Please enter valid numbers for min and max scores");
        return;
      }

      if (minScoreValue >= maxScoreValue) {
        alert("Max score must be greater than min score for numeric ranges");
        return;
      }
    }

    try {
      if (isEditing && editingScoreRangeId) {
        // Update
        await ojtApi.updateScoreRange(editingScoreRangeId, {
          min_score: minScoreValue,
          max_score: maxScoreValue,
          department: selectedDepartment!,
          level: selectedLevel!,
        });

        setScoreRanges(
          scoreRanges.map((range) =>
            range.id === editingScoreRangeId
              ? { ...range, min_score: minScoreValue, max_score: maxScoreValue }
              : range
          )
        );
      } else {
        // Create
        const created = await ojtApi.createScoreRange({
          min_score: minScoreValue,
          max_score: maxScoreValue,
          department: selectedDepartment!,
          level: selectedLevel!,
        });

        const transformedScoreRange: TransformedScoreRange = {
          id: created.id || created.score_range_id,
          min_score: created.min_score,
          max_score: created.max_score,
          department: created.department || selectedDepartment!,
          level: created.level || selectedLevel!,
        };

        setScoreRanges([...scoreRanges, transformedScoreRange]);
      }

      resetForm();
    } catch (error) {
      console.error("Error saving score range:", error);
    }
  };

  const handleEditScoreRange = (range: TransformedScoreRange) => {
    setEditingScoreRangeId(range.id);
    setIsEditing(true);

    // Check if this is a Binary (Tick/Cross) or Numeric Range
    if (range.min_score === 1 && range.max_score === 1) {
      setInputMode('binary');
      setBinarySelection(1);
    } else if (range.min_score === 0 && range.max_score === 0) {
      setInputMode('binary');
      setBinarySelection(0);
    } else {
      setInputMode('numeric');
      setMinScore(range.min_score.toString());
      setMaxScore(range.max_score.toString());
    }
  };

  const handleDeleteScoreRange = async (rangeId: number) => {
    if (!window.confirm("Are you sure you want to delete this score range?")) return;

    try {
      await ojtApi.deleteScoreRange(rangeId);
      setScoreRanges(scoreRanges.filter((range) => range.id !== rangeId));
      if (editingScoreRangeId === rangeId) resetForm();
    } catch (error) {
      console.error("Error deleting score range:", error);
    }
  };

  // Helper to render the display row
  const renderRangeDisplay = (min: number, max: number) => {
    if (min === 1 && max === 1) {
      return (
        <div className="flex items-center gap-2 text-green-600 font-semibold">
          <Check className="w-5 h-5" />
          <span>Passed (Tick)</span>
        </div>
      );
    }
    if (min === 0 && max === 0) {
      return (
        <div className="flex items-center gap-2 text-red-600 font-semibold">
          <X className="w-5 h-5" />
          <span>Failed (Cross)</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-gray-800">
        <Hash className="w-4 h-4 text-gray-500" />
        <span>{min} - {max}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-orange-600" />
        Evaluation Criteria
      </h3>
      
      <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-700">
            {isEditing ? "Edit Criteria" : "Add Criteria"}
          </h4>
          
          {/* Toggle Button for Mode */}
          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setInputMode('numeric')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                inputMode === 'numeric' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Numeric
            </button>
            <button
              onClick={() => setInputMode('binary')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                inputMode === 'binary' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Tick/Cross
            </button>
          </div>
        </div>

        {/* INPUT SECTION */}
        <div className="mb-4">
          {inputMode === 'numeric' ? (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min score"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                min="0"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                placeholder="Max score"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                min={minScore ? parseInt(minScore) + 1 : 1}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setBinarySelection(1)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${
                  binarySelection === 1 
                    ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' 
                    : 'bg-white border-gray-300 text-gray-500 hover:border-green-300'
                }`}
              >
                <Check className="w-5 h-5" />
                <span>Tick</span>
              </button>
              <button
                onClick={() => setBinarySelection(0)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${
                  binarySelection === 0 
                    ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' 
                    : 'bg-white border-gray-300 text-gray-500 hover:border-red-300'
                }`}
              >
                <X className="w-5 h-5" />
                <span>Cross</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSaveScoreRange}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex-1 justify-center"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isEditing ? "Save Changes" : "Add Criteria"}
          </button>
          {isEditing && (
            <button
              onClick={() => { resetForm(); }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* LIST SECTION */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {!selectedDepartment || !selectedLevel ? (
          <div className="p-3 text-center text-gray-500 text-sm">
            Select dept & level to view
          </div>
        ) : scoreRanges.length === 0 ? (
          <div className="p-3 text-center text-gray-500 text-sm">
            No criteria found
          </div>
        ) : (
          scoreRanges.map((range) => (
            <div
              key={range.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                {renderRangeDisplay(range.min_score, range.max_score)}
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditScoreRange(range)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  disabled={isEditing && editingScoreRangeId === range.id}
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteScoreRange(range.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScoreRangesSection;

