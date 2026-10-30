import React, { useState } from 'react';
import { 
  QrCode, 
  Upload, 
  Send, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  AlertTriangle,
  Search,
  Phone,
  User,
  Image as ImageIcon
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const OccupantQRReportView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { buildings, submitComplaint } = useData();

  const [selectedBuildingId, setSelectedBuildingId] = useState(buildings[1]?.id || 'bld-002');
  const [category, setCategory] = useState<'Water Leakage / Dampness' | 'Crack in Wall or Slab' | 'Spalling Concrete' | 'Door / Window Damage' | 'Tile Debonding' | 'Structural Concern'>('Water Leakage / Dampness');
  const [floorOrRoom, setFloorOrRoom] = useState('Floor 3, Research Lab Suite 3B');
  const [description, setDescription] = useState('Water dripping continuously from ceiling joint above workstation bench 14. Plaster peeling off.');
  const [reporterName, setReporterName] = useState('Dr. Helen Mercer (Lead Research Scientist)');
  const [reporterPhone, setReporterPhone] = useState('+1 (555) 438-2910');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80');

  const [submitting, setSubmitting] = useState(false);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitComplaint({
        buildingId: selectedBuildingId,
        category,
        description,
        locationDescription: floorOrRoom,
        floorOrRoom,
        photoIds: [photoUrl],
        contactDetails: {
          name: reporterName,
          phone: reporterPhone
        }
      });
      setConfirmedRef(res.reference);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-900 rounded-2xl p-6 text-white shadow-md text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 mb-3">
          <QrCode className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black">
          Public Occupant & Citizen Building Issue Portal
        </h1>
        <p className="text-xs text-blue-100 mt-1 max-w-md mx-auto">
          Scan the QR code in any government facility to report water leakage, structural cracks, or spalling directly to the Public Works Department.
        </p>
      </div>

      {confirmedRef ? (
        <div className="bg-white rounded-2xl border-2 border-emerald-300 p-8 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Issue Successfully Submitted!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Your report has been forwarded to the responsible Executive Engineer and maintenance division.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block max-w-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Complaint Tracking Reference Number
            </span>
            <span className="text-2xl font-mono font-black text-blue-700 mt-1 block">
              {confirmedRef}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Keep this reference number to check resolution progress.
            </span>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('/track-complaint')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Track Complaint Status
            </button>
            <button
              onClick={() => setConfirmedRef(null)}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
          {/* Facility Selection */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Target Building Facility (Identified via QR Code) *
            </label>
            <select
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.buildingCode} - {b.district})
                </option>
              ))}
            </select>
            {selectedBuilding && (
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {selectedBuilding.address}, {selectedBuilding.district}
              </p>
            )}
          </div>

          {/* Issue Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Issue Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium"
              >
                <option value="Water Leakage / Dampness">Water Leakage / Ceiling Dampness</option>
                <option value="Crack in Wall or Slab">Crack in Wall, Column or Slab</option>
                <option value="Spalling Concrete">Concrete Spalling / Falling Plaster</option>
                <option value="Door / Window Damage">Broken Window Shutter / Rain Ingress</option>
                <option value="Tile Debonding">Hollow / Lifted Floor Tiles</option>
                <option value="Structural Concern">Structural Sagging or Vibration</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Floor, Ward or Room Location *
              </label>
              <input
                type="text"
                required
                value={floorOrRoom}
                onChange={(e) => setFloorOrRoom(e.target.value)}
                placeholder="e.g. Floor 3, Room 304 near corridor"
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Description of the Defect *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you see: active water dripping, widening crack, falling cement pieces..."
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          {/* Photo Preview */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Attach Photograph</label>
            <div className="h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 mb-2">
              <img src={photoUrl} alt="Complaint Evidence" className="w-full h-full object-cover" />
            </div>
            <p className="text-[11px] text-slate-500">
              Photographs assist department engineers in determining whether urgent structural propping is needed.
            </p>
          </div>

          {/* Contact Details */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 mb-2">Contact Details (For Status Updates)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-600 block mb-1">Your Name</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Phone Number (SMS Notifications)</label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting to PWD...' : 'Submit Building Issue Report'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
