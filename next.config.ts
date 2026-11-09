import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

// Sitio estático (GitHub Pages). NEXT_PUBLIC_BASE_PATH = "/cv-web" cuando se publica
// bajo https://<usuario>.github.io/cv-web; vacío en desarrollo o con dominio propio.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default withNextIntl(nextConfig);
