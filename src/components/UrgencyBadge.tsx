import React from 'react';
import { URGENCY_LABELS, type Urgency } from '../types';

// Red is reserved for genuinely urgent work so it reads at a glance against
// the otherwise monochrome UI; medium and low stay in the neutral scale.
const URGENCY_CLASSES: Record<Urgency, string> = {
  high: 'bg-red-600 text-white',
  medium: 'bg-kibs-ink text-white',
  low: 'bg-slate-100 text-slate-500',
};

interface UrgencyBadgeProps {
  urgency: Urgency;
  className?: string;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency, className = '' }) => (
  <span
    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${URGENCY_CLASSES[urgency]} ${className}`}
  >
    {URGENCY_LABELS[urgency]} urgency
  </span>
);
