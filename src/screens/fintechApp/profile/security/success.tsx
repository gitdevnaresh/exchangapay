import React, { useEffect, useCallback } from 'react';
import {  BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CommonSuccess from '../../../commonScreens/successPage/commonSucces';
const ChangePasswordSuccess = React.memo((props: any) => {
    const navigation=useNavigation<any>();
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { backArrowHomeButtonHandler(); return true; }
        );
        return () => backHandler.remove();
    }, [])
    const backArrowHomeButtonHandler = useCallback(() => {
            navigation.navigate("ProfileComponent");
    }, [navigation]);
    return (
        <CommonSuccess
        navigation={props.navigation}
        successMessage={"GLOBAL_CONSTANTS.PASSWORD_CHANGE_SUCCESS_MESSAGE"}
        buttonText={ "GLOBAL_CONSTANTS.GO_TO_HOME"}
        buttonAction={backArrowHomeButtonHandler}
        subtitle={''}
    />
    );
});
export default ChangePasswordSuccess;


