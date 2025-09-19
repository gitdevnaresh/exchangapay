/**
 * @format
 */

import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
AppRegistry.registerComponent(appName, () => App);
