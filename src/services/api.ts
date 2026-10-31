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
  SensorReading,
  Notification,
  AuditEvent,
  ModelRegistryItem,
  MaintenancePlan,
  SystemConfig,
  AIAnalysisResult,
  BuildingDocument
} from '../types';
import * as local from './localStore';

const API_BASE = '/api';

type ApiMode = 'live' | 'local';

let modePromise: Promise<ApiMode> | null = null;

/** Production (Vercel) ships the static app without the Express API. Use the seeded portfolio in that case. */
export function resolveApiMode(): Promise<ApiMode> {
  if (!modePromise) {
    modePromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/buildings`);
        const type = res.headers.get('content-type') || '';
        if (!res.ok || !type.toLowerCase().includes('json')) return 'local';
        const json = await res.json();
        return Array.isArray(json?.data) ? 'live' : 'local';
      } catch {
        return 'local';
      }
    })();
  }
  return modePromise;
}

async function readJson<T>(path: string, fallback: () => T, init?: RequestInit): Promise<T> {
  if ((await resolveApiMode()) === 'local') return fallback();
  const res = await fetch(`${API_BASE}${path}`, init);
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || `Request failed (${res.status})`);
  }
  return json;
}

export async function fetchBuildings(params?: {
  district?: string;
  divisionId?: string;
  type?: string;
  conditionBand?: string;
  query?: string;
}): Promise<Building[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const json = await readJson<{ data?: Building[] }>(
    `/buildings${query ? `?${query}` : ''}`,
    () => ({ data: local.listBuildings() })
  );
  return json.data || [];
}

export async function fetchBuildingById(id: string): Promise<Building & {
  elements: Element[];
  defects: Defect[];
  workOrders: WorkOrder[];
  inspections: Inspection[];
  sensors: Sensor[];
}> {
  if ((await resolveApiMode()) === 'local') {
    const building = local.listBuildings().find((b) => b.id === id);
    if (!building) throw new Error('Building not found');
    return {
      ...building,
      elements: local.listElements(id),
      defects: local.listDefects().filter((d) => d.buildingId === id),
      workOrders: local.listWorkOrders().filter((w) => w.buildingId === id),
      inspections: local.listInspections().filter((i) => i.buildingId === id),
      sensors: local.listSensors().filter((s) => s.buildingId === id)
    };
  }
  const res = await fetch(`${API_BASE}/buildings/${id}`);
  const json = await res.json();
  return json.data;
}

export async function createBuilding(data: Partial<Building>, actor: any): Promise<Building> {
  const payload = { ...data, actorId: actor?.id, actorName: actor?.name, actorRole: actor?.role };
  if ((await resolveApiMode()) === 'local') return local.createBuilding(payload);
  const res = await fetch(`${API_BASE}/buildings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  return json.data;
}

export async function fetchDivisions(): Promise<Division[]> {
  const json = await readJson<{ data?: Division[] }>('/divisions', () => ({ data: local.listDivisions() }));
  return json.data || [];
}

export async function fetchElements(buildingId?: string): Promise<Element[]> {
  const json = await readJson<{ data?: Element[] }>(
    `/elements${buildingId ? `?buildingId=${buildingId}` : ''}`,
    () => ({ data: local.listElements(buildingId) })
  );
  return json.data || [];
}

export async function fetchDefects(params?: {
  buildingId?: string;
  priority?: string;
  status?: string;
  severity?: number;
}): Promise<Defect[]> {
  const query = new URLSearchParams(params as any).toString();
  const json = await readJson<{ data?: Defect[] }>(
    `/defects${query ? `?${query}` : ''}`,
    () => ({ data: local.listDefects() })
  );
  return json.data || [];
}

export async function createDefect(data: Partial<Defect>, actor: any): Promise<Defect> {
  const payload = { ...data, actorId: actor?.id, actorName: actor?.name, actorRole: actor?.role };
  if ((await resolveApiMode()) === 'local') return local.createDefect(payload);
  const res = await fetch(`${API_BASE}/defects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  return json.data;
}

export async function verifyDefect(
  id: string,
  data: { engineerGrade: number; engineerNotes: string; measuredCrackWidthMm?: number },
  actor: any
): Promise<Defect> {
  const payload = { ...data, actorId: actor?.id, actorName: actor?.name, actorRole: actor?.role };
  if ((await resolveApiMode()) === 'local') return local.verifyDefect(id, payload);
  const res = await fetch(`${API_BASE}/defects/${id}/verify`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  return json.data;
}

export async function fetchWorkOrders(params?: {
  status?: string;
  contractorId?: string;
  buildingId?: string;
}): Promise<WorkOrder[]> {
  const query = new URLSearchParams(params as any).toString();
  const json = await readJson<{ data?: WorkOrder[] }>(
    `/work-orders${query ? `?${query}` : ''}`,
    () => ({ data: local.listWorkOrders() })
  );
  return json.data || [];
}

export async function createWorkOrder(data: Partial<WorkOrder>, actor: any): Promise<WorkOrder> {
  const payload = { ...data, actorId: actor?.id, actorName: actor?.name, actorRole: actor?.role };
  if ((await resolveApiMode()) === 'local') return local.createWorkOrder(payload);
  const res = await fetch(`${API_BASE}/work-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  return json.data;
}

export async function updateWorkOrderProgress(
  id: string,
  data: {
    progressPercent?: number;
    notes?: string;
    afterPhotoIds?: string[];
    submitForVerification?: boolean;
  }
): Promise<WorkOrder> {
  if ((await resolveApiMode()) === 'local') return local.updateWorkOrderProgress(id, data);
  const res = await fetch(`${API_BASE}/work-orders/${id}/progress`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  return json.data;
}

export async function verifyWorkOrder(
  id: string,
  data: {
    approve: boolean;
    rejectionReason?: string;
    verifiedBy?: string;
    actualCostINR?: number;
  },
  actor: any
): Promise<WorkOrder> {
  const payload = { ...data, actorId: actor?.id, actorRole: actor?.role };
  if ((await resolveApiMode()) === 'local') return local.verifyWorkOrder(id, payload);
  const res = await fetch(`${API_BASE}/work-orders/${id}/verify`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  return json.data;
}

export async function fetchInspections(): Promise<Inspection[]> {
  const json = await readJson<{ data?: Inspection[] }>('/inspections', () => ({ data: local.listInspections() }));
  return json.data || [];
}

export async function fetchDocuments(): Promise<BuildingDocument[]> {
  const json = await readJson<{ data?: BuildingDocument[] }>('/documents', () => ({ data: local.listDocuments() }));
  return json.data || [];
}

export async function fetchConstructionProjects(): Promise<ConstructionProject[]> {
  const json = await readJson<{ data?: ConstructionProject[] }>(
    '/construction-projects',
    () => ({ data: local.listConstructionProjects() })
  );
  return json.data || [];
}

export async function fetchQualityChecks(projectId?: string): Promise<QualityCheck[]> {
  const json = await readJson<{ data?: QualityCheck[] }>(
    `/quality-checks${projectId ? `?projectId=${projectId}` : ''}`,
    () => ({ data: local.listQualityChecks(projectId) })
  );
  return json.data || [];
}

export async function resolveNCR(id: string, actor: any): Promise<QualityCheck> {
  const payload = { approvedBy: actor?.name, actorId: actor?.id, actorRole: actor?.role };
  if ((await resolveApiMode()) === 'local') return local.resolveNcr(id, payload);
  const res = await fetch(`${API_BASE}/quality-checks/${id}/resolve-ncr`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  return json.data;
}

export async function fetchComplaints(): Promise<Complaint[]> {
  const json = await readJson<{ data?: Complaint[] }>('/complaints', () => ({ data: local.listComplaints() }));
  return json.data || [];
}

export async function submitComplaint(data: {
  buildingId: string;
  category: string;
  description: string;
  locationDescription: string;
  floorOrRoom?: string;
  photoIds?: string[];
  contactDetails?: any;
}): Promise<{ success: boolean; reference: string; data: Complaint }> {
  if ((await resolveApiMode()) === 'local') {
    const created = local.submitComplaint({
      ...data,
      category: data.category as Complaint['category']
    });
    return { success: true, reference: created.reference, data: created.data };
  }
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function trackComplaint(reference: string): Promise<Complaint> {
  if ((await resolveApiMode()) === 'local') return local.trackComplaint(reference);
  const res = await fetch(`${API_BASE}/complaints/track/${encodeURIComponent(reference)}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Complaint not found');
  return json.data;
}

export async function fetchSensors(): Promise<Sensor[]> {
  const json = await readJson<{ data?: Sensor[] }>('/sensors', () => ({ data: local.listSensors() }));
  return json.data || [];
}

export async function fetchSensorReadings(sensorId: string): Promise<SensorReading[]> {
  if ((await resolveApiMode()) === 'local') return [];
  const res = await fetch(`${API_BASE}/sensors/${sensorId}/readings`);
  const json = await res.json();
  return json.data || [];
}

export async function addSensorReading(sensorId: string, value: number): Promise<SensorReading> {
  if ((await resolveApiMode()) === 'local') return local.addSensorReading(sensorId, value);
  const res = await fetch(`${API_BASE}/sensors/${sensorId}/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value })
  });
  const json = await res.json();
  return json.data;
}

export async function acknowledgeSensorAlarm(sensorId: string, actor: any): Promise<Sensor> {
  if ((await resolveApiMode()) === 'local') return local.acknowledgeSensor(sensorId, actor);
  const res = await fetch(`${API_BASE}/sensors/${sensorId}/acknowledge`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actorId: actor?.id, actorName: actor?.name, actorRole: actor?.role })
  });
  const json = await res.json();
  return json.data;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const json = await readJson<{ data?: Notification[] }>('/notifications', () => ({ data: local.listNotifications() }));
  return json.data || [];
}

