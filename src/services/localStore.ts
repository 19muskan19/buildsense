import {
  INITIAL_AUDIT_EVENTS,
  INITIAL_BUILDINGS,
  INITIAL_COMPLAINTS,
  INITIAL_CONSTRUCTION_PROJECTS,
  INITIAL_DEFECTS,
  INITIAL_DIVISIONS,
  INITIAL_DOCUMENTS,
  INITIAL_ELEMENTS,
  INITIAL_INSPECTIONS,
  INITIAL_MAINTENANCE_PLANS,
  INITIAL_MODEL_REGISTRY,
  INITIAL_NOTIFICATIONS,
  INITIAL_QUALITY_CHECKS,
  INITIAL_SENSOR_READINGS,
  INITIAL_SENSORS,
  INITIAL_SYSTEM_CONFIG,
  INITIAL_WORK_ORDERS
} from '../data/seedData';
import {
  AIAnalysisResult,
  AuditEvent,
  Building,
  Complaint,
  Defect,
  Inspection,
  MaintenancePlan,
  Notification,
  QualityCheck,
  Role,
  Sensor,
  SensorReading,
  SystemConfig,
  WorkOrder
} from '../types';

const STORAGE_KEY = 'buildsense-portfolio-v1';

function freshDb() {
  return {
    buildings: structuredClone(INITIAL_BUILDINGS),
    divisions: structuredClone(INITIAL_DIVISIONS),
    elements: structuredClone(INITIAL_ELEMENTS),
    defects: structuredClone(INITIAL_DEFECTS),
    workOrders: structuredClone(INITIAL_WORK_ORDERS),
    inspections: structuredClone(INITIAL_INSPECTIONS),
    constructionProjects: structuredClone(INITIAL_CONSTRUCTION_PROJECTS),
    qualityChecks: structuredClone(INITIAL_QUALITY_CHECKS),
    complaints: structuredClone(INITIAL_COMPLAINTS),
    sensors: structuredClone(INITIAL_SENSORS),
    sensorReadings: structuredClone(INITIAL_SENSOR_READINGS),
    notifications: structuredClone(INITIAL_NOTIFICATIONS),
    auditEvents: structuredClone(INITIAL_AUDIT_EVENTS),
    documents: structuredClone(INITIAL_DOCUMENTS),
    models: structuredClone(INITIAL_MODEL_REGISTRY),
    maintenancePlans: structuredClone(INITIAL_MAINTENANCE_PLANS),
    systemConfig: structuredClone(INITIAL_SYSTEM_CONFIG)
  };
}

type Db = ReturnType<typeof freshDb>;

function loadDb(): Db {
  if (typeof sessionStorage === 'undefined') return freshDb();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return freshDb();
    const parsed = JSON.parse(raw) as Db;
    if (!Array.isArray(parsed.buildings) || parsed.buildings.length === 0) return freshDb();
    if (!Array.isArray(parsed.divisions) || !Array.isArray(parsed.defects)) return freshDb();
    return parsed;
  } catch {
    return freshDb();
  }
}

const db = loadDb();

function persist() {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Quota or private-mode failures still leave the in-memory portfolio usable.
  }
}

function logAudit(
  actorId: string | undefined,
  actorName: string | undefined,
  actorRole: Role | undefined,
  action: string,
  entityType: AuditEvent['entityType'],
  entityId: string,
  beforeSummary?: string,
  afterSummary?: string,
  reason?: string
) {
  db.auditEvents.unshift({
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actorId: actorId || 'system',
    actorName: actorName || 'System Service',
    actorRole: actorRole || 'ASSISTANT_ENGINEER',
    action,
    entityType,
    entityId,
    timestamp: new Date().toISOString(),
    beforeSummary,
    afterSummary,
    reason
  });
}

