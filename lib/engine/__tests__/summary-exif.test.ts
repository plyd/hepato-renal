import { describe, expect, it } from "vitest";
import { sniffJpeg } from "../exif";
import { summarize } from "../summary";
import type { Measure } from "../types";

function m(hri: number, source: Measure["source"] = "export"): Measure {
  const s = { cx: 0, cy: 0, r: 8, mean: 80, std: 5, n: 200, nTotal: 200, nSaturated: 0, nColored: 0, nBackground: 0, nOutside: 0, min: 0, max: 255 };
  return { id: String(hri), liver: s, kidney: s, hri, diff: 10, checks: [], source, roiDiameterMm: 6, depthDiffCm: 0.2 };
}

describe("summarize", () => {
  it("vide", () => {
    const s = summarize([]);
    expect(s.n).toBe(0);
    expect(s.complete).toBe(false);
  });
  it("3 mesures concordantes ⇒ complete", () => {
    const s = summarize([m(1.2), m(1.25), m(1.3)]);
    expect(s.n).toBe(3);
    expect(s.mean).toBeCloseTo(1.25, 5);
    expect(s.spread).toBeCloseTo(0.1, 5);
    expect(s.discordant).toBe(false);
    expect(s.complete).toBe(true);
    expect(s.degraded).toBe(false);
  });
  it("étendue > 0,30 ⇒ discordant, pas complete", () => {
    const s = summarize([m(1.1), m(1.25), m(1.5)]);
    expect(s.discordant).toBe(true);
    expect(s.complete).toBe(false);
  });
  it("2 mesures ⇒ pas complete", () => {
    expect(summarize([m(1.2), m(1.25)]).complete).toBe(false);
  });
  it("une mesure photo ⇒ degraded", () => {
    expect(summarize([m(1.2), m(1.2, "photo"), m(1.2)]).degraded).toBe(true);
  });
});

function jpegWithExif(make: string): Uint8Array {
  const tiff: number[] = [0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00]; // II, 42, IFD0 @8
  const makeBytes = [...make].map((c) => c.charCodeAt(0)).concat(0);
  const valueOffset = 8 + 2 + 12 + 4; // 26
  tiff.push(0x01, 0x00); // 1 entrée
  tiff.push(0x0f, 0x01, 0x02, 0x00, makeBytes.length, 0, 0, 0, valueOffset, 0, 0, 0);
  tiff.push(0, 0, 0, 0); // next IFD
  tiff.push(...makeBytes);
  const app1 = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00, ...tiff];
  const len = app1.length + 2;
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe1, len >> 8, len & 0xff, ...app1, 0xff, 0xd9]);
}

describe("sniffJpeg", () => {
  it("lit le tag Make d'un JPEG avec EXIF", () => {
    const r = sniffJpeg(jpegWithExif("Apple"));
    expect(r).toEqual({ isJpeg: true, hasExif: true, make: "Apple" });
  });
  it("JPEG sans EXIF (JFIF seulement)", () => {
    const r = sniffJpeg(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x4a, 0x46, 0xff, 0xd9]));
    expect(r.isJpeg).toBe(true);
    expect(r.hasExif).toBe(false);
  });
  it("PNG ⇒ pas un JPEG", () => {
    expect(sniffJpeg(new Uint8Array([0x89, 0x50, 0x4e, 0x47])).isJpeg).toBe(false);
  });
  it("ne plante pas sur un buffer tronqué", () => {
    const b = jpegWithExif("Samsung").slice(0, 20);
    expect(() => sniffJpeg(b)).not.toThrow();
  });
});
