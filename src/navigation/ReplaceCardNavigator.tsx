import React from 'react';

import { ReplaceCardStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ReplaceCardComponent from '../screens/Tlv_Cards/ReplaceCard';
 
const Stack = createNativeStackNavigator<ReplaceCardStackParamList>();

const CryptoStackParamList = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="ReplaceCard">
      <Stack.Screen name="ReplaceCard" component={ReplaceCardComponent} />
    </Stack.Navigator>
  );
};
export default CryptoStackParamList;
