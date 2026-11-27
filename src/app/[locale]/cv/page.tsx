import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import CvPageActions from './CvPageActions';
import PlayStoreGlyph from './PlayStoreGlyph';
import {
  IconGitHub,
  IconGrid,
  IconLang,
  IconLinkedIn,
  IconMail,
  IconPin,
  IconWhatsApp,
} from './CvIcons';
import type { CvPdfEducationLine, CvPdfPayload } from './cvPdfTypes';
import styles from './cv.module.scss';

type CvPageProps = {
  params: Promise<{ locale: string }>;
};

const LOCALES = ['es', 'en', 'it'] as const;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const linkedinProfileUrl =
  process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim() || 'https://www.linkedin.com/in/octaviofrangipani/';

const EMAIL = 'frangipani.octavio@gmail.com';
const GITHUB_URL = 'https://github.com/octapf';

const CV_WHATSAPP_CONTACTS = [
  { e164: '5491139131406', label: '+54 911 3913 1406', ariaKey: 'whatsappArAria' },
  { e164: '34722696514', label: '+34 722 696 514', ariaKey: 'whatsappAria' },
] as const;

const whatsappChatHref = (e164: string) => `https://wa.me/${e164}`;

const EDUCATION_TITLE_SEP = ' · ';

const MIRALAB_SITE_URL = 'https://miralab.ar';
/** URL pública de este CV (sin barra final). Configurable para dominio propio. */
const CV_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://octapf.github.io/cv-web').replace(
  /\/$/,
  ''
);
/** Same base path as next.config.ts; next/image does not prefix string `src` values with it. */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

type LinkLabelKey =
  | 'featuredQuickLinkWeb'
  | 'featuredQuickLinkAssistant'
  | 'featuredQuickLinkPlay'
  | 'featuredQuickLinkGithubApp'
  | 'featuredQuickLinkGithubWeb';

type ProjectId = 'changa' | 'rize' | 'tierradentro' | 'matchpoint' | 'miralab';

/** Logo y enlaces de cada proyecto destacado (los textos viven en messages/*.json). */
const PROJECT_ASSETS: Record<
  ProjectId,
  { logo: string; links: { label: LinkLabelKey; href: string; play?: boolean }[] }
> = {
  changa: {
    logo: '/images/changa-icon.png',
    links: [
      { label: 'featuredQuickLinkAssistant', href: 'https://changa.miralab.ar/asistente' },
      { label: 'featuredQuickLinkWeb', href: 'https://changa.miralab.ar' },
    ],
  },
  rize: {
    logo: '/images/rize-icon.png',
    links: [{ label: 'featuredQuickLinkWeb', href: 'https://rize.miralab.ar' }],
  },
  tierradentro: {
    logo: '/images/tierradentro-cimarron-logo.png',
    links: [{ label: 'featuredQuickLinkWeb', href: 'https://tierradentrocimarron.miralab.ar' }],
  },
  matchpoint: {
    logo: '/images/matchpoint-icon.png',
    links: [
      {
        label: 'featuredQuickLinkPlay',
        href: 'https://play.google.com/store/apps/details?id=com.miralab.matchpoint',
        play: true,
      },
      { label: 'featuredQuickLinkWeb', href: 'https://matchpoint.miralab.ar/' },
      { label: 'featuredQuickLinkGithubApp', href: 'https://github.com/miralab-ar/matchpoint' },
      { label: 'featuredQuickLinkGithubWeb', href: 'https://github.com/miralab-ar/matchpoint-web' },
    ],
  },
  miralab: {
    logo: '/images/miralab-monogram.png',
    links: [{ label: 'featuredQuickLinkWeb', href: MIRALAB_SITE_URL }],
  },
};

type FeaturedProjectText = {
  id: ProjectId;
  title: string;
  tagline: string;
  description: string;
  stack: string;
};

