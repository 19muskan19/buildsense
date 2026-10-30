import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_BUILDINGS,
  INITIAL_DIVISIONS,
  INITIAL_ELEMENTS,
  INITIAL_DEFECTS,
  INITIAL_DEFECT_OBSERVATIONS,
  INITIAL_WORK_ORDERS,
  INITIAL_INSPECTIONS,
  INITIAL_CONSTRUCTION_PROJECTS,
  INITIAL_QUALITY_CHECKS,
  INITIAL_COMPLAINTS,
  INITIAL_SENSORS,
  INITIAL_SENSOR_READINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_EVENTS,
  INITIAL_DOCUMENTS,
  INITIAL_MODEL_REGISTRY,
  INITIAL_MAINTENANCE_PLANS,
  INITIAL_SYSTEM_CONFIG
} from './src/data/seedData.js';
import {
  Building,
  Defect,
  WorkOrder,
  Inspection,
  QualityCheck,
  Complaint,
  Sensor,
  SensorReading,
  AuditEvent,
  Notification,
  MaintenancePlan,
  SystemConfig,
  AIAnalysisResult
} from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// In-Memory Database store seeded with realistic Assam building data
const db = {
  buildings: [...INITIAL_BUILDINGS],
  divisions: [...INITIAL_DIVISIONS],
  elements: [...INITIAL_ELEMENTS],
  defects: [...INITIAL_DEFECTS],
  observations: [...INITIAL_DEFECT_OBSERVATIONS],
  workOrders: [...INITIAL_WORK_ORDERS],
  inspections: [...INITIAL_INSPECTIONS],
  constructionProjects: [...INITIAL_CONSTRUCTION_PROJECTS],
  qualityChecks: [...INITIAL_QUALITY_CHECKS],
  complaints: [...INITIAL_COMPLAINTS],
  sensors: [...INITIAL_SENSORS],
  sensorReadings: [...INITIAL_SENSOR_READINGS],
  notifications: [...INITIAL_NOTIFICATIONS],
  auditEvents: [...INITIAL_AUDIT_EVENTS],
  documents: [...INITIAL_DOCUMENTS],
  models: [...INITIAL_MODEL_REGISTRY],
  maintenancePlans: [...INITIAL_MAINTENANCE_PLANS],
  systemConfig: { ...INITIAL_SYSTEM_CONFIG }
};

// Recalculate Building Condition Index (BCI) based on official documented formula
export function recalculateBCI(buildingId: string): number {
  const buildingDefects = db.defects.filter(
    (d) => d.buildingId === buildingId && d.status !== 'VERIFIED_REPAIRED'
  );
  
  if (buildingDefects.length === 0) return 96; // Good baseline

  const config = db.systemConfig;
  let totalDeductions = 0;

  for (const defect of buildingDefects) {
    const sWeight = config.bciFormula.severityWeights[defect.severityGrade] || 5;
    const cWeight = config.bciFormula.criticalityWeights[defect.riskFactors?.C || 3] || 1.0;
    const classMultiplier = config.bciFormula.elementClassMultiplier[defect.structuralSignificance] || 1.0;
    
    // Status discount if work order in progress
    const statusWeight = defect.status === 'REPAIR_IN_PROGRESS' ? 0.75 : 1.0;
    
    const deduction = sWeight * cWeight * classMultiplier * statusWeight;
    totalDeductions += deduction;
  }

  // Deductions are clamped and normalized
  const calculatedBCI = Math.max(0, Math.min(100, Math.round(config.bciFormula.baseScore - totalDeductions)));
  
  const bIndex = db.buildings.findIndex((b) => b.id === buildingId);
  if (bIndex !== -1) {
    db.buildings[bIndex].currentBCI = calculatedBCI;
    if (calculatedBCI >= 85) db.buildings[bIndex].conditionBand = 'Good';
    else if (calculatedBCI >= 70) db.buildings[bIndex].conditionBand = 'Fair';
    else if (calculatedBCI >= 50) db.buildings[bIndex].conditionBand = 'Poor';
    else if (calculatedBCI >= 30) db.buildings[bIndex].conditionBand = 'Very Poor';
    else db.buildings[bIndex].conditionBand = 'Critical';
  }

  return calculatedBCI;
}

