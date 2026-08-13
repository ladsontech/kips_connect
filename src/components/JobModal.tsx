import React from 'react';
import {
  X,
  MapPin,
  Phone,
  UserRound,
  CalendarDays,
  Camera,
  Wrench,
  PackageCheck,
  ListChecks,
  FileText,
} from 'lucide-react';
import type { Job, JobStatus } from '../types';

interface JobModalProps {
  job: Job | null;
  onClose: () => void;
  updateJobStatus: (jobId: string, status: JobStatus, actor: string) => void;
  getClient: (id: string) => any;
  getSite: (id: string) => any;
  getTechnician: (id: string) => any;
  statusLabels: Record<JobStatus, string>;
  formatDate: (val: string) => string;
  formatDateTime: (val: string) => string;
}

export const JobModal: React.FC<JobModalProps> = ({
  job,
  onClose,
  updateJobStatus,
  getClient,
  getSite,
  getTechnician,
  statusLabels,
  formatDate,
  formatDateTime,
}) => {
  if (!job) return null;

  const client = getClient(job.clientId);
  const site = getSite(job.siteId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-label="Close modal backdrop"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl animate-slide-up">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
            {job.jobNumber}
          </span>
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-bold ${
              job.priority === 'urgent'
                ? 'bg-red-100 text-red-700'
                : 'bg-sky-100 text-sky-700'
            }`}
          >
            {job.priority.toUpperCase()}
          </span>
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-bold ${
              job.status === 'completed'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {statusLabels[job.status]}
          </span>
        </div>

        {/* Title */}
        <div className="mt-3">
          <h2 className="text-xl font-black text-slate-950 sm:text-2xl">{job.title}</h2>
          <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{job.description}</p>
        </div>

        {/* Client & Assignment Info */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Client & Site
            </p>
            <h3 className="mt-1 text-base font-bold text-slate-900">{client?.name}</h3>
            <div className="mt-2 space-y-1.5 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{site?.name} — {site?.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{site?.contactPhone}</span>
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Assigned Field Team
            </p>
            <div className="mt-2 space-y-1.5 text-xs font-medium text-slate-700">
              {job.assignedTechnicianIds.length > 0 ? (
                job.assignedTechnicianIds.map((id) => (
                  <p key={id} className="flex items-center gap-2 font-semibold text-slate-900">
                    <UserRound className="h-3.5 w-3.5 text-kibs-deepGreen shrink-0" />
                    <span>{getTechnician(id)?.name} ({getTechnician(id)?.role})</span>
                  </p>
                ))
              ) : (
                <p className="text-xs font-bold text-red-600">Unassigned</p>
              )}
              {job.scheduledDate && (
                <p className="flex items-center gap-2 text-slate-500 pt-1">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Scheduled: {formatDate(job.scheduledDate)} {job.scheduledTime}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Diagnosis & Work Performed if completed */}
        {(job.diagnosis || job.workPerformed) && (
          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs text-slate-800">
            <h4 className="font-extrabold uppercase text-emerald-900 tracking-wide mb-2">Technician Report Summary</h4>
            {job.diagnosis && (
              <p className="mt-1"><strong>Diagnosis:</strong> {job.diagnosis}</p>
            )}
            {job.workPerformed && (
              <p className="mt-1"><strong>Work Completed:</strong> {job.workPerformed}</p>
            )}
          </div>
        )}

        {/* Status History Timeline */}
        <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-100">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Status Audit Log
          </p>
          <div className="mt-3 space-y-2.5">
            {job.statusHistory.map((item, idx) => (
              <div key={`${item.status}-${idx}`} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-kibs-deepGreen" />
                  <span className="font-bold text-slate-900">{statusLabels[item.status]}</span>
                  <span className="text-slate-500">by {item.actor}</span>
                </div>
                <span className="text-[11px] text-slate-400">{formatDateTime(item.at)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {(['assigned', 'in_progress', 'completed'] as JobStatus[]).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                updateJobStatus(job.id, st, 'Manager');
              }}
              className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition ${
                job.status === st
                  ? 'border-kibs-deepGreen bg-kibs-green/15 text-kibs-deepGreen shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <ListChecks className="h-3.5 w-3.5" />
              <span>{statusLabels[st]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
