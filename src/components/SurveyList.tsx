import React from 'react';
import { Camera, ChevronRight, Lightbulb, Sun } from 'lucide-react';
import { totalCount, type Survey } from '../types';

interface SurveyListProps {
  surveys: Survey[];
  onSelect: (survey: Survey) => void;
  showTechnician?: boolean;
  emptyMessage: string;
  formatDate: (value: string) => string;
}

export const SurveyList: React.FC<SurveyListProps> = ({
  surveys,
  onSelect,
  showTechnician,
  emptyMessage,
  formatDate,
}) => {
  if (surveys.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {surveys.map((survey) => (
        <button
          key={survey.id}
          type="button"
          onClick={() => onSelect(survey)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-xs"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {survey.surveyNumber}
              </span>
              <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                {survey.type === 'new_site' ? 'New Site' : 'Maintenance'}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  survey.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {survey.status === 'approved' ? 'Approved' : 'Pending'}
              </span>
            </div>
            <h3 className="mt-1.5 truncate text-sm font-bold text-slate-900">{survey.siteName}</h3>
            <p className="truncate text-xs text-slate-500">
              {formatDate(survey.surveyDate)}
              {showTechnician ? ` • ${survey.technicianName}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <Camera className="h-3 w-3 text-slate-400" /> {totalCount(survey.cctv)}
              </span>
              <span className="flex items-center gap-1">
                <Lightbulb className="h-3 w-3 text-slate-400" /> {totalCount(survey.floodlights)}
              </span>
              <span className="flex items-center gap-1">
                <Sun className="h-3 w-3 text-slate-400" /> {survey.solarPanels}
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
        </button>
      ))}
    </div>
  );
};
