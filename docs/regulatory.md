# Cadre réglementaire (résumé, à confirmer avec un conseil spécialisé)

## Qualification
- Règlement (UE) 2017/745 (MDR), art. 2(1) : un logiciel est un dispositif médical si son usage revendiqué est médical. MDCG 2019-11 : un calcul sur image à visée diagnostique va au-delà du simple affichage.
- Règle 11 : un logiciel fournissant des informations utilisées pour des décisions diagnostiques est en classe IIa au minimum.

## Choix fait pour cette application
- L'application n'affiche que des grandeurs mesurées (gris moyens, ratio, différence, statistiques de qualité) et un tableau bibliographique non lié à la valeur. Elle ne conclut pas. Revendication : **outil de mesure pour la recherche et l'enseignement**.
- Ce positionnement vise à rester hors du champ « information diagnostique » ; son maintien en classe I ou hors DM est plausible mais **non confirmé** [à vérifier avec un consultant réglementaire].
- Tout ajout d'une interprétation (« probable », zones colorées, grades) ferait basculer en classe IIa quel que soit l'avertissement.

## Chemin CE complet (si commercialisation ou interprétation)
ISO 13485 (SMQ) · IEC 62304 et IEC 82304-1 (cycle de vie logiciel) · ISO 14971 (risques) · IEC 62366-1 (aptitude à l'utilisation) · MDCG 2019-16 (cybersécurité) · évaluation clinique MDCG 2020-1 · documentation technique annexes II/III · UDI + EUDAMED · personne chargée de la conformité (art. 15) · surveillance après commercialisation · organisme notifié (classe IIa) · enregistrement ANSM. Ordre de grandeur : 12 à 24 mois [estimation].

## Données
- Aucun traitement côté serveur : pas d'hébergement HDS ni de DPIA obligatoire. Preuves : CSP (`proxy.ts`), test statique `guardrails-static.test.ts`.
- Le traitement dans le navigateur relève de la responsabilité de l'utilisateur et de son établissement.

## Chemin intermédiaire
1. v1 : outil de recherche/enseignement, code MIT, page /limites explicite, pas de CE.
2. Usage interne dans un établissement : exemption art. 5(5) MDR (fabrication et usage au sein du même établissement, sous SMQ) — suppose que l'établissement déploie sa propre copie [conditions à vérifier avec la DRCI / direction qualité].
3. Étude de validation (`docs/validation-protocol.md`) sur images rétrospectives anonymisées ; si pseudonymisées, méthodologie de référence CNIL MR-004 portée par l'établissement [à confirmer]. Publication possible (accord application vs outil constructeur, reproductibilité).
