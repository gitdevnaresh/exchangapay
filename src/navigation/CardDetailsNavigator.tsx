import React from 'react';

import {CardDetailsStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CardDetails from '../screens/Tlv_Cards/CardDetails';
 
const Stack = createNativeStackNavigator<CardDetailsStackParamList>();

const CardDetailsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="CardDetails">
      <Stack.Screen name="CardDetails" component={CardDetails} />
    </Stack.Navigator>
  );
};
export default CardDetailsNavigator;
