import React from "react";

import { SecurityStackParamList } from "./navigation-types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Security from "../screens/Profile/Security";

const Stack = createNativeStackNavigator<SecurityStackParamList>();

const SecurityStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Security"
    >
      <Stack.Screen name="Security" component={Security} />
    </Stack.Navigator>
  );
};
export default SecurityStackNavigator;
