import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { log } from './logger';

// P-03: this used to run react-native-push-notification and
// @react-native-community/push-notification-ios alongside @notifee/react-native
// and @react-native-firebase/messaging — four packages, two of them native, for
// one job. Notifee already backed the download notifications in
// src/navigation/AppContainer.tsx and src/screens/Crypto/cryptoCardTransactions/DownloadBill.tsx,
// so display now goes through it on both platforms and transport stays with
// firebase/messaging. The public shape of this module is unchanged; callers in
// App.tsx, SplashScreen and the logout paths keep working as they did.
const DEFAULT_CHANNEL_ID = 'default';

class FCMNotification {
  // Notifee channel ids we have already created this session. createChannel is
  // idempotent, but skipping the native round-trip on every message keeps the
  // foreground handler cheap.
  createdChannels = new Set();

  // Drops every listener a previous initiate() added. Kept on globalThis, not
  // the instance: Fast Refresh re-evaluates this module and builds a new
  // instance, but the old native listeners stay attached — each one then
  // displayed its own copy of every push.
  teardown = () => {
    const unsubscribers = globalThis.__fcmListenerUnsubscribers || [];
    unsubscribers.forEach(unsubscribe => {
      try {
        unsubscribe?.();
      } catch (err) {}
    });
    globalThis.__fcmListenerUnsubscribers = [];
  };

  initiate = (onNotificationAction, onTokenRefresh) => {
    this.teardown();
    this.onTokenRefresh = onTokenRefresh;
    // Asks on iOS, and on Android 13+ maps to POST_NOTIFICATIONS. Without this
    // displayNotification is silently dropped, which is what
    // PushNotification.configure({ requestPermissions: true }) used to cover.
    notifee.requestPermission().catch(err => {
      log.error('[FCMService] permission request failed', err);
    });

    // A tap on a notification we displayed ourselves while the app was in the
    // foreground. Backgrounded/quit taps arrive through
    // messaging().onNotificationOpenedApp / getInitialNotification below.
    const foregroundEventUnsubscribe = notifee.onForegroundEvent(
      ({ type, detail }) => {
        if (type === EventType.PRESS && detail.notification?.data) {
          onNotificationAction(detail.notification.data);
        }
      },
    );

    globalThis.__fcmListenerUnsubscribers = [
      foregroundEventUnsubscribe,
      ...this.registerServices(onNotificationAction),
    ];
    return this.teardown;
  };

  registerServices = onNotificationAction => {
    const onMessageUnsubscribe = messaging().onMessage(async remoteMessage => {
      // Push-duplication tracing: a repeated messageId means FCM redelivered one
      // send; different ids mean the server sent several pushes.
      log.info('[FCM] foreground message', {
        messageId: remoteMessage?.messageId,
        sentTime: remoteMessage?.sentTime,
        title: remoteMessage?.notification?.title,
        collapseKey: remoteMessage?.collapseKey,
      });
      if (Platform.OS === 'android') {
        await this.showAndroidLocalNotification(remoteMessage);
      } else {
        await this.showLocalNotification(remoteMessage);
      }
    });

    // Triggered when have new token
    // Firebase rotates the token on its own (restore, reinstall, expiry). The
    // server keys delivery on it, so a rotation it never hears about means the
    // device silently stops receiving pushes.
    const onTokenRefreshUnsubscribe = messaging().onTokenRefresh(fcmToken => {
      this.onTokenRefresh?.(fcmToken);
    });

    const onOpenedUnsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      onNotificationAction(remoteMessage?.data);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage && remoteMessage?.data) {
          onNotificationAction(remoteMessage?.data);
        }
      });

    return [onMessageUnsubscribe, onTokenRefreshUnsubscribe, onOpenedUnsubscribe];
  };

  unRegister = async () => {
    // PushNotification.unregister() dropped the device registration so the
    // signed-out user stopped receiving pushes. Deleting the FCM token is the
    // equivalent, and it is what the server keys delivery on.
    // Returned so logout can wait for it: a getToken() that runs before the
    // delete lands reads the old token, which the next login then registers dead.
    notifee.cancelAllNotifications().catch(() => {});
    try {
      await messaging().deleteToken();
    } catch (err) {
      log.error('[FCMService] unRegister failed', err);
    }
  };

  deleteToken = () => {
    messaging()
      .deleteToken()
      .catch(err => {
        // console.log('[FCMService] deleteToken error ', err);
      });
  };

  createtoken = onSuccess => {
    messaging()
      .getToken()
      .then(fcmToken => {
        if (fcmToken) {
          onSuccess(fcmToken);
        } else {
          // console.log('[FCMService] user does not have a device token');
        }
      })
      .catch(err => {
        // console.log('[FCMService] getToken rejected ', err);
      });
  };

  ensureChannel = async collapseKey => {
    const channelId = collapseKey || DEFAULT_CHANNEL_ID;
    if (this.createdChannels.has(channelId)) {
      return channelId;
    }
    await notifee.createChannel({
      id: channelId,
      name: channelId,
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
    this.createdChannels.add(channelId);
    return channelId;
  };

  showAndroidLocalNotification = remoteMessage => {
    // Kept as a separate entry point for the callers that already branch on
    // Platform.OS; the channel work now lives in showLocalNotification.
    return this.showLocalNotification(remoteMessage);
  };

  showLocalNotification = async remoteMessage => {
    const { notification, data, collapseKey } = remoteMessage || {};
    try {
      const channelId = await this.ensureChannel(collapseKey);
      // Notifee requires every data value to be a string.
      const payload = Object.entries(data || {}).reduce((acc, [key, value]) => {
        acc[key] = typeof value === 'string' ? value : JSON.stringify(value);
        return acc;
      }, {});

      await notifee.displayNotification({
        // Same FCM message → same notification id, so a second display of one
        // push replaces the first instead of stacking a duplicate.
        id: remoteMessage?.messageId,
        title: notification?.title,
        body: notification?.body,
        data: payload,
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          largeIcon: 'ic_launcher',
          showTimestamp: true,
          autoCancel: true,
          sound: 'default',
          importance: AndroidImportance.HIGH,
          // Without a pressAction the tap does nothing and the notification is
          // not dismissed — this is what routes it to onForegroundEvent.
          pressAction: { id: 'default' },
        },
        ios: {
          sound: 'default',
        },
      });
    } catch (err) {
      log.error('[FCMService] displayNotification failed', err);
    }
  };
}

export const fcmNotification = new FCMNotification();
