import React, { useState } from 'react';
import { ExperimentState } from '../../types';
import { SANDBOX_REAGENTS } from '../../data/experimentsData';
import { Sparkles, Flame, Plus, RotateCcw, Droplets, AlertTriangle } from 'lucide-react';
import { soundFx } from '../../services/soundEffects';

interface SandboxLabSimulationProps {
  state: ExperimentState;
  onChangeState: (updater: (prev: ExperimentState) => ExperimentState) => void;
}

interface ReactionOutcome {
  title: string;
  description: string;
  color: string;
  isVigorous: boolean;
  gasEmitted: string;
  precipitate: string;
  ph: number;
  hazard?: string;
}

export const SandboxLabSimulation: React.FC<SandboxLabSimulationProps> = ({
  state,
  onChangeState,
}) => {
  const [reagentA, setReagentA] = useState<string>('water');
  const [reagentB, setReagentB] = useState<string>('none');
  const [reactionResult, setReactionResult] = useState<ReactionOutcome | null>(null);

  // Compute reaction outcome when user mixes reagents
  const handleMixReagents = () => {
    soundFx.playBubble();
    soundFx.playHiss(0.4);

    let res: ReactionOutcome = {
      title: 'مزيج متجانس ومستقر',
      description: 'لا يوجد تفاعل كيميائي ملحوظ، المواد مذابة ومستقرة فيزيائياً.',
      color: '#0ea5e9',
      isVigorous: false,
      gasEmitted: 'لا يوجد',
      precipitate: 'لا يوجد',
      ph: 7.0,
    };

    // Sodium + Water
    if ((reagentA === 'na_metal' && reagentB === 'water') || (reagentB === 'na_metal' && reagentA === 'water')) {
      res = {
        title: 'تفاعل عنيف لفلز الصوديوم مع الماء!',
        description: '2Na + 2H₂O → 2NaOH + H₂↑. يتصاعد غاز الهيدروجين بسرعة فائقة مع اشتعال وشرر أصفر وحرارة عالية، ويصبح المحلول قاعدياً قوياً.',
        color: '#f97316',
        isVigorous: true,
        gasEmitted: 'هيدروجين H₂ (شديد الاشتعال)',
        precipitate: 'لا يوجد',
        ph: 13.5,
        hazard: 'انفجار وحرارة شديدة',
      };
      soundFx.playHiss(0.8);
      onChangeState((p) => ({ ...p, temperatureC: p.temperatureC + 50, phValue: 13.5 }));
    }
    // Baking soda + Vinegar
    else if ((reagentA === 'baking_soda' && reagentB === 'vinegar') || (reagentB === 'baking_soda' && reagentA === 'vinegar')) {
      res = {
        title: 'فوران حمضي قاعدي نشط!',
        description: 'NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂↑. فوران رغوي غزير لغاز ثاني أكسيد الكربون مع تبريد طفيف للمحلول (ماص للحرارة).',
        color: '#e0f2fe',
        isVigorous: true,
        gasEmitted: 'ثاني أكسيد الكربون CO₂',
        precipitate: 'لا يوجد',
        ph: 6.5,
      };
      soundFx.playBubble();
      onChangeState((p) => ({ ...p, temperatureC: Math.max(10, p.temperatureC - 5), phValue: 6.5 }));
    }
    // HCl + NaOH Neutralization
    else if ((reagentA === 'hcl' && reagentB === 'naoh') || (reagentB === 'hcl' && reagentA === 'naoh')) {
      res = {
        title: 'تفاعل تعادل كلاسيكي طارد للحرارة',
        description: 'HCl + NaOH → NaCl + H₂O. تتحد أيونات الهيدروجين مع الهيدروكسيد لتكوين الماء المقطر وملح الطعام مع تصاعد حرارة ملحوظة.',
        color: '#f8fafc',
        isVigorous: false,
        gasEmitted: 'بخار ماء طفيف',
        precipitate: 'لا يوجد',
        ph: 7.0,
      };
      soundFx.playSuccessChime();
      onChangeState((p) => ({ ...p, temperatureC: p.temperatureC + 18, phValue: 7.0 }));
    }
    // Magnesium + HCl
    else if ((reagentA === 'mg_ribbon' && reagentB === 'hcl') || (reagentB === 'mg_ribbon' && reagentA === 'hcl')) {
      res = {
        title: 'إزاحة فلز المغنيسيوم للهيدروجين',
        description: 'Mg + 2HCl → MgCl₂ + H₂↑. انطلاق فقاعات سريعة جداً من غاز الهيدروجين مع ذوبان شريط المغنيسيوم وتولد حرارة.',
        color: '#cbd5e1',
        isVigorous: true,
        gasEmitted: 'هيدروجين H₂',
        precipitate: 'لا يوجد',
        ph: 3.5,
      };
      soundFx.playBubble();
      onChangeState((p) => ({ ...p, temperatureC: p.temperatureC + 25, phValue: 3.5 }));
    }
    // CuSO4 + NaOH (Blue precipitate)
    else if ((reagentA === 'cuso4' && reagentB === 'naoh') || (reagentB === 'cuso4' && reagentA === 'naoh')) {
      res = {
        title: 'ترسيب هيدروكسيد النحاس الأزرق الهلامي',
        description: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄. يتشكل راسب أزرق ملكي جيلاتيني كثيف يترسب في قاع الكأس.',
        color: '#0284c7',
        isVigorous: false,
        gasEmitted: 'لا يوجد',
        precipitate: 'Cu(OH)₂ هلامي أزرق',
        ph: 9.0,
      };
      soundFx.playSuccessChime();
      onChangeState((p) => ({ ...p, phValue: 9.0 }));
    }
    // H2O2 + Catalyst (KI or Iron)
    else if ((reagentA === 'h2o2' && (reagentB === 'ki' || reagentB === 'iron_filings')) ||
             (reagentB === 'h2o2' && (reagentA === 'ki' || reagentA === 'iron_filings'))) {
      res = {
        title: 'تفكك حفزي سريع لفوق أكسيد الهيدروجين',
        description: '2H₂O₂ → 2H₂O + O₂↑. المحفز يسرع التفكك وينطلق غاز الأكسجين فوراً مع حرارة واضحة.',
        color: '#eab308',
        isVigorous: true,
        gasEmitted: 'أكسجين O₂ نشط',
        precipitate: 'لا يوجد',
        ph: 6.8,
      };
      soundFx.playBubble();
      onChangeState((p) => ({ ...p, temperatureC: p.temperatureC + 35, phValue: 6.8 }));
    }

    setReactionResult(res);
  };

  const handleResetSandbox = () => {
    soundFx.playClick();
    setReagentA('water');
    setReagentB('none');
    setReactionResult(null);
    onChangeState((p) => ({ ...p, temperatureC: 25, phValue: 7.0, stirrerRpm: 150 }));
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">
            طاولة المختبر الحر للاكتشاف والمزج الكيميائي
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-sandbox-mix"
            type="button"
            onClick={handleMixReagents}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>خلط وتفعيل التفاعل</span>
          </button>
          <button
            type="button"
            onClick={handleResetSandbox}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
            title="تفريغ الكأس وتنظيف الطاولة"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Simulation Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Interactive Beaker on Workbench */}
        <div className="relative flex flex-col items-center justify-end rounded-xl border border-slate-800 bg-slate-950 p-6 min-h-[340px] overflow-hidden">
          {/* Reaction Bubbles / Smoke particles */}
          {reactionResult?.isVigorous && (
            <div className="absolute top-8 flex gap-3 pointer-events-none">
              <span className="h-6 w-6 rounded-full bg-slate-200/60 blur-sm animate-ping"></span>
              <span className="h-8 w-8 rounded-full bg-slate-300/40 blur-md animate-pulse"></span>
            </div>
          )}

          {/* Reaction Beaker Vessel */}
          <div className="relative w-44 h-56 flex flex-col justify-end items-center">
            {/* Beaker Glass Body */}
            <div className="relative w-40 h-48 rounded-b-2xl border-2 border-slate-400/80 bg-slate-900/40 backdrop-blur-sm overflow-hidden flex flex-col justify-end p-2">
              {/* Liquid layer inside Beaker */}
              <div
                className="w-full h-32 rounded-b-xl border-t border-cyan-400/40 transition-all duration-500 relative flex flex-col items-center justify-center"
                style={{
                  backgroundColor: reactionResult ? reactionResult.color : '#0284c7',
                  opacity: 0.85,
                }}
              >
                {/* Effervescent bubbles inside */}
                {reactionResult?.isVigorous && (
                  <div className="absolute inset-0 flex flex-wrap justify-around items-end p-2 overflow-hidden pointer-events-none">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full bg-white animate-bounce opacity-80"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      ></span>
                    ))}
                  </div>
                )}

                {/* Magnetic stir bar */}
                {state.stirrerRpm > 0 && (
                  <div className="absolute bottom-2 w-8 h-2 rounded-full bg-white animate-spin origin-center"></div>
                )}
              </div>

              {/* Beaker Volume graduation lines */}
              <div className="absolute inset-y-4 right-2 flex flex-col justify-between text-[7px] text-slate-400 font-mono pointer-events-none">
                <span>300 mL</span>
                <span>200 mL</span>
                <span>100 mL</span>
              </div>
            </div>

            {/* Bunsen Burner Flame underneath if active */}
            {state.temperatureC > 50 && (
              <div className="mt-1 flex flex-col items-center">
                <div className="w-6 h-10 rounded-full bg-amber-400 blur-[2px] animate-bounce"></div>
                <div className="w-10 h-3 rounded bg-slate-700"></div>
              </div>
            )}
          </div>

          {/* Result Alert Badge */}
          {reactionResult && (
            <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-950/80 p-2.5 text-xs text-center">
              <div className="font-bold text-emerald-300">{reactionResult.title}</div>
              <div className="text-[11px] text-slate-300 mt-1">{reactionResult.description}</div>
            </div>
          )}
        </div>

        {/* Right: Chemical Shelf & Ingredient Choosers */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200">
              رف الكواشف والمواد الكيميائية:
            </h4>

            {/* Select Reagent A */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                المادة الأولى (الكاشف A):
              </label>
              <select
                id="select-reagent-a"
                value={reagentA}
                onChange={(e) => {
                  soundFx.playClick();
                  setReagentA(e.target.value);
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-cyan-300 focus:outline-none"
              >
                {SANDBOX_REAGENTS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nameAr} - {r.formula}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Reagent B */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                المادة الثانية (الكاشف B):
              </label>
              <select
                id="select-reagent-b"
                value={reagentB}
                onChange={(e) => {
                  soundFx.playClick();
                  setReagentB(e.target.value);
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-amber-300 focus:outline-none"
              >
                <option value="none">-- بدون مادة إضافية --</option>
                {SANDBOX_REAGENTS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nameAr} - {r.formula}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Mixing Suggestions */}
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs">
            <div className="font-bold text-slate-300">خلطات تجريبية مقترحة للاكتشاف:</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setReagentA('water');
                  setReagentB('na_metal');
                }}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] text-orange-300 hover:border-orange-500"
              >
                ماء + صوديوم ⚡
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setReagentA('vinegar');
                  setReagentB('baking_soda');
                }}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] text-cyan-300 hover:border-cyan-500"
              >
                خل + بيكربونات (فوران) 🫧
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setReagentA('hcl');
                  setReagentB('naoh');
                }}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] text-emerald-300 hover:border-emerald-500"
              >
                حمض + قاعدة (تعادل) ⚖️
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setReagentA('cuso4');
                  setReagentB('naoh');
                }}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] text-blue-300 hover:border-blue-500"
              >
                كبريتات نحاس + صودا كاوية 💎
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
