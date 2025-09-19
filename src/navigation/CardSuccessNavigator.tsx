import React from 'react';

import { CardSuccessStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CardSuccess from '../screens/Tlv_Cards/CardSuccess';
import ToBeReviewedStep from '../screens/cards/ToBeReviewed';
 
const Stack = createNativeStackNavigator<CardSuccessStackParamList>();

const CardSuccessStackParamList = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="CardSuccess">
      <Stack.Screen name="CardSuccess" component={ToBeReviewedStep} />
    </Stack.Navigator>
  );
};
export default CardSuccessStackParamList;