// Log audit event helper
function logAudit(
  actorId: string,
  actorName: string,
  actorRole: any,
  action: string,
  entityType: any,
  entityId: string,
  beforeSummary?: string,
  afterSummary?: string,
  reason?: string
) {
  const auditEvent: AuditEvent = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
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
  };
  db.auditEvents.unshift(auditEvent);
}

// REST API Endpoints

// Buildings
app.get('/api/buildings', (req: Request, res: Response) => {
  const { district, divisionId, type, conditionBand, query } = req.query;
  let results = db.buildings;

  if (district) results = results.filter((b) => b.district === district);
  if (divisionId) results = results.filter((b) => b.divisionId === divisionId);
  if (type) results = results.filter((b) => b.buildingType === type);
  if (conditionBand) results = results.filter((b) => b.conditionBand === conditionBand);
  if (query) {
    const q = (query as string).toLowerCase();
    results = results.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.buildingCode.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: results.length, data: results });
});

app.get('/api/buildings/:id', (req: Request, res: Response) => {
  const building = db.buildings.find((b) => b.id === req.params.id);
  if (!building) return res.status(404).json({ success: false, error: 'Building not found' });

  const elements = db.elements.filter((e) => e.buildingId === building.id);
  const defects = db.defects.filter((d) => d.buildingId === building.id);
  const workOrders = db.workOrders.filter((w) => w.buildingId === building.id);
  const inspections = db.inspections.filter((i) => i.buildingId === building.id);
  const sensors = db.sensors.filter((s) => s.buildingId === building.id);
  const documents = db.documents.filter((doc) => doc.buildingId === building.id);

  res.json({
    success: true,
    data: {
      ...building,
      elements,
      defects,
      workOrders,
      inspections,
      sensors,
      documents
    }
  });
});

app.post('/api/buildings', (req: Request, res: Response) => {
  const body = req.body;
  const newBuilding: Building = {
    id: `bld-${Date.now().toString(36)}`,
    buildingCode: body.buildingCode || `APX-MTR-${Date.now().toString().slice(-4)}`,
    name: body.name,
    department: body.department || 'Corporate Real Estate & Facilities',
    buildingType: body.buildingType || 'Commercial Office Tower',
    address: body.address,
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
    currentBCI: 95,
    conditionBand: 'Good',
    lastInspectionAt: new Date().toISOString(),
    nextInspectionAt: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
    photoUrl: body.photoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    floorAreaSqM: Number(body.floorAreaSqM) || 5000,
    hasActiveSensors: false,
    totalElementsCount: 0,
    openDefectsCount: 0
  };

  db.buildings.unshift(newBuilding);
  logAudit(req.body.actorId, req.body.actorName, req.body.actorRole, 'CREATE_BUILDING', 'BCI_CALCULATION', newBuilding.id, undefined, newBuilding.name);
  res.status(201).json({ success: true, data: newBuilding });
});

// Divisions
app.get('/api/divisions', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.divisions });
});

// Elements
app.get('/api/elements', (req: Request, res: Response) => {
  const { buildingId } = req.query;
  let list = db.elements;
  if (buildingId) list = list.filter((e) => e.buildingId === buildingId);
  res.json({ success: true, data: list });
});

// Defects
app.get('/api/defects', (req: Request, res: Response) => {
  const { buildingId, priority, status, severity } = req.query;
  let list = db.defects;
  if (buildingId) list = list.filter((d) => d.buildingId === buildingId);
  if (priority) list = list.filter((d) => d.priorityBand === priority);
  if (status) list = list.filter((d) => d.status === status);
  if (severity) list = list.filter((d) => d.severityGrade === Number(severity));
  res.json({ success: true, count: list.length, data: list });
});

