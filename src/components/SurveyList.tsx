import React, { useMemo, useState } from 'react';
import { ChevronRight, Images, Search, X } from 'lucide-react';
import { JOB_TYPE_LABELS, type Report } from '../types';
import { StatusBadge } from './StatusBadge';

interface SurveyListProps {
  surveys: Report[];
  onSelect: (survey: Report) => void;
  showTechnician?: boolean;
  emptyMessage: string;
  formatDate: (value: string) => string;
  /** Show the search + date-range filter bar above the list (admin views). */
  showFilters?: boolean;
}

export const SurveyList: React.FC<SurveyListProps> = ({
  surveys,
  onSelect,
  showTechnician,
  emptyMessage,
  formatDate,
  showFilters,
}) => {
  const [query, setQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filtered = useMemo(() => {
    if (!showFilters) return surveys;
    const needle = query.trim().toLowerCase();

    return surveys.filter((report) => {
      if (fromDate && report.reportDate < fromDate) return false;
      if (toDate && report.reportDate > toDate) return false;
      if (!needle) return true;
      return (
        report.siteName.toLowerCase().includes(needle) ||
        report.siteLocation.toLowerCase().includes(needle) ||
        report.reportNumber.toLowerCase().includes(needle) ||
        report.technicianName.toLowerCase().includes(needle)
      );
    });
  }, [surveys, showFilters, query, fromDate, toDate]);

  const filtersActive = Boolean(query || fromDate || toDate);

  function clearFilters() {
    setQuery('');
    setFromDate('');
    setToDate('');
  }

  const filterBar = showFilters ? (
    <div className="rounded-2xl bg-white p-3 shadow-card">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search site, technician or report no."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-kibs-ink focus:bg-white"
          />
        </div>
      </div>

      {filtersActive && (
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-slate-500">
            {filtered.length} of {surveys.length} report{surveys.length === 1 ? '' : 's'}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        </div>
      )}
    </div>
  ) : null;

  if (filtered.length === 0) {
    return (
      <div className="space-y-2.5">
        {filterBar}
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-400">
          {filtersActive ? 'No reports match those filters.' : emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {filterBar}

      {filtered.map((report) => (
        <button
          key={report.id}
          type="button"
          onClick={() => onSelect(report)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {report.reportNumber}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {JOB_TYPE_LABELS[report.type]}
              </span>
              <StatusBadge status={report.status} />
            </div>
            <h3 className="mt-1.5 truncate text-sm font-bold text-slate-900">{report.siteName}</h3>
            <p className="truncate text-xs text-slate-500">
              {formatDate(report.reportDate)}
              {showTechnician ? ` • ${report.technicianName}` : ''}
            </p>
            {report.photos.length > 0 && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                <Images className="h-3 w-3 text-slate-400" /> {report.photos.length} photo
                {report.photos.length === 1 ? '' : 's'}
              </p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
        </button>
      ))}
    </div>
  );
};
