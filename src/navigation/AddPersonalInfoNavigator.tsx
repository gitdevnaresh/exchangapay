import React from "react";

import { AddPersonalInfoStackParamList } from "./navigation-types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddPersonalInfo from "../screens/Profile/addpersonalinfo";

const Stack = createNativeStackNavigator<AddPersonalInfoStackParamList>();

const AddPersonalInfoNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="AddPersonalInfo"
    >
      <Stack.Screen name="AddPersonalInfo" component={AddPersonalInfo} />
    </Stack.Navigator>
  );
};
export default AddPersonalInfoNavigator;