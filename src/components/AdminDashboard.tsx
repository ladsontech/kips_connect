import React from 'react';
import { ChevronRight, Clock, UserRound } from 'lucide-react';
import {
  JOB_TYPES,
  JOB_TYPE_LABELS,
  type JobType,
  type Report,
  type SiteAssignment,
  type User,
} from '../types';
import { SurveyList } from './SurveyList';

interface AdminDashboardProps {
  reports: Report[];
  assignments: SiteAssignment[];
  technicians: User[];
  onSelectReport: (report: Report) => void;
  onViewAll: () => void;
  onViewSites: () => void;
  onViewTechnicians: () => void;
  onSelectTechnician: (technician: User) => void;
  formatDate: (value: string) => string;
}

interface CategoryTileProps {
  label: string;
  total: number;
  open: number;
}

const CategoryTile: React.FC<CategoryTileProps> = ({ label, total, open }) => (
  <div className="rounded-2xl bg-white p-3 text-center shadow-card">
    <p className="text-2xl font-black text-slate-950">{total}</p>
    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 text-[10px] font-semibold text-slate-500">
      {open > 0 ? `${open} open` : 'None open'}
    </p>
  </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  assignments,
  technicians,
  onSelectReport,
  onViewAll,
  onViewSites,
  onViewTechnicians,
  onSelectTechnician,
  formatDate,
}) => {
  const openAssignments = assignments.filter((a) => a.status === 'assigned');
  const pendingReports = reports.filter((r) => r.status === 'pending');

  const categoryStats = JOB_TYPES.map((type: JobType) => ({
    type,
    label: JOB_TYPE_LABELS[type],
    total: assignments.filter((a) => a.type === type).length,
    open: openAssignments.filter((a) => a.type === type).length,
  }));

  // A technician is "on site" while they still have an assigned job open.
  const technicianStatus = technicians.map((technician) => {
    const active = openAssignments.filter((a) => a.technicianId === technician.id);
    return { technician, active };
  });
  const onSiteCount = technicianStatus.filter((t) => t.active.length > 0).length;

  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {categoryStats.map((stat) => (
          <CategoryTile key={stat.type} label={stat.label} total={stat.total} open={stat.open} />
        ))}
      </div>

      <button
        type="button"
        onClick={onViewSites}
        className="flex w-full items-center justify-between gap-3 rounded-2xl bg-kibs-ink p-4 text-left transition hover:bg-black"
      >
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 shrink-0 text-white/70" />
          <div>
            <p className="text-sm font-black text-white">
              {pendingReports.length} report{pendingReports.length === 1 ? '' : 's'} awaiting review
            </p>
            <p className="text-[11px] font-semibold text-white/60">
              {openAssignments.length} site{openAssignments.length === 1 ? '' : 's'} still out with technicians
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-white/60" />
      </button>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <UserRound className="h-3.5 w-3.5" /> Technicians
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-600">
              {onSiteCount}/{technicians.length} on site
            </span>
          </p>
          <button
            type="button"
            onClick={onViewTechnicians}
            className="text-xs font-bold text-slate-900 hover:underline"
          >
            Manage
          </button>
        </div>

        {technicianStatus.length > 0 ? (
          <div className="mt-3 divide-y divide-slate-100">
            {technicianStatus.map(({ technician, active }) => (
              <button
                key={technician.id}
                type="button"
                onClick={() => onSelectTechnician(technician)}
                className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-left transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900">{technician.name}</p>
                  <p className="truncate text-[11px] text-slate-500">
                    {active.length > 0
                      ? active.map((a) => a.siteName).join(', ')
                      : 'No open assignments'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      active.length > 0 ? 'bg-kibs-ink text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {active.length > 0 ? 'On Site' : 'Free'}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-400">
            No technicians yet — use Add Technician to create the first account.
          </p>
        )}
      </div>

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Recent Reports</p>
          <button type="button" onClick={onViewAll} className="text-xs font-bold text-slate-900 hover:underline">
            View all
          </button>
        </div>
        <SurveyList
          surveys={recentReports}
          onSelect={onSelectReport}
          showTechnician
          emptyMessage="No reports submitted yet."
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};
