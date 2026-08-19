import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  ImageOff,
  MapPin,
  Phone,
  User as UserIcon,
  X,
  XCircle,
} from 'lucide-react';
import { JOB_TYPE_LABELS, type Report } from '../types';
import { StatusBadge } from './StatusBadge';

interface SurveyModalProps {
  survey: Report | null;
  onClose: () => void;
  onApprove?: (reportId: string) => void;
  onReject?: (reportId: string, reason: string) => void;
  canApprove: boolean;
  formatDate: (value: string) => string;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({
  survey,
  onClose,
  onApprove,
  onReject,
  canApprove,
  formatDate,
}) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  // Reset the reject form whenever a different report is opened.
  useEffect(() => {
    setRejecting(false);
    setReason('');
  }, [survey?.id]);

  if (!survey) return null;

  // Once a report is approved, the client's contact details are no longer
  // shown to the technician who submitted it — only to admins (canApprove).
  const contactHidden = !canApprove && survey.status === 'approved';
  const hasContact = Boolean(survey.contactPerson || survey.contactPhone);
  const canReview = canApprove && survey.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs sm:items-center sm:p-4 animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-label="Close modal backdrop" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl animate-slide-up sm:rounded-3xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-wrap items-center gap-2 pr-8">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {survey.reportNumber}
          </span>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {JOB_TYPE_LABELS[survey.type]}
          </span>
          <StatusBadge status={survey.status} className="px-2.5 py-1 text-xs" />
        </div>

        <h2 className="mt-3 text-xl font-black text-slate-950">{survey.siteName}</h2>

        <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
          <p className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {survey.siteLocation}
          </p>
          {!contactHidden && survey.contactPerson && (
            <p className="flex items-center gap-2">
              <UserIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              {survey.contactPerson}
            </p>
          )}
          {!contactHidden && survey.contactPhone && (
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              {survey.contactPhone}
            </p>
          )}
          {contactHidden && hasContact && (
            <p className="flex items-center gap-2 text-slate-400">
              <UserIcon className="h-3.5 w-3.5 shrink-0" />
              Contact details hidden after approval
            </p>
          )}
          <p className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            Visited {formatDate(survey.reportDate)} by {survey.technicianName}
          </p>
        </div>

        <div className="mt-4 divide-y divide-slate-100 rounded-xl bg-slate-50/60">
          <div className="p-4">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <Camera className="h-3.5 w-3.5" /> Site Photos · {survey.photos.length}
            </p>
            {survey.photos.length > 0 ? (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {survey.photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setLightboxUrl(photo.url)}
                    className="aspect-square overflow-hidden rounded-lg bg-slate-100"
                  >
                    <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                <ImageOff className="h-3.5 w-3.5" /> No photos attached.
              </p>
            )}
          </div>

          <div className="p-4 text-xs text-slate-700">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Report Notes</p>
            {survey.notes ? (
              <p className="mt-1.5 whitespace-pre-wrap leading-relaxed">{survey.notes}</p>
            ) : (
              <p className="mt-1.5 text-slate-400">No notes were added.</p>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {survey.status === 'approved' && survey.reviewedBy && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approved by {survey.reviewedBy}
              {survey.reviewedAt ? ` on ${formatDate(survey.reviewedAt)}` : ''}
            </p>
          )}
          {survey.status === 'rejected' && (
            <div className="rounded-xl border border-kibs-ink p-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-kibs-ink">
                <XCircle className="h-3.5 w-3.5" />
                Rejected{survey.reviewedBy ? ` by ${survey.reviewedBy}` : ''}
                {survey.reviewedAt ? ` on ${formatDate(survey.reviewedAt)}` : ''}
              </p>
              {survey.rejectionReason && (
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{survey.rejectionReason}</p>
              )}
            </div>
          )}
          {survey.status === 'pending' && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <Clock className="h-3.5 w-3.5" />
              Waiting for admin approval
            </p>
          )}
        </div>

        {canReview && !rejecting && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onApprove?.(survey.id)}
              className="flex items-center justify-center gap-2 rounded-xl bg-kibs-ink py-3 text-sm font-black text-white transition hover:bg-black"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => setRejecting(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
          </div>
        )}

        {canReview && rejecting && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Why is this being rejected?
            </label>
            <textarea
              autoFocus
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder="Let the technician know what needs correcting…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink"
            />
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejecting(false);
                  setReason('');
                }}
                className="rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reason.trim()}
                onClick={() => onReject?.(survey.id, reason.trim())}
                className="rounded-xl bg-kibs-ink py-2.5 text-xs font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4 animate-fade-in"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close photo"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={lightboxUrl} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
};
