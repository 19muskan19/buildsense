import React from 'react';
import { ConditionBand, PriorityBand, DefectStatus, WorkOrderStatus } from '../../types';

export const ConditionBadge: React.FC<{ band: ConditionBand; score?: number }> = ({ band, score }) => {
  const configs: Record<ConditionBand, { bg: string; border: string }> = {
    Good: { bg: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200' },
    Fair: { bg: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
    Poor: { bg: 'bg-amber-50 text-amber-700', border: 'border-amber-200' },
    'Very Poor': { bg: 'bg-orange-50 text-orange-700', border: 'border-orange-200' },
    Critical: { bg: 'bg-rose-50 text-rose-700', border: 'border-rose-200' }
  };

  const style = configs[band] || configs.Good;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${band === 'Critical' ? 'bg-rose-500 animate-pulse' : band === 'Good' ? 'bg-emerald-500' : 'bg-current'}`} />
      {band} {score !== undefined ? `(${score})` : ''}
    </span>
  );
};

export const PriorityBadge: React.FC<{ band: PriorityBand; isOverride?: boolean }> = ({ band, isOverride }) => {
  const configs: Record<PriorityBand, { bg: string; border: string }> = {
    P1: { bg: 'bg-rose-100 text-rose-800', border: 'border-rose-300' },
    P2: { bg: 'bg-orange-100 text-orange-800', border: 'border-orange-300' },
    P3: { bg: 'bg-blue-100 text-blue-800', border: 'border-blue-300' },
    P4: { bg: 'bg-slate-100 text-slate-700', border: 'border-slate-300' }
  };

  const style = configs[band] || configs.P4;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.bg} ${style.border}`}>
      {band === 'P1' && <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />}
      {band}
      {isOverride && <span className="text-[10px] uppercase tracking-wider ml-0.5 bg-rose-200 px-1 rounded font-black">OVERRIDE</span>}
    </span>
  );
};

export const DefectStatusBadge: React.FC<{ status: DefectStatus; engineerVerified?: boolean }> = ({ status, engineerVerified }) => {
  const configs: Record<DefectStatus, { label: string; bg: string; text: string }> = {
    IDENTIFIED: { label: 'Identified', bg: 'bg-slate-100', text: 'text-slate-700' },
    PROVISIONAL: { label: 'Provisional AI', bg: 'bg-purple-50', text: 'text-purple-700' },
    VERIFIED: { label: 'Verified', bg: 'bg-indigo-50', text: 'text-indigo-700' },
    WORK_ORDER_ASSIGNED: { label: 'WO Assigned', bg: 'bg-blue-50', text: 'text-blue-700' },
    REPAIR_IN_PROGRESS: { label: 'Repairing', bg: 'bg-amber-50', text: 'text-amber-700' },
    REPAIR_SUBMITTED: { label: 'Evidence Submitted', bg: 'bg-cyan-50', text: 'text-cyan-700' },
    VERIFIED_REPAIRED: { label: 'Verified & Repaired', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    MONITORING: { label: 'Monitoring', bg: 'bg-slate-50', text: 'text-slate-600' }
  };

  const c = configs[status] || configs.IDENTIFIED;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
      {engineerVerified && <span className="text-emerald-600 text-[10px]">✓</span>}
    </span>
  );
};

export const WorkOrderStatusBadge: React.FC<{ status: WorkOrderStatus }> = ({ status }) => {
  const map: Record<WorkOrderStatus, { label: string; bg: string; text: string }> = {
    NEW: { label: 'New', bg: 'bg-slate-100', text: 'text-slate-700' },
    ASSIGNED: { label: 'Assigned', bg: 'bg-blue-50', text: 'text-blue-700' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-amber-50', text: 'text-amber-700' },
    SUBMITTED_FOR_VERIFICATION: { label: 'Submitted for Review', bg: 'bg-purple-50', text: 'text-purple-700' },
    REJECTED: { label: 'Correction Required', bg: 'bg-rose-50', text: 'text-rose-700' },
    VERIFIED: { label: 'Verified Complete', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    CLOSED: { label: 'Closed', bg: 'bg-slate-200', text: 'text-slate-800' }
  };

  const c = map[status] || map.NEW;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
};