export function recalculateBCI(buildingId: string): number {
  const buildingDefects = db.defects.filter(
    (d) => d.buildingId === buildingId && d.status !== 'VERIFIED_REPAIRED'
  );
  if (buildingDefects.length === 0) {
    const empty = db.buildings.find((b) => b.id === buildingId);
    if (empty) {
      empty.currentBCI = 96;
      empty.conditionBand = 'Good';
    }
    return 96;
  }

  const config = db.systemConfig;
  let totalDeductions = 0;
  for (const defect of buildingDefects) {
    const sWeight = config.bciFormula.severityWeights[defect.severityGrade] || 5;
    const cWeight = config.bciFormula.criticalityWeights[defect.riskFactors?.C || 3] || 1.0;
    const classMultiplier = config.bciFormula.elementClassMultiplier[defect.structuralSignificance] || 1.0;
    const statusWeight = defect.status === 'REPAIR_IN_PROGRESS' ? 0.75 : 1.0;
    totalDeductions += sWeight * cWeight * classMultiplier * statusWeight;
  }

  const calculatedBCI = Math.max(0, Math.min(100, Math.round(config.bciFormula.baseScore - totalDeductions)));
  const building = db.buildings.find((b) => b.id === buildingId);
  if (building) {
    building.currentBCI = calculatedBCI;
    if (calculatedBCI >= 85) building.conditionBand = 'Good';
    else if (calculatedBCI >= 70) building.conditionBand = 'Fair';
    else if (calculatedBCI >= 50) building.conditionBand = 'Poor';
    else if (calculatedBCI >= 30) building.conditionBand = 'Very Poor';
    else building.conditionBand = 'Critical';
  }
  return calculatedBCI;
}

export function listBuildings(): Building[] {
  return [...db.buildings];
}
export function listDivisions() {
  return [...db.divisions];
}
export function listElements(buildingId?: string) {
  const list = buildingId ? db.elements.filter((e) => e.buildingId === buildingId) : db.elements;
  return [...list];
}
export function listDefects(): Defect[] {
  return [...db.defects];
}
export function listWorkOrders(): WorkOrder[] {
  return [...db.workOrders];
}
export function listInspections(): Inspection[] {
  return [...db.inspections];
}
export function listConstructionProjects() {
  return [...db.constructionProjects];
}
export function listQualityChecks(projectId?: string) {
  const list = projectId ? db.qualityChecks.filter((q) => q.projectId === projectId) : db.qualityChecks;
  return [...list];
}
export function listComplaints(): Complaint[] {
  return [...db.complaints];
}
export function listSensors(): Sensor[] {
  return [...db.sensors];
}
export function listNotifications(): Notification[] {
  return [...db.notifications];
}
export function listAuditEvents(): AuditEvent[] {
  return [...db.auditEvents];
}
export function listModels() {
  return [...db.models];
}
export function listDocuments() {
  return [...db.documents];
}
export function listMaintenancePlans(): MaintenancePlan[] {
  return [...db.maintenancePlans];
}
export function getSettings(): SystemConfig {
  return { ...db.systemConfig };
}

export function createBuilding(body: Partial<Building> & { actorId?: string; actorName?: string; actorRole?: Role }): Building {
  const building: Building = {
    id: `bld-${Date.now().toString(36)}`,
    buildingCode: body.buildingCode || `APX-MTR-${Date.now().toString().slice(-4)}`,
    name: body.name || 'Untitled facility',
    department: body.department || 'Corporate Real Estate & Facilities',
    buildingType: body.buildingType || 'Administrative',
    address: body.address || '',
    district: body.district || 'Financial & Corporate Core',
    divisionId: body.divisionId || 'div-metro-central',
    latitude: Number(body.latitude) || 26.142,
    longitude: Number(body.longitude) || 91.789,
    yearBuilt: Number(body.yearBuilt) || 2010,
    numberOfFloors: Number(body.numberOfFloors) || 4,
    structuralSystem: body.structuralSystem || 'RCC Framed',
    occupancyType: body.occupancyType || 'High',
    criticality: Number(body.criticality) || 4,
    status: 'Operational',
    currentBCI: body.currentBCI ?? 95,
    conditionBand: body.conditionBand || 'Good',
    lastInspectionAt: body.lastInspectionAt || new Date().toISOString(),
    nextInspectionAt: body.nextInspectionAt || new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
    photoUrl: body.photoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    floorAreaSqM: Number(body.floorAreaSqM) || 5000,
    hasActiveSensors: Boolean(body.hasActiveSensors),
    totalElementsCount: body.totalElementsCount ?? 0,
    openDefectsCount: body.openDefectsCount ?? 0
  };
  db.buildings.unshift(building);
  logAudit(body.actorId, body.actorName, body.actorRole, 'CREATE_BUILDING', 'BCI_CALCULATION', building.id, undefined, building.name);
  persist();
  return building;
}

