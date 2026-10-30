import React, { useState } from 'react';
import { History, Search, Filter, ShieldCheck, User, Calendar, FileText } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const AuditTrailView: React.FC = () => {
  const { auditEvents } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAudits = auditEvents.filter((aud) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = aud.action.toLowerCase().includes(q);
      const matchActor = aud.actorName.toLowerCase().includes(q);
      const matchReason = (aud.reason || '').toLowerCase().includes(q);
      if (!matchAction && !matchActor && !matchReason) return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-slate-100 text-slate-800">
              <History className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Immutable System Audit Trail & Forensic Decision Log
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident record of all engineer verifications, score overrides, and financial authorizations (Section 28)
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit actions, engineer name, or justification reasons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Engineer / Actor</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Before State</th>
                <th className="py-3 px-4">After State</th>
                <th className="py-3 px-4">Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAudits.map((aud) => (
                <tr key={aud.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(aud.timestamp).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                      {aud.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {aud.actorName} <span className="text-slate-400 text-[10px]">({aud.actorRole})</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{aud.entityId}</td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">{aud.beforeSummary || '—'}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 text-[11px]">{aud.afterSummary || '—'}</td>
                  <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs">{aud.reason || 'Routine operational execution'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
