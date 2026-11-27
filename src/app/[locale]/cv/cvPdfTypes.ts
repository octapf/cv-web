export type CvPdfSkill = { title: string; body: string };

export type CvPdfContactLink = { label: string; href: string };

export type CvPdfBullet = { text: string };

export type CvPdfRole = {
  title: string;
  meta: string;
  company: string;
  bullets: CvPdfBullet[];
};

export type CvPdfEducationLine =
  { kind: 'plain'; text: string } | { kind: 'split'; title: string; rest: string };

export type CvPdfPayload = {
  /** BCP 47 tag for PDF metadata / accessibility */
  pdfLanguage: string;
  metaTitle: string;
  headline: string;
  headlineStack: string;
  availability: string;
  location: string;
  whatsapp: CvPdfContactLink[];
  email: string;
  linkedinUrl: string;
  linkedinLabel: string;
  githubUrl: string;
  githubLabel: string;
  portfolioUrl: string;
  portfolioLabel: string;
  /** Link to the full web CV (the PDF is the short entry point) */
  fullCvUrl: string;
  fullCvLabel: string;
  langSpanish: string;
  langEnglish: string;
  sectionSummary: string;
  summaryRich: string;
  sectionSkills: string;
  skills: CvPdfSkill[];
  sectionExperience: string;
  roles: CvPdfRole[];
  sectionEducation: string;
  education: CvPdfEducationLine[];
};
