import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Building2, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';

export const InspectionScheduleView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { inspections, buildings } = useData();
  const { currentUser } = useAuth();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const [newSchedule, setNewSchedule] = useState({
    buildingId: buildings[0]?.id || 'bld-001',
    inspectorName: 'Er. Diganta Medhi, JE',
    inspectionMethod: 'Visual Walkthrough',
    inspectionDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    summaryNotes: 'Scheduled structural routine inspection'
  });

  const filteredInspections = inspections.filter((i) => {
    if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
    return true;
  });

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const bld = buildings.find((b) => b.id === newSchedule.buildingId);
    inspections.unshift({
      id: `insp-${Date.now()}`,
      buildingId: newSchedule.buildingId,
      buildingName: bld?.name,
      inspectorId: 'usr-je-01',
      inspectorName: newSchedule.inspectorName,
      inspectionMethod: newSchedule.inspectionMethod as any,
      inspectionDate: newSchedule.inspectionDate,
      weather: 'Clear',
      checklistResults: [],
      photoIds: [],
      status: 'Scheduled',
      summaryNotes: newSchedule.summaryNotes
    });
    setIsScheduleModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Statewide Field Inspection Schedule & Task Assignments
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track scheduled routine assessments, special NDT diagnostic surveys, and overdue facility audits
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Schedule Inspection
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium"
          >
            <option value="ALL">All Inspections</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Submitted">Submitted (Awaiting Review)</option>
            <option value="Verified">Verified Complete</option>
          </select>
        </div>
        <span className="text-xs text-slate-500">
          Showing <strong>{filteredInspections.length}</strong> tasks
        </span>
      </div>

      {/* Inspection List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredInspections.map((insp) => (
          <div key={insp.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{insp.buildingName || insp.buildingId}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  insp.status === 'Verified'
                    ? 'bg-emerald-100 text-emerald-800'
                    : insp.status === 'Submitted'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {insp.status}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Method: <strong>{insp.inspectionMethod}</strong> • Assigned: <strong>{insp.inspectorName}</strong>
              </p>
              <p className="text-[11px] text-slate-500">{insp.summaryNotes}</p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Inspection Date</span>
                <span className="font-mono font-bold text-slate-800">
                  {new Date(insp.inspectionDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => onNavigate('/field-inspection')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg font-semibold flex items-center gap-1"
              >
                Launch Form <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule New Facility Inspection"
        subtitle="Assign an engineer to conduct a verified structural assessment"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSchedule} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Target Building *</label>
            <select
              value={newSchedule.buildingId}
              onChange={(e) => setNewSchedule({ ...newSchedule, buildingId: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.buildingCode})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Inspector</label>
              <input
                type="text"
                value={newSchedule.inspectorName}
                onChange={(e) => setNewSchedule({ ...newSchedule, inspectorName: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Inspection Method</label>
              <select
                value={newSchedule.inspectionMethod}
                onChange={(e) => setNewSchedule({ ...newSchedule, inspectionMethod: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              >
                <option value="Visual Walkthrough">Visual Walkthrough</option>
                <option value="Detailed Engineering Assessment">Detailed Engineering Assessment</option>
                <option value="NDT Diagnostic">NDT Diagnostic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Scheduled Date *</label>
            <input
              type="date"
              required
              value={newSchedule.inspectionDate}
              onChange={(e) => setNewSchedule({ ...newSchedule, inspectionDate: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Instructions / Scope of Inspection</label>
            <textarea
              rows={2}
              value={newSchedule.summaryNotes}
              onChange={(e) => setNewSchedule({ ...newSchedule, summaryNotes: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
