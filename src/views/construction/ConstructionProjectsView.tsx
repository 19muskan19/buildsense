import React from 'react';
import { HardHat, Building2, Calendar, AlertTriangle, CheckCircle2, ChevronRight, DollarSign } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ConstructionProjectsView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { constructionProjects } = useData();

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
              Statewide Public Construction Projects & Stage Quality Tracker
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Stage-gate quality control, mandatory material testing, and non-conformance records (IS 456 / MoRTH)
          </p>
        </div>

        <button
          onClick={() => onNavigate('/failed-tests-ncrs')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4" />
          Active NCRs Register
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {constructionProjects.map((prj) => {
          const isBlocked = prj.status === 'Stage Blocked';
          return (
            <div
              key={prj.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                isBlocked ? 'border-rose-300 ring-2 ring-rose-200' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {prj.id.toUpperCase()}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isBlocked
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : prj.status === 'Quality Review'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {prj.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{prj.projectName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{prj.buildingName}</p>

                {/* Stage Banner */}
                <div className="my-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Active Gate Stage:</span>
                  <strong className={isBlocked ? 'text-rose-600 font-bold' : 'text-slate-900 font-bold'}>
                    {prj.currentStage}
                  </strong>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 my-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Physical Progress:</span>
                    <span className="font-mono font-bold text-slate-800">
                      Actual: {prj.actualProgress}% / Planned: {prj.plannedProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${prj.actualProgress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Sanctioned Cost</span>
                    <strong className="text-slate-900">₹{(prj.projectCostINR / 10000000).toFixed(2)} Cr</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Assigned Contractor</span>
                    <strong className="text-slate-900 truncate block">{prj.contractorName}</strong>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Target: {new Date(prj.targetCompletionDate).toLocaleDateString('en-IN')}
                </span>
                {isBlocked ? (
                  <button
                    onClick={() => onNavigate('/failed-tests-ncrs')}
                    className="font-bold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    Resolve Failed Test NCR →
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('/stage-gates')}
                    className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View Stage Gates →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