export function createDefect(body: Partial<Defect> & { actorId?: string; actorName?: string; actorRole?: Role }): Defect {
  const S = Number(body.riskFactors?.S || body.severityGrade || 3);
  const C = Number(body.riskFactors?.C || 4);
  const P = Number(body.riskFactors?.P || 3);
  const E = Number(body.riskFactors?.E || 4);
  const rawScore = 100 * (S * C * P * E) / 625;
  const clampedScore = Math.min(100, Math.max(0, Math.round(rawScore)));
  const isP1Override = Boolean(body.isP1Override) || (Boolean(body.engineerVerified) && S === 5 && (body.structuralSignificance === 'PRIMARY' || C >= 4));
  let priorityBand: Defect['priorityBand'] = 'P4';
  if (isP1Override || clampedScore >= 80) priorityBand = 'P1';
  else if (clampedScore >= 60) priorityBand = 'P2';
  else if (clampedScore >= 35) priorityBand = 'P3';

  const defect: Defect = {
    id: `def-${Date.now().toString(36)}`,
    buildingId: body.buildingId || '',
    buildingName: body.buildingName || db.buildings.find((b) => b.id === body.buildingId)?.name,
    elementId: body.elementId || '',
    elementCode: body.elementCode || 'ELEM-REF',
    elementType: body.elementType || 'Column',
    inspectionId: body.inspectionId || 'insp-direct',
    type: body.type || 'CRACK',
    subtype: body.subtype || 'Hairline or shrinkage',
    structuralSignificance: body.structuralSignificance || 'PRIMARY',
    description: body.description || '',
    dimensions: body.dimensions,
    measuredCrackWidthMm: body.measuredCrackWidthMm !== undefined ? Number(body.measuredCrackWidthMm) : null,
    measuredLengthMm: body.measuredLengthMm !== undefined ? Number(body.measuredLengthMm) : null,
    estimatedAreaSqM: body.estimatedAreaSqM !== undefined ? Number(body.estimatedAreaSqM) : null,
    severityGrade: S,
    aiConfidence: body.aiConfidence || 0.9,
    aiExplanation: body.aiExplanation || 'Provisional finding recorded from field inspection.',
    engineerVerified: Boolean(body.engineerVerified),
    engineerGrade: body.engineerGrade ? Number(body.engineerGrade) : (body.engineerVerified ? S : undefined),
    engineerNotes: body.engineerNotes,
    imageIds: body.imageIds || [],
    riskFactors: { S, C, P, E },
    riskScore: clampedScore,
    isP1Override,
    priorityBand,
    status: body.engineerVerified ? 'VERIFIED' : 'PROVISIONAL',
    firstObservedAt: new Date().toISOString(),
    lastObservedAt: new Date().toISOString(),
    recommendedNextStep: body.recommendedNextStep || 'Qualified engineer assessment scheduled.'
  };

  db.defects.unshift(defect);
  recalculateBCI(defect.buildingId);

  if (defect.priorityBand === 'P1' || defect.isP1Override) {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientRole: 'ALL',
      type: 'P1_DEFECT',
      title: 'EMERGENCY: P1 Defect Logged',
      message: `P1 Defect reported at ${defect.buildingName} (${defect.elementType} ${defect.elementCode}). Response protocol: 24-72 hours.`,
      priority: 'CRITICAL',
      relatedBuildingId: defect.buildingId,
      relatedBuildingName: defect.buildingName,
      relatedRecordId: defect.id,
      relatedRoute: '/defects',
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  logAudit(body.actorId, body.actorName, body.actorRole, 'CREATE_DEFECT', 'DEFECT', defect.id, undefined, `Created ${defect.type} (Grade ${S}, Risk ${clampedScore})`);
  persist();
  return defect;
}

export function verifyDefect(
  id: string,
  body: { engineerGrade: number; engineerNotes: string; measuredCrackWidthMm?: number; actorId?: string; actorName?: string; actorRole?: Role }
): Defect {
  const defect = db.defects.find((d) => d.id === id);
  if (!defect) throw new Error('Defect not found');
  const previousState = `Status: ${defect.status}, Verified: ${defect.engineerVerified}, Grade: ${defect.severityGrade}`;
  defect.engineerVerified = true;
  defect.status = 'VERIFIED';
  defect.engineerGrade = Number(body.engineerGrade) || defect.severityGrade;
  defect.severityGrade = defect.engineerGrade;
  defect.engineerNotes = body.engineerNotes || 'Verified on-site by Assistant Engineer';
  if (body.measuredCrackWidthMm !== undefined) defect.measuredCrackWidthMm = Number(body.measuredCrackWidthMm);

  const S = defect.severityGrade;
  const C = defect.riskFactors.C;
  const P = defect.riskFactors.P;
  const E = defect.riskFactors.E;
  defect.riskScore = Math.min(100, Math.max(0, Math.round(100 * (S * C * P * E) / 625)));
  if (S === 5 && (defect.structuralSignificance === 'PRIMARY' || C >= 4)) {
    defect.isP1Override = true;
    defect.priorityBand = 'P1';
  } else if (defect.riskScore >= 80) defect.priorityBand = 'P1';
  else if (defect.riskScore >= 60) defect.priorityBand = 'P2';
  else if (defect.riskScore >= 35) defect.priorityBand = 'P3';
  else defect.priorityBand = 'P4';

  recalculateBCI(defect.buildingId);
  logAudit(
    body.actorId,
    body.actorName,
    body.actorRole,
    'VERIFY_DEFECT',
    'DEFECT',
    defect.id,
    previousState,
    `Verified Grade ${defect.severityGrade}, Priority: ${defect.priorityBand}, Risk: ${defect.riskScore}`,
    body.engineerNotes
  );
  persist();
  return defect;
}

export function createWorkOrder(body: Partial<WorkOrder> & { actorId?: string; actorName?: string; actorRole?: Role }): WorkOrder {
  const workOrder: WorkOrder = {
    id: `wo-${Date.now().toString(36)}`,
    workOrderNumber: `WO-2026-${Date.now().toString().slice(-6)}`,
    buildingId: body.buildingId || '',
    buildingName: body.buildingName || db.buildings.find((b) => b.id === body.buildingId)?.name,
    defectIds: body.defectIds || [],
    title: body.title || 'Rectification work order',
    repairMethod: body.repairMethod || '',
    estimatedCostINR: Number(body.estimatedCostINR) || 250000,
    approvedBudgetINR: Number(body.approvedBudgetINR) || Number(body.estimatedCostINR) || 250000,
    contractorId: body.contractorId || 'usr-ctr-01',
    contractorName: body.contractorName || 'Apex Commercial Builders Ltd.',
    assignedEngineerId: body.assignedEngineerId || 'usr-ae-metro',
    assignedEngineerName: body.assignedEngineerName || 'Er. Nathan Brooks, PE',
    priorityBand: body.priorityBand || 'P2',
    issuedAt: new Date().toISOString(),
    dueDate: body.dueDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    status: 'ASSIGNED',
    progressPercent: 0,
    beforePhotoIds: body.beforePhotoIds || [],
    afterPhotoIds: [],
    completionNotes: '',
    actualCostINR: 0,
    notes: body.notes
  };
  db.workOrders.unshift(workOrder);
  for (const defId of workOrder.defectIds) {
    const defect = db.defects.find((x) => x.id === defId);
    if (defect) {
      defect.status = 'WORK_ORDER_ASSIGNED';
      defect.assignedWorkOrderId = workOrder.id;
    }
  }
  logAudit(body.actorId, body.actorName, body.actorRole, 'CREATE_WORK_ORDER', 'WORK_ORDER', workOrder.id, undefined, `Created WO ${workOrder.workOrderNumber}`);
  persist();
  return workOrder;
}

export function updateWorkOrderProgress(
  id: string,
  data: { progressPercent?: number; notes?: string; afterPhotoIds?: string[]; submitForVerification?: boolean }
): WorkOrder {
  const wo = db.workOrders.find((w) => w.id === id);
  if (!wo) throw new Error('Work order not found');
  if (data.progressPercent !== undefined) wo.progressPercent = Number(data.progressPercent);
  if (data.notes) wo.notes = data.notes;
  if (data.afterPhotoIds) wo.afterPhotoIds = data.afterPhotoIds;
  if (data.submitForVerification) {
    wo.status = 'SUBMITTED_FOR_VERIFICATION';
    wo.submittedForVerificationAt = new Date().toISOString();
    wo.completionNotes = data.notes || 'Repair complete, ready for AE/EE inspection.';
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientRole: 'ASSISTANT_ENGINEER',
      type: 'WORK_SUBMITTED',
      title: 'Work Order Awaiting Verification',
      message: `${wo.contractorName} submitted completion photos for ${wo.workOrderNumber}.`,
      priority: 'MEDIUM',
      relatedBuildingId: wo.buildingId,
      relatedRecordId: wo.id,
      relatedRoute: '/work-orders',
      read: false,
      createdAt: new Date().toISOString()
    });
  } else if (wo.status === 'ASSIGNED' && wo.progressPercent > 0) {
    wo.status = 'IN_PROGRESS';
  }
  persist();
  return wo;
}

