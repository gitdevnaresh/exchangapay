import { useTranslation } from 'react-i18next';
import { SecureStorage } from '../../utils/secureStorage';

export const useLngTranslation = () => {
  const { t, i18n } = useTranslation();

  // Function to change language and store in SecureStorage
  const changeLanguage = async (lang: string) => {
    
    await i18n.changeLanguage(lang);
    await SecureStorage.setSecureItem('user-language', lang);
  };

  return { t, currentLanguage: i18n.language, changeLanguage };
};
