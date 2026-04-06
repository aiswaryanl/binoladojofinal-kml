

import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// API CONFIGURATION
// ═══════════════════════════════════════════════════════════════
const API_BASE_URL = "http://127.0.0.1:8000";
const API = {
  POISON_TESTS:        `${API_BASE_URL}/poison-cake-tests/`,
  RECURRING_SCHEDULES: `${API_BASE_URL}/recurring-schedules/`,
  REINSPECTION_PLANS:  `${API_BASE_URL}/reinspection-plans/`,
  STATIONS:            `${API_BASE_URL}/stations/`,
  LEVELS:              `${API_BASE_URL}/levels/`,
  OPERATORS:           `${API_BASE_URL}/operators/`,   // MasterTable — all employees
};

// ═══════════════════════════════════════════════════════════════
// FINANCIAL YEAR
// ═══════════════════════════════════════════════════════════════
function getFYStartYear(d = new Date()) { return d.getMonth() <= 2 ? d.getFullYear() - 1 : d.getFullYear(); }

function buildMonthsForFY(fy) {
  const L = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return Array.from({ length: 12 }, (_, i) => {
    const cm = (3 + i) % 12, cy = i <= 8 ? fy : fy + 1;
    return { key: `${L[cm]}${String(cy).slice(2)}`, label: `${L[cm]}'${String(cy).slice(2)}`, year: cy, month: cm };
  });
}

function fyLabel(y)  { return `${y}-${y + 1}`; }
function fyShort(y)  { return `FY${String(y).slice(2)}-${String(y+1).slice(2)}`; }
function getAvailableFYs() { const c = getFYStartYear(); return Array.from({ length: 5 }, (_, i) => c - 2 + i); }

const WEEKS = ["W1","W2","W3","W4"];

// ═══════════════════════════════════════════════════════════════
// LAYOUT
// ═══════════════════════════════════════════════════════════════
const COL_SNO_W = 56, COL_EMP_W = 300, COL_PA_W = 80;
const COL_EMP_LEFT = COL_SNO_W, COL_PA_LEFT = COL_SNO_W + COL_EMP_W;

// ═══════════════════════════════════════════════════════════════
// DATE UTILS
// ═══════════════════════════════════════════════════════════════
function getWeekTag(ds) { const d = new Date(ds).getDate(); return d<=7?"W1":d<=14?"W2":d<=21?"W3":"W4"; }
function getMonthKey(ds, M) { const d = new Date(ds); return (M.find(m=>m.year===d.getFullYear()&&m.month===d.getMonth())||{}).key||null; }
function addMonths(ds, n) { const d=new Date(ds),dy=d.getDate(); d.setDate(1);d.setMonth(d.getMonth()+n); d.setDate(Math.min(dy,new Date(d.getFullYear(),d.getMonth()+1,0).getDate())); return d.toISOString().split("T")[0]; }
function formatDate(ds) { return ds ? new Date(ds).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—"; }
function daysFromNow(ds) { if(!ds)return null; const d=new Date(ds),n=new Date();n.setHours(0,0,0,0);d.setHours(0,0,0,0); return Math.ceil((d-n)/864e5); }
function todayStr() { return new Date().toISOString().split("T")[0]; }

// ═══════════════════════════════════════════════════════════════
// NORMALIZE EMPLOYEE ID
// ═══════════════════════════════════════════════════════════════
function normalizeId(raw) {
  if (raw == null) return null;
  if (typeof raw === "object") {
    const v = raw.emp_id ?? raw.id ?? raw.employee_code;
    return v != null ? String(v).trim() : null;
  }
  return String(raw).trim() || null;
}

function empId(rec) {
  if (!rec) return null;
  return normalizeId(rec.operator ?? rec.employee ?? rec.employee_code ?? rec.emp_id);
}

function empName(rec) {
  if (!rec) return "";
  if (rec.operator_name) return rec.operator_name.trim();
  if (rec.employee_name) return rec.employee_name.trim();
  const o = rec.operator ?? rec.employee;
  return (o && typeof o === "object") ? `${o.first_name||""} ${o.last_name||""}`.trim() : "";
}

function field(obj, ...keys) {
  for (const k of keys) {
    const v = obj[k];
    if (!v) continue;
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "object") {
      const n = v.station_name || v.level_name || v.department_name || v.name;
      if (n) return n.trim();
    }
  }
  return "—";
}

function testResult(t) { return t.test_judgment || t.test_result || ""; }

// ═══════════════════════════════════════════════════════════════
// ★ COMPOSITE ROW KEY: empId + stationName
// Same employee at different stations = different rows
// Same employee at same station = merged into one row
// ═══════════════════════════════════════════════════════════════
function rowKey(eid, stationName) {
  const st = (stationName && stationName !== "—") ? stationName : "__NO_STATION__";
  return `${eid}::${st}`;
}

// ═══════════════════════════════════════════════════════════════
// ★ DERIVE EMPLOYEES — one row per (empId + station)
// ═══════════════════════════════════════════════════════════════
function deriveEmployees(allTests, schedules, reInspections) {
  // map key = rowKey(empId, stationName)
  const map = new Map();

  function upsert(eid, name, station, level, dept, date) {
    const id = normalizeId(eid);
    if (!id) return;

    const nm  = name?.trim()    || null;
    const st  = station?.trim() && station.trim() !== "—" ? station.trim() : null;
    const lv  = level?.trim()   && level.trim()   !== "—" ? level.trim()   : null;
    const dp  = dept?.trim()    && dept.trim()    !== "—" ? dept.trim()    : null;
    const dt  = date ? new Date(date) : new Date(0);
    const rk  = rowKey(id, st);

    if (!map.has(rk)) {
      map.set(rk, {
        rowKey: rk,
        id,
        name: nm || id,
        station: st || "—",
        level: lv || "—",
        dept:  dp || "—",
        _latest: dt,
      });
    } else {
      const e = map.get(rk);
      if (nm && (e.name === id || !e.name)) e.name = nm;
      if (dt >= e._latest) {
        if (lv) e.level = lv;
        if (dp) e.dept  = dp;
        e._latest = dt;
      }
      if (e.level === "—" && lv) e.level = lv;
      if (e.dept  === "—" && dp) e.dept  = dp;
    }
  }

  // Tests (sorted newest first — latest info wins)
  [...allTests]
    .sort((a,b) => new Date(b.test_date) - new Date(a.test_date))
    .forEach(t => {
      upsert(
        empId(t), empName(t),
        field(t, "station_name", "station"),
        field(t, "level_name",   "level"),
        field(t, "department_name", "department"),
        t.test_date
      );
    });

  // Schedules — may introduce new (emp, station) combos for first-timers
  schedules.forEach(s => {
    upsert(
      s.employee_code || s.employee,
      s.employee_name,
      s.station_name,
      s.level_name,
      null,
      s.last_test_date || s.next_test_date || s.created_at
    );
  });

  // Re-inspection plans
  reInspections.forEach(ri => {
    upsert(
      ri.employee_code || ri.employee,
      ri.employee_name,
      ri.station_name,
      ri.level_name,
      null,
      ri.failed_date || ri.created_at
    );
  });

  // Remove internal field, sort by name then station
  return Array.from(map.values())
    .map(({ _latest, ...rest }) => rest)
    .sort((a, b) => a.name.localeCompare(b.name) || a.station.localeCompare(b.station));
}

// ═══════════════════════════════════════════════════════════════
// ★ BUILD RESULT MAP — keyed by (rowKey + month + week)
// ═══════════════════════════════════════════════════════════════
function buildResultMap(tests, MONTHS, reInspections) {
  const riByEmp = {};
  (reInspections || []).forEach(ri => {
    const eid = normalizeId(ri.employee_code || ri.employee);
    if (!eid) return;
    if (!riByEmp[eid]) riByEmp[eid] = [];
    riByEmp[eid].push({
      failedDate: ri.failed_date,
      failedTest: ri.failed_test,
      retestId:   ri.retest || ri.retest_id,
      status:     ri.status,
    });
  });

  // Group tests by (rowKey + month)
  const groups = {};
  tests.forEach(t => {
    const mk  = getMonthKey(t.test_date, MONTHS);
    const eid = empId(t);
    const st  = field(t, "station_name", "station");
    if (!mk || !eid) return;
    const rk = rowKey(eid, st);
    const gk = `${rk}__${mk}`;
    if (!groups[gk]) groups[gk] = [];
    groups[gk].push({ ...t, _eid: eid, _rk: rk, _mk: mk, _week: getWeekTag(t.test_date) });
  });

  const rm = {};
  Object.values(groups).forEach(group => {
    group.sort((a, b) => new Date(a.test_date) - new Date(b.test_date));
    let failSeen = false;
    group.forEach(entry => {
      const ck     = `${entry._rk}_${entry._mk}_${entry._week}`;
      const empRIs = riByEmp[entry._eid] || [];
      const isRI   = failSeen || empRIs.some(ri =>
        (ri.retestId && ri.retestId === entry.test_id) ||
        (ri.failedDate && new Date(entry.test_date) > new Date(ri.failedDate) && ri.failedTest !== entry.test_id)
      );
      rm[ck] = {
        result:      testResult(entry),
        testId:      entry.test_id,
        date:        entry.test_date,
        empId:       entry._eid,
        rowKey:      entry._rk,
        empName:     empName(entry),
        monthKey:    entry._mk,
        week:        entry._week,
        modelName:   field(entry, "model_name"),
        stationName: field(entry, "station_name", "station"),
        levelName:   field(entry, "level_name",   "level"),
        deptName:    field(entry, "department_name", "department"),
        isReInspect: isRI,
      };
      if (testResult(entry) === "NOT OK") failSeen = true;
    });
  });
  return rm;
}

