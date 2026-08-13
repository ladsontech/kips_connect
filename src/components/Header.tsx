import React from 'react';
import {
  Shield,
  UserRound,
  UsersRound,
  Globe,
  Database,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Bell,
  Sparkles,
} from 'lucide-react';
import type { Role } from '../types';

interface HeaderProps {
  role: Role;
  setRole: (role: Role) => void;
  isSupabaseConfigured: boolean;
  unreadCount: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onOpenDemoModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  setRole,
  isSupabaseConfigured,
  unreadCount,
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenDemoModal,
}) => {
  const roleItems: { id: Role; label: string; icon: React.ElementType; sub: string }[] = [
    { id: 'manager', label: 'Manager', icon: UsersRound, sub: 'Admin Portal' },
    { id: 'technician', label: 'Technician', icon: UserRound, sub: 'Field App' },
    { id: 'public', label: 'Client Portal', icon: Globe, sub: 'Support & Feedback' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-6 sm:py-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/kibs-logo.png"
              alt="Kibs Systems Ltd"
              className="h-7 w-auto max-w-[118px] object-contain sm:h-11 sm:max-w-[200px]"
            />
          </div>
          <div className="hidden border-l border-slate-200 pl-3 sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">Kibs Connect</span>
              <span className="rounded bg-kibs-green/15 px-1.5 py-0.5 text-[10px] font-bold text-kibs-deepGreen uppercase tracking-wider">
                v2.0 Demo
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Security Field Operations Platform</p>
          </div>
        </div>

        {/* Desktop Role Selector */}
        <div className="hidden md:flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
          {roleItems.map((item) => {
            const Icon = item.icon;
            const active = role === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setRole(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-150 ${
                  active
                    ? 'bg-white text-kibs-deepGreen shadow-xs ring-1 ring-slate-950/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-kibs-deepGreen' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action Badge & Supabase Indicator */}
        <div className="flex items-center gap-2">
          {/* Supabase connection trigger button */}
          <button
            type="button"
            onClick={onOpenDemoModal}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all shadow-xs ${
              isSupabaseConfigured
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Database className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">
              {isSupabaseConfigured ? 'Supabase Live' : 'Demo Mode'}
            </span>
            <span className="sm:hidden">
              {isSupabaseConfigured ? 'Live' : 'Demo'}
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Top Role Switcher (Visible when hamburger open or on smaller screens) */}
      <div className="border-t border-slate-100 bg-slate-50/90 px-2.5 py-1.5 md:hidden">
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-200/60 p-1 text-xs">
          {roleItems.map((item) => {
            const Icon = item.icon;
            const active = role === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setRole(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-md py-1 font-bold transition ${
                  active
                    ? 'bg-white text-kibs-deepGreen shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="max-w-full truncate text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
