"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Measure, Pt, Roi } from "@/lib/engine";
import type { Rect, Which } from "@/lib/state/reducer";
import { cx } from "./ui";

export type StageMode = "mask" | "calibrate" | "roi" | "view";

export interface ImageStageProps {
  bitmap: ImageBitmap | null;
  width: number;
  height: number;
  mode: StageMode;
  masks: Rect[];
  calPoints: Pt[];
  liver: Roi | null;
  kidney: Roi | null;
  active: Which;
  radius: number;
  measures: Measure[];
  onMask?: (r: Rect) => void;
  onCalPoint?: (p: Pt) => void;
  onRoi?: (which: Which, roi: Roi) => void;
  onActive?: (which: Which) => void;
}

const SNAP_PX = 5;
const COLORS = { liver: "#2dd4bf", kidney: "#f59e0b" } as const;
const MEASURE_COLORS = ["#2dd4bf", "#f59e0b", "#a78bfa"];

export function ImageStage(p: ImageStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState<{ kind: "rect"; start: Pt; cur: Pt } | { kind: "roi"; which: Which; offset: Pt } | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !p.bitmap) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(p.bitmap, 0, 0);
  }, [p.bitmap, p.width, p.height]);

  const toImage = useCallback((e: { clientX: number; clientY: number }): Pt => {
    const svg = svgRef.current!;
    const r = svg.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (p.width / r.width), y: (e.clientY - r.top) * (p.height / r.height) };
  }, [p.width, p.height]);

  const hit = (pt: Pt): Which | null => {
    const test = (roi: Roi | null) => roi && Math.hypot(pt.x - roi.cx, pt.y - roi.cy) <= roi.r + 6;
    if (test(p[p.active])) return p.active;
    const other: Which = p.active === "liver" ? "kidney" : "liver";
    if (test(p[other])) return other;
    return null;
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (p.mode === "view") return;
    e.preventDefault();
    const pt = toImage(e);
    try { svgRef.current?.setPointerCapture(e.pointerId); } catch { /* événement synthétique */ }
    if (p.mode === "mask") { setDrag({ kind: "rect", start: pt, cur: pt }); return; }
    if (p.mode === "calibrate") { p.onCalPoint?.(pt); return; }
    // roi
    const which = hit(pt);
    if (which) {
      const roi = p[which]!;
      p.onActive?.(which);
      setDrag({ kind: "roi", which, offset: { x: roi.cx - pt.x, y: roi.cy - pt.y } });
    } else {
      p.onRoi?.(p.active, { cx: pt.x, cy: pt.y, r: p.radius });
      setDrag({ kind: "roi", which: p.active, offset: { x: 0, y: 0 } });
    }
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const pt = toImage(e);
    if (drag.kind === "rect") { setDrag({ ...drag, cur: pt }); return; }
    let cx = pt.x + drag.offset.x, cy = pt.y + drag.offset.y;
    const other = p[drag.which === "liver" ? "kidney" : "liver"];
    if (other && Math.abs(cy - other.cy) <= SNAP_PX) cy = other.cy; // aimantation iso-profondeur
    cx = Math.max(0, Math.min(p.width, cx)); cy = Math.max(0, Math.min(p.height, cy));
    p.onRoi?.(drag.which, { cx, cy, r: p.radius });
  };

  const onPointerUp = () => {
    if (drag?.kind === "rect") {
      const r: Rect = { x0: drag.start.x, y0: drag.start.y, x1: drag.cur.x, y1: drag.cur.y };
      if (Math.abs(r.x1 - r.x0) > 3 && Math.abs(r.y1 - r.y0) > 3) p.onMask?.(r);
    }
    setDrag(null);
  };

  const guideY = p.mode === "roi" ? (p.active === "liver" ? p.kidney?.cy : p.liver?.cy) : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[12px] text-muted">
        <span>Zoom</span>
        {[1, 1.5, 2, 3].map((z) => (
          <button key={z} type="button" onClick={() => setZoom(z)} className={cx("px-2 py-1 rounded-md font-mono", zoom === z ? "bg-accent-dim text-accent" : "bg-surface-2")}>{z}×</button>
        ))}
        <span className="ml-auto">{p.width}×{p.height} px</span>
      </div>
      <div className="relative overflow-auto rounded-xl border border-line bg-black max-h-[70vh]" style={{ touchAction: p.mode === "view" ? "auto" : "none" }}>
        <div className="relative" style={{ width: p.width * zoom, height: p.height * zoom }}>
          <canvas ref={canvasRef} width={p.width} height={p.height} className="absolute inset-0" style={{ width: p.width * zoom, height: p.height * zoom, imageRendering: zoom >= 2 ? "pixelated" : "auto" }} />
          <svg ref={svgRef} viewBox={`0 0 ${p.width} ${p.height}`} className="absolute inset-0 select-none" style={{ width: p.width * zoom, height: p.height * zoom, cursor: p.mode === "view" ? "default" : "crosshair" }}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
            {p.masks.map((m, i) => <rect key={i} x={Math.min(m.x0, m.x1)} y={Math.min(m.y0, m.y1)} width={Math.abs(m.x1 - m.x0)} height={Math.abs(m.y1 - m.y0)} fill="#000" stroke="#f87171" strokeWidth={1} strokeDasharray="4 3" />)}
            {drag?.kind === "rect" && <rect x={Math.min(drag.start.x, drag.cur.x)} y={Math.min(drag.start.y, drag.cur.y)} width={Math.abs(drag.cur.x - drag.start.x)} height={Math.abs(drag.cur.y - drag.start.y)} fill="rgba(248,113,113,0.3)" stroke="#f87171" strokeWidth={1} />}
            {p.calPoints.map((c, i) => (
              <g key={i}>
                <circle cx={c.x} cy={c.y} r={4} fill="none" stroke="#a78bfa" strokeWidth={1.5} />
                <line x1={c.x - 8} x2={c.x + 8} y1={c.y} y2={c.y} stroke="#a78bfa" strokeWidth={1} />
              </g>
            ))}
            {p.calPoints.length === 2 && <line x1={p.calPoints[0].x} y1={p.calPoints[0].y} x2={p.calPoints[1].x} y2={p.calPoints[1].y} stroke="#a78bfa" strokeWidth={1} strokeDasharray="3 3" />}
            {guideY != null && <line x1={0} x2={p.width} y1={guideY} y2={guideY} stroke="#8b9398" strokeWidth={0.75} strokeDasharray="6 4" />}
            {p.mode === "view" && p.measures.map((m, i) => (
              <g key={m.id} stroke={MEASURE_COLORS[i % 3]} fill="none" strokeWidth={1.25}>
                <circle cx={m.liver.cx} cy={m.liver.cy} r={m.liver.r} />
                <circle cx={m.kidney.cx} cy={m.kidney.cy} r={m.kidney.r} />
                <text x={m.liver.cx + m.liver.r + 2} y={m.liver.cy - m.liver.r} fill={MEASURE_COLORS[i % 3]} stroke="none" fontSize={11} fontWeight={700}>{i + 1}</text>
              </g>
            ))}
            {p.mode !== "view" && (["liver", "kidney"] as const).map((w) => {
              const roi = p[w];
              if (!roi) return null;
              const isActive = p.active === w && p.mode === "roi";
              return (
                <g key={w}>
                  <circle cx={roi.cx} cy={roi.cy} r={roi.r} fill="none" stroke={COLORS[w]} strokeWidth={isActive ? 2 : 1.25} />
                  <line x1={roi.cx - 3} x2={roi.cx + 3} y1={roi.cy} y2={roi.cy} stroke={COLORS[w]} strokeWidth={1} />
                  <line x1={roi.cx} x2={roi.cx} y1={roi.cy - 3} y2={roi.cy + 3} stroke={COLORS[w]} strokeWidth={1} />
                  <text x={roi.cx + roi.r + 3} y={roi.cy + 4} fill={COLORS[w]} fontSize={11} fontWeight={700}>{w === "liver" ? "F" : "R"}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