app.post('/api/defects', (req: Request, res: Response) => {
  const body = req.body;
  const S = Number(body.riskFactors?.S || body.severityGrade || 3);
  const C = Number(body.riskFactors?.C || 4);
  const P = Number(body.riskFactors?.P || 3);
  const E = Number(body.riskFactors?.E || 4);
  
  // Calculate risk formula: 100 * (S * C * P * E) / 625
  const rawScore = 100 * (S * C * P * E) / 625;
  const clampedScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // P1 Override: any engineer-confirmed Grade 5 affecting primary structure
  const isP1Override = body.isP1Override || (body.engineerVerified && S === 5 && (body.structuralSignificance === 'PRIMARY' || C >= 4));
  let priorityBand = 'P4';
  if (isP1Override || clampedScore >= 80) priorityBand = 'P1';
  else if (clampedScore >= 60) priorityBand = 'P2';
  else if (clampedScore >= 35) priorityBand = 'P3';

  const newDefect: Defect = {
    id: `def-${Date.now().toString(36)}`,
    buildingId: body.buildingId,
    buildingName: body.buildingName || db.buildings.find((b) => b.id === body.buildingId)?.name,
    elementId: body.elementId,
    elementCode: body.elementCode || 'ELEM-REF',
    elementType: body.elementType || 'Column',
    inspectionId: body.inspectionId || 'insp-direct',
    type: body.type || 'CRACK',
    subtype: body.subtype || 'Hairline or shrinkage',
    structuralSignificance: body.structuralSignificance || 'PRIMARY',
    description: body.description,
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
    priorityBand: priorityBand as any,
    status: body.engineerVerified ? 'VERIFIED' : 'PROVISIONAL',
    firstObservedAt: new Date().toISOString(),
    lastObservedAt: new Date().toISOString(),
    recommendedNextStep: body.recommendedNextStep || 'Qualified engineer assessment scheduled.'
  };

  db.defects.unshift(newDefect);
  recalculateBCI(newDefect.buildingId);

  // If P1 trigger, dispatch critical notification
  if (newDefect.priorityBand === 'P1' || newDefect.isP1Override) {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientRole: 'ALL',
      type: 'P1_DEFECT',
      title: 'EMERGENCY: P1 Defect Logged',
      message: `P1 Defect reported at ${newDefect.buildingName} (${newDefect.elementType} ${newDefect.elementCode}). Response protocol: 24-72 hours.`,
      priority: 'CRITICAL',
      relatedBuildingId: newDefect.buildingId,
      relatedBuildingName: newDefect.buildingName,
      relatedRecordId: newDefect.id,
      relatedRoute: '/defects',
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  logAudit(body.actorId, body.actorName, body.actorRole, 'CREATE_DEFECT', 'DEFECT', newDefect.id, undefined, `Created ${newDefect.type} (Grade ${S}, Risk ${clampedScore})`);

  res.status(201).json({ success: true, data: newDefect });
});

app.patch('/api/defects/:id/verify', (req: Request, res: Response) => {
  const index = db.defects.findIndex((d) => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Defect not found' });

  const defect = db.defects[index];
  const body = req.body;

  const previousState = `Status: ${defect.status}, Verified: ${defect.engineerVerified}, Grade: ${defect.severityGrade}`;

  defect.engineerVerified = true;
  defect.status = 'VERIFIED';
  defect.engineerGrade = Number(body.engineerGrade) || defect.severityGrade;
  defect.severityGrade = defect.engineerGrade;
  defect.engineerNotes = body.engineerNotes || 'Verified on-site by Assistant Engineer';
  if (body.measuredCrackWidthMm !== undefined) defect.measuredCrackWidthMm = Number(body.measuredCrackWidthMm);

  // Recalculate risk score
  const S = defect.severityGrade;
  const C = defect.riskFactors.C;
  const P = defect.riskFactors.P;
  const E = defect.riskFactors.E;
  defect.riskScore = Math.min(100, Math.max(0, Math.round(100 * (S * C * P * E) / 625)));

  // P1 override rule
  if (S === 5 && (defect.structuralSignificance === 'PRIMARY' || C >= 4)) {
    defect.isP1Override = true;
    defect.priorityBand = 'P1';
  } else {
    if (defect.riskScore >= 80) defect.priorityBand = 'P1';
    else if (defect.riskScore >= 60) defect.priorityBand = 'P2';
    else if (defect.riskScore >= 35) defect.priorityBand = 'P3';
    else defect.priorityBand = 'P4';
  }

  recalculateBCI(defect.buildingId);

  logAudit(
    body.actorId || 'usr-ae-kamrup',
    body.actorName || 'Er. Manabendra Sarma, AE',
    body.actorRole || 'ASSISTANT_ENGINEER',
    'VERIFY_DEFECT',
    'DEFECT',
    defect.id,
    previousState,
    `Verified Grade ${defect.severityGrade}, Priority: ${defect.priorityBand}, Risk: ${defect.riskScore}`,
    body.engineerNotes
  );

  res.json({ success: true, data: defect });
});

// Work Orders
app.get('/api/work-orders', (req: Request, res: Response) => {
  const { status, contractorId, buildingId } = req.query;
  let list = db.workOrders;
  if (status) list = list.filter((w) => w.status === status);
  if (contractorId) list = list.filter((w) => w.contractorId === contractorId);
  if (buildingId) list = list.filter((w) => w.buildingId === buildingId);
  res.json({ success: true, count: list.length, data: list });
});

app.post('/api/work-orders', (req: Request, res: Response) => {
  const body = req.body;
  const newWO: WorkOrder = {
    id: `wo-${Date.now().toString(36)}`,
    workOrderNumber: `WO-2026-${Date.now().toString().slice(-6)}`,
    buildingId: body.buildingId,
    buildingName: body.buildingName || db.buildings.find((b) => b.id === body.buildingId)?.name,
    defectIds: body.defectIds || [],
    title: body.title,
    repairMethod: body.repairMethod,
    estimatedCostINR: Number(body.estimatedCostINR) || 250000,
    approvedBudgetINR: Number(body.approvedBudgetINR) || Number(body.estimatedCostINR) || 250000,
    contractorId: body.contractorId || 'usr-ctr-01',
    contractorName: body.contractorName || 'Brahmaputra Infrastructure Ltd.',
    assignedEngineerId: body.assignedEngineerId || 'usr-ae-kamrup',
    assignedEngineerName: body.assignedEngineerName || 'Er. Manabendra Sarma, AE',
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

  db.workOrders.unshift(newWO);

  // Update linked defects
  for (const defId of newWO.defectIds) {
    const d = db.defects.find((x) => x.id === defId);
    if (d) {
      d.status = 'WORK_ORDER_ASSIGNED';
      d.assignedWorkOrderId = newWO.id;
    }
  }

  logAudit(body.actorId, body.actorName, body.actorRole, 'CREATE_WORK_ORDER', 'WORK_ORDER', newWO.id, undefined, `Created WO ${newWO.workOrderNumber}`);
  res.status(201).json({ success: true, data: newWO });
});

app.patch('/api/work-orders/:id/progress', (req: Request, res: Response) => {
  const wo = db.workOrders.find((w) => w.id === req.params.id);
  if (!wo) return res.status(404).json({ success: false, error: 'Work order not found' });

  const { progressPercent, notes, afterPhotoIds, submitForVerification } = req.body;
  if (progressPercent !== undefined) wo.progressPercent = Number(progressPercent);
  if (notes) wo.notes = notes;
  if (afterPhotoIds) wo.afterPhotoIds = afterPhotoIds;

  if (submitForVerification) {
    wo.status = 'SUBMITTED_FOR_VERIFICATION';
    wo.submittedForVerificationAt = new Date().toISOString();
    wo.completionNotes = notes || 'Repair complete, ready for AE/EE inspection.';

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

  res.json({ success: true, data: wo });
});

app.patch('/api/work-orders/:id/verify', (req: Request, res: Response) => {
  const wo = db.workOrders.find((w) => w.id === req.params.id);
  if (!wo) return res.status(404).json({ success: false, error: 'Work order not found' });

  const { approve, rejectionReason, verifiedBy, actualCostINR } = req.body;

  if (approve) {
    wo.status = 'VERIFIED';
    wo.verifiedBy = verifiedBy || 'Er. Manabendra Sarma, AE';
    wo.verifiedAt = new Date().toISOString();
    if (actualCostINR) wo.actualCostINR = Number(actualCostINR);

    // Update defects to verified repaired
    for (const dId of wo.defectIds) {
      const d = db.defects.find((x) => x.id === dId);
      if (d) {
        d.status = 'VERIFIED_REPAIRED';
      }
    }
    recalculateBCI(wo.buildingId);

    logAudit(
      req.body.actorId,
      verifiedBy,
      req.body.actorRole,
      'APPROVE_WORK_ORDER',
      'WORK_ORDER',
      wo.id,
      'Status: SUBMITTED_FOR_VERIFICATION',
      'Status: VERIFIED and CLOSED',
      'Engineer verified satisfactory quality of repair on site.'
    );
  } else {
    wo.status = 'REJECTED';
    wo.rejectionReason = rejectionReason || 'Repair quality sub-standard, requires rework.';

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

    logAudit(
      req.body.actorId,
      verifiedBy,
      req.body.actorRole,
      'REJECT_WORK_ORDER',
      'WORK_ORDER',
      wo.id,
      'Status: SUBMITTED_FOR_VERIFICATION',
      'Status: REJECTED',
      wo.rejectionReason
    );
  }

  res.json({ success: true, data: wo });
});

// Inspections
app.get('/api/inspections', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.inspections });
});

// Documents
app.get('/api/documents', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.documents });
});

