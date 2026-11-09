// Después de `next build` (export estático): redirecciones sin JavaScript y .nojekyll para GitHub Pages.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const out = 'out';
const page = (target) =>
  `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Octavio Frangipani — CV</title>` +
  `<meta http-equiv="refresh" content="0; url=${target}"><link rel="canonical" href="${target}"></head>` +
  `<body><a href="${target}">Ver el CV</a></body></html>\n`;

const redirects = { '': 'es', cv: 'es', es: 'es', en: 'en', it: 'it' };
for (const [dir, locale] of Object.entries(redirects)) {
  mkdirSync(join(out, dir), { recursive: true });
  writeFileSync(join(out, dir, 'index.html'), page(`${base}/${locale}/cv/`));
}
writeFileSync(join(out, '.nojekyll'), '');
console.log('postbuild: redirecciones estáticas y .nojekyll escritos');
