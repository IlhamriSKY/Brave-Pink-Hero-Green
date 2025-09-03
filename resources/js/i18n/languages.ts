/**
 * Language configuration for internationalization
 * Maps language codes to country flags and display names
 */

export interface Language {
  code: string
  name: string
  nativeName: string
  countryCode: string
  rtl: boolean
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'id',
    name: 'Bahasa Indonesia',
    nativeName: 'Bahasa Indonesia',
    countryCode: 'id', // Indonesia flag
    rtl: false
  },
  {
    code: 'ms',
    name: 'Bahasa Malaysia',
    nativeName: 'Bahasa Melayu',
    countryCode: 'my', // Malaysia flag
    rtl: false
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    countryCode: 'us', // US flag for English
    rtl: false
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    countryCode: 'jp', // Japan flag
    rtl: false
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    countryCode: 'cn', // China flag
    rtl: false
  }
]

/**
 * Get language configuration by code
 */
export const getLanguageByCode = (code: string): Language | null => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || null
}

/**
 * Get default language
 */
export const getDefaultLanguage = (): Language => {
  return SUPPORTED_LANGUAGES[0] // Indonesian as default
}

/**
 * Check if language code is supported
 */
export const isLanguageSupported = (code: string): boolean => {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code)
}
