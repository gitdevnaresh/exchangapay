import i18n from 'i18next';
import english from "./locales/english/english.json"
import telugu from "./locales/telugu/telugu.json"
import malay from "./locales/malay/malay.json"
import arabic from "./locales/arabic/arabic.json"
import german from "./locales/german/german.json"
import {initReactI18next} from 'react-i18next'
import { SecureStorage } from '../utils/secureStorage';
import { Logger } from '../utils/Logger';


const locales = {
  en:{translation:english},
  te:{translation:telugu},
  ms:{translation:malay},
  ar:{translation:arabic},
  de:{translation:german},
}

const initData = () =>({
  compatibilityJSON:'v3',
  fallbackLng: 'en',
  debug:false,
  interplation:{
    escapeValue:false
  },
  resources:locales
})
// const deviceLanguage = Localization.locale.split('-')[0] || 'en';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const storedLang = await SecureStorage.getSecureItem('user-language');
      callback(storedLang || 'en');
    } catch (error) {
      Logger.error('Error loading language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await SecureStorage.setSecureItem('user-language', lng);
    } catch (error) {
      Logger.error('Error saving language:', error);
    }
  },
};
i18n.use(languageDetector).use(initReactI18next).init(initData());

export default i18n;