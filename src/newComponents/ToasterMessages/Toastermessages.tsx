import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';
import { s } from '../theme/scale';
import { useThemeColors } from '../../hooks/useThemeColors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';


const ToastComponent: React.FC<{ text1?: string; type: 'success' | 'error' | 'info' | 'warning'; id?: string }> = ({ text1, type, id }) => {
  const colors = useThemeColors();
  const commonStyles = getThemedCommonStyles(colors);

  // *** ASSUMPTION ***
  // We assume useThemeColors provides an `isDarkTheme` flag or you can infer it.
  // If not, you might need a more complex way to determine the theme mode here.
  const isDarkTheme = colors.isDarkTheme; // Replace with your actual theme mode check

let  toastBackgroundColor =colors.SCREENBG_WHITE;
 

  let textColor;
  switch (type) {
    case 'error':
      textColor = colors.TEXT_RED;
      break;
    case 'success':
      textColor =colors.TEXT_GREEN; // Using TEXT_GREEN from your commonStyles
      break;
    case 'warning':
      textColor = colors.TEXT_YELLOW; // Using TEXT_YELLOW from your commonStyles
      break;
    case 'info':
       textColor = colors.TEXT_WHITE;
      break;
    default:
      textColor = isDarkTheme ? colors.TEXT_BLACK : colors.TEXT_WHITE; // Default text color
  }

  let iconName: keyof typeof MaterialIcons.glyphMap = 'info-outline'; // Default icon
  let iconColor = textColor; // Default icon color to match text color

  switch (type) {
    case 'success':
      iconName = 'check-circle-outline';
      iconColor = colors.TEXT_GREEN; // Specific success color for icon
      break;
    case 'error':
      iconName = 'error-outline';
      iconColor = colors.TEXT_RED; // Specific error color for icon
      break;
    case 'warning':
      iconName = 'warning-amber';
      iconColor = colors.TEXT_YELLOW; // Specific warning color for icon
      break;
    case 'info':
      iconColor = isDarkTheme ? colors.TEXT_BLACK : colors.TEXT_WHITE; // Contrasting info icon
      break;
  }
  return (
    <View style={[styles.toast, { backgroundColor: toastBackgroundColor }, commonStyles.dflex,  commonStyles.gap8,commonStyles.justifyContent, commonStyles.bordered, { borderColor: iconColor }]}>
      <MaterialIcons name={iconName} size={s(20)} color={iconColor} />
      <Text style={[styles.text, { color: textColor }, commonStyles.fs14,commonStyles.flex1, commonStyles.fw500]}>{text1}</Text>
    </View>


  );
};

export const toastConfig: ToastConfig = {
  success: ({ text1 }) => (
    <ToastComponent text1={text1} type="success" />
  ),
  error: ({ text1 }) => (
    <ToastComponent text1={text1} type="error" />
  ),
  info: ({ text1 }) => (
    <ToastComponent text1={text1} type="info" />
  ),
  warning: ({ text1 }) => (
    <ToastComponent text1={text1} type="warning" />
  ),
};


const styles = StyleSheet.create({
  toast: {
    paddingHorizontal: s(16),
    paddingVertical: s(12),
    borderRadius: s(8), // Adjusted for a more standard toast shape
    alignSelf: 'center', // Center horizontally
    maxWidth: '95%',
    alignItems: 'center',
    // elevation: 4, // commonStyles.shadowMd will handle this if defined
    marginTop:s(800) // Consider positioning via Toast.show options or a wrapper
  },
  text: {
  },
});
