

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package, Plus, XCircle, AlertTriangle, CheckCircle,
  ArrowLeft, User, Building2, MapPin, Target,
  ShieldCheck, ShieldX, FileText, PlusCircle, Eye,
  Calendar, Clock, RefreshCw, Award, Hash, Layers,
  BarChart3, Info, Trash2, ArrowRight, History,
  Timer, BookOpen, ChevronDown, ChevronRight, Edit3,
  TrendingUp, Star, Zap, CircleCheck, CircleX, AlertCircle,
  Sparkles, CheckSquare, XSquare, ClipboardList, Search,
  ScanLine, FlaskConical, Pencil, Save, X, Link, ExternalLink,
  Bell, ClipboardCheck
} from 'lucide-react';
import { API_ENDPOINTS } from '../../constants/api';

/* ─── TYPES ─────────────────────────────────────────── */
interface LocationState {
  stationId?: number; stationName?: string;
  sublineId?: number; sublineName?: string;
  lineId?: number; lineName?: string;
  departmentId?: number; departmentName?: string;
  levelId?: number; levelName?: string;
  employeeId?: string; employeeName?: string;
}

interface DefectCategory {
  category_id: number;
  category_name: string;
  defect_types: DefectType[];
}

interface DefectType {
  defect_type_id: number;
  defect_name: string;
}

interface PlantedDefect {
  defect_category: number;
  defect_type: number;
  quantity: string;
}

interface SavedTest {
  test_id: number;
  test_date: string;
  model_name: string;
  total_parts_before: number;
  ok_parts_before: number;
  reject_parts_before: number;
  ok_parts_after: number;
  reject_parts_after: number;
  test_judgment: string;
  test_result?: string;
  evaluation_number?: number;
  previous_test_id?: number | null;
  planted_defects?: Array<{
    defect_category: number | { category_id: number; category_name?: string; [key: string]: any };
    defect_type: number | { defect_type_id: number; defect_name?: string; [key: string]: any };
    quantity: number;
  }>;
  after_test_category_results?: Array<{ category_id: number; found_qty: number }>;
  remarks?: string | null;
  re_inspection_qty?: number | null;
  reeval_scheduled_date?: string | null;
  reeval_extension_weeks?: number | null;
  created_at?: string;
  updated_at?: string;
  station?: number | { station_id: number; station_name?: string };
  department?: number | { department_id: number; department_name?: string };
  level?: number | { level_id: number; level_name?: string };
}

