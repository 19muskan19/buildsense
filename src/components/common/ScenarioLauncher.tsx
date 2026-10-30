import React from 'react';
import { 
  AlertTriangle, 
  Droplet, 
  HardHat, 
  TrendingUp, 
  Activity, 
  QrCode, 
  Calculator, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface ScenarioLauncherProps {
  onSelectRoute?: (route: string) => void;
}

export const SCENARIO_LIST = [
  {
    id: 'scenario-a',
    letter: 'A',
    title: 'Critical Structural Shear Crack',
    tag: 'P1 Emergency Override',
    desc: 'Grade 5 diagonal shear fracture on primary column GF-COL-A04 at Apex Horizon Tower One with 24h emergency propping response protocol.',
    icon: AlertTriangle,
    color: 'rose',
    targetRoute: '/defects',
    demoRole: 'CHIEF_ENGINEER' as const
  },
  {
    id: 'scenario-b',
    letter: 'B',
    title: 'Roof Deck Leakage & Ingress',
    tag: 'Moisture & Efflorescence',
    desc: 'Active rainwater seepage across 12.5 sq m executive top floor ceiling with elastomeric torch-on membrane work order.',
    icon: Droplet,
    color: 'blue',
    targetRoute: '/work-orders',
    demoRole: 'EXECUTIVE_ENGINEER' as const
  },
  {
    id: 'scenario-c',
    letter: 'C',
    title: 'Construction Gate Blocked',
    tag: 'Failed Cylinder Strength Test',
    desc: 'M30 cylinder test failed at 21.4 MPa on BioTech Research Pavilion. Floor 3 concreting locked under NCR-003.',
    icon: HardHat,
    color: 'amber',
    targetRoute: '/construction-quality',
    demoRole: 'ASSISTANT_ENGINEER' as const
  },
  {
    id: 'scenario-d',
    letter: 'D',
    title: 'Growing Crack Analytics',
    tag: 'Repeat Observations',
    desc: 'Health Sciences Lab 3B slab crack doubled from 0.7mm to 1.4mm with 1.1m longitudinal propagation over 60 days.',
    icon: TrendingUp,
    color: 'purple',
    targetRoute: '/change-detection',
    demoRole: 'JUNIOR_ENGINEER' as const
  },
  {
    id: 'scenario-e',
    letter: 'E',
    title: 'Sensor Threshold Breach',
    tag: 'IoT Tiltmeter Alarm',
    desc: 'Tiltmeter reading 0.46° exceeds 0.35° tolerance on load-bearing column. Real-time alarm requiring signoff.',
    icon: Activity,
    color: 'red',
    targetRoute: '/sensors',
    demoRole: 'EXECUTIVE_ENGINEER' as const
  },
  {
    id: 'scenario-f',
    letter: 'F',
    title: 'Occupant QR Complaint',
    tag: 'Tenant Facility Portal',
    desc: 'Lead Research Scientist reported laboratory ceiling water dripping via QR ref CMP-2026-081.',
    icon: QrCode,
    color: 'cyan',
    targetRoute: '/complaints',
    demoRole: 'EXECUTIVE_ENGINEER' as const
  },
  {
    id: 'scenario-g',
    letter: 'G',
    title: 'Maintenance Budget Optimization',
    tag: '50 Lakh INR Allocation',
    desc: 'Optimisation engine allocates budget across candidate repairs, prioritizing mandatory life-safety P1 work.',
    icon: Calculator,
    color: 'emerald',
    targetRoute: '/annual-plan',
    demoRole: 'CHIEF_ENGINEER' as const
  },
  {
    id: 'scenario-h',
    letter: 'H',
    title: 'Contractor Repair Verification',
    tag: 'Before / After Evidence',
    desc: 'Contractor Summit Restoration Corp submitted completed replastering evidence for Centennial Academic Hall.',
    icon: CheckCircle2,
    color: 'indigo',
    targetRoute: '/repair-verification',
    demoRole: 'ASSISTANT_ENGINEER' as const
  }
];

export const ScenarioLauncher: React.FC<ScenarioLauncherProps> = ({ onSelectRoute }) => {
  const { switchUser } = useAuth();
  const { setActiveScenario, activeScenario } = useData();

  const handleLaunch = (sc: typeof SCENARIO_LIST[0]) => {
    switchUser(sc.demoRole);
    setActiveScenario(sc.id);
    if (onSelectRoute) onSelectRoute(sc.targetRoute);
  };

  return (
    <div className="bg-black border-y border-white/10 text-white py-3 px-4 shadow-2xl relative select-none">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1 rounded bg-[#c6e13d]/15 text-[#c6e13d] border border-[#c6e13d]/30 shadow-[0_0_8px_rgba(198,225,61,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-[#c6e13d]" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#c6e13d]">
              Interactive Test Scenarios
            </span>
            <span className="text-xs font-bold text-white/50 tracking-wider hidden sm:inline">
              (SPECIFICATION SECTION 32)
            </span>
            <span className="hidden md:inline-block text-[11px] text-white/70">
              Click any scenario to automatically configure role & jump to live test workflow
            </span>
          </div>
          {activeScenario && (
            <button
              onClick={() => setActiveScenario(null)}
              className="text-[11px] font-semibold text-white/70 hover:text-[#c6e13d] underline transition-colors cursor-pointer"
            >
              Reset Scenario Highlight
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {SCENARIO_LIST.map((sc) => {
            const Icon = sc.icon;
            const isCurrent = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleLaunch(sc)}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all text-xs cursor-pointer group ${
                  isCurrent
                    ? 'bg-[#151515] border-[#c6e13d] text-white ring-2 ring-[#c6e13d]/50 shadow-[0_0_16px_rgba(198,225,61,0.25)]'
                    : 'bg-[#0d0d0d] hover:bg-[#181818] border-white/10 hover:border-[#c6e13d]/50 text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-mono font-black text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                    isCurrent 
                      ? 'bg-[#c6e13d] text-black shadow-xs' 
                      : 'bg-black text-[#c6e13d] border border-[#c6e13d]/40 group-hover:border-[#c6e13d]'
                  }`}>
                    Scenario {sc.letter}
                  </span>
                  <Icon className={`w-3.5 h-3.5 transition-colors ${
                    isCurrent ? 'text-[#c6e13d]' : 'text-white/70 group-hover:text-white'
                  }`} />
                </div>
                <span className="font-bold truncate text-[11px] text-white group-hover:text-white">
                  {sc.title}
                </span>
                <span className="text-[10px] text-white/60 truncate group-hover:text-white/80">
                  {sc.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
