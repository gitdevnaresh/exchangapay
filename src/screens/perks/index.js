import React, { useState } from 'react';
import ComingSoon from "../commonScreens/comingSoon/comingSoon";
import { useHardwareBackHandler } from '../../hooks/HardwareBackHandler';
import { CommonActions, useNavigation } from '@react-navigation/native';
const Perks = () => {
   
    const navigation = useNavigation();
    useHardwareBackHandler(() => {
        backArrowButtonHandler();
        return true;
    });

    const backArrowButtonHandler = () => {
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Dashboard" }] }));
    };

    return (
        
            <ComingSoon pageHeader={true} customNavigtion={backArrowButtonHandler}/>
    );
};

export default Perks;


