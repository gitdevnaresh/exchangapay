import React from "react";
import { View } from "react-native";
import { enableScreens } from "react-native-screens";
import { NavigationContainer } from "@react-navigation/native";
import { RootStackParamList } from "./navigation-types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NEW_COLOR } from "../constants/theme/variables";
import NewCard from "../screens/cards";
import Home from "../screens/home/home";

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();
const AppContainer = () => {
  return (
    <NavigationContainer >
      <View style={[{ backgroundColor: NEW_COLOR.SCREENBG_WHITE, flex: 1, }]}>
        <Stack.Navigator screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          animation: "slide_from_right",
          animationDuration: 300,
        }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="About" component={NewCard} />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
};

export default AppContainer;
