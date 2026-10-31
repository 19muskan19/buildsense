import React, { useState } from 'react';
import { 
  Layers, 
  Building2, 
  AlertTriangle, 
  ClipboardCheck, 
  Cpu, 
  Wrench, 
  HardHat, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { ConditionBadge, PriorityBadge, WorkOrderStatusBadge } from '../../components/common/Badges';

interface DivisionDashboardViewProps {
  onOpenPassport: (buildingId: string) => void;
  onNavigate: (route: string) => void;
}

export const DivisionDashboardView: React.FC<DivisionDashboardViewProps> = ({ onOpenPassport, onNavigate }) => {
  const { divisions, buildings, defects, workOrders, inspections, qualityChecks } = useData();
  const { currentUser } = useAuth();

  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(
    currentUser.divisionId || 'div-metro-central'
  );

  const currentDiv = divisions.find((d) => d.id === selectedDivisionId) || divisions[0];
  if (!currentDiv) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-2">
        <h1 className="text-xl font-bold text-slate-900">Division dashboard</h1>
        <p className="text-sm text-slate-600">No division records are available to summarise.</p>
      </div>
    );
  }
  const divBuildings = buildings.filter((b) => b.divisionId === currentDiv.id);
  const divBuildingIds = divBuildings.map((b) => b.id);

  const divDefects = defects.filter((d) => divBuildingIds.includes(d.buildingId));
  const unverifiedAI = divDefects.filter((d) => !d.engineerVerified);
  const criticalDefects = divDefects.filter((d) => d.priorityBand === 'P1');
  const divWOs = workOrders.filter((w) => divBuildingIds.includes(w.buildingId));
  const openWOs = divWOs.filter((w) => w.status !== 'VERIFIED' && w.status !== 'CLOSED');
  const overdueWOs = divWOs.filter((w) => new Date(w.dueDate) < new Date() && w.status !== 'VERIFIED');
  const divQCs = qualityChecks.filter((q) => divBuildingIds.includes(q.buildingId));
  const failedNCRs = divQCs.filter((q) => q.ncrStatus === 'Open');

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Division Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-50 text-indigo-700">
              <Layers className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {currentDiv.name} Operational Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            District: {currentDiv.district} • In-Charge: {currentDiv.responsibleEngineerName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Select Division:</label>
          <select
            value={selectedDivisionId}
            onChange={(e) => setSelectedDivisionId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold cursor-pointer"
          >
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Division KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Buildings"
          value={divBuildings.length}
          subtitle={`Average Verified BCI: ${currentDiv.averageBCI}`}
          icon={Building2}
          colorScheme="blue"
        />
        <StatCard
          title="Unverified AI Findings"
          value={unverifiedAI.length}
          subtitle="Awaiting AE field verification"
          icon={Cpu}
          colorScheme={unverifiedAI.length > 0 ? 'amber' : 'emerald'}
          onClick={() => onNavigate('/defects')}
        />
        <StatCard
          title="Critical P1 Structural Findings"
          value={criticalDefects.length}
          subtitle="Mandatory 24-72h site response"
          icon={AlertTriangle}
          colorScheme="rose"
          onClick={() => onNavigate('/defects')}
        />
        <StatCard
          title="Construction NCRs Open"
          value={failedNCRs.length}
          subtitle={`${openWOs.length} Active Work Orders`}
          icon={HardHat}
          colorScheme="amber"
          onClick={() => onNavigate('/failed-tests-ncrs')}
        />
      </div>

      {/* Buildings in this Division */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Buildings Under Division Jurisdiction</h3>
            <p className="text-xs text-slate-500">Live condition index, floor area, and latest inspection status</p>
          </div>
          <button
            onClick={() => onNavigate('/buildings')}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            Manage in Registry →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {divBuildings.map((b) => (
            <div
              key={b.id}
              onClick={() => onOpenPassport(b.id)}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-slate-50/40 hover:bg-white flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {b.buildingCode}
                  </span>
                  <ConditionBadge band={b.conditionBand} score={b.currentBCI} />
                </div>
                <h4 className="text-xs font-bold text-slate-900 hover:text-blue-600 line-clamp-1">
                  {b.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  {b.buildingType} • {b.numberOfFloors} Floors • {b.structuralSystem}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-100">
                  <span>Open Defects: <strong>{defects.filter((d) => d.buildingId === b.id).length}</strong></span>
                  <span>Sensors: <strong>{b.hasActiveSensors ? 'Active' : 'None'}</strong></span>
                </div>
              </div>
              <div className="mt-3 text-right">
                <span className="text-[11px] font-semibold text-blue-600">Open Health Passport →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Division Open Work Orders & Quality Gates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Work Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-blue-600" />
              Active Rectification Orders in Division
            </h3>
            <button
              onClick={() => onNavigate('/work-orders')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              All Orders
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {divWOs.slice(0, 4).map((w) => (
              <div key={w.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{w.workOrderNumber}</span>
                    <PriorityBadge band={w.priorityBand} />
                    <WorkOrderStatusBadge status={w.status} />
                  </div>
                  <p className="text-slate-700 font-medium line-clamp-1">{w.title}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Contractor: {w.contractorName} • Due: {new Date(w.dueDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-bold text-slate-900">₹{(w.approvedBudgetINR / 1000).toFixed(0)}k</span>
                  <div className="text-[11px] font-semibold text-blue-600 mt-1">{w.progressPercent}% Done</div>
                </div>
              </div>
            ))}
            {divWOs.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-400">No active work orders in this division</p>
            )}
          </div>
        </div>

        {/* Quality Gates & Stage Blockers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-amber-600" />
              Construction Quality & Mandatory Gate Reviews
            </h3>
            <button
              onClick={() => onNavigate('/failed-tests-ncrs')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              View NCRs
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {divQCs.map((qc) => (
              <div key={qc.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{qc.testType}</span>
                    {qc.passed ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">Passed</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold animate-pulse">
                        GATE BLOCKED
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Stage: <strong>{qc.constructionStage}</strong> | Result: <strong>{qc.testValue}</strong>
                  </p>
                  {qc.ncrNumber && (
                    <p className="text-rose-600 font-mono text-[10px] mt-0.5">
                      {qc.ncrNumber} ({qc.ncrStatus})
                    </p>
                  )}
                </div>
                {!qc.passed && qc.ncrStatus === 'Open' && (
                  <button
                    onClick={() => onNavigate('/failed-tests-ncrs')}
                    className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] border border-rose-200 cursor-pointer flex-shrink-0"
                  >
                    Resolve NCR
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
