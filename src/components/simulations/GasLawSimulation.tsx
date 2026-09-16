import React, { useRef, useEffect, useState } from 'react';
import { ExperimentState } from '../../types';
import { Play, Pause, Plus, Minus, Wind, Sparkles } from 'lucide-react';
import { soundFx } from '../../services/soundEffects';

interface GasLawSimulationProps {
  state: ExperimentState;
  onChangeState: (updater: (prev: ExperimentState) => ExperimentState) => void;
}

interface Molecule {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export const GasLawSimulation: React.FC<GasLawSimulationProps> = ({ state, onChangeState }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [selectedGas, setSelectedGas] = useState<'He' | 'N2' | 'O2' | 'CO2'>('He');
  const moleculesRef = useRef<Molecule[]>([]);

  // Gas properties
  const gasConfig = {
    He: { name: 'هيليوم (He)', molarMass: 4, radius: 4, baseColor: '#38bdf8' },
    N2: { name: 'نيتروجين (N₂)', molarMass: 28, radius: 5.5, baseColor: '#a855f7' },
    O2: { name: 'أكسجين (O₂)', molarMass: 32, radius: 6, baseColor: '#3b82f6' },
    CO2: { name: 'ثاني أكسيد الكربون (CO₂)', molarMass: 44, radius: 7, baseColor: '#10b981' },
  };

  // Initialize or re-populate molecules
  useEffect(() => {
    const count = Math.min(Math.max(Math.round(state.moles * 40), 15), 150);
    const config = gasConfig[selectedGas];
    const newMolecules: Molecule[] = [];
    const width = 340;
    const height = 280;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random();
      newMolecules.push({
        x: 30 + Math.random() * (width - 60),
        y: 80 + Math.random() * (height - 100),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: config.radius,
        color: config.baseColor,
      });
    }
    moleculesRef.current = newMolecules;
  }, [selectedGas, state.moles]);

  // Main Canvas Physics Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastCollisionSound = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      // Piston calculation: volume (1L to 10L) maps to piston Y position (top to bottom)
      // Volume = 1L -> piston is very low (small chamber); Volume = 10L -> piston is high
      const minPistonY = 40;
      const maxPistonY = height - 60;
      const pistonY = maxPistonY - ((state.volumeL - 1) / 9) * (maxPistonY - minPistonY);

      // Speed multiplier based on absolute temperature (v ~ sqrt(T))
      const tempK = Math.max(state.temperatureC + 273.15, 10);
      const speedFactor = Math.sqrt(tempK / 298.15) * 1.6;

      // Draw Chamber Cylinder Walls
      const chamberLeft = 40;
      const chamberRight = width - 40;
      const chamberBottom = height - 20;

      // Cylinder background
      const bgGrad = ctx.createLinearGradient(chamberLeft, 0, chamberRight, 0);
      bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
      bgGrad.addColorStop(0.5, 'rgba(30, 41, 59, 0.7)');
      bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(chamberLeft, pistonY, chamberRight - chamberLeft, chamberBottom - pistonY);

      // Draw Bunsen burner heat glow underneath if temperature > 50°C
      if (state.temperatureC > 50) {
        const glowGrad = ctx.createRadialGradient(
          width / 2,
          chamberBottom + 10,
          5,
          width / 2,
          chamberBottom + 10,
          80
        );
        glowGrad.addColorStop(0, 'rgba(249, 115, 22, 0.8)');
        glowGrad.addColorStop(0.6, 'rgba(239, 68, 68, 0.3)');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(chamberLeft - 20, chamberBottom - 10, chamberRight - chamberLeft + 40, 50);

        // Animated flame tongues
        const time = Date.now() * 0.005;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(width / 2 - 25, chamberBottom + 15);
        ctx.quadraticCurveTo(
          width / 2 - 10 + Math.sin(time) * 6,
          chamberBottom - 5 - (state.temperatureC / 600) * 20,
          width / 2,
          chamberBottom + 15
        );
        ctx.quadraticCurveTo(
          width / 2 + 10 + Math.cos(time) * 6,
          chamberBottom - 10 - (state.temperatureC / 600) * 25,
          width / 2 + 25,
          chamberBottom + 15
        );
        ctx.fill();
      }

