import React, { useState } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  MapPin, 
  AlertTriangle, 
  ClipboardCheck, 
  Cpu, 
  Search, 
  Bell, 
  Sliders, 
  Users, 
  FileText, 
  TrendingUp, 
  Layers, 
  HardHat, 
  Wrench, 
  History, 
  QrCode, 
  Menu, 
  X, 
  ChevronDown, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  FolderLock,
  Activity,
  Calendar,
  CheckCircle,
  FileCheck2,
  DollarSign
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ScenarioLauncher } from '../common/ScenarioLauncher';
import { syncPendingDrafts, getOfflineDrafts } from '../../services/offlineSync';

interface AppLayoutProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentRoute, onNavigate, children }) => {
  const { currentUser, switchUser } = useAuth();
  const { notifications, markNotificationRead, defects, sensors, qualityChecks } = useData();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const unreadNotifs = notifications.filter((n) => !n.read);
  const criticalDefectsCount = defects.filter((d) => d.priorityBand === 'P1').length;
  const activeSensorAlarms = sensors.filter((s) => s.status === 'Alarm').length;
  const openNCRsCount = qualityChecks.filter((q) => q.ncrStatus === 'Open').length;

  const offlineDrafts = getOfflineDrafts();
  const pendingSyncCount = offlineDrafts.filter((d) => d.syncStatus === 'WAITING_TO_SYNC' || d.syncStatus === 'LOCAL_DRAFT').length;

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncPendingDrafts();
      setSyncFeedback(`Synced ${res.synced} inspection records successfully`);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch {
      setSyncFeedback('Sync failed. Please check network.');
    } finally {
      setSyncing(false);
    }
  };

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Home', route: '/home', icon: Building2 },
        { label: 'State Dashboard', route: '/state-dashboard', icon: LayoutDashboard },
        { label: 'Division Dashboard', route: '/division-dashboard', icon: Layers },
        { label: 'Alerts & Notifications', route: '/alerts', icon: AlertTriangle, badge: unreadNotifs.length || undefined, badgeColor: 'bg-rose-500' }
      ]
    },
    {
      title: 'ASSET MANAGEMENT',
      items: [
        { label: 'Building Registry', route: '/buildings', icon: Building2 },
        { label: 'Building Health Passport', route: '/passport', icon: FileCheck2 },
        { label: 'Floors, Zones & Elements', route: '/elements', icon: Layers },
        { label: 'Asset Map', route: '/map', icon: MapPin },
        { label: 'Building Records', route: '/records', icon: FolderLock }
      ]
    },
    {
      title: 'INSPECTIONS',
      items: [
        { label: 'Inspection Schedule', route: '/inspections', icon: Calendar },
        { label: 'Field Inspection Form', route: '/field-inspection', icon: ClipboardCheck },
        { label: 'AI Defect Analysis', route: '/ai-defect-analysis', icon: Cpu },
        { label: 'Defect Register', route: '/defects', icon: AlertTriangle, badge: criticalDefectsCount || undefined, badgeColor: 'bg-rose-600' },
        { label: 'Change Detection', route: '/change-detection', icon: TrendingUp },
        { label: 'Sensor Monitoring', route: '/sensors', icon: Activity, badge: activeSensorAlarms || undefined, badgeColor: 'bg-amber-500' }
      ]
    },
    {
      title: 'CONSTRUCTION QUALITY',
      items: [
        { label: 'Projects', route: '/projects', icon: HardHat },
        { label: 'Stage-Gate Inspections', route: '/stage-gates', icon: CheckCircle },
        { label: 'Quality Checklists', route: '/quality-testing', icon: ClipboardCheck },
        { label: 'Failed Tests & NCRs', route: '/failed-tests-ncrs', icon: AlertTriangle, badge: openNCRsCount || undefined, badgeColor: 'bg-rose-500' }
      ]
    },
    {
      title: 'MAINTENANCE',
      items: [
        { label: 'Risk & Priority Queue', route: '/risk-queue', icon: AlertTriangle },
        { label: 'Rectification Work Orders', route: '/work-orders', icon: Wrench },
        { label: 'Contractor Portal', route: '/contractor-portal', icon: HardHat },
        { label: 'Repair Verification', route: '/repair-verification', icon: FileCheck2 },
        { label: 'Predictive Maintenance', route: '/predictive-maintenance', icon: TrendingUp },
        { label: 'Annual Maintenance Plan', route: '/annual-plan', icon: Calendar },
        { label: 'Budget Optimisation', route: '/budget-optimization', icon: DollarSign }
      ]
    },
    {
      title: 'RECORDS & ADMINISTRATION',
      items: [
        { label: 'Records Vault', route: '/records-vault', icon: FolderLock },
        { label: 'Reports & Exports', route: '/reports', icon: FileText },
        { label: 'Audit Trail', route: '/audit-trail', icon: History },
        { label: 'User & Role Management', route: '/user-roles', icon: Users },
        { label: 'System Settings', route: '/settings', icon: Sliders }
      ]
    },
    {
      title: 'PUBLIC EXPERIENCE',
      items: [
        { label: 'Occupant QR Report Portal', route: '/qr-report', icon: QrCode },
        { label: 'Track Complaint Reference', route: '/track-complaint', icon: Search }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-white/10 text-white shadow-md">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo & Product Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Toggle Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => onNavigate('/home')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-black border border-[#c6e13d]/60 flex items-center justify-center shadow-[0_0_12px_rgba(198,225,61,0.25)]">
                <Building2 className="w-5 h-5 text-[#c6e13d]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white">BUILDSENSE</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#c6e13d]/15 text-[#c6e13d] border border-[#c6e13d]/40">
                    Enterprise Edition
                  </span>
                </div>
                <p className="text-[10.5px] text-white/70 font-medium hidden sm:block">
                  AI-Powered Building Condition Monitoring & Predictive Maintenance
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Offline Sync Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-[#121212] border border-white/10 px-2.5 py-1 rounded-lg text-xs">
              <span className="flex items-center gap-1.5 text-[#c6e13d] font-semibold">
                <Wifi className="w-3.5 h-3.5 text-[#c6e13d]" />
                Live Node
              </span>
              {pendingSyncCount > 0 && (
                <button
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="flex items-center gap-1 bg-[#c6e13d]/20 text-[#c6e13d] border border-[#c6e13d]/40 px-1.5 py-0.5 rounded text-[11px] font-bold hover:bg-[#c6e13d]/30 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                  {pendingSyncCount} Drafts
                </button>
              )}
            </div>

            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className="relative p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#c6e13d] text-black rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {notifMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-black rounded-xl shadow-2xl border border-white/15 text-white z-50 overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="p-3 bg-[#0c0c0c] border-b border-white/10 text-white flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Actionable Notifications</span>
                    <span className="text-xs text-[#c6e13d] font-mono font-bold">{unreadNotifs.length} unread</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {notifications.slice(0, 8).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          if (notif.relatedRoute) onNavigate(notif.relatedRoute);
                          setNotifMenuOpen(false);
                        }}
                        className={`p-3 hover:bg-white/5 cursor-pointer transition-colors text-xs ${
                          !notif.read ? 'bg-white/[0.04]' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className={notif.priority === 'CRITICAL' ? 'text-rose-400 font-bold' : 'text-white'}>
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-white/50">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-white/70 mt-1 line-clamp-2">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 bg-[#0c0c0c] border-t border-white/10 text-center">
                    <button
                      onClick={() => {
                        setNotifMenuOpen(false);
                        onNavigate('/alerts');
                      }}
                      className="text-xs font-bold text-[#c6e13d] hover:underline cursor-pointer"
                    >
                      View All Notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active User & Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2.5 bg-[#121212] hover:bg-[#1c1c1c] border border-white/10 hover:border-[#c6e13d]/40 py-1.5 px-3 rounded-xl transition-all cursor-pointer text-left"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-[#c6e13d]"
                />
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                    {currentUser.name}
                    <ChevronDown className="w-3.5 h-3.5 text-white/60" />
                  </div>
                  <div className="text-[10px] text-white/70 font-medium">
                    {currentUser.roleTitle}
                  </div>
                </div>
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-black rounded-xl shadow-2xl border border-white/15 text-white z-50 overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="p-3 bg-[#0c0c0c] border-b border-white/10 text-white">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#c6e13d]">
                      Switch Role (Specification Section 4)
                    </div>
                    <div className="text-[11px] text-white/70 mt-0.5">
                      Select sample persona to test backend permissions & UI workflows
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {DEMO_USERS.map((usr) => (
                      <button
                        key={usr.id}
                        onClick={() => {
                          switchUser(usr.role);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors cursor-pointer ${
                          usr.role === currentUser.role ? 'bg-white/10 font-bold border-l-2 border-[#c6e13d]' : ''
                        }`}
                      >
                        <img
                          src={usr.avatar}
                          alt={usr.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{usr.name}</div>
                          <div className="text-[11px] text-white/70 truncate">{usr.roleTitle}</div>
                          <div className="text-[10px] text-[#c6e13d] font-mono">{usr.role}</div>
                        </div>
                        {usr.role === currentUser.role && (
                          <span className="text-[#c6e13d] font-bold text-xs">Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Scenario Launcher Header Bar */}
        <ScenarioLauncher onSelectRoute={onNavigate} />
      </header>

      {/* Sync feedback notification banner if active */}
      {syncFeedback && (
        <div className="bg-emerald-600 text-white text-xs py-1.5 px-4 text-center font-medium shadow-xs">
          {syncFeedback}
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0 -ml-64'
          } hidden lg:block bg-black border-r border-white/10 text-white transition-all duration-200 overflow-y-auto flex-shrink-0 select-none`}
        >
          <div className="p-3 space-y-5">
            {navGroups.map((group) => (
              <div key={group.title}>
                <div className="px-3 text-[10px] font-black text-white/40 tracking-wider uppercase mb-1.5">
                  {group.title}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentRoute === item.route;
                    return (
                      <button
                        key={item.route}
                        onClick={() => onNavigate(item.route)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#c6e13d] text-black font-black shadow-[0_0_12px_rgba(198,225,61,0.25)]'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-white/60'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? 'bg-black text-[#c6e13d]'
                                : 'bg-[#c6e13d] text-black'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile Slide-out Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-xs">
            <div className="w-72 bg-black text-white h-full flex flex-col p-4 overflow-y-auto border-r border-white/10">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c6e13d]"></span>
                  Navigation
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-4 flex-1">
                {navGroups.map((group) => (
                  <div key={group.title}>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">
                      {group.title}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentRoute === item.route;
                        return (
                          <button
                            key={item.route}
                            onClick={() => {
                              onNavigate(item.route);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                              isActive ? 'bg-[#c6e13d] text-black font-black' : 'text-white/70 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="text-[10px] font-bold bg-[#c6e13d] text-black px-1.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 pb-16 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation for Field Inspector Ergonomics (Section 3) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 text-white px-2 py-1.5 flex items-center justify-around text-[10px] font-medium shadow-lg">
        <button
          onClick={() => onNavigate('/home')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            currentRoute === '/home' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => onNavigate('/buildings')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            currentRoute === '/buildings' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Assets</span>
        </button>
        <button
          onClick={() => onNavigate('/field-inspection')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            currentRoute === '/field-inspection' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Field Insp</span>
        </button>
        <button
          onClick={() => onNavigate('/ai-defect-analysis')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            currentRoute === '/ai-defect-analysis' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>AI Vision</span>
        </button>
        <button
          onClick={() => onNavigate('/work-orders')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            currentRoute === '/work-orders' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Work Orders</span>
        </button>
      </nav>
    </div>
  );
};
