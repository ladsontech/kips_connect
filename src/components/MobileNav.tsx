import React from 'react';
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
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 px-1.5 py-1 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-md sm:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`flex flex-1 flex-col items-center justify-center py-1 text-center transition-all ${
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
            <span className="mt-0.5 text-[10px] font-semibold tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
