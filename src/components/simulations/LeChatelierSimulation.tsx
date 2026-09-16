import React from 'react';
import { ExperimentState } from '../../types';
import { Scale, ArrowLeftRight, Flame, Gauge, Info } from 'lucide-react';

interface LeChatelierSimulationProps {
  state: ExperimentState;
  onChangeState: (updater: (prev: ExperimentState) => ExperimentState) => void;
}

export const LeChatelierSimulation: React.FC<LeChatelierSimulationProps> = ({ state }) => {
  // Reaction: N2O4 (colorless, 1 mol) <=> 2 NO2 (brown, 2 mol), deltaH > 0 for forward endothermic dissociation
  // K_eq increases with Temperature: K_eq(T) ~ exp(-deltaH / (R * T))
  const tempK = state.temperatureC + 273.15;
  // Normalized equilibrium constant relative to 298.15K
  const K_eq = 0.14 * Math.exp(0.02 * (tempK - 298.15));

  // Pressure effect: P_total
  const P = Math.max(state.pressureAtm, 0.1);

  // Equilibrium fraction of NO2 (alpha = degree of dissociation)
  // K_eq = 4 * alpha^2 * P / (1 - alpha^2) => alpha = sqrt(K / (4P + K))
  const alpha = Math.min(Math.max(Math.sqrt(K_eq / (4 * P + K_eq)), 0.05), 0.95);

  const percentNO2 = Math.round(alpha * 100);
  const percentN2O4 = 100 - percentNO2;

  // Gas Chamber Color calculation:
  // N2O4 is colorless (rgba(255,255,255, 0.05))
  // NO2 is dark reddish brown (rgba(180, 83, 9, opacity based on alpha and pressure))
  const brownOpacity = Math.min(0.15 + alpha * 0.75 * Math.min(P / 2, 1.2), 0.95);
  const chamberColor = `rgba(180, 83, 9, ${brownOpacity})`;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">
            مبدأ لوشاتيليه: استجابة الاتزان للحرارة والضغط
          </h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/30 px-2.5 py-1 text-xs font-mono text-amber-300">
          <ArrowLeftRight className="h-3 w-3" />
          <span>N₂O₄ ⇌ 2NO₂</span>
        </div>
      </div>

      {/* Main Equilibrium Chamber Simulation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Gas Cylinder with Dynamic Color & Gas molecules */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-6 min-h-[300px] overflow-hidden">
          {/* Cylinder Shell */}
          <div className="relative w-48 h-64 rounded-2xl border-4 border-slate-600 bg-slate-950 overflow-hidden shadow-2xl flex flex-col justify-end">
            {/* Movable Piston at top reflecting pressure */}
            <div
              className="absolute w-full h-8 bg-gradient-to-b from-slate-600 to-slate-700 border-b-2 border-amber-500/80 shadow-md flex items-center justify-center text-[10px] font-mono text-amber-300 transition-all duration-300"
              style={{ top: `${Math.min(P * 5, 80)}px` }}
            >
              مكبس: {P.toFixed(1)} atm
            </div>

            {/* Gas Volume Filled with dynamic Color */}
            <div
              className="w-full transition-all duration-500 flex flex-col items-center justify-center relative p-3"
              style={{
                backgroundColor: chamberColor,
                height: `${256 - Math.min(P * 5, 80)}px`,
              }}
            >
              {/* Floating Gas Molecules Visual Badges */}
              <div className="absolute inset-0 flex flex-wrap items-center justify-around p-3 pointer-events-none opacity-80">
                {Array.from({ length: Math.round(percentNO2 / 12) + 2 }).map((_, i) => (
                  <span
                    key={`no2-${i}`}
                    className="rounded-full bg-amber-950/80 border border-amber-600 px-1.5 py-0.5 text-[9px] font-bold text-amber-200 animate-pulse"
                  >
                    NO₂
                  </span>
                ))}
                {Array.from({ length: Math.round(percentN2O4 / 15) + 2 }).map((_, i) => (
                  <span
                    key={`n2o4-${i}`}
                    className="rounded-full bg-slate-900/80 border border-cyan-500/40 px-1.5 py-0.5 text-[9px] font-bold text-cyan-200"
                  >
                    N₂O₄
                  </span>
                ))}
              </div>

              {/* Color Label */}
              <div className="z-10 rounded-lg bg-slate-950/80 px-2.5 py-1 text-center backdrop-blur-sm border border-slate-700/60 shadow">
                <div className="text-xs font-bold text-white">
                  {alpha > 0.6 ? 'بني محمر داكن (NO₂ سائد)' : alpha < 0.3 ? 'شفاف باهت (N₂O₄ سائد)' : 'بني متوسط (خليط متوازن)'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  كثافة اللون: {Math.round(brownOpacity * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Underneath Heat/Cooling status */}
          <div className="mt-3 flex items-center gap-2 text-xs">
            {state.temperatureC > 30 ? (
              <span className="flex items-center gap-1 text-orange-400 font-medium">
                <Flame className="h-3.5 w-3.5" /> تسخين: يرجح تكوين NO₂ البني (ماص للحرارة)
              </span>
            ) : state.temperatureC < 15 ? (
              <span className="flex items-center gap-1 text-cyan-400 font-medium">
                تبريد: يرجح تكوين N₂O₄ عديم اللون (طارد للحرارة)
              </span>
            ) : (
              <span className="text-slate-400">درجة حرارة معتدلة للاتزان</span>
            )}
          </div>
        </div>

        {/* Right: Molar Composition Bar & Scientific Breakdown */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-200 mb-2">
              النسب المئوية عند موضع الاتزان:
            </h4>

            {/* Progress Bar for N2O4 vs NO2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-cyan-400">N₂O₄ (عديم اللون): {percentN2O4}%</span>
                <span className="text-amber-400">2NO₂ (بني): {percentNO2}%</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800 flex">
                <div
                  className="bg-gradient-to-r from-cyan-600 to-teal-500 transition-all duration-500"
                  style={{ width: `${percentN2O4}%` }}
                ></div>
                <div
                  className="bg-gradient-to-r from-amber-600 to-orange-700 transition-all duration-500"
                  style={{ width: `${percentNO2}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Detailed Le Chatelier Explanation Matrix */}
          <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Info className="h-4 w-4" />
              <span>تفسير لوشاتيليه للمتغيرات:</span>
            </div>

            <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>تأثير الحرارة:</strong> تفكك N₂O₄ تفاعل ماص للحرارة (+ΔH)، لذا فإن رفع درجة الحرارة يدفع الاتزان للأمام نحو 2NO₂، فيزداد اللون البني قتامة.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  <strong>تأثير الضغط:</strong> زيادة الضغط ترجح الاتجاه ذا عدد المولات الأقل (مول واحد N₂O₄ مقابل مولين NO₂)، مما يدفع التفاعل عكسياً ويقلل اللون البني.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong>المحفز:</strong> يزيد من سرعة الوصول إلى موضع الاتزان لكلا الاتجاهين دون تغيير النسبة النهائية.
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Equilibrium Metrics */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-2">
              <div className="text-slate-400 text-[10px]">ثابت الاتزان K_eq</div>
              <div className="font-mono font-bold text-amber-400">{K_eq.toFixed(3)}</div>
            </div>
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-2">
              <div className="text-slate-400 text-[10px]">درجة التفكك (α)</div>
              <div className="font-mono font-bold text-cyan-400">{(alpha * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
