import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { FlagComponent } from 'country-flag-icons/react/1x1';
import { LocaleSingularArg } from '@fullcalendar/react';
import { Locale as DateLocale } from 'date-fns';
import {
  BR,
  DE,
  ES,
  FR,
  PL,
  TR,
  US,
  SA,
  IT,
  SE,
  RU,
  HU,
  NL,
  CN,
  BA,
  VN
} from 'country-flag-icons/react/3x2';

// ─── Lazy translation loaders ────────────────────────────────────────────────
const translationLoaders: Record<string, () => Promise<{ default: object }>> = {
  de: () => import('./translations/de'),
  en: () => import('./translations/en'),
  es: () => import('./translations/es'),
  fr: () => import('./translations/fr'),
  pl: () => import('./translations/pl'),
  tr: () => import('./translations/tr'),
  pt_br: () => import('./translations/pt_BR'),
  ar: () => import('./translations/ar'),
  it: () => import('./translations/it'),
  sv: () => import('./translations/sv'),
  ru: () => import('./translations/ru'),
  hu: () => import('./translations/hu'),
  nl: () => import('./translations/nl'),
  zh_cn: () => import('./translations/zh_cn'),
  zh_tw: () => import('./translations/zh_tw'),
  vi: () => import('./translations/vi'),
  ba: () => import('./translations/ba')
};

export const DEFAULT_LANGUAGE = 'zh_tw';

export const normalizeLanguageCode = (
  lang: string | null | undefined
): string => {
  const normalized = (lang ?? '').toLowerCase().replace(/-/g, '_');

  if (!normalized) return DEFAULT_LANGUAGE;

  if (
    normalized === 'pt' ||
    normalized === 'pt_br' ||
    normalized.startsWith('pt_br_')
  )
    return 'pt_br';

  if (
    normalized === 'zh_tw' ||
    normalized.startsWith('zh_tw_') ||
    normalized === 'zh_hant' ||
    normalized.startsWith('zh_hant_')
  )
    return 'zh_tw';

  if (
    normalized === 'zh' ||
    normalized === 'zh_cn' ||
    normalized.startsWith('zh_cn_') ||
    normalized === 'zh_hans' ||
    normalized.startsWith('zh_hans_')
  )
    return 'zh_cn';

  if (translationLoaders[normalized]) return normalized;

  const base = normalized.split('_')[0];
  return translationLoaders[base] ? base : DEFAULT_LANGUAGE;
};

// ─── Lazy date-fns locale loaders ────────────────────────────────────────────
const dateLocaleLoaders: Record<string, () => Promise<DateLocale>> = {
  en: () => import('date-fns/locale').then((m) => m.enUS),
  fr: () => import('date-fns/locale').then((m) => m.fr),
  es: () => import('date-fns/locale').then((m) => m.es),
  de: () => import('date-fns/locale').then((m) => m.de),
  tr: () => import('date-fns/locale').then((m) => m.tr),
  pt_br: () => import('date-fns/locale').then((m) => m.ptBR),
  pl: () => import('date-fns/locale').then((m) => m.pl),
  ar: () => import('date-fns/locale').then((m) => m.ar),
  it: () => import('date-fns/locale').then((m) => m.it),
  sv: () => import('date-fns/locale').then((m) => m.sv),
  ru: () => import('date-fns/locale').then((m) => m.ru),
  hu: () => import('date-fns/locale').then((m) => m.hu),
  nl: () => import('date-fns/locale').then((m) => m.nl),
  zh_cn: () => import('date-fns/locale').then((m) => m.zhCN),
  zh_tw: () => import('date-fns/locale').then((m) => m.zhTW),
  vi: () => import('date-fns/locale').then((m) => m.vi),
  ba: () => import('date-fns/locale').then((m) => m.bs)
};

// ─── Lazy FullCalendar locale loaders ────────────────────────────────────────
const calendarLocaleLoaders: Record<string, () => Promise<LocaleSingularArg>> =
  {
    en: () => import('@fullcalendar/core/locales/en-gb').then((m) => m.default),
    fr: () => import('@fullcalendar/core/locales/fr').then((m) => m.default),
    es: () => import('@fullcalendar/core/locales/es').then((m) => m.default),
    de: () => import('@fullcalendar/core/locales/de').then((m) => m.default),
    tr: () => import('@fullcalendar/core/locales/tr').then((m) => m.default),
    pt_br: () =>
      import('@fullcalendar/core/locales/pt-br').then((m) => m.default),
    pl: () => import('@fullcalendar/core/locales/pl').then((m) => m.default),
    ar: () => import('@fullcalendar/core/locales/ar').then((m) => m.default),
    it: () => import('@fullcalendar/core/locales/it').then((m) => m.default),
    sv: () => import('@fullcalendar/core/locales/sv').then((m) => m.default),
    ru: () => import('@fullcalendar/core/locales/ru').then((m) => m.default),
    hu: () => import('@fullcalendar/core/locales/hu').then((m) => m.default),
    nl: () => import('@fullcalendar/core/locales/nl').then((m) => m.default),
    zh_cn: () =>
      import('@fullcalendar/core/locales/zh-cn').then((m) => m.default),
    zh_tw: () =>
      import('@fullcalendar/core/locales/zh-tw').then((m) => m.default),
    vi: () => import('@fullcalendar/core/locales/vi').then((m) => m.default),
    ba: () => import('@fullcalendar/core/locales/bs').then((m) => m.default)
  };

