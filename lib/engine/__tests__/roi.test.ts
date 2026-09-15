import { describe, expect, it } from "vitest";
import { roiArea, roiStats, roisOverlap } from "../roi";
import { greyFromRgba, toRgba, uniform, vGradient, withRing } from "./synth";

describe("roiStats", () => {
  it("compte ≈ πr² pixels et donne mean/std exacts sur une image uniforme", () => {
    const img = uniform(100, 100, 80);
    const s = roiStats(img, { cx: 50, cy: 50, r: 10 });
    expect(Math.abs(s.n - roiArea({ cx: 50, cy: 50, r: 10 })) / s.n).toBeLessThan(0.05);
    expect(s.mean).toBe(80);
    expect(s.std).toBe(0);
    expect(s.min).toBe(80);
    expect(s.max).toBe(80);
    expect(s.nTotal).toBe(s.n);
  });

  it("exclut un anneau saturé (cercle tracé par l'échographe) sans changer la moyenne", () => {
    const roi = { cx: 50, cy: 50, r: 10 };
    const img = withRing(uniform(100, 100, 80), { ...roi, r: 8 }, 255);
    const s = roiStats(img, roi);
    expect(s.mean).toBe(80);
    expect(s.nSaturated).toBeGreaterThan(20);
    expect(s.n + s.nSaturated).toBe(s.nTotal);
  });

  it("exclut du texte coloré", () => {
    const base = uniform(100, 100, 80);
    const rgba = toRgba(base, { x0: 45, y0: 45, x1: 55, y1: 50, rgb: [255, 200, 0] });
    const img = greyFromRgba(rgba, 100, 100);
    const s = roiStats(img, { cx: 50, cy: 50, r: 10 });
    expect(s.mean).toBe(80);
    expect(s.nColored).toBe(50);
  });

  it("compte les pixels hors image", () => {
    const img = uniform(100, 100, 80);
    const s = roiStats(img, { cx: 0, cy: 50, r: 10 });
    expect(s.nOutside).toBeGreaterThan(100);
    expect(s.nOutside).toBeLessThan(s.nTotal);
    expect(s.mean).toBe(80);
  });

  it("mesure un écart-type non nul sur un gradient", () => {
    const img = vGradient(100, 100, 40, 120);
    const s = roiStats(img, { cx: 50, cy: 50, r: 10 });
    expect(s.std).toBeGreaterThan(3);
    expect(s.mean).toBeCloseTo(80, 0);
  });

  it("renvoie NaN quand aucun pixel n'est exploitable", () => {
    const img = uniform(20, 20, 0); // tout fond
    const s = roiStats(img, { cx: 10, cy: 10, r: 3 });
    expect(s.n).toBe(0);
    expect(Number.isNaN(s.mean)).toBe(true);
    expect(s.nBackground).toBe(s.nTotal);
  });

  it("supporte les centres et rayons non entiers comme notes/hri.py", () => {
    const img = uniform(50, 50, 60);
    const s = roiStats(img, { cx: 20.4, cy: 19.7, r: 8.5 });
    expect(s.mean).toBe(60);
    expect(Math.abs(s.n - Math.PI * 8.5 * 8.5) / s.n).toBeLessThan(0.06);
  });
});

describe("roisOverlap", () => {
  it("détecte le chevauchement", () => {
    expect(roisOverlap({ cx: 0, cy: 0, r: 5 }, { cx: 9, cy: 0, r: 5 })).toBe(true);
    expect(roisOverlap({ cx: 0, cy: 0, r: 5 }, { cx: 10, cy: 0, r: 5 })).toBe(false);
  });
});
