import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import {
  Building,
  Division,
  Element,
  Defect,
  WorkOrder,
  Inspection,
  ConstructionProject,
  QualityCheck,
  Complaint,
  Sensor,
  Notification,
  AuditEvent,
  ModelRegistryItem,
  MaintenancePlan,
  SystemConfig,
  BuildingDocument
} from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  loading: boolean;
  error: string | null;
  buildings: Building[];
  divisions: Division[];
  elements: Element[];
  defects: Defect[];
  workOrders: WorkOrder[];
  inspections: Inspection[];
  constructionProjects: ConstructionProject[];
  qualityChecks: QualityCheck[];
  complaints: Complaint[];
  sensors: Sensor[];
  notifications: Notification[];
  auditEvents: AuditEvent[];
  models: ModelRegistryItem[];
  documents: BuildingDocument[];
  maintenancePlans: MaintenancePlan[];
  systemConfig: SystemConfig | null;
  refreshData: () => Promise<void>;

  // Direct actions
  createBuilding: (data: Partial<Building>) => Promise<Building>;
  createDefect: (data: Partial<Defect>) => Promise<Defect>;
  verifyDefect: (id: string, data: { engineerGrade: number; engineerNotes: string; measuredCrackWidthMm?: number }) => Promise<void>;
  createWorkOrder: (data: Partial<WorkOrder>) => Promise<WorkOrder>;
  updateWorkOrderProgress: (id: string, data: { progressPercent?: number; notes?: string; afterPhotoIds?: string[]; submitForVerification?: boolean }) => Promise<void>;
  verifyWorkOrder: (id: string, approve: boolean, notes?: string, actualCostINR?: number) => Promise<void>;
  resolveNCR: (id: string) => Promise<void>;
  submitComplaint: (data: any) => Promise<{ reference: string }>;
  acknowledgeSensorAlarm: (sensorId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  optimizeBudgetPlan: (divisionId: string, budgetINR: number) => Promise<MaintenancePlan>;

  // Scenario quick-launch selector
  activeScenario: string | null;
  setActiveScenario: (scenarioId: string | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [elements, setElements] = useState<Element[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [constructionProjects, setConstructionProjects] = useState<ConstructionProject[]>([]);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [models, setModels] = useState<ModelRegistryItem[]>([]);
  const [documents, setDocuments] = useState<BuildingDocument[]>([]);
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);

  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        blds,
        divs,
        elems,
        defs,
        wos,
        insps,
        prjs,
        qcs,
        cmps,
        sns,
        notifs,
        auds,
        mods,
        docs,
        mps,
        cfg
      ] = await Promise.all([
        api.fetchBuildings(),
        api.fetchDivisions(),
        api.fetchElements(),
        api.fetchDefects(),
        api.fetchWorkOrders(),
        api.fetchInspections(),
        api.fetchConstructionProjects(),
        api.fetchQualityChecks(),
        api.fetchComplaints(),
        api.fetchSensors(),
        api.fetchNotifications(),
        api.fetchAuditEvents(),
        api.fetchModelRegistry(),
        api.fetchDocuments(),
        api.fetchMaintenancePlans(),
        api.fetchSystemSettings()
      ]);

      setBuildings(blds);
      setDivisions(divs);
      setElements(elems);
      setDefects(defs);
      setWorkOrders(wos);
      setInspections(insps);
      setConstructionProjects(prjs);
      setQualityChecks(qcs);
      setComplaints(cmps);
      setSensors(sns);
      setNotifications(notifs);
      setAuditEvents(auds);
      setModels(mods);
      setDocuments(docs);
      setMaintenancePlans(mps);
      setSystemConfig(cfg);
    } catch (err: any) {
      console.error('Error fetching BuildSense data', err);
      setError(err.message || 'Failed to load data from server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createBuilding = async (data: Partial<Building>) => {
    const created = await api.createBuilding(data, currentUser);
    await refreshData();
    return created;
  };

  const createDefect = async (data: Partial<Defect>) => {
    const created = await api.createDefect(data, currentUser);
    await refreshData();
    return created;
  };

  const verifyDefect = async (
    id: string,
    data: { engineerGrade: number; engineerNotes: string; measuredCrackWidthMm?: number }
  ) => {
    await api.verifyDefect(id, data, currentUser);
    await refreshData();
  };

  const createWorkOrder = async (data: Partial<WorkOrder>) => {
    const created = await api.createWorkOrder(data, currentUser);
    await refreshData();
    return created;
  };

  const updateWorkOrderProgress = async (
    id: string,
    data: { progressPercent?: number; notes?: string; afterPhotoIds?: string[]; submitForVerification?: boolean }
  ) => {
    await api.updateWorkOrderProgress(id, data);
    await refreshData();
  };

  const verifyWorkOrder = async (id: string, approve: boolean, notes?: string, actualCostINR?: number) => {
    await api.verifyWorkOrder(id, { approve, rejectionReason: !approve ? notes : undefined, verifiedBy: currentUser.name, actualCostINR }, currentUser);
    await refreshData();
  };

  const resolveNCR = async (id: string) => {
    await api.resolveNCR(id, currentUser);
    await refreshData();
  };

  const submitComplaint = async (data: any) => {
    const res = await api.submitComplaint(data);
    await refreshData();
    return { reference: res.reference };
  };

  const acknowledgeSensorAlarm = async (sensorId: string) => {
    await api.acknowledgeSensorAlarm(sensorId, currentUser);
    await refreshData();
  };

  const markNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const optimizeBudgetPlan = async (divisionId: string, budgetINR: number) => {
    const plan = await api.optimizeMaintenancePlan({
      divisionId,
      budgetINR,
      year: 2026,
      createdBy: currentUser.name
    });
    await refreshData();
    return plan;
  };

  return (
    <DataContext.Provider
      value={{
        loading,
        error,
        buildings,
        divisions,
        elements,
        defects,
        workOrders,
        inspections,
        constructionProjects,
        qualityChecks,
        complaints,
        sensors,
        notifications,
        auditEvents,
        models,
        documents,
        maintenancePlans,
        systemConfig,
        refreshData,
        createBuilding,
        createDefect,
        verifyDefect,
        createWorkOrder,
        updateWorkOrderProgress,
        verifyWorkOrder,
        resolveNCR,
        submitComplaint,
        acknowledgeSensorAlarm,
        markNotificationRead,
        optimizeBudgetPlan,
        activeScenario,
        setActiveScenario
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
