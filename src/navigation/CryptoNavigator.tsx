import React from 'react';
import { CryptoStackParamList } from './navigation-types';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Crypto from '../screens/AccountDashboard/Crypto';

const Stack = createNativeStackNavigator<CryptoStackParamList>();

const CryptoBuyNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="Crypto">
            <Stack.Screen name="Crypto" component={Crypto} />
        </Stack.Navigator>
    );
};
export default CryptoBuyNavigator;
