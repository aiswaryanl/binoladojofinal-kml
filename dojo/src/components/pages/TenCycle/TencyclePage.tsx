import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

const API_BASE_URL = "http://192.168.2.51:8000";

interface Employee {
  emp_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  department: number;
  department_name: string;
  date_of_joining: string;
  email: string;
  phone: string;
}

interface Department {
  department_id: number;
  department_name: string;
  has_tencycle_config: boolean;
  stations: Array<{
    station_id: number;
    station_name: string;
    line_name: string;
    subline_name: string;
  }>;
}

interface Topic {
  id: number;
  slno: number;
  cycle_topics: string;
  level: number;
  department: number;
  station: number;
  is_active: boolean;
  subtopics?: SubTopic[];
}

interface SubTopic {
  id: number;
  topic: number;
  sub_topic: string;
  score_required: number;
  is_active: boolean;
}

interface Day {
  id: number;
  day_name: string;
  sequence_order: number;
  level: number;
  department: number;
  station: number;
  is_active: boolean;
}

interface OperatorPerformanceEvaluation {
  id: number;
  employee: number;
  date: string;
  shift: string;
  department: number;
  station: number;
  level: number;
  line: string;
  process_name: string;
  operation_no: string;
  date_of_retraining_completed: string;
  prepared_by: string;
  checked_by: string;
  approved_by: string;
  is_completed: boolean;
  final_percentage: number;
  final_status: string;
}

interface EvaluationSubTopicMarks {
  id: number;
  employee: number;
  subtopic: number;
  day: number;
  mark_1: number | null;
  mark_2: number | null;
  mark_3: number | null;
  mark_4: number | null;
  mark_5: number | null;
  mark_6: number | null;
  mark_7: number | null;
  mark_8: number | null;
  mark_9: number | null;
  mark_10: number | null;
  total_score: number;
  max_possible_score: number;
}

interface EvaluationData {
  employee_code: string;
  employee_details: OperatorPerformanceEvaluation | null;
  evaluations: EvaluationSubTopicMarks[];
  per_day_results: Array<{
    day: string;
    score: number;
    possible_score: number;
    percentage: number;
    status: string;
  }>;
  total_score: number;
  total_possible_score: number;
  final_percentage: number;
  final_status: string;
}

interface LocationState {
  employeeId?: string;
  employeeName?: string;
  levelId?: number;
  departmentId?: number;
  stationId?: number;
  lineName?: string;
  processName?: string;
  departmentName?: string;
  stationName?: string;
}

