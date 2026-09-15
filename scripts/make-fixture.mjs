// Génère la fixture privée de test à partir de l'image d'exemple de Seb.
// Usage : node scripts/make-fixture.mjs ~/Projets/index-hepato-renal/sources-seb/image-exemple-echo.jpg
// Sortie : lib/engine/__tests__/fixtures/private/seb-sector.pgm (gitignoré).
// Crop identique à notes/analyse.py : bbox du contenu non blanc = colonnes 21–696, lignes 0–538 (676×539).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const src = process.argv[2];
if (!src) { console.error("chemin du JPEG requis"); process.exit(1); }
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "lib", "engine", "__tests__", "fixtures", "private");
mkdirSync(outDir, { recursive: true });

const { data, info } = await sharp(src).extract({ left: 21, top: 0, width: 676, height: 539 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const n = info.width * info.height;
const grey = Buffer.alloc(n);
for (let i = 0; i < n; i++) grey[i] = Math.round((data[i * 3] + data[i * 3 + 1] + data[i * 3 + 2]) / 3);
const header = Buffer.from(`P5\n${info.width} ${info.height}\n255\n`, "latin1");
const out = join(outDir, "seb-sector.pgm");
writeFileSync(out, Buffer.concat([header, grey]));
console.log(`écrit ${out} (${info.width}×${info.height})`);
