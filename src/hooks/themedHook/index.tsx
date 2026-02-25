import { useSelector } from 'react-redux';
import { useColorScheme } from 'react-native';

export const useIsDarkTheme = () => {
  const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme);
  const colorScheme = useColorScheme();

  if (appThemeSetting !== 'system' && appThemeSetting !== undefined && appThemeSetting !== null) {
    return appThemeSetting === 'dark';
  } else {
    return colorScheme === 'dark';
  }
};