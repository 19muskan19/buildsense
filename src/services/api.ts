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

const API_BASE = '/api';

export async function fetchBuildings(params?: {
  district?: string;
  divisionId?: string;
  type?: string;
  conditionBand?: string;
  query?: string;
}): Promise<Building[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`${API_BASE}/buildings${query ? `?${query}` : ''}`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchBuildingById(id: string): Promise<Building & {
  elements: Element[];
  defects: Defect[];
  workOrders: WorkOrder[];
  inspections: Inspection[];
  sensors: Sensor[];
}> {
  const res = await fetch(`${API_BASE}/buildings/${id}`);
  const json = await res.json();
  return json.data;
}

export async function createBuilding(data: Partial<Building>, actor: any): Promise<Building> {
  const res = await fetch(`${API_BASE}/buildings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, actorId: actor?.id, actorName: actor?.name, actorRole: actor?.role })
  });
  const json = await res.json();
  return json.data;
}

export async function fetchDivisions(): Promise<Division[]> {
  const res = await fetch(`${API_BASE}/divisions`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchElements(buildingId?: string): Promise<Element[]> {
  const res = await fetch(`${API_BASE}/elements${buildingId ? `?buildingId=${buildingId}` : ''}`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchDefects(params?: {
  buildingId?: string;
  priority?: string;
  status?: string;
  severity?: number;
}): Promise<Defect[]> {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/defects${query ? `?${query}` : ''}`);
  const json = await res.json();
  return json.data || [];
}

export async function createDefect(data: Partial<Defect>, actor: any): Promise<Defect> {
  const res = await fetch(`${API_BASE}/defects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, actorId: actor?.id, actorName: actor?.name, actorRole: actor?.role })
  });
  const json = await res.json();
  return json.data;
}

export async function verifyDefect(
  id: string,
  data: { engineerGrade: number; engineerNotes: string; measuredCrackWidthMm?: number },
  actor: any
): Promise<Defect> {
  const res = await fetch(`${API_BASE}/defects/${id}/verify`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, actorId: actor?.id, actorName: actor?.name, actorRole: actor?.role })
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
  const res = await fetch(`${API_BASE}/work-orders${query ? `?${query}` : ''}`);
  const json = await res.json();
  return json.data || [];
}

export async function createWorkOrder(data: Partial<WorkOrder>, actor: any): Promise<WorkOrder> {
  const res = await fetch(`${API_BASE}/work-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, actorId: actor?.id, actorName: actor?.name, actorRole: actor?.role })
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
  const res = await fetch(`${API_BASE}/work-orders/${id}/verify`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, actorId: actor?.id, actorRole: actor?.role })
  });
  const json = await res.json();
  return json.data;
}

export async function fetchInspections(): Promise<Inspection[]> {
  const res = await fetch(`${API_BASE}/inspections`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchDocuments(): Promise<BuildingDocument[]> {
  const res = await fetch(`${API_BASE}/documents`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchConstructionProjects(): Promise<ConstructionProject[]> {
  const res = await fetch(`${API_BASE}/construction-projects`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchQualityChecks(projectId?: string): Promise<QualityCheck[]> {
  const res = await fetch(`${API_BASE}/quality-checks${projectId ? `?projectId=${projectId}` : ''}`);
  const json = await res.json();
  return json.data || [];
}

export async function resolveNCR(id: string, actor: any): Promise<QualityCheck> {
  const res = await fetch(`${API_BASE}/quality-checks/${id}/resolve-ncr`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approvedBy: actor?.name, actorId: actor?.id, actorRole: actor?.role })
  });
  const json = await res.json();
  return json.data;
}

export async function fetchComplaints(): Promise<Complaint[]> {
  const res = await fetch(`${API_BASE}/complaints`);
  const json = await res.json();
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
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function trackComplaint(reference: string): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints/track/${encodeURIComponent(reference)}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Complaint not found');
  return json.data;
}

export async function fetchSensors(): Promise<Sensor[]> {
  const res = await fetch(`${API_BASE}/sensors`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchSensorReadings(sensorId: string): Promise<SensorReading[]> {
  const res = await fetch(`${API_BASE}/sensors/${sensorId}/readings`);
  const json = await res.json();
  return json.data || [];
}

export async function addSensorReading(sensorId: string, value: number): Promise<SensorReading> {
  const res = await fetch(`${API_BASE}/sensors/${sensorId}/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value })
  });
  const json = await res.json();
  return json.data;
}

export async function acknowledgeSensorAlarm(sensorId: string, actor: any): Promise<Sensor> {
  const res = await fetch(`${API_BASE}/sensors/${sensorId}/acknowledge`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actorId: actor?.id, actorName: actor?.name, actorRole: actor?.role })
  });
  const json = await res.json();
  return json.data;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch(`${API_BASE}/notifications`);
  const json = await res.json();
  return json.data || [];
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
}

export async function fetchAuditEvents(): Promise<AuditEvent[]> {
  const res = await fetch(`${API_BASE}/audit-events`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchModelRegistry(): Promise<ModelRegistryItem[]> {
  const res = await fetch(`${API_BASE}/models`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchMaintenancePlans(): Promise<MaintenancePlan[]> {
  const res = await fetch(`${API_BASE}/maintenance-plans`);
  const json = await res.json();
  return json.data || [];
}

export async function optimizeMaintenancePlan(data: {
  divisionId: string;
  budgetINR: number;
  year: number;
  createdBy: string;
}): Promise<MaintenancePlan> {
  const res = await fetch(`${API_BASE}/maintenance-plans/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  return json.data;
}

export async function fetchSystemSettings(): Promise<SystemConfig> {
  const res = await fetch(`${API_BASE}/settings`);
  const json = await res.json();
  return json.data;
}

export async function updateSystemSettings(settings: Partial<SystemConfig>, actor: any): Promise<SystemConfig> {
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
  const res = await fetch(`${API_BASE}/ai/analyze-defect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
