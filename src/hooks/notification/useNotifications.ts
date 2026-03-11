import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';

// Define navigation or callback type
type NotificationHandler = (data: any) => void;

export function useNotifications(onNotificationPress?: NotificationHandler) {
  useEffect(() => {
    // Create channel (Android only)
    const setupChannel = async () => {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });
    };
    setupChannel();

    // Foreground listener
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: { channelId: 'default', pressAction: { id: 'default' } },
      });
    });

    // Handle background/quit press events
    const unsubscribeNotifee = notifee.onForegroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        onNotificationPress?.(detail.notification?.data);
      }
    });

    // Cleanup
    return () => {
      unsubscribeOnMessage();
      unsubscribeNotifee();
    };
  }, [onNotificationPress]);

  // Background handler (must be outside React life-cycle)
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    await notifee.displayNotification({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      android: { channelId: 'default' },
    });
  });

  // Background/quit tap handler
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      onNotificationPress?.(detail.notification?.data);
    }
  });
}
