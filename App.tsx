import React, { useEffect } from "react";
import {
  StatusBar,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import AppContainer from "./src/navigation/AppContainer";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { default as customMapping } from "./src/constants/theme/mapping.json";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RNBootSplash from "react-native-bootsplash";
import { store } from "./src/redux/store";

export default function App() {

  useEffect(() => {
    RNBootSplash.hide({ fade: true });
  }, []);


  return (

    <Provider store={store}>
      {/* <PersistGate loading={<LoadingComponent />} persistor={persistor}> */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <IconRegistry icons={[EvaIconsPack]} />
          <ApplicationProvider
            customMapping={customMapping}
          >
            <SafeAreaProvider>
              <StatusBar
                barStyle={
                  // theme === "dark" ? "light-content" : "dark-content"
                  // "dark-content"
                  "light-content"
                }
                translucent={false}
                backgroundColor={"#000"}
              />
              <AppContainer />

            </SafeAreaProvider>
          </ApplicationProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
      {/* </PersistGate> */}
    </Provider>

  );
};
