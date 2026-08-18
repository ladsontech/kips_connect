import React, { useState } from 'react';
import { Check, Copy, Dices, Eye, EyeOff, UserPlus, X } from 'lucide-react';
import type { User } from '../types';

interface AddTechnicianModalProps {
  open: boolean;
  existingUsers: User[];
  onClose: () => void;
  onCreate: (technician: User) => void;
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

export const AddTechnicianModal: React.FC<AddTechnicianModalProps> = ({
  open,
  existingUsers,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<User | null>(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  function resetForm() {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setShowPassword(false);
    setError('');
    setCreated(null);
    setCopied(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const duplicate = existingUsers.some((u) => u.email.toLowerCase() === trimmedEmail);
    if (duplicate) {
      setError('A user with this email already exists.');
      return;
    }
    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const technician: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      password: password.trim(),
      role: 'technician',
      phone: phone.trim() || undefined,
    };

    setError('');
    onCreate(technician);
    setCreated(technician);
  }

  async function handleCopy() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(`Email: ${created.email}\nPassword: ${created.password}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — the credentials are still visible on screen to copy manually.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs sm:items-center sm:p-4 animate-fade-in">
      <div className="fixed inset-0" onClick={handleClose} aria-label="Close modal backdrop" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-slide-up sm:rounded-2xl sm:p-6">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        {created ? (
          <>
            <div className="flex items-center gap-2 pr-8">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black text-slate-950">Technician Added</h2>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Share these sign-in details with {created.name} — they won't be shown again.
            </p>

            <div className="mt-4 space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email</p>
                <p className="text-sm font-bold text-slate-900">{created.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Password</p>
                <p className="font-mono text-sm font-bold text-slate-900">{created.password}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy Credentials'}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-kibs-deepGreen py-3 text-sm font-black text-white transition hover:bg-emerald-700"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <h2 className="pr-8 text-lg font-black text-slate-950">Add Technician</h2>
            <p className="mt-1 text-xs text-slate-500">
              Create a login for a new field technician and set their password.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Full name</label>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Musa Sserwadda"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@kibs.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Phone (optional)</label>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+256 700 000 000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-kibs-deepGreen focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Password</label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 focus-within:border-kibs-deepGreen focus-within:bg-white">
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
              </div>

              {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-kibs-deepGreen py-3 text-sm font-black text-white transition hover:bg-emerald-700"
              >
                <UserPlus className="h-4 w-4" />
                Create Technician Account
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
