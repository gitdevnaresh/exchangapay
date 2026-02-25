import perf from '@react-native-firebase/perf';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';

export const useScreenPerfLogger = (screenName: string) => {
  const traceRef = useRef<any>(null);

  const startTrace = async () => {
    if (traceRef.current) return;
    traceRef.current = await perf().startTrace(`screen_load_${screenName}`);
  };

  const stopTrace = async () => {
    if (!traceRef.current) return;
    await traceRef.current.stop();
    traceRef.current = null;
  };

  useFocusEffect(
    useCallback(() => {
      startTrace();
      return () => stopTrace(); // safety stop
    }, [screenName])
  );

  return { stopTrace };
};
