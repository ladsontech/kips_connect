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
          {/* Mobile — just the circular emblem icon */}
          <div className="flex items-center gap-2 sm:hidden">
            <div className="h-9 w-9 overflow-hidden rounded-full flex items-center justify-center">
              <img
                src="/kibs-logo-mobile.png"
                alt="Kibs Systems Ltd"
                className="h-[170%] w-[170%] max-w-none object-contain"
              />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-slate-900">Kibs Connect</span>
              <p className="text-[10px] font-semibold text-slate-500">Survey Portal</p>
            </div>
          </div>

          {/* Desktop Full Logo */}
          <div className="hidden items-center gap-3.5 sm:flex">
            <div className="h-10 overflow-hidden flex items-center">
              <img
                src="/kibs-logo-desktop.png"
                alt="Kibs Systems Ltd"
                className="h-[180%] w-auto max-w-none object-contain"
              />
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">Kibs Connect</span>
              <p className="text-xs text-slate-500 font-medium">Site Survey &amp; Report Portal</p>
            </div>
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
