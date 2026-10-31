import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Download, 
  Layers, 
  ClipboardCheck, 
  Wrench, 
  FolderLock, 
  Activity, 
  TrendingUp, 
  History, 
  ShieldCheck, 
  ArrowLeft,
  ChevronRight,
  Info,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ConditionBadge, PriorityBadge, DefectStatusBadge, WorkOrderStatusBadge } from '../../components/common/Badges';
import { generateBuildingConditionReportPDF } from '../../services/exportService';

interface BuildingPassportViewProps {
  buildingId: string;
  onBack: () => void;
  onNavigate: (route: string) => void;
}

export const BuildingPassportView: React.FC<BuildingPassportViewProps> = ({ buildingId, onBack, onNavigate }) => {
  const { buildings, elements, defects, workOrders, inspections, sensors, documents, auditEvents, systemConfig } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'elements' | 'defects' | 'inspections' | 'repairs' | 'documents' | 'sensors' | 'forecast' | 'audit'
  >('overview');

  const building = buildings.find((b) => b.id === buildingId) || buildings[0];
  if (!building) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-3">
        <button onClick={onBack} className="text-sm font-semibold text-blue-700">Back to registry</button>
        <h1 className="text-xl font-bold text-slate-900">Building record unavailable</h1>
        <p className="text-sm text-slate-600">Choose a facility from the Building Registry to open its health passport.</p>
      </div>
    );
  }
  const bDefects = defects.filter((d) => d.buildingId === building.id);
  const bElements = elements.filter((e) => e.buildingId === building.id);
  const bWorkOrders = workOrders.filter((w) => w.buildingId === building.id);
  const bInspections = inspections.filter((i) => i.buildingId === building.id);
  const bSensors = sensors.filter((s) => s.buildingId === building.id);
  const bDocs = documents.filter((doc) => doc.buildingId === building.id);
  const bAudits = auditEvents.filter((a) => a.entityId === building.id || bDefects.some((d) => d.id === a.entityId));

  const criticalDefects = bDefects.filter((d) => d.priorityBand === 'P1');

  const tabs = [
    { id: 'overview', label: '1. Overview' },
    { id: 'elements', label: `2. Floors & Elements (${bElements.length})` },
    { id: 'defects', label: `3. Defects (${bDefects.length})` },
    { id: 'inspections', label: `4. Inspection History (${bInspections.length})` },
    { id: 'repairs', label: `5. Repairs (${bWorkOrders.length})` },
    { id: 'documents', label: `6. Documents (${bDocs.length})` },
    { id: 'sensors', label: `7. Sensors (${bSensors.length})` },
    { id: 'forecast', label: '8. Forecast' },
    { id: 'audit', label: '9. Audit History' }
  ];

  const handleExportPDF = () => {
    generateBuildingConditionReportPDF(building, bDefects, bElements);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shrink-0"
            title="Back to Registry"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {building.buildingCode}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 break-words">{building.name}</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Digital Structural Health Passport • {building.district} Division
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportPDF}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Condition Report (PDF)
          </button>
        </div>
      </div>

      {/* Building Summary Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Photo */}
          <div className="lg:col-span-1 h-44 rounded-xl overflow-hidden ring-1 ring-slate-200">
            <img
              src={building.photoUrl}
              alt={building.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Core Info */}
          <div className="lg:col-span-2 space-y-2 text-xs">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <ConditionBadge band={building.conditionBand} score={building.currentBCI} />
              <span className="font-semibold text-slate-700">{building.buildingType} Facility</span>
              <span>•</span>
              <span className="text-slate-500">{building.department}</span>
            </div>

            <p className="text-slate-600 font-medium">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              {building.address}, {building.district}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Structural Framing</span>
                <strong className="text-slate-800">{building.structuralSystem}</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Floors & Area</span>
                <strong className="text-slate-800">
                  {building.numberOfFloors} Floors ({building.floorAreaSqM} m²)
                </strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Built Year / Age</span>
                <strong className="text-slate-800">
                  {building.yearBuilt} ({new Date().getFullYear() - building.yearBuilt} yrs)
                </strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Occupancy Consequence</span>
                <strong className="text-slate-800">{building.occupancyType}</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Criticality Rating</span>
                <strong className="text-slate-800">{building.criticality} / 5</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Next Scheduled Audit</span>
                <strong className="text-slate-800">
                  {new Date(building.nextInspectionAt).toLocaleDateString('en-IN')}
                </strong>
              </div>
            </div>
          </div>

          {/* Official BCI Gauge */}
          <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-5 text-center flex flex-col justify-center items-center shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Building Condition Index
            </span>
            <div className="text-4xl font-extrabold mt-1 font-mono tracking-tight text-white">
              {building.currentBCI}
              <span className="text-base text-slate-400 font-normal"> / 100</span>
            </div>
            <div className="mt-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                Band: {building.conditionBand}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Computed area- & criticality-weighted deduction model
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (9 tabs required by Section 8) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 select-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 border-t-2 border-t-blue-600 border-x border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Critical Risk Banner if P1 exists */}
          {criticalDefects.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-sm">
                  Active P1 Critical Structural Alert ({criticalDefects.length} finding)
                </strong>
                <p className="mt-0.5 leading-relaxed">
                  Primary structural member affected (e.g. {criticalDefects[0].elementCode}). Emergency propping and qualified structural engineer assessment protocol initiated.
                </p>
              </div>
            </div>
          )}

          {/* BCI Calculation Formula Explanation Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              BCI Calculation Formula & Documented Methodology (Specification Section 15)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official Building Condition Index: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-blue-800">BCI = max(0, 100 - sum(weighted defect deductions))</code>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <strong className="block text-slate-800 mb-1">Severity Weights (S)</strong>
                <span className="text-slate-500 text-[11px]">Grade 1: -1.5 | Grade 2: -4.0 | Grade 3: -9.0 | Grade 4: -16.0 | Grade 5: -28.0</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <strong className="block text-slate-800 mb-1">Criticality Multipliers (C)</strong>
                <span className="text-slate-500 text-[11px]">Primary: x2.0 | Secondary: x1.2 | Non-Structural: x0.7</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <strong className="block text-slate-800 mb-1">Verification Rule</strong>
                <span className="text-slate-500 text-[11px]">BCI updates solely upon certified engineer verification or repaired inspection sign-off.</span>
              </div>
            </div>
          </div>

          {/* Active Defects Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Active Structural & Envelope Defect Summary</h3>
            <div className="divide-y divide-slate-100">
              {bDefects.map((def) => (
                <div key={def.id} className="py-3 flex items-start justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="font-bold text-slate-900">{def.elementCode} ({def.elementType})</span>
                      <PriorityBadge band={def.priorityBand} isOverride={def.isP1Override} />
                      <DefectStatusBadge status={def.status} engineerVerified={def.engineerVerified} />
                    </div>
                    <p className="text-slate-700 font-medium">{def.type} • {def.subtype}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{def.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-slate-900 text-sm">Risk {def.riskScore}</span>
                    <p className="text-[10px] text-slate-400">Grade {def.severityGrade}/5</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Floors & Elements */}
      {activeTab === 'elements' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Floor, Zone & Structural Element Hierarchy</h3>
              <p className="text-xs text-slate-500">Categorized by Primary Structure, Secondary Structure, and Envelope Elements</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Element Code</th>
                  <th className="py-2.5 px-3">Floor & Zone</th>
                  <th className="py-2.5 px-3">Element Type</th>
                  <th className="py-2.5 px-3">Structural Class</th>
                  <th className="py-2.5 px-3 text-center">Criticality</th>
                  <th className="py-2.5 px-3 text-center">Condition Grade</th>
                  <th className="py-2.5 px-3">Location Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bElements.map((elem) => (
                  <tr key={elem.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{elem.elementCode}</td>
                    <td className="py-3 px-3 text-slate-600">{elem.floorId} • {elem.zoneId}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{elem.elementType}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        elem.structuralClass === 'PRIMARY' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {elem.structuralClass}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold">{elem.criticality}/5</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        elem.currentConditionGrade >= 4 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Grade {elem.currentConditionGrade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] max-w-xs">{elem.locationDescription}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Defects */}
      {activeTab === 'defects' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Comprehensive Defect Log & Risk Scores</h3>
              <p className="text-xs text-slate-500">Calculated risk score = 100 × (S × C × P × E) / 625</p>
            </div>
            <button
              onClick={() => onNavigate('/defects')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Open Defect Register →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {bDefects.map((def) => (
              <div key={def.id} className="py-4 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{def.type}: {def.subtype}</span>
                      <PriorityBadge band={def.priorityBand} isOverride={def.isP1Override} />
                      <DefectStatusBadge status={def.status} engineerVerified={def.engineerVerified} />
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Element: <strong>{def.elementCode}</strong> ({def.structuralSignificance})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-base text-slate-900">Risk {def.riskScore}/100</span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      (S:{def.riskFactors?.S} × C:{def.riskFactors?.C} × P:{def.riskFactors?.P} × E:{def.riskFactors?.E}) / 625
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">{def.description}</p>
                {def.dimensions && (
                  <p className="text-slate-500 font-mono text-[11px]">Dimensions: {def.dimensions}</p>
                )}
                {def.engineerNotes && (
                  <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900">
                    <strong>Engineer Verification Note:</strong> {def.engineerNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Inspection History */}
      {activeTab === 'inspections' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Field Inspection Log & NDT Diagnostics</h3>
              <p className="text-xs text-slate-500">History of visual walk-throughs, drone audits, and non-destructive tests</p>
            </div>
            <button
              onClick={() => onNavigate('/field-inspection')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Start New Inspection →
            </button>
          </div>

          <div className="space-y-4">
            {bInspections.map((insp) => (
              <div key={insp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{insp.inspectionMethod}</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      {insp.status}
                    </span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {new Date(insp.inspectionDate).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <p className="text-slate-600">
                  Inspector: <strong>{insp.inspectorName}</strong> • Weather: <strong>{insp.weather}</strong>
                </p>

                {insp.summaryNotes && (
                  <p className="text-slate-700 bg-white p-2 rounded border border-slate-200 text-[11px]">
                    {insp.summaryNotes}
                  </p>
                )}

                {insp.NDTReadings && insp.NDTReadings.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-700 text-[11px]">Recorded NDT Diagnostics:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {insp.NDTReadings.map((ndt, idx) => (
                        <div key={idx} className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                          <strong>{ndt.testMethod}:</strong> {ndt.value} {ndt.unit} ({ndt.status})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Repairs */}
      {activeTab === 'repairs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Rectification Work Orders & Contractor Execution</h3>
              <p className="text-xs text-slate-500">Track repair instructions, budgets, before/after photos, and engineering signoffs</p>
            </div>
            <button
              onClick={() => onNavigate('/work-orders')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Manage Work Orders →
            </button>
          </div>

          <div className="space-y-3">
            {bWorkOrders.map((wo) => (
              <div key={wo.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{wo.workOrderNumber}</span>
                    <WorkOrderStatusBadge status={wo.status} />
                    <PriorityBadge band={wo.priorityBand} />
                  </div>
                  <span className="font-bold text-slate-900">₹{wo.approvedBudgetINR.toLocaleString('en-IN')}</span>
                </div>

                <h4 className="font-bold text-slate-800">{wo.title}</h4>
                <p className="text-slate-600 text-[11px]">{wo.repairMethod}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                  <span>Contractor: <strong>{wo.contractorName}</strong></span>
                  <span>Progress: <strong>{wo.progressPercent}%</strong></span>
                  <span>Due: <strong>{new Date(wo.dueDate).toLocaleDateString('en-IN')}</strong></span>
                </div>
              </div>
            ))}
            {bWorkOrders.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-400">No work orders issued for this facility yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">As-Built Drawings & Certified Records</h3>
              <p className="text-xs text-slate-500">Structural layout drawings, material certificates, and diagnostic audits</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {bDocs.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-bold text-slate-900">{doc.fileName}</h4>
                    <p className="text-slate-500 text-[11px]">
                      {doc.category} • {doc.fileSize} • Uploaded by {doc.uploadedBy}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExportPDF}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold cursor-pointer"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Sensors */}
      {activeTab === 'sensors' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Installed Structural Health IoT Sensors</h3>
              <p className="text-xs text-slate-500">Tiltmeters, crack meters, and environmental transducers with threshold alerting</p>
            </div>
            <button
              onClick={() => onNavigate('/sensors')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Sensor Telemetry Stream →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bSensors.map((sns) => (
              <div key={sns.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{sns.sensorType}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sns.status === 'Alarm' ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {sns.status}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">Element: {sns.elementName}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-slate-900">{sns.lastReadingValue}</span>
                  <span className="text-slate-500 font-semibold">{sns.unit}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Threshold limit: {sns.thresholdHigh} {sns.unit} | Last: {new Date(sns.lastReadingTime).toLocaleTimeString('en-IN')}
                </div>
              </div>
            ))}
            {bSensors.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-400 col-span-2">
                No active IoT sensors installed on this facility.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 8: Forecast */}
      {activeTab === 'forecast' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Deterioration Forecasting & Predictive Trajectory</h3>
            <p className="text-xs text-slate-500">Historical condition grades and estimated future BCI decay curve</p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs space-y-2">
            <h4 className="font-bold text-blue-900">Predictive Maintenance Recommendation</h4>
            <p className="text-blue-800 leading-relaxed">
              Based on historical inspection deltas and environmental exposure factors, this building is projected to experience a <strong>6.2-point BCI reduction</strong> over the next 18 months if current active moisture and shear distress are not addressed.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-bold text-blue-900">Suggested Action Window:</span> Next works package allocation within 90 days.
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Audit History */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Certified Audit Trail & Decision Log</h3>
            <p className="text-xs text-slate-500">Immutable record of engineer verifications, score overrides, and work authorizations</p>
          </div>

          <div className="divide-y divide-slate-100">
            {bAudits.map((aud) => (
              <div key={aud.id} className="py-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{aud.action}</span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {new Date(aud.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-slate-600">
                  Actor: <strong>{aud.actorName}</strong> ({aud.actorRole})
                </p>
                {aud.reason && <p className="text-slate-500 text-[11px]">Reason: {aud.reason}</p>}
              </div>
            ))}
            {bAudits.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-400">No audit events recorded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