const EXPERIENCE_ROLES = [
  {
    title: 'roleDatadopeTitle',
    meta: 'roleDatadopeMeta',
    company: 'roleDatadopeCompany',
    bullets: 'roleDatadopeBullets',
  },
  {
    title: 'roleMiralabTitle',
    meta: 'roleMiralabMeta',
    company: 'roleMiralabCompany',
    bullets: 'roleMiralabBullets',
  },
  {
    title: 'roleMinsaitTitle',
    meta: 'roleMinsaitMeta',
    company: 'roleMinsaitCompany',
    bullets: 'roleMinsaitBullets',
  },
  {
    title: 'roleUrbanyTitle',
    meta: 'roleUrbanyMeta',
    company: 'roleUrbanyCompany',
    bullets: 'roleUrbanyBullets',
  },
  {
    title: 'roleWorksutTitle',
    meta: 'roleWorksutMeta',
    company: 'roleWorksutCompany',
    bullets: 'roleWorksutBullets',
  },
  {
    title: 'roleLetiziaTitle',
    meta: 'roleLetiziaMeta',
    company: 'roleLetiziaCompany',
    bullets: 'roleLetiziaBullets',
  },
  {
    title: 'roleSodimacTitle',
    meta: 'roleSodimacMeta',
    company: 'roleSodimacCompany',
    bullets: 'roleSodimacBullets',
  },
] as const;

/** Bullets kept in the PDF (by index, in this order) so it fits on one page; the web page shows all. */
const PDF_BULLET_INDEXES: Record<(typeof EXPERIENCE_ROLES)[number]['bullets'], number[]> = {
  roleDatadopeBullets: [0, 1, 2],
  roleMiralabBullets: [1, 2, 5],
  roleMinsaitBullets: [0, 1],
  roleUrbanyBullets: [],
  roleWorksutBullets: [],
  roleLetiziaBullets: [],
  roleSodimacBullets: [],
};

/** Education lines kept in the PDF: AI engineering, IT Academy and the IB diploma. */
const PDF_EDUCATION_INDEXES = [0, 1, 5];

const SKILL_KEYS = [
  ['skillAiTitle', 'skillAiBody'],
  ['skillFrontendTitle', 'skillFrontendBody'],
  ['skillBackendTitle', 'skillBackendBody'],
  ['skillTestingTitle', 'skillTestingBody'],
  ['skillToolingTitle', 'skillToolingBody'],
] as const;

