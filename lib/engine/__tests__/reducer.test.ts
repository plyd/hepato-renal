import { describe, expect, it } from "vitest";
import { initialState, reducer, type State } from "@/lib/state/reducer";
import type { Measure } from "../types";
import { uniform } from "./synth";

function measure(id: string, block = false): Measure {
  const s = { cx: 50, cy: 50, r: 8, mean: 80, std: 5, n: 200, nTotal: 200, nSaturated: 0, nColored: 0, nBackground: 0, nOutside: 0, min: 0, max: 255 };
  return { id, liver: s, kidney: { ...s, cx: 80, mean: 65 }, hri: 1.23, diff: 15, checks: block ? [{ id: "x", level: "block", message: "x" }] : [], source: "export", roiDiameterMm: 6, depthDiffCm: 0 };
}

function loaded(exifMake?: string): State {
  return reducer(initialState, { type: "LOAD_IMAGE", grey: uniform(100, 100, 80), fileName: "a.png", exifMake });
}

describe("reducer", () => {
  it("LOAD_IMAGE repart d'un état vierge mais garde l'acceptation de l'avertissement", () => {
    const s0 = reducer(initialState, { type: "ACCEPT_DISCLAIMER" });
    const s = reducer(s0, { type: "LOAD_IMAGE", grey: uniform(10, 10, 5), fileName: "x" });
    expect(s.disclaimerAccepted).toBe(true);
    expect(s.image?.grey.width).toBe(10);
    expect(s.measures).toEqual([]);
  });

  it("EXIF Make force la source photo, même si l'utilisateur déclare un export", () => {
    const s = reducer(loaded("Apple"), { type: "SET_SOURCE", source: "export" });
    expect(s.source).toBe("photo");
  });

  it("ADD_MASK noircit une copie de l'image et incrémente la version", () => {
    const s0 = loaded();
    const s = reducer(s0, { type: "ADD_MASK", rect: { x0: 0, y0: 0, x1: 9, y1: 9 } });
    expect(s.image?.version).toBe(1);
    expect(s.image?.grey.grey[0]).toBe(0);
    expect(s0.image?.grey.grey[0]).toBe(80);
    expect(s.masks).toHaveLength(1);
  });

  it("calibration en deux points puis distance ; redimensionne les ROI", () => {
    let s = loaded();
    s = reducer(s, { type: "SET_ROI", which: "liver", roi: { cx: 30, cy: 30, r: 10 } });
    s = reducer(s, { type: "ADD_CAL_POINT", pt: { x: 90, y: 10 } });
    s = reducer(s, { type: "ADD_CAL_POINT", pt: { x: 90, y: 90 } });
    s = reducer(s, { type: "SET_CALIBRATION", distanceCm: 4 }); // 20 px/cm
    expect(s.calibration?.pxPerCm).toBe(20);
    expect(s.liver?.r).toBe(6); // 6 mm ⇒ 12 px de diamètre
    s = reducer(s, { type: "SET_DIAMETER", mm: 10 });
    expect(s.liver?.r).toBe(10);
    s = reducer(s, { type: "SET_DIAMETER", mm: 50 });
    expect(s.roiDiameterMm).toBe(10);
  });

  it("un troisième point de calibration recommence la saisie", () => {
    let s = loaded();
    s = reducer(s, { type: "ADD_CAL_POINT", pt: { x: 0, y: 0 } });
    s = reducer(s, { type: "ADD_CAL_POINT", pt: { x: 0, y: 10 } });
    s = reducer(s, { type: "ADD_CAL_POINT", pt: { x: 5, y: 5 } });
    expect(s.calPoints).toEqual([{ x: 5, y: 5 }]);
  });

  it("COMMIT_MEASURE refuse une mesure bloquée et plafonne à 3", () => {
    let s = loaded();
    s = reducer(s, { type: "COMMIT_MEASURE", measure: measure("a", true) });
    expect(s.measures).toHaveLength(0);
    for (const id of ["1", "2", "3", "4"]) s = reducer(s, { type: "COMMIT_MEASURE", measure: measure(id) });
    expect(s.measures.map((m) => m.id)).toEqual(["1", "2", "3"]);
    expect(s.liver).toBeNull();
  });

  it("RESET_ALL vide tout sauf l'acceptation", () => {
    let s = reducer(loaded(), { type: "ACCEPT_DISCLAIMER" });
    s = reducer(s, { type: "COMMIT_MEASURE", measure: measure("1") });
    s = reducer(s, { type: "RESET_ALL" });
    expect(s.image).toBeNull();
    expect(s.measures).toEqual([]);
    expect(s.disclaimerAccepted).toBe(true);
  });
});
