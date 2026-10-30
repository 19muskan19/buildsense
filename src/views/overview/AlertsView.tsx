import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Activity, 
  QrCode, 
  HardHat, 
  Clock, 
  CheckCircle2, 
  FileCheck2, 
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface AlertsViewProps {
  onNavigate: (route: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onNavigate }) => {
  const { notifications, markNotificationRead } = useData();
  const { currentUser } = useAuth();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const filteredNotifs = notifications.filter((n) => {
    if (filterType !== 'ALL' && n.type !== filterType) return false;
    if (priorityFilter !== 'ALL' && n.priority !== priorityFilter) return false;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'P1_DEFECT':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'SENSOR_ALARM':
        return <Activity className="w-4 h-4 text-rose-600 animate-pulse" />;
      case 'OCCUPANT_COMPLAINT':
        return <QrCode className="w-4 h-4 text-blue-600" />;
      case 'FAILED_TEST_NCR':
        return <HardHat className="w-4 h-4 text-amber-600" />;
      case 'WORK_SUBMITTED':
        return <FileCheck2 className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-50 text-rose-600">
              <Bell className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              In-App Notification & Emergency Alert Centre
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time critical safety escalations, IoT sensor threshold violations, and workflow approvals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="P1_DEFECT">P1 Defect Escalations</option>
            <option value="SENSOR_ALARM">Sensor Threshold Alarms</option>
            <option value="OCCUPANT_COMPLAINT">Public Complaints</option>
            <option value="FAILED_TEST_NCR">Failed Test NCRs</option>
            <option value="WORK_SUBMITTED">Work Verification</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifs.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
              !notif.read ? 'bg-blue-50/30' : 'hover:bg-slate-50/60'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2 rounded-xl flex-shrink-0 ${
                  notif.priority === 'CRITICAL'
                    ? 'bg-rose-50 border border-rose-200'
                    : notif.priority === 'HIGH'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                {getIcon(notif.type)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">{notif.title}</h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full ${
                      notif.priority === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : notif.priority === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {notif.priority}
                  </span>
                  {!notif.read && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded">
                      New
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                  {notif.relatedBuildingName && (
                    <span className="font-medium text-slate-700">
                      Asset: {notif.relatedBuildingName}
                    </span>
                  )}
                  <span>•</span>
                  <span>{new Date(notif.createdAt).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {!notif.read && (
                <button
                  onClick={() => markNotificationRead(notif.id)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs"
                  title="Mark as Read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {notif.relatedRoute && (
                <button
                  onClick={() => {
                    markNotificationRead(notif.id);
                    onNavigate(notif.relatedRoute!);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  View <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredNotifs.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No alerts match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
