import React from 'react';
import { Building2, ClipboardList, Mail, Phone, Trash2, UserRound } from 'lucide-react';
import type { SiteAssignment, Survey, User } from '../types';

interface TechnicianManagerProps {
  technicians: User[];
  surveys: Survey[];
  assignments: SiteAssignment[];
  onRemove: (technicianId: string) => void;
}

export const TechnicianManager: React.FC<TechnicianManagerProps> = ({
  technicians,
  surveys,
  assignments,
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
        const surveyCount = surveys.filter((s) => s.technicianId === technician.id).length;
        const openAssignments = assignments.filter(
          (a) => a.technicianId === technician.id && a.status === 'assigned'
        ).length;

        return (
          <div key={technician.id} className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-kibs-ink">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{technician.name}</h3>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <Mail className="h-3 w-3" /> {technician.email}
                  </p>
                  {technician.phone && (
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <Phone className="h-3 w-3" /> {technician.phone}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(technician.id)}
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove ${technician.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <ClipboardList className="h-3.5 w-3.5 text-slate-400" /> {surveyCount} survey
                {surveyCount === 1 ? '' : 's'}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" /> {openAssignments} open assignment
                {openAssignments === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
