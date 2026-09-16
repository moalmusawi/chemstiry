import React from 'react';
import { ShieldAlert, X, AlertTriangle, Eye, Flame, Droplets, Wind, CheckCircle2 } from 'lucide-react';

interface SafetyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyGuideModal: React.FC<SafetyGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const safetyRules = [
    {
      icon: Eye,
      title: 'حماية العين والوجه (PPE)',
      desc: 'ارتداء نظارات الأمان المخبرية الواقية طوال فترة إجراء التجارب لمنع تناثر الأحماض أو الرواسب الساخنة.',
      color: 'text-cyan-400',
    },
    {
      icon: Flame,
      title: 'التعامل مع اللهب والحرارة',
      desc: 'إطفاء موقد بنزن عند عدم الاستخدام، وعدم تسخين الأوعية الزجاجية المغلقة بإحكام تجنباً لفرط الضغط والانفجار.',
      color: 'text-amber-400',
    },
    {
      icon: Droplets,
      title: 'سكب وتخفيف الأحماض والقواعد',
      desc: 'يُضاف الحمض دائماً إلى الماء ببطء مع التحريك المستمر، ولا يُسكب الماء فوق الحمض المركز أبداً.',
      color: 'text-rose-400',
    },
    {
      icon: Wind,
      title: 'التهوية وطرد الغازات (Fume Hood)',
      desc: 'إجراء تفاعلات انبعاث الغازات السامة أو الخانقة (مثل NO₂ أو Cl₂) داخل خزانة طرد الغازات المهواة.',
      color: 'text-emerald-400',
    },
  ];

  const ghsSymbols = [
    { label: 'مادة كاوية (Corrosive)', code: 'GHS05', desc: 'تسبب تآكل المعادن وحروقاً كيميائية للجلد (مثل HCl, NaOH).' },
    { label: 'قابلة للاشتعال (Flammable)', code: 'GHS02', desc: 'تشتعل بسهولة عند ملامسة الحرارة أو الشرر (مثل الصوديوم Na, الكحول).' },
    { label: 'مؤكسدة قوية (Oxidizer)', code: 'GHS03', desc: 'تغذي الحرائق بانبعاث الأكسجين الفعال (مثل H₂O₂ 30%).' },
    { label: 'غاز تحت ضغط (Compressed Gas)', code: 'GHS04', desc: 'أسطوانات الغازات المضغوطة المعرضة للانفجار عند ارتفاع الحرارة.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">دليل السلامة الكيميائية والبروتوكول المخبري</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-4 max-h-96 space-y-4 overflow-y-auto pr-1">
          {/* Core Rules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {safetyRules.map((rule, idx) => {
              const Icon = rule.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs space-y-1"
                >
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <Icon className={`h-4 w-4 ${rule.color}`} />
                    <span>{rule.title}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">{rule.desc}</p>
                </div>
              );
            })}
          </div>

          {/* GHS Pictograms Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 text-xs space-y-2.5">
            <h3 className="font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              <span>رموز الخطورة الكيميائية الدولية (GHS Standards):</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ghsSymbols.map((item, i) => (
                <div key={i} className="rounded-lg bg-slate-900 p-2 border border-slate-800 text-[11px]">
                  <div className="font-bold text-slate-200 flex justify-between">
                    <span>{item.label}</span>
                    <span className="font-mono text-amber-500 text-[10px]">{item.code}</span>
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 rounded-xl bg-slate-800 px-4 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>فهمت إرشادات السلامة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
