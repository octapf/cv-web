# cv-web

Currículum web de Octavio Frangipani, extraído del sitio de MIRALAB como proyecto independiente.

- Next.js 16 (App Router) + React 19 + TypeScript.
- `next-intl` para tres idiomas: `/es/cv`, `/en/cv`, `/it/cv` (por defecto `es`).
- Descarga en PDF generada en el navegador con `@react-pdf/renderer`.
- `/` y `/cv` redirigen a `/es/cv`.

## Correr en local

```bash
npm install
npm run dev
```

Abrir http://localhost:3000 (redirige a `/es/cv`).

## Build de producción

```bash
npm run build
npm start
```

## Estructura

```
i18n.ts                      configuración de next-intl (carga messages/cvOctavio.<locale>.json)
middleware.ts                detección y prefijo de locale
messages/cvOctavio.*.json    textos del CV (es, en, it)
src/app/[locale]/cv/         página del CV, acciones (idioma + PDF) y documento PDF
src/app/[locale]/layout.tsx  layout raíz (html lang, NextIntlClientProvider)
src/styles/globals.scss      variables de tema y reset mínimos
public/images/               logo usado en proyectos destacados
```

Variable opcional: `NEXT_PUBLIC_LINKEDIN_URL` sobreescribe el enlace a LinkedIn.
