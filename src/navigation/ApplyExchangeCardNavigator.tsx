import React from "react";

import { ApplyExchangaCardStackParamList } from "./navigation-types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ApplyExchangaCard from "../screens/cards/ApplyExchangaCards";

const Stack = createNativeStackNavigator<ApplyExchangaCardStackParamList>();

const ApplyExchangeCardNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="ApplyExchangaCard"
    >
      <Stack.Screen name="ApplyExchangaCard" component={ApplyExchangaCard} />
    </Stack.Navigator>
  );
};
export default ApplyExchangeCardNavigator;