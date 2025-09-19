import React from 'react';

import {MyReferralsStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MyReferrals from '../screens/Profile/myReferral';
 
const Stack = createNativeStackNavigator<MyReferralsStackParamList>();

const MyReferralsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false,gestureEnabled: false}}
      initialRouteName="MyReferrals">
      <Stack.Screen name="MyReferrals" component={MyReferrals} />
    </Stack.Navigator>
  );
};
export default MyReferralsStackNavigator;
