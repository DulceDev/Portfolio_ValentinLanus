import { readFileSync, existsSync } from 'node:fs';

const files = ['src/content/links.ts', 'astro.config.mjs'];
const pattern = /TODO\(\s*['"`](.+?)['"`]\s*\)|PLACEHOLDER:\s*(.+)$/;
let total = 0;

for (const file of files) {
  if (!existsSync(file)) continue;
  readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line, i) => {
      const m = line.match(pattern);
      if (!m) return;
      total++;
      console.log(`  ${file}:${i + 1}  ${m[1] ?? m[2]}`);
    });
}

console.log(total ? `\n⚠ ${total} placeholders pendientes\n` : '\n✓ Sin placeholders\n');
