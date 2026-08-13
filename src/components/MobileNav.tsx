import React, { useState } from 'react';
import { LucideIcon, MoreHorizontal, X, ChevronRight } from 'lucide-react';
import type { Role } from '../types';

interface NavItem<T> {
  id: T;
  label: string;
  icon: LucideIcon;
}

interface MobileNavProps<T extends string> {
  role: Role;
  items: NavItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
}

export function MobileNav<T extends string>({
  role,
  items,
  activeId,
  onChange,
}: MobileNavProps<T>) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Show top 4 items in bottom bar, rest in 'More' drawer
  const mainItems = items.slice(0, 4);
  const extraItems = items.slice(4);

  return (
    <>
      {/* Fixed Bottom Navigation Bar on Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 px-1.5 py-1 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-md lg:hidden">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex flex-1 flex-col items-center justify-center py-0.5 text-center transition-all ${
                isActive ? 'text-kibs-deepGreen font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                  isActive ? 'bg-kibs-green/15 text-kibs-deepGreen scale-105' : ''
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="mt-0.5 text-[9px] font-semibold tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* More Button if there are extra items */}
        {extraItems.length > 0 && (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-1 flex-col items-center justify-center py-0.5 text-center transition-all ${
              extraItems.some((item) => item.id === activeId)
                ? 'text-kibs-deepGreen font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                extraItems.some((item) => item.id === activeId)
                  ? 'bg-kibs-green/15 text-kibs-deepGreen'
                  : ''
              }`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </div>
            <span className="mt-0.5 text-[9px] font-semibold tracking-tight">More</span>
          </button>
        )}
      </nav>

      {/* Slide-Up Drawer for Extra Items */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/50 backdrop-blur-xs lg:hidden animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          />
          <div className="relative z-10 rounded-t-2xl border-t border-slate-200 bg-white p-3 shadow-2xl animate-slide-up sm:p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">All Modules</h3>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto py-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.id);
                      setDrawerOpen(false);
                    }}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                      isActive
                        ? 'border-kibs-deepGreen bg-kibs-green/10 text-kibs-deepGreen font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-kibs-deepGreen' : 'text-slate-500'}`} />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
