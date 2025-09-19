import React from 'react';

import {DashboardStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Dashboard from '../screens/AccountDashboard/index'

 
const Stack = createNativeStackNavigator<DashboardStackParamList>();

const AccountDashboardNewkNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false,gestureEnabled: false}}
      initialRouteName="Dashboard">
      <Stack.Screen name="Dashboard" component={Dashboard} />
    </Stack.Navigator>
  );
};
export default AccountDashboardNewkNavigator;