export function verifyWorkOrder(
  id: string,
  body: { approve: boolean; rejectionReason?: string; verifiedBy?: string; actualCostINR?: number; actorId?: string; actorRole?: Role }
): WorkOrder {
  const wo = db.workOrders.find((w) => w.id === id);
  if (!wo) throw new Error('Work order not found');
  if (body.approve) {
    wo.status = 'VERIFIED';
    wo.verifiedBy = body.verifiedBy || 'Er. Nathan Brooks, PE';
    wo.verifiedAt = new Date().toISOString();
    if (body.actualCostINR) wo.actualCostINR = Number(body.actualCostINR);
    for (const dId of wo.defectIds) {
      const defect = db.defects.find((x) => x.id === dId);
      if (defect) defect.status = 'VERIFIED_REPAIRED';
    }
    recalculateBCI(wo.buildingId);
    logAudit(body.actorId, body.verifiedBy, body.actorRole, 'APPROVE_WORK_ORDER', 'WORK_ORDER', wo.id, 'Status: SUBMITTED_FOR_VERIFICATION', 'Status: VERIFIED and CLOSED', 'Engineer verified satisfactory quality of repair on site.');
  } else {
    wo.status = 'REJECTED';
    wo.rejectionReason = body.rejectionReason || 'Repair quality sub-standard, requires rework.';
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientRole: 'CONTRACTOR',
      type: 'REPAIR_REJECTED',
      title: `Repair Rejected: ${wo.workOrderNumber}`,
      message: `Engineer rejected repair. Reason: ${wo.rejectionReason}`,
      priority: 'HIGH',
      relatedBuildingId: wo.buildingId,
      relatedRecordId: wo.id,
      relatedRoute: '/contractor-portal',
      read: false,
      createdAt: new Date().toISOString()
    });
    logAudit(body.actorId, body.verifiedBy, body.actorRole, 'REJECT_WORK_ORDER', 'WORK_ORDER', wo.id, 'Status: SUBMITTED_FOR_VERIFICATION', 'Status: REJECTED', wo.rejectionReason);
  }
  persist();
  return wo;
}

