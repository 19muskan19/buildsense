import React, { useState } from 'react';
import { 
  HardHat, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Send, 
  Image as ImageIcon,
  Building2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { WorkOrder } from '../../types';
import { PriorityBadge, WorkOrderStatusBadge } from '../../components/common/Badges';

export const ContractorPortalView: React.FC = () => {
  const { workOrders, updateWorkOrderProgress } = useData();
  const { currentUser } = useAuth();

  // Contractor sees assigned work orders
  const assignedToUser = workOrders.filter(
    (w) =>
      w.contractorId === currentUser.id ||
      (currentUser.contractorCompany ? w.contractorName.includes(currentUser.contractorCompany) : false)
  );
  const contractorWOs = assignedToUser.length > 0 ? assignedToUser : workOrders;

  const [activeWO, setActiveWO] = useState<WorkOrder>(contractorWOs[0] || workOrders[0]);
  const [progressVal, setProgressVal] = useState<number>(activeWO ? activeWO.progressPercent : 50);
  const [completionNotes, setCompletionNotes] = useState(
    'Polymer mortar encasement and curing completed. Core surface treated with anti-carbonation barrier.'
  );
  const [afterPhotoUrl, setAfterPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
  );
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleSubmitProgress = async (forVerification: boolean) => {
    if (!activeWO) return;

    await updateWorkOrderProgress(activeWO.id, {
      progressPercent: forVerification ? 100 : progressVal,
      notes: completionNotes,
      afterPhotoIds: [afterPhotoUrl],
      submitForVerification: forVerification
    });

    setSubmitSuccess(
      forVerification
        ? 'Work order submitted for engineer verification! Assistant Engineer notified.'
        : 'Progress updated successfully.'
    );
    setTimeout(() => setSubmitSuccess(null), 4000);
  };

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
              Contractor Dedicated Work-Order Execution Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Empanelled contractor interface for repair progress updates, evidence photographic submission, and verification SLA tracking
          </p>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
          Contractor: {currentUser.contractorCompany || 'Brahmaputra Infrastructure Ltd.'}
        </span>
      </div>

      {submitSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {submitSuccess}
        </div>
      )}

      {/* Main Grid: Left assigned list, Right work order submission console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Assigned Work Orders (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Assigned Work Orders ({contractorWOs.length})
          </h3>
          <div className="space-y-2">
            {contractorWOs.map((wo) => {
              const isSelected = activeWO?.id === wo.id;
              return (
                <div
                  key={wo.id}
                  onClick={() => {
                    setActiveWO(wo);
                    setProgressVal(wo.progressPercent);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800">{wo.workOrderNumber}</span>
                    <WorkOrderStatusBadge status={wo.status} />
                  </div>
                  <h4 className="font-bold text-slate-900 line-clamp-1">{wo.title}</h4>
                  <p className="text-slate-500 text-[11px] line-clamp-1">{wo.buildingName}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>Due: {new Date(wo.dueDate).toLocaleDateString('en-IN')}</span>
                    <span className="font-mono font-bold text-slate-700">{wo.progressPercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Execution & Photo Evidence Console (8 cols) */}
        <div className="lg:col-span-8">
          {activeWO ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                      {activeWO.workOrderNumber}
                    </span>
                    <PriorityBadge band={activeWO.priorityBand} />
                    <WorkOrderStatusBadge status={activeWO.status} />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{activeWO.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{activeWO.buildingName}</p>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Approved Budget</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    ₹{activeWO.approvedBudgetINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Repair Method Instructions */}
              <div>
                <strong className="block text-slate-800 mb-1">Executive Engineer Repair Specifications:</strong>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {activeWO.repairMethod}
                </p>
              </div>

              {/* Rejection notice if previously rejected */}
              {activeWO.status === 'REJECTED' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                  <strong className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Repair Rejected by Engineer — Correction Required:
                  </strong>
                  <p className="text-[11px]">{activeWO.rejectionReason}</p>
                </div>
              )}

              {/* Photos Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <strong className="block text-slate-700 mb-1">Before Repair Photograph (Site Condition)</strong>
                  <div className="h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                    <img
                      src={activeWO.beforePhotoIds[0] || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80'}
                      alt="Before Repair"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div>
                  <strong className="block text-slate-700 mb-1">After Repair Photograph (Contractor Evidence) *</strong>
                  <div className="h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative group">
                    <img
                      src={afterPhotoUrl}
                      alt="After Repair"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold bg-slate-800/80 px-2 py-1 rounded">
                        Completion Evidence Photo
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-700">Contractor Self-Reported Progress:</span>
                  <span className="font-mono text-blue-600 font-bold text-sm">{progressVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                  className="w-full cursor-pointer accent-blue-600"
                />
              </div>

              {/* Completion Notes */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Contractor Execution & Materials Used Notes *
                </label>
                <textarea
                  rows={2}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmitProgress(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  Save Progress Update
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitProgress(true)}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Submit for Certified Engineer Verification
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select a work order from the left to view instructions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
