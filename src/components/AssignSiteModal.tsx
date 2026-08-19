import React, { useState } from 'react';
import { Loader2, Send, X } from 'lucide-react';
import { JOB_TYPES, JOB_TYPE_LABELS, type JobType, type User } from '../types';
import type { AssignmentDraft } from '../lib/api';

interface AssignSiteModalProps {
  open: boolean;
  admin: User;
  technicians: User[];
  onClose: () => void;
  onCreate: (draft: AssignmentDraft) => Promise<void>;
}

export const AssignSiteModal: React.FC<AssignSiteModalProps> = ({
  open,
  admin,
  technicians,
  onClose,
  onCreate,
}) => {
  const [siteName, setSiteName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [type, setType] = useState<JobType>('survey');
  const [technicianId, setTechnicianId] = useState(technicians[0]?.id ?? '');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  function resetForm() {
    setSiteName('');
    setSiteLocation('');
    setContactPerson('');
    setContactPhone('');
    setType('survey');
    setTechnicianId(technicians[0]?.id ?? '');
    setInstructions('');
    setError('');
    setSubmitting(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const technician = technicians.find((t) => t.id === technicianId);
    if (!technician) return;

    setError('');
    setSubmitting(true);
    try {
      await onCreate({
        siteName: siteName.trim(),
        siteLocation: siteLocation.trim(),
        contactPerson: contactPerson.trim(),
        contactPhone: contactPhone.trim(),
        type,
        instructions: instructions.trim(),
        technicianId: technician.id,
        technicianName: technician.name,
      });
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create this assignment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs sm:items-center sm:p-4 animate-fade-in">
      <div className="fixed inset-0" onClick={handleClose} aria-label="Close modal backdrop" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl animate-slide-up sm:rounded-3xl sm:p-6">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="pr-8 text-lg font-black text-slate-950">Add Site &amp; Assign Technician</h2>
        <p className="mt-1 text-xs text-slate-500">
          Send a technician to survey a new site or carry out maintenance.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Job type</label>
            <div className="grid grid-cols-3 gap-2">
              {JOB_TYPES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setType(option)}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                    type === option
                      ? 'border-kibs-ink bg-kibs-ink text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {JOB_TYPE_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Site name</label>
            <input
              required
              value={siteName}
              onChange={(event) => setSiteName(event.target.value)}
              placeholder="e.g. Greenview Estate"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Location / address</label>
            <input
              required
              value={siteLocation}
              onChange={(event) => setSiteLocation(event.target.value)}
              placeholder="e.g. Bukoto, Plot 22"
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
            <label className="mb-1 block text-xs font-bold text-slate-700">Assign to technician</label>
            {technicians.length > 0 ? (
              <select
                required
                value={technicianId}
                onChange={(event) => setTechnicianId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
              >
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                No technicians available yet.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Instructions (optional)</label>
            <textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              rows={3}
              placeholder="Anything the technician should know before visiting..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
            />
          </div>

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={technicians.length === 0 || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-kibs-ink py-3 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? 'Assigning…' : 'Assign Site'}
          </button>
        </form>
      </div>
    </div>
  );
};
