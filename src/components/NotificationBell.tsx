import React, { useState } from 'react';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { JOB_TYPE_LABELS, type Report } from '../types';

interface NotificationBellProps {
  /** Reports submitted since this admin last caught up, newest first. */
  newReports: Report[];
  onOpenReport: (report: Report) => void;
  onViewAll: () => void;
  onMarkAllRead: () => void;
  formatDate: (value: string) => string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  newReports,
  onOpenReport,
  onViewAll,
  onMarkAllRead,
  formatDate,
}) => {
  const [open, setOpen] = useState(false);
  const count = newReports.length;

  // z-50 keeps the trigger and panel above their own click-away backdrop,
  // so tapping the bell a second time still closes the dropdown.
  return (
    <div className="relative z-50">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        aria-label={count > 0 ? `${count} new submissions` : 'Notifications'}
      >
        <Bell className="h-[18px] w-[18px]" />
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white ring-2 ring-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-label="Close notifications" />
          <div className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl bg-white shadow-panel animate-fade-in">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-black text-slate-950">
                New Submissions
                {count > 0 && (
                  <span className="ml-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                    {count}
                  </span>
                )}
              </p>
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onMarkAllRead();
                    setOpen(false);
                  }}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {count === 0 ? (
              <div className="px-4 py-8 text-center">
                <Inbox className="mx-auto h-5 w-5 text-slate-300" />
                <p className="mt-2 text-xs font-medium text-slate-400">
                  You're all caught up — no new reports.
                </p>
              </div>
            ) : (
              <>
                <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                  {newReports.slice(0, 6).map((report) => (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => {
                        onOpenReport(report);
                        setOpen(false);
                      }}
                      className="flex w-full items-start gap-2.5 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-600" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-slate-900">
                          {report.siteName}
                        </span>
                        <span className="block truncate text-[11px] text-slate-500">
                          {JOB_TYPE_LABELS[report.type]} · {report.technicianName}
                        </span>
                        <span className="block text-[10px] font-semibold text-slate-400">
                          {formatDate(report.reportDate)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onViewAll();
                    setOpen(false);
                  }}
                  className="w-full border-t border-slate-100 px-4 py-2.5 text-center text-xs font-bold text-slate-900 transition hover:bg-slate-50"
                >
                  {count > 6 ? `View all ${count} new reports` : 'View pending reports'}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
