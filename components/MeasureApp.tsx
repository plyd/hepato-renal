"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { bitmapFromGrey, loadImageFile } from "@/lib/browser/load";
import { MACHINES, RECOMMENDED_MEASURES, computeHri, depthDiffCm, machineLabel, roiStats, runChecks, type Measure, type Source } from "@/lib/engine";
import { initialState, reducer, roiRadiusPx, type Step } from "@/lib/state/reducer";
import { Disclaimer } from "./Disclaimer";
import { ImageStage } from "./ImageStage";
import { Loupe } from "./Loupe";
import { QualityPanel } from "./QualityPanel";
import { ExportPanel, MeasureLog, ResultCard } from "./Results";
import { ThresholdTable } from "./ThresholdTable";
import { Badge, Button, Card, Checkbox, SectionTitle, Segmented, cx, fmt } from "./ui";

const STEPS: { id: Step; label: string }[] = [
  { id: "source", label: "1. Image" },
  { id: "calibrate", label: "2. Échelle" },
  { id: "rois", label: "3. Disques" },
  { id: "results", label: "4. Résultats" },
];

const SOURCE_LABELS: Record<Source, string> = { export: "Export natif (USB, DICOM→PNG)", screenshot: "Capture d'écran", photo: "Photo d'écran (mode dégradé)" };
const RELIABILITY = "Fiabilité attendue sur capture native : écart de 7 % avec l'outil constructeur sur une image (validation en cours). Photo d'écran : non validé.";

