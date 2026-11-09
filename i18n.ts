import { getRequestConfig } from 'next-intl/server';

export const locales = ['es', 'en', 'it'] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = 'es';

function isSupportedLocale(locale: string): locale is AppLocale {
  return locales.includes(locale as AppLocale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !isSupportedLocale(locale)) {
    locale = defaultLocale;
  }

  const cvPack = (await import(`./messages/cvOctavio.${locale}.json`)).default;

  return {
    locale,
    messages: {
      cvOctavio: cvPack.cvOctavio,
    },
  };
});
