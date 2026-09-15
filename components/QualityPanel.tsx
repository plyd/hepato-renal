"use client";

import type { Check } from "@/lib/engine";
import { cx } from "./ui";

const ICON = { ok: "✓", warn: "!", block: "✕" } as const;
const TONE = { ok: "text-accent", warn: "text-amber", block: "text-ko" } as const;

/** Liste des contrôles de qualité, visible à chaque étape (G7). */
export function QualityPanel({ checks, compact = false }: { checks: Check[]; compact?: boolean }) {
  const blocks = checks.filter((c) => c.level === "block");
  const warns = checks.filter((c) => c.level === "warn");
  return (
    <div className="flex flex-col gap-1.5 text-[13px]">
      <div className={cx("font-semibold", blocks.length ? TONE.block : warns.length ? TONE.warn : TONE.ok)}>
        {blocks.length ? `Mesure non valide : ${blocks.length} point${blocks.length > 1 ? "s" : ""} bloquant${blocks.length > 1 ? "s" : ""}` : warns.length ? `Mesure possible, ${warns.length} avertissement${warns.length > 1 ? "s" : ""}` : "Contrôles de qualité : tous satisfaits"}
      </div>
      {!compact && (
        <ul className="flex flex-col gap-1">
          {[...blocks, ...warns].map((c) => (
            <li key={c.id} className="flex gap-2 leading-snug">
              <span className={cx("font-mono font-bold w-4 shrink-0", TONE[c.level])}>{ICON[c.level]}</span>
              <span>
                {c.message}
                {c.detail && <span className="block text-muted text-[12px]">{c.detail}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
