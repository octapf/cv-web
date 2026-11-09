import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: 'CV – Octavio Frangipani',
  description:
    'Senior Full Stack Developer (React, TypeScript, Next.js, Python/FastAPI). Currículum en español, inglés e italiano.',
};

export function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }, { locale: 'it' }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} data-theme="dark">
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