const TenCyclePage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<SubTopic[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(
    null
  );
  const [operatorEvaluation, setOperatorEvaluation] =
    useState<OperatorPerformanceEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(
    state?.levelId || null
  );
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    state?.departmentId || null
  );
  const [selectedStation, setSelectedStation] = useState<number | null>(
    state?.stationId || null
  );
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [evaluationScores, setEvaluationScores] = useState<{
    [key: string]: string;
  }>({});
  const [passingCriteria, setPassingCriteria] = useState<number>(60);
  const [isDaySubmitted, setIsDaySubmitted] = useState<boolean>(false);
  const [completedDays, setCompletedDays] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    line: state?.lineName || "",
    department: state?.departmentName || "",
    station: state?.stationName || "",
    process_name: "",
    shift: "",
    date: new Date().toISOString().split("T")[0],
    dateOfJoin: "",
    date_of_retraining_completed: "",
    prepared_by: "",
    checked_by: "",
    approved_by: "",
  });

  const fetchEmployee = useCallback(async (empId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/mastertable/by-employee-code/${empId}/`
      );
      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
        if (data.date_of_joining) {
          setFormData((prev) => ({
            ...prev,
            dateOfJoin: data.date_of_joining,
          }));
        }
        return data;
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
    return null;
  }, []);

  // Fetch departments for the selected level, if needed (optional)
  // const fetchDepartments = useCallback(async (levelId: number) => {
  //   try {
  //     // Note: Adjust this API if you have it in backend, else omit if not needed
  //     const response = await fetch(`${API_BASE_URL}/tencycle-passingcriteria/get_departments_by_level/?level_id=${levelId}`);
  //     if (response.ok) {
  //       const data = await response.json();
  //       setDepartments(data.departments || []);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching departments:", error);
  //   }
  // }, []);

  // Fetch TenCycle configuration (days, topics, subtopics, passing criteria)
  const fetchConfiguration = useCallback(
    async (levelId: number, departmentId: number, stationId: number) => {
      try {
        const params = new URLSearchParams({
          level_id: levelId.toString(),
          department_id: departmentId.toString(),
          station_id: stationId.toString(),
        });

        const response = await fetch(
          `${API_BASE_URL}/tencycle-configuration/complete-configuration/?${params.toString()}`
        );
        if (response.ok) {
          const configData = await response.json();

          setDays(configData.days || []);
          setTopics(configData.topics || []);
          setPassingCriteria(
            configData.passing_criteria?.passing_percentage ?? 60
          );

          const allSubtopics: SubTopic[] = [];
          configData.topics?.forEach((topic: Topic) => {
            if (topic.subtopics) {
              allSubtopics.push(...topic.subtopics);
            }
          });
          setSubtopics(allSubtopics);

          if (configData.days && configData.days.length > 0) {
            setSelectedDay(configData.days[0].day_name);
          }
        }
      } catch (error) {
        console.error("Error fetching configuration:", error);
        setDays([]);
        setTopics([]);
        setSubtopics([]);
        setPassingCriteria(60);
      }
    },
    []
  );

  // Fetch evaluation data and marks for the employee and selected config
  const fetchEvaluationData = useCallback(
    async (
      empId: string,
      levelId: number,
      departmentId: number,
      stationId: number
    ) => {
      try {
        const evalResponse = await fetch(
          `${API_BASE_URL}/operator-evaluations/by-employee-code/${empId}/?level_id=${levelId}&department_id=${departmentId}&station_id=${stationId}`
        );

        let operatorEval: OperatorPerformanceEvaluation | null = null;
        if (evalResponse.ok) {
          const evalData = await evalResponse.json();
          if (evalData.length > 0) {
            operatorEval = evalData[0];
            setOperatorEvaluation(operatorEval);

            setFormData((prev) => ({
              ...prev,
              line: state?.lineName ?? prev.line,
              department: state?.departmentName ?? prev.department,
              station: state?.stationName ?? prev.station,
              process_name: operatorEval?.process_name ?? prev.process_name,
              shift: operatorEval?.shift ?? prev.shift,
              date: operatorEval?.date ?? prev.date,
              date_of_retraining_completed:
                operatorEval?.date_of_retraining_completed ??
                prev.date_of_retraining_completed,
              prepared_by: operatorEval?.prepared_by ?? prev.prepared_by,
              checked_by: operatorEval?.checked_by ?? prev.checked_by,
              approved_by: operatorEval?.approved_by ?? prev.approved_by,
            }));
          }
        }

        // Fetch detailed evaluation marks
        const marksResponse = await fetch(
          `${API_BASE_URL}/evaluation-marks/by-employee-code/${empId}/`
        );

        if (marksResponse.ok) {
          const marksData = await marksResponse.json();

          setEvaluationData({
            employee_code: marksData.employee_code ?? empId,
            employee_details: operatorEval,
            evaluations: Array.isArray(marksData.evaluations)
              ? marksData.evaluations
              : [],
            per_day_results: Array.isArray(marksData.per_day)
              ? marksData.per_day
              : [],
            total_score: marksData.total_score ?? 0,
            total_possible_score: marksData.max_score ?? 0,
            final_percentage:
              marksData.final_percentage ??
              (marksData.total_score &&
                marksData.max_score &&
                marksData.max_score > 0
                ? (marksData.total_score / marksData.max_score) * 100
                : 0),
            final_status: marksData.final_status ?? "Not Evaluated",
          });

          return marksData;
        } else {
          // In case of no marks data, reset evaluation data accordingly
          setEvaluationData({
            employee_code: "",
            employee_details: null,
            evaluations: [],
            per_day_results: [],
            total_score: 0,
            total_possible_score: 0,
            final_percentage: 0,
            final_status: "Not Evaluated",
          });
        }
      } catch (error) {
        console.error("Error fetching evaluation data:", error);
        setEvaluationData(null);
        setOperatorEvaluation(null);
      }
      return null;
    },
    [state?.line]
  );

  // Fetch marks (subtopic scores)
  // const marksResponse = await fetch(
  //   `${API_BASE_URL}/evaluation-marks/by-employee-code/${empId}`
  // );
  // if (marksResponse.ok) {
  //   const marksData = await marksResponse.json();

  //   setEvaluationData({
  //     employee_code: marksData.employee_code ?? empId,
  //     employee_details: operatorEval,
  //     evaluations: Array.isArray(marksData.evaluations)
  //       ? marksData.evaluations
  //       : [],
  //     // or if backend returns the list directly, handle accordingly

  //     per_day_results: Array.isArray(marksData.per_day)
  //       ? marksData.per_day
  //       : [],
  //     total_score: marksData.total_score ?? 0,
  //     total_possible_score: marksData.max_score ?? 0,
  //     final_percentage: marksData.final_percentage ?? 0,
  //     final_status: marksData.final_status ?? "Not Evaluated",
  //   });

  //   return marksData;
  // }

  // Calculate completed days based on filled evaluations
  useEffect(() => {
    if (
      evaluationData &&
      evaluationData.evaluations &&
      days.length > 0 &&
      subtopics.length > 0
    ) {
      const completed = days
        .filter((day) => {
          const activeSubtopics = subtopics.filter((sub) => sub.is_active);
          return activeSubtopics.every((sub) => {
            const evalItem = evaluationData.evaluations.find(
              (e) => e.subtopic === sub.id && e.day === day.id
            );
            if (!evalItem) return false;
            for (let i = 1; i <= 10; i++) {
              const key = `mark_${i}` as keyof EvaluationSubTopicMarks;
              if (evalItem[key] === null || evalItem[key] === undefined)
                return false;
            }
            return true;
          });
        })
        .map((d) => d.day_name);
      setCompletedDays(completed);
    } else {
      setCompletedDays([]);
    }
  }, [evaluationData, days, subtopics]);

  // Load scores for the selected day
  useEffect(() => {
    if (
      evaluationData &&
      selectedDay &&
      days.length > 0 &&
      subtopics.length > 0
    ) {
      const scores: { [key: string]: string } = {};
      const dayObj = days.find((d) => d.day_name === selectedDay);
      if (dayObj) {
        subtopics.forEach((sub) => {
          const evalItem = evaluationData.evaluations.find(
            (e) => e.subtopic === sub.id && e.day === dayObj.id
          );
          if (evalItem) {
            for (let i = 1; i <= 10; i++) {
              const key = `mark_${i}` as keyof EvaluationSubTopicMarks;
              const score = evalItem[key];
              if (score !== null && score !== undefined) {
                scores[`${sub.id}-${i - 1}`] = score.toString();
              }
            }
          }
        });
      }
      setEvaluationScores(scores);
    }
  }, [evaluationData, selectedDay, days, subtopics]);

  useEffect(() => {
    if (
      !state?.employeeId ||
      !state?.levelId ||
      !state?.departmentId ||
      !state?.stationId
    ) {
      console.error(
        "Missing required parameters (employeeId, levelId, departmentId, stationId)"
      );
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await fetchEmployee(state.employeeId);
      await fetchConfiguration(
        state.levelId,
        state.departmentId,
        state.stationId
      );
      await fetchEvaluationData(
        state.employeeId,
        state.levelId,
        state.departmentId,
        state.stationId
      );
      setLoading(false);
    };

    loadData();
  }, [fetchEmployee, fetchConfiguration, fetchEvaluationData, state]);

  // Check if currently selected day is submitted/completed
  useEffect(() => {
    if (selectedDay && completedDays.includes(selectedDay)) {
      setIsDaySubmitted(true);
    } else {
      setIsDaySubmitted(false);
    }
  }, [selectedDay, completedDays]);

  // Day selection handler with sequential check
  const handleDayChange = (dayName: string) => {
    const dayObj = days.find((d) => d.day_name === dayName);
    if (!dayObj) return;

    const sortedDays = [...days].sort(
      (a, b) => a.sequence_order - b.sequence_order
    );
    const selectedIndex = sortedDays.findIndex((d) => d.day_name === dayName);

    if (selectedIndex === 0) {
      setSelectedDay(dayName);
      return;
    }

    let canSelect = true;
    for (let i = 0; i < selectedIndex; i++) {
      if (!completedDays.includes(sortedDays[i].day_name)) {
        canSelect = false;
        break;
      }
    }
    if (canSelect) {
      setSelectedDay(dayName);
    } else {
      alert(
        `Please complete ${sortedDays[selectedIndex - 1].day_name
        } evaluation first.`
      );
    }
  };

  // Score input change handler with validation
  const handleScoreChange = (
    subtopicId: number,
    cycleIndex: number,
    value: string
  ) => {
    const sub = subtopics.find((s) => s.id === subtopicId);
    if (!sub) return;

    if (value === "") {
      setEvaluationScores((prev) => ({
        ...prev,
        [`${subtopicId}-${cycleIndex}`]: "",
      }));
      return;
    }

    const num = parseInt(value);
    if (!isNaN(num) && num >= 0 && num <= sub.score_required) {
      setEvaluationScores((prev) => ({
        ...prev,
        [`${subtopicId}-${cycleIndex}`]: value,
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !state?.employeeId ||
      !selectedDay ||
      !selectedLevel ||
      !selectedDepartment ||
      !selectedStation
    ) {
      alert("Missing required data");
      return;
    }

    for (const sub of subtopics) {
      for (let i = 0; i < 10; i++) {
        if (!evaluationScores[`${sub.id}-${i}`]) {
          alert("Please fill in all scores before submitting");
          return;
        }
      }
    }

    setLoading(true);

    try {
      const dayObj = days.find((d) => d.day_name === selectedDay);
      if (!dayObj) {
        alert("Invalid day selection");
        setLoading(false);
        return;
      }

      // Prepare or update operator evaluation instance
      const evalPayload = {
        employee: employee?.emp_id,
        date: formData.date,
        shift: formData.shift,
        department: selectedDepartment,
        station: selectedStation,
        level: selectedLevel,
        line: formData.line,
        process_name: formData.process_name,
        operation_no: "",
        date_of_retraining_completed:
          formData.date_of_retraining_completed || null,
        prepared_by: formData.prepared_by,
        checked_by: formData.checked_by,
        approved_by: formData.approved_by,
        is_completed: false,
        final_status: "Not Evaluated",
      };

      let operatorEvalId = operatorEvaluation?.id;

      if (!operatorEvaluation) {
        const resp = await fetch(`${API_BASE_URL}/operator-evaluations/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(evalPayload),
        });

        if (resp.ok) {
          const newEval = await resp.json();
          operatorEvalId = newEval.id;
          setOperatorEvaluation(newEval);
        } else {
          throw new Error("Failed to create operator evaluation");
        }
      }

      const saveMarksPromises = subtopics.map(async (sub) => {
        const marks: { [key: string]: number | null } = {};
        for (let i = 0; i < 10; i++) {
          const key = `${sub.id}-${i}`;
          const val = evaluationScores[key];
          marks[`mark_${i + 1}`] =
            val !== undefined && val !== "" ? parseInt(val) : null;
        }

        const markPayload = {
          employee: operatorEvalId,
          subtopic: sub.id,
          day: dayObj.id,
          ...marks,
        };

        // Try update existing mark record or create new
        const existingMark = evaluationData?.evaluations.find(
          (e) => e.subtopic === sub.id && e.day === dayObj.id
        );

        if (existingMark) {
          const res = await fetch(
            `${API_BASE_URL}/evaluation-marks/${existingMark.id}/`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(markPayload),
            }
          );
          return res.json();
        } else {
          const res = await fetch(`${API_BASE_URL}/evaluation-marks/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(markPayload),
          });
          return res.json();
        }
      });

      await Promise.all(saveMarksPromises);

      alert(`${selectedDay} evaluation saved successfully!`);

      // Reload evaluation data
      await fetchEvaluationData(
        state.employeeId,
        selectedLevel,
        selectedDepartment,
        selectedStation
      );
    } catch (error) {
      console.error("Error saving evaluation:", error);
      alert("Error saving evaluation");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total score for each cycle (column)
  const calculateTotalForCycle = (cycleIndex: number) => {
    return subtopics.reduce((sum, sub) => {
      const val = evaluationScores[`${sub.id}-${cycleIndex}`];
      const num = val !== undefined && val !== "" ? parseInt(val) : 0;
      return sum + num;
    }, 0);
  };

  const isDaySelectable = (dayName: string) => {
    const sortedDays = [...days].sort(
      (a, b) => a.sequence_order - b.sequence_order
    );
    const dayIndex = sortedDays.findIndex((d) => d.day_name === dayName);
    if (dayIndex === 0) return true;
    for (let i = 0; i < dayIndex; i++) {
      if (!completedDays.includes(sortedDays[i].day_name)) return false;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-slate-700">
            Loading evaluation data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">
                  10 Cycle Evaluation Check Fields
                </h2>
                <p className="text-blue-100 font-medium">
                  Level Assessment Form
                </p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <label
                  htmlFor="date"
                  className="block text-sm font-semibold text-blue-100 mb-2"
                >
                  Evaluation Date
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="bg-white text-slate-800 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-300 focus:outline-none shadow-sm"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Employee Info */}
        {employee && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mb-8">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                Trainee Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Trainee Name
                  </label>
                  <div className="bg-slate-50 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200">
                    {(employee.first_name || "") +
                      (employee.last_name ? " " + employee.last_name : "")}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Trainee ID
                  </label>
                  <div className="bg-slate-50 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200">
                    {employee.emp_id}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    D.O.J.
                  </label>
                  <input
                    type="date"
                    name="dateOfJoin"
                    value={formData.dateOfJoin}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Line Name
                  </label>
                  <input
                    type="text"
                    name="line"
                    value={formData.line}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Station Name
                  </label>
                  <input
                    type="text"
                    name="station"
                    value={formData.station}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Date of Retraining
                  </label>
                  <input
                    type="date"
                    name="date_of_retraining_completed"
                    value={formData.date_of_retraining_completed}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  />
                </div> */}
                {/* <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Shift
                  </label>
                  <input
                    type="text"
                    name="shift"
                    value={formData.shift}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter shift"
                  />
                </div> */}
              </div>
            </div>
          </div>
        )}

        {/* Day Selection & Evaluation Form */}
        {topics.length > 0 && days.length > 0 && subtopics.length > 0 && (
          <>
            {/* Day Selection */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mb-8">
              <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border-b border-slate-200">
                <div className="flex items-center justify-center space-x-6">
                  <label className="text-lg font-semibold text-slate-800">
                    Evaluation Day
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => handleDayChange(e.target.value)}
                    className="bg-white border-2 border-indigo-200 rounded-xl px-6 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none shadow-sm"
                  >
                    <option value="">Select Day...</option>
                    {days
                      .sort((a, b) => a.sequence_order - b.sequence_order)
                      .map((day) => {
                        const isSelectable = isDaySelectable(day.day_name);
                        const isCompleted = completedDays.includes(
                          day.day_name
                        );
                        return (
                          <option
                            key={day.id}
                            value={day.day_name}
                            disabled={!isSelectable}
                            className={
                              isCompleted ? "bg-green-100 text-green-800" : ""
                            }
                          >
                            {day.day_name} {isCompleted ? "✓" : ""}{" "}
                            {!isSelectable ? "(Locked)" : ""}
                          </option>
                        );
                      })}
                  </select>

                  {/* Day status indicators */}
                  {/* <div className="flex items-center space-x-4 ml-6">
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-slate-600">Completed</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-slate-600">Available</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                      <span className="text-slate-600">Locked</span>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Evaluation Table */}
            {selectedDay && (
              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mb-8">
                  <div className="p-8">
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
                      <table className="w-full min-w-[1200px] table-fixed">
                        {/* Table Header */}
                        <thead className="bg-gradient-to-r from-slate-100 to-gray-100 border-b-2 border-slate-200">
                          <tr>
                            <th className="w-16 p-4 border-r border-slate-200 text-sm font-bold text-slate-700">
                              S.No.
                            </th>
                            <th className="w-60 p-4 border-r border-slate-200 text-sm font-bold text-slate-700 text-left">
                              Topic
                            </th>
                            <th className="w-80 p-4 border-r border-slate-200 text-sm font-bold text-slate-700 text-left">
                              Subtopic Description
                            </th>
                            <th className="w-20 p-4 border-r border-slate-200 text-sm font-bold text-slate-700">
                              Score
                            </th>
                            {[...Array(10)].map((_, i) => (
                              <th
                                key={`header-${i}`}
                                className="w-16 p-4 border-r border-slate-200 last:border-r-0 text-sm font-bold text-slate-700"
                              >
                                {i + 1}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                          {topics.map((topic, topicIndex) => {
                            const topicSubtopics = subtopics.filter(
                              (st) => st.topic === topic.id
                            );
                            return topicSubtopics.map(
                              (subtopic, subtopicIndex) => (
                                <tr
                                  key={subtopic.id}
                                  className={`border-b border-slate-200 transition-all duration-200 hover:bg-slate-50 ${(topicIndex * topicSubtopics.length +
                                      subtopicIndex) %
                                      2 ===
                                      0
                                      ? "bg-white"
                                      : "bg-slate-50/30"
                                    }`}
                                >
                                  {subtopicIndex === 0 && (
                                    <td
                                      rowSpan={topicSubtopics.length}
                                      className="w-16 p-4 border-r border-slate-200 text-center align-middle"
                                    >
                                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm mx-auto">
                                        <span className="text-sm font-bold text-white">
                                          {topic.slno}
                                        </span>
                                      </div>
                                    </td>
                                  )}

                                  {subtopicIndex === 0 && (
                                    <td
                                      rowSpan={topicSubtopics.length}
                                      className="w-60 p-4 border-r border-slate-200 align-middle"
                                    >
                                      <div className="text-sm font-semibold text-slate-800 leading-tight break-words">
                                        {topic.cycle_topics}
                                      </div>
                                    </td>
                                  )}

                                  {/* Subtopic Column  */}
                                  <td className="w-80 p-4 border-r border-slate-200 align-top">
                                    <div className="text-sm text-slate-600 leading-relaxed break-words hyphens-auto">
                                      {subtopic.sub_topic}
                                    </div>
                                  </td>

                                  {/* Score Column */}
                                  <td className="w-20 p-4 border-r border-slate-200 text-center align-top">
                                    <div
                                      className={`px-3 py-2 rounded-full text-sm font-bold shadow-sm inline-block ${subtopic.score_required === 10
                                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                                          : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                        }`}
                                    >
                                      {subtopic.score_required}
                                    </div>
                                  </td>

                                  {/* Score Input Columns */}
                                  {[...Array(10)].map((_, i) => (
                                    <td
                                      key={`cycle-${i}-subtopic-${subtopic.id}`}
                                      className="w-16 p-4 border-r border-slate-200 last:border-r-0 text-center align-top"
                                    >
                                      <input
                                        type="number"
                                        min="0"
                                        max={subtopic.score_required}
                                        value={
                                          evaluationScores[
                                          `${subtopic.id}-${i}`
                                          ] ?? ""
                                        }
                                        onChange={(e) =>
                                          handleScoreChange(
                                            subtopic.id,
                                            i,
                                            e.target.value
                                          )
                                        }
                                        disabled={isDaySubmitted}
                                        className={`w-full h-12 text-center rounded-lg text-sm font-medium shadow-sm transition-all duration-200 ${isDaySubmitted
                                            ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-white border-2 border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none hover:border-slate-400"
                                          }`}
                                        placeholder="0"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              )
                            );
                          })}

                          {/* Total Marks Row */}
                          <tr className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-slate-200">
                            <td className="w-16 p-4 border-r border-slate-200"></td>
                            <td className="w-60 p-4 border-r border-slate-200">
                              <span className="text-sm font-bold text-slate-800">
                                Total Marks
                              </span>
                            </td>
                            <td className="w-80 p-4 border-r border-slate-200">
                              <span className="text-sm font-semibold text-slate-600">
                                Out of{" "}
                                {subtopics.reduce(
                                  (sum, subtopic) =>
                                    sum + subtopic.score_required,
                                  0
                                )}
                              </span>
                            </td>
                            <td className="w-20 p-4 border-r border-slate-200"></td>
                            {[...Array(10)].map((_, i) => {
                              const total = calculateTotalForCycle(i);
                              const maxPossible = subtopics.reduce(
                                (sum, subtopic) =>
                                  sum + subtopic.score_required,
                                0
                              );
                              const percentage =
                                maxPossible > 0
                                  ? (total / maxPossible) * 100
                                  : 0;
                              const isPass = percentage >= passingCriteria;

                              return (
                                <td
                                  key={`total-${i}`}
                                  className="w-16 p-4 border-r border-slate-200 last:border-r-0 text-center"
                                >
                                  <div
                                    className={`px-3 py-2 rounded-lg text-sm font-bold shadow-sm border inline-block ${total === 0
                                        ? "bg-gray-100 text-gray-500 border-gray-200"
                                        : isPass
                                          ? "bg-green-100 text-green-800 border-green-200"
                                          : "bg-red-100 text-red-800 border-red-200"
                                      }`}
                                    title={`${percentage.toFixed(1)}% (${isPass ? "Pass" : "Fail"
                                      })`}
                                  >
                                    {total}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mb-8">
                  <div className="px-8 py-6 bg-white border-t border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                      <div className="w-1 h-6 bg-indigo-500 rounded-full mr-3"></div>
                      Authorization & Approval
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                          Prepared By
                          {/* - SDC Trainer */}
                        </label>
                        <input
                          type="text"
                          name="prepared_by"
                          value={formData.prepared_by}
                          onChange={handleInputChange}
                          className="w-full rounded-lg px-4 py-3 text-sm border bg-white border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          placeholder="Enter trainer name"
                        />
                      </div>

                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                          Checked By
                          {/* - TL/Production/Quality */}
                        </label>
                        <input
                          type="text"
                          name="checked_by"
                          value={formData.checked_by}
                          onChange={handleInputChange}
                          className="w-full rounded-lg px-4 py-3 text-sm border bg-white border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          placeholder="Enter checker name"
                        />
                      </div>

                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                          Approved By
                          {/* - SDC Manager */}
                        </label>
                        <input
                          type="text"
                          name="approved_by"
                          value={formData.approved_by}
                          onChange={handleInputChange}
                          className="w-full rounded-lg px-4 py-3 text-sm border bg-white border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          placeholder="Enter manager name"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
                  {isDaySubmitted ? (
                    <div className="flex flex-col items-center space-y-4">
                      {/* <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full border-2 border-green-200">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div> */}
                      <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-green-800 mb-2">
                          Evaluation Completed
                        </h3>
                        <p className="text-sm text-green-700 mb-4">
                          {selectedDay} evaluation has been successfully
                          submitted and cannot be modified.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || !formData.date || !selectedDay}
                      className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 disabled:from-slate-400 disabled:via-slate-500 disabled:to-slate-600 text-white font-bold px-10 py-4 rounded-xl shadow-lg transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none active:scale-95"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          <span>Saving Evaluation...</span>
                        </div>
                      ) : (
                        <span className="text-lg">
                          Submit {selectedDay} Evaluation
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </form>
            )}
          </>
        )}

        {/* Results Section */}
        {evaluationData &&
          evaluationData.evaluations &&
          evaluationData.evaluations.length > 0 && (
            <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
              <div className="px-8 py-6 bg-slate-50 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                  Evaluation Results
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Results */}
                  <div>
                    <h4 className="text-md font-semibold text-slate-700 mb-3 flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      Daily Results
                    </h4>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">
                              Day
                            </th>
                            <th className="px-3 py-2 text-center font-medium text-slate-600">
                              Score
                            </th>
                            <th className="px-3 py-2 text-center font-medium text-slate-600">
                              %
                            </th>
                            <th className="px-3 py-2 text-center font-medium text-slate-600">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {days
                            .sort((a, b) => a.sequence_order - b.sequence_order)
                            .filter((day) =>
                              completedDays.includes(day.day_name)
                            )
                            .map((day) => {
                              // Calculate day results
                              const dayEvaluations =
                                evaluationData.evaluations.filter(
                                  (evaluationItem) =>
                                    evaluationItem.day === day.id
                                );

                              let dayScore = 0;
                              let dayMaxScore = 0;

                              dayEvaluations.forEach((evaluation) => {
                                const subtopic = subtopics.find(
                                  (st) => st.id === evaluation.subtopic
                                );
                                if (subtopic) {
                                  // Sum all marks for this evaluation
                                  for (let i = 1; i <= 10; i++) {
                                    const markKey =
                                      `mark_${i}` as keyof EvaluationSubTopicMarks;
                                    const markValue = evaluation[markKey];
                                    if (
                                      markValue !== null &&
                                      markValue !== undefined
                                    ) {
                                      dayScore += markValue;
                                    }
                                  }
                                  dayMaxScore += subtopic.score_required * 10;
                                }
                              });

                              const percentage =
                                dayMaxScore > 0
                                  ? (dayScore / dayMaxScore) * 100
                                  : 0;
                              const status =
                                percentage >= passingCriteria ? "Pass" : "Fail";
                              const isCompleted = completedDays.includes(
                                day.day_name
                              );

                              return (
                                <tr
                                  key={day.id}
                                  className="hover:bg-slate-50 transition-colors"
                                >
                                  <td className="px-3 py-2 font-medium text-slate-800 flex items-center">
                                    {day.day_name}
                                    {/* {isCompleted && (
                                      <span className="ml-2 text-green-600 text-xs">
                                        ✓
                                      </span>
                                    )} */}
                                  </td>
                                  <td className="px-3 py-2 text-center text-slate-700">
                                    {dayScore}/{dayMaxScore}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${percentage >= passingCriteria
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                      {percentage.toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${status === "Pass"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                      {status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Final Summary */}
                  <div>
                    <h4 className="text-md font-semibold text-slate-700 mb-3 flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      Final Summary
                    </h4>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                      {(() => {
                        // Calculate overall totals
                        let totalScore = 0;
                        let totalPossibleScore = 0;

                        evaluationData.evaluations.forEach((evaluation) => {
                          const subtopic = subtopics.find(
                            (st) => st.id === evaluation.subtopic
                          );
                          if (subtopic) {
                            for (let i = 1; i <= 10; i++) {
                              const markKey =
                                `mark_${i}` as keyof typeof evaluation;
                              const markValue = evaluation[markKey];
                              if (
                                markValue !== null &&
                                markValue !== undefined
                              ) {
                                totalScore += markValue;
                              }
                            }
                            totalPossibleScore += subtopic.score_required * 10;
                          }
                        });

                        const finalPercentage =
                          totalPossibleScore > 0
                            ? (totalScore / totalPossibleScore) * 100
                            : 0;
                        const finalStatus =
                          finalPercentage >= passingCriteria
                            ? "Pass"
                            : "Fail - Retraining Required";

                        return (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-700">
                                Total Score
                              </span>
                              <span className="text-lg font-bold text-slate-900">
                                {totalScore}/{totalPossibleScore}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-700">
                                Final Percentage
                              </span>
                              <span className="text-lg font-bold text-slate-900">
                                {finalPercentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                              <span className="text-sm font-medium text-slate-700">
                                Final Status
                              </span>
                              <span
                                className={`px-4 py-2 rounded-lg text-sm font-bold ${finalStatus.includes("Pass")
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                                  }`}
                              >
                                {finalStatus}
                              </span>
                            </div>
                          </>
                        );
                      })()}

                      {/* Progress indicator */}
                      <div className="pt-3 border-t border-slate-200">
                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                          <span>Progress</span>
                          <span>
                            {completedDays.length}/{days.length} days completed
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(completedDays.length / days.length) * 100
                                }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Scoring Guidelines */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
              Evaluation Criteria
            </h3>

            {/* Topic-wise Evaluation Criteria */}
            {topics.length > 0 && (
              <div className="space-y-6">
                {topics.map((topic) => {
                  const topicSubtopics = subtopics.filter(
                    (st) => st.topic === topic.id
                  );
                  return (
                    <div
                      key={topic.id}
                      className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-6 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-blue-800 text-lg flex items-center">
                          <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                            {topic.slno}
                          </span>
                          {topic.cycle_topics}
                        </h4>
                      </div>

                      <div className="space-y-4">
                        {topicSubtopics.map((subtopic) => (
                          <div
                            key={subtopic.id}
                            className="bg-white/80 rounded-lg p-4 border border-blue-200"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h5 className="font-semibold text-blue-800 flex-1">
                                {subtopic.sub_topic}
                              </h5>
                              <div className="bg-blue-100 px-3 py-1 rounded-full border border-blue-300">
                                <span className="text-sm font-bold text-blue-800">
                                  Max Score: {subtopic.score_required}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="flex items-center p-2 bg-red-50 rounded text-sm">
                                <span className="w-4 h-4 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                                <span className="text-red-800">
                                  <strong>0:</strong> Not Following Standard
                                </span>
                              </div>
                              <div className="flex items-center p-2 bg-orange-50 rounded text-sm">
                                <span className="w-4 h-4 bg-orange-500 rounded-full mr-2 flex-shrink-0"></span>
                                <span className="text-orange-800">
                                  <strong>
                                    1-{subtopic.score_required - 1}:
                                  </strong>{" "}
                                  Partial Standard
                                </span>
                              </div>
                              <div className="flex items-center p-2 bg-green-50 rounded text-sm">
                                <span className="w-4 h-4 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                                <span className="text-green-800">
                                  <strong>{subtopic.score_required}:</strong>{" "}
                                  Following Standard
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Overall Passing Criteria */}
            <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-xl p-6 shadow-sm">
              <h4 className="font-bold text-green-800 text-center mb-4 text-lg">
                Overall Passing Criteria
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-center p-4 bg-white/80 rounded-lg border border-green-200">
                  <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
                  <span className="text-sm text-green-800 font-medium">
                    ≥ {passingCriteria}% - Pass
                  </span>
                </div>
                <div className="flex items-center justify-center p-4 bg-white/80 rounded-lg border border-green-200">
                  <span className="w-4 h-4 bg-red-500 rounded-full mr-3"></span>
                  <span className="text-sm text-green-800 font-medium">
                    &lt; {passingCriteria}% - Fail
                  </span>
                </div>
                <div className="flex items-center justify-center p-4 bg-white/80 rounded-lg border border-green-200">
                  <span className="w-4 h-4 bg-orange-500 rounded-full mr-3"></span>
                  <span className="text-sm text-green-800 font-medium">
                    Fail = Re-training Required
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenCyclePage;
