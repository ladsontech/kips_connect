import React from 'react';
import { LogOut, Menu, ShieldCheck, UserRound, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { User } from '../types';

interface DrawerNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface HeaderProps {
  user: User;
  onLogout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  // Secondary nav destinations that don't fit in the 3-item bottom bar —
  // shown as a clean drawer here, right below the header.
  secondaryNavItems?: DrawerNavItem[];
  activeNavId?: string;
  onNavChange?: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
  secondaryNavItems,
  activeNavId,
  onNavChange,
}) => {
  const RoleIcon = user.role === 'admin' ? ShieldCheck : UserRound;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-2 sm:px-6 sm:py-3">
        <div className="flex items-center gap-3">
          <img
            src="/kibs-logo-mobile.png"
            alt="Kibs Systems Ltd"
            className="h-9 w-auto max-w-[52px] object-contain sm:hidden"
          />
          <img
            src="/kibs-logo-desktop.png"
            alt="Kibs Systems Ltd"
            className="hidden h-12 w-auto max-w-[300px] object-contain sm:block"
          />
          <div className="hidden border-l border-slate-200 pl-3 sm:block">
            <span className="font-extrabold text-slate-900 tracking-tight text-base">Kibs Connect</span>
            <p className="text-xs text-slate-500 font-medium">Site Survey &amp; Report Portal</p>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-1.5">
            <RoleIcon className="h-4 w-4 text-kibs-ink" />
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
              <RoleIcon className="h-4 w-4 text-kibs-ink" />
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

          {secondaryNavItems && secondaryNavItems.length > 0 && (
            <div className="mt-2.5">
              <p className="px-1 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                More
              </p>
              <div className="grid grid-cols-2 gap-2">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNavId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavChange?.(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                        isActive ? 'bg-kibs-ink text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="flex-1">{item.label}</span>
                      {typeof item.count === 'number' && item.count > 0 && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
