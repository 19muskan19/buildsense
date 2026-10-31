import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AppLayout } from './components/layout/AppLayout';

// Views
import { HomeView } from './views/overview/HomeView';
import { StateDashboardView } from './views/overview/StateDashboardView';
import { DivisionDashboardView } from './views/overview/DivisionDashboardView';
import { AlertsView } from './views/overview/AlertsView';

import { BuildingRegistryView } from './views/assets/BuildingRegistryView';
import { BuildingPassportView } from './views/assets/BuildingPassportView';
import { ElementHierarchyView } from './views/assets/ElementHierarchyView';
import { AssetMapView } from './views/assets/AssetMapView';
import { RecordsVaultView } from './views/records/RecordsVaultView';

import { InspectionScheduleView } from './views/inspections/InspectionScheduleView';
import { FieldInspectionView } from './views/inspections/FieldInspectionView';
import { AIDefectAnalysisView } from './views/inspections/AIDefectAnalysisView';
import { DefectRegisterView } from './views/inspections/DefectRegisterView';
import { ChangeDetectionView } from './views/inspections/ChangeDetectionView';
import { SensorMonitoringView } from './views/inspections/SensorMonitoringView';

import { ConstructionProjectsView } from './views/construction/ConstructionProjectsView';
import { StageGateView } from './views/construction/StageGateView';
import { FailedTestsNCRView } from './views/construction/FailedTestsNCRView';

import { RiskPriorityQueueView } from './views/maintenance/RiskPriorityQueueView';
import { WorkOrdersView } from './views/maintenance/WorkOrdersView';
import { ContractorPortalView } from './views/maintenance/ContractorPortalView';
import { RepairVerificationView } from './views/maintenance/RepairVerificationView';
import { PredictiveMaintenanceView } from './views/maintenance/PredictiveMaintenanceView';
import { AnnualMaintenancePlanView } from './views/maintenance/AnnualMaintenancePlanView';

import { ReportsExportView } from './views/records/ReportsExportView';
import { AuditTrailView } from './views/records/AuditTrailView';
import { UserRoleManagementView } from './views/records/UserRoleManagementView';
import { SystemSettingsView } from './views/records/SystemSettingsView';

import { OccupantQRReportView } from './views/public/OccupantQRReportView';
import { TrackComplaintView } from './views/public/TrackComplaintView';

export function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash.replace(/^#/, '') || '/home';
  });

  const [activePassportBuildingId, setActivePassportBuildingId] = useState<string>('bld-001');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) setCurrentRoute(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
    const main = document.getElementById('app-main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPassport = (buildingId: string) => {
    setActivePassportBuildingId(buildingId);
    navigateTo('/passport');
  };

  const renderCurrentView = () => {
    switch (currentRoute) {
      case '/home':
        return <HomeView onNavigate={navigateTo} onOpenPassport={handleOpenPassport} />;
      case '/state-dashboard':
        return <StateDashboardView onNavigate={navigateTo} onOpenPassport={handleOpenPassport} />;
      case '/division-dashboard':
        return <DivisionDashboardView onNavigate={navigateTo} onOpenPassport={handleOpenPassport} />;
      case '/alerts':
        return <AlertsView onNavigate={navigateTo} />;

      // Asset Management
      case '/buildings':
        return <BuildingRegistryView onNavigate={navigateTo} onOpenPassport={handleOpenPassport} />;
      case '/passport':
        return (
          <BuildingPassportView
            buildingId={activePassportBuildingId}
            onBack={() => navigateTo('/buildings')}
            onNavigate={navigateTo}
          />
        );
      case '/elements':
        return <ElementHierarchyView />;
      case '/map':
        return <AssetMapView onOpenPassport={handleOpenPassport} />;
      case '/records':
      case '/records-vault':
        return <RecordsVaultView />;

      // Inspections
      case '/inspections':
        return <InspectionScheduleView onNavigate={navigateTo} />;
      case '/field-inspection':
        return <FieldInspectionView onNavigate={navigateTo} />;
      case '/ai-defect-analysis':
        return <AIDefectAnalysisView onNavigate={navigateTo} />;
      case '/defects':
        return <DefectRegisterView onNavigate={navigateTo} onOpenPassport={handleOpenPassport} />;
      case '/change-detection':
        return <ChangeDetectionView />;
      case '/sensors':
        return <SensorMonitoringView />;

      // Construction Quality
      case '/projects':
        return <ConstructionProjectsView onNavigate={navigateTo} />;
      case '/stage-gates':
      case '/quality-testing':
        return <StageGateView onNavigate={navigateTo} />;
      case '/failed-tests-ncrs':
        return <FailedTestsNCRView onNavigate={navigateTo} />;

      // Maintenance
      case '/risk-queue':
        return <RiskPriorityQueueView onNavigate={navigateTo} />;
      case '/work-orders':
        return <WorkOrdersView onNavigate={navigateTo} />;
      case '/contractor-portal':
        return <ContractorPortalView />;
      case '/repair-verification':
        return <RepairVerificationView onNavigate={navigateTo} />;
      case '/predictive-maintenance':
        return <PredictiveMaintenanceView onOpenPassport={handleOpenPassport} />;
      case '/annual-plan':
      case '/budget-optimization':
        return <AnnualMaintenancePlanView />;

      // Records & Administration
      case '/reports':
        return <ReportsExportView />;
      case '/audit-trail':
        return <AuditTrailView />;
      case '/user-roles':
        return <UserRoleManagementView />;
      case '/settings':
        return <SystemSettingsView />;

      // Public Experience
      case '/qr-report':
        return <OccupantQRReportView onNavigate={navigateTo} />;
      case '/track-complaint':
        return <TrackComplaintView onNavigate={navigateTo} />;

      default:
        return <HomeView onNavigate={navigateTo} onOpenPassport={handleOpenPassport} />;
    }
  };

  return (
    <AppLayout currentRoute={currentRoute} onNavigate={navigateTo}>
      <ScreenBoundary key={currentRoute}>
        {renderCurrentView()}
      </ScreenBoundary>
    </AppLayout>
  );
}

class ScreenBoundary extends React.Component<
  { children: React.ReactNode },
  { message: string | null }
> {
  state = { message: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { message: error.message || 'This screen failed to render.' };
  }

  render() {
    if (this.state.message) {
      return (
        <div className="p-6 max-w-3xl mx-auto space-y-2">
          <h1 className="text-xl font-bold text-slate-900">This screen could not be drawn</h1>
          <p className="text-sm text-slate-600">{this.state.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
