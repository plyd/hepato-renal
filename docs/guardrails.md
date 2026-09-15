# Garde-fous (spécification, à relire avant toute modification de l'interface)

Principe : **mieux vaut ne rien dire que dire quelque chose dont on n'est pas sûr.** L'outil mesure ; il n'interprète pas.

## Toujours affiché
- **G1** IHR à 2 décimales + différence foie − rein (niveaux de gris), sans seuil sur la différence. — `Results.tsx`, `MeasureApp.tsx`
- **G2** Par ROI : moyenne, écart-type, n pixels, pixels exclus, diamètre en mm si calibré. — `Loupe.tsx`, `Results.tsx`
- **G3** Incertitude : mesure isolée ⇒ ±0,3 ; 3 mesures ⇒ moyenne + min–max ; étendue > 0,30 ⇒ « discordantes ». — `hri.ts`, `summary.ts`
- **G4** Bandeau permanent non fermable sur toutes les pages. — `ui.tsx` `PermanentBanner`, `layout.tsx`
- **G5** Sur /mesure : « L'image ne quitte jamais cet appareil… ». — `MeasureApp.tsx`
- **G6** Fiabilité attendue toujours visible (chiffre à mettre à jour après validation). — `MeasureApp.tsx` `RELIABILITY`, `/`, `/limites`
- **G7** Contrôles de qualité visibles à chaque étape. — `QualityPanel.tsx`

## Jamais affiché
- **G8** Jamais de verdict, de grade, de % de graisse, de jauge ou de couleur positionnant la valeur. — test statique `guardrails-static.test.ts`
- **G9** Le mot « stéatose » n'apparaît que dans `references.ts`, `/limites` et `/references`. — test statique
- **G10** Aucun champ texte libre. — revue de code

## Tableau des seuils
- **G11** Filtré par appareil déclaré, onglet « autres (non transposables) ». — `ThresholdTable.tsx`
- **G12** Valeur mesurée jamais reportée ni surlignée ; texte fixe d'avertissement. — `ThresholdTable.tsx`
- **G13** Appareil inconnu ⇒ onglet « tous » + avertissement renforcé. — `ThresholdTable.tsx`

## Contrôles de qualité (`quality.ts`, seuils provisoires)
- **G14** Un `block` empêche de valider la mesure ; la valeur reste visible barrée. Exception : `source-photo` (voir G15).
- **G15** Mode photo : mesure validable mais étiquetée « MODE DÉGRADÉ — photo d'écran, non validé » partout (écran, copie, export).
- **G16** Compteur n/3 ; export avec < 3 mesures porte la mention d'incertitude.

## Données
- **G17** Export et copie bloqués sans masque noir ni case « aucune donnée identifiante ». — `Results.tsx` `ExportPanel`
- **G18** Aucune persistance, aucun réseau : `localStorage`, `indexedDB`, cookies, `fetch(`, `sendBeacon`, `XMLHttpRequest`, `WebSocket` interdits dans `lib/`, `components/`, `app/`. — test statique + CSP `connect-src 'self'`
- **G19** Pas de service worker (v1). Si ajouté : app shell uniquement.
- **G20** Avertissement complet accepté à chaque session, non persisté. — `Disclaimer.tsx`
- **G21** `/limites` liste tous les facteurs confondants et la position des sociétés savantes.
