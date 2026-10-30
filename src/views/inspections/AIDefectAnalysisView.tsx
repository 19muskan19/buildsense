import React, { useState } from 'react';
import { 
  Cpu, 
  Upload, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  Info, 
  FileCheck2, 
  Sparkles,
  Maximize2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { analyzeDefectWithAI } from '../../services/api';
import { AIAnalysisResult } from '../../types';
import { PriorityBadge, ConditionBadge } from '../../components/common/Badges';

const SAMPLE_INSPECTION_PHOTOS = [
  {
    label: '45° Diagonal Shear Crack on Primary Column (Scenario A)',
    url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=1000&q=80',
    elementType: 'Column',
    structuralClass: 'PRIMARY',
    defectHint: 'SHEAR CRACK',
    description: 'Distinct inclined 45-degree diagonal fracture with secondary stress micro-cracks'
  },
  {
    label: 'Exposed Rebar Corrosion & Concrete Spall Pocket',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1000&q=80',
    elementType: 'Column',
    structuralClass: 'PRIMARY',
    defectHint: 'REBAR SPALL',
    description: 'Concrete cover delamination exposing corroded longitudinal reinforcement'
  },
  {
    label: 'Terrace Roof Seepage & Efflorescence Salts (Scenario B)',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
    elementType: 'Roof/Terrace',
    structuralClass: 'SECONDARY',
    defectHint: 'WATER SEEPAGE',
    description: 'Dark water ponding contouring and white crystalline efflorescence leaching'
  },
  {
    label: 'Slab Soffit Flexural Tension Crack (Scenario D)',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    elementType: 'Structural Slab',
    structuralClass: 'PRIMARY',
    defectHint: 'FLEXURAL CRACK',
    description: 'Transverse tensile cracking on reinforced slab underside with optical comparator'
  },
  {
    label: 'Construction Honeycombing at Column Base Void',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80',
    elementType: 'Column',
    structuralClass: 'PRIMARY',
    defectHint: 'HONEYCOMBING',
    description: 'Inadequate vibrator compaction leaving exposed aggregate voids without mortar matrix'
  },
  {
    label: 'Differential Settlement Stepped Crack in Masonry',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    elementType: 'Masonry Wall',
    structuralClass: 'SECONDARY',
    defectHint: 'SETTLEMENT',
    description: 'Stepped diagonal fracture tracing mortar bed joints under foundation movement'
  },
  {
    label: 'External Parapet Delamination & Surface Debonding',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1000&q=80',
    elementType: 'Masonry Wall',
    structuralClass: 'NON_STRUCTURAL',
    defectHint: 'PLASTER SPALL',
    description: 'Flaking and debonded lime rendering with surface efflorescence deposits'
  },
  {
    label: 'Basement Retaining Wall Water Infiltration',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
    elementType: 'Shear Wall',
    structuralClass: 'PRIMARY',
    defectHint: 'MOISTURE INGRESS',
    description: 'High pressure hydrostatic water penetration along cold construction joint'
  }
];

export const AIDefectAnalysisView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { buildings, elements, createDefect } = useData();
  const { currentUser, canVerifyDefect } = useAuth();

  const [selectedBuildingId, setSelectedBuildingId] = useState(buildings[0]?.id || 'bld-001');
  const [selectedElementId, setSelectedElementId] = useState(elements[0]?.id || 'elem-001');
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_INSPECTION_PHOTOS[0].url);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [hasScaleMarker, setHasScaleMarker] = useState(true);
  const [engineerInspectionNotes, setEngineerInspectionNotes] = useState('Optical crack ruler placed adjacent to crack origin.');

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isLiveVisionModel, setIsLiveVisionModel] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Verification Form State
  const [verifyGrade, setVerifyGrade] = useState<number>(5);
  const [verifyNotes, setVerifyNotes] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const bldElements = elements.filter((e) => e.buildingId === selectedBuildingId);
  const currentElement = elements.find((e) => e.id === selectedElementId) || bldElements[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoBase64(reader.result as string);
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof SAMPLE_INSPECTION_PHOTOS[0]) => {
    setPhotoUrl(sample.url);
    setPhotoBase64(null);
  };

  const handleRunAIAnalysis = async () => {
    setAnalyzing(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const res = await analyzeDefectWithAI({
        imageBase64: photoBase64 || undefined,
        imageUrl: photoUrl,
        metadata: {
          buildingId: selectedBuildingId,
          elementId: selectedElementId,
          elementType: currentElement?.elementType || 'Column',
          structuralClass: currentElement?.structuralClass || 'PRIMARY',
          hasScaleMarker,
          engineerNotes: engineerInspectionNotes
        }
      });

      if (res.success && res.data) {
        setAnalysisResult(res.data);
        setIsLiveVisionModel(Boolean(res.isLiveModel));
        setVerifyGrade(res.data.severityGradeProvisional || 4);
        setVerifyNotes(`Verified on-site. AI identified ${res.data.subtype}. Recommended next step: ${res.data.recommendedNextStep}`);
      } else {
        setErrorMsg('Failed to parse AI analysis response.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing AI model analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveDefectRecord = async (verified: boolean) => {
    if (!analysisResult) return;

    const S = verified ? verifyGrade : analysisResult.severityGradeProvisional;
    const C = currentElement?.criticality || 5;
    const P = 4;
    const E = 5;

    await createDefect({
      buildingId: selectedBuildingId,
      elementId: selectedElementId,
      elementCode: currentElement?.elementCode || 'GF-COL-A04',
      elementType: currentElement?.elementType || 'Column',
      type: analysisResult.defectType as any,
      subtype: analysisResult.subtype,
      structuralSignificance: currentElement?.structuralClass || 'PRIMARY',
      description: analysisResult.visibleEvidence,
      severityGrade: S,
      aiConfidence: analysisResult.confidence,
      aiExplanation: `Vision Analysis: ${analysisResult.visibleEvidence}`,
      engineerVerified: verified,
      engineerGrade: verified ? S : undefined,
      engineerNotes: verified ? verifyNotes : undefined,
      imageIds: [photoUrl],
      riskFactors: { S, C, P, E },
      dimensions: analysisResult.estimatedDimensions || undefined,
      recommendedNextStep: analysisResult.recommendedNextStep
    });

    setSaveSuccess(true);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-50 text-indigo-600">
              <Cpu className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              AI-Powered Multimodal Defect Analysis
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Multimodal visual defect inspection, severity grading, and certified engineer verification
          </p>
        </div>
      </div>

      {/* Main Analysis Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Metadata Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">1. Capture or Select Defect Photograph</h3>

            {/* Image Preview Box */}
            <div className="relative h-64 bg-slate-900 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
              <img
                src={photoUrl}
                alt="Defect Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                RGB 2D Field Image
              </div>
            </div>

            {/* Sample Selector Buttons */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Quick Demonstration Images:
              </span>
              <div className="space-y-1.5">
                {SAMPLE_INSPECTION_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className={`w-full text-left p-2 rounded-lg border text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      photoUrl === sample.url
                        ? 'bg-blue-50 border-blue-300 font-bold text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{sample.label}</span>
                    <span className="text-[10px] uppercase font-mono text-slate-400">{sample.defectHint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Photo Upload */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Or Upload from Device / Camera:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Element Metadata Context Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">2. Element Context & Calibration Reference</h3>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Building</label>
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.buildingCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Element</label>
              <select
                value={selectedElementId}
                onChange={(e) => setSelectedElementId(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
              >
                {bldElements.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.elementCode} - {el.elementType} ({el.structuralClass})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="scaleCheck"
                checked={hasScaleMarker}
                onChange={(e) => setHasScaleMarker(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="scaleCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Optical crack gauge / scale reference present in image
              </label>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Inspector Notes</label>
              <textarea
                rows={2}
                value={engineerInspectionNotes}
                onChange={(e) => setEngineerInspectionNotes(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>

            <button
              onClick={handleRunAIAnalysis}
              disabled={analyzing}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Analysis...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Run Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Provisional Findings & Engineer Verification (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Defect record saved successfully to the state database.
              </span>
              <button
                onClick={() => onNavigate('/defects')}
                className="text-emerald-700 underline font-semibold cursor-pointer"
              >
                View in Defect Register →
              </button>
            </div>
          )}

          {!analysisResult && !analyzing && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs text-slate-400 space-y-3">
              <Cpu className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 text-sm">Awaiting AI Analysis</h3>
              <p className="text-xs max-w-md mx-auto text-slate-500">
                Select or upload a defect photograph on the left and click "Run Analysis" to detect crack morphology, spalling, and moisture distress.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
              <h3 className="font-bold text-slate-800 text-sm">Processing Photograph with Vision Diagnostic Engine</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Analyzing visual defect evidence, estimating severity grade, inspecting for scale markers, and generating engineering recommendations...
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4">
              {/* Provisional Findings Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-purple-50 text-purple-600">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Provisional AI Assessment
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {isLiveVisionModel ? '✓ Automated Neural Vision Model Inference' : 'Domain-Verified Diagnostic Engine Fallback'}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                    Confidence: {(analysisResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Classification Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Defect Type</span>
                    <strong className="text-slate-900">{analysisResult.defectType}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Subtype</span>
                    <strong className="text-slate-900">{analysisResult.subtype}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Provisional Severity</span>
                    <strong className="text-rose-600">Grade {analysisResult.severityGradeProvisional} / 5</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Structural Class</span>
                    <strong className="text-indigo-600">{analysisResult.structuralSignificanceProvisional}</strong>
                  </div>
                </div>

                {/* Visible Evidence & Findings */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Visible Evidence Detected:</span>
                    <p className="text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed">
                      {analysisResult.visibleEvidence}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="font-bold text-slate-700 block mb-0.5">Estimated Dimensions:</span>
                      <p className="text-slate-600">
                        {analysisResult.estimatedDimensions || 'Measurement required (no physical scale calibrated)'}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="font-bold text-slate-700 block mb-0.5">Measurement Method:</span>
                      <p className="text-slate-600">{analysisResult.measurementMethod}</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Recommended Next Action:</span>
                    <p className="text-slate-800 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 font-medium">
                      {analysisResult.recommendedNextStep}
                    </p>
                  </div>

                  {/* Anti-Slop Disclaimer required by Section 9 */}
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Engineering Limitation:</strong> {analysisResult.limitations}
                    </div>
                  </div>
                </div>
              </div>

              {/* Engineer Verification Panel (Section 9) */}
              <div className="bg-white rounded-2xl border-2 border-blue-300 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        3. Qualified Engineer Verification (Section 9 & 12)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Mandatory verification rule: AI findings must never automatically authorize structural decisions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Certified Engineer Severity Grade (1 - 5)
                    </label>
                    <select
                      value={verifyGrade}
                      onChange={(e) => setVerifyGrade(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                    >
                      <option value={1}>Grade 1 - Good / Negligible (Monitor)</option>
                      <option value={2}>Grade 2 - Minor (Routine maintenance)</option>
                      <option value={3}>Grade 3 - Moderate (Planned repair in 90 days)</option>
                      <option value={4}>Grade 4 - Severe (Urgent engineer review &lt;30 days)</option>
                      <option value={5}>Grade 5 - Critical (Immediate P1 escalation &lt;24-72h)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Verifying Engineer</label>
                    <input
                      type="text"
                      disabled
                      value={`${currentUser.name} (${currentUser.roleTitle})`}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-slate-100 text-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">
                    Engineer Verification Findings & Propping Instructions *
                  </label>
                  <textarea
                    rows={2}
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    placeholder="Enter on-site physical verification notes, crack gauge measurement, and immediate safety measures..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleSaveDefectRecord(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    Save as Provisional AI Draft
                  </button>

                  <button
                    onClick={() => handleSaveDefectRecord(true)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Certify & Save Verified Defect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
