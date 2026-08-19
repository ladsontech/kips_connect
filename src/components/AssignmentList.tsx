import React from 'react';
import { CheckCircle2, ChevronRight, MapPin, Pencil, Phone, User as UserIcon, X } from 'lucide-react';
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
    <div className="space-y-2.5">
      {assignments.map((assignment) => {
        // Once a technician's own assignment is completed, the client's
        // contact details are no longer shown to them — only to admins
        // (who always see the full picture via showTechnician).
        const contactHidden = !showTechnician && assignment.status === 'completed';

        return (
        <div key={assignment.id} className="rounded-2xl bg-white p-4 shadow-card transition hover:shadow-cardHover">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {JOB_TYPE_LABELS[assignment.type]}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  assignment.status === 'completed'
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-kibs-ink text-white'
                }`}
              >
                {assignment.status === 'completed' ? 'Completed' : 'On Site'}
              </span>
            </div>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(assignment)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-kibs-ink"
                aria-label={`Edit ${assignment.siteName}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <h3 className="mt-1.5 text-sm font-bold text-slate-900">{assignment.siteName}</h3>
          <div className="mt-1.5 space-y-1 text-xs text-slate-500">
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0 text-slate-400" /> {assignment.siteLocation}
            </p>
            {!contactHidden && assignment.contactPhone && (
              <p className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0 text-slate-400" /> {assignment.contactPhone}
              </p>
            )}
            {contactHidden && assignment.contactPhone && (
              <p className="flex items-center gap-1.5 text-slate-400">
                <Phone className="h-3 w-3 shrink-0" /> Contact hidden after completion
              </p>
            )}
            {showTechnician && (
              <p className="flex items-center gap-1.5">
                <UserIcon className="h-3 w-3 shrink-0 text-slate-400" /> {assignment.technicianName}
              </p>
            )}
          </div>

          {assignment.instructions && (
            <p className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs leading-relaxed text-slate-600">
              {assignment.instructions}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-400">
            <span>
              Assigned {formatDate(assignment.assignedAt)} by {assignment.assignedBy}
            </span>
          </div>

          {assignment.status === 'assigned' && onStartSurvey && (
            <button
              type="button"
              onClick={() => onStartSurvey(assignment)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-kibs-ink py-2.5 text-xs font-black text-white transition hover:bg-black"
            >
              Start Report
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}

          {assignment.status === 'assigned' && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(assignment.id)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
              Cancel Assignment
            </button>
          )}

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
        </div>
        );
      })}
    </div>
  );
};
