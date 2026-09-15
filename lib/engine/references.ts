import type { Machine } from "./types";

/**
 * Registre documentaire des seuils publiés. Source unique pour la page /references
 * et le tableau des résultats. Ces seuils ne sont JAMAIS appliqués à la valeur mesurée
 * par l'application : ils sont affichés pour information, avec leur contexte.
 */
export interface Threshold {
  /** ce que le seuil sépare, tel que défini par l'étude */
  label: string;
  value: number;
  sensitivity?: number;
  specificity?: number;
  auc?: number;
}

export interface ReferenceStudy {
  id: string;
  authors: string;
  year: number;
  journal: string;
  doi: string;
  n: number;
  machine: Machine;
  machineLabel: string;
  standard: string;
  population: string;
  thresholds: Threshold[];
  notes?: string;
}

export const MACHINES: { value: Machine; label: string }[] = [
  { value: "supersonic-hologic", label: "Supersonic / Hologic (Aixplorer, MACH)" },
  { value: "ge", label: "GE (LOGIQ…)" },
  { value: "philips", label: "Philips (iU22, EPIQ…)" },
  { value: "siemens", label: "Siemens (Acuson, Sequoia…)" },
  { value: "samsung", label: "Samsung (RS85…)" },
  { value: "canon", label: "Canon / Toshiba (Aplio…)" },
  { value: "mindray", label: "Mindray (Resona…)" },
  { value: "other-unknown", label: "Autre / inconnu" },
];

export function machineLabel(m: Machine): string {
  return MACHINES.find((x) => x.value === m)?.label ?? m;
}

