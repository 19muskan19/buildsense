import React, { useState } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge } from '../../components/common/Badges';
import { generateAnnualMaintenancePlanPDF } from '../../services/exportService';

export const AnnualMaintenancePlanView: React.FC = () => {
  const { maintenancePlans, workOrders, optimizeBudgetPlan, divisions } = useData();
  const { currentUser } = useAuth();

  const [selectedDivisionId, setSelectedDivisionId] = useState('div-metro-central');
  const [budgetINR, setBudgetINR] = useState('5000000'); // 50 Lakhs INR
  const [optimizing, setOptimizing] = useState(false);

  const activePlan = maintenancePlans[0];

  const handleRunOptimization = async () => {
    setOptimizing(true);
    try {
      await optimizeBudgetPlan(selectedDivisionId, parseFloat(budgetINR) || 5000000);
    } finally {
      setOptimizing(false);
    }
  };

  const handleExportPDF = () => {
    if (activePlan) {
      generateAnnualMaintenancePlanPDF(activePlan, workOrders);
    }
  };

  const selectedWOs = workOrders.filter((w) => activePlan?.selectedWorkOrderIds?.includes(w.id));
  const deferredWOs = workOrders.filter((w) => activePlan?.deferredWorkOrderIds?.includes(w.id));

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-50 text-emerald-600">
              <Calculator className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Budget-Aware Annual Maintenance Planning & Optimisation
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic risk-reduction optimisation engine with mandatory safety P1 allocations and fiscal constraint modeling (Scenario G)
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Maintenance Plan (PDF)
        </button>
      </div>

      {/* Optimizer Config Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          1. Configure Budget Envelope & Target Division
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Target PWD Division</label>
            <select
              value={selectedDivisionId}
              onChange={(e) => setSelectedDivisionId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium"
            >
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Sanctioned Annual Budget Envelope (INR) *
            </label>
            <input
              type="number"
              step="100000"
              value={budgetINR}
              onChange={(e) => setBudgetINR(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
            />
          </div>

          <div>
            <button
              onClick={handleRunAIPlan}
              disabled={optimizing}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              {optimizing ? 'Executing Optimizer...' : 'Run Risk-Optimisation Model'}
            </button>
          </div>
        </div>
      </div>

      {/* Plan Results Dashboard */}
      {activePlan && (
        <div className="space-y-6">
          {/* Key Plan Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Allocated Spend</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                ₹{(activePlan.estimatedTotalCostINR / 100000).toFixed(2)}L
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Of ₹{(activePlan.availableBudgetINR / 100000).toFixed(2)}L Budget Envelope
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Projected Risk Reduction</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {activePlan.projectedRiskReductionPercent}%
              </div>
              <p className="text-xs text-slate-500 mt-1">Statewide infrastructure risk abatement</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Selected Work Packages</span>
              <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
                {activePlan.selectedWorkOrderIds.length} Packages
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {activePlan.mandatorySafetyWorkOrderIds.length} Mandatory P1 Inclusions
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Safety Deficit</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${
                activePlan.unmetSafetyBudgetINR > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}>
                ₹{(activePlan.unmetSafetyBudgetINR / 100000).toFixed(2)}L
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {activePlan.unmetSafetyBudgetINR > 0 ? 'Urgent escalation needed' : 'Fully Funded'}
              </p>
            </div>
          </div>

          {/* Safety-First Algorithm Rule Banner (Section 25) */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed space-y-1">
            <strong>Mandatory Safety Inclusion Rule (Section 25):</strong>
            <p>
              In accordance with civil infrastructure safety protocol, mandatory P1 safety works (such as emergency propping for shear cracks) are automatically included first before optimizing elective routine maintenance packages. Funding deficits are prominently flagged for executive supplementary grants rather than silently dropping critical works.
            </p>
          </div>

          {/* Selected Work Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Selected Work Orders for {activePlan.year} Programme ({selectedWOs.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">WO Number</th>
                    <th className="py-2.5 px-3">Building</th>
                    <th className="py-2.5 px-3">Scope of Works</th>
                    <th className="py-2.5 px-3">Contractor</th>
                    <th className="py-2.5 px-3 text-center">Priority</th>
                    <th className="py-2.5 px-3 text-right">Cost (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedWOs.map((wo) => (
                    <tr key={wo.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{wo.workOrderNumber}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{wo.buildingName}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs">{wo.title}</td>
                      <td className="py-3 px-3 text-slate-600">{wo.contractorName}</td>
                      <td className="py-3 px-3 text-center">
                        <PriorityBadge band={wo.priorityBand} />
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{wo.approvedBudgetINR.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function handleRunAIPlan() {
    handleRunOptimization();
  }
};
