import React, { useState, useEffect, useRef } from 'react';
import { ExperimentState } from '../../types';
import { Droplet, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { soundFx } from '../../services/soundEffects';

interface TitrationSimulationProps {
  state: ExperimentState;
  onChangeState: (updater: (prev: ExperimentState) => ExperimentState) => void;
}

export const TitrationSimulation: React.FC<TitrationSimulationProps> = ({ state, onChangeState }) => {
  const [isDripping, setIsDripping] = useState<boolean>(false);
  const [historyPoints, setHistoryPoints] = useState<{ volume: number; ph: number }[]>([
    { volume: 0, ph: 1.1 }
  ]);
  const curveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Equivalence point is at 25.0 mL of 0.1M NaOH for 25 mL of 0.1M HCl
  const equivalenceVolume = 25.0;

  // Calculate pH based on volume of NaOH added (mL) and temperature
  const calculateCurrentPH = (volAdded: number, tempC: number) => {
    // Temperature adjustment on Kw: Kw = 1e-14 at 25°C, higher at higher T
    const Kw = Math.pow(10, -14 * (1 - (tempC - 25) * 0.003));
    const initialAcidMoles = 0.0025; // 25 mL of 0.1M HCl
    const baseMolesAdded = (volAdded / 1000) * 0.1; // 0.1M NaOH
    const totalVolumeL = (25 + volAdded) / 1000;

    if (volAdded < equivalenceVolume - 0.05) {
      // Acid in excess
      const remainingAcidMoles = initialAcidMoles - baseMolesAdded;
      const hConc = remainingAcidMoles / totalVolumeL;
      return Math.max(1.0, -Math.log10(hConc));
    } else if (Math.abs(volAdded - equivalenceVolume) <= 0.05) {
      // Near equivalence
      const pKw = -Math.log10(Kw);
      return pKw / 2; // ~ 7.0
    } else {
      // Base in excess
      const excessBaseMoles = baseMolesAdded - initialAcidMoles;
      const ohConc = excessBaseMoles / totalVolumeL;
      const pOh = -Math.log10(ohConc);
      const pKw = -Math.log10(Kw);
      return Math.min(13.5, pKw - pOh);
    }
  };

  // Determine solution color based on chosen indicator and current pH
  const getSolutionColor = (ph: number, indicator: string = 'phenolphthalein') => {
    if (indicator === 'phenolphthalein') {
      if (ph < 8.2) return 'rgba(240, 249, 255, 0.4)'; // Colorless / slight tint
      if (ph > 10.0) return 'rgba(236, 72, 153, 0.85)'; // Intense magenta pink
      // Transition range 8.2 - 10.0
      const ratio = (ph - 8.2) / 1.8;
      return `rgba(244, 114, 182, ${0.3 + ratio * 0.55})`;
    } else if (indicator === 'litmus') {
      if (ph < 5.0) return 'rgba(239, 68, 68, 0.75)'; // Red
      if (ph > 8.0) return 'rgba(59, 130, 246, 0.75)'; // Blue
      return 'rgba(168, 85, 247, 0.75)'; // Purple neutral
    } else if (indicator === 'bromothymol') {
      if (ph < 6.0) return 'rgba(234, 179, 8, 0.8)'; // Yellow
      if (ph > 7.6) return 'rgba(37, 99, 235, 0.8)'; // Blue
      return 'rgba(16, 185, 129, 0.8)'; // Green at neutral
    } else {
      // Universal indicator
      if (ph < 3) return 'rgba(239, 68, 68, 0.85)';
      if (ph < 6) return 'rgba(245, 158, 11, 0.85)';
      if (ph < 8) return 'rgba(34, 197, 94, 0.85)';
      if (ph < 11) return 'rgba(6, 182, 212, 0.85)';
      return 'rgba(147, 51, 234, 0.85)';
    }
  };

  // Single drop addition
  const addSingleDrop = () => {
    soundFx.playDrip();
    onChangeState((prev) => {
      const newVol = Math.min(prev.buretAddedVolumeMl + 0.25, 50);
      const newPh = calculateCurrentPH(newVol, prev.temperatureC);
      const color = getSolutionColor(newPh, prev.currentIndicator);

      // Check equivalence chime
      if (Math.abs(newVol - equivalenceVolume) < 0.3 && Math.abs(prev.buretAddedVolumeMl - equivalenceVolume) >= 0.3) {
        soundFx.playSuccessChime();
      }

      setHistoryPoints((pts) => [...pts, { volume: newVol, ph: newPh }]);

      return {
        ...prev,
        buretAddedVolumeMl: newVol,
        phValue: newPh,
        colorHex: color,
      };
    });
  };

  // Continuous dripping timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDripping) {
      interval = setInterval(() => {
        onChangeState((prev) => {
          if (prev.buretAddedVolumeMl >= 50) {
            setIsDripping(false);
            return prev;
          }
          const step = 0.5;
          const newVol = Number((prev.buretAddedVolumeMl + step).toFixed(1));
          const newPh = calculateCurrentPH(newVol, prev.temperatureC);
          const color = getSolutionColor(newPh, prev.currentIndicator);

          if (Math.abs(newVol - equivalenceVolume) < 0.5 && prev.buretAddedVolumeMl < equivalenceVolume) {
            soundFx.playSuccessChime();
          } else {
            soundFx.playDrip();
          }

          setHistoryPoints((pts) => {
            if (pts.length > 80) return [...pts.slice(1), { volume: newVol, ph: newPh }];
            return [...pts, { volume: newVol, ph: newPh }];
          });

          return {
            ...prev,
            buretAddedVolumeMl: newVol,
            phValue: newPh,
            colorHex: color,
          };
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isDripping]);

  // Reset Titration
  const handleResetTitration = () => {
    soundFx.playClick();
    setIsDripping(false);
    const initialPh = calculateCurrentPH(0, state.temperatureC);
    setHistoryPoints([{ volume: 0, ph: initialPh }]);
    onChangeState((prev) => ({
      ...prev,
      buretAddedVolumeMl: 0,
      phValue: initialPh,
      colorHex: getSolutionColor(initialPh, prev.currentIndicator),
    }));
  };

  // Draw Titration curve canvas
  useEffect(() => {
    const canvas = curveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const padding = { left: 35, right: 15, top: 15, bottom: 25 };

    // Axes lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Y axis
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    // X axis
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.stroke();

    // Axis labels & ticks
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    // Y ticks: 0, 7, 14
    [0, 7, 14].forEach((val) => {
      const y = h - padding.bottom - (val / 14) * (h - padding.top - padding.bottom);
      ctx.fillText(`${val}`, 12, y + 3);
      ctx.beginPath();
      ctx.moveTo(padding.left - 4, y);
      ctx.lineTo(padding.left, y);
      ctx.stroke();
    });

    // Equivalence line marker (V = 25 mL)
    const eqX = padding.left + (equivalenceVolume / 50) * (w - padding.left - padding.right);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#ec4899';
    ctx.beginPath();
    ctx.moveTo(eqX, padding.top);
    ctx.lineTo(eqX, h - padding.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ec4899';
    ctx.fillText('نقطة التكافؤ', eqX - 25, padding.top + 10);

    // Plot historical curve points
    if (historyPoints.length > 1) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      historyPoints.forEach((pt, idx) => {
        const x = padding.left + (pt.volume / 50) * (w - padding.left - padding.right);
        const y = h - padding.bottom - (pt.ph / 14) * (h - padding.top - padding.bottom);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Current point dot
      const last = historyPoints[historyPoints.length - 1];
      const curX = padding.left + (last.volume / 50) * (w - padding.left - padding.right);
      const curY = h - padding.bottom - (last.ph / 14) * (h - padding.top - padding.bottom);
      ctx.beginPath();
      ctx.arc(curX, curY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
    }
  }, [historyPoints]);

  const currentColor = getSolutionColor(state.phValue, state.currentIndicator);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Droplet className="h-4 w-4 text-pink-400" />
          <h3 className="text-sm font-bold text-white">
            جهاز المعايرة المخبري ومقياس التكافؤ
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-titration-drip"
            type="button"
            onClick={addSingleDrop}
            className="flex items-center gap-1 rounded-lg border border-pink-500/40 bg-pink-950/40 px-3 py-1 text-xs font-bold text-pink-300 hover:bg-pink-900/60"
          >
            <Droplet className="h-3.5 w-3.5" />
            <span>قطرة واحدة (+0.25 mL)</span>
          </button>
          <button
            id="btn-titration-toggle-stream"
            type="button"
            onClick={() => {
              soundFx.playClick();
              setIsDripping(!isDripping);
            }}
            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              isDripping
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isDripping ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isDripping ? 'إيقاف الصب' : 'صب مستمر'}</span>
          </button>
          <button
            type="button"
            onClick={handleResetTitration}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
            title="تفريغ وإعادة ملء السحاحة"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Glassware Apparatus & Curve Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Interactive Glassware Visualization */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-4 min-h-[340px] overflow-hidden">
          {/* Glassware SVG Visual */}
          <div className="relative flex flex-col items-center">
            {/* BURET TUBE */}
            <div className="relative w-8 h-40 rounded-t-sm border-2 border-slate-400/60 bg-slate-900/60 backdrop-blur-sm overflow-hidden flex flex-col justify-end">
              {/* NaOH liquid remaining inside Buret (50mL - added) */}
              <div
                className="w-full bg-cyan-400/40 border-t border-cyan-300 transition-all duration-300"
                style={{ height: `${((50 - state.buretAddedVolumeMl) / 50) * 100}%` }}
              ></div>
              {/* Graduations */}
              <div className="absolute inset-0 flex flex-col justify-between p-1 opacity-60 pointer-events-none">
                {[0, 10, 20, 30, 40, 50].map((num) => (
                  <div key={num} className="flex items-center justify-between text-[7px] text-slate-400 font-mono">
                    <span className="w-1.5 h-[1px] bg-slate-400"></span>
                    <span>{num}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buret Stopcock Valve */}
            <div className="relative flex items-center justify-center my-0.5">
              <div className="w-1.5 h-4 bg-slate-400"></div>
              <div
                className={`absolute w-4 h-2 rounded bg-amber-400 cursor-pointer shadow transition-transform ${
                  isDripping ? 'rotate-90' : 'rotate-0'
                }`}
                onClick={() => setIsDripping(!isDripping)}
                title="محبس السحاحة"
              ></div>
            </div>

            {/* Falling Droplets Animation */}
            <div className="h-10 w-2 flex items-center justify-center relative">
              {isDripping && (
                <span className="h-2 w-2 rounded-full bg-cyan-300 animate-bounce shadow-sm shadow-cyan-400"></span>
              )}
            </div>

            {/* ERLENMEYER FLASK */}
            <div className="relative w-36 h-36 flex items-end justify-center">
              {/* Flask Glass Outline SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-lg">
                <defs>
                  <clipPath id="flaskClip">
                    <polygon points="38,20 62,20 85,88 15,88" />
                  </clipPath>
                </defs>

                {/* Flask Body Background with Clip */}
                <polygon points="38,20 62,20 85,88 15,88" fill="rgba(15, 23, 42, 0.6)" />

                {/* Liquid Inside Flask */}
                <g clipPath="url(#flaskClip)">
                  <rect
                    x="0"
                    y={88 - 35 - (state.buretAddedVolumeMl / 50) * 20}
                    width="100"
                    height="80"
                    fill={currentColor}
                    className="transition-colors duration-500"
                  />

                  {/* Magnetic Stirrer Whirlpool Vortex */}
                  {state.stirrerRpm > 0 && (
                    <ellipse
                      cx="50"
                      cy={88 - 35 - (state.buretAddedVolumeMl / 50) * 20}
                      rx="14"
                      ry="3"
                      fill="rgba(255, 255, 255, 0.4)"
                      className="animate-pulse"
                    />
                  )}

                  {/* Magnetic stir bar in bottom */}
                  {state.stirrerRpm > 0 && (
                    <rect
                      x="42"
                      y="82"
                      width="16"
                      height="3.5"
                      rx="1.5"
                      fill="#ffffff"
                      className="animate-spin origin-center"
                    />
                  )}
                </g>

                {/* Flask Glass Edges */}
                <polygon
                  points="38,15 62,15 62,25 86,88 14,88 38,25"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                {/* Flask Neck Rim */}
                <ellipse cx="50" cy="15" rx="13" ry="3" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
              </svg>
            </div>
          </div>

          {/* Magnetic Stirrer Base underneath */}
          <div className="w-44 h-5 rounded-t-lg bg-slate-800 border-t border-slate-700 flex items-center justify-between px-3 text-[9px] text-emerald-400 font-mono">
            <span>STIRRER</span>
            <span>{state.stirrerRpm} RPM</span>
          </div>

          {/* Equivalence Milestone Alert */}
          {Math.abs(state.buretAddedVolumeMl - equivalenceVolume) < 0.6 && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full border border-pink-500 bg-pink-950/80 px-3 py-1 text-xs font-bold text-pink-300 animate-pulse">
              <Sparkles className="h-3.5 w-3.5" />
              <span>تم الوصول لنقطة التكافؤ (pH = 7.0)!</span>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Titration Curve Chart */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200">منحنى المعايرة (pH مقابل الحجم المضاف):</span>
            <span className="text-[11px] font-mono text-cyan-400">
              {state.buretAddedVolumeMl.toFixed(1)} / 50 mL
            </span>
          </div>

          <div className="flex items-center justify-center my-2">
            <canvas
              ref={curveCanvasRef}
              width={290}
              height={180}
              className="w-full max-w-[300px]"
            />
          </div>

          {/* Scientific Info Box */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 text-[11px] text-slate-300 space-y-1">
            <div className="font-semibold text-pink-300 flex items-center gap-1">
              <span>الكاشف الحالي: {state.currentIndicator}</span>
            </div>
            <div className="text-slate-400 leading-relaxed">
              عند نقطة التكافؤ (25.0 mL)، تتعادل تماماً مولات حمض HCl مع مولات قاعدة NaOH، ويحدث الانقلاب اللوني المفاجئ للكاشف.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
