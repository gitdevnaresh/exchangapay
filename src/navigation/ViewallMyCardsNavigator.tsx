import React from 'react';

import { ViewallMyCardsStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ViewallMyCards from '../screens/Tlv_Cards/ViewallMyCards';
 
const Stack = createNativeStackNavigator<ViewallMyCardsStackParamList>();

const CryptoStackParamList = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="ViewallMyCards">
      <Stack.Screen name="ViewallMyCards" component={ViewallMyCards} />
    </Stack.Navigator>
  );
};
export default CryptoStackParamList;
