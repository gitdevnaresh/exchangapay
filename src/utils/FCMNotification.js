import React from 'react';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

class FCMNotification {
  initiate = onNotificationAction => {
    // Must be outside of any component LifeCycle (such as `componentDidMount`).
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        // console.log('TOKEN:', token);
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
        console.error('[FCMService] register error', err.message, err);
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

  registerServices = onNotificationAction => {
    this.fcmForegroundService = messaging().onMessage(async remoteMessage => {
      // console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      if (Platform.OS === 'android') {
        this.showAndroidLocalNotification(remoteMessage);
      } else {
        this.showLocalNotification(remoteMessage);
      }
    });

    // Triggered when have new token
    messaging().onTokenRefresh(fcmToken => {
      // console.log('[FCMService] New token refresh ', fcmToken);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      // console.log('Notification caused app to open from background state:', remoteMessage.data);
      onNotificationAction(remoteMessage?.data);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
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

  showAndroidLocalNotification = remoteMessage => {
    const { notification, data, collapseKey } = remoteMessage;
    PushNotification.createChannel(
      {
        channelId: collapseKey, // (required)
        channelName: collapseKey, // (required)
        playSound: true,
        soundName: 'default',
        importance: 4,
      },
      created => {
        this.showLocalNotification(remoteMessage);
      }, // (optional) callback returns whether the channel was created, false means it already existed.
    );
  };

  showLocalNotification = remoteMessage => {
    const { notification, data, collapseKey } = remoteMessage;
    PushNotification.localNotification({
      /* Android Only Properties */
      channelId: collapseKey, // (required) channelId, if the channel doesn't exist, notification will not trigger.
      channelName: collapseKey,
      showWhen: true, // (optional) default: true
      autoCancel: true, // (optional) default: true
      largeIcon: 'ic_launcher', // (optional) default: "ic_launcher". Use "" for no large icon.
      smallIcon: 'ic_launcher', // (optional) default: "ic_notification" with fallback for "ic_launcher". Use "" for default small icon.
      bigText: notification.body, // (optional) default: "message" prop
      subText: '', // (optional) default: none
      data: data,
      /* iOS only properties */
      category: '', // (optional) default: empty string
      // subtitle: "My Notification Subtitle", // (optional) smaller title below notification title

      /* iOS and Android properties */
      id: 0, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
      title: notification.title, // (optional)
      message: notification.body, // (required)
      userInfo: data, // (optional) default: {} (using null throws a JSON value '<null>' error)
      soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
      number: 10, // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
    });
  };
}

export const fcmNotification = new FCMNotification();
