import React, { useState } from 'react';
import { Camera, CheckCircle2, Lightbulb, Sun } from 'lucide-react';
import {
  CCTV_CATEGORIES,
  FLOODLIGHT_CATEGORIES,
  emptyCctvCounts,
  emptyFloodlightCounts,
  type CctvCategory,
  type FloodlightCategory,
  type Survey,
  type SurveyType,
  type User,
} from '../types';

interface SurveyFormProps {
  technician: User;
  nextSurveyNumber: string;
  onSubmit: (survey: Survey) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const SurveyForm: React.FC<SurveyFormProps> = ({ technician, nextSurveyNumber, onSubmit }) => {
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
  const [submitted, setSubmitted] = useState(false);

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
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const survey: Survey = {
      id: `survey-${Date.now()}`,
      surveyNumber: nextSurveyNumber,
      type,
      siteName: siteName.trim(),
      siteLocation: siteLocation.trim(),
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      technicianId: technician.id,
      technicianName: technician.name,
      surveyDate,
      notes: notes.trim(),
      cctv,
      floodlights,
      solarPanels,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onSubmit(survey);
    resetForm();
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-6">
      {submitted && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          Survey submitted for approval.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Survey Type</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
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
                  ? 'border-kibs-deepGreen bg-kibs-green/15 text-kibs-deepGreen'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Site Details</p>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Site name</label>
          <input
            required
            value={siteName}
            onChange={(event) => setSiteName(event.target.value)}
            placeholder="e.g. ABC Apartments"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Location / address</label>
          <input
            required
            value={siteLocation}
            onChange={(event) => setSiteLocation(event.target.value)}
            placeholder="e.g. Kira Road, Block B"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Contact person</label>
            <input
              value={contactPerson}
              onChange={(event) => setContactPerson(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Contact phone</label>
            <input
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
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
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          <Camera className="h-3.5 w-3.5" /> CCTV Cameras
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-bold text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          <Lightbulb className="h-3.5 w-3.5" /> Flood Lights
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-bold text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          <Sun className="h-3.5 w-3.5" /> Solar Panels
        </p>
        <input
          type="number"
          min={0}
          value={solarPanels}
          onChange={(event) => setSolarPanels(Math.max(0, Number(event.target.value) || 0))}
          className="mt-2 w-32 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-bold text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Anything else the admin should know..."
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
        />
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-kibs-deepGreen py-3.5 text-sm font-black text-white transition hover:bg-emerald-700"
      >
        <CheckCircle2 className="h-4 w-4" />
        Submit Survey
      </button>
    </form>
  );
};
