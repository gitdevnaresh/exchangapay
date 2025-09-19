import React from "react";

import { PersonalInfoStackParamList } from "./navigation-types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PersonalInfo from "../screens/Profile/PersonalInfo";

const Stack = createNativeStackNavigator<PersonalInfoStackParamList>();

const PersonalInfoStackNavigator= () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="PersonalInfo"
    >
      <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
    </Stack.Navigator>
  );
};
export default PersonalInfoStackNavigator;
