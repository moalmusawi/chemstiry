export type ExperimentCategory = 'thermodynamics' | 'kinetics' | 'acids_bases' | 'electrochemistry' | 'equilibrium' | 'sandbox';

export interface ChemicalSpecies {
  id: string;
  nameAr: string;
  nameEn: string;
  formula: string;
  color: string;
  state: 'gas' | 'liquid' | 'solid' | 'aqueous';
  ph?: number;
  safetyHazard?: 'corrosive' | 'flammable' | 'toxic' | 'oxidizer' | 'safe';
}

export interface ExperimentInfo {
  id: string;
  titleAr: string;
  titleEn: string;
  category: ExperimentCategory;
  descriptionAr: string;
  equation: string;
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم';
  tags: string[];
  safetyNotesAr: string[];
  scientificExplanationAr: string;
  initialState: ExperimentState;
}

export interface ExperimentState {
  temperatureC: number; // In Celsius
  pressureAtm: number; // In Atmospheres
  volumeL: number; // In Liters
  moles: number;
  stirrerRpm: number;
  catalystActive: boolean;
  catalystAmount: number; // 0 to 100%
  burnerActive: boolean;
  burnerIntensity: number; // 1 to 5
  coolingActive: boolean;
  reactionProgress: number; // 0 to 100%
  phValue: number;
  currentIndicator?: 'phenolphthalein' | 'litmus' | 'universal' | 'bromothymol';
  buretDripRate: number; // drops per second
  buretAddedVolumeMl: number;
  colorHex: string;
  precipitateAmount: number; // 0 to 100%
  gasReleasedMl: number;
  voltageV: number;
  selectedReagentA?: string;
  selectedReagentB?: string;
  foamHeight: number;
}

export interface LabNote {
  id: string;
  timestamp: string;
  experimentTitle: string;
  temperature: number;
  pressure: number;
  pH?: number;
  observations: string;
}
