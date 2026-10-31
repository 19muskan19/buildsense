import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Clock, 
  TrendingUp, 
  Layers, 
  ShieldCheck,
  Radio,
  RefreshCw
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { addSensorReading } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Sensor } from '../../types';
import { Modal } from '../../components/common/Modal';

export const SensorMonitoringView: React.FC = () => {
  const { sensors, acknowledgeSensorAlarm } = useData();
  const { currentUser } = useAuth();

  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [newReadingVal, setNewReadingVal] = useState<string>('0.48');
  const [isAddReadingOpen, setIsAddReadingOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const activeAlarms = sensors.filter((s) => s.status === 'Alarm');

  const handleAcknowledge = async (sensorId: string) => {
    await acknowledgeSensorAlarm(sensorId);
    setActionSuccess('Alarm acknowledged by certified engineer.');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <Activity className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Structural Health IoT Sensor Telemetry
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Continuous telemetry monitoring tiltmeters, crack meters, settlement benchmarks, and moisture probes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeAlarms.length > 0 ? (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              {activeAlarms.length} Active Sensor Alarms
            </span>
          ) : (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800">
              All Sensor Streams Within Safe Tolerances
            </span>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {actionSuccess}
        </div>
      )}

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sensors.map((sensor) => {
          const isAlarm = sensor.status === 'Alarm';
          const isWarning = sensor.status === 'Warning';
          return (
            <div
              key={sensor.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                isAlarm ? 'border-rose-300 ring-2 ring-rose-200' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Radio className={`w-4 h-4 ${isAlarm ? 'text-rose-600 animate-pulse' : 'text-blue-600'}`} />
                    <span className="font-bold text-xs text-slate-900">{sensor.sensorType}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isAlarm
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {sensor.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{sensor.buildingName}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Element: {sensor.elementName}</p>

                {/* Main Gauge Value */}
                <div className="my-4 p-3 bg-slate-50 rounded-xl flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block text-[10px]">Current Reading</span>
                    <span className="text-3xl font-mono font-black text-slate-900">
                      {sensor.lastReadingValue}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold ml-1">{sensor.unit}</span>
                  </div>

                  <div className="text-right text-[11px]">
                    <span className="text-slate-400 block text-[10px]">Threshold Limit</span>
                    <span className="font-mono font-bold text-rose-600">&gt; {sensor.thresholdHigh} {sensor.unit}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div>Installed: {new Date(sensor.installationDate).toLocaleDateString('en-IN')}</div>
                  <div>Last Updated: {new Date(sensor.lastReadingTime).toLocaleTimeString('en-IN')}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {isAlarm && !sensor.isAcknowledged ? (
                  <button
                    onClick={() => handleAcknowledge(sensor.id)}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Acknowledge Critical Alarm
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-semibold">
                      {sensor.isAcknowledged ? '✓ Acknowledged by Engineer' : 'Normal Stream Status'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedSensor(sensor);
                        setIsAddReadingOpen(true);
                      }}
                      className="text-blue-600 hover:underline font-bold"
                    >
                      Inject Reading
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Sensor Injection Modal (Section 19) */}
      {selectedSensor && (
        <Modal
          isOpen={isAddReadingOpen}
          onClose={() => setIsAddReadingOpen(false)}
          title={`Inject Sensor Reading: ${selectedSensor.sensorType}`}
          subtitle={`Simulate continuous IoT telemetry for ${selectedSensor.elementName}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                New Telemetry Value ({selectedSensor.unit})
              </label>
              <input
                type="number"
                step="0.01"
                value={newReadingVal}
                onChange={(e) => setNewReadingVal(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-base font-bold"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Threshold high is {selectedSensor.thresholdHigh} {selectedSensor.unit}. Values above this will trigger an active emergency alarm.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddReadingOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await addSensorReading(selectedSensor.id, parseFloat(newReadingVal));
                  setIsAddReadingOpen(false);
                  window.location.reload();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
              >
                Send Telemetry Packet
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
