import React from 'react';

import { ApplyCardStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ApplyCard from '../screens/Tlv_Cards/ApplyCard';
 
const Stack = createNativeStackNavigator<ApplyCardStackParamList>();

const CryptoStackParamList = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="ApplyCard">
      <Stack.Screen name="ApplyCard" component={ApplyCard} />
    </Stack.Navigator>
  );
};
export default CryptoStackParamList;
