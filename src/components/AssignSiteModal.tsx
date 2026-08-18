import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import type { SiteAssignment, SurveyType, User } from '../types';

interface AssignSiteModalProps {
  open: boolean;
  admin: User;
  technicians: User[];
  onClose: () => void;
  onCreate: (assignment: SiteAssignment) => void;
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
  const [type, setType] = useState<SurveyType>('new_site');
  const [technicianId, setTechnicianId] = useState(technicians[0]?.id ?? '');
  const [instructions, setInstructions] = useState('');

  if (!open) return null;

  function resetForm() {
    setSiteName('');
    setSiteLocation('');
    setContactPerson('');
    setContactPhone('');
    setType('new_site');
    setTechnicianId(technicians[0]?.id ?? '');
    setInstructions('');
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const technician = technicians.find((t) => t.id === technicianId);
    if (!technician) return;

    const assignment: SiteAssignment = {
      id: `assign-${Date.now()}`,
      siteName: siteName.trim(),
      siteLocation: siteLocation.trim(),
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      type,
      instructions: instructions.trim(),
      technicianId: technician.id,
      technicianName: technician.name,
      assignedBy: admin.name,
      assignedAt: new Date().toISOString(),
      status: 'assigned',
    };

    onCreate(assignment);
    resetForm();
    onClose();
  }

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

        <h2 className="pr-8 text-lg font-black text-slate-950">Add Site &amp; Assign Technician</h2>
        <p className="mt-1 text-xs text-slate-500">
          Send a technician to survey a new site or carry out maintenance.
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
                    ? 'border-kibs-deepGreen bg-kibs-green/15 text-kibs-deepGreen'
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
              placeholder="e.g. Greenview Estate"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Location / address</label>
            <input
              required
              value={siteLocation}
              onChange={(event) => setSiteLocation(event.target.value)}
              placeholder="e.g. Bukoto, Plot 22"
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
            <label className="mb-1 block text-xs font-bold text-slate-700">Assign to technician</label>
            {technicians.length > 0 ? (
              <select
                required
                value={technicianId}
                onChange={(event) => setTechnicianId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
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
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={technicians.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-kibs-deepGreen py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Assign Site
          </button>
        </form>
      </div>
    </div>
  );
};