export async function generateMetadata({ params }: CvPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cvOctavio' });
  const url = `${CV_SITE_URL}/${locale}/cv/`;

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: url,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${CV_SITE_URL}/${l}/cv/`])),
    },
    icons: { icon: `${BASE_PATH}/favicon.svg` },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url,
      siteName: 'Octavio Frangipani',
      type: 'profile',
      locale,
      images: [
        {
          url: `${CV_SITE_URL}/og-cv.png`,
          width: 1200,
          height: 627,
          alt: 'Octavio Frangipani — Senior Full Stack & AI Engineer',
        },
      ],
    },
    twitter: { card: 'summary_large_image', images: [`${CV_SITE_URL}/og-cv.png`] },
  };
}

export default async function CvOctavioFrangipaniPage({ params }: CvPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'cvOctavio' });
  const educationLines = t.raw('educationLines') as string[];
  const featuredProjects = t.raw('featuredProjects') as FeaturedProjectText[];

  const educationParsed: CvPdfEducationLine[] = educationLines.map((line) => {
    const cut = line.indexOf(EDUCATION_TITLE_SEP);
    if (cut === -1) return { kind: 'plain', text: line };
    return {
      kind: 'split',
      title: line.slice(0, cut),
      rest: line.slice(cut + EDUCATION_TITLE_SEP.length),
    };
  });

  const rolesPdf = EXPERIENCE_ROLES.map((role) => {
    const bullets = t.raw(role.bullets) as string[];
    return {
      title: t(role.title),
      meta: t(role.meta),
      company: t(role.company),
      bullets: PDF_BULLET_INDEXES[role.bullets]
        .filter((index) => index < bullets.length)
        .map((index) => ({ text: bullets[index] })),
    };
  });

  const skills = SKILL_KEYS.map(([title, body]) => ({ title: t(title), body: t(body) }));

  const cvPdfPayload: CvPdfPayload = {
    pdfLanguage: locale === 'es' ? 'es' : locale === 'it' ? 'it' : 'en',
    metaTitle: t('metaTitle'),
    headline: t('headline'),
    headlineStack: t('headlineStack'),
    availability: t('availability'),
    location: t('location'),
    whatsapp: CV_WHATSAPP_CONTACTS.map((contact) => ({
      label: contact.label,
      href: whatsappChatHref(contact.e164),
    })),
    email: EMAIL,
    linkedinUrl: linkedinProfileUrl,
    linkedinLabel: t('linkedin'),
    githubUrl: GITHUB_URL,
    githubLabel: t('github'),
    portfolioUrl: MIRALAB_SITE_URL,
    portfolioLabel: t('portfolio'),
    fullCvUrl: `${CV_SITE_URL}/${locale}/cv/`,
    fullCvLabel: t('pdfFullCvLabel'),
    langSpanish: t('langSpanish'),
    langEnglish: t('langEnglish'),
    sectionSummary: t('sectionSummary'),
    // Raw string keeps <k>…</k> for CvPdfDocument; plain t() would require rich-text `k` parts.
    summaryRich: t.raw('summaryPdfRich') as string,
    sectionSkills: t('sectionSkills'),
    skills,
    sectionExperience: t('sectionExperience'),
    roles: rolesPdf,
    sectionEducation: t('sectionEducation'),
    education: PDF_EDUCATION_INDEXES.filter((index) => index < educationParsed.length).map(
      (index) => educationParsed[index]
    ),
  };

  const pageActions = (key: string) => (
    <CvPageActions
      key={key}
      locale={locale}
      langSwitchAria={t('langSwitchAria')}
      langEs={t('langEs')}
      langEn={t('langEn')}
      langIt={t('langIt')}
      pdfLabel={t('pdfDownload')}
      pdfGenerating={t('pdfGenerating')}
      pdfAria={t('pdfAria')}
      pdfFilename={t('pdfFilename')}
      cvPdfPayload={cvPdfPayload}
    />
  );

  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <a
          href={MIRALAB_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.backLink}
          aria-label={t('portfolioLinkAria')}
        >
          <span>{t('portfolio')}</span>
          <span aria-hidden="true">↗</span>
        </a>
        {pageActions(locale)}
      </div>

      <div className={styles.pdfContent}>
        <header className={styles.header}>
          <h1 className={styles.name}>Octavio Frangipani</h1>
          <p className={styles.headline}>{t('headline')}</p>
          <p className={styles.headlineStack}>{t('headlineStack')}</p>
          <p className={styles.availability}>
            <span className={styles.availabilityDot} aria-hidden="true" />
            {t('availability')}
          </p>

          <ul className={styles.facts}>
            <li>
              <IconPin className={styles.metaIcon} />
              <span>{t('location')}</span>
            </li>
            <li>
              <IconLang className={styles.metaIcon} />
              <span>
                {t('langSpanish')} · {t('langEnglish')}
              </span>
            </li>
          </ul>

          <ul className={styles.contacts} aria-label={t('metaContactAria')}>
            <li>
              <a href={`mailto:${EMAIL}`} className={styles.contactLink}>
                <IconMail className={styles.metaIcon} />
                <span>{EMAIL}</span>
              </a>
            </li>
            <li>
              <a
                href={linkedinProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                <IconLinkedIn className={styles.metaIcon} />
                <span>{t('linkedin')}</span>
              </a>
            </li>
            <li>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                <IconGitHub className={styles.metaIcon} />
                <span>{t('github')}</span>
              </a>
            </li>
            <li>
              <a
                href={MIRALAB_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                <IconGrid className={styles.metaIcon} />
                <span>{t('portfolio')}</span>
              </a>
            </li>
            {CV_WHATSAPP_CONTACTS.map((contact) => (
              <li key={contact.e164}>
                <a
                  href={whatsappChatHref(contact.e164)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                  aria-label={t(contact.ariaKey)}
                >
                  <IconWhatsApp className={styles.metaIcon} />
                  <span>{contact.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </header>

        <section className={styles.section} aria-labelledby="summary">
          <h2 id="summary" className={styles.sectionTitle}>
            {t('sectionSummary')}
          </h2>
          <p className={styles.summary}>
            {t.rich('summaryRich', {
              k: (chunks) => <strong className={styles.summaryEm}>{chunks}</strong>,
            })}
          </p>
        </section>

        <section className={styles.section} aria-labelledby="experience">
          <h2 id="experience" className={styles.sectionTitle}>
            {t('sectionExperience')}
          </h2>

          <div className={styles.experienceList}>
            {EXPERIENCE_ROLES.map((role) => {
              const bullets = t.raw(role.bullets) as string[];
              return (
                <article key={role.title} className={styles.role}>
                  <div className={styles.roleTop}>
                    <h3 className={styles.roleTitle}>{t(role.title)}</h3>
                    <span className={styles.roleMeta}>{t(role.meta)}</span>
                  </div>
                  <p className={styles.roleCompany}>{t(role.company)}</p>
                  <ul className={styles.bullets}>
                    {bullets.map((line, index) => (
                      <li key={`${role.bullets}-${index}`}>{line}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="featured-projects">
          <h2 id="featured-projects" className={styles.sectionTitle}>
            {t('sectionFeaturedProjects')}
          </h2>
          <p className={styles.sectionIntro}>{t('featuredProjectsIntro')}</p>
          <div className={styles.projectGrid}>
            {featuredProjects.map((project) => {
              const assets = PROJECT_ASSETS[project.id];
              return (
                <article key={project.id} className={styles.project}>
                  <div className={styles.projectHead}>
                    <Image
                      src={`${BASE_PATH}${assets.logo}`}
                      alt=""
                      width={48}
                      height={48}
                      loading="eager"
                      className={styles.projectLogo}
                    />
                    <div>
                      <h3 className={styles.projectTitle}>{project.title}</h3>
                      <p className={styles.projectTagline}>{project.tagline}</p>
                    </div>
                  </div>
                  <p className={styles.projectBody}>{project.description}</p>
                  <p className={styles.projectStack}>
                    <span className={styles.projectStackLabel}>{t('featuredStackLabel')}: </span>
                    {project.stack}
                  </p>
                  <ul
                    className={styles.projectLinks}
                    aria-label={t('featuredLinksAria', { project: project.title })}
                  >
                    {assets.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.projectLink}
                        >
                          {link.play ? <PlayStoreGlyph className={styles.playStoreGlyph} /> : null}
                          <span>{t(link.label)}</span>
                          <span aria-hidden="true">↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="skills">
          <h2 id="skills" className={styles.sectionTitle}>
            {t('sectionSkills')}
          </h2>
          <dl className={styles.skillsList}>
            {skills.map((skill) => (
              <div key={skill.title} className={styles.skillRow}>
                <dt className={styles.skillTitle}>{skill.title}</dt>
                <dd className={styles.skillBody}>{skill.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="education">
          <h2 id="education" className={styles.sectionTitle}>
            {t('sectionEducation')}
          </h2>
          <ul className={styles.educationList}>
            {educationParsed.map((line, index) => (
              <li key={`education-${index}`}>
                {line.kind === 'plain' ? (
                  <strong className={styles.educationTitle}>{line.text}</strong>
                ) : (
                  <>
                    <strong className={styles.educationTitle}>{line.title}</strong>
                    <span className={styles.educationRest}>{line.rest}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className={styles.bottomActions}>{pageActions(`${locale}-bottom`)}</div>
    </main>
  );
}
