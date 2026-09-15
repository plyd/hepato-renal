import { MAX_SPREAD, RECOMMENDED_MEASURES } from "./hri";
import type { Measure } from "./types";

export interface Summary {
  n: number;
  mean: number;
  min: number;
  max: number;
  spread: number;
  /** étendue max−min > MAX_SPREAD */
  discordant: boolean;
  /** n ≥ RECOMMENDED_MEASURES et non discordant */
  complete: boolean;
  /** au moins une mesure en mode photo */
  degraded: boolean;
  meanDiff: number;
}

export function summarize(measures: Measure[]): Summary {
  const valid = measures.filter((m) => Number.isFinite(m.hri));
  const n = valid.length;
  if (n === 0) return { n: 0, mean: NaN, min: NaN, max: NaN, spread: NaN, discordant: false, complete: false, degraded: false, meanDiff: NaN };
  const hris = valid.map((m) => m.hri);
  const min = Math.min(...hris), max = Math.max(...hris);
  const spread = max - min;
  const mean = hris.reduce((a, b) => a + b, 0) / n;
  const meanDiff = valid.reduce((a, m) => a + m.diff, 0) / n;
  const discordant = spread > MAX_SPREAD;
  return {
    n, mean, min, max, spread, discordant,
    complete: n >= RECOMMENDED_MEASURES && !discordant,
    degraded: valid.some((m) => m.source === "photo"),
    meanDiff,
  };
}