export function resolveNcr(id: string, body: { approvedBy?: string; actorId?: string; actorRole?: Role }): QualityCheck {
  const qc = db.qualityChecks.find((q) => q.id === id);
  if (!qc) throw new Error('Quality check not found');
  qc.ncrStatus = 'Resolved';
  qc.passed = true;
  qc.engineerApproval = true;
  qc.approvedBy = body.approvedBy || 'Er. Marcus Vance, PE';
  qc.notes = (qc.notes || '') + ' | NCR Resolved: Core testing verified strength suitability.';
  const project = db.constructionProjects.find((p) => p.id === qc.projectId);
  if (project) {
    project.openNCRs = Math.max(0, project.openNCRs - 1);
    if (project.openNCRs === 0 && project.status === 'Stage Blocked') project.status = 'In Progress';
  }
  logAudit(body.actorId, qc.approvedBy, body.actorRole, 'RESOLVE_NCR', 'QUALITY_CHECK', qc.id, 'NCR Status: Open', 'NCR Status: Resolved');
  persist();
  return qc;
}

export function submitComplaint(body: {
  buildingId: string;
  category?: Complaint['category'];
  description: string;
  locationDescription: string;
  floorOrRoom?: string;
  photoIds?: string[];
  contactDetails?: Complaint['contactDetails'];
}): { reference: string; data: Complaint } {
  const building = db.buildings.find((b) => b.id === body.buildingId) || db.buildings[0];
  const refNumber = `CMP-2026-${(100 + db.complaints.length + 1).toString()}`;
  const complaint: Complaint = {
    id: `cmp-${Date.now().toString(36)}`,
    buildingId: building?.id || body.buildingId,
    buildingName: building?.name,
    complaintReference: refNumber,
    category: body.category || 'Water Leakage / Dampness',
    description: body.description,
    locationDescription: body.locationDescription,
    floorOrRoom: body.floorOrRoom,
    photoIds: body.photoIds || [],
    submittedAt: new Date().toISOString(),
    status: 'Submitted',
    contactDetails: body.contactDetails
  };
  db.complaints.unshift(complaint);
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    recipientRole: 'EXECUTIVE_ENGINEER',
    type: 'OCCUPANT_COMPLAINT',
    title: `New Public Complaint: ${refNumber}`,
    message: `${complaint.category} reported at ${building?.name || 'facility'} (${body.locationDescription}).`,
    priority: 'HIGH',
    relatedBuildingId: complaint.buildingId,
    relatedBuildingName: building?.name,
    relatedRecordId: complaint.id,
    relatedRoute: '/track-complaint',
    read: false,
    createdAt: new Date().toISOString()
  });
  persist();
  return { reference: refNumber, data: complaint };
}

