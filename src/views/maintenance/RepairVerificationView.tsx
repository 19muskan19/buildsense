import React, { useState } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  Wrench,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { WorkOrder } from '../../types';
import { PriorityBadge, WorkOrderStatusBadge } from '../../components/common/Badges';

export const RepairVerificationView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { workOrders, verifyWorkOrder } = useData();
  const { currentUser, canVerifyDefect } = useAuth();

  const submittedWOs = workOrders.filter(
    (w) => w.status === 'SUBMITTED_FOR_VERIFICATION'
  );

  const [activeWO, setActiveWO] = useState<WorkOrder | null>(submittedWOs[0] || null);
  const [engineerDecisionNotes, setEngineerDecisionNotes] = useState(
    'Inspected completed replastering on-site. Surface is sound with water-repellent additive cured properly. Rectification verified and passed.'
  );
  const [actualCost, setActualCost] = useState('105000');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleVerify = async (approve: boolean) => {
    if (!activeWO) return;

    await verifyWorkOrder(activeWO.id, approve, engineerDecisionNotes, parseFloat(actualCost) || undefined);

    setActionFeedback(
      approve
        ? `Repair for ${activeWO.workOrderNumber} VERIFIED and CLOSED. Building BCI recalculated & defect history updated.`
        : `Repair REJECTED with notes. Contractor directed to rectify.`
    );
    setTimeout(() => {
      setActionFeedback(null);
      setActiveWO(null);
    }, 3500);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-purple-50 text-purple-600">
              <FileCheck2 className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Contractor Repair Verification & Formal Sign-Off (AE / EE Review)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Certified engineer verification of completed contractor works, photographic before/after audit, and BCI index refresh (Scenario H)
          </p>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
          Verifying Engineer: {currentUser.name} ({currentUser.roleTitle})
        </span>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {actionFeedback}
        </div>
      )}

      {submittedWOs.length === 0 && !activeWO ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs space-y-2">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
          <h3 className="font-bold text-slate-700 text-sm">No Pending Verifications</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All submitted contractor works have been inspected and verified. You can review past work orders in the register.
          </p>
          <button
            onClick={() => onNavigate('/work-orders')}
            className="text-blue-600 font-bold hover:underline mt-2 inline-block"
          >
            Open Work Orders Register →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Queue of Submitted WOs */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Awaiting Verification Queue ({submittedWOs.length})
            </h3>
            {submittedWOs.map((wo) => {
              const isSelected = activeWO?.id === wo.id;
              return (
                <div
                  key={wo.id}
                  onClick={() => setActiveWO(wo)}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-50/80 border-purple-400 shadow-xs ring-1 ring-purple-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{wo.workOrderNumber}</span>
                    <PriorityBadge band={wo.priorityBand} />
                  </div>
                  <h4 className="font-bold text-slate-800 line-clamp-1">{wo.title}</h4>
                  <p className="text-slate-500 text-[11px] line-clamp-1">{wo.buildingName}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>Contractor: {wo.contractorName}</span>
                    <span className="font-bold text-purple-700">100% Submitted</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Inspection & Verification Console */}
          <div className="lg:col-span-8">
            {activeWO && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                      {activeWO.workOrderNumber}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1">{activeWO.title}</h2>
                    <p className="text-xs text-slate-500">{activeWO.buildingName}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Contractor Cost</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      ₹{activeWO.approvedBudgetINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Before / After Evidence Photos (Section 22) */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">Photographic Repair Evidence Audit</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Before Repair (Original Defect)
                      </span>
                      <div className="h-48 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                        <img
                          src={activeWO.beforePhotoIds[0] || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-purple-700 font-bold mb-1">
                        After Repair (Submitted Contractor Evidence)
                      </span>
                      <div className="h-48 rounded-xl overflow-hidden bg-slate-900 border-2 border-purple-300">
                        <img
                          src={activeWO.afterPhotoIds[0] || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'}
                          alt="After"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contractor's submitted notes */}
                {activeWO.completionNotes && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 block text-[11px] mb-0.5">
                      Contractor Work Completion Statement:
                    </span>
                    <p className="text-slate-600 leading-relaxed">{activeWO.completionNotes}</p>
                  </div>
                )}

                {/* Certified Engineer Verification Form */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900">Certified Engineering Audit Decision</h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Final Actual Cost (INR)</label>
                      <input
                        type="number"
                        value={actualCost}
                        onChange={(e) => setActualCost(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Verifying Engineer</label>
                      <input
                        type="text"
                        disabled
                        value={currentUser.name}
                        className="w-full p-2 border border-slate-200 rounded-xl bg-slate-100 text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Engineer Inspection & Verification Notes *
                    </label>
                    <textarea
                      rows={2}
                      value={engineerDecisionNotes}
                      onChange={(e) => setEngineerDecisionNotes(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Actions: Approve or Reject */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleVerify(false)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl font-bold cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject (Require Rework)
                  </button>

                  <button
                    onClick={() => handleVerify(true)}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Approve & Close Work Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
