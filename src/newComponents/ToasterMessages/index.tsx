import { ToastAndroid, Platform, Alert } from 'react-native';

export enum ToastType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

// Durations from ToastAndroid for convenience
const SHORT = ToastAndroid.SHORT;
const LONG = ToastAndroid.LONG;

interface CustomToastOptions {
  message: string;
  type?: ToastType; // Conceptually for color/type, but won't change Android Toast color
  duration?: typeof SHORT | typeof LONG;
  // Future Android-specific options can be added here if needed:
  // gravity?: ToastAndroidStatic['TOP' | 'BOTTOM' | 'CENTER'];
  // xOffset?: number;
  // yOffset?: number;
}

/**
 * Shows an Android Toast message.
 * Note: The 'type' parameter is for logical categorization (e.g., logging or message prefixing)
 * and does NOT change the visual color of the native Android Toast,
 * as the ToastAndroid API does not support color customization.
 * For fully colored/customized toasts, consider using a custom component or a third-party library.
 */
export const showCustomToast = (options: CustomToastOptions): void => {
  const { message, type = ToastType.INFO, duration = ToastAndroid.SHORT } = options;
  
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, duration);
  } else {
    // For iOS, just log to console (no visual feedback)
    console.log(`[${type}] ${message}`);
  }
};

