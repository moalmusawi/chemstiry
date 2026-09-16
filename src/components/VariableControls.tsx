import React from 'react';
import { ExperimentState, ExperimentInfo } from '../types';
import { 
  Flame, 
  Snowflake, 
  Gauge, 
  RotateCw, 
  Sparkles, 
  Sliders, 
  Zap, 
  Volume2, 
  Plus, 
  Minus,
  AlertTriangle
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';

interface VariableControlsProps {
  experiment: ExperimentInfo;
  state: ExperimentState;
  onChangeState: (updater: (prev: ExperimentState) => ExperimentState) => void;
}

export const VariableControls: React.FC<VariableControlsProps> = ({
  experiment,
  state,
  onChangeState,
}) => {
  // Quick temperature presets
  const tempPresets = [
    { label: 'تبريد جاف (-50°C)', temp: -50 },
    { label: 'نقطة التجمد (0°C)', temp: 0 },
    { label: 'حرارة الغرفة (25°C)', temp: 25 },
    { label: 'غليان الماء (100°C)', temp: 100 },
    { label: 'تسخين بنزن (350°C)', temp: 350 },
  ];

  // Quick pressure presets
  const pressurePresets = [
    { label: 'تفريغ مخلخل (0.2 atm)', p: 0.2 },
    { label: 'ضغط قياسي (1.0 atm)', p: 1.0 },
    { label: 'مضغوط (3.0 atm)', p: 3.0 },
    { label: 'ضغط فائق (10.0 atm)', p: 10.0 },
  ];

  const handleTempChange = (val: number) => {
    onChangeState((prev) => ({
      ...prev,
      temperatureC: val,
      coolingActive: val < 10,
      burnerActive: val > 60,
    }));
  };

  const handlePressureChange = (val: number) => {
    onChangeState((prev) => ({
      ...prev,
      pressureAtm: Number(val.toFixed(2)),
    }));
  };

  const toggleBurner = () => {
    soundFx.playHiss(0.4);
    onChangeState((prev) => {
      const willBeActive = !prev.burnerActive;
      return {
        ...prev,
        burnerActive: willBeActive,
        coolingActive: willBeActive ? false : prev.coolingActive,
        temperatureC: willBeActive ? Math.max(prev.temperatureC, 250) : 25,
      };
    });
  };

  const toggleCooling = () => {
    soundFx.playClick();
    onChangeState((prev) => {
      const willBeActive = !prev.coolingActive;
      return {
        ...prev,
        coolingActive: willBeActive,
        burnerActive: willBeActive ? false : prev.burnerActive,
        temperatureC: willBeActive ? Math.min(prev.temperatureC, 0) : 25,
      };
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-xl space-y-6">
      {/* Title & Badge */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">لوحة التحكم في المتغيرات</h3>
            <p className="text-[11px] text-slate-400">تحكم بالحرارة والضغط والتراكيز والمحفزات</p>
          </div>
        </div>

        <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-mono text-cyan-300">
          STP: 25°C / 1.00 atm
        </span>
      </div>

      {/* 1. TEMPERATURE CONTROL (الحرارة) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Flame className="h-4 w-4 text-amber-500" />
            <span>درجة الحرارة (Temperature):</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 font-mono text-sm font-bold text-amber-400">
              {state.temperatureC}°C
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({(state.temperatureC + 273.15).toFixed(1)} K)
            </span>
          </div>
        </div>

        {/* Temperature Slider */}
        <input
          id="slider-temperature"
          type="range"
          min={-100}
          max={600}
          step={1}
          value={state.temperatureC}
          onChange={(e) => handleTempChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-amber-500"
        />

        {/* Quick Presets for Temperature */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tempPresets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                soundFx.playClick();
                handleTempChange(p.temp);
              }}
              className={`rounded-md border px-2 py-1 text-[10px] transition-colors ${
                state.temperatureC === p.temp
                  ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Burner & Ice Bath Toggles */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id="btn-toggle-burner"
            type="button"
            onClick={toggleBurner}
            className={`flex items-center justify-center gap-2 rounded-xl border p-2 text-xs font-semibold transition-all ${
              state.burnerActive
                ? 'border-orange-500 bg-gradient-to-r from-orange-600/30 to-amber-600/30 text-orange-200 shadow-md shadow-orange-500/20'
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <Flame className={`h-4 w-4 ${state.burnerActive ? 'text-orange-400 animate-bounce' : 'text-slate-500'}`} />
            <span>موقد بنزن (Bunsen Burner)</span>
          </button>

          <button
            id="btn-toggle-cooling"
            type="button"
            onClick={toggleCooling}
            className={`flex items-center justify-center gap-2 rounded-xl border p-2 text-xs font-semibold transition-all ${
              state.coolingActive
                ? 'border-cyan-500 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-200 shadow-md shadow-cyan-500/20'
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <Snowflake className={`h-4 w-4 ${state.coolingActive ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
            <span>حمام جليدي (Ice Bath)</span>
          </button>
        </div>
      </div>

      {/* 2. PRESSURE CONTROL (الضغط) */}
      <div className="space-y-3 border-t border-slate-800/80 pt-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Gauge className="h-4 w-4 text-cyan-400" />
            <span>الضغط الجوي (Pressure):</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 font-mono text-sm font-bold text-cyan-400">
              {state.pressureAtm.toFixed(2)} atm
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({(state.pressureAtm * 101.325).toFixed(1)} kPa)
            </span>
          </div>
        </div>

        {/* Pressure Slider */}
        <input
          id="slider-pressure"
          type="range"
          min={0.1}
          max={15.0}
          step={0.1}
          value={state.pressureAtm}
          onChange={(e) => handlePressureChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-500"
        />

        {/* Quick Presets for Pressure */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {pressurePresets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                soundFx.playClick();
                handlePressureChange(p.p);
              }}
              className={`rounded-md border px-2 py-1 text-[10px] transition-colors ${
                Math.abs(state.pressureAtm - p.p) < 0.05
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. EXPERIMENT-SPECIFIC & SECONDARY CONTROLS */}
      <div className="space-y-4 border-t border-slate-800/80 pt-4">
        {/* Magnetic Stirrer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <RotateCw className={`h-4 w-4 text-emerald-400 ${state.stirrerRpm > 0 ? 'animate-spin' : ''}`} />
              <span>الخلاط المغناطيسي (Stirrer Speed):</span>
            </label>
            <span className="font-mono text-xs font-bold text-emerald-400">
              {state.stirrerRpm} RPM
            </span>
          </div>
          <input
            id="slider-stirrer"
            type="range"
            min={0}
            max={1200}
            step={50}
            value={state.stirrerRpm}
            onChange={(e) => {
              const rpm = Number(e.target.value);
              onChangeState((prev) => ({ ...prev, stirrerRpm: rpm }));
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
          />
        </div>

        {/* Catalyst Switch & Amount */}
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className={`h-4 w-4 ${state.catalystActive ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <div>
              <div className="text-xs font-bold text-slate-200">إضافة محفز كيميائي (Catalyst)</div>
              <div className="text-[10px] text-slate-400">يخفض طاقة التنشيط ويسرع معدل التفاعل</div>
            </div>
          </div>
          <button
            id="btn-toggle-catalyst"
            type="button"
            onClick={() => {
              soundFx.playClick();
              onChangeState((prev) => ({
                ...prev,
                catalystActive: !prev.catalystActive,
                catalystAmount: !prev.catalystActive ? 75 : 0,
              }));
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              state.catalystActive
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {state.catalystActive ? 'مُفعّل ✓' : 'مُعطّل ✕'}
          </button>
        </div>

        {/* Gas Law specifics */}
        {experiment.id === 'gas_laws' && (
          <div className="space-y-2 rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300">حجم الأسطوانة (Volume L):</span>
              <span className="font-mono text-xs font-bold text-cyan-400">{state.volumeL.toFixed(1)} L</span>
            </div>
            <input
              id="slider-volume"
              type="range"
              min={1.0}
              max={10.0}
              step={0.5}
              value={state.volumeL}
              onChange={(e) => {
                const vol = Number(e.target.value);
                onChangeState((prev) => {
                  // If volume changes at constant T and n, ideal gas pressure changes: P = nRT/V
                  const R = 0.0821;
                  const T_kelvin = prev.temperatureC + 273.15;
                  const newPressure = (prev.moles * R * T_kelvin) / vol;
                  return {
                    ...prev,
                    volumeL: vol,
                    pressureAtm: Number(newPressure.toFixed(2)),
                  };
                });
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
            />
          </div>
        )}

        {/* Titration specifics */}
        {experiment.id === 'acid_base_titration' && (
          <div className="space-y-3 rounded-xl border border-pink-900/40 bg-pink-950/20 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-300">الكاشف اللوني (Indicator):</span>
              <select
                id="select-indicator"
                value={state.currentIndicator || 'phenolphthalein'}
                onChange={(e) => {
                  soundFx.playClick();
                  onChangeState((prev) => ({
                    ...prev,
                    currentIndicator: e.target.value as any,
                  }));
                }}
                className="rounded-lg border border-pink-500/30 bg-slate-900 px-2 py-1 text-xs text-pink-300 focus:outline-none"
              >
                <option value="phenolphthalein">فينولفثالين (Phenolphthalein)</option>
                <option value="litmus">تباع الشمس (Litmus)</option>
                <option value="universal">الكاشف العام (Universal)</option>
                <option value="bromothymol">أزرق بروموثيمول (Bromothymol Blue)</option>
              </select>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>الحجم المضاف من السحاحة (NaOH):</span>
              <span className="font-mono font-bold text-pink-400">{state.buretAddedVolumeMl.toFixed(1)} mL</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
