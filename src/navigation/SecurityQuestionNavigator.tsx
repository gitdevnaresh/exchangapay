import React from "react";

import { SecurityQuestionStackParamList, SecurityStackParamList } from "./navigation-types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SecurityQuestion from "../screens/Profile/SecurityQuestion";

const Stack = createNativeStackNavigator<SecurityQuestionStackParamList>();

const SecurityStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="SecurityQuestion"
    >
      <Stack.Screen name="SecurityQuestion" component={SecurityQuestion} />
    </Stack.Navigator>
  );
};
export default SecurityStackNavigator;
