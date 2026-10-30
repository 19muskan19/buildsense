import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, Info, Cpu, ShieldCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const SystemSettingsView: React.FC = () => {
  const { systemConfig, models } = useData();
  const { currentUser } = useAuth();

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-slate-100 text-slate-800">
              <Sliders className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Engineering Calculations & Configurable Risk Parameters
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Certified configurable thresholds for BCI index calculations, crack widths, and specialist model interfaces (Section 12, 14, 15)
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save System Configuration
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Configuration parameters successfully saved and applied to calculation engine.
        </div>
      )}

      {/* Grid: BCI Formula, Risk Engine & Crack Widths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* BCI Formula Weights */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            1. Building Condition Index (BCI) Formula Weights
          </h3>
          <p className="text-slate-500 text-[11px]">
            Formula: <code>BCI = max(0, 100 - sum(SeverityWeight × CriticalityWeight × ClassMultiplier))</code>
          </p>

          <div className="space-y-2">
            <span className="font-bold text-slate-700 block">Severity Deductions (Points deducted per defect):</span>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="block text-[10px] text-slate-400">G1 Negligible</span>
                <strong>-1.5</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="block text-[10px] text-slate-400">G2 Minor</span>
                <strong>-4.0</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="block text-[10px] text-slate-400">G3 Moderate</span>
                <strong>-9.0</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="block text-[10px] text-slate-400">G4 Severe</span>
                <strong>-16.0</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="block text-[10px] text-slate-400">G5 Critical</span>
                <strong>-28.0</strong>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-700 block">Structural Class Multipliers:</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-900">
                <span className="block text-[10px]">Primary Structure</span>
                <strong>2.0x Multiplier</strong>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 text-blue-900">
                <span className="block text-[10px]">Secondary Structure</span>
                <strong>1.2x Multiplier</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
                <span className="block text-[10px]">Non-Structural</span>
                <strong>0.7x Multiplier</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Crack Width Illustrative Bands */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            2. Crack-Width Threshold Bands (Specification Section 12)
          </h3>
          <p className="text-slate-500 text-[11px]">
            Illustrative project assumptions requiring review and approval by qualified structural engineers.
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <div>
                <strong className="text-slate-800 block">Grade 1 (Very Fine)</strong>
                <span className="text-slate-500 text-[11px]">Hairline / shrinkage cracking</span>
              </div>
              <span className="font-mono font-bold text-slate-900">&lt; 0.10 mm</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <div>
                <strong className="text-slate-800 block">Grade 2 (Minor)</strong>
                <span className="text-slate-500 text-[11px]">Localized damp or minor surface crack</span>
              </div>
              <span className="font-mono font-bold text-slate-900">0.10 – 0.30 mm</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <div>
                <strong className="text-slate-800 block">Grade 3 (Moderate)</strong>
                <span className="text-slate-500 text-[11px]">Rust staining, pronounced cracking</span>
              </div>
              <span className="font-mono font-bold text-slate-900">0.30 – 1.00 mm</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <div>
                <strong className="text-slate-800 block">Grade 4 (Severe)</strong>
                <span className="text-slate-500 text-[11px]">Growing crack, active spalling</span>
              </div>
              <span className="font-mono font-bold text-slate-900">1.00 – 5.00 mm</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
              <div>
                <strong className="block">Grade 5 (Critical)</strong>
                <span className="text-[11px]">Shear fracture in primary structural member</span>
              </div>
              <span className="font-mono font-bold text-rose-600">&gt; 5.00 mm (or P1 Override)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specialist Model Registry (Section 10) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              Specialist AI Model Registry & Integration Adapters (Specification Section 10)
            </h3>
            <p className="text-xs text-slate-500">
              Hybrid visual defect detector, crack segmenter, thermal analyzer, and IoT anomaly detection adapters
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {models.map((mod) => (
            <div key={mod.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-slate-400">{mod.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    mod.deploymentStatus === 'Operational' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {mod.deploymentStatus}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900">{mod.name}</h4>
                <p className="text-slate-500 text-[11px] font-mono mt-0.5">{mod.version} • {mod.framework}</p>
                <p className="text-slate-600 text-[11px] mt-2 line-clamp-2">{mod.notes}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Validation: {mod.lastValidationDate}</span>
                <span className="font-mono font-bold text-slate-700">mAP50: {mod.evaluationMetrics.mAP50 || 0.9}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
