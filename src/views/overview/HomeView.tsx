import React from 'react';
import { 
  Building2, 
  AlertTriangle, 
  ClipboardCheck, 
  Wrench, 
  ShieldCheck, 
  Cpu, 
  TrendingUp, 
  QrCode, 
  Activity, 
  ArrowRight,
  HardHat,
  ChevronRight,
  FileCheck2,
  DollarSign
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { ConditionBadge, PriorityBadge } from '../../components/common/Badges';

interface HomeViewProps {
  onNavigate: (route: string) => void;
  onOpenPassport: (buildingId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenPassport }) => {
  const { buildings, defects, workOrders, inspections, constructionProjects, sensors, qualityChecks } = useData();
  const { currentUser } = useAuth();

  const totalBuildings = buildings.length;
  const criticalDefects = defects.filter((d) => d.priorityBand === 'P1');
  const openWOs = workOrders.filter((w) => w.status !== 'VERIFIED' && w.status !== 'CLOSED');
  const activeAlarms = sensors.filter((s) => s.status === 'Alarm');
  const avgBCI = Math.round(buildings.reduce((acc, b) => acc + b.currentBCI, 0) / (totalBuildings || 1));
  const failedNCRs = qualityChecks.filter((q) => q.ncrStatus === 'Open');

  // Complete Lifecycle Stages described in Section 1
  const lifecycleStages = [
    { num: '01', title: 'Construction QA', desc: 'Stage-gate checklists & material cylinder tests', route: '/projects', icon: HardHat },
    { num: '02', title: 'Building Registry', desc: 'Structural inventory & floor element taxonomy', route: '/buildings', icon: Building2 },
    { num: '03', title: 'Field Inspection', desc: 'Mobile photo capture & NDT rebound readings', route: '/field-inspection', icon: ClipboardCheck },
    { num: '04', title: 'AI Defect Detection', desc: 'Multimodal vision analysis & grading', route: '/ai-defect-analysis', icon: Cpu },
    { num: '05', title: 'Engineer Verification', desc: 'Certified sign-off with P1 emergency override', route: '/defects', icon: ShieldCheck },
    { num: '06', title: 'BCI Index Rollup', desc: 'Deterministic area- & criticality-weighted score', route: '/passport', icon: FileCheck2 },
    { num: '07', title: 'Risk Prioritisation', desc: 'P1-P4 queue based on S x C x P x E / 625', route: '/risk-queue', icon: AlertTriangle },
    { num: '08', title: 'Work-Order Repair', desc: 'Contractor assignment, budget & progress SLA', route: '/work-orders', icon: Wrench },
    { num: '09', title: 'Repair Evidence', desc: 'Before/after photo audit & engineer acceptance', route: '/repair-verification', icon: CheckCircleIcon },
    { num: '10', title: 'Predictive Plan', desc: 'Condition forecasting & budget optimisation', route: '/annual-plan', icon: TrendingUp }
  ];

  function CheckCircleIcon(props: any) {
    return <ShieldCheck {...props} />;
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            BuildSense Operations Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Building Condition & Preventive Asset Management
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Logged in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.roleTitle}).
            Real-time infrastructure health, stage-gate construction assurance, and predictive maintenance across the enterprise portfolio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('/field-inspection')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4" />
            New Field Inspection
          </button>
          <button
            onClick={() => onNavigate('/ai-defect-analysis')}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            Analyze Defect (AI)
          </button>
          <button
            onClick={() => onNavigate('/qr-report')}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            Public QR Portal
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Buildings"
          value={totalBuildings}
          subtitle="Across 4 PWD Divisions"
          icon={Building2}
          colorScheme="blue"
          onClick={() => onNavigate('/buildings')}
        />
        <StatCard
          title="Portfolio Average BCI"
          value={`${avgBCI} / 100`}
          subtitle="Fair Condition Band (Statewide)"
          icon={TrendingUp}
          colorScheme={avgBCI >= 70 ? 'emerald' : 'amber'}
          onClick={() => onNavigate('/state-dashboard')}
        />
        <StatCard
          title="Critical P1 Structural Findings"
          value={criticalDefects.length}
          subtitle="Emergency response protocol active"
          icon={AlertTriangle}
          colorScheme="rose"
          onClick={() => onNavigate('/defects')}
        />
        <StatCard
          title="Active Rectification Orders"
          value={openWOs.length}
          subtitle={`${failedNCRs.length} Stage NCRs Pending`}
          icon={Wrench}
          colorScheme="amber"
          onClick={() => onNavigate('/work-orders')}
        />
      </div>

      {/* End-to-End Operational Lifecycle Pipeline (Section 1) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              End-to-End Asset Management Lifecycle
            </h2>
            <p className="text-xs text-slate-500">
              Transforming maintenance from reactive ad-hoc repairs into risk-based proactive planning
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
            10-Stage Pipeline
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {lifecycleStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.num}
                onClick={() => onNavigate(stage.route)}
                className="group p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md bg-slate-50/50 hover:bg-white transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-blue-600">
                      {stage.num}
                    </span>
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
                <div className="mt-2.5 flex items-center text-[11px] font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  Launch <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active High-Priority Escalations & Critical Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Structural Risks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Urgent Safety-Critical Defects (P1 / Override)</h3>
                <p className="text-xs text-slate-500">Requires engineer intervention within 24–72 hours</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('/defects')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {criticalDefects.slice(0, 4).map((d) => (
              <div key={d.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{d.buildingName}</span>
                    <PriorityBadge band={d.priorityBand} isOverride={d.isP1Override} />
                  </div>
                  <p className="text-slate-600 font-medium">
                    {d.elementType} {d.elementCode}: {d.subtype}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">{d.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-mono font-bold text-rose-600 text-sm">Risk {d.riskScore}</span>
                  <div className="mt-1">
                    <button
                      onClick={() => onNavigate('/work-orders')}
                      className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px]"
                    >
                      Track WO
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buildings Requiring Immediate Attention */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                <Building2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Priority Building Condition Watchlist</h3>
                <p className="text-xs text-slate-500">Assam facilities in Very Poor & Poor condition bands</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('/buildings')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Full Registry
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {buildings
              .filter((b) => b.conditionBand === 'Very Poor' || b.conditionBand === 'Poor')
              .slice(0, 4)
              .map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={b.photoUrl}
                      alt={b.name}
                      className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 flex-shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => onOpenPassport(b.id)}>
                        {b.name}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {b.district} • {b.buildingType} • Built {b.yearBuilt}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <ConditionBadge band={b.conditionBand} score={b.currentBCI} />
                    <div className="mt-1">
                      <button
                        onClick={() => onOpenPassport(b.id)}
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        Open Passport →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
