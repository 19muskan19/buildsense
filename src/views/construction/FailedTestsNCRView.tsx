import React, { useState } from 'react';
import { 
  AlertTriangle, 
  HardHat, 
  CheckCircle2, 
  ShieldAlert, 
  FileCheck2, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Info,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { QualityCheck } from '../../types';
import { Modal } from '../../components/common/Modal';

export const FailedTestsNCRView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { qualityChecks, resolveNCR, constructionProjects } = useData();
  const { currentUser } = useAuth();

  const [selectedNCR, setSelectedNCR] = useState<QualityCheck | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const ncrList = qualityChecks.filter((q) => q.ncrNumber || !q.passed);

  const handleResolveNCR = async () => {
    if (!selectedNCR) return;
    setResolving(true);
    try {
      await resolveNCR(selectedNCR.id);
      setSuccessMsg(`NCR ${selectedNCR.ncrNumber} successfully resolved by ${currentUser.name}. Stage gate unlocked.`);
      setSelectedNCR(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      //
    } finally {
      setResolving(false);
    }
  };

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
              Failed Material Tests & Non-Conformance Records (NCR)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mandatory gate blocking workflow: failed strength tests prevent stage casting until certified engineer sign-off (Scenario C)
          </p>
        </div>

        <button
          onClick={() => onNavigate('/projects')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          <HardHat className="w-4 h-4" />
          View All Projects
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Mandatory Safety Rule Banner (Section 21) */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-sm">Mandatory Gate Lock Protocol Active</strong>
          <p className="mt-0.5 leading-relaxed">
            Per International Structural Quality Specifications (ASTM C39 / ISO / ACI), any mandatory test failure (e.g. 28-day concrete cylinder compressive break below M30 characteristic threshold) enforces an automatic software lock on subsequent upper level shuttering and pour permits until core tests or structural retrofits are certified by an Executive Engineer.
          </p>
        </div>
      </div>

      {/* NCR Cards Grid */}
      <div className="space-y-4">
        {ncrList.map((qc) => {
          const isOpen = qc.ncrStatus === 'Open';
          return (
            <div
              key={qc.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs text-xs space-y-3 transition-all ${
                isOpen ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {qc.ncrNumber || 'NCR-PENDING'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOpen
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isOpen ? 'STAGE GATE FROZEN' : 'RESOLVED & APPROVED'}
                  </span>
                </div>

                <span className="text-slate-400 font-mono text-[11px]">
                  Tested On: {new Date(qc.testedAt).toLocaleDateString('en-IN')}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{qc.testType}</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Construction Stage: <strong>{qc.constructionStage}</strong> • Acceptance Criteria: {qc.acceptanceCriteria}
                </p>
              </div>

              {/* Test Metric Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Actual Lab Measured Value</span>
                  <strong className={!qc.passed ? 'text-rose-600 font-bold font-mono text-sm' : 'text-emerald-600 font-bold'}>
                    {qc.testValue}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Acceptance Standard</span>
                  <strong className="text-slate-800 font-mono text-xs">{qc.acceptanceCriteria}</strong>
                </div>
              </div>

              {/* Corrective Action & Engineer Review */}
              {qc.correctiveAction && (
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-rose-900 text-[11px] space-y-1">
                  <strong>Mandatory Corrective Action Required:</strong>
                  <p>{qc.correctiveAction}</p>
                </div>
              )}

              {qc.notes && (
                <p className="text-slate-600 text-[11px] bg-slate-50 p-2 rounded">
                  <strong>Audit Log Notes:</strong> {qc.notes}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-slate-400 text-[11px]">
                  {isOpen ? 'Requires Executive Engineer authorization' : `Approved by ${qc.approvedBy}`}
                </span>

                {isOpen && (
                  <button
                    onClick={() => {
                      setSelectedNCR(qc);
                      setResolutionNotes(
                        'Core cutting samples tested at Assam Engineering College laboratory confirmed equivalent cube strength of 31.2 N/mm². Executive Engineer approval granted to unfreeze Stage Gate.'
                      );
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                  >
                    <Unlock className="w-4 h-4" />
                    Review & Resolve NCR
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolve NCR Modal */}
      {selectedNCR && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedNCR(null)}
          title={`Executive Review & Resolve ${selectedNCR.ncrNumber}`}
          subtitle={`Mandatory resolution protocol for ${selectedNCR.testType}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div><strong>Failed Metric:</strong> {selectedNCR.testValue}</div>
              <div><strong>Required Criteria:</strong> {selectedNCR.acceptanceCriteria}</div>
              <div><strong>Active Blocker:</strong> {selectedNCR.correctiveAction}</div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Authorized Engineer Resolution Certificate *
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px]">
              <strong>Engineering Signoff:</strong> Authorizing as <strong>{currentUser.name}</strong> ({currentUser.roleTitle}). This action will resolve the non-conformance and restore project status from "Stage Blocked" to "In Progress".
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedNCR(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resolving}
                onClick={handleResolveNCR}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                {resolving ? 'Authorizing...' : 'Certify & Unlock Stage Gate'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
