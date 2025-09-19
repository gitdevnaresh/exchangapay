import React from 'react';

import { ReportLossStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ReportLossComponent from '../screens/Tlv_Cards/ReportLoss';
 
const Stack = createNativeStackNavigator<ReportLossStackParamList>();

const CryptoStackParamList = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="ReportLoss">
      <Stack.Screen name="ReportLoss" component={ReportLossComponent} />
    </Stack.Navigator>
  );
};
export default CryptoStackParamList;
