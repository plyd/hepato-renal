import type { Calibration, Pt } from "./types";

/** Deux clics sur la règle de profondeur + distance réelle en cm. */
export function calibrateTwoPoints(p1: Pt, p2: Pt, distanceCm: number): Calibration {
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const px = Math.sqrt(dx * dx + dy * dy);
  if (!(distanceCm > 0)) throw new Error("calibrateTwoPoints: distance en cm invalide");
  if (px < 2) throw new Error("calibrateTwoPoints: points trop proches");
  return { pxPerCm: px / distanceCm, p1, p2, distanceCm };
}

export function mmToPx(mm: number, cal: Calibration): number {
  return (mm / 10) * cal.pxPerCm;
}

export function pxToMm(px: number, cal: Calibration): number {
  return (px / cal.pxPerCm) * 10;
}

/**
 * Écart de profondeur entre deux ordonnées image, en cm.
 * Profondeur verticale (axe écran), pas radiale : documenté dans /limites.
 */
export function depthDiffCm(y1: number, y2: number, cal: Calibration): number {
  return Math.abs(y1 - y2) / cal.pxPerCm;
}
