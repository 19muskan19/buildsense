import React from 'react';
import { Users, ShieldCheck, CheckCircle2, ChevronRight, HardHat, UserCheck } from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { Role } from '../../types';

export const UserRoleManagementView: React.FC = () => {
  const { currentUser, switchUser } = useAuth();

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              User & Role-Based Access Control (RBAC) Governance
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hierarchy of civil engineering authorizations from Chief Engineer down to Field Inspector and Contractors (Section 4)
          </p>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_USERS.map((usr) => {
          const isCurrent = usr.role === currentUser.role;
          return (
            <div
              key={usr.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                isCurrent ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <img
                    src={usr.avatar}
                    alt={usr.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                  />
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Active User
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900">{usr.name}</h3>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">{usr.roleTitle}</p>
                <p className="text-[11px] text-slate-500 mt-1">{usr.department}</p>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">{usr.email}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => switchUser(usr.role)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 cursor-default'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  }`}
                >
                  {isCurrent ? 'Currently Active' : 'Switch to this Account'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
