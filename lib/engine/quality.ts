import { depthDiffCm, pxToMm } from "./calibration";
import { roiArea, roisOverlap } from "./roi";
import type { Calibration, Check, Level, Roi, RoiStats, Source } from "./types";

export interface QualityInput {
  image: { width: number; height: number } | null;
  source: Source | null;
  exifMake?: string;
  calibration: Calibration | null;
  roiDiameterMm: number;
  liver: (Roi & RoiStats) | null;
  kidney: (Roi & RoiStats) | null;
  /** case « pas de néphropathie connue, cortex rénal normal » */
  renalNormal: boolean;
}

/** Seuils provisoires, à recaler sur les images de validation (docs/validation-protocol.md). */
export const QUALITY_THRESHOLDS = {
  minSectorWidthPx: 500,
  minPxPerCm: 20, // 6 mm ≥ 12 px de diamètre ; en dessous, les figures compressées donnent des ratios aberrants (test sur la figure 2 de la thèse)
  roiAreaWarnPx: 150, // en dessous, la moyenne devient instable (Johnson 2021 utilisait > 400 px à plus haute résolution)
  roiAreaBlockPx: 100,
  cvWarn: 0.25,
  cvBlock: 0.4,
  overlayBlockFraction: 0.1,
  backgroundBlockFraction: 0.05,
  depthWarnCm: 0.5,
  depthBlockCm: 1.0,
};

export function hasBlock(checks: Check[]): boolean {
  return checks.some((c) => c.level === "block");
}

export function worstLevel(checks: Check[]): Level {
  if (checks.some((c) => c.level === "block")) return "block";
  if (checks.some((c) => c.level === "warn")) return "warn";
  return "ok";
}

/**
 * Exécute tous les contrôles de qualité. Un contrôle « block » empêche de valider
 * la mesure ; la valeur reste affichée, étiquetée « mesure non valide ».
 */
export function runChecks(input: QualityInput): Check[] {
  const T = QUALITY_THRESHOLDS;
  const out: Check[] = [];
  const push = (id: string, level: Level, message: string, detail?: string) => out.push({ id, level, message, detail });

  // Source
  if (input.source === "photo" || input.exifMake) {
    push("source-photo", "block", "Photo d'écran : mode dégradé, non validé",
      (input.exifMake ? `Métadonnées d'appareil photo détectées (${input.exifMake}). ` : "") +
      "Reflets, moiré, perspective et courbe de gris de l'appareil photo modifient les niveaux de gris. Aucune donnée publiée sur cette situation.");
  } else if (input.source === null) {
    push("source-missing", "block", "Source de l'image non renseignée");
  }

  // Rein
  if (!input.renalNormal) {
    push("renal-unknown", "block", "Cortex rénal non confirmé normal",
      "Une néphropathie ou un cortex hyperéchogène abaisse artificiellement l'index. Cochez la case si le rein est connu normal.");
  }

  // Échelle
  if (!input.calibration) {
    push("scale-unknown", "block", "Échelle inconnue : calibrer sur la règle de profondeur",
      "Sans échelle, la taille physique des ROI et l'écart de profondeur ne peuvent pas être contrôlés.");
  } else if (input.calibration.pxPerCm < T.minPxPerCm) {
    push("image-too-small", "block", `Résolution insuffisante (${input.calibration.pxPerCm.toFixed(1)} px/cm)`,
      `Un ROI de ${input.roiDiameterMm} mm ferait moins de ${Math.round((input.roiDiameterMm / 10) * T.minPxPerCm)} px.`);
  }
  if (input.image && input.image.width < T.minSectorWidthPx) {
    push("image-small", "warn", `Image de faible largeur (${input.image.width} px)`);
  }

  // ROI individuels
  for (const [name, roi] of [["foie", input.liver], ["rein", input.kidney]] as const) {
    if (!roi) { push(`roi-missing-${name}`, "block", `ROI ${name} non placé`); continue; }
    const area = roiArea(roi);
    if (area < T.roiAreaBlockPx) push(`roi-too-small-${name}`, "block", `ROI ${name} trop petit (${Math.round(area)} px)`);
    else if (area < T.roiAreaWarnPx) push(`roi-too-small-${name}`, "warn", `ROI ${name} petit (${Math.round(area)} px)`, "Moyenne peu stable sous 150 px : augmenter le diamètre ou utiliser une image de meilleure résolution.");

    const overlay = roi.nSaturated + roi.nColored;
    if (roi.nTotal > 0 && overlay / roi.nTotal > T.overlayBlockFraction) {
      push(`roi-overlay-${name}`, "block", `ROI ${name} sur une annotation (${Math.round((100 * overlay) / roi.nTotal)} % de pixels saturés/colorés)`);
    } else if (overlay > 0) {
      push(`roi-overlay-${name}`, "warn", `ROI ${name} : ${overlay} pixel(s) d'annotation exclus`);
    }
    const bg = roi.nBackground + roi.nOutside;
    if (roi.nTotal > 0 && bg / roi.nTotal > T.backgroundBlockFraction) {
      push(`roi-background-${name}`, "block", `ROI ${name} hors du secteur d'image (${Math.round((100 * bg) / roi.nTotal)} % de fond)`);
    }
    if (roi.n > 0 && Number.isFinite(roi.mean) && roi.mean > 0) {
      const cv = roi.std / roi.mean;
      if (cv > T.cvBlock) push(`roi-heterogeneous-${name}`, "block", `ROI ${name} hétérogène (CV ${(100 * cv).toFixed(0)} %)`, "Vaisseau, pyramide, sinus ou artefact dans le ROI : déplacer.");
      else if (cv > T.cvWarn) push(`roi-heterogeneous-${name}`, "warn", `ROI ${name} peu homogène (CV ${(100 * cv).toFixed(0)} %)`);
    } else if (roi.nTotal > 0) {
      push(`roi-empty-${name}`, "block", `ROI ${name} sans pixel exploitable`);
    }
  }

  // Relations entre ROI
  if (input.liver && input.kidney) {
    if (roisOverlap(input.liver, input.kidney)) push("roi-overlap", "block", "Les deux ROI se chevauchent");
    if (input.calibration) {
      const d = depthDiffCm(input.liver.cy, input.kidney.cy, input.calibration);
      if (d > T.depthBlockCm) push("depth-mismatch", "block", `Écart de profondeur ${d.toFixed(1)} cm (> 1 cm)`, "Les deux ROI doivent être à la même profondeur pour neutraliser l'atténuation.");
      else if (d > T.depthWarnCm) push("depth-mismatch", "warn", `Écart de profondeur ${d.toFixed(1)} cm`);
      const dmm = pxToMm(input.liver.r * 2, input.calibration);
      if (Math.abs(dmm - input.roiDiameterMm) > 0.5) push("roi-diameter", "warn", `Diamètre effectif ${dmm.toFixed(1)} mm (réglage ${input.roiDiameterMm} mm)`);
    }
  }

  return out;
}
