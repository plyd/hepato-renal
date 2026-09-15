"use client";

import { useState } from "react";
import { Button, Card, Checkbox } from "./ui";

/** Avertissement complet à accepter à chaque session avant de mesurer (G20). Jamais persisté. */
export function Disclaimer({ onAccept }: { onAccept: () => void }) {
  const [read, setRead] = useState(false);
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <h1 className="text-[24px] font-bold tracking-tight">Avant de mesurer</h1>
      <Card className="flex flex-col gap-3 text-[14px] leading-relaxed">
        <p><strong>Cet outil n&apos;est pas un dispositif médical.</strong> Il n&apos;est pas marqué CE et n&apos;a pas fait l&apos;objet d&apos;une évaluation clinique. C&apos;est un outil de mesure destiné à la recherche et à l&apos;enseignement.</p>
        <p><strong>Il ne diagnostique rien.</strong> Il calcule un rapport de niveaux de gris entre deux régions que vous placez. Il n&apos;applique aucun seuil à votre mesure et n&apos;affiche aucune conclusion clinique. L&apos;interprétation appartient au médecin, avec le reste du bilan.</p>
        <p><strong>La mesure dépend de l&apos;appareil et des réglages</strong> (gain, TGC, dynamique, post-traitement), de la profondeur, de la position exacte des régions et de l&apos;état du rein. Les seuils publiés ne sont pas transposables d&apos;un appareil à l&apos;autre.</p>
        <p><strong>Une mesure isolée porte une incertitude d&apos;environ ±0,3.</strong> Trois mesures sont recommandées. Une photo d&apos;écran prise au téléphone n&apos;est pas validée : la valeur est affichée en mode dégradé.</p>
        <p><strong>Confidentialité.</strong> L&apos;image est traitée dans votre navigateur et n&apos;est ni envoyée, ni stockée. Masquez le bandeau patient avant tout export. Rechargez la page pour tout effacer.</p>
      </Card>
      <Checkbox checked={read} onChange={setRead} label="J'ai lu et compris que cet outil ne fournit qu'une mesure, sans interprétation, et qu'il n'est pas un dispositif médical." />
      <Button disabled={!read} onClick={onAccept}>Continuer vers la mesure</Button>
    </div>
  );
}
