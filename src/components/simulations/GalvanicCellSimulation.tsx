import React, { useState, useEffect } from 'react';
import { ExperimentState } from '../../types';
import { Zap, Lightbulb, ArrowRight, Gauge, Sparkles } from 'lucide-react';

interface GalvanicCellSimulationProps {
  state: ExperimentState;
  onChangeState: (updater: (prev: ExperimentState) => ExperimentState) => void;
}

export const GalvanicCellSimulation: React.FC<GalvanicCellSimulationProps> = ({
  state,
  onChangeState,
}) => {
  const [concZn, setConcZn] = useState<number>(1.0); // Molarity of Zn2+
  const [concCu, setConcCu] = useState<number>(1.0); // Molarity of Cu2+

  // Standard potential E° for Zn-Cu Daniell cell = 1.10 V
  // Nernst Equation: E = E° - (R * T / (n * F)) * ln([Zn2+] / [Cu2+])
  // where n = 2, R = 8.314 J/(mol*K), F = 96485 C/mol
  const tempK = state.temperatureC + 273.15;
  const n = 2;
  const R = 8.314;
  const F = 96485;
  const Q = Math.max(concZn / concCu, 0.0001);
  const nernstFactor = (R * tempK) / (n * F);
  const calculatedVoltage = Math.max(0, 1.10 - nernstFactor * Math.log(Q));

  // Sync voltage to global state
  useEffect(() => {
    onChangeState((prev) => ({
      ...prev,
      voltageV: Number(calculatedVoltage.toFixed(3)),
    }));
  }, [calculatedVoltage]);

  // Bulb brightness percentage (0 to 100)
  const bulbBrightness = Math.min(100, Math.round((calculatedVoltage / 1.10) * 100));

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400" />
          <h3 className="text-sm font-bold text-white">
            الخلية الكهروكيميائية (بطارية دانيال وتدفق الشحنات)
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-yellow-400 bg-yellow-950/40 border border-yellow-500/30 px-3 py-1 rounded-lg">
          <span>E = {calculatedVoltage.toFixed(3)} V</span>
        </div>
      </div>

      {/* Main Simulation Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Circuit & Beakers Visual */}
        <div className="relative flex flex-col items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 min-h-[340px] overflow-hidden">
          {/* Top Wire & Voltmeter & Lightbulb */}
          <div className="w-full flex items-center justify-center gap-6 relative pt-2">
            {/* Connecting Wire SVG */}
            <svg className="absolute inset-0 w-full h-16 pointer-events-none" viewBox="0 0 300 60">
              <path
                d="M 60 60 L 60 25 L 240 25 L 240 60"
                fill="none"
                stroke="#eab308"
                strokeWidth="2.5"
              />
              {/* Moving Electron Dots */}
              {calculatedVoltage > 0.1 && (
                <>
                  <circle cx="100" cy="25" r="2.5" fill="#ffffff" className="animate-ping" />
                  <circle cx="150" cy="25" r="2.5" fill="#38bdf8" className="animate-pulse" />
                  <circle cx="200" cy="25" r="2.5" fill="#ffffff" className="animate-ping" />
                </>
              )}
            </svg>

            {/* Glowing Light Bulb in Middle of Circuit */}
            <div className="z-10 flex flex-col items-center bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-md">
              <Lightbulb
                className={`h-7 w-7 transition-all duration-300 ${
                  bulbBrightness > 10 ? 'text-yellow-300 drop-shadow-[0_0_12px_#facc15]' : 'text-slate-600'
                }`}
                style={{ opacity: Math.max(0.3, bulbBrightness / 100) }}
              />
              <span className="text-[9px] font-mono text-slate-400 mt-0.5">مصباح ({bulbBrightness}%)</span>
            </div>

            {/* Digital Voltmeter */}
            <div className="z-10 flex flex-col items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 shadow-md">
              <span className="text-[9px] text-slate-400">فولتمتر رقمي</span>
              <span className="text-sm font-bold font-mono text-cyan-300">
                {calculatedVoltage.toFixed(3)} V
              </span>
            </div>
          </div>

          {/* Beakers & Salt Bridge Section */}
          <div className="w-full flex items-end justify-around relative mt-6">
            {/* Inverted U-tube Salt Bridge */}
            <div className="absolute top-0 z-20 flex flex-col items-center">
              <div className="w-24 h-12 border-t-8 border-x-8 border-amber-200/70 rounded-t-xl bg-transparent"></div>
              <span className="text-[8px] font-bold text-amber-200/90 -mt-2 bg-slate-950 px-1 rounded">
                قنطرة ملحية (KNO₃)
              </span>
            </div>

            {/* LEFT BEAKER: Zinc Half-Cell (Anode - Oxidation) */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                <span>المصعد (Anode): خارصين Zn</span>
              </div>
              <div className="relative w-28 h-36 rounded-b-xl border-2 border-slate-500 bg-slate-900/50 overflow-hidden flex flex-col justify-end">
                {/* Zn Metal Strip Electrode */}
                <div className="absolute top-0 left-6 w-5 h-28 bg-gradient-to-b from-slate-400 to-slate-500 border border-slate-300 rounded shadow-md z-10 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-slate-950 -rotate-90">Zn</span>
                </div>
                {/* ZnSO4 Solution */}
                <div className="w-full h-24 bg-slate-400/20 border-t border-slate-400 flex items-end justify-center p-1">
                  <span className="text-[8px] font-mono text-slate-300">ZnSO₄ ({concZn}M)</span>
                </div>
              </div>
            </div>

            {/* RIGHT BEAKER: Copper Half-Cell (Cathode - Reduction) */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-bold text-cyan-300 mb-1 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-orange-600"></span>
                <span>المهبط (Cathode): نحاس Cu</span>
              </div>
              <div className="relative w-28 h-36 rounded-b-xl border-2 border-slate-500 bg-slate-900/50 overflow-hidden flex flex-col justify-end">
                {/* Cu Metal Strip Electrode */}
                <div className="absolute top-0 right-6 w-5 h-28 bg-gradient-to-b from-orange-600 to-amber-700 border border-orange-400 rounded shadow-md z-10 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white -rotate-90">Cu</span>
                </div>
                {/* CuSO4 Deep Blue Solution */}
                <div
                  className="w-full h-24 border-t border-blue-400 flex items-end justify-center p-1 transition-colors duration-300"
                  style={{
                    backgroundColor: `rgba(2, 132, 199, ${Math.min(0.2 + (concCu / 2) * 0.6, 0.85)})`,
                  }}
                >
                  <span className="text-[8px] font-mono text-blue-200">CuSO₄ ({concCu}M)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Half Reactions equations below */}
          <div className="w-full flex justify-between text-[9px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            <div>تأكسد: Zn → Zn²⁺ + 2e⁻</div>
            <div>اختزال: Cu²⁺ + 2e⁻ → Cu</div>
          </div>
        </div>

        {/* Right: Electrolyte Concentrations & Nernst controls */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200">
              التحكم في تراكيز المحاليل (معادلة نيرنست):
            </h4>

            {/* Zn2+ Concentration Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                <span>تركيز أيونات الخارصين [Zn²⁺]:</span>
                <span className="font-mono text-slate-400">{concZn.toFixed(3)} M</span>
              </div>
              <input
                id="slider-conc-zn"
                type="range"
                min={0.001}
                max={2.0}
                step={0.05}
                value={concZn}
                onChange={(e) => setConcZn(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-slate-400"
              />
            </div>

            {/* Cu2+ Concentration Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                <span>تركيز أيونات النحاس [Cu²⁺]:</span>
                <span className="font-mono text-cyan-400">{concCu.toFixed(3)} M</span>
              </div>
              <input
                id="slider-conc-cu"
                type="range"
                min={0.001}
                max={2.0}
                step={0.05}
                value={concCu}
                onChange={(e) => setConcCu(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-500"
              />
            </div>
          </div>

          {/* Mathematical & Physical Details */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-2">
            <div className="font-bold text-yellow-400">معادلة نيرنست (Nernst Equation):</div>
            <div className="font-mono text-[10px] text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800 text-center dir-ltr">
              E = E° - (RT / nF) · ln([Zn²⁺] / [Cu²⁺])
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
              لاحظ أنه كلما زاد تركيز أيونات النحاس [Cu²⁺] أو انخفض تركيز [Zn²⁺]، ارتفع فرق الجهد الكهربائي وازداد توهج المصباح!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
