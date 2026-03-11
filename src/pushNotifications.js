// notifications.js
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform, PermissionsAndroid, AppState } from 'react-native';
import Keychain from 'react-native-keychain';
import { updateInfo } from './utils/helpers';
import * as Zendesk from "react-native-zendesk-messaging";

let badgeCount = 0;
// CHECK & REQUEST NOTIFICATION PERMISSION
export const requestNotificationPermission = async () => {
    try {
        if (Platform.OS === 'ios') {
            const settings = await notifee.requestPermission({
                alert: true,
                badge: true,
                sound: true,
            });
            return settings.authorizationStatus >= 1;
        }

        if (Platform.OS === 'android') {
            if (Platform.Version >= 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
            return true;
        }
    } catch (error) {
        return false;
    }
};


// CREATE CHANNEL (ANDROID)

export const createNotificationChannel = async () => {
    if (Platform.OS === 'android') {
        return await notifee.createChannel({
            id: 'default',
            name: 'Default Notifications',
            importance: AndroidImportance.HIGH,

        });
    }
    return null;
};

// DISPLAY LOCAL NOTIFICATION (SAFE)
export const listenAppStateForBadgeClear = async () => {
    AppState.addEventListener('change', async (state) => {
        if (state === 'active') {
            badgeCount = 0;
            await notifee.setBadgeCount(0);
        }
    });
};
export const displayLocalNotification = async (title, body, data = {}, shouldIncreaseBadge = true) => {
    if (!title && !body) {
        return;
    }
    const channelId = await createNotificationChannel();
    if (shouldIncreaseBadge) {
        badgeCount += 1;
        await notifee.setBadgeCount(badgeCount);

    }
    // await notifee.setBadgeCount(badgeCount);
    await notifee.displayNotification({
        title,
        body,
        android: {
            channelId,
            smallIcon: 'ic_launcher',
            pressAction: { id: 'default' },
            sound: 'default',
            vibrationPattern: [300, 500, 300, 500],
            vibration: true,
            autoCancel: true,
            ongoing: false,
        },
        ios: {
            sound: 'default',   // iOS DEFAULT SOUND
            badgeCount: badgeCount,      // 🔥 SHOW BADGE ON APP ICON
        },
        data,
    });
};


//FOREGROUND MESSAGE HANDLER

export const setupForegroundNotificationListener = () => {
    messaging().onMessage(async (remoteMessage) => {
        let title = remoteMessage.data?.title || remoteMessage.notification?.title;
        let body = remoteMessage.data?.body || remoteMessage.notification?.body;
        // Handle Zendesk messages
        if (remoteMessage.data?.origin === 'SupportKit' || remoteMessage.data?.smoochNotification) {
            try {
                const messageData = JSON.parse(remoteMessage.data.message);
                title = messageData.name || 'New Message';
                body = messageData.text || 'You have a new message';
            } catch (e) {
                title = 'New Message';
                body = 'You have a new message from support';
            }
        }
        
        if ((!title && !body)) {
            return;
        }
        await displayLocalNotification(title, body, remoteMessage.data, false);
        if (title?.toLowerCase().includes("kyc")) {
            await updateInfo();
        }
    });
};

// BACKGROUND MESSAGE HANDLER

export const backgroundMessageHandler = async (remoteMessage) => {
    let title = remoteMessage.data?.title || remoteMessage.notification?.title;
    let body = remoteMessage.data?.body || remoteMessage.notification?.body;
    
    // Handle Zendesk messages
    if (remoteMessage.data?.origin === 'SupportKit' || remoteMessage.data?.smoochNotification) {
        try {
            const messageData = JSON.parse(remoteMessage.data.message);
            title = messageData.name || 'New Message';
            body = messageData.text || 'You have a new message';
        } catch (e) {
            title = 'New Message';
            body = 'You have a new message from support';
        }
    }
    
    if ((!title && !body)) {
        return;
    }
    await displayLocalNotification(title, body, remoteMessage.data, true);
    if (title?.toLowerCase().includes("kyc")) {
        await updateInfo();
    }
};
// REMOVE NOTIFICATION RE-TRIGGER FIX

export const registerNotificationEvents = async () => {
    // Foreground listener
    notifee.onForegroundEvent(async ({ type }) => {
        if (type === EventType.DISMISSED || type === EventType.PRESS) {
            badgeCount = 0;
            await notifee.setBadgeCount(0);
        }
    });

    // Background listener
    notifee.onBackgroundEvent(async ({ type }) => {
        if (type === EventType.DISMISSED || type === EventType.PRESS) {
            badgeCount = 0;
            await notifee.setBadgeCount(0);
        }
    });
};

// INITIALIZE NOTIFICATIONS
const getToken = async () => {
    try {
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();
        if (token) {
            await Keychain.setGenericPassword(
                'fcmToken',
                JSON.stringify({
                    token
                }), { service: 'fcmToken' }
            );
        }
    } catch (error) {
        console.log('FCM Token Error:', error);
        return null;
    }
}

export const initializeNotifications = async () => {
    await requestNotificationPermission();
    await createNotificationChannel();
    await getToken();
    setupForegroundNotificationListener();
    registerNotificationEvents();
    // await listenAppStateForBadgeClear();
    await zendeskRegisterFcmToken();
    badgeCount = 0;
    await notifee.setBadgeCount(0);
};


export async function zendeskRegisterFcmToken() {
    try {
        const token = await messaging().getToken();
        if (!token) return;
        
        if (Zendesk.updatePushNotificationToken) {
            Zendesk.updatePushNotificationToken(token);
        }

        messaging().onTokenRefresh((newToken) => {
            if (Zendesk.updatePushNotificationToken) {
                Zendesk.updatePushNotificationToken(newToken);
            }
        });
    } catch (error) {
    }
}

