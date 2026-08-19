import React, { useEffect, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import type { SiteAssignment, SurveyType, User } from '../types';
import type { AssignmentDraft } from '../lib/api';

interface EditAssignmentModalProps {
  open: boolean;
  assignment: SiteAssignment | null;
  technicians: User[];
  onClose: () => void;
  onSave: (assignmentId: string, draft: AssignmentDraft) => Promise<void>;
}

export const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({
  open,
  assignment,
  technicians,
  onClose,
  onSave,
}) => {
  const [siteName, setSiteName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [type, setType] = useState<SurveyType>('new_site');
  const [technicianId, setTechnicianId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && assignment) {
      setSiteName(assignment.siteName);
      setSiteLocation(assignment.siteLocation);
      setContactPerson(assignment.contactPerson);
      setContactPhone(assignment.contactPhone);
      setType(assignment.type);
      // If the previously assigned technician's account was since removed
      // (or isn't in the active list for any other reason), fall back to
      // the first available technician and require an explicit reassignment.
      const currentStillActive = technicians.some((t) => t.id === assignment.technicianId);
      setTechnicianId(currentStillActive ? assignment.technicianId : technicians[0]?.id ?? '');
      setInstructions(assignment.instructions);
      setError('');
      setSubmitting(false);
    }
  }, [open, assignment, technicians]);

  if (!open || !assignment) return null;

  function handleClose() {
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!assignment) return;
    const technician = technicians.find((t) => t.id === technicianId);
    if (!technician) {
      setError('Choose a technician to assign this site to.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSave(assignment.id, {
        siteName: siteName.trim(),
        siteLocation: siteLocation.trim(),
        contactPerson: contactPerson.trim(),
        contactPhone: contactPhone.trim(),
        type,
        instructions: instructions.trim(),
        technicianId: technician.id,
        technicianName: technician.name,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update this assignment.');
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

        <h2 className="pr-8 text-lg font-black text-slate-950">Edit Site Assignment</h2>
        <p className="mt-1 text-xs text-slate-500">
          Update site details, instructions, or reassign this site to another technician.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Location / address</label>
            <input
              required
              value={siteLocation}
              onChange={(event) => setSiteLocation(event.target.value)}
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
            <label className="mb-1 block text-xs font-bold text-slate-700">Assigned technician</label>
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
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
            />
          </div>

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={technicians.length === 0 || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-kibs-ink py-3 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
