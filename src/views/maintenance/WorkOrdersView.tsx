import React, { useState } from 'react';
import { 
  Wrench, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  CheckCircle2, 
  Building2, 
  AlertTriangle,
  FileCheck2,
  Image as ImageIcon,
  DollarSign
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { WorkOrder } from '../../types';
import { PriorityBadge, WorkOrderStatusBadge } from '../../components/common/Badges';
import { Modal } from '../../components/common/Modal';
import { exportToCSV, generateWorkOrdersReportPDF } from '../../services/exportService';

export const WorkOrdersView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { workOrders, updateWorkOrderProgress, verifyWorkOrder } = useData();
  const { currentUser, canVerifyDefect, canSubmitRepair } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [activeWO, setActiveWO] = useState<WorkOrder | null>(null);

  const filteredWOs = workOrders.filter((w) => {
    if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && w.priorityBand !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = w.workOrderNumber.toLowerCase().includes(q);
      const matchTitle = w.title.toLowerCase().includes(q);
      const matchCtr = w.contractorName.toLowerCase().includes(q);
      const matchBld = (w.buildingName || '').toLowerCase().includes(q);
      if (!matchNo && !matchTitle && !matchCtr && !matchBld) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const rows = filteredWOs.map((w) => ({
      WONumber: w.workOrderNumber,
      Building: w.buildingName,
      Title: w.title,
      Contractor: w.contractorName,
      BudgetINR: w.approvedBudgetINR,
      Priority: w.priorityBand,
      ProgressPercent: w.progressPercent,
      Status: w.status,
      DueDate: w.dueDate
    }));
    exportToCSV(`BuildSense_Work_Orders_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <Wrench className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Rectification Work Orders & Maintenance Lifecycle
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end repair execution: Assignment → Progress → Contractor Evidence → Verification → Closed
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => generateWorkOrdersReportPDF(filteredWOs)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export PDF Report
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => onNavigate('/contractor-portal')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-xs"
          >
            Contractor Portal
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search work order number, title, contractor, or facility..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SUBMITTED_FOR_VERIFICATION">Submitted for Verification</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Correction Required</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="P1">P1 Critical</option>
            <option value="P2">P2 High</option>
            <option value="P3">P3 Moderate</option>
            <option value="P4">P4 Routine</option>
          </select>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {filteredWOs.map((wo) => {
          const isSubmitted = wo.status === 'SUBMITTED_FOR_VERIFICATION';
          const isP1 = wo.priorityBand === 'P1';
          return (
            <div
              key={wo.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs space-y-3 transition-all ${
                isP1 ? 'border-rose-200' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                    {wo.workOrderNumber}
                  </span>
                  <PriorityBadge band={wo.priorityBand} />
                  <WorkOrderStatusBadge status={wo.status} />
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500 font-mono">
                    Due: <strong>{new Date(wo.dueDate).toLocaleDateString('en-IN')}</strong>
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{wo.approvedBudgetINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{wo.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Asset: <strong>{wo.buildingName}</strong> • Contractor: <strong>{wo.contractorName}</strong>
                </p>
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <strong>Repair Instructions:</strong> {wo.repairMethod}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Execution Progress</span>
                  <span className="text-blue-600 font-mono">{wo.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      wo.status === 'VERIFIED' ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${wo.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 text-xs">
                <div className="text-slate-400 text-[11px]">
                  Assigned Engineer: {wo.assignedEngineerName}
                </div>

                <div className="flex items-center gap-2">
                  {isSubmitted && canVerifyDefect && (
                    <button
                      onClick={() => onNavigate('/repair-verification')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      Verify Submitted Repair →
                    </button>
                  )}
                  {wo.status !== 'VERIFIED' && (
                    <button
                      onClick={() => setActiveWO(wo)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                    >
                      View Details & Photos
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {activeWO && (
        <Modal
          isOpen={true}
          onClose={() => setActiveWO(null)}
          title={`Work Order: ${activeWO.workOrderNumber}`}
          subtitle={activeWO.title}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[10px]">Contractor</span>
                <strong className="text-slate-900">{activeWO.contractorName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Approved Budget</span>
                <strong className="text-slate-900">₹{activeWO.approvedBudgetINR.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div>
              <strong className="block text-slate-800 mb-1">Approved Repair Method</strong>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {activeWO.repairMethod}
              </p>
            </div>

            {/* Before Photos */}
            {activeWO.beforePhotoIds.length > 0 && (
              <div>
                <strong className="block text-slate-800 mb-1">Before Repair Photographic Evidence</strong>
                <div className="h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img src={activeWO.beforePhotoIds[0]} alt="Before" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* After Photos if submitted */}
            {activeWO.afterPhotoIds.length > 0 && (
              <div>
                <strong className="block text-slate-800 mb-1">Contractor Completion Evidence (After Photos)</strong>
                <div className="h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img src={activeWO.afterPhotoIds[0]} alt="After" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveWO(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
