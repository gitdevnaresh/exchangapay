import React from "react";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import { Logger } from './Logger';

class FCMNotification {
  initiate = (onNotificationAction) => {
    // Must be outside of any component LifeCycle (such as `componentDidMount`).
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {

      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        if (notification.userInteraction) {
          onNotificationAction(notification.data);
        }

        // process the notification

        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {},

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function (err) {
        Logger.error("[FCMService] register error", err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: false,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: false,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });

    this.registerServices(onNotificationAction);
  };

  registerServices = (onNotificationAction) => {
    this.fcmForegroundService = messaging().onMessage(async (remoteMessage) => {

      if (Platform.OS === "android") {
        this.showAndroidLocalNotification(remoteMessage);
      } else {
        this.showLocalNotification(remoteMessage);
      }
    });

    // Triggered when have new token
    messaging().onTokenRefresh((fcmToken) => {
      // Token refreshed - handled silently
    });

    messaging().onNotificationOpenedApp((remoteMessage) => {

      onNotificationAction(remoteMessage?.data);
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage && remoteMessage?.data) {
          onNotificationAction(remoteMessage?.data);
        }
      });
  };

  unRegister = () => {
    PushNotification.unregister();
  };

  deleteToken = () => {
    messaging()
      .deleteToken()
      .catch((err) => {

      });
  };

  createtoken = (onSuccess) => {
    messaging()
      .getToken()
      .then((fcmToken) => {
        if (fcmToken) {
          onSuccess(fcmToken);
        }
      })
      .catch((err) => {
        Logger.error("❌ FCMNotification: Error getting FCM token:", err);
      });
  };

  showAndroidLocalNotification = (remoteMessage) => {
    const { notification, data, collapseKey } = remoteMessage;
    PushNotification.createChannel(
      {
        channelId: collapseKey, // (required)
        channelName: collapseKey, // (required)
        playSound: true,
        soundName: "default",
        importance: 4,
      },
      (created) => {
        this.showLocalNotification(remoteMessage);
      } // (optional) callback returns whether the channel was created, false means it already existed.
    );
  };

  showLocalNotification = (remoteMessage) => {
    const { notification, data, collapseKey } = remoteMessage;

    // Platform-specific notification configuration
    const notificationConfig = {
      /* iOS and Android properties */
      id: Math.floor(Math.random() * 1000000), // Generate unique ID
      title: notification.title, // (optional)
      message: notification.body, // (required)
      userInfo: data, // (optional) default: {} (using null throws a JSON value '<null>' error)
      soundName: "default", // (optional) Sound to play when the notification is shown
      number: 1, // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
    };

    // Add Android-specific properties
    if (Platform.OS === "android") {
      notificationConfig.channelId = collapseKey || "default";
      notificationConfig.channelName = collapseKey || "Default Channel";
      notificationConfig.showWhen = true;
      notificationConfig.autoCancel = true;
      notificationConfig.largeIcon = "ic_launcher";
      notificationConfig.smallIcon = "ic_launcher";
      notificationConfig.bigText = notification.body;
      notificationConfig.subText = "";
      notificationConfig.data = data;
    } else {
      // iOS-specific properties
      notificationConfig.category = "";
      notificationConfig.subtitle = notification.subtitle || "";
    }

    PushNotification.localNotification(notificationConfig);
  };
}

export const fcmNotification = new FCMNotification();

