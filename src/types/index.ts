export type Role = 
  | 'CHIEF_ENGINEER'
  | 'SUPERINTENDING_ENGINEER'
  | 'EXECUTIVE_ENGINEER'
  | 'ASSISTANT_ENGINEER'
  | 'JUNIOR_ENGINEER'
  | 'CONTRACTOR'
  | 'AUDITOR'
  | 'OCCUPANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleTitle: string;
  department: string;
  divisionId?: string;
  contractorCompany?: string;
  avatar?: string;
}

export type StructuralClass = 'PRIMARY' | 'SECONDARY' | 'NON_STRUCTURAL';

export type ConditionBand = 'Good' | 'Fair' | 'Poor' | 'Very Poor' | 'Critical';

export type PriorityBand = 'P1' | 'P2' | 'P3' | 'P4';

export type DefectStatus = 
  | 'IDENTIFIED' 
  | 'PROVISIONAL' 
  | 'VERIFIED' 
  | 'WORK_ORDER_ASSIGNED' 
  | 'REPAIR_IN_PROGRESS' 
  | 'REPAIR_SUBMITTED' 
  | 'VERIFIED_REPAIRED' 
  | 'MONITORING';

export type WorkOrderStatus = 
  | 'NEW' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'SUBMITTED_FOR_VERIFICATION' 
  | 'REJECTED' 
  | 'VERIFIED' 
  | 'CLOSED';

export interface Division {
  id: string;
  name: string;
  district: string;
  responsibleEngineerId: string;
  responsibleEngineerName: string;
  totalBuildings: number;
  averageBCI: number;
  openCriticalDefects: number;
}

export interface Building {
  id: string;
  buildingCode: string;
  name: string;
  department: string;
  buildingType: 'Educational' | 'Healthcare' | 'Administrative' | 'Public Utility' | 'Residential Official';
  address: string;
  district: string;
  divisionId: string;
  latitude: number;
  longitude: number;
  yearBuilt: number;
  numberOfFloors: number;
  structuralSystem: 'RCC Framed' | 'Load Bearing Masonry' | 'Steel Truss & Frame' | 'Composite';
  occupancyType: 'High' | 'Medium' | 'Low' | 'Critical Public';
  criticality: number; // 1-5
  status: 'Operational' | 'Under Inspection' | 'Repair Required' | 'Critical Intervention';
  currentBCI: number; // 0-100
  conditionBand: ConditionBand;
  lastInspectionAt: string;
  nextInspectionAt: string;
  photoUrl: string;
  floorAreaSqM: number;
  hasActiveSensors: boolean;
  totalElementsCount?: number;
  openDefectsCount?: number;
}

export interface Element {
  id: string;
  buildingId: string;
  floorId: string;
  zoneId: string;
  elementCode: string;
  elementType: 'Column' | 'Beam' | 'Structural Slab' | 'Shear Wall' | 'Foundation' | 'Staircase' | 'Parapet' | 'Chajja' | 'Masonry Wall' | 'Plaster/Finishes' | 'Roof/Terrace' | 'Waterproofing';
  structuralClass: StructuralClass;
  locationDescription: string;
  drawingCoordinates?: { x: number; y: number };
  criticality: number; // 1-5
  currentConditionGrade: number; // 1-5
  lastInspectionDate?: string;
  openDefectsCount: number;
}

export interface Defect {
  id: string;
  buildingId: string;
  buildingName?: string;
  elementId: string;
  elementCode?: string;
  elementType?: string;
  inspectionId: string;
  type: 'CRACK' | 'SPALLING' | 'REINFORCEMENT_CORROSION' | 'CONCRETE_DETERIORATION' | 'SETTLEMENT_DEFORMATION' | 'MOISTURE' | 'NON_STRUCTURAL' | 'CONSTRUCTION_QUALITY';
  subtype: string;
  structuralSignificance: StructuralClass;
  description: string;
  dimensions?: string;
  measuredCrackWidthMm?: number | null;
  measuredLengthMm?: number | null;
  estimatedAreaSqM?: number | null;
  severityGrade: number; // 1-5
  aiConfidence?: number;
  aiExplanation?: string;
  engineerVerified: boolean;
  engineerGrade?: number;
  engineerNotes?: string;
  imageIds: string[];
  riskFactors: {
    S: number; // Severity 1-5
    C: number; // Criticality 1-5
    P: number; // Progression 1-5
    E: number; // Exposure 1-5
  };
  riskScore: number; // 0-100 calculated: 100 * (S * C * P * E) / 625
  isP1Override: boolean;
  priorityBand: PriorityBand;
  status: DefectStatus;
  firstObservedAt: string;
  lastObservedAt: string;
  previousObservationId?: string;
  assignedWorkOrderId?: string;
  costOfDeferralINR?: number;
  recommendedNextStep?: string;
}

