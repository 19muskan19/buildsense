import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Building, Defect, WorkOrder, Inspection, QualityCheck, AuditEvent, MaintenancePlan } from '../types';

export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 1. Building Condition Report PDF
export function generateBuildingConditionReportPDF(building: Building, defects: Defect[], elements: any[]): void {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('BUILDSENSE', 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('AI-Enabled Building Health & Condition Monitoring System | Apex Infrastructure Group', 14, 26);

  // Document Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE BUILDING CONDITION PASSPORT', 14, 46);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Ref: BCI-REP-${building.buildingCode}-${Date.now().toString().slice(-4)}`, 14, 52);
  doc.text(`Generated On: ${new Date().toLocaleDateString('en-IN')} | Certified Verification Copy`, 14, 57);

  // Building Summary Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 62, 182, 44, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 62, 182, 44, 2, 2, 'S');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(building.name, 18, 70);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Code: ${building.buildingCode} | Department: ${building.department}`, 18, 76);
  doc.text(`Address: ${building.address}, ${building.district}`, 18, 82);
  doc.text(`Built: ${building.yearBuilt} (${new Date().getFullYear() - building.yearBuilt} yrs) | Floors: ${building.numberOfFloors} | Type: ${building.buildingType}`, 18, 88);
  doc.text(`Structural System: ${building.structuralSystem} | Occupancy: ${building.occupancyType}`, 18, 94);
  doc.text(`Status: ${building.status} | Criticality Rating: ${building.criticality}/5`, 18, 100);

  // BCI Score Badge
  const bci = building.currentBCI;
  const badgeR = bci >= 85 ? 16 : bci >= 70 ? 59 : bci >= 50 ? 245 : 225;
  const badgeG = bci >= 85 ? 185 : bci >= 70 ? 130 : bci >= 50 ? 158 : 29;
  const badgeB = bci >= 85 ? 129 : bci >= 70 ? 246 : bci >= 50 ? 11 : 72;
  doc.setFillColor(badgeR, badgeG, badgeB);
  doc.roundedRect(145, 66, 45, 28, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL BCI INDEX', 148, 73);
  doc.setFontSize(18);
  doc.text(`${bci} / 100`, 148, 83);
  doc.setFontSize(9);
  doc.text(`Band: ${building.conditionBand}`, 148, 90);

  // Defect Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Identified Structural & Enclosure Defect Register', 14, 116);

  const defectRows = defects.map((d) => [
    d.elementCode || 'ELEM',
    d.type,
    d.subtype,
    `Grade ${d.severityGrade}`,
    d.priorityBand,
    `${d.riskScore}/100`,
    d.engineerVerified ? 'Verified' : 'Provisional AI',
    d.status
  ]);

  autoTable(doc, {
    startY: 120,
    head: [['Element', 'Category', 'Subtype', 'Severity', 'Priority', 'Risk', 'Status', 'Workflow']],
    body: defectRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 180;

  // Disclaimer and Structural Verification Signature
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DISCLAIMER: AI Studio BuildSense assessments remain provisional until verified on-site by certified structural engineers.', 14, finalY + 12);
  doc.text('This digital report forms part of the Corporate Structural Asset Register pursuant to Enterprise Facilities Protocol.', 14, finalY + 17);

  doc.setDrawColor(203, 213, 225);
  doc.line(14, finalY + 30, 80, finalY + 30);
  doc.line(130, finalY + 30, 196, finalY + 30);
  doc.text('Er. Nathan Brooks, PE (Inspection Lead)', 14, finalY + 35);
  doc.text('Er. Marcus Vance, PE (Countersigned)', 130, finalY + 35);

  doc.save(`BuildSense_Condition_Report_${building.buildingCode}.pdf`);
}

// 2. Defect Register Export PDF
export function generateDefectRegisterPDF(defects: Defect[]): void {
  const doc = new jsPDF('landscape');

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BUILDSENSE - PORTFOLIO DEFECT REGISTER', 14, 15);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | Records: ${defects.length}`, 200, 15);

  const rows = defects.map((d) => [
    d.buildingName || d.buildingId,
    d.elementCode || 'REF',
    d.type,
    d.subtype,
    `G${d.severityGrade}`,
    `C${d.riskFactors?.C || 3}`,
    `${d.riskScore}`,
    d.priorityBand + (d.isP1Override ? ' (OVR)' : ''),
    d.engineerVerified ? 'Verified' : 'Provisional',
    d.status,
    d.recommendedNextStep || ''
  ]);

  autoTable(doc, {
    startY: 30,
    head: [['Building', 'Element', 'Type', 'Subtype', 'Sev', 'Crit', 'Risk', 'Band', 'Engr Ver', 'Status', 'Recommended Action']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 }
  });

  doc.save(`BuildSense_Defect_Register_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// 3. Work Orders Report PDF
export function generateWorkOrdersReportPDF(workOrders: WorkOrder[]): void {
  const doc = new jsPDF('landscape');

  doc.setFillColor(30, 58, 138); // blue-900
  doc.rect(0, 0, 297, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BUILDSENSE - RECTIFICATION WORK-ORDER REPORT', 14, 15);

  const rows = workOrders.map((w) => [
    w.workOrderNumber,
    w.buildingName || w.buildingId,
    w.title,
    w.contractorName,
    `INR ${w.approvedBudgetINR.toLocaleString('en-IN')}`,
    w.priorityBand,
    `${w.progressPercent}%`,
    w.status,
    new Date(w.dueDate).toLocaleDateString('en-IN')
  ]);

  autoTable(doc, {
    startY: 30,
    head: [['WO Number', 'Building', 'Title', 'Contractor', 'Budget (INR)', 'Priority', 'Progress', 'Status', 'Due Date']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], fontSize: 8 },
    styles: { fontSize: 8 }
  });

  doc.save(`BuildSense_Work_Orders_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// 4. Annual Maintenance Plan PDF
export function generateAnnualMaintenancePlanPDF(plan: MaintenancePlan, workOrders: WorkOrder[]): void {
  const doc = new jsPDF();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BUILDSENSE - ANNUAL MAINTENANCE PLAN', 14, 16);
  doc.setFontSize(9);
  doc.text(`Fiscal Year: ${plan.year} | Division: ${plan.divisionName}`, 14, 23);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Budget Allocation: INR ${plan.availableBudgetINR.toLocaleString('en-IN')}`, 14, 40);
  doc.text(`Estimated Total Cost: INR ${plan.estimatedTotalCostINR.toLocaleString('en-IN')}`, 14, 46);
  doc.text(`Projected Risk Reduction: ${plan.projectedRiskReductionPercent}%`, 14, 52);
  if (plan.unmetSafetyBudgetINR > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text(`MANDATORY SAFETY FUNDING DEFICIT: INR ${plan.unmetSafetyBudgetINR.toLocaleString('en-IN')}`, 14, 58);
  }

  const selectedWOs = workOrders.filter((w) => plan.selectedWorkOrderIds.includes(w.id));
  const rows = selectedWOs.map((w) => [
    w.workOrderNumber,
    w.buildingName || '',
    w.title,
    w.priorityBand,
    `INR ${w.estimatedCostINR.toLocaleString('en-IN')}`
  ]);

  autoTable(doc, {
    startY: 66,
    head: [['WO Number', 'Building', 'Scope of Works', 'Priority', 'Cost (INR)']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    styles: { fontSize: 8 }
  });

  doc.save(`BuildSense_Annual_Maintenance_Plan_${plan.year}.pdf`);
}
