import { Button, Card, SectionTitle } from "@/components/ui";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[30px] font-bold tracking-tight leading-tight">Mesurer l&apos;index hépato-rénal sur une image d&apos;échographie</h1>
        <p className="text-muted mt-2 text-[15px] max-w-2xl">
          Chargez une image en mode B montrant le foie droit et le rein droit, placez un disque dans le parenchyme hépatique et un dans le cortex rénal :
          l&apos;outil calcule le rapport des niveaux de gris, contrôle la qualité de la mesure et affiche l&apos;incertitude. Tout se passe dans votre navigateur.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <SectionTitle>Ce que fait l&apos;outil</SectionTitle>
          <ul className="text-[14px] leading-relaxed list-disc pl-5 mt-1 flex flex-col gap-1">
            <li>Calcule l&apos;index hépato-rénal (gris moyen foie / gris moyen cortex rénal) et la différence foie − rein.</li>
            <li>Impose des ROI de taille physique connue (calibration sur la règle de profondeur) et à la même profondeur.</li>
            <li>Exclut les annotations, détecte les ROI hétérogènes, hors secteur ou trop petits, et bloque la mesure si nécessaire.</li>
            <li>Affiche l&apos;incertitude d&apos;une mesure isolée et recommande trois mesures.</li>
            <li>Met à disposition un tableau documentaire des seuils publiés, avec l&apos;appareil, la population et la référence de chaque étude.</li>
          </ul>
        </Card>
        <Card>
          <SectionTitle>Ce qu&apos;il ne fait pas</SectionTitle>
          <ul className="text-[14px] leading-relaxed list-disc pl-5 mt-1 flex flex-col gap-1">
            <li>Il ne pose aucun diagnostic et n&apos;affiche aucun verdict : il n&apos;applique aucun seuil à votre mesure.</li>
            <li>Il ne quantifie pas et ne grade pas la graisse hépatique.</li>
            <li>Il n&apos;est pas un dispositif médical marqué CE ; c&apos;est un outil de recherche et d&apos;enseignement.</li>
            <li>Il n&apos;est pas validé sur les photos d&apos;écran prises au téléphone (mode dégradé, valeur affichée sans garantie).</li>
            <li>Il ne stocke rien, n&apos;envoie rien, ne suit rien.</li>
          </ul>
        </Card>
      </div>

      <Card>
        <SectionTitle>Fiabilité attendue</SectionTitle>
        <p className="text-[14px] mt-1 leading-relaxed">
          Sur une capture native, l&apos;écart avec l&apos;outil intégré d&apos;un échographe a été de 7 % sur une seule image ; une validation sur une série d&apos;images est en cours.
          Une mesure isolée porte une incertitude d&apos;environ ±0,3 (limites d&apos;agrément intra-observateur publiées ≈ ±0,35). Sur une photo d&apos;écran, aucune donnée : non validé.
          Le détail, les facteurs qui faussent la mesure et la position des sociétés savantes sont sur la page <a className="text-accent underline" href="/limites">Limites et fiabilité</a>.
        </p>
      </Card>

      <div className="max-w-sm">
        <Button href="/mesure">Commencer une mesure</Button>
      </div>
    </div>
  );
}