export interface DefectObservation {
  id: string;
  defectId: string;
  observationDate: string;
  measuredCrackWidthMm?: number | null;
  measuredLengthMm?: number | null;
  estimatedAreaSqM?: number | null;
  severityGrade: number;
  photoIds: string[];
  inspectionId: string;
  changeFromPrevious: 'NEW' | 'STABLE' | 'GROWING' | 'REPAIRED' | 'UNCERTAIN';
  inspectorId: string;
  inspectorName?: string;
  notes?: string;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  buildingId: string;
  buildingName?: string;
  defectIds: string[];
  title: string;
  repairMethod: string;
  estimatedCostINR: number;
  approvedBudgetINR: number;
  contractorId: string;
  contractorName: string;
  assignedEngineerId: string;
  assignedEngineerName: string;
  priorityBand: PriorityBand;
  issuedAt: string;
  dueDate: string;
  status: WorkOrderStatus;
  progressPercent: number;
  beforePhotoIds: string[];
  afterPhotoIds: string[];
  completionNotes?: string;
  submittedForVerificationAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  actualCostINR?: number;
  notes?: string;
}

export interface Inspection {
  id: string;
  buildingId: string;
  buildingName?: string;
  inspectorId: string;
  inspectorName: string;
  inspectionMethod: 'Visual Walkthrough' | 'Detailed Engineering Assessment' | 'Drone Aerial Survey' | 'NDT Diagnostic';
  inspectionDate: string;
  dueDate?: string;
  weather: 'Clear' | 'Humid / Monsoon' | 'Rainy' | 'Overcast';
  checklistResults: {
    category: string;
    item: string;
    status: 'Pass' | 'Attention Required' | 'Critical Concern' | 'N/A';
    notes?: string;
  }[];
  NDTReadings?: {
    testMethod: string;
    location: string;
    value: string;
    unit: string;
    status: 'Normal' | 'Anomalous' | 'Inconclusive';
  }[];
  photoIds: string[];
  status: 'Scheduled' | 'Draft' | 'Submitted' | 'Verified' | 'Correction Required';
  submittedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  summaryNotes?: string;
}

export interface ConstructionProject {
  id: string;
  buildingId: string;
  buildingName: string;
  projectName: string;
  contractorId: string;
  contractorName: string;
  projectCostINR: number;
  plannedProgress: number;
  actualProgress: number;
  startDate: string;
  targetCompletionDate: string;
  status: 'In Progress' | 'Stage Blocked' | 'Quality Review' | 'Completed';
  currentStage: string;
  totalNCRs: number;
  openNCRs: number;
}

export interface QualityCheck {
  id: string;
  projectId: string;
  buildingId: string;
  elementId?: string;
  constructionStage: 'Foundation' | 'Reinforcement' | 'Shuttering' | 'Plinth & DPC' | 'Columns & Beams' | 'Slab Pre-pour' | 'Concreting' | 'Curing' | 'Masonry' | 'Waterproofing' | 'Finishing' | 'Final Handover';
  testType: string;
  testResult: 'Pass' | 'Fail' | 'Pending Review';
  testValue: string;
  acceptanceCriteria: string;
  passed: boolean;
  isMandatory: boolean;
  engineerApproval: boolean;
  approvedBy?: string;
  evidencePhotoIds: string[];
  ncrNumber?: string;
  ncrStatus?: 'Open' | 'Under Rectification' | 'Resolved' | 'Closed';
  correctiveAction?: string;
  notes?: string;
  testedAt: string;
}

export interface Complaint {
  id: string;
  buildingId: string;
  buildingName?: string;
  complaintReference: string;
  category: 'Water Leakage / Dampness' | 'Crack in Wall or Slab' | 'Spalling Concrete' | 'Door / Window Damage' | 'Tile Debonding' | 'Structural Concern';
  description: string;
  locationDescription: string;
  floorOrRoom?: string;
  photoIds: string[];
  submittedAt: string;
  status: 'Submitted' | 'Acknowledged' | 'Triaged' | 'Converted to Defect' | 'Resolved';
  contactDetails?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  linkedDefectId?: string;
  assignedWorkOrderId?: string;
  triageNotes?: string;
}

