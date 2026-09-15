import { describe, expect, it } from "vitest";
import { calibrateTwoPoints, depthDiffCm, mmToPx, pxToMm } from "../calibration";
import { computeHri } from "../hri";

describe("calibration", () => {
  it("deux points verticaux sur la règle de l'image de Seb", () => {
    const cal = calibrateTwoPoints({ x: 640, y: 45 }, { x: 640, y: 470 }, 15);
    expect(cal.pxPerCm).toBeCloseTo(28.33, 1);
    expect(mmToPx(6, cal)).toBeCloseTo(17, 0);
    expect(pxToMm(17, cal)).toBeCloseTo(6, 0);
    expect(depthDiffCm(361, 355, cal)).toBeCloseTo(0.21, 2);
  });

  it("points obliques : distance euclidienne", () => {
    const cal = calibrateTwoPoints({ x: 0, y: 0 }, { x: 30, y: 40 }, 5);
    expect(cal.pxPerCm).toBe(10);
  });

  it("refuse une distance nulle ou des points confondus", () => {
    expect(() => calibrateTwoPoints({ x: 0, y: 0 }, { x: 10, y: 0 }, 0)).toThrow();
    expect(() => calibrateTwoPoints({ x: 0, y: 0 }, { x: 1, y: 0 }, 5)).toThrow();
  });
});

describe("computeHri", () => {
  const stats = (mean: number, n = 100) => ({ mean, std: 5, n, nTotal: n, nSaturated: 0, nColored: 0, nBackground: 0, nOutside: 0, min: 0, max: 255 });
  it("80/65 ⇒ 1,2308 et différence 15", () => {
    const r = computeHri(stats(80), stats(65));
    expect(r.hri).toBeCloseTo(1.2308, 4);
    expect(r.diff).toBe(15);
  });
  it("NaN si un ROI est vide ou si le rein est à 0", () => {
    expect(Number.isNaN(computeHri(stats(80), stats(65, 0)).hri)).toBe(true);
    expect(Number.isNaN(computeHri(stats(80), stats(0)).hri)).toBe(true);
  });
});
