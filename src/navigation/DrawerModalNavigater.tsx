import React from "react";

import { DrawerModalStackParamList, EditProfileStackParamList } from "./navigation-types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawerModal from "../components/DrawerMenu";

const Stack = createNativeStackNavigator<DrawerModalStackParamList>();

const EditProfileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="DrawerModal"
    >
      <Stack.Screen name="DrawerModal" component={DrawerModal} />
    </Stack.Navigator>
  );
};
export default EditProfileNavigator;