// ═══════════════════════════════════════════════════════════════
// ★ BUILD PLAN SET
//   Source 1: +90 days from each PASS test (auto-cycle)
//   Source 2: RecurringTestSchedule API records (manual + first-timers)
//   Source 3: ReInspectionPlan records (red RI dots)
// ═══════════════════════════════════════════════════════════════
function buildPlanSet(allTests, MONTHS, resultMap, reInspections, schedules) {
  const fyStart = new Date(MONTHS[0].year,  MONTHS[0].month,  1);
  const fyEnd   = new Date(MONTHS[11].year, MONTHS[11].month + 1, 0);
  const planSet  = new Set();
  const planMeta = {};

  // ── Source 1: auto 90-day dots from PASS tests ──────────────
  const byRow = {};
  allTests.forEach(t => {
    const eid = empId(t);
    const st  = field(t, "station_name", "station");
    const rk  = rowKey(eid, st);
    if (!rk) return;
    if (!byRow[rk]) byRow[rk] = [];
    byRow[rk].push(t);
  });

  Object.entries(byRow).forEach(([rk, tests]) => {
    tests.sort((a, b) => new Date(a.test_date) - new Date(b.test_date));
    const passes = tests.filter(t => testResult(t) === "OK");
    passes.forEach(pass => {
      for (let step = 1; step <= 24; step++) {
        const nd = addMonths(pass.test_date, step * 3);
        const nD = new Date(nd);
        if (nD > fyEnd) break;
        if (nD >= fyStart) {
          const mk = getMonthKey(nd, MONTHS);
          if (mk) {
            const wk = getWeekTag(nd), ck = `${rk}_${mk}_${wk}`;
            if (!resultMap[ck]) {
              planSet.add(ck);
              if (!planMeta[ck] || new Date(pass.test_date) > new Date(planMeta[ck].lastPassDate)) {
                planMeta[ck] = {
                  rowKey:       rk,
                  nextDate:     nd,
                  lastPassDate: pass.test_date,
                  isCarryover:  new Date(pass.test_date) < fyStart,
                  isRIPlan:     false,
                  isManuallySched: false,
                };
              }
            }
          }
        }
      }
    });
  });

  // ── Source 2: RecurringTestSchedule API records ─────────────
  // These cover first-timers and manually scheduled future tests.
  // We trust the API's next_test_date directly.
  (schedules || []).forEach(s => {
    if (!s.next_test_date) return;
    if (!["SCHEDULED","DUE_SOON","OVERDUE"].includes(s.status)) return;

    const eid = normalizeId(s.employee_code || s.employee);
    if (!eid) return;

    const st = s.station_name || "—";
    const rk = rowKey(eid, st);

    const pD = new Date(s.next_test_date);
    if (pD < fyStart || pD > fyEnd) return;

    const mk = getMonthKey(s.next_test_date, MONTHS);
    if (!mk) return;

    const wk = getWeekTag(s.next_test_date), ck = `${rk}_${mk}_${wk}`;
    if (!resultMap[ck]) {
      planSet.add(ck);
      // Only overwrite if not already set, or this is a more precise manual entry
      if (!planMeta[ck] || (!planMeta[ck].isManuallySched)) {
        planMeta[ck] = {
          rowKey:          rk,
          nextDate:        s.next_test_date,
          lastPassDate:    s.last_test_date || "",
          isCarryover:     false,
          isRIPlan:        false,
          isManuallySched: true,
          scheduleId:      s.schedule_id,
          schedStatus:     s.status,
          daysRemaining:   s.days_remaining,
        };
      }
    }
  });

  // ── Source 3: ReInspection Plans → red RI dots ──────────────
  (reInspections || []).forEach(ri => {
    if (!["PENDING","SCHEDULED","IN_PROGRESS"].includes(ri.status)) return;
    const eid = normalizeId(ri.employee_code || ri.employee);
    if (!eid) return;

    const st = ri.station_name || "—";
    const rk = rowKey(eid, st);

    let planDate = ri.scheduled_date;
    if (!planDate && ri.failed_date) {
      const fd = new Date(ri.failed_date);
      fd.setDate(fd.getDate() + 14);
      planDate = fd.toISOString().split("T")[0];
    }
    if (!planDate) planDate = todayStr();

    const pD = new Date(planDate);
    if (pD < fyStart || pD > fyEnd) return;

    const mk = getMonthKey(planDate, MONTHS);
    if (!mk) return;

    const wk = getWeekTag(planDate), ck = `${rk}_${mk}_${wk}`;
    if (!resultMap[ck]) {
      planSet.add(ck);
      planMeta[ck] = {
        rowKey:    rk,
        nextDate:  planDate,
        lastPassDate: ri.failed_date || "",
        isCarryover: false,
        isRIPlan:  true,
        isManuallySched: false,
        riStatus:  ri.status,
        riPlanId:  ri.plan_id,
        riName:    ri.employee_name,
      };
    }
  });

  return { planSet, planMeta };
}

// ═══════════════════════════════════════════════════════════════
// DATA FETCHING
// ═══════════════════════════════════════════════════════════════
function useTrackerData(fyStartYear) {
  const [allTests,      setAllTests]  = useState([]);
  const [fyTests,       setFyTests]   = useState([]);
  const [schedules,     setSchedules] = useState([]);
  const [reInspections, setReInsp]    = useState([]);
  const [stations,      setStations]  = useState([]);
  const [levels,        setLevels]       = useState([]);
  const [allEmployees,  setAllEmployees] = useState([]); // ★ full MasterTable list
  const [loading,       setLoading]      = useState(true);
  const [error,         setError]        = useState(null);
  const [syncedAt,      setSyncedAt]     = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    const fyS = `${fyStartYear}-04-01`, fyE = `${fyStartYear + 1}-03-31`;
    try {
      const [aR, fR, sR, rR] = await Promise.all([
        fetch(`${API.POISON_TESTS}?limit=10000&ordering=test_date`),
        fetch(`${API.POISON_TESTS}?limit=5000&ordering=test_date&start_date=${fyS}&end_date=${fyE}`),
        fetch(`${API.RECURRING_SCHEDULES}?limit=5000`),
        fetch(`${API.REINSPECTION_PLANS}?limit=5000`),
      ]);
      if (!aR.ok) throw new Error(`Tests API: ${aR.status}`);
      const [aD, fD, sD, rD] = await Promise.all([aR.json(), fR.json(), sR.json(), rR.json()]);
      setAllTests(Array.isArray(aD) ? aD : aD.results || []);
      setFyTests(Array.isArray(fD) ? fD : fD.results || []);
      setSchedules(Array.isArray(sD) ? sD : sD.results || []);
      setReInsp(Array.isArray(rD) ? rD : rD.results || []);

      try { const r = await fetch(`${API.STATIONS}?limit=500`); if (r.ok) { const d = await r.json(); setStations(Array.isArray(d) ? d : d.results || []); } } catch (_) {}
      try { const r = await fetch(`${API.LEVELS}?limit=500`);   if (r.ok) { const d = await r.json(); setLevels(Array.isArray(d) ? d : d.results || []); } } catch (_) {}

      // ★ Fetch ALL employees from MasterTable — covers first-timers with no tests yet
      try {
        const r = await fetch(`${API.OPERATORS}?limit=10000`);
        if (r.ok) {
          const d = await r.json();
          const raw = Array.isArray(d) ? d : d.results || [];
          const normalized = raw
            .map(e => ({
              id:      String(e.emp_id ?? e.id ?? "").trim(),
              name:    `${e.first_name || ""} ${e.last_name || ""}`.trim()
                         || String(e.emp_id ?? e.id ?? ""),
              station: e.station_name
                         || (e.station && typeof e.station === "object" ? e.station.station_name : "")
                         || "—",
              dept:    e.department_name
                         || (e.department && typeof e.department === "object" ? e.department.department_name : "")
                         || "—",
            }))
            .filter(e => e.id)
            .sort((a, b) => a.name.localeCompare(b.name));
          setAllEmployees(normalized);
        }
      } catch (_) {}

      setSyncedAt(new Date());
    } catch (e) { setError(e.message || "Failed to fetch"); } finally { setLoading(false); }
  }, [fyStartYear]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  return { allTests, fyTests, schedules, reInspections, stations, levels, allEmployees, loading, error, refetch: fetchAll, syncedAt };
}

// ═══════════════════════════════════════════════════════════════
// API ACTIONS
// ═══════════════════════════════════════════════════════════════
async function apiPost(url, body) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(typeof e === "object" ? Object.values(e).flat().join(", ") : `Failed: ${r.status}`); }
  return r.json();
}
async function apiDel(url) { const r = await fetch(url, { method: "DELETE" }); if (!r.ok) throw new Error(`Failed: ${r.status}`); }

const apiScheduleRI  = (id, date, notes = "") => apiPost(`${API.REINSPECTION_PLANS}${id}/schedule/`, { scheduled_date: date, notes });
const apiCompleteRI  = (id, testId) => apiPost(`${API.REINSPECTION_PLANS}${id}/complete/`, { test_id: testId });
const apiCreateSched = data => apiPost(API.RECURRING_SCHEDULES, data);
const apiCreateRI    = data => apiPost(API.REINSPECTION_PLANS, data);
const apiDelSched    = id => apiDel(`${API.RECURRING_SCHEDULES}${id}/`);
const apiDelRI       = id => apiDel(`${API.REINSPECTION_PLANS}${id}/`);

