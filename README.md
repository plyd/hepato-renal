# hepato-renal

Mesure de l'index hépato-rénal (IHR) sur une image d'échographie en mode B, entièrement dans le navigateur.

> **Outil de mesure, pas un dispositif médical.** L'application ne diagnostique rien, n'applique aucun seuil à la mesure et ne quantifie pas la graisse hépatique. Elle est destinée à la recherche et à l'enseignement. L'interprétation appartient au médecin.

## Ce que fait l'outil
1. Chargement local d'une image (export natif, capture d'écran ; photo d'écran acceptée en **mode dégradé, non validé**).
2. Masquage irréversible du bandeau patient.
3. Calibration de l'échelle en deux clics sur la règle de profondeur.
4. Placement de deux disques de diamètre physique connu (6 mm par défaut) dans le parenchyme hépatique et le cortex rénal droit, à la même profondeur.
5. IHR = gris moyen foie / gris moyen rein, différence foie − rein, écart-type et pixels exclus par disque, contrôles de qualité bloquants, trois mesures recommandées avec incertitude.
6. Tableau documentaire des seuils publiés (étude, appareil, population, référence), jamais appliqué à la mesure.
7. Export PNG annoté, bloqué tant que le bandeau n'est pas masqué.

## Fiabilité
- Sur une capture native, écart de 7 % avec l'outil constructeur sur une image ; validation sur une série en cours (`docs/validation-protocol.md`).
- Mesure isolée : incertitude ≈ ±0,3 (limites d'agrément intra-observateur publiées ≈ ±0,35).
- Photo d'écran : aucune donnée, non validé.
- Détails, facteurs confondants et position des sociétés savantes : page « Limites et fiabilité ».

## Confidentialité
Rien ne quitte l'appareil : pas de serveur de traitement, pas de stockage, pas de statistique. Politique de sécurité stricte (`proxy.ts`) et test statique interdisant tout appel réseau (`lib/engine/__tests__/guardrails-static.test.ts`).

## Développement
```bash
npm install
npm run dev        # http://localhost:3000
npm test           # moteur (vitest)
npm run lint
npm run build
```
- Moteur pur : `lib/engine` (gris, ROI, calibration, IHR, contrôles, références, EXIF).
- Garde-fous : `docs/guardrails.md` (G1–G21), à relire avant toute modification de l'interface.
- Fixture privée pour la non-régression : `node scripts/make-fixture.mjs <image.jpg>` (jamais versionnée).

## Déploiement
Vercel, sans variable d'environnement : `vercel --prod`.

## Licence
Code : MIT. Documentation : CC BY 4.0.
