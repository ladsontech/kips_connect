import React from 'react';
import { REPORT_STATUS_LABELS, type ReportStatus } from '../types';

// Monochrome status weighting, consistent everywhere:
//   pending  -> solid black  (needs the admin's attention)
//   approved -> light grey   (settled, low emphasis)
//   rejected -> outlined     (settled, but stands apart from approved)
const STATUS_CLASSES: Record<ReportStatus, string> = {
  pending: 'bg-kibs-ink text-white',
  approved: 'bg-slate-100 text-slate-500',
  rejected: 'border border-kibs-ink bg-white text-kibs-ink',
};

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => (
  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${STATUS_CLASSES[status]} ${className}`}>
    {REPORT_STATUS_LABELS[status]}
  </span>
);
