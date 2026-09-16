import React from 'react';
import { ExperimentState, ExperimentInfo } from '../types';
import { Thermometer, Gauge, Activity, Zap, AlertCircle } from 'lucide-react';

interface MeasurementGaugesProps {
  state: ExperimentState;
  experiment: ExperimentInfo;
}

export const MeasurementGauges: React.FC<MeasurementGaugesProps> = ({ state, experiment }) => {
  // Pressure dial needle rotation calculation (0.1 to 15 atm maps to -120deg to +120deg)
  const clampedPressure = Math.min(Math.max(state.pressureAtm, 0.1), 15);
  const pressureAngle = -120 + ((clampedPressure - 0.1) / (15 - 0.1)) * 240;

  // Temperature mercury height percentage (-100°C to 600°C)
  const clampedTemp = Math.min(Math.max(state.temperatureC, -100), 600);
  const tempPercent = ((clampedTemp - (-100)) / (600 - (-100))) * 100;

  // Get qualitative pH text & color
  const getPhStatus = (ph: number) => {
    if (ph < 3) return { text: 'حمضي قوي (Strong Acid)', color: 'text-rose-400', bg: 'bg-rose-500' };
    if (ph < 6.5) return { text: 'حمضي ضعيف (Weak Acid)', color: 'text-amber-400', bg: 'bg-amber-500' };
    if (ph <= 7.5) return { text: 'متعادل (Neutral)', color: 'text-emerald-400', bg: 'bg-emerald-500' };
    if (ph <= 11) return { text: 'قاعدي ضعيف (Weak Base)', color: 'text-cyan-400', bg: 'bg-cyan-500' };
    return { text: 'قاعدي قوي (Strong Base)', color: 'text-purple-400', bg: 'bg-purple-500' };
  };

  const phStatus = getPhStatus(state.phValue);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* 1. THERMOMETER GAUGE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-md flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Thermometer className="h-4 w-4 text-amber-500" />
            <span>الحرارة T</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {(state.temperatureC + 273.15).toFixed(1)} K
          </span>
        </div>

        <div className="my-2 flex items-center gap-3">
          {/* Mercury tube mini graphic */}
          <div className="relative h-14 w-3.5 rounded-full bg-slate-950 border border-slate-700 overflow-hidden flex flex-col justify-end p-0.5">
            <div
              className={`w-full rounded-full transition-all duration-300 ${
                state.temperatureC > 100
                  ? 'bg-gradient-to-t from-orange-500 to-rose-500 shadow-sm shadow-rose-500'
                  : state.temperatureC < 10
                  ? 'bg-gradient-to-t from-cyan-600 to-blue-400'
                  : 'bg-gradient-to-t from-emerald-500 to-amber-400'
              }`}
              style={{ height: `${tempPercent}%` }}
            ></div>
          </div>

          <div>
            <div className="font-mono text-xl sm:text-2xl font-black text-white">
              {state.temperatureC}°<span className="text-sm font-medium text-slate-400">C</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {((state.temperatureC * 9) / 5 + 32).toFixed(1)}°F
            </div>
          </div>
        </div>

        <div className="text-[10px] font-medium text-amber-300/90 truncate">
          {state.temperatureC <= 0
            ? 'حالة تجميد / ثلج'
            : state.temperatureC >= 100
            ? 'غليان وبخار نشط'
            : 'حرارة معتدلة'}
        </div>
      </div>

      {/* 2. PRESSURE GAUGE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Gauge className="h-4 w-4 text-cyan-400" />
            <span>الضغط P</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {(state.pressureAtm * 101.325).toFixed(0)} kPa
          </span>
        </div>

        <div className="my-2 flex items-center gap-2">
          {/* Mini Analog Dial SVG */}
          <div className="relative h-12 w-12 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="#020617"
                stroke="#334155"
                strokeWidth="6"
                strokeDasharray="188"
                strokeDashoffset="40"
              />
              <path
                d="M 22 75 A 40 40 0 1 1 78 75"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Dial Needle */}
              <g transform={`rotate(${pressureAngle}, 50, 50)`} className="transition-transform duration-300">
                <line x1="50" y1="50" x2="50" y2="18" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                <circle cx="50" cy="50" r="5" fill="#ef4444" />
              </g>
            </svg>
          </div>

          <div>
            <div className="font-mono text-xl sm:text-2xl font-black text-white">
              {state.pressureAtm.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1">atm</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {(state.pressureAtm * 760).toFixed(0)} mmHg
            </div>
          </div>
        </div>

        <div className={`text-[10px] font-medium truncate ${
          state.pressureAtm > 5 ? 'text-rose-400 font-bold' : 'text-cyan-300'
        }`}>
          {state.pressureAtm > 5 ? '⚠️ ضغط شديد الارتفاع' : state.pressureAtm < 0.5 ? 'تفريغ هواء مخلخل' : 'ضغط مستقر آمن'}
        </div>
      </div>

      {/* 3. pH METER GAUGE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>الحموضة pH</span>
          </div>
          <div className={`h-2.5 w-2.5 rounded-full ${phStatus.bg} shadow-sm shadow-emerald-500`}></div>
        </div>

        <div className="my-2">
          <div className="font-mono text-xl sm:text-2xl font-black text-white flex items-baseline gap-1">
            {state.phValue.toFixed(2)}
            <span className="text-xs font-medium text-slate-400">pH</span>
          </div>
          {/* pH Rainbow spectrum line */}
          <div className="mt-1 h-1.5 w-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 via-cyan-500 to-purple-600 relative">
            <div
              className="absolute -top-0.5 h-2.5 w-1 rounded-full bg-white shadow-md transition-all duration-300"
              style={{ left: `${(state.phValue / 14) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className={`text-[10px] font-semibold truncate ${phStatus.color}`}>
          {phStatus.text}
        </div>
      </div>

      {/* 4. VOLTAGE & ENERGY METER */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span>الجهد والكهرباء E</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Volts</span>
        </div>

        <div className="my-2">
          <div className="font-mono text-xl sm:text-2xl font-black text-white flex items-baseline gap-1">
            {state.voltageV.toFixed(2)}
            <span className="text-xs font-medium text-yellow-400">V</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span className={`inline-block h-2 w-2 rounded-full ${state.voltageV > 0.1 ? 'bg-yellow-400 animate-ping' : 'bg-slate-700'}`}></span>
            <span>{state.voltageV > 0.1 ? 'تدفق شحنات مستمر' : 'لا يوجد تيار كافي'}</span>
          </div>
        </div>

        <div className="text-[10px] font-medium text-yellow-300 truncate">
          {experiment.id === 'galvanic_cell'
            ? 'تفاعل أكسدة واختزال نشط'
            : 'مستشعر إلكتروني مستعد'}
        </div>
      </div>
    </div>
  );
};