// Quality Checks & Construction
app.get('/api/construction-projects', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.constructionProjects });
});

app.get('/api/quality-checks', (req: Request, res: Response) => {
  const { projectId } = req.query;
  let list = db.qualityChecks;
  if (projectId) list = list.filter((q) => q.projectId === projectId);
  res.json({ success: true, data: list });
});

app.patch('/api/quality-checks/:id/resolve-ncr', (req: Request, res: Response) => {
  const qc = db.qualityChecks.find((q) => q.id === req.params.id);
  if (!qc) return res.status(404).json({ success: false, error: 'Quality check not found' });

  qc.ncrStatus = 'Resolved';
  qc.passed = true;
  qc.engineerApproval = true;
  qc.approvedBy = req.body.approvedBy || 'Er. Marcus Vance, PE';
  qc.notes = (qc.notes || '') + ' | NCR Resolved: Core testing verified strength suitability.';

  // Unblock project if no open NCRs left
  const prj = db.constructionProjects.find((p) => p.id === qc.projectId);
  if (prj) {
    prj.openNCRs = Math.max(0, prj.openNCRs - 1);
    if (prj.openNCRs === 0 && prj.status === 'Stage Blocked') {
      prj.status = 'In Progress';
    }
  }

  logAudit(req.body.actorId, qc.approvedBy || 'Er. Marcus Vance, PE', req.body.actorRole, 'RESOLVE_NCR', 'QUALITY_CHECK', qc.id, 'NCR Status: Open', 'NCR Status: Resolved');
  res.json({ success: true, data: qc });
});

