import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { setApiLang } from '@/lib/api/client'
import en from './locales/en.json'
import ru from './locales/ru.json'
import uz from './locales/uz.json'

export const SUPPORTED_LANGS = ['uz', 'ru', 'en'] as const
export type Lang = (typeof SUPPORTED_LANGS)[number]

const LANG_KEY = 'ab.lang'
const stored = (localStorage.getItem(LANG_KEY) as Lang) ?? 'uz'

void i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: stored,
  fallbackLng: 'uz',
  interpolation: { escapeValue: false },
})

// Keep Accept-Language in sync with the UI language.
setApiLang(i18n.language)
i18n.on('languageChanged', (lng) => {
  setApiLang(lng)
  localStorage.setItem(LANG_KEY, lng)
})

export function changeLang(lang: Lang) {
  void i18n.changeLanguage(lang)
}

export default i18n
