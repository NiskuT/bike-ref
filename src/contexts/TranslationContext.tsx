import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language, defaultLanguage, supportedLanguages } from '../translations'

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  availableLanguages: Language[]
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}

interface TranslationProviderProps {
  children: ReactNode
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)

  useEffect(() => {
    // Load language from localStorage on app start
    const savedLanguage = localStorage.getItem('app-language') as Language
    if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.substring(0, 2) as Language
      if (supportedLanguages.includes(browserLang)) {
        setLanguageState(browserLang)
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('app-language', lang)
  }

  // Translation function with nested key support (e.g., "auth.login.title")
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to English if key not found in current language
        let fallbackValue: any = translations[defaultLanguage]
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk]
          } else {
            // Return key if not found in fallback either
            console.warn(`Translation key "${key}" not found in ${language} or ${defaultLanguage}`)
            return key
          }
        }
        return fallbackValue
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  const value: TranslationContextType = {
    language,
    setLanguage,
    t,
    availableLanguages: supportedLanguages,
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
} 