// ═══════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  if (!message) return null;
  const s  = { success: "bg-emerald-600", error: "bg-red-600", info: "bg-blue-600" };
  const ic = { success: "✅", error: "❌", info: "ℹ️" };
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-4 px-6 py-5 rounded-2xl shadow-2xl max-w-md text-white ${s[type || "info"]}`} style={{ animation: "slideIn .3s ease" }}>
      <span className="text-2xl">{ic[type || "info"]}</span>
      <span className="flex-1 text-base font-bold">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 text-xl">✕</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EMPLOYEE SEARCH
// ═══════════════════════════════════════════════════════════════
function EmployeeSearch({ employees, value, onChange, placeholder }) {
  const [q, setQ]       = useState("");
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Deduplicate employees by id for the search dropdown
  const uniqueEmps = useMemo(() => {
    const seen = new Set();
    return (employees || []).filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true; });
  }, [employees]);

  const filtered = useMemo(() => {
    const list = uniqueEmps;
    if (!q) return list.slice(0, 60);
    const ql = q.toLowerCase();
    return list.filter(e => e.id.toLowerCase().includes(ql) || e.name.toLowerCase().includes(ql)).slice(0, 60);
  }, [uniqueEmps, q]);

  const sel = value ? uniqueEmps.find(e => e.id === value) : null;

  return (
    <div className="relative w-full" ref={ref}>
      <div onClick={() => setOpen(!open)} className={`flex items-center justify-between w-full border-2 rounded-xl px-4 py-3 cursor-pointer min-h-[52px] transition-all ${open ? "border-blue-500 bg-white shadow-md" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
        {sel ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"><span className="text-sm font-black text-blue-700">{sel.name.charAt(0)}</span></div>
            <span className="text-base font-semibold text-slate-900 truncate">{sel.name}</span>
            <span className="text-xs text-blue-600 font-mono bg-blue-50 border border-blue-200 px-2 py-1 rounded flex-shrink-0">{sel.id}</span>
            <button className="text-slate-400 hover:text-red-500 ml-auto" onClick={e => { e.stopPropagation(); onChange(null); setQ(""); }}>✕</button>
          </div>
        ) : <span className="text-slate-400 text-base">{placeholder || "Select employee..."}</span>}
        <svg className="w-5 h-5 text-slate-400 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
      </div>
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <input className="w-full px-4 py-3 text-base border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white" value={q} onChange={e => setQ(e.target.value)} placeholder="Name or ID..." autoFocus />
          </div>
          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0
              ? <div className="p-8 text-center text-slate-400">🔍 No employees found</div>
              : filtered.map(e => (
                <div key={e.id} onClick={() => { onChange(e.id); setOpen(false); setQ(""); }}
                  className={`px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-slate-50 flex items-center gap-3 ${value === e.id ? "bg-blue-50" : ""}`}>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><span className="text-sm font-black text-slate-600">{e.name.charAt(0)}</span></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base text-slate-900">{e.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{e.id}</div>
                  </div>
                  {value === e.id && <span className="text-blue-500">✓</span>}
                </div>
              ))}
          </div>
          <div className="px-4 py-2 bg-slate-50 border-t text-xs text-slate-400 text-center">{filtered.length} of {uniqueEmps.length}</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TEST SEARCH
