import { useEffect, useCallback, useRef } from "react";
import { checkAndRefreshToken, getDecodedTokenExpiry, getShouldStopRetry } from "./decodeToken";


export const useTokenRefresh = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const scheduleTokenRefresh = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const tokenExpiryTime = await getDecodedTokenExpiry();
    if (!tokenExpiryTime) return;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilRefresh = (tokenExpiryTime - currentTime - 120) * 1000;

    const attemptRefreshAndReschedule = async () => {
      if (getShouldStopRetry()) {
        return; // Stop if already flagged to stop
      }
      
      try {
        await checkAndRefreshToken();
      } catch (e: any) {
        // showAppToast(isErrorDispaly(e), 'error');
      }
      
      // Check again after attempt
      if (getShouldStopRetry()) {
        return; // Stop scheduling if max attempts reached
      }
      
      // Continue scheduling for next refresh
      scheduleTokenRefresh();
    };

    if (timeUntilRefresh <= 0) {
      await attemptRefreshAndReschedule();
    } else {
      timeoutRef.current = setTimeout(attemptRefreshAndReschedule, timeUntilRefresh);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { refreshToken: scheduleTokenRefresh };
};
