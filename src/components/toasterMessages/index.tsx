import { ToastAndroid, Platform } from 'react-native';
import { Logger } from '../../utils/Logger';

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
  if (Platform.OS === 'android') {
    const { message, type = ToastType.INFO, duration = ToastAndroid.SHORT } = options;

    // Example: You could prefix messages based on type if desired
    // let displayMessage = message;
    // if (type === ToastType.SUCCESS) displayMessage = `✅ ${message}`;
    // else if (type === ToastType.ERROR) displayMessage = `❌ ${message}`;
    // ToastAndroid.show(displayMessage, duration);

    ToastAndroid.show(message, duration);
  } else {
    Logger.warn("showCustomToast is designed for Android. No native toast shown on this platform.");
    // For iOS, you might use Alert.alert(type || 'Info', message) or another notification system.
  }
};

