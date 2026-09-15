// Export PNG annoté (image masquée + valeurs + contrôles + avertissement). Généré localement.
import { fmt } from "@/components/ui";
import { SINGLE_MEASURE_UNCERTAINTY, summarize, type GreyImage, type Measure } from "@/lib/engine";
import { bitmapFromGrey } from "./load";

export const APP_VERSION = "0.1.0";
export const DISCLAIMER_SHORT = "Outil de mesure — pas un dispositif médical — ne diagnostique pas — l'interprétation appartient au médecin.";

export interface ExportInput {
  grey: GreyImage;
  measures: Measure[];
  machineLabel: string;
  sourceLabel: string;
  degraded: boolean;
}

export async function renderExportPng(input: ExportInput): Promise<Blob> {
  const { grey, measures } = input;
  const summary = summarize(measures);
  const lines: string[] = [];
  lines.push(`hepato-renal v${APP_VERSION} — ${new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}`);
  lines.push(`Source : ${input.sourceLabel} · Appareil : ${input.machineLabel}`);
  if (input.degraded) lines.push("MODE DÉGRADÉ — photo d'écran, non validé");
  measures.forEach((m, i) => {
    lines.push(`Mesure ${i + 1} : IHR ${fmt(m.hri)} · foie ${fmt(m.liver.mean, 1)} ± ${fmt(m.liver.std, 1)} (n=${m.liver.n}) · rein ${fmt(m.kidney.mean, 1)} ± ${fmt(m.kidney.std, 1)} (n=${m.kidney.n}) · Δ ${fmt(m.diff, 1)}${m.depthDiffCm != null ? ` · Δprof ${fmt(m.depthDiffCm, 1)} cm` : ""}`);
    const warns = m.checks.filter((c) => c.level === "warn").map((c) => c.message);
    if (warns.length) lines.push(`   avertissements : ${warns.join(" ; ")}`);
  });
  if (summary.n >= 2) lines.push(`Moyenne ${fmt(summary.mean)} (min ${fmt(summary.min)} – max ${fmt(summary.max)}, étendue ${fmt(summary.spread)})${summary.discordant ? " — mesures discordantes" : ""}`);
  if (summary.n < 3) lines.push(`${summary.n === 1 ? "Mesure unique" : "Moins de 3 mesures"} : incertitude ≈ ±${fmt(SINGLE_MEASURE_UNCERTAINTY, 1)} (limites d'agrément intra-observateur, Hamadouche 2024)`);
  lines.push(DISCLAIMER_SHORT);

  const pad = 16, lineH = 20, font = "13px ui-monospace, SF Mono, Menlo, monospace";
  const textH = lines.length * lineH + pad * 2;
  const width = Math.max(grey.width, 760);
  const canvas = new OffscreenCanvas(width, grey.height + textH);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d indisponible");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(await bitmapFromGrey(grey), 0, 0);

  const colors = ["#2dd4bf", "#f59e0b", "#a78bfa"];
  measures.forEach((m, i) => {
    ctx.strokeStyle = colors[i % colors.length];
    ctx.lineWidth = 1.5;
    for (const roi of [m.liver, m.kidney]) {
      ctx.beginPath();
      ctx.arc(roi.cx, roi.cy, roi.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillText(`${i + 1}`, m.liver.cx + m.liver.r + 3, m.liver.cy - m.liver.r);
    ctx.fillText(`${i + 1}`, m.kidney.cx + m.kidney.r + 3, m.kidney.cy - m.kidney.r);
  });

  ctx.fillStyle = "#0e1113";
  ctx.fillRect(0, grey.height, canvas.width, textH);
  ctx.font = font;
  ctx.fillStyle = "#e6e9ea";
  lines.forEach((l, i) => {
    ctx.fillStyle = l.startsWith("MODE DÉGRADÉ") || l === DISCLAIMER_SHORT ? "#f59e0b" : "#e6e9ea";
    ctx.fillText(l, pad, grey.height + pad + (i + 0.8) * lineH);
  });
  return canvas.convertToBlob({ type: "image/png" });
}

export function measuresAsText(input: ExportInput): string {
  const summary = summarize(input.measures);
  const rows = input.measures.map((m, i) => `Mesure ${i + 1} : IHR ${fmt(m.hri)} (foie ${fmt(m.liver.mean, 1)} / rein ${fmt(m.kidney.mean, 1)}, Δ ${fmt(m.diff, 1)})`);
  const head = [`hepato-renal v${APP_VERSION}`, `Source : ${input.sourceLabel} · Appareil : ${input.machineLabel}`];
  if (input.degraded) head.push("MODE DÉGRADÉ — photo d'écran, non validé");
  const tail: string[] = [];
  if (summary.n >= 2) tail.push(`Moyenne ${fmt(summary.mean)} (min ${fmt(summary.min)} – max ${fmt(summary.max)})${summary.discordant ? " — mesures discordantes" : ""}`);
  if (summary.n < 3) tail.push(`Incertitude ≈ ±${fmt(SINGLE_MEASURE_UNCERTAINTY, 1)} (mesure${summary.n > 1 ? "s" : ""} < 3)`);
  tail.push(DISCLAIMER_SHORT);
  return [...head, ...rows, ...tail].join("\n");
}