// Occupant Complaints (Public QR route)
app.get('/api/complaints', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.complaints });
});

app.post('/api/complaints', (req: Request, res: Response) => {
  const { buildingId, category, description, locationDescription, floorOrRoom, contactDetails, photoIds } = req.body;
  
  const building = db.buildings.find((b) => b.id === buildingId);
  if (!building) return res.status(400).json({ success: false, error: 'Invalid building QR code' });

  const refNumber = `CMP-2026-${(100 + db.complaints.length + 1).toString()}`;
  const newComplaint: Complaint = {
    id: `cmp-${Date.now().toString(36)}`,
    buildingId,
    buildingName: building.name,
    complaintReference: refNumber,
    category: category || 'Water Leakage / Dampness',
    description,
    locationDescription,
    floorOrRoom,
    photoIds: photoIds || [],
    submittedAt: new Date().toISOString(),
    status: 'Submitted',
    contactDetails
  };

  db.complaints.unshift(newComplaint);

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    recipientRole: 'EXECUTIVE_ENGINEER',
    type: 'OCCUPANT_COMPLAINT',
    title: `New Public Complaint: ${refNumber}`,
    message: `${newComplaint.category} reported at ${building.name} (${locationDescription}).`,
    priority: 'HIGH',
    relatedBuildingId: buildingId,
    relatedBuildingName: building.name,
    relatedRecordId: newComplaint.id,
    relatedRoute: '/complaints',
    read: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ success: true, reference: refNumber, data: newComplaint });
});

