import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';
import deJSON from './translations/de';
import arJSON from './translations/ar';
import locale from './translations/en';
import esJSON from './translations/es';
import frJSON from './translations/fr';
import trJSON from './translations/tr';
import plJSON from './translations/pl';
import itJSON from './translations/it';
import ptBRJSON from './translations/pt_BR';
import svJSON from './translations/sv';
import ruJSON from './translations/ru';
import huJSON from './translations/hu';
import nlJSON from './translations/nl';
import zhCnJSON from './translations/zh_cn';
import zhTwJSON from './translations/zh_tw';
import viJSON from './translations/vi';
import baJSON from './translations/ba';

export const mobileLanguageOptions = [
  { code: 'de', backendCode: 'DE', label: 'Deutsch' },
  { code: 'en', backendCode: 'EN', label: 'English' },
  { code: 'es', backendCode: 'ES', label: 'Español' },
  { code: 'fr', backendCode: 'FR', label: 'Français' },
  { code: 'tr', backendCode: 'TR', label: 'Türkçe' },
  { code: 'pl', backendCode: 'PL', label: 'Polski' },
  { code: 'pt_br', backendCode: 'PT_BR', label: 'Português (Brasil)' },
  { code: 'ar', backendCode: 'AR', label: 'العربية' },
  { code: 'it', backendCode: 'IT', label: 'Italiano' },
  { code: 'sv', backendCode: 'SV', label: 'Svenska' },
  { code: 'ru', backendCode: 'RU', label: 'Русский' },
  { code: 'hu', backendCode: 'HU', label: 'Magyar' },
  { code: 'nl', backendCode: 'NL', label: 'Nederlands' },
  { code: 'zh_cn', backendCode: 'ZH_CN', label: '简体中文' },
  { code: 'zh_tw', backendCode: 'ZH_TW', label: '繁體中文' },
  { code: 'vi', backendCode: 'VI', label: 'Tiếng Việt' },
  { code: 'ba', backendCode: 'BA', label: 'Bosanski' }
] as const;

export type MobileLanguageCode = (typeof mobileLanguageOptions)[number]['code'];

const fallbackLanguageCode: MobileLanguageCode = 'en';
const fallbackLanguageOption =
  mobileLanguageOptions.find(
    (option) => option.code === fallbackLanguageCode
  ) ?? mobileLanguageOptions[0];

const normalizedLanguageCodeMap = mobileLanguageOptions.reduce<
  Record<string, MobileLanguageCode>
>((accumulator, option) => {
  const normalizedCode = option.code.toLowerCase().replace(/-/g, '_');
  const normalizedBackendCode = option.backendCode
    .toLowerCase()
    .replace(/-/g, '_');

  accumulator[normalizedCode] = option.code;
  accumulator[normalizedBackendCode] = option.code;

  return accumulator;
}, {});

export const normalizeLanguageCode = (
  language?: string | null
): MobileLanguageCode => {
  if (!language) {
    return fallbackLanguageCode;
  }

  const normalizedLanguage = language.trim().toLowerCase().replace(/-/g, '_');

  return normalizedLanguageCodeMap[normalizedLanguage] ?? fallbackLanguageCode;
};

export const getMobileLanguageOption = (language?: string | null) => {
  const normalizedLanguageCode = normalizeLanguageCode(language);

  return (
    mobileLanguageOptions.find(
      (option) => option.code === normalizedLanguageCode
    ) ?? fallbackLanguageOption
  );
};

const resources: Record<MobileLanguageCode, { translation: unknown }> = {
  de: { translation: deJSON },
  en: { translation: locale },
  es: { translation: esJSON },
  fr: { translation: frJSON },
  tr: { translation: trJSON },
  pl: { translation: plJSON },
  pt_br: { translation: ptBRJSON },
  ar: { translation: arJSON },
  it: { translation: itJSON },
  sv: { translation: svJSON },
  ru: { translation: ruJSON },
  hu: { translation: huJSON },
  nl: { translation: nlJSON },
  zh_cn: { translation: zhCnJSON },
  zh_tw: { translation: zhTwJSON },
  vi: { translation: viJSON },
  ba: { translation: baJSON }
};

i18n
  // .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    keySeparator: false,
    lng: 'en',
    fallbackLng: 'en',
    react: {
      useSuspense: true
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
