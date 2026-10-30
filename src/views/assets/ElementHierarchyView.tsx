import React, { useState } from 'react';
import { Layers, Building2, Filter, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StructuralClass } from '../../types';

export const ElementHierarchyView: React.FC = () => {
  const { elements, buildings } = useData();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  const filteredElements = elements.filter((e) => {
    if (selectedBuildingId !== 'ALL' && e.buildingId !== selectedBuildingId) return false;
    if (selectedClass !== 'ALL' && e.structuralClass !== selectedClass) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Floors, Zones & Structural Element Taxonomy
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Component structural classification: Primary load-bearing, Secondary elements, and Envelope finishes (IS 456 / SP 24)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium"
          >
            <option value="ALL">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium"
          >
            <option value="ALL">All Structural Classes</option>
            <option value="PRIMARY">PRIMARY STRUCTURE (Columns, Beams, Slabs, Shear Walls)</option>
            <option value="SECONDARY">SECONDARY STRUCTURE (Stairs, Parapets, Chajjas)</option>
            <option value="NON_STRUCTURAL">NON-STRUCTURAL (Finishes, Partitions)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Element Code</th>
                <th className="py-3 px-4">Building</th>
                <th className="py-3 px-4">Floor & Zone</th>
                <th className="py-3 px-4">Element Type</th>
                <th className="py-3 px-4">Structural Class</th>
                <th className="py-3 px-4 text-center">Criticality Rating</th>
                <th className="py-3 px-4 text-center">Condition Grade</th>
                <th className="py-3 px-4">Location Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredElements.map((elem) => {
                const bld = buildings.find((b) => b.id === elem.buildingId);
                return (
                  <tr key={elem.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{elem.elementCode}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{bld?.name || elem.buildingId}</td>
                    <td className="py-3.5 px-4 text-slate-600">{elem.floorId} • {elem.zoneId}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{elem.elementType}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        elem.structuralClass === 'PRIMARY'
                          ? 'bg-indigo-100 text-indigo-800'
                          : elem.structuralClass === 'SECONDARY'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {elem.structuralClass}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">{elem.criticality}/5</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        elem.currentConditionGrade >= 4
                          ? 'bg-rose-100 text-rose-800'
                          : elem.currentConditionGrade === 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Grade {elem.currentConditionGrade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">{elem.locationDescription}</td>
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
