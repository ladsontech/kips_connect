import React, { useState } from 'react';
import {
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  ImageOff,
  Lightbulb,
  MapPin,
  Phone,
  Sun,
  User as UserIcon,
  X,
} from 'lucide-react';
import {
  CCTV_CATEGORIES,
  FLOODLIGHT_CATEGORIES,
  totalCount,
  type Survey,
} from '../types';

interface SurveyModalProps {
  survey: Survey | null;
  onClose: () => void;
  onApprove?: (surveyId: string) => void;
  canApprove: boolean;
  formatDate: (value: string) => string;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({
  survey,
  onClose,
  onApprove,
  canApprove,
  formatDate,
}) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (!survey) return null;

  const totalCctv = totalCount(survey.cctv);
  const totalFloodlights = totalCount(survey.floodlights);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs sm:items-center sm:p-4 animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-label="Close modal backdrop" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-slide-up sm:rounded-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-wrap items-center gap-2 pr-8">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {survey.surveyNumber}
          </span>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {survey.type === 'new_site' ? 'New Site Survey' : 'Maintenance'}
          </span>
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-bold ${
              survey.status === 'approved'
                ? 'bg-kibs-deepGreen/10 text-kibs-deepGreen'
                : 'bg-kibs-red/10 text-kibs-red'
            }`}
          >
            {survey.status === 'approved' ? 'Approved' : 'Pending'}
          </span>
        </div>

        <h2 className="mt-3 text-xl font-black text-slate-950">{survey.siteName}</h2>

        <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
          <p className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {survey.siteLocation}
          </p>
          {survey.contactPerson && (
            <p className="flex items-center gap-2">
              <UserIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              {survey.contactPerson}
            </p>
          )}
          {survey.contactPhone && (
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              {survey.contactPhone}
            </p>
          )}
          <p className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            Surveyed {formatDate(survey.surveyDate)} by {survey.technicianName}
          </p>
        </div>

        <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
          <div className="p-4">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <Camera className="h-3.5 w-3.5" /> CCTV Cameras · {totalCctv} total
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {CCTV_CATEGORIES.map((category) => (
                <div key={category} className="text-center">
                  <p className="text-base font-black text-slate-900">{survey.cctv[category] || 0}</p>
                  <p className="text-[10px] font-semibold text-slate-500">{category}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <Lightbulb className="h-3.5 w-3.5" /> Flood Lights · {totalFloodlights} total
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {FLOODLIGHT_CATEGORIES.map((category) => (
                <div key={category} className="text-center">
                  <p className="text-base font-black text-slate-900">{survey.floodlights[category] || 0}</p>
                  <p className="text-[10px] font-semibold text-slate-500">{category}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <Sun className="h-3.5 w-3.5" /> Solar Panels
            </p>
            <p className="text-base font-black text-slate-900">{survey.solarPanels}</p>
          </div>

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

          {survey.notes && (
            <div className="p-4 text-xs text-slate-700">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Notes</p>
              <p className="mt-1.5 leading-relaxed">{survey.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-4">
          {survey.status === 'approved' && survey.approvedBy && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-kibs-deepGreen">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approved by {survey.approvedBy}
              {survey.approvedAt ? ` on ${formatDate(survey.approvedAt)}` : ''}
            </p>
          )}
          {survey.status === 'pending' && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-kibs-red">
              <Clock className="h-3.5 w-3.5" />
              Waiting for admin approval
            </p>
          )}
        </div>

        {canApprove && survey.status === 'pending' && onApprove && (
          <button
            type="button"
            onClick={() => onApprove(survey.id)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-kibs-deepGreen py-3 text-sm font-black text-white transition hover:bg-green-800"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve Survey
          </button>
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
