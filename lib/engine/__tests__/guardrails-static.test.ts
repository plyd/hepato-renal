// Tests statiques des garde-fous G8/G9 (aucun verdict) et G18 (aucun réseau, aucune persistance).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..", "..", "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "node_modules" || name === ".next" || name === "__tests__") continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|mjs)$/.test(name)) out.push(p);
  }
  return out;
}

const sources = ["lib", "components", "app"].flatMap((d) => walk(join(ROOT, d)));

describe("G18 — aucune persistance, aucun réseau sortant", () => {
  const forbidden = /\b(localStorage|sessionStorage|indexedDB|document\.cookie|sendBeacon|XMLHttpRequest|WebSocket|EventSource)\b|\bfetch\s*\(/;
  it.each(sources.map((p) => [relative(ROOT, p), p]))("%s", (_rel, p) => {
    const src = readFileSync(p, "utf8");
    expect(src).not.toMatch(forbidden);
  });
});

describe("G8/G9 — aucun verdict dans l'interface de mesure", () => {
  // Autorisés : le registre des références et les pages documentaires /limites et /references.
  const allowed = /lib\/engine\/references\.ts$|app\/limites\/|app\/references\//;
  const verdict = /st[ée]atose\s*:\s*(oui|non)|probable|peu probable|grade\s*S[0-3]|% de graisse|diagnostic\s*:/i;
  const word = /st[ée]atose/i;
  it.each(sources.filter((p) => !allowed.test(p)).map((p) => [relative(ROOT, p), p]))("%s", (_rel, p) => {
    const src = readFileSync(p, "utf8");
    expect(src).not.toMatch(verdict);
    expect(src).not.toMatch(word);
  });
});
