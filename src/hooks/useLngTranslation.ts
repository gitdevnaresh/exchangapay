import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLngTranslation = () => {
  const { t, i18n } = useTranslation();

  // Function to change language and store in AsyncStorage
  const changeLanguage = async (lang: string) => {
    
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem('user-language', lang);
  };

  return { t, currentLanguage: i18n.language, changeLanguage };
};