export function trackComplaint(reference: string): Complaint {
  const complaint = db.complaints.find((c) => c.complaintReference.toLowerCase() === reference.toLowerCase());
  if (!complaint) throw new Error('Complaint reference not found');
  return complaint;
}

export function acknowledgeSensor(sensorId: string, actor: { id?: string; name?: string; role?: Role }): Sensor {
  const sensor = db.sensors.find((s) => s.id === sensorId);
  if (!sensor) throw new Error('Sensor not found');
  sensor.isAcknowledged = true;
  logAudit(actor.id, actor.name, actor.role, 'ACKNOWLEDGE_ALARM', 'SYSTEM_SETTING', sensor.id, undefined, 'Sensor alarm acknowledged by engineer');
  persist();
  return sensor;
}

export function addSensorReading(sensorId: string, value: number): SensorReading {
  const sensor = db.sensors.find((s) => s.id === sensorId);
  if (!sensor) throw new Error('Sensor not found');
  const reading: SensorReading = {
    id: `sr-${Date.now()}`,
    sensorId: sensor.id,
    timestamp: new Date().toISOString(),
    value,
    qualityStatus: 'GOOD',
    anomalyStatus: value > sensor.thresholdHigh ? 'ANOMALY_HIGH' : 'NORMAL'
  };
  db.sensorReadings.push(reading);
  sensor.lastReadingValue = value;
  sensor.lastReadingTime = reading.timestamp;
  if (value > sensor.thresholdHigh) {
    sensor.status = 'Alarm';
    sensor.isAcknowledged = false;
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientRole: 'EXECUTIVE_ENGINEER',
      type: 'SENSOR_ALARM',
      title: `CRITICAL SENSOR ALARM: ${sensor.sensorType}`,
      message: `${sensor.sensorType} at ${sensor.buildingName} breached threshold (${value} ${sensor.unit} > ${sensor.thresholdHigh} ${sensor.unit}).`,
      priority: 'CRITICAL',
      relatedBuildingId: sensor.buildingId,
      relatedRecordId: sensor.id,
      relatedRoute: '/sensors',
      read: false,
      createdAt: new Date().toISOString()
    });
  } else {
    sensor.status = 'Normal';
  }
  persist();
  return reading;
}

