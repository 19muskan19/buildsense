import React, { useState } from 'react';
import { HardHat, CheckCircle2, Lock, Unlock, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const StageGateView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { constructionProjects, qualityChecks } = useData();
  const [selectedProjectId, setSelectedProjectId] = useState(constructionProjects[0]?.id || 'prj-001');

  const selectedPrj = constructionProjects.find((p) => p.id === selectedProjectId) || constructionProjects[0];

  const STAGES = [
    { name: '1. Foundation & Sub-base', status: 'Passed', test: 'Standard Penetration Test & Soil Bearing Capacity' },
    { name: '2. Reinforcement Detailing', status: 'Passed', test: 'Fe 500D Tensile & Elongation Bend Test' },
    { name: '3. Shuttering & Formwork', status: 'Passed', test: 'Dimensional Tolerances & Cover Blocks Inspection' },
    { name: '4. Plinth & DPC Layer', status: 'Passed', test: 'Damp Proof Course Permeability & Grade Check' },
    { 
      name: '5. Columns & Beams Casting', 
      status: selectedPrj.openNCRs > 0 ? 'Blocked' : 'In Progress', 
      test: '28-Day Concrete Cube Compressive Strength (IS 516)',
      ncr: selectedPrj.openNCRs > 0 ? 'NCR-2026-PRJ01-003' : undefined
    },
    { name: '6. Slab Pre-pour Inspection', status: 'Upcoming', test: 'Rebar Placement, Conduit Clearance & Chair Spacing' },
    { name: '7. Concreting & Compaction', status: 'Upcoming', test: 'Slump Flow Test & Needle Vibrator Audit' },
    { name: '8. 14-Day Wet Curing', status: 'Upcoming', test: 'Ponding Integrity & Surface Curing Compound' },
    { name: '9. Waterproofing & Enclosure', status: 'Upcoming', test: 'Water Ponding Test (48-Hour Head Test)' },
    { name: '10. Final Handover & As-Built Certification', status: 'Upcoming', test: 'Pre-Commissioning Checklist & Fire Clearance' }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-50 text-amber-600">
              <HardHat className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Stage-Gate Quality Assurance & Milestone Verification
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sequential 10-stage quality gates enforcing mandatory material approvals before advancing construction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-bold"
          >
            {constructionProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.projectName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Project Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">{selectedPrj.projectName}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Facility: {selectedPrj.buildingName} • Contractor: {selectedPrj.contractorName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[10px]">Gate Status</span>
            <span className={`font-bold ${selectedPrj.openNCRs > 0 ? 'text-rose-600' : 'text-blue-600'}`}>
              {selectedPrj.status}
            </span>
          </div>
        </div>
      </div>

      {/* 10 Stages Step Timeline */}
      <div className="space-y-3">
        {STAGES.map((stage, idx) => {
          const isPassed = stage.status === 'Passed';
          const isBlocked = stage.status === 'Blocked';
          const isInProgress = stage.status === 'In Progress';

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                isBlocked
                  ? 'bg-rose-50/60 border-rose-300 ring-2 ring-rose-200'
                  : isInProgress
                  ? 'bg-blue-50/40 border-blue-200'
                  : isPassed
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-50/60 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3 text-xs">
                <div className="mt-0.5">
                  {isPassed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isBlocked ? (
                    <Lock className="w-5 h-5 text-rose-600 animate-pulse" />
                  ) : isInProgress ? (
                    <Unlock className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{stage.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        isPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : isBlocked
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : isInProgress
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {stage.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Gate Check: <strong>{stage.test}</strong>
                  </p>
                  {stage.ncr && (
                    <p className="text-rose-700 font-mono text-[11px] font-bold mt-1">
                      Blocked by {stage.ncr} - Characteristic strength failed specification
                    </p>
                  )}
                </div>
              </div>

              {isBlocked && (
                <button
                  onClick={() => onNavigate('/failed-tests-ncrs')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer flex-shrink-0"
                >
                  Review NCR Resolution →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
