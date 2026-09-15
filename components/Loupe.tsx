"use client";

import { useEffect, useRef } from "react";
import type { Roi, RoiStats } from "@/lib/engine";
import { fmt } from "./ui";

/** Aperçu agrandi autour du ROI actif, avec la moyenne et l'écart-type en direct. */
export function Loupe({ bitmap, roi, stats, label, color }: { bitmap: ImageBitmap | null; roi: Roi | null; stats: RoiStats | null; label: string; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const SIZE = 132, MAG = 4;
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, SIZE, SIZE);
    if (!bitmap || !roi) return;
    const src = SIZE / MAG;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bitmap, roi.cx - src / 2, roi.cy - src / 2, src, src, 0, 0, SIZE, SIZE);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, roi.r * MAG, 0, Math.PI * 2);
    ctx.stroke();
  }, [bitmap, roi, color]);
  return (
    <div className="flex items-center gap-3">
      <canvas ref={ref} width={SIZE} height={SIZE} className="rounded-lg border border-line shrink-0" />
      <div className="text-[13px] leading-relaxed">
        <div className="font-semibold" style={{ color }}>{label}</div>
        {stats && stats.n > 0 ? (
          <>
            <div>moyenne <span className="font-mono">{fmt(stats.mean, 1)}</span></div>
            <div>écart-type <span className="font-mono">{fmt(stats.std, 1)}</span> (CV {fmt((100 * stats.std) / stats.mean, 0)} %)</div>
            <div className="text-muted">{stats.n} px retenus{stats.nSaturated + stats.nColored > 0 ? `, ${stats.nSaturated + stats.nColored} exclus (annotation)` : ""}{stats.nBackground + stats.nOutside > 0 ? `, ${stats.nBackground + stats.nOutside} hors secteur` : ""}</div>
          </>
        ) : (
          <div className="text-muted">Cliquez sur l&apos;image pour placer le disque</div>
        )}
      </div>
    </div>
  );
}
