import React, { useState } from 'react';
import { ArrowLeft, Mail, MapPin, Pencil, Phone, Trash2, UserRound } from 'lucide-react';
import { JOB_TYPE_LABELS, type Report, type SiteAssignment, type User } from '../types';
import { SurveyList } from './SurveyList';
import { AssignmentList } from './AssignmentList';

interface TechnicianDetailProps {
  technician: User;
  reports: Report[];
  assignments: SiteAssignment[];
  onBack: () => void;
  onEdit: (technician: User) => void;
  onRemove: (technicianId: string) => void;
  onSelectReport: (report: Report) => void;
  onViewReport: (reportId: string) => void;
  formatDate: (value: string) => string;
}

const StatBox: React.FC<{ label: string; value: number; strong?: boolean }> = ({
  label,
  value,
  strong,
}) => (
  <div className={`rounded-xl p-3 text-center ${strong ? 'bg-kibs-ink text-white' : 'bg-slate-100 text-slate-900'}`}>
    <p className="text-lg font-black">{value}</p>
    <p className={`text-[10px] font-bold uppercase tracking-wide ${strong ? 'text-white/60' : 'text-slate-500'}`}>
      {label}
    </p>
  </div>
);

export const TechnicianDetail: React.FC<TechnicianDetailProps> = ({
  technician,
  reports,
  assignments,
  onBack,
  onEdit,
  onRemove,
  onSelectReport,
  onViewReport,
  formatDate,
}) => {
  const [tab, setTab] = useState<'reports' | 'sites'>('reports');

  const theirReports = reports.filter((r) => r.technicianId === technician.id);
  const theirAssignments = assignments.filter((a) => a.technicianId === technician.id);
  const activeSites = theirAssignments.filter((a) => a.status === 'assigned');
  const onSite = activeSites.length > 0;

  const pending = theirReports.filter((r) => r.status === 'pending').length;
  const approved = theirReports.filter((r) => r.status === 'approved').length;
  const rejected = theirReports.filter((r) => r.status === 'rejected').length;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All technicians
      </button>

      <div className="rounded-2xl bg-white p-4 shadow-card sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-kibs-ink">
              <UserRound className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-slate-950">{technician.name}</h2>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    onSite ? 'bg-kibs-ink text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {onSite ? 'On Site' : 'Free'}
                </span>
              </div>
              <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                <Mail className="h-3 w-3 shrink-0" /> {technician.email}
              </p>
              {technician.phone && (
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone className="h-3 w-3 shrink-0" /> {technician.phone}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(technician)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-kibs-ink"
              aria-label={`Edit ${technician.name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(technician.id)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              aria-label={`Remove ${technician.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {onSite ? 'Currently on site' : 'Current status'}
          </p>
          {onSite ? (
            <div className="mt-2 space-y-1.5">
              {activeSites.map((site) => (
                <p key={site.id} className="flex items-start gap-1.5 text-xs font-semibold text-slate-700">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>
                    {site.siteName}
                    <span className="font-medium text-slate-500">
                      {' '}
                      · {JOB_TYPE_LABELS[site.type]} · assigned {formatDate(site.assignedAt)}
                    </span>
                  </span>
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-1.5 text-xs text-slate-500">
              Free — no open site assignments right now.
            </p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <StatBox label="Reports" value={theirReports.length} />
          <StatBox label="Pending" value={pending} strong={pending > 0} />
          <StatBox label="Approved" value={approved} />
          <StatBox label="Rejected" value={rejected} />
        </div>
      </div>

      <div className="flex gap-2">
        {(
          [
            { id: 'reports' as const, label: `Reports (${theirReports.length})` },
            { id: 'sites' as const, label: `Site History (${theirAssignments.length})` },
          ]
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setTab(option.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === option.id
                ? 'bg-kibs-ink text-white shadow-card'
                : 'bg-white text-slate-600 shadow-card hover:bg-slate-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {tab === 'reports' ? (
        <SurveyList
          surveys={theirReports}
          onSelect={onSelectReport}
          showFilters
          emptyMessage={`${technician.name} hasn't submitted any reports yet.`}
          formatDate={formatDate}
        />
      ) : (
        <AssignmentList
          assignments={theirAssignments}
          formatDate={formatDate}
          emptyMessage={`${technician.name} hasn't been assigned any sites yet.`}
          showTechnician
          onViewSurvey={onViewReport}
        />
      )}
    </div>
  );
};
