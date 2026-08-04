// hooks/useTokenRefresh.ts
import { useEffect, useRef, useCallback } from "react";
import { getDecodedTokenExpiry, checkAndRefreshToken } from "../utils/helpers";

/**
 * H-11: how this hook reacts when a keychain read does not succeed.
 *
 * Stricter accessibility on the token entries means a read can now fail for
 * reasons that have nothing to do with the session — the handset is locked, a
 * prompt was dismissed. Two things had to change:
 *
 *   1. The old code did `if (!tokenExpiryTime) return;`, which ended refresh
 *      scheduling for the lifetime of the mount. One unreadable moment and the
 *      session was never refreshed again, so the user was signed out at expiry.
 *   2. When the expiry had already passed it called checkAndRefreshToken() and
 *      immediately re-scheduled with no delay. If the refresh could not proceed
 *      that was an unbounded recursion, spinning as fast as the keychain could
 *      reject it.
 *
 * Both are now a bounded retry.
 */
const RETRY_DELAY_MS = 60_000;

export const useTokenRefresh = () => {
  // Use useRef to persist the timeout ID across re-renders
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Guards the recursive re-schedule against running after unmount.
  const isMountedRef = useRef(true);

  const scheduleTokenRefresh = useCallback(async () => {
    try {
      // Clear any existing timer before scheduling a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (!isMountedRef.current) return;

      const scheduleIn = (delay: number) => {
        if (!isMountedRef.current) return;
        timeoutRef.current = setTimeout(() => {
          scheduleTokenRefresh();
        }, delay);
      };

      const tokenExpiryTime = await getDecodedTokenExpiry();
      if (!tokenExpiryTime) {
        // Either there is no session, or the entry was unreadable just now.
        // Retrying costs one keychain read a minute; not retrying costs the
        // session, so this errs towards retrying.
        scheduleIn(RETRY_DELAY_MS);
        return;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      // Schedule refresh 60 seconds before expiry
      const timeUntilRefresh = (tokenExpiryTime - currentTime - 60) * 1000;

      if (timeUntilRefresh <= 0) {
        // If the token is already expired or close to expiring, refresh now.
        const outcome = await checkAndRefreshToken();
        if (outcome === "ok") {
          scheduleTokenRefresh();
        } else {
          // no-session, unavailable or rejected. Backing off rather than
          // re-entering immediately is what stops the tight loop.
          scheduleIn(RETRY_DELAY_MS);
        }
      } else {
        // Set a new timeout
        timeoutRef.current = setTimeout(async () => {
          await checkAndRefreshToken();
          // Recursively call to schedule the next check
          scheduleTokenRefresh();
        }, timeUntilRefresh);
      }
    } catch (error) {
      // Never leave the app with no scheduled refresh at all.
      if (isMountedRef.current) {
        timeoutRef.current = setTimeout(() => {
          scheduleTokenRefresh();
        }, RETRY_DELAY_MS);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    // Start the token refresh scheduling when the hook is first used
    scheduleTokenRefresh();

    // Cleanup function to clear the timeout when the component unmounts
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scheduleTokenRefresh]);

  // Returning the function can be useful for manual refreshes if needed elsewhere
  return { scheduleTokenRefresh };
};
