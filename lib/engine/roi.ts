import { FLAG_BACKGROUND, FLAG_COLORED, FLAG_SATURATED, type GreyImage, type Roi, type RoiStats } from "./types";

/**
 * Statistiques des niveaux de gris dans un disque.
 * Appartenance : (x−cx)² + (y−cy)² ≤ r² sur la grille entière, comme `notes/hri.py`.
 * Les pixels flaggés (saturés, colorés, fond) et hors image sont comptés mais exclus
 * de la moyenne et de l'écart-type.
 */
export function roiStats(img: GreyImage, roi: Roi): RoiStats {
  const { cx, cy, r } = roi;
  const r2 = r * r;
  const x0 = Math.floor(cx - r), x1 = Math.ceil(cx + r);
  const y0 = Math.floor(cy - r), y1 = Math.ceil(cy + r);
  let n = 0, nTotal = 0, nSaturated = 0, nColored = 0, nBackground = 0, nOutside = 0;
  let sum = 0, sumSq = 0, min = 255, max = 0;
  for (let y = y0; y <= y1; y++) {
    const dy = y - cy;
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx;
      if (dx * dx + dy * dy > r2) continue;
      nTotal++;
      if (x < 0 || y < 0 || x >= img.width || y >= img.height) { nOutside++; continue; }
      const i = y * img.width + x;
      const f = img.flags[i];
      if (f) {
        if (f & FLAG_SATURATED) nSaturated++;
        if (f & FLAG_COLORED) nColored++;
        if (f & FLAG_BACKGROUND) nBackground++;
        continue;
      }
      const v = img.grey[i];
      n++;
      sum += v;
      sumSq += v * v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  if (n === 0) return { mean: NaN, std: NaN, n: 0, nTotal, nSaturated, nColored, nBackground, nOutside, min: NaN, max: NaN };
  const mean = sum / n;
  const variance = Math.max(0, sumSq / n - mean * mean);
  return { mean, std: Math.sqrt(variance), n, nTotal, nSaturated, nColored, nBackground, nOutside, min, max };
}

/** Aire théorique du disque en pixels (approximation continue). */
export function roiArea(roi: Roi): number {
  return Math.PI * roi.r * roi.r;
}

export function roisOverlap(a: Roi, b: Roi): boolean {
  const dx = a.cx - b.cx, dy = a.cy - b.cy;
  return Math.sqrt(dx * dx + dy * dy) < a.r + b.r;
}
