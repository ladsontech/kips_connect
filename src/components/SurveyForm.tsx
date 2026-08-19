import React, { useEffect, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  Lightbulb,
  Link2,
  Loader2,
  Sun,
  X,
} from 'lucide-react';
import {
  CCTV_CATEGORIES,
  FLOODLIGHT_CATEGORIES,
  emptyCctvCounts,
  emptyFloodlightCounts,
  type CctvCategory,
  type FloodlightCategory,
  type SiteAssignment,
  type SurveyType,
  type User,
} from '../types';
import type { SurveyDraft } from '../lib/api';
import { compressImage } from '../lib/imageCompression';

interface PendingPhoto {
  id: string;
  file: File;
  previewUrl: string;
  sizeKb: number;
}

interface SurveyFormProps {
  technician: User;
  assignment?: SiteAssignment | null;
  onClearAssignment?: () => void;
  onSubmit: (draft: SurveyDraft) => Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);
const MAX_PHOTOS = 6;

export const SurveyForm: React.FC<SurveyFormProps> = ({
  technician,
  assignment,
  onClearAssignment,
  onSubmit,
}) => {
  const [type, setType] = useState<SurveyType>('new_site');
  const [siteName, setSiteName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [surveyDate, setSurveyDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [cctv, setCctv] = useState(emptyCctvCounts());
  const [floodlights, setFloodlights] = useState(emptyFloodlightCounts());
  const [solarPanels, setSolarPanels] = useState(0);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function resetForm() {
    setType('new_site');
    setSiteName('');
    setSiteLocation('');
    setContactPerson('');
    setContactPhone('');
    setSurveyDate(today());
    setNotes('');
    setCctv(emptyCctvCounts());
    setFloodlights(emptyFloodlightCounts());
    setSolarPanels(0);
    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setPhotos([]);
    setPhotoError('');
  }

  // Pre-fill the form whenever the technician taps "Start Survey" on an assigned site.
  useEffect(() => {
    if (!assignment) return;
    setType(assignment.type);
    setSiteName(assignment.siteName);
    setSiteLocation(assignment.siteLocation);
    setContactPerson(assignment.contactPerson);
    setContactPhone(assignment.contactPhone);
    setSurveyDate(today());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment?.id]);

  async function handlePhotoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      setPhotoError(`You can attach up to ${MAX_PHOTOS} photos.`);
      return;
    }

    setPhotoError('');
    setUploading(true);
    try {
      const accepted = files.slice(0, room);
      const compressed = await Promise.all(
        accepted.map(async (file) => {
          const result = await compressImage(file);
          const photo: PendingPhoto = {
            id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            file: result.file,
            previewUrl: URL.createObjectURL(result.file),
            sizeKb: result.compressedSizeKb,
          };
          return photo;
        })
      );
      setPhotos((prev) => [...prev, ...compressed]);
      if (files.length > room) {
        setPhotoError(`Only added ${room} photo(s) — the ${MAX_PHOTOS} photo limit was reached.`);
      }
    } catch {
      setPhotoError('One of those photos could not be processed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((photo) => photo.id !== id);
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    const draft: SurveyDraft = {
      type,
      siteName: siteName.trim(),
      siteLocation: siteLocation.trim(),
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      surveyDate,
      notes: notes.trim(),
      cctv,
      floodlights,
      solarPanels,
      photoFiles: photos.map((photo) => photo.file),
      assignmentId: assignment?.id,
    };

    try {
      await onSubmit(draft);
      resetForm();
      onClearAssignment?.();
      setSubmitted(true);
      window.setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not submit the survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-6">
      {submitted && (
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-600 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          Survey submitted for approval.
        </div>
      )}

      {submitError && (
        <div className="rounded-xl bg-kibs-ink px-3 py-2.5 text-xs font-bold text-white">
          {submitError}
        </div>
      )}

      {assignment && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              Assigned by {assignment.assignedBy} — {assignment.siteName}
            </p>
            {onClearAssignment && (
              <button
                type="button"
                onClick={() => {
                  onClearAssignment();
                  resetForm();
                }}
                className="shrink-0 text-[10px] font-bold text-kibs-ink underline decoration-dotted"
              >
                Start blank instead
              </button>
            )}
          </div>
          {assignment.instructions && (
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{assignment.instructions}</p>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow-card space-y-3.5">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: 'new_site', label: 'New Site Survey' },
              { id: 'maintenance', label: 'Maintenance' },
            ] as { id: SurveyType; label: string }[]
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setType(option.id)}
              className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                type === option.id
                  ? 'border-kibs-ink bg-kibs-ink text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Site name</label>
          <input
            required
            value={siteName}
            onChange={(event) => setSiteName(event.target.value)}
            placeholder="e.g. ABC Apartments"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Location / address</label>
          <input
            required
            value={siteLocation}
            onChange={(event) => setSiteLocation(event.target.value)}
            placeholder="e.g. Kira Road, Block B"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Contact person</label>
            <input
              value={contactPerson}
              onChange={(event) => setContactPerson(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Contact phone</label>
            <input
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Survey date</label>
          <input
            type="date"
            required
            value={surveyDate}
            onChange={(event) => setSurveyDate(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card divide-y divide-slate-100">
        <div className="pb-3.5">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <Camera className="h-3.5 w-3.5" /> CCTV Cameras
          </p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {CCTV_CATEGORIES.map((category) => (
              <div key={category}>
                <label className="mb-1 block text-[10px] font-bold text-slate-500">{category}</label>
                <input
                  type="number"
                  min={0}
                  value={cctv[category as CctvCategory]}
                  onChange={(event) =>
                    setCctv((prev) => ({ ...prev, [category]: Math.max(0, Number(event.target.value) || 0) }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center text-sm font-bold text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="py-3.5">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <Lightbulb className="h-3.5 w-3.5" /> Flood Lights
          </p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {FLOODLIGHT_CATEGORIES.map((category) => (
              <div key={category}>
                <label className="mb-1 block text-[10px] font-bold text-slate-500">{category}</label>
                <input
                  type="number"
                  min={0}
                  value={floodlights[category as FloodlightCategory]}
                  onChange={(event) =>
                    setFloodlights((prev) => ({
                      ...prev,
                      [category]: Math.max(0, Number(event.target.value) || 0),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center text-sm font-bold text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3.5">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <Sun className="h-3.5 w-3.5" /> Solar Panels
          </p>
          <input
            type="number"
            min={0}
            value={solarPanels}
            onChange={(event) => setSolarPanels(Math.max(0, Number(event.target.value) || 0))}
            className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-bold text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <ImagePlus className="h-3.5 w-3.5" /> Site Photos
          </p>
          <span className="text-[10px] font-semibold text-slate-400">{photos.length}/{MAX_PHOTOS}</span>
        </div>

        {photos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                <img src={photo.previewUrl} alt={photo.file.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute right-1 top-1 rounded-full bg-slate-900/70 p-1 text-white transition hover:bg-kibs-red"
                  aria-label={`Remove ${photo.file.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < MAX_PHOTOS && (
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-3 text-xs font-bold text-slate-500 transition hover:border-kibs-ink hover:text-kibs-ink">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing photos…
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" /> Add site photos
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              className="hidden"
              disabled={uploading}
              onChange={handlePhotoSelect}
            />
          </label>
        )}

        {photoError && <p className="mt-2 text-xs font-semibold text-kibs-red">{photoError}</p>}
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-slate-700">Notes</label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Anything else the admin should know..."
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-kibs-ink py-3.5 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        {submitting ? 'Submitting…' : 'Submit Survey'}
      </button>
    </form>
  );
};
