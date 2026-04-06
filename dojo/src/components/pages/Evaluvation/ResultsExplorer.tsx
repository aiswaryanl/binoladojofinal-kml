// src/components/pages/Evaluvation/ResultsExplorer.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  Filter,
  Users,
  Trophy,
  TrendingUp,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  Target,
  Table,
  Download,
  ArrowLeft,
} from "lucide-react";

const API_BASE_URL = "http://192.168.2.51:8000";

type Mode = "remote" | "individual";

interface LevelOption {
  level_id: number;
  level_name: string;
}

interface DepartmentOption {
  department_id: number;
  department_name: string;
}

interface StationOption {
  station_id: number;
  station_name: string;
  participants: number;
  avg_percentage: number;
  pass_rate: number;
  batches_count: number;
}

interface BatchOption {
  session_key: string;
  display_label: string;
  question_paper_name: string;
  created_at: string | null;
  participants: number;
  avg_percentage: number;
  pass_rate: number;
}

interface ScoreEntry {
  id: number;
  employee_id: string;
  name: string;
  section: string;
  department: string;
  marks: number;
  percentage: number;
  total_questions: number;
  passed: boolean;
  test_name: string;
  created_at: string;
  level_name?: string;
  skill?: string;
  level_id?: number;
  station_id?: number;
}

const fetchJson = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
};

