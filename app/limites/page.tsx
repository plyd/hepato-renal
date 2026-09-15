import { Card } from "@/components/ui";

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[18px] font-semibold mt-2">{children}</h2>;
}

export default function LimitesPage() {
  return (
    <div className="flex flex-col gap-4 max-w-3xl text-[14px] leading-relaxed">
      <h1 className="text-[26px] font-bold tracking-tight">Limites et fiabilité</h1>
      <p className="text-muted">Cette page dit ce que l&apos;outil mesure, ce qu&apos;il ne mesure pas, et pourquoi une valeur d&apos;index hépato-rénal doit être lue avec prudence.</p>

      <Card className="flex flex-col gap-2">
        <H>Ce que l&apos;outil est, et n&apos;est pas</H>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>Un <strong>outil de mesure</strong> : il calcule le rapport des niveaux de gris moyens entre deux disques que vous placez, comme le font ImageJ, un PACS ou l&apos;outil intégré de certains échographes.</li>
          <li><strong>Pas un dispositif médical</strong> au sens du règlement (UE) 2017/745 : pas de marquage CE, pas d&apos;évaluation clinique, pas de système qualité. Usage : recherche, enseignement, travail personnel du médecin.</li>
          <li><strong>Aucun diagnostic, aucun verdict.</strong> L&apos;outil n&apos;applique aucun seuil à la valeur mesurée. Les seuils publiés sont affichés à titre documentaire, avec leur contexte, sur la page Références.</li>
          <li><strong>Ni quantification ni grade.</strong> La littérature montre un effet de saturation : l&apos;index distingue mal les stéatoses modérées des sévères (Hamadouche 2025 : AUC 0,61 pour ≥ S2).</li>
        </ul>
      </Card>

      <Card className="flex flex-col gap-2">
        <H>Fiabilité attendue</H>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li><strong>Capture native ou export</strong> : sur une image d&apos;exemple, le recalcul a donné 1,23 contre 1,32 pour l&apos;outil intégré de l&apos;échographe (écart 7 %). Une validation sur une série d&apos;images (accord de Bland-Altman contre la valeur machine, reproductibilité inter-lecteur) est en cours ; cette page sera mise à jour avec les chiffres.</li>
          <li><strong>Mesure isolée</strong> : incertitude d&apos;environ ±0,3, d&apos;après les limites d&apos;agrément intra-observateur publiées (≈ ±0,35, Hamadouche 2024). Trois mesures sont recommandées ; une étendue supérieure à 0,30 entre elles doit faire recommencer.</li>
          <li><strong>Photo d&apos;écran au téléphone</strong> : aucune étude publiée. Reflets, moiré, perspective, balance des blancs et courbe de gris de l&apos;appareil photo modifient les niveaux de gris. La valeur est affichée en mode dégradé, sans garantie.</li>
          <li><strong>Placement des disques</strong> : sur l&apos;image d&apos;exemple, un décalage de 2 mm fait varier l&apos;index de 1,25 à 1,63. La reproductibilité inter-observateur de l&apos;index est modérée dans la littérature (ICC 0,58 à 0,93 selon les études).</li>
          <li><strong>Échecs</strong> : dans 8 à 12 % des examens, foie et rein ne sont pas visibles ensemble avec une qualité suffisante (obésité, gaz, distance peau-capsule). L&apos;outil ne compense pas une mauvaise image.</li>
        </ul>
      </Card>

      <Card className="flex flex-col gap-2">
        <H>Ce qui fausse la mesure</H>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li><strong>Réglages de l&apos;échographe.</strong> L&apos;image affichée est compressée en logarithme, puis passée par une courbe de gris et un post-traitement. Le gain et la TGC décalent linéairement le gris moyen (Vara 2020, R² = 0,99) ; le rapport entre deux régions n&apos;y est donc pas insensible. Deux appareils ou deux préréglages donnent deux valeurs pour le même foie.</li>
          <li><strong>Seuils non transposables.</strong> Les seuils publiés vont de 0,985 à 2,20 pour « stéatose ≥ 5 % » selon l&apos;appareil, la population, la méthode de référence (biopsie, IRM-PDFF, spectroscopie) et la prévalence.</li>
          <li><strong>Position du disque rénal.</strong> Le cortex rénal est anisotrope : selon qu&apos;il est mesuré au pôle moyen ou au pôle supérieur, le seuil optimal passe de 2,24 à 1,08 (Gao 2025). Mesurer au pôle moyen, entre les pyramides, hors sinus.</li>
          <li><strong>Profondeur.</strong> Les deux disques doivent être à la même profondeur pour neutraliser l&apos;atténuation. L&apos;outil compare les profondeurs verticales (axe de l&apos;écran), pas les profondeurs radiales le long du faisceau ; sur un secteur incliné l&apos;écart peut être sous-estimé de quelques millimètres.</li>
          <li><strong>Rein pathologique.</strong> Une néphropathie ou un cortex hyperéchogène rapproche le rein du foie et abaisse artificiellement l&apos;index : la mesure n&apos;est pas interprétable.</li>
          <li><strong>Fibrose avancée</strong> : effet discuté (nul pour Hamadouche 2025 et Petzold 2020, réduction de la performance pour Tanpowpong 2020 et Stahlschmidt 2021).</li>
          <li><strong>Enfants</strong> : échotexture rénale différente, seuils différents (1,215 à 1,99 en pédiatrie).</li>
          <li><strong>Contenu des disques</strong> : vaisseau, voie biliaire, pyramide, sinus, artefact ou annotation à l&apos;écran. L&apos;outil exclut les pixels saturés et colorés, et bloque la mesure si le disque est trop hétérogène, mais il ne reconnaît pas l&apos;anatomie.</li>
          <li><strong>Format de l&apos;image</strong> : compression JPEG, ré-échantillonnage (images réduites à 2000 px), zoom d&apos;affichage. Aucune étude n&apos;a quantifié ces effets ; ils sont probablement faibles sur une capture native et inconnus sur une photo.</li>
        </ul>
      </Card>

      <Card className="flex flex-col gap-2">
        <H>Position des sociétés savantes</H>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>La <strong>WFUMB 2024</strong> (guide de quantification de la graisse hépatique par ultrasons) écarte explicitement l&apos;index hépato-rénal : « pas une mesure directe et quantitative de la graisse hépatique ».</li>
          <li>Les recommandations <strong>EASL-EASD-EASO 2024</strong> et <strong>AASLD 2023/2025</strong> ne le mentionnent pas et privilégient le CAP, le coefficient d&apos;atténuation et l&apos;IRM-PDFF.</li>
          <li>Deux méta-analyses de 2026 (Wang, 13 études ; Sutanto, pédiatrie) concluent à une bonne performance de dépistage mais à des seuils non transposables entre études.</li>
        </ul>
      </Card>

      <Card className="flex flex-col gap-2">
        <H>Confidentialité et sécurité</H>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>L&apos;image est lue et traitée dans votre navigateur. Elle n&apos;est jamais envoyée à un serveur ; la politique de sécurité du site (CSP) interdit toute connexion vers un autre domaine et le code est libre et vérifiable.</li>
          <li>Rien n&apos;est stocké : pas de compte, pas de cookie, pas de stockage local, pas de statistique d&apos;usage. Recharger la page efface tout.</li>
          <li>Masquez le bandeau patient avant d&apos;exporter : l&apos;export est bloqué tant que vous ne l&apos;avez pas fait ou confirmé l&apos;absence de donnée identifiante. Vous restez responsable des images que vous manipulez et de l&apos;usage de l&apos;export.</li>
        </ul>
      </Card>

      <Card className="flex flex-col gap-2">
        <H>Méthode de calcul</H>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>Gris = (R + G + B) / 3, comme la conversion par défaut d&apos;ImageJ utilisée dans la littérature. Pixels exclus : saturés (≥ 250), colorés, fond noir.</li>
          <li>Disques de diamètre physique réglable (6 mm par défaut, comme dans l&apos;étude de validation Supersonic), grâce à la calibration sur la règle de profondeur.</li>
          <li>Index = gris moyen du disque foie / gris moyen du disque rein. Différence foie − rein donnée en indicateur secondaire.</li>
          <li>Contrôles bloquants : échelle inconnue, résolution insuffisante, disque trop petit, hétérogène (CV &gt; 40 %), sur une annotation, hors secteur, disques qui se chevauchent, écart de profondeur &gt; 1 cm, rein non confirmé normal. Seuils provisoires, à recaler après validation.</li>
        </ul>
      </Card>
    </div>
  );
}
