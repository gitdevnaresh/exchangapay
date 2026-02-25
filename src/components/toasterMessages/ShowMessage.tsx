import Toast from 'react-native-toast-message';
import { v4 as uuidv4 } from 'uuid';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export const showAppToast = (
  message: string,
  type: ToastType = 'info',
  timer?:any
  // The duration parameter is removed as it's now determined by the type
) => {
  const id = uuidv4(); // Generate a unique ID for the toast

  // Determine the duration based on the toast type
  // If type is 'error', duration is 5000ms (5s), otherwise it's 2000ms (2s)
  const visibilityTime = timer ?? (type === 'error' ? 5000 : 2000);

  Toast.show({
    autoHide: true,
    type,
    text1: message,
    visibilityTime: visibilityTime, // Use the calculated duration
    position: 'bottom',
    id: id,
  });
};