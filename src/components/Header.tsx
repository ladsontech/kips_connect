import React from 'react';
import { LogOut, Menu, ShieldCheck, UserRound, X } from 'lucide-react';
import type { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const RoleIcon = user.role === 'admin' ? ShieldCheck : UserRound;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 sm:px-6 sm:py-2.5">
        <div className="flex items-center gap-3">
          {/* Crisp, modern vector KSL badge */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 p-1.5 border border-emerald-100/80 shadow-xs">
            <svg viewBox="0 0 100 100" className="h-full w-full" fill="none">
              <circle cx="50" cy="50" r="48" fill="#16a34a" />
              <g transform="translate(14, 13) scale(0.95)">
                <path
                  d="M20 16 C22 28, 22 46, 17 62 C16 65, 17 68, 21 66 C26 63, 29 48, 30 38 C32 30, 31 22, 28 17 C26 13, 20 13, 20 16 Z"
                  fill="#09090b"
                />
                <path
                  d="M28 35 C33 30, 42 22, 53 17 C57 15, 60 18, 56 22 C48 28, 39 36, 31 43 Z"
                  fill="#09090b"
                />
                <path
                  d="M26 39 C34 45, 45 55, 52 64 C55 68, 51 70, 47 67 C41 61, 32 50, 24 43 Z"
                  fill="#09090b"
                />
                <text
                  x="39"
                  y="42"
                  fill="#ffffff"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="900"
                  fontSize="22"
                  textAnchor="middle"
                >
                  S
                </text>
                <text
                  x="42"
                  y="60"
                  fill="#ffffff"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="900"
                  fontSize="18"
                  textAnchor="middle"
                >
                  L
                </text>
              </g>
            </svg>
          </div>

          {/* Clean App Identity */}
          <div>
            <div className="flex items-center gap-2 leading-none">
              <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg">
                Kibs Connect
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                Portal
              </span>
            </div>
            <p className="mt-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Site Survey &amp; Report Management
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-1.5">
            <RoleIcon className="h-4 w-4 text-kibs-deepGreen" />
            <div className="leading-tight">
              <p className="text-xs font-bold text-slate-900">{user.name}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {user.role === 'admin' ? 'Admin' : 'Technician'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 sm:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-slate-50/90 px-3 py-2.5 sm:hidden">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <RoleIcon className="h-4 w-4 text-kibs-deepGreen" />
              <div className="leading-tight">
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {user.role === 'admin' ? 'Admin' : 'Technician'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