      // Draw Ice Frost if cooling active
      if (state.temperatureC < 10) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 3;
        ctx.strokeRect(chamberLeft, chamberBottom - 15, chamberRight - chamberLeft, 10);
      }

      // Draw Chamber Borders
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Left wall
      ctx.moveTo(chamberLeft, 20);
      ctx.lineTo(chamberLeft, chamberBottom);
      // Bottom wall
      ctx.lineTo(chamberRight, chamberBottom);
      // Right wall
      ctx.lineTo(chamberRight, 20);
      ctx.stroke();

      // Measurement tick marks on cylinder wall
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      for (let v = 1; v <= 10; v++) {
        const y = maxPistonY - ((v - 1) / 9) * (maxPistonY - minPistonY);
        ctx.beginPath();
        ctx.moveTo(chamberLeft, y);
        ctx.lineTo(chamberLeft + 8, y);
        ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.fillText(`${v}L`, chamberLeft + 12, y + 3);
      }

      // Update & Draw Molecules
      let collisionsThisFrame = 0;
      moleculesRef.current.forEach((m) => {
        if (isRunning) {
          m.x += m.vx * speedFactor;
          m.y += m.vy * speedFactor;

          // Wall collision: Left & Right
          if (m.x - m.radius < chamberLeft + 2) {
            m.x = chamberLeft + 2 + m.radius;
            m.vx = -m.vx;
            collisionsThisFrame++;
          } else if (m.x + m.radius > chamberRight - 2) {
            m.x = chamberRight - 2 - m.radius;
            m.vx = -m.vx;
            collisionsThisFrame++;
          }

          // Wall collision: Bottom
          if (m.y + m.radius > chamberBottom - 2) {
            m.y = chamberBottom - 2 - m.radius;
            m.vy = -m.vy;
            collisionsThisFrame++;
          }

          // Collision with Piston bottom surface
          if (m.y - m.radius < pistonY + 12) {
            m.y = pistonY + 12 + m.radius;
            m.vy = Math.abs(m.vy);
            collisionsThisFrame++;
          }
        }

        // Color shifting with temperature
        let moleculeGlow = m.color;
        if (state.temperatureC > 150) {
          moleculeGlow = '#f97316';
        } else if (state.temperatureC < 0) {
          moleculeGlow = '#38bdf8';
        }

        // Draw Molecule
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = moleculeGlow;
        ctx.shadowColor = moleculeGlow;
        ctx.shadowBlur = state.temperatureC > 100 ? 8 : 3;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Occasional faint sound on heavy collisions
      if (collisionsThisFrame > 4 && Date.now() - lastCollisionSound > 600) {
        soundFx.playBubble();
        lastCollisionSound = Date.now();
      }

      // Draw Movable Piston
      // Piston rod
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(width / 2 - 6, 10, 12, pistonY);
      // Piston head weight
      const pistonGrad = ctx.createLinearGradient(chamberLeft + 2, pistonY, chamberRight - 2, pistonY + 14);
      pistonGrad.addColorStop(0, '#475569');
      pistonGrad.addColorStop(0.5, '#cbd5e1');
      pistonGrad.addColorStop(1, '#334155');
      ctx.fillStyle = pistonGrad;
      ctx.fillRect(chamberLeft + 2, pistonY, chamberRight - chamberLeft - 4, 14);

      // Piston seal rings
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(chamberLeft + 2, pistonY + 3, chamberRight - chamberLeft - 4, 2);
      ctx.fillRect(chamberLeft + 2, pistonY + 9, chamberRight - chamberLeft - 4, 2);

      // Piston weight load label
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`مكبس الضغط: ${state.pressureAtm.toFixed(1)} atm`, width / 2, pistonY + 10);
      ctx.textAlign = 'start';

      if (isRunning) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isRunning, state.volumeL, state.temperatureC, state.pressureAtm, selectedGas]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      {/* Simulation Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-bold text-white">
            محاكاة حركة الجزيئات والأسطوانة الحرارية
          </span>
        </div>

        {/* Gas Selector Tabs */}
        <div className="flex items-center gap-1">
          {(Object.keys(gasConfig) as Array<keyof typeof gasConfig>).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSelectedGas(g);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-colors ${
                selectedGas === g
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Physics Canvas Container */}
      <div className="relative flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={380}
          height={320}
          className="max-w-full touch-none select-none rounded-lg"
        />

        {/* Floating Play/Pause & Add Moles controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-slate-900/80 backdrop-blur-sm p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setIsRunning(!isRunning);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700"
            title={isRunning ? 'إيقاف مؤقت' : 'استئناف المحاكاة'}
          >
            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onChangeState((prev) => ({
                ...prev,
                moles: Math.min(prev.moles + 0.25, 3.0),
              }));
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700"
            title="حقن جزيئات غاز إضافية (+0.25 mol)"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onChangeState((prev) => ({
                ...prev,
                moles: Math.max(prev.moles - 0.25, 0.25),
              }));
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-rose-400 hover:bg-slate-700"
            title="تفريغ جزء من الغاز (-0.25 mol)"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Dynamic Formula Display Tag */}
        <div className="absolute bottom-4 left-4 rounded-lg border border-cyan-500/30 bg-slate-900/90 px-3 py-1.5 text-xs text-cyan-300 font-mono">
          <div>PV = nRT</div>
          <div className="text-[10px] text-slate-400">
            ({state.pressureAtm.toFixed(2)} atm) × ({state.volumeL.toFixed(1)} L) = {(state.pressureAtm * state.volumeL).toFixed(2)} L·atm
          </div>
        </div>
      </div>

      {/* Live Relationship Explainer Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
          <div className="font-bold text-amber-400">قانون شارل (Charles's Law)</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            عند ثبوت الضغط، يتناسب الحجم طردياً مع درجة الحرارة المطلقة (V ∝ T).
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
          <div className="font-bold text-cyan-400">قانون بويل (Boyle's Law)</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            عند ثبوت الحرارة، يتناسب حجم الغاز عكسياً مع الضغط الواقع عليه (P ∝ 1/V).
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
          <div className="font-bold text-emerald-400">قانون غاي-لوساك (Gay-Lussac)</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            عند ثبوت الحجم، يتناسب ضغط الغاز طردياً مع درجة حرارته (P ∝ T).
          </div>
        </div>
      </div>
    </div>
  );
};
