import React, { useState } from 'react';
import {
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  Lightbulb,
  ListChecks,
  Sun,
} from 'lucide-react';
import {
  CCTV_CATEGORIES,
  FLOODLIGHT_CATEGORIES,
  totalCount,
  type SiteAssignment,
  type Survey,
} from '../types';
import { SurveyList } from './SurveyList';

interface AdminDashboardProps {
  surveys: Survey[];
  assignments: SiteAssignment[];
  onSelectSurvey: (survey: Survey) => void;
  onViewAll: () => void;
  onViewSites: () => void;
  formatDate: (value: string) => string;
}

interface StatTileProps {
  label: string;
  value: string | number;
  tone?: 'neutral' | 'pending' | 'approved';
  icon?: React.ElementType;
}

const StatTile: React.FC<StatTileProps> = ({ label, value, tone = 'neutral', icon: Icon }) => {
  const toneClasses =
    tone === 'pending'
      ? 'bg-kibs-ink text-white'
      : tone === 'approved'
        ? 'bg-slate-100 text-slate-500'
        : 'bg-white text-slate-950 shadow-card';
  const labelClasses = tone === 'pending' ? 'text-white/60' : tone === 'approved' ? 'text-slate-400' : 'text-slate-400';

  return (
    <div className={`rounded-2xl p-3 text-center ${toneClasses}`}>
      {Icon && <Icon className="mx-auto mb-1 h-4 w-4 opacity-60" />}
      <p className="text-xl font-black">{value}</p>
      <p className={`text-[10px] font-bold uppercase tracking-wide ${labelClasses}`}>{label}</p>
    </div>
  );
};

const EquipmentBar: React.FC<{ label: string; value: number; max: number }> = ({ label, value, max }) => {
  const pct = max > 0 ? Math.max(value > 0 ? 4 : 0, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span className="font-black text-slate-900">{value}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-kibs-ink transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  surveys,
  assignments,
  onSelectSurvey,
  onViewAll,
  onViewSites,
  formatDate,
}) => {
  const [showEquipmentDetail, setShowEquipmentDetail] = useState(false);
  const openAssignments = assignments.filter((a) => a.status === 'assigned');
  const total = surveys.length;
  const pending = surveys.filter((s) => s.status === 'pending').length;
  const approved = surveys.filter((s) => s.status === 'approved').length;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  const cctvTotals = CCTV_CATEGORIES.map((category) => ({
    label: category,
    value: surveys.reduce((sum, s) => sum + (s.cctv[category] || 0), 0),
  }));
  const floodlightTotals = FLOODLIGHT_CATEGORIES.map((category) => ({
    label: category,
    value: surveys.reduce((sum, s) => sum + (s.floodlights[category] || 0), 0),
  }));
  const solarTotal = surveys.reduce((sum, s) => sum + s.solarPanels, 0);
  const totalCctv = surveys.reduce((sum, s) => sum + totalCount(s.cctv), 0);
  const totalFloodlights = surveys.reduce((sum, s) => sum + totalCount(s.floodlights), 0);
  const equipmentTotals = [
    { label: 'CCTV Cameras', value: totalCctv },
    { label: 'Flood Lights', value: totalFloodlights },
    { label: 'Solar Panels', value: solarTotal },
  ];
  const equipmentMax = Math.max(1, ...equipmentTotals.map((e) => e.value));
  const cctvMax = Math.max(1, ...cctvTotals.map((e) => e.value));
  const floodlightMax = Math.max(1, ...floodlightTotals.map((e) => e.value));

  const recentSurveys = [...surveys]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label="Total Surveys" value={total} icon={ListChecks} />
        <StatTile label="Pending" value={pending} tone="pending" icon={Clock} />
        <StatTile label="Approved" value={approved} tone="approved" icon={CheckCircle2} />
        <StatTile label="Approval Rate" value={total > 0 ? `${approvalRate}%` : '—'} />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <Building2 className="h-3.5 w-3.5" /> Sites Awaiting Survey
            {openAssignments.length > 0 && (
              <span className="rounded-full bg-kibs-ink px-1.5 py-0.5 text-[10px] font-black text-white">
                {openAssignments.length}
              </span>
            )}
          </p>
          <button type="button" onClick={onViewSites} className="text-xs font-bold text-slate-900 hover:underline">
            View all
          </button>
        </div>
        {openAssignments.length > 0 ? (
          <div className="mt-3 divide-y divide-slate-100">
            {openAssignments.slice(0, 3).map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900">{assignment.siteName}</p>
                  <p className="truncate text-[11px] text-slate-500">
                    {assignment.technicianName} · {assignment.type === 'new_site' ? 'New Site' : 'Maintenance'}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-semibold text-slate-400">
                  {formatDate(assignment.assignedAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-400">No open assignments — tap Add Site to send a technician out.</p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          <Sun className="h-3.5 w-3.5" /> Equipment Reported
        </p>
        <div className="mt-3 space-y-2.5">
          {equipmentTotals.map((item) => (
            <EquipmentBar key={item.label} label={item.label} value={item.value} max={equipmentMax} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowEquipmentDetail((prev) => !prev)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-bold text-slate-500 transition hover:text-slate-900"
        >
          {showEquipmentDetail ? 'Hide breakdown by rating' : 'Show breakdown by rating'}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showEquipmentDetail ? 'rotate-180' : ''}`} />
        </button>

        {showEquipmentDetail && (
          <div className="mt-3 grid gap-5 border-t border-slate-100 pt-3 sm:grid-cols-2">
            <div className="space-y-2.5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <Camera className="h-3 w-3" /> CCTV Cameras
              </p>
              {cctvTotals.map((item) => (
                <EquipmentBar key={item.label} label={item.label} value={item.value} max={cctvMax} />
              ))}
            </div>
            <div className="space-y-2.5 border-t border-slate-100 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <Lightbulb className="h-3 w-3" /> Flood Lights
              </p>
              {floodlightTotals.map((item) => (
                <EquipmentBar key={item.label} label={item.label} value={item.value} max={floodlightMax} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Recent Surveys
          </p>
          <button type="button" onClick={onViewAll} className="text-xs font-bold text-slate-900 hover:underline">
            View all
          </button>
        </div>
        <SurveyList
          surveys={recentSurveys}
          onSelect={onSelectSurvey}
          showTechnician
          emptyMessage="No surveys submitted yet."
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};