export function markNotificationRead(id: string) {
  const notif = db.notifications.find((n) => n.id === id);
  if (notif) notif.read = true;
  persist();
}

export function optimizePlan(body: { divisionId: string; budgetINR: number; year: number; createdBy: string }): MaintenancePlan {
  const availableBudget = Number(body.budgetINR) || 5000000;
  const candidateWOs = db.workOrders.filter((w) => w.status !== 'VERIFIED' && w.status !== 'CLOSED');
  const mandatorySafetyWOs = candidateWOs.filter((w) => w.priorityBand === 'P1');
  const otherWOs = candidateWOs.filter((w) => w.priorityBand !== 'P1');
  otherWOs.sort((a, b) => {
    const riskA = a.priorityBand === 'P2' ? 70 : a.priorityBand === 'P3' ? 45 : 20;
    const riskB = b.priorityBand === 'P2' ? 70 : b.priorityBand === 'P3' ? 45 : 20;
    return riskB / (b.estimatedCostINR || 1) - riskA / (a.estimatedCostINR || 1);
  });

  let totalAllocated = 0;
  const selectedIds: string[] = [];
  const deferredIds: string[] = [];
  let unmetSafetyBudget = 0;

  for (const wo of mandatorySafetyWOs) {
    selectedIds.push(wo.id);
    totalAllocated += wo.estimatedCostINR;
    if (totalAllocated > availableBudget) unmetSafetyBudget += totalAllocated - availableBudget;
  }
  for (const wo of otherWOs) {
    if (totalAllocated + wo.estimatedCostINR <= availableBudget) {
      selectedIds.push(wo.id);
      totalAllocated += wo.estimatedCostINR;
    } else {
      deferredIds.push(wo.id);
    }
  }

  const plan: MaintenancePlan = {
    id: `mp-${Date.now().toString(36)}`,
    year: Number(body.year) || 2026,
    divisionId: body.divisionId || 'div-metro-central',
    divisionName: db.divisions.find((d) => d.id === body.divisionId)?.name || 'Metro Central District',
    availableBudgetINR: availableBudget,
    selectedWorkOrderIds: selectedIds,
    deferredWorkOrderIds: deferredIds,
    mandatorySafetyWorkOrderIds: mandatorySafetyWOs.map((w) => w.id),
    projectedRiskReductionPercent: Math.min(95, Math.round((selectedIds.length / (candidateWOs.length || 1)) * 88)),
    estimatedTotalCostINR: totalAllocated,
    unmetSafetyBudgetINR: unmetSafetyBudget,
    status: 'OPTIMIZED',
    createdBy: body.createdBy || 'Er. Marcus Vance, PE',
    createdAt: new Date().toISOString()
  };
  db.maintenancePlans.unshift(plan);
  persist();
  return plan;
}

