import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Calendar, 
  Layers, 
  AlertTriangle,
  ChevronRight,
  FileCheck2,
  List,
  Map,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Building, ConditionBand } from '../../types';
import { ConditionBadge } from '../../components/common/Badges';
import { Modal } from '../../components/common/Modal';

interface BuildingRegistryViewProps {
  onOpenPassport: (buildingId: string) => void;
  onNavigate: (route: string) => void;
}

export const BuildingRegistryView: React.FC<BuildingRegistryViewProps> = ({ onOpenPassport, onNavigate }) => {
  const { buildings, divisions, createBuilding } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCondition, setSelectedCondition] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New building form state
  const [formData, setFormData] = useState({
    name: '',
    buildingCode: '',
    department: 'Corporate Real Estate & Facilities',
    buildingType: 'Healthcare' as const,
    address: '',
    district: 'Financial & Corporate Core',
    divisionId: 'div-metro-central',
    yearBuilt: 2005,
    numberOfFloors: 4,
    structuralSystem: 'RCC Framed' as const,
    occupancyType: 'High' as const,
    criticality: 4,
    photoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
  });

  const filteredBuildings = buildings.filter((b) => {
    if (selectedDivision !== 'ALL' && b.divisionId !== selectedDivision) return false;
    if (selectedType !== 'ALL' && b.buildingType !== selectedType) return false;
    if (selectedCondition !== 'ALL' && b.conditionBand !== selectedCondition) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchCode = b.buildingCode.toLowerCase().includes(q);
      const matchAddr = b.address.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchAddr) return false;
    }
    return true;
  });

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    await createBuilding({
      ...formData,
      currentBCI: 92,
      conditionBand: 'Good',
      status: 'Operational',
      lastInspectionAt: new Date().toISOString(),
      nextInspectionAt: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
      floorAreaSqM: 4500,
      hasActiveSensors: false,
      totalElementsCount: 20,
      openDefectsCount: 0
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-100 text-blue-700">
              <Building2 className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Assam State Public Infrastructure Asset Registry
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official civil asset inventory with verified condition index, structural records, and operational passports
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('/map')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Map className="w-4 h-4 text-blue-600" />
            Full Map View
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Register Building
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by building name, code (e.g. AS-KM-ADM-001), district or street..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">All Divisions</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">All Building Types</option>
            <option value="Educational">Educational</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Administrative">Administrative</option>
            <option value="Public Utility">Public Utility</option>
            <option value="Residential Official">Residential Official</option>
          </select>

          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">All Conditions</option>
            <option value="Good">Good (85-100)</option>
            <option value="Fair">Fair (70-84)</option>
            <option value="Poor">Poor (50-69)</option>
            <option value="Very Poor">Very Poor (30-49)</option>
            <option value="Critical">Critical (&lt;30)</option>
          </select>
        </div>
      </div>

      {/* Buildings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBuildings.map((building) => (
          <div
            key={building.id}
            onClick={() => onOpenPassport(building.id)}
            className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group"
          >
            <div>
              {/* Photo & Badge Overlay */}
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={building.photoUrl}
                  alt={building.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="bg-slate-900/85 backdrop-blur-xs text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-md">
                    {building.buildingCode}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <ConditionBadge band={building.conditionBand} score={building.currentBCI} />
                </div>
                {building.hasActiveSensors && (
                  <div className="absolute bottom-2.5 left-2.5 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Sensors Active
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4">
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {building.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {building.district} • {building.department}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Structural System</span>
                    <strong className="text-slate-800">{building.structuralSystem}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Floors & Age</span>
                    <strong className="text-slate-800">
                      {building.numberOfFloors} Flrs • {new Date().getFullYear() - building.yearBuilt} yrs
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Last Insp: {new Date(building.lastInspectionAt).toLocaleDateString('en-IN')}
              </span>
              <span className="font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Digital Passport <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredBuildings.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          No buildings matched your search criteria.
        </div>
      )}

      {/* Add Building Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Building Asset"
        subtitle="Add a civil structure to the Assam Statewide Infrastructure Inventory"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateBuilding} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Building Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Silchar Civil Hospital Maternity Block"
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Building Code *</label>
              <input
                type="text"
                required
                value={formData.buildingCode}
                onChange={(e) => setFormData({ ...formData, buildingCode: e.target.value })}
                placeholder="e.g. AS-CA-HLT-023"
                className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Building Type</label>
              <select
                value={formData.buildingType}
                onChange={(e) => setFormData({ ...formData, buildingType: e.target.value as any })}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              >
                <option value="Healthcare">Healthcare</option>
                <option value="Educational">Educational</option>
                <option value="Administrative">Administrative</option>
                <option value="Public Utility">Public Utility</option>
                <option value="Residential Official">Residential Official</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Division</label>
              <select
                value={formData.divisionId}
                onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Hospital Road, Silchar"
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Year Built</label>
              <input
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => setFormData({ ...formData, yearBuilt: Number(e.target.value) })}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Number of Floors</label>
              <input
                type="number"
                value={formData.numberOfFloors}
                onChange={(e) => setFormData({ ...formData, numberOfFloors: Number(e.target.value) })}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Structural System</label>
              <select
                value={formData.structuralSystem}
                onChange={(e) => setFormData({ ...formData, structuralSystem: e.target.value as any })}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              >
                <option value="RCC Framed">RCC Framed</option>
                <option value="Load Bearing Masonry">Load Bearing Masonry</option>
                <option value="Steel Truss & Frame">Steel Truss & Frame</option>
                <option value="Composite">Composite</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
            >
              Save Building Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
