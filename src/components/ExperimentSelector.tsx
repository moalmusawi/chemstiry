import React, { useState } from 'react';
import { EXPERIMENTS_LIST } from '../data/experimentsData';
import { ExperimentInfo, ExperimentCategory } from '../types';
import { Sparkles, Flame, Wind, Droplets, Zap, Beaker, Scale } from 'lucide-react';
import { soundFx } from '../services/soundEffects';

interface ExperimentSelectorProps {
  selectedExpId: string;
  onSelectExperiment: (exp: ExperimentInfo) => void;
}

export const ExperimentSelector: React.FC<ExperimentSelectorProps> = ({
  selectedExpId,
  onSelectExperiment,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'جميع التجارب', icon: Beaker },
    { id: 'thermodynamics', label: 'الغازات والديناميكا', icon: Wind },
    { id: 'acids_bases', label: 'الأحماض والقواعد', icon: Droplets },
    { id: 'equilibrium', label: 'الاتزان الكيميائي', icon: Scale },
    { id: 'kinetics', label: 'الحركية والترسيب', icon: Flame },
    { id: 'electrochemistry', label: 'الكيمياء الكهربائية', icon: Zap },
    { id: 'sandbox', label: 'المختبر الحر', icon: Sparkles },
  ];

  const filteredExperiments = EXPERIMENTS_LIST.filter((exp) => {
    if (filterCategory === 'all') return true;
    return exp.category === filterCategory;
  });

  return (
    <section className="w-full space-y-4">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = filterCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`filter-cat-${cat.id}`}
              type="button"
              onClick={() => {
                soundFx.playClick();
                setFilterCategory(cat.id);
              }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Horizontal Carousel / Grid of Experiments */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredExperiments.map((exp) => {
          const isSelected = exp.id === selectedExpId;

          // Color theme per category
          const categoryColors: Record<ExperimentCategory, { border: string; bg: string; badge: string }> = {
            thermodynamics: { border: 'border-cyan-500', bg: 'from-cyan-950/40 to-slate-900', badge: 'bg-cyan-500/20 text-cyan-300' },
            acids_bases: { border: 'border-pink-500', bg: 'from-pink-950/40 to-slate-900', badge: 'bg-pink-500/20 text-pink-300' },
            equilibrium: { border: 'border-amber-500', bg: 'from-amber-950/40 to-slate-900', badge: 'bg-amber-500/20 text-amber-300' },
            kinetics: { border: 'border-orange-500', bg: 'from-orange-950/40 to-slate-900', badge: 'bg-orange-500/20 text-orange-300' },
            electrochemistry: { border: 'border-blue-500', bg: 'from-blue-950/40 to-slate-900', badge: 'bg-blue-500/20 text-blue-300' },
            sandbox: { border: 'border-emerald-500', bg: 'from-emerald-950/40 to-slate-900', badge: 'bg-emerald-500/20 text-emerald-300' },
          };

          const theme = categoryColors[exp.category];

          return (
            <div
              key={exp.id}
              id={`exp-card-${exp.id}`}
              onClick={() => {
                soundFx.playClick();
                onSelectExperiment(exp);
              }}
              className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                isSelected
                  ? `border-2 ${theme.border} bg-gradient-to-b ${theme.bg} shadow-xl shadow-cyan-950/50 ring-2 ring-cyan-500/20`
                  : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              {/* Top Row: Difficulty & Active Pin */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${theme.badge}`}>
                  {exp.difficulty}
                </span>

                {isSelected && (
                  <span className="flex items-center gap-1 rounded-full bg-cyan-500 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-950 animate-pulse"></span>
                    نشطة حالياً
                  </span>
                )}
              </div>

              {/* Title & English Subtitle */}
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                {exp.titleAr}
              </h3>
              <p className="text-[11px] text-slate-400 font-sans tracking-wide mt-0.5">
                {exp.titleEn}
              </p>

              {/* Chemical Equation Box */}
              <div className="mt-2.5 rounded-lg border border-slate-800/90 bg-slate-950/80 px-2.5 py-1.5 font-mono text-[11px] text-cyan-300 dir-ltr text-center truncate">
                {exp.equation}
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {exp.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-slate-800/70 px-1.5 py-0.5 text-[10px] text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