app.get('/api/complaints/track/:ref', (req: Request, res: Response) => {
  const complaint = db.complaints.find(
    (c) => c.complaintReference.toLowerCase() === req.params.ref.toLowerCase()
  );
  if (!complaint) return res.status(404).json({ success: false, error: 'Complaint reference not found' });
  res.json({ success: true, data: complaint });
});

// Sensors & Readings
app.get('/api/sensors', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.sensors });
});

app.get('/api/sensors/:id/readings', (req: Request, res: Response) => {
  const readings = db.sensorReadings.filter((r) => r.sensorId === req.params.id);
  res.json({ success: true, data: readings });
});

app.post('/api/sensors/:id/readings', (req: Request, res: Response) => {
  const sensor = db.sensors.find((s) => s.id === req.params.id);
  if (!sensor) return res.status(404).json({ success: false, error: 'Sensor not found' });

  const { value } = req.body;
  const numVal = Number(value);

  const reading: SensorReading = {
    id: `sr-${Date.now()}`,
    sensorId: sensor.id,
    timestamp: new Date().toISOString(),
    value: numVal,
    qualityStatus: 'GOOD',
    anomalyStatus: numVal > sensor.thresholdHigh ? 'ANOMALY_HIGH' : 'NORMAL'
  };

  db.sensorReadings.push(reading);
  sensor.lastReadingValue = numVal;
  sensor.lastReadingTime = reading.timestamp;

  if (numVal > sensor.thresholdHigh) {
    sensor.status = 'Alarm';
    sensor.isAcknowledged = false;
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientRole: 'EXECUTIVE_ENGINEER',
      type: 'SENSOR_ALARM',
      title: `CRITICAL SENSOR ALARM: ${sensor.sensorType}`,
      message: `${sensor.sensorType} at ${sensor.buildingName} breached threshold (${numVal} ${sensor.unit} > ${sensor.thresholdHigh} ${sensor.unit}).`,
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

  res.status(201).json({ success: true, data: reading });
});

app.patch('/api/sensors/:id/acknowledge', (req: Request, res: Response) => {
  const sensor = db.sensors.find((s) => s.id === req.params.id);
  if (!sensor) return res.status(404).json({ success: false, error: 'Sensor not found' });
  sensor.isAcknowledged = true;
  logAudit(req.body.actorId, req.body.actorName, req.body.actorRole, 'ACKNOWLEDGE_ALARM', 'SYSTEM_SETTING', sensor.id, undefined, 'Sensor alarm acknowledged by engineer');
  res.json({ success: true, data: sensor });
});

// Notifications
app.get('/api/notifications', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.notifications });
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

// Audit Events
app.get('/api/audit-events', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.auditEvents });
});

// Model Registry
app.get('/api/models', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.models });
});

// Maintenance Plans & Budget Optimizer
app.get('/api/maintenance-plans', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.maintenancePlans });
});

