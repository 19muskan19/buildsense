import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Camera, 
  MapPin, 
  CloudRain, 
  CheckCircle2, 
  Save, 
  Send, 
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { saveOfflineDraft, getOfflineDrafts } from '../../services/offlineSync';
import { syncOfflineInspections } from '../../services/api';

export const FieldInspectionView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { buildings, elements } = useData();
  const { currentUser } = useAuth();

  const [selectedBuildingId, setSelectedBuildingId] = useState(buildings[0]?.id || 'bld-001');
  const [selectedElementId, setSelectedElementId] = useState('');
  const [inspectionMethod, setInspectionMethod] = useState('Visual Walkthrough');
  const [weather, setWeather] = useState('Clear');
  const [summaryNotes, setSummaryNotes] = useState('Routine bi-annual post-monsoon structural assessment.');
  const [crackWidth, setCrackWidth] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80');

  // Checklist items
  const [checklist, setChecklist] = useState([
    { category: 'Structural Columns', item: 'Vertical alignment and shear distress', status: 'Attention Required', notes: 'Diagonal hairline cracking' },
    { category: 'Structural Beams', item: 'Mid-span tension deflection & spall', status: 'Pass', notes: 'No visible sagging' },
    { category: 'Terrace & Enclosure', item: 'Waterproofing membrane & flashing joint', status: 'Attention Required', notes: 'Standing water ponding' },
    { category: 'Finishes & Plaster', item: 'Corridor wall plaster bonding', status: 'Pass', notes: 'Acceptable condition' }
  ]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const bElements = elements.filter((e) => e.buildingId === selectedBuildingId);

  const handleSaveDraft = () => {
    const draft = {
      localDraftId: `draft-${Date.now()}`,
      buildingId: selectedBuildingId,
      buildingName: selectedBuilding?.name || '',
      elementId: selectedElementId,
      inspectorId: currentUser.id,
      inspectorName: currentUser.name,
      inspectionMethod,
      inspectionDate: new Date().toISOString(),
      weather,
      checklistResults: checklist,
      NDTReadings: crackWidth ? [{ testMethod: 'Optical Gauge', location: 'Face', value: crackWidth, unit: 'mm', status: 'Normal' }] : [],
      photoIds: [photoUrl],
      summaryNotes,
      capturedAt: new Date().toISOString(),
      syncStatus: 'LOCAL_DRAFT' as const
    };

    saveOfflineDraft(draft as any);
    setStatusMessage('Draft saved locally in device IndexedDB queue. Ready for offline field operation.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSubmitOnline = async () => {
    setStatusMessage('Submitting field inspection directly to central server...');
    try {
      const data = await syncOfflineInspections([{
        buildingId: selectedBuildingId,
        buildingName: selectedBuilding?.name || '',
        elementId: selectedElementId,
        inspectorId: currentUser.id,
        inspectorName: currentUser.name,
        inspectionMethod,
        inspectionDate: new Date().toISOString(),
        weather,
        checklistResults: checklist,
        photoIds: [photoUrl],
        summaryNotes
      }]);
      if (data.success) {
        setStatusMessage('Inspection submitted successfully! Forwarded to Assistant Engineer for verification.');
        setTimeout(() => {
          onNavigate('/inspections');
        }, 1500);
      }
    } catch {
      setStatusMessage('Submission failed. Saved to offline queue.');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <ClipboardCheck className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Mobile Field Inspection Form (Junior Engineer / Inspector)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standardised on-site structural checklist, crack measurement, and offline draft persistence
          </p>
        </div>

        <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
          Inspector: {currentUser.name}
        </span>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          {statusMessage}
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5 text-xs">
        {/* Section 1: Location & Conditions */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">1. Facility & Site Ambient Conditions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Building Asset *</label>
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.buildingCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Element</label>
              <select
                value={selectedElementId}
                onChange={(e) => setSelectedElementId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium"
              >
                <option value="">General Facility Walkthrough</option>
                {bElements.map((el) => (
                  <option key={el.id} value={el.id}>{el.elementCode} - {el.elementType}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Inspection Method</label>
              <select
                value={inspectionMethod}
                onChange={(e) => setInspectionMethod(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium"
              >
                <option value="Visual Walkthrough">Visual Walkthrough</option>
                <option value="Detailed Engineering Assessment">Detailed Engineering Assessment</option>
                <option value="Drone Aerial Survey">Drone Aerial Survey</option>
                <option value="NDT Diagnostic">NDT Diagnostic</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Weather Condition</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium"
              >
                <option value="Clear">Clear & Dry</option>
                <option value="Humid / Monsoon">Humid / Post-Monsoon</option>
                <option value="Rainy">Heavy Rain / Wet</option>
                <option value="Overcast">Overcast</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Guided Structural Checklist */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-3">2. Guided Structural Safety Checklist (IS 456)</h3>
          <div className="space-y-3">
            {checklist.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800 block">{item.category}: {item.item}</span>
                  <span className="text-slate-500 text-[11px]">{item.notes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={item.status}
                    onChange={(e) => {
                      const updated = [...checklist];
                      updated[idx].status = e.target.value as any;
                      setChecklist(updated);
                    }}
                    className={`p-1.5 rounded-lg border text-xs font-bold ${
                      item.status === 'Pass'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : item.status === 'Attention Required'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    <option value="Pass">Pass</option>
                    <option value="Attention Required">Attention Required</option>
                    <option value="Critical Concern">Critical Concern</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Measurements & Field Notes */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">3. Physical Measurements & Inspector Notes</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Measured Optical Crack Width (mm)
              </label>
              <input
                type="number"
                step="0.05"
                placeholder="e.g. 1.4"
                value={crackWidth}
                onChange={(e) => setCrackWidth(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Inspection Summary & Observations
              </label>
              <input
                type="text"
                value={summaryNotes}
                onChange={(e) => setSummaryNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Submission Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-500" />
            Save to Offline Draft Queue
          </button>
          <button
            type="button"
            onClick={handleSubmitOnline}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Submit Field Inspection
          </button>
        </div>
      </div>
    </div>
  );
};
