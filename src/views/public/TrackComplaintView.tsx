import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, AlertTriangle, Building2, Wrench, ShieldCheck, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Complaint } from '../../types';

export const TrackComplaintView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { complaints } = useData();

  const [refInput, setRefInput] = useState('CMP-2026-081');
  const [searchedComplaint, setSearchedComplaint] = useState<Complaint | null>(
    complaints.find((c) => c.complaintReference === 'CMP-2026-081') || complaints[0] || null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const found = complaints.find(
      (c) => c.complaintReference.toLowerCase() === refInput.trim().toLowerCase()
    );

    if (found) {
      setSearchedComplaint(found);
    } else {
      setErrorMsg(`No complaint found with reference "${refInput}". Please check the reference number.`);
      setSearchedComplaint(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          Track Building Issue Resolution Status
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Enter your unique complaint reference number (e.g. CMP-2026-081) to view real-time inspection, defect conversion, and contractor repair updates.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            required
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            placeholder="e.g. CMP-2026-081"
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          Track Status
        </button>
      </form>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Complaint Detail Card */}
      {searchedComplaint && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <span className="font-mono text-sm font-extrabold text-blue-700">
                {searchedComplaint.complaintReference}
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                {searchedComplaint.category}
              </h2>
              <p className="text-slate-500 text-[11px] mt-0.5">{searchedComplaint.buildingName}</p>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
              Status: {searchedComplaint.status}
            </span>
          </div>

          {/* Description */}
          <div>
            <strong className="block text-slate-700 mb-1">Reported Details:</strong>
            <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              {searchedComplaint.description}
            </p>
            <p className="text-slate-400 text-[11px] mt-1">
              Location: <strong>{searchedComplaint.locationDescription}</strong> • Submitted: {new Date(searchedComplaint.submittedAt).toLocaleString('en-IN')}
            </p>
          </div>

          {/* Department Triage & Linkage */}
          {searchedComplaint.triageNotes && (
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-blue-900 space-y-1">
              <strong className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Department Engineering Action Taken:
              </strong>
              <p className="leading-relaxed">{searchedComplaint.triageNotes}</p>
              {searchedComplaint.linkedDefectId && (
                <div className="pt-1 text-[11px] font-semibold text-blue-700">
                  Linked Defect Record: {searchedComplaint.linkedDefectId}
                </div>
              )}
            </div>
          )}

          {/* Progression Timeline */}
          <div className="pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-700 block mb-3">Resolution Progress Timeline</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span className="font-bold block text-[11px]">1. Submitted</span>
                <span className="text-[10px] text-emerald-700">QR Received</span>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span className="font-bold block text-[11px]">2. Triaged</span>
                <span className="text-[10px] text-emerald-700">AE Verified</span>
              </div>

              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-blue-900">
                <Clock className="w-4 h-4 mx-auto mb-1 text-blue-600 animate-spin" />
                <span className="font-bold block text-[11px]">3. Repair Assigned</span>
                <span className="text-[10px] text-blue-700">WO Active</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-slate-300" />
                <span className="font-bold block text-[11px]">4. Verified Closed</span>
                <span className="text-[10px]">Sign-off Pending</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