app.post('/api/maintenance-plans/optimize', (req: Request, res: Response) => {
  const { divisionId, budgetINR, year } = req.body;
  const availableBudget = Number(budgetINR) || 5000000;

  // Filter uncompleted work orders for the division
  const candidateWOs = db.workOrders.filter((w) => w.status !== 'VERIFIED' && w.status !== 'CLOSED');

  // Mandatory Safety Items (P1 items)
  const mandatorySafetyWOs = candidateWOs.filter((w) => w.priorityBand === 'P1');
  const otherWOs = candidateWOs.filter((w) => w.priorityBand !== 'P1');

  // Sort other items by Cost-Effectiveness: (Risk Score / Estimated Cost)
  otherWOs.sort((a, b) => {
    const riskA = a.priorityBand === 'P2' ? 70 : a.priorityBand === 'P3' ? 45 : 20;
    const riskB = b.priorityBand === 'P2' ? 70 : b.priorityBand === 'P3' ? 45 : 20;
    const ratioA = riskA / (a.estimatedCostINR || 1);
    const ratioB = riskB / (b.estimatedCostINR || 1);
    return ratioB - ratioA;
  });

  let totalAllocated = 0;
  const selectedIds: string[] = [];
  const deferredIds: string[] = [];
  let unmetSafetyBudget = 0;

  // First allocate mandatory safety P1s
  for (const wo of mandatorySafetyWOs) {
    if (totalAllocated + wo.estimatedCostINR <= availableBudget) {
      selectedIds.push(wo.id);
      totalAllocated += wo.estimatedCostINR;
    } else {
      // Funding gap for safety-critical item!
      selectedIds.push(wo.id); // Must not be dropped
      totalAllocated += wo.estimatedCostINR;
      unmetSafetyBudget += totalAllocated - availableBudget;
    }
  }

  // Allocate remaining candidates
  for (const wo of otherWOs) {
    if (totalAllocated + wo.estimatedCostINR <= availableBudget) {
      selectedIds.push(wo.id);
      totalAllocated += wo.estimatedCostINR;
    } else {
      deferredIds.push(wo.id);
    }
  }

  const projectedRiskReduction = Math.min(95, Math.round((selectedIds.length / (candidateWOs.length || 1)) * 88));

  const plan: MaintenancePlan = {
    id: `mp-${Date.now().toString(36)}`,
    year: Number(year) || 2026,
    divisionId: divisionId || 'div-kamrup',
    divisionName: db.divisions.find((d) => d.id === divisionId)?.name || 'Kamrup Metro Division',
    availableBudgetINR: availableBudget,
    selectedWorkOrderIds: selectedIds,
    deferredWorkOrderIds: deferredIds,
    mandatorySafetyWorkOrderIds: mandatorySafetyWOs.map((w) => w.id),
    projectedRiskReductionPercent: projectedRiskReduction,
    estimatedTotalCostINR: totalAllocated,
    unmetSafetyBudgetINR: unmetSafetyBudget,
    status: 'OPTIMIZED',
    createdBy: req.body.createdBy || 'Er. Ranjit Barua, EE',
    createdAt: new Date().toISOString()
  };

  db.maintenancePlans.unshift(plan);
  res.json({ success: true, data: plan });
});

// System Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.systemConfig });
});

app.patch('/api/settings', (req: Request, res: Response) => {
  db.systemConfig = { ...db.systemConfig, ...req.body };
  logAudit(req.body.actorId, req.body.actorName, req.body.actorRole, 'UPDATE_SETTINGS', 'SYSTEM_SETTING', 'config', undefined, 'Updated BCI & Risk thresholds');
  res.json({ success: true, data: db.systemConfig });
});

