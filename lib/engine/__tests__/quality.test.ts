import { describe, expect, it } from "vitest";
import { hasBlock, runChecks, type QualityInput } from "../quality";
import type { Roi, RoiStats } from "../types";

function roi(over: Partial<Roi & RoiStats> = {}): Roi & RoiStats {
  return { cx: 167, cy: 361, r: 8.5, mean: 82, std: 12, n: 225, nTotal: 227, nSaturated: 0, nColored: 0, nBackground: 0, nOutside: 0, min: 50, max: 120, ...over };
}

const base: QualityInput = {
  image: { width: 676, height: 539 },
  source: "export",
  calibration: { pxPerCm: 28.3, p1: { x: 0, y: 45 }, p2: { x: 0, y: 470 }, distanceCm: 15 },
  roiDiameterMm: 6,
  liver: roi(),
  kidney: roi({ cx: 241, cy: 355, mean: 66, std: 10 }),
  renalNormal: true,
};

const ids = (i: QualityInput) => runChecks(i).map((c) => `${c.id}:${c.level}`);

describe("runChecks", () => {
  it("cas nominal : aucun block", () => {
    const checks = runChecks(base);
    expect(hasBlock(checks)).toBe(false);
  });

  it.each<[string, Partial<QualityInput>, string]>([
    ["photo d'écran", { source: "photo" }, "source-photo:block"],
    ["EXIF Make présent", { exifMake: "Apple" }, "source-photo:block"],
    ["source manquante", { source: null }, "source-missing:block"],
    ["rein non confirmé", { renalNormal: false }, "renal-unknown:block"],
    ["échelle inconnue", { calibration: null }, "scale-unknown:block"],
    ["résolution insuffisante", { calibration: { ...base.calibration!, pxPerCm: 16 } }, "image-too-small:block"],
    ["ROI foie manquant", { liver: null }, "roi-missing-foie:block"],
    ["ROI rein manquant", { kidney: null }, "roi-missing-rein:block"],
    ["ROI trop petit", { liver: roi({ r: 4, n: 50, nTotal: 50 }) }, "roi-too-small-foie:block"],
    ["ROI sur annotation", { kidney: roi({ cx: 241, cy: 355, nSaturated: 40, nTotal: 227 }) }, "roi-overlay-rein:block"],
    ["ROI hors secteur", { kidney: roi({ cx: 241, cy: 355, nOutside: 30, nTotal: 227 }) }, "roi-background-rein:block"],
    ["ROI hétérogène", { liver: roi({ std: 40 }) }, "roi-heterogeneous-foie:block"],
    ["ROI sans pixel", { liver: roi({ n: 0, mean: NaN, std: NaN, nBackground: 227 }) }, "roi-background-foie:block"],
    ["chevauchement", { kidney: roi({ cx: 175, cy: 361 }) }, "roi-overlap:block"],
    ["écart de profondeur > 1 cm", { kidney: roi({ cx: 241, cy: 361 + 40 }) }, "depth-mismatch:block"],
  ])("bloque : %s", (_name, over, expected) => {
    expect(ids({ ...base, ...over })).toContain(expected);
  });

  it.each<[string, Partial<QualityInput>, string]>([
    ["ROI petit", { liver: roi({ r: 6.5, n: 130, nTotal: 133 }) }, "roi-too-small-foie:warn"],
    ["quelques pixels d'annotation", { liver: roi({ nSaturated: 3 }) }, "roi-overlay-foie:warn"],
    ["ROI peu homogène", { liver: roi({ std: 25 }) }, "roi-heterogeneous-foie:warn"],
    ["écart de profondeur 0,7 cm", { kidney: roi({ cx: 241, cy: 361 + 20 }) }, "depth-mismatch:warn"],
    ["image étroite", { image: { width: 400, height: 300 } }, "image-small:warn"],
  ])("avertit sans bloquer : %s", (_name, over, expected) => {
    const checks = runChecks({ ...base, ...over });
    expect(checks.map((c) => `${c.id}:${c.level}`)).toContain(expected);
    expect(hasBlock(checks)).toBe(false);
  });

  it("un disque de 6 mm à 28 px/cm (≈ 227 px) ne déclenche aucun avertissement de taille", () => {
    const checks = runChecks({ ...base, liver: roi({ r: 8.5 }) });
    expect(checks.find((c) => c.id === "roi-too-small-foie")).toBeUndefined();
  });
});
