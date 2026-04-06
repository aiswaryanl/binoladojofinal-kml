
// OJTForm.tsx
// OJTForm.tsx
import React, { useState, useEffect } from 'react';
import type { AssessmentMode, TrainingTopic, FormData, QuantityEvaluation } from '../../constants/types';
import OJTHeader from '../../molecules/OJTHeader/OJTHeader';
import TraineeInfoForm from '../../molecules/TraineeInfoForm/TraineeInfoForm';
import QualityAssessmentForm from '../../molecules/QualityAssessmentForm/QualityAssessmentForm';
import QuantityAssessmentForm from '../../molecules/QuantityAssessmentForm/QuantityAssessmentForm';
import QualityAssessmentCriteria from '../../molecules/QualityAssessmentCriteria/QualityAssessmentCriteria';
import ProductionMarkingScheme from '../../molecules/ProductionMarkingScheme/ProductionMarkingScheme';
import JudgmentCriteria from '../../molecules/JudgmentCriteria/JudgmentCriteria';
import SignaturesSection from '../../molecules/SignaturesSection/SignaturesSection';
import { useLocation } from 'react-router-dom';
import { ojtApi } from '../../hooks/ServiceApis';
import toast from 'react-hot-toast';

interface Station {
  station_id: number;
  station_name: string;
  department_id: number;
}

