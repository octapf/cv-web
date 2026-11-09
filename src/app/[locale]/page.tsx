import { redirect } from 'next/navigation';

type LocaleHomeProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHome({ params }: LocaleHomeProps) {
  const { locale } = await params;
  redirect(`/${locale}/cv`);
}