export async function markNotificationRead(id: string): Promise<void> {
  if ((await resolveApiMode()) === 'local') {
    local.markNotificationRead(id);
    return;
  }
  await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
}

export async function fetchAuditEvents(): Promise<AuditEvent[]> {
  const json = await readJson<{ data?: AuditEvent[] }>('/audit-events', () => ({ data: local.listAuditEvents() }));
  return json.data || [];
}

export async function fetchModelRegistry(): Promise<ModelRegistryItem[]> {
  const json = await readJson<{ data?: ModelRegistryItem[] }>('/models', () => ({ data: local.listModels() }));
  return json.data || [];
}

export async function fetchMaintenancePlans(): Promise<MaintenancePlan[]> {
  const json = await readJson<{ data?: MaintenancePlan[] }>(
    '/maintenance-plans',
    () => ({ data: local.listMaintenancePlans() })
  );
  return json.data || [];
}

export async function optimizeMaintenancePlan(data: {
  divisionId: string;
  budgetINR: number;
  year: number;
  createdBy: string;
}): Promise<MaintenancePlan> {
  if ((await resolveApiMode()) === 'local') return local.optimizePlan(data);
  const res = await fetch(`${API_BASE}/maintenance-plans/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  return json.data;
}

export async function fetchSystemSettings(): Promise<SystemConfig> {
  const json = await readJson<{ data: SystemConfig }>('/settings', () => ({ data: local.getSettings() }));
  return json.data;
}

export async function updateSystemSettings(settings: Partial<SystemConfig>, actor: any): Promise<SystemConfig> {
  if ((await resolveApiMode()) === 'local') return local.getSettings();
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...settings, actorId: actor?.id, actorName: actor?.name, actorRole: actor?.role })
  });
  const json = await res.json();
  return json.data;
}

export async function analyzeDefectWithAI(data: {
  imageBase64?: string;
  imageUrl?: string;
  metadata?: any;
}): Promise<{
  success: boolean;
  isLiveModel: boolean;
  isDemoFallback?: boolean;
  data: AIAnalysisResult;
}> {
  if ((await resolveApiMode()) === 'local') {
    return {
      success: true,
      isLiveModel: false,
      isDemoFallback: true,
      data: local.analyzeDefectLocally(data.metadata)
    };
  }
  try {
    const res = await fetch(`${API_BASE}/ai/analyze-defect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (json?.success && json.data) return json;
  } catch {
    // Fall through to the same engineering demo the server uses when Gemini is unavailable.
  }
  return {
    success: true,
    isLiveModel: false,
    isDemoFallback: true,
    data: local.analyzeDefectLocally(data.metadata)
  };
}

export async function syncOfflineInspections(drafts: any[]): Promise<{ success: boolean; syncedCount: number; syncedIds: string[] }> {
  if ((await resolveApiMode()) === 'local') {
    const syncedIds = local.syncInspections(drafts);
    return { success: true, syncedCount: syncedIds.length, syncedIds };
  }
  const res = await fetch(`${API_BASE}/sync/offline-inspections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idempotencyKey: `sync-${Date.now()}`,
      drafts
    })
  });
  const type = res.headers.get('content-type') || '';
  if (!res.ok || !type.toLowerCase().includes('json')) {
    const syncedIds = local.syncInspections(drafts);
    return { success: true, syncedCount: syncedIds.length, syncedIds };
  }
  return res.json();
}