// ═══════════════════════════════════════════════════════════════
function TestSearch({ tests, value, onChange, employeeId, placeholder }) {
  const [q, setQ]       = useState("");
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = useMemo(() => {
    let list = tests;
    if (employeeId) list = list.filter(t => empId(t) === employeeId);
    if (q) { const ql = q.toLowerCase(); list = list.filter(t => String(t.test_id).includes(ql) || (t.model_name || "").toLowerCase().includes(ql) || (t.test_date || "").includes(ql)); }
    return list.slice(0, 30);
  }, [tests, employeeId, q]);

  const sel = value ? tests.find(t => t.test_id === value) : null;
  const r   = sel ? testResult(sel) : "";

  return (
    <div className="relative w-full" ref={ref}>
      <div onClick={() => setOpen(!open)} className={`flex items-center justify-between w-full border-2 rounded-xl px-4 py-3 cursor-pointer min-h-[52px] transition-all ${open ? "border-blue-500 bg-white shadow-md" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
        {sel ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-base font-semibold truncate">Test #{sel.test_id} · {sel.model_name || "—"}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded ${r === "OK" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{r}</span>
            <button className="text-slate-400 hover:text-red-500 ml-auto" onClick={e => { e.stopPropagation(); onChange(null); setQ(""); }}>✕</button>
          </div>
        ) : <span className="text-slate-400">{placeholder || "Select test..."}</span>}
      </div>
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b bg-slate-50"><input className="w-full px-4 py-3 text-base border border-slate-200 rounded-lg outline-none focus:border-blue-400" value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." autoFocus /></div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0
              ? <div className="p-6 text-center text-slate-400">No tests</div>
              : filtered.map(t => {
                  const tr = testResult(t);
                  return (
                    <div key={t.test_id} onClick={() => { onChange(t.test_id); setOpen(false); setQ(""); }}
                      className={`px-4 py-3 cursor-pointer hover:bg-slate-50 border-b border-slate-50 ${value === t.test_id ? "bg-blue-50" : ""}`}>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">#{t.test_id} · {t.model_name || "—"}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${tr === "OK" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{tr}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{t.test_date} · {empName(t)} · {field(t, "station_name")}</div>
                    </div>
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GRID CELL
// ═══════════════════════════════════════════════════════════════
function TestCell({ result, isPlan, isCarryover, isRI, isRIPlan, isManuallySched, isFuture, isCurMonth, meta, onClick }) {
  const base = `border border-slate-200 text-center align-middle transition-all ${isCurMonth ? "ring-2 ring-inset ring-blue-400" : ""}`;
  const cs   = { width: 48, height: 44, minWidth: 48 };

  if (isFuture && !isPlan && !result) return <td className={`${base} bg-slate-50/60`} style={cs} />;

  if (isPlan && !result) {
    let dot = "bg-blue-400", bg = "bg-blue-50", tip = "🔵 Planned";
    let label = null;
    if (isRIPlan || meta?.isRIPlan) {
      dot = "bg-red-400"; bg = "bg-red-50"; tip = `🔴 Re-Inspection (${meta?.riStatus || "PENDING"})`; label = "RI";
    } else if (isManuallySched || meta?.isManuallySched) {
      dot = "bg-indigo-500"; bg = "bg-indigo-50"; tip = `🗓 Manually Scheduled (${meta?.schedStatus || ""})\nDue: ${meta?.nextDate || ""}`; label = "S";
    } else if (isCarryover || meta?.isCarryover) {
      dot = "bg-orange-400"; bg = "bg-orange-50"; tip = "🟠 Carryover from previous FY";
    }
    return (
      <td className={`${base} ${bg} cursor-help`} title={tip} style={cs}>
        <div className="flex flex-col items-center gap-0.5">
          <div className={`rounded-full w-4 h-4 ${dot}`} />
          {label && <span className={`text-[7px] font-black leading-none ${isRIPlan || meta?.isRIPlan ? "text-red-600" : "text-indigo-600"}`}>{label}</span>}
        </div>
      </td>
    );
  }

  if (!result) return <td className={`${base} bg-white`} style={cs} />;

  const ok = result === "OK";
  const bg = isRI ? "bg-amber-100 hover:bg-amber-200" : ok ? "bg-emerald-100 hover:bg-emerald-200" : "bg-red-100 hover:bg-red-200";
  const tx = isRI ? "text-amber-800" : ok ? "text-emerald-700" : "text-red-700";
  return (
    <td className={`${base} ${bg} cursor-pointer relative group`} onClick={onClick} title={`${result}${isRI ? " (Re-Inspection)" : ""}`} style={cs}>
      <span className={`text-base font-black ${tx}`}>{ok ? "✓" : "✗"}</span>
      {isRI && <sup className="absolute top-0.5 right-1 text-[10px] font-black text-amber-700">R</sup>}
    </td>
  );
}

// ═══════════════════════════════════════════════════════════════
// ★ EMPLOYEE ROW — keyed by rowKey (empId + station)
// ═══════════════════════════════════════════════════════════════
function EmpRows({ emp, idx, visMonths, MONTHS, curMI, rm, planSet, planMeta, onCell, showStationBadge }) {
  const rk = emp.rowKey;

  const empR    = useMemo(() => Object.values(rm).filter(r => r.rowKey === rk), [rm, rk]);
  const total   = empR.length;
  const passed  = empR.filter(r => r.result === "OK").length;
  const rate    = total ? Math.round(passed / total * 100) : null;
  const hasFail = empR.some(r => r.result === "NOT OK");
  const hasRIPlan = useMemo(() => Object.values(planMeta).some(m => m.rowKey === rk && m.isRIPlan), [planMeta, rk]);
  const hasManualSched = useMemo(() => Object.values(planMeta).some(m => m.rowKey === rk && m.isManuallySched), [planMeta, rk]);

  const rc = rate === null ? "" : rate >= 80 ? "bg-emerald-100 text-emerald-700" : rate >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  const bg = hasFail ? "bg-red-50/30" : "bg-white";

  // Accent color for avatar based on station (for visual differentiation when same emp appears in multiple rows)
  const stationColors = ["bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-cyan-100 text-cyan-700", "bg-teal-100 text-teal-700", "bg-indigo-100 text-indigo-700"];
  const colorIdx = emp.station !== "—" ? emp.station.charCodeAt(0) % stationColors.length : 0;
  const avatarCls = hasFail ? "bg-red-100 text-red-700" : hasRIPlan ? "bg-orange-100 text-orange-700" : stationColors[colorIdx];

  return (
    <>
      {/* PLAN ROW */}
      <tr className="hover:bg-slate-50/50">
        <td className={`border border-slate-200 text-center text-sm text-slate-400 font-mono py-3 sticky z-10 ${bg}`}
          rowSpan={2} style={{ left: 0, width: COL_SNO_W, minWidth: COL_SNO_W }}>{idx + 1}</td>

        <td className={`border border-slate-200 px-4 py-3 sticky z-10 ${bg}`}
          rowSpan={2} style={{ left: COL_EMP_LEFT, width: COL_EMP_W, minWidth: COL_EMP_W }}>
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-base font-black mt-0.5 ${avatarCls}`}>
              {emp.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 text-base truncate">{emp.name}</div>
              <div className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded inline-block border border-blue-100 mt-1">{emp.id}</div>

              {/* Station + Level — always shown, this is the row identity */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {emp.station !== "—" && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${showStationBadge ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    📍 {emp.station}
                  </span>
                )}
                {emp.level !== "—" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    🏷 {emp.level}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {rate !== null && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rc}`}>{rate}% ({passed}/{total})</span>}
                {hasRIPlan && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">🔄 RI</span>}
                {hasManualSched && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">📅 Sched</span>}
              </div>
            </div>
          </div>
        </td>

        <td className="border border-slate-200 text-xs font-black text-blue-600 bg-blue-50 text-center px-2 py-2 sticky z-10"
          style={{ left: COL_PA_LEFT, width: COL_PA_W, minWidth: COL_PA_W, boxShadow: "4px 0 8px -4px rgba(0,0,0,.08)" }}>Plan</td>

        {visMonths.map(m => {
          const mi = MONTHS.findIndex(x => x.key === m.key);
          return WEEKS.map(w => {
            const ck  = `${rk}_${m.key}_${w}`;
            const has = planSet.has(ck) && !rm[ck];
            const meta = planMeta[ck];
            return (
              <TestCell key={`p_${ck}`}
                isPlan={has} isCarryover={has && meta?.isCarryover}
                isRIPlan={has && meta?.isRIPlan}
                isManuallySched={has && meta?.isManuallySched}
                meta={meta} isCurMonth={mi === curMI} />
            );
          });
        })}
      </tr>

      {/* ACTUAL ROW */}
      <tr className="hover:bg-slate-50/30">
        <td className="border border-slate-200 text-xs font-black text-violet-600 bg-violet-50 text-center px-2 py-2 sticky z-10"
          style={{ left: COL_PA_LEFT, width: COL_PA_W, minWidth: COL_PA_W, boxShadow: "4px 0 8px -4px rgba(0,0,0,.08)" }}>Actual</td>

        {visMonths.map(m => {
          const mi = MONTHS.findIndex(x => x.key === m.key), future = curMI >= 0 && mi > curMI;
          return WEEKS.map(w => {
            const ck = `${rk}_${m.key}_${w}`, e = rm[ck];
            return (
              <TestCell key={`a_${ck}`} result={e?.result} isRI={e?.isReInspect}
                isFuture={future && !e} isCurMonth={mi === curMI}
                onClick={e ? () => onCell({
                  ...e,
                  empName:     e.empName || emp.name,
                  stationName: e.stationName !== "—" ? e.stationName : emp.station,
                  levelName:   e.levelName   !== "—" ? e.levelName   : emp.level,
                  nextDue:     e.result === "OK" ? addMonths(e.date, 3) : null,
                }) : undefined} />
            );
          });
        })}
      </tr>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// TEST DETAIL MODAL
// ═══════════════════════════════════════════════════════════════
function TestDetailModal({ entry, onClose }) {
  if (!entry) return null;
  const ok = entry.result === "OK";
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: "popIn .2s ease" }}>
        <div className={`p-6 flex items-center gap-5 ${ok ? "bg-gradient-to-br from-emerald-500 to-green-600" : "bg-gradient-to-br from-red-500 to-rose-600"}`}>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black text-white">{ok ? "✓" : "✗"}</div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-xl truncate">{entry.empName}</p>
            <p className="text-white/70 text-sm mt-1">{formatDate(entry.date)} · {entry.monthKey} · {entry.week}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white">{ok ? "PASSED" : "FAILED"}</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
        </div>
        <div className="p-6 divide-y divide-slate-100">
          {[
            ["Test ID", `#${entry.testId}`],
            ["Model",   entry.modelName],
            ["Station", entry.stationName],
            ["Level",   entry.levelName],
            ...(entry.isReInspect ? [["Type", "🔄 Re-Inspection"]] : []),
            ...(entry.nextDue ? [["Next Due", `📅 ${formatDate(entry.nextDue)}`]] : []),
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between items-center py-4">
              <span className="text-xs text-slate-400 uppercase font-bold">{l}</span>
              <span className="text-base font-semibold text-slate-800">{v}</span>
            </div>
          ))}
        </div>
        <div className={`px-6 py-4 text-sm font-semibold text-center ${ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
          {ok ? `✅ Next due: ${formatDate(entry.nextDue)}` : "⚠️ Re-inspection required"}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATS BAR
// ═══════════════════════════════════════════════════════════════
function StatsBar({ fyTests, employees, schedules, reInspections }) {
  const uniqueEmpCount = useMemo(() => new Set(employees.map(e => e.id)).size, [employees]);
  const tot  = fyTests.length;
  const pass = fyTests.filter(t => testResult(t) === "OK").length;
  const fail = tot - pass;
  const rate = tot ? Math.round(pass / tot * 100) : 0;
  const pend = reInspections.filter(r => ["PENDING","SCHEDULED","IN_PROGRESS"].includes(r.status)).length;
  const over = schedules.filter(s => s.status === "OVERDUE").length;
  const manualSched = schedules.filter(s => ["SCHEDULED","DUE_SOON"].includes(s.status)).length;

  const stats = [
    { l: "Employees",       v: uniqueEmpCount,    i: "👥", c: "slate" },
    { l: "Station Rows",    v: employees.length,  i: "📍", c: "indigo" },
    { l: "Tests FY",        v: tot,               i: "📋", c: "blue" },
    { l: "Passed",          v: pass,              i: "✅", c: "emerald" },
    { l: "Failed",          v: fail,              i: "❌", c: "red" },
    { l: "Pass Rate",       v: `${rate}%`,        i: "📊", c: rate >= 80 ? "emerald" : rate >= 60 ? "amber" : "red" },
    { l: "Scheduled",       v: manualSched,       i: "📅", c: manualSched ? "indigo" : "slate" },
    { l: "Re-Inspect",      v: pend,              i: "🔄", c: pend ? "orange" : "slate" },
    { l: "Overdue",         v: over,              i: over ? "🚨" : "✓", c: over ? "red" : "slate" },
  ];
  const cm = {
    slate:   "bg-slate-50 border-slate-200 text-slate-700",
    blue:    "bg-blue-50 border-blue-200 text-blue-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    red:     "bg-red-50 border-red-200 text-red-700",
    amber:   "bg-amber-50 border-amber-200 text-amber-700",
    orange:  "bg-orange-50 border-orange-200 text-orange-700",
    indigo:  "bg-indigo-50 border-indigo-200 text-indigo-700",
  };

  return (
    <div className="flex gap-3 px-8 py-4 bg-white border-b border-slate-200 overflow-x-auto flex-wrap">
      {stats.map((s, i) => (
        <div key={i} className={`flex items-center gap-3 px-5 py-4 rounded-xl border flex-shrink-0 ${cm[s.c]}`}>
          <span className="text-2xl">{s.i}</span>
          <div>
            <div className="text-2xl font-black leading-none font-mono">{s.v}</div>
            <div className="text-xs uppercase tracking-wide font-semibold mt-1 opacity-70">{s.l}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOW IT WORKS
// ═══════════════════════════════════════════════════════════════
function HowItWorks({ onDismiss }) {
  return (
    <div className="mx-8 mt-5 mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-black text-blue-900 uppercase mb-4">📖 How This Tracker Works</p>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            {[{ i: "🧪", t: "Test every 90d" }, { i: "✅", t: "Pass → next in 90d" }, { i: "❌", t: "Fail → training" }, { i: "🔄", t: "Re-test" }].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-slate-300 text-xl">→</span>}
                <div className="bg-white rounded-xl px-4 py-3 border border-blue-100 shadow-sm text-center min-w-[120px]">
                  <div className="text-xl">{s.i}</div><div className="text-xs font-bold text-slate-800 mt-1">{s.t}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Row logic explanation */}
          {/* <div className="bg-white border border-blue-100 rounded-xl p-4 mb-4 text-sm text-slate-700">
            <p className="font-black text-blue-800 mb-2">📍 One Row Per Employee × Station</p>
            <p className="text-xs">Same employee at <strong>Station A</strong> = Row 1. Same employee at <strong>Station B</strong> = Row 2. Their test history is tracked independently per station.</p>
          </div> */}

          <div className="flex items-center gap-4 flex-wrap text-sm text-slate-600">
            {[
              { s: "✓",  b: "bg-emerald-100 text-emerald-700", l: "Pass" },
              { s: "✗",  b: "bg-red-100 text-red-700",         l: "Fail" },
              { s: "R",  b: "bg-amber-100 text-amber-700",     l: "Re-Test" },
              { s: "●",  b: "bg-blue-100 text-blue-600",       l: "Auto Plan" },
              { s: "●",  b: "bg-indigo-100 text-indigo-700",   l: "Scheduled" },
              { s: "●",  b: "bg-orange-100 text-orange-600",   l: "Carryover" },
              { s: "●",  b: "bg-red-100 text-red-600",         l: "RI Plan" },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded font-black text-xs ${l.b}`}>{l.s}</span>
                {l.l}
              </div>
            ))}
          </div>
        </div>
        <button onClick={onDismiss} className="text-blue-400 hover:text-blue-700">✕</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCHEDULE CARD
