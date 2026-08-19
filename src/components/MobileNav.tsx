import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface NavItem<T> {
  id: T;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface MobileNavProps<T extends string> {
  items: NavItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
}

// A clean, fixed 3-button bottom bar for the "major" destinations only.
// Anything beyond the 3 primary items belongs in the Header's top drawer.
export function MobileNav<T extends string>({ items, activeId, onChange }: MobileNavProps<T>) {
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 px-1.5 py-1 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-md sm:hidden">
      {items.map((item) => {
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
              className={`relative flex h-7 w-7 items-center justify-center rounded-lg transition ${
                isActive ? 'bg-slate-100 text-kibs-ink scale-105' : ''
              }`}
            >
              <Icon className="h-4 w-4" />
              {typeof item.count === 'number' && item.count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-kibs-ink px-1 text-[9px] font-black text-white">
                  {item.count}
                </span>
              )}
            </div>
            <span className="mt-0.5 text-[10px] font-semibold tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
