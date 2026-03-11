import messaging from "@react-native-firebase/messaging";

// Background message handler - must be outside React lifecycle
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Background message received:", remoteMessage);

  // You can add custom logic here for background notifications
  // For example, showing local notifications, updating app state, etc.

  return Promise.resolve();
});

export default messaging;
