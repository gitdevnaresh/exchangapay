// hooks/useTokenRefresh.ts
import { useEffect, useRef, useCallback } from "react";
import { getDecodedTokenExpiry, checkAndRefreshToken } from "./decodeToken";

export const useTokenRefresh = () => {
  // Use useRef to persist the timeout ID across re-renders
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleTokenRefresh = useCallback(async () => {
    try {
      // Clear any existing timer before scheduling a new one
      if (timeoutRef?.current) {
        clearTimeout(timeoutRef?.current);
      }

      const tokenExpiryTime = await getDecodedTokenExpiry();
      if (!tokenExpiryTime) return;

      const currentTime = Math.floor(Date.now() / 1000);
      // Schedule refresh 60 seconds before expiry
      const timeUntilRefresh = (tokenExpiryTime - currentTime - 60) * 1000;

      if (timeUntilRefresh <= 0) {
        // If the token is already expired or close to expiring, refresh immediately
        await checkAndRefreshToken();
        // Recursively call to schedule the next check
        scheduleTokenRefresh();
      } else {
        // Set a new timeout
        timeoutRef.current = setTimeout(async () => {
          await checkAndRefreshToken();
          // Recursively call to schedule the next check
          scheduleTokenRefresh();
        }, timeUntilRefresh);
      }
    } catch (error) {
      // You might want to log this error for debugging
    }
  }, []);

  useEffect(() => {
    // Start the token refresh scheduling when the hook is first used
    scheduleTokenRefresh();

    // Cleanup function to clear the timeout when the component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scheduleTokenRefresh]);

  // Returning the function can be useful for manual refreshes if needed elsewhere
  return { scheduleTokenRefresh };
};