// AI Multimodal Defect Analysis Endpoint using Gemini SDK (@google/genai)
app.post('/api/ai/analyze-defect', async (req: Request, res: Response) => {
  try {
    const { imageBase64, imageUrl, metadata } = req.body;

    const building = db.buildings.find((b) => b.id === metadata?.buildingId);
    const element = db.elements.find((e) => e.id === metadata?.elementId);

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if real Gemini API key is available
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const promptText = `
Act as an expert civil and structural forensic engineer inspecting building infrastructure.
Inspect this photograph of a building element:
- Building: ${building?.name || 'Apex Infrastructure Facility'}
- Element Type: ${element?.elementType || metadata?.elementType || 'Reinforced Concrete Member'}
- Structural Class: ${element?.structuralClass || metadata?.structuralClass || 'PRIMARY'}
- Floor & Zone: ${element?.floorId || metadata?.floorId || 'Ground Floor'} ${element?.zoneId || metadata?.zoneId || ''}
- Inspection Method: ${metadata?.inspectionMethod || 'Visual Walkthrough'}
- Known Scale Marker: ${metadata?.hasScaleMarker ? '10mm gauge present' : 'No optical scale reference present'}
- Engineer Notes: ${metadata?.engineerNotes || 'None'}

Return ONLY a valid JSON object strictly matching this schema:
{
  "defectType": "CRACK" | "SPALLING" | "REINFORCEMENT_CORROSION" | "CONCRETE_DETERIORATION" | "SETTLEMENT_DEFORMATION" | "MOISTURE" | "NON_STRUCTURAL" | "CONSTRUCTION_QUALITY",
  "subtype": string (e.g., "Shear or diagonal", "Flexural", "Exposed reinforcement", "Terrace leakage"),
  "visibleEvidence": string (detailed description of visual signs),
  "boundingBoxNormalized": { "ymin": number, "xmin": number, "ymax": number, "xmax": number },
  "approximateRegion": string,
  "severityGradeProvisional": number (1 to 5),
  "confidence": number (between 0.0 and 1.0),
  "estimatedDimensions": string or null (ONLY provide if reliable scale exists, else null),
  "measurementMethod": string,
  "structuralSignificanceProvisional": "PRIMARY" | "SECONDARY" | "NON_STRUCTURAL",
  "recommendedNextStep": string,
  "engineerVerificationRequired": true,
  "limitations": string,
  "qualityAssessment": {
    "blur": boolean,
    "poorLighting": boolean,
    "missingScaleReference": boolean,
    "adequateQuality": boolean,
    "recommendation": string
  }
}
Do not fabricate exact millimetre dimensions if no calibrated scale is present. Label all uncalibrated observations as "Measurement required".`;

        let contents: any;
        if (imageBase64) {
          const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
          contents = {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: cleanBase64
                }
              },
              { text: promptText }
            ]
          };
        } else {
          contents = promptText;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

        return res.json({
          success: true,
          isLiveModel: true,
          data: parsed
        });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed or quota exceeded, using resilient engineering fallback:', geminiError?.message);
      }
    }

    // High-Fidelity Domain Fallback if Gemini key is not configured or network failed
    const isPrimary = element?.structuralClass === 'PRIMARY' || metadata?.structuralClass === 'PRIMARY';
    const fallbackResult: AIAnalysisResult = {
      defectType: metadata?.defectTypeHint || (isPrimary ? 'CRACK' : 'MOISTURE'),
      subtype: isPrimary ? 'Shear or diagonal' : 'Visible damp patches & efflorescence',
      visibleEvidence: `Observable concrete surface distress detected in central field of view on ${element?.elementType || 'structural element'}. Prominent continuous fracture pattern with surface calcification.`,
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

    return res.json({
      success: true,
      isLiveModel: false,
      isDemoFallback: true,
      data: fallbackResult
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error processing AI defect analysis' });
  }
});

// Offline Sync Batch Endpoint
app.post('/api/sync/offline-inspections', (req: Request, res: Response) => {
  const { drafts, idempotencyKey } = req.body;
  if (!Array.isArray(drafts)) {
    return res.status(400).json({ success: false, error: 'Drafts array required' });
  }

  const syncedIds: string[] = [];
  for (const draft of drafts) {
    const inspection: Inspection = {
      id: draft.id || `insp-sync-${Date.now().toString(36)}`,
      buildingId: draft.buildingId,
      buildingName: draft.buildingName,
      inspectorId: draft.inspectorId || 'usr-je-01',
      inspectorName: draft.inspectorName || 'Er. Diganta Medhi, JE',
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

  res.json({
    success: true,
    syncedCount: syncedIds.length,
    syncedIds,
    timestamp: new Date().toISOString()
  });
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[BuildSense Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
