// Types du moteur. Ce module et ses voisins n'importent ni React ni le DOM.

export const FLAG_SATURATED = 1; // pixel ≥ seuil de saturation (annotations, curseurs, texte blanc)
export const FLAG_COLORED = 2; // pixel coloré (Doppler, texte coloré, échelle de couleur)
export const FLAG_BACKGROUND = 4; // fond noir hors secteur

export interface GreyImage {
  width: number;
  height: number;
  /** niveau de gris 0–255, (R+G+B)/3 arrondi */
  grey: Uint8Array;
  /** combinaison de FLAG_* par pixel */
  flags: Uint8Array;
}

export interface Pt {
  x: number;
  y: number;
}

/** Disque en coordonnées image (pixels). */
export interface Roi {
  cx: number;
  cy: number;
  r: number;
}

export interface RoiStats {
  /** moyenne des pixels retenus (non flaggés, dans l'image) */
  mean: number;
  /** écart-type (population) des pixels retenus */
  std: number;
  /** nombre de pixels retenus */
  n: number;
  /** nombre total de pixels du disque (retenus + exclus + hors image) */
  nTotal: number;
  nSaturated: number;
  nColored: number;
  nBackground: number;
  nOutside: number;
  min: number;
  max: number;
}

export interface Calibration {
  pxPerCm: number;
  p1: Pt;
  p2: Pt;
  distanceCm: number;
}

export type Source = "export" | "screenshot" | "photo";

export type Machine =
  | "supersonic-hologic"
  | "ge"
  | "philips"
  | "siemens"
  | "samsung"
  | "canon"
  | "mindray"
  | "other-unknown";

export type Level = "ok" | "warn" | "block";

export interface Check {
  id: string;
  level: Level;
  message: string;
  detail?: string;
}

export interface Measure {
  id: string;
  liver: Roi & RoiStats;
  kidney: Roi & RoiStats;
  hri: number;
  diff: number;
  checks: Check[];
  source: Source;
  roiDiameterMm: number | null;
  depthDiffCm: number | null;
}
