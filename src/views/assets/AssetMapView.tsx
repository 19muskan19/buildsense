import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Building2, Filter, Layers, ChevronRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ConditionBadge } from '../../components/common/Badges';

interface AssetMapViewProps {
  onOpenPassport: (buildingId: string) => void;
}

export const AssetMapView: React.FC<AssetMapViewProps> = ({ onOpenPassport }) => {
  const { buildings, divisions } = useData();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [bandFilter, setBandFilter] = useState('ALL');

  const filteredBuildings = buildings.filter((b) => {
    if (divisionFilter !== 'ALL' && b.divisionId !== divisionFilter) return false;
    if (bandFilter !== 'ALL' && b.conditionBand !== bandFilter) return false;
    return true;
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([26.2, 92.8], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Plot filtered buildings
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
        radius: 9,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; min-width: 200px; padding: 2px;">
          <strong style="color: #0f172a; font-size: 13px;">${b.name}</strong><br/>
          <span style="color: #64748b;">${b.buildingCode} • ${b.district}</span>
          <div style="margin-top: 8px; padding: 6px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span><strong>Condition:</strong></span>
              <span style="font-weight: bold; color: ${color};">${b.conditionBand} (${b.currentBCI})</span>
            </div>
            <div><strong>Type:</strong> ${b.buildingType}</div>
            <div><strong>Floors:</strong> ${b.numberOfFloors} • Built ${b.yearBuilt}</div>
          </div>
        </div>
      `);
    });
  }, [filteredBuildings]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 flex flex-col h-[calc(100vh-130px)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Enterprise Geographic Infrastructure Asset Map
          </h1>
          <p className="text-xs text-slate-500">
            OpenStreetMap GIS visualization of commercial and institutional assets across all operational districts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium"
          >
            <option value="ALL">All Divisions</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={bandFilter}
            onChange={(e) => setBandFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium"
          >
            <option value="ALL">All Condition Bands</option>
            <option value="Good">Good (85-100)</option>
            <option value="Fair">Fair (70-84)</option>
            <option value="Poor">Poor (50-69)</option>
            <option value="Very Poor">Very Poor (30-49)</option>
            <option value="Critical">Critical (&lt;30)</option>
          </select>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs relative">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>
    </div>
  );
};
