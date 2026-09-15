// Reducer pur de l'application (testable sans React). Aucune persistance : l'état vit en mémoire.
import { blackout, calibrateTwoPoints, hasBlock, mmToPx, RECOMMENDED_MEASURES, type Calibration, type GreyImage, type Machine, type Measure, type Pt, type Roi, type Source } from "@/lib/engine";

export type Step = "source" | "calibrate" | "rois" | "results";
export type Which = "liver" | "kidney";

export interface Rect { x0: number; y0: number; x1: number; y1: number }

export interface State {
  step: Step;
  image: { grey: GreyImage; version: number } | null;
  fileName: string | null;
  source: Source | null;
  machine: Machine | null;
  exifMake?: string;
  renalNormal: boolean;
  masks: Rect[];
  noPatientData: boolean;
  calPoints: Pt[];
  calibration: Calibration | null;
  cannotCalibrate: boolean;
  roiDiameterMm: number;
  liver: Roi | null;
  kidney: Roi | null;
  active: Which;
  measures: Measure[];
  disclaimerAccepted: boolean;
}

export const DEFAULT_ROI_RADIUS_PX = 10;

export const initialState: State = {
  step: "source",
  image: null,
  fileName: null,
  source: null,
  machine: null,
  renalNormal: false,
  masks: [],
  noPatientData: false,
  calPoints: [],
  calibration: null,
  cannotCalibrate: false,
  roiDiameterMm: 6,
  liver: null,
  kidney: null,
  active: "liver",
  measures: [],
  disclaimerAccepted: false,
};

export type Action =
  | { type: "LOAD_IMAGE"; grey: GreyImage; fileName: string; exifMake?: string }
  | { type: "SET_SOURCE"; source: Source }
  | { type: "SET_MACHINE"; machine: Machine }
  | { type: "SET_RENAL_NORMAL"; value: boolean }
  | { type: "ADD_MASK"; rect: Rect }
  | { type: "SET_NO_PATIENT_DATA"; value: boolean }
  | { type: "ADD_CAL_POINT"; pt: Pt }
  | { type: "CLEAR_CAL" }
  | { type: "SET_CALIBRATION"; distanceCm: number }
  | { type: "CANNOT_CALIBRATE" }
  | { type: "SET_DIAMETER"; mm: number }
  | { type: "SET_ROI"; which: Which; roi: Roi }
  | { type: "SET_ACTIVE"; which: Which }
  | { type: "COMMIT_MEASURE"; measure: Measure }
  | { type: "RESET_MEASURE" }
  | { type: "REMOVE_MEASURE"; id: string }
  | { type: "SET_STEP"; step: Step }
  | { type: "ACCEPT_DISCLAIMER" }
  | { type: "RESET_ALL" };

export function roiRadiusPx(s: Pick<State, "calibration" | "roiDiameterMm">): number {
  return s.calibration ? mmToPx(s.roiDiameterMm / 2, s.calibration) : DEFAULT_ROI_RADIUS_PX;
}

function resize(roi: Roi | null, r: number): Roi | null {
  return roi ? { ...roi, r } : null;
}

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "LOAD_IMAGE": {
      const exifMake = a.exifMake;
      return {
        ...initialState,
        disclaimerAccepted: s.disclaimerAccepted,
        image: { grey: a.grey, version: 0 },
        fileName: a.fileName,
        exifMake,
        source: exifMake ? "photo" : null,
      };
    }
    case "SET_SOURCE":
      // Un fichier avec métadonnées d'appareil photo reste une photo quoi qu'on déclare.
      return { ...s, source: s.exifMake ? "photo" : a.source };
    case "SET_MACHINE":
      return { ...s, machine: a.machine };
    case "SET_RENAL_NORMAL":
      return { ...s, renalNormal: a.value };
    case "ADD_MASK": {
      if (!s.image) return s;
      const grey: GreyImage = { ...s.image.grey, grey: new Uint8Array(s.image.grey.grey), flags: new Uint8Array(s.image.grey.flags) };
      blackout(grey, a.rect.x0, a.rect.y0, a.rect.x1, a.rect.y1);
      return { ...s, image: { grey, version: s.image.version + 1 }, masks: [...s.masks, a.rect] };
    }
    case "SET_NO_PATIENT_DATA":
      return { ...s, noPatientData: a.value };
    case "ADD_CAL_POINT": {
      const pts = s.calPoints.length >= 2 ? [a.pt] : [...s.calPoints, a.pt];
      return { ...s, calPoints: pts, calibration: null, cannotCalibrate: false };
    }
    case "CLEAR_CAL":
      return { ...s, calPoints: [], calibration: null, cannotCalibrate: false };
    case "SET_CALIBRATION": {
      if (s.calPoints.length !== 2) return s;
      let cal: Calibration;
      try { cal = calibrateTwoPoints(s.calPoints[0], s.calPoints[1], a.distanceCm); } catch { return s; }
      const r = mmToPx(s.roiDiameterMm / 2, cal);
      return { ...s, calibration: cal, cannotCalibrate: false, liver: resize(s.liver, r), kidney: resize(s.kidney, r) };
    }
    case "CANNOT_CALIBRATE":
      return { ...s, calibration: null, calPoints: [], cannotCalibrate: true };
    case "SET_DIAMETER": {
      const mm = Math.min(10, Math.max(5, a.mm));
      const next = { ...s, roiDiameterMm: mm };
      const r = roiRadiusPx(next);
      return { ...next, liver: resize(s.liver, r), kidney: resize(s.kidney, r) };
    }
    case "SET_ROI":
      return { ...s, [a.which]: a.roi };
    case "SET_ACTIVE":
      return { ...s, active: a.which };
    case "COMMIT_MEASURE": {
      if (hasBlock(a.measure.checks)) return s;
      if (s.measures.length >= RECOMMENDED_MEASURES) return s;
      return { ...s, measures: [...s.measures, a.measure], liver: null, kidney: null, active: "liver" };
    }
    case "RESET_MEASURE":
      return { ...s, liver: null, kidney: null, active: "liver" };
    case "REMOVE_MEASURE":
      return { ...s, measures: s.measures.filter((m) => m.id !== a.id) };
    case "SET_STEP":
      return { ...s, step: a.step };
    case "ACCEPT_DISCLAIMER":
      return { ...s, disclaimerAccepted: true };
    case "RESET_ALL":
      return { ...initialState, disclaimerAccepted: s.disclaimerAccepted };
  }
}
