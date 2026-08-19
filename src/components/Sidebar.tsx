import React from 'react';
import { Plus, UserPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem<T> {
  id: T;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface SidebarProps<T extends string> {
  items: NavItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  onAddSite: () => void;
  onAddTechnician: () => void;
}

export function Sidebar<T extends string>({
  items,
  activeId,
  onChange,
  onAddSite,
  onAddTechnician,
}: SidebarProps<T>) {
  return (
    <aside className="hidden w-52 shrink-0 sm:block">
      <div className="sticky top-20 space-y-5">
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                  active
                    ? 'bg-kibs-ink text-white shadow-card'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="space-y-1.5 border-t border-slate-200 pt-4">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Quick Actions
          </p>
          <button
            type="button"
            onClick={onAddSite}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Add Site
          </button>
          <button
            type="button"
            onClick={onAddTechnician}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            Add Technician
          </button>
        </div>
      </div>
    </aside>
  );
}
