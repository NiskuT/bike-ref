import en from './en.json'
import fr from './fr.json'

export const translations = {
  en,
  fr,
}

export type Language = keyof typeof translations
export type TranslationKeys = typeof fr

export const supportedLanguages: Language[] = ['fr', 'en']
export const defaultLanguage: Language = 'fr' 
