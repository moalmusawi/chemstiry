import React, { useState, useEffect } from 'react';
import { ExperimentState } from '../../types';
import { Flame, Sparkles, Droplets, RotateCcw, AlertTriangle } from 'lucide-react';
import { soundFx } from '../../services/soundEffects';

interface ElephantToothpasteSimulationProps {
  state: ExperimentState;
  onChangeState: (updater: (prev: ExperimentState) => ExperimentState) => void;
}

export const ElephantToothpasteSimulation: React.FC<ElephantToothpasteSimulationProps> = ({
  state,
  onChangeState,
}) => {
  const [peroxideConc, setPeroxideConc] = useState<number>(30); // 3% to 35%
  const [foamColor, setFoamColor] = useState<string>('#06b6d4'); // Cyan / Blue / Pink / Emerald
  const [isErupting, setIsErupting] = useState<boolean>(false);
  const [foamHeight, setFoamHeight] = useState<number>(0); // 0 to 100%

  const colorOptions = [
    { label: 'سماوي فاقع', hex: '#06b6d4' },
    { label: 'وردي نيون', hex: '#ec4899' },
    { label: 'برتقالي لافا', hex: '#f97316' },
    { label: 'أخضر مائي', hex: '#10b981' },
    { label: 'بنفسجي', hex: '#a855f7' },
  ];

  // Trigger Reaction Eruption
  const handleTriggerReaction = () => {
    soundFx.playHiss(0.8);
    soundFx.playBubble();
    setIsErupting(true);

    // Rapid foam rising animation & temperature spike
    const interval = setInterval(() => {
      setFoamHeight((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 6;
      });
    }, 80);

    // Temperature & gas spike
    onChangeState((prev) => ({
      ...prev,
      catalystActive: true,
      temperatureC: Math.min(prev.temperatureC + Math.round((peroxideConc / 30) * 65), 98),
      gasReleasedMl: Math.round((peroxideConc / 30) * 1200),
    }));

    setTimeout(() => {
      soundFx.playSuccessChime();
    }, 1200);
  };

  // Reset reaction
  const handleReset = () => {
    soundFx.playClick();
    setIsErupting(false);
    setFoamHeight(0);
    onChangeState((prev) => ({
      ...prev,
      catalystActive: false,
      temperatureC: 22,
      gasReleasedMl: 0,
    }));
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">
            تفاعل معجون أسنان الفيل (التفكك الطارد للحرارة)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-trigger-elephant"
            type="button"
            disabled={isErupting}
            onClick={handleTriggerReaction}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              isErupting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>إضافة المحفز والبدء!</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
            title="إعادة التجهيز"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Eruption Flask & Foam Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Glassware & Animated Foam Column */}
        <div className="relative flex flex-col items-center justify-end rounded-xl border border-slate-800 bg-slate-950 p-4 min-h-[340px] overflow-hidden">
          {/* Steam / Vapor rising when hot */}
          {isErupting && state.temperatureC > 50 && (
            <div className="absolute top-6 flex items-center gap-2 pointer-events-none opacity-70">
              <span className="h-8 w-8 rounded-full bg-slate-300 blur-md animate-ping"></span>
              <span className="h-6 w-6 rounded-full bg-slate-200 blur-sm animate-pulse"></span>
            </div>
          )}

          {/* Foam Eruption Column */}
          <div className="relative w-32 flex flex-col items-center justify-end h-64">
            {/* Graduated Cylinder Flask Glass Body */}
            <div className="relative w-20 h-48 border-2 border-t-0 border-slate-400/80 rounded-b-xl bg-slate-900/40 backdrop-blur-sm overflow-hidden flex flex-col justify-end">
              {/* Reactants liquid level at bottom */}
              <div className="w-full h-8 bg-blue-500/30 border-t border-blue-400"></div>

              {/* Foam Body inside and rising */}
              <div
                className="absolute inset-x-0 bottom-0 rounded-b-lg transition-all duration-300 flex flex-col items-center justify-start overflow-visible"
                style={{
                  height: `${foamHeight}%`,
                  backgroundColor: foamColor,
                  boxShadow: `0 0 25px ${foamColor}66`,
                }}
              >
                {/* Foam Bubbles Texture */}
                <div className="w-full h-full opacity-40 bg-[radial-gradient(#fff_2px,transparent_2px)] [background-size:8px_8px]"></div>
              </div>
            </div>

            {/* Overflowing Top Foam Head shooting upwards */}
            {foamHeight > 70 && (
              <div
                className="absolute top-0 w-28 h-16 rounded-t-full transition-all duration-300 animate-pulse"
                style={{
                  backgroundColor: foamColor,
                  boxShadow: `0 0 35px ${foamColor}`,
                }}
              >
                <div className="w-full h-full rounded-t-full bg-white/20 blur-[2px]"></div>
              </div>
            )}

            {/* Cylinder Base Stand */}
            <div className="w-32 h-3 rounded bg-slate-700 border-t border-slate-600"></div>
          </div>

          {/* Reaction status badge */}
          {isErupting && (
            <div className="mt-3 flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-950/80 px-3 py-1 text-xs font-bold text-orange-300">
              <Flame className="h-3.5 w-3.5 animate-bounce text-orange-400" />
              <span>تفاعل طارد للحرارة شديد! الحرارة: {state.temperatureC}°C</span>
            </div>
          )}
        </div>

        {/* Right Column: Parameters (Concentration, Color, Catalyst) */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
          <div className="space-y-3">
            {/* Peroxide concentration */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
                <span>تركيز فوق أكسيد الهيدروجين (H₂O₂):</span>
                <span className="font-mono text-cyan-400">{peroxideConc}%</span>
              </div>
              <input
                id="slider-peroxide-conc"
                type="range"
                min={3}
                max={35}
                step={1}
                value={peroxideConc}
                disabled={isErupting}
                onChange={(e) => setPeroxideConc(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>منزلي (3%)</span>
                <span>متوسط (12%)</span>
                <span>مخبري فائق (35%)</span>
              </div>
            </div>

            {/* Foam Dye Color */}
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5">
                لون الصبغة والرغوة (Food Coloring):
              </label>
              <div className="flex items-center gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setFoamColor(c.hex);
                    }}
                    className={`h-7 w-7 rounded-full transition-transform ${
                      foamColor === c.hex ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Reaction Outputs Info */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-2">
            <div className="font-bold text-cyan-300">مخرجات التفكك اللحظية:</div>
            <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
              <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                <span className="text-slate-400">غاز O₂ المتولد:</span>
                <div className="font-mono font-bold text-emerald-400">{state.gasReleasedMl} mL</div>
              </div>
              <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                <span className="text-slate-400">حرارة التفاعل:</span>
                <div className="font-mono font-bold text-rose-400">{state.temperatureC}°C</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              المحفز (يوديد البوتاسيوم KI) يسرع تفكك H₂O₂ ملايين المرات دون أن يُستهلك في التفاعل، مما ينتج انفجاراً رغوياً سريعاً.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
