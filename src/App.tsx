import React, { useState } from 'react';
import { EXPERIMENTS_LIST } from './data/experimentsData';
import { ExperimentInfo, ExperimentState, LabNote } from './types';
import { Header } from './components/Header';
import { ExperimentSelector } from './components/ExperimentSelector';
import { MeasurementGauges } from './components/MeasurementGauges';
import { VariableControls } from './components/VariableControls';
import { GasLawSimulation } from './components/simulations/GasLawSimulation';
import { TitrationSimulation } from './components/simulations/TitrationSimulation';
import { LeChatelierSimulation } from './components/simulations/LeChatelierSimulation';
import { PrecipitationSimulation } from './components/simulations/PrecipitationSimulation';
import { ElephantToothpasteSimulation } from './components/simulations/ElephantToothpasteSimulation';
import { GalvanicCellSimulation } from './components/simulations/GalvanicCellSimulation';
import { SandboxLabSimulation } from './components/simulations/SandboxLabSimulation';
import { LabNotebookModal } from './components/LabNotebookModal';
import { SafetyGuideModal } from './components/SafetyGuideModal';
import { soundFx } from './services/soundEffects';
import { BookOpen, ShieldAlert, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';

export default function App() {
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentInfo>(EXPERIMENTS_LIST[0]);
  const [experimentState, setExperimentState] = useState<ExperimentState>(EXPERIMENTS_LIST[0].initialState);
  const [isNotebookOpen, setIsNotebookOpen] = useState<boolean>(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.getMuted());
  const [notes, setNotes] = useState<LabNote[]>([
    {
      id: 'note-sample-1',
      timestamp: 'اليوم 10:30 ص',
      experimentTitle: 'قوانين الغازات والمكبس الحراري',
      temperature: 150,
      pressure: 1.42,
      pH: 7.0,
      observations: 'لوحظ ارتفاع ملحوظ في حركة وسرعة الجزيئات وتصادمها مع المكبس عند زيادة الحرارة إلى 150°C.',
    }
  ]);

  // Switch experiment
  const handleSelectExperiment = (exp: ExperimentInfo) => {
    setSelectedExperiment(exp);
    setExperimentState(exp.initialState);
  };

  // Reset experiment
  const handleReset = () => {
    setExperimentState(selectedExperiment.initialState);
  };

  // Sound mute toggle
  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  // Add lab note
  const handleAddNote = (newNote: Omit<LabNote, 'id' | 'timestamp'>) => {
    const note: LabNote = {
      ...newNote,
      id: `note-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    setNotes((prev) => [note, ...prev]);
  };

  // Delete lab note
  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Render appropriate simulation view
  const renderSimulationView = () => {
    switch (selectedExperiment.id) {
      case 'gas_laws':
        return <GasLawSimulation state={experimentState} onChangeState={setExperimentState} />;
      case 'acid_base_titration':
        return <TitrationSimulation state={experimentState} onChangeState={setExperimentState} />;
      case 'le_chatelier':
        return <LeChatelierSimulation state={experimentState} onChangeState={setExperimentState} />;
      case 'golden_rain':
        return <PrecipitationSimulation state={experimentState} onChangeState={setExperimentState} />;
      case 'elephant_toothpaste':
        return <ElephantToothpasteSimulation state={experimentState} onChangeState={setExperimentState} />;
      case 'galvanic_cell':
        return <GalvanicCellSimulation state={experimentState} onChangeState={setExperimentState} />;
      case 'open_sandbox':
      default:
        return <SandboxLabSimulation state={experimentState} onChangeState={setExperimentState} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif] selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Laboratory Bar */}
      <Header
        currentTemp={experimentState.temperatureC}
        currentPressure={experimentState.pressureAtm}
        onReset={handleReset}
        onOpenNotebook={() => setIsNotebookOpen(true)}
        onOpenSafety={() => setIsSafetyOpen(true)}
        notesCount={notes.length}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Experiments Selection Hub */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400"></span>
              <span>قائمة التجارب المخبرية العلمية</span>
            </h2>
            <span className="text-xs text-slate-400">
              اختر تجربة للبدء وضبط المتغيرات كالضغط والحرارة
            </span>
          </div>

          <ExperimentSelector
            selectedExpId={selectedExperiment.id}
            onSelectExperiment={handleSelectExperiment}
          />
        </section>

        {/* Active Experiment Banner */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-5 shadow-lg space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-base font-bold">
                🧪
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {selectedExperiment.titleAr}
                </h2>
                <span className="text-xs text-slate-400 font-sans">
                  {selectedExperiment.titleEn}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-mono text-cyan-300 border border-slate-700">
                المعادلة: {selectedExperiment.equation}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
            {selectedExperiment.descriptionAr}
          </p>
        </section>

        {/* Live Gauges Dashboard */}
        <section>
          <MeasurementGauges state={experimentState} experiment={selectedExperiment} />
        </section>

        {/* Interactive Simulation & Variable Controls Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Simulation Stage (Left / Main, 7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            {renderSimulationView()}
          </div>

          {/* Variables & Controls Panel (Right, 5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <VariableControls
              experiment={selectedExperiment}
              state={experimentState}
              onChangeState={setExperimentState}
            />

            {/* Scientific Explanation & Safety Brief Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
              <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>التفسير العلمي للتجربة:</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedExperiment.scientificExplanationAr}
              </p>

              <div className="border-t border-slate-800/80 pt-2.5 space-y-1">
                <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>تنبيهات الأمان المخبري الخاصة بهذه التجربة:</span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                  {selectedExperiment.safetyNotesAr.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-4 text-center text-xs text-slate-500 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>مختبر الكيمياء التفاعلي © 2026 — بيئة محاكاة فيزيائية وكيميائية علمية متقدمة</span>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>PV = nRT</span>
            <span>•</span>
            <span>Le Chatelier</span>
            <span>•</span>
            <span>Nernst Equation</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LabNotebookModal
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        notes={notes}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        currentExperiment={selectedExperiment}
        currentState={experimentState}
      />

      <SafetyGuideModal
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
      />
    </div>
  );
}
