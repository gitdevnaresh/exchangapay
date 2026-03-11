import i18n from 'i18next';
import english from "./locales/english/english.json"
import telugu from "./locales/telugu/telugu.json"
import malay from "./locales/malay/malay.json"
import arabic from "./locales/arabic/arabic.json"
import german from "./locales/german/german.json"
import {initReactI18next} from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage';


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
      const storedLang = await AsyncStorage.getItem('user-language');
      callback(storedLang || 'en');
    } catch (error) {
      console.error('Error loading language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('user-language', lng);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
};
i18n.use(languageDetector).use(initReactI18next).init(initData());

export default i18n;