import type { RoiStats } from "./types";

/**
 * Index hépato-rénal = gris moyen du foie / gris moyen du cortex rénal.
 * `diff` = foie − rein, indicateur secondaire sans seuil (Osawa 1996, Wang 2013).
 */
export function computeHri(liver: RoiStats, kidney: RoiStats): { hri: number; diff: number } {
  if (!(liver.n > 0) || !(kidney.n > 0) || !(kidney.mean > 0)) return { hri: NaN, diff: NaN };
  return { hri: liver.mean / kidney.mean, diff: liver.mean - kidney.mean };
}

/** Incertitude affichée pour une mesure isolée (limites d'agrément intra-observateur ≈ ±0,35, Hamadouche 2024). */
export const SINGLE_MEASURE_UNCERTAINTY = 0.3;

/** Au-delà de cet écart max−min entre mesures, elles sont dites discordantes. */
export const MAX_SPREAD = 0.3;

export const RECOMMENDED_MEASURES = 3;
