import en from './en.json'
import fr from './fr.json'

export const translations = {
  en,
  fr,
}

export type Language = keyof typeof translations
export type TranslationKeys = typeof en

export const supportedLanguages: Language[] = ['en', 'fr']
export const defaultLanguage: Language = 'fr' 
