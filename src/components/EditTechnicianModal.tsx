import React, { useEffect, useState } from 'react';
import { Check, Copy, Dices, Eye, EyeOff, Loader2, Save, X } from 'lucide-react';
import type { User } from '../types';
import type { UpdateTechnicianInput } from '../lib/api';

interface EditTechnicianModalProps {
  open: boolean;
  technician: User | null;
  existingUsers: User[];
  onClose: () => void;
  onSave: (technicianId: string, input: UpdateTechnicianInput) => Promise<User>;
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

export const EditTechnicianModal: React.FC<EditTechnicianModalProps> = ({
  open,
  technician,
  existingUsers,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedPassword, setSavedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && technician) {
      setName(technician.name);
      setEmail(technician.email);
      setPhone(technician.phone ?? '');
      setChangePassword(false);
      setPassword('');
      setShowPassword(false);
      setError('');
      setSubmitting(false);
      setSavedPassword(null);
      setCopied(false);
    }
  }, [open, technician]);

  if (!open || !technician) return null;

  function handleClose() {
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!technician) return;

    const trimmedEmail = email.trim().toLowerCase();
    const duplicate = existingUsers.some(
      (u) => u.id !== technician.id && u.email.toLowerCase() === trimmedEmail
    );
    if (duplicate) {
      setError('A user with this email already exists.');
      return;
    }
    if (changePassword && password.trim().length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSave(technician.id, {
        name: name.trim(),
        email: trimmedEmail,
        phone: phone.trim(),
        ...(changePassword ? { password: password.trim() } : {}),
      });
      if (changePassword) {
        setSavedPassword(password.trim());
      } else {
        handleClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update this technician.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!savedPassword) return;
    try {
      await navigator.clipboard.writeText(`Email: ${email.trim().toLowerCase()}\nPassword: ${savedPassword}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — the credentials are still visible on screen to copy manually.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs sm:items-center sm:p-4 animate-fade-in">
      <div className="fixed inset-0" onClick={handleClose} aria-label="Close modal backdrop" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl animate-slide-up sm:rounded-3xl sm:p-6">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        {savedPassword ? (
          <>
            <div className="flex items-center gap-2 pr-8">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-kibs-ink/10 text-kibs-ink">
                <Check className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black text-slate-950">Password Updated</h2>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Share this new password with {name.trim()} — it won't be shown again.
            </p>

            <div className="mt-4 space-y-2.5 rounded-xl bg-slate-50 p-3.5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email</p>
                <p className="text-sm font-bold text-slate-900">{email.trim().toLowerCase()}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">New Password</p>
                <p className="font-mono text-sm font-bold text-slate-900">{savedPassword}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-kibs-ink" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy Credentials'}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-kibs-ink py-3 text-sm font-black text-white transition hover:bg-black"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <h2 className="pr-8 text-lg font-black text-slate-950">Edit Technician</h2>
            <p className="mt-1 text-xs text-slate-500">
              Update {technician.name}'s details, login email, or password.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Full name</label>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Email (login)</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Phone (optional)</label>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+256 700 000 000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={changePassword}
                    onChange={(event) => {
                      setChangePassword(event.target.checked);
                      if (!event.target.checked) setPassword('');
                    }}
                    className="h-4 w-4 rounded border-slate-300 accent-kibs-ink"
                  />
                  Set a new password
                </label>
                <p className="mt-1 text-[11px] text-slate-500">
                  For security, existing passwords can't be viewed — only replaced with a new one.
                </p>

                {changePassword && (
                  <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 focus-within:border-kibs-ink">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-transparent py-2 text-sm text-slate-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="shrink-0 p-1 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPassword(generatePassword());
                        setShowPassword(true);
                      }}
                      className="shrink-0 flex items-center gap-1 rounded-lg bg-slate-200 px-2 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-300"
                    >
                      <Dices className="h-3.5 w-3.5" />
                      Generate
                    </button>
                  </div>
                )}
              </div>

              {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-kibs-ink py-3 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {submitting ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
