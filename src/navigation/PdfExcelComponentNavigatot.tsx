import React from 'react';

import {PdfExcelComponentStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PdfExcelComponent from '../screens/Statement/Index';

const Stack = createNativeStackNavigator<PdfExcelComponentStackParamList>();

const PdfExcelNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="PdfExcelComponent">
      <Stack.Screen name="PdfExcelComponent" component={PdfExcelComponent} />
    </Stack.Navigator>
  );
};
export default PdfExcelNavigator;
