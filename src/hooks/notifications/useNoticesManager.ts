import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setShouldShowNotices, setNoticesShownThisSession } from '../../redux/actions/actions';
import { getTabsConfigation } from '../../../configuration';

// DEV: Module-level session tracking to persist across hook re-instantiations
let sessionInitialized = false;
let appInitialized = false;

/**
 * DEV: Notices System - Centralized state management for app-wide notifications
 * 
 * PURPOSE:
 * - Display critical announcements, updates, or alerts to users
 * - Ensure users acknowledge important information before using the app
 * - Control when and how often notices are shown
 * 
 * BEHAVIOR:
 * - Shows notices once per app session (not every home visit)
 * - Resets on logout/login to show fresh notices
 * - Resets on app restart to ensure notices are seen
 * - Blocks navigation until notices are acknowledged
 * - Doesn't show when navigating to profile section
 * - Can be disabled via configuration
 * 
 * USAGE:
 * - Call markNoticesProcessed() when user clicks OK
 * - Use noticesProcessed to control navigation blocking
 * - Use shouldShowNotices to control notice display
 */
export const useNoticesManager = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: any) => state.userReducer?.login);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const shouldShowNotices = useSelector((state: any) => state.userReducer?.shouldShowNotices);
  const noticesShownThisSession = useSelector((state: any) => state.userReducer?.noticesShownThisSession);
  
  // Get notices configuration
  const commonConfig = getTabsConfigation('COMMON_CONFIGURATION') || {};
  const showNotices = commonConfig.SHOW_NOTICES !== false; // Default to true if not specified

  // DEV: Mark notices as processed - prevents re-showing until next app session
  const markNoticesProcessed = useCallback(() => {
    dispatch(setNoticesShownThisSession(true));
    dispatch(setShouldShowNotices(false));
  }, [dispatch]);

  // DEV: Reset all notices state - called on logout to ensure fresh notices on next login
  const resetNoticesState = useCallback(() => {
    appInitialized = false;
    sessionInitialized = false;
    dispatch(setNoticesShownThisSession(false));
    dispatch(setShouldShowNotices(false));
  }, [dispatch]);

  // Initialize on login
  useEffect(() => {
    if (isLoggedIn && userInfo?.id) {
      // Skip if notices are disabled in configuration
      if (!showNotices) {
        dispatch(setNoticesShownThisSession(true));
        dispatch(setShouldShowNotices(false));
        return;
      }
      
      // Skip if already initialized this session
      if (appInitialized) {
        return;
      }
      
      appInitialized = true;
      
      // Check if session already initialized
      if (sessionInitialized) {
        // Session exists - disable notices
        dispatch(setShouldShowNotices(false));
      } else {
        // Fresh session - always reset Redux state and enable notices
        sessionInitialized = true;
        dispatch(setNoticesShownThisSession(false)); // Force reset on fresh launch
        dispatch(setShouldShowNotices(true));
      }
    } else {
      // User logged out - reset all state
      appInitialized = false;
      sessionInitialized = false;
      dispatch(setNoticesShownThisSession(false));
      dispatch(setShouldShowNotices(false));
    }
  }, [isLoggedIn, userInfo?.id, dispatch, showNotices]);

  return {
    shouldShowNotices: showNotices ? shouldShowNotices : false,
    noticesProcessed: showNotices ? noticesShownThisSession : true,
    markNoticesProcessed,
    resetNoticesState,
    isNoticesInitialized: showNotices ? noticesShownThisSession : true,
    showNotices
  };
};