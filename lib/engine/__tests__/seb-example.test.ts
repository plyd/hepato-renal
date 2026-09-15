// Non-régression sur l'image d'exemple de Seb (fixture privée, jamais versionnée).
// Générer avec : node scripts/make-fixture.mjs <chemin du JPEG>
// Valeurs attendues issues de ~/Projets/index-hepato-renal/notes/hri2.py (PIL, disque r = 8,5 px).
// L'échographe affichait : foie 84,5, rein 63,9, B Ratio 1,32 (écart ≈ 7 % documenté dans notes/02).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { calibrateTwoPoints, depthDiffCm } from "../calibration";
import { fromGrey } from "../grey";
import { computeHri } from "../hri";
import { runChecks } from "../quality";
import { roiStats } from "../roi";

const FIXTURE = join(__dirname, "fixtures", "private", "seb-sector.pgm");

function readPgm(path: string) {
  const buf = readFileSync(path);
  // P5\n<w> <h>\n255\n<data>
  const header = buf.subarray(0, 64).toString("latin1");
  const m = header.match(/^P5\s+(\d+)\s+(\d+)\s+255\s/);
  if (!m) throw new Error("PGM P5 attendu");
  const width = Number(m[1]), height = Number(m[2]);
  const data = new Uint8Array(buf.buffer, buf.byteOffset + m[0].length, width * height);
  return fromGrey(data, width, height);
}

describe.skipIf(!existsSync(FIXTURE))("exemple de Seb (Supersonic MACH 30, B-mode Ratio 1,32)", () => {
  const img = readPgm(FIXTURE);
  const liver = { cx: 167, cy: 361, r: 8.5 };
  const kidney = { cx: 241, cy: 355, r: 8.5 };

  it("dimensions du secteur", () => {
    expect(img.width).toBe(676);
    expect(img.height).toBe(539);
  });

  it("retrouve foie ≈ 82,2 / rein ≈ 66,6 / IHR ≈ 1,23", () => {
    const l = roiStats(img, liver), k = roiStats(img, kidney);
    expect(l.mean).toBeCloseTo(82.2, 0);
    expect(k.mean).toBeCloseTo(66.6, 0);
    const { hri, diff } = computeHri(l, k);
    expect(Math.abs(hri - 1.23)).toBeLessThan(0.02);
    expect(diff).toBeGreaterThan(10);
  });

  it("calibration sur la règle 0–15 cm et contrôle de profondeur", () => {
    const cal = calibrateTwoPoints({ x: 640, y: 45 }, { x: 640, y: 470 }, 15);
    expect(Math.abs(cal.pxPerCm - 28.3)).toBeLessThan(0.5);
    expect(depthDiffCm(liver.cy, kidney.cy, cal)).toBeLessThan(1);
    const l = roiStats(img, liver), k = roiStats(img, kidney);
    const checks = runChecks({ image: { width: img.width, height: img.height }, source: "export", calibration: cal, roiDiameterMm: 6, liver: { ...liver, ...l }, kidney: { ...kidney, ...k }, renalNormal: true });
    expect(checks.filter((c) => c.level === "block")).toEqual([]);
  });
});
