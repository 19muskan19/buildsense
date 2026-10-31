import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowRight, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Info,
  Maximize2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { INITIAL_DEFECT_OBSERVATIONS } from '../../data/seedData';

export const ChangeDetectionView: React.FC = () => {
  const { defects, elements, buildings } = useData();

  // Defect 3 is the primary growing crack Scenario D
  const targetDefect = defects.find((d) => d.id === 'def-003') || defects[0];
  if (!targetDefect) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-2">
        <h1 className="text-xl font-bold text-slate-900">Change detection</h1>
        <p className="text-sm text-slate-600">No defect observations are on record for a repeat comparison.</p>
      </div>
    );
  }
  const observations = INITIAL_DEFECT_OBSERVATIONS.filter((o) => o.defectId === targetDefect.id);

  const obsA = observations[0];
  const obsB = observations[1];

  const deltaWidth = obsB && obsA ? (obsB.measuredCrackWidthMm || 0) - (obsA.measuredCrackWidthMm || 0) : 0;
  const deltaLength = obsB && obsA ? (obsB.measuredLengthMm || 0) - (obsA.measuredLengthMm || 0) : 0;
  const growthRate = obsA?.measuredCrackWidthMm ? ((deltaWidth / obsA.measuredCrackWidthMm) * 100).toFixed(0) : '0';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Bi-Temporal Change Detection & Repeat Observation Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic measurement progression, crack growth rate calculation, and side-by-side alignment (Scenario D)
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-100 text-purple-800 border border-purple-200">
          Status: ACTIVE GROWING DEFECT
        </span>
      </div>

      {/* Target Element Context Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
              Monitored Asset & Element Record
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {targetDefect.buildingName} • {targetDefect.elementType} {targetDefect.elementCode}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Defect: {targetDefect.type} ({targetDefect.subtype}) • Structural Significance: {targetDefect.structuralSignificance}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 animate-pulse">
              100% Width Expansion Detected
            </span>
          </div>
        </div>
      </div>

      {/* Delta Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Crack Width Delta</span>
          <div className="text-2xl font-extrabold text-rose-600 font-mono mt-1">
            +{deltaWidth.toFixed(2)} mm
          </div>
          <p className="text-xs text-slate-500 mt-1">
            0.70 mm (14 Aug 2026) → <strong>1.40 mm</strong> (14 Oct 2026)
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Length Propagation</span>
          <div className="text-2xl font-extrabold text-rose-600 font-mono mt-1">
            +{deltaLength} mm
          </div>
          <p className="text-xs text-slate-500 mt-1">
            2,100 mm → <strong>3,200 mm</strong> along slab tension line
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severity Escalation</span>
          <div className="text-2xl font-extrabold text-amber-600 font-mono mt-1">
            Grade 3 → Grade 4
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Priority raised from P3 to <strong>P1 Urgent Intervention</strong>
          </p>
        </div>
      </div>

      {/* Side-by-Side Bi-Temporal Comparison (Section 18) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
          <span>Side-by-Side Bi-Temporal Inspection Photography Alignment</span>
          <span className="text-xs font-mono font-normal text-slate-500">Interval: 61 Days</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Observation 1: Baseline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800">
                Observation 1 (Baseline - 14 Aug 2026)
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Insp Ref: insp-pre-01
              </span>
            </div>

            <div className="relative h-64 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
              <img
                src={obsA?.photoIds[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'}
                alt="Baseline Observation"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded">
                Width: 0.70 mm | Length: 2,100 mm
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div><strong>Inspector:</strong> {obsA?.inspectorName}</div>
              <div><strong>Notes:</strong> {obsA?.notes}</div>
              <div><strong>Classification:</strong> Grade 3 (Moderate Flexural)</div>
            </div>
          </div>

          {/* Observation 2: Latest Verified */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-rose-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                Observation 2 (Current - 14 Oct 2026)
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                Active Growth Detected
              </span>
            </div>

            <div className="relative h-64 rounded-xl overflow-hidden bg-slate-900 border-2 border-rose-300">
              <img
                src={obsB?.photoIds[0] || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80'}
                alt="Latest Observation"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2.5 left-2.5 bg-rose-900/90 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded">
                Width: 1.40 mm (+100%) | Length: 3,200 mm (+52%)
              </div>
            </div>

            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl text-xs space-y-1 text-rose-900">
              <div><strong>Inspector:</strong> {obsB?.inspectorName}</div>
              <div><strong>Notes:</strong> {obsB?.notes}</div>
              <div><strong>Classification:</strong> Grade 4 (Severe Active Propagation)</div>
            </div>
          </div>
        </div>

        {/* Change Engine Deterministic Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 mt-4">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Info className="w-4 h-4 text-blue-600" />
            Deterministic Change Engine Analysis (Section 18)
          </div>
          <p className="text-slate-600 leading-relaxed">
            The change detection module has compared repeated optical scale crack measurements across the 61-day window. Both width (+0.70mm) and longitudinal extension (+1,100mm) exceed the configurable rate-of-change threshold (0.20mm / 60 days). The defect classification has transitioned from <strong>STABLE</strong> to <strong>GROWING</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
