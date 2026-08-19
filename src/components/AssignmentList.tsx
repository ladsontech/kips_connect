import React from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Hash,
  MapPin,
  Pencil,
  Phone,
  User as UserIcon,
  X,
} from 'lucide-react';
import { JOB_TYPE_LABELS, type SiteAssignment } from '../types';

interface AssignmentListProps {
  assignments: SiteAssignment[];
  formatDate: (value: string) => string;
  emptyMessage: string;
  showTechnician?: boolean;
  onStartSurvey?: (assignment: SiteAssignment) => void;
  onCancel?: (assignmentId: string) => void;
  onViewSurvey?: (surveyId: string) => void;
  onEdit?: (assignment: SiteAssignment) => void;
}

export const AssignmentList: React.FC<AssignmentListProps> = ({
  assignments,
  formatDate,
  emptyMessage,
  showTechnician,
  onStartSurvey,
  onCancel,
  onViewSurvey,
  onEdit,
}) => {
  if (assignments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((assignment) => {
        // Once a technician's own assignment is completed, the client's
        // contact details are no longer shown to them — only to admins
        // (who always see the full picture via showTechnician).
        const contactHidden = !showTechnician && assignment.status === 'completed';
        const isOnSite = assignment.status === 'assigned';
        const canCall = !contactHidden && Boolean(assignment.contactPhone);

        return (
          <div
            key={assignment.id}
            className="overflow-hidden rounded-2xl bg-white shadow-card transition hover:shadow-cardHover"
          >
            {/* Status accent — a quick-scan strip like a task-list ticket stub. */}
            <div className={`h-1.5 w-full ${isOnSite ? 'bg-kibs-ink' : 'bg-slate-200'}`} />

            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-600">
                    {JOB_TYPE_LABELS[assignment.type]}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      isOnSite ? 'bg-kibs-ink text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isOnSite ? 'On Site' : 'Completed'}
                  </span>
                </div>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(assignment)}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-kibs-ink"
                    aria-label={`Edit ${assignment.siteName}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <h3 className="mt-2 text-base font-black leading-snug text-slate-950">
                {assignment.siteName}
              </h3>

              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-slate-400">
                <Hash className="h-3 w-3" />
                Order ID <span className="text-slate-600">{assignment.assignmentNumber}</span>
              </p>

              <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                <p className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {assignment.siteLocation}
                </p>
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  Appointment: {formatDate(assignment.assignedAt)}
                </p>
                {showTechnician && (
                  <p className="flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {assignment.technicianName}
                  </p>
                )}
                {!contactHidden && assignment.contactPerson && (
                  <p className="flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {assignment.contactPerson}
                  </p>
                )}
                {!contactHidden && assignment.contactPhone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {assignment.contactPhone}
                  </p>
                )}
                {contactHidden && assignment.contactPhone && (
                  <p className="flex items-center gap-1.5 text-slate-400">
                    <Phone className="h-3.5 w-3.5 shrink-0" /> Contact hidden after completion
                  </p>
                )}
              </div>

              {assignment.instructions && (
                <p className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs leading-relaxed text-slate-600">
                  {assignment.instructions}
                </p>
              )}

              <p className="mt-2 text-[10px] font-semibold text-slate-400">
                Assigned {formatDate(assignment.assignedAt)} by {assignment.assignedBy}
              </p>

              {(() => {
                const showStart = isOnSite && Boolean(onStartSurvey);
                if (!canCall && !showStart) return null;
                return (
                  <div className={`mt-3 grid gap-2 ${canCall && showStart ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {canCall && (
                      <a
                        href={`tel:${assignment.contactPhone}`}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-2.5 text-xs font-black text-slate-700 transition hover:border-kibs-ink hover:text-kibs-ink"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Place Call
                      </a>
                    )}
                    {showStart && (
                      <button
                        type="button"
                        onClick={() => onStartSurvey?.(assignment)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-kibs-ink py-2.5 text-xs font-black text-white transition hover:bg-black"
                      >
                        Start Report
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })()}

              {assignment.status === 'completed' && assignment.reportId && onViewSurvey && (
                <button
                  type="button"
                  onClick={() => onViewSurvey(assignment.reportId as string)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  View Submitted Report
                </button>
              )}

              {isOnSite && onCancel && (
                <button
                  type="button"
                  onClick={() => onCancel(assignment.id)}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold text-slate-400 transition hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                  Cancel Assignment
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
