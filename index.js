/**
 * @format
 */

import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import notifee from "@notifee/react-native";
import { handleDocumentNotificationPress } from "./src/utils/documentNotification";

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  if (remoteMessage?.notification?.title === "Support Chat") {
    try {
      let currentCount = 0;
      const storedCount = await AsyncStorage.getItem("supportMessageCount");
      if (storedCount) {
        currentCount = parseInt(storedCount, 10);
      }
      const newCount = currentCount + 1;
      await AsyncStorage.setItem("supportMessageCount", newCount.toString());
    } catch (e) {}
  }
});
// A tap on a document / download notification while the app is in the
// background. Foreground taps are handled in AppContainer.
notifee.onBackgroundEvent(handleDocumentNotificationPress);

AppRegistry.registerComponent(appName, () => App);
