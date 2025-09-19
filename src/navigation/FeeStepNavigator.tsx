import React from "react";

import { FeeStepStackParamList } from "./navigation-types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FeeStep from "../screens/cards/FeeStep";

const Stack = createNativeStackNavigator<FeeStepStackParamList>();

const FeeStepNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="FeeStep"
    >
      <Stack.Screen name="FeeStep" component={FeeStep} />
    </Stack.Navigator>
  );
};
export default FeeStepNavigator;