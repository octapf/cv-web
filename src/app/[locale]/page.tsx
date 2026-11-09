import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

export function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }, { locale: 'it' }];
}

type LocaleHomeProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHome({ params }: LocaleHomeProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(`/${locale}/cv`);
}
