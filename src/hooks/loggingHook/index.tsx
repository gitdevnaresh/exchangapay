import * as Sentry from '@sentry/react-native';
import { Logger } from '../../utils/Logger';

interface LogMetadata {
  action?: string;
  nextScreen?: string;
  currentScreen?: string;
  [key: string]: any;
}

/**
 * Logs a custom user event into Sentry.
 * - Attaches action / screen context as tags.
 * - Adds breadcrumb for navigation history.
 * - Captures as a custom event.
 */
export const logEvent = (eventName: string, metaData: LogMetadata = {}) => {
  try {
    // Add contextual tags
    if (metaData.action) Sentry.setTag('action', metaData.action);
    if (metaData.nextScreen) Sentry.setTag('nextScreen', metaData.nextScreen);
    if (metaData.currentScreen) Sentry.setTag('currentScreen', metaData.currentScreen);

    const { sanitizeData } = require('../../utils/Logger');
    // Breadcrumb for timeline
    Sentry.addBreadcrumb({
      category: 'user.action',
      message: eventName,
      level: 'info',
      data: sanitizeData(metaData),
    });

    // Capture custom message
    Sentry.captureMessage(`User Event: ${eventName}`, 'info');
  } catch (err) {
    Logger.warn('Failed to log event to Sentry:', err);
  } finally {
    // Clean up tags so they don’t leak to next events
    Sentry.setTag('action', null as any);
    Sentry.setTag('nextScreen', null as any);
    Sentry.setTag('currentScreen', null as any);
  }
};
