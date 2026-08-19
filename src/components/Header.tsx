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

interface DrawerNavGroup {
  label: string;
  items: DrawerNavItem[];
}

interface HeaderProps {
  user: User;
  onLogout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  /** Full navigation shown inside the drawer on mobile / tablet. */
  navGroups?: DrawerNavGroup[];
  activeNavId?: string;
  onNavChange?: (id: string) => void;
  /** Rendered in the header's action cluster at every screen size. */
  notificationSlot?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
  navGroups,
  activeNavId,
  onNavChange,
  notificationSlot,
}) => {
  const RoleIcon = user.role === 'admin' ? ShieldCheck : UserRound;

  const accountCard = (
    <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-kibs-ink shadow-card">
        <RoleIcon className="h-4 w-4" />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {user.role === 'admin' ? 'Admin' : 'Technician'}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 sm:px-6 sm:py-3">
          <div className="flex items-center gap-3">
            <img
              src="/kibs-logo-mobile.png"
              alt="Kibs Systems Ltd"
              className="h-9 w-auto max-w-[52px] object-contain"
            />
            <div className="border-l border-slate-200 pl-3">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">
                Kibs Connect
              </span>
              <p className="hidden text-xs font-medium text-slate-500 sm:block">
                Site Survey &amp; Report Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {notificationSlot}

            <div className="hidden items-center gap-3 lg:flex">
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
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Rendered as a full overlay (outside the sticky header) so it can never
          be clipped by the header's own height or stacking context. */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          />

          <div className="absolute inset-x-0 top-0 max-h-[88vh] overflow-y-auto rounded-b-3xl bg-white p-4 shadow-2xl animate-slide-down">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/kibs-logo-mobile.png"
                  alt="Kibs Systems Ltd"
                  className="h-8 w-auto max-w-[48px] object-contain"
                />
                <span className="text-sm font-extrabold tracking-tight text-slate-900">Menu</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3">{accountCard}</div>

            {navGroups?.map((group) => (
              <div key={group.label} className="mt-4">
                <p className="px-1 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((item) => {
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
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-left text-xs font-bold transition ${
                          isActive
                            ? 'bg-kibs-ink text-white shadow-card'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="flex-1 truncate">{item.label}</span>
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
            ))}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </>
  );
};