// ═══════════════════════════════════════════════════════════════
function SchedCard({ item, type, onSchedule, onComplete, onDelete }) {
  const isRI = type === "reinspection";
  const days = isRI ? (item.scheduled_date ? daysFromNow(item.scheduled_date) : null) : daysFromNow(item.next_test_date);
  const ss = {
    SCHEDULED:   { bar: "bg-blue-500",    badge: "bg-blue-50 text-blue-700 border-blue-200",     left: "border-l-blue-500" },
    DUE_SOON:    { bar: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-200",   left: "border-l-amber-500" },
    OVERDUE:     { bar: "bg-red-500",     badge: "bg-red-50 text-red-700 border-red-200",         left: "border-l-red-500" },
    COMPLETED:   { bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", left: "border-l-emerald-500" },
    PENDING:     { bar: "bg-red-500",     badge: "bg-red-50 text-red-700 border-red-200",         left: "border-l-red-400" },
    IN_PROGRESS: { bar: "bg-orange-500",  badge: "bg-orange-50 text-orange-700 border-orange-200", left: "border-l-orange-500" },
  }[item.status] || { bar: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200", left: "border-l-slate-400" };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${ss.left} shadow-sm hover:shadow-md transition overflow-hidden`}>
      <div className={`h-1.5 ${ss.bar} opacity-60`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-black text-slate-600">{(item.employee_name || item.employee_code || "E").charAt(0)}</div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate">{item.employee_name || item.employee_code}</p>
              <p className="text-xs text-blue-600 font-mono mt-0.5">{item.employee_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${ss.badge}`}>{item.status}</span>
            {onDelete && <button onClick={() => onDelete(item)} className="text-slate-300 hover:text-red-500 p-1 text-lg">🗑</button>}
          </div>
        </div>
        <div className="space-y-2 mb-4">
          {[
            ["📍", "Station", item.station_name || "—"],
            ["🏷",  "Level",   item.level_name   || "—"],
            ...(isRI
              ? [
                  ["❌", "Failed",    formatDate(item.failed_date)],
                  ["📊", "Score",     `${parseFloat(item.failed_score || 0).toFixed(1)}%`],
                  ...(item.scheduled_date ? [["📅", "Scheduled", formatDate(item.scheduled_date)]] : []),
                ]
              : [
                  ["✅", "Last Test", formatDate(item.last_test_date)],
                  ["📅", "Next Due",  formatDate(item.next_test_date)],
                  ...(item.days_remaining != null ? [["⏳", "Days Left", `${item.days_remaining}d`]] : []),
                ]),
          ].map(([ic, l, v]) => (
            <div key={l} className="flex justify-between text-sm">
              <span className="text-slate-400">{ic} {l}</span>
              <span className="font-semibold text-slate-700 font-mono truncate max-w-[160px]">{v}</span>
            </div>
          ))}
        </div>
        {days !== null && (
          <div className={`text-center py-3 rounded-xl text-sm font-bold ${days < 0 ? "bg-red-100 text-red-700" : days <= 7 ? "bg-orange-100 text-orange-700" : days <= 30 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
            {days < 0 ? `🚨 ${Math.abs(days)}d OVERDUE` : days === 0 ? "⚡ TODAY!" : `⏳ ${days}d remaining`}
          </div>
        )}
        {item.notes && <p className="text-xs text-slate-400 mt-3 italic border-t pt-3">💬 {item.notes}</p>}
      </div>
      {(isRI || (!isRI && ["OVERDUE","DUE_SOON"].includes(item.status))) && (
        <div className="border-t p-4 flex gap-3 bg-slate-50">
          {isRI && item.status === "PENDING" && <button onClick={() => onSchedule(item)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-sm">📅 Schedule</button>}
          {/* {isRI && ["SCHEDULED","IN_PROGRESS"].includes(item.status) && <button onClick={() => onComplete(item)} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-sm">✅ Complete</button>} */}
          {/* {!isRI && ["OVERDUE","DUE_SOON"].includes(item.status) && <button className="flex-1 py-3 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 shadow-sm">📝 Create Test</button>} */}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MODAL: ADD SCHEDULE (first-time or recurring)
// ═══════════════════════════════════════════════════════════════
function AddSchedModal({ onClose, onSubmit, employees, stations, levels, allTests }) {
  const [f, setF] = useState({ emp: null, sta: "", lev: "", test: null, lastD: todayStr(), nextD: addMonths(todayStr(), 3), notes: "", isFirstTime: false });
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState(null);

  const s = (k, v) => setF(p => {
    const n = { ...p, [k]: v };
    if (k === "lastD" && v) n.nextD = addMonths(v, 3);
    if (k === "test" && v) {
      const t = allTests.find(x => x.test_id === v);
      if (t) { n.lastD = t.test_date; n.nextD = addMonths(t.test_date, 3); }
    }
    if (k === "isFirstTime" && v) {
      // First-timer: no reference test needed, just pick a planned date
      n.test = null;
    }
    return n;
  });

  const passTests = useMemo(() => allTests.filter(t => (!f.emp || empId(t) === f.emp) && testResult(t) === "OK"), [allTests, f.emp]);

  const go = async () => {
    if (!f.emp)  { setErr("Select employee"); return; }
    if (!f.sta)  { setErr("Select station");  return; }
    if (!f.lev)  { setErr("Select level");    return; }
    if (!f.isFirstTime && !f.test) { setErr("Select a reference test (or tick 'First-time scheduling')"); return; }

    setBusy(true); setErr(null);
    try {
      const payload = {
        employee:       f.emp,
        station:        parseInt(f.sta),
        level:          parseInt(f.lev),
        last_test_date: f.isFirstTime ? null : f.lastD,
        next_test_date: f.nextD,
        status:         "SCHEDULED",
        notes:          f.notes,
        ...(f.isFirstTime ? {} : { last_test: f.test }),
      };
      await apiCreateSched(payload);
      onSubmit(f.isFirstTime ? "📅 First-time schedule created! Indigo dot now visible on tracker." : "✅ Schedule created! Blue/Indigo dot on tracker.");
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: "popIn .2s ease" }}>
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="font-black text-white text-xl">📅 Create Schedule</h2>
          <p className="text-blue-200 text-sm mt-1">Test every 90 days · Appears as indigo dot on tracker</p>
        </div>
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* First-time toggle */}
          <div className={`rounded-xl p-4 border-2 cursor-pointer transition ${f.isFirstTime ? "bg-amber-50 border-amber-400" : "bg-slate-50 border-slate-200 hover:border-slate-300"}`} onClick={() => s("isFirstTime", !f.isFirstTime)}>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${f.isFirstTime ? "bg-amber-500 border-amber-500" : "border-slate-300"}`}>
                {f.isFirstTime && <span className="text-white text-xs font-black">✓</span>}
              </div>
              <div>
                <p className="font-bold text-slate-900">First-time scheduling (no prior test)</p>
                <p className="text-xs text-slate-500 mt-0.5">Employee has never taken the poison test — plan their first test date</p>
              </div>
            </div>
          </div>

          <div><label className="block text-sm font-bold text-slate-600 uppercase mb-2">Employee *</label><EmployeeSearch employees={employees} value={f.emp} onChange={v => s("emp", v)} /></div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 uppercase mb-2">Station *</label>
              <select className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-400" value={f.sta} onChange={e => s("sta", e.target.value)}>
                <option value="">Select...</option>
                {stations.map(st => <option key={st.station_id || st.id} value={st.station_id || st.id}>{st.station_name || st.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 uppercase mb-2">Level *</label>
              <select className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-400" value={f.lev} onChange={e => s("lev", e.target.value)}>
                <option value="">Select...</option>
                {levels.map(l => <option key={l.level_id || l.id} value={l.level_id || l.id}>{l.level_name || l.name}</option>)}
              </select>
            </div>
          </div>

          {!f.isFirstTime && (
            <div>
              <label className="block text-sm font-bold text-slate-600 uppercase mb-2">Reference Test (Pass) *</label>
              <TestSearch tests={passTests} value={f.test} onChange={v => s("test", v)} employeeId={f.emp} placeholder="Select last passing test..." />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {!f.isFirstTime && (
              <div>
                <label className="block text-sm font-bold text-slate-600 uppercase mb-2">Last Test Date</label>
                <input type="date" className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-400" value={f.lastD} onChange={e => s("lastD", e.target.value)} />
              </div>
            )}
            <div className={f.isFirstTime ? "col-span-2" : ""}>
              <label className="block text-sm font-bold text-slate-600 uppercase mb-2">{f.isFirstTime ? "Planned First Test Date *" : "Next Due"}</label>
              <input type="date" className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 font-bold bg-blue-50 outline-none focus:border-blue-500" value={f.nextD} onChange={e => s("nextD", e.target.value)} min={f.isFirstTime ? todayStr() : undefined} />
            </div>
          </div>

          {f.isFirstTime && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              ⚠ <strong>First-timer:</strong> An indigo 🗓 dot will appear on the tracker at the planned date. Once they pass, the 90-day auto-cycle will begin.
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-600 uppercase mb-2">Notes</label>
            <textarea className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 resize-none" rows={2} value={f.notes} onChange={e => s("notes", e.target.value)} />
          </div>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">⚠ {err}</div>}
        </div>
        <div className="p-5 border-t flex justify-end gap-4 bg-slate-50">
          <button onClick={onClose} className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100">Cancel</button>
          <button onClick={go} disabled={busy} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700 disabled:opacity-50">{busy ? "Creating..." : "Create"}</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MODAL: ADD RE-INSPECTION
// ═══════════════════════════════════════════════════════════════
function AddRIModal({ onClose, onSubmit, employees, stations, levels, allTests }) {
  const [f, setF]     = useState({ emp: null, sta: "", lev: "", test: null, failD: todayStr(), score: "0", schedD: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState(null);

  const s = (k, v) => setF(p => {
    const n = { ...p, [k]: v };
    if (k === "test" && v) { const t = allTests.find(x => x.test_id === v); if (t) n.failD = t.test_date; }
    return n;
  });
  const failTests = useMemo(() => allTests.filter(t => (!f.emp || empId(t) === f.emp) && testResult(t) === "NOT OK"), [allTests, f.emp]);

  const go = async () => {
    if (!f.emp)  { setErr("Select employee"); return; }
    if (!f.sta)  { setErr("Select station");  return; }
    if (!f.lev)  { setErr("Select level");    return; }
    if (!f.test) { setErr("Select failed test"); return; }
    setBusy(true); setErr(null);
    try {
      await apiCreateRI({ employee: f.emp, station: parseInt(f.sta), level: parseInt(f.lev), failed_test: f.test, failed_date: f.failD, failed_score: parseFloat(f.score) || 0, scheduled_date: f.schedD || null, status: f.schedD ? "SCHEDULED" : "PENDING", notes: f.notes });
      onSubmit("🔄 Re-Inspection created! Red RI dot visible on tracker.");
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: "popIn .2s ease" }}>
        <div className="p-6 bg-gradient-to-r from-red-500 to-rose-600"><h2 className="font-black text-white text-xl">🔄 Create Re-Inspection</h2><p className="text-red-200 text-sm mt-1">Failed employee needs retesting</p></div>
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-bold mb-1">What happens:</p>
            <p>• A <span className="font-bold text-red-600">red RI dot</span> appears on the tracker grid</p>
            <p>• Employee shows in Schedule → Re-Inspections tab</p>
            <p>• After passing re-test → 90-day cycle resumes</p>
          </div>
          <div><label className="block text-sm font-bold text-slate-600 uppercase mb-2">Employee *</label><EmployeeSearch employees={employees} value={f.emp} onChange={v => s("emp", v)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-slate-600 uppercase mb-2">Station *</label><select className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-red-400" value={f.sta} onChange={e => s("sta", e.target.value)}><option value="">Select...</option>{stations.map(st => <option key={st.station_id || st.id} value={st.station_id || st.id}>{st.station_name || st.name}</option>)}</select></div>
            <div><label className="block text-sm font-bold text-slate-600 uppercase mb-2">Level *</label><select className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-red-400" value={f.lev} onChange={e => s("lev", e.target.value)}><option value="">Select...</option>{levels.map(l => <option key={l.level_id || l.id} value={l.level_id || l.id}>{l.level_name || l.name}</option>)}</select></div>
          </div>
          <div><label className="block text-sm font-bold text-slate-600 uppercase mb-2">Failed Test *</label><TestSearch tests={failTests} value={f.test} onChange={v => s("test", v)} employeeId={f.emp} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-bold text-slate-600 uppercase mb-2">Failed Date</label><input type="date" className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none" value={f.failD} onChange={e => s("failD", e.target.value)} /></div>
            <div><label className="block text-sm font-bold text-slate-600 uppercase mb-2">Score %</label><input type="number" className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none" value={f.score} onChange={e => s("score", e.target.value)} min="0" max="100" /></div>
            <div><label className="block text-sm font-bold text-slate-600 uppercase mb-2">Retest Date</label><input type="date" className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none" value={f.schedD} onChange={e => s("schedD", e.target.value)} min={todayStr()} /></div>
          </div>
          <div><label className="block text-sm font-bold text-slate-600 uppercase mb-2">Notes</label><textarea className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 resize-none" rows={2} value={f.notes} onChange={e => s("notes", e.target.value)} /></div>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">⚠ {err}</div>}
        </div>
        <div className="p-5 border-t flex justify-end gap-4 bg-slate-50">
          <button onClick={onClose} className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100">Cancel</button>
          <button onClick={go} disabled={busy} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow hover:bg-red-700 disabled:opacity-50">{busy ? "Creating..." : "Create"}</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MODAL: SCHEDULE DATE
// ═══════════════════════════════════════════════════════════════
function SchedDateModal({ plan, onClose, onSubmit }) {
  const [date, setDate]   = useState(plan?.scheduled_date || "");
  const [notes, setNotes] = useState(plan?.notes || "");
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState(null);
  const go = async () => {
    if (!date) { setErr("Select date"); return; }
    setBusy(true); setErr(null);
    try { await apiScheduleRI(plan.plan_id, date, notes); onSubmit("📅 Scheduled! Red RI dot updated on tracker."); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600"><h2 className="font-black text-white text-xl">📅 Schedule Re-Inspection</h2><p className="text-blue-200 text-sm mt-1">{plan.employee_name || plan.employee_code}</p></div>
        <div className="p-6 space-y-5">
          <div><label className="block text-sm font-bold text-slate-600 uppercase mb-2">Date *</label><input type="date" className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-400" value={date} onChange={e => setDate(e.target.value)} min={todayStr()} /></div>
          <div><label className="block text-sm font-bold text-slate-600 uppercase mb-2">Notes</label><textarea className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 resize-none" rows={2} value={notes} onChange={e => setNotes(e.target.value)} /></div>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">⚠ {err}</div>}
        </div>
        <div className="p-5 border-t flex justify-end gap-4 bg-slate-50">
          <button onClick={onClose} className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold">Cancel</button>
          <button onClick={go} disabled={busy} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow disabled:opacity-50">{busy ? "Saving..." : "Confirm"}</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MODAL: COMPLETE RI
// ═══════════════════════════════════════════════════════════════
function CompleteModal({ plan, onClose, onSubmit, allTests }) {
  const [tid, setTid]     = useState(null);
  const [manual, setManual] = useState("");
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState(null);
  const eid        = normalizeId(plan.employee_code || plan.employee);
  const passTests  = useMemo(() => (allTests || []).filter(t => empId(t) === eid && testResult(t) === "OK"), [allTests, eid]);
  const go = async () => {
    const fid = tid || (manual ? parseInt(manual) : null);
    if (!fid) { setErr("Select/enter test"); return; }
    setBusy(true); setErr(null);
    try { await apiCompleteRI(plan.plan_id, fid); onSubmit("✅ Completed! RI dot removed, cycle resumes."); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 bg-gradient-to-r from-emerald-500 to-green-600"><h2 className="font-black text-white text-xl">✅ Complete Re-Inspection</h2><p className="text-emerald-200 text-sm mt-1">{plan.employee_name || plan.employee_code}</p></div>
        <div className="p-6 space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800"><p className="font-bold mb-1">After completing:</p><p>• Red RI dot removed from tracker</p><p>• 90-day cycle resumes from pass date</p></div>
          <div>
            <label className="block text-sm font-bold text-slate-600 uppercase mb-2">Passing Test *</label>
            {passTests.length > 0
              ? <TestSearch tests={passTests} value={tid} onChange={v => { setTid(v); setManual(""); }} employeeId={eid} placeholder="Select passing test..." />
              : <><input type="number" className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none" value={manual} onChange={e => setManual(e.target.value)} placeholder="Test ID" /><p className="text-xs text-amber-600 mt-1">⚠ No passing tests found. Enter ID manually.</p></>}
          </div>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">⚠ {err}</div>}
        </div>
        <div className="p-5 border-t flex justify-end gap-4 bg-slate-50">
          <button onClick={onClose} className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold">Cancel</button>
          <button onClick={go} disabled={busy} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow disabled:opacity-50">{busy ? "Saving..." : "Complete"}</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCHEDULE PAGE
// ═══════════════════════════════════════════════════════════════
function SchedulePage({ schedules, reInspections, onRefresh, loading, employees, allEmployees, stations, levels, allTests, onToast }) {
  const [tab, setTab]         = useState("all");
  const [search, setSearch]   = useState("");
  const [schedModal, setSchedModal] = useState(null);
  const [compModal, setCompModal]   = useState(null);
  const [addSch, setAddSch]   = useState(false);
  const [addRI, setAddRI]     = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const addRef = useRef(null);
  useEffect(() => {
    const h = e => { if (addRef.current && !addRef.current.contains(e.target)) setAddOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const pendRI = reInspections.filter(r => ["PENDING","SCHEDULED","IN_PROGRESS"].includes(r.status));
  const doneRI = reInspections.filter(r => r.status === "COMPLETED");
  const over   = schedules.filter(s => s.status === "OVERDUE");
  const due    = schedules.filter(s => s.status === "DUE_SOON");
  const active = schedules.filter(s => ["SCHEDULED","DUE_SOON","OVERDUE"].includes(s.status));

  const tabs = [
    { k: "all",      l: "All Active",      n: active.length,  i: "📋" },
    { k: "due",      l: "Due Soon",        n: due.length,     i: "⏰" },
    { k: "overdue",  l: "Overdue",         n: over.length,    i: "🚨" },
    { k: "ri",       l: "Re-Inspections",  n: pendRI.length,  i: "🔄" },
    { k: "done",     l: "Completed RI",    n: doneRI.length,  i: "✅" },
  ];
  const raw      = ({ all: active, due, overdue: over, ri: pendRI, done: doneRI })[tab] || [];
  const isRI     = ["ri","done"].includes(tab);
  const filtered = search ? raw.filter(i => (i.employee_name || i.employee_code || "").toLowerCase().includes(search.toLowerCase())) : raw;

  const ok = msg => { setSchedModal(null); setCompModal(null); setAddSch(false); setAddRI(false); onToast(msg, "success"); onRefresh(); };
  const del = async item => {
    if (!confirm("Delete?")) return;
    try { item.plan_id ? await apiDelRI(item.plan_id) : await apiDelSched(item.schedule_id); onToast("Deleted", "success"); onRefresh(); }
    catch (e) { onToast(e.message, "error"); }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Explainer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <p className="text-sm font-black text-slate-700 uppercase mb-4">📋 Schedule ↔ Tracker Connection</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { i: "📅", t: "Add Schedule (Recurring)", d: "→ Indigo dots on tracker" },
            { i: "🆕", t: "First-Time Schedule",      d: "→ New employee row + indigo dot" },
            { i: "🔄", t: "Add Re-Inspection",         d: "→ Red RI dots on tracker" },
            { i: "✅", t: "Complete RI",                d: "→ Removes dot, cycle resumes" },
          ].map(x => (
            <div key={x.t} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="text-2xl mb-2">{x.i}</div>
              <div className="font-bold text-slate-800">{x.t}</div>
              <div className="text-xs text-slate-400 mt-1">{x.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {tabs.map(t => (
              <button key={t.k} onClick={() => setTab(t.k)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${tab === t.k ? "bg-blue-600 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {t.i} {t.l}{t.n > 0 && <span className={`px-2 py-0.5 rounded-full text-xs font-black ${tab === t.k ? "bg-white/30 text-white" : "bg-slate-300 text-slate-600"}`}>{t.n}</span>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-400 w-52 bg-slate-50" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="relative" ref={addRef}>
              <button onClick={() => setAddOpen(!addOpen)} className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow hover:bg-emerald-700">＋ Add</button>
              {addOpen && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 min-w-[300px] overflow-hidden">
                  <button onClick={() => { setAddSch(true); setAddOpen(false); }} className="w-full flex items-start gap-4 p-5 hover:bg-slate-50 border-b text-left">
                    <span className="text-3xl">📅</span>
                    <div><div className="font-bold">New Schedule</div><div className="text-xs text-slate-400 mt-1">Recurring OR first-time — indigo dot on tracker</div></div>
                  </button>
                  <button onClick={() => { setAddRI(true); setAddOpen(false); }} className="w-full flex items-start gap-4 p-5 hover:bg-slate-50 text-left">
                    <span className="text-3xl">🔄</span>
                    <div><div className="font-bold">New Re-Inspection</div><div className="text-xs text-slate-400 mt-1">Red RI dots on tracker</div></div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading
          ? <div className="flex items-center justify-center p-20 gap-4 text-slate-400"><div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" /><span>Loading...</span></div>
          : filtered.length === 0
            ? <div className="text-center py-20"><div className="text-6xl mb-4">{tab === "overdue" ? "🎉" : "📭"}</div><p className="font-bold text-xl text-slate-700">{tab === "overdue" ? "All clear!" : "No records"}</p></div>
            : <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map(i => <SchedCard key={isRI ? i.plan_id : i.schedule_id} item={i} type={isRI ? "reinspection" : "schedule"} onSchedule={setSchedModal} onComplete={setCompModal} onDelete={del} />)}</div>}
      </div>

      {schedModal && <SchedDateModal plan={schedModal} onClose={() => setSchedModal(null)} onSubmit={ok} />}
      {compModal  && <CompleteModal  plan={compModal}  onClose={() => setCompModal(null)}  onSubmit={ok} allTests={allTests} />}
      {addSch && <AddSchedModal onClose={() => setAddSch(false)} onSubmit={ok} employees={allEmployees.length ? allEmployees : employees} stations={stations} levels={levels} allTests={allTests} />}
      {addRI  && <AddRIModal    onClose={() => setAddRI(false)}  onSubmit={ok} employees={allEmployees.length ? allEmployees : employees} stations={stations} levels={levels} allTests={allTests} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PENDING RI STRIP
// ═══════════════════════════════════════════════════════════════
function PendingStrip({ plans }) {
  const p = plans.filter(p => ["PENDING","SCHEDULED","IN_PROGRESS"].includes(p.status));
  if (!p.length) return null;
  return (
    <div className="bg-orange-50 border-b border-orange-200 px-8 py-3">
      <div className="flex items-center gap-4 overflow-x-auto">
        <span className="text-xs font-black text-orange-700 uppercase flex-shrink-0">⚠ {p.length} Re-Inspection{p.length > 1 ? "s" : ""}</span>
        {p.map(x => (
          <div key={x.plan_id} className="flex-shrink-0 bg-white border border-orange-200 rounded-xl px-4 py-2 flex items-center gap-3">
            <span className="text-sm font-bold text-slate-900">{x.employee_name || x.employee_code}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${x.status === "PENDING" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{x.status}</span>
            {x.scheduled_date && <span className="text-xs text-slate-500 font-mono">{formatDate(x.scheduled_date)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ★ MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function PoisonTestPlanTracker() {
  const [fy, setFy]           = useState(() => getFYStartYear());
  const [view, setView]       = useState("tracker");
  const [showHelp, setShowHelp] = useState(true);
  const fys    = useMemo(() => getAvailableFYs(), []);
  const MONTHS = useMemo(() => buildMonthsForFY(fy), [fy]);

  const { allTests, fyTests, schedules, reInspections, stations, levels, allEmployees, loading, error, refetch, syncedAt } = useTrackerData(fy);

  const [search, setSearch]       = useState("");
  const [monthF, setMonthF]       = useState("ALL");
  const [stationF, setStationF]   = useState("ALL");
  const [failOnly, setFailOnly]   = useState(false);
  const [modal, setModal]         = useState(null);
  const [toast, setToast]         = useState({ message: "", type: "" });
  const onToast = useCallback((m, t = "info") => setToast({ message: m, type: t }), []);
  useEffect(() => { setMonthF("ALL"); setStationF("ALL"); }, [fy]);

  const now   = new Date();
  const curMI = MONTHS.findIndex(m => m.year === now.getFullYear() && m.month === now.getMonth());

  const fyMonthSet = useMemo(() => {
    const s = new Set();
    MONTHS.forEach(m => s.add(`${m.year}-${String(m.month).padStart(2, "0")}`));
    return s;
  }, [MONTHS]);

  const fyFilteredTests = useMemo(() =>
    allTests.filter(t => {
      const d = new Date(t.test_date);
      return fyMonthSet.has(`${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`);
    }),
  [allTests, fyMonthSet]);

  const rm = useMemo(() => buildResultMap(fyFilteredTests, MONTHS, reInspections), [fyFilteredTests, MONTHS, reInspections]);
  const { planSet, planMeta } = useMemo(() => buildPlanSet(allTests, MONTHS, rm, reInspections, schedules), [allTests, MONTHS, rm, reInspections, schedules]);

  // ★ employees keyed by (empId + station) — multi-station = multi-row
  const employees = useMemo(() => deriveEmployees(allTests, schedules, reInspections), [allTests, schedules, reInspections]);

  // Unique station list for filter dropdown
  const stationsList = useMemo(() => {
    const s = new Set(employees.map(e => e.station).filter(st => st !== "—"));
    return ["ALL", ...Array.from(s).sort()];
  }, [employees]);

  const visMonths = monthF === "ALL" ? MONTHS : MONTHS.filter(m => m.key === monthF);

  const filteredEmps = useMemo(() => {
    let list = employees;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q));
    }
    if (stationF !== "ALL") list = list.filter(e => e.station === stationF);
    if (failOnly) list = list.filter(e => Object.values(rm).some(r => r.rowKey === e.rowKey && r.result === "NOT OK"));
    return list;
  }, [employees, search, stationF, failOnly, rm]);

  // Detect employees who appear in >1 station row (for visual differentiation)
  const multiStationEmps = useMemo(() => {
    const counts = {};
    employees.forEach(e => { counts[e.id] = (counts[e.id] || 0) + 1; });
    return new Set(Object.entries(counts).filter(([, n]) => n > 1).map(([id]) => id));
  }, [employees]);

  const pendRI   = reInspections.filter(p => ["PENDING","SCHEDULED","IN_PROGRESS"].includes(p.status));
  const overdueN = schedules.filter(s => s.status === "OVERDUE").length;
  const carryN   = useMemo(() => Object.values(planMeta).filter(m => m.isCarryover).length, [planMeta]);
  const riPlanN  = useMemo(() => Object.values(planMeta).filter(m => m.isRIPlan).length, [planMeta]);
  const manualN  = useMemo(() => Object.values(planMeta).filter(m => m.isManuallySched).length, [planMeta]);
  const isCurFY  = fy === getFYStartYear();

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform: translateX(80px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        @keyframes popIn   { from { transform: scale(.92); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        ::-webkit-scrollbar { height: 8px; width: 6px }
        ::-webkit-scrollbar-track { background: #f1f5f9 }
        ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 4px }
        ::-webkit-scrollbar-thumb:hover { background: #64748b }
      `}</style>

      <div className="min-h-screen bg-slate-50">
        {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "" })} />}

        {/* HEADER */}
        <header className="bg-white border-b-4 border-blue-600 shadow-lg sticky top-0 z-50">
          <div className="px-8 py-5 flex items-start justify-between gap-5 flex-wrap">
            <div>
              {/* <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg mb-3 text-xs font-black uppercase tracking-widest">F/QA/104 · Quality</div> */}
              <h1 className="text-3xl font-black text-slate-900">POISON TEST PLAN<span className="text-slate-400 font-normal text-lg ml-3">FY {fyLabel(fy)}</span></h1>
              <p className="text-xs text-slate-400 mt-1 font-mono">3-Month Cycle · One row per Employee × Station</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                {[{ k: "tracker", l: "Tracker", i: "⊞" }, { k: "schedule", l: "Schedule", i: "📅", badge: pendRI.length + overdueN }].map(v => (
                  <button key={v.k} onClick={() => setView(v.k)} className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition ${view === v.k ? "bg-white text-blue-700 shadow border border-slate-200" : "text-slate-500 hover:text-slate-800"}`}>
                    <span>{v.i}</span>{v.l}
                    {v.badge > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">{v.badge}</span>}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                {fys.map(y => (
                  <button key={y} onClick={() => setFy(y)} className={`relative px-4 py-2 rounded-lg text-xs font-black font-mono transition ${y === fy ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}>
                    {fyShort(y)}
                    {y === getFYStartYear() && <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${y === fy ? "bg-white" : "bg-emerald-400"}`} />}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {syncedAt && <span className="text-xs text-emerald-600 font-mono">✓ {syncedAt.toLocaleTimeString()}</span>}
                <button onClick={refetch} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-blue-700">
                  <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                  {loading ? "Syncing…" : "Refresh"}
                </button>
              </div>
            </div>
          </div>

          {!isCurFY && (
            <div className="bg-amber-50 border-t border-amber-200 px-8 py-3 flex items-center justify-between">
              <span className="text-sm text-amber-800">📅 {fy > getFYStartYear() ? "Future" : "Past"} FY</span>
              <button onClick={() => setFy(getFYStartYear())} className="text-sm text-amber-700 font-bold underline">Current →</button>
            </div>
          )}

          {(carryN > 0 || riPlanN > 0 || manualN > 0) && view === "tracker" && (
            <div className="bg-orange-50 border-t border-orange-200 px-8 py-3 flex items-center gap-6 flex-wrap">
              {carryN  > 0 && <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-400" /><span className="text-xs text-orange-800 font-semibold">{carryN} carryover</span></div>}
              {riPlanN > 0 && <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400" /><span className="text-xs text-red-800 font-semibold">{riPlanN} RI plan{riPlanN > 1 ? "s" : ""}</span></div>}
              {manualN > 0 && <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500" /><span className="text-xs text-indigo-800 font-semibold">{manualN} manually scheduled (incl. first-timers)</span></div>}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-t border-red-200 px-8 py-3 flex items-center justify-between">
              <span className="text-sm text-red-700">⚠ {error}</span>
              <button onClick={refetch} className="text-sm text-red-700 font-bold underline">Retry</button>
            </div>
          )}
        </header>

        <StatsBar fyTests={fyTests} employees={employees} schedules={schedules} reInspections={reInspections} />
        {pendRI.length > 0 && view === "tracker" && <PendingStrip plans={reInspections} />}

        {/* TRACKER VIEW */}
        {view === "tracker" && (
          <>
            {showHelp && <HowItWorks onDismiss={() => setShowHelp(false)} />}

            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <input className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-400 bg-slate-50 w-56" placeholder="🔍 Name or ID…" value={search} onChange={e => setSearch(e.target.value)} />
                <select className="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-slate-50" value={monthF} onChange={e => setMonthF(e.target.value)}>
                  <option value="ALL">All 12 Months</option>
                  {MONTHS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                </select>
                {stationsList.length > 2 && (
                  <select className="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-slate-50" value={stationF} onChange={e => setStationF(e.target.value)}>
                    {stationsList.map(s => <option key={s} value={s}>{s === "ALL" ? "All Stations" : s}</option>)}
                  </select>
                )}
                <button onClick={() => setFailOnly(!failOnly)} className={`px-4 py-3 rounded-xl text-sm font-bold border transition ${failOnly ? "bg-red-50 border-red-300 text-red-700" : "border-slate-200 text-slate-600 hover:border-red-300"}`}>
                  {failOnly ? "✕ All" : "⚡ Failures"}
                </button>
                {!showHelp && <button onClick={() => setShowHelp(true)} className="px-4 py-3 rounded-xl text-sm font-bold border border-slate-200 text-slate-500 hover:text-blue-600">❓</button>}
              </div>
              <button onClick={() => setView("schedule")} className="relative flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow hover:bg-blue-700">
                📅 Schedules
                {pendRI.length + overdueN > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">{pendRI.length + overdueN}</span>}
              </button>
            </div>

            {loading
              ? <div className="flex flex-col items-center justify-center py-28 gap-4 text-slate-400"><div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" /><span>Loading…</span></div>
              : filteredEmps.length === 0
                ? <div className="text-center py-28 text-slate-400"><div className="text-6xl mb-4">🔍</div><p className="font-semibold text-xl">{employees.length === 0 ? "No records" : "No matches"}</p></div>
                : (
                  <div className="p-8">
                    <div className="text-sm text-slate-500 mb-3 font-mono">
                      {filteredEmps.length} rows ({new Set(filteredEmps.map(e => e.id)).size} employees)
                      {multiStationEmps.size > 0 && <span className="ml-2 text-indigo-600">· {multiStationEmps.size} employee{multiStationEmps.size > 1 ? "s" : ""} on multiple stations</span>}
                      <span className="text-slate-400 ml-3">← Scroll →</span>
                    </div>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl shadow bg-white">
                      <table className="border-collapse text-sm" style={{ minWidth: COL_SNO_W + COL_EMP_W + COL_PA_W + visMonths.length * 4 * 48 + 20 }}>
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-200 text-center text-xs font-black text-slate-400 uppercase py-4 bg-slate-100 sticky z-30" rowSpan={2} style={{ left: 0, width: COL_SNO_W, minWidth: COL_SNO_W }}>#</th>
                            <th className="border border-slate-200 text-left px-4 text-xs font-black text-slate-400 uppercase py-4 bg-slate-100 sticky z-30" rowSpan={2} style={{ left: COL_EMP_LEFT, width: COL_EMP_W, minWidth: COL_EMP_W }}>Employee · Station</th>
                            <th className="border border-slate-200 text-center text-xs font-black text-slate-400 uppercase py-4 px-2 bg-slate-100 sticky z-30" rowSpan={2} style={{ left: COL_PA_LEFT, width: COL_PA_W, minWidth: COL_PA_W, boxShadow: "4px 0 8px -4px rgba(0,0,0,.1)" }}>Plan/<br />Actual</th>
                            {visMonths.map((m, mi) => {
                              const mI = MONTHS.findIndex(x => x.key === m.key);
                              return <th key={m.key} colSpan={4} className={`border border-slate-200 text-center text-sm font-black py-3 ${mI === curMI ? "bg-blue-600 text-white" : mi % 2 === 0 ? "bg-white text-slate-600" : "bg-slate-50 text-slate-600"}`}>{m.label}</th>;
                            })}
                          </tr>
                          <tr>
                            {visMonths.map((m, mi) => {
                              const mI = MONTHS.findIndex(x => x.key === m.key);
                              return WEEKS.map(w => (
                                <th key={`${m.key}_${w}`} className={`border border-slate-200 text-center text-xs font-bold py-2.5 ${mI === curMI ? "bg-blue-50 text-blue-600" : mi % 2 === 0 ? "bg-white text-slate-400" : "bg-slate-50 text-slate-400"}`} style={{ width: 48, minWidth: 48 }}>{w}</th>
                              ));
                            })}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredEmps.map((e, i) => (
                            <EmpRows
                              key={e.rowKey}
                              emp={e}
                              idx={i}
                              visMonths={visMonths}
                              MONTHS={MONTHS}
                              curMI={curMI}
                              rm={rm}
                              planSet={planSet}
                              planMeta={planMeta}
                              onCell={setModal}
                              showStationBadge={multiStationEmps.has(e.id)}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
          </>
        )}

        {/* SCHEDULE VIEW */}
        {view === "schedule" && (
          <SchedulePage
            schedules={schedules}
            reInspections={reInspections}
            onRefresh={refetch}
            loading={loading}
            employees={employees}
            allEmployees={allEmployees}
            stations={stations}
            levels={levels}
            allTests={allTests}
            onToast={onToast}
          />
        )}

        <TestDetailModal entry={modal} onClose={() => setModal(null)} />
        <footer className="text-center text-xs text-slate-300 py-8 font-mono">POISON TEST PLAN · FY {fyLabel(fy)} · F/QA/104 · REV. 00</footer>
      </div>
    </>
  );
}