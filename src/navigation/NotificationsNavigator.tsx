import React from 'react';
import {NotificationsStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Notifications from '../screens/AccountDashboard/Notifications';
 
const Stack = createNativeStackNavigator<NotificationsStackParamList>();

const NotificationsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false,gestureEnabled: false}}
      initialRouteName="Notifications">
      <Stack.Screen name="Notifications" component={Notifications} />
    </Stack.Navigator>
  );
};
export default NotificationsNavigator;