const ResultsExplorer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== Read initial filters from URL =====
  const searchParams = new URLSearchParams(location.search);
  const initialModeParam = searchParams.get("mode") as Mode | null;
  const initialMode: Mode =
    initialModeParam === "individual" || initialModeParam === "remote"
      ? initialModeParam
      : "remote";

  const initialLevelId = searchParams.get("level_id")
    ? Number(searchParams.get("level_id"))
    : null;
  const initialDepartmentId = searchParams.get("department_id")
    ? Number(searchParams.get("department_id"))
    : null;
  const initialStationId = searchParams.get("station_id")
    ? Number(searchParams.get("station_id"))
    : null;
  const initialSessionKey = searchParams.get("session_key") || null;

  // ===== State =====
  const [mode, setMode] = useState<Mode>(initialMode);

  const [levels, setLevels] = useState<LevelOption[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(
    initialLevelId
  );

  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(
    initialDepartmentId
  );

  const [stations, setStations] = useState<StationOption[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<number | null>(
    initialStationId
  );

  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [selectedSessionKey, setSelectedSessionKey] = useState<string | null>(
    initialSessionKey
  );

  const [scores, setScores] = useState<ScoreEntry[]>([]);

  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingScores, setLoadingScores] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ===== Mode change handler =====
  const handleModeChange = (newMode: Mode) => {
    if (newMode === mode) return;
    setMode(newMode);
    // Clear only mode-specific state
    setSelectedSessionKey(null);
    setBatches([]);
    setScores([]);
  };

  // ===== Levels (mode-aware) =====
  useEffect(() => {
    const loadLevels = async () => {
      try {
        setLoadingLevels(true);
        setError(null);
        const url = `${API_BASE_URL}/api/results/levels/?mode=${mode}`;
        const data = await fetchJson<LevelOption[]>(url);
        setLevels(data);
        setSelectedLevelId((prev) => {
          if (prev !== null && data.some((d) => d.level_id === prev)) {
            return prev;
          }
          return data.length > 0 ? data[0].level_id : null;
        });
      } catch (err) {
        console.error("Error loading levels:", err);
        setError(
          `Failed to load levels: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setLevels([]);
        setSelectedLevelId(null);
      } finally {
        setLoadingLevels(false);
      }
    };
    loadLevels();
  }, [mode]);

  // ===== Departments (mode-aware) =====
  useEffect(() => {
    if (!selectedLevelId) {
      setDepartments([]);
      setSelectedDepartmentId(null);
      return;
    }

    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
        setError(null);
        const url = `${API_BASE_URL}/api/results/departments/?level_id=${selectedLevelId}&mode=${mode}`;
        const data = await fetchJson<DepartmentOption[]>(url);
        setDepartments(data);
        setSelectedDepartmentId((prev) => {
          if (prev !== null && data.some((d) => d.department_id === prev)) {
            return prev;
          }
          return data.length > 0 ? data[0].department_id : null;
        });
      } catch (err) {
        console.error("Error loading departments:", err);
        setError(
          `Failed to load departments: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setDepartments([]);
        setSelectedDepartmentId(null);
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, [selectedLevelId, mode]);

  // ===== Stations (mode-aware) =====
  useEffect(() => {
    if (!selectedLevelId || !selectedDepartmentId) {
      setStations([]);
      setSelectedStationId(null);
      return;
    }

    const loadStations = async () => {
      try {
        setLoadingStations(true);
        setError(null);
        const url = `${API_BASE_URL}/api/results/stations/?level_id=${selectedLevelId}&department_id=${selectedDepartmentId}&mode=${mode}`;
        const data = await fetchJson<StationOption[]>(url);
        setStations(data);
        setSelectedStationId((prev) => {
          if (prev !== null && data.some((s) => s.station_id === prev)) {
            return prev;
          }
          return data.length > 0 ? data[0].station_id : null;
        });
      } catch (err) {
        console.error("Error loading stations:", err);
        setError(
          `Failed to load stations: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setStations([]);
        setSelectedStationId(null);
      } finally {
        setLoadingStations(false);
      }
    };

    loadStations();
  }, [selectedLevelId, selectedDepartmentId, mode]);

  // ===== Batches (REMOTE ONLY, mode-aware) =====
  useEffect(() => {
    if (mode !== "remote") {
      setBatches([]);
      setSelectedSessionKey(null);
      return;
    }

    if (!selectedLevelId || !selectedDepartmentId || !selectedStationId) {
      setBatches([]);
      setSelectedSessionKey(null);
      setScores([]);
      return;
    }

    const loadBatches = async () => {
      try {
        setLoadingBatches(true);
        setError(null);
        setScores([]);
        const url = `${API_BASE_URL}/api/results/batches/?level_id=${selectedLevelId}&department_id=${selectedDepartmentId}&station_id=${selectedStationId}&mode=${mode}`;
        const data = await fetchJson<BatchOption[]>(url);
        setBatches(data);
        setSelectedSessionKey((prev) => {
          if (prev !== null && data.some((b) => b.session_key === prev)) {
            return prev;
          }
          return data.length > 0 ? data[0].session_key : null;
        });
      } catch (err) {
        console.error("Error loading batches:", err);
        setError(
          `Failed to load batches: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setBatches([]);
        setSelectedSessionKey(null);
      } finally {
        setLoadingBatches(false);
      }
    };

    loadBatches();
  }, [mode, selectedLevelId, selectedDepartmentId, selectedStationId]);

  // ===== Scores for REMOTE mode (by batch) =====
  useEffect(() => {
    if (mode !== "remote") return;
    if (!selectedSessionKey) {
      setScores([]);
      return;
    }

    const loadScores = async () => {
      try {
        setLoadingScores(true);
        setError(null);
        const encoded = encodeURIComponent(selectedSessionKey);
        const url = `${API_BASE_URL}/api/scores-by-session/${encoded}/`;
        const data = await fetchJson<ScoreEntry[]>(url);
        const sorted = [...data].sort((a, b) => b.percentage - a.percentage);
        setScores(sorted);
      } catch (err) {
        console.error("Error loading scores:", err);
        setError(
          `Failed to load scores: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setScores([]);
      } finally {
        setLoadingScores(false);
      }
    };

    loadScores();
  }, [mode, selectedSessionKey]);

  // ===== Scores for INDIVIDUAL mode (filtered by L+D+S) =====
  useEffect(() => {
    if (mode !== "individual") return;

    if (!selectedLevelId || !selectedDepartmentId || !selectedStationId) {
      setScores([]);
      return;
    }

    const loadIndividualScores = async () => {
      try {
        setLoadingScores(true);
        setError(null);
        const url = `${API_BASE_URL}/api/results/individual-scores/?level_id=${selectedLevelId}&department_id=${selectedDepartmentId}&station_id=${selectedStationId}`;
        const data = await fetchJson<ScoreEntry[]>(url);
        const sorted = [...data].sort((a, b) => b.percentage - a.percentage);
        setScores(sorted);
      } catch (err) {
        console.error("Error loading individual scores:", err);
        setError(
          `Failed to load individual scores: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setScores([]);
      } finally {
        setLoadingScores(false);
      }
    };

    loadIndividualScores();
  }, [mode, selectedLevelId, selectedDepartmentId, selectedStationId]);

  // ===== Derived data =====
  const currentLevel =
    levels.find((l) => l.level_id === selectedLevelId) || null;
  const currentDepartment =
    departments.find((d) => d.department_id === selectedDepartmentId) || null;
  const currentStation =
    stations.find((s) => s.station_id === selectedStationId) || null;
  const currentBatch =
    batches.find((b) => b.session_key === selectedSessionKey) || null;

  const stats = useMemo(() => {
    const total = scores.length;
    const passed = scores.filter((s) => s.passed).length;
    const avgMarks =
      total > 0 ? scores.reduce((sum, s) => sum + s.marks, 0) / total : 0;
    const topScore = total > 0 ? scores[0].percentage : 0;
    const passRate = total > 0 ? (passed / total) * 100 : 0;

    return { total, passed, avgMarks, topScore, passRate };
  }, [scores]);

  // ===== Handlers =====
  const handleViewSheet = (scoreId: number) => {
    navigate(`/answersheet/${scoreId}`);
  };

  const handleMatrixView = () => {
    if (!selectedLevelId || !selectedStationId) return;
    navigate("/results-matrix", {
      state: {
        levelId: selectedLevelId,
        stationId: selectedStationId,
        levelName: currentLevel?.level_name || `Level ${selectedLevelId}`,
        stationName:
          currentStation?.station_name || `Station ${selectedStationId}`,
      },
    });
  };

  const handleMatrixExcel = () => {
    if (!selectedLevelId || !selectedStationId) return;
    const url = `${API_BASE_URL}/api/results/matrix/excel/${selectedLevelId}/${selectedStationId}/`;
    window.open(url, "_blank");
  };

  // ===== UI =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Results Explorer
              </h1>
              <p className="text-gray-600 text-sm">
                Drill down by Level → Department → Station{" "}
                {mode === "remote" ? "→ Batch (Remote)" : " (Individual)"}
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => handleModeChange("remote")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                mode === "remote"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Group (Remote)
            </button>
            <button
              onClick={() => handleModeChange("individual")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                mode === "individual"
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Individual
            </button>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto px-6 py-6 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">
                Something went wrong
              </h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Step selectors */}
        <section className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Level */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Level
              </label>
              <div className="relative">
                <select
                  value={selectedLevelId ?? ""}
                  onChange={(e) =>
                    setSelectedLevelId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingLevels || levels.length === 0}
                >
                  {levels.length === 0 && <option value="">No levels</option>}
                  {levels.map((lvl) => (
                    <option key={lvl.level_id} value={lvl.level_id}>
                      {lvl.level_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Department
              </label>
              <div className="relative">
                <select
                  value={selectedDepartmentId ?? ""}
                  onChange={(e) =>
                    setSelectedDepartmentId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={
                    !selectedLevelId ||
                    loadingDepartments ||
                    departments.length === 0
                  }
                >
                  {!selectedLevelId && (
                    <option value="">Select level first</option>
                  )}
                  {selectedLevelId && departments.length === 0 && (
                    <option value="">No departments</option>
                  )}
                  {departments.map((dept) => (
                    <option
                      key={dept.department_id}
                      value={dept.department_id}
                    >
                      {dept.department_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Station */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Station
              </label>
              <div className="relative">
                <select
                  value={selectedStationId ?? ""}
                  onChange={(e) =>
                    setSelectedStationId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={
                    !selectedLevelId ||
                    !selectedDepartmentId ||
                    loadingStations ||
                    stations.length === 0
                  }
                >
                  {(!selectedLevelId || !selectedDepartmentId) && (
                    <option value="">Select level & dept</option>
                  )}
                  {selectedLevelId &&
                    selectedDepartmentId &&
                    stations.length === 0 && (
                      <option value="">No stations</option>
                    )}
                  {stations.map((st) => (
                    <option key={st.station_id} value={st.station_id}>
                      {st.station_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Batch / Session (REMOTE only) */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {mode === "remote" ? "Batch / Session" : "Mode: Individual"}
              </label>
              {mode === "remote" ? (
                <div className="relative">
                  <select
                    value={selectedSessionKey ?? ""}
                    onChange={(e) =>
                      setSelectedSessionKey(
                        e.target.value ? e.target.value : null
                      )
                    }
                    className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    disabled={
                      !selectedLevelId ||
                      !selectedDepartmentId ||
                      !selectedStationId ||
                      loadingBatches ||
                      batches.length === 0
                    }
                  >
                    {(!selectedLevelId ||
                      !selectedDepartmentId ||
                      !selectedStationId) && (
                      <option value="">Select level, dept & station</option>
                    )}
                    {selectedLevelId &&
                      selectedDepartmentId &&
                      selectedStationId &&
                      batches.length === 0 && (
                        <option value="">No batches found</option>
                      )}
                    {batches.map((b) => (
                      <option key={b.session_key} value={b.session_key}>
                        {b.display_label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : (
                <div className="w-full px-4 py-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl">
                  Showing all individual attempts for the selected Level,
                  Department and Station.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Station summary + Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Station summary */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-indigo-100 p-2 rounded-xl">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {currentStation?.station_name || "No station selected"}
                </h2>
                <p className="text-xs text-gray-500">
                  {currentLevel?.level_name || "No level"} •{" "}
                  {currentDepartment?.department_name || "No department"} •{" "}
                  {mode === "remote" ? "Group (Remote)" : "Individual"}
                </p>
              </div>
            </div>

            {currentStation ? (
              <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                  <p className="text-xs text-blue-600">Participants</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentStation.participants}
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-2">
                  <p className="text-xs text-purple-600">Avg %</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentStation.avg_percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                  <p className="text-xs text-green-600">Pass Rate</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentStation.pass_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-3">
                Select Level, Department and Station to see summary.
              </p>
            )}

            {mode === "remote" && currentBatch && (
              <div className="mt-4 border-t border-gray-200 pt-3 text-xs text-gray-600">
                <p>
                  <span className="font-semibold">Batch:</span>{" "}
                  {currentBatch.display_label}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Paper:</span>{" "}
                  {currentBatch.question_paper_name}
                </p>
              </div>
            )}
          </div>

          {/* Stats cards */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">
                  Participants
                </span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.total}
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">
                  Pass Rate
                </span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-2xl font-bold text-green-600">
                {stats.passRate.toFixed(1)}%
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">
                  Avg Marks
                </span>
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {stats.avgMarks.toFixed(1)}
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">
                  Top Score
                </span>
                <Award className="w-4 h-4 text-yellow-500" />
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {stats.topScore.toFixed(1)}%
              </span>
            </div>
          </div>
        </section>

        {/* Actions row */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>
              {currentLevel?.level_name || "No level"} •{" "}
              {currentDepartment?.department_name || "No department"} •{" "}
              {currentStation?.station_name || "No station"} •{" "}
              {mode === "remote" ? "Group (Remote)" : "Individual"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMatrixView}
              disabled={!selectedLevelId || !selectedStationId}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-indigo-500 text-indigo-600 bg-white hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Table className="w-4 h-4" />
              Matrix View
            </button>

            <button
              onClick={handleMatrixExcel}
              disabled={!selectedLevelId || !selectedStationId}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-green-500 text-green-600 bg-white hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Matrix (Excel)
            </button>
          </div>
        </section>

        {/* Scores Table */}
        <section className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {mode === "remote" ? "Batch Results" : "Individual Results"}
                </h2>
                <p className="text-xs text-gray-500">
                  {mode === "remote"
                    ? currentBatch
                      ? currentBatch.display_label
                      : "Select a batch to see results"
                    : "All individual attempts for this Level, Department and Station"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            {loadingScores ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
                <p className="text-gray-600 text-sm">Loading scores...</p>
              </div>
            ) : mode === "remote" && !selectedSessionKey ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                Select Level, Department, Station and Batch to view results.
              </div>
            ) : scores.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No scores found for this selection.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Result
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Sheet
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {scores.map((s, index) => {
                      const isTop3 = index < 3;
                      const rankColors = [
                        "bg-yellow-500",
                        "bg-gray-400",
                        "bg-yellow-600",
                      ];
                      return (
                        <tr
                          key={s.id}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isTop3
                                  ? `text-white ${rankColors[index]}`
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                {s.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {s.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {s.employee_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {s.department}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                            {s.marks}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                            {s.percentage.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                s.passed
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {s.passed ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {s.passed ? "Pass" : "Fail"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleViewSheet(s.id)}
                              className="px-3 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                            >
                              View Sheet
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ResultsExplorer;