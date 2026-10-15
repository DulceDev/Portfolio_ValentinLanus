import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

type HeaderRule = { source: string; headers: { key: string; value: string }[] };
const rules: HeaderRule[] = JSON.parse(read('../vercel.json')).headers;
const allHeaders = rules.flatMap((rule) => rule.headers);

// Hash de cada <script> inline ejecutable (sin src y que no sea JSON-LD), sobre el cuerpo exacto.
const inlineScriptHashes = (html: string) => {
  const hashes = new Set<string>();
  for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc\s*=/.test(attrs)) continue;
    if (/\btype\s*=\s*["']?application\/ld\+json/i.test(attrs)) continue;
    hashes.add('sha256-' + createHash('sha256').update(body).digest('base64'));
  }
  return hashes;
};

test('los hashes de script-src en vercel.json coinciden con los scripts inline del build', () => {
  const built = new Set([
    ...inlineScriptHashes(read('../dist/index.html')),
    ...inlineScriptHashes(read('../dist/en.html')),
  ]);
  expect(built.size, 'el build tiene que tener scripts inline para hashear').toBeGreaterThan(0);

  const csp = allHeaders.find((h) => h.key === 'Content-Security-Policy-Report-Only');
  expect(csp, 'falta el header Content-Security-Policy-Report-Only').toBeDefined();
  const scriptSrc = csp!.value
    .split(';')
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith('script-src '));
  expect(scriptSrc, 'falta la directiva script-src').toBeDefined();
  const declared = new Set(scriptSrc!.match(/'(sha256-[^']+)'/g)?.map((t) => t.slice(1, -1)));

  expect([...declared].sort()).toEqual([...built].sort());
});

test('la CSP sigue en modo Report-Only (ningún header enforcing)', () => {
  const enforcing = allHeaders.filter((h) => h.key.toLowerCase() === 'content-security-policy');
  expect(enforcing).toEqual([]);
});
