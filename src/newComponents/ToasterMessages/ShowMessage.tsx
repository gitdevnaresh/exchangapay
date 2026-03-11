import Toast from 'react-native-toast-message';
import { v4 as uuidv4 } from 'uuid';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export const showAppToast = (
  message: string,
  type: ToastType = 'info',
  duration: number = 5000 
) => {
  const id = uuidv4(); // Generate a unique ID for the toast
  Toast.show({
    autoHide: true,
    type,
    text1: message,
    visibilityTime: duration,
    position: 'bottom',
    bottomOffset:100,
    id: id, // Pass the ID to the toast
  });
};
