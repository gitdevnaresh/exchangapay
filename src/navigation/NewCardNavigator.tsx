import React from 'react';

import {NewCardStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import NewCard from '../screens/Tlv_Cards/NewCard'
 
const Stack = createNativeStackNavigator<NewCardStackParamList>();

const CryptoStackParamList = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="NewCard">
      <Stack.Screen name="NewCard" component={NewCard} />
    </Stack.Navigator>
  );
};
export default CryptoStackParamList;