/* ─── NEW: ReInspectionPlan type ─── */
interface ReInspectionPlan {
  plan_id: number;
  employee: string;
  employee_name?: string;
  station: number;
  station_name?: string;
  level: number;
  level_name?: string;
  failed_test: number;
  failed_test_id?: number;
  failed_date: string;
  failed_score: number;
  scheduled_date: string | null;
  completed_test: number | null;
  completed_test_id?: number | null;
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

interface CategoryData {
  categoryId: number;
  categoryName: string;
  totalQty: number;
  defectDetails: Array<{ defectTypeId: number; defectName: string; qty: number }>;
  paletteIndex: number;
}

interface DefectTypeJudgment {
  defectTypeId: number;
  defectName: string;
  plantedQty: number;
  foundQty: number;
  match: boolean;
}

interface CategoryJudgment {
  categoryId: number;
  categoryName: string;
  plantedQty: number;
  foundQty: number;
  match: boolean;
  defectTypeResults: DefectTypeJudgment[];
}

interface JudgmentResult {
  status: 'OK' | 'NOT OK';
  okMatch: boolean;
  categoryResults: CategoryJudgment[];
  allCategoriesMatch: boolean;
}

interface QualificationStatus {
  latestTest: SavedTest | null;
  isQualified: boolean;
  lastPassedDate: string | null;
  daysSinceLastTest: number | null;
  lastStation?: string;
  lastDepartment?: string;
  lastLevel?: string;
  message: string;
}

/* ─── HELPERS ─────────────────────────────────────────── */
function getTestResult(test: SavedTest): string {
  return test.test_judgment || test.test_result || '';
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

/* ─── COLOR PALETTE ───────────────────────────────────── */
const CAT_PALETTES = [
  { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', ring: 'ring-blue-400', header: 'bg-blue-600', input: 'focus:ring-blue-400 focus:border-blue-500', pill: 'bg-blue-600', pillText: 'text-white', glow: 'shadow-blue-100', headerBg: 'bg-blue-600', headerText: 'text-white', light: 'bg-blue-50/60' },
  { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-400', header: 'bg-emerald-600', input: 'focus:ring-emerald-400 focus:border-emerald-500', pill: 'bg-emerald-600', pillText: 'text-white', glow: 'shadow-emerald-100', headerBg: 'bg-emerald-600', headerText: 'text-white', light: 'bg-emerald-50/60' },
  { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-400', header: 'bg-amber-600', input: 'focus:ring-amber-400 focus:border-amber-500', pill: 'bg-amber-600', pillText: 'text-white', glow: 'shadow-amber-100', headerBg: 'bg-amber-500', headerText: 'text-white', light: 'bg-amber-50/60' },
  { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500', ring: 'ring-rose-400', header: 'bg-rose-600', input: 'focus:ring-rose-400 focus:border-rose-500', pill: 'bg-rose-600', pillText: 'text-white', glow: 'shadow-rose-100', headerBg: 'bg-rose-600', headerText: 'text-white', light: 'bg-rose-50/60' },
  { bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500', ring: 'ring-violet-400', header: 'bg-violet-600', input: 'focus:ring-violet-400 focus:border-violet-500', pill: 'bg-violet-600', pillText: 'text-white', glow: 'shadow-violet-100', headerBg: 'bg-violet-600', headerText: 'text-white', light: 'bg-violet-50/60' },
  { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500', ring: 'ring-cyan-400', header: 'bg-cyan-600', input: 'focus:ring-cyan-400 focus:border-cyan-500', pill: 'bg-cyan-600', pillText: 'text-white', glow: 'shadow-cyan-100', headerBg: 'bg-cyan-600', headerText: 'text-white', light: 'bg-cyan-50/60' },
];

/* ─── STATUS CHIP ─────────────────────────────────────── */
function StatusChip({ result }: { result: string }) {
  const isOk = result === 'OK';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide border-2 ${isOk ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-red-50 border-red-400 text-red-700'}`}>
      {isOk ? <CircleCheck className="w-3.5 h-3.5" /> : <CircleX className="w-3.5 h-3.5" />}
      {result}
    </span>
  );
}

/* ─── PLAN STATUS CHIP ────────────────────────────────── */
function PlanStatusChip({ status }: { status: ReInspectionPlan['status'] }) {
  const config = {
    PENDING:     { bg: 'bg-slate-100 border-slate-300 text-slate-700', label: 'Pending' },
    SCHEDULED:   { bg: 'bg-amber-100 border-amber-400 text-amber-800', label: 'Scheduled' },
    IN_PROGRESS: { bg: 'bg-blue-100 border-blue-400 text-blue-800', label: 'In Progress' },
    COMPLETED:   { bg: 'bg-emerald-100 border-emerald-400 text-emerald-800', label: 'Completed' },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border-2 ${config.bg}`}>
      {config.label}
    </span>
  );
}

/* ─── METRIC CARD ─────────────────────────────────────── */
function MetricCard({ label, value, accent }: { label: string; value: string | number; accent: 'blue' | 'green' | 'red' | 'purple' | 'amber' | 'slate' }) {
  const styles: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    purple: 'bg-violet-50 border-violet-200 text-violet-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    slate: 'bg-slate-50 border-slate-200 text-slate-800',
  };
  return (
    <div className={`rounded-xl border-2 px-4 py-3 flex flex-col items-center ${styles[accent]}`}>
      <span className="text-2xl font-black tabular-nums">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-0.5">{label}</span>
    </div>
  );
}

/* ─── SECTION HEADER ──────────────────────────────────── */
function SectionHeader({ icon: Icon, label, accent, children }: { icon: any; label: string; accent: string; children?: React.ReactNode }) {
  return (
    <div className={`flex items-center justify-between px-5 py-3.5 border-b ${accent}`}>
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4" />
        <span className="font-black text-sm uppercase tracking-widest">{label}</span>
      </div>
      {children}
    </div>
  );
}

/* ─── NEW: PLAN SYNC BANNER ────────────────────────────
   Shows when a ReInspectionPlan exists for this employee+station+level
   from the Plan Sheet (supervisor scheduled)
   OR after the test creates one (PoisonTest → Plan sync)
─────────────────────────────────────────────────────── */
interface PlanSyncBannerProps {
  plan: ReInspectionPlan;
  source: 'from-plan' | 'from-test'; // who created it
  onNavigateToPlan?: () => void;
}

function PlanSyncBanner({ plan, source, onNavigateToPlan }: PlanSyncBannerProps) {
  const daysLeft = daysUntil(plan.scheduled_date);
  const isReady = daysLeft !== null && daysLeft <= 0;

  if (source === 'from-plan') {
    // Plan Sheet → PoisonTestSheet: supervisor already scheduled
    return (
      <div className="rounded-2xl border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg shadow-blue-100 overflow-hidden">
        <div className="flex items-start gap-4 p-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                Plan Sheet → Here
              </span>
              <PlanStatusChip status={plan.status} />
            </div>
            <p className="font-black text-blue-900 text-sm">
              Re-evaluation already scheduled by supervisor
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2.5 text-xs">
              {plan.scheduled_date && (
                <div className="bg-white/70 rounded-xl px-3 py-2 border border-blue-200">
                  <span className="block text-blue-400 font-semibold uppercase tracking-wider text-[9px]">Scheduled Date</span>
                  <span className="font-black text-blue-900">{plan.scheduled_date}</span>
                </div>
              )}
              <div className="bg-white/70 rounded-xl px-3 py-2 border border-blue-200">
                <span className="block text-blue-400 font-semibold uppercase tracking-wider text-[9px]">Failed Date</span>
                <span className="font-black text-blue-900">{plan.failed_date}</span>
              </div>
              {plan.scheduled_date && (
                <div className={`rounded-xl px-3 py-2 border ${isReady ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>
                  <span className={`block font-semibold uppercase tracking-wider text-[9px] ${isReady ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {isReady ? 'Status' : 'Days Left'}
                  </span>
                  <span className={`font-black ${isReady ? 'text-emerald-800' : 'text-amber-900'}`}>
                    {isReady ? '✅ Ready!' : `${daysLeft}d`}
                  </span>
                </div>
              )}
            </div>
            {plan.notes && (
              <p className="text-xs text-blue-700 mt-2 bg-blue-100/60 px-3 py-1.5 rounded-lg">
                <span className="font-bold">Note:</span> {plan.notes}
              </p>
            )}
          </div>
          {onNavigateToPlan && (
            <button
              onClick={onNavigateToPlan}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View in Plan
            </button>
          )}
        </div>
      </div>
    );
  }

  // PoisonTestSheet → Plan: test created it
  return (
    <div className="rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 to-green-50 shadow-lg shadow-emerald-100 overflow-hidden">
      <div className="flex items-start gap-4 p-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <ClipboardCheck className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
              Synced → Plan Sheet
            </span>
            <PlanStatusChip status={plan.status} />
            <span className="text-[9px] text-emerald-600 font-bold">Plan #{plan.plan_id}</span>
          </div>
          <p className="font-black text-emerald-900 text-sm">
            Re-evaluation logged in Plan Sheet automatically
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2.5 text-xs">
            {plan.scheduled_date && (
              <div className="bg-white/70 rounded-xl px-3 py-2 border border-emerald-200">
                <span className="block text-emerald-500 font-semibold uppercase tracking-wider text-[9px]">Re-eval Date</span>
                <span className="font-black text-emerald-900">{plan.scheduled_date}</span>
              </div>
            )}
            <div className="bg-white/70 rounded-xl px-3 py-2 border border-emerald-200">
              <span className="block text-emerald-500 font-semibold uppercase tracking-wider text-[9px]">Failed Date</span>
              <span className="font-black text-emerald-900">{plan.failed_date}</span>
            </div>
            {plan.scheduled_date && (
              <div className={`rounded-xl px-3 py-2 border ${isReady ? 'bg-emerald-100 border-emerald-400' : 'bg-amber-50 border-amber-300'}`}>
                <span className={`block font-semibold uppercase tracking-wider text-[9px] ${isReady ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {isReady ? 'Status' : 'Days Until Re-eval'}
                </span>
                <span className={`font-black ${isReady ? 'text-emerald-900' : 'text-amber-900'}`}>
                  {isReady ? '✅ Ready!' : `${daysLeft} days`}
                </span>
              </div>
            )}
          </div>
        </div>
        {onNavigateToPlan && (
          <button
            onClick={onNavigateToPlan}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Plan
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── CATEGORY PLANTED CARD ───────────────────────────── */
interface CategoryPlantedCardProps {
  catData: CategoryData;
  paletteIndex: number;
}

function CategoryPlantedCard({ catData, paletteIndex }: CategoryPlantedCardProps) {
  const pal = CAT_PALETTES[paletteIndex % CAT_PALETTES.length];
  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${pal.border} shadow-sm`}>
      <div className={`px-4 py-2.5 flex items-center justify-between ${pal.bg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${pal.dot}`} />
          <span className={`text-sm font-black ${pal.text}`}>{catData.categoryName}</span>
        </div>
        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${pal.badge}`}>
          Total: {catData.totalQty}
        </span>
      </div>
      <div className="bg-white divide-y divide-slate-50">
        {catData.defectDetails.map((dd) => (
          <div key={dd.defectTypeId} className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${pal.dot} opacity-60`} />
              <span className="text-sm text-slate-700 font-semibold">{dd.defectName}</span>
            </div>
            <span className={`text-lg font-black ${pal.text}`}>{dd.qty}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CATEGORY FOUND CARD ─────────────────────────────── */
interface CategoryFoundCardProps {
  catId: number;
  catName: string;
  plantedQty: number;
  defectDetails: Array<{ defectTypeId: number; defectName: string; qty: number }>;
  foundByType: Record<number, string>;
  onChangeType: (defectTypeId: number, val: string) => void;
  isViewMode: boolean;
  paletteIndex: number;
}

function CategoryFoundCard({
  catId, catName, plantedQty, defectDetails,
  foundByType, onChangeType, isViewMode, paletteIndex
}: CategoryFoundCardProps) {
  const pal = CAT_PALETTES[paletteIndex % CAT_PALETTES.length];
  const totalFound = defectDetails.reduce((s, dd) => s + (parseInt(foundByType[dd.defectTypeId]) || 0), 0);
  const allFilled = defectDetails.every(dd => foundByType[dd.defectTypeId] !== undefined && foundByType[dd.defectTypeId] !== '');
  const allMatch = allFilled && defectDetails.every(dd => (parseInt(foundByType[dd.defectTypeId]) || 0) === dd.qty);
  const anyMismatch = allFilled && !allMatch;

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${anyMismatch ? 'border-red-400 shadow-lg shadow-red-100' : allMatch ? 'border-emerald-400 shadow-lg shadow-emerald-100' : `${pal.border} shadow-sm`}`}>
      <div className={`px-4 py-3 flex items-center justify-between ${pal.bg}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${pal.dot}`} />
          <span className={`text-sm font-black ${pal.text}`}>{catName}</span>
        </div>
        <div className="flex items-center gap-2">
          {allFilled && (
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${allMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {allMatch ? '✓ All Match' : '✗ Mismatch'}
            </span>
          )}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-semibold">Planted</span>
            <span className={`text-sm font-black px-2 py-0.5 rounded-full ${pal.badge}`}>{plantedQty}</span>
          </div>
        </div>
      </div>

      <div className="bg-white divide-y divide-slate-50">
        {defectDetails.map((dd) => {
          const foundVal = foundByType[dd.defectTypeId] || '';
          const foundNum = parseInt(foundVal) || 0;
          const hasVal = foundVal !== '';
          const isMatch = hasVal && foundNum === dd.qty;
          const isMismatch = hasVal && foundNum !== dd.qty;
          const diff = foundNum - dd.qty;

          return (
            <div key={dd.defectTypeId} className={`px-4 py-3 transition-colors ${isMismatch ? 'bg-red-50/40' : isMatch ? 'bg-emerald-50/40' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${pal.dot} opacity-70 flex-shrink-0`} />
                    <span className="text-sm font-bold text-slate-800 truncate">{dd.defectName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 ml-3">
                    <span className="text-[10px] text-slate-400">Planted:</span>
                    <span className={`text-[10px] font-black px-1.5 py-0 rounded ${pal.badge}`}>{dd.qty}</span>
                    {hasVal && (
                      <>
                        <span className="text-[10px] text-slate-300">→</span>
                        <span className={`text-[10px] font-black ${isMatch ? 'text-emerald-600' : 'text-red-600'}`}>
                          Found: {foundNum}
                          {!isMatch && ` (${diff > 0 ? '+' : ''}${diff})`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isViewMode ? (
                    <div className={`w-16 h-12 rounded-xl flex items-center justify-center text-2xl font-black ${isMismatch ? 'bg-red-100 text-red-700' : isMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {foundVal || '—'}
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={foundVal}
                      onChange={e => onChangeType(dd.defectTypeId, e.target.value)}
                      placeholder="0"
                      min="0"
                      className={`w-20 px-2 py-2.5 border-2 rounded-xl font-black text-xl text-center outline-none transition-all ${isMismatch ? 'border-red-400 bg-red-50 text-red-800 focus:ring-2 focus:ring-red-300' : isMatch ? 'border-emerald-400 bg-emerald-50 text-emerald-800 focus:ring-2 focus:ring-emerald-300' : `border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 ${pal.input}`}`}
                      required
                    />
                  )}
                </div>
                {hasVal && (
                  <div className="flex-shrink-0">
                    {isMatch ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allFilled && (
        <div className={`px-4 py-2.5 flex items-center justify-between border-t ${allMatch ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <span className={`text-xs font-black uppercase tracking-wider ${allMatch ? 'text-emerald-700' : 'text-red-700'}`}>
            Category Total
          </span>
          <div className="flex items-center gap-3 text-sm font-black">
            <span className={`${pal.text}`}>{plantedQty} planted</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className={allMatch ? 'text-emerald-700' : 'text-red-700'}>{totalFound} found</span>
            {allMatch ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
const PoisonTestSheet: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const navState = (location.state as LocationState) || {};

  const employeeId = searchParams.get('employee') || navState.employeeId;
  const employeeName = searchParams.get('employeeName') || navState.employeeName;
  const stationId = searchParams.get('station') ? Number(searchParams.get('station')) : navState.stationId;
  const stationName = searchParams.get('stationName') || navState.stationName;
  const departmentId = searchParams.get('department') ? Number(searchParams.get('department')) : navState.departmentId;
  const departmentName = searchParams.get('departmentName') || navState.departmentName;
  const levelId = searchParams.get('level') ? Number(searchParams.get('level')) : navState.levelId;
  const levelName = searchParams.get('levelName') || navState.levelName;

  // Sync nav state to URL
  useEffect(() => {
    if (!navState.employeeId) return;
    if (searchParams.get('employee')) return;
    const p = new URLSearchParams(searchParams);
    if (navState.employeeId) p.set('employee', navState.employeeId);
    if (navState.employeeName) p.set('employeeName', navState.employeeName);
    if (navState.stationId) p.set('station', String(navState.stationId));
    if (navState.stationName) p.set('stationName', navState.stationName);
    if (navState.departmentId) p.set('department', String(navState.departmentId));
    if (navState.departmentName) p.set('departmentName', navState.departmentName);
    if (navState.levelId) p.set('level', String(navState.levelId));
    if (navState.levelName) p.set('levelName', navState.levelName);
    setSearchParams(p, { replace: true });
  }, [location.state, searchParams, setSearchParams, navState]);

  const [mode, setMode] = useState<'loading' | 'view' | 'edit' | 'reeval-schedule'>('loading');
  const [savedTest, setSavedTest] = useState<SavedTest | null>(null);
  const [currentEvalNumber, setCurrentEvalNumber] = useState(1);
  const [evaluationHistory, setEvaluationHistory] = useState<SavedTest[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [globalStatus, setGlobalStatus] = useState<QualificationStatus | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [localDataLoaded, setLocalDataLoaded] = useState(false);

  /* ══════════════════════════════════════════
     NEW: ReInspectionPlan state
     - activeReinspectionPlan: the plan that exists for this employee+station+level
     - planSource: 'from-plan' = supervisor created it first
                   'from-test' = poison test failure created it
  ══════════════════════════════════════════ */
  const [activeReinspectionPlan, setActiveReinspectionPlan] = useState<ReInspectionPlan | null>(null);
  const [planSource, setPlanSource] = useState<'from-plan' | 'from-test' | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  const [reevalExtensionWeeks, setReevalExtensionWeeks] = useState<number>(1);
  const [reevalScheduledDate, setReevalScheduledDate] = useState('');
  const [isEditingReeval, setIsEditingReeval] = useState(false);

  const [formData, setFormData] = useState({
    testDate: new Date().toISOString().split('T')[0],
    modelName: '',
    totalPartsBefore: '',
    okPartsBefore: '',
    okPartsAfter: '',
    reInspectionQty: '',
    remarks: ''
  });

  const [defectCategories, setDefectCategories] = useState<DefectCategory[]>([]);
  const [selectedDefects, setSelectedDefects] = useState<PlantedDefect[]>([]);
  const [afterTestByType, setAfterTestByType] = useState<Record<number, string>>({});
  const [judgment, setJudgment] = useState<JudgmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isViewMode = mode === 'view';

  /* ══════════════════════════════════════════
     NEW: Fetch active ReInspectionPlan for
     this employee + station + level
     Called on mount AND after schedule/test save
  ══════════════════════════════════════════ */
  const fetchActiveReinspectionPlan = useCallback(async () => {
    if (!employeeId || !stationId || !levelId) return;
    setPlanLoading(true);
    try {
      const params = new URLSearchParams({
        employee: employeeId,
        station: String(stationId),
        level: String(levelId),
        status__in: 'PENDING,SCHEDULED,IN_PROGRESS',
      });
      const res = await fetch(`${API_ENDPOINTS.BASE_URL}/reinspection-plans/?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const plans: ReInspectionPlan[] = Array.isArray(data) ? data : (data.results || []);

      if (plans.length > 0) {
        const plan = plans[0]; // take the most relevant active plan
        setActiveReinspectionPlan(plan);

        // Determine source:
        // If we have a local failed test that matches the plan's failed_test → test created it
        // Otherwise it was scheduled by supervisor from the Plan Sheet
        // We set this properly after local data loads
      } else {
        setActiveReinspectionPlan(null);
        setPlanSource(null);
      }
    } catch {
      setActiveReinspectionPlan(null);
      setPlanSource(null);
    } finally {
      setPlanLoading(false);
    }
  }, [employeeId, stationId, levelId]);

  /* ══════════════════════════════════════════
     Determine plan source after both local
     tests AND plan are loaded
  ══════════════════════════════════════════ */
  useEffect(() => {
    if (!activeReinspectionPlan || !localDataLoaded) return;

    const localFailedTestIds = evaluationHistory
      .filter(t => getTestResult(t) === 'NOT OK')
      .map(t => t.test_id);

    if (localFailedTestIds.includes(activeReinspectionPlan.failed_test)) {
      // This plan was created because of a test failure recorded here
      setPlanSource('from-test');
    } else {
      // Plan was created by supervisor from the Plan Sheet
      setPlanSource('from-plan');
    }
  }, [activeReinspectionPlan, localDataLoaded, evaluationHistory]);

  /* LOCAL STATUS */
  const localStatus = useMemo((): QualificationStatus | null => {
    if (!localDataLoaded) return null;
    if (evaluationHistory.length === 0) {
      return {
        latestTest: null,
        isQualified: false,
        lastPassedDate: null,
        daysSinceLastTest: null,
        message: `No poison cake tests recorded at ${stationName || 'this station'} / ${levelName || 'this level'}`
      };
    }
    const latest = evaluationHistory[0];
    const result = getTestResult(latest);
    const isQualified = result === 'OK';
    const days = daysSince(latest.test_date);
    return {
      latestTest: latest,
      isQualified,
      lastPassedDate: isQualified ? latest.test_date : null,
      daysSinceLastTest: days,
      message: isQualified
        ? `Qualified at this station (passed on ${latest.test_date})`
        : `Not Qualified here — last test (${latest.test_date}) was ${result}`
    };
  }, [localDataLoaded, evaluationHistory, stationName, levelName]);

  const globalIsFromDifferentContext = useMemo(() => {
    if (!globalStatus?.latestTest || !localStatus?.latestTest) return true;
    return globalStatus.latestTest.test_id !== localStatus.latestTest.test_id;
  }, [globalStatus, localStatus]);

  // Fetch defect categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.BASE_URL}/defect-types/by_category/`);
        if (!res.ok) throw new Error();
        setDefectCategories(await res.json());
      } catch {
        setDefectCategories([
          { category_id: 1, category_name: 'Appearance', defect_types: [{ defect_type_id: 1, defect_name: 'Scratch' }, { defect_type_id: 2, defect_name: 'Dent' }] },
          { category_id: 2, category_name: 'Dimension', defect_types: [{ defect_type_id: 5, defect_name: 'Over Size' }, { defect_type_id: 6, defect_name: 'Under Size' }] },
          { category_id: 3, category_name: 'Function', defect_types: [{ defect_type_id: 8, defect_name: 'Not Working' }] },
          { category_id: 4, category_name: 'Assembly', defect_types: [{ defect_type_id: 11, defect_name: 'Missing Part' }] }
        ]);
      }
    })();
  }, []);

  /* GLOBAL STATUS */
  useEffect(() => {
    if (!employeeId) return;
    const fetchGlobalStatus = async () => {
      setGlobalLoading(true);
      try {
        const params = new URLSearchParams({ operator: employeeId, ordering: '-test_date', limit: '1' });
        const res = await fetch(`${API_ENDPOINTS.BASE_URL}/poison-cake-tests/?${params}`);
        if (!res.ok) throw new Error('Failed to fetch global status');
        const data = await res.json();
        const tests: SavedTest[] = Array.isArray(data) ? data : (data.results || []);
        const latest = tests[0] || null;
        if (latest) {
          const j = getTestResult(latest);
          const isQualified = j === 'OK';
          setGlobalStatus({
            latestTest: latest,
            isQualified,
            lastPassedDate: isQualified ? latest.test_date : null,
            daysSinceLastTest: daysSince(latest.test_date),
            lastStation: typeof latest.station === 'object' ? latest.station.station_name : '—',
            lastDepartment: typeof latest.department === 'object' ? latest.department.department_name : '—',
            lastLevel: typeof latest.level === 'object' ? latest.level.level_name : '—',
            message: isQualified ? `Passed company-wide on ${latest.test_date}` : `Last company-wide test (${latest.test_date}) was ${j}`
          });
        } else {
          setGlobalStatus({ latestTest: null, isQualified: false, lastPassedDate: null, daysSinceLastTest: null, message: 'No poison cake tests recorded for this employee anywhere' });
        }
      } catch {
        setGlobalStatus({ latestTest: null, isQualified: false, lastPassedDate: null, daysSinceLastTest: null, message: 'Unable to load company-wide qualification status' });
      } finally {
        setGlobalLoading(false);
      }
    };
    fetchGlobalStatus();
  }, [employeeId]);

  const populateFormFromSaved = useCallback((test: SavedTest) => {
    setSelectedDefects([]);
    setAfterTestByType({});
    setJudgment(null);
    setFormData({
      testDate: test.test_date || '',
      modelName: test.model_name || '',
      totalPartsBefore: test.total_parts_before != null ? String(test.total_parts_before) : '',
      okPartsBefore: test.ok_parts_before != null ? String(test.ok_parts_before) : '',
      okPartsAfter: test.ok_parts_after != null ? String(test.ok_parts_after) : '',
      reInspectionQty: test.re_inspection_qty != null ? String(test.re_inspection_qty) : '',
      remarks: test.remarks || ''
    });
    if (Array.isArray(test.planted_defects) && test.planted_defects.length > 0) {
      setSelectedDefects(test.planted_defects.map(d => ({
        defect_category: typeof d.defect_category === 'object' ? (d.defect_category as any).category_id ?? (d.defect_category as any).id : d.defect_category,
        defect_type: typeof d.defect_type === 'object' ? (d.defect_type as any).defect_type_id ?? (d.defect_type as any).id : d.defect_type,
        quantity: String(d.quantity)
      })));
    }
    if (Array.isArray(test.after_test_category_results) && test.after_test_category_results.length > 0 && Array.isArray(test.planted_defects) && test.planted_defects.length > 0) {
      const map: Record<number, string> = {};
      test.planted_defects.forEach(d => {
        const dtId = typeof d.defect_type === 'object' ? (d.defect_type as any).defect_type_id ?? (d.defect_type as any).id : d.defect_type;
        const catId = typeof d.defect_category === 'object' ? (d.defect_category as any).category_id ?? (d.defect_category as any).id : d.defect_category;
        const catResult = test.after_test_category_results?.find(r => r.category_id === catId);
        if (catResult && dtId) {
          const allTypesInCat = test.planted_defects?.filter(pd => {
            const pcatId = typeof pd.defect_category === 'object' ? (pd.defect_category as any).category_id : pd.defect_category;
            return pcatId === catId;
          }) || [];
          if (allTypesInCat.length === 1) {
            map[dtId] = String(catResult.found_qty);
          } else {
            map[dtId] = '';
          }
        }
      });
      setAfterTestByType(map);
    }
  }, []);

  const refetchAndPopulateTest = useCallback(async (testId: number): Promise<SavedTest | null> => {
    try {
      const res = await fetch(`${API_ENDPOINTS.BASE_URL}/poison-cake-tests/${testId}/`);
      if (!res.ok) throw new Error('Failed to fetch test detail');
      const freshTest: SavedTest = await res.json();
      setSavedTest(freshTest);
      setEvaluationHistory(prev => prev.map(t => t.test_id === freshTest.test_id ? freshTest : t));
      populateFormFromSaved(freshTest);
      return freshTest;
    } catch (err: any) {
      setError(`Failed to reload test: ${err.message}`);
      return null;
    }
  }, [populateFormFromSaved]);

  /* ══════════════════════════════════════════
     Fetch local tests + reinspection plan on mount
  ══════════════════════════════════════════ */
  useEffect(() => {
    (async () => {
      if (!employeeId || !departmentId || !stationId || !levelId) {
        setLocalDataLoaded(true);
        setMode('edit');
        return;
      }
      try {
        const params = new URLSearchParams({
          operator: employeeId,
          department: String(departmentId),
          station: String(stationId),
          level: String(levelId),
          ordering: '-created_at'
        });
        const res = await fetch(`${API_ENDPOINTS.BASE_URL}/poison-cake-tests/?${params}`);
        if (res.ok) {
          const data = await res.json();
          const tests: SavedTest[] = Array.isArray(data) ? data : (data.results || []);
          if (tests.length > 0) {
            setEvaluationHistory(tests);
            const latest = tests[0];
            setCurrentEvalNumber(latest.evaluation_number || tests.length);
            const fullTest = await refetchAndPopulateTest(latest.test_id);
            if (fullTest) setMode('view');
            else setMode('edit');
          } else {
            setMode('edit');
          }
        } else {
          setMode('edit');
        }
      } catch {
        setMode('edit');
      } finally {
        setLocalDataLoaded(true);
        // Fetch plan AFTER local data is loaded
        await fetchActiveReinspectionPlan();
      }
    })();
  }, [employeeId, departmentId, stationId, levelId, refetchAndPopulateTest, fetchActiveReinspectionPlan]);

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + reevalExtensionWeeks * 7);
    setReevalScheduledDate(d.toISOString().split('T')[0]);
  }, [reevalExtensionWeeks]);

  // Planted defects grouping
  const plantedByCategory = useMemo((): Record<number, CategoryData> => {
    const map: Record<number, CategoryData> = {};
    let paletteIdx = 0;
    selectedDefects.forEach(defect => {
      const catId = Number(defect.defect_category);
      if (!catId) return;
      const cat = defectCategories.find(c => c.category_id === catId);
      const dt = cat?.defect_types.find(d => d.defect_type_id === Number(defect.defect_type));
      const qty = parseInt(defect.quantity) || 0;
      if (!map[catId]) {
        map[catId] = { categoryId: catId, categoryName: cat?.category_name || `Category ${catId}`, totalQty: 0, defectDetails: [], paletteIndex: paletteIdx++ };
      }
      map[catId].totalQty += qty;
      if (dt && qty > 0) {
        const existing = map[catId].defectDetails.find(d => d.defectTypeId === dt.defect_type_id);
        if (existing) { existing.qty += qty; }
        else { map[catId].defectDetails.push({ defectTypeId: dt.defect_type_id, defectName: dt.defect_name, qty }); }
      }
    });
    return map;
  }, [selectedDefects, defectCategories]);

  const plantedCategoryIds = useMemo(() => Object.keys(plantedByCategory).map(Number), [plantedByCategory]);
  const allPlantedTypeIds = useMemo(() => plantedCategoryIds.flatMap(cid => plantedByCategory[cid].defectDetails.map(dd => dd.defectTypeId)), [plantedCategoryIds, plantedByCategory]);

  const rejectBefore = useMemo(() => Math.max(0, (parseInt(formData.totalPartsBefore) || 0) - (parseInt(formData.okPartsBefore) || 0)), [formData.totalPartsBefore, formData.okPartsBefore]);
  const totalPlanted = useMemo(() => Object.values(plantedByCategory).reduce((s, c) => s + c.totalQty, 0), [plantedByCategory]);
  const totalFound = useMemo(() => Object.values(afterTestByType).reduce((s, v) => s + (parseInt(v) || 0), 0), [afterTestByType]);

  // Live judgment
  useEffect(() => {
    const okBefore = parseInt(formData.okPartsBefore) || 0;
    const okAfter = parseInt(formData.okPartsAfter) || 0;
    const allTypesFilled = allPlantedTypeIds.length > 0 && allPlantedTypeIds.every(id => afterTestByType[id] !== undefined && afterTestByType[id] !== '');
    if (okBefore > 0 && formData.okPartsAfter !== '' && allTypesFilled) {
      const okMatch = okBefore === okAfter;
      const categoryResults: CategoryJudgment[] = plantedCategoryIds.map(catId => {
        const catData = plantedByCategory[catId];
        const defectTypeResults: DefectTypeJudgment[] = catData.defectDetails.map(dd => {
          const found = parseInt(afterTestByType[dd.defectTypeId]) || 0;
          return { defectTypeId: dd.defectTypeId, defectName: dd.defectName, plantedQty: dd.qty, foundQty: found, match: dd.qty === found };
        });
        const totalFoundInCat = defectTypeResults.reduce((s, r) => s + r.foundQty, 0);
        const allTypesMatch = defectTypeResults.every(r => r.match);
        return { categoryId: catId, categoryName: catData.categoryName, plantedQty: catData.totalQty, foundQty: totalFoundInCat, match: allTypesMatch, defectTypeResults };
      });
      const allCategoriesMatch = categoryResults.every(r => r.match);
      setJudgment({ status: (okMatch && allCategoriesMatch) ? 'OK' : 'NOT OK', okMatch, categoryResults, allCategoriesMatch });
    } else {
      setJudgment(null);
    }
  }, [formData.okPartsBefore, formData.okPartsAfter, afterTestByType, plantedByCategory, plantedCategoryIds, allPlantedTypeIds]);

  const addDefect = () => setSelectedDefects(p => [...p, { defect_category: 0, defect_type: 0, quantity: '' }]);
  const updateDefect = (i: number, field: string, val: any) => {
    const u = [...selectedDefects];
    u[i] = { ...u[i], [field]: val };
    if (field === 'defect_category') u[i].defect_type = 0;
    setSelectedDefects(u);
  };
  const removeDefect = (i: number) => {
    const removed = selectedDefects[i];
    setSelectedDefects(selectedDefects.filter((_, idx) => idx !== i));
    const dtId = Number(removed.defect_type);
    if (dtId) setAfterTestByType(p => { const c = { ...p }; delete c[dtId]; return c; });
  };

  const startNewTest = (isReeval = false) => {
    setFormData({ testDate: new Date().toISOString().split('T')[0], modelName: '', totalPartsBefore: '', okPartsBefore: '', okPartsAfter: '', reInspectionQty: '', remarks: '' });
    setSelectedDefects([]);
    setAfterTestByType({});
    setJudgment(null);
    setError(null);
    setIsEditingReeval(false);
    if (isReeval) setCurrentEvalNumber(p => p + 1);
    setMode('edit');
  };

  const handleReset = () => { if (confirm('Reset all data?')) startNewTest(); };

  /* ══════════════════════════════════════════
     SCHEDULE RE-EVAL
     After scheduling → sync plan by refetching
  ══════════════════════════════════════════ */
  const handleScheduleReeval = async () => {
    if (!savedTest) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Try PATCH on test first
      const patchRes = await fetch(
        `${API_ENDPOINTS.BASE_URL}/poison-cake-tests/${savedTest.test_id}/schedule-reeval/`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reeval_scheduled_date: reevalScheduledDate, reeval_extension_weeks: reevalExtensionWeeks })
        }
      );

      if (patchRes.ok) {
        const updatedTest: SavedTest = await patchRes.json();
        setSavedTest(updatedTest);
        setEvaluationHistory(prev => prev.map(t => t.test_id === updatedTest.test_id ? updatedTest : t));
        populateFormFromSaved(updatedTest);
      }

      // 2. Create / Update ReInspectionPlan
      // Check if plan already exists for this failed test
      const existingPlanRes = await fetch(
        `${API_ENDPOINTS.BASE_URL}/reinspection-plans/?employee=${employeeId}&station=${stationId}&level=${levelId}&status__in=PENDING,SCHEDULED,IN_PROGRESS`
      );
      const existingData = existingPlanRes.ok ? await existingPlanRes.json() : { results: [] };
      const existingPlans: ReInspectionPlan[] = Array.isArray(existingData) ? existingData : (existingData.results || []);
      const existingPlan = existingPlans.find(p => p.failed_test === savedTest.test_id);

      if (existingPlan) {
        // Update existing plan with scheduled date
        await fetch(`${API_ENDPOINTS.BASE_URL}/reinspection-plans/${existingPlan.plan_id}/schedule/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduled_date: reevalScheduledDate,
            notes: `${reevalExtensionWeeks} week extension scheduled from test sheet`
          })
        });
      } else {
        // Create new reinspection plan → THIS IS THE PoisonTestSheet → Plan sync
        await fetch(`${API_ENDPOINTS.BASE_URL}/reinspection-plans/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee: employeeId,
            station: Number(stationId),
            level: Number(levelId),
            failed_test: savedTest.test_id,
            failed_date: savedTest.test_date,
            failed_score: 0,
            scheduled_date: reevalScheduledDate,
            status: 'SCHEDULED',
            notes: `${reevalExtensionWeeks} week extension scheduled`
          })
        });
      }

      // 3. Re-fetch the active plan so banner updates
      await fetchActiveReinspectionPlan();

      if (!patchRes.ok) {
        const patchedTest = { ...savedTest, reeval_scheduled_date: reevalScheduledDate, reeval_extension_weeks: reevalExtensionWeeks };
        setSavedTest(patchedTest);
        setEvaluationHistory(prev => prev.map(t => t.test_id === patchedTest.test_id ? patchedTest : t));
        await refetchAndPopulateTest(savedTest.test_id);
      }

      setIsEditingReeval(false);
      setMode('view');
    } catch (err: any) {
      setError(`Failed to schedule re-evaluation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openReevalEdit = () => {
    if (savedTest?.reeval_extension_weeks) setReevalExtensionWeeks(savedTest.reeval_extension_weeks);
    if (savedTest?.reeval_scheduled_date) setReevalScheduledDate(savedTest.reeval_scheduled_date);
    setIsEditingReeval(true);
    setMode('reeval-schedule');
  };

  /* ══════════════════════════════════════════
     SUBMIT TEST
     After save → if NOT OK, create ReInspectionPlan
     → refetch plan so banner shows immediately
  ══════════════════════════════════════════ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    try {
      if (selectedDefects.length === 0) throw new Error('Add at least one defect');
      for (let i = 0; i < selectedDefects.length; i++) {
        const d = selectedDefects[i];
        if (!d.defect_category) throw new Error(`Defect #${i + 1}: Select category`);
        if (!d.defect_type) throw new Error(`Defect #${i + 1}: Select type`);
        if (!d.quantity || parseInt(d.quantity) < 1) throw new Error(`Defect #${i + 1}: Enter quantity`);
      }
      for (const typeId of allPlantedTypeIds) {
        if (!afterTestByType[typeId] || afterTestByType[typeId] === '') {
          let dtName = `Type #${typeId}`;
          for (const cat of defectCategories) {
            const dt = cat.defect_types.find(d => d.defect_type_id === typeId);
            if (dt) { dtName = dt.defect_name; break; }
          }
          throw new Error(`Enter found qty for defect type "${dtName}"`);
        }
      }

      const afterCategoryResults = plantedCategoryIds.map(catId => {
        const catData = plantedByCategory[catId];
        const found_qty = catData.defectDetails.reduce((s, dd) => s + (parseInt(afterTestByType[dd.defectTypeId]) || 0), 0);
        return { category_id: catId, found_qty };
      });
      const totalFoundForPayload = afterCategoryResults.reduce((s, r) => s + r.found_qty, 0);

      const testData = {
        test_date: formData.testDate,
        model_name: formData.modelName,
        operator: employeeId,
        department: Number(departmentId),
        station: Number(stationId),
        level: Number(levelId),
        total_parts_before: parseInt(formData.totalPartsBefore),
        ok_parts_before: parseInt(formData.okPartsBefore),
        ok_parts_after: parseInt(formData.okPartsAfter),
        reject_parts_after: totalFoundForPayload,
        evaluation_number: currentEvalNumber,
        previous_test_id: currentEvalNumber > 1 ? savedTest?.test_id : null,
        planted_defects: selectedDefects.map(d => ({ defect_category: Number(d.defect_category), defect_type: Number(d.defect_type), quantity: parseInt(d.quantity) })),
        after_test_category_results: afterCategoryResults,
        re_inspection_qty: formData.reInspectionQty ? parseInt(formData.reInspectionQty) : null,
        remarks: formData.remarks || null
      };

      const res = await fetch(`${API_ENDPOINTS.BASE_URL}/poison-cake-tests/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(typeof err === 'object' ? JSON.stringify(err) : String(err));
      }

      const result: SavedTest = await res.json();
      const fullTest = await refetchAndPopulateTest(result.test_id);
      if (fullTest) {
        setEvaluationHistory(p => {
          const exists = p.find(t => t.test_id === fullTest.test_id);
          return exists ? p.map(t => t.test_id === fullTest.test_id ? fullTest : t) : [fullTest, ...p];
        });

        /* ══ NEW: If NOT OK → create ReInspectionPlan immediately
           This is the PoisonTestSheet → Plan sync trigger ══ */
        if (fullTest.test_judgment === 'NOT OK') {
          try {
            // Check if plan already exists (backend might auto-create it via signal)
            const checkRes = await fetch(
              `${API_ENDPOINTS.BASE_URL}/reinspection-plans/?employee=${employeeId}&station=${stationId}&level=${levelId}&status__in=PENDING,SCHEDULED,IN_PROGRESS`
            );
            const checkData = checkRes.ok ? await checkRes.json() : {};
            const existingPlans: ReInspectionPlan[] = Array.isArray(checkData) ? checkData : (checkData.results || []);
            const planForThisTest = existingPlans.find(p => p.failed_test === fullTest.test_id);

            if (!planForThisTest) {
              // Create the plan if backend signal didn't do it
              await fetch(`${API_ENDPOINTS.BASE_URL}/reinspection-plans/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  employee: employeeId,
                  station: Number(stationId),
                  level: Number(levelId),
                  failed_test: fullTest.test_id,
                  failed_date: fullTest.test_date,
                  failed_score: 0,
                  status: 'PENDING',
                  notes: `Auto-created from test #${fullTest.test_id} failure`
                })
              });
            }
          } catch {
            // Non-fatal: plan creation failure shouldn't block test save
          }
          // Refetch plan so banner shows
          await fetchActiveReinspectionPlan();
        } else {
          // If test passed (re-eval passed) → mark any active plan as COMPLETED
          if (activeReinspectionPlan) {
            try {
              await fetch(
                `${API_ENDPOINTS.BASE_URL}/reinspection-plans/${activeReinspectionPlan.plan_id}/complete/`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ test_id: fullTest.test_id })
                }
              );
              setActiveReinspectionPlan(null);
              setPlanSource(null);
            } catch {
              // Non-fatal
            }
          }
        }
      }

      setSaveSuccess(true);
      setMode('view');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const daysUntilReeval = useMemo(() => {
    if (!savedTest?.reeval_scheduled_date) return null;
    return Math.ceil((new Date(savedTest.reeval_scheduled_date).getTime() - Date.now()) / 86400000);
  }, [savedTest?.reeval_scheduled_date]);

  const savedJudgment = savedTest ? getTestResult(savedTest) : '';
  const isTestFailed = judgment?.status === 'NOT OK' || (isViewMode && savedJudgment === 'NOT OK');
  const isTestPassed = judgment?.status === 'OK' || (isViewMode && savedJudgment === 'OK');

  const viewModeJudgment = useMemo((): JudgmentResult | null => {
    if (!isViewMode || !savedTest || plantedCategoryIds.length === 0) return null;
    const okBefore = savedTest.ok_parts_before;
    const okAfter = savedTest.ok_parts_after;
    const okMatch = okBefore === okAfter;
    const categoryResults: CategoryJudgment[] = plantedCategoryIds.map(catId => {
      const catData = plantedByCategory[catId];
      const defectTypeResults: DefectTypeJudgment[] = catData.defectDetails.map(dd => {
        const found = parseInt(afterTestByType[dd.defectTypeId]) || 0;
        return { defectTypeId: dd.defectTypeId, defectName: dd.defectName, plantedQty: dd.qty, foundQty: found, match: dd.qty === found };
      });
      const totalFoundInCat = defectTypeResults.reduce((s, r) => s + r.foundQty, 0);
      const allTypesMatch = defectTypeResults.every(r => r.match);
      return { categoryId: catId, categoryName: catData.categoryName, plantedQty: catData.totalQty, foundQty: totalFoundInCat, match: allTypesMatch, defectTypeResults };
    });
    const allCategoriesMatch = categoryResults.every(r => r.match);
    return { status: savedJudgment as 'OK' | 'NOT OK', okMatch, categoryResults, allCategoriesMatch };
  }, [isViewMode, savedTest, plantedCategoryIds, plantedByCategory, afterTestByType, savedJudgment]);

  const displayJudgment = isViewMode ? viewModeJudgment : judgment;

  // Navigate to plan sheet helper
  const navigateToPlan = useCallback(() => {
    navigate('/poison-cake', {
      state: { employeeId, employeeName, stationId, stationName, levelId, levelName, departmentId, departmentName }
    });
  }, [navigate, employeeId, employeeName, stationId, stationName, levelId, levelName, departmentId, departmentName]);

  // ─── RENDER ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #eef2ff 0%, #f8faff 45%, #f0f9ff 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* PRIMARY QUALIFICATION BANNER */}
        {employeeId && (
          <div className={`rounded-3xl border-2 shadow-2xl overflow-hidden ${
            !localDataLoaded || globalLoading
              ? 'border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100'
              : localStatus?.isQualified
                ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50'
                : localStatus?.latestTest
                  ? 'border-red-300 bg-gradient-to-br from-red-50 to-rose-50'
                  : 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50'
          }`}>
            <div className="p-6 flex items-center gap-6">
              {(!localDataLoaded || globalLoading) ? (
                <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin flex-shrink-0" />
              ) : localStatus?.isQualified ? (
                <Award className="w-16 h-16 text-emerald-600 flex-shrink-0" />
              ) : localStatus?.latestTest ? (
                <ShieldX className="w-16 h-16 text-red-500 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-16 h-16 text-amber-600 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                {(!localDataLoaded || globalLoading) ? (
                  <h2 className="text-2xl font-black text-slate-600">Checking qualification status…</h2>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                        localStatus?.isQualified ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                          : localStatus?.latestTest ? 'bg-red-100 border-red-300 text-red-700'
                          : 'bg-amber-100 border-amber-300 text-amber-700'
                      }`}>
                        {stationName || 'This Station'} · {levelName || 'This Level'}
                      </span>
                      {/* ── NEW: Show plan indicator in banner ── */}
                      {activeReinspectionPlan && !planLoading && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-blue-100 border-blue-300 text-blue-700 flex items-center gap-1">
                          <Link className="w-3 h-3" />
                          Linked to Plan #{activeReinspectionPlan.plan_id}
                        </span>
                      )}
                    </div>
                    <h2 className={`text-2xl font-black ${
                      localStatus?.isQualified ? 'text-emerald-900'
                        : localStatus?.latestTest ? 'text-red-900'
                        : 'text-amber-900'
                    }`}>
                      {localStatus?.message || 'No qualification data available'}
                    </h2>
                    {localStatus?.latestTest && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <span className="font-semibold block text-slate-600">Latest test at this station</span>
                          {localStatus.latestTest.test_date} · {getTestResult(localStatus.latestTest)}
                        </div>
                        {localStatus.daysSinceLastTest !== null && (
                          <div>
                            <span className="font-semibold block text-slate-600">
                              {localStatus.isQualified ? 'Qualified since' : 'Last tested'}
                            </span>
                            {localStatus.daysSinceLastTest} days ago
                          </div>
                        )}
                        {localStatus.isQualified && localStatus.lastPassedDate && (
                          <div>
                            <span className="font-semibold block text-slate-600">Next due approx.</span>
                            {new Date(new Date(localStatus.lastPassedDate).getTime() + 90 * 86400000).toISOString().split('T')[0]}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow hover:bg-slate-50 transition font-medium text-slate-700 flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
            </div>

            {localDataLoaded && !globalLoading && (!localStatus?.latestTest) && globalStatus?.latestTest && (
              <div className="px-6 py-3.5 bg-white/60 border-t border-amber-200/60 flex items-start gap-3">
                <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">Company-wide note:</span>{' '}
                  This employee has a{' '}
                  <span className={`font-black ${globalStatus.isQualified ? 'text-emerald-700' : 'text-red-600'}`}>
                    {getTestResult(globalStatus.latestTest)}
                  </span>{' '}
                  result from{' '}
                  <span className="font-semibold">{globalStatus.lastStation || 'another station'}</span>
                  {globalStatus.lastDepartment && globalStatus.lastDepartment !== '—' && <> ({globalStatus.lastDepartment})</>}
                  {globalStatus.lastLevel && globalStatus.lastLevel !== '—' && <> · {globalStatus.lastLevel}</>}
                  {' '}on <span className="font-mono font-semibold">{globalStatus.latestTest.test_date}</span>.
                  <span className="text-slate-400 ml-1">This does not apply to the current station context.</span>
                </div>
              </div>
            )}

            {localDataLoaded && !globalLoading && localStatus?.latestTest && globalStatus?.latestTest && globalIsFromDifferentContext && (
              <div className="px-6 py-2.5 bg-black/[0.03] border-t border-slate-200/50 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-400">
                  Most recent test company-wide: <span className="font-semibold text-slate-500">{getTestResult(globalStatus.latestTest)}</span> at{' '}
                  <span className="font-semibold text-slate-500">{globalStatus.lastStation || 'another station'}</span> on {globalStatus.latestTest.test_date}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            NEW: PLAN SYNC BANNER
            Shows when an active ReInspectionPlan exists for this
            employee + station + level.
            - 'from-plan': supervisor scheduled first → alert user here
            - 'from-test': test failure created it → confirm sync to plan
        ═══════════════════════════════════════════════════════════ */}
        {localDataLoaded && !planLoading && activeReinspectionPlan && planSource && (
          <PlanSyncBanner
            plan={activeReinspectionPlan}
            source={planSource}
            onNavigateToPlan={navigateToPlan}
          />
        )}

        {/* Plan loading skeleton */}
        {planLoading && (
          <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-48" />
              <div className="h-2 bg-slate-200 rounded w-64" />
            </div>
          </div>
        )}

        {/* HEADER CARD */}
        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200/50" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 55%, #4c1d95 100%)' }}>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/25 shadow-inner flex-shrink-0">
                  <FlaskConical className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl font-black text-white tracking-tight">Poison Cake Test</h1>
                    {isViewMode && savedTest && (
                      <span className="px-2.5 py-0.5 bg-white/15 text-white/70 text-xs font-bold rounded-full border border-white/20 font-mono">
                        #{savedTest.test_id}
                      </span>
                    )}
                    {/* Plan link badge in header */}
                    {activeReinspectionPlan && (
                      <button
                        onClick={navigateToPlan}
                        className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-400/20 text-blue-200 rounded-full border border-blue-400/30 text-xs font-bold hover:bg-blue-400/30 transition-all"
                      >
                        <Link className="w-3 h-3" />
                        Plan #{activeReinspectionPlan.plan_id}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isViewMode ? 'bg-emerald-400' : 'bg-yellow-400'}`} style={{ animation: 'pulse 2s infinite' }} />
                    <span className="text-white/55 text-xs font-semibold">
                      {mode === 'loading' ? 'Loading…' : isViewMode ? 'Saved Record' : currentEvalNumber > 1 ? `Re-evaluation #${currentEvalNumber - 1}` : 'New Test Entry'}
                    </span>
                    {isViewMode && savedJudgment && <StatusChip result={savedJudgment} />}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isViewMode && (
                  <button onClick={() => startNewTest()} className="flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold border border-white/20 transition-all">
                    <PlusCircle className="w-3.5 h-3.5" /> New
                  </button>
                )}
                <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-xl text-xs font-semibold border border-white/15 transition-all">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              {[
                { icon: User, label: 'Operator', val: employeeName, sub: employeeId },
                { icon: Building2, label: 'Department', val: departmentName },
                { icon: MapPin, label: 'Station', val: stationName },
                { icon: Target, label: 'Level', val: levelName },
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-3.5 border border-white/15">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <item.icon className="w-3 h-3 text-white/45" />
                    <span className="text-[9px] text-white/45 uppercase font-black tracking-wider">{item.label}</span>
                  </div>
                  <p className="text-sm font-black text-white truncate leading-tight">{item.val || '—'}</p>
                  {item.sub && <p className="text-[10px] text-white/35 font-mono mt-0.5">{item.sub}</p>}
                </div>
              ))}
            </div>
          </div>

          {isViewMode && savedTest && (
            <div className="bg-black/25 px-6 py-3.5 flex items-center gap-5 flex-wrap border-t border-white/10">
              <span className="text-[9px] text-white/35 uppercase font-black tracking-widest">Snapshot</span>
              {[
                { l: 'Total', v: savedTest.total_parts_before, c: 'text-white/80' },
                { l: 'OK Before', v: savedTest.ok_parts_before, c: 'text-emerald-400' },
                { l: 'Reject', v: savedTest.reject_parts_before, c: 'text-red-400' },
                { l: 'OK After', v: savedTest.ok_parts_after, c: 'text-emerald-400' },
                { l: 'Found', v: savedTest.reject_parts_after, c: 'text-amber-400' },
                { l: 'Date', v: savedTest.test_date, c: 'text-blue-300' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className={`text-base font-black font-mono leading-tight ${s.c}`}>{s.v}</span>
                  <span className="text-[8px] text-white/30 uppercase tracking-widest">{s.l}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUCCESS TOAST */}
        {saveSuccess && (
          <div className="flex items-center gap-3 bg-emerald-500 text-white px-5 py-3.5 rounded-2xl shadow-lg shadow-emerald-200/50">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold text-sm">Test saved successfully! {judgment?.status === 'NOT OK' ? 'Re-evaluation plan synced to Plan Sheet.' : ''}</span>
          </div>
        )}

        {/* PASS / FAIL HERO */}
        {isViewMode && savedJudgment && (
          <div className={`rounded-3xl overflow-hidden shadow-xl border-2 ${savedJudgment === 'OK' ? 'border-emerald-300 shadow-emerald-100' : 'border-red-300 shadow-red-100'}`}>
            <div className={`p-6 ${savedJudgment === 'OK' ? 'bg-gradient-to-br from-emerald-50 to-green-50' : 'bg-gradient-to-br from-red-50 to-rose-50'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-3xl flex-shrink-0 flex items-center justify-center shadow-xl ${savedJudgment === 'OK' ? 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-emerald-300' : 'bg-gradient-to-br from-red-400 to-rose-600 shadow-red-200'}`}>
                  {savedJudgment === 'OK' ? <Award className="w-10 h-10 text-white" /> : <AlertTriangle className="w-10 h-10 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className={`text-2xl font-black leading-tight ${savedJudgment === 'OK' ? 'text-emerald-900' : 'text-red-900'}`}>
                      {savedJudgment === 'OK' ? '🎉 Test Passed!' : '⚠️ Test Failed'}
                    </h2>
                    <StatusChip result={savedJudgment} />
                  </div>
                  <p className={`text-sm mt-1.5 leading-relaxed ${savedJudgment === 'OK' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {savedJudgment === 'OK'
                      ? 'All planted defects correctly identified. Trainee is qualified at this station & level.'
                      : 'Some defects were missed or counts did not match. Re-evaluation required after extension period.'}
                  </p>
                  <div className={`flex items-center gap-2 mt-2 text-xs font-mono ${savedJudgment === 'OK' ? 'text-emerald-600' : 'text-red-500'}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Tested: {savedTest?.test_date}
                      {savedJudgment === 'OK' && ` · Next due: ${new Date(new Date(savedTest!.test_date).getTime() + 90 * 86400000).toISOString().split('T')[0]}`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => startNewTest(savedJudgment !== 'OK')}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm shadow-lg transition-all hover:scale-105 ${savedJudgment === 'OK' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'}`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {savedJudgment === 'OK' ? 'New Test' : 'Re-Evaluate'}
                </button>
              </div>
            </div>

            {viewModeJudgment && (
              <div className={`px-6 py-4 border-t flex flex-wrap gap-3 ${savedJudgment === 'OK' ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'}`}>
                <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold ${viewModeJudgment.okMatch ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
                  {viewModeJudgment.okMatch ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  OK Parts: {formData.okPartsBefore} → {formData.okPartsAfter}
                </div>
                {viewModeJudgment.categoryResults.map(cr => {
                  const pal = CAT_PALETTES[plantedCategoryIds.indexOf(cr.categoryId) % CAT_PALETTES.length];
                  return (
                    <div key={cr.categoryId} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold ${cr.match ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
                      {cr.match ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span className={`w-2 h-2 rounded-full ${pal.dot}`} />
                      {cr.categoryName}: {cr.plantedQty} planted → {cr.foundQty} found
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RE-EVALUATION TIMELINE */}
        {isViewMode && savedJudgment === 'NOT OK' && (
          <div className="rounded-3xl overflow-hidden border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg shadow-amber-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-200/70 bg-amber-100/40">
              <div className="flex items-center gap-3">
                <Timer className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-amber-900 text-sm uppercase tracking-wider">Re-evaluation Timeline</h3>
                {/* Plan link */}
                {activeReinspectionPlan && (
                  <button onClick={navigateToPlan} className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full font-bold hover:bg-amber-300 transition-all">
                    <Link className="w-3 h-3" /> Plan #{activeReinspectionPlan.plan_id}
                  </button>
                )}
              </div>
              {savedTest?.reeval_scheduled_date && (
                <button onClick={openReevalEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all">
                  <Pencil className="w-3.5 h-3.5" /> Edit Schedule
                </button>
              )}
            </div>
            <div className="p-5">
              {savedTest?.reeval_scheduled_date ? (
                <div className="flex items-center gap-5">
                  <div className={`w-20 h-20 rounded-3xl flex-shrink-0 flex flex-col items-center justify-center shadow-lg font-black ${(daysUntilReeval ?? 1) <= 0 ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-emerald-200' : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200'}`}>
                    <span className="text-2xl text-white leading-none">{Math.max(0, daysUntilReeval ?? 0)}</span>
                    <span className="text-[9px] text-white/80 uppercase font-bold tracking-wide">days</span>
                  </div>
                  <div className="flex-1">
                    {(daysUntilReeval ?? 1) <= 0 ? (
                      <>
                        <h4 className="font-black text-emerald-800 text-base">✅ Ready for Re-evaluation!</h4>
                        <p className="text-sm text-emerald-700 mt-0.5">Extension period complete. Trainee can now be re-tested.</p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-black text-amber-900 text-base">⏳ Extension Period Active</h4>
                        <p className="text-sm text-amber-700 mt-0.5">
                          {daysUntilReeval} days remaining until re-evaluation on <strong>{savedTest.reeval_scheduled_date}</strong>
                        </p>
                      </>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full font-bold">
                        {savedTest.reeval_extension_weeks}W Extension
                      </span>
                      {/* Plan sync status in timeline */}
                      {activeReinspectionPlan && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                          <Link className="w-3 h-3" />
                          Plan: <PlanStatusChip status={activeReinspectionPlan.status} />
                        </span>
                      )}
                      {(daysUntilReeval ?? 1) <= 0 && (
                        <button
                          onClick={() => startNewTest(true)}
                          className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3.5 py-1.5 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-sm"
                        >
                          <RefreshCw className="w-3 h-3" /> Start Re-evaluation
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-amber-800 mb-3">No re-evaluation date scheduled yet. Schedule a 1–2 week extension to begin the process.</p>
                  <button
                    onClick={() => { setIsEditingReeval(false); setMode('reeval-schedule'); }}
                    className="flex items-center gap-2 mx-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-amber-200 hover:from-amber-600 hover:to-orange-600 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Re-evaluation (1–2 Week Extension)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EVALUATION HISTORY */}
        {evaluationHistory.length > 1 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <History className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="font-black text-slate-900">Evaluation History</span>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-xs font-black rounded-full">{evaluationHistory.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {evaluationHistory.slice(0, 6).map((h, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${getTestResult(h) === 'OK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {getTestResult(h) === 'OK' ? '✓' : '✗'}
                    </div>
                  ))}
                </div>
                {showHistory ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
            </button>
            {showHistory && (
              <div className="border-t border-slate-100 divide-y divide-slate-50">
                {evaluationHistory.map((h, idx) => {
                  const result = getTestResult(h);
                  return (
                    <div key={h.test_id} className={`flex items-center gap-3 px-5 py-3.5 ${idx === 0 ? 'bg-blue-50/40' : ''}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${result === 'OK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        #{h.evaluation_number || evaluationHistory.length - idx}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{h.model_name} · {h.test_date}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Test #{h.test_id}</p>
                      </div>
                      <StatusChip result={result} />
                      {idx === 0 && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black">Latest</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* LOADING */}
        {mode === 'loading' && (
          <div className="bg-white rounded-3xl shadow p-16 text-center border border-slate-200">
            <div className="relative w-14 h-14 mx-auto mb-4">
              <div className="w-14 h-14 border-4 border-indigo-100 rounded-full" />
              <div className="absolute inset-0 w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-slate-600 font-bold">Loading test records…</p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-red-800 text-sm">Error</p>
              <pre className="text-xs text-red-700 mt-1.5 bg-red-100 p-2.5 rounded-xl whitespace-pre-wrap break-all">{error}</pre>
            </div>
            <button onClick={() => setError(null)} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0">
              <XCircle className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}

        {/* REEVAL SCHEDULE SCREEN */}
        {mode === 'reeval-schedule' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                {isEditingReeval ? <Pencil className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                {isEditingReeval ? 'Edit Re-evaluation Schedule' : 'Schedule Re-evaluation'}
              </h2>
              <p className="text-amber-100 text-sm mt-1">
                {isEditingReeval ? 'Update the extension period and re-test date' : "Plan the trainee's extension period and re-test date"}
              </p>
              {/* Sync note */}
              <div className="mt-3 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
                <Link className="w-4 h-4 text-white/70 flex-shrink-0" />
                <p className="text-xs text-white/80 font-semibold">
                  This schedule will automatically sync to the Plan Sheet as a Re-Inspection Plan.
                </p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800 leading-relaxed">
                  <strong>Company Policy:</strong> Trainee must complete <strong>1–2 weeks</strong> of additional supervised work before re-evaluation.
                </p>
              </div>
              <div>
                <p className="text-xs font-black text-slate-500 mb-3 uppercase tracking-widest">Select Extension Period</p>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setReevalExtensionWeeks(w)}
                      className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${reevalExtensionWeeks === w ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-100' : 'border-slate-200 hover:border-amber-300 bg-white'}`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all ${reevalExtensionWeeks === w ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>{w}W</div>
                      <p className={`font-black text-sm ${reevalExtensionWeeks === w ? 'text-amber-800' : 'text-slate-600'}`}>{w} Week{w > 1 ? 's' : ''} Extension</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Re-evaluation Date</label>
                  <input
                    type="date"
                    value={reevalScheduledDate}
                    onChange={e => setReevalScheduledDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-2xl font-bold focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Days From Now</label>
                  <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 py-3 text-center">
                    <p className="text-3xl font-black text-blue-600">
                      {Math.max(0, Math.ceil((new Date(reevalScheduledDate).getTime() - Date.now()) / 86400000))}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">days remaining</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => { setMode('view'); setIsEditingReeval(false); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-slate-200 rounded-2xl hover:bg-slate-50 font-bold text-sm text-slate-600 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleScheduleReeval}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-200 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                  ) : (
                    <><Save className="w-4 h-4" /> {isEditingReeval ? 'Update Schedule' : 'Confirm Schedule & Sync to Plan'}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN FORM / VIEW */}
        {(mode === 'edit' || mode === 'view') && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isViewMode && currentEvalNumber > 1 && (
              <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-300 flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-amber-200 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <p className="font-black text-amber-900 text-sm">Re-evaluation #{currentEvalNumber - 1}</p>
                  <p className="text-xs text-amber-700">Re-testing after supervised extension period</p>
                </div>
                {/* Show linked plan */}
                {activeReinspectionPlan && (
                  <button type="button" onClick={navigateToPlan} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-200 transition-all">
                    <Link className="w-3 h-3" /> View Plan #{activeReinspectionPlan.plan_id}
                  </button>
                )}
              </div>
            )}

            {/* TEST INFORMATION */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <SectionHeader icon={FileText} label="Test Information" accent="bg-slate-50 border-slate-100 text-slate-600">
                {isViewMode && savedTest && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black border border-blue-200">#{savedTest.test_id}</span>
                )}
              </SectionHeader>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Test Date', key: 'testDate', type: 'date' },
                  { label: 'Model Name', key: 'modelName', type: 'text', placeholder: 'e.g., KT-001' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{f.label}</label>
                    {isViewMode ? (
                      <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-900 text-sm">{(formData as any)[f.key]}</div>
                    ) : (
                      <input
                        type={f.type}
                        value={(formData as any)[f.key]}
                        onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        placeholder={(f as any).placeholder}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none font-semibold transition-all text-sm"
                        required
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* BEFORE TEST */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <SectionHeader icon={BarChart3} label="Before Test — Parts Inventory" accent="bg-emerald-50 border-emerald-100 text-emerald-700" />
              <div className="p-5">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: 'Total Parts', key: 'totalPartsBefore', color: 'slate' },
                    { label: 'OK Parts', key: 'okPartsBefore', color: 'green' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{f.label}</label>
                      {isViewMode ? (
                        <MetricCard label={f.label} value={(formData as any)[f.key]} accent={f.color as any} />
                      ) : (
                        <input
                          type="number"
                          value={(formData as any)[f.key]}
                          onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                          placeholder="0"
                          min="0"
                          className="w-full px-3 py-3 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-300 text-2xl font-black text-center outline-none transition-all"
                          required
                        />
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reject Parts</label>
                    <MetricCard label="Reject" value={rejectBefore} accent="red" />
                  </div>
                </div>
                {(parseInt(formData.totalPartsBefore) || 0) > 0 && (
                  <div className="mt-1">
                    <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 shadow-inner">
                      <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 rounded-l-full"
                        style={{ width: `${((parseInt(formData.okPartsBefore) || 0) / (parseInt(formData.totalPartsBefore) || 1)) * 100}%` }} />
                      <div className="bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                        style={{ width: `${(rejectBefore / (parseInt(formData.totalPartsBefore) || 1)) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                      <span className="text-emerald-600 font-bold">OK: {formData.okPartsBefore || 0}</span>
                      <span className="text-red-500 font-bold">Reject: {rejectBefore}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PLANTED DEFECTS */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <SectionHeader icon={AlertTriangle} label="Planted Defects" accent="bg-orange-50 border-orange-100 text-orange-700">
                <div className="flex items-center gap-2">
                  {totalPlanted > 0 && <span className="px-2.5 py-0.5 bg-orange-200 text-orange-800 rounded-full text-xs font-black">{totalPlanted} total</span>}
                  {!isViewMode && (
                    <button type="button" onClick={addDefect} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 text-xs font-black shadow-sm transition-all">
                      <Plus className="w-3.5 h-3.5" /> Add Defect
                    </button>
                  )}
                </div>
              </SectionHeader>
              <div className="p-5 space-y-4">
                {selectedDefects.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <AlertTriangle className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold text-sm">No defects added</p>
                    {!isViewMode && <p className="text-xs text-slate-400 mt-1">Tap "Add Defect" to plant defects</p>}
                  </div>
                ) : isViewMode ? (
                  <div className="space-y-3">
                    {plantedCategoryIds.map(catId => (
                      <CategoryPlantedCard key={catId} catData={plantedByCategory[catId]} paletteIndex={plantedByCategory[catId].paletteIndex} />
                    ))}
                    <div className="flex items-center justify-between px-4 py-3 bg-orange-50 rounded-2xl border-2 border-orange-200">
                      <span className="text-sm font-black text-orange-700 uppercase tracking-wider">Total Planted</span>
                      <span className="text-2xl font-black text-orange-600">{totalPlanted}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedDefects.map((defect, idx) => {
                      const catId = Number(defect.defect_category);
                      const cat = defectCategories.find(c => c.category_id === catId);
                      const palIdx = catId ? plantedCategoryIds.indexOf(catId) : -1;
                      const palette = palIdx >= 0 ? CAT_PALETTES[palIdx % CAT_PALETTES.length] : { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-300' };
                      return (
                        <div key={idx} className={`flex gap-3 items-center p-3.5 rounded-2xl border-2 ${palette.border} ${palette.bg} transition-all`}>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${palette.badge}`}>{idx + 1}</div>
                          <div className="flex-1 grid grid-cols-3 gap-2.5">
                            <div>
                              <p className="text-[9px] text-slate-400 uppercase font-black mb-1.5">Category</p>
                              <select value={defect.defect_category} onChange={e => updateDefect(idx, 'defect_category', parseInt(e.target.value))} className="w-full px-2.5 py-2 border-2 border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-400 bg-white transition-all" required>
                                <option value={0}>Select…</option>
                                {defectCategories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                              </select>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-400 uppercase font-black mb-1.5">Defect Type</p>
                              <select value={defect.defect_type} onChange={e => updateDefect(idx, 'defect_type', parseInt(e.target.value))} disabled={!defect.defect_category} className="w-full px-2.5 py-2 border-2 border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-400 bg-white disabled:bg-slate-50 transition-all" required>
                                <option value={0}>Select…</option>
                                {cat?.defect_types.map(d => <option key={d.defect_type_id} value={d.defect_type_id}>{d.defect_name}</option>)}
                              </select>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-400 uppercase font-black mb-1.5">Planted Qty</p>
                              <input type="number" value={defect.quantity} onChange={e => updateDefect(idx, 'quantity', e.target.value)} placeholder="0" min="1" className="w-full px-2.5 py-2 border-2 border-slate-200 rounded-xl text-sm font-black outline-none focus:border-blue-400 text-center transition-all" required />
                            </div>
                          </div>
                          <button type="button" onClick={() => removeDefect(idx)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                    {plantedCategoryIds.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Summary by Category</p>
                        <div className="grid gap-3">
                          {plantedCategoryIds.map(catId => {
                            const data = plantedByCategory[catId];
                            const palette = CAT_PALETTES[data.paletteIndex % CAT_PALETTES.length];
                            return (
                              <div key={catId} className={`${palette.bg} rounded-2xl border-2 ${palette.border} overflow-hidden`}>
                                <div className="px-4 py-2.5 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${palette.dot}`} />
                                    <span className={`text-sm font-black ${palette.text}`}>{data.categoryName}</span>
                                  </div>
                                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${palette.badge}`}>Total: {data.totalQty}</span>
                                </div>
                                <div className="bg-white/70 divide-y divide-slate-50">
                                  {data.defectDetails.map(dd => (
                                    <div key={dd.defectTypeId} className="flex items-center justify-between px-4 py-2">
                                      <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${palette.dot} opacity-60`} />
                                        <span className="text-xs text-slate-600 font-semibold">{dd.defectName}</span>
                                      </div>
                                      <span className={`text-sm font-black ${palette.text}`}>{dd.qty}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 bg-orange-50 rounded-2xl border-2 border-orange-200 mt-2">
                          <span className="text-sm font-black text-orange-700">Grand Total Planted</span>
                          <span className="text-xl font-black text-orange-600">{totalPlanted}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* AFTER TEST — OPERATOR FINDINGS */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <SectionHeader icon={ScanLine} label="After Test — Operator Findings" accent="bg-violet-50 border-violet-100 text-violet-700">
                {allPlantedTypeIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-violet-500 uppercase tracking-wider">
                      {Object.keys(afterTestByType).filter(k => afterTestByType[Number(k)] !== '').length}/{allPlantedTypeIds.length} filled
                    </span>
                    <div className="flex gap-1">
                      {allPlantedTypeIds.map(id => {
                        const filled = afterTestByType[id] !== undefined && afterTestByType[id] !== '';
                        let plantedQty = 0;
                        for (const cid of plantedCategoryIds) {
                          const dd = plantedByCategory[cid].defectDetails.find(d => d.defectTypeId === id);
                          if (dd) { plantedQty = dd.qty; break; }
                        }
                        const match = filled && parseInt(afterTestByType[id]) === plantedQty;
                        return <div key={id} className={`w-2 h-2 rounded-full transition-all ${match ? 'bg-emerald-500' : filled ? 'bg-red-400' : 'bg-slate-200'}`} />;
                      })}
                    </div>
                  </div>
                )}
              </SectionHeader>
              <div className="p-5 space-y-5">
                <div className="md:w-1/3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">OK Parts After Test</label>
                  {isViewMode ? (
                    <MetricCard label="OK After" value={formData.okPartsAfter} accent="purple" />
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.okPartsAfter}
                        onChange={e => setFormData({ ...formData, okPartsAfter: e.target.value })}
                        placeholder="0"
                        min="0"
                        className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-violet-300 text-2xl font-black text-center outline-none transition-all ${formData.okPartsAfter && formData.okPartsBefore
                          ? parseInt(formData.okPartsAfter) === parseInt(formData.okPartsBefore) ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-red-400 bg-red-50 text-red-800'
                          : 'border-slate-200'}`}
                        required
                      />
                      {formData.okPartsBefore && formData.okPartsAfter && (
                        <div className={`mt-1.5 text-center text-xs font-bold ${parseInt(formData.okPartsAfter) === parseInt(formData.okPartsBefore) ? 'text-emerald-600' : 'text-red-600'}`}>
                          {parseInt(formData.okPartsAfter) === parseInt(formData.okPartsBefore) ? '✓ Matches OK before' : `Expected ${formData.okPartsBefore}, got ${formData.okPartsAfter}`}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {plantedCategoryIds.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-slate-200" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Found Defects — By Category & Type</span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className="space-y-4">
                      {plantedCategoryIds.map(catId => {
                        const data = plantedByCategory[catId];
                        const foundByType: Record<number, string> = {};
                        data.defectDetails.forEach(dd => { foundByType[dd.defectTypeId] = afterTestByType[dd.defectTypeId] || ''; });
                        return (
                          <CategoryFoundCard
                            key={catId}
                            catId={catId}
                            catName={data.categoryName}
                            plantedQty={data.totalQty}
                            defectDetails={data.defectDetails}
                            foundByType={foundByType}
                            onChangeType={(dtId, val) => setAfterTestByType(p => ({ ...p, [dtId]: val }))}
                            isViewMode={isViewMode}
                            paletteIndex={data.paletteIndex}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">Grand Total</span>
                        <span className="text-[9px] text-slate-400 font-semibold">(judgment is per-defect-type)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-slate-400 font-semibold">Planted</p>
                          <p className="text-xl font-black text-orange-600">{totalPlanted}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <div className="text-center">
                          <p className="text-xs text-slate-400 font-semibold">Found</p>
                          <p className={`text-2xl font-black px-4 py-1.5 rounded-xl border-2 shadow-sm ${totalFound === totalPlanted && totalFound > 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : totalFound > 0 ? 'text-red-700 bg-red-50 border-red-200' : 'text-violet-700 bg-white border-violet-200'}`}>{totalFound}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <ShieldX className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400 font-semibold">Add planted defects above first</p>
                  </div>
                )}
              </div>
            </div>

            {/* JUDGMENT RESULT PANEL */}
            {displayJudgment && (
              <div className={`rounded-3xl shadow-xl overflow-hidden border-2 ${displayJudgment.status === 'OK' ? 'border-emerald-400 shadow-emerald-100' : 'border-red-400 shadow-red-100'}`}>
                <div className={`p-5 flex items-center justify-between ${displayJudgment.status === 'OK' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                  <div className="flex items-center gap-3">
                    {displayJudgment.status === 'OK' ? <Award className="w-7 h-7 text-white" /> : <AlertTriangle className="w-7 h-7 text-white" />}
                    <div>
                      <h3 className="text-base font-black text-white">Judgment Result</h3>
                      <p className="text-white/65 text-xs mt-0.5">
                        {displayJudgment.status === 'OK'
                          ? 'All defect type checks passed — Trainee is qualified'
                          : 'One or more defect type checks failed — Re-evaluation required'}
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white px-5 py-2 bg-white/20 rounded-2xl border-2 border-white/30">
                    {displayJudgment.status}
                  </div>
                </div>
                <div className="bg-white divide-y divide-slate-100">
                  <div className={`flex items-center gap-4 px-5 py-3.5 ${displayJudgment.okMatch ? 'bg-emerald-50/30' : 'bg-red-50/30'}`}>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">OK Parts Count</p>
                      <p className="text-[10px] text-slate-400">Before must equal After</p>
                    </div>
                    <div className="flex items-center gap-3 text-center">
                      <div>
                        <p className="text-xl font-black text-slate-700">{formData.okPartsBefore}</p>
                        <p className="text-[9px] text-slate-400">before</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                      <div>
                        <p className={`text-xl font-black ${displayJudgment.okMatch ? 'text-emerald-700' : 'text-red-700'}`}>{formData.okPartsAfter}</p>
                        <p className="text-[9px] text-slate-400">after</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border-2 flex-shrink-0 ${displayJudgment.okMatch ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
                      {displayJudgment.okMatch ? <><CheckCircle className="w-3.5 h-3.5" /> PASS</> : <><XCircle className="w-3.5 h-3.5" /> FAIL</>}
                    </span>
                  </div>
                  {displayJudgment.categoryResults.map((cr, catIdx) => {
                    const palette = CAT_PALETTES[catIdx % CAT_PALETTES.length];
                    return (
                      <div key={cr.categoryId}>
                        <div className={`flex items-center justify-between px-5 py-2.5 ${palette.bg} border-b border-slate-100`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${palette.dot}`} />
                            <span className={`font-black text-sm ${palette.text}`}>{cr.categoryName}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${palette.badge}`}>{cr.plantedQty} planted → {cr.foundQty} found</span>
                          </div>
                          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black border ${cr.match ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
                            {cr.match ? <><CheckCircle className="w-3 h-3" /> PASS</> : <><XCircle className="w-3 h-3" /> FAIL</>}
                          </span>
                        </div>
                        {cr.defectTypeResults.map(dtr => (
                          <div key={dtr.defectTypeId} className={`flex items-center gap-4 px-5 py-2.5 pl-10 border-b border-slate-50 ${dtr.match ? 'bg-emerald-50/10' : 'bg-red-50/20'}`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${palette.dot} opacity-60`} />
                                <p className="text-sm text-slate-700 font-semibold">{dtr.defectName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-center">
                              <div>
                                <p className="text-lg font-black text-orange-600">{dtr.plantedQty}</p>
                                <p className="text-[9px] text-slate-400">planted</p>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                              <div>
                                <p className={`text-lg font-black ${dtr.match ? 'text-emerald-700' : 'text-red-700'}`}>{dtr.foundQty}</p>
                                <p className="text-[9px] text-slate-400">found</p>
                              </div>
                            </div>
                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border flex-shrink-0 ${dtr.match ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
                              {dtr.match ? <><CheckCircle className="w-3 h-3" /> ✓</> : <><XCircle className="w-3 h-3" /> {dtr.foundQty > dtr.plantedQty ? `+${dtr.foundQty - dtr.plantedQty}` : `${dtr.foundQty - dtr.plantedQty}`}</>}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
                <div className={`py-3 text-center text-xs font-black ${displayJudgment.status === 'OK' ? 'bg-emerald-50 text-emerald-800 border-t-2 border-emerald-200' : 'bg-red-50 text-red-800 border-t-2 border-red-200'}`}>
                  {displayJudgment.status === 'OK'
                    ? '🏆 All defect types correctly identified — Trainee is qualified!'
                    : '⚠️ Defect type mismatch — 1–2 week supervised extension + Re-evaluation required'}
                </div>
              </div>
            )}

            {/* FAIL: RE-INSPECTION SECTION */}
            {isTestFailed && (
              <div className="bg-white rounded-3xl shadow-sm border-2 border-red-200 overflow-hidden">
                <SectionHeader icon={ClipboardList} label="Re-evaluation Required" accent="bg-red-50 border-red-100 text-red-700" />
                <div className="p-5 space-y-4">
                  <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 flex items-start gap-3 shadow-sm">
                    <BookOpen className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 leading-relaxed">
                      <strong>Policy:</strong> Trainee must complete <strong>1–2 weeks</strong> of additional supervised work before re-evaluation.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Re-inspection Qty *</label>
                      {isViewMode ? (
                        <div className="px-4 py-3 bg-red-50 rounded-2xl border-2 border-red-200 text-xl font-black text-red-700 text-center">{formData.reInspectionQty || '—'}</div>
                      ) : (
                        <input type="number" value={formData.reInspectionQty} onChange={e => setFormData({ ...formData, reInspectionQty: e.target.value })} placeholder="0" min="0" className="w-full px-4 py-3 border-2 border-red-200 rounded-2xl focus:ring-2 focus:ring-red-300 font-bold outline-none transition-all" required />
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Remarks *</label>
                      {isViewMode ? (
                        <div className="px-4 py-3 bg-red-50 rounded-2xl border-2 border-red-200 text-sm text-slate-700 min-h-[52px]">{formData.remarks || '—'}</div>
                      ) : (
                        <textarea value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} placeholder="Reason for failure and action plan…" rows={2} className="w-full px-4 py-3 border-2 border-red-200 rounded-2xl focus:ring-2 focus:ring-red-300 resize-none text-sm outline-none transition-all" required />
                      )}
                    </div>
                  </div>

                  {isViewMode && !savedTest?.reeval_scheduled_date && !activeReinspectionPlan && (
                    <button
                      type="button"
                      onClick={() => { setIsEditingReeval(false); setMode('reeval-schedule'); }}
                      className="w-full flex items-center justify-center gap-2.5 px-5 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-amber-200 hover:from-amber-600 hover:to-orange-600 transition-all"
                    >
                      <Calendar className="w-5 h-5" />
                      Schedule Re-evaluation & Sync to Plan Sheet
                    </button>
                  )}

                  {isViewMode && savedTest?.reeval_scheduled_date && (
                    <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-300 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-amber-700" />
                        </div>
                        <div>
                          <p className="font-black text-amber-900 text-sm">Re-evaluation Scheduled ✓</p>
                          <p className="text-xs text-amber-700 font-mono mt-0.5">
                            Date: <strong>{savedTest.reeval_scheduled_date}</strong> · {savedTest.reeval_extension_weeks} week extension
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={openReevalEdit} className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all flex-shrink-0">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PASS: Remarks */}
            {isTestPassed && !isViewMode && (
              <div className="bg-emerald-50 rounded-3xl p-5 border-2 border-emerald-300 flex items-center gap-4 shadow-sm shadow-emerald-100">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-200">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-emerald-900 text-base">
                    {currentEvalNumber > 1 ? '🎉 Re-evaluation Passed!' : '🏆 Trainee Qualified!'}
                  </h4>
                  <p className="text-sm text-emerald-700 mt-0.5">All planted defects correctly identified.</p>
                  {activeReinspectionPlan && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      <Link className="w-3 h-3" />
                      Plan #{activeReinspectionPlan.plan_id} will be marked Completed on save.
                    </p>
                  )}
                </div>
              </div>
            )}

            {isTestPassed && !isViewMode && (
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Remarks <span className="text-slate-300 font-normal normal-case">(Optional)</span>
                </label>
                <textarea value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} placeholder="Additional notes…" rows={2} className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-300 resize-none text-sm outline-none transition-all" />
              </div>
            )}

            {isViewMode && isTestPassed && formData.remarks && (
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Remarks</p>
                <p className="text-sm text-slate-700">{formData.remarks}</p>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-between pt-1">
              {isViewMode ? (
                <>
                  {isTestFailed && !savedTest?.reeval_scheduled_date && !activeReinspectionPlan && (
                    <button
                      type="button"
                      onClick={() => { setIsEditingReeval(false); setMode('reeval-schedule'); }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Re-eval
                    </button>
                  )}
                  <div className="ml-auto">
                    <button
                      type="button"
                      onClick={() => startNewTest()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      New Test
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    {savedTest && (
                      <button
                        type="button"
                        onClick={() => { populateFormFromSaved(savedTest); setMode('view'); }}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 border-2 border-indigo-200 text-indigo-700 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        View Saved
                      </button>
                    )}
                    <button type="button" onClick={handleReset} className="px-4 py-2.5 border-2 border-slate-200 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all" disabled={loading}>
                      Reset
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> {currentEvalNumber > 1 ? `Save Re-eval #${currentEvalNumber - 1}` : 'Save Test'}</>
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        )}

        <p className="text-center text-[10px] text-slate-400 pb-8 font-mono tracking-wide">
          Poison Cake Test · Fail → 1–2 week extension → Re-evaluation · Plans sync automatically
        </p>
      </div>
    </div>
  );
};

export default PoisonTestSheet;