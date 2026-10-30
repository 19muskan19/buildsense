import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  Wrench, 
  Info,
  Calendar,
  Building2,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Defect } from '../../types';
import { PriorityBadge, DefectStatusBadge } from '../../components/common/Badges';
import { Modal } from '../../components/common/Modal';
import { exportToCSV, generateDefectRegisterPDF } from '../../services/exportService';

interface DefectRegisterViewProps {
  onNavigate: (route: string) => void;
  onOpenPassport: (buildingId: string) => void;
}

export const DefectRegisterView: React.FC<DefectRegisterViewProps> = ({ onNavigate, onOpenPassport }) => {
  const { defects, buildings, verifyDefect, createWorkOrder } = useData();
  const { currentUser, canVerifyDefect } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [verifiedFilter, setVerifiedFilter] = useState('ALL');

  // Verify Modal
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [verifyGrade, setVerifyGrade] = useState<number>(4);
  const [verifyNotes, setVerifyNotes] = useState<string>('');
  const [measuredWidth, setMeasuredWidth] = useState<string>('');

  // Work order modal
  const [woDefect, setWoDefect] = useState<Defect | null>(null);
  const [woTitle, setWoTitle] = useState('');
  const [woBudget, setWoBudget] = useState('450000');
  const [woMethod, setWoMethod] = useState('Pressure epoxy injection and micro-concrete encasement');

  const filteredDefects = defects.filter((d) => {
    if (priorityFilter !== 'ALL' && d.priorityBand !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
    if (verifiedFilter === 'VERIFIED' && !d.engineerVerified) return false;
    if (verifiedFilter === 'PROVISIONAL' && d.engineerVerified) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchType = d.type.toLowerCase().includes(q);
      const matchSubtype = d.subtype.toLowerCase().includes(q);
      const matchBld = (d.buildingName || '').toLowerCase().includes(q);
      const matchElem = (d.elementCode || '').toLowerCase().includes(q);
      if (!matchType && !matchSubtype && !matchBld && !matchElem) return false;
    }
    return true;
  });

  const handleOpenVerify = (defect: Defect) => {
    setSelectedDefect(defect);
    setVerifyGrade(defect.severityGrade || 4);
    setVerifyNotes(defect.engineerNotes || 'Verified structural condition on-site via physical audit.');
    setMeasuredWidth(defect.measuredCrackWidthMm ? defect.measuredCrackWidthMm.toString() : '');
  };

  const handleConfirmVerify = async () => {
    if (!selectedDefect) return;
    await verifyDefect(selectedDefect.id, {
      engineerGrade: verifyGrade,
      engineerNotes: verifyNotes,
      measuredCrackWidthMm: measuredWidth ? parseFloat(measuredWidth) : undefined
    });
    setSelectedDefect(null);
  };

  const handleOpenCreateWO = (defect: Defect) => {
    setWoDefect(defect);
    setWoTitle(`Rectification of ${defect.subtype} on ${defect.elementCode}`);
  };

  const handleConfirmCreateWO = async () => {
    if (!woDefect) return;
    await createWorkOrder({
      buildingId: woDefect.buildingId,
      defectIds: [woDefect.id],
      title: woTitle,
      repairMethod: woMethod,
      estimatedCostINR: parseFloat(woBudget) || 350000,
      approvedBudgetINR: parseFloat(woBudget) || 350000,
      contractorId: 'usr-ctr-01',
      contractorName: 'Brahmaputra Infrastructure Ltd.',
      priorityBand: woDefect.priorityBand,
      beforePhotoIds: woDefect.imageIds
    });
    setWoDefect(null);
    onNavigate('/work-orders');
  };

  const handleExportCSV = () => {
    const rows = filteredDefects.map((d) => ({
      Building: d.buildingName,
      Element: d.elementCode,
      Type: d.type,
      Subtype: d.subtype,
      StructuralClass: d.structuralSignificance,
      SeverityGrade: d.severityGrade,
      Criticality: d.riskFactors?.C,
      RiskScore: d.riskScore,
      Priority: d.priorityBand,
      P1Override: d.isP1Override ? 'YES' : 'NO',
      Verified: d.engineerVerified ? 'YES' : 'NO',
      Status: d.status,
      RecommendedAction: d.recommendedNextStep
    }));
    exportToCSV(`BuildSense_Defect_Register_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Statewide Defect & Risk Register
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative register of visible structural fractures, corrosion, and enclosure defects sorted by calculated risk score
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => generateDefectRegisterPDF(filteredDefects)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => onNavigate('/ai-defect-analysis')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Run AI Analysis
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search defect type, subtype, building, or element code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 font-medium"
          >
            <option value="ALL">All Priorities (P1-P4)</option>
            <option value="P1">P1 Critical (&gt;=80 or Override)</option>
            <option value="P2">P2 High Risk (60-79)</option>
            <option value="P3">P3 Moderate (35-59)</option>
            <option value="P4">P4 Routine (&lt;35)</option>
          </select>

          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 font-medium"
          >
            <option value="ALL">All Verification States</option>
            <option value="VERIFIED">Verified by Engineer</option>
            <option value="PROVISIONAL">Provisional AI Findings</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 font-medium"
          >
            <option value="ALL">All Workflow Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="WORK_ORDER_ASSIGNED">WO Assigned</option>
            <option value="REPAIR_IN_PROGRESS">Repair in Progress</option>
            <option value="REPAIR_SUBMITTED">Evidence Submitted</option>
            <option value="VERIFIED_REPAIRED">Verified Repaired</option>
          </select>
        </div>
      </div>

      {/* Defect Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Building & Element</th>
                <th className="py-3 px-4">Defect Classification</th>
                <th className="py-3 px-4 text-center">Severity</th>
                <th className="py-3 px-4 text-center">Criticality</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDefects.map((def) => (
                <tr key={def.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span
                      onClick={() => onOpenPassport(def.buildingId)}
                      className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer block"
                    >
                      {def.buildingName}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {def.elementCode} ({def.structuralSignificance})
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 block">{def.type}</span>
                    <span className="text-slate-500 text-[11px]">{def.subtype}</span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      def.severityGrade === 5
                        ? 'bg-rose-100 text-rose-800'
                        : def.severityGrade === 4
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      Grade {def.severityGrade}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {def.riskFactors?.C || 5}/5
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-sm text-slate-900">{def.riskScore}</span>
                    <span className="text-[10px] text-slate-400 block">/ 100</span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <PriorityBadge band={def.priorityBand} isOverride={def.isP1Override} />
                  </td>

                  <td className="py-3.5 px-4">
                    {def.engineerVerified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified (Er. Grade {def.engineerGrade || def.severityGrade})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-purple-700 font-semibold text-[11px]">
                        Provisional AI ({(def.aiConfidence ? def.aiConfidence * 100 : 90).toFixed(0)}%)
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <DefectStatusBadge status={def.status} engineerVerified={def.engineerVerified} />
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    {!def.engineerVerified && canVerifyDefect && (
                      <button
                        onClick={() => handleOpenVerify(def)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs cursor-pointer"
                      >
                        Verify
                      </button>
                    )}
                    {def.status === 'VERIFIED' && (
                      <button
                        onClick={() => handleOpenCreateWO(def)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs cursor-pointer"
                      >
                        Raise WO
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engineer Verification Modal */}
      {selectedDefect && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDefect(null)}
          title={`Engineer Verification: ${selectedDefect.subtype}`}
          subtitle={`Element ${selectedDefect.elementCode} • ${selectedDefect.buildingName}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div><strong>Provisional AI Assessment:</strong> {selectedDefect.description}</div>
              <div><strong>Calculated Initial Score:</strong> {selectedDefect.riskScore}/100</div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Certified Severity Grade (1 - 5) *</label>
              <select
                value={verifyGrade}
                onChange={(e) => setVerifyGrade(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold"
              >
                <option value={1}>Grade 1 - Negligible (Monitor)</option>
                <option value={2}>Grade 2 - Minor (Routine)</option>
                <option value={3}>Grade 3 - Moderate (90-day plan)</option>
                <option value={4}>Grade 4 - Severe (Urgent 30-day review)</option>
                <option value={5}>Grade 5 - Critical (P1 Emergency Override &lt;24-72h)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Measured Physical Crack Width (mm)</label>
              <input
                type="number"
                step="0.05"
                value={measuredWidth}
                onChange={(e) => setMeasuredWidth(e.target.value)}
                placeholder="e.g. 1.8"
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Certified Engineering Notes *</label>
              <textarea
                rows={3}
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDefect(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerify}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Certify & Update Score
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Raise Work Order Modal */}
      {woDefect && (
        <Modal
          isOpen={true}
          onClose={() => setWoDefect(null)}
          title="Raise Rectification Work Order"
          subtitle={`Assign contractor repair for ${woDefect.subtype} on ${woDefect.elementCode}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Work Order Title *</label>
              <input
                type="text"
                value={woTitle}
                onChange={(e) => setWoTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Approved Budget (INR) *</label>
              <input
                type="number"
                value={woBudget}
                onChange={(e) => setWoBudget(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Recommended Repair Method *</label>
              <textarea
                rows={2}
                value={woMethod}
                onChange={(e) => setWoMethod(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setWoDefect(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateWO}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <Wrench className="w-4 h-4" />
                Issue Work Order
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
