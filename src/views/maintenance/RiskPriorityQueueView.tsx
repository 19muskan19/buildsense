import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Wrench, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Info,
  DollarSign
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { PriorityBadge, DefectStatusBadge } from '../../components/common/Badges';

export const RiskPriorityQueueView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { defects } = useData();

  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Sorted by Risk Score descending (P1 first, then highest risk score)
  const sortedDefects = [...defects].sort((a, b) => {
    if (a.priorityBand === 'P1' && b.priorityBand !== 'P1') return -1;
    if (b.priorityBand === 'P1' && a.priorityBand !== 'P1') return 1;
    return b.riskScore - a.riskScore;
  });

  const filtered = sortedDefects.filter((d) => {
    if (priorityFilter !== 'ALL' && d.priorityBand !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Risk-Based Maintenance Prioritisation Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic risk ranking sorted by formula <code>Risk Score = 100 × (S × C × P × E) / 625</code> with emergency P1 structural override
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold"
          >
            <option value="ALL">All Priorities</option>
            <option value="P1">P1 Critical Only</option>
            <option value="P2">P2 High Risk</option>
            <option value="P3">P3 Moderate</option>
            <option value="P4">P4 Routine</option>
          </select>
        </div>
      </div>

      {/* Priority Band SLA Targets (Section 14) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 text-xs space-y-1">
          <div className="flex items-center justify-between font-bold text-rose-900">
            <span>P1 Emergency</span>
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
          </div>
          <p className="text-[11px] text-rose-700">Score &gt;= 80 or Grade 5 Primary Element</p>
          <div className="text-[11px] font-bold text-rose-900 pt-1">Response: 24–72 Hours</div>
        </div>

        <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/50 text-xs space-y-1">
          <div className="font-bold text-orange-900">P2 High Risk</div>
          <p className="text-[11px] text-orange-700">Score 60–79</p>
          <div className="text-[11px] font-bold text-orange-900 pt-1">Response: Within 30 Days</div>
        </div>

        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 text-xs space-y-1">
          <div className="font-bold text-blue-900">P3 Moderate</div>
          <p className="text-[11px] text-blue-700">Score 35–59</p>
          <div className="text-[11px] font-bold text-blue-900 pt-1">Response: Within 90 Days</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
          <div className="font-bold text-slate-900">P4 Routine</div>
          <p className="text-[11px] text-slate-600">Score &lt; 35</p>
          <div className="text-[11px] font-bold text-slate-800 pt-1">Annual Maintenance Plan</div>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-3">
        {filtered.map((def, idx) => (
          <div
            key={def.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs text-xs space-y-3 transition-all ${
              def.priorityBand === 'P1' ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-slate-400 text-sm">#{idx + 1}</span>
                <PriorityBadge band={def.priorityBand} isOverride={def.isP1Override} />
                <span className="font-bold text-sm text-slate-900">{def.buildingName}</span>
                <span className="font-mono text-slate-500 text-[11px]">({def.elementCode})</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-lg text-slate-900">
                  Risk: {def.riskScore}/100
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[10px]">Defect Type</span>
                <strong className="text-slate-900">{def.type}: {def.subtype}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Formula Factor Breakdown</span>
                <strong className="text-blue-700 font-mono">
                  S:{def.riskFactors?.S} × C:{def.riskFactors?.C} × P:{def.riskFactors?.P} × E:{def.riskFactors?.E}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Structural Role</span>
                <strong className="text-slate-900">{def.structuralSignificance} Structure</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Cost of Deferral</span>
                <strong className="text-rose-600 font-mono">
                  ₹{def.costOfDeferralINR ? (def.costOfDeferralINR / 100000).toFixed(1) + 'L' : 'N/A'}
                </strong>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">{def.description}</p>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px]">
              <span className="text-slate-500">
                Action: <strong>{def.recommendedNextStep}</strong>
              </span>

              <button
                onClick={() => onNavigate('/work-orders')}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg cursor-pointer"
              >
                Track Repair Work Order →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
