import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation-types';
import Home from '../screens/home/home';

const Stack = createNativeStackNavigator<RootStackParamList>();

const CryptoStackParamList = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
};
export default CryptoStackParamList;
