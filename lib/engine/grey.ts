import { FLAG_BACKGROUND, FLAG_COLORED, FLAG_SATURATED, type GreyImage } from "./types";

export interface GreyOptions {
  /** gris ≥ saturated ⇒ FLAG_SATURATED (défaut 250) */
  saturated?: number;
  /** max(R,G,B) − min(R,G,B) > chroma ⇒ FLAG_COLORED (défaut 40) */
  chroma?: number;
  /** gris ≤ background ⇒ FLAG_BACKGROUND (défaut 4) */
  background?: number;
}

/**
 * Convertit un buffer RGBA en image de gris 8 bits avec drapeaux d'exclusion.
 * Gris = (R+G+B)/3 arrondi, comme la conversion par défaut d'ImageJ utilisée
 * par Marshall 2012 ; sans effet sur une image déjà grise.
 */
export function toGrey(rgba: Uint8ClampedArray | Uint8Array, width: number, height: number, opts: GreyOptions = {}): GreyImage {
  const saturated = opts.saturated ?? 250;
  const chroma = opts.chroma ?? 40;
  const background = opts.background ?? 4;
  const n = width * height;
  if (rgba.length < n * 4) throw new Error(`toGrey: buffer trop court (${rgba.length} < ${n * 4})`);
  const grey = new Uint8Array(n);
  const flags = new Uint8Array(n);
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const r = rgba[p], g = rgba[p + 1], b = rgba[p + 2];
    const v = Math.round((r + g + b) / 3);
    grey[i] = v;
    let f = 0;
    if (v >= saturated) f |= FLAG_SATURATED;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx - mn > chroma) f |= FLAG_COLORED;
    if (v <= background) f |= FLAG_BACKGROUND;
    flags[i] = f;
  }
  return { width, height, grey, flags };
}

/** Construit une GreyImage à partir d'un tableau de gris (tests, fixtures PGM). */
export function fromGrey(grey: Uint8Array, width: number, height: number, opts: GreyOptions = {}): GreyImage {
  const saturated = opts.saturated ?? 250;
  const background = opts.background ?? 4;
  const flags = new Uint8Array(grey.length);
  for (let i = 0; i < grey.length; i++) {
    let f = 0;
    if (grey[i] >= saturated) f |= FLAG_SATURATED;
    if (grey[i] <= background) f |= FLAG_BACKGROUND;
    flags[i] = f;
  }
  return { width, height, grey, flags };
}

/** Noircit un rectangle (masquage irréversible d'un bandeau patient). */
export function blackout(img: GreyImage, x0: number, y0: number, x1: number, y1: number): void {
  const xa = Math.max(0, Math.floor(Math.min(x0, x1)));
  const xb = Math.min(img.width - 1, Math.ceil(Math.max(x0, x1)));
  const ya = Math.max(0, Math.floor(Math.min(y0, y1)));
  const yb = Math.min(img.height - 1, Math.ceil(Math.max(y0, y1)));
  for (let y = ya; y <= yb; y++) {
    for (let x = xa; x <= xb; x++) {
      const i = y * img.width + x;
      img.grey[i] = 0;
      img.flags[i] = FLAG_BACKGROUND;
    }
  }
}