export function syncInspections(drafts: Array<Partial<Inspection> & { localDraftId?: string }>): string[] {
  const syncedIds: string[] = [];
  for (const draft of drafts) {
    const inspection: Inspection = {
      id: draft.id || `insp-sync-${Date.now().toString(36)}`,
      buildingId: draft.buildingId || db.buildings[0]?.id || '',
      buildingName: draft.buildingName,
      inspectorId: draft.inspectorId || 'usr-je-01',
      inspectorName: draft.inspectorName || 'Er. Maya Patel, EIT',
      inspectionMethod: draft.inspectionMethod || 'Visual Walkthrough',
      inspectionDate: draft.inspectionDate || new Date().toISOString(),
      weather: draft.weather || 'Clear',
      checklistResults: draft.checklistResults || [],
      NDTReadings: draft.NDTReadings || [],
      photoIds: draft.photoIds || [],
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      summaryNotes: draft.summaryNotes || 'Submitted via offline sync queue.'
    };
    db.inspections.unshift(inspection);
    syncedIds.push(draft.localDraftId || inspection.id);
  }
  persist();
  return syncedIds;
}

export function analyzeDefectLocally(metadata?: {
  buildingId?: string;
  elementId?: string;
  elementType?: string;
  structuralClass?: string;
  hasScaleMarker?: boolean;
  defectTypeHint?: string;
}): AIAnalysisResult {
  const element = db.elements.find((e) => e.id === metadata?.elementId);
  const isPrimary = element?.structuralClass === 'PRIMARY' || metadata?.structuralClass === 'PRIMARY';
  return {
    defectType: metadata?.defectTypeHint || (isPrimary ? 'CRACK' : 'MOISTURE'),
    subtype: isPrimary ? 'Shear or diagonal' : 'Visible damp patches & efflorescence',
    visibleEvidence: `Observable concrete surface distress detected in central field of view on ${element?.elementType || metadata?.elementType || 'structural element'}. Prominent continuous fracture pattern with surface calcification.`,
    boundingBoxNormalized: { ymin: 220, xmin: 310, ymax: 780, xmax: 690 },
    approximateRegion: 'Mid-height core zone between support nodes',
    severityGradeProvisional: isPrimary ? 4 : 2,
    confidence: 0.88,
    estimatedDimensions: metadata?.hasScaleMarker ? 'Approx. 1200 mm length x 1.8 mm width' : null,
    measurementMethod: metadata?.hasScaleMarker ? 'Optical scale comparative gauge' : 'Physical optical crack measurement required on-site',
    structuralSignificanceProvisional: isPrimary ? 'PRIMARY' : 'SECONDARY',
    recommendedNextStep: 'Deploy Assistant Engineer with crack comparator card and Schmidt rebound hammer for on-site physical verification.',
    engineerVerificationRequired: true,
    limitations: 'Provisional AI assessment from 2D RGB imagery. Delamination, subsurface corrosion, and core concrete integrity cannot be determined without NDT.',
    qualityAssessment: {
      blur: false,
      poorLighting: false,
      missingScaleReference: !metadata?.hasScaleMarker,
      adequateQuality: true,
      recommendation: metadata?.hasScaleMarker
        ? 'Image quality adequate for provisional assessment.'
        : 'Include a 10mm calibrated optical crack ruler in close-up shot for certified width grading.'
    }
  };
}
