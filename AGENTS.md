<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Localisation

Ce projet vit dans ~/dev/hepato-renal, HORS de ~/Documents (synchronisé iCloud Drive, ce qui corrompt node_modules). Ne pas le déplacer.

# Projet

- Outil de mesure de l'index hépato-rénal sur image échographique, 100 % côté client. **Pas un dispositif médical, aucune interprétation.**
- Avant toute modification de l'interface, relire `docs/guardrails.md` (G1–G21). Les tests statiques `lib/engine/__tests__/guardrails-static.test.ts` interdisent tout verdict et tout appel réseau : ne pas les contourner.
- Moteur pur dans `lib/engine` (zéro import React/DOM), reducer pur dans `lib/state`, code navigateur dans `lib/browser`. Tests : `npm test` (vitest).
- Fixture patient privée : `lib/engine/__tests__/fixtures/private/` (gitignoré), générée par `node scripts/make-fixture.mjs <jpeg>`. Ne jamais versionner d'image patient.
- Étude préalable et bibliographie : `~/Projets/index-hepato-renal/` (hors dépôt).
- Sécurité : CSP avec nonce dans `proxy.ts`, en-têtes dans `next.config.ts`. Aucune dépendance runtime tierce.
- Déploiement : `npm run lint && npm test && npm run build && vercel --prod` (projet Vercel « hepato-renal »).
