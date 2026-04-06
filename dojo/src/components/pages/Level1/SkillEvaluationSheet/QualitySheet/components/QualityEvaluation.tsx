
import React from 'react';
import { Plus, Trash2, Clock, Award, Target } from 'lucide-react';
import type { Module, Sequence } from '../types/evaluation';

interface QualityEvaluationProps {
  module: Module;
  onUpdateModule: (field: keyof Module, value: any) => void;
  onUpdateSequence: (sequenceId: string, field: keyof Sequence, value: any) => void;
  onAddSequence: () => void;
  onRemoveSequence: (sequenceId: string) => void;
  getThreshold: (methodTime: number) => number;
  currentEvaluationRound: 1 | 2 | 3; // round 1 = E1, 2 = E2, 3 = E3
  obtainedMarks: number; // latest saved marks after previous eval
  e1Total: number; // E1 column total
  e2Total: number; // E2 column total
  e3Total: number; // E3 column total
}

const QualityEvaluation: React.FC<QualityEvaluationProps> = ({
  module,
  onUpdateModule,
  onUpdateSequence,
  onAddSequence,
  onRemoveSequence,
  getThreshold,
  currentEvaluationRound,
  obtainedMarks,
  e1Total,
  e2Total,
  e3Total
}) => {
  // Enable logic for E1, E2, E3 based on current round and data state
  const enableE1 = currentEvaluationRound === 1;
  const enableE2 = currentEvaluationRound === 2;
  const enableE3 = currentEvaluationRound === 3;
  
  console.log('QualityEvaluation render:', { 
    currentEvaluationRound, 
    enableE1, 
    enableE2, 
    enableE3,
    e1Total,
    e2Total,
    e3Total
  });

  const handleCycleTimeInput = (sequenceId: string, value: number) => {
    onUpdateSequence(sequenceId, 'cycleTime', value);
    // Update cycle time for all sequences
    module.sequences.forEach(seq => {
      if (seq.id !== sequenceId) {
        onUpdateSequence(seq.id, 'cycleTime', value);
      }
    });
  };

  const handleActualTimeInput = (sequenceId: string, value: number) => {
    onUpdateSequence(sequenceId, 'actualTime', value);
    const sequence = module.sequences.find(seq => seq.id === sequenceId);
    if (!sequence) return;
    
    const cycleTime = sequence.cycleTime || 40;
    
    if (value > 0) {
      const marks = value <= cycleTime ? 2 : 0;
      
      // Only set marks in the current evaluation round if it's enabled
      // Don't overwrite existing marks from previous rounds
      if (currentEvaluationRound === 1 && enableE1) {
        onUpdateSequence(sequenceId, 'e1', marks);
      } else if (currentEvaluationRound === 2 && enableE2) {
        onUpdateSequence(sequenceId, 'e2', marks);
      } else if (currentEvaluationRound === 3 && enableE3) {
        onUpdateSequence(sequenceId, 'e3', marks);
      }
    } else {
      // Set to 0 for current evaluation round only if it's the active round
      if (currentEvaluationRound === 1 && enableE1) {
        onUpdateSequence(sequenceId, 'e1', 0);
      } else if (currentEvaluationRound === 2 && enableE2) {
        onUpdateSequence(sequenceId, 'e2', 0);
      } else if (currentEvaluationRound === 3 && enableE3) {
        onUpdateSequence(sequenceId, 'e3', 0);
      }
    }
  };

  const handleEvaluationInput = (
    sequenceId: string,
    field: 'e1' | 'e2' | 'e3',
    value: number
  ) => {
    const sequence = module.sequences.find(seq => seq.id === sequenceId);
    if (!sequence) return;
    
    // Skip auto-calculated fields for actual time
    if (sequence.description.toLowerCase().includes('actual time')) {
      return; // Auto-calculated for actual time
    }
    
    const maxAllowed = sequence.methodTime;
    const clampedValue = Math.min(Math.max(0, value), maxAllowed);

    onUpdateSequence(sequenceId, field, clampedValue);
  };

  const getEvaluationStatus = (round: 1 | 2 | 3, total: number) => {
    if (total >= 12) {
      return { status: 'PASS', color: 'text-green-600', bgColor: 'bg-green-50' };
    } else if (total > 0) {
      return { status: 'FAIL', color: 'text-red-600', bgColor: 'bg-red-50' };
    } else {
      return { status: 'PENDING', color: 'text-gray-500', bgColor: 'bg-gray-50' };
    }
  };

  // Helper function to determine if a column should show as disabled
  const isColumnDisabled = (column: 'e1' | 'e2' | 'e3') => {
    if (column === 'e1') return !enableE1;
    if (column === 'e2') return !enableE2;
    if (column === 'e3') return !enableE3;
    return false;
  };

  // Helper function to get the display text for actual time bonus
  const getActualTimeBonusText = (sequence: Sequence) => {
    if (sequence.actualTime > 0) {
      if (sequence.actualTime <= sequence.cycleTime) {
        return `✓  2 marks (Actual ≤ Cycle)`;
      } else {
        return `✗  (Actual > Cycle)`;
      }
    }
    return null;
  };

  // Get sequences for different sections
  const methodSequences = module.sequences.filter(seq => 
    !seq.description.toLowerCase().includes('cycle time') && 
    !seq.description.toLowerCase().includes('actual time') &&
    !seq.description.toLowerCase().includes('marks obtained')
  );

  const stepSequences = module.sequences.filter(seq => 
    seq.description.toLowerCase().includes('cycle time') || 
    seq.description.toLowerCase().includes('actual time')
  );

  const resultSequences = module.sequences.filter(seq => 
    seq.description.toLowerCase().includes('marks obtained')
  );

  return (
    <div className="bg-white border-2 border-black shadow-lg rounded-lg">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center space-x-3">
              <Target className="w-8 h-8" />
              <span>Quality Module</span>
            </h2>
            <p className="text-blue-100 mt-2 text-lg">{module.title}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200">Max Marks</div>
            <div className="text-4xl font-bold">{module.maxMarks}</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 p-4 text-center border-b-2 border-black">
        <p className="text-black font-bold text-lg">
          Min. 80% Marks are required to pass in every Training Module
        </p>
      </div>

      <div className="grid grid-cols-2 bg-blue-50 border-b-2 border-black">
        <div className="p-4 border-r-2 border-black">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-700 mb-2">Focus Point</div>
            <div className="text-xl font-bold text-blue-600">{module.focusPoint}</div>
          </div>
        </div>
        <div className="p-4">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-700 mb-2">Module</div>
            <div className="text-lg font-bold text-gray-800">{module.title}</div>
          </div>
        </div>
      </div>

      {/* Custom grid for 6 columns with adjusted widths - Method fixed, Sequence larger, M.T/E1/E2/E3 equal */}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 2fr 1fr 1fr 1fr 1fr' }} className="bg-blue-50 border-b-2 border-black">
        <div className="p-2 text-center font-bold text-gray-800 border-r-2 border-black">Method</div>
        <div className="p-2 text-center font-bold text-gray-800 border-r-2 border-black">Sequence</div>
        <div className="p-2 text-center font-bold text-gray-800 border-r-2 border-black">M.T.</div>
        <div className="p-2 text-center font-bold text-gray-800 border-r-2 border-black">
          <div>E1</div>
          {!enableE1 && <div className="text-xs text-red-500 font-normal">(Disabled)</div>}
          {enableE1 && <div className="text-xs text-green-500 font-normal">(Active)</div>}
        </div>
        <div className="p-2 text-center font-bold text-gray-800 border-r-2 border-black">
          <div>E2</div>
          {!enableE2 && <div className="text-xs text-red-500 font-normal">(Disabled)</div>}
          {enableE2 && <div className="text-xs text-green-500 font-normal">(Active)</div>}
        </div>
        <div className="p-2 text-center font-bold text-gray-800">
          <div>E3</div>
          {!enableE3 && <div className="text-xs text-red-500 font-normal">(Disabled)</div>}
          {enableE3 && <div className="text-xs text-green-500 font-normal">(Active)</div>}
        </div>
      </div>

      <div className="border-b border-gray-400">
        {/* Method Section */}
        {methodSequences.map((sequence, index) => {
          const isFirstMethodRow = index === 0;
          
          return (
            <div key={sequence.id} style={{ display: 'grid', gridTemplateColumns: '120px 2fr 1fr 1fr 1fr 1fr' }} className="border-b border-gray-300 hover:bg-blue-50 transition-colors">
              {/* Method Column - only show "Method" text in first row */}
              <div className="border-r-2 border-black p-2 bg-gray-100 flex items-center justify-center min-h-[50px]">
                {isFirstMethodRow && (
                  <div className="text-center font-bold text-gray-800">Method</div>
                )}
              </div>

              {/* Sequence Column - Fixed, non-editable */}
              <div className="border-r-2 border-black p-2 flex items-center min-h-[50px]">
                <div className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-sm font-medium text-gray-800">
                  {sequence.description}
                </div>
              </div>

              {/* M.T. Column */}
              <div className="border-r-2 border-black p-2 flex items-center justify-center min-h-[50px]">
                <div className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-center text-sm font-semibold text-gray-800">
                  {sequence.methodTime}
                </div>
              </div>

              {/* E1 Column */}
              <div className="border-r-2 border-black p-2 flex items-center justify-center min-h-[50px]">
                <input
                  type="number"
                  value={sequence.e1}
                  onChange={e => handleEvaluationInput(sequence.id, 'e1', Math.max(0, parseInt(e.target.value) || 0))}
                  className={`w-full p-2 border rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-bold text-sm ${
                    isColumnDisabled('e1') 
                      ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : 'border-gray-200 bg-white text-gray-900'
                  }`}
                  min={0}
                  max={sequence.methodTime}
                  disabled={isColumnDisabled('e1')}
                />
              </div>

              {/* E2 Column */}
              <div className="border-r-2 border-black p-2 flex items-center justify-center min-h-[50px]">
                <input
                  type="number"
                  value={sequence.e2}
                  onChange={e => handleEvaluationInput(sequence.id, 'e2', Math.max(0, parseInt(e.target.value) || 0))}
                  className={`w-full p-2 border rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-bold text-sm ${
                    isColumnDisabled('e2') 
                      ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : 'border-gray-200 bg-white text-gray-900'
                  }`}
                  min={0}
                  max={sequence.methodTime}
                  disabled={isColumnDisabled('e2')}
                />
              </div>

              {/* E3 Column */}
              <div className="p-2 flex items-center justify-center min-h-[50px]">
                <input
                  type="number"
                  value={sequence.e3}
                  onChange={e => handleEvaluationInput(sequence.id, 'e3', Math.max(0, parseInt(e.target.value) || 0))}
                  className={`w-full p-2 border rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-bold text-sm ${
                    isColumnDisabled('e3') 
                      ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : 'border-gray-200 bg-white text-gray-900'
                  }`}
                  min={0}
                  max={sequence.methodTime}
                  disabled={isColumnDisabled('e3')}
                />
              </div>
            </div>
          );
        })}

        {/* Steps Section */}
        {stepSequences.map((sequence, index) => {
          const isFirstStepRow = index === 0;
          const isCycleTime = sequence.description.toLowerCase().includes('cycle time');
          const isActualTime = sequence.description.toLowerCase().includes('actual time');
          const bonusText = isActualTime ? getActualTimeBonusText(sequence) : null;

          return (
            <div key={sequence.id} style={{ display: 'grid', gridTemplateColumns: '120px 2fr 1fr 1fr 1fr 1fr' }} className="border-b border-gray-300 hover:bg-blue-50 transition-colors">
              {/* Method Column - only show "Steps" text in first row */}
              <div className="border-r-2 border-black p-2 bg-gray-100 flex items-center justify-center min-h-[50px]">
                {isFirstStepRow && (
                  <div className="text-center font-bold text-gray-800">Steps</div>
                )}
              </div>

              {/* Sequence Column */}
              <div className="border-r-2 border-black p-2 min-h-[50px] flex items-center">
                {isCycleTime ? (
                  <div className="w-full">
                    <div className="p-1 bg-yellow-50 border border-yellow-200 rounded font-medium text-gray-800 mb-1 text-xs text-center">
                      Cycle Time (in secs.)
                    </div>
                    <input
                      type="number"
                      value={sequence.cycleTime}
                      onChange={e => handleCycleTimeInput(sequence.id, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-1 border border-yellow-300 bg-yellow-50 rounded focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 font-bold text-center text-sm"
                      placeholder="Enter cycle time"
                      min={0}
                    />
                  </div>
                ) : isActualTime ? (
                  <div className="w-full">
                    <div className="p-1 bg-green-50 border border-green-200 rounded font-medium text-gray-800 mb-1 text-xs text-center">
                      Actual Time (in secs.)
                    </div>
                    <input
                      type="number"
                      value={sequence.actualTime}
                      onChange={e => handleActualTimeInput(sequence.id, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-1 border border-green-300 bg-green-50 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-bold text-center text-sm"
                      placeholder="Enter actual time"
                      min={0}
                    />
                    {bonusText && (
                      <div className="mt-1 text-xs text-center">
                        <span className={`px-1 py-0.5 rounded font-bold text-xs ${
                          sequence.actualTime <= sequence.cycleTime
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bonusText}
                        </span>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* M.T. Column */}
              <div className="border-r-2 border-black p-2 flex items-center justify-center min-h-[50px]">
                {isCycleTime ? (
                  <div className="w-full p-2 bg-yellow-50 border border-yellow-200 rounded text-center text-sm font-semibold text-gray-800">-</div>
                ) : (
                  <div className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-center text-sm font-semibold text-gray-800">
                    {sequence.methodTime}
                  </div>
                )}
              </div>

              {/* E1 Column */}
              <div className="border-r-2 border-black p-2 flex items-center justify-center min-h-[50px]">
                {isCycleTime ? (
                  <div className="w-full p-2 bg-yellow-50 border border-yellow-200 rounded text-center text-sm font-semibold text-gray-800">-</div>
                ) : isActualTime ? (
                  <div className={`w-full p-2 border rounded text-center text-sm font-semibold ${
                    isColumnDisabled('e1') 
                      ? 'bg-gray-100 border-gray-300 text-gray-500' 
                      : 'bg-blue-50 border-blue-300 text-blue-800'
                  }`}>
                    {sequence.e1} <span className="text-xs">(Auto)</span>
                  </div>
                ) : null}
              </div>

              {/* E2 Column */}
              <div className="border-r-2 border-black p-2 flex items-center justify-center min-h-[50px]">
                {isCycleTime ? (
                  <div className="w-full p-2 bg-yellow-50 border border-yellow-200 rounded text-center text-sm font-semibold text-gray-800">-</div>
                ) : isActualTime ? (
                  <div className={`w-full p-2 border rounded text-center text-sm font-semibold ${
                    isColumnDisabled('e2') 
                      ? 'bg-gray-100 border-gray-300 text-gray-500' 
                      : 'bg-blue-50 border-blue-300 text-blue-800'
                  }`}>
                    {sequence.e2} <span className="text-xs">(Auto)</span>
                  </div>
                ) : null}
              </div>

              {/* E3 Column */}
              <div className="p-2 flex items-center justify-center min-h-[50px]">
                {isCycleTime ? (
                  <div className="w-full p-2 bg-yellow-50 border border-yellow-200 rounded text-center text-sm font-semibold text-gray-800">-</div>
                ) : isActualTime ? (
                  <div className={`w-full p-2 border rounded text-center text-sm font-semibold ${
                    isColumnDisabled('e3') 
                      ? 'bg-gray-100 border-gray-300 text-gray-500' 
                      : 'bg-blue-50 border-blue-300 text-blue-800'
                  }`}>
                    {sequence.e3} <span className="text-xs">(Auto)</span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {/* Result Section */}
        {resultSequences.length > 0 ? (
          resultSequences.map((sequence, index) => {
            const isFirstResultRow = index === 0;
            
            return (
              <div key={sequence.id} style={{ display: 'grid', gridTemplateColumns: '120px 2fr 1fr 1fr 1fr 1fr' }} className="border-b border-gray-300 hover:bg-blue-50 transition-colors">
                {/* Method Column - only show "Result" text in first row */}
                <div className="border-r-2 border-black p-2 bg-gray-100 flex items-center justify-center min-h-[50px]">
                  {isFirstResultRow && (
                    <div className="text-center font-bold text-gray-800">Result</div>
                  )}
                </div>

                {/* Sequence Column */}
                <div className="border-r-2 border-black p-2 flex items-center min-h-[50px]">
                  <div className="w-full p-2 bg-green-50 border border-green-200 rounded text-sm font-semibold text-gray-800 text-center">
                    Marks Obtained
                  </div>
                </div>

                {/* M.T. Column */}
                <div className="border-r-2 border-black p-2 flex items-center justify-center min-h-[50px]">
                  <div className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-center text-sm font-semibold text-gray-800">
                    {sequence.methodTime}
                  </div>
                </div>

                {/* E1 Column */}
                <div className="border-r-2 border-black p-2 flex items-center justify-center min-h-[50px]">
                  <div className={`w-full p-2 border rounded text-center text-sm font-bold ${
                    isColumnDisabled('e1') 
                      ? 'bg-gray-100 border-gray-300 text-gray-500' 
                      : 'bg-green-100 border-green-300 text-green-800'
                  }`}>
                    {e1Total}
                  </div>
                </div>

                {/* E2 Column */}
                <div className="border-r-2 border-black p-2 flex items-center justify-center min-h-[50px]">
                  <div className={`w-full p-2 border rounded text-center text-sm font-bold ${
                    isColumnDisabled('e2') 
                      ? 'bg-gray-100 border-gray-300 text-gray-500' 
                      : 'bg-green-100 border-green-300 text-green-800'
                  }`}>
                    {e2Total}
                  </div>
                </div>

                {/* E3 Column */}
                <div className="p-2 flex items-center justify-center min-h-[50px]">
                  <div className={`w-full p-2 border rounded text-center text-sm font-bold ${
                    isColumnDisabled('e3') 
                      ? 'bg-gray-100 border-gray-300 text-gray-500' 
                      : 'bg-green-100 border-green-300 text-green-800'
                  }`}>
                    {e3Total}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Default Marks Obtained row if no result sequences exist
          <div style={{ display: 'grid', gridTemplateColumns: '120px 2fr 1fr 1fr 1fr 1fr' }} className="border-b border-gray-300 hover:bg-blue-50 transition-colors">
            <div className="border-r-2 border-black p-2 bg-gray-100 flex items-center justify-center min-h-[50px]">
              <div className="text-center font-bold text-gray-800">Result</div>
            </div>

            <div className="border-r-2 border-black p-2 flex items-center min-h-[50px]">
              <div className="w-full p-2 bg-green-50 border border-green-200 rounded text-sm font-semibold text-gray-800 text-center">
                Marks Obtained
              </div>
            </div>

            <div className="border-r-2 border-black p-2 flex items-center justify-center min-h-[50px]">
              <div className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-center text-sm font-semibold text-gray-800">
                15
              </div>
            </div>

            <div className="border-r-2 border-black p-2 flex items-center justify-center min-h-[50px]">
              <div className={`w-full p-2 border rounded text-center text-sm font-bold ${
                isColumnDisabled('e1') 
                  ? 'bg-gray-100 border-gray-300 text-gray-500' 
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}>
                {e1Total}
              </div>
            </div>

            <div className="border-r-2 border-black p-2 flex items-center justify-center min-h-[50px]">
              <div className={`w-full p-2 border rounded text-center text-sm font-bold ${
                isColumnDisabled('e2') 
                  ? 'bg-gray-100 border-gray-300 text-gray-500' 
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}>
                {e2Total}
              </div>
            </div>

            <div className="p-2 flex items-center justify-center min-h-[50px]">
              <div className={`w-full p-2 border rounded text-center text-sm font-bold ${
                isColumnDisabled('e3') 
                  ? 'bg-gray-100 border-gray-300 text-gray-500' 
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}>
                {e3Total}
              </div>
            </div>
          </div>
        )}

        {/* Notes section */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div>
              <label className="font-semibold text-gray-700 block mb-2">Remarks:</label>
              <textarea
                value={module.remarks}
                onChange={e => onUpdateModule('remarks', e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                rows={4}
                placeholder="Enter remarks..."
              />
            </div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-center space-y-2">
              <div className="text-sm font-bold text-blue-800">
                M.T. : Maximum Time, E1, E2 & E3 : Evaluation 1, Evaluation 2 & Evaluation 3
              </div>
              <div className="text-sm text-blue-700">
                In case a trainee fails in the assessment, he shall be allowed a max. of three attempts in total to clear the assessment
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityEvaluation;