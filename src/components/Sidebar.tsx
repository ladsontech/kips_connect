import React from 'react';
import { Plus, UserPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem<T> {
  id: T;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface NavGroup<T> {
  label: string;
  items: NavItem<T>[];
}

interface SidebarProps<T extends string> {
  groups: NavGroup<T>[];
  activeId: T;
  onChange: (id: T) => void;
  onAddSite: () => void;
  onAddTechnician: () => void;
}

export function Sidebar<T extends string>({
  groups,
  activeId,
  onChange,
  onAddSite,
  onAddTechnician,
}: SidebarProps<T>) {
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-24 space-y-3">
        <div className="rounded-2xl bg-white p-3 shadow-panel">
          {groups.map((group, groupIndex) => (
            <div key={group.label} className={groupIndex > 0 ? 'mt-4 border-t border-slate-100 pt-4' : ''}>
              <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {group.label}
              </p>
              <nav className="space-y-1">
                {group.items.map((item) => {
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
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-3 shadow-panel">
          <p className="px-1 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Quick Actions
          </p>
          <button
            type="button"
            onClick={onAddSite}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-kibs-ink px-3 py-2.5 text-sm font-black text-white shadow-card transition hover:bg-black"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Add Site
          </button>
          <button
            type="button"
            onClick={onAddTechnician}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            Add Technician
          </button>
        </div>
      </div>
    </aside>
  );
}
