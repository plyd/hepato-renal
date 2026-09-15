"use client";

import { useState } from "react";
import { machineLabel, referencesForMachine, type Machine, type ReferenceStudy } from "@/lib/engine";
import { cx } from "./ui";

/**
 * Tableau documentaire des seuils publiés (G11–G13). La valeur mesurée n'y est jamais
 * reportée ni surlignée : la comparaison relève du médecin.
 */
export function ThresholdTable({ machine, full = false }: { machine: Machine | null; full?: boolean }) {
  const { compatible, others } = referencesForMachine(machine);
  const unknown = !machine || machine === "other-unknown";
  const [tab, setTab] = useState<"compatible" | "all">(unknown || full ? "all" : "compatible");
  const rows = tab === "compatible" ? compatible : [...compatible, ...others];
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] leading-relaxed text-muted">
        Ces seuils ont été établis sur d&apos;autres appareils, d&apos;autres réglages et d&apos;autres populations, avec des méthodes de référence différentes ;
        ils ne sont pas transposables tels quels et varient de 0,985 à 2,20 dans la littérature. Ils sont donnés pour information.
        {unknown && <strong className="text-amber"> Appareil non renseigné : aucun seuil n&apos;est spécifique à votre situation.</strong>}
      </p>
      {!full && !unknown && (
        <div className="flex gap-0.5 p-[3px] rounded-[10px] bg-surface-2 max-w-md">
          <button type="button" onClick={() => setTab("compatible")} className={cx("flex-1 py-2 px-2 rounded-lg text-[13px] font-semibold", tab === "compatible" ? "bg-surface text-text" : "text-muted")}>
            {machineLabel(machine!)} ({compatible.length})
          </button>
          <button type="button" onClick={() => setTab("all")} className={cx("flex-1 py-2 px-2 rounded-lg text-[13px] font-semibold", tab === "all" ? "bg-surface text-text" : "text-muted")}>
            Tous les appareils (non transposables)
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="text-left text-muted border-b border-line">
              <th className="py-2 pr-3 font-semibold">Étude</th>
              <th className="py-2 pr-3 font-semibold">n</th>
              <th className="py-2 pr-3 font-semibold">Appareil / méthode</th>
              <th className="py-2 pr-3 font-semibold">Référence</th>
              <th className="py-2 pr-3 font-semibold">Population</th>
              <th className="py-2 pr-3 font-semibold">Seuils publiés</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => <Row key={r.id} r={r} />)}
            {rows.length === 0 && <tr><td colSpan={6} className="py-3 text-muted">Aucune étude publiée avec cet appareil dans le registre.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ r }: { r: ReferenceStudy }) {
  return (
    <tr className="border-b border-line align-top">
      <td className="py-2 pr-3">
        <div className="font-semibold">{r.authors.split(",")[0]} {r.year}</div>
        <div className="text-muted text-[12px]">{r.journal}</div>
        <a className="text-accent text-[12px] underline" href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer noopener">doi:{r.doi}</a>
      </td>
      <td className="py-2 pr-3 font-mono">{r.n}</td>
      <td className="py-2 pr-3">{r.machineLabel}</td>
      <td className="py-2 pr-3">{r.standard}</td>
      <td className="py-2 pr-3">{r.population}</td>
      <td className="py-2 pr-3">
        <ul className="flex flex-col gap-1">
          {r.thresholds.map((t) => (
            <li key={t.label}>
              <span className="font-mono font-semibold">{t.value.toFixed(2).replace(".", ",")}</span> — {t.label}
              {(t.sensitivity != null || t.auc != null) && (
                <span className="text-muted text-[12px]"> ({[t.sensitivity != null && `Se ${t.sensitivity} %`, t.specificity != null && `Sp ${t.specificity} %`, t.auc != null && `AUC ${t.auc}`].filter(Boolean).join(", ")})</span>
              )}
            </li>
          ))}
        </ul>
        {r.notes && <div className="text-muted text-[12px] mt-1">{r.notes}</div>}
      </td>
    </tr>
  );
}
