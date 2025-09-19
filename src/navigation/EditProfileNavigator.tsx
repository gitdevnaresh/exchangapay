import React from "react";

import { EditProfileStackParamList } from "./navigation-types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EditProfile from "../screens/Profile/editprofile";

const Stack = createNativeStackNavigator<EditProfileStackParamList>();

const EditProfileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="EditProfile"
    >
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
  );
};
export default EditProfileNavigator;