// ─── i18n init (no resources bundled upfront) ────────────────────────────────
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {},
    partialBundledLanguages: true,
    supportedLngs: Object.keys(translationLoaders),
    keySeparator: false,
    fallbackLng: [DEFAULT_LANGUAGE, 'en'],
    react: {
      useSuspense: true
    },
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
      convertDetectedLanguage: (lng) => normalizeLanguageCode(lng)
    }
  });

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Load a language's translation bundle into i18n on demand.
 * Call this before rendering the app and whenever the user switches language.
 *
 * @example
 * await loadLanguage('fr');
 * i18n.changeLanguage('fr');
 */
export const loadLanguage = async (lang: string): Promise<void> => {
  const normalizedLang = normalizeLanguageCode(lang);

  // Always ensure English fallback is loaded first
  if (!i18n.hasResourceBundle('en', 'translation')) {
    const enModule = await translationLoaders['en']();
    i18n.addResourceBundle('en', 'translation', enModule.default, true, true);
  }

  if (normalizedLang === 'en') {
    if (i18n.language !== 'en') {
      await i18n.changeLanguage('en');
    }
    return;
  }

  const loader = translationLoaders[normalizedLang];
  if (!loader) return;

  if (!i18n.hasResourceBundle(normalizedLang, 'translation')) {
    const module = await loader();
    i18n.addResourceBundle(
      normalizedLang,
      'translation',
      module.default,
      true,
      true
    );
  }

  if (i18n.language !== normalizedLang) {
    await i18n.changeLanguage(normalizedLang);
  }
};

export const switchAppLanguage = async (lang: string): Promise<string> => {
  const normalizedLang = normalizeLanguageCode(lang);
  await loadLanguage(normalizedLang);
  return normalizedLang;
};

/**
 * Returns the date-fns Locale for the given language code.
 * Falls back to enUS if the language is not found.
 */
export const getDateLocale = async (lang: string): Promise<DateLocale> => {
  const normalizedLang = normalizeLanguageCode(lang);
  const loader = dateLocaleLoaders[normalizedLang] ?? dateLocaleLoaders['en'];
  return loader();
};

/**
 * Returns the FullCalendar locale for the given language code.
 * Falls back to en locale if the language is not found.
 */
export const getCalendarLocale = async (
  lang: string
): Promise<LocaleSingularArg> => {
  const normalizedLang = normalizeLanguageCode(lang);
  const loader =
    calendarLocaleLoaders[normalizedLang] ?? calendarLocaleLoaders['en'];
  return loader();
};

// ─── Types & static metadata ─────────────────────────────────────────────────

export type SupportedLanguage =
  | 'DE'
  | 'EN'
  | 'FR'
  | 'TR'
  | 'ES'
  | 'PT_BR'
  | 'PL'
  | 'IT'
  | 'SV'
  | 'RU'
  | 'AR'
  | 'HU'
  | 'NL'
  | 'ZH_CN'
  | 'ZH_TW'
  | 'VI'
  | 'BA';

export const supportedLanguages: {
  code: Lowercase<SupportedLanguage>;
  label: string;
  Icon: FlagComponent;
}[] = [
  { code: 'en', label: 'English', Icon: US },
  { code: 'fr', label: 'French', Icon: FR },
  { code: 'es', label: 'Spanish', Icon: ES },
  { code: 'de', label: 'German', Icon: DE },
  { code: 'tr', label: 'Turkish', Icon: TR },
  { code: 'pt_br', label: 'Portuguese (Brazil)', Icon: BR },
  { code: 'pl', label: 'Polish', Icon: PL },
  { code: 'ar', label: 'Arabic', Icon: SA },
  { code: 'it', label: 'Italian', Icon: IT },
  { code: 'sv', label: 'Swedish', Icon: SE },
  { code: 'ru', label: 'Russian', Icon: RU },
  { code: 'hu', label: 'Hungarian', Icon: HU },
  { code: 'nl', label: 'Dutch', Icon: NL },
  { code: 'zh_cn', label: '简体中文', Icon: CN },
  { code: 'zh_tw', label: '繁體中文', Icon: CN },
  { code: 'vi', label: 'Tiếng Việt', Icon: VN },
  { code: 'ba', label: 'Bosnian', Icon: BA }
];

export const getSupportedLanguage = (lang: string) =>
  supportedLanguages.find(({ code }) => code === normalizeLanguageCode(lang)) ??
  supportedLanguages.find(({ code }) => code === DEFAULT_LANGUAGE)!;

export default i18n;
