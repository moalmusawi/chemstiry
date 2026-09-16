import React, { useState } from 'react';
import { LabNote, ExperimentState, ExperimentInfo } from '../types';
import { BookOpen, X, Plus, Trash2, Download, Printer } from 'lucide-react';
import { soundFx } from '../services/soundEffects';

interface LabNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: LabNote[];
  onAddNote: (note: Omit<LabNote, 'id' | 'timestamp'>) => void;
  onDeleteNote: (id: string) => void;
  currentExperiment: ExperimentInfo;
  currentState: ExperimentState;
}

export const LabNotebookModal: React.FC<LabNotebookModalProps> = ({
  isOpen,
  onClose,
  notes,
  onAddNote,
  onDeleteNote,
  currentExperiment,
  currentState,
}) => {
  const [observationInput, setObservationInput] = useState<string>('');

  if (!isOpen) return null;

  const handleSaveCurrentObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationInput.trim()) return;

    soundFx.playClick();
    onAddNote({
      experimentTitle: currentExperiment.titleAr,
      temperature: currentState.temperatureC,
      pressure: currentState.pressureAtm,
      pH: currentState.phValue,
      observations: observationInput.trim(),
    });
    setObservationInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">سجل الملاحظات والبيانات المخبرية</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Form to record current state */}
        <form onSubmit={handleSaveCurrentObservation} className="my-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span>التجربة: {currentExperiment.titleAr}</span>
            <span className="text-slate-600">|</span>
            <span>الحرارة: {currentState.temperatureC}°C</span>
            <span className="text-slate-600">|</span>
            <span>الضغط: {currentState.pressureAtm.toFixed(2)} atm</span>
            <span className="text-slate-600">|</span>
            <span>pH: {currentState.phValue.toFixed(1)}</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={observationInput}
              onChange={(e) => setObservationInput(e.target.value)}
              placeholder="اكتب ملاحظاتك العلمية هنا (مثال: لوحظ تغير فوري في اللون وتصاعد غاز)..."
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
            >
              <Plus className="h-4 w-4" />
              <span>تسجيل النتيجة</span>
            </button>
          </div>
        </form>

        {/* Saved Notes List */}
        <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
          {notes.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              لا توجد ملاحظات مسجلة بعد. قم بتدوين أولى ملاحظاتك أثناء تشغيل التجارب!
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="flex items-start justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-cyan-400">
                    <span>{note.experimentTitle}</span>
                    <span className="text-[10px] font-normal text-slate-500 font-mono">
                      {note.timestamp}
                    </span>
                  </div>
                  <div className="flex gap-3 text-[10px] font-mono text-slate-400">
                    <span>T: {note.temperature}°C</span>
                    <span>P: {note.pressure.toFixed(2)} atm</span>
                    {note.pH !== undefined && <span>pH: {note.pH.toFixed(1)}</span>}
                  </div>
                  <p className="text-slate-200 mt-1">{note.observations}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onDeleteNote(note.id);
                  }}
                  className="rounded p-1 text-slate-500 hover:text-rose-400"
                  title="حذف الملاحظة"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400">
          <span>إجمالي الملاحظات المسجلة: {notes.length}</span>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 text-cyan-400 hover:underline"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>طباعة تقرير المختبر</span>
          </button>
        </div>
      </div>
    </div>
  );
};
