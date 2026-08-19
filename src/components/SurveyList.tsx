import React, { useMemo, useState } from 'react';
import { ChevronRight, Images, Search, X } from 'lucide-react';
import { JOB_TYPES, JOB_TYPE_LABELS, type JobType, type Report } from '../types';
import { StatusBadge } from './StatusBadge';
import { UrgencyBadge } from './UrgencyBadge';

export type TypeFilter = JobType | 'all';

interface SurveyListProps {
  surveys: Report[];
  onSelect: (survey: Report) => void;
  showTechnician?: boolean;
  emptyMessage: string;
  formatDate: (value: string) => string;
  /** Show the search + date filter bar above the list (admin views). */
  showFilters?: boolean;
  /** Controlled job-type filter; chips only render when a setter is supplied. */
  typeFilter?: TypeFilter;
  onTypeFilterChange?: (value: TypeFilter) => void;
  /** Reports the admin hasn't reviewed yet — flagged with a red dot. */
  newReportIds?: Set<string>;
}

// Local-time YYYY-MM-DD so presets line up with the user's own calendar
// rather than shifting a day around UTC midnight.
function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  // Monday-first week: Sunday (0) counts as the 7th day.
  const weekday = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - weekday);
  return result;
}

type PresetId = 'today' | 'week' | 'month';

function presetRange(preset: PresetId): { from: string; to: string } {
  const now = new Date();
  const today = toIsoDate(now);

  if (preset === 'today') return { from: today, to: today };
  if (preset === 'week') return { from: toIsoDate(startOfWeek(now)), to: today };
  return { from: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)), to: today };
}

const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

export const SurveyList: React.FC<SurveyListProps> = ({
  surveys,
  onSelect,
  showTechnician,
  emptyMessage,
  formatDate,
  showFilters,
  typeFilter = 'all',
  onTypeFilterChange,
  newReportIds,
}) => {
  const [query, setQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filtered = useMemo(() => {
    if (!showFilters) return surveys;
    const needle = query.trim().toLowerCase();

    return surveys.filter((report) => {
      if (typeFilter !== 'all' && report.type !== typeFilter) return false;
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
  }, [surveys, showFilters, query, fromDate, toDate, typeFilter]);

  const activePreset = useMemo(() => {
    if (!fromDate && !toDate) return null;
    return PRESETS.find((preset) => {
      const range = presetRange(preset.id);
      return range.from === fromDate && range.to === toDate;
    })?.id ?? null;
  }, [fromDate, toDate]);

  const datesActive = Boolean(fromDate || toDate);
  const filtersActive = Boolean(query || datesActive || typeFilter !== 'all');

  function applyPreset(preset: PresetId) {
    if (activePreset === preset) {
      setFromDate('');
      setToDate('');
      return;
    }
    const range = presetRange(preset);
    setFromDate(range.from);
    setToDate(range.to);
  }

  function clearFilters() {
    setQuery('');
    setFromDate('');
    setToDate('');
    onTypeFilterChange?.('all');
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

      {onTypeFilterChange && (
        <div className="mt-2 flex flex-wrap gap-1.5 border-b border-slate-100 pb-2">
          {([{ id: 'all' as TypeFilter, label: 'All Types' }] as { id: TypeFilter; label: string }[])
            .concat(JOB_TYPES.map((type) => ({ id: type, label: JOB_TYPE_LABELS[type] })))
            .map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onTypeFilterChange(option.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  typeFilter === option.id
                    ? 'bg-kibs-ink text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => {
            setFromDate('');
            setToDate('');
          }}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            !datesActive ? 'bg-kibs-ink text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Time
        </button>
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activePreset === preset.id
                ? 'bg-kibs-ink text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
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
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
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
          className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-cardHover"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {newReportIds?.has(report.id) && (
                <span className="flex items-center gap-1 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                  NEW
                </span>
              )}
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {report.reportNumber}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {JOB_TYPE_LABELS[report.type]}
              </span>
              <StatusBadge status={report.status} />
              {report.urgency === 'high' && <UrgencyBadge urgency={report.urgency} />}
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
