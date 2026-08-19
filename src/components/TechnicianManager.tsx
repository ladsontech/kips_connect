import React from 'react';
import { ClipboardList, Mail, MapPin, Pencil, Phone, Trash2, UserRound } from 'lucide-react';
import type { Report, SiteAssignment, User } from '../types';

interface TechnicianManagerProps {
  technicians: User[];
  reports: Report[];
  assignments: SiteAssignment[];
  onEdit: (technician: User) => void;
  onRemove: (technicianId: string) => void;
}

export const TechnicianManager: React.FC<TechnicianManagerProps> = ({
  technicians,
  reports,
  assignments,
  onEdit,
  onRemove,
}) => {
  if (technicians.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-400">
        No technicians yet. Use Add Technician to create the first account.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {technicians.map((technician) => {
        const reportCount = reports.filter((r) => r.technicianId === technician.id).length;
        const activeSites = assignments.filter(
          (a) => a.technicianId === technician.id && a.status === 'assigned'
        );
        const onSite = activeSites.length > 0;

        return (
          <div key={technician.id} className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-kibs-ink">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{technician.name}</h3>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        onSite ? 'bg-kibs-ink text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {onSite ? 'On Site' : 'Free'}
                    </span>
                  </div>
                  <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                    <Mail className="h-3 w-3 shrink-0" /> {technician.email}
                  </p>
                  {technician.phone && (
                    <p className="flex items-center gap-1 text-xs text-slate-500">
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

            <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <ClipboardList className="h-3.5 w-3.5 text-slate-400" /> {reportCount} report
                {reportCount === 1 ? '' : 's'} submitted
              </span>
              <span className="flex items-start gap-1.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="min-w-0">
                  {onSite ? activeSites.map((a) => a.siteName).join(', ') : 'No open assignments'}
                </span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
