import React, { useState, useEffect, useRef } from 'react';
import { ExperimentState } from '../../types';
import { Sparkles, Flame, Snowflake, RotateCw, Beaker } from 'lucide-react';
import { soundFx } from '../../services/soundEffects';

interface PrecipitationSimulationProps {
  state: ExperimentState;
  onChangeState: (updater: (prev: ExperimentState) => ExperimentState) => void;
}

export const PrecipitationSimulation: React.FC<PrecipitationSimulationProps> = ({
  state,
  onChangeState,
}) => {
  const [selectedSubtype, setSelectedSubtype] = useState<'golden_rain' | 'copper_blue' | 'iron_blood'>('golden_rain');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Precipitation state calculation:
  // For Golden Rain: PbI2 dissolves when Temperature > 80°C (precipitate -> 0%)
  // When cooling below 70°C, crystals precipitate out and glitter
  const isDissolved = selectedSubtype === 'golden_rain' && state.temperatureC >= 80;
  const precipitatePercentage = isDissolved
    ? 0
    : selectedSubtype === 'golden_rain'
    ? Math.max(0, Math.min(100, 100 - (state.temperatureC / 80) * 100))
    : 85;

  // Particle simulation for glittering golden crystals or blue gelatinous flakes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const w = canvas.width;
    const h = canvas.height;

    // Create flakes
    const flakes = Array.from({ length: 90 }).map(() => ({
      x: 30 + Math.random() * (w - 60),
      y: 50 + Math.random() * (h - 100),
      size: 1.5 + Math.random() * 3,
      speedY: 0.3 + Math.random() * 0.7,
      sparkle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.8 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Liquid body coordinates in Erlenmeyer flask
      const liquidTop = 90;
      const liquidBottom = h - 30;

      // Solution base color
      let baseFluidColor = 'rgba(254, 240, 138, 0.2)'; // faint golden tint
      if (selectedSubtype === 'copper_blue') {
        baseFluidColor = 'rgba(2, 132, 199, 0.4)';
      } else if (selectedSubtype === 'iron_blood') {
        baseFluidColor = 'rgba(185, 28, 28, 0.8)';
      }

      // Draw Beaker / Flask Liquid
      ctx.fillStyle = baseFluidColor;
      ctx.beginPath();
      ctx.moveTo(40, liquidTop);
      ctx.lineTo(w - 40, liquidTop);
      ctx.lineTo(w - 20, liquidBottom);
      ctx.lineTo(20, liquidBottom);
      ctx.closePath();
      ctx.fill();

      // If dissolved (hot), draw warm shimmer waves
      if (isDissolved) {
        ctx.fillStyle = 'rgba(253, 224, 71, 0.15)';
        ctx.fillRect(30, liquidTop, w - 60, liquidBottom - liquidTop);
      } else if (selectedSubtype === 'golden_rain') {
        // Draw Falling Golden Rain Flakes
        const time = Date.now() * 0.003;
        flakes.forEach((f) => {
          // Stirrer swirl effect
          const swirl = state.stirrerRpm > 0 ? (state.stirrerRpm / 600) * Math.sin(time + f.y * 0.05) * 2 : 0;
          f.y += f.speedY;
          f.x += swirl;

          // Boundary wrap
          if (f.y > liquidBottom - 8) {
            f.y = liquidTop + Math.random() * 10;
            f.x = 35 + Math.random() * (w - 70);
          }
          if (f.x < 30) f.x = w - 35;
          if (f.x > w - 30) f.x = 35;

          const sparkleAlpha = 0.4 + 0.6 * Math.sin(time * 3 + f.sparkle);

          // Golden glittering flake
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(234, 179, 8, ${sparkleAlpha * (precipitatePercentage / 100)})`;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Settled precipitate layer at bottom
        const sedimentHeight = (precipitatePercentage / 100) * 16;
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(25, liquidBottom - sedimentHeight, w - 50, sedimentHeight);
      } else if (selectedSubtype === 'copper_blue') {
        // Gelatinous blue precipitate clouds
        ctx.fillStyle = 'rgba(14, 165, 233, 0.6)';
        ctx.beginPath();
        ctx.ellipse(w / 2, liquidBottom - 18, 50, 16, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Glassware Outline
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(50, 40);
      ctx.lineTo(w - 50, 40);
      ctx.moveTo(50, 40);
      ctx.lineTo(50, 70);
      ctx.lineTo(20, liquidBottom);
      ctx.lineTo(w - 20, liquidBottom);
      ctx.lineTo(w - 50, 70);
      ctx.lineTo(w - 50, 40);
      ctx.stroke();

      // Magnetic stirrer bar
      if (state.stirrerRpm > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(w / 2 - 12, liquidBottom - 6, 24, 4);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [selectedSubtype, state.temperatureC, state.stirrerRpm, isDissolved, precipitatePercentage]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-400" />
          <h3 className="text-sm font-bold text-white">
            تفاعلات الترسيب وظاهرة "المطر الذهبي"
          </h3>
        </div>

        {/* Subtype tabs */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setSelectedSubtype('golden_rain');
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
              selectedSubtype === 'golden_rain'
                ? 'bg-yellow-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            المطر الذهبي (PbI₂)
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setSelectedSubtype('copper_blue');
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
              selectedSubtype === 'copper_blue'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            راسب النحاس الأزرق
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setSelectedSubtype('iron_blood');
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
              selectedSubtype === 'iron_blood'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            الدم الاصطناعي [Fe(SCN)]²⁺
          </button>
        </div>
      </div>

      {/* Main Visual & Interactive Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Canvas Display */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-4 min-h-[320px] overflow-hidden">
          <canvas ref={canvasRef} width={300} height={280} className="rounded-lg max-w-full" />

          {/* Status Overlay */}
          <div className="absolute top-4 left-4 rounded-lg bg-slate-900/90 border border-slate-700 px-2.5 py-1 text-xs font-mono text-yellow-400">
            {isDissolved ? (
              <span className="text-emerald-400 font-bold">محلول متجانس شفاف (ذائب بالكامل)</span>
            ) : (
              <span>بلورات ذهبية متساقطة ({precipitatePercentage.toFixed(0)}%)</span>
            )}
          </div>

          {/* Heating / Cooling Quick Actions */}
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playHiss(0.3);
                onChangeState((prev) => ({ ...prev, temperatureC: 90, burnerActive: true }));
              }}
              className="flex items-center gap-1.5 rounded-lg border border-orange-500/40 bg-orange-950/40 px-3 py-1 text-xs font-bold text-orange-300 hover:bg-orange-900/60"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>تسخين لإذابة الراسب (90°C)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onChangeState((prev) => ({ ...prev, temperatureC: 15, coolingActive: true }));
              }}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-900/60"
            >
              <Snowflake className="h-3.5 w-3.5" />
              <span>تبريد لتبلور المطر الذهبي (15°C)</span>
            </button>
          </div>
        </div>

        {/* Scientific Analysis Card */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-200 mb-2">
              العلاقة بين الذائبية ودرجة الحرارة (Solubility Curve):
            </h4>
            <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-3 text-xs text-slate-300 space-y-2">
              <p className="leading-relaxed">
                مركب <strong>يوديد الرصاص PbI₂</strong> يمتلك ذائبية ضئيلة جداً في الماء البارد (0.076 g/100mL عند 20°C).
                لكن عند تسخين المحلول لمشارف الغليان (80°C - 100°C)، ترتفع الذائبية بأكثر من <strong>5 أضعاف</strong>، مما يجعل البلورات تذوب وتختفي كلياً.
              </p>
              <p className="leading-relaxed text-amber-300/90">
                عند ترك المحلول يبرد ببطء، تفقد الأيونات طاقتها وتجتمع في صورة رقائق بلورية سداسية براقة تعكس الضوء ببريق خلاب!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-2">
              <div className="text-slate-400 text-[10px]">حاصل الإذابة Ksp</div>
              <div className="font-mono font-bold text-yellow-400">9.8 × 10⁻⁹</div>
            </div>
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-2">
              <div className="text-slate-400 text-[10px]">نسبة الترسيب</div>
              <div className="font-mono font-bold text-cyan-400">{precipitatePercentage.toFixed(0)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
