
export interface PredictionResult {
  rank: number;
  diameter: number | null; // mm (Opcional ahora)
  length: number;   // mm
  confidence: number; // percentage
  type: string; // e.g., "Estándar", "Opción Corta", "Opción Delgada"
}

export interface PatientData {
  height: number; // cm
}

export enum AppState {
  IDLE = 'IDLE',
  CALCULATING = 'CALCULATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
