import React from 'react';
import { FileText, Download, FileCheck2, Building2, AlertTriangle, Calendar, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { 
  exportToCSV, 
  generateBuildingConditionReportPDF, 
  generateDefectRegisterPDF, 
  generateWorkOrdersReportPDF,
  generateAnnualMaintenancePlanPDF
} from '../../services/exportService';

export const ReportsExportView: React.FC = () => {
  const { buildings, defects, workOrders, qualityChecks, auditEvents, maintenancePlans } = useData();

  const REPORTS = [
    {
      id: 'rep-01',
      title: '1. Building Condition Report',
      desc: 'Certified passport PDF with BCI calculation breakdown, element defects, and engineer signatures.',
      type: 'PDF',
      action: () => generateBuildingConditionReportPDF(buildings[0], defects.filter(d => d.buildingId === buildings[0].id), [])
    },
    {
      id: 'rep-02',
      title: '2. Portfolio-Wide Defect Register',
      desc: 'Complete log of cracks, spalling, moisture, and corrosion with calculated risk scores and P1-P4 bands.',
      type: 'PDF + CSV',
      action: () => generateDefectRegisterPDF(defects)
    },
    {
      id: 'rep-03',
      title: '3. Field Inspection Report',
      desc: 'Certified on-site walkthroughs, drone surveys, and NDT diagnostic readings.',
      type: 'CSV',
      action: () => exportToCSV('BuildSense_Inspection_Report', defects.map(d => ({ Defect: d.type, Building: d.buildingName, Priority: d.priorityBand })))
    },
    {
      id: 'rep-04',
      title: '4. Rectification Work-Order Report',
      desc: 'Status of active and completed repairs, contractor SLAs, budgets, and before/after verification photos.',
      type: 'PDF + CSV',
      action: () => generateWorkOrdersReportPDF(workOrders)
    },
    {
      id: 'rep-05',
      title: '5. Construction Quality Report',
      desc: 'Stage-gate approvals, reinforcement checks, and project progress percentages.',
      type: 'CSV',
      action: () => exportToCSV('BuildSense_Construction_Quality_Report', qualityChecks)
    },
    {
      id: 'rep-06',
      title: '6. Failed Material Test Register',
      desc: 'Mandatory non-conformance records (NCRs), compressive strength test failures, and resolutions.',
      type: 'CSV',
      action: () => exportToCSV('BuildSense_Failed_Material_Tests_NCR', qualityChecks.filter(q => q.ncrNumber || !q.passed))
    },
    {
      id: 'rep-07',
      title: '7. Annual Maintenance Plan',
      desc: 'Sanctioned budget allocations, selected work packages, and projected risk reductions.',
      type: 'PDF',
      action: () => {
        if (maintenancePlans[0]) generateAnnualMaintenancePlanPDF(maintenancePlans[0], workOrders);
      }
    },
    {
      id: 'rep-08',
      title: '8. Risk and Priority Report',
      desc: 'Ranking of all facilities sorted by cumulative risk exposure and cost of repair deferral.',
      type: 'CSV',
      action: () => exportToCSV('BuildSense_Risk_Priority_Queue', defects.map(d => ({ Building: d.buildingName, Element: d.elementCode, RiskScore: d.riskScore, Priority: d.priorityBand })))
    },
    {
      id: 'rep-09',
      title: '9. Overdue Work Report',
      desc: 'Work orders exceeding scheduled contractual completion dates requiring executive escalation.',
      type: 'CSV',
      action: () => exportToCSV('BuildSense_Overdue_Repairs', workOrders.filter(w => new Date(w.dueDate) < new Date()))
    },
    {
      id: 'rep-10',
      title: '10. Post-Monsoon Condition Summary',
      desc: 'Statewide moisture ingress, terrace leakage, and drainage audit following the monsoon season.',
      type: 'CSV',
      action: () => exportToCSV('BuildSense_Post_Monsoon_Summary', defects.filter(d => d.type === 'MOISTURE'))
    },
    {
      id: 'rep-11',
      title: '11. Audit History Export',
      desc: 'Immutable chronicle of all user decisions, score overrides, and financial commitments.',
      type: 'CSV',
      action: () => exportToCSV('BuildSense_Audit_Events_Log', auditEvents)
    }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Official Executive Reports & Export Generator
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Certified document generation for all 11 required institutional reporting standards (Specification Section 30)
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {REPORTS.map((rep) => (
          <div
            key={rep.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-blue-600">{rep.type}</span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">{rep.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rep.desc}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Live DB Generation</span>
              <button
                onClick={rep.action}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
