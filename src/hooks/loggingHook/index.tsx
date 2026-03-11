import analytics from '@react-native-firebase/analytics';

/**
 * Interface for structured action logging parameters.
 * This helps ensure consistency and type safety for your analytics events.
 */
export interface ActionLogParams {
  screename: string;
  actionName: string;
  actionType: string;
  nextScreenName?: string; // Optional: The name of the next screen after this action
  actionObj?: { // Optional: Object containing additional details about the action
    apiUrl?: string; // Optional: API URL related to the action
    postObj?: { // Optional: Data sent in a POST request, be cautious with sensitive data here
      [key: string]: any; // Allows for other properties in postObj, but filter sensitive data
    };
    // Allow for an error object or other dynamic data
    [key: string]: any;
  };
}

/**
 * A custom hook to provide Firebase Analytics logging functions.
 * It centralizes analytics calls and provides simple, typed methods for logging.
 */
export const useActionLogging = () => {

  /**
   * Logs a custom event with optional parameters.
   * @param eventName - The name of the event (e.g., 'button_press', 'share').
   * @param params - An object of key-value pairs to send with the event.
   */
  const logEvent = async (eventName: string, params: { [key: string]: any } = {}) => {
    try {
        // console.log( params);
    //   await analytics().logEvent(eventName, params); // IMPORTANT: This line was commented out and has been re-enabled.
    } catch (error) {
      console.error(`Firebase Analytics: Error logging event "${eventName}".`, error);
    }
  };

  return { logEvent };
};
