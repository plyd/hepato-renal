// Générateurs d'images synthétiques pour les tests du moteur.
import { fromGrey, toGrey } from "../grey";
import type { GreyImage, Roi } from "../types";

export function uniform(w: number, h: number, v: number): GreyImage {
  return fromGrey(new Uint8Array(w * h).fill(v), w, h);
}

export function twoRegions(w: number, h: number, vLeft: number, vRight: number): GreyImage {
  const g = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g[y * w + x] = x < w / 2 ? vLeft : vRight;
  return fromGrey(g, w, h);
}

export function vGradient(w: number, h: number, v0: number, v1: number): GreyImage {
  const g = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const v = Math.round(v0 + ((v1 - v0) * y) / Math.max(1, h - 1));
    for (let x = 0; x < w; x++) g[y * w + x] = v;
  }
  return fromGrey(g, w, h);
}

/** Dessine un anneau (rayon r±1) de valeur `value`, comme le cercle tracé par un échographe. */
export function withRing(img: GreyImage, roi: Roi, value: number): GreyImage {
  const grey = new Uint8Array(img.grey);
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const d = Math.sqrt((x - roi.cx) ** 2 + (y - roi.cy) ** 2);
      if (Math.abs(d - roi.r) <= 1) grey[y * img.width + x] = value;
    }
  }
  return fromGrey(grey, img.width, img.height);
}

/** Image RGBA à partir d'une image grise, avec un rectangle coloré optionnel (texte, Doppler). */
export function toRgba(img: GreyImage, colored?: { x0: number; y0: number; x1: number; y1: number; rgb: [number, number, number] }): Uint8ClampedArray {
  const out = new Uint8ClampedArray(img.width * img.height * 4);
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const i = y * img.width + x;
      let r = img.grey[i], g = img.grey[i], b = img.grey[i];
      if (colored && x >= colored.x0 && x < colored.x1 && y >= colored.y0 && y < colored.y1) [r, g, b] = colored.rgb;
      out[i * 4] = r; out[i * 4 + 1] = g; out[i * 4 + 2] = b; out[i * 4 + 3] = 255;
    }
  }
  return out;
}

export function greyFromRgba(rgba: Uint8ClampedArray, w: number, h: number): GreyImage {
  return toGrey(rgba, w, h);
}
