import React from 'react';

import {ExchangaCardStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ExchangaCard from '../screens/Crypto/dashboard/ExchangaCard';

 
const Stack = createNativeStackNavigator<ExchangaCardStackParamList>();

const ExchangaCardNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="ExchangaCard">
      <Stack.Screen name="ExchangaCard" component={ExchangaCard} />
    </Stack.Navigator>
  );
};
export default ExchangaCardNavigator;