export const REFERENCES: ReferenceStudy[] = [
  {
    id: "hamadouche-2025",
    authors: "Hamadouche M, Vilgrain V, Hobeika C, … Dioguardi Burgio M",
    year: 2025,
    journal: "Eur Radiol 35:7927-39",
    doi: "10.1007/s00330-025-11774-z",
    n: 392,
    machine: "supersonic-hologic",
    machineLabel: "Supersonic MACH 30, sonde C6-1X, outil B-mode Ratio, ROI 6 mm à même profondeur",
    standard: "IRM-PDFF (S1 ≥ 6,5 %, S2 ≥ 16,5 %, S3 ≥ 22 %)",
    population: "Diabétiques de type 2 avec suspicion de MASLD, 2 centres (Necker, Beaujon)",
    thresholds: [
      { label: "Stéatose ≥ S1 (seuil optimal, cohorte de validation)", value: 1.16, sensitivity: 82.7, specificity: 80.0, auc: 0.81 },
      { label: "Stéatose ≥ S2 (performance faible : ne pas grader)", value: 1.47, sensitivity: 49.0, specificity: 73.0, auc: 0.61 },
      { label: "Stéatose ≥ S1, « rule-in » (spécificité 100 %)", value: 1.54, sensitivity: 30.9, specificity: 100, auc: 0.65 },
    ],
    notes: "Reproductibilité intra-observateur ICC 0,79, limites d'agrément ≈ ±0,35. Fibrose F3-F4 sans effet. Population à forte prévalence (92 % de stéatose).",
  },
  {
    id: "collin-2023",
    authors: "Collin R, Magnin B, Gaillard C, Nicolas C, Abergel A, Buchard B",
    year: 2023,
    journal: "World J Gastroenterol 29(22):3548-60",
    doi: "10.3748/wjg.v29.i22.3548",
    n: 105,
    machine: "supersonic-hologic",
    machineLabel: "Aixplorer MACH 30",
    standard: "IRM-PDFF ≥ 5,6 %",
    population: "Patients adressés pour MASLD suspectée ou connue (Clermont-Ferrand)",
    thresholds: [{ label: "Stéatose (tout grade)", value: 1.3, sensitivity: 82, specificity: 98, auc: 0.91 }],
  },
  {
    id: "kjaergaard-2023",
    authors: "Kjaergaard M, Lindvig KP, Hansen CD, Detlefsen S, Krag A, Thiele M",
    year: 2023,
    journal: "J Ultrasound Med 42(2):487-96",
    doi: "10.1002/jum.15991",
    n: 137,
    machine: "supersonic-hologic",
    machineLabel: "Aixplorer (Hologic), B-mode ratio calculé sur la machine, ROI 6 mm",
    standard: "Biopsie (S1 ≥ 5 %)",
    population: "Maladie alcoolique du foie et MASLD (Danemark) ; 12 % d'échecs de mesure",
    thresholds: [
      { label: "Stéatose (tout grade), seuil « rule-out »", value: 1.09, sensitivity: 91, specificity: 43 },
      { label: "Stéatose (tout grade), seuil « rule-in »", value: 1.45, sensitivity: 51, specificity: 96, auc: 0.79 },
    ],
    notes: "Ni 2, 3 ou 5 mesures, ni un ROI plus grand n'ont amélioré la performance ; seule la qualité d'image compte.",
  },
  {
    id: "tanpowpong-2020",
    authors: "Tanpowpong N, Panichyawat S",
    year: 2020,
    journal: "J Ultrason 20(82):e169-75",
    doi: "10.15557/JoU.2020.0028",
    n: 179,
    machine: "ge",
    machineLabel: "GE LOGIQ E9, mesure sur DICOM dans le PACS ; ROI foie 200–250 mm², cortex 20–30 mm²",
    standard: "IRM-PDFF (≥ 5,56 % ; ≥ 16,3 %)",
    population: "Hépatopathies diverses (Bangkok), rétrospectif, images de mauvaise qualité exclues",
    thresholds: [
      { label: "Stéatose ≥ 5,56 %", value: 1.18, sensitivity: 90, specificity: 80, auc: 0.93 },
      { label: "Stéatose ≥ 16,3 %", value: 1.55, sensitivity: 90.9, specificity: 89.7, auc: 0.95 },
    ],
  },
  {
    id: "johnson-2021",
    authors: "Johnson SI, Fort D, Shortt KJ, et al.",
    year: 2021,
    journal: "Diagnostics 11(8):1443",
    doi: "10.3390/diagnostics11081443",
    n: 267,
    machine: "philips",
    machineLabel: "Philips HDI5000 / iU22, fonction « measure » du PACS, ROI > 400 px à même profondeur, 12 manipulateurs",
    standard: "Biopsie",
    population: "Échographies abdominales de routine (Ochsner, USA)",
    thresholds: [
      { label: "IHR ≤ 1,17 ⇒ stéatose ≤ 5 % (VPP 95 %)", value: 1.17, specificity: 97 },
      { label: "IHR ≥ 1,40 ⇒ stéatose ≥ 10 % (VPP 95 %)", value: 1.4, specificity: 99 },
    ],
    notes: "Entre 1,18 et 1,39 : zone d'incertitude, prédictions « mixtes ».",
  },
  {
    id: "petzold-2020",
    authors: "Petzold G, Lasser J, Rühl J, et al.",
    year: 2020,
    journal: "PLoS One 15(5):e0231044",
    doi: "10.1371/journal.pone.0231044",
    n: 157,
    machine: "ge",
    machineLabel: "GE LOGIQ E9 et Hitachi, ROI ≥ 10 mm² sur PACS",
    standard: "Biopsie (S1 ≥ 5 %, S2 > 33 %)",
    population: "Hépatopathies chroniques diverses (Göttingen)",
    thresholds: [
      { label: "Stéatose ≥ S1", value: 1.46, sensitivity: 42.7, specificity: 90.7, auc: 0.68 },
      { label: "Stéatose ≥ S2", value: 1.48, sensitivity: 52.3, specificity: 85.0, auc: 0.71 },
    ],
    notes: "Performance faible dans cette cohorte hétérogène ; reproductibilité inter-observateur ICC 0,93.",
  },
  {
    id: "zsombor-2023",
    authors: "Zsombor Z, Rónaszéki AD, Csongrády B, et al.",
    year: 2023,
    journal: "Medicina 59(3):469",
    doi: "10.3390/medicina59030469",
    n: 102,
    machine: "samsung",
    machineLabel: "Samsung RS85, EzHRI (ROI automatiques par deep learning)",
    standard: "IRM-PDFF (≥ 5 % ; ≥ 10 %)",
    population: "MASLD (Budapest)",
    thresholds: [
      { label: "Stéatose ≥ 5 %", value: 1.53, sensitivity: 83.3, specificity: 66.7, auc: 0.76 },
      { label: "Stéatose ≥ 10 %", value: 2.25, sensitivity: 70.4, specificity: 79.6, auc: 0.80 },
    ],
  },
  {
    id: "wu-2026",
    authors: "Wu Y, Cheng J, Xu D, Wang K, Dou Z, He N, Wang J",
    year: 2026,
    journal: "Front Nutr 13:1867062",
    doi: "10.3389/fnut.2026.1867062",
    n: 137,
    machine: "siemens",
    machineLabel: "Siemens Sequoia, 3 paires de ROI dans ImageJ, gain 0–10 dB, dynamique 60 dB",
    standard: "IRM-PDFF ≥ 5 %",
    population: "3 centres (Chine)",
    thresholds: [{ label: "Stéatose ≥ 5 %", value: 1.77, sensitivity: 72.9, specificity: 75.0, auc: 0.78 }],
    notes: "L'UDFF (outil constructeur) fait mieux : AUC 0,945.",
  },
  {
    id: "marshall-2012",
    authors: "Marshall RH, Eissa M, Bluth EI, Gulotta PM, Davis NK",
    year: 2012,
    journal: "AJR 199(5):997-1002",
    doi: "10.2214/AJR.11.6677",
    n: 101,
    machine: "other-unknown",
    machineLabel: "Appareil non précisé ; images exportées du PACS, analyse ImageJ",
    standard: "Biopsie (> 5 %)",
    population: "Patients biopsiés (Ochsner, USA)",
    thresholds: [{ label: "Stéatose > 5 % (dépistage, VPN 1,0)", value: 1.28, sensitivity: 100, specificity: 54 }],
  },
  {
    id: "webb-2009",
    authors: "Webb M, Yeshua H, Zelber-Sagi S, et al.",
    year: 2009,
    journal: "AJR 192(4):909-14",
    doi: "10.2214/AJR.07.4016",
    n: 111,
    machine: "other-unknown",
    machineLabel: "Appareil non précisé ; histogramme d'intensité, logiciel dédié",
    standard: "Biopsie (≥ 5 % ; ≥ 25 %)",
    population: "Hépatopathies chroniques (Tel Aviv)",
    thresholds: [
      { label: "Stéatose ≥ 5 %", value: 1.49, sensitivity: 100, specificity: 91, auc: 0.99 },
      { label: "Stéatose ≥ 25 %", value: 1.86, sensitivity: 90, specificity: 90, auc: 0.96 },
    ],
  },
];

export function referencesForMachine(m: Machine | null): { compatible: ReferenceStudy[]; others: ReferenceStudy[] } {
  if (!m || m === "other-unknown") return { compatible: [], others: REFERENCES };
  return {
    compatible: REFERENCES.filter((r) => r.machine === m),
    others: REFERENCES.filter((r) => r.machine !== m),
  };
}
