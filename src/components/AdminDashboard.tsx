import React from 'react';
import {
  Camera,
  CheckCircle2,
  Clock,
  Lightbulb,
  ListChecks,
  Sun,
} from 'lucide-react';
import {
  CCTV_CATEGORIES,
  FLOODLIGHT_CATEGORIES,
  totalCount,
  type Survey,
} from '../types';
import { SurveyList } from './SurveyList';

interface AdminDashboardProps {
  surveys: Survey[];
  onSelectSurvey: (survey: Survey) => void;
  onViewAll: () => void;
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
      ? 'border-red-100 bg-red-50 text-red-700'
      : tone === 'approved'
        ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-white text-slate-950';
  const labelClasses =
    tone === 'pending' ? 'text-red-500' : tone === 'approved' ? 'text-emerald-600' : 'text-slate-500';

  return (
    <div className={`rounded-2xl border p-3 text-center ${toneClasses}`}>
      {Icon && <Icon className="mx-auto mb-1 h-4 w-4 opacity-70" />}
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
      <div className="mt-1 h-3.5 w-full overflow-hidden rounded-full bg-kibs-green/10">
        <div
          className="h-full rounded-full bg-kibs-deepGreen transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

interface TechnicianStat {
  id: string;
  name: string;
  approved: number;
  pending: number;
}

const TechnicianBar: React.FC<{ stat: TechnicianStat }> = ({ stat }) => {
  const total = stat.approved + stat.pending;
  const approvedPct = total > 0 ? (stat.approved / total) * 100 : 0;
  const pendingPct = total > 0 ? (stat.pending / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span>{stat.name}</span>
        <span className="text-slate-400">
          {total} survey{total === 1 ? '' : 's'}
        </span>
      </div>
      <div className="mt-1 flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
        {stat.approved > 0 && (
          <div className="h-full bg-emerald-500" style={{ width: `${approvedPct}%` }} />
        )}
        {stat.approved > 0 && stat.pending > 0 && <div className="h-full w-[2px] bg-white" />}
        {stat.pending > 0 && <div className="h-full bg-red-500" style={{ width: `${pendingPct}%` }} />}
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  surveys,
  onSelectSurvey,
  onViewAll,
  formatDate,
}) => {
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

  const technicianMap = new Map<string, TechnicianStat>();
  surveys.forEach((survey) => {
    const existing = technicianMap.get(survey.technicianId) ?? {
      id: survey.technicianId,
      name: survey.technicianName,
      approved: 0,
      pending: 0,
    };
    if (survey.status === 'approved') existing.approved += 1;
    else existing.pending += 1;
    technicianMap.set(survey.technicianId, existing);
  });
  const technicianStats = Array.from(technicianMap.values()).sort(
    (a, b) => b.approved + b.pending - (a.approved + a.pending)
  );

  const recentSurveys = [...surveys]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label="Total Surveys" value={total} icon={ListChecks} />
        <StatTile label="Pending" value={pending} tone="pending" icon={Clock} />
        <StatTile label="Approved" value={approved} tone="approved" icon={CheckCircle2} />
        <StatTile label="Approval Rate" value={total > 0 ? `${approvalRate}%` : '—'} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          <Sun className="h-3.5 w-3.5" /> Equipment Reported
        </p>
        <div className="mt-3 space-y-2.5">
          {equipmentTotals.map((item) => (
            <EquipmentBar key={item.label} label={item.label} value={item.value} max={equipmentMax} />
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <Camera className="h-3.5 w-3.5" /> CCTV by Rating
          </p>
          <div className="mt-3 space-y-2.5">
            {cctvTotals.map((item) => (
              <EquipmentBar key={item.label} label={item.label} value={item.value} max={cctvMax} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <Lightbulb className="h-3.5 w-3.5" /> Flood Lights by Rating
          </p>
          <div className="mt-3 space-y-2.5">
            {floodlightTotals.map((item) => (
              <EquipmentBar key={item.label} label={item.label} value={item.value} max={floodlightMax} />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <ListChecks className="h-3.5 w-3.5" /> Technician Activity
          </p>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Approved
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" /> Pending
            </span>
          </div>
        </div>
        {technicianStats.length > 0 ? (
          <div className="mt-3 space-y-3">
            {technicianStats.map((stat) => (
              <TechnicianBar key={stat.id} stat={stat} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-400">No surveys submitted yet.</p>
        )}
      </div>

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Recent Surveys
          </p>
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-kibs-deepGreen hover:underline"
          >
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