const OJTForm: React.FC = () => {
  const location = useLocation();
  const locationState = location.state || {};

  // NAVIGATION STATE
  const currentEmpId = locationState.employeeId;
  const currentLevelId = locationState.levelId;
  const currentDeptId = locationState.departmentId;
  const initialStationId = locationState.stationId || null;

  // LOCAL STATE
  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode>('quality');
  const [assessmentModeLoaded, setAssessmentModeLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);

  const [selectedStationId, setSelectedStationId] = useState<number | null>(initialStationId);

  const [qualityTopics, setQualityTopics] = useState<TrainingTopic[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [dayIdMapping, setDayIdMapping] = useState<Record<string, number>>({});

  const [scoreRanges, setScoreRanges] = useState<{ min_score: number; max_score: number } | null>(null);
  const [criteria, setCriteria] = useState<number[]>([]);
  const [quantityCriteria, setQuantityCriteria] = useState<any>(null);
  const [quantityScoreRange, setQuantityScoreRange] = useState<any[] | null>(null);

  const [existingOjtId, setExistingOjtId] = useState<number | null>(null);
  const [existingQuantityId, setExistingQuantityId] = useState<number | null>(null);
  const [lastFilledDayIndex, setLastFilledDayIndex] = useState<number>(-1);
  const [quantityEvaluations, setQuantityEvaluations] = useState<QuantityEvaluation[]>([]);
  const [status, setStatus] = useState<string>('Pending');

  const [formData, setFormData] = useState<FormData>({
    traineeInfo: {
      name: locationState.employeeName || '',
      id: locationState.employeeId || '',
      empNo: locationState.employeeId || '',
      stationName: locationState.stationName || '',
      stationId: initialStationId,
      lineName: locationState.lineName || '',
      processName: locationState.sublineName || '',
      revisionDate: new Date().toISOString().split('T')[0],
      doi: new Date().toISOString().split('T')[0],
      trainerName: '',
      trainerLine: locationState.lineName || '',
    },
    dailyScores: {},
    signatures: { preparedBy: '', approvedBy: '', engineerJudge: '' },
  });

  // FETCH ASSESSMENT MODE
  const fetchAssessmentMode = async () => {
    try {
      const data = await ojtApi.getAssessmentMode();
      setAssessmentMode(data.mode);
      setAssessmentModeLoaded(true);
    } catch (error) {
      console.error('Error fetching mode:', error);
      setAssessmentModeLoaded(true);
    }
  };

  // FETCH ALL STATIONS
  const fetchStations = async () => {
    try {
      const data = await ojtApi.getStations();
      setStations(data);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  // FILTER STATIONS BY DEPARTMENT
  useEffect(() => {
    if (currentDeptId && stations.length > 0) {
      const filtered = stations.filter(s => s.department_id === currentDeptId);
      setFilteredStations(filtered);

      if (initialStationId && !filtered.find(s => s.station_id === initialStationId)) {
        setSelectedStationId(null);
        setFormData(prev => ({
          ...prev,
          traineeInfo: { ...prev.traineeInfo, stationId: null, stationName: '' },
        }));
      }
    }
  }, [currentDeptId, stations, initialStationId]);

  // FETCH LEVEL DATA (topics, days, criteria)
  const fetchLevelData = async () => {
    if (!currentDeptId || !currentLevelId) return;
    try {
      const [topicsRes, daysRes, scoreRes, critRes, qtyScoreRes, qtyCritRes] = await Promise.all([
        ojtApi.getTopics(currentDeptId, currentLevelId),
        ojtApi.getDays(currentDeptId, currentLevelId),
        ojtApi.getScoreRanges(currentDeptId, currentLevelId),
        ojtApi.getPassingCriteria(currentDeptId, currentLevelId),
        ojtApi.getQuantityScoreRanges(currentDeptId, currentLevelId),
        ojtApi.getQuantityPassingCriteria(currentDeptId, currentLevelId),
      ]);

      // Topics
      setQualityTopics(topicsRes.map((t: any) => ({
        id: t.id || t.topic_id,
        description: t.topic || t.topic_name,
        category: t.category || 'Technical Knowledge',
      })));

      // Days
      const mapping: Record<string, number> = {};
      const dayNames = daysRes.map((d: any) => {
        const name = d.name || `Day-${d.id}`;
        mapping[name] = d.id;
        return name;
      });
      setDays(dayNames);
      setDayIdMapping(mapping);

      // Criteria
      if (scoreRes?.length > 0) {
        // If there are multiple ranges, prefer the one with the HIGHEST max_score.
        // This ensures if you have a "0-1" and "0-10", it picks "0-10".
        const bestRange = scoreRes.sort((a: any, b: any) => b.max_score - a.max_score)[0];

        console.log("Selected Score Range:", bestRange); // Debugging

        setScoreRanges({
          min_score: Number(bestRange.min_score),
          max_score: Number(bestRange.max_score)
        });
      }
      if (critRes?.length > 0) {
        const sorted = critRes.sort((a: any, b: any) => a.day - b.day);
        setCriteria(sorted.map((c: any) => c.percentage));
      }
      setQuantityScoreRange(qtyScoreRes.length > 0 ? qtyScoreRes : null);
      if (qtyCritRes.length > 0) {
        setQuantityCriteria({
          production_passing_percentage: parseFloat(qtyCritRes[0].production_passing_percentage),
          rejection_passing_percentage: parseFloat(qtyCritRes[0].rejection_passing_percentage),
        });
      }
    } catch (error) {
      console.error('Error fetching level data:', error);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    const init = async () => {
      if (!currentEmpId || !currentLevelId || !currentDeptId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      await Promise.all([fetchStations(), fetchLevelData(), fetchAssessmentMode()]);

      // Fetch Employee Details for D.O.J.
      try {
        const employeeData = await ojtApi.getEmployeeById(currentEmpId);
        if (employeeData && employeeData.date_of_joining) {
          setFormData(prev => ({
            ...prev,
            traineeInfo: {
              ...prev.traineeInfo,
              doi: employeeData.date_of_joining,
            }
          }));
        }
      } catch (err) {
        console.error("Could not fetch employee details:", err);
        // Fallback to today is already set in initial state
      }

      setIsLoading(false);
    };
    init();
  }, [currentEmpId, currentLevelId, currentDeptId]);

  // FETCH OJT DATA: ONLY WHEN STATION IS SELECTED
  useEffect(() => {
    const fetchOjtData = async () => {
      if (
        !assessmentModeLoaded ||
        !currentEmpId ||
        !currentLevelId ||
        selectedStationId === null
      ) {
        setExistingOjtId(null);
        setFormData(prev => ({ ...prev, dailyScores: {} }));
        setLastFilledDayIndex(-1);
        return;
      }

      console.log('[FETCH OJT] Params:', {
        empId: currentEmpId,
        stationId: selectedStationId,
        levelId: currentLevelId,
      });

      try {
        const records = await ojtApi.getQualityTraineeInfoList(
          currentEmpId,
          selectedStationId,
          currentLevelId,
          currentDeptId
        );

        console.log('[FETCH OJT] Records returned:', records);

        // ✅ FIX: Extract the first record
        const record = records[0] || null;

        if (!record) {
          setExistingOjtId(null);
          setFormData(prev => ({ ...prev, dailyScores: {} }));
          setLastFilledDayIndex(-1);
          return;
        }

        // Fill form with existing data
        setExistingOjtId(record.id);
        const prefilled: Record<number, Record<string, string>> = {};

        record.scores_data?.forEach((s: any) => {
          const dayName =
            Object.keys(dayIdMapping).find(k => dayIdMapping[k] === s.day) ||
            `Day-${s.day}`;
          if (!prefilled[s.topic]) prefilled[s.topic] = {};
          prefilled[s.topic][dayName] = String(s.score);
        });

        const lastIdx = Math.max(
          -1,
          ...Object.values(prefilled).flatMap(obj =>
            days.map((d, i) => (obj[d] ? i : -1))
          )
        );
        setLastFilledDayIndex(lastIdx);

        setFormData(prev => ({
          ...prev,
          traineeInfo: {
            ...prev.traineeInfo,
            name: record.trainee_name || prev.traineeInfo.name,
            id: record.trainer_id || prev.traineeInfo.id,
            empNo: record.emp_id || prev.traineeInfo.empNo,
            stationName: record.station_name,
            stationId: record.station,
            lineName: record.line || prev.traineeInfo.lineName,
            processName: record.subline || prev.traineeInfo.processName,
            revisionDate: record.revision_date,
            doi: record.doj,
            trainerName: record.trainer_name || '',
          },
          dailyScores: prefilled,
        }));
      } catch (error) {
        console.error('[FETCH OJT] Error:', error);
        toast.error('Failed to load OJT data');
        setExistingOjtId(null);
        setFormData(prev => ({ ...prev, dailyScores: {} }));
        setLastFilledDayIndex(-1);
      }
    };

    if (assessmentMode === 'quality') {
      fetchOjtData();
    }
  }, [
    assessmentMode,
    assessmentModeLoaded,
    currentEmpId,
    currentLevelId,
    currentDeptId,
    selectedStationId,
    dayIdMapping,
    days,
  ]);

  // HANDLE INPUT CHANGE
  const handleInputChange = (section: string, field: string, value: any) => {
    if (section === 'traineeInfo' && field === 'stationId') {
      const station = filteredStations.find(s => s.station_id === value);
      setSelectedStationId(value);
      setFormData(prev => ({
        ...prev,
        traineeInfo: {
          ...prev.traineeInfo,
          stationId: value,
          stationName: station?.station_name || '',
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section as keyof FormData], [field]: value },
      }));
    }
  };

  const handleScoreChange = (topicId: number | string, day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      dailyScores: {
        ...prev.dailyScores,
        [topicId]: { ...prev.dailyScores[topicId], [day]: value },
      },
    }));
  };

  // const preparePayload = () => {
  //   if (assessmentMode === 'quality') {
  //     const scoresArray = Object.entries(formData.dailyScores).flatMap(([topicId, dayScores]) =>
  //       Object.entries(dayScores).map(([dayName, score]) => {
  //         const dayId = dayIdMapping[dayName];
  //         return dayId ? { topic: Number(topicId), day: dayId, score: Number(score) } : null;
  //       }).filter(Boolean)
  //     );

  //     return {
  //       trainee_name: formData.traineeInfo.name,
  //       trainer_id: formData.traineeInfo.id,
  //       emp_id: formData.traineeInfo.empNo,
  //       line: formData.traineeInfo.lineName,
  //       subline: formData.traineeInfo.processName,
  //       station: formData.traineeInfo.stationId,
  //       process_name: formData.traineeInfo.processName,
  //       revision_date: formData.traineeInfo.revisionDate,
  //       doj: formData.traineeInfo.doi,
  //       trainer_name: formData.traineeInfo.trainerName,
  //       level: currentLevelId,
  //       scores: scoresArray,
  //     };
  //   }
  //   // Quantity payload (simplified)
  //   return {};
  // };

  const preparePayload = () => {
    if (assessmentMode === 'quality') {
      const scoresArray = Object.entries(formData.dailyScores).flatMap(([topicId, dayScores]) =>
        Object.entries(dayScores).map(([dayName, score]) => {
          const dayId = dayIdMapping[dayName];

          // Check for empty string explicitly, allowing 0
          if (score === '' || score === null || score === undefined) return null;
          if (!dayId) return null;

          return { topic: Number(topicId), day: dayId, score: Number(score) };
        }).filter((item) => item !== null) // Filter nulls only
      );
      return {
        trainee_name: formData.traineeInfo.name,
        trainer_id: formData.traineeInfo.id,
        emp_id: formData.traineeInfo.empNo,
        line: formData.traineeInfo.lineName,
        subline: formData.traineeInfo.processName,
        station: formData.traineeInfo.stationId,
        process_name: formData.traineeInfo.processName,
        revision_date: formData.traineeInfo.revisionDate,
        doj: formData.traineeInfo.doi,
        trainer_name: formData.traineeInfo.trainerName,
        level: currentLevelId,
        scores: scoresArray,
      };
    }
    // Quantity payload (simplified)
    return {};
  };

  const handleSubmit = async () => {
    if (!formData.traineeInfo.stationId) {
      toast.error('Please select a station');
      return;
    }
    try {
      const payload = preparePayload();
      const result = await ojtApi.postOJTData(payload);
      toast.success('Saved successfully!');
      alert("OJT Data saved successfully!");
      setExistingOjtId(result.id);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Save failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
        <OJTHeader />
        <div className="p-8">
          <TraineeInfoForm
            formData={formData}
            handleInputChange={handleInputChange}
            stations={filteredStations}
            selectedStationId={selectedStationId}
          />
          {assessmentMode === 'quality' ? (
            <QualityAssessmentForm
              currentTopics={qualityTopics}
              days={days}
              formData={formData}
              handleScoreChange={handleScoreChange}
              scoreRanges={scoreRanges}
              lastFilledDayIndex={lastFilledDayIndex}
            />
          ) : (
            <QuantityAssessmentForm
              formData={formData}
              scoreRange={quantityScoreRange}
              handleInputChange={handleInputChange}
              quantityEvaluations={quantityEvaluations}
              handleQuantityEvaluationChange={() => { }}
              addEvaluationDay={() => { }}
              removeEvaluationDay={() => { }}
            />
          )}
          <SignaturesSection
            formData={formData}
            handleInputChange={handleInputChange}
            handleSave={handleSubmit}
            handleDownloadPDF={() => { }}
          />
        </div>
      </div>
    </div>
  );
};

export default OJTForm;
