import React from 'react';
import { Volume2, VolumeX, RotateCcw, BookOpen, ShieldAlert, Sparkles, Thermometer, Gauge } from 'lucide-react';
import { soundFx } from '../services/soundEffects';

interface HeaderProps {
  currentTemp: number;
  currentPressure: number;
  onReset: () => void;
  onOpenNotebook: () => void;
  onOpenSafety: () => void;
  notesCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTemp,
  currentPressure,
  onReset,
  onOpenNotebook,
  onOpenSafety,
  notesCount,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-900/30 bg-slate-950/80 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-[2px] shadow-lg shadow-cyan-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <span className="text-xl font-black text-cyan-400 select-none">🧪</span>
            </div>
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                مختبر الكيمياء التفاعلي
              </h1>
              <span className="hidden rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 sm:inline-flex">
                ChemLab Studio
              </span>
            </div>
            <p className="text-xs text-slate-400">
              محاكاة حية للتفاعلات العلمية والغازات والتحكم الدقيق بالحرارة والضغط
            </p>
          </div>
        </div>

        {/* Status Indicators & Fast Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Temp & Pressure badges */}
          <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs md:flex">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Thermometer className="h-3.5 w-3.5" />
              <span className="font-mono font-bold">{currentTemp}°C</span>
            </div>
            <span className="h-3 w-[1px] bg-slate-700"></span>
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Gauge className="h-3.5 w-3.5" />
              <span className="font-mono font-bold">{currentPressure.toFixed(2)} atm</span>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            type="button"
            onClick={() => {
              onToggleMute();
              soundFx.playClick();
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
              isMuted
                ? 'border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300'
                : 'border-cyan-500/40 bg-cyan-950/40 text-cyan-400 shadow-sm shadow-cyan-500/20'
            }`}
            title={isMuted ? 'تشغيل المؤثرات الصوتية' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Reset Experiment */}
          <button
            id="btn-reset-experiment"
            type="button"
            onClick={() => {
              soundFx.playClick();
              onReset();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            title="إعادة تعيين متغيرات التجربة إلى الوضع الابتدائي"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">إعادة ضبط</span>
          </button>

          {/* Lab Notes */}
          <button
            id="btn-open-notebook"
            type="button"
            onClick={() => {
              soundFx.playClick();
              onOpenNotebook();
            }}
            className="relative flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-800 hover:bg-slate-800 hover:text-cyan-300"
            title="سجل الملاحظات والبيانات المخبرية"
          >
            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">سجل التجارب</span>
            {notesCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-slate-950">
                {notesCount}
              </span>
            )}
          </button>

          {/* Safety Guide */}
          <button
            id="btn-open-safety"
            type="button"
            onClick={() => {
              soundFx.playClick();
              onOpenSafety();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-amber-900/40 bg-amber-950/30 px-2.5 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-900/40 hover:text-amber-200"
            title="إرشادات السلامة والرموز الكيميائية"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">السلامة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
