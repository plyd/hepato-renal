# Protocole de validation contre l'outil constructeur

Objectif : mesurer l'accord entre l'index calculé par l'application sur une capture et l'index calculé par l'échographe (« B-mode Ratio » Supersonic/Hologic), et la reproductibilité inter-lecteur. Résultat attendu : mise à jour de la phrase de fiabilité (G6) et recalage des seuils de `lib/engine/quality.ts`.

## Matériel
- ~20 images Supersonic MACH 30 avec le B-mode Ratio affiché (foie moyen, rein moyen, ratio, diamètre, profondeurs), **anonymisées par le médecin** avant transfert, en **export natif** (USB/DICOM converti en PNG sans recompression si possible).
- Sous-ensemble de 5 à 10 images également **photographiées à l'écran** avec un téléphone (même écran, éclairage habituel de la salle).
- Aucune image ne quitte l'établissement sans anonymisation ; les fichiers de travail restent hors dépôt (`fixtures/private/`).

## Procédure
1. Deux lecteurs (médecin + un collègue), en aveugle de la valeur machine (bandeau de valeurs masqué dans l'application avant la mesure).
2. Calibration sur la règle de profondeur, disques de 6 mm, placés sur les cercles tracés par la machine.
3. Trois mesures par image et par lecteur ; relever pour chacune : moyennes foie et rein, IHR, écart de profondeur, contrôles déclenchés (avertissements et blocages).
4. Même procédure sur les photos d'écran (mode dégradé).

## Analyses (feuille de calcul, hors application)
- Bland-Altman application vs machine (biais moyen, limites d'agrément) sur la moyenne des 3 mesures, export natif puis photo.
- ICC inter-lecteur sur l'IHR (modèle à effets aléatoires, accord absolu).
- Taux de déclenchement de chaque contrôle ; images bloquées à tort ou à raison.

## Cibles (export natif)
- Biais |≤ 0,05| ; limites d'agrément ≤ ±0,15 (à comparer aux ±0,35 intra-observateur de la littérature) ; ICC ≥ 0,80.
- Photo d'écran : rapporté seulement, pas de cible ; sert à documenter le mode dégradé.

## Sorties
- Mise à jour de G6 (page d'accueil, `/limites`, `MeasureApp.tsx`) avec les chiffres réels et la taille de l'échantillon.
- Recalage des seuils `cvWarn/cvBlock`, `overlayBlockFraction`, `depthWarnCm` si les blocages sont trop fréquents ou trop rares.
- Version 0.2.0 et entrée CHANGELOG.
