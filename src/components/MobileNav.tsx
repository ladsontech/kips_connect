import React, { useState } from 'react';
import { MoreHorizontal, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem<T> {
  id: T;
  label: string;
  icon: LucideIcon;
}

interface MobileNavProps<T extends string> {
  items: NavItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
}

export function MobileNav<T extends string>({ items, activeId, onChange }: MobileNavProps<T>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mainItems = items.length > 5 ? items.slice(0, 4) : items;
  const extraItems = items.length > 5 ? items.slice(4) : [];

  return (
    <>
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 px-1.5 py-1 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-md sm:hidden">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex flex-1 flex-col items-center justify-center py-1 text-center transition-all ${
                isActive ? 'text-kibs-ink font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                  isActive ? 'bg-slate-100 text-kibs-ink scale-105' : ''
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="mt-0.5 text-[10px] font-semibold tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {extraItems.length > 0 && (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-1 flex-col items-center justify-center py-1 text-center transition-all ${
              extraItems.some((item) => item.id === activeId)
                ? 'text-kibs-ink font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                extraItems.some((item) => item.id === activeId) ? 'bg-slate-100 text-kibs-ink' : ''
              }`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </div>
            <span className="mt-0.5 text-[10px] font-semibold tracking-tight">More</span>
          </button>
        )}
      </nav>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/50 backdrop-blur-xs sm:hidden animate-fade-in">
          <div className="fixed inset-0" onClick={() => setDrawerOpen(false)} aria-label="Close menu" />
          <div className="relative z-10 rounded-t-2xl border-t border-slate-200 bg-white p-4 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">More</h3>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 pb-2">
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
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                      isActive
                        ? 'border-kibs-ink bg-kibs-ink text-white font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="text-xs font-semibold">{item.label}</span>
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
