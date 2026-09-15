"use client";

import Link from "next/link";
import { Check } from "./Icons";

export function cx(...xs: (string | false | null | undefined)[]) { return xs.filter(Boolean).join(" "); }

export function Header({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-end gap-3">
      <div className="flex flex-col gap-1 min-w-0">
        {sub && <span className="text-[13px] text-muted font-medium">{sub}</span>}
        <h1 className="text-[26px] font-bold tracking-tight leading-[1.1]">{title}</h1>
      </div>
      {right}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center px-0.5 min-h-8">
      <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-muted">{children}</span>
      {right}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("bg-surface border border-line rounded-2xl px-4 py-3", className)}>{children}</div>;
}

export function Badge({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "accent" | "amber" | "violet" | "ko" }) {
  const cls = {
    muted: "text-muted bg-surface-2",
    accent: "text-accent bg-accent-dim",
    amber: "text-amber bg-amber-dim",
    violet: "text-violet bg-violet-dim",
    ko: "text-ko bg-surface-2",
  }[tone];
  return <span className={cx("inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide px-1.5 py-[3px] rounded-md whitespace-nowrap", cls)}>{children}</span>;
}

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cx("font-mono text-[12px] text-muted", className)}>{children}</span>;
}

export function Checkbox({ checked, onChange, label, id }: { checked: boolean; onChange?: (v: boolean) => void; label: React.ReactNode; id?: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <button type="button" id={id} role="checkbox" aria-checked={checked} onClick={() => onChange?.(!checked)}
        className={cx("shrink-0 w-7 h-7 mt-0.5 rounded-lg flex items-center justify-center transition-colors", checked ? "bg-accent text-bg" : "border-[1.5px] border-dim")}>
        {checked && <Check />}
      </button>
      <span className="text-[14px] leading-snug">{label}</span>
    </label>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "amber"; href?: string; full?: boolean };
export function Button({ variant = "primary", className, href, full = true, children, ...rest }: BtnProps) {
  const cls = cx(
    "inline-flex items-center justify-center gap-2 rounded-[14px] font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed min-h-12 px-4",
    variant === "primary" && "bg-accent text-bg text-[16px] min-h-[52px]",
    variant === "ghost" && "border border-line text-text text-[15px] font-medium",
    variant === "danger" && "border border-line text-ko text-[15px] font-medium",
    variant === "amber" && "bg-amber-dim text-amber text-[15px]",
    full && "w-full",
    className,
  );
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type="button" className={cls} {...rest}>{children}</button>;
}

export function Segmented<T extends string>({ value, onChange, items }: { value: T | null; onChange: (v: T) => void; items: { value: T; label: string }[] }) {
  return (
    <div className="flex gap-0.5 p-[3px] rounded-[10px] bg-surface-2">
      {items.map((it) => (
        <button key={it.value} type="button" onClick={() => onChange(it.value)}
          className={cx("flex-1 py-2 px-2 rounded-lg text-[13px] font-semibold min-h-10", value === it.value ? "bg-surface text-text" : "text-muted")}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <div className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50 bg-surface-2 border border-line text-[14px] px-4 py-2.5 rounded-xl shadow-lg">{msg}</div>;
}

/** Bandeau permanent, non fermable (garde-fou G4). */
export function PermanentBanner() {
  return (
    <div role="note" className="w-full bg-amber-dim text-amber text-[12px] font-medium text-center px-3 py-1.5 leading-snug">
      Outil de mesure — pas un dispositif médical — ne diagnostique pas — l&apos;interprétation appartient au médecin.
    </div>
  );
}

export function fmt(v: number, digits = 2): string {
  return Number.isFinite(v) ? v.toFixed(digits).replace(".", ",") : "—";
}
