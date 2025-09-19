import React from 'react';

import {SelectAssetStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SelectAsset from '../screens/Crypto/deposit/selectAsset';

const Stack = createNativeStackNavigator<SelectAssetStackParamList>();

const SelectAssetNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="SelectAsset">
      <Stack.Screen name="SelectAsset" component={SelectAsset} />
    </Stack.Navigator>
  );
};
export default SelectAssetNavigator;