export function MeasureApp() {
  const [s, dispatch] = useReducer(reducer, initialState);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [distanceCm, setDistanceCm] = useState("");
  const [downscaled, setDownscaled] = useState(false);

  const grey = s.image?.grey ?? null;

  // Bitmap affiché, régénéré après chaque masquage.
  useEffect(() => {
    if (!grey) return;
    let cancelled = false;
    bitmapFromGrey(grey).then((b) => { if (!cancelled) setBitmap(b); else b.close(); });
    return () => { cancelled = true; };
  }, [grey]);
  const shownBitmap = grey ? bitmap : null;

  const radius = roiRadiusPx(s);
  const liverStats = useMemo(() => (grey && s.liver ? roiStats(grey, s.liver) : null), [grey, s.liver]);
  const kidneyStats = useMemo(() => (grey && s.kidney ? roiStats(grey, s.kidney) : null), [grey, s.kidney]);
  const live = liverStats && kidneyStats ? computeHri(liverStats, kidneyStats) : null;
  const checks = useMemo(() => runChecks({
    image: grey ? { width: grey.width, height: grey.height } : null,
    source: s.source,
    exifMake: s.exifMake,
    calibration: s.calibration,
    roiDiameterMm: s.roiDiameterMm,
    liver: s.liver && liverStats ? { ...s.liver, ...liverStats } : null,
    kidney: s.kidney && kidneyStats ? { ...s.kidney, ...kidneyStats } : null,
    renalNormal: s.renalNormal,
  }), [grey, s.source, s.exifMake, s.calibration, s.roiDiameterMm, s.liver, s.kidney, liverStats, kidneyStats, s.renalNormal]);
  // En mode photo, la mesure reste possible mais étiquetée dégradée (G15) : ce block-là ne bloque pas la validation.
  const blocking = checks.filter((c) => c.level === "block" && c.id !== "source-photo");
  const degradedNow = s.source === "photo";
  const canCommit = !!live && Number.isFinite(live.hri) && blocking.length === 0 && s.measures.length < RECOMMENDED_MEASURES;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setLoading(true); setLoadError(null);
    try {
      const r = await loadImageFile(file);
      setDownscaled(r.downscaled);
      dispatch({ type: "LOAD_IMAGE", grey: r.grey, fileName: r.fileName, exifMake: r.exif.make });
      r.bitmap.close();
    } catch (e) {
      setLoadError(`Image illisible : ${(e as Error).message}`);
    } finally { setLoading(false); }
  };

  const commit = () => {
    if (!canCommit || !s.liver || !s.kidney || !liverStats || !kidneyStats || !live) return;
    const m: Measure = {
      id: crypto.randomUUID(),
      liver: { ...s.liver, ...liverStats },
      kidney: { ...s.kidney, ...kidneyStats },
      hri: live.hri,
      diff: live.diff,
      checks: checks.filter((c) => c.level !== "block" || c.id === "source-photo"),
      source: s.source ?? "export",
      roiDiameterMm: s.calibration ? s.roiDiameterMm : null,
      depthDiffCm: s.calibration ? depthDiffCm(s.liver.cy, s.kidney.cy, s.calibration) : null,
    };
    dispatch({ type: "COMMIT_MEASURE", measure: m });
  };

  if (!s.disclaimerAccepted) return <Disclaimer onAccept={() => dispatch({ type: "ACCEPT_DISCLAIMER" })} />;

  const stageProps = { bitmap: shownBitmap, width: grey?.width ?? 0, height: grey?.height ?? 0, masks: s.masks, calPoints: s.calPoints, liver: s.liver, kidney: s.kidney, active: s.active, radius, measures: s.measures };
  const machineText = s.machine ? machineLabel(s.machine) : "non renseigné";
  const sourceText = s.source ? SOURCE_LABELS[s.source] : "non renseignée";
  const exportInput = { grey: grey!, measures: s.measures, machineLabel: machineText, sourceLabel: sourceText, degraded: s.measures.some((m) => m.source === "photo") };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {STEPS.map((st) => (
            <button key={st.id} type="button" disabled={!grey && st.id !== "source"} onClick={() => dispatch({ type: "SET_STEP", step: st.id })}
              className={cx("px-3 py-1.5 rounded-lg text-[13px] font-semibold disabled:opacity-40", s.step === st.id ? "bg-accent-dim text-accent" : "bg-surface-2 text-muted")}>
              {st.label}
            </button>
          ))}
        </div>
        <div className="text-[12px] text-muted">L&apos;image ne quitte jamais cet appareil. Aucun envoi, aucun stockage, aucune statistique. Recharger la page efface tout.</div>
      </div>

      {s.step === "source" && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-4">
          <div className="flex flex-col gap-3">
            {!grey ? (
              <Card className="flex flex-col gap-3 py-6">
                <SectionTitle>Charger une image</SectionTitle>
                <p className="text-[14px] text-muted">Image en mode B montrant le foie droit et le rein droit sur la même coupe. Formats : PNG, JPEG, BMP, WebP. Préférez un export natif de l&apos;échographe ou une capture d&apos;écran.</p>
                <label className="inline-flex items-center justify-center min-h-[52px] rounded-[14px] bg-accent text-bg font-semibold cursor-pointer px-4">
                  {loading ? "Chargement…" : "Choisir un fichier"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                </label>
                <label className="inline-flex items-center justify-center min-h-12 rounded-[14px] border border-line font-medium cursor-pointer px-4 text-[15px]">
                  Photographier l&apos;écran (mode dégradé, non validé)
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                </label>
                {loadError && <p className="text-ko text-[13px]">{loadError}</p>}
              </Card>
            ) : (
              <>
                <ImageStage {...stageProps} mode="mask" onMask={(rect) => dispatch({ type: "ADD_MASK", rect })} />
                <p className="text-[13px] text-muted">Masquage : tracez un rectangle sur le bandeau patient (nom, date de naissance, identifiant). Le noircissement est irréversible dans cette session. {s.masks.length > 0 && <span className="text-accent">{s.masks.length} zone{s.masks.length > 1 ? "s" : ""} masquée{s.masks.length > 1 ? "s" : ""}.</span>}</p>
                {downscaled && <p className="text-[13px] text-amber">Image réduite à 2000 px maximum : le ré-échantillonnage moyenne légèrement les niveaux de gris.</p>}
              </>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Card className="flex flex-col gap-3">
              <SectionTitle>Source de l&apos;image</SectionTitle>
              {s.exifMake && <p className="text-[13px] text-amber">Métadonnées d&apos;appareil photo détectées ({s.exifMake}) : cette image est traitée comme une photo d&apos;écran.</p>}
              <div className="flex flex-col gap-1.5">
                {(Object.keys(SOURCE_LABELS) as Source[]).map((src) => (
                  <button key={src} type="button" disabled={!!s.exifMake && src !== "photo"} onClick={() => dispatch({ type: "SET_SOURCE", source: src })}
                    className={cx("text-left px-3 py-2 rounded-lg text-[13px] border disabled:opacity-40", s.source === src ? "border-accent bg-accent-dim text-accent" : "border-line bg-surface-2")}>
                    {SOURCE_LABELS[src]}
                  </button>
                ))}
              </div>
              <SectionTitle>Appareil</SectionTitle>
              <select value={s.machine ?? ""} onChange={(e) => dispatch({ type: "SET_MACHINE", machine: e.target.value as typeof MACHINES[number]["value"] })} className="bg-surface-2 border border-line rounded-lg px-3 py-2 text-[14px]">
                <option value="" disabled>Choisir…</option>
                {MACHINES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <Checkbox checked={s.renalNormal} onChange={(v) => dispatch({ type: "SET_RENAL_NORMAL", value: v })} label="Pas de néphropathie connue, cortex rénal d'aspect normal (sinon la mesure est faussée)." />
            </Card>
            <Button disabled={!grey || !s.source || !s.machine} onClick={() => dispatch({ type: "SET_STEP", step: "calibrate" })}>Suivant : calibrer l&apos;échelle</Button>
            {grey && <Button variant="ghost" onClick={() => dispatch({ type: "RESET_ALL" })}>Nouvelle image</Button>}
          </div>
        </div>
      )}

      {s.step === "calibrate" && grey && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-4">
          <ImageStage {...stageProps} mode="calibrate" onCalPoint={(pt) => dispatch({ type: "ADD_CAL_POINT", pt })} />
          <div className="flex flex-col gap-3">
            <Card className="flex flex-col gap-3">
              <SectionTitle>Échelle</SectionTitle>
              <p className="text-[13px] text-muted leading-relaxed">Cliquez sur deux graduations de la règle de profondeur (par exemple 0 et 15 cm), puis indiquez la distance réelle entre elles. Points placés : {s.calPoints.length}/2.</p>
              <div className="flex gap-2 items-center">
                <input inputMode="decimal" value={distanceCm} onChange={(e) => setDistanceCm(e.target.value)} placeholder="distance en cm" className="bg-surface-2 border border-line rounded-lg px-3 py-2 text-[14px] w-40 font-mono" />
                <Button full={false} disabled={s.calPoints.length !== 2 || !(Number(distanceCm.replace(",", ".")) > 0)} onClick={() => dispatch({ type: "SET_CALIBRATION", distanceCm: Number(distanceCm.replace(",", ".")) })}>Calibrer</Button>
              </div>
              {s.calibration ? (
                <p className="text-[13px] text-accent">{fmt(s.calibration.pxPerCm, 1)} px/cm — un disque de {s.roiDiameterMm} mm fait {fmt(2 * radius, 0)} px.</p>
              ) : s.cannotCalibrate ? (
                <p className="text-[13px] text-ko">Échelle inconnue : la mesure ne pourra pas être validée (taille des disques et profondeur non contrôlables).</p>
              ) : null}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => dispatch({ type: "CLEAR_CAL" })}>Effacer les points</Button>
                <Button variant="ghost" onClick={() => dispatch({ type: "CANNOT_CALIBRATE" })}>Je ne peux pas calibrer</Button>
              </div>
            </Card>
            <Button disabled={!s.calibration && !s.cannotCalibrate} onClick={() => dispatch({ type: "SET_STEP", step: "rois" })}>Suivant : placer les disques</Button>
          </div>
        </div>
      )}

      {s.step === "rois" && grey && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-4">
          <div className="flex flex-col gap-3">
            <ImageStage {...stageProps} mode="roi" onRoi={(which, roi) => dispatch({ type: "SET_ROI", which, roi })} onActive={(which) => dispatch({ type: "SET_ACTIVE", which })} />
            <p className="text-[13px] text-muted leading-relaxed">
              Foie : parenchyme homogène du foie droit, sans vaisseau ni voie biliaire. Rein : cortex du pôle moyen, entre les pyramides, hors sinus. Même profondeur pour les deux (ligne pointillée, aimantation automatique). Cliquez pour placer le disque actif, glissez pour l&apos;ajuster.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Card className="flex flex-col gap-3">
              <Segmented value={s.active} onChange={(w) => dispatch({ type: "SET_ACTIVE", which: w })} items={[{ value: "liver", label: "Disque foie" }, { value: "kidney", label: "Disque rein" }]} />
              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-muted">Diamètre</span>
                {[5, 6, 8, 10].map((mm) => (
                  <button key={mm} type="button" disabled={!s.calibration} onClick={() => dispatch({ type: "SET_DIAMETER", mm })} className={cx("font-mono px-2.5 py-1 rounded-md disabled:opacity-40", s.roiDiameterMm === mm ? "bg-accent-dim text-accent" : "bg-surface-2 text-muted")}>{mm} mm</button>
                ))}
              </div>
              <Loupe bitmap={shownBitmap} roi={s.liver} stats={liverStats} label="Foie" color="#2dd4bf" />
              <Loupe bitmap={shownBitmap} roi={s.kidney} stats={kidneyStats} label="Rein" color="#f59e0b" />
              <div className="border-t border-line pt-2">
                <div className="text-[13px] text-muted">Valeur en direct</div>
                <div className={cx("text-[28px] font-mono font-bold leading-tight", blocking.length > 0 && "text-muted line-through decoration-ko")}>{live ? fmt(live.hri) : "—"}</div>
                {live && <div className="text-[12px] text-muted">différence foie − rein {fmt(live.diff, 1)}{s.calibration && s.liver && s.kidney && ` · écart de profondeur ${fmt(depthDiffCm(s.liver.cy, s.kidney.cy, s.calibration), 1)} cm`}</div>}
                {degradedNow && <Badge tone="amber">MODE DÉGRADÉ — photo d&apos;écran, non validé</Badge>}
              </div>
            </Card>
            <Card><QualityPanel checks={checks} /></Card>
            <Button disabled={!canCommit} onClick={commit}>Valider la mesure {Math.min(s.measures.length + 1, RECOMMENDED_MEASURES)}/{RECOMMENDED_MEASURES}</Button>
            {s.measures.length >= RECOMMENDED_MEASURES && <p className="text-[12px] text-muted">Trois mesures enregistrées. Retirez-en une dans les résultats pour en refaire une.</p>}
            <Button variant="ghost" disabled={s.measures.length === 0} onClick={() => dispatch({ type: "SET_STEP", step: "results" })}>Voir les résultats ({s.measures.length})</Button>
          </div>
        </div>
      )}

      {s.step === "results" && grey && (
        <div className="flex flex-col gap-4">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-4">
            <ImageStage {...stageProps} mode="view" />
            <div className="flex flex-col gap-3">
              <ResultCard measures={s.measures} degraded={exportInput.degraded} sourceLabel={sourceText} machineLabelText={machineText} reliabilityLine={RELIABILITY} />
              <Button variant="ghost" onClick={() => dispatch({ type: "SET_STEP", step: "rois" })}>{s.measures.length < RECOMMENDED_MEASURES ? "Ajouter une mesure" : "Retour aux disques"}</Button>
            </div>
          </div>
          <MeasureLog measures={s.measures} onRemove={(id) => dispatch({ type: "REMOVE_MEASURE", id })} />
          <Card>
            <SectionTitle>Seuils publiés (information, non appliqués)</SectionTitle>
            <div className="mt-2"><ThresholdTable machine={s.machine} /></div>
          </Card>
          <ExportPanel input={exportInput} masksCount={s.masks.length} noPatientData={s.noPatientData} onNoPatientData={(v) => dispatch({ type: "SET_NO_PATIENT_DATA", value: v })} />
          <Button variant="ghost" onClick={() => dispatch({ type: "RESET_ALL" })}>Nouvelle image (efface tout)</Button>
        </div>
      )}
    </div>
  );
}
