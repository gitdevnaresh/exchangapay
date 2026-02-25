import { NEW_THEME_COLOR } from '../../constants/styels/variables';
import { Appearance } from 'react-native';
import { store } from "../../redux/reducers";

const useThemeColors = () => {
  const appThemePreference = store?.getState().userReducer?.appTheme;
  let effectiveThemeKey = 'light'; // Default to light

  if (appThemePreference === 'dark') {
    effectiveThemeKey = 'dark';
  } else if (appThemePreference === 'light') {
    effectiveThemeKey = 'light';
  } else if (appThemePreference === 'system') {
    const deviceColorScheme = Appearance.getColorScheme();
    effectiveThemeKey = deviceColorScheme === 'dark' ? 'dark' : 'light';
  }
  const themeKey = effectiveThemeKey in NEW_THEME_COLOR ? effectiveThemeKey : 'light';

  return NEW_THEME_COLOR[themeKey];
};
export { useThemeColors }