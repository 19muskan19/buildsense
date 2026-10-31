import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Building2, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  ShieldCheck, 
  Layers, 
  PieChart, 
  BarChart3,
  Filter,
  Download,
  Calendar
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatCard } from '../../components/common/StatCard';
import { ConditionBadge, PriorityBadge } from '../../components/common/Badges';
import { generateDefectRegisterPDF } from '../../services/exportService';

interface StateDashboardViewProps {
  onOpenPassport: (buildingId: string) => void;
  onNavigate: (route: string) => void;
}

export const StateDashboardView: React.FC<StateDashboardViewProps> = ({ onOpenPassport, onNavigate }) => {
  const { buildings, divisions, defects, workOrders, qualityChecks } = useData();

  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>('ALL');
  const [selectedBandFilter, setSelectedBandFilter] = useState<string>('ALL');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const filteredBuildings = buildings.filter((b) => {
    if (selectedDivisionFilter !== 'ALL' && b.divisionId !== selectedDivisionFilter) return false;
    if (selectedBandFilter !== 'ALL' && b.conditionBand !== selectedBandFilter) return false;
    return true;
  });

  const totalRegistered = buildings.length;
  const inspectedCount = buildings.filter((b) => b.lastInspectionAt).length;
  const avgBCI = Math.round(buildings.reduce((acc, b) => acc + b.currentBCI, 0) / (totalRegistered || 1));
  const criticalDefects = defects.filter((d) => d.priorityBand === 'P1');
  const overdueWOs = workOrders.filter((w) => new Date(w.dueDate) < new Date() && w.status !== 'VERIFIED');

  // Condition band distribution
  const bandCounts = {
    Good: buildings.filter((b) => b.conditionBand === 'Good').length,
    Fair: buildings.filter((b) => b.conditionBand === 'Fair').length,
    Poor: buildings.filter((b) => b.conditionBand === 'Poor').length,
    'Very Poor': buildings.filter((b) => b.conditionBand === 'Very Poor').length,
    Critical: buildings.filter((b) => b.conditionBand === 'Critical').length
  };

  // Priority bands distribution
  const pCounts = {
    P1: defects.filter((d) => d.priorityBand === 'P1').length,
    P2: defects.filter((d) => d.priorityBand === 'P2').length,
    P3: defects.filter((d) => d.priorityBand === 'P3').length,
    P4: defects.filter((d) => d.priorityBand === 'P4').length
  };

  // Total budget vs planned spend
  const totalBudgetINR = 18500000; // 1.85 Cr INR statewide allocation
  const plannedSpendINR = workOrders.reduce((sum, w) => sum + w.approvedBudgetINR, 0);

  // Setup Leaflet map for Assam
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Assam (Guwahati ~ 26.15, 92.5)
      const map = L.map(mapContainerRef.current).setView([26.2, 92.8], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for filtered buildings
    filteredBuildings.forEach((b) => {
      const color =
        b.conditionBand === 'Good'
          ? '#10b981'
          : b.conditionBand === 'Fair'
          ? '#3b82f6'
          : b.conditionBand === 'Poor'
          ? '#f59e0b'
          : b.conditionBand === 'Very Poor'
          ? '#f97316'
          : '#ef4444';

      const marker = L.circleMarker([b.latitude, b.longitude], {
        radius: 8,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; min-width: 180px;">
          <strong style="color: #0f172a; font-size: 13px;">${b.name}</strong><br/>
          <span style="color: #64748b;">${b.district} • ${b.buildingType}</span>
          <div style="margin-top: 6px; padding: 4px; background: #f8fafc; border-radius: 4px;">
            <strong>BCI: ${b.currentBCI}/100</strong> (${b.conditionBand})<br/>
            <span>Built: ${b.yearBuilt} • Floors: ${b.numberOfFloors}</span>
          </div>
        </div>
      `);
    });

    return () => {
      // Keep map instance alive
    };
  }, [filteredBuildings]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-100 text-blue-700">
              <LayoutDashboardIcon className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Enterprise Portfolio Executive Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated structural condition health index, risk distributions, and district comparisons (Apex Infrastructure Group)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => generateDefectRegisterPDF(defects)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Portfolio Register (PDF)
          </button>
          <button
            onClick={() => onNavigate('/annual-plan')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-xs"
          >
            <DollarSign className="w-4 h-4" />
            Annual Maintenance Plan
          </button>
        </div>
      </div>

      {/* Statewide Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="State Asset Inventory"
          value={totalRegistered}
          subtitle={`${inspectedCount} Inspected (91% Compliance)`}
          icon={Building2}
          colorScheme="blue"
        />
        <StatCard
          title="Verified State BCI"
          value={`${avgBCI} / 100`}
          subtitle="Portfolio Weighted Condition Band: Fair"
          icon={TrendingUp}
          colorScheme="indigo"
        />
        <StatCard
          title="Critical P1 Findings"
          value={criticalDefects.length}
          subtitle="Emergency response protocol active"
          icon={AlertTriangle}
          colorScheme="rose"
        />
        <StatCard
          title="Maintenance Budget Planned"
          value={`₹${(plannedSpendINR / 100000).toFixed(1)}L`}
          subtitle={`₹${(totalBudgetINR / 100000).toFixed(1)}L State Sanctioned`}
          icon={DollarSign}
          colorScheme="emerald"
        />
      </div>

      {/* Interactive Assam Map & Condition Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                Assam Division Asset Condition Map
              </h3>
              <p className="text-xs text-slate-500">
                Leaflet GIS mapping with verified BCI condition band color markers
              </p>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedDivisionFilter}
                onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium w-full sm:w-auto max-w-full"
              >
                <option value="ALL">All Divisions</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                value={selectedBandFilter}
                onChange={(e) => setSelectedBandFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium w-full sm:w-auto max-w-full"
              >
                <option value="ALL">All Bands</option>
                <option value="Good">Good (85-100)</option>
                <option value="Fair">Fair (70-84)</option>
                <option value="Poor">Poor (50-69)</option>
                <option value="Very Poor">Very Poor (30-49)</option>
                <option value="Critical">Critical (&lt;30)</option>
              </select>
            </div>
          </div>

          {/* Leaflet Map Target */}
          <div className="mt-3 flex-1 min-h-[380px] rounded-xl overflow-hidden border border-slate-200 z-0" ref={mapContainerRef} />

          {/* Map Legend */}
          <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span className="font-semibold text-slate-700">BCI Legend:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> Good (85-100)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" /> Fair (70-84)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" /> Poor (50-69)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500" /> Very Poor (30-49)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" /> Critical (&lt;30)
            </span>
          </div>
        </div>

        {/* Condition Bands & Priority Distribution */}
        <div className="space-y-6">
          {/* Condition Distribution Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Buildings by Condition Band</span>
              <span className="text-xs font-normal text-slate-400">Total: {totalRegistered}</span>
            </h3>

            <div className="space-y-2.5">
              {(Object.keys(bandCounts) as (keyof typeof bandCounts)[]).map((band) => {
                const count = bandCounts[band];
                const pct = Math.round((count / (totalRegistered || 1)) * 100);
                const colors = {
                  Good: 'bg-emerald-500',
                  Fair: 'bg-blue-500',
                  Poor: 'bg-amber-500',
                  'Very Poor': 'bg-orange-500',
                  Critical: 'bg-rose-500'
                };
                return (
                  <div key={band} className="text-xs">
                    <div className="flex items-center justify-between mb-1 font-medium">
                      <span className="text-slate-700">{band}</span>
                      <span className="text-slate-500 font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${colors[band]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Distribution Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Defect Priority Band Breakdown</span>
              <span className="text-xs font-normal text-slate-400">P1-P4 Queue</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50">
                <div className="flex items-center justify-between font-bold text-rose-800 text-xs">
                  <span>P1 Critical</span>
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                </div>
                <div className="text-2xl font-black text-rose-900 mt-1">{pCounts.P1}</div>
                <div className="text-[10px] text-rose-600 mt-0.5">24-72h SLA Target</div>
              </div>

              <div className="p-3 rounded-xl border border-orange-200 bg-orange-50/50">
                <div className="font-bold text-orange-800 text-xs">P2 High Risk</div>
                <div className="text-2xl font-black text-orange-900 mt-1">{pCounts.P2}</div>
                <div className="text-[10px] text-orange-600 mt-0.5">&lt; 30-Day Plan</div>
              </div>

              <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50">
                <div className="font-bold text-blue-800 text-xs">P3 Moderate</div>
                <div className="text-2xl font-black text-blue-900 mt-1">{pCounts.P3}</div>
                <div className="text-[10px] text-blue-600 mt-0.5">&lt; 90-Day Package</div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-800 text-xs">P4 Routine</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{pCounts.P4}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Annual Programme</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Division Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Regional & Division Performance Comparison</h3>
            <p className="text-xs text-slate-500">Cross-division condition index, critical findings and executive engineers</p>
          </div>
          <button
            onClick={() => onNavigate('/division-dashboard')}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            Open Division View →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Division</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Superintending Engineer</th>
                <th className="py-2.5 px-3 text-center">Buildings</th>
                <th className="py-2.5 px-3 text-center">Average BCI</th>
                <th className="py-2.5 px-3 text-center">Critical P1s</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {divisions.map((div) => {
                const divBlds = buildings.filter((b) => b.divisionId === div.id);
                const divCrit = defects.filter((d) => d.priorityBand === 'P1' && divBlds.some((b) => b.id === d.buildingId)).length;
                return (
                  <tr key={div.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{div.name}</td>
                    <td className="py-3 px-3 text-slate-600">{div.district}</td>
                    <td className="py-3 px-3 text-slate-600">{div.responsibleEngineerName}</td>
                    <td className="py-3 px-3 text-center font-mono font-semibold">{divBlds.length}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-bold text-slate-900">{div.averageBCI}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {divCrit > 0 ? (
                        <span className="font-bold text-rose-600 font-mono bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          {divCrit} Critical
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium">None</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedDivisionFilter(div.id);
                          onNavigate('/division-dashboard');
                        }}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Inspect Division
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function LayoutDashboardIcon(props: any) {
  return <TrendingUp {...props} />;
}
