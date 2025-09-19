import React from 'react';
import {ChangePasswordStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ChangePassword from '../screens/Profile/ChangePassword';

const Stack = createNativeStackNavigator<ChangePasswordStackParamList>();

const ChangePasswordNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="ChangePassword">
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
    </Stack.Navigator>
  );
};
export default ChangePasswordNavigator;
