"use client";

import { useState } from "react";
import { APP_VERSION, measuresAsText, renderExportPng, type ExportInput } from "@/lib/browser/export";
import { RECOMMENDED_MEASURES, SINGLE_MEASURE_UNCERTAINTY, summarize, type Measure } from "@/lib/engine";
import { Badge, Button, Card, Checkbox, SectionTitle, Toast, cx, fmt } from "./ui";

/** Fiche de résultats : valeurs, incertitude, statistiques (G1–G3, G6, G15, G16). Aucun seuil appliqué. */
export function ResultCard({ measures, degraded, sourceLabel, machineLabelText, reliabilityLine }: { measures: Measure[]; degraded: boolean; sourceLabel: string; machineLabelText: string; reliabilityLine: string }) {
  const s = summarize(measures);
  return (
    <Card className="flex flex-col gap-3">
      <SectionTitle right={<Badge tone={degraded ? "amber" : "muted"}>{degraded ? "MODE DÉGRADÉ — photo d'écran, non validé" : sourceLabel}</Badge>}>Index hépato-rénal mesuré</SectionTitle>
      {s.n === 0 ? (
        <p className="text-muted text-[14px]">Aucune mesure validée.</p>
      ) : (
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <div>
            <div className="text-[40px] font-bold font-mono leading-none">{fmt(s.n >= 2 ? s.mean : measures[0].hri)}</div>
            <div className="text-[12px] text-muted mt-1">{s.n >= 2 ? `moyenne de ${s.n} mesure${s.n > 1 ? "s" : ""}` : "mesure unique"}</div>
          </div>
          <div className="text-[13px] leading-relaxed">
            {s.n >= 2 ? (
              <div>min {fmt(s.min)} – max {fmt(s.max)} · étendue <span className={cx("font-mono", s.discordant && "text-ko font-semibold")}>{fmt(s.spread)}</span>{s.discordant && " — mesures discordantes : refaire"}</div>
            ) : (
              <div>incertitude d&apos;une mesure isolée ≈ <span className="font-mono">±{fmt(SINGLE_MEASURE_UNCERTAINTY, 1)}</span></div>
            )}
            <div>différence foie − rein : <span className="font-mono">{fmt(s.meanDiff, 1)}</span> niveaux de gris (indicateur secondaire, sans seuil)</div>
            {s.n < RECOMMENDED_MEASURES && <div className="text-amber">{s.n}/{RECOMMENDED_MEASURES} mesure{s.n > 1 ? "s" : ""} : {RECOMMENDED_MEASURES} mesures recommandées avant de retenir une valeur.</div>}
          </div>
        </div>
      )}
      <div className="text-[12px] text-muted leading-relaxed border-t border-line pt-2">
        Appareil déclaré : {machineLabelText}. {reliabilityLine} L&apos;outil n&apos;applique aucun seuil à cette valeur ; le tableau ci-dessous est documentaire.
      </div>
    </Card>
  );
}

export function MeasureLog({ measures, onRemove }: { measures: Measure[]; onRemove: (id: string) => void }) {
  if (measures.length === 0) return null;
  return (
    <Card>
      <SectionTitle>Mesures validées</SectionTitle>
      <table className="w-full text-[13px] mt-1">
        <thead><tr className="text-muted text-left"><th className="py-1 font-semibold">#</th><th className="py-1 font-semibold">IHR</th><th className="py-1 font-semibold">Foie</th><th className="py-1 font-semibold">Rein</th><th className="py-1 font-semibold">Δ</th><th className="py-1 font-semibold">Δ prof.</th><th className="py-1 font-semibold">Avert.</th><th /></tr></thead>
        <tbody>
          {measures.map((m, i) => (
            <tr key={m.id} className="border-t border-line font-mono">
              <td className="py-1.5">{i + 1}</td>
              <td className="py-1.5 font-semibold">{fmt(m.hri)}</td>
              <td className="py-1.5">{fmt(m.liver.mean, 1)} ± {fmt(m.liver.std, 1)}</td>
              <td className="py-1.5">{fmt(m.kidney.mean, 1)} ± {fmt(m.kidney.std, 1)}</td>
              <td className="py-1.5">{fmt(m.diff, 1)}</td>
              <td className="py-1.5">{m.depthDiffCm != null ? `${fmt(m.depthDiffCm, 1)} cm` : "—"}</td>
              <td className="py-1.5 font-sans text-amber">{m.checks.filter((c) => c.level === "warn").length || ""}</td>
              <td className="py-1.5 text-right"><button type="button" className="text-muted text-[12px] font-sans underline" onClick={() => onRemove(m.id)}>retirer</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/** Export PNG et copie texte, bloqués tant que le bandeau patient n'est pas traité (G17). */
export function ExportPanel({ input, masksCount, noPatientData, onNoPatientData }: { input: ExportInput; masksCount: number; noPatientData: boolean; onNoPatientData: (v: boolean) => void }) {
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const allowed = masksCount > 0 || noPatientData;
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const exportPng = async () => {
    if (!allowed || busy) return;
    setBusy(true);
    try {
      const blob = await renderExportPng(input);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hepato-renal-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      flash("PNG généré localement");
    } catch (e) {
      flash(`Export impossible : ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(measuresAsText(input)); flash("Valeurs copiées"); } catch { flash("Copie impossible"); }
  };

  return (
    <Card className="flex flex-col gap-3">
      <SectionTitle>Export</SectionTitle>
      <p className="text-[13px] text-muted leading-relaxed">
        L&apos;export est généré dans votre navigateur (image masquée, disques, valeurs, contrôles, avertissement, version {APP_VERSION}). Il est bloqué tant que le bandeau patient n&apos;a pas été masqué en noir sur l&apos;image ou que vous n&apos;avez pas confirmé l&apos;absence de donnée identifiante.
      </p>
      {masksCount > 0 ? (
        <div className="text-[13px] text-accent">{masksCount} zone{masksCount > 1 ? "s" : ""} masquée{masksCount > 1 ? "s" : ""} en noir.</div>
      ) : (
        <Checkbox checked={noPatientData} onChange={onNoPatientData} label="L'image ne contient aucune donnée identifiante (nom, date de naissance, identifiant, date d'examen)." />
      )}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="ghost" onClick={copy} disabled={!allowed || input.measures.length === 0}>Copier les valeurs (texte)</Button>
        <Button onClick={exportPng} disabled={!allowed || busy || input.measures.length === 0}>Exporter en PNG</Button>
      </div>
      <Toast msg={toast} />
    </Card>
  );
}
