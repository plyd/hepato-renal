# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [0.1.0] — 2026-09-15

### Ajouté
- Mesure de l'index hépato-rénal sur image chargée localement : conversion en gris (R+G+B)/3, exclusion des pixels saturés, colorés et de fond.
- Calibration de l'échelle en deux clics sur la règle de profondeur ; disques de diamètre physique réglable (5 à 10 mm, 6 mm par défaut).
- Contrôles de qualité bloquants ou avertissants (échelle, résolution, taille, homogénéité, annotations, secteur, chevauchement, profondeur, rein, source).
- Trois mesures recommandées, moyenne, étendue, incertitude d'une mesure isolée.
- Mode dégradé pour les photos d'écran (détection EXIF).
- Tableau documentaire des seuils publiés, filtré par appareil, jamais appliqué à la mesure.
- Masquage irréversible du bandeau patient ; export PNG et copie texte bloqués tant qu'il n'est pas traité.
- Pages Limites et fiabilité, Références. Avertissement à accepter à chaque session.
- CSP avec nonce, en-têtes de sécurité, aucune persistance, aucun réseau sortant (tests statiques).
