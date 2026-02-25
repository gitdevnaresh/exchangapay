import { useEffect, useState, useCallback } from "react";
import { Platform, Alert, Linking } from "react-native";
import messaging from "@react-native-firebase/messaging";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import { SecureStorage } from '../../utils/secureStorage';
import { Logger } from '../../utils/Logger';

interface NotificationData {
  [key: string]: any;
}

interface UseNotificationsProps {
  isAuthenticated: boolean;
  onNotificationPress?: (data: NotificationData) => void;
}

interface NotificationHookReturn {
  fcmToken: string | null;
  permissionStatus: "granted" | "denied" | "blocked" | null;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  getFCMToken: () => Promise<string | null>;
  showSettingsDialog: () => void;
}

export function useNotifications({
  isAuthenticated,
  onNotificationPress,
}: UseNotificationsProps): NotificationHookReturn {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    "granted" | "denied" | "blocked" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check notification permission
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === "ios") {
        // For iOS, check both Firebase messaging and system notification permissions
        const authStatus = await messaging().hasPermission();
        const isFirebaseAuthorized =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        // Also check system notification settings
        const settings = await messaging().getNotificationSettings();
        const isSystemAuthorized =
          settings.authorizationStatus ===
          messaging.AuthorizationStatus.AUTHORIZED;

        return isFirebaseAuthorized && isSystemAuthorized;
      } else {
        // For Android, try to get token to check permission
        try {
          const token = await messaging().getToken();
          return !!token;
        } catch (error) {
          return false;
        }
      }
    } catch (error) {
      Logger.error("Error checking notification permission", error);
      return Platform.OS === "android";
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (Platform.OS === "ios") {
        const authStatus = await messaging().requestPermission();
        const granted =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (granted) {
          await getFCMToken();
        } else {
          Logger.warn("iOS permission denied");
        }

        return granted;
      } else {
        // For Android, try to get token
        try {
          const token = await messaging().getToken();
          if (token) {
            setFcmToken(token);
            await SecureStorage.setSecureItem("fcm_token", token);
          }
          return !!token;
        } catch (error) {
          Logger.error("Error getting FCM token", error);
          return false;
        }
      }
    } catch (error) {
      Logger.error("Error requesting notification permission", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get FCM token
  const getFCMToken = useCallback(async (): Promise<string | null> => {
    try {
      // Check stored token first
      const storedToken = await SecureStorage.getSecureItem("fcm_token");
      if (storedToken) {
        setFcmToken(storedToken);
        return storedToken;
      }

      // Get new token
      const token = await messaging().getToken();

      if (token) {
        setFcmToken(token);
        await SecureStorage.setSecureItem("fcm_token", token);
        return token;
      } else {
        Logger.warn("FCM Token generation failed - no token returned");
      }

      return null;
    } catch (error) {
      Logger.error("Error getting FCM token", error);
      return null;
    }
  }, []);

  // Show settings dialog
  const showSettingsDialog = useCallback((): void => {
    if (!isAuthenticated) return;

    Alert.alert(
      "Permission Required",
      "To receive notifications, please enable them in your device settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => {
            if (Platform.OS === "ios") {
              Linking.openURL("app-settings:");
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  }, [isAuthenticated]);

  // Update permission status
  const updatePermissionStatus = useCallback(async () => {
    try {
      if (Platform.OS === "ios") {
        const authStatus = await messaging().hasPermission();
        switch (authStatus) {
          case messaging.AuthorizationStatus.AUTHORIZED:
          case messaging.AuthorizationStatus.PROVISIONAL:
            setPermissionStatus("granted");
            break;
          case messaging.AuthorizationStatus.DENIED:
            setPermissionStatus("denied");
            break;
          default:
            setPermissionStatus("blocked");
        }
      } else {
        try {
          const token = await messaging().getToken();
          setPermissionStatus(token ? "granted" : "denied");
        } catch {
          setPermissionStatus("denied");
        }
      }
    } catch (error) {
      setPermissionStatus(Platform.OS === "android" ? "granted" : "denied");
    }
  }, []);

  // Initialize notifications
  useEffect(() => {
    if (isAuthenticated) {
      // Check permission and get token
      updatePermissionStatus();
      getFCMToken();

      // Set up notifee channels (Android)
      const setupNotifee = async () => {
        if (Platform.OS === "android") {
          try {
            await notifee.createChannel({
              id: "default",
              name: "Default Channel",
              importance: AndroidImportance.HIGH,
            });
          } catch (error) {}
        }
      };
      setupNotifee();

      // Set up token refresh listener
      const unsubscribeTokenRefresh = messaging().onTokenRefresh(
        async (token) => {
          setFcmToken(token);
          await SecureStorage.setSecureItem("fcm_token", token);
        }
      );

      // Set up foreground message listener with notifee
      const unsubscribeForeground = messaging().onMessage(
        async (remoteMessage) => {
          try {
            // Display notification using notifee
            await notifee.displayNotification({
              title: remoteMessage.notification?.title || "New Message",
              body:
                remoteMessage.notification?.body ||
                "You have a new notification",
              data: remoteMessage.data || {},
              android: {
                channelId: "default",
                pressAction: { id: "default" },
                sound: "default",
              },
              ios: {
                foregroundPresentationOptions: {
                  badge: true,
                  sound: true,
                  banner: true,
                  list: true,
                },
              },
            });
          } catch (error) {}
        }
      );

      // Set up notification opened app listener
      const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(
        (remoteMessage) => {
          if (onNotificationPress && remoteMessage?.data) {
            onNotificationPress(remoteMessage.data);
          }
        }
      );

      // Check for initial notification
      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            if (onNotificationPress && remoteMessage?.data) {
              onNotificationPress(remoteMessage.data);
            }
          }
        });

      // Set up notifee foreground event handler
      const unsubscribeNotifee = notifee.onForegroundEvent(
        async ({ type, detail }) => {
          if (type === EventType.PRESS) {
            if (onNotificationPress && detail.notification?.data) {
              onNotificationPress(detail.notification.data);
            }
          }
        }
      );

      return () => {
        unsubscribeTokenRefresh();
        unsubscribeForeground();
        unsubscribeOpenedApp();
        unsubscribeNotifee();
      };
    }
  }, [
    isAuthenticated,
    onNotificationPress,
    updatePermissionStatus,
    getFCMToken,
  ]);

  // Handle authentication changes
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear token when user logs out
      setFcmToken(null);
      SecureStorage.removeSecureItem("fcm_token").catch((error) => Logger.error("Error removing FCM token", error));
    }
  }, [isAuthenticated]);

  // Set up background message handler (must be outside React lifecycle)
  useEffect(() => {
    if (isAuthenticated) {
      // Set up background message handler (no unsubscribe needed)
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        try {
          // Display notification using notifee for background messages
          await notifee.displayNotification({
            title: remoteMessage.notification?.title || "New Message",
            body:
              remoteMessage.notification?.body || "You have a new notification",
            data: remoteMessage.data || {},
            android: {
              channelId: "default",
              pressAction: { id: "default" },
              sound: "default",
            },
            ios: {
              foregroundPresentationOptions: {
                badge: true,
                sound: true,
                banner: true,
                list: true,
              },
            },
          });
        } catch (error) {}
        return Promise.resolve();
      });

      // Set up notifee background event handler (no unsubscribe needed)
      notifee.onBackgroundEvent(async ({ type, detail }) => {
        if (type === EventType.PRESS) {
          // Handle background notification press if needed
        }
      });

      // No cleanup needed for background handlers
      return () => {};
    }
  }, [isAuthenticated]);

  return {
    fcmToken,
    permissionStatus,
    isLoading,
    requestPermission,
    getFCMToken,
    showSettingsDialog,
  };
}

export default useNotifications;