export interface Sensor {
  id: string;
  buildingId: string;
  buildingName?: string;
  elementId: string;
  elementName?: string;
  sensorType: 'Crack Meter' | 'Tiltmeter' | 'Settlement Marker' | 'Moisture Sensor' | 'Corrosion Probe' | 'Vibration Accelerometer';
  unit: string;
  thresholdHigh: number;
  thresholdLow?: number;
  rateOfChangeThreshold?: number;
  installationDate: string;
  status: 'Normal' | 'Warning' | 'Alarm' | 'Stale / Offline';
  lastReadingValue: number;
  lastReadingTime: string;
  isAcknowledged: boolean;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  timestamp: string;
  value: number;
  qualityStatus: 'GOOD' | 'QUESTIONABLE' | 'DEGRADED';
  anomalyStatus: 'NORMAL' | 'ANOMALY_HIGH' | 'ANOMALY_RATE';
}

export interface BuildingDocument {
  id: string;
  buildingId: string;
  elementId?: string;
  category: 'Structural Drawings' | 'Inspection Reports' | 'NDT Diagnostic Reports' | 'Material Test Certificates' | 'Handover Documents' | 'Repair Logs';
  fileName: string;
  fileSize: string;
  storagePath: string;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
  description: string;
}

export interface Notification {
  id: string;
  recipientRole?: Role | 'ALL';
  type: 'P1_DEFECT' | 'SENSOR_ALARM' | 'OCCUPANT_COMPLAINT' | 'FAILED_TEST_NCR' | 'OVERDUE_INSPECTION' | 'WORK_SUBMITTED' | 'REPAIR_REJECTED' | 'BUDGET_APPROVAL';
  title: string;
  message: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  relatedBuildingId?: string;
  relatedBuildingName?: string;
  relatedRecordId?: string;
  relatedRoute?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  entityType: 'DEFECT' | 'INSPECTION' | 'WORK_ORDER' | 'BCI_CALCULATION' | 'QUALITY_CHECK' | 'MAINTENANCE_PLAN' | 'SYSTEM_SETTING';
  entityId: string;
  timestamp: string;
  beforeSummary?: string;
  afterSummary?: string;
  reason?: string;
}

export interface AIAnalysisResult {
  defectType: string;
  subtype: string;
  visibleEvidence: string;
  boundingBoxNormalized?: { ymin: number; xmin: number; ymax: number; xmax: number };
  approximateRegion: string;
  severityGradeProvisional: number;
  confidence: number;
  estimatedDimensions: string | null;
  measurementMethod: string;
  structuralSignificanceProvisional: StructuralClass;
  recommendedNextStep: string;
  engineerVerificationRequired: boolean;
  limitations: string;
  qualityAssessment: {
    blur: boolean;
    poorLighting: boolean;
    missingScaleReference: boolean;
    adequateQuality: boolean;
    recommendation: string;
  };
}

export interface ModelRegistryItem {
  id: string;
  name: string;
  version: string;
  supportedModalities: string[];
  supportedDefectClasses: string[];
  deploymentStatus: 'Operational' | 'Adapter Ready' | 'Pipeline Integration';
  evaluationMetrics: {
    mAP50?: number;
    f1Score?: number;
    inferenceTimeMs?: number;
  };
  framework: string;
  datasetVersion: string;
  lastValidationDate: string;
  notes: string;
}

export interface MaintenancePlan {
  id: string;
  year: number;
  divisionId: string;
  divisionName: string;
  availableBudgetINR: number;
  selectedWorkOrderIds: string[];
  deferredWorkOrderIds: string[];
  mandatorySafetyWorkOrderIds: string[];
  projectedRiskReductionPercent: number;
  estimatedTotalCostINR: number;
  unmetSafetyBudgetINR: number;
  status: 'DRAFT' | 'OPTIMIZED' | 'APPROVED';
  createdBy: string;
  createdAt: string;
}

export interface SystemConfig {
  bciFormula: {
    baseScore: number;
    severityWeights: { [grade: number]: number };
    criticalityWeights: { [criticality: number]: number };
    elementClassMultiplier: {
      PRIMARY: number;
      SECONDARY: number;
      NON_STRUCTURAL: number;
    };
  };
  riskEngine: {
    sWeight: number;
    cWeight: number;
    pWeight: number;
    eWeight: number;
    divisor: number;
    p1Threshold: number;
    p2Threshold: number;
    p3Threshold: number;
  };
  crackWidthThresholdsMm: {
    grade1Max: number;
    grade2Max: number;
    grade3Max: number;
    grade4Max: number;
  };
}
