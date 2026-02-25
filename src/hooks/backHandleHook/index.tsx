// src/hooks/useHardwareBackHandler.ts
import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

/**
 * Hook to handle hardware back button.
 * @param callback - A function to run when back button is pressed.
 */
export const useHardwareBackHandler = (callback: () => boolean | void) => {
  const callbackRef = useRef(callback);
  
  // Update ref when callback changes
  callbackRef.current = callback;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      const result = callbackRef.current?.();
      return result !== false; // Return true unless explicitly false
    });

    return () => backHandler.remove(); // Cleanup on unmount
  }, []); // Empty dependency array
};
